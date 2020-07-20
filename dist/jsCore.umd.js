/*!
 * @flowlist/js-core v1.0.0
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

/***/ "62e4":
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

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

/***/ "98b8":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var runtime = function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.

  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.

    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }

  exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.

  var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.


  var IteratorPrototype = {};

  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      prototype[method] = function (arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;

      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }

    genFun.prototype = Object.create(Gp);
    return genFun;
  }; // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.


  exports.awrap = function (arg) {
    return {
      __await: arg
    };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;

        if (value && _typeof(value) === "object" && hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function (error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).


    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };

  exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.

  exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        } // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;

        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);

          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);

        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted; // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.

          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  } // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.


  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

      context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }
    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    } // The delegate iterator is finished, so forget it and continue with
    // the outer generator.


    context.delegate = null;
    return ContinueSentinel;
  } // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.


  defineIteratorMethods(Gp);
  Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{
      tryLoc: "root"
    }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    keys.reverse(); // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.

    return function next() {
      while (keys.length) {
        var key = keys.pop();

        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      } // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.


      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];

      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;
          return next;
        };

        return next.next = next;
      }
    } // Return an iterator with no values.


    return {
      next: doneResult
    };
  }

  exports.values = values;

  function doneResult() {
    return {
      value: undefined,
      done: true
    };
  }

  Context.prototype = {
    constructor: Context,
    reset: function reset(skipTempReset) {
      this.prev = 0;
      this.next = 0; // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.

      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined;
      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },
    stop: function stop() {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;

      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },
    dispatchException: function dispatchException(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;

      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },
    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },
    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      } // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.


      throw new Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  }; // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.

  return exports;
}( // If this script is executing as a CommonJS module, use module.exports
// as the regeneratorRuntime namespace. Otherwise create a new empty
// object. Either way, the resulting object will be used to initialize
// the regeneratorRuntime variable at the top of this file.
( false ? undefined : _typeof(module)) === "object" ? module.exports : {});

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("62e4")(module)))

/***/ }),

/***/ "a34a":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("98b8");

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

// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__("a34a");
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);

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


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
  return new Promise(function (resolve, reject) {
    var fieldName = generateFieldName({
      func: func,
      type: type,
      query: query
    });
    var fieldData = getter(fieldName);

    if (fieldData) {
      reject();
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
    var data;
    var fromLocal = false;

    var getData = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regenerator_default.a.mark(function _callee2() {
        var setData;
        return regenerator_default.a.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;

                if (!cacheTimeout) {
                  _context2.next = 12;
                  break;
                }

                data = cache.get({
                  key: fieldName
                });

                if (!data) {
                  _context2.next = 7;
                  break;
                }

                fromLocal = true;
                _context2.next = 10;
                break;

              case 7:
                _context2.next = 9;
                return api[func](params);

              case 9:
                data = _context2.sent;

              case 10:
                _context2.next = 15;
                break;

              case 12:
                _context2.next = 14;
                return api[func](params);

              case 14:
                data = _context2.sent;

              case 15:
                setData = /*#__PURE__*/function () {
                  var _ref4 = _asyncToGenerator( /*#__PURE__*/regenerator_default.a.mark(function _callee() {
                    return regenerator_default.a.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return setters_SET_DATA({
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
                            });

                          case 2:
                            if (callback) {
                              callback({
                                params: params,
                                data: data,
                                refresh: doRefresh
                              });
                            }

                            resolve();

                          case 4:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function setData() {
                    return _ref4.apply(this, arguments);
                  };
                }(); // 拿到数据后再重置 field


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

                _context2.next = 23;
                break;

              case 19:
                _context2.prev = 19;
                _context2.t0 = _context2["catch"](0);
                setters_SET_ERROR({
                  setter: setter,
                  fieldName: fieldName,
                  error: _context2.t0
                });
                reject(_context2.t0);

              case 23:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[0, 19]]);
      }));

      return function getData() {
        return _ref3.apply(this, arguments);
      };
    }(); // 需要预初始化 field


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
var actions_loadMore = function loadMore(_ref5) {
  var getter = _ref5.getter,
      setter = _ref5.setter,
      cache = _ref5.cache,
      query = _ref5.query,
      type = _ref5.type,
      func = _ref5.func,
      api = _ref5.api,
      cacheTimeout = _ref5.cacheTimeout,
      uniqueKey = _ref5.uniqueKey,
      errorRetry = _ref5.errorRetry,
      callback = _ref5.callback;
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

    var getData = /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regenerator_default.a.mark(function _callee3() {
        var data;
        return regenerator_default.a.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return api[func](params);

              case 3:
                data = _context3.sent;
                _context3.next = 6;
                return setters_SET_DATA({
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
                });

              case 6:
                if (callback) {
                  callback({
                    params: params,
                    data: data,
                    refresh: false
                  });
                }

                resolve();
                _context3.next = 14;
                break;

              case 10:
                _context3.prev = 10;
                _context3.t0 = _context3["catch"](0);
                setters_SET_ERROR({
                  setter: setter,
                  fieldName: fieldName,
                  error: _context3.t0
                });
                reject(_context3.t0);

              case 14:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[0, 10]]);
      }));

      return function getData() {
        return _ref6.apply(this, arguments);
      };
    }();

    setter({
      key: fieldName,
      type: src_enum.SETTER_TYPE.MERGE,
      value: loadingState,
      callback: getData
    });
  });
};
var actions_updateState = function updateState(_ref7) {
  var getter = _ref7.getter,
      setter = _ref7.setter,
      cache = _ref7.cache,
      type = _ref7.type,
      func = _ref7.func,
      query = _ref7.query,
      method = _ref7.method,
      value = _ref7.value,
      _ref7$id = _ref7.id,
      id = _ref7$id === void 0 ? '' : _ref7$id,
      _ref7$uniqueKey = _ref7.uniqueKey,
      uniqueKey = _ref7$uniqueKey === void 0 ? src_enum.FETCH_PARAMS_DEFAULT.CHANGE_KEY_NAME : _ref7$uniqueKey,
      _ref7$changeKey = _ref7.changeKey,
      changeKey = _ref7$changeKey === void 0 ? src_enum.FIELD_DATA.RESULT_KEY : _ref7$changeKey,
      cacheTimeout = _ref7.cacheTimeout;
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