import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.ts', 'src/tests/**/*.contract.test.ts', 'src/tests/**/*.integration.test.ts'],
    environment: 'node',
    globals: true,
    setupFiles: ['src/testSetup.ts'],
    reporters: ['default'],
    coverage: {
      enabled: false,
    },
  },
})
