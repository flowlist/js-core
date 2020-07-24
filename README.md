# @flowlist/js-core

<p align="center">
    <a target="_blank" href="https://travis-ci.org/github/flowlist/js-core">
        <img alt="Build" src="https://travis-ci.org/flowlist/js-core.svg?branch=master" />
    </a>
    <a target="_blank" href="https://codecov.io/gh/flowlist/js-core">
        <img alt="Coverage" src="https://codecov.io/gh/flowlist/js-core/branch/master/graph/badge.svg" />
    </a>
    <a target="_blank" href="https://www.npmjs.com/package/@flowlist/js-core">
        <img alt="Version" src="https://badge.fury.io/js/%40flowlist%2Fjs-core.svg" />
    </a>
    <a target="_blank" href="https://github.com/flowlist/js-core/blob/master/LICENSE">
        <img alt="License" src="https://gitlicense.com/badge/flowlist/js-core"/>
    </a>
</p>

## 信息流业务通用容器的基础实现

### Download

``` bash
yarn add @flowlist/js-core
```

### Import
```javascript
import flow from '@flowlist/js-core'
```

### Inject

- getter：get state
> 如 Vuex.getter

- setter：set state
> 如：React.setState

- cache：cache instance
> 包含 get<Promise>，set<Promise>，del 三个方法

- api：named api list
> 把需要调用的所有 API export 出来

```javascript
const globalData = {}

export const getter = (fieldName) => {
  const result = globalData[fieldName]
  return result ? { ...result } : null
}

/**
* 0 的时候是 reset
* 1 的时候是 merge
*/
export const setter = ({ key, type, value, callback }) => {
  if (type === 0) {
    globalData[key] = value
  } else if (type === 1) {
    globalData[key] = {
      ...(globalData[key] || {}),
      ...value
    }
  }
  callback && callback()
}

export const cache = {
  /**
  * timeout 是缓存超时的时长（秒）
  */
  set({ key, value, timeout }) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(`${key}`, JSON.stringify(value))
        localStorage.setItem(`${key}-expired`, Date.now() + timeout * 1000)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  },

  get({ key }) {
    return new Promise((resolve, reject) => {
      try {
        const expiredAt = localStorage.getItem(`${key}-expired`)
        const cacheStr = localStorage.getItem(`${key}`)
        if (!expiredAt || !cacheStr || Date.now() - expiredAt > 0) {
          this.del(key)
          reject(null)
          return
        }
        resolve(JSON.parse(cacheStr))
      } catch (e) {
        this.del(key)
        reject(e)
      }
    })
  },

  del({ key }) {
    localStorage.removeItem(`${key}`)
    localStorage.removeItem(`${key}-expired`)
  }
}
```

### Methods

#### - `initState`

> 初始化数据容器

```javascript
flow.initState({ getter, setter, func, type, query, opts = {} })
```

#### - `initData`

> 加载首屏数据

```javascript
flow.initData({ getter, setter, cache, func, type, query, api, cacheTimeout, uniqueKey, callback })
```

#### - `loadMore`

> 加载分页数据

```javascript
flow.loadMore({ getter, setter, cache, func, type, query, api, cacheTimeout, uniqueKey, errorRetry, callback })
```

#### - `updateState`

> 更新数据容器

```javascript
flow.updateState({ getter, setter, cache, type, func, query, method, value, id, uniqueKey, changeKey, cacheTimeout })
```
