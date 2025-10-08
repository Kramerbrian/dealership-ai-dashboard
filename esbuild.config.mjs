import { build } from 'esbuild'

const prod = process.env.NODE_ENV === 'production'

await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  splitting: true,
  format: 'esm',
  target: ['es2020'],
  outdir: 'public/assets',
  sourcemap: prod ? false : true,
  minify: prod,
  metafile: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  // Drop console.* in prod
  logLevel: 'info',
})
