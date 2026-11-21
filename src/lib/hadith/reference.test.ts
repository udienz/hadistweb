import { describe, expect, it } from "vitest";
import { bookFromName, isBareNumber, parseReference } from "./reference";

describe("references typed into the search box", () => {
  it("knows the books by their usual names", () => {
    expect(bookFromName("Bukhari")).toBe("bukhari");
    expect(bookFromName("Shahih al-Bukhari")).toBe("bukhari");
    expect(bookFromName("HR. Muslim")).toBe("muslim");
    expect(bookFromName("Abu Dawud")).toBe("abudawud");
    expect(bookFromName("Sunan an-Nasa'i")).toBe("nasai");
    expect(bookFromName("Ibnu Majah")).toBe("ibnmajah");
    expect(bookFromName("Tirmidzi")).toBe("tirmidhi");
    expect(bookFromName("Arbain")).toBe("nawawi");
    expect(bookFromName("puasa")).toBeNull();
  });

  it("reads a book and a number", () => {
    expect(parseReference("Bukhari 349")).toEqual({ book: "bukhari", number: "349" });
    expect(parseReference("HR. Muslim no. 8")).toEqual({ book: "muslim", number: "8" });
    expect(parseReference("abu dawud 402.2")).toEqual({ book: "abudawud", number: "402.2" });
    expect(parseReference("bukhari:1")).toEqual({ book: "bukhari", number: "1" });
  });

  it("takes a bare number in the chosen book, and nothing else as a reference", () => {
    expect(parseReference("349", "muslim")).toEqual({ book: "muslim", number: "349" });
    expect(parseReference("349")).toBeNull();
    expect(parseReference("puasa 3")).toBeNull();
    expect(parseReference("niat")).toBeNull();
    expect(isBareNumber(" 349 ")).toBe(true);
    expect(isBareNumber("Bukhari 349")).toBe(false);
  });
});
