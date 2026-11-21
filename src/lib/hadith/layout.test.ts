import { describe, expect, it } from "vitest";
import { layoutArabic, layoutTranslation, paragraphs, segments, sentences } from "./layout";

const plain = (segs: { text: string }[]) => segs.map((s) => s.text).join("");
/** The text without whitespace and brackets, to compare what the reader gets with the source. */
const letters = (s: string) => s.replace(/[\s[\]]/g, "");

const BUKHARI_START =
  "Telah menceritakan kepada kami [Yahya bin Bukair] berkata, telah menceritakan kepada kami [Al Laits] dari [Yunus] dari [Anas bin Malik] berkata, [Abu Dzar] menceritakan bahwa Rasulullah shallallahu 'alaihi wasallam bersabda: " +
  '"Saat aku di Makkah atap rumahku terbuka, tiba-tiba datang Malaikat Jibril. Lalu dia membelah dadaku. ' +
  "Dibawanya pula bejana terbuat dari emas berisi hikmah dan iman, lalu dituangnya ke dalam dadaku dan menutupnya kembali. " +
  "Lalu dia memegang tanganku dan membawaku menuju langit dunia. Tatkala aku sudah sampai di langit dunia, Jibril berkata kepada Malaikat penjaga langit, 'Bukalah'. " +
  "Malaikat penjaga langit berkata, 'Siapa Ini?' Jibril menjawab, 'Ini Jibril'.\" " +
  'Anas berkata, "Kemudian Nabi menyebutkan bahwa beliau bertemu dengan Adam."';

describe("translation layout", () => {
  it("separates the Indonesian sanad, with the narrator names marked and their brackets dropped", () => {
    const layout = layoutTranslation(BUKHARI_START, "id");
    expect(layout.sanad?.filter((s) => s.narrator).map((s) => s.text)).toEqual(["Yahya bin Bukair", "Al Laits", "Yunus", "Anas bin Malik", "Abu Dzar"]);
    expect(plain(layout.sanad!)).toMatch(/bersabda:$/);
    expect(plain(layout.paragraphs[0])).toMatch(/^"Saat aku di Makkah/);
  });

  it("starts a paragraph where a narrator takes the word, and keeps paragraphs short", () => {
    const layout = layoutTranslation(BUKHARI_START, "id");
    expect(plain(layout.paragraphs.at(-1)!)).toMatch(/^Anas berkata,/);
    for (const p of layout.paragraphs.slice(0, -1)) expect(plain(p).length).toBeLessThan(400 + 200);
    expect(layout.paragraphs.length).toBeGreaterThan(1);
  });

  it("keeps every character of the source, only line breaks, spaces and brackets differ", () => {
    const layout = layoutTranslation(BUKHARI_START, "id");
    const shown = plain(layout.sanad!) + layout.paragraphs.map(plain).join("");
    expect(letters(shown)).toBe(letters(BUKHARI_START));
  });

  it("separates the English 'Narrated X:'", () => {
    const layout = layoutTranslation("Narrated 'Umar bin Al-Khattab: I heard Allah's Messenger saying, \"The reward of deeds depends upon the intentions.\"", "en");
    expect(plain(layout.sanad!)).toBe("Narrated 'Umar bin Al-Khattab:");
    expect(plain(layout.paragraphs[0])).toMatch(/^I heard Allah's Messenger/);
  });

  it("leaves a text without a recognisable sanad whole, marking any narrator names", () => {
    const text = "Dan telah menceritakan kepada kami [Abu Bakr] dengan sanad ini seperti hadits tersebut.";
    const layout = layoutTranslation(text, "id");
    expect(layout.sanad).toBeNull();
    expect(layout.paragraphs).toHaveLength(1);
    expect(layout.paragraphs[0].some((s) => s.narrator && s.text === "Abu Bakr")).toBe(true);
  });

  it("does not take a quote far into the story for the end of a sanad", () => {
    const long = "[Abu] " + "kata ".repeat(150) + '"kutipan."';
    expect(layoutTranslation(long, "id").sanad).toBeNull();
  });
});

describe("helpers", () => {
  it("splits sentences after . ? ! and closing quotes, before a capital or a quote", () => {
    expect(sentences("Satu dua. Tiga? 'Empat.' \"Lima\" enam.")).toEqual(["Satu dua.", "Tiga?", "'Empat.'", '"Lima" enam.']);
    expect(sentences("Nomor 3.5 tetap utuh.")).toEqual(["Nomor 3.5 tetap utuh."]);
  });

  it("groups sentences into paragraphs", () => {
    const s = "Kalimat yang cukup panjang untuk mengisi paragraf. ".repeat(20).trim();
    const ps = paragraphs(s, "id");
    expect(ps.length).toBeGreaterThan(2);
    expect(ps.join(" ")).toBe(s);
  });

  it("marks only [bracketed] runs as narrators", () => {
    expect(segments("dari [Yunus] dan [Az Zuhri].")).toEqual([
      { text: "dari " },
      { text: "Yunus", narrator: true },
      { text: " dan " },
      { text: "Az Zuhri", narrator: true },
      { text: "." },
    ]);
  });
});

describe("Arabic layout", () => {
  const sanad = "حَدَّثَنَا يَحْيَى بْنُ بُكَيْرٍ، قَالَ حَدَّثَنَا اللَّيْثُ، عَنْ يُونُسَ، قَالَ ";
  const sentence = "قَالَ هَذَا جِبْرِيلُ وَمَعِي مُحَمَّدٌ صلى الله عليه وسلم فَفَتَحَ لَنَا السَّمَاءَ الدُّنْيَا";
  const text = sanad + '"' + Array.from({ length: 12 }, () => sentence + "\u200f.\u200f").join(" ") + '"';

  it("separates the sanad at the first quote and splits the matn at the full stops", () => {
    const layout = layoutArabic(text);
    expect(layout.sanad).toBe(sanad.trim());
    expect(layout.paragraphs.length).toBeGreaterThan(1);
    expect(layout.paragraphs[0].startsWith('"')).toBe(true);
  });

  it("keeps every character apart from whitespace", () => {
    const layout = layoutArabic(text);
    expect(((layout.sanad ?? "") + layout.paragraphs.join("")).replace(/\s/g, "")).toBe(text.replace(/\s/g, ""));
  });

  it("leaves a short text, or one without a sanad opening, as one paragraph", () => {
    expect(layoutArabic("قَالَ رَسُولُ اللَّهِ").paragraphs).toEqual(["قَالَ رَسُولُ اللَّهِ"]);
    expect(layoutArabic('عَنْ أَبِي هُرَيْرَةَ "قَالَ"').sanad).toBeNull();
  });
});
