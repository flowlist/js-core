import { initState, initData } from '@/actions'
import { generateFieldName, generateDefaultField } from '@/utils'
import { setter, getter, cache } from './env'
import * as api from './api'

describe('init data', () => {
  it('如果 error 了，就直接退出', () => {
    const func = 'func-test-init-data-error'
    const type = 'type'
    const query = {
      test_order: 0
    }

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
      cache,
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
    const query = {
      test_order: 1
    }

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
      cache,
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
    const query = {
      test_order: 2
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
      cache,
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

  it('如果正常初始化，就正常请求，loading 为 true', (done) => {
    const func = 'testArrFunc'
    const type = 'type'
    const query = {
      test_order: 3
    }

    initState({
      getter,
      setter,
      func,
      type,
      query
    })

    initData({
      cache,
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
          result: api.testArrData().result,
          total: api.testArrData().total,
          noMore: api.testArrData().no_more,
          fetched: true,
          page: 1
        })

        expect(state).toEqual(field)
        done()
      })

    const state = getter(generateFieldName({
      func,
      type,
      query
    }))

    expect(state.loading).toBe(true)
  })

  it('如果接口异常，就走到 reject', (done) => {
    const func = 'testError'
    const type = 'type'
    const query = {
      test_order: 4
    }

    initState({
      getter,
      setter,
      func,
      type,
      query
    })

    initData({
      cache,
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
        done()
      })
  })

  it('如果 refresh，即使 fetched 了也要发请求', (done) => {
    const func = 'testArrFunc'
    const type = 'type'
    const query = {
      test_order: 5,
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
      cache,
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
          result: api.testArrData().result,
          total: api.testArrData().total,
          noMore: api.testArrData().no_more,
          fetched: true,
          page: 1
        })

        expect(state).toEqual(field)

        initData({
          cache,
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
              result: api.testArrData().result,
              total: api.testArrData().total,
              noMore: api.testArrData().no_more,
              fetched: true,
              page: 1
            })

            expect(state).toEqual(field)
            done()
          })
      })
  })

  it('如果 refresh，但不 reload，发请求之前 field 就初始化', (done) => {
    const func = 'testArrFunc'
    const type = 'type'
    const query = {
      test_order: 6,
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
      cache,
      getter,
      setter,
      func,
      type,
      query,
      api
    })

    initData({
      cache,
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
          result: api.testArrData().result,
          total: api.testArrData().total,
          noMore: api.testArrData().no_more,
          fetched: true,
          page: 1
        })

        expect(state).toEqual(field)

        initData({
          cache,
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
        done()
      })
  })

  it('如果 refresh，且 reload，发请求之后 field 才初始化', (done) => {
    const func = 'testArrFunc'
    const type = 'type'
    const query = {
      test_order: 7,
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
      cache,
      getter,
      setter,
      func,
      type,
      query,
      api
    })

    initData({
      cache,
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
          result: api.testArrData().result,
          total: api.testArrData().total,
          noMore: api.testArrData().no_more,
          fetched: true,
          page: 1
        })

        expect(state).toEqual(field)

        initData({
          cache,
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
              result: api.testArrData().result,
              total: api.testArrData().total,
              noMore: api.testArrData().no_more,
              fetched: true,
              page: 1
            })

            expect(state).toEqual(field)
            done()
          })

        state = getter(generateFieldName({
          func,
          type,
          query
        }))

        expect(state).toEqual(field)
      })
  })

  it('调用 callback', (done) => {
    const func = 'testArrFunc'
    const type = 'type'
    let query = {
      test_order: 8
    }

    initState({
      getter,
      setter,
      func,
      type,
      query
    })

    initData({
      cache,
      getter,
      setter,
      func,
      type,
      query,
      api,
      callback: ({ data, refresh }) => {
        expect(refresh).toBe(!!query.__refresh__)
        expect(data).toEqual(api.testArrData())
        done()
      }
    })
  })

  it('设置缓存', (done) => {
    const func = 'testArrFunc'
    const type = 'cache'
    let query = {
      test_order: 9
    }

    initState({
      getter,
      setter,
      func,
      type,
      query
    })

    let counter = jest.spyOn(api, 'testArrFunc')

    initData({
      cache,
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
        const cacheData = cache.get({ key: fieldName })

        expect(state).toEqual(cacheData)

        initData({
          cache,
          getter,
          setter,
          func,
          type,
          query: {
            ...query,
            __refresh__: true
          },
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
            const cacheData = cache.get({ key: fieldName })

            expect(state).toEqual(cacheData)
            expect(counter).toBeCalledTimes(1)
            done()
          })
      })
  })
})
