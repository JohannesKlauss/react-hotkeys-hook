import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vite-plus/test'

const require = createRequire(import.meta.url)
const config = require('../../docusaurus.config.js')
const classic = config.presets.find(([name]: [string]) => name === '@docusaurus/preset-classic')[1]

const installationPages = [
  '../../docs/intro.mdx',
  '../../docs/documentation/installation.mdx',
  '../../versioned_docs/version-4.x/intro.mdx',
  '../../versioned_docs/version-4.x/documentation/installation.mdx',
  '../../versioned_docs/version-3.x/intro.mdx',
  '../../versioned_docs/version-3.x/documentation/installation.mdx',
]

test('uses the shared SVG mark with a multi-size favicon fallback', () => {
  const svgIcon = config.headTags.find(
    (tag: { attributes: { rel?: string; type?: string } }) =>
      tag.attributes.rel === 'icon' && tag.attributes.type === 'image/svg+xml',
  )
  expect(config.themeConfig.navbar.logo.src).toBe('img/hotkey.svg')
  expect(svgIcon?.attributes.href).toBe('/img/hotkey.svg')
  expect(config.favicon).toBe('img/favicon.ico')

  const fallback = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../static', config.favicon))
  expect(fallback.readUInt16LE(4)).toBeGreaterThan(1)
})

test('shows the current major version without a minor version', () => {
  expect(classic.docs.versions.current.label).toBe('5')
})

test('disables the blog and removes it from navigation', () => {
  expect(classic.blog).toBe(false)
  expect(config.themeConfig.navbar.items.some((item: { to?: string }) => item.to?.replace(/^\//, '') === 'blog')).toBe(
    false,
  )
})

test.each(installationPages)('%s presents all package managers in the preferred order', (page) => {
  const content = readFileSync(new URL(page, import.meta.url), 'utf8')
  const installationTabs = content.split('</Tabs>')[0]
  const managerValues = Array.from(
    installationTabs.matchAll(/\{ label: '[^']+', value: '([^']+)' \}/g),
    (match) => match[1],
  )
  const tabItems = Array.from(installationTabs.matchAll(/<TabItem value="([^"]+)">/g), (match) => match[1])

  expect(installationTabs).toContain('defaultValue="pnpm"')
  expect(managerValues).toEqual(['pnpm', 'bun', 'npm', 'yarn'])
  expect(tabItems).toEqual(managerValues)
})

test.each([
  '../../versioned_docs/version-4.x/documentation/installation.mdx',
  '../../versioned_docs/version-3.x/documentation/installation.mdx',
])('%s preserves the previous package-manager heading link', (page) => {
  const content = readFileSync(new URL(page, import.meta.url), 'utf8')

  expect(content).toContain('## Package Managers {#yarn--npm}')
})

test.each([
  ['../../versioned_docs/version-4.x/intro.mdx', '4'],
  ['../../versioned_docs/version-4.x/documentation/installation.mdx', '4'],
  ['../../versioned_docs/version-3.x/intro.mdx', '3'],
  ['../../versioned_docs/version-3.x/documentation/installation.mdx', '3'],
])('%s installs the documented major version', (page, version) => {
  const installationTabs = readFileSync(new URL(page, import.meta.url), 'utf8').split('</Tabs>')[0]

  expect(installationTabs).toContain(`pnpm add react-hotkeys-hook@${version}`)
  expect(installationTabs).toContain(`bun add react-hotkeys-hook@${version}`)
  expect(installationTabs).toContain(`npm i react-hotkeys-hook@${version} --save`)
  expect(installationTabs).toContain(`yarn add react-hotkeys-hook@${version}`)
})
