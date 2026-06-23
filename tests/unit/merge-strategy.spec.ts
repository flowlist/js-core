/**
 * mergeStrategy 重构测试
 *
 * 设计目标：把原本由 `type` 隐式承担的「result 如何合并」维度解耦为独立的
 * `mergeStrategy` 参数，三态正交：
 *   - 'replace'：loadMore 替换、refresh 原子整表替换（原 PAGINATION/jump 行为）
 *   - 'append' ：loadMore 去重追加、refresh 原子整表替换回第一页（默认非 jump）
 *   - 'preserve'：loadMore 去重追加、refresh 跳 RESET 保 in-flight（聊天实时流）
 *
 * 默认值：未显式声明时由 type 推导（jump → replace，其余 → append），
 * 保证对现有列表 100% 向后兼容。
 */
import { createApi, initState, initData, loadMore } from '../../src/core'
import { generateDefaultField } from '../../src/_internal/utils'
import ENUM from '../../src/constants'
import { getter, setter, clearStore } from '../helpers/store'
import type { RequestParams } from '../../src/types'

beforeEach(clearStore)

describe('createApi mergeStrategy 默认值推导', () => {
  it('type=jump 默认推导为 replace', () => {
    const api = createApi<RequestParams, unknown>({
      id: 'jump-api',
      type: 'jump',
      fetcher: async () => ({ result: [] })
    })
    expect(api.mergeStrategy).toBe('replace')
  })

  it('type=page 默认推导为 append', () => {
    const api = createApi<RequestParams, unknown>({
      id: 'page-api',
      type: 'page',
      fetcher: async () => ({ result: [] })
    })
    expect(api.mergeStrategy).toBe('append')
  })

  it('type=sinceId 默认推导为 append', () => {
    const api = createApi<RequestParams, unknown>({
      id: 'since-api',
      type: 'sinceId',
      fetcher: async () => ({ result: [] })
    })
    expect(api.mergeStrategy).toBe('append')
  })

  it('显式声明优先于推导', () => {
    const api = createApi<RequestParams, unknown>({
      id: 'explicit-api',
      type: 'sinceId',
      mergeStrategy: 'preserve',
      fetcher: async () => ({ result: [] })
    })
    expect(api.mergeStrategy).toBe('preserve')
  })

  it('mergeStrategy 进入冻结元数据', () => {
    const api = createApi<RequestParams, unknown>({
      id: 'frozen-api',
      mergeStrategy: 'replace',
      fetcher: async () => ({ result: [] })
    })
    expect(Object.isFrozen(api)).toBe(true)
    expect(api.mergeStrategy).toBe('replace')
  })
})

describe('mergeStrategy=append：loadMore 去重追加', () => {
  it('loadMore 把新页去重追加到现有列表尾部', async () => {
    let page = 0
    const func = createApi<RequestParams, unknown>({
      id: 'append-loadmore',
      type: 'sinceId',
      mergeStrategy: 'append',
      uniqueKey: 'id',
      fetcher: async () => {
        page += 1
        return page === 1
          ? { result: [{ id: 1 }, { id: 2 }], no_more: false }
          : { result: [{ id: 2 }, { id: 3 }], no_more: false }
      }
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    await loadMore({ getter, setter, func })
    const field = getter('append-loadmore')!
    // id:2 重叠去重，不产生重复行
    expect((field.result as Array<{ id: number }>).map((m) => m.id)).toEqual([
      1, 2, 3
    ])
  })
})

describe('mergeStrategy=append：refresh 整表替换回第一页（修 note 瀑布流 bug）', () => {
  it('刷新用第一页整表替换，丢弃旧的后续页', async () => {
    let mode: 'first' | 'refreshed' = 'first'
    const func = createApi<RequestParams, unknown>({
      id: 'append-refresh',
      type: 'sinceId',
      mergeStrategy: 'append',
      uniqueKey: 'id',
      fetcher: async () => {
        return mode === 'first'
          ? { result: [{ id: 1 }, { id: 2 }, { id: 3 }], no_more: false }
          : { result: [{ id: 10 }, { id: 11 }], no_more: false }
      }
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    // 切到刷新返回完全不同的最新第一页
    mode = 'refreshed'
    await initData({
      getter,
      setter,
      func,
      query: { __refresh__: true } as RequestParams
    })
    const field = getter('append-refresh')!
    // 整表替换：旧的 1/2/3 被丢弃，只剩刷新后的 10/11（不是 append 成 5 条）
    expect((field.result as Array<{ id: number }>).map((m) => m.id)).toEqual([
      10, 11
    ])
  })

  it('刷新后 field.extra 被新第一页响应覆盖（不残留旧游标）', async () => {
    // note 类列表的真实数据流：fetcher 从 params.extra 读 cursor 翻页，
    // 而 initData 刷新路径不把旧 extra 注入 params（仅 loadMore 才注入），
    // 故刷新请求天然回第一页。本测试验证：刷新落库后 store.extra 是
    // 「本次第一页响应的 extra」，而非旧的 page2 游标残留 —— 保证下次翻页基于新游标。
    let mode: 'first' | 'refreshed' = 'first'
    const func = createApi<RequestParams, unknown>({
      id: 'append-extra-overwrite',
      type: 'sinceId',
      mergeStrategy: 'append',
      uniqueKey: 'id',
      fetcher: async () =>
        mode === 'first'
          ? {
              result: [{ id: 1 }],
              extra: { cursor: 'page2-cursor' },
              no_more: false
            }
          : {
              result: [{ id: 10 }],
              extra: { cursor: 'fresh-page2-cursor' },
              no_more: false
            }
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    expect(
      (getter('append-extra-overwrite')!.extra as { cursor: string }).cursor
    ).toBe('page2-cursor')
    // 刷新：新第一页带回新游标，整表替换 + extra 覆盖为新值
    mode = 'refreshed'
    await initData({
      getter,
      setter,
      func,
      query: { __refresh__: true } as RequestParams
    })
    const field = getter('append-extra-overwrite')!
    expect((field.result as Array<{ id: number }>).map((m) => m.id)).toEqual([
      10
    ])
    expect((field.extra as { cursor: string }).cursor).toBe('fresh-page2-cursor')
  })

  it('刷新返回无 extra 时重置 field.extra 为 null（清除旧游标）', async () => {
    let mode: 'first' | 'refreshed' = 'first'
    const func = createApi<RequestParams, unknown>({
      id: 'append-extra-clear',
      type: 'sinceId',
      mergeStrategy: 'append',
      uniqueKey: 'id',
      fetcher: async () =>
        mode === 'first'
          ? {
              result: [{ id: 1 }],
              extra: { cursor: 'old-cursor' },
              no_more: false
            }
          : { result: [{ id: 10 }], no_more: true }
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    expect((getter('append-extra-clear')!.extra as { cursor: string }).cursor).toBe(
      'old-cursor'
    )
    mode = 'refreshed'
    await initData({
      getter,
      setter,
      func,
      query: { __refresh__: true } as RequestParams
    })
    // 刷新响应无 extra → store.extra 必须复位 null，不残留 old-cursor
    expect(getter('append-extra-clear')!.extra).toBeNull()
  })

  it('note 端到端：首屏→loadMore翻第2页(extra.cursor)→刷新整表替换回第一页', async () => {
    // 完整复刻 note 瀑布流数据流：fetcher 从 params.extra.cursor 翻页。
    // 旧实现（sinceId 跳 RESET append）会把刷新结果 append 到「已翻 2 页」的旧列表，
    // 去重后看似「刷不出」。新实现（append → refresh replace）整表替换回第一页。
    const pages: Record<string, { result: Array<{ id: number }>; extra?: { cursor: string }; no_more: boolean }> = {
      // cursor='' → 第一页（含最新岗位）
      '': { result: [{ id: 100 }, { id: 101 }], extra: { cursor: 'c1' }, no_more: false },
      // cursor='c1' → 第二页
      c1: { result: [{ id: 102 }, { id: 103 }], extra: { cursor: 'c2' }, no_more: false }
    }
    const func = createApi<RequestParams, unknown>({
      id: 'note-e2e',
      type: 'sinceId',
      mergeStrategy: 'append',
      uniqueKey: 'id',
      fetcher: async (params) => {
        // 刷新（initData 不注入 params.extra）→ cursor='' → 第一页
        const cursor =
          (params.extra as { cursor?: string } | undefined)?.cursor ?? ''
        return pages[cursor] ?? { result: [], no_more: true }
      }
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    // 首屏第一页
    expect(
      (getter('note-e2e')!.result as Array<{ id: number }>).map((m) => m.id)
    ).toEqual([100, 101])
    // loadMore 翻第二页：fetcher 通过 params.extra.cursor='c1' 拿第二页，去重追加
    await loadMore({ getter, setter, func })
    expect(
      (getter('note-e2e')!.result as Array<{ id: number }>).map((m) => m.id)
    ).toEqual([100, 101, 102, 103])
    // 模拟刷新时第一页有新岗位插入（id:99 在最前）
    pages[''] = {
      result: [{ id: 99 }, { id: 100 }, { id: 101 }],
      extra: { cursor: 'c1' },
      no_more: false
    }
    // 下拉刷新：整表替换回第一页（丢弃已翻的第二页 102/103），呈现最新岗位
    await initData({
      getter,
      setter,
      func,
      query: { __refresh__: true } as RequestParams
    })
    expect(
      (getter('note-e2e')!.result as Array<{ id: number }>).map((m) => m.id)
    ).toEqual([99, 100, 101])
  })

  it('刷新过程中不出现 result 清空的中间态（不白屏）', async () => {
    let resolveFetch!: (v: { result: unknown; no_more: boolean }) => void
    const func = createApi<RequestParams, unknown>({
      id: 'append-no-flash',
      type: 'sinceId',
      mergeStrategy: 'append',
      uniqueKey: 'id',
      fetcher: () =>
        new Promise<{ result: unknown; no_more: boolean }>((res) => {
          resolveFetch = res
        })
    })
    await initState({ getter, setter, func })
    setter({
      key: 'append-no-flash',
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField({
        fetched: true,
        result: [{ id: 1 }, { id: 2 }]
      })
    })
    const refreshPromise = initData({
      getter,
      setter,
      func,
      query: { __refresh__: true } as RequestParams
    })
    // 请求在途：旧 result 必须仍在（不被预先清空）
    const inflight = getter('append-no-flash')!
    expect((inflight.result as unknown[]).length).toBe(2)
    resolveFetch({ result: [{ id: 9 }], no_more: true })
    await refreshPromise
    // 请求完成后整表替换为新数据
    expect(
      (getter('append-no-flash')!.result as Array<{ id: number }>).map(
        (m) => m.id
      )
    ).toEqual([9])
  })
})

describe('mergeStrategy=replace：loadMore 与 refresh 均整表替换（原 PAGINATION 行为）', () => {
  it('loadMore 用新页替换旧页', async () => {
    let page = 0
    const func = createApi<RequestParams, unknown>({
      id: 'replace-loadmore',
      type: 'jump',
      mergeStrategy: 'replace',
      uniqueKey: 'id',
      fetcher: async () => {
        page += 1
        return page === 1
          ? { result: [{ id: 1 }, { id: 2 }], no_more: false }
          : { result: [{ id: 3 }, { id: 4 }], no_more: false }
      }
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    await loadMore({ getter, setter, func, query: { page: 2 } as RequestParams })
    const field = getter('replace-loadmore')!
    // PAGINATION 语义：第二页替换第一页，不追加
    expect((field.result as Array<{ id: number }>).map((m) => m.id)).toEqual([
      3, 4
    ])
  })

  it('refresh 整表替换', async () => {
    let mode: 'first' | 'refreshed' = 'first'
    const func = createApi<RequestParams, unknown>({
      id: 'replace-refresh',
      type: 'jump',
      mergeStrategy: 'replace',
      uniqueKey: 'id',
      fetcher: async () =>
        mode === 'first'
          ? { result: [{ id: 1 }, { id: 2 }], no_more: false }
          : { result: [{ id: 5 }], no_more: false }
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    mode = 'refreshed'
    await initData({
      getter,
      setter,
      func,
      query: { __refresh__: true } as RequestParams
    })
    expect(
      (getter('replace-refresh')!.result as Array<{ id: number }>).map(
        (m) => m.id
      )
    ).toEqual([5])
  })
})

describe('mergeStrategy=preserve：聊天实时流（保 chatroom 两条不变量）', () => {
  it('loadMore 去重追加（与 append 同）', async () => {
    let page = 0
    const func = createApi<RequestParams, unknown>({
      id: 'preserve-loadmore',
      type: 'sinceId',
      mergeStrategy: 'preserve',
      uniqueKey: 'id',
      is_up: true,
      fetcher: async () => {
        page += 1
        return page === 1
          ? { result: [{ id: 5 }, { id: 6 }], no_more: false }
          : { result: [{ id: 3 }, { id: 4 }], no_more: false }
      }
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    await loadMore({ getter, setter, func })
    const field = getter('preserve-loadmore')!
    // is_up=true → 历史消息 prepend 到前面
    expect((field.result as Array<{ id: number }>).map((m) => m.id)).toEqual([
      3, 4, 5, 6
    ])
  })

  it('不变量1：silent refresh 拉回重叠项不产生重复行', async () => {
    let payload = [
      { id: 1, v: 'a' },
      { id: 2, v: 'b' }
    ]
    const func = createApi<RequestParams, unknown>({
      id: 'preserve-dedup',
      type: 'sinceId',
      mergeStrategy: 'preserve',
      uniqueKey: 'id',
      fetcher: async () => ({ result: payload, no_more: false })
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    payload = [
      { id: 2, v: 'b' },
      { id: 3, v: 'c' }
    ]
    await initData({
      getter,
      setter,
      func,
      query: { __refresh__: true } as RequestParams
    })
    expect(
      (getter('preserve-dedup')!.result as Array<{ id: number }>).map((m) => m.id)
    ).toEqual([1, 2, 3])
  })

  it('不变量2：refresh 在途时到达的 in-flight 新项不被覆盖丢失', async () => {
    let resolveFetch!: (v: { result: unknown; no_more: boolean }) => void
    const func = createApi<RequestParams, unknown>({
      id: 'preserve-inflight',
      type: 'sinceId',
      mergeStrategy: 'preserve',
      uniqueKey: 'id',
      fetcher: () =>
        new Promise<{ result: unknown; no_more: boolean }>((res) => {
          resolveFetch = res
        })
    })
    await initState({ getter, setter, func })
    setter({
      key: 'preserve-inflight',
      type: ENUM.SETTER_TYPE.RESET,
      value: generateDefaultField({
        fetched: true,
        result: [{ id: 1 }, { id: 2 }]
      })
    })
    const refreshPromise = initData({
      getter,
      setter,
      func,
      query: { __refresh__: true } as RequestParams
    })
    // 网络在途期间外部写入 in-flight 新项 id:99
    const cur = getter('preserve-inflight')!
    setter({
      key: 'preserve-inflight',
      type: ENUM.SETTER_TYPE.RESET,
      value: {
        ...cur,
        result: [...(cur.result as unknown[]), { id: 99 }]
      }
    })
    resolveFetch({ result: [{ id: 3 }], no_more: true })
    await refreshPromise
    const ids = (getter('preserve-inflight')!.result as Array<{ id: number }>).map(
      (m) => m.id
    )
    expect(ids).toContain(99)
    expect(ids).toEqual([1, 2, 99, 3])
  })
})
