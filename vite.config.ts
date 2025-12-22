import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/',
  plugins: [
    tailwindcss(),
    react({
      exclude: /lib-bundle\.ts$/
    }),
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
