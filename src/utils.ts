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
  RequestParams
} from './types'

// ========== 类型守卫函数 ==========

export const isArray = (data: unknown): data is any[] => Array.isArray(data)

/**
 * 检查是否为对象结果
 */
export const isResultObject = (data: unknown): data is Record<string, any> =>
  !isArray(data) && typeof data === 'object' && data !== null

/**
 * 检查是否为 ObjectKey
 */
export const isObjectKey = (value: unknown): value is ObjectKey =>
  typeof value === 'string' || typeof value === 'number'

/**
 * 检查是否为 KeyMap
 */
export const isKeyMap = (value: unknown): value is KeyMap =>
  typeof value === 'object' && value !== null && !isArray(value)

/**
 * 检查是否为 KeyMap 数组
 * 性能优化：使用 for 循环替代 every，提前退出
 */
export const isKeyMapArray = (value: unknown): value is KeyMap[] => {
  if (!isArray(value)) return false
  const len = value.length
  for (let i = 0; i < len; i++) {
    const item = value[i]
    if (typeof item !== 'object' || item === null) {
      return false
    }
  }
  return true
}

/**
 * 检查是否为 ObjectKey 数组
 * 性能优化：使用 for 循环替代 every，提前退出
 */
export const isObjectKeyArray = (value: unknown): value is ObjectKey[] => {
  if (!isArray(value)) return false
  const len = value.length
  for (let i = 0; i < len; i++) {
    const item = value[i]
    const itemType = typeof item
    if (itemType !== 'string' && itemType !== 'number') {
      return false
    }
  }
  return true
}

export const stableSerialize = (value: unknown): string => {
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
  item: KeyMap,
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
  // 这是一个比较特定的检查，检查是否 *没有* 'result' 属性且是对象
  // 原逻辑保留，但通常 API 响应应该包含 result
  return !Object.prototype.hasOwnProperty.call(data, 'result')
}

export const generateDefaultField = <T = any>(
  opts: Partial<DefaultField<T>> = {}
): DefaultField<T> => ({
  result: [] as unknown as T, // 默认为空数组，但强制转换为泛型 T
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

export const generateFieldName = <P extends RequestParams, R>({
  func,
  query
}: {
  func: ApiContract<P, R>
  query?: P
}): string => {
  // 快速路径：无 query
  if (!query) {
    return func.id
  }

  // 计算 fieldName
  let result = func.id
  const keys = Object.keys(query)
  const paramsIgnore = func.paramsIgnore
  const filteredKeys: string[] = []

  // 优化：减少闭包创建，直接过滤
  const keysLen = keys.length
  for (let i = 0; i < keysLen; i++) {
    const key = keys[i]
    if (!paramsIgnore.includes(key)) {
      filteredKeys.push(key)
    }
  }

  // 排序保证稳定性
  filteredKeys.sort()

  const len = filteredKeys.length
  for (let i = 0; i < len; i++) {
    const key = filteredKeys[i]
    const value = query[key]
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
  if (!keys || (Array.isArray(keys) && (keys as string[]).length === 0))
    return field

  const keysArr = Array.isArray(keys)
    ? (keys as string[])
    : (keys as string).split('.')
  let cur: any = field
  for (let i = 0, n = keysArr.length; i < n; ++i) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[keysArr[i]]
  }

  return cur
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
  result: any[] | Record<string, any>,
  id: ObjectKey,
  key: string
): unknown => {
  if (isArray(result)) {
    const index = computeMatchedItemIndex(id, result, key)
    return index >= 0 ? result[index] : undefined
  }
  if (isResultObject(result)) {
    return result[String(id)]
  }
  return undefined
}

/**
 * 查找匹配项的索引
 * 性能优化：
 * 1. 提前字符串化避免重复转换
 * 2. 优化简单 key 的访问路径（无需 split）
 * 3. 减少函数调用开销
 */
export const computeMatchedItemIndex = (
  itemId: ObjectKey,
  fieldArr: any[],
  changingKey: string
): number => {
  const stringifiedItemId = String(itemId)
  const len = fieldArr.length
  const isSimpleKey = !changingKey.includes('.')

  // 快速路径：简单 key（无需深度访问）
  if (isSimpleKey) {
    for (let i = 0; i < len; i++) {
      const item = fieldArr[i]
      if (!isKeyMap(item)) continue
      if (String(item[changingKey]) === stringifiedItemId) {
        return i
      }
    }
  } else {
    // 慢速路径：深度 key
    for (let i = 0; i < len; i++) {
      const item = fieldArr[i]
      if (!isKeyMap(item)) continue
      const itemValue = getObjectDeepValue(item, changingKey)
      if (String(itemValue) === stringifiedItemId) {
        return i
      }
    }
  }

  return -1
}

/**
 * 合并数组数据
 * 性能优化：
 * 1. 使用 Map 进行 O(1) 查找
 * 2. 创建新对象确保响应式
 * 3. 缓存 changingKey 的解析结果
 */
export const combineArrayData = (
  fieldArray: any[],
  value: any[] | Record<ObjectKey, KeyMap>,
  changingKey: string
): void => {
  const fieldArrayMap = new Map<string, number>()
  const arrLen = fieldArray.length

  // 构建索引 Map，复用 changingKey 解析
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
        const existingItem = fieldArray[index]
        if (isKeyMap(existingItem)) {
          // ✅ 创建新对象确保响应式
          fieldArray[index] = { ...existingItem, ...col }
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
          // ✅ 创建新对象确保响应式
          fieldArray[index] = { ...existingItem, ...col }
        }
      }
    }
  }
}

/**
 * 设置响应式字段
 * 性能优化：
 * 1. 快速路径优化常见场景
 * 2. 减少条件判断
 * 3. 使用原生方法 concat 而非展开运算符（在大数组时性能更好）
 */
export const setReactivityField = (
  field: DefaultField,
  key: FieldKeys,
  value: unknown,
  type: FetchType,
  insertBefore: boolean
): void => {
  const fieldAny = field as any

  // 快速路径：分页模式直接赋值
  if (type === ENUM.FETCH_TYPE.PAGINATION) {
    fieldAny[key] = value
    return
  }

  // 快速路径：非 result 字段
  if (key !== ENUM.FIELD_DATA.RESULT_KEY) {
    if (isArray(value)) {
      const current = fieldAny[key]
      const currentArr = isArray(current) ? current : []
      // 使用 concat 性能优于展开运算符
      fieldAny[key] = insertBefore
        ? (value as any[]).concat(currentArr)
        : currentArr.concat(value as any[])
    } else {
      fieldAny[key] = value
    }
    return
  }

  // 处理 result 字段 - 数组类型
  const resultField = field.result

  if (isArray(value)) {
    const valueArr = value as KeyMap[]
    const valueLen = valueArr.length

    // 快速路径：空数组直接返回
    if (valueLen === 0) return

    const currentArr = isArray(resultField) ? resultField : []
    const currentLen = currentArr.length

    // 快速路径：当前为空，直接赋值
    if (currentLen === 0) {
      field.result = valueArr as any
      return
    }

    // 使用 concat 合并数组（比展开运算符快）
    field.result = (
      insertBefore ? valueArr.concat(currentArr) : currentArr.concat(valueArr)
    ) as any
    return
  }

  // 处理 result 字段 - 对象类型
  const valueObj = value as KeyMap
  let target = resultField as Record<string, any>

  if (
    isArray(resultField) ||
    typeof resultField !== 'object' ||
    resultField === null
  ) {
    target = {}
    field.result = target as any
  }

  const keys = Object.keys(valueObj)
  const len = keys.length

  for (let i = 0; i < len; i++) {
    const subKey = keys[i]
    const existing = target[subKey]
    const incoming = valueObj[subKey]

    if (existing !== undefined) {
      // 两个都是数组才合并，否则覆盖
      if (isArray(existing) && isArray(incoming)) {
        target[subKey] = insertBefore
          ? incoming.concat(existing)
          : existing.concat(incoming)
      } else {
        target[subKey] = incoming
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

const getSeenIdsString = (arr: any[], uniqueKey: string): string => {
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
  is_up = false,
  type
}: GenerateParamsType): GenerateParamsResp => {
  const result: GenerateParamsResp = { ...query }
  const isFetched = field.fetched
  const fieldResultAny = field.result as any // 内部逻辑断言

  const getSafeObjectKey = (item: unknown): ObjectKey | undefined => {
    return extractUniqueKey(item as KeyMap, uniqueKey)
  }

  if (isFetched) {
    if (type === ENUM.FETCH_TYPE.AUTO) {
      if (isArray(fieldResultAny)) {
        result.seen_ids = getSeenIdsString(fieldResultAny, uniqueKey)
        const targetIndex = is_up ? 0 : fieldResultAny.length - 1
        const targetItem = fieldResultAny[targetIndex]
        result.since_id = getSafeObjectKey(targetItem)
      }
      result.is_up = is_up ? 1 : 0
      result.page = typeof query.page === 'number' ? query.page : field.page + 1
    } else if (type === ENUM.FETCH_TYPE.HAS_LOADED_IDS) {
      if (isArray(fieldResultAny)) {
        result.seen_ids = getSeenIdsString(fieldResultAny, uniqueKey)
      }
    } else if (type === ENUM.FETCH_TYPE.SINCE_FIRST_OR_END_ID) {
      if (isArray(fieldResultAny)) {
        const targetIndex = is_up ? 0 : fieldResultAny.length - 1
        const targetItem = fieldResultAny[targetIndex]
        result.since_id = getSafeObjectKey(targetItem)
      }
      result.is_up = is_up ? 1 : 0
    } else if (type === ENUM.FETCH_TYPE.PAGINATION) {
      result.page = typeof query.page === 'number' ? query.page : undefined
    } else if (type === ENUM.FETCH_TYPE.SCROLL_LOAD_MORE) {
      result.page = field.page + 1
    }
  } else {
    if (type === ENUM.FETCH_TYPE.AUTO) {
      result.seen_ids = ''
      result.since_id = isObjectKey(query.sinceId) ? query.sinceId : ''
      result.is_up = is_up ? 1 : 0
      result.page =
        typeof query.page === 'number' ? query.page : field.page || 1
    } else if (type === ENUM.FETCH_TYPE.HAS_LOADED_IDS) {
      result.seen_ids = ''
    } else if (type === ENUM.FETCH_TYPE.SINCE_FIRST_OR_END_ID) {
      result.since_id = isObjectKey(query.sinceId) ? query.sinceId : ''
      result.is_up = is_up ? 1 : 0
    } else if (type === ENUM.FETCH_TYPE.PAGINATION) {
      result.page = typeof query.page === 'number' ? query.page : field.page
    } else if (type === ENUM.FETCH_TYPE.SCROLL_LOAD_MORE) {
      result.page = 1
    }
  }

  return result
}

export const toObjectKey = (
  id: ObjectKey | ObjectKey[] | undefined
): ObjectKey | undefined => {
  if (id === undefined) return undefined
  if (isObjectKey(id)) return id
  if (isObjectKeyArray(id) && id.length > 0) return id[0]
  return undefined
}

export const getResultAsArray = (field: DefaultField): any[] | null => {
  const result = field[ENUM.FIELD_DATA.RESULT_KEY]
  return isArray(result) ? result : null
}

export const updateArrayItem = (
  arr: any[],
  index: number,
  updater: (item: KeyMap) => KeyMap
): void => {
  if (index >= 0 && index < arr.length) {
    const item = arr[index]
    if (isKeyMap(item)) {
      arr[index] = updater(item)
    }
  }
}
