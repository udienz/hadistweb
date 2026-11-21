import type { MetadataRoute } from "next";
import { BOOKS } from "@/lib/hadith/books";
import { isIndexed, siteOrigin } from "@/lib/site";

/** Production: everything may be crawled, with the sitemaps (one for the pages, one per book). Elsewhere: nothing. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await siteOrigin();
  if (!isIndexed(origin)) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/search" },
    sitemap: [0, ...BOOKS.map((_, i) => i + 1)].map((id) => `${origin}/sitemap/${id}.xml`),
  };
}
