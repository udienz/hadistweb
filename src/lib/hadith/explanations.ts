// Which HadeethEnc entry explains a book hadith, so its card can link to the explanation (and the topic page back to
// the books). Matched by the Arabic text, offline, by scripts in the workspace repository (project/hadistweb/scripts:
// match_books_hadeethenc.py and pick_book_pairs.py, the method and the check by hand in its ROADMAP.md):
// - hadeethenc-explanations.json: Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah and Malik (2026-11-22; 2,297
//   hadiths, 39 random pairs checked by hand, all right);
// - hadeethenc-pairs.json: an-Nawawi and the Qudsi hadiths, whose translations also come from HadeethEnc.
// A book hadith links to one entry; one entry may be the same hadith in several books or chapters.

import explanations from "./hadeethenc-explanations.json";
import pairs from "./hadeethenc-pairs.json";
import { isBookId, type BookId } from "./types";

type Pairs = Record<string, Record<string, number>>;
const SOURCES: Pairs[] = [explanations as Pairs, pairs as Pairs];

/** The HadeethEnc id that explains this hadith, if one was matched. */
export function explanationId(book: string, number: string): number | undefined {
  for (const source of SOURCES) {
    const id = source[book]?.[number];
    if (id !== undefined) return id;
  }
  return undefined;
}

let reverse: Map<number, { book: BookId; number: string }[]> | null = null;

/** The book hadiths a HadeethEnc entry explains, in the books' order. */
export function hadithsExplainedBy(id: number): { book: BookId; number: string }[] {
  if (!reverse) {
    reverse = new Map();
    for (const source of SOURCES) {
      for (const [book, numbers] of Object.entries(source)) {
        if (!isBookId(book)) continue;
        for (const [number, enc] of Object.entries(numbers)) {
          const list = reverse.get(enc) ?? [];
          if (!list.some((h) => h.book === book && h.number === number)) list.push({ book, number });
          reverse.set(enc, list);
        }
      }
    }
  }
  return reverse.get(id) ?? [];
}
