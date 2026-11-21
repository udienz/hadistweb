import { describe, expect, it } from "vitest";
import { excerpt, isIndexed, shareMetadata } from "./site";

describe("site metadata", () => {
  it("indexes only the production site", () => {
    expect(isIndexed("https://hadist.udienz.web.id")).toBe(true);
    expect(isIndexed("https://hadist-qa.udienz.web.id")).toBe(false);
    expect(isIndexed("http://127.0.0.1:3000")).toBe(false);
  });

  it("cuts a description at a word, without stray quotation marks", () => {
    expect(excerpt('"Islam is built on five', 100)).toBe("Islam is built on five");
    const long = excerpt("word ".repeat(100), 30);
    expect(long.length).toBeLessThanOrEqual(31);
    expect(long.endsWith("word…")).toBe(true);
  });

  it("gives a page its canonical address and a full Open Graph object", () => {
    const meta = shareMetadata({ title: "T", description: "D", path: "/bukhari/1", type: "article" });
    expect(meta.alternates).toEqual({ canonical: "/bukhari/1" });
    expect(meta.openGraph).toMatchObject({ url: "/bukhari/1", type: "article", images: [{ url: "/og.png" }] });
    expect(shareMetadata({ title: "T", path: "/", canonical: false }).alternates).toBeUndefined();
  });
});
