// The books we show, in this order, with their names per interface language. The ids and the translations each book has
// come from fawazahmed0/hadith-api's editions.json (checked 2026-11-20): an-Nawawi, Qudsi and Dehlawi have no Indonesian
// edition.

import type { Book, BookId, Translation, TranslationLanguage } from "./types";

const BOTH: TranslationLanguage[] = ["id", "en"];
const ENGLISH: TranslationLanguage[] = ["en"];

export const BOOKS: Book[] = [
  { id: "bukhari", name: { en: "Sahih al-Bukhari", id: "Shahih al-Bukhari" }, arabicName: "صحيح البخاري", translations: BOTH },
  { id: "muslim", name: { en: "Sahih Muslim", id: "Shahih Muslim" }, arabicName: "صحيح مسلم", translations: BOTH },
  { id: "abudawud", name: { en: "Sunan Abu Dawud", id: "Sunan Abu Dawud" }, arabicName: "سنن أبي داود", translations: BOTH },
  { id: "tirmidhi", name: { en: "Jami at-Tirmidhi", id: "Jami' at-Tirmidzi" }, arabicName: "جامع الترمذي", translations: BOTH },
  { id: "nasai", name: { en: "Sunan an-Nasa'i", id: "Sunan an-Nasa'i" }, arabicName: "سنن النسائي", translations: BOTH },
  { id: "ibnmajah", name: { en: "Sunan Ibn Majah", id: "Sunan Ibnu Majah" }, arabicName: "سنن ابن ماجه", translations: BOTH },
  { id: "malik", name: { en: "Muwatta Malik", id: "Al-Muwaththa' Malik" }, arabicName: "موطأ مالك", translations: BOTH },
  // The Indonesian an-Nawawi comes from HadeethEnc (hadeethenc-translation.ts), not from fawazahmed0: "id" is not listed
  // here because the edition files have none, and the home page labels the book by what HadeethEnc adds (indonesianFrom).
  {
    id: "nawawi",
    name: { en: "Forty Hadith of an-Nawawi", id: "Arbain an-Nawawi" },
    arabicName: "الأربعون النووية",
    translations: ENGLISH,
    indonesianFrom: "HadeethEnc.com",
  },
  { id: "qudsi", name: { en: "Forty Hadith Qudsi", id: "Empat Puluh Hadis Qudsi" }, translations: ENGLISH },
  {
    id: "dehlawi",
    name: { en: "Forty Hadith of Shah Waliullah Dehlawi", id: "Empat Puluh Hadis Syah Waliyullah ad-Dihlawi" },
    translations: ENGLISH,
  },
];

export const bookById = (id: BookId): Book => BOOKS.find((b) => b.id === id)!;

/** Edition codes of fawazahmed0: `ara-bukhari`, `ind-bukhari`, `eng-bukhari`. */
export const EDITION_PREFIX: Record<TranslationLanguage | "ar", string> = { ar: "ara", id: "ind", en: "eng" };

/**
 * The translations to try for a book, best first: the interface language, then the other one. An Indonesian reader gets
 * English where the Indonesian text is missing (the owner's decision, 2026-11-20), and the other way round.
 */
export function translationOrder(book: Book, locale: string): TranslationLanguage[] {
  const preferred: TranslationLanguage[] = locale === "en" ? ["en", "id"] : ["id", "en"];
  return preferred.filter((language) => book.translations.includes(language));
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
