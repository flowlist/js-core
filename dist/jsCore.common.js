/*!
 * @flowlist/js-core v0.0.1
 * (c) 2020 falstack
 * https://github.com/flowlist/js-core#readme
 */
module.exports =
/******/ (function(modules) { // webpackBootstrap
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
__webpack_require__.d(utils_namespaceObject, "getDateFromCache", function() { return getDateFromCache; });
__webpack_require__.d(utils_namespaceObject, "setDataToCache", function() { return setDataToCache; });
__webpack_require__.d(utils_namespaceObject, "isArray", function() { return isArray; });
__webpack_require__.d(utils_namespaceObject, "setReactivityField", function() { return setReactivityField; });
__webpack_require__.d(utils_namespaceObject, "updateReactivityField", function() { return updateReactivityField; });
__webpack_require__.d(utils_namespaceObject, "computeMatchedItemIndex", function() { return computeMatchedItemIndex; });
__webpack_require__.d(utils_namespaceObject, "computeResultLength", function() { return computeResultLength; });
__webpack_require__.d(utils_namespaceObject, "on", function() { return on; });
__webpack_require__.d(utils_namespaceObject, "off", function() { return off; });
__webpack_require__.d(utils_namespaceObject, "checkInView", function() { return checkInView; });
__webpack_require__.d(utils_namespaceObject, "generateRequestParams", function() { return generateRequestParams; });
__webpack_require__.d(utils_namespaceObject, "getScrollParentDom", function() { return getScrollParentDom; });
__webpack_require__.d(utils_namespaceObject, "observerInstance", function() { return observerInstance; });

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

// CONCATENATED MODULE: ./src/utils.js
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var generateDefaultField = function generateDefaultField() {
  return {
    result: [],
    noMore: false,
    nothing: false,
    loading: false,
    fetched: false,
    error: null,
    extra: null,
    page: 0,
    total: 0
  };
};
/**
 * 根据参数生成 field 的 namespace
 * @param {string} func
 * @param {string} type
 * @param {object} query
 * @return {string}
 */

var generateFieldName = function generateFieldName(func, type) {
  var query = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var result = "".concat(func, "-").concat(type);
  Object.keys(query).filter(function (_) {
    return !~['undefined', 'object', 'function'].indexOf(_typeof(query[_])) && !~['page', 'is_up', 'since_id', 'seen_ids', 'last_id', 'changing', '__refresh__', '__reload__'].indexOf(_);
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
/**
 * 从 localStorage 里获取数据
 * @param {string} key
 * @param {int} now
 * @return {null|object}
 */

var getDateFromCache = function getDateFromCache(_ref) {
  var key = _ref.key,
      now = _ref.now;

  try {
    var expiredAt = localStorage.getItem("vue-mixin-store-".concat(key, "-expired-at"));
    var cacheStr = localStorage.getItem("vue-mixin-store-".concat(key));

    if (!expiredAt || !cacheStr || now - expiredAt > 0) {
      localStorage.removeItem("vue-mixin-store-".concat(key));
      localStorage.removeItem("vue-mixin-store-".concat(key, "-expired-at"));
      return null;
    }

    return JSON.parse(cacheStr);
  } catch (e) {
    return null;
  }
};
/**
 * 设置 localStorage
 * @param {string} key
 * @param {object} value
 * @param {int} expiredAt
 */

var setDataToCache = function setDataToCache(_ref2) {
  var key = _ref2.key,
      value = _ref2.value,
      expiredAt = _ref2.expiredAt;

  try {
    localStorage.setItem("vue-mixin-store-".concat(key), JSON.stringify(value));
    localStorage.setItem("vue-mixin-store-".concat(key, "-expired-at"), expiredAt);
  } catch (e) {// do nothing
  }
};
/**
 * 判断参数是否为数组
 * @param {any} data
 * @return {boolean}
 */

var isArray = function isArray(data) {
  return Object.prototype.toString.call(data) === '[object Array]';
};
/**
 * 设置一个响应式的数据到对象上
 * @param {Vue.set} setter
 * @param {object} field
 * @param {string} key
 * @param {any} value
 * @param {string} type
 * @param {boolean} insertBefore
 */

var setReactivityField = function setReactivityField(setter, field, key, value, type, insertBefore) {
  if (field[key]) {
    if (isArray(value)) {
      field[key] = insertBefore ? value.concat(field[key]) : field[key].concat(value);
    } else {
      if (type === 'jump' || key !== 'result') {
        setter(field, key, value);
      } else {
        var oldVal = field[key];

        var newVal = _objectSpread({}, oldVal);

        Object.keys(value).forEach(function (subKey) {
          newVal[subKey] = oldVal[subKey] ? insertBefore ? value[subKey].concat(oldVal[subKey]) : oldVal[subKey].concat(value[subKey]) : value[subKey];
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

var updateReactivityField = function updateReactivityField(setter, fieldArray, value, changing) {
  if (isArray(value)) {
    value.forEach(function (col) {
      var stringifyId = getObjectDeepValue(col, changing).toString();
      fieldArray.forEach(function (item, index) {
        if (getObjectDeepValue(item, changing).toString() === stringifyId) {
          Object.keys(col).forEach(function (key) {
            setter(fieldArray[index], key, col[key]);
          });
        }
      });
    });
  } else {
    Object.keys(value).forEach(function (uniqueId) {
      var stringifyId = uniqueId.toString();
      fieldArray.forEach(function (item, index) {
        if (getObjectDeepValue(item, changing).toString() === stringifyId) {
          var col = value[uniqueId];
          Object.keys(col).forEach(function (key) {
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

var computeMatchedItemIndex = function computeMatchedItemIndex(itemId, fieldArr, changingKey) {
  var i;

  for (i = 0; i < fieldArr.length; i++) {
    if (getObjectDeepValue(fieldArr[i], changingKey).toString() === itemId.toString()) {
      break;
    }
  }

  return i;
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
 * 事件绑定
 * @param elem
 * @param {string} type
 * @param {function} listener
 */

var on = function on(elem, type, listener) {
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

var off = function off(elem, type, listener) {
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

var checkInView = function checkInView(dom) {
  var preload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (!dom) {
    return false;
  }

  var rect = dom.getBoundingClientRect();

  if (!rect.left && !rect.right && !rect.top && !rect.bottom) {
    return false;
  }

  return rect.top < window.innerHeight + preload && rect.bottom + preload > 0 && rect.left < window.innerWidth + preload && rect.right + preload > 0;
};
/**
 * 拼接请求的参数
 * @param {object} field
 * @param {object} query
 * @param {string} type
 * @return {object}
 */

var generateRequestParams = function generateRequestParams(field, query, type) {
  var result = {};

  if (field.fetched) {
    var changing = query.changing || 'id';

    if (type === 'seenIds') {
      result.seen_ids = field.result.map(function (_) {
        return getObjectDeepValue(_, changing);
      }).join(',');
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

  return Object.assign(query, result);
};
var getScrollParentDom = function getScrollParentDom(dom) {
  var el = dom;

  if (!el) {
    return null;
  }

  while (el && el.tagName !== 'HTML' && el.tagName !== 'BOYD' && el.nodeType === 1) {
    var overflowY = window.getComputedStyle(el).overflowY;

    if (overflowY === 'scroll' || overflowY === 'auto') {
      if (el.tagName === 'HTML' || el.tagName === 'BODY') {
        return document;
      }

      return el;
    }

    el = el.parentNode;
  }

  return document;
};
var observerInstance = typeof window === 'undefined' ? null : window.IntersectionObserver && new window.IntersectionObserver(function (entries) {
  entries.forEach(function (_ref3) {
    var intersectionRatio = _ref3.intersectionRatio,
        target = _ref3.target;

    if (intersectionRatio <= 0 || !target) {
      return;
    }

    target.__flow_handler__ && target.__flow_handler__();
  });
});
// CONCATENATED MODULE: ./src/index.js
function src_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function src_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { src_ownKeys(Object(source), true).forEach(function (key) { src_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { src_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function src_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/* harmony default export */ var src_0 = (src_objectSpread({}, utils_namespaceObject));
// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/entry-lib.js


/* harmony default export */ var entry_lib = __webpack_exports__["default"] = (src_0);



/***/ })

/******/ })["default"];