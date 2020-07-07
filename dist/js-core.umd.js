(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.jsCore = factory());
}(this, (function () { 'use strict';

  const generateDefaultField = () => ({
    result: [],
    noMore: false,
    nothing: false,
    loading: false,
    fetched: false,
    error: null,
    extra: null,
    page: 0,
    total: 0
  });

  /**
   * 根据参数生成 field 的 namespace
   * @param {string} func
   * @param {string} type
   * @param {object} query
   * @return {string}
   */
  const generateFieldName = (func, type, query = {}) => {
    let result = `${func}-${type}`;
    Object.keys(query)
      .filter(
        _ =>
          !~['undefined', 'object', 'function'].indexOf(typeof query[_]) &&
          !~['page', 'is_up', 'since_id', 'seen_ids', 'last_id', 'changing', '__refresh__', '__reload__'].indexOf(_)
      )
      .sort()
      .forEach(key => {
        result += `-${key}-${query[key]}`;
      });
    return result
  };

  /**
   * 根据 key 从 object 里拿 value
   * @param {object} field
   * @param {string} keys
   * @return {*}
   */
  const getObjectDeepValue = (field, keys) => {
    if (!keys) {
      return field
    }
    let result = field;
    const keysArr = isArray(keys) ? keys : keys.split('.');
    keysArr.forEach(key => {
      result = result[key];
    });
    return result
  };

  /**
   * 从 localStorage 里获取数据
   * @param {string} key
   * @param {int} now
   * @return {null|object}
   */
  const getDateFromCache = ({ key, now }) => {
    try {
      const expiredAt = localStorage.getItem(`vue-mixin-store-${key}-expired-at`);
      const cacheStr = localStorage.getItem(`vue-mixin-store-${key}`);
      if (!expiredAt || !cacheStr || now - expiredAt > 0) {
        localStorage.removeItem(`vue-mixin-store-${key}`);
        localStorage.removeItem(`vue-mixin-store-${key}-expired-at`);
        return null
      }
      return JSON.parse(cacheStr)
    } catch (e) {
      return null
    }
  };

  /**
   * 设置 localStorage
   * @param {string} key
   * @param {object} value
   * @param {int} expiredAt
   */
  const setDataToCache = ({ key, value, expiredAt }) => {
    try {
      localStorage.setItem(`vue-mixin-store-${key}`, JSON.stringify(value));
      localStorage.setItem(`vue-mixin-store-${key}-expired-at`, expiredAt);
    } catch (e) {
      // do nothing
    }
  };

  /**
   * 判断参数是否为数组
   * @param {any} data
   * @return {boolean}
   */
  const isArray = data => Object.prototype.toString.call(data) === '[object Array]';

  /**
   * 设置一个响应式的数据到对象上
   * @param {Vue.set} setter
   * @param {object} field
   * @param {string} key
   * @param {any} value
   * @param {string} type
   * @param {boolean} insertBefore
   */
  const setReactivityField = (setter, field, key, value, type, insertBefore ) => {
    if (field[key]) {
      if (isArray(value)) {
        field[key] = insertBefore ? value.concat(field[key]) : field[key].concat(value);
      } else {
        if (type === 'jump' || key !== 'result') {
          setter(field, key, value);
        } else {
          const oldVal = field[key];
          const newVal = { ...oldVal };
          Object.keys(value).forEach(subKey => {
            newVal[subKey] = oldVal[subKey]
              ? insertBefore ? value[subKey].concat(oldVal[subKey]) : oldVal[subKey].concat(value[subKey])
              : value[subKey];
          });
          setter(field, key, newVal);
        }
      }
    } else {
      setter(field, key, value);
    }
  };

  /**
   * 响应式的更新对象上的数据
   * @param {Vue.set} setter
   * @param {array} fieldArray
   * @param {any} value
   * @param {string} changing
   */
  const updateReactivityField = (setter, fieldArray, value, changing) => {
    if (isArray(value)) {
      value.forEach(col => {
        const stringifyId = getObjectDeepValue(col, changing).toString();
        fieldArray.forEach((item, index) => {
          if (getObjectDeepValue(item, changing).toString() === stringifyId) {
            Object.keys(col).forEach(key => {
              setter(fieldArray[index], key, col[key]);
            });
          }
        });
      });
    } else {
      Object.keys(value).forEach(uniqueId => {
        const stringifyId = uniqueId.toString();
        fieldArray.forEach((item, index) => {
          if (getObjectDeepValue(item, changing).toString() === stringifyId) {
            const col = value[uniqueId];
            Object.keys(col).forEach(key => {
              setter(fieldArray[index], key, col[key]);
            });
          }
        });
      });
    }
  };

  /**
   * 通过 id 匹配返回数组中某个对象的 index
   * @param {int|string} itemId
   * @param {array} fieldArr
   * @param {int|string} changingKey
   * @return {number}
   */
  const computeMatchedItemIndex = (itemId, fieldArr, changingKey) => {
    let i;
    for (i = 0; i < fieldArr.length; i++) {
      if (getObjectDeepValue(fieldArr[i], changingKey).toString() === itemId.toString()) {
        break
      }
    }
    return i
  };

  /**
   * 计算一个数据列的长度
   * @param {array|object} data
   * @return {number}
   */
  const computeResultLength = data => {
    let result = 0;
    if (isArray(data)) {
      result = data.length;
    } else {
      Object.keys(data).forEach(key => {
        result += data[key].length;
      });
    }
    return result
  };

  /**
   * 事件绑定
   * @param elem
   * @param {string} type
   * @param {function} listener
   */
  const on = (elem, type, listener) => {
    elem.addEventListener(type, listener, {
      capture: false,
      passive: true
    });
  };

  /**
   * 事件解绑
   * @param elem
   * @param {string} type
   * @param {function} listener
   */
  const off = (elem, type, listener) => {
    elem.removeEventListener(type, listener, {
      capture: false,
      passive: true
    });
  };

  /**
   * 检查元素是否在屏幕内
   * @param dom
   * @param {int} preload
   * @return {boolean}
   */
  const checkInView = (dom, preload = 0) => {
    if (!dom) {
      return false
    }
    const rect = dom.getBoundingClientRect();
    if (!rect.left && !rect.right && !rect.top && !rect.bottom) {
      return false
    }
    return (
      rect.top < window.innerHeight + preload &&
      rect.bottom + preload > 0 &&
      rect.left < window.innerWidth + preload &&
      rect.right + preload > 0
    )
  };

  /**
   * 拼接请求的参数
   * @param {object} field
   * @param {object} query
   * @param {string} type
   * @return {object}
   */
  const generateRequestParams = (field, query, type) => {
    const result = {};
    if (field.fetched) {
      const changing = query.changing || 'id';
      if (type === 'seenIds') {
        result.seen_ids = field.result.map(_ => getObjectDeepValue(_, changing)).join(',');
      } else if (type === 'lastId') {
        result.last_id = getObjectDeepValue(field.result[field.result.length - 1], changing);
      } else if (type === 'sinceId') {
        result.since_id = getObjectDeepValue(query.is_up ? field.result[0] : field.result[field.result.length - 1], changing);
        result.is_up = query.is_up ? 1 : 0;
      } else if (type === 'jump') {
        result.page = query.page || 1;
      } else {
        result.page = field.page + 1;
      }
    } else {
      if (type === 'seenIds') {
        result.seen_ids = '';
      } else if (type === 'lastId') {
        result.last_id = 0;
      } else if (type === 'sinceId') {
        result.since_id = query.sinceId || (query.is_up ? 999999999 : 0);
        result.is_up = query.is_up ? 1 : 0;
      } else if (type === 'jump') {
        result.page = query.page || 1;
      } else {
        result.page = 1;
      }
    }
    return Object.assign(query, result)
  };

  const getScrollParentDom = dom => {
    let el = dom;
    if (!el) {
      return null
    }
    while (
      el &&
      el.tagName !== 'HTML' &&
      el.tagName !== 'BOYD' &&
      el.nodeType === 1
      ) {
      const overflowY = window.getComputedStyle(el).overflowY;
      if (overflowY === 'scroll' || overflowY === 'auto') {
        if (el.tagName === 'HTML' || el.tagName === 'BODY') {
          return document
        }
        return el
      }
      el = el.parentNode;
    }
    return document
  };

  const observerInstance = typeof window === 'undefined' ? null :
    window.IntersectionObserver &&
    new window.IntersectionObserver((entries) => {
      entries.forEach(({ intersectionRatio, target }) => {
        if (intersectionRatio <= 0 || !target) {
          return
        }
        target.__flow_handler__ && target.__flow_handler__();
      });
    });

  var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    generateDefaultField: generateDefaultField,
    generateFieldName: generateFieldName,
    getObjectDeepValue: getObjectDeepValue,
    getDateFromCache: getDateFromCache,
    setDataToCache: setDataToCache,
    isArray: isArray,
    setReactivityField: setReactivityField,
    updateReactivityField: updateReactivityField,
    computeMatchedItemIndex: computeMatchedItemIndex,
    computeResultLength: computeResultLength,
    on: on,
    off: off,
    checkInView: checkInView,
    generateRequestParams: generateRequestParams,
    getScrollParentDom: getScrollParentDom,
    observerInstance: observerInstance
  });

  var index = {
    ...utils
  };

  return index;

})));
