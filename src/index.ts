// index.ts — 全量入口（向后兼容）
export {
  createApi,
  generateFieldName,
  initData,
  initState,
  loadMore
} from './core'

export { createUpdateState, updateState } from './mutations'
export { coreMutations } from './mutations/core'
export { extendedMutations } from './mutations/extended'

export { default as ENUM } from './constants'

export * from './types'
