import type { Metadata } from "next";
import { shareMetadata } from "@/lib/site";
import Link from "next/link";
import { encLanguage, getCategories, HADEETHENC_SITE } from "@/lib/hadeethenc/client";
import { getI18n } from "@/lib/i18n/server";
import { topicHref } from "@/lib/links";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return shareMetadata({ title: `${t("topics.title")} | ${t("meta.title")}`, description: t("topics.intro"), path: "/topics" });
}

/** The seven main topics of HadeethEnc, each with its topics folded underneath. */
export default async function TopicsPage() {
  const { t, tn, locale } = await getI18n();
  const categories = await getCategories(encLanguage(locale));
  const roots = categories.filter((c) => c.parent === null);
  const children = (id: number) => categories.filter((c) => c.parent === id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <section
        className="on-dark mb-8 rounded-2xl px-6 py-6 text-white sm:px-10"
        style={{ background: "linear-gradient(135deg, hsl(var(--hero-from)), hsl(var(--hero-to)))" }}
      >
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("topics.title")}</h1>
        <p className="mt-1 max-w-2xl text-white/75">{t("topics.intro")}</p>
      </section>

      <ul className="flex flex-col gap-3">
        {roots.map((root) => {
          const subs = children(root.id);
          return (
            <li key={root.id} className="rounded-2xl border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
                <Link prefetch={false} href={topicHref(root.id)} className="font-display text-lg font-semibold hover:text-primary hover:underline">
                  {root.title}
                </Link>
                <span className="text-xs text-muted-foreground">{tn("common.hadiths", root.count)}</span>
              </div>
              {subs.length > 0 ? (
                <details className="px-5 pb-4 pt-2">
                  <summary className="cursor-pointer text-sm font-medium text-primary">
                    {t("topics.showSubtopics")} ({subs.length})
                  </summary>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {subs.map((c) => (
                      <li key={c.id}>
                        <Link prefetch={false} href={topicHref(c.id)} className="inline-block rounded-full border border-border bg-background px-3 py-1.5 text-sm hover:border-primary/50 hover:text-primary">
                          {c.title} <span className="text-xs text-muted-foreground">{c.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <div className="pb-4" />
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm text-muted-foreground">
        {t("topics.credit")}{" "}
        <a href={HADEETHENC_SITE} className="font-medium text-primary hover:underline" rel="noopener">
          HadeethEnc.com
        </a>
      </p>
    </div>
  );
}
