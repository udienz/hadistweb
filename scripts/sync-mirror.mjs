#!/usr/bin/env node
// Build our mirror of fawazahmed0/hadith-api: only what the app reads, in the source's own layout.
//
//   node scripts/sync-mirror.mjs <dir>
//
// Writes <dir>/info.min.json and <dir>/editions/<edition>/sections/<n>.min.json for the Arabic, Indonesian and English
// editions of the ten books, and <dir>/hadistweb-counts.min.json: per book and chapter, how many hadith numbers have a
// text in at least one of those editions (the app shows a number only then; info.min.json counts every number) (27 editions, about 100 MB). The source repository is 1.65 GB and jsDelivr refuses it (over
// its 150 MB limit), so the whole edition files are downloaded from raw GitHub and split into chapters here. Checked
// 2026-11-20: a chapter split this way is identical to the source's own sections file (Abu Dawud 1, 390 hadiths).
//
// The new copy is built next to the old one and swapped in at the end, so the running app never reads a half-written
// mirror. Point the app to it with HADITH_FAWAZ_URL=<dir>. In Docker, mount the PARENT of <dir> (deploy.sh mounts
// /srv/hadith-mirror and reads /data/hadith-api): a bind mount of <dir> itself would keep showing the old, deleted
// directory after the swap. The app caches what it read, so restart it (or deploy) after a sync.

import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const SOURCE = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1";
// Keep in step with src/lib/hadith/books.ts.
const BOOKS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "malik", "nawawi", "qudsi", "dehlawi"];
const ENGLISH_ONLY = new Set(["nawawi", "qudsi", "dehlawi"]);

async function get(path) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(`${SOURCE}/${path}`, { headers: { "User-Agent": "hadistweb-mirror" } });
      if (!res.ok) throw new Error(`${path}: status ${res.status}`);
      return await res.json();
    } catch (error) {
      if (attempt >= 4) throw error;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("usage: node scripts/sync-mirror.mjs <dir>");
    process.exit(2);
  }
  const dir = resolve(target);
  const next = `${dir}.new`;
  await rm(next, { recursive: true, force: true });
  await mkdir(next, { recursive: true });

  const info = await get("info.min.json");
  await writeFile(join(next, "info.min.json"), JSON.stringify(info));

  let files = 0;
  const counts = {};
  for (const book of BOOKS) {
    const withText = new Map(); // number -> chapter, for numbers with a text in some edition
    const languages = ENGLISH_ONLY.has(book) ? ["ara", "eng"] : ["ara", "ind", "eng"];
    for (const language of languages) {
      const edition = `${language}-${book}`;
      const full = await get(`editions/${edition}.min.json`);
      const byChapter = new Map();
      for (const hadith of full.hadiths) {
        const chapter = hadith.reference?.book ?? 0;
        if (String(hadith.text ?? "").trim()) withText.set(String(hadith.hadithnumber), chapter);
        if (!byChapter.has(chapter)) byChapter.set(chapter, []);
        byChapter.get(chapter).push(hadith);
      }
      const sectionsDir = join(next, "editions", edition, "sections");
      await mkdir(sectionsDir, { recursive: true });
      for (const [chapter, hadiths] of byChapter) {
        const metadata = {
          name: full.metadata.name,
          section: { [chapter]: full.metadata.sections?.[chapter] ?? "" },
          section_detail: { [chapter]: full.metadata.section_details?.[chapter] ?? {} },
        };
        await writeFile(join(sectionsDir, `${chapter}.min.json`), JSON.stringify({ metadata, hadiths }));
        files++;
      }
      console.log(`${edition}: ${full.hadiths.length} hadiths, ${byChapter.size} chapters`);
    }
    counts[book] = {};
    for (const chapter of withText.values()) counts[book][chapter] = (counts[book][chapter] ?? 0) + 1;
  }
  await writeFile(join(next, "hadistweb-counts.min.json"), JSON.stringify(counts));

  // Swap in the new copy.
  const old = `${dir}.old`;
  await rm(old, { recursive: true, force: true });
  await rename(dir, old).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  await rename(next, dir);
  await rm(old, { recursive: true, force: true });
  console.log(`mirror ready in ${dir}: ${files} chapter files`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
