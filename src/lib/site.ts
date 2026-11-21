// The address of the site and what search engines may do with it. The same image runs at hadist.udienz.web.id and at
// the QA site, so the origin comes from the request: nginx passes the Host of its own server_name (only those two
// virtual hosts reach the app), and SITE_URL overrides it.

import type { Metadata } from "next";
import { headers } from "next/headers";

/** The image shown when a page is shared (public/og.png, 1200 by 630). */
export const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "HadistWeb" };

/** "https://hadist.udienz.web.id", from SITE_URL or the request. */
export async function siteOrigin(): Promise<string> {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const local = /^(localhost|127\.|\[::1\])/.test(host);
  const proto = h.get("x-forwarded-proto") ?? (local ? "http" : "https");
  return `${proto}://${host}`;
}

/** Only the production site is indexed: the QA site and local copies would compete with it as duplicates. */
export const isIndexed = (origin: string): boolean => /^https:\/\/hadist\.udienz\.web\.id$/.test(origin);

/**
 * Metadata for a page that may be shared: its own address as the canonical one, and the title, description and image
 * that link previews (WhatsApp, Telegram, X, Facebook) show. Next.js replaces the layout's openGraph object instead of
 * merging it, so every page sets all of it here.
 */
export function shareMetadata(input: {
  title: string;
  description?: string;
  path: string;
  type?: "website" | "article";
  /** False for the layout: a page without metadata of its own would inherit the home page as its canonical address. */
  canonical?: boolean;
}): Metadata {
  const { title, description, path, type = "website", canonical = true } = input;
  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical: path } } : {}),
    openGraph: { title, description, url: path, siteName: "HadistWeb", type, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}

/** A short plain-text excerpt for a description: whole words, at most `max` characters. */
export function excerpt(text: string, max = 180): string {
  // Quotation marks at the ends would be left unmatched by the cut: a description does not need them.
  const flat = text.replace(/\s+/g, " ").trim().replace(/^["“”'‘’]+|["“”'‘’]+$/g, "").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).trimEnd()}…`;
}
