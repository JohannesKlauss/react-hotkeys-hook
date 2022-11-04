const esbuild = require('esbuild')

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    outdir: 'dist',
    bundle: true,
    sourcemap: true,
    minify: true,
    splitting: true,
    format: 'esm',
    target: ['esnext'],
    external: ['react', 'react-dom'],
  })
  .catch(() => process.exit(1))
