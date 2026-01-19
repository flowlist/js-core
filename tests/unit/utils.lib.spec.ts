// @ts-nocheck
import { isArray, generateDefaultField, isObjectResult } from '../../src/utils'

describe('safe utils', () => {
  it('isArray', () => {
    expect(isArray([])).toBeTruthy()
    expect(isArray({})).toBeFalsy()
  })

  it('generateDefaultField', () => {
    const objA = generateDefaultField()
    const objB = generateDefaultField()

    expect(objA).toEqual(objB)
    expect(objA).not.toBe(objB)
  })

  it('generateDefaultField 支持自定义选项', () => {
    const customField = generateDefaultField({
      total: 100,
      page: 5,
      loading: true
    })

    expect(customField.total).toBe(100)
    expect(customField.page).toBe(5)
    expect(customField.loading).toBe(true)
    expect(customField.result).toEqual([])
    expect(customField.noMore).toBe(false)
  })

  it('isObjectResult', () => {
    const a = {
      result: []
    }
    const b = {
      result: {
        a: [],
        b: []
      }
    }
    const c = {
      k: 'v'
    }

    expect(isObjectResult(a)).toBeFalsy()
    expect(isObjectResult(b)).toBeFalsy()
    expect(isObjectResult(c)).toBeTruthy()
  })

  it('isObjectResult 处理 null 和非对象类型', () => {
    // 测试 line 56-57: 非对象类型返回 false
    expect(isObjectResult(null)).toBeFalsy()
    expect(isObjectResult(undefined)).toBeFalsy()
    expect(isObjectResult('string')).toBeFalsy()
    expect(isObjectResult(123)).toBeFalsy()
    expect(isObjectResult(true)).toBeFalsy()
  })
})
