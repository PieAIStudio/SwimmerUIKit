import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@pieai/swimmer-ui-kit': resolve(__dirname, 'src/index.ts'),
    },
  },
  build: {
    outDir: 'showcase-dist',
    emptyOutDir: true,
    rollupOptions: { input: 'showcase/index.html' },
  },
});
