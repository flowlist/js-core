# @flowlist/js-core

<p style="text-align: center">
    <a href="https://travis-ci.org/github/flowlist/js-core">
        <img src="https://travis-ci.org/flowlist/js-core.svg?branch=master" />
    </a>
    <a href="https://codecov.io/gh/flowlist/js-core">
        <img src="https://codecov.io/gh/flowlist/js-core/branch/master/graph/badge.svg" />
    </a>
    <a href="https://www.npmjs.com/package/@flowlist/js-core">
        <img src="https://badge.fury.io/js/%40flowlist%2Fjs-core.svg" />
    </a>
    <img src="https://gitlicense.com/badge/flowlist/js-core"/>
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
