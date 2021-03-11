import { mergeObjectDeepValue } from '@/utils'

describe('update object deep value', () => {
  const data = {
    id: 123,
    slug: 'abc',
    data: {
      unique_id: 456,
      deep: {
        key: 'dio'
      }
    }
  }

  it('keys 是 字符串', () => {
    mergeObjectDeepValue(data, 'data', {
      unique_id: 111,
      fff: 222
    })
    expect(data.data).toEqual({
      fff: 222,
      unique_id: 111,
      deep: {
        key: 'dio'
      }
    })
  })

  it('keys 是 深度字符串', () => {
    mergeObjectDeepValue(data, 'data.deep', {
      key: 'jojo',
      fff: 333
    })
    expect(data.data.deep).toEqual({
      key: 'jojo',
      fff: 333
    })
  })
})
