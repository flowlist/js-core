/**
 * 测试用内存 store：getter / setter 实现
 * 用于模拟 Vue/Pinia 等状态层的读写
 */
import type { DefaultField, FieldGetter, SetterFuncParams } from '../../src/types'

const store: Record<string, DefaultField> = {}

export const getter: FieldGetter = (fieldName: string): DefaultField | undefined => {
  const value = store[fieldName]
  return value ? { ...value, result: Array.isArray(value.result) ? [...value.result] : value.result } : undefined
}

export const setter = (params: SetterFuncParams): void => {
  const { key, type, value, callback } = params
  if (type === 0) {
    store[key] = value as DefaultField
  } else if (type === 1) {
    const existing = store[key] || ({} as DefaultField)
    store[key] = { ...existing, ...value } as DefaultField
  }
  callback?.()
}

/** 清空 store，用于 beforeEach 隔离测试 */
export const clearStore = (): void => {
  Object.keys(store).forEach((k) => delete store[k])
}
