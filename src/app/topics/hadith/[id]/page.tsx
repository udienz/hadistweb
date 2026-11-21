import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyLinkButton from "@/components/CopyLinkButton";
import { encLanguage, getCategories, getHadith, hadeethencUrl } from "@/lib/hadeethenc/client";
import { directionOf } from "@/lib/i18n/config";
import { languageName } from "@/lib/i18n/languages";
import { getI18n } from "@/lib/i18n/server";
import { encIdFromSegment, topicHadithHref, topicHref, topicsHref } from "@/lib/links";

export const instant = false;

export async function generateMetadata({ params }: PageProps<"/topics/hadith/[id]">): Promise<Metadata> {
  const id = encIdFromSegment((await params).id);
  if (id === null) return {};
  const { t, locale } = await getI18n();
  const hadith = await getHadith(encLanguage(locale), id).catch(() => null);
  return hadith ? { title: `${hadith.title} | ${t("meta.title")}` } : {};
}

/**
 * One HadeethEnc hadith: the Arabic text, the translation, grade and attribution, the explanation and the lessons.
 * Every text is shown as the API gives it (HadeethEnc's terms forbid changes), with the credit and a link to the original.
 */
export default async function TopicHadithPage({ params }: PageProps<"/topics/hadith/[id]">) {
  const id = encIdFromSegment((await params).id);
  if (id === null) notFound();
  const { t, locale } = await getI18n();
  const language = encLanguage(locale);
  const [hadith, categories] = await Promise.all([getHadith(language, id), getCategories(language)]);
  if (!hadith) notFound();
  const topics = hadith.categories.map((c) => categories.find((x) => x.id === c)).filter((c) => c !== undefined);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link href={topicsHref} className="text-sm font-medium text-primary hover:underline">
        <span className="inline-block rtl:-scale-x-100">&larr;</span> {t("topics.all")}
      </Link>

      <article className="mt-3 rounded-2xl border border-border bg-card px-5 py-5 sm:px-7">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <h1 className="font-display text-xl font-semibold sm:text-2xl" lang={hadith.language} dir={directionOf(hadith.language)}>
            {hadith.title}
          </h1>
          <CopyLinkButton href={topicHadithHref(id)} />
        </header>

        {hadith.arabic && (
          <p className="font-arabic text-right text-[length:calc(1.5rem*var(--arabic-scale,1))] leading-[2.1] sm:text-[length:calc(1.7rem*var(--arabic-scale,1))]" dir="rtl" lang="ar" translate="no">
            {hadith.arabic}
          </p>
        )}

        <div className="mt-5 border-t border-border pt-4">
          {hadith.language !== locale && (
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("topics.otherLanguage", { language: languageName(hadith.language, locale) })}</p>
          )}
          <p className="max-w-[65ch] whitespace-pre-line text-[length:calc(1rem*var(--latin-scale,1))] leading-[1.8]" lang={hadith.language} dir={directionOf(hadith.language)}>
            {hadith.text}
          </p>
        </div>

        <dl className="mt-4 flex flex-wrap gap-2 text-xs">
          {hadith.grade && (
            <div className="rounded-lg border border-border bg-background px-2.5 py-1">
              <dt className="inline text-muted-foreground">{t("topics.grade")}:</dt> <dd className="inline font-semibold">{hadith.grade}</dd>
            </div>
          )}
          {hadith.attribution && (
            <div className="rounded-lg border border-border bg-background px-2.5 py-1">
              <dt className="inline text-muted-foreground">{t("topics.attribution")}:</dt> <dd className="inline font-semibold">{hadith.attribution}</dd>
            </div>
          )}
        </dl>
      </article>

      {hadith.explanation && (
        <section className="mt-4 rounded-2xl border border-border bg-card px-5 py-5 sm:px-7">
          <h2 className="mb-2 font-display text-lg font-semibold">{t("topics.explanation")}</h2>
          <p className="max-w-[65ch] whitespace-pre-line text-[length:calc(1rem*var(--latin-scale,1))] leading-[1.8]" lang={hadith.language} dir={directionOf(hadith.language)}>
            {hadith.explanation}
          </p>
        </section>
      )}

      {hadith.lessons.length > 0 && (
        <section className="mt-4 rounded-2xl border border-border bg-card px-5 py-5 sm:px-7">
          <h2 className="mb-2 font-display text-lg font-semibold">{t("topics.lessons")}</h2>
          <ul className="flex max-w-[65ch] list-none flex-col gap-2 text-[length:calc(1rem*var(--latin-scale,1))] leading-[1.8]" lang={hadith.language} dir={directionOf(hadith.language)}>
            {hadith.lessons.map((lesson, i) => (
              <li key={i}>{lesson}</li>
            ))}
          </ul>
        </section>
      )}

      {topics.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{t("topics.inTopics")}</h2>
          <ul className="flex flex-wrap gap-2">
            {topics.map((c) => (
              <li key={c.id}>
                <Link prefetch={false} href={topicHref(c.id)} className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary/50 hover:text-primary">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {t("topics.credit")}{" "}
        <a href={hadeethencUrl(hadith.language, id)} className="font-medium text-primary hover:underline" rel="noopener">
          {t("topics.original")}
        </a>
      </p>
    </div>
  );
}
