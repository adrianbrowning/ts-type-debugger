import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { ThemeProvider } from "../../src/web/hooks/useTheme.tsx";
import { ToastProvider } from "../../src/web/hooks/useToast.tsx";

// eslint-disable-next-line react-refresh/only-export-components
const AllProviders = ({ children }: { children: ReactNode; }) => (
  <ThemeProvider>
    <ToastProvider>{children}</ToastProvider>
  </ThemeProvider>
);

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllProviders, ...options });
 
export { renderWithProviders as render };
