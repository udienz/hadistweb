import Link from "next/link";
import type { Translator } from "@/lib/i18n/translate";
import type { Hadith } from "@/lib/hadith/types";
import { hadithAnchor, hadithHref } from "@/lib/links";
import CopyLinkButton from "./CopyLinkButton";

/**
 * One hadith: its number, the Arabic text, the translation (labelled when it is not in the interface language) and the
 * grades. A server component; only the copy button runs in the browser.
 */
export default function HadithCard({
  book,
  hadith,
  i18n,
  linkTitle = true,
}: {
  book: string;
  hadith: Hadith;
  i18n: Translator;
  /** On a chapter page the number links to the hadith's own page; on that page it does not. */
  linkTitle?: boolean;
}) {
  const { t, locale } = i18n;
  const href = hadithHref(book, hadith.number);
  const title = t("hadith.number", { number: hadith.number });
  const translation = hadith.translation;

  return (
    <article id={hadithAnchor(hadith.number)} className="scroll-mt-24 rounded-2xl border border-border bg-card px-5 py-5 sm:px-7">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-primary-soft px-2.5 font-display text-xs font-bold tabular-nums text-primary">
            {hadith.number}
          </span>
          <div className="leading-tight">
            {linkTitle ? (
              <Link href={href} className="font-semibold hover:text-primary hover:underline" aria-label={t("hadith.open", { number: hadith.number })}>
                {title}
              </Link>
            ) : (
              <span className="font-semibold">{title}</span>
            )}
            {hadith.arabicNumber && hadith.arabicNumber !== hadith.number && (
              <span className="block text-xs text-muted-foreground">{t("hadith.arabicNumber", { number: hadith.arabicNumber })}</span>
            )}
          </div>
        </div>
        <CopyLinkButton href={href} />
      </header>

      {hadith.arabic ? (
        <p className="font-arabic text-right text-2xl leading-[2.1] sm:text-[1.7rem]" dir="rtl" lang="ar" translate="no">
          {hadith.arabic}
        </p>
      ) : (
        <p className="text-sm italic text-muted-foreground">{t("hadith.noArabic")}</p>
      )}

      <div className="mt-5 border-t border-border pt-4">
        {translation ? (
          <>
            {translation.language !== locale && (
              <p className="mb-2 text-xs font-semibold text-muted-foreground">{t(`hadith.fallback.${translation.language}`)}</p>
            )}
            <p className="whitespace-pre-line leading-relaxed" lang={translation.language}>
              {translation.text}
            </p>
            {translation.source && (
              <>
                {translation.source.attribution && (
                  <p className="mt-3 text-sm" lang={translation.language}>
                    <span className="text-muted-foreground">{t("hadith.attribution")}:</span> {translation.source.attribution}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">{t("hadith.translationScope")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <a href={translation.source.url} className="font-medium text-primary hover:underline" rel="noopener">
                    {t("hadith.translationFrom", { source: translation.source.name })}
                  </a>
                </p>
              </>
            )}
          </>
        ) : (
          <p className="text-sm italic text-muted-foreground">{t("hadith.noTranslation")}</p>
        )}
      </div>

      {/* Grades as a footnote (the owner's choice, 2026-11-21): every grader the source names, in small type at the foot
          of the card, so they do not compete with the text. */}
      {hadith.grades.length > 0 && (
        <footer className="mt-5 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold">{t("hadith.grades")}:</span>{" "}
          {hadith.grades.map((g, i) => (
            <span key={`${g.grader}-${g.grade}`}>
              {i > 0 && "; "}
              {g.grader}: <span className="text-foreground">{g.grade}</span>
            </span>
          ))}
        </footer>
      )}
    </article>
  );
}
