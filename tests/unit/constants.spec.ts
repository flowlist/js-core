/**
 * constants 模块测试
 */
import ENUM from '../../src/constants'

describe('constants', () => {
  describe('SETTER_TYPE', () => {
    it('RESET 为 0', () => expect(ENUM.SETTER_TYPE.RESET).toBe(0))
    it('MERGE 为 1', () => expect(ENUM.SETTER_TYPE.MERGE).toBe(1))
  })

  describe('FETCH_TYPE', () => {
    it('PAGINATION 为 jump', () => expect(ENUM.FETCH_TYPE.PAGINATION).toBe('jump'))
    it('SINCE_FIRST_OR_END_ID 为 sinceId', () => expect(ENUM.FETCH_TYPE.SINCE_FIRST_OR_END_ID).toBe('sinceId'))
    it('SCROLL_LOAD_MORE 为 page', () => expect(ENUM.FETCH_TYPE.SCROLL_LOAD_MORE).toBe('page'))
    it('HAS_LOADED_IDS 为 seenIds', () => expect(ENUM.FETCH_TYPE.HAS_LOADED_IDS).toBe('seenIds'))
    it('AUTO 为 auto', () => expect(ENUM.FETCH_TYPE.AUTO).toBe('auto'))
  })

  describe('CHANGE_TYPE', () => {
    it('包含所有 mutation 方法名', () => {
      expect(ENUM.CHANGE_TYPE.SEARCH_FIELD).toBe('search')
      expect(ENUM.CHANGE_TYPE.RESET_FIELD).toBe('reset')
      expect(ENUM.CHANGE_TYPE.RESULT_UPDATE_KV).toBe('update')
      expect(ENUM.CHANGE_TYPE.RESULT_ADD_AFTER).toBe('push')
      expect(ENUM.CHANGE_TYPE.RESULT_ADD_BEFORE).toBe('unshift')
      expect(ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID).toBe('delete')
      expect(ENUM.CHANGE_TYPE.RESULT_INSERT_TO_BEFORE).toBe('insert-before')
      expect(ENUM.CHANGE_TYPE.RESULT_INSERT_TO_AFTER).toBe('insert-after')
      expect(ENUM.CHANGE_TYPE.RESULT_LIST_MERGE).toBe('patch')
      expect(ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE).toBe('merge')
    })
  })

  describe('FIELD_DATA', () => {
    it('RESULT_KEY 为 result', () => expect(ENUM.FIELD_DATA.RESULT_KEY).toBe('result'))
    it('EXTRA_KEY 为 extra', () => expect(ENUM.FIELD_DATA.EXTRA_KEY).toBe('extra'))
  })

  it('DEFAULT_UNIQUE_KEY_NAME 为 id', () => {
    expect(ENUM.DEFAULT_UNIQUE_KEY_NAME).toBe('id')
  })
})
