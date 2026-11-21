import { describe, expect, it } from "vitest";
import { dailyNumber } from "./daily";

describe("hadith of the day", () => {
  it("changes at midnight in Jakarta, not in UTC", () => {
    // 2026-11-21 16:59 UTC is 23:59 in Jakarta; a minute later it is the next day there.
    const before = Date.UTC(2026, 10, 21, 16, 59);
    const after = Date.UTC(2026, 10, 21, 17, 1);
    expect(dailyNumber(after)).not.toBe(dailyNumber(before));
    expect(dailyNumber(Date.UTC(2026, 10, 21, 2, 0))).toBe(dailyNumber(before));
  });

  it("goes through all 42 hadiths in turn", () => {
    const start = Date.UTC(2026, 0, 1, 12);
    const seen = new Set(Array.from({ length: 42 }, (_, i) => dailyNumber(start + i * 86_400_000)));
    expect(seen.size).toBe(42);
    for (const n of seen) expect(Number(n)).toBeGreaterThanOrEqual(1);
  });
});
