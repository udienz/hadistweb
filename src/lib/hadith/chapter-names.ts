// Chapter titles per interface language. The source names chapters in English only; Indonesian names come from
// compressed_hadith_sqlite (see scripts/build-chapter-names.py). They are not reviewed yet and some are vaguer than the
// English one (Bukhari 8 to 12 are all "Kitab Salat"), so the English name is always kept as a subtitle beside them.

import names from "./chapter-names-id.json";
import type { BookId, Chapter } from "./types";

const INDONESIAN = names as Partial<Record<BookId, Record<string, string>>>;

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
  if (chapter.number === 0) return { title: unnamed, lang: locale === "en" ? "en" : "id" };
  const indonesian = locale === "id" ? INDONESIAN[book]?.[String(chapter.number)] : undefined;
  return indonesian ? { title: indonesian, lang: "id", original: chapter.name } : { title: chapter.name, lang: "en" };
}
