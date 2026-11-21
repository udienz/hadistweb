"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { bookById } from "@/lib/hadith/books";
import { useI18n } from "@/lib/i18n/client";
import { localized } from "@/lib/i18n/translate";
import { hadithHref } from "@/lib/links";
import { EMPTY_READING, readReading, subscribeReading, toggleBookmark, writeReading } from "@/lib/reading";

/** The bookmarks kept in this browser, newest first, each with a button to remove it. */
export default function BookmarkList() {
  const { t, locale } = useI18n();
  const { bookmarks } = useSyncExternalStore(subscribeReading, readReading, () => EMPTY_READING);

  if (bookmarks.length === 0) return <p className="rounded-2xl border border-border bg-card px-5 py-4 text-muted-foreground">{t("reading.empty")}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {bookmarks.map((b) => {
        const reference = t("hadith.inBook", { book: localized(bookById(b.book).name, locale), number: b.number });
        return (
          <li key={`${b.book}/${b.number}`} className="flex items-center gap-2 rounded-2xl border border-border bg-card ps-5 pe-2">
            <Link href={hadithHref(b.book, b.number)} className="min-w-0 flex-1 py-3.5 font-semibold text-primary hover:underline">
              {reference}
            </Link>
            <button
              type="button"
              onClick={() => writeReading(toggleBookmark(readReading(), b.book, b.number, Date.now()))}
              aria-label={`${t("reading.remove")}: ${reference}`}
              className="shrink-0 rounded-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {t("reading.remove")}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
