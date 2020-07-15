import { initState, initData, loadMore } from '@/actions'
import { generateFieldName, generateDefaultField, getDateFromCache } from '@/utils'
import { setter, getter } from './env'
import * as api from './api'

describe('load more', () => {
  it('如果 field 为空就 return', () => {
    const func = 'func-test-load-more-null'
    const type = 'type'
    const query = {}

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
    const query = {}

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
    const query = {}

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
    const query = {}

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

  it('如果 type 是 jump，page 相同 则 return', () => {
    const func = 'func-test-load-more-page'
    const type = 'jump'
    const query = {
      page: 10
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
})
