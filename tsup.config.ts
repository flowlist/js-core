import { defineConfig } from 'tsup'

export default defineConfig([
  // ---- 全量入口（iife / 向后兼容） ----
  {
    entry: { index: 'src/index.ts' },
    format: ['iife'],
    target: 'es2020',
    dts: false,
    sourcemap: true,
    clean: true,
    minify: false,
    globalName: 'FlowList',
    platform: 'browser',
    treeshake: true,
    outDir: 'dist'
  },
  // ---- 按需加载：每个子模块独立输出 esm + cjs ----
  {
    entry: {
      index: 'src/index.ts',
      core: 'src/core.ts',
      constants: 'src/constants.ts',
      types: 'src/types.ts',
      'mutations/index': 'src/mutations/index.ts',
      'mutations/core': 'src/mutations/core.ts',
      'mutations/extended': 'src/mutations/extended.ts'
    },
    format: ['esm', 'cjs'],
    target: 'es2020',
    dts: true,
    sourcemap: true,
    clean: false, // iife 已 clean，这里不重复清理
    minify: false,
    platform: 'browser',
    treeshake: true,
    outDir: 'dist',
    external: []
  }
])
