// @ts-nocheck
import { SET_ERROR } from '../../src/setters'
import { generateDefaultField, generateFieldName } from '../../src/utils'
import { setter, getter } from './env'

describe('set error', () => {
  it('设置一个 error，loading 会变成 false', () => {
    const key = generateFieldName('func', 'type')
    const value = generateDefaultField({
      loading: true
    })
    setter({
      key,
      type: 0,
      value
    })
    SET_ERROR({
      setter,
      fieldName: key,
      error: {
        message: 'this is a error'
      }
    })
    const field = getter(key)

    expect(field).toEqual({
      ...generateDefaultField(),
      error: {
        message: 'this is a error'
      }
    })
  })
})
