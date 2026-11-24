import Link from "next/link";
import { bookById } from "@/lib/hadith/books";
import { connection } from "next/server";
import { DAILY_BOOK, todaysNumber } from "@/lib/daily";
import { hadithExcerpt } from "@/lib/hadith/excerpt";
import { getHadithService } from "@/lib/hadith/service";
import { directionOf } from "@/lib/i18n/config";
import type { Translator } from "@/lib/i18n/translate";
import { localized } from "@/lib/i18n/translate";
import { hadithHref } from "@/lib/links";

/**
 * The hadith of the day (lib/daily.ts): its reference, the opening of its translation (or of the Arabic text, in Arabic)
 * and a link to the whole hadith. Nothing when the data cannot be read: the home page does not depend on it.
 */
export default async function DailyHadith({ i18n }: { i18n: Translator }) {
  const { t, locale } = i18n;
  // The day is read at request time, not when the page is built.
  await connection();
  const number = todaysNumber();
  const hadith = await getHadithService()
    .getHadith(DAILY_BOOK, number, locale)
    .catch(() => null);
  if (!hadith) return null;
  const arabic = hadithExcerpt({ ...hadith, translation: null }, 220);
  // Arabic readers get no translation; otherwise the translation sits under the Arabic.
  const translation = locale === "ar" || !hadith.translation ? null : hadithExcerpt(hadith, 220);
  const language = hadith.translation?.language ?? "en";
  const reference = t("hadith.inBook", { book: localized(bookById(DAILY_BOOK).name, locale), number });

  return (
    <section aria-labelledby="daily-hadith" className="hw-daily mb-10">
      <div className="hw-daily__top">
        <h2 id="daily-hadith" className="hw-eyebrow">
          {t("home.dailyTitle")}
        </h2>
        <i aria-hidden />
        <Link href={hadithHref(DAILY_BOOK, number)} className="hw-daily__ref">
          {reference}
        </Link>
      </div>
      <p dir="rtl" lang="ar" translate="no" className="font-arabic my-5 text-right text-[length:calc(1.7rem*var(--arabic-scale,1))] leading-[2.1] sm:text-[length:calc(2.15rem*var(--arabic-scale,1))]">
        {arabic}
      </p>
      {translation && (
        <p lang={language} dir={directionOf(language)} className="hw-daily__translation text-[length:calc(1.0625rem*var(--latin-scale,1))]">
          {translation}
        </p>
      )}
      <Link href={hadithHref(DAILY_BOOK, number)} className="hw-btn-solid mt-6">
        {t("home.dailyMore")} <span aria-hidden className="ms-2 rtl:-scale-x-100">&#8599;</span>
      </Link>
    </section>
  );
}
