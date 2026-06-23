// core.ts — createApi / initState / initData / loadMore / generateFieldName
import { SET_DATA, SET_ERROR } from './_internal/setters'
import {
  generateDefaultField,
  generateRequestParams,
  stableSerialize
} from './_internal/utils'
import ENUM from './constants'

import type {
  ApiContract,
  BaseApiResponse,
  DefaultField,
  FetchType,
  InitDataType,
  InitStateType,
  KeyMap,
  LoadMoreType,
  MergeStrategy,
  RequestParams
} from './types'

// --- generateFieldName ---
export const generateFieldName = <P extends RequestParams, R>({
  func,
  query
}: {
  func: ApiContract<P, R>
  query?: P
}): string => {
  let result = func.id
  if (!query) return result

  const queryObj = query as Record<string, unknown>
  const filteredKeys = Object.keys(queryObj)
    .filter((key) => !func.paramsIgnore.includes(key))
    .sort()

  for (const key of filteredKeys) {
    const value = queryObj[key]
    const safeValue =
      typeof value === 'object' && value !== null
        ? stableSerialize(value)
        : String(value)
    result += `-${key}-${encodeURIComponent(safeValue)}`
  }
  return result
}

// --- createApi ---
export const createApi = <P extends RequestParams, R>(options: {
  id: string
  type?: FetchType
  uniqueKey?: string
  is_up?: boolean
  mergeStrategy?: MergeStrategy
  paramsIgnore?: string[]
  fetcher: (params: P) => Promise<BaseApiResponse<R>>
}): ApiContract<P, R> => {
  const fn = ((params: P) => options.fetcher(params)) as ApiContract<P, R>

  const type = options.type || (ENUM.FETCH_TYPE.SCROLL_LOAD_MORE as FetchType)

  // mergeStrategy 默认由 type 推导，保证对既有列表 100% 向后兼容：
  //   - jump(PAGINATION) → 'replace'（分页历来整表替换）
  //   - 其余             → 'append'（无限滚动历来去重追加）
  // 仅实时流（聊天）需显式声明 'preserve'。
  const mergeStrategy: MergeStrategy =
    options.mergeStrategy ??
    (type === ENUM.FETCH_TYPE.PAGINATION
      ? (ENUM.MERGE_STRATEGY.REPLACE as MergeStrategy)
      : (ENUM.MERGE_STRATEGY.APPEND as MergeStrategy))

  const metadata: Partial<ApiContract<P, R>> = {
    id: options.id,
    type,
    uniqueKey: options.uniqueKey || ENUM.DEFAULT_UNIQUE_KEY_NAME,
    is_up: options.is_up || false,
    mergeStrategy,
    paramsIgnore: [
      'page',
      'since_id',
      'seen_ids',
      '__refresh__',
      '__reload__',
      ...(options.paramsIgnore || [])
    ]
  }

  return Object.freeze(Object.assign(fn, metadata))
}

// --- initState ---
export const initState = <P extends RequestParams, R>({
  getter,
  setter,
  func,
  query,
  opts
}: InitStateType<P, R>): Promise<void> => {
  return new Promise((resolve) => {
    const fieldName = generateFieldName({ func, query })
    if (getter(fieldName)) return resolve()

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField(opts),
      callback: () => resolve()
    })
  })
}

// --- initData ---
export const initData = <P extends RequestParams, R>({
  getter,
  setter,
  func,
  query,
  callback
}: InitDataType<P, R>): Promise<void> =>
  new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, query })
    const fieldData = getter(fieldName)

    const doRefresh = !!query?.__refresh__
    const needReset = !!query?.__reload__
    const directlyLoadData = doRefresh && !needReset

    if (fieldData && fieldData.error && !doRefresh) return resolve()
    if (fieldData && fieldData.loading) return resolve()
    if (fieldData && fieldData.fetched && !doRefresh) return resolve()

    const params = generateRequestParams({
      field: generateDefaultField({ ...fieldData, fetched: false }),
      uniqueKey: func.uniqueKey,
      type: func.type,
      is_up: func.is_up,
      query: query as KeyMap
    })

    const executeFetch = () => {
      func(params as P)
        .then((data) => {
          // replaceOnRefresh：refresh 时整表替换（append/replace 策略），SET_DATA
          // 直接覆盖 result + 重置 extra/page，不走去重追加，避免旧 cursor 污染。
          const commitData = (replaceOnRefresh = false) => {
            SET_DATA({
              getter,
              setter,
              data: data as BaseApiResponse,
              fieldName,
              type: func.type,
              page: params.page || 0,
              insertBefore: false,
              uniqueKey: func.uniqueKey,
              mergeStrategy: func.mergeStrategy,
              replaceOnRefresh
            }).then(() => {
              callback?.({ params: params as P, data, refresh: doRefresh })
              resolve()
            })
          }

          if (directlyLoadData) {
            // 刷新（__refresh__）的 commit 策略由 mergeStrategy 决定（与 type 解耦）：
            //
            // 'preserve'（实时流 / 聊天）：**完全跳过 RESET**，直接 commitData()。
            //   请求基于现有列表算出的 since 拉增量，语义是「把增量合并进现有列表」。
            //   不能先 RESET：① RESET 到空会丢历史；② 用 initData 入口快照保留 result，
            //   该快照在请求发出时取得、却在 resolve（数百 ms）后才 setter，期间若有 in-flight
            //   写入（聊天连发的乐观/回填消息）会被陈旧快照覆盖丢失。跳过 RESET 后 SET_DATA
            //   自身 getter() 读最新 store，按 uniqueKey 去重 append → 历史+in-flight+增量
            //   三者正确合并，零重复零丢失，且不持任何快照。
            //
            // 'append' / 'replace'（无限滚动 / 分页）：refresh = 整表替换回第一页。
            //   不先清空（避免白屏）；请求 resolve 后 SET_DATA 以 replaceOnRefresh 原子覆盖
            //   result 并重置 extra/page。React 重渲染原子，旧列表→新列表无空帧。
            if (func.mergeStrategy === ENUM.MERGE_STRATEGY.PRESERVE) {
              commitData()
            } else {
              commitData(true)
            }
          } else {
            commitData()
          }
        })
        .catch((error: Error) => {
          SET_ERROR({ setter, fieldName, error })
          reject(error)
        })
    }

    if (directlyLoadData) {
      executeFetch()
    } else {
      setter({
        key: fieldName,
        type: ENUM.SETTER_TYPE.RESET,
        value: { ...generateDefaultField(), loading: true, error: null },
        callback: executeFetch
      })
    }
  })

// --- loadMore ---
export const loadMore = <P extends RequestParams, R>({
  getter,
  setter,
  query,
  func,
  errorRetry,
  callback
}: LoadMoreType<P, R>): Promise<void> =>
  new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, query })
    const fieldData = getter(fieldName)
    if (!fieldData || fieldData.loading || fieldData.nothing) return resolve()
    if (fieldData.noMore && !errorRetry) return resolve()

    const type = func.type

    if (
      type === ENUM.FETCH_TYPE.PAGINATION &&
      query?.page != null &&
      Number(query.page) === fieldData.page
    ) {
      return resolve()
    }

    // loadMore 合并由 mergeStrategy 决定（与 type 解耦）：
    //   'replace' → 先清空 result/extra 再写新页（分页整页替换）
    //   'append' / 'preserve' → 保留现有列表，SET_DATA 去重追加
    const loadingState: Partial<DefaultField> =
      func.mergeStrategy === ENUM.MERGE_STRATEGY.REPLACE
        ? { loading: true, error: null, result: [], extra: null }
        : { loading: true, error: null }

    const params = generateRequestParams({
      field: fieldData,
      uniqueKey: func.uniqueKey,
      type,
      is_up: func.is_up,
      query: query as KeyMap
    })

    if (fieldData.extra) params.extra = fieldData.extra

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.MERGE,
      value: loadingState,
      callback: () => {
        func(params as P)
          .then((data) => {
            SET_DATA({
              getter,
              setter,
              data: data as BaseApiResponse,
              type,
              fieldName,
              page: params.page || 0,
              insertBefore: func.is_up,
              uniqueKey: func.uniqueKey,
              mergeStrategy: func.mergeStrategy
            }).then(() => {
              callback?.({ params: params as P, data, refresh: false })
              resolve()
            })
          })
          .catch((error: Error) => {
            SET_ERROR({ setter, fieldName, error })
            reject(error)
          })
      }
    })
  })
