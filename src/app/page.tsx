import Link from "next/link";
import { BOOKS } from "@/lib/hadith/books";
import { getI18n } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/translate";
import { bookHref, topicsHref } from "@/lib/links";

// Rendered per request: the layout reads the language from the request.
export const instant = false;

/** The books. The list is fixed (lib/hadith/books.ts), so this page needs no data source. */
export default async function Home() {
  const { t, locale } = await getI18n();

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
                {book.indonesianFrom ? (
                  <span className="block text-xs text-muted-foreground">{t(book.indonesianPartly ? "home.indonesianPartly" : "home.indonesianFrom", { source: book.indonesianFrom })}</span>
                ) : (
                  !book.translations.includes("id") && <span className="block text-xs text-muted-foreground">{t("home.englishOnly")}</span>
                )}
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
          &rarr;
        </span>
      </Link>
    </div>
  );
}
