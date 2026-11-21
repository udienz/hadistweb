import type { Metadata } from "next";
import { shareMetadata } from "@/lib/site";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import GradeFilterLinks from "@/components/GradeFilterLinks";
import HadithCard from "@/components/HadithCard";
import { GRADER, hadithGrade, parseGradeFilter, passesFilter } from "@/lib/hadith/grade";
import LastReadTracker from "@/components/LastReadTracker";
import PageSizeSelect from "@/components/PageSizeSelect";
import Pagination from "@/components/Pagination";
import { bookById } from "@/lib/hadith/books";
import { chapterTitle } from "@/lib/hadith/chapter-names";
import { getHadithService } from "@/lib/hadith/service";
import { isBookId } from "@/lib/hadith/types";
import { getI18n } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/translate";
import { bookHref, chapterFromSegment, chapterHref } from "@/lib/links";
import { PAGE_SIZE_COOKIE, parsePageSize } from "@/lib/page-size";
import { parseSecond, SECOND_COOKIE } from "@/lib/second-translation";
import { clampPage, pageCount, pageRange } from "@/lib/pagination";

export const instant = false;

export async function generateMetadata({ params }: PageProps<"/[book]/chapter/[chapter]">): Promise<Metadata> {
  const { book, chapter } = await params;
  if (!isBookId(book) || chapterFromSegment(chapter) === null) return {};
  const { t, locale } = await getI18n();
  const title = `${localized(bookById(book).name, locale)}, ${t("book.chapterLabel", { number: chapter })}`;
  return shareMetadata({ title: `${title} | ${t("meta.title")}`, description: `${title}. ${t("meta.description")}`, path: chapterHref(book, Number(chapter)) });
}

/** One chapter of a book, 5 or 10 hadiths per page (the reader's choice, in a cookie). */
export default async function ChapterPage({ params, searchParams }: PageProps<"/[book]/chapter/[chapter]">) {
  const { book: id, chapter: segment } = await params;
  const number = chapterFromSegment(segment);
  if (!isBookId(id) || number === null) notFound();

  const i18n = await getI18n();
  const { t, locale } = i18n;
  const service = getHadithService();
  const second = parseSecond((await cookies()).get(SECOND_COOKIE)?.value);
  const [result, chapters] = await Promise.all([service.getChapter(id, number, locale, { second }), service.getChapters(id)]);
  if (!result) notFound();

  const { chapter } = result;
  // The grade filter (lib/hadith/grade.ts), in the URL, for the books that have grades.
  const grader = GRADER[id] ?? null;
  const grade = grader ? parseGradeFilter((await searchParams).grade) : null;
  const hadiths = result.hadiths.filter((h) => passesFilter(hadithGrade(id, h.grades).level, grade));
  const total = hadiths.length;
  const withGrade = (href: string) => (grade ? `${href}${href.includes("?") ? "&" : "?"}grade=${grade}` : href);
  const size = parsePageSize((await cookies()).get(PAGE_SIZE_COOKIE)?.value);
  const count = pageCount(total, size);
  const page = clampPage((await searchParams).page, total, size);
  const { from, to } = pageRange(page, total, size);
  const position = chapters.findIndex((c) => c.number === chapter.number);
  const prev = chapters[position - 1];
  const next = chapters[position + 1];
  const title = chapterTitle(id, chapter, locale, t("book.unnamedChapter"));
  const pager = <Pagination basePath={withGrade(chapterHref(id, chapter.number))} page={page} count={count} from={from} to={to} total={total} />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <LastReadTracker />
      <Link href={bookHref(id)} className="text-sm font-medium text-primary hover:underline">
        <span className="inline-block rtl:-scale-x-100">&larr;</span> {localized(bookById(id).name, locale)} · {t("chapter.backToBook")}
      </Link>
      <header
        className="on-dark mb-4 mt-3 rounded-2xl px-6 py-5 text-white sm:px-8"
        style={{ background: "linear-gradient(135deg, hsl(var(--hero-from)), hsl(var(--hero-to)))" }}
      >
        <p className="text-sm text-gold">{chapter.number === 0 ? localized(bookById(id).name, locale) : t("book.chapterLabel", { number: chapter.number })}</p>
        <h1 className="mt-1 font-display text-2xl font-bold" lang={title.lang}>
          {title.title}
        </h1>
        {title.original && (
          <p className="mt-0.5 text-sm text-white/75" lang="en">
            {title.original}
          </p>
        )}
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageSizeSelect book={id} chapter={chapter.number} size={size} from={from} grade={grade} />
        {grader && (
          <GradeFilterLinks i18n={i18n} grader={grader} current={grade} href={(filter) => (filter ? `${chapterHref(id, chapter.number)}?grade=${filter}` : chapterHref(id, chapter.number))} />
        )}
      </div>
      {total === 0 && <p className="mt-4 rounded-2xl border border-border bg-card px-5 py-4 text-muted-foreground">{t("grade.none")}</p>}
      {pager}
      <div className="flex flex-col gap-4">
        {hadiths.slice(from - 1, to).map((h) => (
          <HadithCard key={h.number} book={id} hadith={h} i18n={i18n} />
        ))}
      </div>
      {pager}

      <nav className="mt-4 flex flex-wrap justify-between gap-3 text-sm">
        {prev ? (
          <Link href={chapterHref(id, prev.number)} rel="prev" className="rounded-full border border-border bg-card px-4 py-2 font-medium text-primary hover:bg-muted">
            <span className="inline-block rtl:-scale-x-100">&larr;</span> {t("chapter.previous")}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={chapterHref(id, next.number)} rel="next" className="rounded-full border border-border bg-card px-4 py-2 font-medium text-primary hover:bg-muted">
            {t("chapter.next")} <span className="inline-block rtl:-scale-x-100">&rarr;</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
