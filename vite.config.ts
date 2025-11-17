import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'ES2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      external: ['fs', 'path', 'node:fs', 'node:path'],
      output: {
        globals: {
          fs: 'null',
          path: 'null',
          'node:fs': 'null',
          'node:path': 'null',
        },
      },
    },
  },
  ssr: {
    external: ['fs', 'path'],
  },
  optimizeDeps: {
    exclude: ['video-data.json'],
  },
});
