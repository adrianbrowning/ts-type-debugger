import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

// Separate config for UI component tests that need browser mode
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    browser: {
      enabled: true,
      instances: [{ browser: 'chromium' }],
      provider: playwright(),
      headless: true,
    },
    include: ['tests/ui/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
  }
});
