import {
  computeResultLength,
  isClient,
  printLog,
  setReactivityField,
} from './utils'

export const SET_DATA = ({
  getter, setter, data, fieldName, type, fromLocal, cacheTimeout, page, insertBefore,
}) => {
  printLog(fieldName, 'setData', {
    data, type, page, insertBefore, fromLocal, cacheTimeout,
  })
  if (fromLocal) {
    setter({
      key: fieldName,
      type: 0,
      value: data,
    })
    printLog(fieldName, 'setData', 'from local return')
    return
  }

  const fieldData = getter(fieldName)
  if (!fieldData) {
    printLog(fieldName, 'setData', 'no field return')
    return
  }

  const { result, extra } = data
  if (!fieldData.fetched) {
    fieldData.fetched = true
    fieldData.nothing = computeResultLength(result) === 0
  }
  fieldData.total = data.total
  fieldData.noMore = type === 'jump' ? false : data.no_more
  fieldData.page = typeof page === 'number' ? page : typeof page === 'string' ? +page : 1
  fieldData.loading = false
  setReactivityField(fieldData, 'result', result, type, insertBefore)
  if (extra) {
    setReactivityField(fieldData, 'extra', extra, type, insertBefore)
  }

  setter({
    key: fieldName,
    type: 0,
    value: fieldData,
  })

  if (isClient && cacheTimeout && !fieldData.nothing) {
    setDataToCache({
      key: fieldName,
      value: fieldData,
      expiredAt: Date.now() + cacheTimeout * 1000,
    })
  }
}

export const SET_ERROR = ({ setter, fieldName, error }) => {
  setter({
    key: fieldName,
    type: 1,
    value: {
      error,
      loading: false,
    },
  })
}
