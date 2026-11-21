// The shapes the UI works with. Providers map their sources to these; components never see a source's own format.

import type { LocalizedText } from "../i18n/translate";

/** A translation language, by its interface language code. fawazahmed0 also has Tamil, which has no interface yet. */
export const TRANSLATION_LANGUAGES = ["id", "en", "tr", "bn", "fr", "ru", "ur"] as const;
export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number];
export const isTranslationLanguage = (value: string): value is TranslationLanguage =>
  (TRANSLATION_LANGUAGES as readonly string[]).includes(value);

export const BOOK_IDS = [
  "bukhari",
  "muslim",
  "abudawud",
  "tirmidhi",
  "nasai",
  "ibnmajah",
  "malik",
  "nawawi",
  "qudsi",
  "dehlawi",
] as const;
export type BookId = (typeof BOOK_IDS)[number];

export const isBookId = (value: unknown): value is BookId =>
  typeof value === "string" && (BOOK_IDS as readonly string[]).includes(value);

export interface Book {
  id: BookId;
  name: LocalizedText;
  /** Only where we are sure of the title in Arabic. */
  arabicName?: string;
  /** The translations the source has for this book. */
  translations: TranslationLanguage[];
  /**
   * HadeethEnc has this book's hadiths ("all") or some of them ("some"), in many languages: it gives the translation in
   * the reader's language when the book's source has none (lib/hadith/hadeethenc-translation.ts).
   */
  hadeethenc?: "all" | "some";
}

export interface Chapter {
  /** As numbered by the source. 0 holds the hadiths the source puts in no chapter. */
  number: number;
  /** The name in the source (English). Empty for chapter 0. */
  name: string;
  /** How many hadiths it has. */
  count: number;
}

export interface Grade {
  grader: string;
  grade: string;
}

/** Where a translation comes from when it is not the book's own source (fawazahmed0). */
export interface TranslationSource {
  name: "HadeethEnc.com";
  /** The hadith's page at the source. */
  url: string;
  /** The source's attribution line (takhrij), which our Arabic text carries at its end. */
  attribution: string;
}

export interface Translation {
  /** A TranslationLanguage, or for HadeethEnc any interface language. */
  language: string;
  text: string;
  source?: TranslationSource;
}

export interface Hadith {
  /** The number in the book, as a string: some numbers have a decimal part ("402.2"). */
  number: string;
  /** The number in the Arabic numbering, when the source gives one. */
  arabicNumber: string;
  chapter: number;
  /** Empty when the source has no Arabic text for this number. */
  arabic: string;
  /** The first translation available in the reader's order, or null when there is none. */
  translation: Translation | null;
  grades: Grade[];
}
