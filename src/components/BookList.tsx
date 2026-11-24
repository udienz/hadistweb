"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/client";

export type BookRow = { id: string; number: number; name: string; note: string | null; arabicName: string | null; href: string };

/** Lower case, no accents, no apostrophes or hyphens: "Jami' at-Tirmidzi" is found by "jami tirmidzi" or "jamiat". */
function fold(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ًͯ-ٰٟ]/g, "")
    .replace(/[ʼʻ'’`\-\s]/g, "")
    .toLowerCase();
}

/**
 * The list of books with a filter box above it: a book is found by its number, its name in the interface language or its
 * Arabic name. The list has ten books, so it narrows in place (no suggestions).
 */
export default function BookList({ books }: { books: BookRow[] }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = fold(query);
    if (!q) return books;
    return books.filter((b) => String(b.number) === q || fold(b.name).includes(q) || fold(b.id).includes(q) || (b.arabicName ? fold(b.arabicName).includes(q) : false));
  }, [books, query]);

  return (
    <section id="books" className="scroll-mt-20">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="hw-eyebrow mb-2">{t("meta.title")}</p>
          <h2 className="font-display text-2xl font-semibold text-primary sm:text-3xl">{t("home.listTitle")}</h2>
        </div>
        <input
          type="search"
          dir="auto"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("home.filterPlaceholder")}
          aria-label={t("home.filterPlaceholder")}
          className="hw-filter"
        />
      </div>
      {shown.length === 0 ? (
        <p role="status" className="hw-panel px-5 py-4 text-muted-foreground">
          {t("home.filterEmpty")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
          {shown.map((book) => (
            <li key={book.id}>
              <Link href={book.href} className="hw-book h-full">
                <span className="hw-num font-display">{book.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-semibold">{book.name}</span>
                  {book.note && <span className="block text-xs text-muted-foreground">{book.note}</span>}
                </span>
                {book.arabicName && (
                  <span className="font-arabic text-2xl text-primary" dir="rtl" lang="ar" translate="no">
                    {book.arabicName}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
