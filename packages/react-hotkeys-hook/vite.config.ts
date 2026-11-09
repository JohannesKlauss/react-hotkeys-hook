/// <reference types="vite/client" />
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { dts } from 'rolldown-plugin-dts'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react({ exclude: /\.d\.[cm]?ts$/ }),
    ...(command === 'build' ? dts({ tsconfig: 'tsconfig.build.json' }) : []),
  ],
  oxc: {
    exclude: [/\.js$/, /\.d\.[cm]?ts$/],
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/lib/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        entryFileNames: '[name].js',
        globals: {
          react: 'React',
          'react-dom': 'React-dom',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'vitest.setup.ts',
    watch: false,
  },
}))
