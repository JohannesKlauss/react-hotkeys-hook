const esbuild = require('esbuild')

const baseConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  splitting: false,
  target: ['esnext'],
  external: ['react', 'react-dom', 'lodash.isequal'],
}

esbuild
  .build({
    ...baseConfig,
    outfile: 'dist/index.cjs',
    format: 'cjs',
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    ...baseConfig,
    outfile: 'dist/index.mjs',
    format: 'esm',
  })
  .catch(() => process.exit(1))
