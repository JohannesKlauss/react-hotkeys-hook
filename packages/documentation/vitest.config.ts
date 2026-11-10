import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  resolve: {
    alias: {
      '@theme/ReactLiveScope': fileURLToPath(new URL('./src/theme/ReactLiveScope/index.ts', import.meta.url)),
    },
  },
})
