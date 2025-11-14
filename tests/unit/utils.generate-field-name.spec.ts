// @ts-nocheck
import { generateFieldName } from '../../src/utils'

describe('generate field name', () => {
  const func = 'func'
  const type = 'type'

  it('query 为空', () => {
    const name = generateFieldName({
      func,
      type,
      query: undefined
    })
    expect(name).toBe('func-type')
  })

  it('query 过滤保留字', () => {
    const name = generateFieldName({
      func,
      type,
      query: {
        sort: 'desc',
        count: 10,
        page: 1,
        is_up: false,
        __refresh__: true
      }
    })
    expect(name).toBe('func-type-count-10-sort-desc')
  })

  it('query 过滤 function、object、array、undefined', () => {
    const name = generateFieldName({
      func,
      type,
      query: {
        sort: 'hottest',
        empty: '',
        obj: {
          a: 1,
          k:['v1', 'v2']
        },
        count: 10,
        rank: null,
        defined: undefined,
        is_end: false,
        arr: [1, 2, 3]
      }
    })
    expect(name).toBe('func-type-arr-%5B1%2C2%2C3%5D-count-10-empty--is_end-false-obj-%7B%22a%22%3A1%2C%22k%22%3A%5B%22v1%22%2C%22v2%22%5D%7D-rank-null-sort-hottest')
  })
})
