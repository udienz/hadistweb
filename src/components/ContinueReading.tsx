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

  const card = "hw-panel flex flex-1 items-center gap-4 px-5 py-3.5 transition";
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      {last && (
        <Link href={hadithHref(last.book, last.number)} className={card}>
          <span className="hw-diamond font-display" aria-hidden>
            <span>{last.number}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-muted-foreground">{t("reading.continue")}</span>
            <span className="block truncate text-lg font-semibold">{t("hadith.inBook", { book: localized(bookById(last.book).name, locale), number: last.number })}</span>
          </span>
        </Link>
      )}
      {bookmarks.length > 0 && (
        <Link href={bookmarksHref} className={card}>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-muted-foreground">{t("reading.title")}</span>
            <span className="block truncate text-lg font-semibold">{tn("reading.count", bookmarks.length)}</span>
          </span>
        </Link>
      )}
    </div>
  );
}
