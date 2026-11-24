import Link from "next/link";
import { directionOf } from "@/lib/i18n/config";
import { languageName } from "@/lib/i18n/languages";
import type { Translator } from "@/lib/i18n/translate";
import { layoutArabic, layoutTranslation, type Segment } from "@/lib/hadith/layout";
import type { BookId, Hadith } from "@/lib/hadith/types";
import { explanationId } from "@/lib/hadith/explanations";
import { narratorHref, narratorKey } from "@/lib/hadith/narrators";
import { findQuranRefs, quranwebVerseUrl } from "@/lib/hadith/quran-refs";
import { hadithAnchor, hadithHref, topicHadithHref } from "@/lib/links";
import { bookById } from "@/lib/hadith/books";
import { localized } from "@/lib/i18n/translate";
import BookmarkButton from "./BookmarkButton";
import ShareMenu from "./ShareMenu";

/** Plain text, with each Qur'an reference in it ("(3.77)", "QS. Ali 'Imran: 77") linked to the verse on QuranWeb. */
function WithVerseLinks({ text, title }: { text: string; title: (surah: number, ayah: number) => string }) {
  const refs = findQuranRefs(text);
  if (refs.length === 0) return text;
  const parts: React.ReactNode[] = [];
  let at = 0;
  refs.forEach((r, i) => {
    if (r.start > at) parts.push(text.slice(at, r.start));
    parts.push(
      <a key={i} href={quranwebVerseUrl(r.surah, r.ayah)} title={title(r.surah, r.ayah)} target="_blank" rel="noopener" className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">
        {text.slice(r.start, r.end)}
      </a>,
    );
    at = r.end;
  });
  if (at < text.length) parts.push(text.slice(at));
  return parts;
}

function Runs({ segments, verseTitle }: { segments: Segment[]; verseTitle: (surah: number, ayah: number) => string }) {
  return segments.map((s, i) => {
    // A narrator's name links to the hadiths it is in (lib/hadith/narrators.ts); no prefetch, a chain has many names.
    const key = s.narrator ? narratorKey(s.text) : null;
    return s.narrator ? (
      key ? (
        <Link key={i} href={narratorHref(key)} prefetch={false} className="font-semibold text-foreground hover:text-primary hover:underline">
          {s.text}
        </Link>
      ) : (
        <span key={i} className="font-semibold text-foreground">
          {s.text}
        </span>
      )
    ) : (
      <WithVerseLinks key={i} text={s.text} title={verseTitle} />
    );
  });
}

/** The Arabic text: the sanad smaller and quiet, the matn in paragraphs at the source's full stops (lib/hadith/layout.ts). */
function ArabicText({ text, sanadLabel }: { text: string; sanadLabel: string }) {
  const { sanad, paragraphs } = layoutArabic(text);
  return (
    <div className="font-arabic text-right" dir="rtl" lang="ar" translate="no" data-share>
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
function LaidOut({ text, language, sanadLabel, verseTitle }: { text: string; language: string; sanadLabel: string; verseTitle: (surah: number, ayah: number) => string }) {
  const { sanad, paragraphs } = layoutTranslation(text, language);
  return (
    <div lang={language} dir={directionOf(language)} className="max-w-[65ch]" data-share>
      {sanad && (
        <p className="mb-3 text-[length:calc(0.875rem*var(--latin-scale,1))] leading-relaxed text-muted-foreground" aria-label={sanadLabel}>
          <Runs segments={sanad} verseTitle={verseTitle} />
        </p>
      )}
      <div className="flex flex-col gap-3 text-[length:calc(1rem*var(--latin-scale,1))] leading-[1.8]">
        {paragraphs.map((p, i) => (
          <p key={i}>
            <Runs segments={p} verseTitle={verseTitle} />
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * One hadith: its number, the Arabic text, the translation (labelled when it is not in the interface language) and the
 * grades. A server component; only the share menu runs in the browser.
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
  const second = hadith.second;
  const verseTitle = (surah: number, ayah: number) => t("hadith.quranLink", { verse: `${surah}:${ayah}` });
  const explanation = explanationId(book, hadith.number);

  return (
    <article id={hadithAnchor(hadith.number)} data-book={book} data-hadith={hadith.number} className="hw-card scroll-mt-24 rounded-2xl border px-5 py-5 sm:px-7">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="hw-num font-display">
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
        <div className="flex items-center gap-1">
          <BookmarkButton book={book as BookId} number={hadith.number} />
          <ShareMenu href={href} reference={t("hadith.inBook", { book: localized(bookById(book as BookId).name, locale), number: hadith.number })} />
        </div>
      </header>

      {hadith.arabic ? (
        <ArabicText text={hadith.arabic} sanadLabel={t("hadith.sanad")} />
      ) : (
        <p className="text-sm italic text-muted-foreground">{t("hadith.noArabic")}</p>
      )}

      {/* In Arabic no translation is shown (the hadith is already in the reader's language), unless they chose a second
          one. With a second translation the two stand side by side on a wide screen, one above the other on a phone. */}
      {(locale !== "ar" || second) && (
        <div className="mt-5 border-t border-border pt-4">
          <div className={second ? "grid gap-6 md:grid-cols-2" : undefined}>
            {locale !== "ar" && (
              <div>
                {second && translation && translation.language === locale && (
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("home.translationIn", { language: languageName(translation.language, locale) })}</p>
                )}
                {translation ? (
                  <>
                    {translation.language !== locale && (
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("hadith.fallback", { language: languageName(translation.language, locale) })}</p>
                    )}
                    {translation.source ? (
                      // HadeethEnc's text is shown as delivered (its terms forbid changes): typography only.
                      <p className="max-w-[65ch] whitespace-pre-line text-[length:calc(1rem*var(--latin-scale,1))] leading-[1.8]" lang={translation.language} dir={directionOf(translation.language)} data-share>
                        {translation.text}
                      </p>
                    ) : (
                      <LaidOut text={translation.text} language={translation.language} sanadLabel={t("hadith.sanad")} verseTitle={verseTitle} />
                    )}
                    {translation.source && (
                      <>
                        {translation.source.attribution && (
                          <p className="mt-3 text-sm" lang={translation.language} data-share>
                            <span className="text-muted-foreground">{t("hadith.attribution")}:</span> {translation.source.attribution}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">{t("hadith.translationScope")}</p>
                        <p className="mt-1 text-xs text-muted-foreground" data-share>
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
            )}
            {second && (
              <div className="md:border-s md:border-border md:ps-6">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("home.translationIn", { language: languageName(second.language, locale) })}</p>
                <LaidOut text={second.text} language={second.language} sanadLabel={t("hadith.sanad")} verseTitle={verseTitle} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* HadeethEnc's explanation of the same hadith, where one was matched (lib/hadith/explanations.ts). No prefetch:
          the page reads HadeethEnc's API. */}
      {explanation !== undefined && (
        <p className="mt-4 text-sm">
          <Link prefetch={false} href={topicHadithHref(explanation)} className="font-medium text-primary hover:underline">
            {t("hadith.explanationLink")} <span className="inline-block rtl:-scale-x-100">&rarr;</span>
          </Link>
        </p>
      )}

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
