import { createContext } from "react";

export type ThemeMode = "system" | "light" | "dark";

export type ThemeContextType = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  cssVar: (name: string) => string;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);
