// Reads the books from fawazahmed0/hadith-api (or our mirror of it, which has the same layout) and maps them to the
// shapes in types.ts.
//
// Every hadith is read from its chapter file (`editions/{edition}/sections/{n}`): numbers with a decimal part ("402.2")
// have no single-hadith file, and one path for all keeps it simple. `info.min.json` (6.4 MB) is read once per process
// and reduced to the chapter list and a number -> chapter map per book.

import { bookById, EDITION_PREFIX, pickTranslation, translationOrder } from "./books";
import { hadeethencIndonesian } from "./hadeethenc-translation";
import { Memo } from "../memo";
import { loadJson } from "./transport";
import type { BookId, Chapter, Grade, Hadith, Translation, TranslationLanguage } from "./types";

export const DEFAULT_FAWAZ_URL = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1";

interface RawHadith {
  hadithnumber: number | string;
  arabicnumber?: number | string;
  text?: string;
  grades?: { name?: string; grade?: string }[];
  reference?: { book?: number; hadith?: number };
}
interface RawSection {
  hadiths: RawHadith[];
}
interface RawInfo {
  [book: string]: {
    metadata: { sections: Record<string, string> };
    hadiths: { hadithnumber: number | string; reference?: { book?: number } }[];
  };
}

/** Per book and chapter: how many hadith numbers have a text in some edition (our mirror only). */
type RawCounts = Record<string, Record<string, number>>;

interface BookIndex {
  chapters: Chapter[];
  chapterOf: Map<string, number>;
}

const numberKey = (n: number | string): string => String(n);

export interface HadithService {
  getChapters(book: BookId): Promise<Chapter[]>;
  /** All hadiths of a chapter, in the source's order, or null for a chapter that does not exist. */
  getChapter(book: BookId, chapter: number, locale: string): Promise<{ chapter: Chapter; hadiths: Hadith[] } | null>;
  /** One hadith, or null when the book has no such number. */
  getHadith(book: BookId, number: string, locale: string): Promise<Hadith | null>;
  /** Whether the index knows this chapter or hadith number (cheap: no chapter file is read). */
  exists(book: BookId, target: { chapter: number } | { hadith: string }): Promise<boolean>;
}

/**
 * A translation from another source for one hadith, or null. Used for the Indonesian an-Nawawi from HadeethEnc
 * (getHadithService wires it); it must not throw for a missing hadith, only for a source that is down.
 */
export type ExtraTranslation = (book: BookId, number: string, locale: string) => Promise<Translation | null>;

export function createHadithService(baseUrl: string, extra?: ExtraTranslation): HadithService {
  const base = baseUrl.replace(/\/+$/, "");
  const sections = new Memo<RawSection>(64);
  let index: Promise<Map<string, BookIndex>> | null = null;

  /** `.min.json` first, the pretty `.json` as a fallback (the source recommends trying both). */
  async function loadFile(path: string): Promise<unknown> {
    try {
      return await loadJson(`${base}/${path}.min.json`);
    } catch (first) {
      try {
        return await loadJson(`${base}/${path}.json`);
      } catch {
        throw first;
      }
    }
  }

  function loadIndex(): Promise<Map<string, BookIndex>> {
    if (!index) {
      // hadistweb-counts is written by scripts/sync-mirror.mjs; the source itself has no such file, so without our mirror
      // the counts from info.min.json are used.
      const counts = (loadFile("hadistweb-counts") as Promise<RawCounts>).catch(() => undefined);
      index = Promise.all([loadFile("info") as Promise<RawInfo>, counts]).then(([info, c]) => buildIndex(info, c));
      index.catch(() => (index = null));
    }
    return index;
  }

  function loadSection(edition: string, chapter: number): Promise<RawSection> {
    const key = `${edition}/${chapter}`;
    return sections.get(key, () => loadFile(`editions/${edition}/sections/${chapter}`) as Promise<RawSection>);
  }

  async function chapterHadiths(book: BookId, chapter: number, locale: string): Promise<Hadith[]> {
    const order = translationOrder(bookById(book), locale);
    const [arabic, ...translations] = await Promise.all([
      loadSection(`${EDITION_PREFIX.ar}-${book}`, chapter),
      ...order.map((language) => loadSection(`${EDITION_PREFIX[language]}-${book}`, chapter)),
    ]);
    const texts = order.map((language, i) => ({
      language,
      byNumber: new Map(translations[i].hadiths.map((h) => [numberKey(h.hadithnumber), h.text ?? ""])),
    }));

    const hadiths = arabic.hadiths
      .map((raw): Hadith => {
        const number = numberKey(raw.hadithnumber);
        const found: Partial<Record<TranslationLanguage, string>> = {};
        for (const { language, byNumber } of texts) found[language] = byNumber.get(number);
        return {
          number,
          arabicNumber: raw.arabicnumber === undefined ? "" : numberKey(raw.arabicnumber),
          chapter,
          arabic: (raw.text ?? "").trim(),
          translation: pickTranslation(order, found),
          grades: toGrades(raw.grades),
        };
      })
      .filter((h) => h.arabic || h.translation);
    if (!extra) return hadiths;

    // A translation from another source wins over a fallback in the other language, not over one in the reader's own.
    // If that source is down, the hadith keeps what it had.
    return Promise.all(
      hadiths.map(async (h) => {
        if (h.translation?.language === (locale === "en" ? "en" : "id")) return h;
        const found = await extra(book, h.number, locale).catch(() => null);
        return found ? { ...h, translation: found } : h;
      }),
    );
  }

  return {
    async getChapters(book) {
      return (await loadIndex()).get(book)?.chapters ?? [];
    },

    async getChapter(book, number, locale) {
      const chapter = (await loadIndex()).get(book)?.chapters.find((c) => c.number === number);
      if (!chapter) return null;
      return { chapter, hadiths: await chapterHadiths(book, number, locale) };
    },

    async getHadith(book, number, locale) {
      const chapter = (await loadIndex()).get(book)?.chapterOf.get(number);
      if (chapter === undefined) return null;
      const hadiths = await chapterHadiths(book, chapter, locale);
      return hadiths.find((h) => h.number === number) ?? null;
    },

    async exists(book, target) {
      const entry = (await loadIndex()).get(book);
      if (!entry) return false;
      return "chapter" in target
        ? entry.chapters.some((c) => c.number === target.chapter)
        : entry.chapterOf.has(target.hadith);
    },
  };
}

function toGrades(raw: RawHadith["grades"]): Grade[] {
  return (raw ?? [])
    .filter((g) => g.name?.trim() && g.grade?.trim())
    .map((g) => ({ grader: g.name!.trim(), grade: g.grade!.trim() }));
}

/**
 * The chapter list of every book (only chapters that have hadiths) and where each hadith number is. With `counts`, a
 * chapter's count is the number of hadiths that have a text, as its page shows them; without, every number counts.
 */
export function buildIndex(info: RawInfo, counts?: RawCounts): Map<string, BookIndex> {
  const result = new Map<string, BookIndex>();
  for (const [book, { metadata, hadiths }] of Object.entries(info)) {
    const numbers = new Map<number, number>();
    const chapterOf = new Map<string, number>();
    let unplacedFirst = false;
    for (const h of hadiths) {
      const chapter = h.reference?.book ?? 0;
      numbers.set(chapter, (numbers.get(chapter) ?? 0) + 1);
      chapterOf.set(numberKey(h.hadithnumber), chapter);
      if (chapter === 0 && Number(h.hadithnumber) === 1) unplacedFirst = true;
    }
    // Chapter 0 holds what the source puts in no chapter. Where it starts the book (the introductions of Muslim and
    // Ibn Majah begin at hadith 1) it comes first; otherwise (scattered hadiths, as in Bukhari) it comes last.
    const rank = (n: number) => (n === 0 ? (unplacedFirst ? -1 : Number.MAX_SAFE_INTEGER) : n);
    const chapters = Object.entries(metadata.sections)
      .map(([n, name]) => ({
        number: Number(n),
        name: name.trim(),
        count: counts?.[book] ? (counts[book][n] ?? 0) : (numbers.get(Number(n)) ?? 0),
      }))
      .filter((c) => Number.isInteger(c.number) && c.count > 0)
      .sort((a, b) => rank(a.number) - rank(b.number));
    result.set(book, { chapters, chapterOf });
  }
  return result;
}

let service: HadithService | null = null;

/**
 * The service for this process, reading from HADITH_FAWAZ_URL (our mirror) or the source on GitHub, with the Indonesian
 * an-Nawawi from HadeethEnc.
 */
export function getHadithService(): HadithService {
  service ??= createHadithService(process.env.HADITH_FAWAZ_URL?.trim() || DEFAULT_FAWAZ_URL, hadeethencIndonesian);
  return service;
}
