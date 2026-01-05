import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { copyFileSync } from 'node:fs';

// GitHub Pages SPA fix: copy index.html to 404.html so all routes serve the app
const copy404Plugin = (): Plugin => ({
  name: 'copy-404',
  closeBundle() {
    copyFileSync('dist/index.html', 'dist/404.html');
  },
});

export default defineConfig({
  base: '/',
  plugins: [
    react({
      exclude: /lib-bundle\.ts$/
    }),
    copy404Plugin(),
  ],
  server: {
    port: 5173,
    open: true,
  },
  // SPA fallback: serve index.html for all routes (handles /debugger)
  appType: 'spa',
  resolve: {
    alias: {
      fs: resolve(__dirname, 'src/stubs/fs.ts'),
      path: resolve(__dirname, 'src/stubs/path.ts'),
    },
  },
  build: {
    target: 'ES2020',
    minify: 'esbuild',
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['video-data.json'],
  },
});
