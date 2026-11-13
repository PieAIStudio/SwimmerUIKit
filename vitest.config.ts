import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Recorded verification cost on the owner's Mac, 2026-09-24: 409 unit/browser/
// Storybook tests ~62s, full verify ~85s with concurrent host work. Iterations use
// the affected files first. Evidence: .devspace-visual/living-entry/final/verify-final.log.

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  // pretty-format (pulled by Storybook's browser test harness) still references
  // Node's `global`; map it explicitly for the browser bundle.
  define: {
    global: 'globalThis',
  },
  test: {
    // This checkout shares its Mac with other repositories. A worker limit
    // alone does not serialize the Node, Storybook and browser projects.
    // Keep the original assertions/timeouts and avoid competing browsers.
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
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          sequence: { groupOrder: 1 },
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          sequence: { groupOrder: 2 },
          include: ['src/**/*.browser.test.{ts,tsx}', 'tests/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            api: { port: 0 },
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
  },
});
