"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { writeCookie } from "@/lib/cookies";
import { useI18n } from "@/lib/i18n/client";
import { chapterHref } from "@/lib/links";
import { PAGE_SIZE_COOKIE, PAGE_SIZES, type PageSize } from "@/lib/page-size";
import { pageOf } from "@/lib/pagination";

/**
 * Hadiths per page, 5 or 10. Changing it keeps the reader where they were: the new page is the one that holds the
 * first hadith shown now.
 */
export default function PageSizeSelect({ book, chapter, size, from }: { book: string; chapter: number; size: PageSize; from: number }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: PageSize) {
    if (next === size) return;
    writeCookie(PAGE_SIZE_COOKIE, String(next));
    startTransition(() => router.replace(chapterHref(book, chapter, pageOf(from, next))));
  }

  return (
    <div role="radiogroup" aria-label={t("pagination.perPage")} className="flex items-center gap-2 text-sm" aria-busy={pending}>
      <span className="text-muted-foreground">{t("pagination.perPage")}</span>
      <span className="flex rounded-full border border-border bg-card p-0.5">
        {PAGE_SIZES.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={option === size}
            onClick={() => choose(option)}
            className={`relative min-w-9 rounded-full px-3 py-1 font-medium tabular-nums after:absolute after:-inset-1 after:rounded-full ${
              option === size ? "bg-primary text-white dark:text-[hsl(192_64%_8%)]" : "text-primary hover:bg-muted"
            }`}
          >
            {option}
          </button>
        ))}
      </span>
    </div>
  );
}
