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
  paramsIgnore?: string[]
  fetcher: (params: P) => Promise<BaseApiResponse<R>>
}): ApiContract<P, R> => {
  const fn = ((params: P) => options.fetcher(params)) as ApiContract<P, R>

  const metadata: Partial<ApiContract<P, R>> = {
    id: options.id,
    type: options.type || (ENUM.FETCH_TYPE.SCROLL_LOAD_MORE as FetchType),
    uniqueKey: options.uniqueKey || ENUM.DEFAULT_UNIQUE_KEY_NAME,
    is_up: options.is_up || false,
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
          const commitData = () => {
            SET_DATA({
              getter,
              setter,
              data: data as BaseApiResponse,
              fieldName,
              type: func.type,
              page: params.page || 0,
              insertBefore: false,
              uniqueKey: func.uniqueKey
            }).then(() => {
              callback?.({ params: params as P, data, refresh: doRefresh })
              resolve()
            })
          }

          if (directlyLoadData) {
            // 增量类型（SCROLL / sinceId）的 silent refresh：请求用的是基于现有列表算出的
            // since_id（拉「比我已有的更新」的增量），语义上就是「把增量合并进现有列表」，
            // 故**完全跳过 RESET**，直接 commitData。
            //
            // 为什么不能先 RESET（无论清空还是用快照保留 result）：
            //   - RESET 到空 → 丢历史（只剩本次增量）；
            //   - RESET 用 initData 入口处抓的 fieldData 快照保留 result → 该快照在「网络请求
            //     发出」那一刻取得，但 setter(RESET) 在请求 resolve（数百 ms）后才执行；这期间
            //     若有 in-flight 写入（如聊天连发的乐观/回填消息），会被陈旧快照覆盖回退而丢失。
            //   两种 RESET 都依赖「过时的数据视图」，是连发重复/丢消息的同源根因。
            //
            // 跳过 RESET 后：SET_DATA 在执行时自身 getter() 读**最新** store（含网络期间到达的
            // in-flight 项），再经 setReactivityField 按 uniqueKey 去重 append 增量 →
            // 历史 + in-flight + 本次增量三者正确合并，零重复、零丢失，且不持有任何快照。
            //
            // 非增量类型（PAGINATION / jump / seenIds）维持原「先 RESET 清空再写」语义：
            //   它们 silent refresh 是「整体重拉第一页替换」，SET_DATA 直接替换 result，需先清空。
            const isIncrementalType =
              func.type === ENUM.FETCH_TYPE.SCROLL_LOAD_MORE ||
              func.type === ENUM.FETCH_TYPE.SINCE_FIRST_OR_END_ID
            if (isIncrementalType) {
              commitData()
            } else {
              setter({
                key: fieldName,
                type: ENUM.SETTER_TYPE.RESET,
                value: generateDefaultField(),
                callback: commitData
              })
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

    const loadingState: Partial<DefaultField> =
      type === ENUM.FETCH_TYPE.PAGINATION
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
              uniqueKey: func.uniqueKey
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
