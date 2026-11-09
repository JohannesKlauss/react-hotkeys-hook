/// <reference types="vite-plus/client" />
/// <reference types="vite-plus/test" />
import { defineConfig, lazyPlugins } from 'vite-plus'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const typescriptDir = dirname(require.resolve('typescript/package.json'))
const { default: getTypeScriptExecutable } = await import(pathToFileURL(join(typescriptDir, 'lib/getExePath.js')).href)

// https://vite.dev/config/
export default defineConfig({
  plugins: lazyPlugins(() => [react({ exclude: /\.d\.[cm]?ts$/ })]),
  oxc: {
    exclude: [/\.js$/, /\.d\.[cm]?ts$/],
  },
  pack: {
    entry: ['src/lib/index.ts'],
    format: ['esm'],
    platform: 'browser',
    tsconfig: 'tsconfig.build.json',
    // tsdown only auto-detects TypeScript 7.0; this package uses 7.1.
    dts: { generator: 'tsgo', tsgo: { path: getTypeScriptExecutable() } },
    deps: { neverBundle: ['react', 'react-dom', 'react/jsx-runtime'] },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'vitest.setup.ts',
    watch: false,
  },
})
