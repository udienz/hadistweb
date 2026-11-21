// Filtering by grade (the owner's idea, 2026-11-22). The source gives several graders per hadith, with 1,671 ways of
// writing a grade ("Sahih", "Hasan Sahih", "Isnaad Sahih", "Daif Isnaad", "Sahih Muslim (1480)", ...). A filter needs
// one answer per hadith, so each book uses one grader, the one who graded (nearly) all of it: Al-Albani for the four
// Sunan, Salim al-Hilali for Malik (the only one there). Bukhari and Muslim have no grades in the source: their hadiths
// count as sahih, as the two collections are agreed to be. The small books have no grades and no filter.
//
// scripts/build-search-index.mjs repeats gradeLevel for the search index; a test checks that the two agree.

import type { BookId, Grade } from "./types";

export type GradeLevel = "sahih" | "hasan" | "daif";

/** The grader whose grade decides, per book that has grades. */
export const GRADER: Partial<Record<BookId, string>> = {
  abudawud: "Al-Albani",
  tirmidhi: "Al-Albani",
  nasai: "Al-Albani",
  ibnmajah: "Al-Albani",
  malik: "Salim al-Hilali",
};

/** Books whose hadiths are all sahih by agreement. */
export const SAHIH_BOOKS: readonly BookId[] = ["bukhari", "muslim"];

/** Books the filter applies to. */
export const hasGradeFilter = (book: BookId): boolean => book in GRADER;

const WEAK = /\b(?:daif|da'if|very daif|munkar|shadh|mawdu|maudu|batil)\b/i;

/** The level of one grade text: weak if any weakness is named, else sahih, else hasan; null for anything else. */
export function gradeLevel(text: string): GradeLevel | null {
  if (WEAK.test(text)) return "daif";
  if (/\bsahih\b/i.test(text)) return "sahih";
  if (/\bhasan\b/i.test(text)) return "hasan";
  return null;
}

/** A hadith's level and who graded it: the book's grader, or (when they did not grade it) no level. */
export function hadithGrade(book: BookId, grades: Grade[]): { level: GradeLevel | null; grader: string | null } {
  if (SAHIH_BOOKS.includes(book)) return { level: "sahih", grader: null };
  const grader = GRADER[book];
  const grade = grader ? grades.find((g) => g.grader === grader) : undefined;
  return { level: grade ? gradeLevel(grade.grade) : null, grader: grade ? grader! : null };
}

/** What the reader asks for: only sahih, or sahih and hasan ("accepted"). */
export type GradeFilter = "sahih" | "accepted";

export function parseGradeFilter(value: string | string[] | undefined): GradeFilter | null {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "sahih" || v === "accepted" ? v : null;
}

export function passesFilter(level: GradeLevel | null, filter: GradeFilter | null): boolean {
  if (!filter) return true;
  return filter === "sahih" ? level === "sahih" : level === "sahih" || level === "hasan";
}
