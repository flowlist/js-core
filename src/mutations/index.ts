// mutations/index.ts — 全量 updateState（core + extended mutations）
import {
  computeResultLength,
  getResultAsArray,
  isKeyMap,
  isKeyMapArray
} from '../_internal/utils'
import ENUM from '../constants'
import { generateFieldName } from '../core'

import type {
  DefaultField,
  MutationContext,
  MutationHandler,
  RequestParams,
  UpdateStateType
} from '../types'

import { coreMutations } from './core'
import { extendedMutations } from './extended'

// 合并全部 mutation handlers
const allMutations: Record<string, MutationHandler> = {
  ...coreMutations,
  ...extendedMutations
}

export { coreMutations } from './core'
export { extendedMutations } from './extended'

/**
 * 创建 updateState 函数，可传入自定义 mutation handlers
 */
export const createUpdateState = (
  handlers: Record<string, MutationHandler> = allMutations
) => {
  return <P extends RequestParams, R>({
    getter,
    setter,
    func,
    query,
    method,
    id,
    value,
    changeKey
  }: UpdateStateType<P, R>): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const fieldName = generateFieldName({ func, query })
      const fieldData = getter(fieldName)
      if (!fieldData) {
        reject(new Error(`Field ${fieldName} not found.`))
        return
      }

      if (fieldData.page === -1) {
        resolve(null)
        return
      }

      const _uniqueKey = func.uniqueKey || ENUM.DEFAULT_UNIQUE_KEY_NAME
      const _changeKey = changeKey || ENUM.FIELD_DATA.RESULT_KEY
      const beforeLength = computeResultLength(
        fieldData[ENUM.FIELD_DATA.RESULT_KEY]
      )

      // 创建新 field 对象
      const newFieldData: DefaultField = { ...fieldData }
      let resultArray = getResultAsArray(fieldData)
      if (resultArray) {
        resultArray = [...resultArray]
        newFieldData.result = resultArray as any
      }

      // 查找 handler
      const handler = handlers[method]
      if (!handler) {
        resolve(null)
        return
      }

      const ctx: MutationContext = {
        resultArray,
        newFieldData,
        _id: id,
        _uniqueKey,
        _changeKey,
        value
      }

      const handlerResult = handler(ctx)

      // 处理 handler 返回值
      if (handlerResult) {
        // search 等操作直接返回结果
        if ('resolved' in handlerResult) {
          resolve(handlerResult.resolved)
          return
        }

        // modifyValue: handler 返回了处理后的数据，需要写回
        if (
          'modifyValue' in handlerResult &&
          handlerResult.modifyValue !== undefined
        ) {
          const modifyValue = handlerResult.modifyValue
          if (
            _changeKey === ENUM.FIELD_DATA.RESULT_KEY &&
            isKeyMapArray(modifyValue)
          ) {
            newFieldData.result = modifyValue
          } else if (
            _changeKey === ENUM.FIELD_DATA.EXTRA_KEY &&
            isKeyMap(modifyValue)
          ) {
            newFieldData.extra = modifyValue
          }
        }
      }

      // 更新 total 和 nothing
      const afterLength = computeResultLength(
        newFieldData[ENUM.FIELD_DATA.RESULT_KEY]
      )
      newFieldData.total = newFieldData.total + afterLength - beforeLength
      newFieldData.nothing = afterLength === 0

      setter({
        key: fieldName,
        type: ENUM.SETTER_TYPE.RESET,
        value: newFieldData,
        callback: () => resolve(null)
      })
    })
  }
}

/**
 * 默认 updateState（包含全部 10 种 mutation）
 */
export const updateState = createUpdateState()
