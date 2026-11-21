import { BOOKS } from "@/lib/hadith/books";
import type { BookId } from "@/lib/hadith/types";
import type { Translator } from "@/lib/i18n/translate";
import { localized } from "@/lib/i18n/translate";
import { searchHref } from "@/lib/links";

/**
 * The search box: words, or a reference such as "Bukhari 1", and an optional book. A plain GET form to /search, so it
 * works without JavaScript and every search has its own address.
 */
export default function SearchForm({ i18n, query = "", book, autoFocus }: { i18n: Translator; query?: string; book?: BookId; autoFocus?: boolean }) {
  const { t, locale } = i18n;
  return (
    <form action={searchHref()} method="get" role="search" className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor="search-q">
        {t("search.label")}
      </label>
      <input
        id="search-q"
        name="q"
        type="search"
        defaultValue={query}
        placeholder={t("search.placeholder")}
        maxLength={200}
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        className="h-11 w-full min-w-0 rounded-full border border-border bg-card px-4 sm:flex-1 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      />
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="search-book">
          {t("search.bookLabel")}
        </label>
        <select
          id="search-book"
          name="book"
          defaultValue={book ?? ""}
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-48 sm:flex-none"
        >
          <option value="">{t("search.allBooks")}</option>
          {BOOKS.map((b) => (
            <option key={b.id} value={b.id}>
              {localized(b.name, locale)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:text-[hsl(192_64%_8%)]"
        >
          {t("search.submit")}
        </button>
      </div>
    </form>
  );
}
