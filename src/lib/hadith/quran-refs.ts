// Links from a hadith's translation to the verse it quotes on QuranWeb (the owner's idea, 2026-11-22). The translations
// cite verses in their own ways: the English as "(3.77)", the Indonesian as "QS. Ali 'Imran: 77", "(QS. Albaqarah;
// 196)", "Al Kahfi ayat 10", with many spellings of the surah names. findQuranRefs finds them; a reference is kept only
// when the surah exists and has that verse, so an ordinary number in brackets is not mistaken for one.

export const QURANWEB = "https://quranweb.udienz.web.id";

/** Verses per surah, 1 to 114 (6,236 in all). */
export const VERSE_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227,
  93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96,
  29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17,
  19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

/** The names of the surahs as Indonesian texts write them, with other names some of them go by. */
export const SURAH_NAMES: string[][] = [
  ["Al-Fatihah"], ["Al-Baqarah"], ["Ali 'Imran", "Alu 'Imran", "Imran"], ["An-Nisa'"], ["Al-Ma'idah"], ["Al-An'am"],
  ["Al-A'raf"], ["Al-Anfal"], ["At-Taubah", "Bara'ah"], ["Yunus"], ["Hud"], ["Yusuf"], ["Ar-Ra'd", "Ar-Ra'du"], ["Ibrahim"],
  ["Al-Hijr"], ["An-Nahl"], ["Al-Isra'", "Bani Isra'il"], ["Al-Kahf", "Al-Kahfi"], ["Maryam"], ["Taha", "Thaha", "Toha"],
  ["Al-Anbiya'"], ["Al-Hajj"], ["Al-Mu'minun", "Al-Mukminun"], ["An-Nur"], ["Al-Furqan"], ["Asy-Syu'ara'"], ["An-Naml"], ["Al-Qasas"],
  ["Al-'Ankabut"], ["Ar-Rum"], ["Luqman"], ["As-Sajdah", "As-Sajadah"], ["Al-Ahzab"], ["Saba'"], ["Fatir"], ["Yasin"],
  ["As-Saffat"], ["Sad"], ["Az-Zumar"], ["Gafir", "Ghafir", "Al-Mu'min"], ["Fussilat"], ["Asy-Syura"],
  ["Az-Zukhruf"], ["Ad-Dukhan"], ["Al-Jasiyah", "Al-Jatsiyah"], ["Al-Ahqaf"], ["Muhammad"], ["Al-Fath"],
  ["Al-Hujurat"], ["Qaf"], ["Az-Zariyat", "Adz-Dzariyat"], ["At-Tur"], ["An-Najm"], ["Al-Qamar", "Al-Qomar"], ["Ar-Rahman"],
  ["Al-Waqi'ah"], ["Al-Hadid"], ["Al-Mujadalah", "Al-Mujadilah"], ["Al-Hasyr"], ["Al-Mumtahanah"], ["As-Saff"], ["Al-Jumu'ah", "Al-Jum'ah"],
  ["Al-Munafiqun"], ["At-Tagabun", "At-Taghabun"], ["At-Talaq"], ["At-Tahrim"], ["Al-Mulk"], ["Al-Qalam"],
  ["Al-Haqqah"], ["Al-Ma'arij"], ["Nuh"], ["Al-Jinn"], ["Al-Muzzammil"], ["Al-Muddassir", "Al-Muddatstsir"],
  ["Al-Qiyamah"], ["Al-Insan", "Ad-Dahr"], ["Al-Mursalat"], ["An-Naba'"], ["An-Nazi'at"], ["'Abasa"], ["At-Takwir"],
  ["Al-Infitar"], ["Al-Mutaffifin"], ["Al-Insyiqaq"], ["Al-Buruj"], ["At-Tariq"], ["Al-A'la"],
  ["Al-Gasyiyah", "Al-Ghasyiyah"], ["Al-Fajr"], ["Al-Balad"], ["Asy-Syams"], ["Al-Lail"], ["Ad-Duha"],
  ["Asy-Syarh", "Al-Insyirah", "Alam Nasyrah"], ["At-Tin"], ["Al-'Alaq", "Iqra'"], ["Al-Qadr", "Al-Qadar"], ["Al-Bayyinah"],
  ["Az-Zalzalah", "Az-Zilzal"], ["Al-'Adiyat"], ["Al-Qari'ah"], ["At-Takasur", "At-Takatsur"], ["Al-'Asr"],
  ["Al-Humazah"], ["Al-Fil"], ["Quraisy"], ["Al-Ma'un"], ["Al-Kausar", "Al-Kautsar"], ["Al-Kafirun"], ["An-Nasr"],
  ["Al-Lahab", "Al-Masad", "Tabbat"], ["Al-Ikhlas"], ["Al-Falaq"], ["An-Nas"],
];

/**
 * A name reduced to what all its spellings share: lower case, letters only, the consonant pairs Indonesian uses for one
 * Arabic letter written as one (sy, sh, ts, dz, dh and dl for ض, th, kh, gh), q as k, o as u, and no doubled letters. Two keys:
 * with the article (al-, an-, asy-, ...) and without, because some names begin with letters that look like one
 * ("Anbiya'", "Anfal") and some texts drop the article.
 */
export function nameKeys(name: string): string[] {
  let s = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(?:surat|surah|ayat|qs)\b/g, "")
    .replace(/[^a-z ]/g, "")
    .trim();
  // "Ali Imran", "Alu Imran": "ali" here is part of the name, not an article.
  if (/^al[iu]\s*imran$/.test(s)) s = "aliimran";
  const squash = (x: string) =>
    x
      .replace(/\s+/g, "")
      .replace(/sy|sh|ts/g, "s")
      .replace(/dz/g, "z")
      .replace(/dh|dl/g, "d")
      .replace(/th/g, "t")
      .replace(/kh/g, "k")
      .replace(/gh/g, "g")
      .replace(/q/g, "k")
      .replace(/o/g, "u")
      .replace(/(.)\1+/g, "$1");
  const full = squash(s);
  const bare = squash(s.replace(/^(?:asy|ash|ath|ats|adz|adh|adl|al|an|ar|as|at|az|ad)[\s-]*(?=[a-z]{3})/, ""));
  return full === bare ? [full] : [full, bare];
}

const BY_KEY = new Map<string, number>();
SURAH_NAMES.forEach((names, i) => {
  for (const name of names) for (const key of nameKeys(name)) if (!BY_KEY.has(key)) BY_KEY.set(key, i + 1);
});

/** The surah a name means, or null. */
export function surahFromName(name: string): number | null {
  for (const key of nameKeys(name)) {
    const surah = BY_KEY.get(key);
    if (surah !== undefined) return surah;
  }
  return null;
}

export const isVerse = (surah: number, ayah: number): boolean =>
  Number.isInteger(surah) && surah >= 1 && surah <= 114 && Number.isInteger(ayah) && ayah >= 1 && ayah <= VERSE_COUNTS[surah - 1];

/** The verse on QuranWeb (its pages hold ten verses; the first page has no page number). */
export function quranwebVerseUrl(surah: number, ayah: number): string {
  const page = Math.ceil(ayah / 10);
  return `${QURANWEB}/surah/${surah}${page > 1 ? `?page=${page}` : ""}#verse-${ayah}`;
}

export interface QuranRef {
  start: number;
  end: number;
  surah: number;
  ayah: number;
}

// "(3.77)", "(4:3)", "(2.183-184)": the English translations (Muhsin Khan's) cite this way.
const NUMERIC = /\((\d{1,3})[.:](\d{1,3})(?:\s*[-–]\s*\d{1,3})?\)/g;
// "QS. Ali 'Imran: 77", "QS Albaqarah; 196", "QS. Al Kahfi ayat 10", "Qs.Azzumar 67".
const NAMED = /\b(?:QS|Q\.S|Qs)\.?\s*([A-Za-z][A-Za-z'’`\- ]{1,28}?)\s*(?:[:;.,]|\bayat\b)?\s*(\d{1,3})(?:\s*[-–]\s*\d{1,3})?/g;

/** The verse references in a text, in order, with where each is (the whole reference, to become the link). */
export function findQuranRefs(text: string): QuranRef[] {
  const refs: QuranRef[] = [];
  for (const m of text.matchAll(NUMERIC)) {
    const surah = Number(m[1]);
    const ayah = Number(m[2]);
    if (isVerse(surah, ayah)) refs.push({ start: m.index, end: m.index + m[0].length, surah, ayah });
  }
  for (const m of text.matchAll(NAMED)) {
    const surah = surahFromName(m[1]);
    const ayah = Number(m[2]);
    if (surah !== null && isVerse(surah, ayah)) refs.push({ start: m.index, end: m.index + m[0].length, surah, ayah });
  }
  return refs.sort((a, b) => a.start - b.start).filter((r, i, all) => i === 0 || r.start >= all[i - 1].end);
}
