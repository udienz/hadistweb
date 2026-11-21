import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, isLocale, LOCALE_NAMES, LOCALES, MENU_LOCALES, negotiateLocale } from "./config";
import { MESSAGES } from "./messages";
import { createTranslator, format, localized } from "./translate";

describe("negotiateLocale", () => {
  it("an explicit cookie wins over the browser", () => {
    expect(negotiateLocale("en", "id-ID,id;q=0.9")).toBe("en");
    expect(negotiateLocale("id", "en-US,en;q=0.9")).toBe("id");
  });

  it("uses the first supported language the browser lists", () => {
    expect(negotiateLocale(undefined, "en-US,en;q=0.9,id;q=0.8")).toBe("en");
    expect(negotiateLocale(undefined, "ko-KR,id;q=0.8,en;q=0.5")).toBe("id");
  });

  it("falls back to Indonesian for an unknown cookie, an unsupported language or no header", () => {
    expect(DEFAULT_LOCALE).toBe("id");
    expect(negotiateLocale("ko", "pl-PL,ko;q=0.9")).toBe("id");
    expect(negotiateLocale(undefined, null)).toBe("id");
    expect(LOCALES.every(isLocale)).toBe(true);
    expect(isLocale("tr")).toBe(true);
    expect(isLocale("ko")).toBe(false);
  });
});

describe("format and localized", () => {
  it("replaces known placeholders and leaves unknown ones", () => {
    expect(format("{a} and {b}", { a: 1 })).toBe("1 and {b}");
  });

  it("localized falls back to English, then to any language", () => {
    expect(localized({ en: "Hello", id: "Halo" }, "id")).toBe("Halo");
    expect(localized({ en: "Hello" }, "id")).toBe("Hello");
  });
});

describe("translator", () => {
  it("translates, interpolates and picks plural forms per language", () => {
    const en = createTranslator("en", MESSAGES.en);
    const id = createTranslator("id", MESSAGES.id);
    expect(en.t("hadith.number", { number: "402.2" })).toBe("Hadith 402.2");
    expect(id.t("hadith.number", { number: "402.2" })).toBe("Hadis 402.2");
    expect(en.tn("common.hadiths", 1)).toBe("1 hadith");
    expect(en.tn("common.hadiths", 7)).toBe("7 hadiths");
    expect(id.tn("common.hadiths", 1)).toBe("1 hadis");
    expect(id.tn("common.chapters", 97)).toBe("97 bab");
  });

  it("throws on a missing message instead of showing a key", () => {
    const en = createTranslator("en", MESSAGES.en);
    // @ts-expect-error: not a key of the catalog
    expect(() => en.t("nope.missing")).toThrow(/Missing message/);
  });
});

/** Every leaf path of a catalog, to compare languages at runtime (the types already require the same shape). */
function paths(node: unknown, prefix = ""): string[] {
  if (typeof node === "string") return [prefix];
  if (node && typeof node === "object" && "other" in node) return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
}

describe("catalogs", () => {
  it("every language has exactly the English keys, none empty", () => {
    const english = paths(MESSAGES.en).sort();
    for (const locale of LOCALES) {
      expect(paths(MESSAGES[locale]).sort()).toEqual(english);
    }
  });
});

describe("MENU_LOCALES", () => {
  it("lists every language once, alphabetical by its own name, Latin script first", () => {
    const sorted = [...LOCALES].sort((a, b) => new Intl.Collator("en").compare(LOCALE_NAMES[a], LOCALE_NAMES[b]));
    expect(MENU_LOCALES).toEqual(sorted);
    expect([...MENU_LOCALES].sort()).toEqual([...LOCALES].sort());
  });
});
