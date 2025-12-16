import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../../src/web/hooks/useTheme.tsx';
import { ToastProvider } from '../../src/web/hooks/useToast.tsx';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { renderWithProviders as render };
