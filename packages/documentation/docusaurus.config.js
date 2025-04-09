const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'React Hotkeys Hook',
  tagline: 'Use hotkeys in a declarative way',
  url: 'https://johannesklauss.github.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Johannes Klauss', // Usually your GitHub org/user name.
  projectName: 'react-hotkeys-hook', // Usually your repo name.
  themes: ['@docusaurus/theme-live-codeblock'],
  themeConfig: {
    navbar: {
      title: 'React Hotkeys Hook',
      items: [
        {
          type: 'docsVersion',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: 'blog',
          label: 'Blog',
          position: 'left'
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownActiveClassDisabled: true,
        },
        {
          href: 'https://github.com/JohannesKlauss/react-hotkeys-hook',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Quick Start',
              to: '/docs/intro',
            },
            {
              label: 'useHotkeys',
              to: '/docs/documentation/useHotkeys/basic-usage',
            },
            {
              label: 'isHotkeyPressed',
              to: '/docs/documentation/is-hotkey-pressed',
            },
          ],
        },
        {
          title: 'API',
          items: [
            {
              label: 'useHotkeys',
              to: '/docs/api/use-hotkeys',
            },
            {
              label: 'isHotkeyPressed',
              to: '/docs/api/is-hotkey-pressed',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Support',
              href: 'https://github.com/JohannesKlauss/react-hotkeys-hook/discussions',
            },
            {
              label: 'Recipes',
              href: 'https://github.com/JohannesKlauss/react-hotkeys-hook',
            },
            {
              label: 'FAQ',
              href: 'https://github.com/JohannesKlauss/react-hotkeys-hook',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/JohannesKlauss/react-hotkeys-hook',
            },
            {
              label: 'StackOverflow',
              href: 'https://stackoverflow.com/search?page=1&tab=Relevance&q=react-hotkeys-hook',
            },
          ],
        },
      ],
      copyright: `Documentation built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
    algolia: {
      // The application ID provided by Algolia
      appId: 'MVSFN13FOZ',

      // Public API key: it is safe to commit it
      apiKey: 'ea10bff3a5e2fb0d82492d680e40959e',

      indexName: 'react-hotkeys-hook',
      contextualSearch: true,
      searchParameters: {},

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/JohannesKlauss/react-hotkeys-hook/edit/main/documentation/',
          lastVersion: 'current',
          versions: {
            current: {
              label: '4.0',
            },
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-7WHC83DL0G',
          anonymizeIP: true,
        },
      },
    ],
  ],
};
