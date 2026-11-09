import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {
    printWidth: 120,
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    semi: false,
  },
  lint: {
    plugins: ['typescript', 'unicorn', 'oxc', 'react'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'no-param-reassign': 'error',
      'default-param-last': 'error',
      'one-var': ['error', 'never'],
      'no-else-return': 'error',
      'react/self-closing-comp': 'error',
      'typescript/prefer-as-const': 'error',
      'typescript/no-inferrable-types': 'error',
      'unicorn/prefer-number-properties': 'error',
    },
  },
})
