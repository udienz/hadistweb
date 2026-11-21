import { describe, expect, it } from "vitest";
import { findQuranRefs, quranwebVerseUrl, surahFromName, SURAH_NAMES, VERSE_COUNTS } from "./quran-refs";

describe("Qur'an references in translations", () => {
  it("knows 114 surahs and 6,236 verses", () => {
    expect(VERSE_COUNTS).toHaveLength(114);
    expect(VERSE_COUNTS.reduce((a, b) => a + b, 0)).toBe(6236);
  });

  it("gives every listed name its own surah: no two surahs share a spelling", () => {
    expect(SURAH_NAMES).toHaveLength(114);
    SURAH_NAMES.forEach((names, i) => {
      for (const name of names) expect(surahFromName(name), name).toBe(i + 1);
    });
  });

  it("reads the spellings the Indonesian texts use", () => {
    const cases: [string, number][] = [
      ["Al Baqarah", 2], ["Albaqarah", 2], ["Al-Baqarah", 2], ["Ali Imran", 3], ["Alu 'Imran", 3], ["Ali'Imran", 3],
      ["An Nisaa", 4], ["Annisa'", 4], ["Al Ma`idah", 5], ["Al An'aam", 6], ["Anbiya'", 21], ["Isra'", 17],
      ["Al Kahfi", 18], ["Toha", 20], ["Thaahaa", 20], ["Al Mukminun", 23], ["Asy-Syu'ara", 26], ["Ash Shaffaat", 37],
      ["Azzumar", 39], ["Adl Dlukhaan", 44], ["Alqomar", 54], ["Almumtahanah", 60], ["Aljumah", 62], ["Ath Thalaq", 65],
      ["Adhdhuha", 93], ["Qaaf", 50], ["Huud", 11], ["Ibrahim", 14],
    ];
    for (const [name, surah] of cases) expect(surahFromName(name), name).toBe(surah);
    expect(surahFromName("Bukhari")).toBeNull();
  });

  it("finds both kinds of reference, and only real verses", () => {
    const en = findQuranRefs("He recited: 'Be you sure...' (3.77) and (2.300) and (115.1) and (4:3)");
    expect(en.map((r) => `${r.surah}:${r.ayah}`)).toEqual(["3:77", "4:3"]);
    const id = "Lalu turun ayat (QS. Albaqarah; 196) dan QS Alu 'Imran ayat 180, lihat juga Qs.Azzumar 67.";
    expect(findQuranRefs(id).map((r) => [id.slice(r.start, r.end), `${r.surah}:${r.ayah}`])).toEqual([
      ["QS. Albaqarah; 196", "2:196"],
      ["QS Alu 'Imran ayat 180", "3:180"],
      ["Qs.Azzumar 67", "39:67"],
    ]);
  });

  it("links to the verse on QuranWeb, on its page of ten verses", () => {
    expect(quranwebVerseUrl(2, 5)).toBe("https://quranweb.udienz.web.id/surah/2#verse-5");
    expect(quranwebVerseUrl(2, 255)).toBe("https://quranweb.udienz.web.id/surah/2?page=26#verse-255");
  });
});
