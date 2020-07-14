import { initState } from '@/actions'
import { generateFieldName, generateDefaultField } from '@/utils'
import { setter, getter } from './env'

describe('init state', () => {
  it('state 可以被正常初始化', () => {
    const func = 'func-name-233'
    const type = 'type-name-666'
    const query = {
      a: 1,
      b: 2
    }

    initState({
      getter,
      setter,
      func,
      type,
      query
    })

    const state = getter(generateFieldName({
      func,
      type,
      query
    }))

    const field = generateDefaultField()

    expect(state).toEqual(field)
  })
})
