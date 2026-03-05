/**
 * _internal/utils 工具函数测试
 */
import {
  isArray,
  isObjectKey,
  isKeyMap,
  isKeyMapArray,
  isObjectKeyArray,
  stableSerialize,
  getObjectDeepValue,
  updateObjectDeepValue,
  generateDefaultField,
  computeMatchedItemIndex,
  computeResultLength,
  toObjectKey,
  getResultAsArray,
  updateArrayItem,
  searchValueByKey,
  combineArrayData,
  setReactivityField,
  generateRequestParams
} from '../../src/_internal/utils'
import ENUM from '../../src/constants'

describe('utils - 类型守卫', () => {
  describe('isArray', () => {
    it('数组返回 true', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2])).toBe(true)
    })
    it('非数组返回 false', () => {
      expect(isArray(null)).toBe(false)
      expect(isArray({})).toBe(false)
      expect(isArray('')).toBe(false)
    })
  })

  describe('isObjectKey', () => {
    it('string 或 number 返回 true', () => {
      expect(isObjectKey('a')).toBe(true)
      expect(isObjectKey(1)).toBe(true)
    })
    it('其他类型返回 false', () => {
      expect(isObjectKey(null)).toBe(false)
      expect(isObjectKey([])).toBe(false)
      expect(isObjectKey({})).toBe(false)
    })
  })

  describe('isKeyMap', () => {
    it('纯对象返回 true', () => expect(isKeyMap({})).toBe(true))
    it('null/数组/基本类型返回 false', () => {
      expect(isKeyMap(null)).toBe(false)
      expect(isKeyMap([])).toBe(false)
      expect(isKeyMap('')).toBe(false)
    })
  })

  describe('isKeyMapArray', () => {
    it('对象数组返回 true', () => expect(isKeyMapArray([{}, { a: 1 }])).toBe(true))
    it('含非对象项返回 false', () => expect(isKeyMapArray([{}, null])).toBe(false))
  })

  describe('isObjectKeyArray', () => {
    it('string/number 数组返回 true', () => expect(isObjectKeyArray(['a', 1])).toBe(true))
    it('含非 key 类型返回 false', () => expect(isObjectKeyArray(['a', {}])).toBe(false))
  })
})

describe('utils - stableSerialize', () => {
  it('null 或非对象返回 String(value)', () => {
    expect(stableSerialize(null)).toBe('null')
    expect(stableSerialize(1)).toBe('1')
  })
  it('数组返回 JSON.stringify', () => {
    expect(stableSerialize([1, 2])).toBe('[1,2]')
  })
  it('对象按键排序后序列化', () => {
    expect(stableSerialize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}')
  })
  it('循环引用返回 [Circular]', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(stableSerialize(circular)).toBe('[Circular]')
  })
})

describe('utils - getObjectDeepValue', () => {
  const data = { id: 123, slug: 'abc', data: { unique_id: 456, deep: { key: 'dio' } } }

  it('无 keys 或空数组返回 field', () => {
    expect(getObjectDeepValue(data)).toEqual(data)
    expect(getObjectDeepValue(data, [])).toEqual(data)
  })
  it('单层 key 返回对应值', () => {
    expect(getObjectDeepValue(data, 'id')).toBe(123)
    expect(getObjectDeepValue(data, 'slug')).toBe('abc')
  })
  it('点分路径返回深层值', () => {
    expect(getObjectDeepValue(data, 'data.unique_id')).toBe(456)
    expect(getObjectDeepValue(data, 'data.deep.key')).toBe('dio')
  })
  it('数组路径等价', () => {
    expect(getObjectDeepValue(data, ['data', 'unique_id'])).toBe(456)
    expect(getObjectDeepValue(data, ['data', 'deep', 'key'])).toBe('dio')
  })
  it('不存在的路径返回 undefined', () => {
    expect(getObjectDeepValue(data, 'not.exist.path')).toBeUndefined()
  })
  it('中间为 null 或非对象返回 undefined', () => {
    expect(getObjectDeepValue({ a: null }, 'a.b.c')).toBeUndefined()
    expect(getObjectDeepValue({ a: 'string' }, 'a.b')).toBeUndefined()
  })
  it('field 为 null 返回 undefined', () => {
    expect(getObjectDeepValue(null, 'a.b')).toBeUndefined()
  })
})

describe('utils - updateObjectDeepValue', () => {
  it('单层 key 直接赋值', () => {
    const obj: Record<string, unknown> = { a: 1 }
    updateObjectDeepValue(obj, 'b', 2)
    expect(obj).toEqual({ a: 1, b: 2 })
  })
  it('深层路径创建中间对象并赋值', () => {
    const obj: Record<string, unknown> = {}
    updateObjectDeepValue(obj, 'a.b.c', 'v')
    expect(obj).toEqual({ a: { b: { c: 'v' } } })
  })
  it('空 changeKey 不修改', () => {
    const obj: Record<string, unknown> = {}
    updateObjectDeepValue(obj, '', 1)
    expect(obj).toEqual({})
  })
})

describe('utils - generateDefaultField', () => {
  it('无参返回默认字段', () => {
    const f = generateDefaultField()
    expect(f).toMatchObject({
      result: [],
      noMore: false,
      nothing: false,
      loading: false,
      error: null,
      extra: null,
      fetched: false,
      page: 0,
      total: 0
    })
  })
  it('opts 覆盖默认值', () => {
    const f = generateDefaultField({ loading: true, page: 2 })
    expect(f.loading).toBe(true)
    expect(f.page).toBe(2)
  })
})

describe('utils - computeMatchedItemIndex', () => {
  const arr = [
    { id: 1, slug: 'a' },
    { id: 2, slug: 'b' },
    { data: { id: 3 } }
  ]

  it('匹配 id 返回索引', () => {
    expect(computeMatchedItemIndex(1, arr, 'id')).toBe(0)
    expect(computeMatchedItemIndex(2, arr, 'id')).toBe(1)
  })
  it('深层 key 匹配', () => {
    expect(computeMatchedItemIndex(3, arr, 'data.id')).toBe(2)
  })
  it('无匹配返回 -1', () => {
    expect(computeMatchedItemIndex(99, arr, 'id')).toBe(-1)
  })
  it('非对象项跳过', () => {
    const withNull = [{ id: 1 }, null, { id: 2 }]
    expect(computeMatchedItemIndex(2, withNull, 'id')).toBe(2)
  })
})

describe('utils - computeResultLength', () => {
  it('数组返回 length', () => expect(computeResultLength([1, 2, 3])).toBe(3))
  it('非数组返回 0', () => {
    expect(computeResultLength(null)).toBe(0)
    expect(computeResultLength({})).toBe(0)
  })
})

describe('utils - toObjectKey', () => {
  it('undefined 返回 undefined', () => expect(toObjectKey(undefined)).toBeUndefined())
  it('单个 ObjectKey 原样返回', () => {
    expect(toObjectKey('a')).toBe('a')
    expect(toObjectKey(1)).toBe(1)
  })
  it('数组取第一项', () => {
    expect(toObjectKey(['x', 'y'])).toBe('x')
  })
  it('空数组返回 undefined', () => expect(toObjectKey([])).toBeUndefined())
})

describe('utils - getResultAsArray', () => {
  it('result 为数组时返回副本', () => {
    const arr = [1, 2]
    const field = generateDefaultField({ result: arr })
    expect(getResultAsArray(field)).toEqual([1, 2])
    expect(getResultAsArray(field)).not.toBe(arr)
  })
  it('result 非数组返回 null', () => {
    const field = generateDefaultField({ result: {} as unknown as any[] })
    expect(getResultAsArray(field)).toBeNull()
  })
})

describe('utils - updateArrayItem', () => {
  it('有效索引且为对象时更新', () => {
    const arr = [{ id: 1, v: 0 }, { id: 2, v: 0 }]
    updateArrayItem(arr, 1, (item) => ({ ...item, v: 1 }))
    expect(arr[1]).toEqual({ id: 2, v: 1 })
  })
  it('越界或非对象不修改', () => {
    const arr = [{ id: 1 }]
    updateArrayItem(arr, 5, () => ({}))
    updateArrayItem(arr, 0, () => ({}))
    expect(arr).toEqual([{}])
  })
})

describe('utils - searchValueByKey', () => {
  const list = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]

  it('数组中按 id 查找', () => {
    expect(searchValueByKey(list, 1, 'id')).toEqual({ id: 1, name: 'a' })
    expect(searchValueByKey(list, 2, 'id')).toEqual({ id: 2, name: 'b' })
  })
  it('无匹配返回 undefined', () => {
    expect(searchValueByKey(list, 99, 'id')).toBeUndefined()
  })
  it('对象按 key 查找', () => {
    const map = { 1: { name: 'a' }, 2: { name: 'b' } }
    expect(searchValueByKey(map, 1, 'id')).toEqual({ name: 'a' })
  })
  it('非数组非对象返回 undefined', () => {
    expect(searchValueByKey(null, 1, 'id')).toBeUndefined()
  })
})

describe('utils - combineArrayData', () => {
  it('按 id 合并数组 value', () => {
    const field = [{ id: 1, txt: 'a' }, { id: 2, txt: 'b' }]
    combineArrayData(field, [{ id: 1, txt: 'x' }, { id: 2, txt: 'y' }], 'id')
    expect(field[0].txt).toBe('x')
    expect(field[1].txt).toBe('y')
  })
  it('按 id 合并对象 value', () => {
    const field = [{ id: 1, txt: 'a' }, { id: 2, txt: 'b' }]
    combineArrayData(field, { 1: { txt: 'x' }, 2: { txt: 'y' } }, 'id')
    expect(field[0].txt).toBe('x')
    expect(field[1].txt).toBe('y')
  })
  it('深层 key 合并', () => {
    const field = [{ id: 1, obj: { slug: 'a' } }, { id: 2, obj: { slug: 'b' } }]
    combineArrayData(field, [{ obj: { slug: 'a' }, txt: 'x' }], 'obj.slug')
    expect(field[0].txt).toBe('x')
  })
  it('非对象项跳过', () => {
    const field = [{ id: 1 }, null, { id: 2 }]
    combineArrayData(field, [{ id: 1, v: 1 }], 'id')
    expect(field[0]).toMatchObject({ id: 1, v: 1 })
    expect(field[1]).toBe(null)
  })
})

describe('utils - setReactivityField', () => {
  it('PAGINATION 模式直接赋值', () => {
    const field = generateDefaultField()
    setReactivityField(field, ENUM.FIELD_DATA.RESULT_KEY, [1, 2], ENUM.FETCH_TYPE.PAGINATION, false)
    expect(field.result).toEqual([1, 2])
  })
  it('非 result 字段 append 数组', () => {
    const field = generateDefaultField({ extra: [1] })
    setReactivityField(field, ENUM.FIELD_DATA.EXTRA_KEY, [2], 'sinceId', false)
    expect(field.extra).toEqual([1, 2])
  })
  it('result 数组 insertBefore 时新数据在前', () => {
    const field = generateDefaultField({ result: [1, 2] })
    setReactivityField(field, ENUM.FIELD_DATA.RESULT_KEY, [3, 4], 'page', true)
    expect(field.result).toEqual([3, 4, 1, 2])
  })
  it('result 数组 insertBefore=false 时新数据在后', () => {
    const field = generateDefaultField({ result: [1, 2] })
    setReactivityField(field, ENUM.FIELD_DATA.RESULT_KEY, [3], 'page', false)
    expect(field.result).toEqual([1, 2, 3])
  })
  it('空数组不修改 result', () => {
    const field = generateDefaultField({ result: [1] })
    setReactivityField(field, ENUM.FIELD_DATA.RESULT_KEY, [], 'page', false)
    expect(field.result).toEqual([1])
  })
})

describe('utils - generateRequestParams', () => {
  it('初次请求 type=page 时 page 为 1 或 query.page', () => {
    const field = generateDefaultField()
    const r = generateRequestParams({ field, query: { a: 'x' }, type: 'page' })
    expect(r.page).toBe(1)
    const r2 = generateRequestParams({ field, query: { page: 20 }, type: 'page' })
    expect(r2.page).toBe(20)
  })
  it('初次请求 type=jump 使用 query.page 或 field.page', () => {
    expect(generateRequestParams({ field: generateDefaultField(), query: { page: 20 }, type: 'jump' }).page).toBe(20)
    expect(generateRequestParams({ field: generateDefaultField({ page: 10 }), query: {}, type: 'jump' }).page).toBe(10)
  })
  it('初次请求 type=seenIds 时 seen_ids 为空', () => {
    const r = generateRequestParams({ field: generateDefaultField(), query: {}, type: 'seenIds' })
    expect(r.seen_ids).toBe('')
  })
  it('初次请求 type=sinceId 时 since_id、is_up', () => {
    const r = generateRequestParams({ field: generateDefaultField(), query: {}, type: 'sinceId' })
    expect(r.since_id).toBe('')
    expect(r.is_up).toBe(0)
    const r2 = generateRequestParams({ field: generateDefaultField(), query: { sinceId: 'abc' }, type: 'sinceId' })
    expect(r2.since_id).toBe('abc')
  })
  it('已拉取 type=page 时 page 用 query 或 field.page+1', () => {
    const field = generateDefaultField({ fetched: true, page: 3 })
    const r = generateRequestParams({ field, query: {}, type: 'page' })
    expect(r.page).toBe(4)
  })
  it('已拉取 type=seenIds 时 seen_ids 为 result 的 id 逗号拼接', () => {
    const field = generateDefaultField({ fetched: true, result: [{ id: 5 }, { id: 7 }] })
    const r = generateRequestParams({ field, query: {}, type: 'seenIds' })
    expect(r.seen_ids).toBe('5,7')
  })
  it('已拉取 type=sinceId 时 since_id 为末尾/首位 id', () => {
    const field = generateDefaultField({ fetched: true, result: [{ id: 5 }, { id: 6 }, { id: 7 }] })
    expect(generateRequestParams({ field, query: {}, type: 'sinceId', is_up: false }).since_id).toBe(7)
    expect(generateRequestParams({ field, query: {}, type: 'sinceId', is_up: true }).since_id).toBe(5)
  })
  it('已拉取 type=auto 含 seen_ids、since_id、page', () => {
    const field = generateDefaultField({ fetched: true, result: [{ id: 5 }, { id: 6 }, { id: 7 }] })
    const r = generateRequestParams({ field, query: {}, type: 'auto' })
    expect(r.seen_ids).toBe('5,6,7')
    expect(r.since_id).toBe(7)
    expect(r.is_up).toBe(0)
  })
  it('深层 uniqueKey 提取 id', () => {
    const field = generateDefaultField({
      fetched: true,
      result: [{ data: { id: 5 } }, { data: { id: 6 } }]
    })
    const r = generateRequestParams({ field, query: {}, type: 'seenIds', uniqueKey: 'data.id' })
    expect(r.seen_ids).toBe('5,6')
  })
  it('result 含非对象项时跳过', () => {
    const field = generateDefaultField({
      fetched: true,
      result: [{ id: 5 }, null, { id: 6 }]
    })
    const r = generateRequestParams({ field, query: {}, type: 'seenIds' })
    expect(r.seen_ids).toBe('5,6')
  })
})
