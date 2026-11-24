import type { ReactNode } from "react";

/** The head of a book, chapter or topic page: centred on the paper, with a gold rule under it (quranweb's surah head). */
export default function PageHead({
  eyebrow,
  title,
  titleLang,
  arabic,
  sub,
  subLang,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  titleLang?: string;
  /** The Arabic name of a book, above the title. */
  arabic?: string;
  sub?: ReactNode;
  subLang?: string;
}) {
  return (
    <header className="hw-head">
      {eyebrow && <p className="hw-eyebrow">{eyebrow}</p>}
      {arabic && (
        <p className="hw-head__arabic font-arabic mt-2" dir="rtl" lang="ar" translate="no">
          {arabic}
        </p>
      )}
      <h1 className="hw-head__title font-display" lang={titleLang}>
        {title}
      </h1>
      {sub && (
        <p className="hw-head__sub" lang={subLang}>
          {sub}
        </p>
      )}
      <span className="hw-ornament" aria-hidden />
    </header>
  );
}
