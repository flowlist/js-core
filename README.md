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
> 如 [Vuex.getter](https://github.com/flowlist/js-core/blob/master/tests/unit/env.js#L3)

- setter：set state
> 如：[React.setState](https://github.com/flowlist/js-core/blob/master/tests/unit/env.js#L8)

- cache：cache instance
> [包含 get<Promise>，set<Promise>，del 三个方法](https://github.com/flowlist/js-core/blob/master/tests/unit/env.js#L20)

- api：named api list
> [把需要调用的所有 API export 出来](https://github.com/flowlist/js-core/blob/master/tests/unit/api.js)

### Methods

- `initState`

> 初始化数据容器

| 参数 | 类型 | 介绍 |
| --- | --- | --- |
| getter | Function | 设置 state 的函数 |
| setter | Function | 读取 state 的函数 |
| func | String | API层的函数名 |
| type | String\<ListType\> | 列表的类型 |
| query | Object | 需要额外透传给 API 层的数据 |

- `initData`

> 加载首屏数据

| 参数 | 类型 | 介绍 |
| --- | --- | --- |
| getter | Function | 设置 state 的函数 |
| setter | Function | 读取 state 的函数 |
| cache | Object | 用于读写缓存的对象 |
| func | String | API层的函数名 |
| type | String\<ListType\> | 列表的类型 |
| query | Object | 需要额外透传给 API 层的数据 |
| api | Array\<API\> | 整个 API 层 |
| cacheTimeout | Integer | 缓存持久化的时间（秒） |
| uniqueKey | String | 列表里每个元素独一无二的 key |
| callback | Function | 请求成功之后的回调函数 |

- `loadMore`

> 加载分页数据

| 参数 | 类型 | 介绍 |
| --- | --- | --- |
| getter | Function | 设置 state 的函数 |
| setter | Function | 读取 state 的函数 |
| cache | Object | 用于读写缓存的对象 |
| func | String | API层的函数名 |
| type | String\<ListType\> | 列表的类型 |
| query | Object | 需要额外透传给 API 层的数据 |
| api | Array\<API\> | 整个 API 层 |
| cacheTimeout | Integer | 缓存持久化的时间（秒） |
| uniqueKey | String | 列表里每个元素独一无二的 key |
| errorRetry | Boolean | 是否是重试 |
| callback | Function | 请求成功之后的回调函数 |

- `updateState`

> 更新数据容器

```javascript
flow.updateState({ getter, setter, cache, type, func, query, method, value, id, uniqueKey, changeKey, cacheTimeout })
```
| 参数 | 类型 | 介绍 |
| --- | --- | --- |
| getter | Function | 设置 state 的函数 |
| setter | Function | 读取 state 的函数 |
| cache | Object | 用于读写缓存的对象 |
| func | String | API层的函数名 |
| type | String\<ListType\> | 列表的类型 |
| query | Object | 需要额外透传给 API 层的数据 |
| method | String | 需要调用的函数名 |
| value | Any | 传值 |
| id | String / Number | 用来索引的独一无二的 keyValue |
| uniqueKey | String | 列表里每个元素独一无二的 keyName |
| changeKey | String | 你想要修改的`field`是哪个字段，默认是`result` |
| cacheTimeout | Integer | 缓存持久化的时间（秒） |
