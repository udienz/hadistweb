"use client";

import { useSyncExternalStore } from "react";
import type { BookId } from "@/lib/hadith/types";
import { useI18n } from "@/lib/i18n/client";
import { EMPTY_READING, readReading, sameHadith, subscribeReading, toggleBookmark, writeReading } from "@/lib/reading";

/** Bookmark one hadith in this browser, or remove the bookmark. */
export default function BookmarkButton({ book, number }: { book: BookId; number: string }) {
  const { t } = useI18n();
  const data = useSyncExternalStore(subscribeReading, readReading, () => EMPTY_READING);
  const marked = data.bookmarks.some((b) => sameHadith(b, { book, number }));

  return (
    <button
      type="button"
      aria-pressed={marked}
      onClick={() => writeReading(toggleBookmark(readReading(), book, number, Date.now()))}
      className={`relative flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition hover:bg-muted after:absolute after:-inset-1 after:rounded-full ${
        marked ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={marked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
        <path d="M6 3h12v18l-6-4.5L6 21z" />
      </svg>
      <span>{marked ? t("reading.bookmarked") : t("reading.bookmark")}</span>
    </button>
  );
}
