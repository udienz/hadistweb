// Indonesian translations from HadeethEnc for the books fawazahmed0 has none of: all 42 hadiths of an-Nawawi, and 20 of
// the 40 hadiths Qudsi.
//
// The pairs (our number -> HadeethEnc id) were matched on 2026-11-20 by two independent checks, recorded in the
// workspace repository (project/hadistweb/ROADMAP.md): the Arabic text (HadeethEnc's text found in ours) and the English
// translations (each fawazahmed0 English text overlaps its own HadeethEnc entry more than any other of the 42). Our
// Arabic text ends with the takhrij, which HadeethEnc gives separately as its attribution line, so the translation is
// shown together with that line.
//
// Qudsi was checked by hand on 2026-11-21 (the Arabic texts read side by side): 20 of its 23 automatic matches are the
// same hadith. Left out: 8 (ours begins with the part on reciting Umm al-Qur'an, HadeethEnc has only the qudsi part),
// 14 (a different hadith that shares the opening), 30 (ours is Abu Hurairah's narration plus Aisha's, HadeethEnc has
// only Aisha's). The other 20 hadiths keep the English translation.

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
