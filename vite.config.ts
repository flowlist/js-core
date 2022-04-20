import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'index.ts',
      name: 'JsCore'
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ]
})
