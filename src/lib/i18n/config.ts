// Supported UI languages, the same as quranweb's. The hadith translations have their own languages (lib/hadith/books.ts);
// the interface language decides which one is preferred, and HadeethEnc is read in it.

export const LOCALES = ["en", "id", "tr", "ms", "bn", "fr", "ru", "ur", "ar", "fa"] as const;
export type Locale = (typeof LOCALES)[number];

/** Used when neither the cookie nor the browser says anything usable. */
export const DEFAULT_LOCALE: Locale = "id";

export const LOCALE_COOKIE = "hw-lang";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
  tr: "Türkçe",
  ms: "Bahasa Melayu",
  bn: "বাংলা",
  fr: "Français",
  ru: "Русский",
  ur: "اردو",
  ar: "العربية",
  fa: "فارسی",
};

/**
 * The languages in the order of the language menu: alphabetical by each language's own name (the owner's request,
 * 2026-11-21), names in Latin script first, then Cyrillic, Arabic and Bengali. Written out rather than sorted at run
 * time, so the server and the browser cannot disagree; a test checks it against the collation order.
 */
export const MENU_LOCALES: readonly Locale[] = ["id", "ms", "en", "fr", "tr", "ru", "ur", "ar", "fa", "bn"];

/**
 * The flag shown beside each language in the language menu (the owner's request, 2026-11-21). A language is not a
 * country, so this is the country most readers connect with it. The SVGs are from flag-icons (MIT, public/flags/).
 */
export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "gb",
  id: "id",
  tr: "tr",
  ms: "my",
  bn: "bd",
  fr: "fr",
  ru: "ru",
  ur: "pk",
  ar: "sa",
  fa: "ir",
};

/**
 * Languages published as a **community translation**: drafts by Claude (the owner's choice, 2026-11-21), not yet reviewed
 * by a speaker of the language, as in quranweb. The language menu marks them and offers a link to report a mistake.
 * Remove a language from this list once a speaker has reviewed it.
 */
export const COMMUNITY_LOCALES: readonly string[] = ["tr", "ms", "bn", "fr", "ru", "ur", "ar", "fa"];

/** Languages written right to left: the root layout sets `<html dir>` from this, and the layout uses logical CSS. */
export const RTL_LOCALES: readonly string[] = ["ar", "ur", "fa"];

export const directionOf = (code: string): "ltr" | "rtl" => (RTL_LOCALES.includes(code) ? "rtl" : "ltr");

export const isCommunityLocale = (code: string): boolean => COMMUNITY_LOCALES.includes(code);

/** A new GitHub issue from the "Translation mistake" form, with the language filled in. */
export const reportTranslationUrl = (code: string): string =>
  `https://github.com/udienz/hadistweb/issues/new?template=translation_mistake.yml&title=${encodeURIComponent(
    `Translation mistake (${code}): `,
  )}&language=${encodeURIComponent(code)}`;

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
