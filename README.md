# @flowlist/js-core

[![npm version](https://img.shields.io/npm/v/@flowlist/js-core.svg)](https://www.npmjs.com/package/@flowlist/js-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A lightweight, type-safe JavaScript core library for managing data flow in list-based UIs. It provides a unified interface for initializing, loading, paginating, and updating list data with built-in state management and caching support.

## ✨ Features

- 🧠 **Declarative Data Flow**: Define how your list data is fetched and updated.
- 📦 **Built-in State Management**: Handles loading, error, pagination, and cache states automatically.
- 🔁 **Multiple Fetch Strategies**: Supports pagination, infinite scroll, since-id, seen-ids, and more.
- 🔄 **Flexible Updates**: Add, remove, update, or merge list items with ease.
- 💾 **Cache Ready**: Designed to work seamlessly with external cache layers.
- 🧪 **TypeScript First**: Full TypeScript support with comprehensive type definitions.
- 🧩 **Framework Agnostic**: Works with React, Vue, Svelte, or vanilla JS.

## 🚀 Installation

```bash
# Using npm
npm install @flowlist/js-core

# Using yarn
yarn add @flowlist/js-core
```

## 📦 Usage

### updateState 函数的正确使用方法

#### 问题说明

之前的版本中，`updateState` 函数的类型定义不够灵活，导致在传递自定义数据类型时出现类型错误。

#### 解决方案

现在 `updateState` 函数支持泛型参数，可以正确处理各种数据类型。

#### 基本用法

##### 1. 不使用泛型（默认行为）

```typescript
import { updateState, ENUM } from '@flowlist/js-core'

// 使用默认的 KeyMap 类型
updateState({
  getter,
  setter,
  func: 'getMessages',
  type: ENUM.FETCH_TYPE.AUTO,
  method: ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE,
  id: msg.clientMsgId,
  uniqueKey: 'clientMsgId',
  value: {
    status: 'failed'
  }
})
```

##### 2. 使用泛型指定自定义类型

```typescript
import { updateState, ENUM } from '@flowlist/js-core'

interface MessageDTO {
  clientMsgId: string
  content: string
  status: 'pending' | 'success' | 'failed'
  timestamp: number
}

// 使用泛型指定类型
updateState<Partial<MessageDTO>>({
  getter,
  setter,
  func: 'getMessages',
  type: ENUM.FETCH_TYPE.AUTO,
  method: ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE,
  id: msg.clientMsgId,
  uniqueKey: 'clientMsgId',
  value: {
    status: 'failed' // TypeScript 会正确推断这个类型
  }
})
```

#### 常见使用场景

##### 场景 1: 合并单个项目的部分属性

```typescript
// 更新消息状态
updateState<Partial<MessageDTO>>({
  getter,
  setter,
  func: 'getMessages',
  type: ENUM.FETCH_TYPE.AUTO,
  method: ENUM.CHANGE_TYPE.RESULT_ITEM_MERGE,
  id: messageId,
  uniqueKey: 'clientMsgId',
  value: {
    status: 'success',
    timestamp: Date.now()
  }
})
```

##### 场景 2: 添加新项目到列表

```typescript
// 在列表末尾添加新消息
updateState<MessageDTO>({
  getter,
  setter,
  func: 'getMessages',
  type: ENUM.FETCH_TYPE.AUTO,
  method: ENUM.CHANGE_TYPE.RESULT_ADD_AFTER,
  value: {
    clientMsgId: 'msg-123',
    content: 'Hello World',
    status: 'pending',
    timestamp: Date.now()
  }
})
```

##### 场景 3: 根据 ID 删除项目

```typescript
// 删除单个消息
updateState({
  getter,
  setter,
  func: 'getMessages',
  type: ENUM.FETCH_TYPE.AUTO,
  method: ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID,
  id: messageId,
  uniqueKey: 'clientMsgId',
  value: {} // 删除操作不需要 value
})

// 批量删除多个消息
updateState({
  getter,
  setter,
  func: 'getMessages',
  type: ENUM.FETCH_TYPE.AUTO,
  method: ENUM.CHANGE_TYPE.RESULT_REMOVE_BY_ID,
  id: [messageId1, messageId2, messageId3],
  uniqueKey: 'clientMsgId',
  value: {}
})
```

##### 场景 4: 更新深层嵌套的属性

```typescript
interface ComplexMessage {
  id: string
  metadata: {
    sender: {
      name: string
      avatar: string
    }
  }
}

updateState({
  getter,
  setter,
  func: 'getMessages',
  type: ENUM.FETCH_TYPE.AUTO,
  method: ENUM.CHANGE_TYPE.RESULT_UPDATE_KV,
  id: messageId,
  uniqueKey: 'id',
  changeKey: 'metadata.sender.name',
  value: 'New Name'
})
```

##### 场景 5: 批量更新列表项

```typescript
// 使用 RESULT_LIST_MERGE 批量更新多个项目
updateState({
  getter,
  setter,
  func: 'getMessages',
  type: ENUM.FETCH_TYPE.AUTO,
  method: ENUM.CHANGE_TYPE.RESULT_LIST_MERGE,
  uniqueKey: 'clientMsgId',
  value: [
    { clientMsgId: 'msg-1', status: 'success' },
    { clientMsgId: 'msg-2', status: 'failed' },
    { clientMsgId: 'msg-3', status: 'success' }
  ]
})
```

#### 所有可用的变更类型

```typescript
ENUM.CHANGE_TYPE = {
  SEARCH_FIELD: 'search', // 搜索并返回匹配的项目
  RESET_FIELD: 'reset', // 重置整个字段
  RESULT_UPDATE_KV: 'update', // 更新指定项的深层属性
  RESULT_ADD_AFTER: 'push', // 在列表末尾添加项目
  RESULT_ADD_BEFORE: 'unshift', // 在列表开头添加项目
  RESULT_REMOVE_BY_ID: 'delete', // 根据 ID 删除项目
  RESULT_INSERT_TO_BEFORE: 'insert-before', // 在指定项之前插入
  RESULT_INSERT_TO_AFTER: 'insert-after', // 在指定项之后插入
  RESULT_LIST_MERGE: 'patch', // 批量合并更新多个项目
  RESULT_ITEM_MERGE: 'merge' // 合并单个项目的属性
}
```

#### 最佳实践

1. **使用 TypeScript 接口定义数据结构**
   - 为你的数据模型创建明确的接口定义
   - 使用泛型参数获得更好的类型推断

2. **选择合适的 uniqueKey**
   - 确保 uniqueKey 在列表中是唯一的
   - 支持嵌套路径，如 `'user.id'`

3. **根据操作类型传递正确的参数**
   - 删除操作需要 `id` 参数
   - 更新操作需要 `id` 和 `value` 参数
   - 添加操作只需要 `value` 参数

4. **处理异步操作**

   ```typescript
   try {
     await updateState({
       // ... 参数
     })
     console.log('更新成功')
   } catch (error) {
     console.error('更新失败:', error)
   }
   ```

5. **性能优化**
   - 批量操作时使用 `RESULT_LIST_MERGE` 而不是多次调用 `RESULT_ITEM_MERGE`
   - 避免在循环中频繁调用 updateState

#### 类型安全提示

项目现在支持完整的 TypeScript 类型推断：

- ✅ 所有函数参数都有明确的类型定义
- ✅ 支持泛型以适应不同的数据结构
- ✅ 自动类型检查和智能提示
- ✅ 编译时类型错误检测

#### 测试覆盖率

当前测试覆盖率：

- 语句覆盖率: 99.33%
- 分支覆盖率: 95.1%
- 函数覆盖率: 100%
- 行覆盖率: 99.75%

所有 159 个测试用例全部通过 ✓
