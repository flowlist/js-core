import ENUM from './enum'

export const generateDefaultField = (opts = {}) => ({
  ...{
    result: [],
    noMore: false,
    nothing: false,
    loading: false,
    error: null,
    extra: null,
    fetched: false,
    page: 0,
    total: 0,
  },
  ...opts
})

/**
 * 根据参数生成 field 的 namespace
 * @param {string} func
 * @param {string} type
 * @param {object} query
 * @return {string}
 */
export const generateFieldName = ({ func, type, query = {} }) => {
  let result = `${func}-${type}`
  Object.keys(query)
    .filter(
      (_) => !~['undefined', 'object', 'function'].indexOf(typeof query[_])
        && !~['page', 'is_up', 'since_id', 'seen_ids', '__refresh__', '__reload__'].indexOf(_),
    )
    .sort()
    .forEach((key) => {
      result += `-${key}-${query[key]}`
    })
  return result
}

/**
 * 根据 key 从 object 里拿 value
 * @param {object} field
 * @param {string} keys
 * @return {*}
 */
export const getObjectDeepValue = (field, keys) => {
  if (!keys) {
    return field
  }
  let result = field
  const keysArr = isArray(keys) ? keys : keys.split('.')
  keysArr.forEach((key) => {
    result = result[key]
  })
  return result
}

export const updateObjectDeepValue = (field, changeKey, value) => {
  if (/\./.test(changeKey)) {
    const keys = changeKey.split('.')
    const prefix = keys.pop()
    let result = field
    keys.forEach(key => {
      result = result[key]
    })
    result[prefix] = value
  } else {
    field[changeKey] = value
  }
}

export const searchValueByKey = (result, id, key) => {
  if (isArray(result)) {
    const index = computeMatchedItemIndex(id, result, key)
    if (index < 0) {
      return undefined
    }
    return result[index]
  }
  return result[id]
}

/**
 * 通过 id 匹配返回数组中某个对象的 index
 * @param {int|string} itemId
 * @param {array} fieldArr
 * @param {int|string} changingKey
 * @return {number}
 */
export const computeMatchedItemIndex = (itemId, fieldArr, changingKey) => {
  let s = -1
  for (let i = 0; i < fieldArr.length; i++) {
    if (getObjectDeepValue(fieldArr[i], changingKey).toString() === itemId.toString()) {
      s = i
      break
    }
  }
  return s
}

export const combineArrayData = (fieldArray, value, changingKey) => {
  if (isArray(value)) {
    value.forEach(col => {
      const stringifyId = getObjectDeepValue(col, changingKey).toString()
      fieldArray.forEach((item, index) => {
        if (getObjectDeepValue(item, changingKey).toString() === stringifyId) {
          fieldArray[index] = {
            ...item,
            ...col
          }
        }
      })
    })
  } else {
    Object.keys(value).forEach(uniqueId => {
      const stringifyId = uniqueId.toString()
      fieldArray.forEach((item, index) => {
        if (getObjectDeepValue(item, changingKey).toString() === stringifyId) {
          fieldArray[index] = {
            ...item,
            ...value[uniqueId]
          }
        }
      })
    })
  }
}

/**
 * 判断参数是否为数组
 * @param {object|array} data
 * @return {boolean}
 */
export const isArray = (data) => Object.prototype.toString.call(data) === '[object Array]'

/**
 * 设置一个响应式的数据到对象上
 * @param {object} field
 * @param {string} key
 * @param {array|object} value
 * @param {string} type
 * @param {boolean} insertBefore
 */
export const setReactivityField = (field, key, value, type, insertBefore) => {
  if (type === ENUM.FETCH_TYPE.PAGINATION) {
    field[key] = value
    return
  }

  if (isArray(value)) {
    field[key] = insertBefore ? value.concat(field[key] || []) : (field[key] || []).concat(value)
    return
  }

  if (key !== ENUM.FIELD_DATA.RESULT_KEY) {
    field[key] = value
    return
  }

  if (isArray(field[key])) {
    field[key] = {}
  }

  Object.keys(value).forEach((subKey) => {
    field[key][subKey] = field[key][subKey]
      ? insertBefore ? value[subKey].concat(field[key][subKey]) : field[key][subKey].concat(value[subKey])
      : value[subKey]
  })
}

/**
 * 计算一个数据列的长度
 * @param {array|object} data
 * @return {number}
 */
export const computeResultLength = (data) => {
  let result = 0
  if (isArray(data)) {
    result = data.length
  } else {
    Object.keys(data).forEach((key) => {
      result += data[key].length
    })
  }
  return result
}

/**
 * 拼接请求的参数
 * @param {object} field
 * @param {string} uniqueKey
 * @param {object} query
 * @param {string} type
 * @return {object}
 */
export const generateRequestParams = ({ field, uniqueKey, query }) => {
  const result = {}
  if (field.fetched) {
    const changing = uniqueKey || ENUM.DEFAULT_UNIQUE_KEY_NAME
    result.seen_ids = field.result.length ? field.result.map((_) => getObjectDeepValue(_, changing)).join(',') : ''
    result.since_id = field.result.length ? getObjectDeepValue(field.result[query.is_up ? 0 : field.result.length - 1], changing) : query.sinceId || (query.is_up ? 999999999 : 0)
    result.is_up = query.is_up ? 1 : 0
    result.page = query.page || field.page + 1
  } else {
    result.seen_ids = ''
    result.since_id = query.sinceId || (query.is_up ? 999999999 : 0)
    result.is_up = query.is_up ? 1 : 0
    result.page = query.page || field.page || 1
  }

  return {
    ...query,
    ...result
  }
}
