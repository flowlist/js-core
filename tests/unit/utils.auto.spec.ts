// @ts-nocheck
import {
  isArray,
  generateDefaultField,
  isObjectResult,
  generateRequestParams,
  getObjectDeepValue,
  setReactivityField,
  computeResultLength
} from '../../src/utils'
import ENUM from '../../src/enum'

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

  describe('generateRequestParams', () => {
    const baseField = generateDefaultField()

    it('should handle initial fetch for PAGINATION type with no query.page', () => {
      // This covers line 314 in utils.ts
      const params = generateRequestParams({
        field: { ...baseField, fetched: false },
        uniqueKey: 'id',
        query: {},
        type: ENUM.FETCH_TYPE.PAGINATION
      })
      expect(params.page).toBe(0) // because baseField.page is 0
    })

    it('should handle initial fetch for SCROLL_LOAD_MORE type', () => {
      // This covers lines 290-293 in utils.ts
      const params = generateRequestParams({
        field: { ...baseField, fetched: false },
        uniqueKey: 'id',
        query: {},
        type: ENUM.FETCH_TYPE.SCROLL_LOAD_MORE
      })
      expect(params.page).toBe(1)
    })
  })

  describe('getObjectDeepValue', () => {
    it('should return the field itself if keys is empty', () => {
      // This covers line 22 in utils.ts
      const field = { a: 1 }
      expect(getObjectDeepValue(field, '')).toBe(field)
      expect(getObjectDeepValue(field, [])).toBe(field)
      expect(getObjectDeepValue(field)).toBe(field)
    })

    it('should return undefined if field is null or not an object', () => {
      // This covers line 98 in utils.ts
      expect(getObjectDeepValue(null, 'a')).toBeUndefined()
      expect(getObjectDeepValue('string', 'a')).toBeUndefined()
      expect(getObjectDeepValue(123, 'a')).toBeUndefined()
    })

    it('should return undefined if intermediate key is not an object', () => {
      // This covers line 122 in utils.ts
      const field = { a: 1 }
      expect(getObjectDeepValue(field, 'a.b')).toBeUndefined()
    })
  })

  describe('setReactivityField', () => {
    it('should handle object result with insertBefore for non-array value', () => {
      const field = generateDefaultField()
      // Set field to object mode
      field.result = { listA: [{ id: 1 }] }

      const newValue = { listA: [{ id: 2 }] }
      setReactivityField(
        field,
        'result',
        newValue,
        ENUM.FETCH_TYPE.AUTO,
        true // insertBefore
      )

      expect(field.result).toEqual({
        listA: [{ id: 2 }, { id: 1 }]
      })
    })

    it('should handle object result with insertAfter for non-array value', () => {
      const field = generateDefaultField()
      field.result = { listA: [{ id: 1 }] }

      const newValue = { listA: [{ id: 2 }] }
      setReactivityField(
        field,
        'result',
        newValue,
        ENUM.FETCH_TYPE.AUTO,
        false // insertAfter
      )

      expect(field.result).toEqual({
        listA: [{ id: 1 }, { id: 2 }]
      })
    })
  })

  describe('computeResultLength', () => {
    it('should return 0 for non-object, non-array data', () => {
      expect(computeResultLength(null)).toBe(0)
      expect(computeResultLength('string')).toBe(0)
      expect(computeResultLength(123)).toBe(0)
    })

    it('should compute length for array', () => {
      expect(computeResultLength([1, 2, 3])).toBe(3)
    })

    it('should compute length for object with array values', () => {
      const data = {
        a: [1, 2],
        b: [3, 4, 5],
        c: 'not an array'
      }
      expect(computeResultLength(data)).toBe(5)
    })
  })

  describe('getObjectDeepValue edge cases', () => {
    it('should return the field itself if keys is null (covers line 22)', () => {
      const field = { test: 'value' }
      expect(getObjectDeepValue(field, null)).toBe(field)
    })

    it('should return undefined if an intermediate value is a primitive (covers line 122)', () => {
      const field = { a: 'primitive_string' }
      expect(getObjectDeepValue(field, 'a.b')).toBeUndefined()
    })
  })

  describe('generateRequestParams edge cases', () => {
    it('should use field.page when query.page is not a number for PAGINATION initial fetch (covers line 314)', () => {
      const field = generateDefaultField()
      field.page = 999 // Set a distinct page number

      const params = generateRequestParams({
        field,
        uniqueKey: 'id',
        query: { page: 'not_a_number' }, // This is the key: a non-number page in query
        type: ENUM.FETCH_TYPE.PAGINATION
      })

      // It should fall back to field.page because query.page is not a number
      expect(params.page).toBe(999)
    })
  })
})
