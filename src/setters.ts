// setters.ts
import {
  computeResultLength,
  setReactivityField,
  isObjectResult
} from './utils'
import ENUM from './enum'
import type {
  SetDataType,
  SetErrorType,
  DefaultField,
  ApiResponse,
  ResultType
} from './types'

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

    // 类型断言：确保 fieldData 符合 DefaultField<T, E>
    const field = fieldData as DefaultField

    let result: ResultType
    let extra: unknown

    if (isObjectResult(data)) {
      // data is T (object result mode)
      result = data
      field.nothing = false
      field.fetched = true
      field.noMore = true
      field.page = -1
    } else {
      // data is ApiResponse<T, E>
      const apiResponse = data as ApiResponse
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

    // Mutate field in-place (same as old logic)
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

    // Notify setter that field has been mutated (not replaced)
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET, // or MUTATE if you have such type
      value: field, // same reference
      callback: () => {
        resolve()
      }
    })
  })
}

export const SET_ERROR = ({ setter, fieldName, error }: SetErrorType): void => {
  setter({
    key: fieldName,
    type: ENUM.SETTER_TYPE.MERGE,
    value: {
      error,
      loading: false
    }
  })
}
