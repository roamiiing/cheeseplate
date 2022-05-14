import * as path from 'path'

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import pkg from '../package.json'

export default defineConfig({
  plugins: [
    tsconfigPaths({
      root: path.resolve(__dirname, '..'),
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, '../src/app/index.ts'),
      fileName: () => 'index.js',
      formats: ['cjs'],
    },
    outDir: path.resolve(__dirname, '../dist'),
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies),
        'path',
        'os',
        /^@prisma\/client/,
        /^react-dom/,
      ],
    },
    minify: 'terser',
    // TODO: upload source maps to sentry
    sourcemap: 'inline',
  },
  test: {
    environment: 'node',
  },
})
