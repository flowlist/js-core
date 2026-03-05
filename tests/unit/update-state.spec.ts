/**
 * mutations/index：createUpdateState、updateState 集成测试
 */
import { createUpdateState, updateState } from '../../src/mutations'
import { initState, generateFieldName } from '../../src/core'
import ENUM from '../../src/constants'
import { getter, setter, clearStore } from '../helpers/store'
import { createTestApi } from '../helpers/api'
import { generateDefaultField } from '../../src/_internal/utils'

beforeEach(clearStore)

describe('updateState / createUpdateState', () => {
  const fieldName = 'update-state-api'

  const initFieldWithResult = async (result: any[]) => {
    const func = createTestApi({ id: 'update-state-api' })
    await initState({
      getter,
      setter,
      func,
      opts: { result, fetched: true, page: 1 }
    })
    return func
  }

  it('func.uniqueKey 缺失时使用 DEFAULT_UNIQUE_KEY_NAME', async () => {
    await initFieldWithResult([{ id: 1 }, { id: 2 }])
    const base = createTestApi({ id: 'update-state-api' })
    const func = Object.assign(
      (params: any) => base(params),
      { ...base, uniqueKey: undefined }
    )
    const res = await updateState({
      getter,
      setter,
      func: func as unknown as typeof base,
      method: ENUM.CHANGE_TYPE.SEARCH_FIELD,
      id: 2,
      value: null
    })
    expect(res).toEqual({ id: 2 })
  })

  it('field 未初始化时 reject', async () => {
    const func = createTestApi({ id: 'no-field-api' })
    await expect(
      updateState({
        getter,
        setter,
        func,
        method: ENUM.CHANGE_TYPE.RESULT_ADD_AFTER,
        value: { id: 1 }
      })
    ).rejects.toThrow(/not found/)
  })

  it('page === -1 时直接 resolve null', async () => {
    const func = createTestApi({ id: 'page-minus-one' })
    await initState({
      getter,
      setter,
      func,
      opts: { page: -1, result: [{ id: 1 }], fetched: true }
    })
    const res = await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESULT_ADD_AFTER,
      value: { id: 2 }
    })
    expect(res).toBeNull()
  })

  it('未知 method 时 resolve null', async () => {
    await initFieldWithResult([{ id: 1 }])
    const func = createTestApi({ id: 'update-state-api' })
    const res = await updateState({
      getter,
      setter,
      func,
      method: 'unknown-method',
      value: null
    })
    expect(res).toBeNull()
  })

  it('push 追加项', async () => {
    await initFieldWithResult([{ id: 1 }, { id: 2 }])
    const func = createTestApi({ id: 'update-state-api' })
    await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESULT_ADD_AFTER,
      value: { id: 3, name: 'c' }
    })
    const field = getter(fieldName)!
    expect(field.result).toEqual([{ id: 1 }, { id: 2 }, { id: 3, name: 'c' }])
  })

  it('unshift 头部插入', async () => {
    await initFieldWithResult([{ id: 2 }, { id: 3 }])
    const func = createTestApi({ id: 'update-state-api' })
    await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESULT_ADD_BEFORE,
      value: { id: 1, name: 'a' }
    })
    const field = getter(fieldName)!
    expect(field.result).toEqual([{ id: 1, name: 'a' }, { id: 2 }, { id: 3 }])
  })

  it('delete 按 id 删除', async () => {
    await initFieldWithResult([{ id: 1 }, { id: 2 }, { id: 3 }])
    const func = createTestApi({ id: 'update-state-api' })
    await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID,
      id: 2,
      value: null
    })
    const field = getter(fieldName)!
    expect(field.result).toEqual([{ id: 1 }, { id: 3 }])
  })

  it('merge 按 id 合并字段', async () => {
    await initFieldWithResult([{ id: 1, name: 'a' }, { id: 2, name: 'b' }])
    const func = createTestApi({ id: 'update-state-api' })
    await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE,
      id: 1,
      value: { name: 'a2' }
    })
    const field = getter(fieldName)!
    expect((field.result as any[])[0]).toMatchObject({ id: 1, name: 'a2' })
  })

  it('reset 替换 result', async () => {
    await initFieldWithResult([{ id: 1 }])
    const func = createTestApi({ id: 'update-state-api' })
    await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESET_FIELD,
      changeKey: ENUM.FIELD_DATA.RESULT_KEY,
      value: [{ id: 10 }, { id: 20 }]
    })
    const field = getter(fieldName)!
    expect(field.result).toEqual([{ id: 10 }, { id: 20 }])
  })

  it('search 返回匹配项', async () => {
    await initFieldWithResult([{ id: 1, name: 'a' }, { id: 2, name: 'b' }])
    const func = createTestApi({ id: 'update-state-api' })
    const res = await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.SEARCH_FIELD,
      id: 2,
      value: null
    })
    expect(res).toEqual({ id: 2, name: 'b' })
  })

  it('update 深层 KV 更新', async () => {
    await initFieldWithResult([{ id: 1, obj: { key: 'old' } }, { id: 2 }])
    const func = createTestApi({ id: 'update-state-api' })
    await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESULT_UPDATE_KV,
      id: 1,
      changeKey: 'obj.key',
      value: 'new'
    })
    const field = getter(fieldName)!
    expect((field.result as any[])[0]).toEqual({ id: 1, obj: { key: 'new' } })
  })

  it('insert-before 在指定 id 前插入', async () => {
    await initFieldWithResult([{ id: 1 }, { id: 2 }, { id: 3 }])
    const func = createTestApi({ id: 'update-state-api' })
    await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESULT_INSERT_TO_BEFORE,
      id: 2,
      value: { id: 99 }
    })
    const field = getter(fieldName)!
    expect(field.result).toEqual([{ id: 1 }, { id: 99 }, { id: 2 }, { id: 3 }])
  })

  it('insert-after 在指定 id 后插入', async () => {
    await initFieldWithResult([{ id: 1 }, { id: 2 }, { id: 3 }])
    const func = createTestApi({ id: 'update-state-api' })
    await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESULT_INSERT_TO_AFTER,
      id: 2,
      value: { id: 99 }
    })
    const field = getter(fieldName)!
    expect(field.result).toEqual([{ id: 1 }, { id: 2 }, { id: 99 }, { id: 3 }])
  })

  it('patch 批量合并', async () => {
    await initFieldWithResult([{ id: 1, name: 'a' }, { id: 2, name: 'b' }])
    const func = createTestApi({ id: 'update-state-api' })
    await updateState({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESULT_LIST_MERGE,
      value: [{ id: 1, name: 'a1' }, { id: 2, name: 'b2' }]
    })
    const field = getter(fieldName)!
    expect(field.result).toEqual([{ id: 1, name: 'a1' }, { id: 2, name: 'b2' }])
  })
})

describe('createUpdateState 自定义 handlers', () => {
  it('仅传入部分 handler 时未注册的 method 返回 null', async () => {
    const customUpdate = createUpdateState({
      [ENUM.CHANGE_TYPE.RESULT_ADD_AFTER]: (ctx) => ({
        modifyValue: [...(ctx.resultArray || []), ctx.value]
      })
    })
    const func = createTestApi({ id: 'custom-api' })
    await initState({ getter, setter, func, opts: { result: [{ id: 1 }], fetched: true } })
    await customUpdate({ getter, setter, func, method: ENUM.CHANGE_TYPE.RESULT_ADD_AFTER, value: { id: 2 } })
    const field = getter('custom-api')!
    expect(field.result).toEqual([{ id: 1 }, { id: 2 }])
    const res = await customUpdate({ getter, setter, func, method: ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID, id: 1, value: null })
    expect(res).toBeNull()
  })
  it('handler 返回 modifyValue 且 changeKey 为 extra 时写回 extra', async () => {
    const customUpdate = createUpdateState({
      [ENUM.CHANGE_TYPE.RESET_FIELD]: (ctx) => {
        if (ctx._changeKey === ENUM.FIELD_DATA.EXTRA_KEY) {
          return { modifyValue: { cursor: 'next', page: 2 } }
        }
        return undefined
      }
    })
    const func = createTestApi({ id: 'extra-api' })
    await initState({
      getter,
      setter,
      func,
      opts: { result: [{ id: 1 }], extra: { cursor: 'old' }, fetched: true }
    })
    await customUpdate({
      getter,
      setter,
      func,
      method: ENUM.CHANGE_TYPE.RESET_FIELD,
      changeKey: ENUM.FIELD_DATA.EXTRA_KEY,
      value: null
    })
    const field = getter('extra-api')!
    expect(field.extra).toEqual({ cursor: 'next', page: 2 })
  })
})
