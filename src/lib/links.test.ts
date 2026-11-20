import { describe, expect, it } from "vitest";
import { chapterFromSegment, chapterHref, hadithAnchor, hadithInChapterHref, isHadithNumber } from "./links";

describe("links", () => {
  it("builds chapter addresses, with the page only after the first", () => {
    expect(chapterHref("bukhari", 2)).toBe("/bukhari/chapter/2");
    expect(chapterHref("bukhari", 2, 3)).toBe("/bukhari/chapter/2?page=3");
  });

  it("points a hadith to its page and card in the chapter", () => {
    expect(hadithAnchor("402.2")).toBe("h-402-2");
    expect(hadithInChapterHref("bukhari", 8, 23, "402.2")).toBe("/bukhari/chapter/8?page=3#h-402-2");
  });

  it("accepts hadith numbers with an optional decimal part and nothing else", () => {
    expect(isHadithNumber("1")).toBe(true);
    expect(isHadithNumber("402.2")).toBe(true);
    expect(isHadithNumber("chapter")).toBe(false);
    expect(isHadithNumber("1.")).toBe(false);
    expect(isHadithNumber("-1")).toBe(false);
  });

  it("reads chapter numbers, 0 included", () => {
    expect(chapterFromSegment("0")).toBe(0);
    expect(chapterFromSegment("97")).toBe(97);
    expect(chapterFromSegment("x")).toBeNull();
    expect(chapterFromSegment("1.5")).toBeNull();
  });
});
