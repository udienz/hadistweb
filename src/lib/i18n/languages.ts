// The name of a language (an ISO code such as "tr") in the interface language, for the labels that say which
// translation is shown. The platform's own names (Intl.DisplayNames), so a new language needs no new message.

export function languageName(code: string, locale: string): string {
  try {
    const name = new Intl.DisplayNames([locale], { type: "language" }).of(code);
    return name ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}
