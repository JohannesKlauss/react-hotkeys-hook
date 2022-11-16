const esbuild = require('esbuild')

esbuild
  .build({
      entryPoints: ['./src/index.ts'],
      outfile: 'dist/index.cjs',
      bundle: true,
      sourcemap: true,
      minify: false,
      splitting: false,
      format: 'cjs',
      target: ['esnext'],
      external: ['react', 'react-dom', 'lodash'],
  })
  .catch(() => process.exit(1))

esbuild
  .build({
      entryPoints: ['./src/index.ts'],
      outfile: 'dist/index.mjs',
      bundle: true,
      sourcemap: true,
      minify: false,
      splitting: false,
      format: 'esm',
      target: ['esnext'],
      external: ['react', 'react-dom', 'lodash'],
  })
  .catch(() => process.exit(1))
