// mutations/extended.ts — 5 种扩展 mutation handler
import {
  combineArrayData,
  computeMatchedItemIndex,
  getObjectDeepValue,
  isArray,
  isKeyMap,
  isKeyMapArray,
  searchValueByKey,
  toObjectKey,
  updateArrayItem,
  updateObjectDeepValue
} from '../_internal/utils'
import ENUM from '../constants'
import type { KeyMap, MutationHandler, ObjectKey } from '../types'

// --- search: 按 ID 查找 item ---
export const searchHandler: MutationHandler = (ctx) => {
  const objectKeyId = toObjectKey(ctx._id)
  if (objectKeyId === undefined) return
  const searchResult = ctx.resultArray
    ? searchValueByKey(ctx.resultArray, objectKeyId, ctx._uniqueKey)
    : undefined
  return { resolved: searchResult }
}

// --- update: 深层 KV 更新 ---
export const updateKVHandler: MutationHandler = (ctx) => {
  const objectKeyId = toObjectKey(ctx._id)
  if (objectKeyId === undefined || !ctx.resultArray) return

  const matchedIndex = computeMatchedItemIndex(
    objectKeyId,
    ctx.resultArray,
    ctx._uniqueKey
  )
  if (matchedIndex >= 0 && isKeyMap(ctx.resultArray[matchedIndex])) {
    const newItem = { ...ctx.resultArray[matchedIndex] }
    updateObjectDeepValue(newItem, ctx._changeKey, ctx.value)
    ctx.resultArray[matchedIndex] = newItem
  }
}

// --- insert-before: 在指定 ID 前插入 ---
export const insertBeforeHandler: MutationHandler = (ctx) => {
  const objectKeyId = toObjectKey(ctx._id)
  if (!isArray(ctx.resultArray) || objectKeyId === undefined) return undefined

  const matchedIndex = computeMatchedItemIndex(
    objectKeyId,
    ctx.resultArray,
    ctx._uniqueKey
  )
  if (matchedIndex >= 0) {
    const newArray = [...ctx.resultArray]
    newArray.splice(matchedIndex, 0, ctx.value)
    return { modifyValue: newArray }
  }
  return undefined
}

// --- insert-after: 在指定 ID 后插入 ---
export const insertAfterHandler: MutationHandler = (ctx) => {
  const objectKeyId = toObjectKey(ctx._id)
  if (!isArray(ctx.resultArray) || objectKeyId === undefined) return undefined

  const matchedIndex = computeMatchedItemIndex(
    objectKeyId,
    ctx.resultArray,
    ctx._uniqueKey
  )
  if (matchedIndex >= 0) {
    const newArray = [...ctx.resultArray]
    newArray.splice(matchedIndex + 1, 0, ctx.value)
    return { modifyValue: newArray }
  }
  return undefined
}

// --- patch: 批量合并 ---
export const patchHandler: MutationHandler = (ctx) => {
  if (!isKeyMapArray(ctx.resultArray)) return

  const newArray = [...ctx.resultArray]
  if (isKeyMapArray(ctx.value)) {
    combineArrayData(newArray, ctx.value, ctx._uniqueKey)
  } else if (isKeyMap(ctx.value)) {
    const valueAsRecord: Record<ObjectKey, KeyMap> = {}
    for (const [k, v] of Object.entries(ctx.value)) {
      if (isKeyMap(v)) valueAsRecord[k] = v
    }
    combineArrayData(newArray, valueAsRecord, ctx._uniqueKey)
  }
  return { modifyValue: newArray }
}


// --- merge-if-exists: 带存在性检查的 merge ---
export const mergeIfExistsHandler: MutationHandler = (ctx) => {
  const objectKeyId = toObjectKey(ctx._id)
  if (objectKeyId === undefined || !ctx.resultArray || !isKeyMap(ctx.value))
    return { resolved: false }

  const matchedIndex = computeMatchedItemIndex(
    objectKeyId,
    ctx.resultArray,
    ctx._uniqueKey
  )
  if (matchedIndex < 0) return { resolved: false }

  updateArrayItem(ctx.resultArray, matchedIndex, (item) => ({
    ...item,
    ...ctx.value
  }))
  return { resolved: true }
}

// --- merge-sort: merge 单项后按指定字段排序 ---
export const mergeSortHandler: MutationHandler = (ctx) => {
  const objectKeyId = toObjectKey(ctx._id)
  if (objectKeyId === undefined || !isKeyMapArray(ctx.resultArray))
    return { resolved: false }

  // value 结构: { data: KeyMap, sortBy: string, order?: 'asc' | 'desc' }
  const { data, sortBy, order = 'desc' } = ctx.value as {
    data: KeyMap
    sortBy: string
    order?: 'asc' | 'desc'
  }

  if (!isKeyMap(data) || !sortBy) return { resolved: false }

  const matchedIndex = computeMatchedItemIndex(
    objectKeyId,
    ctx.resultArray,
    ctx._uniqueKey
  )
  if (matchedIndex < 0) return { resolved: false }

  // merge
  const newArray = [...ctx.resultArray]
  newArray[matchedIndex] = { ...newArray[matchedIndex], ...data }

  // sort
  const multiplier = order === 'asc' ? 1 : -1
  newArray.sort((a, b) => {
    const va = getObjectDeepValue(a, sortBy)
    const vb = getObjectDeepValue(b, sortBy)
    if (va == null && vb == null) return 0
    if (va == null) return 1
    if (vb == null) return -1
    return va < vb ? -1 * multiplier : va > vb ? 1 * multiplier : 0
  })

  return { modifyValue: newArray }
}

// --- batch_update: 批量 merge + append ---
export const batchUpdateHandler: MutationHandler = (ctx) => {
  if (!isKeyMapArray(ctx.resultArray)) return

  const { merges, appends } = ctx.value as {
    merges?: Array<{ id: ObjectKey; value: KeyMap }>
    appends?: KeyMap[]
  }

  const newArray = [...ctx.resultArray]

  // 构建索引 Map
  const indexMap = new Map<string, number>()
  for (let i = 0; i < newArray.length; i++) {
    const item = newArray[i]
    if (!isKeyMap(item)) continue
    const key = getObjectDeepValue(item, ctx._uniqueKey)
    if (key !== undefined) indexMap.set(String(key), i)
  }

  // 处理 merges：按 key 查找索引，浅合并
  if (isArray(merges)) {
    for (const merge of merges) {
      if (!isKeyMap(merge) || merge.id === undefined || !isKeyMap(merge.value))
        continue
      const idx = indexMap.get(String(merge.id))
      if (idx !== undefined && isKeyMap(newArray[idx])) {
        newArray[idx] = { ...newArray[idx], ...merge.value }
      }
    }
  }

  // 处理 appends：过滤已存在项，追加到末尾
  if (isArray(appends)) {
    for (const item of appends) {
      if (!isKeyMap(item)) continue
      const key = getObjectDeepValue(item, ctx._uniqueKey)
      if (key !== undefined && indexMap.has(String(key))) continue
      newArray.push(item)
    }
  }

  return { modifyValue: newArray }
}

// --- 扩展 mutation 注册表 ---
export const extendedMutations: Record<string, MutationHandler> = {
  [ENUM.CHANGE_TYPE.SEARCH_FIELD]: searchHandler,
  [ENUM.CHANGE_TYPE.RESULT_UPDATE_KV]: updateKVHandler,
  [ENUM.CHANGE_TYPE.RESULT_INSERT_TO_BEFORE]: insertBeforeHandler,
  [ENUM.CHANGE_TYPE.RESULT_INSERT_TO_AFTER]: insertAfterHandler,
  [ENUM.CHANGE_TYPE.RESULT_LIST_MERGE]: patchHandler,
  [ENUM.CHANGE_TYPE.RESULT_BATCH_UPDATE]: batchUpdateHandler,
  [ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE_SORT]: mergeSortHandler,
  [ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE_IF_EXISTS]: mergeIfExistsHandler
}
