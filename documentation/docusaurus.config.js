const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'React Hotkeys Hook',
  tagline: 'use declarative hotkeys',
  url: 'https://johannesklauss.github.io',
  baseUrl: '/react-hotkeys-hook/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Johannes Klauss', // Usually your GitHub org/user name.
  projectName: 'react-hotkeys-hook', // Usually your repo name.
  plugins: ['@docusaurus/theme-live-codeblock'],
  themeConfig: {
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
              to: '/docs/documentation/use-hotkeys',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/JohannesKlauss/react-hotkeys-hook',
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
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/JohannesKlauss/react-hotkeys-hook/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
