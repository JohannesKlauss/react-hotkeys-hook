// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'React Hotkeys Hook',
  tagline: 'Use hotkeys in a declarative way',
  url: 'https://react-hotkeys-hook.vercel.app/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Johannes Klauss', // Usually your GitHub org/user name.
  projectName: 'react-hotkeys-hook', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: ['@docusaurus/theme-live-codeblock'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/JohannesKlauss/react-hotkeys-hook/edit/master/documentation/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        gtag: {
          trackingID: 'G-7WHC83DL0G',
          anonymizeIP: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'React Hotkeys Hook',
        items: [
          {
            type: 'doc',
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
    }),
};

module.exports = config;
