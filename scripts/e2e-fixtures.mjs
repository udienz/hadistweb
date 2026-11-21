#!/usr/bin/env node
// Copy the small part of the data that the browser tests (e2e/) read into e2e/fixtures, so CI needs no network.
// Run it again when a test needs more, and commit the result.
//
//   node scripts/e2e-fixtures.mjs [/srv/hadith-mirror/hadith-api]
//
// From our mirror of fawazahmed0/hadith-api: Bukhari chapters 1 and 2 and Tirmidhi chapter 30 (Arabic, Indonesian,
// English), an-Nawawi
// (Arabic, English), and info.min.json reduced to those hadiths. From the live HadeethEnc API: the category list, one
// page of one category, and the hadiths the tests open, saved under the request path (see e2e/hadeethenc-fake.mjs).

import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const MIRROR = process.argv[2] ?? "/srv/hadith-mirror/hadith-api";
const OUT = new URL("../e2e/fixtures/", import.meta.url).pathname;
const BOOKS = {
  bukhari: { chapters: [1, 2], editions: ["ara", "ind", "eng"] },
  nawawi: { chapters: [1], editions: ["ara", "eng"] },
  // A small chapter with sahih, hasan and weak hadiths (Al-Albani), for the grade filter.
  tirmidhi: { chapters: [30], editions: ["ara", "ind", "eng"] },
};
const ENC = "https://hadeethenc.com/api/v1";
const ENC_PATHS = [
  "/categories/list/?language=id",
  "/categories/list/?language=en",
  "/hadeeths/list/?language=id&category_id=59&page=1&per_page=20",
  "/hadeeths/one/?language=id&id=66512",
  "/hadeeths/one/?language=en&id=66512",
  // an-Nawawi 1 and 2 in Indonesian (hadeethenc-pairs.json).
  "/hadeeths/one/?language=id&id=66511",
  "/hadeeths/one/?language=id&id=4563",
];

/** The file a request path is stored in; e2e/hadeethenc-fake.mjs uses the same rule. */
export const encFile = (path) => `${path.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "")}.json`;

async function main() {
  await rm(OUT, { recursive: true, force: true });
  const out = join(OUT, "hadith-api");

  const info = JSON.parse(await readFile(join(MIRROR, "info.min.json"), "utf8"));
  const slim = {};
  for (const [book, { chapters, editions }] of Object.entries(BOOKS)) {
    const keep = new Set(chapters);
    slim[book] = {
      metadata: {
        ...info[book].metadata,
        sections: Object.fromEntries(Object.entries(info[book].metadata.sections).filter(([n]) => keep.has(Number(n)))),
      },
      hadiths: info[book].hadiths.filter((h) => keep.has(h.reference?.book ?? 0)),
    };
    for (const edition of editions) {
      for (const chapter of chapters) {
        const rel = `editions/${edition}-${book}/sections/${chapter}.min.json`;
        await mkdir(dirname(join(out, rel)), { recursive: true });
        await copyFile(join(MIRROR, rel), join(out, rel));
      }
    }
  }
  await writeFile(join(out, "info.min.json"), JSON.stringify(slim));

  const enc = join(OUT, "hadeethenc");
  await mkdir(enc, { recursive: true });
  for (const path of ENC_PATHS) {
    const res = await fetch(`${ENC}${path}`, { headers: { "User-Agent": "hadistweb-e2e-fixtures" } });
    if (!res.ok) throw new Error(`${path}: status ${res.status}`);
    await writeFile(join(enc, encFile(path)), JSON.stringify(await res.json()));
  }
  console.log(`fixtures written to ${OUT}`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
