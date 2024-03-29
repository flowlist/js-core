// @ts-nocheck
import { SET_DATA } from '../../src/setters'
import { generateDefaultField, generateFieldName } from '../../src/utils'
import { setter, getter, cache } from './env'

describe('set data', () => {
  it('如果 field 未初始化，则直接返回', async () => {
    const fieldName = generateFieldName({
      func: 'func2',
      type: 'type'
    })
    const data = [{ id: 1 }, { id: 2 }]
    try {
      await SET_DATA({
        cache,
        setter,
        getter,
        data: generateDefaultField({
          result: data
        }),
        fieldName
      })
    } catch (e) {
      // do nothing
    }

    const field = getter(fieldName)

    expect(field).toEqual(null)
  })

  it('set 之后，fetched 为 true', async () => {
    const fieldName = generateFieldName({
      func: 'func3',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    const result = [{ id: 1 }, { id: 2 }]

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    const field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: true
      })
    )
  })

  it('如果 fetched 已经是 true 了，那么 nothing 永远是 false', async () => {
    const fieldName = generateFieldName({
      func: 'func3',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField({
        fetched: true
      })
    })
    const result = [{ id: 1 }, { id: 2 }]

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    const field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        nothing: false
      })
    )
  })

  it('set 之后，loading 为 false', async () => {
    const fieldName = generateFieldName({
      func: 'func4',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    const result = [{ id: 1 }, { id: 2 }]

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    const field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        loading: false
      })
    )
  })

  it('set 之后，nothing 为 数据的返回数', async () => {
    let fieldName = generateFieldName({
      func: 'func5',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    let result = [{ id: 1 }, { id: 2 }]

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    let field = getter(fieldName)
    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        loading: field.loading,
        nothing: false
      })
    )

    fieldName = generateFieldName({
      func: 'func6',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    result = []

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        loading: field.loading,
        noMore: true,
        nothing: true
      })
    )

    fieldName = generateFieldName({
      func: 'func7',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    result = {
      a: [],
      b: []
    }

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        loading: field.loading,
        noMore: true,
        nothing: true
      })
    )

    fieldName = generateFieldName({
      func: 'func8',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })
    result = {
      a: [1, 2],
      b: []
    }

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result
      },
      fieldName
    })
    field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        loading: field.loading,
        nothing: false
      })
    )
  })

  it('set 之后，total 为 返回值或 0', async () => {
    let fieldName = generateFieldName({
      func: 'func9',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result: [],
        total: 100
      },
      fieldName
    })

    let field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        loading: field.loading,
        nothing: field.nothing,
        noMore: true,
        total: 100
      })
    )

    fieldName = generateFieldName({
      func: 'func10',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result: []
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        loading: field.loading,
        nothing: field.nothing,
        noMore: true,
        total: 0
      })
    )
  })

  it('set 之后，noMore 由 type 和 result 定', async () => {
    let fieldName = generateFieldName({
      func: 'func11',
      type: 'jump'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    await SET_DATA({
      cache,
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

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        loading: field.loading,
        nothing: field.nothing,
        noMore: false
      })
    )

    fieldName = generateFieldName({
      func: 'func12',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result: [],
        no_more: true
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        loading: field.loading,
        nothing: field.nothing,
        noMore: true
      })
    )
  })

  it('set 之后，如果 type 是 jump，使用 query 里的 page，否则 page = field 的 page + 1', async () => {
    const fieldName = generateFieldName({
      func: 'func14',
      type: 'jump'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    await SET_DATA({
      cache,
      setter,
      getter,
      page: 99,
      type: 'jump',
      data: {
        result: []
      },
      fieldName
    })

    let field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: 99,
        fetched: field.fetched,
        loading: field.loading,
        nothing: field.nothing
      })
    )

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result: []
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: 100,
        noMore: true,
        fetched: field.fetched,
        loading: field.loading,
        nothing: field.nothing
      })
    )

    await SET_DATA({
      cache,
      setter,
      getter,
      data: {
        result: []
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: 101,
        noMore: true,
        fetched: field.fetched,
        loading: field.loading,
        nothing: field.nothing
      })
    )

    await SET_DATA({
      cache,
      setter,
      getter,
      page: 99,
      type: 'jump',
      data: {
        result: []
      },
      fieldName
    })

    field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: 99,
        fetched: field.fetched,
        loading: field.loading,
        nothing: field.nothing
      })
    )
  })

  it('set 之后，如果设置了 extra，则写入 extra', async () => {
    const fieldName = generateFieldName({
      func: 'func15',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    await SET_DATA({
      cache,
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

    const field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: field.result,
        page: field.page,
        fetched: field.fetched,
        loading: field.loading,
        nothing: field.nothing,
        noMore: true,
        extra: {
          a: 1
        }
      })
    )
  })

  it('如果 data 是 object，则 page 是 -1', async () => {
    const fieldName = generateFieldName({
      func: 'func16',
      type: 'type'
    })
    setter({
      key: fieldName,
      type: 0,
      value: generateDefaultField()
    })

    const result = {
      k: 123,
      v: 456
    }

    await SET_DATA({
      cache,
      setter,
      getter,
      data: result,
      fieldName
    })

    const field = getter(fieldName)

    expect(field).toEqual(
      generateDefaultField({
        result: result,
        page: -1,
        fetched: true,
        loading: false,
        noMore: true
      })
    )
  })
})
