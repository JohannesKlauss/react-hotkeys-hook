import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, afterEach, beforeAll, expect, test } from 'vite-plus/test'

const require = createRequire(import.meta.url)
const fromPreset = createRequire(require.resolve('@docusaurus/preset-classic/package.json'))
const fromTheme = createRequire(fromPreset.resolve('@docusaurus/theme-classic/package.json'))
const fromSearch = createRequire(fromPreset.resolve('@docusaurus/theme-search-algolia'))
const fromDocSearch = createRequire(fromSearch.resolve('@docsearch/react'))
const customCss = resolve(dirname(fileURLToPath(import.meta.url)), '../css/custom.css')
const stylesheets = [
  fromTheme.resolve('infima/dist/css/default/default.css'),
  customCss,
  fromPreset.resolve('@docusaurus/theme-classic/lib/theme/BackToTopButton/styles.module.css'),
  fromDocSearch.resolve('@docsearch/css'),
]
const styleElements: HTMLStyleElement[] = []
const initialTheme = document.documentElement.getAttribute('data-theme')

function borderRadii(element: Element): number[] {
  return getComputedStyle(element)
    .borderRadius.split(/[\s/]+/)
    .map((value) => {
      const variable = /^var\((--[\w-]+)\)$/.exec(value)?.[1]
      const resolved = variable ? getComputedStyle(document.documentElement).getPropertyValue(variable) : value
      return Number.parseFloat(resolved)
    })
}

beforeAll(() => {
  document.documentElement.setAttribute('data-theme', 'dark')
  for (const path of stylesheets) {
    const style = document.createElement('style')
    style.textContent = readFileSync(path, 'utf8')
    document.head.append(style)
    styleElements.push(style)
  }
})

afterEach(() => document.body.replaceChildren())
afterAll(() => {
  styleElements.forEach((style) => style.remove())
  if (initialTheme === null) document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', initialTheme)
})

test.each(['--ifm-global-radius', '--ifm-breadcrumb-border-radius'])('%s uses the square-corner theme', (token) => {
  expect(Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token))).toBe(0)
})

test.each([
  ['code block', '<div class="theme-code-block"><pre><code>shortcut</code></pre></div>', '.theme-code-block'],
  ['code block content', '<div class="theme-code-block"><pre><code>shortcut</code></pre></div>', 'pre'],
  ['inline code', '<code>shortcut</code>', 'code'],
  ['keyboard key', '<kbd>K</kbd>', 'kbd'],
  ['admonition', '<div class="alert">Note</div>', '.alert'],
  ['blockquote', '<blockquote>Note</blockquote>', 'blockquote'],
  ['button', '<button class="button">Button</button>', '.button'],
  ['sidebar link', '<a class="menu__link">Link</a>', '.menu__link'],
  ['sidebar category', '<div class="menu__list-item-collapsible">Category</div>', '.menu__list-item-collapsible'],
  ['sidebar caret', '<button class="menu__caret">Expand</button>', '.menu__caret'],
  ['dropdown link', '<a class="dropdown__link">Link</a>', '.dropdown__link'],
  ['navbar search', '<input class="navbar__search-input" />', '.navbar__search-input'],
  ['pill', '<div class="pills__item">Item</div>', '.pills__item'],
  [
    'search footer key',
    '<div class="DocSearch-Container"><kbd class="DocSearch-Commands-Key">Esc</kbd></div>',
    '.DocSearch-Commands-Key',
  ],
  [
    'search result action',
    '<div class="DocSearch-Container"><button class="DocSearch-Hit-action-button">Save</button></div>',
    '.DocSearch-Hit-action-button',
  ],
  [
    'search suggestion',
    '<div class="DocSearch-Container"><button class="DocSearch-Prefill">Search</button></div>',
    '.DocSearch-Prefill',
  ],
  [
    'search clear control',
    '<div class="DocSearch-Container"><button class="DocSearch-Clear">Clear</button></div>',
    '.DocSearch-Clear',
  ],
  ['pagination', '<a class="pagination-nav__link">Next</a>', '.pagination-nav__link'],
  ['tag', '<span class="tag">Tag</span>', '.tag'],
  [
    'back-to-top control',
    '<button class="clean-btn theme-back-to-top-button backToTopButton">Top</button>',
    '.theme-back-to-top-button',
  ],
])('%s uses square corners', (_name, markup, selector) => {
  document.body.innerHTML = markup
  const element = document.querySelector(selector) as HTMLElement

  const radii = borderRadii(element)
  expect(radii).toEqual(radii.map(() => 0))
})
