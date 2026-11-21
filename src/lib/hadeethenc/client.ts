// HadeethEnc.com (Rowwad Translation Center): hadiths by topic, with grade, attribution, explanation and lessons.
// Read live from its API on the server, not mirrored (the owner's decision, 2026-11-20). Responses are kept in a small
// in-process cache so a reader paging through a topic does not ask the API again.
//
// Terms (https://hadeethenc.com): the content may be reused without modification, addition or deletion, with
// HadeethEnc.com credited as publisher and source. So texts are shown exactly as the API gives them.

import { Memo } from "../memo";

export const HADEETHENC_API = "https://hadeethenc.com/api/v1";
/** HADEETHENC_API_URL replaces the API address; the browser tests point it to a fake server. */
const apiBase = (): string => process.env.HADEETHENC_API_URL?.trim().replace(/\/+$/, "") || HADEETHENC_API;
export const HADEETHENC_SITE = "https://hadeethenc.com";

/** The API's language codes we use. They match the interface languages. */
export type EncLanguage = "id" | "en";

export interface EncCategory {
  id: number;
  title: string;
  count: number;
  parent: number | null;
}

export interface EncHadithSummary {
  id: number;
  title: string;
}

export interface EncHadith {
  id: number;
  /** The language of the texts below: the reader's, or the other one when the reader's is missing. */
  language: EncLanguage;
  title: string;
  text: string;
  arabic: string;
  attribution: string;
  grade: string;
  explanation: string;
  lessons: string[];
  categories: number[];
}

export class EncNotFound extends Error {}

const lists = new Memo<unknown>(400);
const items = new Memo<EncHadith | null>(800);

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(`${apiBase()}${path}`, { headers: { Accept: "application/json" } });
  if (res.status === 404) throw new EncNotFound(path);
  if (!res.ok) throw new Error(`HadeethEnc answered ${res.status} for ${path}`);
  return res.json();
}

const clean = (s: unknown): string => (typeof s === "string" ? s.replace(/\r/g, "").trim() : "");

/** Every category in a language, flat, with its parent. */
export async function getCategories(language: EncLanguage): Promise<EncCategory[]> {
  const raw = (await lists.get(`categories/${language}`, () => getJson(`/categories/list/?language=${language}`))) as {
    id: string;
    title: string;
    hadeeths_count: string;
    parent_id: string | null;
  }[];
  return raw.map((c) => ({
    id: Number(c.id),
    title: clean(c.title),
    count: Number(c.hadeeths_count),
    parent: c.parent_id === null ? null : Number(c.parent_id),
  }));
}

/** One page of the hadiths in a category (its subcategories included, as the API counts them). */
export async function getCategoryHadiths(
  language: EncLanguage,
  category: number,
  page: number,
  perPage: number,
): Promise<{ hadiths: EncHadithSummary[]; total: number; pages: number }> {
  const key = `list/${language}/${category}/${page}/${perPage}`;
  const raw = (await lists.get(key, () =>
    getJson(`/hadeeths/list/?language=${language}&category_id=${category}&page=${page}&per_page=${perPage}`),
  )) as { data: { id: string; title: string }[]; meta: { total_items: string | number; last_page: string | number } };
  return {
    hadiths: raw.data.map((h) => ({ id: Number(h.id), title: clean(h.title) })),
    total: Number(raw.meta.total_items),
    pages: Number(raw.meta.last_page),
  };
}

interface RawHadith {
  id: string;
  title?: string;
  hadeeth?: string;
  hadeeth_ar?: string;
  attribution?: string;
  grade?: string;
  explanation?: string;
  hints?: string[];
  categories?: string[];
}

async function fetchHadith(language: EncLanguage, id: number): Promise<EncHadith | null> {
  let raw: RawHadith;
  try {
    raw = (await getJson(`/hadeeths/one/?language=${language}&id=${id}`)) as RawHadith;
  } catch (error) {
    if (error instanceof EncNotFound) return null;
    throw error;
  }
  return {
    id,
    language,
    title: clean(raw.title),
    text: clean(raw.hadeeth),
    arabic: clean(raw.hadeeth_ar),
    attribution: clean(raw.attribution),
    grade: clean(raw.grade),
    explanation: clean(raw.explanation),
    lessons: (raw.hints ?? []).map(clean).filter(Boolean),
    categories: (raw.categories ?? []).map(Number).filter(Number.isInteger),
  };
}

/** One hadith in the reader's language, or in the other one when that has no text; null when the id does not exist. */
export async function getHadith(language: EncLanguage, id: number): Promise<EncHadith | null> {
  const first = await items.get(`${language}/${id}`, () => fetchHadith(language, id));
  if (!first || first.text) return first;
  const other: EncLanguage = language === "id" ? "en" : "id";
  const second = await items.get(`${other}/${id}`, () => fetchHadith(other, id));
  return second?.text ? second : first;
}

/** The hadith's page on HadeethEnc.com, for the credit line. */
export const hadeethencUrl = (language: EncLanguage, id: number): string => `${HADEETHENC_SITE}/${language}/browse/hadith/${id}`;

/** The interface language as a HadeethEnc language. */
export const encLanguage = (locale: string): EncLanguage => (locale === "en" ? "en" : "id");
