import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  target: 'es2020',
  dts: true, // 自动生成 .d.ts
  sourcemap: true,
  clean: true,
  minify: false, // 库通常不压缩，由使用者决定
  globalName: 'FlowList', // 用于 iife 全局变量名，可自定义
  platform: 'browser', // 关键：确保不引入 Node API
  treeshake: true,
  outDir: 'dist',
  // 确保所有依赖都是 external（不打包进你的库）
  external: [
    // 你的代码中没有第三方依赖，所以可为空
    // 如果有，比如 'axios'，则写在这里
  ]
})
