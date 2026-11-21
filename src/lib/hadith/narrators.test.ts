import { describe, expect, it } from "vitest";
import { narratorKey as scriptKey } from "../../../scripts/build-search-index.mjs";
import { keyFromSlug, narratorKey, narratorSlug } from "./narrators";

const NAMES = ["Abu Hurairah", "'Aisyah", "'Aisyah radliallahu 'anha", "Aisyah istri Nabi 'alaihi wasallam", "Bapaknya", "ayahku", "seorang laki-laki", "Al A'masy", "al-A'masy", "Ibnu 'Umar radliallahu 'anhuma", "Syu'bah", "X"];

describe("narrator names", () => {
  it("counts the spellings of one name under one key, and leaves out what is not a name", () => {
    expect(NAMES.map(narratorKey)).toEqual([
      "abu hurairah", "aisyah", "aisyah", "aisyah istri nabi", null, null, null, "al a masy", "al a masy", "ibnu umar", "syu bah", null,
    ]);
  });

  it("agrees with the script that builds the index", () => {
    for (const name of NAMES) expect(narratorKey(name)).toBe(scriptKey(name));
  });

  it("turns a key into an address and back", () => {
    expect(narratorSlug("abu hurairah")).toBe("abu-hurairah");
    expect(keyFromSlug("abu-hurairah")).toBe("abu hurairah");
    expect(keyFromSlug("Abu--x")).toBeNull();
  });
});
