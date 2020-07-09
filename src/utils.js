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
export const generateFieldName = (func, type, query = {}) => {
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

/**
 * 从 localStorage 里获取数据
 * @param {string} key
 * @param {int} now
 * @return {null|object}
 */
export const getDateFromCache = ({ key, now }) => {
  try {
    const expiredAt = localStorage.getItem(`vue-mixin-store-${key}-expired-at`)
    const cacheStr = localStorage.getItem(`vue-mixin-store-${key}`)
    if (!expiredAt || !cacheStr || now - expiredAt > 0) {
      localStorage.removeItem(`vue-mixin-store-${key}`)
      localStorage.removeItem(`vue-mixin-store-${key}-expired-at`)
      return null
    }
    return JSON.parse(cacheStr)
  } catch (e) {
    return null
  }
}

/**
 * 设置 localStorage
 * @param {string} key
 * @param {object} value
 * @param {int} expiredAt
 */
export const setDataToCache = ({ key, value, expiredAt }) => {
  try {
    localStorage.setItem(`vue-mixin-store-${key}`, JSON.stringify(value))
    localStorage.setItem(`vue-mixin-store-${key}-expired-at`, expiredAt)
  } catch (e) {
    // do nothing
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
  if (type === 'jump') {
    field[key] = value
    return
  }

  if (isArray(value)) {
    field[key] = insertBefore ? value.concat(field[key] || []) : (field[key] || []).concat(value)
    return
  }

  if (key !== 'result') {
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
export const generateRequestParams = ({ field, uniqueKey, query, type }) => {
  const result = {}
  if (field.fetched) {
    const changing = uniqueKey || 'id'
    if (type === 'seenIds') {
      result.seen_ids = field.result.map((_) => getObjectDeepValue(_, changing)).join(',')
    } else if (type === 'sinceId') {
      result.since_id = getObjectDeepValue(field.result[query.is_up ? 0 : field.result.length - 1], changing)
      result.is_up = query.is_up ? 1 : 0
    } else if (type === 'jump') {
      result.page = query.page
    } else if (type === 'page') {
      result.page = field.page + 1
    }
  } else {
    if (type === 'seenIds') {
      result.seen_ids = ''
    } else if (type === 'sinceId') {
      result.since_id = query.sinceId || (query.is_up ? 999999999 : 0)
      result.is_up = query.is_up ? 1 : 0
    } else if (type === 'jump') {
      result.page = query.page || field.page
    } else if (type === 'page') {
      result.page = field.page
    }
  }

  return {
    ...query,
    ...result
  }
}

export const isClient = typeof window !== 'undefined'

export const observerInstance = isClient
  ? window.IntersectionObserver
  && new window.IntersectionObserver((entries) => {
    entries.forEach(({ intersectionRatio, target }) => {
      if (intersectionRatio <= 0 || !target) {
        return
      }
      target.__flow_handler__ && target.__flow_handler__()
    })
  }) : null

export const printLog = (field, type, val) => console.log(`[${field}]`, type, val)
