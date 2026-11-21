// The name of a language (an ISO code such as "tr") in the interface language, for the labels that say which
// translation is shown. The platform's own names (Intl.DisplayNames), so a new language needs no new message.

// Uzbek is in Cyrillic here, as in quranweb; without the script the platform names languages in Latin Uzbek.
const DISPLAY_LOCALE: Record<string, string> = { uz: "uz-Cyrl" };

export function languageName(code: string, locale: string): string {
  try {
    const name = new Intl.DisplayNames([DISPLAY_LOCALE[locale] ?? locale], { type: "language" }).of(code);
    return name ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}
