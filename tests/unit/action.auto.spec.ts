// @ts-nocheck
import { initState, initData, loadMore, updateState } from '../../src/actions'
import ENUM from '../../src/enum'

// Mock utils that are used inside actions
jest.mock('../../src/utils', () => ({
  ...jest.requireActual('../../src/utils'),
  generateFieldName: jest.fn(),
  generateDefaultField: jest.fn(),
  generateRequestParams: jest.fn(),
  computeMatchedItemIndex: jest.fn(),
  combineArrayData: jest.fn(),
  updateObjectDeepValue: jest.fn(),
  getObjectDeepValue: jest.fn(),
  computeResultLength: jest.fn(),
  searchValueByKey: jest.fn(),
  isArray: jest.requireActual('../../src/utils').isArray
}))

// Import the actual utils for helper functions
const actualUtils = jest.requireActual('../../src/utils')

describe('actions', () => {
  const mockGetter = jest.fn()
  const mockSetter = jest.fn()
  const mockApi = {
    mockFunc: jest.fn()
  }
  const baseArgs = {
    getter: mockGetter,
    setter: mockSetter,
    func: 'mockFunc',
    type: ENUM.FETCH_TYPE.PAGINATION,
    query: {},
    api: mockApi,
    uniqueKey: 'id'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Setup default mocks for utils
    require('../../src/utils').generateFieldName.mockReturnValue('mock-field-name')
    require('../../src/utils').generateDefaultField.mockImplementation(
      actualUtils.generateDefaultField
    )
    require('../../src/utils').generateRequestParams.mockReturnValue({})
    require('../../src/utils').computeResultLength.mockReturnValue(0)
    require('../../src/utils').getObjectDeepValue.mockImplementation(
      actualUtils.getObjectDeepValue
    )
  })

  describe('initState', () => {
    it('should resolve immediately if fieldData exists', async () => {
      mockGetter.mockReturnValue({})

      await initState(baseArgs)
      expect(mockGetter).toHaveBeenCalledWith('mock-field-name')
      expect(mockSetter).not.toHaveBeenCalled()
    })
  })

  describe('initData', () => {
    it('should resolve immediately if fieldData has error and not refreshing', async () => {
      // This covers lines 301-302
      const fieldDataWithError = { error: new Error('test'), fetched: true }
      mockGetter.mockReturnValue(fieldDataWithError)
      const query = {} // no __refresh__

      await initData({ ...baseArgs, query })
      expect(mockGetter).toHaveBeenCalledWith('mock-field-name')
      expect(mockSetter).not.toHaveBeenCalled()
    })

    it('should resolve immediately if fieldData is loading', async () => {
      // This covers lines 316-317
      const fieldDataLoading = { loading: true }
      mockGetter.mockReturnValue(fieldDataLoading)

      await initData(baseArgs)
      expect(mockGetter).toHaveBeenCalledWith('mock-field-name')
      expect(mockSetter).not.toHaveBeenCalled()
    })

    it('should resolve immediately if data is already fetched and not refreshing', async () => {
      // This covers lines 330-331
      const fieldDataFetched = { fetched: true, loading: false }
      mockGetter.mockReturnValue(fieldDataFetched)
      const query = {} // no __refresh__

      await initData({ ...baseArgs, query })
      expect(mockGetter).toHaveBeenCalledWith('mock-field-name')
      expect(mockSetter).not.toHaveBeenCalled()
    })
  })

  describe('loadMore', () => {
    it('should resolve immediately if fieldData is not found', async () => {
      // This covers line 387
      mockGetter.mockReturnValue(undefined)

      await loadMore(baseArgs)
      expect(mockGetter).toHaveBeenCalledWith('mock-field-name')
      expect(mockSetter).not.toHaveBeenCalled()
    })
  })

  describe('updateState', () => {
    it('should reject if field is not found', async () => {
      // This covers the error path for line 448
      mockGetter.mockReturnValue(undefined)

      await expect(
        updateState({
          ...baseArgs,
          method: ENUM.CHANGE_TYPE.SEARCH_FIELD,
          id: '1'
        })
      ).rejects.toThrow('Field mock-field-name not found.')
    })

    it('should reject if ID is required but not provided for SEARCH_FIELD', async () => {
      // This covers line 449
      const mockFieldData = actualUtils.generateDefaultField()
      mockGetter.mockReturnValue(mockFieldData)

      await expect(
        updateState({
          ...baseArgs,
          method: ENUM.CHANGE_TYPE.SEARCH_FIELD,
          id: null
        })
      ).rejects.toThrow('ID is required for SEARCH_FIELD.')
    })

    it('should reject if ID is required but not provided for RESULT_UPDATE_KV', async () => {
      const mockFieldData = actualUtils.generateDefaultField()
      mockGetter.mockReturnValue(mockFieldData)

      await expect(
        updateState({
          ...baseArgs,
          method: ENUM.CHANGE_TYPE.RESULT_UPDATE_KV,
          id: null
        })
      ).rejects.toThrow('ID is required for RESULT_UPDATE_KV.')
    })

    it('should reject if ID is required but not provided for RESULT_ITEM_MERGE', async () => {
      const mockFieldData = actualUtils.generateDefaultField()
      mockGetter.mockReturnValue(mockFieldData)

      await expect(
        updateState({
          ...baseArgs,
          method: ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE,
          id: null
        })
      ).rejects.toThrow('ID is required for RESULT_ITEM_MERGE.')
    })
  })
})
