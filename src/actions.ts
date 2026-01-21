// src/actions.ts
import ENUM from './enum'
import { SET_DATA, SET_ERROR } from './setters'
import {
  combineArrayData,
  computeMatchedItemIndex,
  computeResultLength,
  generateDefaultField,
  generateFieldName,
  generateRequestParams,
  getObjectDeepValue,
  getResultAsArray,
  isArray,
  isKeyMap,
  isKeyMapArray,
  isObjectKey,
  isObjectKeyArray,
  searchValueByKey,
  toObjectKey,
  updateArrayItem,
  updateObjectDeepValue
} from './utils'

import type {
  ApiResponse,
  DefaultField,
  InitDataType,
  InitStateType,
  KeyMap,
  LoadMoreType,
  ObjectKey,
  RequestParams,
  ResultType,
  UpdateStateType
} from './types'

export const initState = <P = RequestParams, R = ResultType>({
  getter,
  setter,
  func,
  query,
  opts
}: InitStateType<P, R>): Promise<void> => {
  return new Promise((resolve) => {
    const fieldName = generateFieldName({ func, query })
    const fieldData = getter(fieldName)
    if (fieldData) {
      resolve()
      return
    }

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField(opts),
      callback: () => {
        resolve()
      }
    })
  })
}

export const initData = <P = RequestParams, R = ResultType>({
  getter,
  setter,
  func,
  query,
  callback
}: InitDataType<P, R>): Promise<void> =>
  new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, query })
    const fieldData = getter(fieldName)
    const queryAsParams = query as RequestParams | undefined
    const doRefresh = !!queryAsParams?.__refresh__
    const needReset = !!queryAsParams?.__reload__
    const directlyLoadData = doRefresh && !needReset

    // 状态锁判断
    if (fieldData && fieldData.error && !doRefresh) return resolve()
    if (fieldData && fieldData.loading) return resolve()
    if (fieldData && fieldData.fetched && !doRefresh) return resolve()

    const params = generateRequestParams({
      field: generateDefaultField({
        ...fieldData,
        fetched: false
      }),
      uniqueKey: func.uniqueKey, // 自动从契约获取
      type: func.type,
      query: query as KeyMap | undefined
    })

    const executeFetch = () => {
      // params 是 GenerateParamsResp，它包含 RequestParams 所需的所有字段
      // 由于 P extends RequestParams，params 符合 P 的结构约束
      // 使用函数参数类型推断而不是类型断言
      func(params as P & typeof params)
        .then((data) => {
          const commitData = () => {
            SET_DATA({
              getter,
              setter,
              data: data as ApiResponse,
              fieldName,
              type: func.type,
              page: params.page || 0,
              insertBefore: false
            }).then(() => {
              callback?.({
                params: params as P & typeof params,
                data,
                refresh: doRefresh
              })
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

    // 更新 Loading 状态并触发请求
    if (directlyLoadData) {
      executeFetch()
    } else {
      setter({
        key: fieldName,
        type: ENUM.SETTER_TYPE.RESET,
        value: {
          ...generateDefaultField(),
          loading: true,
          error: null
        },
        callback: executeFetch
      })
    }
  })

/**
 * 加载更多数据
 */
export const loadMore = <P = RequestParams, R = ResultType>({
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
    const type = func.type

    if (!fieldData || fieldData.loading || fieldData.nothing) return resolve()
    if (fieldData.noMore && !errorRetry) return resolve()

    if (
      type === ENUM.FETCH_TYPE.PAGINATION &&
      query &&
      (query as RequestParams).page != null &&
      +(query as RequestParams).page! === fieldData.page
    ) {
      resolve()
      return
    }

    let loadingState: Partial<DefaultField>
    if (type === ENUM.FETCH_TYPE.PAGINATION) {
      loadingState = {
        loading: true,
        error: null,
        [ENUM.FIELD_DATA.RESULT_KEY]: [],
        [ENUM.FIELD_DATA.EXTRA_KEY]: null
      }
    } else {
      loadingState = {
        loading: true,
        error: null
      }
    }

    const params = generateRequestParams({
      field: fieldData,
      uniqueKey: func.uniqueKey,
      type,
      query: query as KeyMap | undefined
    })

    // 注入翻页所需的 extra
    if (fieldData.extra) {
      params[ENUM.FIELD_DATA.EXTRA_KEY] = fieldData.extra
    }

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.MERGE,
      value: loadingState,
      callback: () => {
        func(params as P & typeof params)
          .then((data) => {
            SET_DATA({
              getter,
              setter,
              data: data as ApiResponse,
              type,
              fieldName,
              page: params.page || 0,
              insertBefore: !!(query as RequestParams | undefined)?.is_up
            }).then(() => {
              callback?.({
                params: params as P & typeof params,
                data,
                refresh: false
              })
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

export const updateState = <P = RequestParams, R = ResultType, T = KeyMap>({
  getter,
  setter,
  func,
  query,
  method,
  id,
  value,
  changeKey
}: UpdateStateType<P, R, T>): Promise<unknown> => {
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

    const newFieldData: DefaultField = { ...fieldData }
    const resultArray = getResultAsArray(newFieldData)

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
          updateObjectDeepValue(resultArray[matchedIndex], _changeKey, value)
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
        updateArrayItem(resultArray, matchedIndex, (item) => ({
          ...item,
          ...value
        }))
      }
      resolve(null)
    } else if (method === ENUM.CHANGE_TYPE.RESET_FIELD) {
      // 使用特定字段更新而不是通用 KeyMap
      if (_changeKey === ENUM.FIELD_DATA.RESULT_KEY && isKeyMapArray(value)) {
        newFieldData.result = value
      } else if (_changeKey === ENUM.FIELD_DATA.EXTRA_KEY && isKeyMap(value)) {
        newFieldData.extra = value
      }
      resolve(null)
    } else {
      // 获取要修改的值
      let modifyValue: unknown
      if (_changeKey === ENUM.FIELD_DATA.RESULT_KEY) {
        modifyValue = newFieldData.result
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
          if (isArray(modifyValue)) {
            modifyValue = isArray(value)
              ? [...modifyValue, ...value]
              : [...modifyValue, value]
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_ADD_BEFORE:
          if (isArray(modifyValue)) {
            modifyValue = isArray(value)
              ? [...value, ...modifyValue]
              : [value, ...modifyValue]
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID:
          if (isKeyMapArray(modifyValue)) {
            if (matchedIndex >= 0) {
              modifyValue.splice(matchedIndex, 1)
            } else if (isObjectKeyArray(_id)) {
              const idSet = new Set<ObjectKey>(_id)
              modifyValue = modifyValue.filter((item) => {
                const itemKey = getObjectDeepValue(item, _uniqueKey)
                return !isObjectKey(itemKey) || !idSet.has(itemKey)
              })
            }
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_INSERT_TO_BEFORE:
          if (isArray(modifyValue) && matchedIndex >= 0) {
            modifyValue.splice(matchedIndex, 0, value)
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_INSERT_TO_AFTER:
          if (isArray(modifyValue) && matchedIndex >= 0) {
            modifyValue.splice(matchedIndex + 1, 0, value)
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_LIST_MERGE:
          if (isKeyMapArray(modifyValue)) {
            if (isKeyMapArray(value)) {
              combineArrayData(modifyValue, value, _uniqueKey)
            } else if (isKeyMap(value)) {
              // value 是 KeyMap，需要检查是否为 Record<ObjectKey, KeyMap>
              const valueAsRecord: Record<ObjectKey, KeyMap> = {}
              for (const [k, v] of Object.entries(value)) {
                if (isKeyMap(v)) {
                  valueAsRecord[k] = v
                }
              }
              combineArrayData(modifyValue, valueAsRecord, _uniqueKey)
            }
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
