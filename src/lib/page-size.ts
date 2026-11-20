// How many hadiths a chapter page shows: 5 or 10, the reader's choice. Kept in a cookie so the server renders the
// right page; 10 is the default.

export const PAGE_SIZE_COOKIE = "hw-page-size";
export const PAGE_SIZES = [5, 10] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 10;

export function parsePageSize(value: string | undefined): PageSize {
  const n = Number(value);
  return (PAGE_SIZES as readonly number[]).includes(n) ? (n as PageSize) : DEFAULT_PAGE_SIZE;
}
