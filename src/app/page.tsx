import type { Metadata } from "next";
import { shareMetadata } from "@/lib/site";
import Link from "next/link";
import { Suspense } from "react";
import ContinueReading from "@/components/ContinueReading";
import DailyHadith from "@/components/DailyHadith";
import SearchForm from "@/components/SearchForm";
import { BOOKS, translationOrder } from "@/lib/hadith/books";
import type { Book } from "@/lib/hadith/types";
import { languageName } from "@/lib/i18n/languages";
import type { Translator } from "@/lib/i18n/translate";
import { getI18n } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/translate";
import { bookHref, topicsHref } from "@/lib/links";

// Rendered per request: the layout reads the language from the request.
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return shareMetadata({ title: t("meta.title"), description: t("meta.description"), path: "/" });
}

/** What a book offers a reader of this language, when it is not a translation in that language: nothing to say otherwise. */
function translationNote(book: Book, { t, locale }: Translator): string | null {
  const order = translationOrder(book, locale);
  if (locale === "ar" || order[0] === locale) return null;
  const own = languageName(locale, locale);
  if (book.hadeethenc) return t(book.hadeethenc === "all" ? "home.translationFrom" : "home.translationPartly", { language: own, source: "HadeethEnc.com" });
  return order[0] ? t("home.translationIn", { language: languageName(order[0], locale) }) : null;
}

/** The books. The list is fixed (lib/hadith/books.ts), so this page needs no data source. */
export default async function Home() {
  const i18n = await getI18n();
  const { t, locale } = i18n;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <section
        className="on-dark mb-8 rounded-2xl px-6 py-6 text-white sm:px-10 sm:py-8"
        style={{ background: "linear-gradient(135deg, hsl(var(--hero-from)), hsl(var(--hero-to)))" }}
      >
        <p className="font-arabic text-center text-3xl text-gold sm:text-4xl" dir="rtl" lang="ar" translate="no">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <h1 className="mt-3 text-center font-display text-2xl font-bold sm:text-3xl">{t("home.title")}</h1>
        <p className="mx-auto mt-1 max-w-xl text-center text-white/75">{t("home.subtitle")}</p>
        <div className="mt-4 flex justify-center">
          <Link href={bookHref("bukhari")} className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-[hsl(190_70%_12%)] hover:opacity-90">
            {t("home.start")}
          </Link>
        </div>
      </section>

      <div className="mb-8">
        <SearchForm i18n={i18n} />
      </div>
      <ContinueReading />
      {/* Streamed: the rest of the page does not wait for the hadith's data. */}
      <Suspense fallback={null}>
        <DailyHadith i18n={i18n} />
      </Suspense>

      <h2 className="mb-5 font-display text-xl font-semibold">{t("home.listTitle")}</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BOOKS.map((book, i) => (
          <li key={book.id}>
            <Link
              href={bookHref(book.id)}
              className="flex h-full items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3.5 transition hover:border-primary/50 hover:shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 rotate-45 items-center justify-center rounded-md bg-primary-soft text-primary">
                <span className="-rotate-45 font-display text-xs font-bold">{i + 1}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{localized(book.name, locale)}</span>
                {translationNote(book, i18n) && <span className="block text-xs text-muted-foreground">{translationNote(book, i18n)}</span>}
              </span>
              {book.arabicName && (
                <span className="font-arabic text-xl text-primary" dir="rtl" lang="ar" translate="no">
                  {book.arabicName}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={topicsHref}
        className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4 transition hover:border-primary/50 hover:shadow-sm"
      >
        <span>
          <span className="block font-display text-lg font-semibold text-primary">{t("topics.homeLink")}</span>
          <span className="block text-sm text-muted-foreground">{t("topics.homeText")}</span>
        </span>
        <span aria-hidden className="text-primary">
          <span className="inline-block rtl:-scale-x-100">&rarr;</span>
        </span>
      </Link>
    </div>
  );
}
