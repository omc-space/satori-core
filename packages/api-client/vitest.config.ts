import tsPath from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
  },

  // @ts-ignore
  plugins: [tsPath()],
  optimizeDeps: {
    needsInterop: ['lodash'],
  },
})
