/**
 * _internal/setters 测试：SET_DATA、SET_ERROR
 */
import { SET_DATA, SET_ERROR } from '../../src/_internal/setters'
import { generateDefaultField } from '../../src/_internal/utils'
import ENUM from '../../src/constants'
import { getter, setter, clearStore } from '../helpers/store'

beforeEach(clearStore)

describe('SET_DATA', () => {
  const fieldName = 'test-field'

  it('field 未初始化时 reject', async () => {
    await expect(
      SET_DATA({
        getter,
        setter,
        data: { result: [1, 2] },
        fieldName,
        type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
        page: 1,
        insertBefore: false
      })
    ).rejects.toThrow(/not found/)
  })

  it('标准 API 响应：设置 result、fetched、loading、total、noMore', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField()
    })
    await SET_DATA({
      getter,
      setter,
      data: { result: [{ id: 1 }, { id: 2 }], total: 10, no_more: false },
      fieldName,
      type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      page: 1,
      insertBefore: false
    })
    const field = getter(fieldName)!
    expect(field.result).toEqual([{ id: 1 }, { id: 2 }])
    expect(field.fetched).toBe(true)
    expect(field.loading).toBe(false)
    expect(field.total).toBe(10)
    expect(field.noMore).toBe(false)
  })

  it('首次拉取空结果时 nothing 为 true', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField()
    })
    await SET_DATA({
      getter,
      setter,
      data: { result: [], total: 0 },
      fieldName,
      type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      page: 1,
      insertBefore: false
    })
    const field = getter(fieldName)!
    expect(field.nothing).toBe(true)
  })

  it('已 fetched 时再 SET_DATA 则 nothing 为 false', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField({ fetched: true })
    })
    await SET_DATA({
      getter,
      setter,
      data: { result: [], total: 0 },
      fieldName,
      type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      page: 2,
      insertBefore: false
    })
    const field = getter(fieldName)!
    expect(field.nothing).toBe(false)
  })

  it('PAGINATION 时 noMore 置 false、page 为传入值', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField()
    })
    await SET_DATA({
      getter,
      setter,
      data: { result: [{ id: 1 }], total: 1 },
      fieldName,
      type: ENUM.FETCH_TYPE.PAGINATION,
      page: 3,
      insertBefore: false
    })
    const field = getter(fieldName)!
    expect(field.noMore).toBe(false)
    expect(field.page).toBe(3)
  })

  it('非标准响应（无 result 属性）时整包作为 result、noMore=true、page=-1', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField()
    })
    const raw = [{ x: 1 }, { x: 2 }]
    await SET_DATA({
      getter,
      setter,
      data: raw as any,
      fieldName,
      type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      page: 1,
      insertBefore: false
    })
    const field = getter(fieldName)!
    expect(field.result).toEqual(raw)
    expect(field.noMore).toBe(true)
    expect(field.page).toBe(-1)
  })

  it('设置 extra 时合并到 field', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField()
    })
    await SET_DATA({
      getter,
      setter,
      data: { result: [], extra: { cursor: 'abc' } },
      fieldName,
      type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      page: 1,
      insertBefore: false
    })
    const field = getter(fieldName)!
    expect(field.extra).toEqual({ cursor: 'abc' })
  })
})

describe('SET_ERROR', () => {
  const fieldName = 'error-field'
  const err = new Error('test error')

  it('合并 error 与 loading: false', () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField({ loading: true })
    })
    SET_ERROR({ setter, fieldName, error: err })
    const field = getter(fieldName)!
    expect(field.error).toBe(err)
    expect(field.loading).toBe(false)
  })
})
