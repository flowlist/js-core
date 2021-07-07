import {
  computeResultLength,
  setReactivityField,
} from './utils'
import ENUM from './enum'
import type { fetchTypes, defaultField } from './utils'
import type { cacheType, setterFuncParams } from './index'

type setDataType = {
  getter: (str: string) => defaultField
  setter: (obj: setterFuncParams) => {}
  cache: cacheType
  data: any
  fieldName: string
  type: fetchTypes
  fromLocal: boolean
  cacheTimeout: number
  page: number
  insertBefore: boolean
}

export const SET_DATA = ({
  getter, setter, cache, data, fieldName, type, fromLocal, cacheTimeout, page, insertBefore,
}: setDataType): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (fromLocal) {
      setter({
        key: fieldName,
        type: ENUM.SETTER_TYPE.RESET,
        value: data,
        callback: () => {
          resolve(null)
        }
      })
      return
    }

    const fieldData = getter(fieldName)
    if (!fieldData) {
      reject()
      return
    }

    const { result, extra } = data
    const isEmpty = computeResultLength(result) === 0
    fieldData.nothing = fieldData.fetched ? false : isEmpty
    fieldData.fetched = true
    fieldData.total = data.total || 0
    if (type === ENUM.FETCH_TYPE.PAGINATION) {
      fieldData.noMore = false
      fieldData.page = +page
    } else {
      fieldData.noMore = data.no_more || isEmpty
      fieldData.page = fieldData.page + 1
    }
    fieldData.loading = false
    // @ts-ignore
    setReactivityField(fieldData, ENUM.FIELD_DATA.RESULT_KEY, result, type, insertBefore)
    // @ts-ignore
    extra && setReactivityField(fieldData, ENUM.FIELD_DATA.EXTRA_KEY, extra, type, insertBefore)
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: fieldData,
      callback: () => {
        if (cacheTimeout && cache && !fieldData.nothing) {
          cache.set({
            key: fieldName,
            value: fieldData,
            timeout: cacheTimeout,
          })
            .then(resolve)
            .catch(resolve)
          return
        }

        resolve(null)
      }
    })
  })
}

type setErrorType = {
  setter: (obj: setterFuncParams) => {}
  fieldName: string
  error: null | Error
}

export const SET_ERROR = ({ setter, fieldName, error }: setErrorType): void => {
  setter({
    key: fieldName,
    type: ENUM.SETTER_TYPE.MERGE,
    value: {
      error,
      loading: false,
    },
  })
}
