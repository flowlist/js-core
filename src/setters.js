import {
  inBrowserClient,
  computeResultLength,
  setDataToCache,
  setReactivityField,
} from './utils'

export const SET_DATA = ({
  getter, setter, data, fieldName, type, fromLocal, cacheTimeout, page, insertBefore,
}) => {
  if (fromLocal) {
    setter({
      key: fieldName,
      type: 0,
      value: data,
    })
    return
  }

  const fieldData = getter(fieldName)
  if (!fieldData) {
    return
  }

  const { result, extra } = data
  fieldData.nothing = fieldData.fetched ? false : computeResultLength(result) === 0
  fieldData.fetched = true
  fieldData.total = data.total || 0
  fieldData.noMore = type === 'jump' ? false : (data.no_more || false)
  fieldData.page = page ? parseInt(page) : fieldData.page + 1
  fieldData.loading = false
  setReactivityField(fieldData, 'result', result, type, insertBefore)
  extra && setReactivityField(fieldData, 'extra', extra, type, insertBefore)

  setter({
    key: fieldName,
    type: 0,
    value: fieldData,
  })

  if (cacheTimeout && inBrowserClient && !fieldData.nothing) {
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
