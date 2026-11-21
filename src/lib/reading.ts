// What the reader keeps in this browser (local storage, key "hadistweb:reading"): the last hadith read, for "continue
// reading", and the hadiths bookmarked. Nothing of it reaches the server (there are no accounts). Every access to
// storage is guarded: it can be missing or blocked, and the page then works without it.

import { isHadithNumber } from "./links";
import { isBookId, type BookId } from "./hadith/types";

export const READING_KEY = "hadistweb:reading";
/** Window event fired when this tab changes the reading data, so the controls that show it can update. */
export const READING_EVENT = "hadistweb:reading";
/** More bookmarks than anyone keeps by hand; the oldest go first beyond it, so storage stays small. */
export const MAX_BOOKMARKS = 500;

export interface HadithRef {
  book: BookId;
  number: string;
  /** When it was read or bookmarked (milliseconds since 1970). */
  at: number;
}

export interface ReadingData {
  last: HadithRef | null;
  /** Newest first. */
  bookmarks: HadithRef[];
}

export const EMPTY_READING: ReadingData = { last: null, bookmarks: [] };

function parseRef(value: unknown): HadithRef | null {
  if (typeof value !== "object" || value === null) return null;
  const { book, number, at } = value as Record<string, unknown>;
  if (!isBookId(book) || typeof number !== "string" || !isHadithNumber(number)) return null;
  return { book, number, at: typeof at === "number" && Number.isFinite(at) ? at : 0 };
}

/** Valid reading data from anything (storage may hold an old shape or be edited by hand). */
export function parseReading(value: unknown): ReadingData {
  if (typeof value !== "object" || value === null) return EMPTY_READING;
  const { last, bookmarks } = value as Record<string, unknown>;
  const seen = new Set<string>();
  const list = (Array.isArray(bookmarks) ? bookmarks : [])
    .map(parseRef)
    .filter((b): b is HadithRef => b !== null)
    .filter((b) => {
      const key = `${b.book}/${b.number}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_BOOKMARKS);
  return { last: parseRef(last), bookmarks: list };
}

export const sameHadith = (a: { book: string; number: string }, b: { book: string; number: string }): boolean =>
  a.book === b.book && a.number === b.number;

/** The data with a bookmark added (at the top) or removed. */
export function toggleBookmark(data: ReadingData, book: BookId, number: string, now: number): ReadingData {
  const rest = data.bookmarks.filter((b) => !sameHadith(b, { book, number }));
  if (rest.length < data.bookmarks.length) return { ...data, bookmarks: rest };
  return { ...data, bookmarks: [{ book, number, at: now }, ...rest].slice(0, MAX_BOOKMARKS) };
}

// Browser side.

let cache: { raw: string | null; data: ReadingData } | null = null;

/** The stored data; the same object while storage is unchanged (useSyncExternalStore needs a stable snapshot). */
export function readReading(): ReadingData {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(READING_KEY);
  } catch {}
  if (cache && cache.raw === raw) return cache.data;
  let data = EMPTY_READING;
  try {
    data = parseReading(JSON.parse(raw ?? "null"));
  } catch {}
  cache = { raw, data };
  return data;
}

export function writeReading(data: ReadingData): void {
  try {
    localStorage.setItem(READING_KEY, JSON.stringify(data));
  } catch {}
  window.dispatchEvent(new Event(READING_EVENT));
}

/** Remember the hadith being read now. */
export function recordLastRead(book: BookId, number: string): void {
  const data = readReading();
  if (data.last && sameHadith(data.last, { book, number })) return;
  writeReading({ ...data, last: { book, number, at: Date.now() } });
}

/** Subscribe to changes from this tab or another one (for useSyncExternalStore). */
export function subscribeReading(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === READING_KEY || event.key === null) callback();
  };
  window.addEventListener(READING_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(READING_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}
