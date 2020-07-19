import {
  generateDefaultField,
  generateFieldName,
  generateRequestParams,
  computeMatchedItemIndex,
  combineArrayData,
  updateObjectDeepValue,
  getObjectDeepValue,
  computeResultLength,
  isArray
} from './utils'
import { SET_DATA, SET_ERROR } from './setters'
import ENUM from './enum'

export const initState = ({
  getter,
  setter,
  func,
  type,
  query,
  opts = {}
}) => {
  return new Promise((resolve, reject) => {
    const fieldName = generateFieldName({ func, type, query })
    const fieldData = getter(fieldName)
    if (fieldData) {
      reject()
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

export const initData = ({
  getter,
  setter,
  cache,
  func,
  type,
  query,
  api,
  cacheTimeout,
  uniqueKey,
  callback
}) => new Promise((resolve, reject) => {
  const fieldName = generateFieldName({ func, type, query })
  const fieldData = getter(fieldName)
  const doRefresh = !!query.__refresh__
  const needReset = !!query.__reload__
  // 如果 error 了，就不再请求
  if (fieldData && fieldData.error && !doRefresh) {
    return resolve()
  }
  // 正在请求中，return
  if (fieldData && fieldData.loading) {
    return resolve()
  }
  // 这个 field 已经请求过了
  const dontFetch = fieldData && fieldData.fetched && !doRefresh
  if (dontFetch) {
    return resolve()
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
  let data
  let fromLocal = false

  const getData = async () => {
    try {
      if (cacheTimeout) {
        data = cache.get({
          key: fieldName
        })
        if (data) {
          fromLocal = true
        } else {
          data = await api[func](params)
        }
      } else {
        data = await api[func](params)
      }

      const setData = async () => {
        await SET_DATA({
          getter,
          setter,
          cache,
          data,
          fieldName,
          type,
          fromLocal,
          cacheTimeout,
          page: params.page,
          insertBefore: false,
        })

        if (callback) {
          callback({
            params,
            data,
            refresh: doRefresh
          })
        }

        resolve()
      }

      // 拿到数据后再重置 field
      if (needReset) {
        setter({
          key: fieldName,
          type: ENUM.SETTER_TYPE.RESET,
          value: generateDefaultField(),
          callback: setData,
        })
      } else {
        setData()
      }
    } catch (error) {
      SET_ERROR({ setter, fieldName, error })
      reject(error)
    }
  }

  // 需要预初始化 field
  if (!dontFetch && !needReset) {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: {
        ...generateDefaultField(),
        loading: true,
        error: null,
      },
      callback: getData,
    })
  } else {
    getData()
  }
})

export const loadMore = ({
  getter,
  setter,
  cache,
  query,
  type,
  func,
  api,
  cacheTimeout,
  uniqueKey,
  errorRetry,
  callback
}) => new Promise((resolve, reject) => {
  const fieldName = generateFieldName({ func, type, query })
  const fieldData = getter(fieldName)

  if (!fieldData) {
    return resolve()
  }

  if (fieldData.loading) {
    return resolve()
  }

  if (fieldData.nothing) {
    return resolve()
  }

  if (fieldData.noMore && !errorRetry) {
    return resolve()
  }

  if (type === ENUM.FETCH_TYPE.PAGINATION && +query.page === fieldData.page) {
    return resolve()
  }

  const loadingState = {
    loading: true,
    error: null
  }

  if (type === ENUM.FETCH_TYPE.PAGINATION) {
    loadingState.result = []
    loadingState.extra = null
  }

  const params = generateRequestParams({
    field: fieldData,
    uniqueKey,
    query,
    type
  })
  params._extra = fieldData.extra

  const getData = async () => {
    try {
      const data = await api[func](params)

      await SET_DATA({
        getter,
        setter,
        cache,
        data,
        fieldName,
        type,
        fromLocal: false,
        cacheTimeout,
        page: params.page,
        insertBefore: !!query.is_up
      })

      if (callback) {
        callback({
          params,
          data,
          refresh: false
        })
      }

      resolve()
    } catch (error) {
      SET_ERROR({ setter, fieldName, error })
      reject(error)
    }
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
  cache,
  type,
  func,
  query,
  method,
  value,
  id = '',
  uniqueKey = ENUM.FETCH_PARAMS_DEFAULT.CHANGE_KEY_NAME,
  changeKey = ENUM.FIELD_DATA.RESULT_KEY,
  cacheTimeout
}) => {
  return new Promise((resolve,  reject) => {
    const fieldName = generateFieldName({ func, type, query })
    const fieldData = getter(fieldName)
    if (!fieldData) {
      reject()
      return
    }

    const beforeLength = computeResultLength(fieldData.result)
    if (method === ENUM.CHANGE_TYPE.UPDATE_RESULT) {
      // 修改 result 下的某个值的任意字段
      const matchedIndex = computeMatchedItemIndex(id, fieldData.result, uniqueKey)
      updateObjectDeepValue(fieldData.result[matchedIndex], changeKey, value)
    } else if (method === ENUM.CHANGE_TYPE.RESET_FIELD) {
      // 修改包括 field 下的任意字段
      updateObjectDeepValue(fieldData, changeKey, value)
    } else {
      let modifyValue = getObjectDeepValue(fieldData, changeKey)
      const matchedIndex = computeMatchedItemIndex(id, modifyValue, uniqueKey)

      switch (method) {
        case ENUM.CHANGE_TYPE.RESULT_ADD_AFTER:
          isArray(value) ? modifyValue = modifyValue.concat(value) : modifyValue.push(value)
          break
        case ENUM.CHANGE_TYPE.RESULT_ADD_BEFORE:
          isArray(value) ? modifyValue = value.concat(modifyValue) : modifyValue.unshift(value)
          break
        case ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID:
          if (matchedIndex >= 0) {
            modifyValue.splice(matchedIndex, 1)
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
          combineArrayData(modifyValue, value, uniqueKey)
          break
      }
      fieldData[changeKey] = modifyValue
    }

    const afterLength = computeResultLength(fieldData.result)
    fieldData.total = fieldData.total + afterLength - beforeLength
    fieldData.nothing = afterLength === 0

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.MERGE,
      value: fieldData,
      callback: () => {
        if (cacheTimeout) {
          cache.set({
            key: fieldName,
            value: fieldData,
            timeout: cacheTimeout
          })
        }

        resolve()
      }
    })
  })
}
