// utils.ts
import ENUM from './enum'
import type {
  ObjectKey,
  KeyMap,
  DefaultField,
  FetchType,
  FieldKeys,
  GenerateFieldProps,
  GenerateParamsType,
  GenerateParamsResp
} from './types'

/**
 * 判断数据是否为对象结果（即没有 result 字段）
 * 注意：这里我们假设 "对象结果" 指的是一个普通的对象，而不是 ApiResponse。
 */
export const isObjectResult = (
  data: unknown
): data is Record<string, unknown> => {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  return !Object.prototype.hasOwnProperty.call(data, 'result')
}
/**
 * 生成默认字段
 */
export const generateDefaultField = <T = unknown, E = unknown>(
  opts: Partial<DefaultField<T, E>> = {}
): DefaultField<T, E> => ({
  ...{
    result: [] as T, // 用户需要确保 T 是兼容的类型，例如 T extends unknown[]
    noMore: false,
    nothing: false,
    loading: false,
    error: null,
    extra: null as E,
    fetched: false,
    page: 0,
    total: 0
  },
  ...opts
})

/**
 * 根据参数生成 field 的 namespace
 */
export const generateFieldName = ({
  func,
  type,
  query = {}
}: GenerateFieldProps): string => {
  const funcName =
    typeof func === 'string'
      ? func
      : `api-${Math.random().toString(36).substring(2)}`
  const fetchType = type || 'auto'
  let result = `${funcName}-${fetchType}`
  const filteredKeys = Object.keys(query).filter(
    (key) =>
      !['undefined', 'object', 'function'].includes(typeof query[key]) &&
      ![
        'page',
        'is_up',
        'since_id',
        'seen_ids',
        '__refresh__',
        '__reload__'
      ].includes(key)
  )

  filteredKeys.sort().forEach((key) => {
    result += `-${key}-${query[key]}`
  })

  return result
}

/**
 * 根据 key 从 object 里拿 value
 */
export const getObjectDeepValue = (
  field: unknown,
  keys: string | string[] = ''
): unknown => {
  // 如果 keys 为空（包括 undefined、null、''、[]），返回 field
  if (!keys || (Array.isArray(keys) && keys.length === 0)) {
    return field
  }

  const keysArr = Array.isArray(keys) ? keys : keys.split('.')

  let result: unknown = field

  for (const key of keysArr) {
    if (result == null || typeof result !== 'object') {
      return undefined
    }
    result = (result as Record<string, unknown>)[key]
  }

  return result
}

/**
 * 安全地更新对象的深层值
 */
export const updateObjectDeepValue = (
  field: Record<string, unknown>,
  changeKey: string,
  value: unknown
): void => {
  if (!changeKey) return

  const keys = changeKey.split('.')
  const lastKey = keys.pop()!
  let current: unknown = field

  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      ;(current as Record<string, unknown>)[key] = {}
    }
    current = (current as Record<string, unknown>)[key]
  }

  if (current != null && typeof current === 'object') {
    ;(current as Record<string, unknown>)[lastKey] = value
  }
}

// --- 修正点 1: 移除 searchValueByKey 和 computeMatchedItemIndex 的泛型 ---
// 这些函数只处理特定结构的数据：数组或 { [id: string]: any[] }
type ResultArrayType = KeyMap[]
type ResultObjectType = Record<ObjectKey, KeyMap[]>

export const searchValueByKey = (
  result: ResultArrayType | ResultObjectType,
  id: ObjectKey,
  key: string
): unknown => {
  if (isArray(result)) {
    // result is ResultArrayType
    const index = computeMatchedItemIndex(id, result, key)
    return index >= 0 ? result[index] : undefined
  } else {
    return result[id]
  }
}

export const computeMatchedItemIndex = (
  itemId: ObjectKey,
  fieldArr: ResultArrayType,
  changingKey: string
): number => {
  const stringifiedItemId = String(itemId)

  const len = fieldArr?.length as unknown as number
  if (typeof len !== 'number' || len <= 0) return -1

  for (let i = 0; i < len; i++) {
    const item = fieldArr[i]
    if (typeof item !== 'object' || item === null) continue

    const itemValue = getObjectDeepValue(item, changingKey)
    if (String(itemValue) === stringifiedItemId) {
      return i
    }
  }

  return -1
}

export const combineArrayData = (
  fieldArray: ResultArrayType,
  value: ResultArrayType | Record<ObjectKey, KeyMap>,
  changingKey: string
): void => {
  if (isArray(value)) {
    for (const col of value) {
      if (typeof col !== 'object' || col === null) continue
      const stringifyId = String(getObjectDeepValue(col, changingKey))
      const index = fieldArray.findIndex(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          String(getObjectDeepValue(item, changingKey)) === stringifyId
      )
      if (index !== -1) {
        fieldArray[index] = { ...fieldArray[index], ...col }
      }
    }
  } else {
    for (const [uniqueId, col] of Object.entries(value)) {
      if (typeof col !== 'object' || col === null) continue
      const stringifyId = String(uniqueId)
      const index = fieldArray.findIndex(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          String(getObjectDeepValue(item, changingKey)) === stringifyId
      )
      if (index !== -1) {
        fieldArray[index] = { ...fieldArray[index], ...col }
      }
    }
  }
}

/**
 * 判断参数是否为数组
 */
export const isArray = (data: unknown): data is unknown[] => {
  return Array.isArray(data)
}

/**
 * 设置一个响应式的数据到对象上
 */
export const setReactivityField = <T, E>(
  field: DefaultField<T, E>,
  key: FieldKeys,
  value: unknown,
  type: FetchType,
  insertBefore: boolean
): void => {
  if (type === ENUM.FETCH_TYPE.PAGINATION) {
    ;(field as Record<FieldKeys, unknown>)[key] = value
    return
  }

  if (isArray(value)) {
    const current = (field as Record<FieldKeys, unknown>)[key]
    const currentArr = isArray(current) ? current : []
    const newValue = insertBefore
      ? value.concat(currentArr)
      : currentArr.concat(value)
    ;(field as Record<FieldKeys, unknown>)[key] = newValue
    return
  }

  if (key !== ENUM.FIELD_DATA.RESULT_KEY) {
    ;(field as Record<FieldKeys, unknown>)[key] = value
    return
  }

  // key is 'result'
  const resultField = field.result
  if (isArray(resultField)) {
    field.result = {} as T // reset to empty object
  }

  // Now field.result is an object
  const valueObj = value as Record<string, unknown>
  const target = field.result as Record<string, unknown>

  Object.keys(valueObj).forEach((subKey) => {
    const existing = target[subKey]
    const incoming = valueObj[subKey]

    if (existing !== undefined) {
      if (insertBefore) {
        target[subKey] =
          isArray(incoming) && isArray(existing)
            ? incoming.concat(existing)
            : incoming
      } else {
        target[subKey] =
          isArray(existing) && isArray(incoming)
            ? existing.concat(incoming)
            : incoming
      }
    } else {
      target[subKey] = incoming
    }
  })
}
/**
 * 计算一个数据列的长度
 */
export const computeResultLength = (data: unknown): number => {
  if (isArray(data)) {
    return data.length
  }
  if (data && typeof data === 'object') {
    return Object.values(data).reduce((acc, val) => {
      if (isArray(val)) {
        return acc + val.length
      }
      return acc
    }, 0)
  }
  return 0
}

// --- 修正点 3: 修正 generateRequestParams ---
export const generateRequestParams = ({
  field,
  uniqueKey,
  query = {},
  type
}: GenerateParamsType): GenerateParamsResp => {
  const result: GenerateParamsResp = {}
  const changing = uniqueKey || ENUM.DEFAULT_UNIQUE_KEY_NAME
  const isFetched = field.fetched

  // Helper to safely get an ObjectKey from an item
  const getSafeObjectKey = (item: unknown): ObjectKey | undefined => {
    if (typeof item !== 'object' || item === null) return undefined
    const val = getObjectDeepValue(item, changing)
    if (typeof val === 'string' || typeof val === 'number') {
      return val
    }
    return undefined
  }

  if (isFetched) {
    if (type === ENUM.FETCH_TYPE.AUTO) {
      if (isArray(field.result)) {
        result.seen_ids = field.result
          .map((item) => getSafeObjectKey(item))
          .filter((id): id is ObjectKey => id !== undefined)
          .join(',')
        const targetIndex = query.is_up ? 0 : field.result.length - 1
        const targetItem = field.result[targetIndex]
        result.since_id = getSafeObjectKey(targetItem)
      }
      result.is_up = query.is_up ? 1 : 0
      result.page = typeof query.page === 'number' ? query.page : field.page + 1
    } else if (type === ENUM.FETCH_TYPE.HAS_LOADED_IDS) {
      if (isArray(field.result)) {
        result.seen_ids = field.result
          .map((item) => getSafeObjectKey(item))
          .filter((id): id is ObjectKey => id !== undefined)
          .join(',')
      }
    } else if (type === ENUM.FETCH_TYPE.SINCE_FIRST_OR_END_ID) {
      if (isArray(field.result)) {
        const targetIndex = query.is_up ? 0 : field.result.length - 1
        const targetItem = field.result[targetIndex]
        result.since_id = getSafeObjectKey(targetItem)
      }
      result.is_up = query.is_up ? 1 : 0
    } else if (type === ENUM.FETCH_TYPE.PAGINATION) {
      result.page = typeof query.page === 'number' ? query.page : undefined
    } else if (type === ENUM.FETCH_TYPE.SCROLL_LOAD_MORE) {
      result.page = field.page + 1
    }
  } else {
    // ... handle initial fetch ...
    if (type === ENUM.FETCH_TYPE.AUTO) {
      result.seen_ids = ''
      result.since_id =
        typeof query.sinceId === 'string' || typeof query.sinceId === 'number'
          ? query.sinceId
          : query.is_up
            ? 999999999
            : 0
      result.is_up = query.is_up ? 1 : 0
      result.page =
        typeof query.page === 'number' ? query.page : field.page || 1
    } else if (type === ENUM.FETCH_TYPE.HAS_LOADED_IDS) {
      result.seen_ids = ''
    } else if (type === ENUM.FETCH_TYPE.SINCE_FIRST_OR_END_ID) {
      result.since_id =
        typeof query.sinceId === 'string' || typeof query.sinceId === 'number'
          ? query.sinceId
          : query.is_up
            ? 999999999
            : 0
      result.is_up = query.is_up ? 1 : 0
    } else if (type === ENUM.FETCH_TYPE.PAGINATION) {
      result.page = typeof query.page === 'number' ? query.page : field.page
    } else if (type === ENUM.FETCH_TYPE.SCROLL_LOAD_MORE) {
      result.page = 1
    }
  }

  return {
    ...query,
    ...result
  }
}
