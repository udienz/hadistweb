import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildSearchIndex, normalizeArabic as scriptNormalize } from "../../../scripts/build-search-index.mjs";
import { buildQuery, createSearcher, MARK_END, MARK_START, normalizeArabic, SEARCH_FILE, snippetOrder, snippetParts } from "./search";

describe("buildQuery", () => {
  it("asks for every word as the start of a word", () => {
    expect(buildQuery("niat amal")).toEqual({ table: "hadith", match: '"niat"* AND "amal"*' });
  });

  it("drops FTS5 syntax so no input is an error", () => {
    expect(buildQuery('"a" OR (b*) -c')?.match).toBe('"a"* AND "or"* AND "b"* AND "c"*');
    expect(buildQuery("  ***  ")).toBeNull();
    expect(buildQuery("")).toBeNull();
  });

  it("searches the spellings of a word together", () => {
    expect(buildQuery("sholat")?.match).toBe('("shalat"* OR "sholat"* OR "salat"* OR "solat"*)');
    expect(buildQuery("Qur'an")?.match).toBe('("quran"* OR "qur an"* OR "alquran"*)');
  });

  it("searches Arabic, normalized like the index, in the Arabic table", () => {
    expect(buildQuery("الأَعْمَالُ بِالنِّيَّاتِ")).toEqual({ table: "arabic", match: '"الاعمال" AND "بالنيات"' });
    expect(buildQuery("في")).toBeNull();
  });
});

describe("normalizeArabic", () => {
  it("agrees with the script that builds the index", () => {
    for (const text of ["إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ", "عَلَى الصَّلاةِ", "ٱلرَّحْمَٰنِ", "مـــدينة"]) {
      expect(normalizeArabic(text)).toBe(scriptNormalize(text));
    }
    expect(normalizeArabic("إِنَّمَا الأَعْمَالُ")).toBe("انما الاعمال");
  });
});

describe("snippets", () => {
  it("splits a snippet into text and matches", () => {
    expect(snippetParts(`a ${MARK_START}b${MARK_END} c ${MARK_START}d${MARK_END}`)).toEqual([
      { text: "a ", match: false },
      { text: "b", match: true },
      { text: " c ", match: false },
      { text: "d", match: true },
    ]);
  });

  it("prefers the reader's language", () => {
    expect(snippetOrder("id")[0]).toBe("id");
    expect(snippetOrder("tr")[0]).toBe("en");
  });
});

describe("the index (built from the e2e fixtures)", () => {
  let dir: string;
  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), "hw-search-"));
    cpSync(join(__dirname, "../../../e2e/fixtures/hadith-api"), dir, { recursive: true });
    await buildSearchIndex(dir);
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("finds Indonesian, English and Arabic words, and pages the results", () => {
    const searcher = createSearcher(join(dir, SEARCH_FILE));
    expect(searcher.available()).toBe(true);
    const id = searcher.search("niat", { page: 1, locale: "id" });
    expect(id.total).toBeGreaterThan(0);
    expect(id.hits.some((h) => h.book === "bukhari" && h.number === "1")).toBe(true);
    expect(id.hits[0].snippet).toContain(MARK_START);
    expect(searcher.search("intentions", { page: 1, locale: "en" }).hits[0].language).toBe("en");
    // The article and the preposition are part of the Arabic word: النيات is found inside بالنيات.
    const arabic = searcher.search("النيات", { page: 1, locale: "ar" });
    expect(arabic.total).toBeGreaterThan(0);
    expect(arabic.hits[0].language).toBe("ar");
    expect(arabic.hits[0].snippet).toContain(MARK_START);
    expect(searcher.search("niat", { page: 1, locale: "id", book: "nawawi" }).hits.every((h) => h.book === "nawawi")).toBe(true);
    expect(searcher.search("zzzzqqq", { page: 1, locale: "id" }).total).toBe(0);
  });

  it("filters by grade: Bukhari counts as sahih, an-Nawawi has no grade", () => {
    const searcher = createSearcher(join(dir, SEARCH_FILE));
    const all = searcher.search("Allah", { page: 1, locale: "en" });
    const sahih = searcher.search("Allah", { page: 1, locale: "en", grade: "sahih" });
    expect(all.hits.some((h) => h.book === "nawawi")).toBe(true);
    expect(sahih.total).toBeGreaterThan(0);
    expect(sahih.total).toBeLessThan(all.total);
    expect(sahih.hits.every((h) => h.book === "bukhari")).toBe(true);
  });

  it("says when there is no index", () => {
    expect(createSearcher(join(dir, "missing.sqlite")).available()).toBe(false);
    expect(createSearcher(null).search("niat", { page: 1, locale: "id" })).toEqual({ total: 0, hits: [] });
  });
});
