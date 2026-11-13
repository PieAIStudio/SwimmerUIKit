import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'showcase-dist',
    emptyOutDir: true,
    rollupOptions: { input: 'showcase/index.html' },
  },
});
