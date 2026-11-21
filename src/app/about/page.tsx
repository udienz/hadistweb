import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: `${t("about.title")} | ${t("meta.title")}` };
}

export const instant = false;

/** What the site is, where its texts come from, and how missing translations are handled. */
export default async function AboutPage() {
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 font-display text-2xl font-semibold">{t("about.title")}</h1>
      <p className="mb-8 leading-relaxed text-muted-foreground">{t("about.intro")}</p>

      <section id="sources" className="mb-8 scroll-mt-24">
        <h2 className="mb-3 font-display text-lg font-semibold">{t("about.sourcesTitle")}</h2>
        <div className="flex flex-col gap-3 leading-relaxed">
          <p>
            <a href="https://github.com/fawazahmed0/hadith-api" className="font-medium text-primary hover:underline" rel="noopener">
              fawazahmed0/hadith-api
            </a>
            {": "}
            {t("about.fawaz")}
          </p>
          <p>
            <a href="https://hadeethenc.com" className="font-medium text-primary hover:underline" rel="noopener">
              HadeethEnc.com
            </a>
            {": "}
            {t("about.hadeethenc")}
          </p>
          <p className="text-muted-foreground">{t("about.fallback")}</p>
          <p className="text-muted-foreground">{t("about.chapterNames")}</p>
          <p className="text-muted-foreground">{t("about.languages")}</p>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        {t("about.code")}{" "}
        <a href="https://github.com/udienz/hadistweb" className="font-medium text-primary hover:underline" rel="noopener">
          {t("about.codeLink")}
        </a>
      </p>
    </div>
  );
}
