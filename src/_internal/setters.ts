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
  insertBefore,
  uniqueKey,
  mergeStrategy,
  replaceOnRefresh
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
    // 成功落数据即清除上一次的 error：刷新/重试成功后不应残留旧错误。
    // （原实现仅靠非增量刷新「先 RESET 到 default」间接清 error，增量/preserve
    //  刷新跳 RESET 时漏清；统一在此清，对所有 mergeStrategy 正确。）
    field.error = null

    // refresh 整表替换（append / replace 策略）：直接覆盖 result + 重置游标，
    // 不走去重追加。覆盖是原子的（旧 result 留到此刻被一次性替换），不经空列表中间态。
    // 这是消除「cursor 存 extra 的列表刷新被旧游标污染」根因的关键。
    if (replaceOnRefresh) {
      field.result = result
      field.extra = extra === undefined ? null : extra
      // 刷新回第一页：page 复位（PAGINATION 用传入 page，其余复位为 1 = 已取第一页）
      field.page = type === ENUM.FETCH_TYPE.PAGINATION ? +page : 1
      setter({
        key: fieldName,
        type: ENUM.SETTER_TYPE.RESET,
        value: field,
        callback: () => resolve()
      })
      return
    }

    setReactivityField(
      field,
      ENUM.FIELD_DATA.RESULT_KEY,
      result,
      insertBefore,
      uniqueKey,
      mergeStrategy
    )

    if (extra !== undefined && extra !== null) {
      setReactivityField(
        field,
        ENUM.FIELD_DATA.EXTRA_KEY,
        extra,
        insertBefore,
        uniqueKey,
        mergeStrategy
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
