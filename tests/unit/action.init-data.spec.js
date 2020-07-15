import { initState, initData } from '@/actions'
import { generateFieldName, generateDefaultField } from '@/utils'
import { setter, getter, api } from './env'

describe('init data', () => {
  it('如果 error 了，就直接退出', () => {
    const func = 'func-test-init-data-error'
    const type = 'type'
    const query = {}

    initState({
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        error: true
      }
    })

    initData({
      getter,
      setter,
      func,
      type,
      query,
      api
    })

    const state = getter(generateFieldName({
      func,
      type,
      query
    }))

    const field = generateDefaultField({
      error: true
    })

    expect(state).toEqual(field)
  })

  it('如果 loading 了，就直接退出', () => {
    const func = 'func-test-init-data-loading'
    const type = 'type'
    const query = {}

    initState({
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        loading: true
      }
    })

    initData({
      getter,
      setter,
      func,
      type,
      query,
      api
    })

    const state = getter(generateFieldName({
      func,
      type,
      query
    }))

    const field = generateDefaultField({
      loading: true
    })

    expect(state).toEqual(field)
  })

  it('如果 fetched 了，就直接退出', () => {
    const func = 'func-test-init-data-fetched'
    const type = 'type'
    const query = {}

    initState({
      getter,
      setter,
      func,
      type,
      query,
      opts: {
        fetched: true
      }
    })

    initData({
      getter,
      setter,
      func,
      type,
      query,
      api
    })

    const state = getter(generateFieldName({
      func,
      type,
      query
    }))

    const field = generateDefaultField({
      fetched: true
    })

    expect(state).toEqual(field)
  })

  it('如果正常初始化，就正常请求', () => {
    const func = 'testArrFunc'
    const type = 'type'
    const query = {}

    initState({
      getter,
      setter,
      func,
      type,
      query
    })

    initData({
      getter,
      setter,
      func,
      type,
      query,
      api
    })
      .then(() => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        const field = generateDefaultField({
          result: api.testArrData.result,
          total: api.testArrData.total,
          noMore: api.testArrData.no_more,
          fetched: true,
          page: 1
        })

        expect(state).toEqual(field)
      })
  })

  it('如果接口异常，就走到 reject', () => {
    const func = 'testError'
    const type = 'type'
    const query = {}

    initState({
      getter,
      setter,
      func,
      type,
      query
    })

    initData({
      getter,
      setter,
      func,
      type,
      query,
      api
    })
      .then(() => {})
      .catch(error => {
        const state = getter(generateFieldName({
          func,
          type,
          query
        }))

        const field = generateDefaultField({ error })

        expect(state).toEqual(field)
      })
  })
})
