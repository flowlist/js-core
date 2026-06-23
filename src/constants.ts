// constants.ts
const FETCH_TYPE_ARRAY = ['jump', 'sinceId', 'page', 'seenIds', 'auto'] as const

const MERGE_STRATEGY_ARRAY = ['replace', 'append', 'preserve'] as const

export default {
  SETTER_TYPE: {
    RESET: 0,
    MERGE: 1
  } as const,
  FETCH_TYPE_ARRAY,
  FETCH_TYPE: {
    PAGINATION: FETCH_TYPE_ARRAY[0],
    SINCE_FIRST_OR_END_ID: FETCH_TYPE_ARRAY[1],
    SCROLL_LOAD_MORE: FETCH_TYPE_ARRAY[2],
    HAS_LOADED_IDS: FETCH_TYPE_ARRAY[3],
    AUTO: FETCH_TYPE_ARRAY[4]
  } as const,
  MERGE_STRATEGY_ARRAY,
  // result 合并策略（与 FETCH_TYPE 正交）：
  //   REPLACE  —— loadMore/refresh 均整表替换（分页 / jump）
  //   APPEND   —— loadMore 去重追加；refresh 整表替换回第一页（无限滚动，默认）
  //   PRESERVE —— loadMore 去重追加；refresh 跳 RESET 保 in-flight（实时流 / 聊天）
  MERGE_STRATEGY: {
    REPLACE: MERGE_STRATEGY_ARRAY[0],
    APPEND: MERGE_STRATEGY_ARRAY[1],
    PRESERVE: MERGE_STRATEGY_ARRAY[2]
  } as const,
  CHANGE_TYPE: {
    SEARCH_FIELD: 'search',
    RESET_FIELD: 'reset',
    RESULT_UPDATE_KV: 'update',
    RESULT_ADD_AFTER: 'push',
    RESULT_ADD_BEFORE: 'unshift',
    RESULT_REMOVE_BY_ID: 'delete',
    RESULT_INSERT_TO_BEFORE: 'insert-before',
    RESULT_INSERT_TO_AFTER: 'insert-after',
    RESULT_LIST_MERGE: 'patch',
    RESULT_ITEM_MERGE: 'merge',
    RESULT_BATCH_UPDATE: 'batch_update',
    RESULT_ITEM_MERGE_SORT: 'merge-sort',
    RESULT_ITEM_MERGE_IF_EXISTS: 'merge-if-exists'
  } as const,
  FIELD_DATA: {
    RESULT_KEY: 'result',
    EXTRA_KEY: 'extra'
  } as const,
  DEFAULT_UNIQUE_KEY_NAME: 'id'
} as const
