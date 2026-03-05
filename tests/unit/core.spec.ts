/**
 * core 模块测试：generateFieldName, createApi, initState, initData, loadMore
 */
import {
  generateFieldName,
  createApi,
  initState,
  initData,
  loadMore
} from '../../src/core'
import ENUM from '../../src/constants'
import { getter, setter, clearStore } from '../helpers/store'
import { createTestApi, testListResponse, createFailingApi } from '../helpers/api'
import type { RequestParams } from '../../src/types'

beforeEach(clearStore)

describe('generateFieldName', () => {
  const func = createTestApi({ id: 'my-api' })

  it('无 query 时返回 func.id', () => {
    expect(generateFieldName({ func })).toBe('my-api')
  })

  it('有 query 时拼接排序后的 key-value', () => {
    const name = generateFieldName({ func, query: { a: 1, b: 2 } as RequestParams })
    expect(name).toContain('my-api')
    expect(name).toMatch(/a-1/)
    expect(name).toMatch(/b-2/)
  })

  it('paramsIgnore 的 key 不参与拼接', () => {
    const api = createTestApi({ id: 'x', paramsIgnore: ['page'] })
    const name = generateFieldName({ func: api, query: { page: 1, id: 2 } as RequestParams })
    expect(name).not.toMatch(/page/)
    expect(name).toMatch(/id-2/)
  })

  it('对象 query 值会 stableSerialize', () => {
    const name = generateFieldName({
      func,
      query: { filter: { b: 1, a: 2 } } as RequestParams
    })
    expect(name).toContain('filter')
  })
})

describe('createApi', () => {
  it('返回可调用的函数且带元数据', async () => {
    const api = createTestApi()
    expect(api.id).toBe('test-api')
    expect(api.type).toBe('page')
    expect(api.uniqueKey).toBe('id')
    expect(api.paramsIgnore).toContain('page')
    const res = await api({} as RequestParams)
    expect(res).toEqual(testListResponse())
  })

  it('默认 type 为 SCROLL_LOAD_MORE', () => {
    const api = createApi<RequestParams, unknown>({
      id: 'x',
      fetcher: async () => ({ result: [] })
    })
    expect(api.type).toBe(ENUM.FETCH_TYPE.SCROLL_LOAD_MORE)
  })

  it('返回对象不可变', () => {
    const api = createTestApi()
    expect(Object.isFrozen(api)).toBe(true)
  })
})

describe('initState', () => {
  it('已有 field 时直接 resolve，不重复 set', async () => {
    const func = createTestApi({ id: 'init-api' })
    await initState({ getter, setter, func })
    expect(getter('init-api')).toBeDefined()
    const setSpy = jest.fn((p: { callback?: () => void }) => { p.callback?.() })
    await initState({ getter, setter: setSpy, func })
    expect(setSpy).not.toHaveBeenCalled()
  })

  it('未初始化时 set 默认 field 并 resolve', async () => {
    const func = createTestApi({ id: 'new-api' })
    await initState({ getter, setter, func })
    const field = getter('new-api')
    expect(field).toBeDefined()
    expect(field!.fetched).toBe(false)
    expect(field!.result).toEqual([])
  })
})

describe('initData', () => {
  it('未初始化时发起请求并 SET_DATA', async () => {
    const func = createTestApi({ id: 'fetch-api' })
    await initState({ getter, setter, func })
    const callback = jest.fn()
    await initData({ getter, setter, func, callback })
    const field = getter('fetch-api')!
    expect(field.fetched).toBe(true)
    expect(field.result).toEqual(testListResponse().result)
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ data: testListResponse(), refresh: false })
    )
  })

  it('已 fetched 且无 __refresh__ 时直接 resolve', async () => {
    await initState({ getter, setter, func: createTestApi({ id: 'done-api' }) })
    await initData({ getter, setter, func: createTestApi({ id: 'done-api' }) })
    const callback = jest.fn()
    await initData({ getter, setter, func: createTestApi({ id: 'done-api' }), callback })
    expect(callback).not.toHaveBeenCalled()
  })

  it('loading 中直接 resolve', async () => {
    let resolvePromise: (v: any) => void
    const pending = new Promise<any>((r) => { resolvePromise = r })
    const func = createApi<RequestParams, unknown>({
      id: 'slow-api',
      fetcher: () => pending
    })
    await initState({ getter, setter, func })
    const p1 = initData({ getter, setter, func })
    const p2 = initData({ getter, setter, func })
    resolvePromise!({ result: [] })
    await Promise.all([p1, p2])
    const field = getter('slow-api')!
    expect(field.result).toEqual([])
  })

  it('有 error 且无 __refresh__ 时直接 resolve', async () => {
    const failApi = createFailingApi()
    await initState({ getter, setter, func: failApi })
    await initData({ getter, setter, func: failApi }).catch(() => {})
    const callback = jest.fn()
    await initData({ getter, setter, func: failApi, callback })
    expect(callback).not.toHaveBeenCalled()
  })

  it('请求失败时 SET_ERROR 并 reject', async () => {
    const err = new Error('fail')
    const func = createFailingApi(err)
    await initState({ getter, setter, func })
    await expect(initData({ getter, setter, func })).rejects.toThrow('fail')
    const field = getter('fail-api')!
    expect(field.error).toBe(err)
    expect(field.loading).toBe(false)
  })

  it('__refresh__ 且非 __reload__ 时先 reset 再拉取', async () => {
    const func = createTestApi({ id: 'refresh-api' })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    const callback = jest.fn()
    await initData({
      getter,
      setter,
      func,
      query: { __refresh__: true } as RequestParams,
      callback
    })
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ refresh: true })
    )
  })
})

describe('loadMore', () => {
  it('无 field 或 loading 或 nothing 时直接 resolve', async () => {
    const func = createTestApi({ id: 'lm-api' })
    await loadMore({ getter, setter, func }).then(() => {})
    await initState({ getter, setter, func })
    setter({
      key: 'lm-api',
      type: 1,
      value: { loading: true },
      callback: () => {}
    })
    await loadMore({ getter, setter, func }).then(() => {})
    setter({
      key: 'lm-api',
      type: 1,
      value: { loading: false, nothing: true },
      callback: () => {}
    })
    await loadMore({ getter, setter, func }).then(() => {})
  })

  it('noMore 且非 errorRetry 时直接 resolve', async () => {
    const func = createTestApi({ id: 'nomore-api' })
    await initState({ getter, setter, func })
    setter({
      key: 'nomore-api',
      type: 1,
      value: { noMore: true },
      callback: () => {}
    })
    await loadMore({ getter, setter, func }).then(() => {})
  })

  it('type=PAGINATION 时 loadingState 含 result:[]、extra:null', async () => {
    const func = createApi<RequestParams, unknown>({
      id: 'pag-load-api',
      type: 'jump',
      uniqueKey: 'id',
      fetcher: async () => ({ result: [{ id: 1 }], no_more: true, total: 1 })
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    await loadMore({ getter, setter, func })
    const field = getter('pag-load-api')!
    expect(Array.isArray(field.result)).toBe(true)
  })

  it('PAGINATION 且 query.page 等于当前 page 时直接 resolve', async () => {
    const func = createApi<RequestParams, unknown>({
      id: 'pag-api',
      type: 'jump',
      uniqueKey: 'id',
      fetcher: async () => ({ result: [] })
    })
    await initState({ getter, setter, func })
    setter({
      key: 'pag-api',
      type: 1,
      value: { page: 2, noMore: false, loading: false },
      callback: () => {}
    })
    await loadMore({ getter, setter, func, query: { page: 2 } as RequestParams })
    const field = getter('pag-api')!
    expect(field.page).toBe(2)
  })

  it('noMore 且 errorRetry 为 true 时仍会请求', async () => {
    const func = createTestApi({ id: 'retry-api' })
    await initState({ getter, setter, func })
    setter({
      key: 'retry-api',
      type: 1,
      value: { noMore: true, loading: false },
      callback: () => {}
    })
    let called = false
    const retryApi = createApi<RequestParams, unknown>({
      id: 'retry-api',
      type: 'page',
      uniqueKey: 'id',
      fetcher: async () => {
        called = true
        return { result: [{ id: 4 }], no_more: true, total: 4 }
      }
    })
    await loadMore({ getter, setter, func: retryApi, errorRetry: true })
    expect(called).toBe(true)
  })

  it('正常 loadMore 会请求并合并 result', async () => {
    const func = createTestApi({ id: 'lm2-api' })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    const more = { result: [{ id: 4, slug: 'd' }], no_more: true, total: 4 }
    const apiWithMore = createApi<RequestParams, unknown>({
      id: 'lm2-api',
      type: 'page',
      uniqueKey: 'id',
      fetcher: async (params) => (params.page === 2 ? more : testListResponse())
    })
    await loadMore({ getter, setter, func: apiWithMore })
    const field = getter('lm2-api')!
    expect(Array.isArray(field.result)).toBe(true)
    expect((field.result as any[]).length).toBeGreaterThanOrEqual(3)
  })

  it('loadMore 成功时调用 callback', async () => {
    const first = { result: [{ id: 1 }, { id: 2 }], no_more: false, total: 10 }
    const second = { result: [{ id: 3 }], no_more: true, total: 10 }
    let callCount = 0
    const func = createApi<RequestParams, unknown>({
      id: 'lm-cb-api',
      type: 'page',
      uniqueKey: 'id',
      fetcher: async () => (++callCount === 1 ? first : second)
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    const callback = jest.fn()
    await loadMore({ getter, setter, func, callback })
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        refresh: false,
        data: second,
        params: expect.any(Object)
      })
    )
  })

  it('loadMore 时若 field 有 extra 则带入 params.extra', async () => {
    const first = { result: [{ id: 1 }], no_more: false, total: 10 }
    let capturedParams: any = null
    const func = createApi<RequestParams, unknown>({
      id: 'lm-extra-api',
      type: 'page',
      uniqueKey: 'id',
      fetcher: async (params) => {
        capturedParams = params
        return first
      }
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    setter({
      key: 'lm-extra-api',
      type: 1,
      value: { extra: { cursor: 'next' } },
      callback: () => {}
    })
    await loadMore({ getter, setter, func })
    expect(capturedParams?.extra).toEqual({ cursor: 'next' })
  })

  it('loadMore 请求失败时 SET_ERROR 并 reject', async () => {
    const first = { result: [{ id: 1 }], no_more: false, total: 10 }
    const err = new Error('load more failed')
    let callCount = 0
    const func = createApi<RequestParams, unknown>({
      id: 'lm-err-api',
      type: 'page',
      uniqueKey: 'id',
      fetcher: async () => (++callCount === 1 ? first : Promise.reject(err))
    })
    await initState({ getter, setter, func })
    await initData({ getter, setter, func })
    await expect(loadMore({ getter, setter, func })).rejects.toThrow('load more failed')
    const field = getter('lm-err-api')!
    expect(field.error).toBe(err)
    expect(field.loading).toBe(false)
  })
})
