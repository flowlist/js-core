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
          k: ['v1', 'v2']
        },
        count: 10,
        rank: null,
        defined: undefined,
        is_end: false,
        arr: [1, 2, 3]
      }
    })
    expect(name).toBe(
      'func-type-arr-%5B1%2C2%2C3%5D-count-10-empty--is_end-false-obj-%7B%22a%22%3A1%2C%22k%22%3A%5B%22v1%22%2C%22v2%22%5D%7D-rank-null-sort-hottest'
    )
  })

  it('query 过滤 since_id 和 seen_ids', () => {
    const name = generateFieldName({
      func,
      type,
      query: {
        sort: 'desc',
        count: 10,
        since_id: 123,
        seen_ids: '1,2,3'
      }
    })
    expect(name).toBe('func-type-count-10-sort-desc')
  })

  it('func 是函数时使用函数名', () => {
    const namedFunc = function testFunction() {}
    const name = generateFieldName({
      func: namedFunc,
      type,
      query: {}
    })
    expect(name).toBe('testFunction-type')
  })

  it('func 是匿名函数时使用函数名或变量名', () => {
    const anonymousFunc = function () {}
    const name = generateFieldName({
      func: anonymousFunc,
      type,
      query: {}
    })
    // 匿名函数会使用变量名 anonymousFunc
    expect(name).toBe('anonymousFunc-type')
  })

  it('func 是真正的匿名函数时生成随机名称', () => {
    // 使用立即执行的函数表达式创建真正的匿名函数
    const name = generateFieldName({
      func: function () {}.constructor('return function(){}')(),
      type,
      query: {}
    })
    expect(name).toMatch(/^api-[a-z0-9]{6}-type$/)
  })

  it('type 为空时使用默认值 auto', () => {
    const name = generateFieldName({
      func,
      type: undefined,
      query: {}
    })
    expect(name).toBe('func-auto')
  })

  it('query 包含循环引用对象时正确处理', () => {
    const circularObj = { a: 1 }
    circularObj.self = circularObj
    const name = generateFieldName({
      func,
      type,
      query: {
        circular: circularObj
      }
    })
    // 应该能正常生成，不会抛出异常
    expect(name).toContain('func-type')
  })

  it('query 包含基本类型值时正确序列化 - 测试 stableSerialize line 20', () => {
    const name = generateFieldName({
      func,
      type,
      query: {
        str: 'hello',
        num: 42,
        bool: true,
        nullVal: null,
        undef: undefined,
        zero: 0,
        emptyStr: '',
        negNum: -100
      }
    })
    // 基本类型应该被正确序列化
    expect(name).toContain('bool-true')
    expect(name).toContain('num-42')
    expect(name).toContain('str-hello')
    expect(name).toContain('nullVal-null')
    expect(name).toContain('zero-0')
    expect(name).toContain('emptyStr-')
    expect(name).toContain('negNum--100')
    // undefined 会被过滤掉
    expect(name).not.toContain('undef')
  })

  it('query 包含特殊对象时处理 BigInt 或其他不可序列化类型', () => {
    // 测试带有 toJSON 方法的对象
    const objWithToJSON = {
      value: 123,
      toJSON() {
        return { serialized: true }
      }
    }

    const name = generateFieldName({
      func,
      type,
      query: {
        special: objWithToJSON
      }
    })

    // 应该能正常生成，不会抛出异常
    expect(name).toContain('func-type')
  })
})
