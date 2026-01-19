// @ts-nocheck
import { getObjectDeepValue } from '../../src/utils'

describe('get object deep value', () => {
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

  it('keys 是 空', () => {
    const name = getObjectDeepValue(data)
    expect(name).toEqual(data)
  })

  it('keys 是 id', () => {
    const name = getObjectDeepValue(data, 'id')
    expect(name).toBe(123)
  })

  it('keys 是 slug', () => {
    const name = getObjectDeepValue(data, 'slug')
    expect(name).toBe('abc')
  })

  it('keys 是 object key', () => {
    const name = getObjectDeepValue(data, 'data.unique_id')
    expect(name).toBe(456)
  })

  it('keys 是 deep key', () => {
    const name = getObjectDeepValue(data, 'data.deep.key')
    expect(name).toBe('dio')
  })

  it('keys 是 object key array', () => {
    const name = getObjectDeepValue(data, ['data', 'unique_id'])
    expect(name).toBe(456)
  })

  it('keys 是 deep key array', () => {
    const name = getObjectDeepValue(data, ['data', 'deep', 'key'])
    expect(name).toBe('dio')
  })

  it('keys 是空数组返回原值', () => {
    const name = getObjectDeepValue(data, [])
    expect(name).toEqual(data)
  })

  it('访问不存在的路径返回 undefined', () => {
    const name = getObjectDeepValue(data, 'not.exist.path')
    expect(name).toBeUndefined()
  })

  it('中间路径为 null 时返回 undefined', () => {
    const testData = {
      a: null
    }
    const name = getObjectDeepValue(testData, 'a.b.c')
    expect(name).toBeUndefined()
  })

  it('中间路径为基本类型时返回 undefined', () => {
    const testData = {
      a: 'string'
    }
    const name = getObjectDeepValue(testData, 'a.b')
    expect(name).toBeUndefined()
  })

  it('field 为 null 时返回 undefined', () => {
    const name = getObjectDeepValue(null, 'a.b')
    expect(name).toBeUndefined()
  })
})
