import type { MetadataRoute } from "next";
import { getI18n } from "@/lib/i18n/server";
import { isIndexed, siteOrigin } from "@/lib/site";

/**
 * The web app manifest, as in quranweb: lets the site be installed on a phone or computer, with its own icon and window
 * (scripts/app-icons.mjs draws the icons). In the reader's language, per request. Nothing works offline: there is no
 * service worker.
 *
 * Only the production site is installable (the owner's decision, 2026-11-22): elsewhere (the QA site, a local copy) the
 * display is "browser", which browsers do not offer to install, so readers do not end up with the test copy as an app.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { locale, t } = await getI18n();
  const production = isIndexed(await siteOrigin());
  return {
    name: production ? t("meta.title") : `${t("meta.title")} (QA)`,
    short_name: t("meta.title"),
    description: t("meta.description"),
    lang: locale,
    start_url: "/",
    scope: "/",
    display: production ? "standalone" : "browser",
    // The light theme's background (the splash screen) and primary colour (the logo's background).
    background_color: "#f5f2eb",
    theme_color: "#344c3d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
