// Theme and text size, per browser in local storage, applied to <html> before the first paint (the inline script in the
// root layout). Same behaviour as quranweb's display.ts, without the account sync. No React and no "use client": the
// constants are shared with server components.

export const THEMES = ["light", "dark", "auto"] as const;
export type Theme = (typeof THEMES)[number];
/** "auto" follows the device (prefers-color-scheme); it is also what a browser that never chose a theme shows. */
export const DEFAULT_THEME: Theme = "auto";
export const isTheme = (value: unknown): value is Theme => typeof value === "string" && (THEMES as readonly string[]).includes(value);

/** Text size steps, as a factor of the normal size. Arabic and Latin text each have their own (as in quranweb). */
export const FONT_SCALES = [0.85, 1, 1.15, 1.3, 1.5] as const;
export interface FontSize {
  arabic: number;
  latin: number;
}
export const DEFAULT_FONT_SIZE: FontSize = { arabic: 1, latin: 1 };
export const isFontScale = (value: unknown): value is number => typeof value === "number" && (FONT_SCALES as readonly number[]).includes(value);

/** A valid font size from anything (storage), or null. */
export function parseFontSize(value: unknown): FontSize | null {
  if (typeof value !== "object" || value === null) return null;
  const { arabic, latin } = value as Record<string, unknown>;
  return isFontScale(arabic) && isFontScale(latin) ? { arabic, latin } : null;
}

/** The next step up (+1) or down (-1), staying within the steps. */
export function stepFontScale(current: number, direction: 1 | -1): number {
  const index = Math.max(0, (FONT_SCALES as readonly number[]).indexOf(current));
  return FONT_SCALES[Math.min(FONT_SCALES.length - 1, Math.max(0, index + direction))];
}

export const THEME_KEY = "theme";
export const FONT_SIZE_KEY = "hadistweb:font-size";
/** CSS variables on <html> that the reading text multiplies its size by. */
export const ARABIC_SCALE_VAR = "--arabic-scale";
export const LATIN_SCALE_VAR = "--latin-scale";
/** Window event fired when this tab changes the theme or text size, so controls can update. */
export const DISPLAY_EVENT = "hadistweb:display";

/** Inline script for <head>: applies the stored theme and text size before the first paint, so the page does not flash. */
export const displayScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||((!t||t==="auto")&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark");var f=JSON.parse(localStorage.getItem("${FONT_SIZE_KEY}")||"null");if(f){var s=document.documentElement.style;if(typeof f.arabic==="number")s.setProperty("${ARABIC_SCALE_VAR}",f.arabic);if(typeof f.latin==="number")s.setProperty("${LATIN_SCALE_VAR}",f.latin)}}catch(e){}`;

// Browser side. Every access to storage is guarded: it can be missing or blocked.

export function readTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return isTheme(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function readFontSize(): FontSize {
  try {
    return parseFontSize(JSON.parse(localStorage.getItem(FONT_SIZE_KEY) ?? "null")) ?? DEFAULT_FONT_SIZE;
  } catch {
    return DEFAULT_FONT_SIZE;
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
  window.dispatchEvent(new Event(DISPLAY_EVENT));
}

/** Store a text size in this browser and show it. */
export function applyFontSize(size: FontSize): void {
  try {
    localStorage.setItem(FONT_SIZE_KEY, JSON.stringify(size));
  } catch {}
  const style = document.documentElement.style;
  style.setProperty(ARABIC_SCALE_VAR, String(size.arabic));
  style.setProperty(LATIN_SCALE_VAR, String(size.latin));
  window.dispatchEvent(new Event(DISPLAY_EVENT));
}

/** Subscribe to theme and text size changes from this tab or another one (for useSyncExternalStore). */
export function subscribeDisplay(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY && event.key !== FONT_SIZE_KEY) return;
    document.documentElement.classList.toggle("dark", isDark(readTheme()));
    const size = readFontSize();
    document.documentElement.style.setProperty(ARABIC_SCALE_VAR, String(size.arabic));
    document.documentElement.style.setProperty(LATIN_SCALE_VAR, String(size.latin));
    callback();
  };
  window.addEventListener(DISPLAY_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(DISPLAY_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}
