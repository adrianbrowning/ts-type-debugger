import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'tests/**',
        'src/services/typescript/lib-bundle.ts',
        'src/remotion/**',
        '**/*.test.ts',
        '**/*.test.tsx'
      ]
    },
    // Default: Node.js mode for unit/integration tests (fast)
    include: [
      'src/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
    ],
    exclude: ['tests/e2e/**', 'tests/ui/**', 'node_modules/**'],
    testTimeout: 30000,
  }
});
