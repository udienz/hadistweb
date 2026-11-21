import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Pagination from "@/components/Pagination";
import SearchForm from "@/components/SearchForm";
import { BOOKS, bookById } from "@/lib/hadith/books";
import { isBareNumber, parseReference } from "@/lib/hadith/reference";
import { parseGradeFilter } from "@/lib/hadith/grade";
import { getSearcher, SEARCH_PAGE_SIZE, snippetParts } from "@/lib/hadith/search";
import { getHadithService } from "@/lib/hadith/service";
import { isBookId, type BookId } from "@/lib/hadith/types";
import { getI18n } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/translate";
import { clampPage, pageCount } from "@/lib/pagination";
import { hadithHref, searchHref } from "@/lib/links";

export const instant = false;

const first = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] : value) ?? "";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { t } = await getI18n();
  const query = first((await searchParams).q).trim();
  // A page of results is not worth indexing; the empty search page is.
  return { title: `${t("search.title")} | ${t("meta.title")}`, robots: query ? { index: false, follow: true } : undefined };
}

/**
 * Search: words in the Arabic, Indonesian and English texts, or a reference ("Bukhari 1") that opens the hadith. A bare
 * number with no book chosen lists the books that have a hadith with that number.
 */
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const query = first(params.q).trim().slice(0, 200);
  const rawBook = first(params.book);
  const book: BookId | undefined = isBookId(rawBook) ? rawBook : undefined;
  const grade = parseGradeFilter(params.grade);

  const i18n = await getI18n();
  const { t, tn, locale } = i18n;
  const service = getHadithService();

  const reference = query ? parseReference(query, book) : null;
  if (reference && (await service.exists(reference.book, { hadith: reference.number }).catch(() => false))) {
    redirect(hadithHref(reference.book, reference.number));
  }

  const numberIn =
    query && !book && isBareNumber(query)
      ? (
          await Promise.all(
            BOOKS.map(async (b) => ((await service.exists(b.id, { hadith: query.trim() }).catch(() => false)) ? b : null)),
          )
        ).filter((b) => b !== null)
      : [];

  const searcher = getSearcher();
  const available = searcher.available();
  let result = query && available && numberIn.length === 0 ? searcher.search(query, { book, page: 1, locale, grade }) : null;
  const page = result ? clampPage(first(params.page), result.total, SEARCH_PAGE_SIZE) : 1;
  if (result && page > 1) result = searcher.search(query, { book, page, locale, grade });
  const from = (page - 1) * SEARCH_PAGE_SIZE + 1;
  const to = result ? Math.min(result.total, from + result.hits.length - 1) : 0;
  const pager = result && (
    <Pagination basePath={searchHref(query, book, 1, grade)} page={page} count={pageCount(result.total, SEARCH_PAGE_SIZE)} from={from} to={to} total={result.total} />
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 font-display text-2xl font-bold">{t("search.title")}</h1>
      <SearchForm i18n={i18n} query={query} book={book} grade={grade} autoFocus={!query} />
      <p className="mt-3 text-sm text-muted-foreground">{t("search.hint")}</p>

      {!available && <p className="mt-6 rounded-2xl border border-border bg-card px-5 py-4">{t("search.unavailable")}</p>}

      {numberIn.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card px-5 py-4">
          <p className="font-medium">{t("search.numberIn", { number: query.trim() })}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {numberIn.map((b) => (
              <li key={b.id}>
                <Link href={hadithHref(b.id, query.trim())} className="inline-block rounded-full border border-border px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted">
                  {localized(b.name, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && result.total === 0 && <p className="mt-6 rounded-2xl border border-border bg-card px-5 py-4">{t("search.none", { query })}</p>}

      {result && result.total > 0 && (
        <>
          <p className="mb-3 mt-6 text-sm font-medium" aria-live="polite">
            {tn("search.results", result.total)}
          </p>
          {pager}
          <ol className="flex flex-col gap-3">
            {result.hits.map((hit) => (
              <li key={`${hit.book}/${hit.number}`}>
                <Link
                  href={hadithHref(hit.book, hit.number)}
                  className="block rounded-2xl border border-border bg-card px-5 py-4 transition hover:border-primary/50 hover:shadow-sm"
                >
                  <span className="block text-sm font-semibold text-primary">
                    {t("hadith.inBook", { book: localized(bookById(hit.book).name, locale), number: hit.number })}
                  </span>
                  <span
                    lang={hit.language}
                    dir={hit.language === "ar" ? "rtl" : "ltr"}
                    className={`mt-1.5 block ${hit.language === "ar" ? "font-arabic text-xl leading-loose" : "text-[0.95rem] leading-relaxed"}`}
                  >
                    {snippetParts(hit.snippet).map((part, i) =>
                      part.match ? (
                        <mark key={i} className="rounded bg-gold/30 px-0.5 text-foreground">
                          {part.text}
                        </mark>
                      ) : (
                        <span key={i}>{part.text}</span>
                      ),
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          {pager}
        </>
      )}
    </div>
  );
}
