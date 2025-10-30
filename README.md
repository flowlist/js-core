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

```ts
import flow from '@flowlist/js-core'

// Example with a hypothetical state management system (e.g., React useState, Zustand, etc.)
const { getter, setter, api, cache } = yourAppStateManager

// 1. Initialize the data container
await flow.initState({
  getter,
  setter,
  func: 'fetchPosts',
  type: 'page', // or 'sinceId', 'seenIds', 'auto', etc.
  query: { userId: 123 }
})

// 2. Load initial data
await flow.initData({
  getter,
  setter,
  cache,
  func: 'fetchPosts',
  type: 'page',
  query: { userId: 123 },
  api,
  uniqueKey: 'id',
  cacheTimeout: 300 // 5 minutes
})

// 3. Load more data (e.g., on scroll)
await flow.loadMore({
  getter,
  setter,
  cache,
  func: 'fetchPosts',
  type: 'page',
  query: { userId: 123 },
  api,
  uniqueKey: 'id',
  errorRetry: false
})

// 4. Update list data locally
await flow.updateState({
  getter,
  setter,
  cache,
  func: 'fetchPosts',
  type: 'page',
  query: { userId: 123 },
  method: 'push', // or 'delete', 'update', 'merge', etc.
  value: newPost,
  id: newPost.id,
  uniqueKey: 'id',
  changeKey: 'result',
  cacheTimeout: 300
})
```
