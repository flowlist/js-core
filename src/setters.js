import {
  inBrowserClient,
  computeResultLength,
  setDataToCache,
  setReactivityField,
} from './utils'
import ENUM from './enum'

export const SET_DATA = ({
  getter, setter, data, fieldName, type, fromLocal, cacheTimeout, page, insertBefore,
}) => {
  return new Promise((resolve, reject) => {
    if (fromLocal) {
      setter({
        key: fieldName,
        type: ENUM.SETTER_TYPE.RESET,
        value: data,
        callback: () => {
          resolve()
        }
      })
      return
    }

    const fieldData = getter(fieldName)
    if (!fieldData) {
      reject({
        message: 'field not init'
      })
      return
    }

    const { result, extra } = data
    fieldData.nothing = fieldData.fetched ? false : computeResultLength(result) === 0
    fieldData.fetched = true
    fieldData.total = data.total || 0
    if (type === ENUM.FETCH_TYPE.PAGINATION) {
      fieldData.noMore = false
      fieldData.page = +page
    } else {
      fieldData.noMore = data.no_more || false
      fieldData.page = fieldData.page + 1
    }
    fieldData.loading = false
    setReactivityField(fieldData, 'result', result, type, insertBefore)
    extra && setReactivityField(fieldData, 'extra', extra, type, insertBefore)
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: fieldData,
      callback: () => {
        if (cacheTimeout && inBrowserClient && !fieldData.nothing) {
          setDataToCache({
            key: fieldName,
            value: fieldData,
            expiredAt: Date.now() + cacheTimeout * 1000,
          })
        }

        resolve()
      }
    })
  })
}

export const SET_ERROR = ({ setter, fieldName, error }) => {
  setter({
    key: fieldName,
    type: ENUM.SETTER_TYPE.MERGE,
    value: {
      error,
      loading: false,
    },
  })
}
