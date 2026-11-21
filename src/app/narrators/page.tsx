import type { Metadata } from "next";
import Link from "next/link";
import { narratorHref, narratorsHref } from "@/lib/hadith/narrators";
import { getSearcher } from "@/lib/hadith/search";
import { getI18n } from "@/lib/i18n/server";
import { shareMetadata } from "@/lib/site";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return shareMetadata({ title: `${t("narrators.title")} | ${t("meta.title")}`, description: t("narrators.intro"), path: narratorsHref() });
}

const first = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] : value) ?? "";

/** The narrators: a search by name, or the hundred with the most hadiths. */
export default async function NarratorsPage({ searchParams }: PageProps<"/narrators">) {
  const { t, tn } = await getI18n();
  const query = first((await searchParams).q).trim().slice(0, 80);
  const index = getSearcher().narrators();
  const list = index ? (query ? index.find(query, 100) : index.top(100)) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{t("narrators.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("narrators.intro")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t("narrators.note")}</p>

      <form action={narratorsHref()} method="get" role="search" className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="narrator-q">
          {t("narrators.searchLabel")}
        </label>
        <input
          id="narrator-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder={t("narrators.searchLabel")}
          maxLength={80}
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <button type="submit" className="h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 dark:text-[hsl(192_64%_8%)]">
          {t("search.submit")}
        </button>
      </form>

      {!index && <p className="mt-6 rounded-2xl border border-border bg-card px-5 py-4">{t("search.unavailable")}</p>}
      {index && (
        <>
          <h2 className="mb-3 mt-6 text-sm font-semibold text-muted-foreground">{query ? t("narrators.found", { query }) : t("narrators.top")}</h2>
          {list.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card px-5 py-4 text-muted-foreground">{t("narrators.none")}</p>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {list.map((n) => (
                <li key={n.key}>
                  <Link href={narratorHref(n.key)} prefetch={false} className="flex items-baseline justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5 hover:border-primary/50">
                    <span className="font-medium text-primary">{n.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{tn("common.hadiths", n.count)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
