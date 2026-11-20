// The Indonesian translation of an-Nawawi's forty hadiths, from HadeethEnc. fawazahmed0 has no Indonesian edition of the
// book; HadeethEnc has all 42 hadiths.
//
// The pairs (our number -> HadeethEnc id) were matched on 2026-11-20 by two independent checks, recorded in the
// workspace repository (project/hadistweb/ROADMAP.md): the Arabic text (HadeethEnc's text found in ours) and the English
// translations (each fawazahmed0 English text overlaps its own HadeethEnc entry more than any other of the 42). Our
// Arabic text ends with the takhrij, which HadeethEnc gives separately as its attribution line, so the translation is
// shown together with that line. Qudsi is not here: its automatic matches include a wrong pair, so it waits for a check
// by hand.

import { getHadith, hadeethencUrl } from "../hadeethenc/client";
import pairs from "./hadeethenc-pairs.json";
import type { ExtraTranslation } from "./service";

const PAIRS = pairs as Record<string, Record<string, number>>;

/** The HadeethEnc id paired with a hadith of a book, if any. */
export const hadeethencPair = (book: string, number: string): number | undefined => PAIRS[book]?.[number];

export const hadeethencIndonesian: ExtraTranslation = async (book, number, locale) => {
  if (locale !== "id") return null;
  const id = hadeethencPair(book, number);
  if (id === undefined) return null;
  const hadith = await getHadith("id", id);
  if (!hadith || hadith.language !== "id" || !hadith.text) return null;
  return {
    language: "id",
    text: hadith.text,
    source: { name: "HadeethEnc.com", url: hadeethencUrl("id", id), attribution: hadith.attribution },
  };
};
