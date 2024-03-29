import {
  generateDefaultField,
  generateFieldName,
  generateRequestParams,
  computeMatchedItemIndex,
  combineArrayData,
  updateObjectDeepValue,
  getObjectDeepValue,
  computeResultLength,
  searchValueByKey,
  isArray
} from './utils'
import { SET_DATA, SET_ERROR } from './setters'
import ENUM from './enum'
import type {
  objectKey,
  initStateType,
  initDataType,
  loadMoreType,
  updateStateType
} from './types'

export const initState = ({
  getter,
  setter,
  func,
  type,
  query,
  opts
}: initStateType): Promise<null> => {
  return new Promise((resolve) => {
    const fieldName = generateFieldName({ func, type, query })
    const fieldData = getter(fieldName)
    if (fieldData) {
      resolve(null)
      return
    }

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField(opts),
      callback: () => {
        resolve(null)
      }
    })
  })
}

export const initData = ({
  getter,
  setter,
  func,
  type,
  query,
  api,
  uniqueKey,
  callback
}: initDataType): Promise<any> =>
  new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, type, query })
    const fieldData = getter(fieldName)
    const doRefresh = !!query?.__refresh__
    const needReset = !!query?.__reload__
    // 如果 error 了，就不再请求
    if (fieldData && fieldData.error && !doRefresh) {
      return resolve(null)
    }
    // 正在请求中，return
    if (fieldData && fieldData.loading) {
      return resolve(null)
    }
    // 这个 field 已经请求过了
    const dontFetch = fieldData && fieldData.fetched && !doRefresh
    if (dontFetch) {
      return resolve(null)
    }

    const params = generateRequestParams({
      field: {
        ...fieldData,
        fetched: false
      },
      uniqueKey,
      query,
      type
    })

    const getData = () => {
      const loadData = () =>
        new Promise((res) => {
          const getDataFromAPI = () => {
            const funcCaller = typeof func === 'string' ? api[func] : func

            funcCaller(params)
              .then(res)
              .catch((error: Error) => {
                SET_ERROR({ setter, fieldName, error })
                reject(error)
              })
          }

          getDataFromAPI()
        })

      loadData().then((data) => {
        const setData = () => {
          SET_DATA({
            getter,
            setter,
            data,
            fieldName,
            type,
            page: params.page || 0,
            insertBefore: false
          }).then(() => {
            if (callback) {
              callback({
                params,
                data,
                refresh: doRefresh
              })
            }
            resolve(null)
          })
        }

        // 拿到数据后再重置 field
        if (needReset) {
          setter({
            key: fieldName,
            type: ENUM.SETTER_TYPE.RESET,
            value: generateDefaultField(),
            callback: setData
          })
        } else {
          setData()
        }
      })
    }

    // 需要预初始化 field
    if (!dontFetch && !needReset) {
      setter({
        key: fieldName,
        type: ENUM.SETTER_TYPE.RESET,
        value: {
          ...generateDefaultField(),
          loading: true,
          error: null
        },
        callback: getData
      })
    } else {
      getData()
    }
  })

export const loadMore = ({
  getter,
  setter,
  query,
  type,
  func,
  api,
  uniqueKey,
  errorRetry,
  callback
}: loadMoreType): Promise<any> =>
  new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, type, query })
    const fieldData = getter(fieldName)

    if (!fieldData) {
      return resolve(null)
    }

    if (fieldData.loading) {
      return resolve(null)
    }

    if (fieldData.nothing) {
      return resolve(null)
    }

    if (fieldData.noMore && !errorRetry) {
      return resolve(null)
    }

    if (
      type === ENUM.FETCH_TYPE.PAGINATION &&
      query &&
      +query.page === fieldData.page
    ) {
      return resolve(null)
    }

    let loadingState
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
      uniqueKey,
      query,
      type
    })

    ;(params as any)[ENUM.FIELD_DATA.EXTRA_KEY] = (fieldData as any)[
      ENUM.FIELD_DATA.EXTRA_KEY
    ]

    const getData = () => {
      const funcCaller = typeof func === 'string' ? api[func] : func

      funcCaller(params)
        .then((data: any) => {
          SET_DATA({
            getter,
            setter,
            data,
            fieldName,
            type,
            page: params.page || 0,
            insertBefore: !!query?.is_up
          }).then(() => {
            if (callback) {
              callback({
                params,
                data,
                refresh: false
              })
            }
            resolve(null)
          })
        })
        .catch((error: Error) => {
          SET_ERROR({ setter, fieldName, error })
          reject(error)
        })
    }

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.MERGE,
      value: loadingState,
      callback: getData
    })
  })

export const updateState = ({
  getter,
  setter,
  type,
  func,
  query,
  method,
  value,
  id,
  uniqueKey,
  changeKey
}: updateStateType) => {
  return new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, type, query })
    const fieldData = getter(fieldName)
    if (!fieldData) {
      reject()
      return
    }

    if (fieldData.page === -1) {
      resolve(null)
      return
    }

    const _id = id || ''
    const _uniqueKey = uniqueKey || ENUM.DEFAULT_UNIQUE_KEY_NAME
    const _changeKey = changeKey || ENUM.FIELD_DATA.RESULT_KEY
    const beforeLength = computeResultLength(
      (fieldData as any)[ENUM.FIELD_DATA.RESULT_KEY]
    )

    if (method === ENUM.CHANGE_TYPE.SEARCH_FIELD) {
      resolve(
        searchValueByKey(
          (fieldData as any)[ENUM.FIELD_DATA.RESULT_KEY],
          _id as objectKey,
          _uniqueKey
        )
      )
    } else if (method === ENUM.CHANGE_TYPE.RESULT_UPDATE_KV) {
      // 修改 result 下的某个值的任意字段
      const matchedIndex = computeMatchedItemIndex(
        _id as objectKey,
        (fieldData as any)[ENUM.FIELD_DATA.RESULT_KEY],
        _uniqueKey
      )
      updateObjectDeepValue(
        (fieldData as any)[ENUM.FIELD_DATA.RESULT_KEY][matchedIndex],
        _changeKey,
        value
      )
    } else if (method === ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE) {
      // 修改 result 下的某个值的任意字段
      const matchedIndex = computeMatchedItemIndex(
        _id as objectKey,
        (fieldData as any)[ENUM.FIELD_DATA.RESULT_KEY],
        _uniqueKey
      )
      ;(fieldData as any)[ENUM.FIELD_DATA.RESULT_KEY][matchedIndex] = {
        ...(fieldData as any)[ENUM.FIELD_DATA.RESULT_KEY][matchedIndex],
        ...value
      }
    } else if (method === ENUM.CHANGE_TYPE.RESET_FIELD) {
      // 修改包括 field 下的任意字段
      updateObjectDeepValue(fieldData, _changeKey, value)
    } else {
      let modifyValue = getObjectDeepValue(fieldData, _changeKey)
      const matchedIndex = computeMatchedItemIndex(
        _id as objectKey,
        modifyValue,
        _uniqueKey
      )

      switch (method) {
        case ENUM.CHANGE_TYPE.RESULT_ADD_AFTER:
          isArray(value)
            ? (modifyValue = modifyValue.concat(value))
            : modifyValue.push(value)
          break
        case ENUM.CHANGE_TYPE.RESULT_ADD_BEFORE:
          isArray(value)
            ? (modifyValue = value.concat(modifyValue))
            : modifyValue.unshift(value)
          break
        case ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID:
          if (matchedIndex >= 0) {
            modifyValue.splice(matchedIndex, 1)
          } else if (isArray(_id)) {
            modifyValue = modifyValue.filter(
              (_: any) => (_id as objectKey[]).indexOf(_[_uniqueKey]) === -1
            )
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_INSERT_TO_BEFORE:
          if (matchedIndex >= 0) {
            modifyValue.splice(matchedIndex, 0, value)
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_INSERT_TO_AFTER:
          if (matchedIndex >= 0) {
            modifyValue.splice(matchedIndex + 1, 0, value)
          }
          break
        case ENUM.CHANGE_TYPE.RESULT_LIST_MERGE:
          combineArrayData(modifyValue, value, _uniqueKey)
          break
      }
      ;(fieldData as any)[_changeKey] = modifyValue
    }

    const afterLength = computeResultLength(
      (fieldData as any)[ENUM.FIELD_DATA.RESULT_KEY]
    )
    fieldData.total = fieldData.total + afterLength - beforeLength
    fieldData.nothing = afterLength === 0

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.MERGE,
      value: fieldData,
      callback: () => {
        resolve(null)
      }
    })
  })
}
