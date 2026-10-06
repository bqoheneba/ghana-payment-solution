"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { applyTheme, readStoredTheme, type Theme } from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  const chooseTheme = useCallback((next: Theme) => {
    applyTheme(next);
    setTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(current => {
      const next: Theme = current === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme: chooseTheme }),
    [theme, toggleTheme, chooseTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
