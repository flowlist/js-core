import { initState, initData } from '@/actions'
import { generateFieldName, generateDefaultField, getDateFromCache } from '@/utils'
import { setter, getter } from './env'
import * as api from './api'

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

  it('如果 refresh，即使 fetched 了也要发请求', () => {
    const func = 'testArrFunc'
    const type = 'type'
    const query = {
      __refresh__: true
    }

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
  })

  it('如果 refresh，但不 reload，发请求之前 field 就初始化', () => {
    const func = 'testArrFunc'
    const type = 'type'
    const query = {
      __refresh__: true
    }

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

    initData({
      getter,
      setter,
      func,
      type,
      query,
      api
    })
      .then(() => {
        let state = getter(generateFieldName({
          func,
          type,
          query
        }))

        let field = generateDefaultField({
          result: api.testArrData.result,
          total: api.testArrData.total,
          noMore: api.testArrData.no_more,
          fetched: true,
          page: 1
        })

        expect(state).toEqual(field)

        initData({
          getter,
          setter,
          func,
          type,
          query,
          api
        })

        state = getter(generateFieldName({
          func,
          type,
          query
        }))

        field = generateDefaultField({
          loading: true
        })

        expect(state).toEqual(field)
      })
  })

  it('如果 refresh，且 reload，发请求之后 field 才初始化', () => {
    const func = 'testArrFunc'
    const type = 'type'
    const query = {
      __refresh__: true,
      __reload__: true
    }

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

    initData({
      getter,
      setter,
      func,
      type,
      query,
      api
    })
      .then(() => {
        let state = getter(generateFieldName({
          func,
          type,
          query
        }))

        let field = generateDefaultField({
          result: api.testArrData.result,
          total: api.testArrData.total,
          noMore: api.testArrData.no_more,
          fetched: true,
          page: 1
        })

        expect(state).toEqual(field)

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

        state = getter(generateFieldName({
          func,
          type,
          query
        }))

        expect(state).toEqual(field)
      })
  })

  it('调用 callback', () => {
    const func = 'testArrFunc'
    const type = 'type'
    let query = {}

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
      api,
      callback: ({ data, refresh }) => {
        expect(refresh).toBe(!!query.__refresh__)
        expect(data).toEqual(api.testArrData)
      }
    })

    query = {
      __refresh__: true
    }

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
      api,
      callback: ({ data, refresh }) => {
        expect(refresh).toBe(!!query.__refresh__)
        expect(data).toEqual(api.testArrData)
      }
    })
  })

  it('设置缓存', () => {
    const func = 'testArrFunc'
    const type = 'cache'
    let query = {}

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
      api,
      cacheTimeout: 100
    })
      .then(() => {
        const fieldName = generateFieldName({
          func,
          type,
          query
        })

        const state = getter(fieldName)

        const cache = getDateFromCache({
          key: fieldName,
          now: 0
        })

        expect(state).toEqual(cache)
      })
  })
})
