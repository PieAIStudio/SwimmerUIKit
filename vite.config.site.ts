import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Static-site build of the component showcase (the preview app in index.html +
// preview/main.tsx). This is separate from the library build in vite.config.ts
// (which uses lib mode). Output goes to site-dist/ for deployment to
// swimmer-ui.pieaistudio.com. Storybook is layered in at /storybook later.
// The kit is 100% standard CSS since 1.0 — no Tailwind plugin anywhere.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'site-dist',
    emptyOutDir: true,
  },
});
