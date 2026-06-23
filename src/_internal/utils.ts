// _internal/utils.ts
import ENUM from '../constants'
import type {
  DefaultField,
  FetchType,
  FieldKeys,
  GenerateParamsResp,
  GenerateParamsType,
  KeyMap,
  ObjectKey
} from '../types'

// ========== 类型守卫 ==========

export const isArray = (data: unknown): data is any[] => Array.isArray(data)

export const isObjectKey = (value: unknown): value is ObjectKey =>
  typeof value === 'string' || typeof value === 'number'

export const isKeyMap = (value: unknown): value is KeyMap =>
  typeof value === 'object' && value !== null && !isArray(value)

export const isKeyMapArray = (value: unknown): value is KeyMap[] =>
  isArray(value) &&
  value.every((item) => typeof item === 'object' && item !== null)

export const isObjectKeyArray = (value: unknown): value is ObjectKey[] =>
  isArray(value) &&
  value.every((item) => typeof item === 'string' || typeof item === 'number')

// ========== 序列化 ==========

export const stableSerialize = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return String(value)
  try {
    if (isArray(value)) return JSON.stringify(value)
    return JSON.stringify(
      Object.fromEntries(
        Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
          a.localeCompare(b)
        )
      )
    )
  } catch {
    return '[Circular]'
  }
}

// ========== 深度访问 ==========

export const getObjectDeepValue = (
  field: unknown,
  keys: string | string[]
): unknown => {
  if (!keys || (isArray(keys) && keys.length === 0)) return field
  const keysArr = isArray(keys) ? keys : (keys as string).split('.')
  let cur: any = field
  for (let i = 0; i < keysArr.length; i++) {
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
  const keys = changeKey.split('.')
  const lastKey = keys.pop()
  if (!lastKey) return

  let current: KeyMap = field
  for (const key of keys) {
    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = {}
    }
    if (!isKeyMap(current[key])) return
    current = current[key] as KeyMap
  }
  current[lastKey] = value
}

// ========== uniqueKey 提取 ==========

const extractUniqueKey = (
  item: KeyMap,
  uniqueKey: string
): ObjectKey | undefined => {
  if (!isKeyMap(item)) return undefined
  const val = item[uniqueKey]
  if (isObjectKey(val)) return val
  if (uniqueKey.includes('.')) {
    const deepVal = getObjectDeepValue(item, uniqueKey)
    if (isObjectKey(deepVal)) return deepVal
  }
  return undefined
}

// ========== 核心工具 ==========

export const generateDefaultField = <T = any>(
  opts: Partial<DefaultField<T>> = {}
): DefaultField<T> => ({
  result: [] as unknown as T,
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

export const computeMatchedItemIndex = (
  itemId: ObjectKey,
  fieldArr: any[],
  changingKey: string
): number => {
  const stringId = String(itemId)
  for (let i = 0; i < fieldArr.length; i++) {
    const item = fieldArr[i]
    if (!isKeyMap(item)) continue
    const val = getObjectDeepValue(item, changingKey)
    if (String(val) === stringId) return i
  }
  return -1
}

export const computeResultLength = (data: unknown): number => {
  if (isArray(data)) return data.length
  return 0
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
  if (index >= 0 && index < arr.length && isKeyMap(arr[index])) {
    arr[index] = updater(arr[index])
  }
}

// ========== 搜索 ==========

export const searchValueByKey = (
  result: any[] | Record<string, any>,
  id: ObjectKey,
  key: string
): unknown => {
  if (isArray(result)) {
    const index = computeMatchedItemIndex(id, result, key)
    return index >= 0 ? result[index] : undefined
  }
  if (isKeyMap(result)) return result[String(id)]
  return undefined
}

// ========== 批量合并 ==========

export const combineArrayData = (
  fieldArray: any[],
  value: any[] | Record<ObjectKey, KeyMap>,
  changingKey: string
): void => {
  const indexMap = new Map<string, number>()
  for (let i = 0; i < fieldArray.length; i++) {
    const item = fieldArray[i]
    if (!isKeyMap(item)) continue
    const id = getObjectDeepValue(item, changingKey)
    if (id !== undefined) indexMap.set(String(id), i)
  }

  const mergeItem = (uniqueId: string, col: KeyMap) => {
    const index = indexMap.get(uniqueId)
    if (index !== undefined && isKeyMap(fieldArray[index])) {
      fieldArray[index] = { ...fieldArray[index], ...col }
    }
  }

  if (isArray(value)) {
    for (const col of value) {
      if (!isKeyMap(col)) continue
      mergeItem(String(getObjectDeepValue(col, changingKey)), col)
    }
  } else if (isKeyMap(value)) {
    for (const [uniqueId, col] of Object.entries(value)) {
      if (isKeyMap(col)) mergeItem(uniqueId, col)
    }
  }
}

// ========== 响应式字段设置 ==========

/**
 * 把 incoming 追加合并进 current（SCROLL/sinceId 增量路径），按 uniqueKey 去重：
 *  - current 中已存在的 key → 用 incoming 同 key 项覆盖合并字段，**保持原位置**；
 *  - current 中不存在的 key → 按 insertBefore 决定前插 / 尾插。
 * 顺序稳定：先产出（保留 current 顺序、就地更新）已存在项，再产出新增项。
 *
 * 背景：sinceId / scroll 增量加载时，服务端因 since 边界（createdAt >= since）或
 * reconnect 重叠会把「列表里已有的项」再次返回。旧实现纯 concat 会产生重复行
 * （典型：聊天连发后 silent refresh 把最新一条又带回，列表出现两份）。
 */
const mergeAppendDedup = (
  current: any[],
  incoming: any[],
  uniqueKey: string,
  insertBefore: boolean
): any[] => {
  // 不可去重的项（非对象 / 无有效 uniqueKey）原样保留，按 concat 语义处理。
  const indexByKey = new Map<ObjectKey, number>()
  for (let i = 0; i < current.length; i++) {
    const item = current[i]
    if (!isKeyMap(item)) continue
    const key = extractUniqueKey(item, uniqueKey)
    if (key !== undefined) indexByKey.set(key, i)
  }

  const merged = [...current]
  const appended: any[] = []
  for (const item of incoming) {
    const key = isKeyMap(item) ? extractUniqueKey(item, uniqueKey) : undefined
    if (key !== undefined && indexByKey.has(key)) {
      const idx = indexByKey.get(key)!
      // 同 key：incoming 覆盖 existing（合并字段），保持原位置，不新增行
      merged[idx] = isKeyMap(merged[idx]) ? { ...merged[idx], ...item } : item
    } else {
      appended.push(item)
    }
  }

  return insertBefore ? [...appended, ...merged] : [...merged, ...appended]
}

export const setReactivityField = (
  field: DefaultField,
  key: FieldKeys,
  value: unknown,
  type: FetchType,
  insertBefore: boolean,
  uniqueKey: string = ENUM.DEFAULT_UNIQUE_KEY_NAME
): void => {
  const fieldAny = field as any

  // 分页模式直接赋值
  if (type === ENUM.FETCH_TYPE.PAGINATION) {
    fieldAny[key] = value
    return
  }

  // 非 result 字段
  if (key !== ENUM.FIELD_DATA.RESULT_KEY) {
    if (isArray(value)) {
      const current = isArray(fieldAny[key]) ? fieldAny[key] : []
      fieldAny[key] = insertBefore
        ? [...(value as any[]), ...current]
        : [...current, ...(value as any[])]
    } else {
      fieldAny[key] = value
    }
    return
  }

  // result 字段 — 数组
  if (isArray(value)) {
    if ((value as any[]).length === 0) return
    const current = isArray(field.result) ? (field.result as any[]) : []
    if (current.length === 0) {
      field.result = value as any
      return
    }
    // 按 uniqueKey 去重追加：避免 since 边界 / reconnect 重叠把已有项重复 append
    field.result = mergeAppendDedup(
      current,
      value as any[],
      uniqueKey,
      insertBefore
    ) as any
    return
  }

  // result 字段 — 对象（按 key 分组场景）
  const valueObj = value as KeyMap
  let target = field.result as Record<string, any>
  if (
    isArray(field.result) ||
    typeof field.result !== 'object' ||
    field.result === null
  ) {
    target = {}
    field.result = target as any
  }

  for (const subKey of Object.keys(valueObj)) {
    const existing = target[subKey]
    const incoming = valueObj[subKey]
    if (existing !== undefined && isArray(existing) && isArray(incoming)) {
      target[subKey] = insertBefore
        ? [...incoming, ...existing]
        : [...existing, ...incoming]
    } else {
      target[subKey] = incoming
    }
  }
}

// ========== 请求参数生成 ==========

const getSeenIdsString = (arr: any[], uniqueKey: string): string => {
  if (!isArray(arr)) return ''
  const ids: ObjectKey[] = []
  for (const item of arr) {
    const id = extractUniqueKey(item, uniqueKey)
    if (id !== undefined) ids.push(id)
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
  const fieldResult = field.result as any

  const getSafeObjectKey = (item: unknown): ObjectKey | undefined =>
    extractUniqueKey(item as KeyMap, uniqueKey)

  if (isFetched) {
    switch (type) {
      case ENUM.FETCH_TYPE.AUTO:
        if (isArray(fieldResult)) {
          result.seen_ids = getSeenIdsString(fieldResult, uniqueKey)
          result.since_id = getSafeObjectKey(
            fieldResult[is_up ? 0 : fieldResult.length - 1]
          )
        }
        result.is_up = is_up ? 1 : 0
        result.page =
          typeof query.page === 'number' ? query.page : field.page + 1
        break
      case ENUM.FETCH_TYPE.HAS_LOADED_IDS:
        if (isArray(fieldResult)) {
          result.seen_ids = getSeenIdsString(fieldResult, uniqueKey)
        }
        break
      case ENUM.FETCH_TYPE.SINCE_FIRST_OR_END_ID:
        if (isArray(fieldResult)) {
          result.since_id = getSafeObjectKey(
            fieldResult[is_up ? 0 : fieldResult.length - 1]
          )
        }
        result.is_up = is_up ? 1 : 0
        break
      case ENUM.FETCH_TYPE.PAGINATION:
        result.page = typeof query.page === 'number' ? query.page : undefined
        break
      case ENUM.FETCH_TYPE.SCROLL_LOAD_MORE:
        result.page = field.page + 1
        break
    }
  } else {
    switch (type) {
      case ENUM.FETCH_TYPE.AUTO:
        result.seen_ids = ''
        result.since_id = isObjectKey(query.sinceId) ? query.sinceId : ''
        result.is_up = is_up ? 1 : 0
        result.page =
          typeof query.page === 'number' ? query.page : field.page || 1
        break
      case ENUM.FETCH_TYPE.HAS_LOADED_IDS:
        result.seen_ids = ''
        break
      case ENUM.FETCH_TYPE.SINCE_FIRST_OR_END_ID:
        result.since_id = isObjectKey(query.sinceId) ? query.sinceId : ''
        result.is_up = is_up ? 1 : 0
        break
      case ENUM.FETCH_TYPE.PAGINATION:
        result.page = typeof query.page === 'number' ? query.page : field.page
        break
      case ENUM.FETCH_TYPE.SCROLL_LOAD_MORE:
        result.page = 1
        break
    }
  }

  return result
}
