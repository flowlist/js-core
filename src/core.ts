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
              insertBefore: false
            }).then(() => {
              callback?.({ params: params as P, data, refresh: doRefresh })
              resolve()
            })
          }

          if (directlyLoadData) {
            setter({
              key: fieldName,
              type: ENUM.SETTER_TYPE.RESET,
              value: generateDefaultField(),
              callback: commitData
            })
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
              insertBefore: func.is_up
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
