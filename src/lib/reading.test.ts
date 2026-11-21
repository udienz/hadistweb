import { describe, expect, it } from "vitest";
import { EMPTY_READING, MAX_BOOKMARKS, parseReading, toggleBookmark } from "./reading";

describe("reading data", () => {
  it("keeps only valid entries, once each", () => {
    const parsed = parseReading({
      last: { book: "bukhari", number: "349", at: 5 },
      bookmarks: [
        { book: "muslim", number: "8", at: 2 },
        { book: "muslim", number: "8", at: 1 },
        { book: "nope", number: "1" },
        { book: "bukhari", number: "x" },
        "junk",
        { book: "abudawud", number: "402.2" },
      ],
    });
    expect(parsed.last).toEqual({ book: "bukhari", number: "349", at: 5 });
    expect(parsed.bookmarks).toEqual([
      { book: "muslim", number: "8", at: 2 },
      { book: "abudawud", number: "402.2", at: 0 },
    ]);
    expect(parseReading(null)).toEqual(EMPTY_READING);
    expect(parseReading({ last: "bukhari 1", bookmarks: "all" })).toEqual(EMPTY_READING);
  });

  it("adds a bookmark at the top and removes it again", () => {
    const one = toggleBookmark(EMPTY_READING, "bukhari", "1", 10);
    const two = toggleBookmark(one, "muslim", "8", 20);
    expect(two.bookmarks.map((b) => b.number)).toEqual(["8", "1"]);
    expect(toggleBookmark(two, "bukhari", "1", 30).bookmarks.map((b) => b.number)).toEqual(["8"]);
  });

  it("keeps at most MAX_BOOKMARKS, dropping the oldest", () => {
    let data = EMPTY_READING;
    for (let i = 1; i <= MAX_BOOKMARKS + 3; i++) data = toggleBookmark(data, "bukhari", String(i), i);
    expect(data.bookmarks).toHaveLength(MAX_BOOKMARKS);
    expect(data.bookmarks[0].number).toBe(String(MAX_BOOKMARKS + 3));
  });
});
