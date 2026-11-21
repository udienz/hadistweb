// A second translation shown beside the first (the owner's idea, 2026-11-22): for example English next to Indonesian.
// The reader's choice, in a cookie, so the server reads that edition too. None by default.

import { isTranslationLanguage, type TranslationLanguage } from "./hadith/types";

export const SECOND_COOKIE = "hw-second";

export function parseSecond(value: string | undefined): TranslationLanguage | null {
  return value && isTranslationLanguage(value) ? value : null;
}
