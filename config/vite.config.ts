import * as path from 'path'

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

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
    minify: 'esbuild',
    outDir: path.resolve(__dirname, '../dist'),
    rollupOptions: {
      external: module =>
        !module.startsWith('.') &&
        !module.startsWith('@/') &&
        !module.startsWith(path.resolve(__dirname, '../src')) &&
        !module.startsWith(path.resolve(__dirname, '../data')),
    },
    sourcemap: 'inline',
  },
  test: {
    environment: 'node',
  },
})
