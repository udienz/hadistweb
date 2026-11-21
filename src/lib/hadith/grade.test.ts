import { describe, expect, it } from "vitest";
import { gradeLevel as scriptLevel } from "../../../scripts/build-search-index.mjs";
import { gradeLevel, hadithGrade, parseGradeFilter, passesFilter } from "./grade";

const SAMPLES = ["Sahih", "Daif", "Hasan", "Hasan Sahih", "Isnaad Hasan", "Daif Isnaad", "Sahih Muslim (1480)", "Very Daif", "Munkar", "Mauquf Sahih", "Maqtu", "-", "Shadh", "Mawdu", "Batil", "Sahih Lighairihi", "Hasan Lighairihi"];

describe("grades", () => {
  it("reads a grade text as sahih, hasan or weak", () => {
    expect(SAMPLES.map(gradeLevel)).toEqual([
      "sahih", "daif", "hasan", "sahih", "hasan", "daif", "sahih", "daif", "daif", "sahih", null, null, "daif", "daif", "daif", "sahih", "hasan",
    ]);
  });

  it("agrees with the script that builds the search index", () => {
    for (const text of SAMPLES) expect(gradeLevel(text)).toBe(scriptLevel(text));
  });

  it("takes the book's grader, and counts Bukhari and Muslim as sahih", () => {
    const grades = [
      { grader: "Zubair Ali Zai", grade: "Sahih" },
      { grader: "Al-Albani", grade: "Daif" },
    ];
    expect(hadithGrade("abudawud", grades)).toEqual({ level: "daif", grader: "Al-Albani" });
    expect(hadithGrade("abudawud", [{ grader: "Zubair Ali Zai", grade: "Sahih" }])).toEqual({ level: null, grader: null });
    expect(hadithGrade("bukhari", [])).toEqual({ level: "sahih", grader: null });
  });

  it("filters only sahih, or sahih and hasan", () => {
    expect(parseGradeFilter("sahih")).toBe("sahih");
    expect(parseGradeFilter(["accepted"])).toBe("accepted");
    expect(parseGradeFilter("x")).toBeNull();
    expect(passesFilter("hasan", "accepted")).toBe(true);
    expect(passesFilter("hasan", "sahih")).toBe(false);
    expect(passesFilter(null, "accepted")).toBe(false);
    expect(passesFilter("daif", null)).toBe(true);
  });
});
