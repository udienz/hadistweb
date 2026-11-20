// Theme, per browser in local storage, applied to <html> before the first paint (the inline script in the root layout).
// Same storage key and behaviour as quranweb. No React and no "use client": the constants are shared with server
// components.

export const THEMES = ["light", "dark", "auto"] as const;
export type Theme = (typeof THEMES)[number];
/** "auto" follows the device (prefers-color-scheme); it is also what a browser that never chose a theme shows. */
export const DEFAULT_THEME: Theme = "auto";
export const isTheme = (value: unknown): value is Theme => typeof value === "string" && (THEMES as readonly string[]).includes(value);

export const THEME_KEY = "theme";

/** Inline script for <head>: applies the stored theme before the first paint, so the page does not flash. */
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||((!t||t==="auto")&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

// Browser side. Every access to storage is guarded: it can be missing or blocked.

export function readTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return isTheme(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Whether the page should be dark now for a theme ("auto" asks the device). */
export function isDark(theme: Theme): boolean {
  return theme === "dark" || (theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
}

/** Store a theme in this browser and show it. */
export function applyTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  document.documentElement.classList.toggle("dark", isDark(theme));
}
