// A hadith reference typed into the search box, such as "Bukhari 349", "HR. Muslim no. 8" or "abu dawud 402.2": the
// search page then opens that hadith instead of searching. Book names are matched loosely (with or without "sahih",
// "sunan", "al-", the usual Indonesian spellings), and a bare number counts when a book is chosen in the filter.

import { isHadithNumber } from "../links";
import type { BookId } from "./types";

/** The names a reader may type for each book, as letters only (lower case, no spaces or punctuation). */
const NAMES: Record<BookId, string[]> = {
  bukhari: ["bukhari", "buhari", "bukhory", "bukhori"],
  muslim: ["muslim"],
  abudawud: ["abudawud", "abudaud", "abidawud", "abudawood", "dawud", "daud"],
  tirmidhi: ["tirmidhi", "tirmidzi", "tirmizi", "turmudzi", "termizi"],
  nasai: ["nasai", "nasa", "annasai"],
  ibnmajah: ["ibnmajah", "ibnumajah", "majah"],
  malik: ["malik", "muwatta", "muwattamalik", "muwaththa", "muwaththamalik"],
  nawawi: ["nawawi", "arbain", "arbainnawawi", "fortyhadithofannawawi", "arbaunnawawiyah"],
  qudsi: ["qudsi", "hadithqudsi", "hadisqudsi", "fortyhadithqudsi"],
  dehlawi: ["dehlawi", "dihlawi", "dahlawi", "shahwaliullahdehlawi"],
};

/** Words that only say "a collection" or "narrated by", dropped before the name is matched. */
const NOISE = /\b(hr|h\.r|riwayat|diriwayatkan|oleh|narrated|by|sahih|shahih|sohih|sunan|jami|jamiat|imam|al|an|at|as|ad|kitab|no|nomor|number|hadis|hadits|hadith)\b/g;

const LETTERS = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** The book a name means, or null. */
export function bookFromName(name: string): BookId | null {
  const key = LETTERS(name).replace(/['’`.-]/g, " ").replace(NOISE, " ").replace(/[^a-z]/g, "");
  if (!key) return null;
  for (const [book, names] of Object.entries(NAMES) as [BookId, string[]][]) {
    if (names.includes(key)) return book;
  }
  return null;
}

/**
 * The book and number of a typed reference, or null when the input is not one. `book` is the filter on the search page:
 * with it, a bare number ("349") is a reference in that book.
 */
export function parseReference(input: string, book?: BookId): { book: BookId; number: string } | null {
  const match = /^(.*?)[\s:#]*(\d{1,5}(?:\.\d{1,3})?)\s*$/.exec(input.trim());
  if (!match) return null;
  const [, name, number] = match;
  if (!isHadithNumber(number)) return null;
  if (!name.replace(/[\s.:#,]/g, "")) return book ? { book, number } : null;
  const named = bookFromName(name);
  return named ? { book: named, number } : null;
}

/** Whether the input is only a number (a reference with no book): the page then offers the number in every book. */
export const isBareNumber = (input: string): boolean => /^\s*\d{1,5}(\.\d{1,3})?\s*$/.test(input) && isHadithNumber(input.trim());
