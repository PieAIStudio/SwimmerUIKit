import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: [
      {
        find: '@pieai/swimmer-ui-kit/showcase',
        replacement: resolve(__dirname, 'src/showcase.ts'),
      },
      {
        find: '@pieai/swimmer-ui-kit/tool-worlds',
        replacement: resolve(__dirname, 'src/tool-worlds.ts'),
      },
      { find: '@pieai/swimmer-ui-kit', replacement: resolve(__dirname, 'src/index.ts') },
    ],
  },
  build: {
    outDir: 'showcase-dist',
    emptyOutDir: true,
    rollupOptions: { input: 'showcase/index.html' },
  },
});
