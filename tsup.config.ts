import { readdir } from 'fs/promises'
import { resolve, join } from 'path'

import { defineConfig } from 'tsup'

const fromRoot = (...p: string[]) => resolve(__dirname, ...p)

const FOLDERS = {
  STANDALONE: 'standalone',
  SERVERLESS: 'serverless',
  SRC: 'src',
  DIST: 'dist',
}

export default defineConfig(async () => {
  const libList: string[] = []

  const IS_STANDALONE_BUILD = process.env.STANDALONE_BUILD === 'true'
  const IS_SERVERLESS_BUILD = process.env.SERVERLESS_BUILD === 'true'

  if (IS_STANDALONE_BUILD) libList.push(FOLDERS.STANDALONE)
  if (IS_SERVERLESS_BUILD) libList.push(FOLDERS.SERVERLESS)

  const CONFIG = {
    format: 'cjs',
    splitting: true,
    sourcemap: 'inline',
    clean: true,
    dts: false,
  } as const

  return libList.map(v => ({
    ...CONFIG,
    entry: [fromRoot(FOLDERS.SRC, v)],
    outDir: fromRoot(FOLDERS.DIST, v),
  }))
})
