import type { Metadata } from "next";
import BookmarkList from "@/components/BookmarkList";
import { getI18n } from "@/lib/i18n/server";
import { bookmarksHref } from "@/lib/links";
import { shareMetadata } from "@/lib/site";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  // The list lives in each reader's browser: nothing here for a search engine.
  return { ...shareMetadata({ title: `${t("reading.title")} | ${t("meta.title")}`, path: bookmarksHref }), robots: { index: false, follow: true } };
}

/** The reader's bookmarks, from this browser's storage. */
export default async function BookmarksPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{t("reading.title")}</h1>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">{t("reading.intro")}</p>
      <BookmarkList />
    </div>
  );
}
