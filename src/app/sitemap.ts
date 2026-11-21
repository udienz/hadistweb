import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/hadeethenc/client";
import { BOOKS } from "@/lib/hadith/books";
import { getSearcher } from "@/lib/hadith/search";
import { getHadithService } from "@/lib/hadith/service";
import { bookHref, chapterHref, hadithHref, topicHref, topicsHref } from "@/lib/links";
import { siteOrigin } from "@/lib/site";

/**
 * Sitemap 0 lists the home page, the books, their chapters and the topics; sitemaps 1 to 10 the hadiths of each book
 * (Bukhari alone has more than 7,000, and one file may hold 50,000). robots.ts names them all.
 */
export async function generateSitemaps() {
  return [{ id: 0 }, ...BOOKS.map((_, i) => ({ id: i + 1 }))];
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const origin = await siteOrigin();
  const entry = (path: string, priority?: number) => ({ url: `${origin}${path}`, ...(priority ? { priority } : {}) });
  const service = getHadithService();

  if (id === 0) {
    const pages = [entry("/", 1), entry(topicsHref, 0.8), entry("/about", 0.3), entry("/privacy", 0.2)];
    for (const book of BOOKS) {
      pages.push(entry(bookHref(book.id), 0.9));
      for (const chapter of await service.getChapters(book.id)) pages.push(entry(chapterHref(book.id, chapter.number), 0.7));
    }
    // The topic list comes from HadeethEnc; without it the sitemap still lists the books.
    const categories = await getCategories("id").catch(() => []);
    for (const category of categories) pages.push(entry(topicHref(category.id), 0.6));
    return pages;
  }

  const book = BOOKS[id - 1];
  if (!book) return [];
  // The numbers that have a page: from the search index (hadiths with a text), else every number the source lists.
  const numbers = getSearcher().numbers(book.id) ?? (await service.getNumbers(book.id));
  return numbers.map((n) => entry(hadithHref(book.id, n), 0.5));
}
