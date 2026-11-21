// Chapter titles per interface language. The source names chapters in English only. The Indonesian names in
// chapter-names-id.json were written for this site and reviewed by the owner on 2026-11-21: "Kitab <name>
// (<transliteration>)" in the spelling usual in Indonesian hadith books (Shalat, Wudhu, Nadzar), Bukhari after the
// owner's list of its 97 books. The source's English name stays as a subtitle beside them.
//
// Chapter 0 holds what the source puts in no chapter. For Muslim and Ibn Majah it is the book's introduction
// (Muqaddimah: Ibn Majah's has 266 hadiths, as on hadits.id), so it has a name; elsewhere it gets the `unnamed` label.

import names from "./chapter-names-id.json";
import type { BookId, Chapter } from "./types";

const INDONESIAN = names as Partial<Record<BookId, Record<string, string>>>;
/** English names for chapter 0 where it is the book's introduction (Indonesian ones are in the JSON). */
const ENGLISH_ZERO: Partial<Record<BookId, string>> = {
  muslim: "Introduction (al-Muqaddimah)",
  ibnmajah: "Introduction (al-Muqaddimah)",
};

export interface ChapterTitle {
  /** The title in the interface language when we have it, otherwise the source's English name. */
  title: string;
  /** The language of `title`. */
  lang: "en" | "id";
  /** The source's English name, when `title` is a translation of it. */
  original?: string;
}

/** The title of a chapter for a locale. Chapter 0 has no name in the source: `unnamed` is used for it. */
export function chapterTitle(book: BookId, chapter: Pick<Chapter, "number" | "name">, locale: string, unnamed: string): ChapterTitle {
  if (chapter.number === 0) {
    const named = locale === "id" ? INDONESIAN[book]?.["0"] : ENGLISH_ZERO[book];
    return { title: named ?? unnamed, lang: locale === "en" ? "en" : "id" };
  }
  const indonesian = locale === "id" ? INDONESIAN[book]?.[String(chapter.number)] : undefined;
  return indonesian ? { title: indonesian, lang: "id", original: chapter.name } : { title: chapter.name, lang: "en" };
}
