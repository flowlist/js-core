# @flowlist/js-core

<p>
    <img src="https://travis-ci.org/flowlist/js-core.svg?branch=master" />
    <img src="https://codecov.io/gh/flowlist/js-core/branch/master/graph/badge.svg" />
    <img src="https://badge.fury.io/js/%40flowlist%2Fjs-core.svg" />
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

> 初始化数据列

```javascript
initState({ getter, setter, func, type, query, opts = {} })
```
