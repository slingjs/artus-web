import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['./tests/**'],
    exclude: ['./tests/*.d.ts', './tests/setup.ts'],
    setupFiles: ['./tests/setup.ts'],
    singleThread: true,
    sequence: {
      hooks: 'list'
    }
  }
})
