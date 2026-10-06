export type Theme = "light" | "dark";

export const THEME_KEY = "gdd.theme";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(THEME_KEY, theme);
}

export function readStoredTheme(): Theme {
  const stored = window.localStorage.getItem(THEME_KEY);
  if (isTheme(stored)) return stored;
  const attr = document.documentElement.getAttribute("data-theme");
  return isTheme(attr) ? attr : "light";
}
