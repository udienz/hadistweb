// Full-text search over the Arabic, Indonesian and English texts of the books, from the SQLite FTS5 index that
// scripts/build-search-index.mjs writes into our mirror (hadistweb-search.sqlite). Server only.
//
// The index exists only where the data is a local folder (our mirror, or the e2e fixtures): with the data read from
// GitHub there is nothing to search, and the page says so. A missing file is looked for again on the next search, so an
// index built after the app started is picked up without a restart.

import { existsSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { isRemote, toFilePath } from "./transport";
import type { GradeFilter } from "./grade";
import { narratorKey } from "./narrators";
import { isBookId, type BookId } from "./types";

export const SEARCH_FILE = "hadistweb-search.sqlite";
export const SEARCH_PAGE_SIZE = 20;
/** Start and end of a match in a snippet: control characters, which the texts never contain (they do contain brackets). */
export const MARK_START = "\u0001";
export const MARK_END = "\u0002";

export type SnippetLanguage = "ar" | "id" | "en";

export interface SearchHit {
  book: BookId;
  number: string;
  chapter: number;
  language: SnippetLanguage;
  /** The text around the match, with each match between MARK_START and MARK_END. */
  snippet: string;
}

export interface SearchResult {
  total: number;
  hits: SearchHit[];
}

/** Arabic text as it is indexed: the same as normalizeArabic in scripts/build-search-index.mjs (a test checks it). */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ‎‏]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

const ARABIC = /[؀-ۿ]/;

/**
 * Spellings that mean the same word: a search for one finds the others. Indonesian writes many words from Arabic in
 * several ways (shalat, sholat, salat), and the translations do not agree with each other or with the reader.
 */
const VARIANTS: string[][] = [
  ["shalat", "sholat", "salat", "solat"],
  ["ramadhan", "ramadan", "romadhon"],
  ["wudhu", "wudu", "wudlu"],
  ["dzikir", "zikir", "dhikr"],
  ["sedekah", "shadaqah", "sadaqah", "sodaqoh"],
  ["haji", "hajj"],
  ["shalawat", "sholawat", "salawat"],
  ["subuh", "shubuh", "fajr"],
  ["maghrib", "magrib"],
  ["dzuhur", "zuhur", "dhuhr", "zuhr"],
  ["ashar", "asar", "asr"],
  ["isya", "isyak", "isha"],
  ["quran", "qur'an", "alquran"],
];
const VARIANT_OF = new Map(VARIANTS.flatMap((group) => group.map((word) => [word, group] as const)));

/** A query for one of the two tables of the index: words in the translations, or trigrams in the Arabic text. */
export type Query = { table: "hadith"; match: string } | { table: "arabic"; match: string };

/** Characters with a meaning in FTS5 query syntax, dropped from what the reader typed so no input is a syntax error. */
const SYNTAX = /["*^():{}+\-,.;!?[\]<>=|\\/`~@#$%&،؛؟]/g;

/**
 * An FTS5 query from what the reader typed, or null when nothing searchable is left. With Arabic letters in it, the
 * Arabic words (normalized like the index, at least three letters for the trigram table) are searched in the Arabic
 * text, each anywhere in a word (النيات finds بالنيات). Otherwise every word must appear in the Indonesian or English
 * text as the start of a word ("niat" finds "niatnya"), with spelling variants as alternatives.
 */
export function buildQuery(input: string): Query | null {
  const words = input
    .normalize("NFC")
    .split(/\s+/)
    .map((w) => w.replace(SYNTAX, ""))
    .filter((w) => w.length > 0)
    .slice(0, 12);
  const arabic = words.filter((w) => ARABIC.test(w)).map(normalizeArabic).filter((w) => w.length >= 3);
  if (words.some((w) => ARABIC.test(w))) {
    return arabic.length ? { table: "arabic", match: arabic.map((w) => `"${w}"`).join(" AND ") } : null;
  }
  if (words.length === 0) return null;
  const term = (x: string) => `"${x.replace(/'/g, " ")}"*`;
  const match = words
    .map((w) => w.toLowerCase())
    .map((w) => {
      const group = VARIANT_OF.get(w);
      return group ? `(${group.map(term).join(" OR ")})` : term(w);
    })
    .join(" AND ");
  return { table: "hadith", match };
}

/** Which translation's snippet to show first: the reader's, then English (Indonesian first for Indonesian readers). */
export function snippetOrder(locale: string): ("id" | "en")[] {
  return locale === "id" ? ["id", "en"] : ["en", "id"];
}

interface Row {
  book: string;
  number: string;
  chapter: number;
  ar?: string;
  id?: string;
  en?: string;
}

export interface Narrator {
  key: string;
  name: string;
  count: number;
}

export interface NarratorIndex {
  /** The narrators with the most hadiths. */
  top(limit: number): Narrator[];
  /** Narrators whose name contains the words typed, most hadiths first. */
  find(query: string, limit: number): Narrator[];
  get(key: string): Narrator | null;
  /** A page of the hadiths a narrator is in, in the books' order. */
  hadiths(key: string, page: number, size: number): { book: BookId; number: string }[];
}

export interface Searcher {
  /** Whether there is an index to search. */
  available(): boolean;
  search(input: string, options: { book?: BookId; page: number; locale: string; grade?: GradeFilter | null }): SearchResult;
  /** The narrators index (lib/hadith/narrators.ts), or null when the index has none (built before it existed). */
  narrators(): NarratorIndex | null;
  /** The hadith numbers of a book that have a text, in numeric order, or null without an index (for the sitemap). */
  numbers(book: BookId): string[] | null;
}

export function createSearcher(file: string | null): Searcher {
  let db: DatabaseSync | null = null;
  /** The columns of the `hadith` table, read from the index: an index built before the grade column has none. */
  let columns: string[] = [];

  function open(): DatabaseSync | null {
    if (db) return db;
    if (!file || !existsSync(file)) return null;
    db = new DatabaseSync(file, { readOnly: true });
    columns = (db.prepare("PRAGMA table_info(hadith)").all() as { name: string }[]).map((c) => c.name);
    return db;
  }

  return {
    available: () => open() !== null,

    narrators() {
      const database = open();
      if (!database) return null;
      const has = database.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'narrator'").get();
      if (!has) return null;
      const list = (sql: string, ...params: (string | number)[]) => database.prepare(sql).all(...params) as unknown as Narrator[];
      return {
        top: (limit) => list("SELECT key, name, count FROM narrator ORDER BY count DESC, key LIMIT ?", limit),
        find: (query, limit) => {
          const key = narratorKey(query);
          if (!key) return [];
          // Each word typed must be in the name, in any place ("hurairah" finds "abu hurairah").
          const words = key.split(" ");
          return list(
            `SELECT key, name, count FROM narrator WHERE ${words.map(() => "key LIKE ?").join(" AND ")} ORDER BY count DESC, key LIMIT ?`,
            ...words.map((w) => `%${w}%`),
            limit,
          );
        },
        get: (key) => (database.prepare("SELECT key, name, count FROM narrator WHERE key = ?").get(key) as Narrator | undefined) ?? null,
        hadiths: (key, page, size) =>
          (database
            .prepare("SELECT book, number FROM narrator_hadith WHERE key = ? ORDER BY position LIMIT ? OFFSET ?")
            .all(key, size, (page - 1) * size) as { book: string; number: string }[])
            .filter((r): r is { book: BookId; number: string } => isBookId(r.book)),
      };
    },

    numbers(book) {
      const database = open();
      if (!database) return null;
      const rows = database.prepare("SELECT number FROM hadith WHERE book = ? ORDER BY CAST(number AS REAL)").all(book) as { number: string }[];
      return rows.map((r) => String(r.number));
    },

    search(input, { book, page, locale, grade }) {
      const query = buildQuery(input);
      const database = open();
      if (!query || !database) return { total: 0, hits: [] };
      // A snippet's length is counted in tokens: words in `hadith`, trigrams (about a third of a word) in `arabic`.
      const snip = (table: string, column: number) =>
        `snippet(${table}, ${column}, '${MARK_START}', '${MARK_END}', '…', ${table === "arabic" ? 64 : 24})`;
      // Both tables share the rowid; the book, number and chapter are in `hadith`.
      const from =
        query.table === "arabic"
          ? `arabic JOIN hadith ON hadith.rowid = arabic.rowid WHERE arabic MATCH ?`
          : `hadith WHERE hadith MATCH ?`;
      // The grade filter needs the grade column; an older index searches without it rather than failing.
      const levels = grade && columns.includes("grade") ? (grade === "sahih" ? ["sahih"] : ["sahih", "hasan"]) : [];
      const where = `${from}${book ? " AND hadith.book = ?" : ""}${levels.length ? ` AND hadith.grade IN (${levels.map(() => "?").join(", ")})` : ""}`;
      const params = [query.match, ...(book ? [book] : []), ...levels];
      const { total } = database.prepare(`SELECT count(*) AS total FROM ${where}`).get(...params) as { total: number };
      const selected =
        query.table === "arabic"
          ? `${snip("arabic", 0)} AS ar`
          : `${snip("hadith", columns.indexOf("id"))} AS id, ${snip("hadith", columns.indexOf("en"))} AS en`;
      const rows = database
        .prepare(
          `SELECT hadith.book AS book, hadith.number AS number, hadith.chapter AS chapter, ${selected}
           FROM ${where} ORDER BY bm25(${query.table}) LIMIT ? OFFSET ?`,
        )
        .all(...params, SEARCH_PAGE_SIZE, (page - 1) * SEARCH_PAGE_SIZE) as unknown as Row[];
      const order = snippetOrder(locale);
      const hits = rows
        .filter((r) => isBookId(r.book))
        .map((r): SearchHit => {
          const base = { book: r.book as BookId, number: String(r.number), chapter: Number(r.chapter) };
          if (query.table === "arabic") return { ...base, language: "ar", snippet: r.ar ?? "" };
          const language = order.find((l) => r[l]?.includes(MARK_START)) ?? order.find((l) => r[l]) ?? order[0];
          return { ...base, language, snippet: r[language] ?? "" };
        });
      return { total, hits };
    },
  };
}

let searcher: Searcher | null = null;

/** The search over our mirror (HADITH_FAWAZ_URL when it is a folder); HADITH_SEARCH_DB overrides the file. */
export function getSearcher(): Searcher {
  if (!searcher) {
    const data = process.env.HADITH_FAWAZ_URL?.trim();
    const file = process.env.HADITH_SEARCH_DB?.trim() || (data && !isRemote(data) ? join(toFilePath(data), SEARCH_FILE) : null);
    searcher = createSearcher(file);
  }
  return searcher;
}

/** The parts of a snippet, for rendering: plain text and matches in turn. */
export function snippetParts(snippet: string): { text: string; match: boolean }[] {
  const parts: { text: string; match: boolean }[] = [];
  for (const piece of snippet.split(MARK_START)) {
    const end = piece.indexOf(MARK_END);
    if (end === -1) {
      if (piece) parts.push({ text: piece, match: false });
    } else {
      if (end > 0) parts.push({ text: piece.slice(0, end), match: true });
      if (end + 1 < piece.length) parts.push({ text: piece.slice(end + 1), match: false });
    }
  }
  return parts;
}
