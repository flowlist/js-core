import ENUM from './enum'
import { SET_DATA, SET_ERROR } from './setters'
import {
  combineArrayData,
  computeMatchedItemIndex,
  computeResultLength,
  generateDefaultField,
  generateRequestParams,
  getObjectDeepValue,
  getResultAsArray,
  isArray,
  isKeyMap,
  isKeyMapArray,
  isObjectKey,
  isObjectKeyArray,
  searchValueByKey,
  stableSerialize,
  toObjectKey,
  updateArrayItem,
  updateObjectDeepValue
} from './utils'

import type {
  ApiContract,
  BaseApiResponse,
  DefaultField,
  FetchType,
  InitDataType,
  InitStateType,
  KeyMap,
  LoadMoreType,
  ObjectKey,
  RequestParams,
  UpdateStateType
} from './types'

// --- 辅助函数：生成字段名 ---
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

// --- API 构造器 ---
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

// --- 核心 Action：initState ---
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

// --- 核心 Action：initData ---
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

// --- 核心 Action：loadMore ---
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

// --- 核心 Action：updateState ---
export const updateState = <P extends RequestParams, R>({
  getter,
  setter,
  func,
  query,
  method,
  id,
  value,
  changeKey
}: UpdateStateType<P, R>): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, query })
    const fieldData = getter(fieldName)
    if (!fieldData) {
      reject(new Error(`Field ${fieldName} not found.`))
      return
    }

    if (fieldData.page === -1) {
      resolve(null)
      return
    }

    const _id = id
    const _uniqueKey = func.uniqueKey || ENUM.DEFAULT_UNIQUE_KEY_NAME
    const _changeKey = changeKey || ENUM.FIELD_DATA.RESULT_KEY
    const beforeLength = computeResultLength(
      fieldData[ENUM.FIELD_DATA.RESULT_KEY]
    )

    // 创建新的 field 对象，并深拷贝 result 数组以确保响应式
    const newFieldData: DefaultField = { ...fieldData }
    // 如果 result 是数组，创建新数组引用（浅拷贝数组，但元素保持引用）
    // 这样后续的修改会在新数组上进行，确保引用变化
    let resultArray = getResultAsArray(fieldData)
    if (resultArray) {
      resultArray = [...resultArray]
      newFieldData.result = resultArray as any
    }

    if (method === ENUM.CHANGE_TYPE.SEARCH_FIELD) {
      const objectKeyId = toObjectKey(_id)
      if (objectKeyId === undefined) {
        reject(new Error('ID is required for SEARCH_FIELD.'))
        return
      }
      const searchResult = resultArray
        ? searchValueByKey(resultArray, objectKeyId, _uniqueKey)
        : undefined
      resolve(searchResult)
      return // 搜索操作不需要更新状态
    } else if (method === ENUM.CHANGE_TYPE.RESULT_UPDATE_KV) {
      const objectKeyId = toObjectKey(_id)
      if (objectKeyId === undefined) {
        reject(new Error('ID is required for RESULT_UPDATE_KV.'))
        return
      }
      if (resultArray) {
        const matchedIndex = computeMatchedItemIndex(
          objectKeyId,
          resultArray,
          _uniqueKey
        )
        if (matchedIndex >= 0 && isKeyMap(resultArray[matchedIndex])) {
          // ✅ 创建新对象以确保响应式
          const newItem = { ...resultArray[matchedIndex] }
          updateObjectDeepValue(newItem, _changeKey, value)
          resultArray[matchedIndex] = newItem
        }
      }
      resolve(null)
    } else if (method === ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE) {
      const objectKeyId = toObjectKey(_id)
      if (objectKeyId === undefined) {
        reject(new Error('ID is required for RESULT_ITEM_MERGE.'))
        return
      }
      if (resultArray && isKeyMap(value)) {
        const matchedIndex = computeMatchedItemIndex(
          objectKeyId,
          resultArray,
          _uniqueKey
        )
        // ✅ updateArrayItem 会创建新对象，数组已经是新引用
        updateArrayItem(resultArray, matchedIndex, (item) => ({
          ...item,
          ...value
        }))
      }
      resolve(null)
    } else if (method === ENUM.CHANGE_TYPE.RESET_FIELD) {
      if (_changeKey === ENUM.FIELD_DATA.RESULT_KEY && isKeyMapArray(value)) {
        // ✅ 直接替换为新值
        newFieldData.result = value
      } else if (_changeKey === ENUM.FIELD_DATA.EXTRA_KEY && isKeyMap(value)) {
        // ✅ 直接替换为新值
        newFieldData.extra = value
      }
      resolve(null)
    } else {
      // 获取要修改的值
      let modifyValue: unknown
      if (_changeKey === ENUM.FIELD_DATA.RESULT_KEY) {
        modifyValue = resultArray || newFieldData.result
      } else if (_changeKey === ENUM.FIELD_DATA.EXTRA_KEY) {
        modifyValue = newFieldData.extra
      } else {
        modifyValue = getObjectDeepValue(newFieldData, _changeKey)
      }
      if (modifyValue == null) {
        modifyValue = []
      }

      const objectKeyId = toObjectKey(_id)
      const matchedIndex =
        objectKeyId !== undefined && isKeyMapArray(modifyValue)
          ? computeMatchedItemIndex(objectKeyId, modifyValue, _uniqueKey)
          : -1

      switch (method) {
        case ENUM.CHANGE_TYPE.RESULT_ADD_AFTER:
          // ✅ 始终创建新数组
          if (isArray(modifyValue)) {
            modifyValue = isArray(value)
              ? [...modifyValue, ...value]
              : [...modifyValue, value]
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_ADD_BEFORE:
          // ✅ 始终创建新数组
          if (isArray(modifyValue)) {
            modifyValue = isArray(value)
              ? [...value, ...modifyValue]
              : [value, ...modifyValue]
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID:
          // ✅ splice 或 filter 都会修改/创建数组
          if (isKeyMapArray(modifyValue)) {
            if (matchedIndex >= 0) {
              // 创建新数组副本后再 splice
              const newArray = [...modifyValue]
              newArray.splice(matchedIndex, 1)
              modifyValue = newArray
            } else if (isObjectKeyArray(_id)) {
              const idSet = new Set<ObjectKey>(_id)
              // filter 本身返回新数组
              modifyValue = modifyValue.filter((item) => {
                const itemKey = getObjectDeepValue(item, _uniqueKey)
                return !isObjectKey(itemKey) || !idSet.has(itemKey)
              })
            }
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_INSERT_TO_BEFORE:
          // ✅ 创建新数组后 splice
          if (isArray(modifyValue) && matchedIndex >= 0) {
            const newArray = [...modifyValue]
            newArray.splice(matchedIndex, 0, value)
            modifyValue = newArray
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_INSERT_TO_AFTER:
          // ✅ 创建新数组后 splice
          if (isArray(modifyValue) && matchedIndex >= 0) {
            const newArray = [...modifyValue]
            newArray.splice(matchedIndex + 1, 0, value)
            modifyValue = newArray
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_LIST_MERGE:
          // ⚠️ combineArrayData 直接修改数组，需要特殊处理
          if (isKeyMapArray(modifyValue)) {
            // 创建新数组副本
            const newArray = [...modifyValue]
            if (isKeyMapArray(value)) {
              combineArrayData(newArray, value, _uniqueKey)
            } else if (isKeyMap(value)) {
              const valueAsRecord: Record<ObjectKey, KeyMap> = {}
              for (const [k, v] of Object.entries(value)) {
                if (isKeyMap(v)) {
                  valueAsRecord[k] = v
                }
              }
              combineArrayData(newArray, valueAsRecord, _uniqueKey)
            }
            modifyValue = newArray
          }
          break
        default:
          resolve(null)
          return
      }
      // 更新对应字段的值
      if (
        _changeKey === ENUM.FIELD_DATA.RESULT_KEY &&
        isKeyMapArray(modifyValue)
      ) {
        newFieldData.result = modifyValue
      } else if (
        _changeKey === ENUM.FIELD_DATA.EXTRA_KEY &&
        isKeyMap(modifyValue)
      ) {
        newFieldData.extra = modifyValue
      }
      resolve(null)
    }

    const afterLength = computeResultLength(
      newFieldData[ENUM.FIELD_DATA.RESULT_KEY]
    )
    newFieldData.total = newFieldData.total + afterLength - beforeLength
    newFieldData.nothing = afterLength === 0

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: newFieldData,
      callback: () => {
        resolve(null)
      }
    })
  })
}
