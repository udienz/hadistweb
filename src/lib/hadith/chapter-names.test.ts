import { describe, expect, it } from "vitest";
import { DEFAULT_PAGE_SIZE, parsePageSize } from "../page-size";
import { hadithInChapterHref } from "../links";
import { chapterTitle } from "./chapter-names";
import names from "./chapter-names-id.json";

const revelation = { number: 1, name: "Revelation" };

describe("chapter titles", () => {
  it("gives the Indonesian name with the English one as the original, for an Indonesian reader", () => {
    expect(chapterTitle("bukhari", revelation, "id", "-")).toEqual({ title: "Kitab Permulaan Wahyu", lang: "id", original: "Revelation" });
  });

  it("keeps the source's English name for an English reader and where no Indonesian name exists", () => {
    expect(chapterTitle("bukhari", revelation, "en", "-")).toEqual({ title: "Revelation", lang: "en" });
    expect(chapterTitle("nawawi", { number: 1, name: "Forty Hadith of an-Nawawi" }, "id", "-")).toEqual({
      title: "Forty Hadith of an-Nawawi",
      lang: "en",
    });
  });

  it("uses the given label for chapter 0, which has no name in the source", () => {
    expect(chapterTitle("bukhari", { number: 0, name: "" }, "id", "Tanpa bab")).toEqual({ title: "Tanpa bab", lang: "id" });
  });

  it("has names for the seven books with an Indonesian translation, none empty", () => {
    expect(Object.keys(names).sort()).toEqual(["abudawud", "bukhari", "ibnmajah", "malik", "muslim", "nasai", "tirmidhi"]);
    for (const book of Object.values(names)) for (const name of Object.values(book)) expect(name.trim()).not.toBe("");
  });
});

describe("page size", () => {
  it("accepts 5 and 10 and falls back to 10", () => {
    expect(parsePageSize("5")).toBe(5);
    expect(parsePageSize("10")).toBe(10);
    expect(parsePageSize("7")).toBe(DEFAULT_PAGE_SIZE);
    expect(parsePageSize(undefined)).toBe(10);
  });

  it("links a hadith to the right page for the reader's page size", () => {
    expect(hadithInChapterHref("bukhari", 1, 7, "7")).toBe("/bukhari/chapter/1#h-7");
    expect(hadithInChapterHref("bukhari", 1, 7, "7", 5)).toBe("/bukhari/chapter/1?page=2#h-7");
  });
});
