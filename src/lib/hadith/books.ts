// The books we show, in this order, with their names per interface language (English where a language has none), and the
// translations fawazahmed0/hadith-api has for each.

import type { Book, BookId, Translation, TranslationLanguage } from "./types";

// The translations fawazahmed0 has for each book (editions.json, checked 2026-11-21; Tamil has only Bukhari and Muslim). Arabic, Indonesian and English are
// served from our mirror; the others are read from the source when a reader asks for them.
const ALL: TranslationLanguage[] = ["id", "en", "tr", "bn", "fr", "ru", "ur"];
const NO_RU: TranslationLanguage[] = ["id", "en", "tr", "bn", "fr", "ur"];

export const BOOKS: Book[] = [
  { id: "bukhari", name: { en: "Sahih al-Bukhari", id: "Shahih al-Bukhari", ar: "صحيح البخاري" }, arabicName: "صحيح البخاري", translations: [...ALL, "ta"] },
  { id: "muslim", name: { en: "Sahih Muslim", id: "Shahih Muslim", ar: "صحيح مسلم" }, arabicName: "صحيح مسلم", translations: [...ALL, "ta"] },
  { id: "abudawud", name: { en: "Sunan Abu Dawud", id: "Sunan Abu Dawud", ar: "سنن أبي داود" }, arabicName: "سنن أبي داود", translations: ALL },
  {
    id: "tirmidhi",
    name: { en: "Jami at-Tirmidhi", id: "Jami' at-Tirmidzi", ar: "جامع الترمذي" },
    arabicName: "جامع الترمذي",
    translations: ["id", "en", "tr", "bn", "ur"],
  },
  { id: "nasai", name: { en: "Sunan an-Nasa'i", id: "Sunan an-Nasa'i", ar: "سنن النسائي" }, arabicName: "سنن النسائي", translations: NO_RU },
  { id: "ibnmajah", name: { en: "Sunan Ibn Majah", id: "Sunan Ibnu Majah", ar: "سنن ابن ماجه" }, arabicName: "سنن ابن ماجه", translations: NO_RU },
  { id: "malik", name: { en: "Muwatta Malik", id: "Al-Muwaththa' Malik", ar: "موطأ مالك" }, arabicName: "موطأ مالك", translations: NO_RU },
  // HadeethEnc gives an-Nawawi and 20 of the Qudsi in the reader's language where fawazahmed0 has none.
  {
    id: "nawawi",
    name: { en: "Forty Hadith of an-Nawawi", id: "Arbain an-Nawawi", ar: "الأربعون النووية" },
    arabicName: "الأربعون النووية",
    translations: ["en", "tr", "bn", "fr"],
    hadeethenc: "all",
  },
  { id: "qudsi", name: { en: "Forty Hadith Qudsi", id: "Empat Puluh Hadis Qudsi" }, translations: ["en", "fr"], hadeethenc: "some" },
  {
    id: "dehlawi",
    name: { en: "Forty Hadith of Shah Waliullah Dehlawi", id: "Empat Puluh Hadis Syah Waliyullah ad-Dihlawi" },
    translations: ["en", "fr"],
  },
];

export const bookById = (id: BookId): Book => BOOKS.find((b) => b.id === id)!;

/** Edition codes of fawazahmed0: `ara-bukhari`, `ind-bukhari`, `tur-bukhari`. */
export const EDITION_PREFIX: Record<TranslationLanguage | "ar", string> = {
  ar: "ara",
  id: "ind",
  en: "eng",
  tr: "tur",
  bn: "ben",
  fr: "fra",
  ru: "rus",
  ur: "urd",
  ta: "tam",
};

/** The editions in our mirror; the others are read from the source (the owner's decision, 2026-11-21). */
export const MIRRORED: ReadonlySet<string> = new Set(["ara", "ind", "eng"]);

/**
 * The translations to try for a book, best first: the interface language, then English, then Indonesian (an Indonesian
 * reader gets English where the Indonesian text is missing, the owner's decision of 2026-11-20). An Arabic reader gets
 * none: the hadith is already in Arabic.
 */
export function translationOrder(book: Book, locale: string): TranslationLanguage[] {
  if (locale === "ar") return [];
  const preferred = [locale, "en", "id"];
  return [...new Set(preferred)].filter((l): l is TranslationLanguage => book.translations.includes(l as TranslationLanguage));
}

/** The first non-empty text in the given order, or null. */
export function pickTranslation(
  order: TranslationLanguage[],
  texts: Partial<Record<TranslationLanguage, string>>,
): Translation | null {
  for (const language of order) {
    const text = texts[language]?.trim();
    if (text) return { language, text };
  }
  return null;
}
