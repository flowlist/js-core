const FETCH_TYPE_ARRAY = ['jump', 'sinceId', 'page', 'seenIds']

export default {
  SETTER_TYPE: {
    RESET: 0,
    MERGE: 1
  },
  FETCH_TYPE_ARRAY,
  FETCH_TYPE: {
    PAGINATION: FETCH_TYPE_ARRAY[0],
    SINCE_FIRST_OR_END_ID: FETCH_TYPE_ARRAY[1],
    SCROLL_LOAD_MORE: FETCH_TYPE_ARRAY[2],
    HAS_LOADED_IDS: FETCH_TYPE_ARRAY[3]
  },
  CHANGE_TYPE: {
    RESET_FIELD: 'reset',
    UPDATE_RESULT: 'update',
    RESULT_ADD_AFTER: 'push',
    RESULT_ADD_BEFORE: 'unshift',
    RESULT_REMOVE_BY_ID: 'delete',
    RESULT_INSERT_TO_BEFORE: 'insert-before',
    RESULT_INSERT_TO_AFTER: 'insert-after',
    RESULT_LIST_MERGE: 'patch'
  },
  FIELD_DATA: {
    RESULT_KEY: 'result',
    EXTRA_KEY: 'extra'
  },
  DEFAULT_UNIQUE_KEY_NAME: 'id'
}
