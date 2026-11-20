// Supported UI languages. The hadith translations have their own languages; this only controls the interface (and which
// translation is preferred, see `translationOrder` in lib/hadith).

export const LOCALES = ["en", "id"] as const;
export type Locale = (typeof LOCALES)[number];

/** Used when neither the cookie nor the browser says anything usable. */
export const DEFAULT_LOCALE: Locale = "id";

export const LOCALE_COOKIE = "hw-lang";

export const LOCALE_NAMES: Record<Locale, string> = { en: "English", id: "Bahasa Indonesia" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Pick the interface language: an explicit cookie wins, then the first supported
 * language in the browser's Accept-Language header (in the order the browser listed
 * them), then the default.
 */
export function negotiateLocale(cookie: string | undefined, acceptLanguage: string | null | undefined): Locale {
  if (isLocale(cookie)) return cookie;
  for (const part of (acceptLanguage ?? "").split(",")) {
    const primary = part.split(";")[0].trim().toLowerCase().split("-")[0];
    if (isLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}
