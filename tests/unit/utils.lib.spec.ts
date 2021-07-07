// @ts-nocheck
import { isArray, generateDefaultField } from '../../src/utils'

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
})
