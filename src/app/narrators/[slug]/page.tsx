import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Pagination from "@/components/Pagination";
import { bookById } from "@/lib/hadith/books";
import { keyFromSlug, narratorHref, narratorsHref } from "@/lib/hadith/narrators";
import { getSearcher } from "@/lib/hadith/search";
import { getI18n } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/translate";
import { hadithHref } from "@/lib/links";
import { clampPage, pageCount } from "@/lib/pagination";
import { shareMetadata } from "@/lib/site";

export const instant = false;

/** Hadiths per page of a narrator: references only, so many. */
const PER_PAGE = 50;

function findNarrator(slug: string) {
  const key = keyFromSlug(slug);
  return key ? (getSearcher().narrators()?.get(key) ?? null) : null;
}

export async function generateMetadata({ params }: PageProps<"/narrators/[slug]">): Promise<Metadata> {
  const narrator = findNarrator((await params).slug);
  if (!narrator) return {};
  const { t, tn } = await getI18n();
  return shareMetadata({ title: `${narrator.name} | ${t("narrators.title")} | ${t("meta.title")}`, description: `${narrator.name}: ${tn("common.hadiths", narrator.count)}`, path: narratorHref(narrator.key) });
}

/** One name in the chains and the hadiths it is in. */
export default async function NarratorPage({ params, searchParams }: PageProps<"/narrators/[slug]">) {
  const narrator = findNarrator((await params).slug);
  if (!narrator) notFound();
  const { t, tn, locale } = await getI18n();
  const page = clampPage((await searchParams).page, narrator.count, PER_PAGE);
  const hadiths = getSearcher().narrators()!.hadiths(narrator.key, page, PER_PAGE);
  const from = (page - 1) * PER_PAGE + 1;
  const pager = <Pagination basePath={narratorHref(narrator.key)} page={page} count={pageCount(narrator.count, PER_PAGE)} from={from} to={from + hadiths.length - 1} total={narrator.count} />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link href={narratorsHref()} className="text-sm font-medium text-primary hover:underline">
        <span className="inline-block rtl:-scale-x-100">&larr;</span> {t("narrators.title")}
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold" lang="id">
        {narrator.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{tn("common.hadiths", narrator.count)}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t("narrators.note")}</p>
      {pager}
      <ul className="flex flex-wrap gap-2">
        {hadiths.map((h) => (
          <li key={`${h.book}/${h.number}`}>
            <Link href={hadithHref(h.book, h.number)} prefetch={false} className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary/50 hover:text-primary">
              {t("hadith.inBook", { book: localized(bookById(h.book).name, locale), number: h.number })}
            </Link>
          </li>
        ))}
      </ul>
      {pager}
    </div>
  );
}
