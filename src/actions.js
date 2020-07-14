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

export const initState = ({
  getter, setter, query, type, func, opts
}) => {
  const fieldName = generateFieldName(func, type, query)
  const fieldData = getter(fieldName)
  if (fieldData) {
    return
  }
  setter({
    key: fieldName,
    type: 0,
    value: generateDefaultField(opts || {})
  })
}

export const initData = ({
  getter, setter, query, type, func, api, cacheTimeout, uniqueKey, callback
}) => new Promise((resolve, reject) => {
  const fieldName = generateFieldName(func, type, query)
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

  const params = generateRequestParams({ fetched: false }, uniqueKey, query, type)
  params._extra = dontFetch ? (fieldData ? fieldData.extra : null) : null
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

      const setData = () => {
        SET_DATA({
          getter,
          setter,
          data,
          fieldName,
          type,
          fromLocal,
          cacheTimeout,
          page: params.page,
          insertBefore: !!query.is_up,
        })

        if (inBrowserClient && callback) {
          callback({
            params,
            data,
            refresh: doRefresh
          })
        }
      }
      // 拿到数据后再重置 field
      if (needReset) {
        setter({
          key: fieldName,
          type: 0,
          value: generateDefaultField(),
          callback: setData,
        })
      } else {
        setData()
      }

      resolve()
    } catch (error) {
      SET_ERROR({ setter, fieldName, error })
      reject(error)
    }
  }

  // 需要预初始化 field
  if (!dontFetch && !needReset) {
    setter({
      key: fieldName,
      type: 0,
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
  getter, setter, query, type, func, api, cacheTimeout, uniqueKey, force, callback
}) => new Promise((resolve, reject) => {
  const fieldName = generateFieldName(func, type, query)
  const fieldData = getter(fieldName)

  if (!fieldData || fieldData.loading || fieldData.nothing || (fieldData.noMore && !force)) {
    return resolve()
  }

  if (type === 'jump' && +query.page === fieldData.page) {
    return resolve()
  }

  const loadingState = {
    loading: true,
    error: null
  }

  if (type === 'jump') {
    loadingState.result = []
    loadingState.extra = null
  }

  const params = generateRequestParams(fieldData, uniqueKey, query, type)
  params._extra = fieldData.extra

  const getData = async () => {
    try {
      const data = await api[func](params)

      SET_DATA({
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
    type: 1,
    value: loadingState,
    callback: getData
  })
})

export const updateState = ({
  getter, setter, type, func, query, id, method, changeKey, value, cacheTimeout, uniqueKey
}) => {
  const fieldName = generateFieldName(func, type, query)
  const fieldData = getter(fieldName)
  if (!fieldData) {
    return
  }
  const changingKey = uniqueKey || 'id'
  const beforeLength = computeResultLength(fieldData.result)
  if (method === 'update') {
    // TODO
  } else if (method === 'modify') {
    updateObjectDeepValue(fieldData, changeKey, value)
  } else {
    const modifyKey = changeKey || 'result'
    let modifyValue = getObjectDeepValue(fieldData, modifyKey)
    const matchedIndex = computeMatchedItemIndex(id, modifyValue, changingKey)

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
        combineArrayData(modifyValue, value, changingKey)
        break
    }
    fieldData[modifyKey] = modifyValue
  }

  const afterLength = computeResultLength(fieldData.result)
  fieldData.total = fieldData.total + afterLength - beforeLength
  fieldData.nothing = afterLength === 0

  setter({
    key: fieldName,
    type: 0,
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
