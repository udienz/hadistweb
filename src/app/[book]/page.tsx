import type { Metadata } from "next";
import PageHead from "@/components/PageHead";
import { shareMetadata } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bookById } from "@/lib/hadith/books";
import { chapterTitle } from "@/lib/hadith/chapter-names";
import { getHadithService } from "@/lib/hadith/service";
import { isBookId } from "@/lib/hadith/types";
import { getI18n } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/translate";
import { bookHref, chapterHref } from "@/lib/links";

export const instant = false;

export async function generateMetadata({ params }: PageProps<"/[book]">): Promise<Metadata> {
  const { book } = await params;
  if (!isBookId(book)) return {};
  const { t, locale } = await getI18n();
  const name = localized(bookById(book).name, locale);
  return shareMetadata({ title: `${name} | ${t("meta.title")}`, description: `${name}: ${t("meta.description")}`, path: bookHref(book) });
}

/** One book: its name and the list of its chapters. */
export default async function BookPage({ params }: PageProps<"/[book]">) {
  const { book: id } = await params;
  if (!isBookId(id)) notFound();
  const book = bookById(id);
  const [{ t, tn, locale }, chapters] = await Promise.all([getI18n(), getHadithService().getChapters(id)]);
  const total = chapters.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <PageHead
          arabic={book.arabicName}
          title={localized(book.name, locale)}
          sub={
            <>
              {tn("common.chapters", chapters.length)} · {tn("common.hadiths", total)}
            </>
          }
        />
      </div>

      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">{t("book.chapters")}</h2>
        {locale === "id" && book.translations.includes("id") && <p className="text-xs text-muted-foreground">{t("book.chapterNamesNote")}</p>}
      </div>
      <ol className="overflow-hidden rounded-2xl border border-border bg-card">
        {chapters.map((c) => {
          const title = chapterTitle(id, c, locale, t("book.unnamedChapter"));
          return (
            <li key={c.number} className="border-b border-border last:border-b-0">
              <Link href={chapterHref(id, c.number)} className="flex items-center gap-4 px-4 py-3 transition hover:bg-muted">
                <span className="w-10 shrink-0 text-end font-display text-sm font-semibold tabular-nums text-primary">
                  {c.number === 0 ? "–" : c.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium" lang={title.lang}>
                    {title.title}
                  </span>
                  {title.original && (
                    <span className="block text-xs text-muted-foreground" lang="en">
                      {title.original}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{tn("common.hadiths", c.count)}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
