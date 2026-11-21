import Link from "next/link";
import type { Translator } from "@/lib/i18n/translate";
import { layoutArabic, layoutTranslation, type Segment } from "@/lib/hadith/layout";
import type { Hadith } from "@/lib/hadith/types";
import { hadithAnchor, hadithHref } from "@/lib/links";
import CopyLinkButton from "./CopyLinkButton";

function Runs({ segments }: { segments: Segment[] }) {
  return segments.map((s, i) =>
    s.narrator ? (
      <span key={i} className="font-semibold text-foreground">
        {s.text}
      </span>
    ) : (
      s.text
    ),
  );
}

/** The Arabic text: the sanad smaller and quiet, the matn in paragraphs at the source's full stops (lib/hadith/layout.ts). */
function ArabicText({ text, sanadLabel }: { text: string; sanadLabel: string }) {
  const { sanad, paragraphs } = layoutArabic(text);
  return (
    <div className="font-arabic text-right" dir="rtl" lang="ar" translate="no">
      {sanad && (
        <p className="mb-3 text-[length:calc(1.2rem*var(--arabic-scale,1))] leading-[2] text-muted-foreground" aria-label={sanadLabel}>
          {sanad}
        </p>
      )}
      <div className="flex flex-col gap-3 text-[length:calc(1.5rem*var(--arabic-scale,1))] leading-[2.1] sm:text-[length:calc(1.7rem*var(--arabic-scale,1))]">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

/** A translation from the book's source: the sanad small and quiet above, the text in paragraphs (lib/hadith/layout.ts). */
function LaidOut({ text, language, sanadLabel }: { text: string; language: string; sanadLabel: string }) {
  const { sanad, paragraphs } = layoutTranslation(text, language);
  return (
    <div lang={language} className="max-w-[65ch]">
      {sanad && (
        <p className="mb-3 text-[length:calc(0.875rem*var(--latin-scale,1))] leading-relaxed text-muted-foreground" aria-label={sanadLabel}>
          <Runs segments={sanad} />
        </p>
      )}
      <div className="flex flex-col gap-3 text-[length:calc(1rem*var(--latin-scale,1))] leading-[1.8]">
        {paragraphs.map((p, i) => (
          <p key={i}>
            <Runs segments={p} />
          </p>
        ))}
      </div>
    </div>
  );
}

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
        <ArabicText text={hadith.arabic} sanadLabel={t("hadith.sanad")} />
      ) : (
        <p className="text-sm italic text-muted-foreground">{t("hadith.noArabic")}</p>
      )}

      <div className="mt-5 border-t border-border pt-4">
        {translation ? (
          <>
            {translation.language !== locale && (
              <p className="mb-2 text-xs font-semibold text-muted-foreground">{t(`hadith.fallback.${translation.language}`)}</p>
            )}
            {translation.source ? (
              // HadeethEnc's text is shown as delivered (its terms forbid changes): typography only.
              <p className="max-w-[65ch] whitespace-pre-line text-[length:calc(1rem*var(--latin-scale,1))] leading-[1.8]" lang={translation.language}>
                {translation.text}
              </p>
            ) : (
              <LaidOut text={translation.text} language={translation.language} sanadLabel={t("hadith.sanad")} />
            )}
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
