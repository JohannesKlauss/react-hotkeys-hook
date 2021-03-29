import pkg from './package.json';

export default {
  title: 'React Hotkeys Hook',
  description: pkg.description,
  base: `/${pkg.name}`,
  version: pkg.version,
  propsParser: false,
  hashRouter: true,
  typescript: true,
  themeConfig: {
    initialColorMode: 'dark',
  },
  ignore: ['README.md', 'CHANGELOG.md']
};