export default {
  SETTER_TYPE: {
    RESET: 0,
    MERGE: 1
  },
  FETCH_TYPE: {
    PAGINATION: 'jump',
    SINCE_FIRST_OR_END_ID: 'sinceId',
    SCROLL_LOAD_MORE: 'page',
    HAS_LOADED_IDS: 'seenIds'
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
  FETCH_PARAMS_DEFAULT: {
    CHANGE_KEY_NAME: 'id'
  }
}
