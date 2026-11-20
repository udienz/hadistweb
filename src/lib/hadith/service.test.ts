// The service against a small copy of the data on disk, in the layout of fawazahmed0/hadith-api: the same code path as
// production with our mirror mounted as a directory.

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildIndex, createHadithService } from "./service";

let dir: string;

const hadith = (n: number | string, text: string, chapter: number, grades: { name: string; grade: string }[] = []) => ({
  hadithnumber: n,
  arabicnumber: n,
  text,
  grades,
  reference: { book: chapter, hadith: 1 },
});

async function section(edition: string, chapter: number, hadiths: unknown[], min = true) {
  const path = join(dir, "editions", edition, "sections");
  await mkdir(path, { recursive: true });
  await writeFile(join(path, `${chapter}${min ? ".min" : ""}.json`), JSON.stringify({ metadata: {}, hadiths }));
}

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "hadistweb-service-"));
  // A book with two chapters and two hadiths outside any chapter (chapter 0), as in Bukhari.
  await writeFile(
    join(dir, "info.min.json"),
    JSON.stringify({
      bukhari: {
        metadata: { sections: { "0": "", "1": "Revelation", "2": "Belief", "3": "Empty" } },
        hadiths: [1, 2, 3, "3.2", 4, 5].map((n) => ({
          hadithnumber: n,
          reference: { book: n === 4 || n === 5 ? 0 : n === 3 || n === "3.2" ? 2 : 1 },
        })),
      },
    }),
  );
  await section("ara-bukhari", 1, [hadith(1, "نص ١", 1), hadith(2, "نص ٢", 1)]);
  await section("ind-bukhari", 1, [hadith(1, "Teks satu", 1), hadith(2, "", 1)]);
  await section("eng-bukhari", 1, [hadith(1, "Text one", 1), hadith(2, "Text two", 1)]);
  await section("ara-bukhari", 2, [hadith(3, "نص ٣", 2, [{ name: "Al-Albani", grade: "Sahih" }]), hadith("3.2", "", 2)]);
  await section("ind-bukhari", 2, [hadith(3, "Teks tiga", 2), hadith("3.2", "", 2)]);
  // Only the pretty file for this one: the service falls back from .min.json to .json.
  await section("eng-bukhari", 2, [hadith(3, "Text three", 2), hadith("3.2", "", 2)], false);
  await section("ara-bukhari", 0, [hadith(4, "نص ٤", 0), hadith(5, "", 0)]);
  await section("ind-bukhari", 0, [hadith(4, "", 0), hadith(5, "Teks lima", 0)]);
  await section("eng-bukhari", 0, [hadith(4, "", 0), hadith(5, "", 0)]);
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("hadith service", () => {
  it("lists the chapters that have hadiths, with chapter 0 last when it does not hold hadith 1", async () => {
    const chapters = await createHadithService(dir).getChapters("bukhari");
    expect(chapters).toEqual([
      { number: 1, name: "Revelation", count: 2 },
      { number: 2, name: "Belief", count: 2 },
      { number: 0, name: "", count: 2 },
    ]);
  });

  it("falls back to English per hadith for an Indonesian reader, and keeps Indonesian first", async () => {
    const result = await createHadithService(dir).getChapter("bukhari", 1, "id");
    expect(result?.hadiths.map((h) => h.translation)).toEqual([
      { language: "id", text: "Teks satu" },
      { language: "en", text: "Text two" },
    ]);
  });

  it("drops a number with neither Arabic text nor any translation, and keeps grades", async () => {
    const result = await createHadithService(dir).getChapter("bukhari", 2, "en");
    expect(result?.hadiths.map((h) => h.number)).toEqual(["3"]);
    expect(result?.hadiths[0].grades).toEqual([{ grader: "Al-Albani", grade: "Sahih" }]);
    expect(result?.hadiths[0].translation).toEqual({ language: "en", text: "Text three" });
  });

  it("shows a translation without Arabic text, and Arabic without any translation", async () => {
    const result = await createHadithService(dir).getChapter("bukhari", 0, "id");
    expect(result?.hadiths).toMatchObject([
      { number: "4", arabic: "نص ٤", translation: null },
      { number: "5", arabic: "", translation: { language: "id", text: "Teks lima" } },
    ]);
  });

  it("finds one hadith through the chapter index, also a decimal number", async () => {
    const service = createHadithService(dir);
    expect(await service.getHadith("bukhari", "3", "id")).toMatchObject({ number: "3", chapter: 2 });
    expect(await service.getHadith("bukhari", "3.2", "id")).toBeNull(); // no text in any edition
    expect(await service.getHadith("bukhari", "99", "id")).toBeNull();
  });

  it("answers null for a chapter or book the index does not have", async () => {
    const service = createHadithService(dir);
    expect(await service.getChapter("bukhari", 3, "id")).toBeNull(); // listed but empty
    expect(await service.getChapter("bukhari", 42, "id")).toBeNull();
    expect(await service.getChapters("muslim")).toEqual([]);
  });

  it("tells the proxy which chapters and hadith numbers exist", async () => {
    const service = createHadithService(dir);
    expect(await service.exists("bukhari", { chapter: 0 })).toBe(true);
    expect(await service.exists("bukhari", { chapter: 3 })).toBe(false); // listed but empty
    expect(await service.exists("bukhari", { hadith: "3.2" })).toBe(true);
    expect(await service.exists("bukhari", { hadith: "99" })).toBe(false);
    expect(await service.exists("muslim", { chapter: 1 })).toBe(false);
  });

  it("names the file when the data is missing", async () => {
    const service = createHadithService(join(dir, "nowhere"));
    await expect(service.getChapters("bukhari")).rejects.toThrow(/nowhere\/info\.min\.json/);
  });
});

describe("buildIndex", () => {
  it("puts chapter 0 first when it starts the book (an introduction, as in Muslim)", () => {
    const index = buildIndex({
      muslim: {
        metadata: { sections: { "0": "", "1": "Faith" } },
        hadiths: [
          { hadithnumber: 1, reference: { book: 0 } },
          { hadithnumber: 2, reference: { book: 1 } },
        ],
      },
    });
    expect(index.get("muslim")?.chapters.map((c) => c.number)).toEqual([0, 1]);
  });
});
