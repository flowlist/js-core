import {
  generateDefaultField,
  generateFieldName,
  generateRequestParams,
  getDateFromCache,
  isClient,
  printLog,
} from './utils'
import { SET_DATA, SET_ERROR } from './setters'

export const initData = ({
  getter, setter, query, type, func, api, cacheTimeout, uniqueKey
}) => new Promise((resolve, reject) => {
  const fieldName = generateFieldName(func, type, query)
  const fieldData = getter(fieldName)
  const doRefresh = !!query.__refresh__
  const needReset = !!query.__reload__
  printLog(fieldName, 'initData', { func, type, query })
  // 如果 error 了，就不再请求
  if (fieldData && fieldData.error && !doRefresh) {
    printLog(fieldName, 'initData', 'error return')
    return resolve()
  }
  // 正在请求中，return
  if (fieldData && fieldData.loading) {
    printLog(fieldName, 'initData', 'loading return')
    return resolve()
  }
  // 这个 field 已经请求过了
  const dontFetch = fieldData && fieldData.fetched && !doRefresh
  if (dontFetch) {
    printLog(fieldName, 'initData', 'fetched return')
    return resolve()
  }

  const params = generateRequestParams({ fetched: false }, uniqueKey, query, type)
  params._extra = dontFetch ? (fieldData ? fieldData.extra : null) : null
  printLog(fieldName, 'request', { func, params })
  let data
  let fromLocal = false

  const getData = async () => {
    try {
      if (cacheTimeout && isClient) {
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
    } catch (error) {
      SET_ERROR({ setter, fieldName, error })
      reject(error)
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
