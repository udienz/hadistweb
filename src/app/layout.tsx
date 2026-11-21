import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource/amiri/arabic-400.css";
import "@fontsource/amiri/arabic-700.css";
import "@fontsource/amiri/latin-400.css";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import LanguageMenu from "@/components/LanguageMenu";
import Logo from "@/components/Logo";
import TextSizeMenu from "@/components/TextSizeMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { I18nProvider } from "@/lib/i18n/client";
import { MESSAGES } from "@/lib/i18n/messages";
import { displayScript } from "@/lib/display";
import { getI18n } from "@/lib/i18n/server";
import { directionOf } from "@/lib/i18n/config";
import { searchHref } from "@/lib/links";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("meta.title"), description: t("meta.description") };
}

// The colour of the browser's bar: the page background of each theme (as in quranweb).
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2eb" },
    { media: "(prefers-color-scheme: dark)", color: "#071b20" },
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
            <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-2 px-4">
              <Link href="/" className="flex items-center gap-2.5" aria-label="HadistWeb">
                <Logo />
                {/* Below 400px the five header buttons need the room: the name is hidden there, the logo stays (and names the link). */}
                <span className="hidden font-display text-xl font-bold tracking-tight text-primary min-[400px]:inline">HadistWeb</span>
              </Link>
              <nav className="hidden rounded-full border border-border bg-card p-1 text-sm sm:flex">
                <Link href="/" className="whitespace-nowrap rounded-full px-4 py-1.5 font-medium hover:bg-background">
                  {t("nav.books")}
                </Link>
                <Link href="/topics" className="whitespace-nowrap rounded-full px-4 py-1.5 font-medium hover:bg-background">
                  {t("nav.topics")}
                </Link>
                <Link href="/about" className="whitespace-nowrap rounded-full px-4 py-1.5 font-medium hover:bg-background">
                  {t("nav.about")}
                </Link>
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
