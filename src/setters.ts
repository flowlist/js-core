import { computeResultLength, setReactivityField, isObjectResult } from './utils'
import ENUM from './enum'
import type { setDataType, setErrorType } from './types'

export const SET_DATA = ({
  getter,
  setter,
  data,
  fieldName,
  type,
  page,
  insertBefore
}: setDataType): Promise<any> => {
  return new Promise((resolve, reject) => {
    const fieldData = getter(fieldName)
    if (!fieldData) {
      reject()
      return
    }

    let result
    let extra

    if (isObjectResult(data)) {
      result = data
      fieldData.nothing = false
      fieldData.fetched = true
      fieldData.noMore = true
      fieldData.page = -1
    } else {
      result = data.result
      extra = data.extra
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
    }

    fieldData.loading = false
    setReactivityField(
      fieldData,
      // @ts-ignore
      ENUM.FIELD_DATA.RESULT_KEY,
      result,
      type,
      insertBefore
    )
    extra &&
      setReactivityField(
        fieldData,
        // @ts-ignore
        ENUM.FIELD_DATA.EXTRA_KEY,
        extra,
        type,
        insertBefore
      )
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: fieldData,
      callback: () => {
        resolve(null)
      }
    })
  })
}

export const SET_ERROR = ({ setter, fieldName, error }: setErrorType): void => {
  setter({
    key: fieldName,
    type: ENUM.SETTER_TYPE.MERGE,
    value: {
      error,
      loading: false
    }
  })
}
