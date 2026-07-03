import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Library build. ESM-only since 1.0: every consumer is a Vite ESM app and
// Node >=22 supports require(esm), so shipping CJS only doubled the payload
// and broke type resolution (publint/attw). The kit is 100% standard CSS —
// no Tailwind plugin in any build. Types are rolled up into one flat
// index.d.ts: per-file d.ts kept extensionless relative imports, which fail
// node16 type resolution (attw: internal resolution error).
// CSS is built separately by scripts/build-css.mjs (lightningcss, fails on
// any warning) because the JS entry deliberately imports no CSS.
export default defineConfig({
  plugins: [react(), dts({ bundleTypes: true, tsconfigPath: './tsconfig.build.json' })],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SwimmerUiKit',
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
