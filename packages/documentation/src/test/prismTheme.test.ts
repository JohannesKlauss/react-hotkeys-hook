import { createRequire } from 'node:module'
import { expect, test } from 'vite-plus/test'

const require = createRequire(import.meta.url)
const config = require('../../docusaurus.config.js')

test.each([
  ['theme', '#f9f8f5', '#25232a'],
  ['darkTheme', '#15171c', '#f3efe9'],
])('uses the landing palette for the %s code theme', (name, background, foreground) => {
  const theme = config.themeConfig.prism[name]

  expect(theme.plain.backgroundColor).toBe(background)
  expect(theme.plain.color).toBe(foreground)
})
