import { SET_DATA } from '@/setters'
import { generateDefaultField, generateFieldName, getDateFromCache } from '@/utils'
import { setter, getter } from './env'

describe('set data', () => {
  it('如果数据从 localStorage 得来，直接 set', () => {
    const fieldName = generateFieldName('func1', 'type')
    const data = [{ id: 1 }, { id: 2 }]
    SET_DATA({
      setter,
      data: generateDefaultField({
        result: data
      }),
      fieldName,
      fromLocal: true
    })

    const field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: data
    }))
  })

  it('如果 field 未初始化，则直接返回', () => {
    const fieldName = generateFieldName('func2', 'type')
    const data = [{ id: 1 }, { id: 2 }]
    SET_DATA({
      setter,
      getter,
      data: generateDefaultField({
        result: data
      }),
      fieldName
    })

    const field = getter(fieldName)

    expect(field).toEqual(null)
  })

  it('set 之后，fetched 为 true', () => {
    const fieldName = generateFieldName('func3', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    const result = [{ id: 1 }, { id: 2 }]

    SET_DATA({
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    const field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: true
    }))
  })

  it('如果 fetched 已经是 true 了，那么 nothing 永远是 false', () => {
    const fieldName = generateFieldName('func3', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField({
        fetched: true
      })
    })
    const result = [{ id: 1 }, { id: 2 }]

    SET_DATA({
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    const field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      nothing: false
    }))
  })

  it('set 之后，loading 为 false', () => {
    const fieldName = generateFieldName('func4', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    const result = [{ id: 1 }, { id: 2 }]

    SET_DATA({
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    const field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      loading: false
    }))
  })

  it('set 之后，nothing 为 数据的返回数', () => {
    let fieldName = generateFieldName('func5', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    let result = [{ id: 1 }, { id: 2 }]

    SET_DATA({
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    let field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      loading: field.loading,
      nothing: false
    }))

    fieldName = generateFieldName('func6', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    result = []

    SET_DATA({
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      loading: field.loading,
      nothing: true
    }))

    fieldName = generateFieldName('func7', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    result = {
      a: [],
      b: []
    }

    SET_DATA({
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      loading: field.loading,
      nothing: true
    }))

    fieldName = generateFieldName('func8', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    result = {
      a: [1, 2],
      b: []
    }

    SET_DATA({
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })
    field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      loading: field.loading,
      nothing: false
    }))
  })

  it('set 之后，total 为 返回值或 0', () => {
    let fieldName = generateFieldName('func9', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    SET_DATA({
      setter,
      getter,
      data: {
        result: [],
        total: 100
      },
      fieldName
    })

    let field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      loading: field.loading,
      nothing: field.nothing,
      total: 100
    }))

    fieldName = generateFieldName('func10', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    SET_DATA({
      setter,
      getter,
      data: {
        result: []
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      loading: field.loading,
      nothing: field.nothing,
      total: 0
    }))
  })

  it('set 之后，noMore 由 type 和 result 定', () => {
    let fieldName = generateFieldName('func11', 'jump')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    SET_DATA({
      setter,
      getter,
      type: 'jump',
      data: {
        result: [],
        no_more: true
      },
      fieldName
    })

    let field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      loading: field.loading,
      nothing: field.nothing,
      noMore: false
    }))

    fieldName = generateFieldName('func12', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    SET_DATA({
      setter,
      getter,
      data: {
        result: [],
        no_more: true
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      loading: field.loading,
      nothing: field.nothing,
      noMore: true
    }))
  })

  it('set 之后，当 nothing 为 true，即使加了 cacheTimeout，cache 也不生效', () => {
    let fieldName = generateFieldName('func12', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    SET_DATA({
      setter,
      getter,
      type: 'type',
      data: {
        result: []
      },
      cacheTimeout: 1000,
      fieldName
    })

    const result = getDateFromCache({
      key: fieldName,
      now: 0,
    })

    expect(result).toBeNull()
  })

  it('set 之后，当设置 cacheTimeout，set cache 生效', () => {
    let fieldName = generateFieldName('func13', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    SET_DATA({
      setter,
      getter,
      type: 'type',
      data: {
        result: [{ a: 1 }]
      },
      cacheTimeout: 1000,
      fieldName
    })

    const result = getDateFromCache({
      key: fieldName,
      now: 0,
    })

    let field = getter(fieldName)

    expect(result).toEqual(field)
  })

  it('set 之后，如果参数中有 page，使用参数中的 page，如果参数中没有，field 的 page + 1', () => {
    let fieldName = generateFieldName('func14', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    SET_DATA({
      setter,
      getter,
      page: 99,
      data: {
        result: []
      },
      fieldName
    })

    let field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: 99,
      fetched: field.fetched,
      loading: field.loading,
      nothing: field.nothing
    }))
  })

  it('set 之后，如果设置了 extra，则写入 extra', () => {
    let fieldName = generateFieldName('func15', 'type')
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    SET_DATA({
      setter,
      getter,
      data: {
        result: [],
        extra: {
          a: 1
        }
      },
      fieldName
    })

    let field = getter(fieldName)

    expect(field).toEqual(generateDefaultField({
      result: field.result,
      page: field.page,
      fetched: field.fetched,
      loading: field.loading,
      nothing: field.nothing,
      extra: {
        a: 1
      }
    }))
  })
})
