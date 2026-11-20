// The HadeethEnc client against a fake API (fetch stubbed): no network in tests. The client caches per process, so
// each test uses its own ids.

import { afterEach, describe, expect, it, vi } from "vitest";
import { getCategories, getCategoryHadiths, getHadith, hadeethencUrl } from "./client";

type Answer = { status: number; body?: unknown };

function fakeApi(routes: Record<string, Answer>) {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const path = url.replace("https://hadeethenc.com/api/v1", "");
      calls.push(path);
      const answer = routes[path] ?? { status: 404 };
      return new Response(answer.body === undefined ? "" : JSON.stringify(answer.body), { status: answer.status });
    }),
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

const one = (id: number, language: string, text: string) => ({
  [`/hadeeths/one/?language=${language}&id=${id}`]: {
    status: 200,
    body: {
      id: String(id),
      title: `Title ${language}`,
      hadeeth: text,
      hadeeth_ar: "نص",
      attribution: "Muttafaq 'alaih",
      grade: "Sahih",
      explanation: "Line one\r\nLine two",
      hints: ["Lesson one\r", "", "Lesson two"],
      categories: ["59", "x"],
    },
  },
});

describe("HadeethEnc client", () => {
  it("maps the category list and keeps the tree through parent ids", async () => {
    fakeApi({
      "/categories/list/?language=en": {
        status: 200,
        body: [
          { id: "3", title: "Creed", hadeeths_count: "459", parent_id: null },
          { id: "59", title: "Belief in Allah", hadeeths_count: "138", parent_id: "3" },
        ],
      },
    });
    expect(await getCategories("en")).toEqual([
      { id: 3, title: "Creed", count: 459, parent: null },
      { id: 59, title: "Belief in Allah", count: 138, parent: 3 },
    ]);
  });

  it("reads a page of a category with its totals", async () => {
    fakeApi({
      "/hadeeths/list/?language=id&category_id=59&page=2&per_page=20": {
        status: 200,
        body: { data: [{ id: "66512", title: "Islam dibangun di atas lima perkara" }], meta: { total_items: "138", last_page: 7 } },
      },
    });
    expect(await getCategoryHadiths("id", 59, 2, 20)).toEqual({
      hadiths: [{ id: 66512, title: "Islam dibangun di atas lima perkara" }],
      total: 138,
      pages: 7,
    });
  });

  it("returns a hadith in the reader's language, with carriage returns and empty lessons removed", async () => {
    fakeApi(one(1001, "id", "Teks hadis"));
    expect(await getHadith("id", 1001)).toEqual({
      id: 1001,
      language: "id",
      title: "Title id",
      text: "Teks hadis",
      arabic: "نص",
      attribution: "Muttafaq 'alaih",
      grade: "Sahih",
      explanation: "Line one\nLine two",
      lessons: ["Lesson one", "Lesson two"],
      categories: [59],
    });
  });

  it("falls back to the other language when the reader's has no text, and caches both", async () => {
    const calls = fakeApi({ ...one(1002, "id", ""), ...one(1002, "en", "Hadith text") });
    expect(await getHadith("id", 1002)).toMatchObject({ language: "en", text: "Hadith text" });
    await getHadith("id", 1002);
    expect(calls).toHaveLength(2);
  });

  it("answers null for an id HadeethEnc does not have, and throws on a server error", async () => {
    fakeApi({ "/hadeeths/one/?language=id&id=1004": { status: 500 } });
    expect(await getHadith("id", 1003)).toBeNull();
    await expect(getHadith("id", 1004)).rejects.toThrow(/HadeethEnc answered 500/);
  });

  it("links to the hadith on HadeethEnc.com", () => {
    expect(hadeethencUrl("id", 66512)).toBe("https://hadeethenc.com/id/browse/hadith/66512");
  });
});
