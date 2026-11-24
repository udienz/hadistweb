import type { Metadata, Viewport } from "next";
import { isIndexed, shareMetadata, siteOrigin } from "@/lib/site";
import Link from "next/link";
import "@fontsource/amiri/arabic-400.css";
import "@fontsource/amiri/arabic-700.css";
import "@fontsource/amiri/latin-400.css";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import LanguageMenu from "@/components/LanguageMenu";
import Logo from "@/components/Logo";
import NavLink from "@/components/NavLink";
import TextSizeMenu from "@/components/TextSizeMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { I18nProvider } from "@/lib/i18n/client";
import { MESSAGES } from "@/lib/i18n/messages";
import { displayScript } from "@/lib/display";
import { getI18n } from "@/lib/i18n/server";
import { directionOf } from "@/lib/i18n/config";
import { bookmarksHref, searchHref } from "@/lib/links";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  const origin = await siteOrigin();
  return {
    metadataBase: new URL(origin),
    ...shareMetadata({ title: t("meta.title"), description: t("meta.description"), path: "/", canonical: false }),
    // The QA site and local copies are not indexed (robots.ts disallows them too).
    robots: isIndexed(origin) ? undefined : { index: false, follow: false },
  };
}

// The colour of the browser's bar: the page background of each theme (as in quranweb).
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2eb" },
    { media: "(prefers-color-scheme: dark)", color: "#141c17" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, t } = await getI18n();

  return (
    <html lang={locale} dir={directionOf(locale)} className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Apply the theme and text size before the first paint so the page does not flash. */}
        <script dangerouslySetInnerHTML={{ __html: displayScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <I18nProvider locale={locale} messages={MESSAGES[locale]}>
          <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
            {/* On phones the navigation takes a second row, so the controls never push the header wider than the screen. */}
            <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-2 sm:h-16 sm:flex-nowrap sm:py-0">
              <Link href="/" className="flex items-center gap-2.5" aria-label="HadistWeb">
                <span className="hw-tile">
                  <span className="flex [--primary:43_45%_82%] [--gold:42_55%_66%]">
                    <Logo size={26} />
                  </span>
                </span>
                {/* Below 480px the header buttons need the room: the name is hidden there, the logo stays (and names the link). */}
                <span className="hidden font-display text-xl font-bold tracking-tight text-primary min-[480px]:inline">HadistWeb</span>
              </Link>
              <nav className="order-last flex w-full flex-wrap justify-center text-sm sm:order-none sm:w-auto">
                <NavLink href="/" section="books">
                  {t("nav.books")}
                </NavLink>
                <NavLink href="/topics" section="topics">
                  {t("nav.topics")}
                </NavLink>
                <NavLink href={bookmarksHref}>{t("nav.bookmarks")}</NavLink>
                <NavLink href="/about">{t("nav.about")}</NavLink>
              </nav>
              <div className="flex items-center gap-2">
                <Link
                  href={searchHref()}
                  aria-label={t("nav.search")}
                  title={t("nav.search")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </Link>
                <TextSizeMenu />
                <LanguageMenu />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
            {/* The sources and credits of all content are on the About page. */}
            <Link href="/about" className="text-primary hover:underline">
              {t("footer.about")}
            </Link>
            {" · "}
            <Link href="/privacy" className="text-primary hover:underline">
              {t("footer.privacy")}
            </Link>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
