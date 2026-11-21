#!/usr/bin/env node
// Build the full-text search index of the site from a copy of fawazahmed0/hadith-api (our mirror, or the e2e fixtures).
//
//   node scripts/build-search-index.mjs <dir>
//
// Reads <dir>/editions/{ara,ind,eng}-<book>/sections/*.json and writes <dir>/hadistweb-search.sqlite with two SQLite FTS5
// tables, one row per hadith in each (the same rowid): `hadith` holds the Indonesian and English texts, split into
// words; `arabic` the Arabic text, split into trigrams, because Arabic attaches prepositions and the article to the
// word (بالنيات): a word search for النيات would not find it, a trigram search does. Only the mirrored editions are indexed; the other
// translations are read live from the source and are not searchable. The Arabic text is stored without its vowel marks
// and with one form of each letter (normalizeArabic), so a search without harakat finds it; the app normalizes the query
// the same way (src/lib/hadith/search.ts, which has a test that the two agree).
//
// The index is written next to the old one and renamed over it, so a running app never reads a half-written file.
// sync-mirror.mjs calls buildSearchIndex() before it swaps a new mirror in. Uses node:sqlite (Node.js 24 or later).

import { readdir, readFile, rename, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { DatabaseSync } from "node:sqlite";

export const SEARCH_FILE = "hadistweb-search.sqlite";
const LANGUAGES = { ara: "ar", ind: "id", eng: "en" };

/** Arabic text as it is indexed and searched: no vowel marks or tatweel, one form of alif, ya and ta marbuta. */
export function normalizeArabic(text) {
  return text
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ‎‏]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

// The grade a hadith is filtered by: the same rules as src/lib/hadith/grade.ts (a test checks that they agree).
const GRADER = { abudawud: "Al-Albani", tirmidhi: "Al-Albani", nasai: "Al-Albani", ibnmajah: "Al-Albani", malik: "Salim al-Hilali" };
const SAHIH_BOOKS = new Set(["bukhari", "muslim"]);
const WEAK = /\b(?:daif|da'if|very daif|munkar|shadh|mawdu|maudu|batil)\b/i;

export function gradeLevel(text) {
  if (WEAK.test(text)) return "daif";
  if (/\bsahih\b/i.test(text)) return "sahih";
  if (/\bhasan\b/i.test(text)) return "hasan";
  return null;
}

function hadithGrade(book, grades) {
  if (SAHIH_BOOKS.has(book)) return "sahih";
  const grade = (grades ?? []).find((g) => g.name?.trim() === GRADER[book]);
  return grade ? gradeLevel(grade.grade ?? "") : null;
}

// Narrators, from the [brackets] the Indonesian translation puts around their names (the same rules as
// src/lib/hadith/narrators.ts, which has a test that the two agree).
const HONORIFICS = /(?<![a-z])'?(?:radliallahu|radhiallahu|radhiyallahu|radiyallahu|rahimahullah|rahimahumallah|shallallahu|anhu(?:ma|m)?|anha|alaihi|wasallam|alaihis|salam)(?![a-z])/gi;
const NOT_A_NAME_FIRST = new Set(["seorang", "seseorang", "beberapa", "sebagian", "orang", "salah", "para", "dia", "beliau", "mereka", "kami", "aku", "saya"]);

/** The key a narrator's name is counted under, or null for what is not a name (bapaknya, ayahku, seorang laki-laki). */
export function narratorKey(name) {
  const key = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(HONORIFICS, " ")
    .toLowerCase()
    .replace(/[^a-z ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (key.length < 2) return null;
  const words = key.split(" ");
  if (words.length === 1 && /(?:nya|ku)$/.test(key)) return null;
  if (NOT_A_NAME_FIRST.has(words[0])) return null;
  return key;
}

/** The name as shown: the source's spelling without the honorifics and the brackets' stray punctuation. */
function narratorDisplay(name) {
  return name.replace(HONORIFICS, " ").replace(/\s+/g, " ").replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, "").trim();
}

async function readSection(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/** Collect every hadith of every book: book -> number -> { chapter, ar, id, en }. */
async function collect(dir) {
  const books = new Map();
  for (const edition of (await readdir(join(dir, "editions"))).sort()) {
    const [prefix, book] = edition.split("-");
    const language = LANGUAGES[prefix];
    if (!language || !book) continue;
    const sectionsDir = join(dir, "editions", edition, "sections");
    let files;
    try {
      files = await readdir(sectionsDir);
    } catch {
      continue;
    }
    // One file per chapter; prefer the .min.json when both exist.
    const chapters = new Map();
    for (const file of files) {
      const match = /^(\d+)\.(min\.)?json$/.exec(file);
      if (match && (!chapters.has(match[1]) || match[2])) chapters.set(match[1], file);
    }
    const hadiths = books.get(book) ?? new Map();
    books.set(book, hadiths);
    for (const [chapter, file] of chapters) {
      const section = await readSection(join(sectionsDir, file));
      for (const h of section?.hadiths ?? []) {
        const text = (h.text ?? "").trim();
        if (!text) continue;
        const number = String(h.hadithnumber);
        const entry = hadiths.get(number) ?? { chapter: Number(chapter), ar: "", id: "", en: "", grade: null, narrators: [] };
        entry[language] = language === "ar" ? normalizeArabic(text) : text;
        if (language === "ar") entry.grade = hadithGrade(book, h.grades);
        if (language === "id") entry.narrators = [...text.matchAll(/\[([^\]\n]{1,120})\]/g)].map((m) => m[1]);
        hadiths.set(number, entry);
      }
    }
  }
  return books;
}

/** Write <dir>/hadistweb-search.sqlite. Returns the number of hadiths indexed. */
export async function buildSearchIndex(dir) {
  const target = join(dir, SEARCH_FILE);
  const next = `${target}.new`;
  await rm(next, { force: true });
  const books = await collect(dir);

  const db = new DatabaseSync(next);
  db.exec(`CREATE VIRTUAL TABLE hadith USING fts5(
    book UNINDEXED, number UNINDEXED, chapter UNINDEXED, grade UNINDEXED, id, en,
    tokenize = 'unicode61 remove_diacritics 2'
  )`);
  db.exec(`CREATE VIRTUAL TABLE arabic USING fts5(ar, tokenize = 'trigram')`);
  const insert = db.prepare("INSERT INTO hadith (rowid, book, number, chapter, grade, id, en) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertArabic = db.prepare("INSERT INTO arabic (rowid, ar) VALUES (?, ?)");
  let rows = 0;
  db.exec("BEGIN");
  for (const [book, hadiths] of books) {
    for (const [number, h] of hadiths) {
      rows++;
      insert.run(rows, book, number, h.chapter, h.grade, h.id, h.en);
      insertArabic.run(rows, h.ar);
    }
  }
  db.exec("COMMIT");

  // Narrators: each name once per hadith, under its key, shown in its most frequent spelling.
  db.exec("CREATE TABLE narrator_hadith (key TEXT NOT NULL, book TEXT NOT NULL, number TEXT NOT NULL, position INTEGER NOT NULL)");
  db.exec("CREATE TABLE narrator (key TEXT PRIMARY KEY, name TEXT NOT NULL, count INTEGER NOT NULL)");
  const insertLink = db.prepare("INSERT INTO narrator_hadith (key, book, number, position) VALUES (?, ?, ?, ?)");
  const spellings = new Map();
  const counts = new Map();
  // Positions follow the site's order of books (src/lib/hadith/books.ts) and the hadith numbers, so a narrator's list
  // reads like the books.
  const ORDER = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "malik", "nawawi", "qudsi", "dehlawi"];
  const ordered = [...books].sort((a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]));
  let position = 0;
  db.exec("BEGIN");
  for (const [book, hadiths] of ordered) {
    for (const [number, h] of [...hadiths].sort((a, b) => Number(a[0]) - Number(b[0]))) {
      position++;
      const seen = new Set();
      for (const raw of h.narrators ?? []) {
        const key = narratorKey(raw);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        insertLink.run(key, book, number, position);
        counts.set(key, (counts.get(key) ?? 0) + 1);
        const forms = spellings.get(key) ?? new Map();
        const shown = narratorDisplay(raw);
        forms.set(shown, (forms.get(shown) ?? 0) + 1);
        spellings.set(key, forms);
      }
    }
  }
  const insertNarrator = db.prepare("INSERT INTO narrator (key, name, count) VALUES (?, ?, ?)");
  for (const [key, count] of counts) {
    const [name] = [...spellings.get(key)].sort((a, b) => b[1] - a[1])[0];
    insertNarrator.run(key, name, count);
  }
  db.exec("COMMIT");
  db.exec("CREATE INDEX narrator_hadith_key ON narrator_hadith (key, position)");
  db.exec("CREATE INDEX narrator_count ON narrator (count DESC)");
  db.exec("INSERT INTO hadith(hadith) VALUES ('optimize')");
  db.exec("INSERT INTO arabic(arabic) VALUES ('optimize')");
  db.close();
  await rename(next, target);
  return rows;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const dir = process.argv[2];
  if (!dir) {
    console.error("usage: node scripts/build-search-index.mjs <dir>");
    process.exit(2);
  }
  const rows = await buildSearchIndex(resolve(dir));
  console.log(`indexed ${rows} hadiths into ${join(resolve(dir), SEARCH_FILE)}`);
}
