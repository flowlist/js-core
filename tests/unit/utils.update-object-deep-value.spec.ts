// @ts-nocheck
import { updateObjectDeepValue } from '../../src/utils'

describe('update object deep value', () => {
  it('keys 是 字符串', () => {
    const data = {
      id: 123,
      slug: 'abc'
    }
    updateObjectDeepValue(data, 'slug', 'test')
    expect(data.slug).toBe('test')
  })

  it('keys 是 深度字符串', () => {
    const data = {
      data: {
        deep: {
          key: 'dio'
        }
      }
    }
    updateObjectDeepValue(data, 'data.deep.key', 'the world')
    expect(data.data.deep.key).toBe('the world')
  })

  it('changeKey 为空时不做任何操作', () => {
    const data = {
      id: 123
    }
    updateObjectDeepValue(data, '', 'test')
    expect(data.id).toBe(123)
  })

  it('中间路径不存在时自动创建对象 - 测试 line 162', () => {
    const data = {}
    updateObjectDeepValue(data, 'a.b.c', 'value')
    expect(data.a.b.c).toBe('value')
  })

  it('中间路径为 null 时自动创建对象', () => {
    const data = {
      a: null
    }
    updateObjectDeepValue(data, 'a.b.c', 'value')
    expect(data.a.b.c).toBe('value')
  })

  it('中间路径为基本类型时自动创建对象', () => {
    const data = {
      a: 'string'
    }
    updateObjectDeepValue(data, 'a.b.c', 'value')
    expect(data.a.b.c).toBe('value')
  })

  it('只有一层路径时直接设置', () => {
    const data = {}
    updateObjectDeepValue(data, 'key', 'value')
    expect(data.key).toBe('value')
  })
})
