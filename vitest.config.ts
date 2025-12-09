import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // Browser mode for unit & integration tests
    browser: {
      enabled: true,
      instances: [{ browser: 'chromium' }],
      provider: playwright(),
      headless: true,
    },
    include: [
      'src/**/*.test.{ts,tsx}',
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
      'tests/ui/**/*.test.{ts,tsx}'
    ],
    exclude: ['tests/e2e/**', 'node_modules/**'],
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
    testTimeout: 15000
  }
});
