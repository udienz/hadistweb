import { describe, expect, it } from "vitest";
import { BOOKS } from "./books";
import { explanationId, hadithsExplainedBy } from "./explanations";
import explanations from "./hadeethenc-explanations.json";

describe("links to HadeethEnc's explanations", () => {
  it("has well-formed pairs for known books only", () => {
    const ids = new Set(BOOKS.map((b) => b.id as string));
    for (const [book, numbers] of Object.entries(explanations)) {
      expect(ids.has(book)).toBe(true);
      for (const [number, enc] of Object.entries(numbers as Record<string, number>)) {
        expect(number).toMatch(/^\d+(\.\d+)?$/);
        expect(Number.isInteger(enc)).toBe(true);
      }
    }
  });

  it("finds an entry from a book hadith and back", () => {
    // Bukhari 1, "Actions are by intentions": HadeethEnc explains it (also an-Nawawi 1).
    const id = explanationId("bukhari", "1");
    expect(id).toBeDefined();
    const books = hadithsExplainedBy(id!).map((h) => `${h.book}/${h.number}`);
    expect(books).toContain("bukhari/1");
    expect(explanationId("bukhari", "999999")).toBeUndefined();
    expect(explanationId("nawawi", "1")).toBeDefined();
  });
});
