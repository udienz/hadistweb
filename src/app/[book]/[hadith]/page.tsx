import type { Metadata } from "next";
import { shareMetadata } from "@/lib/site";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import HadithCard from "@/components/HadithCard";
import LastReadTracker from "@/components/LastReadTracker";
import { bookById } from "@/lib/hadith/books";
import { chapterTitle } from "@/lib/hadith/chapter-names";
import { hadithExcerpt } from "@/lib/hadith/excerpt";
import { getHadithService } from "@/lib/hadith/service";
import { isBookId } from "@/lib/hadith/types";
import { getI18n } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/translate";
import { bookHref, hadithHref, hadithInChapterHref, isHadithNumber } from "@/lib/links";
import { PAGE_SIZE_COOKIE, parsePageSize } from "@/lib/page-size";

export const instant = false;

export async function generateMetadata({ params }: PageProps<"/[book]/[hadith]">): Promise<Metadata> {
  const { book, hadith } = await params;
  if (!isBookId(book) || !isHadithNumber(hadith)) return {};
  const { t, locale } = await getI18n();
  const title = `${t("hadith.inBook", { book: localized(bookById(book).name, locale), number: hadith })} | ${t("meta.title")}`;
  // The description is the hadith itself, without its chain of narrators: what a link preview shows under the title.
  const found = await getHadithService().getHadith(book, hadith, locale).catch(() => null);
  return shareMetadata({ title, description: found ? hadithExcerpt(found) : undefined, path: hadithHref(book, hadith), type: "article" });
}

/** One hadith on its own page, to share or come back to. */
export default async function HadithPage({ params }: PageProps<"/[book]/[hadith]">) {
  const { book: id, hadith: number } = await params;
  if (!isBookId(id) || !isHadithNumber(number)) notFound();

  const i18n = await getI18n();
  const { t, locale } = i18n;
  const service = getHadithService();
  const hadith = await service.getHadith(id, number, locale);
  if (!hadith) notFound();

  // The chapter page that has this hadith, at the right page and scrolled to it.
  const result = await service.getChapter(id, hadith.chapter, locale);
  const position = result ? result.hadiths.findIndex((h) => h.number === number) + 1 : 1;
  const title = result ? chapterTitle(id, result.chapter, locale, t("book.unnamedChapter")) : null;
  const size = parsePageSize((await cookies()).get(PAGE_SIZE_COOKIE)?.value);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <LastReadTracker />
      <p className="mb-3 text-sm">
        <Link href={bookHref(id)} className="font-medium text-primary hover:underline">
          {localized(bookById(id).name, locale)}
        </Link>
        {title && (
          <>
            {" / "}
            <Link
              href={hadithInChapterHref(id, hadith.chapter, Math.max(1, position), number, size)}
              className="font-medium text-primary hover:underline"
              lang={title.lang}
            >
              {title.title}
            </Link>
          </>
        )}
      </p>
      <h1 className="sr-only">{t("hadith.inBook", { book: localized(bookById(id).name, locale), number })}</h1>
      <HadithCard book={id} hadith={hadith} i18n={i18n} linkTitle={false} />
    </div>
  );
}
