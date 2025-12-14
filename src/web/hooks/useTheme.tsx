import { createContext, useContext, useState, useEffect, useLayoutEffect, useMemo, useCallback, ReactNode } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextType = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  cssVar: (name: string) => string;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = 'ts-visualizer-theme';

const getSystemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const getCssVar = (name: string): string => {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.body).getPropertyValue(name).trim();
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof localStorage === 'undefined') return 'system';
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    return saved || 'system';
  });

  const [systemDark, setSystemDark] = useState(getSystemPrefersDark);

  const isDark = useMemo(() => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return systemDark;
  }, [mode, systemDark]);

  // Apply theme class to body (useLayoutEffect ensures class is applied before paint/child effects)
  useLayoutEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    if (!isDark) {
      document.body.classList.add('theme-light');
    }
  }, [isDark]);

  // Persist mode to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  // Force re-read CSS variables when theme changes
  const cssVar = useCallback((name: string) => getCssVar(name), [isDark]);

  const value = useMemo(() => ({
    mode,
    setMode,
    isDark,
    cssVar,
  }), [mode, setMode, isDark, cssVar]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
