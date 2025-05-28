import path from 'node:path'
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    fileParallelism: false,
  },
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    },
  },
})
