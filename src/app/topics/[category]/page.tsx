import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Pagination from "@/components/Pagination";
import { encLanguage, getCategories, getCategoryHadiths, HADEETHENC_SITE, type EncCategory } from "@/lib/hadeethenc/client";
import { getI18n } from "@/lib/i18n/server";
import { encIdFromSegment, topicHadithHref, topicHref, topicsHref } from "@/lib/links";
import { clampPage } from "@/lib/pagination";

export const instant = false;

/** Hadiths per page of a topic: titles only, so more than on a chapter page. */
const PER_PAGE = 20;

async function findCategory(segment: string, locale: string) {
  const id = encIdFromSegment(segment);
  if (id === null) return null;
  const categories = await getCategories(encLanguage(locale));
  const category = categories.find((c) => c.id === id);
  return category ? { category, categories } : null;
}

export async function generateMetadata({ params }: PageProps<"/topics/[category]">): Promise<Metadata> {
  const { category } = await params;
  const { t, locale } = await getI18n();
  const found = await findCategory(category, locale).catch(() => null);
  return found ? { title: `${found.category.title} | ${t("meta.title")}` } : {};
}

/** The topics above this one, from the top. */
function ancestors(category: EncCategory, all: EncCategory[]): EncCategory[] {
  const chain: EncCategory[] = [];
  let parent = all.find((c) => c.id === category.parent);
  while (parent && chain.length < 10) {
    chain.unshift(parent);
    parent = all.find((c) => c.id === parent!.parent);
  }
  return chain;
}

/** One topic: where it sits, its own topics, and a page of its hadiths (titles linking to each hadith). */
export default async function TopicPage({ params, searchParams }: PageProps<"/topics/[category]">) {
  const { category: segment } = await params;
  const { t, tn, locale } = await getI18n();
  const found = await findCategory(segment, locale);
  if (!found) notFound();
  const { category, categories } = found;

  const requested = clampPage((await searchParams).page, Math.max(category.count, 1), PER_PAGE);
  const { hadiths, total, pages } = await getCategoryHadiths(encLanguage(locale), category.id, requested, PER_PAGE);
  const page = Math.min(requested, Math.max(pages, 1));
  const from = (page - 1) * PER_PAGE + 1;
  const subs = categories.filter((c) => c.parent === category.id);
  const pager = <Pagination prefetch={false} basePath={topicHref(category.id)} page={page} count={pages} from={from} to={from + hadiths.length - 1} total={total} />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <nav className="text-sm">
        <Link href={topicsHref} className="font-medium text-primary hover:underline">
          {t("topics.all")}
        </Link>
        {ancestors(category, categories).map((a) => (
          <span key={a.id}>
            {" / "}
            <Link prefetch={false} href={topicHref(a.id)} className="font-medium text-primary hover:underline">
              {a.title}
            </Link>
          </span>
        ))}
      </nav>
      <header
        className="on-dark mb-6 mt-3 rounded-2xl px-6 py-5 text-white sm:px-8"
        style={{ background: "linear-gradient(135deg, hsl(var(--hero-from)), hsl(var(--hero-to)))" }}
      >
        <h1 className="font-display text-2xl font-bold">{category.title}</h1>
        <p className="mt-1 text-sm text-white/75">{tn("common.hadiths", category.count)}</p>
      </header>

      {subs.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 font-display text-lg font-semibold">{t("topics.subtopics")}</h2>
          <ul className="flex flex-wrap gap-2">
            {subs.map((c) => (
              <li key={c.id}>
                <Link prefetch={false} href={topicHref(c.id)} className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary/50 hover:text-primary">
                  {c.title} <span className="text-xs text-muted-foreground">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold">{t("topics.hadiths")}</h2>
        {pager}
        <ol className="overflow-hidden rounded-2xl border border-border bg-card" start={from}>
          {hadiths.map((h, i) => (
            <li key={h.id} className="border-b border-border last:border-b-0">
              <Link prefetch={false} href={topicHadithHref(h.id)} className="flex items-baseline gap-4 px-4 py-3 transition hover:bg-muted">
                <span className="w-8 shrink-0 text-end text-xs tabular-nums text-muted-foreground">{from + i}</span>
                <span className="font-medium">{h.title}</span>
              </Link>
            </li>
          ))}
        </ol>
        {pager}
      </section>

      <p className="mt-6 text-sm text-muted-foreground">
        {t("topics.credit")}{" "}
        <a href={HADEETHENC_SITE} className="font-medium text-primary hover:underline" rel="noopener">
          HadeethEnc.com
        </a>
      </p>
    </div>
  );
}
