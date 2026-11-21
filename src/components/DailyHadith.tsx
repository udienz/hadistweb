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
  const language = locale === "ar" || !hadith.translation ? "ar" : hadith.translation.language;
  const text = locale === "ar" ? hadithExcerpt({ ...hadith, translation: null }, 220) : hadithExcerpt(hadith, 220);

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card px-5 py-5 sm:px-7">
      <h2 className="text-sm font-semibold text-muted-foreground">{t("home.dailyTitle")}</h2>
      <p className="mt-0.5 font-display font-semibold text-primary">
        {t("hadith.inBook", { book: localized(bookById(DAILY_BOOK).name, locale), number })}
      </p>
      <p lang={language} dir={directionOf(language)} className={`mt-2 max-w-[65ch] ${language === "ar" ? "font-arabic text-xl leading-loose" : "leading-relaxed"}`}>
        {text}
      </p>
      <Link href={hadithHref(DAILY_BOOK, number)} className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
        {t("home.dailyMore")} <span className="inline-block rtl:-scale-x-100">&rarr;</span>
      </Link>
    </section>
  );
}
