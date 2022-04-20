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
})
