import { useContext } from "react";
import { ThemeContext } from "./ThemeContext.ts";
import type { ThemeContextType } from "./ThemeContext.ts";

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
