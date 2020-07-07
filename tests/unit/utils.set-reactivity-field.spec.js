import { setReactivityField } from '@/utils'

describe('set reactivity field', () => {
  it('type 是 jump 原先的值会被覆盖', () => {
    const field = {
      key: 'any_value will be reset',
    }
    const key = 'key'
    const value = 'value'
    setReactivityField(field, key, value, 'jump')
    expect(field).toEqual({
      [key]: value,
    })
  })

  it('value 是 array，会 merge 到后面', () => {
    const field = {
      key: [1, 2, 3, 4, 5],
    }
    const key = 'key'
    const value = [6, 7, 8, 9, 10]
    setReactivityField(field, key, value)
    expect(field).toEqual({
      [key]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    })
  })

  it('value 是 array，insertBefore 为 true，会 merge 到前面', () => {
    const field = {
      key: [1, 2, 3, 4, 5],
    }
    const key = 'key'
    const value = [6, 7, 8, 9, 10]
    setReactivityField(field, key, value, 'page', true)
    expect(field).toEqual({
      [key]: [6, 7, 8, 9, 10, 1, 2, 3, 4, 5],
    })
  })

  it('value 是 array，原始值是 null，也能 work', () => {
    const field = {
      key: null,
    }
    const key = 'key'
    const value = [6, 7, 8, 9, 10]
    setReactivityField(field, key, value)
    expect(field).toEqual({
      [key]: [6, 7, 8, 9, 10],
    })
  })

  it('当 key 是 extra 的时候，且 value 不是 array 时，extra 直接覆盖', () => {
    const field = {
      extra: null,
    }
    const key = 'extra'
    const value = {
      a: 1,
      b: 2,
    }
    setReactivityField(field, key, value)
    expect(field).toEqual({
      [key]: value,
    })
  })

  it('当 value 是 object 且 type 不是 jump 时，把 result 做为 object 去操作', () => {
    const field = {
      result: [],
    }
    const key = 'result'

    const value = {
      a: [1, 2, 3],
      b: [4, 5, 6],
    }
    setReactivityField(field, key, value)
    expect(field).toEqual({
      [key]: value,
    })

    const value2 = {
      a: [7, 8, 9],
      b: [10, 11, 12],
    }
    setReactivityField(field, key, value2)

    expect(field).toEqual({
      [key]: {
        a: [1, 2, 3, 7, 8, 9],
        b: [4, 5, 6, 10, 11, 12],
      },
    })
  })
})
