// The words a link preview shows under a hadith's title: the matn, without the chain of narrators, cut at a word.

import { excerpt } from "../site";
import { layoutArabic, layoutTranslation } from "./layout";
import type { Hadith } from "./types";

/** The translation's matn (or, without a translation, the Arabic matn), at most `max` characters. */
export function hadithExcerpt(hadith: Hadith, max = 180): string {
  const translation = hadith.translation;
  if (translation) {
    // HadeethEnc's texts are used as they are (no layout), so the whole text.
    if (translation.source) return excerpt(translation.text, max);
    const { paragraphs } = layoutTranslation(translation.text, translation.language);
    const matn = paragraphs.map((p) => p.map((s) => s.text).join("")).join(" ");
    return excerpt(matn || translation.text, max);
  }
  const { paragraphs } = layoutArabic(hadith.arabic);
  return excerpt((paragraphs.join(" ") || hadith.arabic).replace(/[‎‏]/g, ""), max);
}
