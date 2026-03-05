// mutations/core.ts — 5 种核心 mutation handler
import {
  computeMatchedItemIndex,
  getObjectDeepValue,
  isArray,
  isKeyMap,
  isKeyMapArray,
  isObjectKeyArray,
  toObjectKey,
  updateArrayItem
} from '../_internal/utils'
import ENUM from '../constants'
import type { MutationHandler, ObjectKey } from '../types'

// --- push: 末尾追加 ---
export const pushHandler: MutationHandler = (ctx) => {
  if (!isArray(ctx.resultArray)) return
  return {
    modifyValue: isArray(ctx.value)
      ? [...ctx.resultArray, ...ctx.value]
      : [...ctx.resultArray, ctx.value]
  }
}

// --- unshift: 头部插入 ---
export const unshiftHandler: MutationHandler = (ctx) => {
  if (!isArray(ctx.resultArray)) return
  return {
    modifyValue: isArray(ctx.value)
      ? [...ctx.value, ...ctx.resultArray]
      : [ctx.value, ...ctx.resultArray]
  }
}

// --- delete: 按 ID 删除 ---
export const deleteHandler: MutationHandler = (ctx) => {
  if (!isKeyMapArray(ctx.resultArray)) return

  const objectKeyId = toObjectKey(ctx._id)

  if (objectKeyId !== undefined) {
    const matchedIndex = computeMatchedItemIndex(
      objectKeyId,
      ctx.resultArray,
      ctx._uniqueKey
    )
    if (matchedIndex >= 0) {
      const newArray = [...ctx.resultArray]
      newArray.splice(matchedIndex, 1)
      return { modifyValue: newArray }
    }
  }

  // 批量删除：id 为数组
  if (isObjectKeyArray(ctx._id)) {
    const idSet = new Set<ObjectKey>(ctx._id)
    return {
      modifyValue: ctx.resultArray.filter((item) => {
        const itemKey = getObjectDeepValue(item, ctx._uniqueKey)
        return typeof itemKey !== 'string' && typeof itemKey !== 'number'
          ? true
          : !idSet.has(itemKey as ObjectKey)
      })
    }
  }

  return undefined
}

// --- merge: 按 ID 合并字段 ---
export const mergeHandler: MutationHandler = (ctx) => {
  const objectKeyId = toObjectKey(ctx._id)
  if (objectKeyId === undefined || !ctx.resultArray || !isKeyMap(ctx.value))
    return

  const matchedIndex = computeMatchedItemIndex(
    objectKeyId,
    ctx.resultArray,
    ctx._uniqueKey
  )
  updateArrayItem(ctx.resultArray, matchedIndex, (item) => ({
    ...item,
    ...ctx.value
  }))
}

// --- reset: 整体替换 result 或 extra ---
export const resetHandler: MutationHandler = (ctx) => {
  if (
    ctx._changeKey === ENUM.FIELD_DATA.RESULT_KEY &&
    isKeyMapArray(ctx.value)
  ) {
    ctx.newFieldData.result = ctx.value
  } else if (
    ctx._changeKey === ENUM.FIELD_DATA.EXTRA_KEY &&
    isKeyMap(ctx.value)
  ) {
    ctx.newFieldData.extra = ctx.value
  }
}

// --- 核心 mutation 注册表 ---
export const coreMutations: Record<string, MutationHandler> = {
  [ENUM.CHANGE_TYPE.RESULT_ADD_AFTER]: pushHandler,
  [ENUM.CHANGE_TYPE.RESULT_ADD_BEFORE]: unshiftHandler,
  [ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID]: deleteHandler,
  [ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE]: mergeHandler,
  [ENUM.CHANGE_TYPE.RESET_FIELD]: resetHandler
}
