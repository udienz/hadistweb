// The shapes the UI works with. Providers map their sources to these; components never see a source's own format.

import type { LocalizedText } from "../i18n/translate";

/** A translation language. "id" and "en" match the interface languages. */
export type TranslationLanguage = "id" | "en";

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

export interface Hadith {
  /** The number in the book, as a string: some numbers have a decimal part ("402.2"). */
  number: string;
  /** The number in the Arabic numbering, when the source gives one. */
  arabicNumber: string;
  chapter: number;
  /** Empty when the source has no Arabic text for this number. */
  arabic: string;
  /** The first translation available in the reader's order, or null when there is none. */
  translation: { language: TranslationLanguage; text: string } | null;
  grades: Grade[];
}
