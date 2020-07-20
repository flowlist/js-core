/*!
 * @flowlist/js-core v1.0.2
 * (c) 2020 falstack
 * https://github.com/flowlist/js-core#readme
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["jsCore"] = factory();
	else
		root["jsCore"] = factory();
})((typeof self !== 'undefined' ? self : this), function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "fb15");
/******/ })
/************************************************************************/
/******/ ({

/***/ "8875":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// addapted from the document.currentScript polyfill by Adam Miller
// MIT license
// source: https://github.com/amiller-gh/currentScript-polyfill

// added support for Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1620505

(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(typeof self !== 'undefined' ? self : this, function () {
  function getCurrentScript () {
    var descriptor = Object.getOwnPropertyDescriptor(document, 'currentScript')
    // for chrome
    if (!descriptor && 'currentScript' in document && document.currentScript) {
      return document.currentScript
    }

    // for other browsers with native support for currentScript
    if (descriptor && descriptor.get !== getCurrentScript && document.currentScript) {
      return document.currentScript
    }
  
    // IE 8-10 support script readyState
    // IE 11+ & Firefox support stack trace
    try {
      throw new Error();
    }
    catch (err) {
      // Find the second match for the "at" string to get file src url from stack.
      var ieStackRegExp = /.*at [^(]*\((.*):(.+):(.+)\)$/ig,
        ffStackRegExp = /@([^@]*):(\d+):(\d+)\s*$/ig,
        stackDetails = ieStackRegExp.exec(err.stack) || ffStackRegExp.exec(err.stack),
        scriptLocation = (stackDetails && stackDetails[1]) || false,
        line = (stackDetails && stackDetails[2]) || false,
        currentLocation = document.location.href.replace(document.location.hash, ''),
        pageSource,
        inlineScriptSourceRegExp,
        inlineScriptSource,
        scripts = document.getElementsByTagName('script'); // Live NodeList collection
  
      if (scriptLocation === currentLocation) {
        pageSource = document.documentElement.outerHTML;
        inlineScriptSourceRegExp = new RegExp('(?:[^\\n]+?\\n){0,' + (line - 2) + '}[^<]*<script>([\\d\\D]*?)<\\/script>[\\d\\D]*', 'i');
        inlineScriptSource = pageSource.replace(inlineScriptSourceRegExp, '$1').trim();
      }
  
      for (var i = 0; i < scripts.length; i++) {
        // If ready state is interactive, return the script tag
        if (scripts[i].readyState === 'interactive') {
          return scripts[i];
        }
  
        // If src matches, return the script tag
        if (scripts[i].src === scriptLocation) {
          return scripts[i];
        }
  
        // If inline source matches, return the script tag
        if (
          scriptLocation === currentLocation &&
          scripts[i].innerHTML &&
          scripts[i].innerHTML.trim() === inlineScriptSource
        ) {
          return scripts[i];
        }
      }
  
      // If no match, return null
      return null;
    }
  };

  return getCurrentScript
}));


/***/ }),

/***/ "fb15":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// NAMESPACE OBJECT: ./src/utils.js
var utils_namespaceObject = {};
__webpack_require__.r(utils_namespaceObject);
__webpack_require__.d(utils_namespaceObject, "generateDefaultField", function() { return generateDefaultField; });
__webpack_require__.d(utils_namespaceObject, "generateFieldName", function() { return generateFieldName; });
__webpack_require__.d(utils_namespaceObject, "getObjectDeepValue", function() { return getObjectDeepValue; });
__webpack_require__.d(utils_namespaceObject, "updateObjectDeepValue", function() { return updateObjectDeepValue; });
__webpack_require__.d(utils_namespaceObject, "computeMatchedItemIndex", function() { return computeMatchedItemIndex; });
__webpack_require__.d(utils_namespaceObject, "combineArrayData", function() { return combineArrayData; });
__webpack_require__.d(utils_namespaceObject, "isArray", function() { return isArray; });
__webpack_require__.d(utils_namespaceObject, "setReactivityField", function() { return utils_setReactivityField; });
__webpack_require__.d(utils_namespaceObject, "computeResultLength", function() { return computeResultLength; });
__webpack_require__.d(utils_namespaceObject, "generateRequestParams", function() { return utils_generateRequestParams; });

// NAMESPACE OBJECT: ./src/actions.js
var actions_namespaceObject = {};
__webpack_require__.r(actions_namespaceObject);
__webpack_require__.d(actions_namespaceObject, "initState", function() { return actions_initState; });
__webpack_require__.d(actions_namespaceObject, "initData", function() { return actions_initData; });
__webpack_require__.d(actions_namespaceObject, "loadMore", function() { return actions_loadMore; });
__webpack_require__.d(actions_namespaceObject, "updateState", function() { return actions_updateState; });

// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var currentScript = window.document.currentScript
  if (true) {
    var getCurrentScript = __webpack_require__("8875")
    currentScript = getCurrentScript()

    // for backward compatibility, because previously we directly included the polyfill
    if (!('currentScript' in document)) {
      Object.defineProperty(document, 'currentScript', { get: getCurrentScript })
    }
  }

  var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)
  if (src) {
    __webpack_require__.p = src[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
/* harmony default export */ var setPublicPath = (null);

// CONCATENATED MODULE: ./src/enum.js
/* harmony default export */ var src_enum = ({
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
});
// CONCATENATED MODULE: ./src/utils.js
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


var generateDefaultField = function generateDefaultField() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return _objectSpread(_objectSpread({}, {
    result: [],
    noMore: false,
    nothing: false,
    loading: false,
    error: null,
    extra: null,
    fetched: false,
    page: 0,
    total: 0
  }), opts);
};
/**
 * 根据参数生成 field 的 namespace
 * @param {string} func
 * @param {string} type
 * @param {object} query
 * @return {string}
 */

var generateFieldName = function generateFieldName(_ref) {
  var func = _ref.func,
      type = _ref.type,
      _ref$query = _ref.query,
      query = _ref$query === void 0 ? {} : _ref$query;
  var result = "".concat(func, "-").concat(type);
  Object.keys(query).filter(function (_) {
    return !~['undefined', 'object', 'function'].indexOf(_typeof(query[_])) && !~['page', 'is_up', 'since_id', 'seen_ids', '__refresh__', '__reload__'].indexOf(_);
  }).sort().forEach(function (key) {
    result += "-".concat(key, "-").concat(query[key]);
  });
  return result;
};
/**
 * 根据 key 从 object 里拿 value
 * @param {object} field
 * @param {string} keys
 * @return {*}
 */

var getObjectDeepValue = function getObjectDeepValue(field, keys) {
  if (!keys) {
    return field;
  }

  var result = field;
  var keysArr = isArray(keys) ? keys : keys.split('.');
  keysArr.forEach(function (key) {
    result = result[key];
  });
  return result;
};
var updateObjectDeepValue = function updateObjectDeepValue(field, changeKey, value) {
  if (/\./.test(changeKey)) {
    var keys = changeKey.split('.');
    var prefix = keys.pop();
    var result = field;
    keys.forEach(function (key) {
      result = result[key];
    });
    result[prefix] = value;
  } else {
    field[changeKey] = value;
  }
};
/**
 * 通过 id 匹配返回数组中某个对象的 index
 * @param {int|string} itemId
 * @param {array} fieldArr
 * @param {int|string} changingKey
 * @return {number}
 */

var computeMatchedItemIndex = function computeMatchedItemIndex(itemId, fieldArr, changingKey) {
  var s = -1;

  for (var i = 0; i < fieldArr.length; i++) {
    if (getObjectDeepValue(fieldArr[i], changingKey).toString() === itemId.toString()) {
      s = i;
      break;
    }
  }

  return s;
};
var combineArrayData = function combineArrayData(fieldArray, value, changingKey) {
  if (isArray(value)) {
    value.forEach(function (col) {
      var stringifyId = getObjectDeepValue(col, changingKey).toString();
      fieldArray.forEach(function (item, index) {
        if (getObjectDeepValue(item, changingKey).toString() === stringifyId) {
          fieldArray[index] = _objectSpread(_objectSpread({}, item), col);
        }
      });
    });
  } else {
    Object.keys(value).forEach(function (uniqueId) {
      var stringifyId = uniqueId.toString();
      fieldArray.forEach(function (item, index) {
        if (getObjectDeepValue(item, changingKey).toString() === stringifyId) {
          fieldArray[index] = _objectSpread(_objectSpread({}, item), value[uniqueId]);
        }
      });
    });
  }
};
/**
 * 判断参数是否为数组
 * @param {object|array} data
 * @return {boolean}
 */

var isArray = function isArray(data) {
  return Object.prototype.toString.call(data) === '[object Array]';
};
/**
 * 设置一个响应式的数据到对象上
 * @param {object} field
 * @param {string} key
 * @param {array|object} value
 * @param {string} type
 * @param {boolean} insertBefore
 */

var utils_setReactivityField = function setReactivityField(field, key, value, type, insertBefore) {
  if (type === src_enum.FETCH_TYPE.PAGINATION) {
    field[key] = value;
    return;
  }

  if (isArray(value)) {
    field[key] = insertBefore ? value.concat(field[key] || []) : (field[key] || []).concat(value);
    return;
  }

  if (key !== src_enum.FIELD_DATA.RESULT_KEY) {
    field[key] = value;
    return;
  }

  if (isArray(field[key])) {
    field[key] = {};
  }

  Object.keys(value).forEach(function (subKey) {
    field[key][subKey] = field[key][subKey] ? insertBefore ? value[subKey].concat(field[key][subKey]) : field[key][subKey].concat(value[subKey]) : value[subKey];
  });
};
/**
 * 计算一个数据列的长度
 * @param {array|object} data
 * @return {number}
 */

var computeResultLength = function computeResultLength(data) {
  var result = 0;

  if (isArray(data)) {
    result = data.length;
  } else {
    Object.keys(data).forEach(function (key) {
      result += data[key].length;
    });
  }

  return result;
};
/**
 * 拼接请求的参数
 * @param {object} field
 * @param {string} uniqueKey
 * @param {object} query
 * @param {string} type
 * @return {object}
 */

var utils_generateRequestParams = function generateRequestParams(_ref2) {
  var field = _ref2.field,
      uniqueKey = _ref2.uniqueKey,
      query = _ref2.query,
      type = _ref2.type;
  var result = {};

  if (field.fetched) {
    var changing = uniqueKey || src_enum.FETCH_PARAMS_DEFAULT.CHANGE_KEY_NAME;

    if (type === src_enum.FETCH_TYPE.HAS_LOADED_IDS) {
      result.seen_ids = field.result.map(function (_) {
        return getObjectDeepValue(_, changing);
      }).join(',');
    } else if (type === src_enum.FETCH_TYPE.SINCE_FIRST_OR_END_ID) {
      result.since_id = getObjectDeepValue(field.result[query.is_up ? 0 : field.result.length - 1], changing);
      result.is_up = query.is_up ? 1 : 0;
    } else if (type === src_enum.FETCH_TYPE.PAGINATION) {
      result.page = query.page;
    } else if (type === src_enum.FETCH_TYPE.SCROLL_LOAD_MORE) {
      result.page = field.page + 1;
    }
  } else {
    if (type === src_enum.FETCH_TYPE.HAS_LOADED_IDS) {
      result.seen_ids = '';
    } else if (type === src_enum.FETCH_TYPE.SINCE_FIRST_OR_END_ID) {
      result.since_id = query.sinceId || (query.is_up ? 999999999 : 0);
      result.is_up = query.is_up ? 1 : 0;
    } else if (type === src_enum.FETCH_TYPE.PAGINATION) {
      result.page = query.page || field.page;
    } else if (type === src_enum.FETCH_TYPE.SCROLL_LOAD_MORE) {
      result.page = field.page;
    }
  }

  return _objectSpread(_objectSpread({}, query), result);
};
// CONCATENATED MODULE: ./src/setters.js


var setters_SET_DATA = function SET_DATA(_ref) {
  var getter = _ref.getter,
      setter = _ref.setter,
      cache = _ref.cache,
      data = _ref.data,
      fieldName = _ref.fieldName,
      type = _ref.type,
      fromLocal = _ref.fromLocal,
      cacheTimeout = _ref.cacheTimeout,
      page = _ref.page,
      insertBefore = _ref.insertBefore;
  return new Promise(function (resolve, reject) {
    if (fromLocal) {
      setter({
        key: fieldName,
        type: src_enum.SETTER_TYPE.RESET,
        value: data,
        callback: function callback() {
          resolve();
        }
      });
      return;
    }

    var fieldData = getter(fieldName);

    if (!fieldData) {
      reject();
      return;
    }

    var result = data.result,
        extra = data.extra;
    fieldData.nothing = fieldData.fetched ? false : computeResultLength(result) === 0;
    fieldData.fetched = true;
    fieldData.total = data.total || 0;

    if (type === src_enum.FETCH_TYPE.PAGINATION) {
      fieldData.noMore = false;
      fieldData.page = +page;
    } else {
      fieldData.noMore = data.no_more || false;
      fieldData.page = fieldData.page + 1;
    }

    fieldData.loading = false;
    utils_setReactivityField(fieldData, src_enum.FIELD_DATA.RESULT_KEY, result, type, insertBefore);
    extra && utils_setReactivityField(fieldData, src_enum.FIELD_DATA.EXTRA_KEY, extra, type, insertBefore);
    setter({
      key: fieldName,
      type: src_enum.SETTER_TYPE.RESET,
      value: fieldData,
      callback: function callback() {
        if (cacheTimeout && !fieldData.nothing) {
          cache.set({
            key: fieldName,
            value: fieldData,
            timeout: cacheTimeout
          });
        }

        resolve();
      }
    });
  });
};
var setters_SET_ERROR = function SET_ERROR(_ref2) {
  var setter = _ref2.setter,
      fieldName = _ref2.fieldName,
      error = _ref2.error;
  setter({
    key: fieldName,
    type: src_enum.SETTER_TYPE.MERGE,
    value: {
      error: error,
      loading: false
    }
  });
};
// CONCATENATED MODULE: ./src/actions.js
function actions_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function actions_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { actions_ownKeys(Object(source), true).forEach(function (key) { actions_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { actions_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function actions_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var actions_initState = function initState(_ref) {
  var getter = _ref.getter,
      setter = _ref.setter,
      func = _ref.func,
      type = _ref.type,
      query = _ref.query,
      _ref$opts = _ref.opts,
      opts = _ref$opts === void 0 ? {} : _ref$opts;
  return new Promise(function (resolve) {
    var fieldName = generateFieldName({
      func: func,
      type: type,
      query: query
    });
    var fieldData = getter(fieldName);

    if (fieldData) {
      resolve();
      return;
    }

    setter({
      key: fieldName,
      type: src_enum.SETTER_TYPE.RESET,
      value: generateDefaultField(opts),
      callback: function callback() {
        resolve();
      }
    });
  });
};
var actions_initData = function initData(_ref2) {
  var getter = _ref2.getter,
      setter = _ref2.setter,
      cache = _ref2.cache,
      func = _ref2.func,
      type = _ref2.type,
      query = _ref2.query,
      api = _ref2.api,
      cacheTimeout = _ref2.cacheTimeout,
      uniqueKey = _ref2.uniqueKey,
      callback = _ref2.callback;
  return new Promise(function (resolve, reject) {
    var fieldName = generateFieldName({
      func: func,
      type: type,
      query: query
    });
    var fieldData = getter(fieldName);
    var doRefresh = !!query.__refresh__;
    var needReset = !!query.__reload__; // 如果 error 了，就不再请求

    if (fieldData && fieldData.error && !doRefresh) {
      return resolve();
    } // 正在请求中，return


    if (fieldData && fieldData.loading) {
      return resolve();
    } // 这个 field 已经请求过了


    var dontFetch = fieldData && fieldData.fetched && !doRefresh;

    if (dontFetch) {
      return resolve();
    }

    var params = utils_generateRequestParams({
      field: actions_objectSpread(actions_objectSpread({}, fieldData), {}, {
        fetched: false
      }),
      uniqueKey: uniqueKey,
      query: query,
      type: type
    });
    var fromLocal = false;

    var getData = function getData() {
      var loadData = function loadData() {
        return new Promise(function (res) {
          if (cacheTimeout) {
            var data = cache.get({
              key: fieldName
            });

            if (data) {
              fromLocal = true;
              res(data);
              return;
            }
          }

          api[func](params).then(res).catch(function (error) {
            setters_SET_ERROR({
              setter: setter,
              fieldName: fieldName,
              error: error
            });
            reject(error);
          });
        });
      };

      loadData().then(function (data) {
        var setData = function setData() {
          setters_SET_DATA({
            getter: getter,
            setter: setter,
            cache: cache,
            data: data,
            fieldName: fieldName,
            type: type,
            fromLocal: fromLocal,
            cacheTimeout: cacheTimeout,
            page: params.page,
            insertBefore: false
          }).then(function () {
            if (callback) {
              callback({
                params: params,
                data: data,
                refresh: doRefresh
              });
            }

            resolve();
          });
        }; // 拿到数据后再重置 field


        if (needReset) {
          setter({
            key: fieldName,
            type: src_enum.SETTER_TYPE.RESET,
            value: generateDefaultField(),
            callback: setData
          });
        } else {
          setData();
        }
      });
    }; // 需要预初始化 field


    if (!dontFetch && !needReset) {
      setter({
        key: fieldName,
        type: src_enum.SETTER_TYPE.RESET,
        value: actions_objectSpread(actions_objectSpread({}, generateDefaultField()), {}, {
          loading: true,
          error: null
        }),
        callback: getData
      });
    } else {
      getData();
    }
  });
};
var actions_loadMore = function loadMore(_ref3) {
  var getter = _ref3.getter,
      setter = _ref3.setter,
      cache = _ref3.cache,
      query = _ref3.query,
      type = _ref3.type,
      func = _ref3.func,
      api = _ref3.api,
      cacheTimeout = _ref3.cacheTimeout,
      uniqueKey = _ref3.uniqueKey,
      errorRetry = _ref3.errorRetry,
      callback = _ref3.callback;
  return new Promise(function (resolve, reject) {
    var fieldName = generateFieldName({
      func: func,
      type: type,
      query: query
    });
    var fieldData = getter(fieldName);

    if (!fieldData) {
      return resolve();
    }

    if (fieldData.loading) {
      return resolve();
    }

    if (fieldData.nothing) {
      return resolve();
    }

    if (fieldData.noMore && !errorRetry) {
      return resolve();
    }

    if (type === src_enum.FETCH_TYPE.PAGINATION && +query.page === fieldData.page) {
      return resolve();
    }

    var loadingState = {
      loading: true,
      error: null
    };

    if (type === src_enum.FETCH_TYPE.PAGINATION) {
      loadingState.result = [];
      loadingState.extra = null;
    }

    var params = utils_generateRequestParams({
      field: fieldData,
      uniqueKey: uniqueKey,
      query: query,
      type: type
    });
    params._extra = fieldData.extra;

    var getData = function getData() {
      api[func](params).then(function (data) {
        setters_SET_DATA({
          getter: getter,
          setter: setter,
          cache: cache,
          data: data,
          fieldName: fieldName,
          type: type,
          fromLocal: false,
          cacheTimeout: cacheTimeout,
          page: params.page,
          insertBefore: !!query.is_up
        }).then(function () {
          if (callback) {
            callback({
              params: params,
              data: data,
              refresh: false
            });
          }

          resolve();
        });
      }).catch(function (error) {
        setters_SET_ERROR({
          setter: setter,
          fieldName: fieldName,
          error: error
        });
        reject(error);
      });
    };

    setter({
      key: fieldName,
      type: src_enum.SETTER_TYPE.MERGE,
      value: loadingState,
      callback: getData
    });
  });
};
var actions_updateState = function updateState(_ref4) {
  var getter = _ref4.getter,
      setter = _ref4.setter,
      cache = _ref4.cache,
      type = _ref4.type,
      func = _ref4.func,
      query = _ref4.query,
      method = _ref4.method,
      value = _ref4.value,
      _ref4$id = _ref4.id,
      id = _ref4$id === void 0 ? '' : _ref4$id,
      _ref4$uniqueKey = _ref4.uniqueKey,
      uniqueKey = _ref4$uniqueKey === void 0 ? src_enum.FETCH_PARAMS_DEFAULT.CHANGE_KEY_NAME : _ref4$uniqueKey,
      _ref4$changeKey = _ref4.changeKey,
      changeKey = _ref4$changeKey === void 0 ? src_enum.FIELD_DATA.RESULT_KEY : _ref4$changeKey,
      cacheTimeout = _ref4.cacheTimeout;
  return new Promise(function (resolve, reject) {
    var fieldName = generateFieldName({
      func: func,
      type: type,
      query: query
    });
    var fieldData = getter(fieldName);

    if (!fieldData) {
      reject();
      return;
    }

    var beforeLength = computeResultLength(fieldData.result);

    if (method === src_enum.CHANGE_TYPE.UPDATE_RESULT) {
      // 修改 result 下的某个值的任意字段
      var matchedIndex = computeMatchedItemIndex(id, fieldData.result, uniqueKey);
      updateObjectDeepValue(fieldData.result[matchedIndex], changeKey, value);
    } else if (method === src_enum.CHANGE_TYPE.RESET_FIELD) {
      // 修改包括 field 下的任意字段
      updateObjectDeepValue(fieldData, changeKey, value);
    } else {
      var modifyValue = getObjectDeepValue(fieldData, changeKey);

      var _matchedIndex = computeMatchedItemIndex(id, modifyValue, uniqueKey);

      switch (method) {
        case src_enum.CHANGE_TYPE.RESULT_ADD_AFTER:
          isArray(value) ? modifyValue = modifyValue.concat(value) : modifyValue.push(value);
          break;

        case src_enum.CHANGE_TYPE.RESULT_ADD_BEFORE:
          isArray(value) ? modifyValue = value.concat(modifyValue) : modifyValue.unshift(value);
          break;

        case src_enum.CHANGE_TYPE.RESULT_REMOVE_BY_ID:
          if (_matchedIndex >= 0) {
            modifyValue.splice(_matchedIndex, 1);
          }

          break;

        case src_enum.CHANGE_TYPE.RESULT_INSERT_TO_BEFORE:
          if (_matchedIndex >= 0) {
            modifyValue.splice(_matchedIndex, 0, value);
          }

          break;

        case src_enum.CHANGE_TYPE.RESULT_INSERT_TO_AFTER:
          if (_matchedIndex >= 0) {
            modifyValue.splice(_matchedIndex + 1, 0, value);
          }

          break;

        case src_enum.CHANGE_TYPE.RESULT_LIST_MERGE:
          combineArrayData(modifyValue, value, uniqueKey);
          break;
      }

      fieldData[changeKey] = modifyValue;
    }

    var afterLength = computeResultLength(fieldData.result);
    fieldData.total = fieldData.total + afterLength - beforeLength;
    fieldData.nothing = afterLength === 0;
    setter({
      key: fieldName,
      type: src_enum.SETTER_TYPE.MERGE,
      value: fieldData,
      callback: function callback() {
        if (cacheTimeout) {
          cache.set({
            key: fieldName,
            value: fieldData,
            timeout: cacheTimeout
          });
        }

        resolve();
      }
    });
  });
};
// CONCATENATED MODULE: ./src/index.js
function src_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function src_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { src_ownKeys(Object(source), true).forEach(function (key) { src_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { src_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function src_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



/* harmony default export */ var src_0 = (src_objectSpread({
  utils: utils_namespaceObject
}, actions_namespaceObject));
// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/entry-lib.js


/* harmony default export */ var entry_lib = __webpack_exports__["default"] = (src_0);



/***/ })

/******/ })["default"];
});