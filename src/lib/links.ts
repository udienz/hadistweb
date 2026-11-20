// Addresses of the reading pages, in one place so pages and components agree.

import { pageOf } from "./pagination";
import { DEFAULT_PAGE_SIZE } from "./page-size";

export const bookHref = (book: string): string => `/${book}`;

/** A chapter, at a page when it is not the first. */
export const chapterHref = (book: string, chapter: number, page = 1): string =>
  `/${book}/chapter/${chapter}${page > 1 ? `?page=${page}` : ""}`;

export const hadithHref = (book: string, number: string): string => `/${book}/${number}`;

/** The id of a hadith's card on a chapter page ("402.2" becomes "h-402-2", a valid fragment). */
export const hadithAnchor = (number: string): string => `h-${number.replace(/\./g, "-")}`;

/** The chapter page that shows the hadith at `position` (1-based) in its chapter, with its card in view. */
export const hadithInChapterHref = (book: string, chapter: number, position: number, number: string, size: number = DEFAULT_PAGE_SIZE): string =>
  `${chapterHref(book, chapter, pageOf(position, size))}#${hadithAnchor(number)}`;

/** A hadith number from the URL: digits, with an optional decimal part ("402.2"). */
export const isHadithNumber = (value: string): boolean => /^\d{1,5}(\.\d{1,3})?$/.test(value);

/** A chapter number from the URL. */
export function chapterFromSegment(value: string): number | null {
  if (!/^\d{1,4}$/.test(value)) return null;
  return Number(value);
}
