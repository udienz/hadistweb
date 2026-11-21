// The narrators index (the owner's idea, 2026-11-22): the names the Indonesian translation puts in [brackets] in each
// chain, counted per name. The index tables are built by scripts/build-search-index.mjs; narratorKey must give the same
// keys as the script's (a test checks it), so a name in a chain links to its page.
//
// A name is not a person: one narrator appears under several spellings ("Abu Bakr bin Abu Syaibah", "Abu Bakar bin Abu
// Syaibah"), and different people share a name ("Abdullah"). The pages say so.

const HONORIFICS = /(?<![a-z])'?(?:radliallahu|radhiallahu|radhiyallahu|radiyallahu|rahimahullah|rahimahumallah|shallallahu|anhu(?:ma|m)?|anha|alaihi|wasallam|alaihis|salam)(?![a-z])/gi;
const NOT_A_NAME_FIRST = new Set(["seorang", "seseorang", "beberapa", "sebagian", "orang", "salah", "para", "dia", "beliau", "mereka", "kami", "aku", "saya"]);

/** The key a narrator's name is counted under, or null for what is not a name (bapaknya, ayahku, seorang laki-laki). */
export function narratorKey(name: string): string | null {
  const key = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(HONORIFICS, " ")
    .toLowerCase()
    .replace(/[^a-z ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (key.length < 2) return null;
  const words = key.split(" ");
  if (words.length === 1 && /(?:nya|ku)$/.test(key)) return null;
  if (NOT_A_NAME_FIRST.has(words[0])) return null;
  return key;
}

/** The address segment of a narrator ("abu hurairah" is "abu-hurairah"), and back. */
export const narratorSlug = (key: string): string => key.replace(/ /g, "-");
export const keyFromSlug = (slug: string): string | null => (/^[a-z]+(?:-[a-z]+)*$/.test(slug) ? slug.replace(/-/g, " ") : null);
export const narratorHref = (key: string): string => `/narrators/${narratorSlug(key)}`;
export const narratorsHref = (query?: string): string => (query ? `/narrators?q=${encodeURIComponent(query)}` : "/narrators");
