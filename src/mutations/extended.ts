// mutations/extended.ts — 5 种扩展 mutation handler
import {
  combineArrayData,
  computeMatchedItemIndex,
  isArray,
  isKeyMap,
  isKeyMapArray,
  searchValueByKey,
  toObjectKey,
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

// --- 扩展 mutation 注册表 ---
export const extendedMutations: Record<string, MutationHandler> = {
  [ENUM.CHANGE_TYPE.SEARCH_FIELD]: searchHandler,
  [ENUM.CHANGE_TYPE.RESULT_UPDATE_KV]: updateKVHandler,
  [ENUM.CHANGE_TYPE.RESULT_INSERT_TO_BEFORE]: insertBeforeHandler,
  [ENUM.CHANGE_TYPE.RESULT_INSERT_TO_AFTER]: insertAfterHandler,
  [ENUM.CHANGE_TYPE.RESULT_LIST_MERGE]: patchHandler
}
