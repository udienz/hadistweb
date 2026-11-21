import { describe, expect, it } from "vitest";
import { BOOKS, bookById, pickTranslation, translationOrder } from "./books";
import { BOOK_IDS, isBookId } from "./types";

describe("books", () => {
  it("lists every book id once, with a name in both interface languages", () => {
    expect(BOOKS.map((b) => b.id)).toEqual([...BOOK_IDS]);
    for (const book of BOOKS) {
      expect(book.name.en).toBeTruthy();
      expect(book.name.id).toBeTruthy();
      expect(book.translations).toContain("en");
    }
  });

  it("knows which books have no Indonesian edition", () => {
    const noIndonesian = BOOKS.filter((b) => !b.translations.includes("id")).map((b) => b.id);
    expect(noIndonesian).toEqual(["nawawi", "qudsi", "dehlawi"]);
    expect(BOOKS.filter((b) => b.translations.includes("ru")).map((b) => b.id)).toEqual(["bukhari", "muslim", "abudawud"]);
  });

  it("only accepts known book ids", () => {
    expect(isBookId("bukhari")).toBe(true);
    expect(isBookId("about")).toBe(false);
    expect(isBookId("Bukhari")).toBe(false);
  });
});

describe("translation fallback", () => {
  it("prefers the interface language, then the other one, within what the book has", () => {
    expect(translationOrder(bookById("bukhari"), "id")).toEqual(["id", "en"]);
    expect(translationOrder(bookById("bukhari"), "en")).toEqual(["en", "id"]);
    expect(translationOrder(bookById("nawawi"), "id")).toEqual(["en"]);
    expect(translationOrder(bookById("bukhari"), "tr")).toEqual(["tr", "en", "id"]);
    expect(translationOrder(bookById("tirmidhi"), "fr")).toEqual(["en", "id"]);
    expect(translationOrder(bookById("bukhari"), "ms")).toEqual(["en", "id"]);
    expect(translationOrder(bookById("bukhari"), "ar")).toEqual([]);
    expect(translationOrder(bookById("muslim"), "ta")).toEqual(["ta", "en", "id"]);
    expect(translationOrder(bookById("abudawud"), "ta")).toEqual(["en", "id"]);
    expect(translationOrder(bookById("bukhari"), "ja")).toEqual(["en", "id"]);
  });

  it("takes the first non-empty text, so an empty Indonesian text falls back to English", () => {
    expect(pickTranslation(["id", "en"], { id: "Teks", en: "Text" })).toEqual({ language: "id", text: "Teks" });
    expect(pickTranslation(["id", "en"], { id: "  ", en: "Text" })).toEqual({ language: "en", text: "Text" });
    expect(pickTranslation(["id", "en"], { id: "", en: "" })).toBeNull();
    expect(pickTranslation(["en"], {})).toBeNull();
  });
});
