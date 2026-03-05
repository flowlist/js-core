// _internal/setters.ts
import ENUM from '../constants'
import type { BaseApiResponse, SetDataType, SetErrorType } from '../types'
import { computeResultLength, setReactivityField } from './utils'

export const SET_DATA = ({
  getter,
  setter,
  data,
  fieldName,
  type,
  page,
  insertBefore
}: SetDataType): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fieldData = getter(fieldName)
    if (!fieldData) {
      reject(new Error(`Field ${fieldName} not found.`))
      return
    }

    const field = fieldData
    let result: any
    let extra: unknown

    // 标准 API 响应（有 result 属性）
    const hasResult = Object.prototype.hasOwnProperty.call(data, 'result')
    if (!hasResult) {
      // 非标准：整个 data 就是 result
      result = data
      field.nothing = false
      field.fetched = true
      field.noMore = true
      field.page = -1
    } else {
      const apiResponse = data as BaseApiResponse
      result = apiResponse.result
      extra = apiResponse.extra
      const isEmpty = computeResultLength(result) === 0
      field.nothing = field.fetched ? false : isEmpty
      field.fetched = true
      field.total = apiResponse.total || 0

      if (type === ENUM.FETCH_TYPE.PAGINATION) {
        field.noMore = false
        field.page = +page
      } else {
        field.noMore =
          typeof apiResponse.no_more === 'undefined'
            ? isEmpty
            : apiResponse.no_more || isEmpty
        field.page = field.page + 1
      }
    }

    field.loading = false

    setReactivityField(
      field,
      ENUM.FIELD_DATA.RESULT_KEY,
      result,
      type,
      insertBefore
    )

    if (extra !== undefined && extra !== null) {
      setReactivityField(
        field,
        ENUM.FIELD_DATA.EXTRA_KEY,
        extra,
        type,
        insertBefore
      )
    }

    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: field,
      callback: () => resolve()
    })
  })
}

export const SET_ERROR = ({ setter, fieldName, error }: SetErrorType): void => {
  setter({
    key: fieldName,
    type: ENUM.SETTER_TYPE.MERGE,
    value: { error, loading: false }
  })
}
