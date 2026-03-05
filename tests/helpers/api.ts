/**
 * 测试用 API 与 createApi 工厂
 */
import { createApi } from '../../src/core'
import type { BaseApiResponse, RequestParams } from '../../src/types'

export const testListResponse = (): BaseApiResponse => ({
  result: [
    { id: 1, slug: 'a', obj: { key: 'value_1' } },
    { id: 2, slug: 'b', obj: { key: 'value_2' } },
    { id: 3, slug: 'c', obj: { key: 'value_3' } }
  ],
  no_more: true,
  total: 3
})

export const createTestApi = (overrides?: {
  id?: string
  type?: 'jump' | 'sinceId' | 'page' | 'seenIds' | 'auto'
  uniqueKey?: string
  paramsIgnore?: string[]
}) => {
  return createApi<RequestParams, unknown>({
    id: 'test-api',
    type: 'page',
    uniqueKey: 'id',
    paramsIgnore: [],
    fetcher: async () => testListResponse(),
    ...overrides
  })
}

export const createFailingApi = (error: Error = new Error('network error')) =>
  createApi<RequestParams, unknown>({
    id: 'fail-api',
    fetcher: async () => {
      throw error
    }
  })
