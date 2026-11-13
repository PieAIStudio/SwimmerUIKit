import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

// Unit and browser projects run serially to keep the shared Mac responsive.
export default defineConfig({
  define: { global: 'globalThis' },
  test: {
    fileParallelism: false,
    projects: [
      {
        extends: true,
        test: {
          sequence: { groupOrder: 0 },
          environment: 'node',
          include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.browser.test.{ts,tsx}', 'tests/**/*.browser.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          sequence: { groupOrder: 1 },
          include: ['src/**/*.browser.test.{ts,tsx}', 'tests/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            api: { port: 0 },
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
