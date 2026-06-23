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

  // ── 增量追加去重（按 uniqueKey）──────────────────────────────────────────────
  // 场景：sinceId / scroll 增量加载时，服务端因 since 边界（createdAt >= since）或
  // reconnect 重叠会把「列表里已有的项」再返回一次。旧实现纯 concat 会产生重复行。
  // 修复：追加时按 uniqueKey 去重，同 key 用 incoming 覆盖 existing 并保持原位置。
  it('增量追加：同 uniqueKey 的项去重而非重复 append', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField({
        fetched: true,
        result: [{ id: 1 }, { id: 2 }, { id: 3 }]
      })
    })
    await SET_DATA({
      getter,
      setter,
      uniqueKey: 'id',
      // since 增量把已存在的 id:3 又带回 + 一条新 id:4
      data: { result: [{ id: 3 }, { id: 4 }], no_more: true },
      fieldName,
      type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      page: 2,
      insertBefore: false
    })
    const field = getter(fieldName)!
    expect((field.result as Array<{ id: number }>).map((m) => m.id)).toEqual([
      1, 2, 3, 4
    ])
  })

  it('增量追加去重：同 key 用 incoming 覆盖 existing 字段（不新增行）', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField({
        fetched: true,
        result: [{ id: 1, status: 'sending' }]
      })
    })
    await SET_DATA({
      getter,
      setter,
      uniqueKey: 'id',
      data: { result: [{ id: 1, status: 'success' }], no_more: true },
      fieldName,
      type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      page: 2,
      insertBefore: false
    })
    const field = getter(fieldName)!
    expect(field.result).toEqual([{ id: 1, status: 'success' }])
  })

  it('insertBefore 追加去重：新项前插、已存在项就地更新不重复', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField({
        fetched: true,
        result: [{ id: 2 }, { id: 3 }]
      })
    })
    await SET_DATA({
      getter,
      setter,
      uniqueKey: 'id',
      // 前插一条新 id:1 + 重叠的 id:2
      data: { result: [{ id: 1 }, { id: 2 }], no_more: true },
      fieldName,
      type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      page: 2,
      insertBefore: true
    })
    const field = getter(fieldName)!
    expect((field.result as Array<{ id: number }>).map((m) => m.id)).toEqual([
      1, 2, 3
    ])
  })

  it('未传 uniqueKey 时回退默认键去重（id）', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField({ fetched: true, result: [{ id: 1 }] })
    })
    await SET_DATA({
      getter,
      setter,
      // 不传 uniqueKey → 用默认键（id）
      data: { result: [{ id: 1 }, { id: 2 }], no_more: true },
      fieldName,
      type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      page: 2,
      insertBefore: false
    })
    const field = getter(fieldName)!
    expect((field.result as Array<{ id: number }>).map((m) => m.id)).toEqual([
      1, 2
    ])
  })

  it('成功落数据时清除上一次的 error（刷新/重试成功后不残留旧错误）', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField({
        fetched: true,
        error: new Error('previous boom')
      })
    })
    await SET_DATA({
      getter,
      setter,
      data: { result: [{ id: 1 }], no_more: true },
      fieldName,
      type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE,
      page: 1,
      insertBefore: false
    })
    expect(getter(fieldName)!.error).toBeNull()
  })

  it('replaceOnRefresh 整表替换并清 error + 重置 extra', async () => {
    setter({
      key: fieldName,
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField({
        fetched: true,
        result: [{ id: 1 }, { id: 2 }, { id: 3 }],
        extra: { cursor: 'old' },
        error: new Error('boom')
      })
    })
    await SET_DATA({
      getter,
      setter,
      data: { result: [{ id: 9 }], extra: { cursor: 'new' }, no_more: false },
      fieldName,
      type: ENUM.FETCH_TYPE.SINCE_FIRST_OR_END_ID,
      page: 0,
      insertBefore: false,
      mergeStrategy: 'append',
      replaceOnRefresh: true
    })
    const field = getter(fieldName)!
    // 整表替换（非 append），旧 1/2/3 丢弃
    expect((field.result as Array<{ id: number }>).map((m) => m.id)).toEqual([9])
    expect((field.extra as { cursor: string }).cursor).toBe('new')
    expect(field.error).toBeNull()
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
