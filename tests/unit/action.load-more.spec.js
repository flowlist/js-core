import { initState, initData, loadMore } from '@/actions'
import { generateFieldName, generateDefaultField } from '@/utils'
import { setter, getter } from './env'
import * as api from './api'

describe('load more', () => {
  it('如果 field 为空就 return', () => {
    const func = 'func-test-load-more-null'
    const type = 'type'
    const query = {
      test_order: 1
    }

    loadMore({
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

    expect(state).toEqual(null)
  })

  it('如果正在 loading，return', () => {
    const func = 'func-test-load-more-loading'
    const type = 'type'
    const query = {
      test_order: 2
    }

    const fieldName = generateFieldName({
      func,
      type,
      query
    })

    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField({
        loading: true
      })
    })

    loadMore({
      getter,
      setter,
      func,
      type,
      query,
      api
    })

    const state = getter(fieldName)

    expect(state).toEqual(generateDefaultField({
      loading: true
    }))
  })

  it('如果 nothing，return', () => {
    const func = 'func-test-load-more-nothing'
    const type = 'type'
    const query = {
      test_order: 3
    }

    const fieldName = generateFieldName({
      func,
      type,
      query
    })

    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField({
        nothing: true
      })
    })

    loadMore({
      getter,
      setter,
      func,
      type,
      query,
      api
    })

    const state = getter(fieldName)

    expect(state).toEqual(generateDefaultField({
      nothing: true
    }))
  })

  it('如果 noMore，return', () => {
    const func = 'func-test-load-more-no_more'
    const type = 'type'
    const query = {
      test_order: 4
    }

    const fieldName = generateFieldName({
      func,
      type,
      query
    })

    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField({
        noMore: true
      })
    })

    loadMore({
      getter,
      setter,
      func,
      type,
      query,
      api
    })

    const state = getter(fieldName)

    expect(state).toEqual(generateDefaultField({
      noMore: true
    }))
  })

  it('如果 error，走到 catch', (done) => {
    const func = 'testError'
    const type = 'type'
    const query = {
      test_order: 99
    }

    const fieldName = generateFieldName({
      func,
      type,
      query
    })

    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    loadMore({
      getter,
      setter,
      func,
      type,
      query,
      api
    })
      .catch(() => {
        const state = getter(fieldName)

        expect(state).toEqual(generateDefaultField({
          error: {
            message: 'error'
          }
        }))

        done()
      })
  })

  it('发请求前，loading 设置为 true', (done) => {
    const func = 'getListByPage'
    const type = 'page'
    const query = {
      test_order: 5,
      count: 10
    }

    const fieldName = generateFieldName({
      func,
      type,
      query
    })

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
        loadMore({
          getter,
          setter,
          func,
          type,
          query,
          api
        })
          .then(() => {
            const state = getter(fieldName)
            expect(state.loading).toBe(false)
            done()
          })

        const state = getter(fieldName)
        expect(state.loading).toBe(true)
      })
  })

  it('如果 type 是 jump，page 相同 则 return', () => {
    const func = 'func-test-load-more-page'
    const type = 'jump'
    const query = {
      page: 10,
      test_order: 6
    }

    const fieldName = generateFieldName({
      func,
      type,
      query
    })

    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField({
        page: 10
      })
    })

    loadMore({
      getter,
      setter,
      func,
      type,
      query,
      api
    })

    const state = getter(fieldName)

    expect(state).toEqual(generateDefaultField({
      page: 10
    }))
  })

  it('如果 type 是 jump，清空之前的 field', (done) => {
    const func = 'getListByJump'
    const type = 'jump'
    const query = {
      test_order: 7,
      page: 1,
      count: 10
    }

    const fieldName = generateFieldName({
      func,
      type,
      query
    })

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
      callback: ({ data }) => {
        const state = getter(fieldName)
        expect({
          result: state.result,
          total: state.total
        }).toEqual(data)
      }
    })
      .then(() => {
        loadMore({
          getter,
          setter,
          func,
          type,
          query: {
            ...query,
            page: query + 1
          },
          api,
          callback: ({ data }) => {
            const state = getter(fieldName)
            expect({
              result: state.result,
              total: state.total
            }).toEqual(data)
            done()
          }
        })
      })
  })

  it('如果 type 是 page，page 自动递增', (done) => {
    const func = 'getListByPage'
    const type = 'page'
    const query = {
      test_order: 8,
      count: 10
    }

    const fieldName = generateFieldName({
      func,
      type,
      query
    })

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
        const state = getter(fieldName)
        expect(state.page).toBe(1)

        loadMore({
          getter,
          setter,
          func,
          type,
          query,
          api
        })
          .then(() => {
            const state = getter(fieldName)
            expect(state.page).toBe(2)
            done()
          })
      })
  })

  it('如果返回值中有 extra，会在下次请求的参数中携带', (done) => {
    const func = 'getListByPage'
    const type = 'page'
    const query = {
      test_order: 9,
      count: 10
    }

    const fieldName = generateFieldName({
      func,
      type,
      query
    })

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
        const state = getter(fieldName)
        loadMore({
          getter,
          setter,
          func,
          type,
          query,
          api,
          callback: ({ params }) => {
            expect(params._extra).toEqual(state.extra)
            done()
          }
        })
      })
  })
})
