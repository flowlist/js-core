import { computeMatchedItemIndex } from '@/utils'

describe('compute matched item index', () => {
  const result = [
    {
      id: 1,
      slug: 'abc'
    },
    {
      id: 2,
      slug: 'ddd'
    },
    {
      id: 3,
      slug: 'what.is'
    }
  ]

  it('简单的正常范围内', () => {
    expect(computeMatchedItemIndex(2, result, 'id')).toBe(1)
  })

  it('id 溢出时返回 -1', () => {
    expect(computeMatchedItemIndex(4, result, 'id')).toBe(-1)
  })

  it('id 是 array 返回 -1', () => {
    expect(computeMatchedItemIndex([1, 2, 3], result, 'id')).toBe(-1)
  })
})
