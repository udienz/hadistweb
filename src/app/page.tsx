import type { Metadata } from "next";
import { shareMetadata } from "@/lib/site";
import Link from "next/link";
import { Suspense } from "react";
import ContinueReading from "@/components/ContinueReading";
import DailyHadith from "@/components/DailyHadith";
import BookList, { type BookRow } from "@/components/BookList";
import { BOOKS, translationOrder } from "@/lib/hadith/books";
import type { Book } from "@/lib/hadith/types";
import { languageName } from "@/lib/i18n/languages";
import type { Translator } from "@/lib/i18n/translate";
import { getI18n } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/translate";
import { narratorsHref } from "@/lib/hadith/narrators";
import { bookHref, searchHref, topicsHref } from "@/lib/links";

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
  const rows: BookRow[] = BOOKS.map((book, i) => ({
    id: book.id,
    number: i + 1,
    name: localized(book.name, locale),
    note: translationNote(book, i18n),
    arabicName: book.arabicName ?? null,
    href: bookHref(book.id),
  }));
  const linkCard = "hw-panel flex items-center justify-between gap-3 px-5 py-4 transition";

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-7 sm:px-6 lg:pt-10">
      <section className="hw-hero mb-8">
        <div className="hw-hero__text">
          <p className="hw-eyebrow">{t("meta.title")}</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-primary sm:text-5xl">{t("home.title")}</h1>
          <p className="hw-hero__sub">{t("home.subtitle")}</p>
          <p className="hw-hero__tagline">{t("home.tagline")}</p>
          <div className="hw-hero__row">
            <form action={searchHref()} method="get" role="search" className="hw-hero__search">
              <input type="search" name="q" maxLength={200} autoComplete="off" enterKeyHint="search" placeholder={t("search.placeholder")} aria-label={t("search.label")} className="hw-hero__input" />
              <button type="submit" className="hw-btn-outline">
                {t("search.submit")}
              </button>
            </form>
            <Link href={bookHref("bukhari")} className="hw-btn-solid">
              {t("home.start")} <span aria-hidden className="ms-2 rtl:-scale-x-100">&#8599;</span>
            </Link>
          </div>
        </div>
        <div className="hw-hero__art" aria-hidden>
          <p className="hw-hero__bismillah font-arabic" dir="rtl" lang="ar" translate="no">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      </section>

      <ContinueReading />
      {/* Streamed: the rest of the page does not wait for the hadith's data. */}
      <Suspense fallback={null}>
        <DailyHadith i18n={i18n} />
      </Suspense>

      <BookList books={rows} />

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link href={narratorsHref()} className={linkCard}>
          <span>
            <span className="block font-display text-lg font-semibold text-primary">{t("narrators.homeLink")}</span>
            <span className="block text-sm text-muted-foreground">{t("narrators.homeText")}</span>
          </span>
          <span aria-hidden className="text-primary">
            <span className="inline-block rtl:-scale-x-100">&rarr;</span>
          </span>
        </Link>
        <Link href={topicsHref} className={linkCard}>
          <span>
            <span className="block font-display text-lg font-semibold text-primary">{t("topics.homeLink")}</span>
            <span className="block text-sm text-muted-foreground">{t("topics.homeText")}</span>
          </span>
          <span aria-hidden className="text-primary">
            <span className="inline-block rtl:-scale-x-100">&rarr;</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
