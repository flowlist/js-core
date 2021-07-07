// @ts-nocheck
import { searchValueByKey } from '../../src/utils'

describe('safe utils', () => {
  it('isObject', () => {
    const result = {
      a: {
        id: 1
      },
      b: {
        id: 2
      },
      c: {
        id: 3
      }
    }
    expect(searchValueByKey(result, 'a')).toEqual({
      id: 1
    })
  })

  it('isArray undefined', () => {
    const result = [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      }
    ]
    expect(searchValueByKey(result, 4, 'id')).toEqual(undefined)
  })

  it('isArray deep value', () => {
    const result = [
      {
        data: {
          id: 1
        }
      },
      {
        data: {
          id: 2
        }
      },
      {
        data: {
          id: 3
        }
      }
    ]
    expect(searchValueByKey(result, 1, 'data.id')).toEqual({
      data: {
        id: 1
      }
    })
  })
})
