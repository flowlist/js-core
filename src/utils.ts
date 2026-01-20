// utils.ts
import ENUM from './enum'

import type {
  ApiContract,
  DefaultField,
  FetchType,
  FieldKeys,
  GenerateParamsResp,
  GenerateParamsType,
  KeyMap,
  ObjectKey,
  RequestParams,
  ResultArrayType,
  ResultObjectType,
  ResultType
} from './types'

// ========== 类型守卫函数 ==========

export const isArray = (data: unknown): data is unknown[] => Array.isArray(data)

/**
 * 检查是否为数组
 */
export const isResultArray = (data: ResultType): data is ResultArrayType =>
  Array.isArray(data)

/**
 * 检查是否为对象结果
 */
export const isResultObject = (data: ResultType): data is ResultObjectType =>
  !Array.isArray(data) && typeof data === 'object' && data !== null

/**
 * 检查是否为 ObjectKey
 */
export const isObjectKey = (value: unknown): value is ObjectKey =>
  typeof value === 'string' || typeof value === 'number'

/**
 * 检查是否为 KeyMap
 */
export const isKeyMap = (value: unknown): value is KeyMap =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * 检查是否为 KeyMap 数组
 */
export const isKeyMapArray = (value: unknown): value is KeyMap[] =>
  Array.isArray(value) &&
  value.every((item) => typeof item === 'object' && item !== null)

/**
 * 检查是否为 ObjectKey 数组
 */
export const isObjectKeyArray = (value: unknown): value is ObjectKey[] =>
  Array.isArray(value) &&
  value.every((item) => typeof item === 'string' || typeof item === 'number')

const stableSerialize = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return String(value)
  }
  try {
    if (isArray(value)) {
      return JSON.stringify(value)
    }
    if (isKeyMap(value)) {
      const keys = Object.keys(value).sort()
      const obj: Record<string, unknown> = {}
      const len = keys.length
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        obj[k] = value[k]
      }
      return JSON.stringify(obj)
    }
    return '[Unsupported Object]'
  } catch {
    return '[Circular Object/Value]'
  }
}

const extractUniqueKey = (
  item: unknown,
  uniqueKey: string
): ObjectKey | undefined => {
  if (!isKeyMap(item)) return undefined

  const val = item[uniqueKey]
  if (isObjectKey(val)) {
    return val
  }

  if (uniqueKey.includes('.')) {
    const deepVal = getObjectDeepValue(item, uniqueKey)
    if (isObjectKey(deepVal)) {
      return deepVal
    }
  }
  return undefined
}

export const isObjectResult = (
  data: unknown
): data is Record<string, unknown> => {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  return !Object.prototype.hasOwnProperty.call(data, 'result')
}

export const generateDefaultField = (
  opts: Partial<DefaultField> = {}
): DefaultField => ({
  result: [],
  noMore: false,
  nothing: false,
  loading: false,
  error: null,
  extra: null,
  fetched: false,
  page: 0,
  total: 0,
  ...opts
})

export const generateFieldName = <P = RequestParams, R = ResultType>({
  func,
  query
}: {
  func: ApiContract<P, R>
  query?: P
}): string => {
  let result = func.id
  // 当 query 为 undefined 时，直接返回 func.id
  if (!query) {
    return result
  }
  const queryObj = query as Record<string, unknown>
  const filteredKeys = Object.keys(queryObj)
    .filter((key) => !func.paramsIgnore.includes(key))
    .sort()

  const len = filteredKeys.length
  for (let i = 0; i < len; i++) {
    const key = filteredKeys[i]
    const value = queryObj[key]
    let safeValue: string

    if (typeof value === 'object' && value !== null) {
      safeValue = stableSerialize(value)
    } else {
      safeValue = String(value)
    }

    const encoded = encodeURIComponent(safeValue)
    result += `-${key}-${encoded}`
  }

  return result
}

export const getObjectDeepValue = (
  field: unknown,
  keys: string | string[]
): unknown => {
  if (!keys || (isArray(keys) && keys.length === 0)) {
    return field
  }

  const keysArr = isArray(keys) ? keys : keys.split('.')
  let result: unknown = field
  const len = keysArr.length

  for (let i = 0; i < len; i++) {
    if (result == null || typeof result !== 'object') {
      return undefined
    }
    if (isKeyMap(result)) {
      result = result[keysArr[i]]
    } else {
      return undefined
    }
  }

  return result
}

export const updateObjectDeepValue = (
  field: KeyMap,
  changeKey: string,
  value: unknown
): void => {
  if (!changeKey) return

  const keys = changeKey.split('.')
  const lastKey = keys.pop()
  if (!lastKey) return

  let current: KeyMap = field
  const len = keys.length

  for (let i = 0; i < len; i++) {
    const key = keys[i]
    const currentVal = current[key]
    if (currentVal == null || typeof currentVal !== 'object') {
      current[key] = {}
    }
    const next = current[key]
    if (isKeyMap(next)) {
      current = next
    } else {
      return
    }
  }

  if (current != null && typeof current === 'object') {
    current[lastKey] = value
  }
}

export const searchValueByKey = (
  result: ResultArrayType | ResultObjectType,
  id: ObjectKey,
  key: string
): unknown => {
  if (isResultArray(result)) {
    const index = computeMatchedItemIndex(id, result, key)
    return index >= 0 ? result[index] : undefined
  }
  if (isResultObject(result)) {
    return result[String(id)]
  }
  return undefined
}

export const computeMatchedItemIndex = (
  itemId: ObjectKey,
  fieldArr: ResultArrayType,
  changingKey: string
): number => {
  const stringifiedItemId = String(itemId)
  const len = fieldArr.length

  for (let i = 0; i < len; i++) {
    const item = fieldArr[i]
    if (!isKeyMap(item)) continue

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
  // 优化：使用 Map 缓存索引，避免重复查找
  const fieldArrayMap = new Map<string, number>()
  const arrLen = fieldArray.length

  // 第一遍遍历：建立 id -> index 映射
  for (let i = 0; i < arrLen; i++) {
    const item = fieldArray[i]
    if (!isKeyMap(item)) continue
    const id = getObjectDeepValue(item, changingKey)
    if (id !== undefined) {
      fieldArrayMap.set(String(id), i)
    }
  }

  if (isArray(value)) {
    const valLen = value.length
    for (let i = 0; i < valLen; i++) {
      const col = value[i]
      if (!isKeyMap(col)) continue
      const stringifyId = String(getObjectDeepValue(col, changingKey))

      const index = fieldArrayMap.get(stringifyId)

      if (index !== undefined) {
        // 优化：直接修改属性，而非创建新对象（性能提升）
        const existingItem = fieldArray[index]
        if (isKeyMap(existingItem)) {
          // 使用 Object.assign 比展开运算符性能更好
          Object.assign(existingItem, col)
        }
      }
    }
  } else if (isKeyMap(value)) {
    const entries = Object.entries(value)
    const entLen = entries.length
    for (let i = 0; i < entLen; i++) {
      const [uniqueId, col] = entries[i]
      if (!isKeyMap(col)) continue

      const index = fieldArrayMap.get(uniqueId)

      if (index !== undefined) {
        const existingItem = fieldArray[index]
        if (isKeyMap(existingItem)) {
          Object.assign(existingItem, col)
        }
      }
    }
  }
}

export const setReactivityField = (
  field: DefaultField,
  key: FieldKeys,
  value: unknown,
  type: FetchType,
  insertBefore: boolean
): void => {
  if (type === ENUM.FETCH_TYPE.PAGINATION) {
    ;(field as Record<FieldKeys, unknown>)[key] = value
    return
  }

  if (key !== ENUM.FIELD_DATA.RESULT_KEY) {
    if (isArray(value)) {
      const current = (field as Record<FieldKeys, unknown>)[key]
      const currentArr = isArray(current) ? current : []
      const newValue = insertBefore
        ? [...value, ...currentArr]
        : [...currentArr, ...value]
      ;(field as Record<FieldKeys, unknown>)[key] = newValue
    } else {
      ;(field as Record<FieldKeys, unknown>)[key] = value
    }
    return
  }

  const resultField = field.result
  const valueObj = value as KeyMap

  if (isArray(value)) {
    const currentArr = isArray(resultField) ? resultField : []

    // 优化：对于聊天消息场景，使用更高效的数组合并方式
    if (insertBefore) {
      // 历史消息加载：新消息在前
      if (value.length === 0) {
        return // 空数组，无需操作
      }
      if (currentArr.length === 0) {
        field.result = value as ResultArrayType
        return
      }
      // 使用 concat 而非展开运算符，性能更好
      field.result = (value as KeyMap[]).concat(currentArr) as ResultArrayType
    } else {
      // 新消息追加：新消息在后
      if (value.length === 0) {
        return
      }
      if (currentArr.length === 0) {
        field.result = value as ResultArrayType
        return
      }
      field.result = currentArr.concat(value as KeyMap[]) as ResultArrayType
    }
    return
  }

  let target = resultField as KeyMap
  if (isArray(resultField)) {
    target = {}
    field.result = target as ResultObjectType
  } else if (typeof resultField !== 'object' || resultField === null) {
    target = {}
    field.result = target as ResultObjectType
  }

  const keys = Object.keys(valueObj)
  const len = keys.length
  for (let i = 0; i < len; i++) {
    const subKey = keys[i]
    const existing = target[subKey]
    const incoming = valueObj[subKey]

    if (existing !== undefined) {
      if (insertBefore) {
        target[subKey] =
          isArray(incoming) && isArray(existing)
            ? [...incoming, ...existing]
            : incoming
      } else {
        target[subKey] =
          isArray(existing) && isArray(incoming)
            ? [...existing, ...incoming]
            : incoming
      }
    } else {
      target[subKey] = incoming
    }
  }
}

export const computeResultLength = (data: unknown): number => {
  if (isArray(data)) {
    return data.length
  }
  if (isKeyMap(data)) {
    let acc = 0
    const values = Object.values(data)
    const len = values.length
    for (let i = 0; i < len; i++) {
      const val = values[i]
      if (isArray(val)) {
        acc += val.length
      }
    }
    return acc
  }
  return 0
}

const getSeenIdsString = (arr: unknown[], uniqueKey: string): string => {
  if (!isArray(arr)) return ''
  const ids: ObjectKey[] = []
  const len = arr.length

  for (let i = 0; i < len; i++) {
    const id = extractUniqueKey(arr[i], uniqueKey)
    if (id !== undefined) {
      ids.push(id)
    }
  }
  return ids.join(',')
}

export const generateRequestParams = ({
  field,
  uniqueKey = ENUM.DEFAULT_UNIQUE_KEY_NAME,
  query = {},
  type
}: GenerateParamsType): GenerateParamsResp => {
  const result: GenerateParamsResp = { ...query }
  const isFetched = field.fetched

  const getSafeObjectKey = (item: unknown): ObjectKey | undefined => {
    return extractUniqueKey(item, uniqueKey)
  }

  if (isFetched) {
    if (type === ENUM.FETCH_TYPE.AUTO) {
      if (isResultArray(field.result)) {
        result.seen_ids = getSeenIdsString(field.result, uniqueKey)

        const targetIndex = query.is_up ? 0 : field.result.length - 1
        const targetItem = field.result[targetIndex]
        result.since_id = getSafeObjectKey(targetItem)
      }
      result.is_up = query.is_up ? 1 : 0
      result.page = typeof query.page === 'number' ? query.page : field.page + 1
    } else if (type === ENUM.FETCH_TYPE.HAS_LOADED_IDS) {
      if (isResultArray(field.result)) {
        result.seen_ids = getSeenIdsString(field.result, uniqueKey)
      }
    } else if (type === ENUM.FETCH_TYPE.SINCE_FIRST_OR_END_ID) {
      if (isResultArray(field.result)) {
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
    if (type === ENUM.FETCH_TYPE.AUTO) {
      result.seen_ids = ''
      result.since_id = isObjectKey(query.sinceId)
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
      result.since_id = isObjectKey(query.sinceId)
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

  return result
}
