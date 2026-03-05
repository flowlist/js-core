/**
 * mutations/extended 各 handler 单元测试
 */
import {
  searchHandler,
  updateKVHandler,
  insertBeforeHandler,
  insertAfterHandler,
  patchHandler
} from '../../src/mutations/extended'
import ENUM from '../../src/constants'
import type { DefaultField } from '../../src/types'

const baseCtx = (resultArray: any[], value: any, _id?: any, _changeKey: string = ENUM.FIELD_DATA.RESULT_KEY) => ({
  resultArray,
  newFieldData: { result: resultArray ? [...resultArray] : null, noMore: false, nothing: false, loading: false, error: null, extra: null, fetched: true, page: 1, total: resultArray?.length ?? 0 } as DefaultField,
  _id,
  _uniqueKey: 'id',
  _changeKey,
  value
})

describe('mutations/extended - searchHandler', () => {
  it('按 id 查找返回对应项', () => {
    const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
    const ctx = baseCtx(arr, null, 2)
    const out = searchHandler(ctx)
    expect(out?.resolved).toEqual({ id: 2, name: 'b' })
  })
  it('无匹配返回 undefined', () => {
    const ctx = baseCtx([{ id: 1 }], null, 99)
    expect(searchHandler(ctx)?.resolved).toBeUndefined()
  })
  it('_id 为空返回 undefined', () => {
    expect(searchHandler(baseCtx([{ id: 1 }], null, undefined))?.resolved).toBeUndefined()
  })
  it('resultArray 为 null 时 resolved 为 undefined', () => {
    const ctx = { ...baseCtx([], null), resultArray: null }
    expect(searchHandler(ctx)?.resolved).toBeUndefined()
  })
})

describe('mutations/extended - updateKVHandler', () => {
  it('深层 key 更新', () => {
    const arr = [{ id: 1, obj: { key: 'old' } }, { id: 2 }]
    const ctx = baseCtx(arr, 'new', 1, 'obj.key')
    updateKVHandler(ctx)
    expect(arr[0]).toEqual({ id: 1, obj: { key: 'new' } })
  })
  it('无匹配不修改', () => {
    const arr = [{ id: 1 }]
    const ctx = baseCtx(arr, 'x', 99, 'name')
    updateKVHandler(ctx)
    expect(arr[0]).toEqual({ id: 1 })
  })
})

describe('mutations/extended - insertBeforeHandler', () => {
  it('在指定 id 前插入', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const ctx = baseCtx(arr, { id: 99, name: 'new' }, 2)
    const out = insertBeforeHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 1 }, { id: 99, name: 'new' }, { id: 2 }, { id: 3 }])
  })
  it('无匹配返回 undefined', () => {
    expect(insertBeforeHandler(baseCtx([{ id: 1 }], {}, 99))?.modifyValue).toBeUndefined()
  })
  it('resultArray 非数组时返回 undefined', () => {
    expect(insertBeforeHandler({ ...baseCtx([], {}), resultArray: null })?.modifyValue).toBeUndefined()
  })
})

describe('mutations/extended - insertAfterHandler', () => {
  it('在指定 id 后插入', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const ctx = baseCtx(arr, { id: 99 }, 2)
    const out = insertAfterHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 1 }, { id: 2 }, { id: 99 }, { id: 3 }])
  })
  it('无匹配返回 undefined', () => {
    expect(insertAfterHandler(baseCtx([{ id: 1 }], {}, 99))?.modifyValue).toBeUndefined()
  })
  it('objectKeyId 为 undefined 时返回 undefined', () => {
    expect(insertAfterHandler(baseCtx([{ id: 1 }], {}, undefined))?.modifyValue).toBeUndefined()
  })
})

describe('mutations/extended - patchHandler', () => {
  it('数组 value 按 id 合并', () => {
    const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
    const ctx = baseCtx(arr, [{ id: 1, name: 'a1' }, { id: 2, name: 'b2' }])
    const out = patchHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 1, name: 'a1' }, { id: 2, name: 'b2' }])
  })
  it('对象 value 按 key 合并', () => {
    const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
    const ctx = baseCtx(arr, { 1: { name: 'a1' }, 2: { name: 'b2' } })
    const out = patchHandler(ctx)
    expect(out?.modifyValue).toEqual([{ id: 1, name: 'a1' }, { id: 2, name: 'b2' }])
  })
  it('resultArray 非 KeyMap 数组不修改', () => {
    expect(patchHandler(baseCtx(null as any, []))?.modifyValue).toBeUndefined()
  })
})
