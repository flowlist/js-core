import { SET_DATA } from '@/setters'
import { generateDefaultField, generateFieldName } from '@/utils'
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
})
