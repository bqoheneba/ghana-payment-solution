"use client";

import { useTheme } from "@/hooks/useTheme";

export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`switch${dark ? " on" : ""}`}
      onClick={toggleTheme}
    >
      <span className="switch-thumb" />
    </button>
  );
}
