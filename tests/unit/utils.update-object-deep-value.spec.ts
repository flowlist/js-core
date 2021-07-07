// @ts-nocheck
import { updateObjectDeepValue } from '../../src/utils'

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
    updateObjectDeepValue(data, 'slug', 'test')
    expect(data.slug).toBe('test')
  })

  it('keys 是 深度字符串', () => {
    updateObjectDeepValue(data, 'data.deep.key', 'the world')
    expect(data.data.deep.key).toBe('the world')
  })
})
