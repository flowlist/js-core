/**
 * mutations/core 各 handler 单元测试
 */
import {
  pushHandler,
  unshiftHandler,
  deleteHandler,
  mergeHandler,
  resetHandler
} from '../../src/mutations/core'
import ENUM from '../../src/constants'
import type { DefaultField } from '../../src/types'

const baseCtx = (resultArray: any[], value: any, _id?: any) => ({
  resultArray,
  newFieldData: { result: [...resultArray], noMore: false, nothing: false, loading: false, error: null, extra: null, fetched: true, page: 1, total: resultArray.length } as DefaultField,
  _id,
  _uniqueKey: 'id',
  _changeKey: ENUM.FIELD_DATA.RESULT_KEY,
  value
})

describe('mutations/core - pushHandler', () => {
  it('单元素追加', () => {
    const ctx = baseCtx([{ id: 1 }, { id: 2 }], { id: 3, name: 'c' })
    const out = pushHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 1 }, { id: 2 }, { id: 3, name: 'c' }])
  })
  it('数组追加', () => {
    const ctx = baseCtx([{ id: 1 }], [{ id: 2 }, { id: 3 }])
    const out = pushHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
  })
  it('resultArray 非数组返回 undefined', () => {
    const ctx = { resultArray: null, newFieldData: {} as DefaultField, _id: undefined, _uniqueKey: 'id', _changeKey: 'result', value: 1 }
    expect(pushHandler(ctx)).toBeUndefined()
  })
})

describe('mutations/core - unshiftHandler', () => {
  it('头部插入单元素', () => {
    const ctx = baseCtx([{ id: 2 }, { id: 3 }], { id: 1, name: 'a' })
    const out = unshiftHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 1, name: 'a' }, { id: 2 }, { id: 3 }])
  })
  it('头部插入数组', () => {
    const ctx = baseCtx([{ id: 3 }], [{ id: 1 }, { id: 2 }])
    const out = unshiftHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
  })
  it('头部插入单元素（value 非数组）', () => {
    const ctx = baseCtx([{ id: 2 }], { id: 1, name: 'first' })
    const out = unshiftHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 1, name: 'first' }, { id: 2 }])
  })
  it('resultArray 非数组返回 undefined', () => {
    const ctx = { ...baseCtx([], 1), resultArray: null }
    expect(unshiftHandler(ctx)).toBeUndefined()
  })
})

describe('mutations/core - deleteHandler', () => {
  it('按单 id 删除', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const ctx = baseCtx(arr, null, 2)
    const out = deleteHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 1 }, { id: 3 }])
  })
  it('按 id 数组批量删除（首项无匹配时按整组 id 过滤）', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const ctx = baseCtx(arr, null, [99, 1, 3])
    const out = deleteHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 2 }])
  })
  it('无匹配不修改', () => {
    const arr = [{ id: 1 }, { id: 2 }]
    const ctx = baseCtx(arr, null, 99)
    const out = deleteHandler(ctx)
    expect(out).toBeUndefined()
  })
  it('_id 非数组且单 id 无匹配时返回 undefined', () => {
    const arr = [{ id: 1 }, { id: 2 }]
    const ctx = baseCtx(arr, null, 100)
    expect(deleteHandler(ctx)).toBeUndefined()
  })
  it('批量删除时 uniqueKey 非 string/number 的项保留', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: {} }]
    const ctx = baseCtx(arr, null, [99, 1, 2])
    const out = deleteHandler(ctx)
    expect(out?.modifyValue).toHaveLength(1)
    expect((out?.modifyValue as any[])[0]).toMatchObject({ id: {} })
  })
})

describe('mutations/core - mergeHandler', () => {
  it('按 id 合并 value 到对应项', () => {
    const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
    const ctx = baseCtx(arr, { name: 'a2', extra: 1 }, 1)
    mergeHandler(ctx)
    expect(arr[0]).toEqual({ id: 1, name: 'a2', extra: 1 })
  })
  it('id 或 value 无效时不修改', () => {
    const arr = [{ id: 1 }]
    mergeHandler(baseCtx(arr, null, 1))
    mergeHandler(baseCtx(arr, { x: 1 }, undefined))
    expect(arr[0]).toEqual({ id: 1 })
  })
})

describe('mutations/core - resetHandler', () => {
  it('RESULT_KEY 时替换 result', () => {
    const newFieldData = { result: [1, 2], noMore: false, nothing: false, loading: false, error: null, extra: null, fetched: true, page: 0, total: 2 } as DefaultField
    const ctx = { ...baseCtx([], []), newFieldData, _changeKey: ENUM.FIELD_DATA.RESULT_KEY, value: [{ id: 1 }, { id: 2 }] }
    resetHandler(ctx)
    expect(ctx.newFieldData.result).toEqual([{ id: 1 }, { id: 2 }])
  })
  it('EXTRA_KEY 时替换 extra', () => {
    const newFieldData = { result: [], noMore: false, nothing: false, loading: false, error: null, extra: null, fetched: false, page: 0, total: 0 } as DefaultField
    const ctx = { ...baseCtx([], []), newFieldData, _changeKey: ENUM.FIELD_DATA.EXTRA_KEY, value: { cursor: 'x' } }
    resetHandler(ctx)
    expect(ctx.newFieldData.extra).toEqual({ cursor: 'x' })
  })
})
