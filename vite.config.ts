import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
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
