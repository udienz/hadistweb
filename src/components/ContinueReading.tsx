"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { bookById } from "@/lib/hadith/books";
import { useI18n } from "@/lib/i18n/client";
import { localized } from "@/lib/i18n/translate";
import { bookmarksHref, hadithHref } from "@/lib/links";
import { EMPTY_READING, readReading, subscribeReading } from "@/lib/reading";

/** On the home page: where the reader stopped, and their bookmarks. Nothing until there is something to show. */
export default function ContinueReading() {
  const { t, tn, locale } = useI18n();
  const { last, bookmarks } = useSyncExternalStore(subscribeReading, readReading, () => EMPTY_READING);
  if (!last && bookmarks.length === 0) return null;

  const card = "flex flex-1 flex-col rounded-2xl border border-border bg-card px-5 py-4 transition hover:border-primary/50 hover:shadow-sm";
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row">
      {last && (
        <Link href={hadithHref(last.book, last.number)} className={card}>
          <span className="text-sm text-muted-foreground">{t("reading.continue")}</span>
          <span className="font-semibold text-primary">{t("hadith.inBook", { book: localized(bookById(last.book).name, locale), number: last.number })}</span>
        </Link>
      )}
      {bookmarks.length > 0 && (
        <Link href={bookmarksHref} className={card}>
          <span className="text-sm text-muted-foreground">{t("reading.title")}</span>
          <span className="font-semibold text-primary">{tn("reading.count", bookmarks.length)}</span>
        </Link>
      )}
    </div>
  );
}
