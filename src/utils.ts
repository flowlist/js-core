// utils.ts
import ENUM from './enum'
import type {
  ObjectKey,
  KeyMap,
  DefaultField,
  FetchType,
  FieldKeys,
  InitDataParams,
  GenerateParamsType,
  GenerateParamsResp
} from './types'

export const isArray = (data: unknown): data is unknown[] => {
  return Array.isArray(data)
}

const stableSerialize = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return String(value)
  }
  try {
    if (Array.isArray(value)) {
      return JSON.stringify(value)
    }
    const keys = Object.keys(value as Record<string, unknown>).sort()
    const obj: Record<string, unknown> = {}
    for (const k of keys) {
      obj[k] = (value as Record<string, unknown>)[k]
    }
    return JSON.stringify(obj)
  } catch {
    return '[Circular Object/Value]'
  }
}

const extractUniqueKey = (item: unknown, uniqueKey?: string): ObjectKey | undefined => {
  if (typeof item !== 'object' || item === null) return undefined
  const changing = uniqueKey || ENUM.DEFAULT_UNIQUE_KEY_NAME
  const val = (item as Record<string, unknown>)[changing] ?? undefined
  if (typeof val === 'string' || typeof val === 'number') {
    return val
  }
  if (typeof changing === 'string' && changing.includes('.')) {
    const deepVal = getObjectDeepValue(item, changing)
    if (typeof deepVal === 'string' || typeof deepVal === 'number') {
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
  ...{
    result: [],
    noMore: false,
    nothing: false,
    loading: false,
    error: null,
    extra: null,
    fetched: false,
    page: 0,
    total: 0
  },
  ...opts
})

export const generateFieldName = ({
  func,
  type,
  query = {}
}: InitDataParams): string => {
  const funcName =
    typeof func === 'string'
      ? func
      : (typeof func === 'function' ? func.name : undefined) ||
        `api-${Math.random().toString(36).substring(2, 8)}`
  const fetchType = type || 'auto'
  let result = `${funcName}-${fetchType}`
  
  const filteredKeys = Object.keys(query).filter(
    (key) =>
      (query as Record<string, unknown>)[key] !== undefined &&
      typeof (query as Record<string, unknown>)[key] !== 'function' &&
      ![
        'page',
        'is_up',
        'since_id',
        'seen_ids',
        '__refresh__',
        '__reload__'
      ].includes(key)
  )

  filteredKeys.sort()

  const querySuffix = filteredKeys.map((key) => {
    const value = (query as Record<string, unknown>)[key]
    let safeValue: string
    
    if (typeof value === 'object' && value !== null) {
        safeValue = stableSerialize(value)
    } else {
        safeValue = String(value)
    }

    const encoded = encodeURIComponent(safeValue)

    return `-${key}-${encoded}`
  }).join('')

  result += querySuffix
  return result
}

export const getObjectDeepValue = (
  field: unknown,
  keys: string | string[] = ''
): unknown => {
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

export const updateObjectDeepValue = (
  field: Record<string, unknown>,
  changeKey: string,
  value: unknown
): void => {
  if (!changeKey) return

  const keys = changeKey.split('.')
  const lastKey = keys.pop()!
  let current: Record<string, unknown> = field

  for (const key of keys) {
    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  if (current != null && typeof current === 'object') {
    current[lastKey] = value
  }
}

type ResultArrayType = KeyMap[]
type ResultObjectType = Record<ObjectKey, KeyMap[]>

export const searchValueByKey = (
  result: ResultArrayType | ResultObjectType,
  id: ObjectKey,
  key: string
): unknown => {
  if (isArray(result)) {
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

  const len = fieldArr?.length
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
  const fieldArrayMap = new Map<string, number>()
  for (let i = 0; i < fieldArray.length; i++) {
    const item = fieldArray[i]
    if (typeof item !== 'object' || item === null) continue
    const id = getObjectDeepValue(item, changingKey)
    if (id !== undefined) {
      fieldArrayMap.set(String(id), i)
    }
  }

  if (isArray(value)) {
    for (const col of value) {
      if (typeof col !== 'object' || col === null) continue
      const stringifyId = String(getObjectDeepValue(col, changingKey))
      
      const index = fieldArrayMap.get(stringifyId)
      
      if (index !== undefined && index !== -1) {
        fieldArray[index] = { ...fieldArray[index], ...col }
      }
    }
  } else {
    for (const [uniqueId, col] of Object.entries(value)) {
      if (typeof col !== 'object' || col === null) continue
      const stringifyId = String(uniqueId)
      
      const index = fieldArrayMap.get(stringifyId)
      
      if (index !== undefined && index !== -1) {
        fieldArray[index] = { ...fieldArray[index], ...col }
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
  const valueObj = value as Record<string, unknown>

  if (isArray(value)) {
    const currentArr = isArray(resultField) ? resultField : []
    const newValue = insertBefore
      ? [...value, ...currentArr]
      : [...currentArr, ...value]
    field.result = newValue as ResultArrayType
    return
  }
  
  let target = resultField as Record<string, unknown>
  if (isArray(resultField)) {
    target = {}
    field.result = target as ResultObjectType
  } else if (typeof resultField !== 'object' || resultField === null) {
      target = {}
      field.result = target as ResultObjectType
  }
  
  Object.keys(valueObj).forEach((subKey) => {
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
  })
}

export const computeResultLength = (data: unknown): number => {
  if (isArray(data)) {
    return data.length
  }
  if (data && typeof data === 'object') {
    let acc = 0
    for (const val of Object.values(data)) {
      if (isArray(val)) {
        acc += val.length
      }
    }
    return acc
  }
  return 0
}

const getSeenIdsString = (arr: unknown[], uniqueKey?: string): string => {
  if (!isArray(arr)) return ''
  const ids: ObjectKey[] = []

  for (const item of arr) {
    const id = extractUniqueKey(item, uniqueKey)
    if (id !== undefined) {
      ids.push(id)
    }
  }
  return ids.join(',')
}

export const generateRequestParams = ({
  field,
  uniqueKey,
  query = {},
  type
}: GenerateParamsType): GenerateParamsResp => {
  const result: GenerateParamsResp = {}
  const isFetched = field.fetched
  
  const getSafeObjectKey = (item: unknown): ObjectKey | undefined => {
    return extractUniqueKey(item, uniqueKey)
  }


  if (isFetched) {
    if (type === ENUM.FETCH_TYPE.AUTO) {
      if (isArray(field.result)) {
        result.seen_ids = getSeenIdsString(field.result, uniqueKey)
        
        const targetIndex = query.is_up ? 0 : field.result.length - 1
        const targetItem = field.result[targetIndex]
        result.since_id = getSafeObjectKey(targetItem)
      }
      result.is_up = query.is_up ? 1 : 0
      result.page = typeof query.page === 'number' ? query.page : field.page + 1
    } else if (type === ENUM.FETCH_TYPE.HAS_LOADED_IDS) {
      if (isArray(field.result)) {
        result.seen_ids = getSeenIdsString(field.result, uniqueKey)
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
