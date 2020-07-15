import {
  generateDefaultField,
  generateFieldName,
  generateRequestParams,
  getDateFromCache,
  inBrowserClient,
  computeMatchedItemIndex,
  combineArrayData,
  updateObjectDeepValue,
  isArray
} from './utils'
import { SET_DATA, SET_ERROR } from './setters'
import ENUM from './enum'

export const initState = ({ getter, setter, func, type, query, opts = {} }) => {
  const fieldName = generateFieldName({ func, type, query })
  const fieldData = getter(fieldName)
  if (fieldData) {
    return
  }

  setter({
    key: fieldName,
    type: ENUM.SETTER_TYPE.RESET,
    value: generateDefaultField(opts)
  })
}

export const initData = ({
  getter, setter, func, type, query, api, cacheTimeout, uniqueKey, callback
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
      if (cacheTimeout && inBrowserClient) {
        data = getDateFromCache({
          key: fieldName,
          now: Date.now(),
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
          data,
          fieldName,
          type,
          fromLocal,
          cacheTimeout,
          page: params.page,
          insertBefore: false,
        })

        if (inBrowserClient && callback) {
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
  getter, setter, query, type, func, api, cacheTimeout, uniqueKey, errorRetry, callback
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
        data,
        fieldName,
        type,
        fromLocal: false,
        cacheTimeout,
        page: params.page,
        insertBefore: !!query.is_up
      })

      if (inBrowserClient && callback) {
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
  getter, setter, type, func, query, id, method, value, uniqueKey = 'id', changeKey = 'result', cacheTimeout
}) => {
  const fieldName = generateFieldName({ func, type, query })
  const fieldData = getter(fieldName)
  if (!fieldData) {
    return
  }

  const beforeLength = computeResultLength(fieldData.result)
  if (method === 'update') {
    // 修改 result 下的任意字段
    if (isArray(fieldData.result)) {
      const matchedIndex = computeMatchedItemIndex(id, fieldData.result, uniqueKey)
      updateObjectDeepValue(fieldData.result[matchedIndex], changeKey, value)
    } else {
      const keys = changeKey.split('.')
      keys.pop()
      const changeArr = getObjectDeepValue(fieldData.result, keys)
      const matchedIndex = computeMatchedItemIndex(id, changeArr, uniqueKey)
      changeArr[matchedIndex] = value
    }
  } else if (method === 'modify') {
    // 修改包括 field 下的任意字段
    updateObjectDeepValue(fieldData, changeKey, value)
  } else {
    let modifyValue = getObjectDeepValue(fieldData, changeKey)
    const matchedIndex = computeMatchedItemIndex(id, modifyValue, uniqueKey)

    switch (method) {
      case 'push':
        isArray(value) ? modifyValue = modifyValue.concat(value) : modifyValue.push(value)
        break
      case 'unshift':
        isArray(value) ? modifyValue = value.concat(modifyValue) : modifyValue.unshift(value)
        break
      case 'delete':
        if (matchedIndex >= 0) {
          modifyValue.splice(matchedIndex, 1)
        }
        break
      case 'insert-before':
        if (matchedIndex >= 0) {
          modifyValue.splice(matchedIndex, 0, value)
        }
        break
      case 'insert-after':
        if (matchedIndex >= 0) {
          modifyValue.splice(matchedIndex + 1, 0, value)
        }
        break
      case 'patch':
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
    value: fieldData
  })

  if (inBrowserClient && cacheTimeout) {
    setDataToCache({
      key: fieldName,
      value: fieldData,
      expiredAt: Date.now() + cacheTimeout * 1000
    })
  }
}
