"use client";

import { useRouter } from "next/navigation";
import { useCallback, useOptimistic, useRef, useState, useTransition } from "react";
import { writeCookie } from "@/lib/cookies";
import { directionOf, isCommunityLocale, LOCALE_COOKIE, LOCALE_FLAGS, LOCALE_NAMES, MENU_LOCALES, reportTranslationUrl, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { useDismiss } from "@/lib/useDismiss";

/** The interface language: the cookie the server reads on every request. Until one is chosen, the browser's language. */
function useLocaleChoice(): { current: Locale; choose: (next: Locale) => void } {
  const { locale } = useI18n();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [current, setCurrent] = useOptimistic<Locale>(locale);

  function choose(next: Locale) {
    if (next === current) return;
    writeCookie(LOCALE_COOKIE, next);
    startTransition(() => {
      setCurrent(next);
      router.refresh();
    });
  }
  return { current, choose };
}

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" />
  </svg>
);

/**
 * The language button in the header and its dropdown (quranweb's menu): each language with a flag, and community
 * translations marked with an asterisk explained once under the list, which keeps the menu narrow.
 */
export default function LanguageMenu() {
  const { t } = useI18n();
  const { current, choose } = useLocaleChoice();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, box);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("nav.language")}: ${LOCALE_NAMES[current]}`}
        title={LOCALE_NAMES[current]}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold uppercase text-foreground transition hover:bg-muted"
      >
        <GlobeIcon />
        <span translate="no">{current}</span>
      </button>

      {open && (
        <div role="menu" aria-label={t("nav.language")} className="absolute end-0 top-full z-50 mt-2 max-h-[calc(100dvh-5rem)] w-60 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-2 shadow-lg">
          {MENU_LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={code === current}
              onClick={() => {
                close();
                choose(code);
              }}
              className="flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-start text-sm font-medium hover:bg-background"
            >
              <span className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element -- a 4:3 SVG from public/, nothing to optimise */}
                <img src={`/flags/${LOCALE_FLAGS[code]}.svg`} alt="" loading="lazy" width={20} height={15} className="h-[15px] w-5 shrink-0 rounded-[2px] border border-border object-cover" />
                <span lang={code} dir={directionOf(code)} translate="no">
                  {LOCALE_NAMES[code]}
                </span>
                {isCommunityLocale(code) && (
                  <span aria-label={t("nav.communityBadge")} title={t("nav.communityTranslation")} className="-ms-1.5 font-semibold text-primary">
                    *
                  </span>
                )}
              </span>
              {code === current && (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-primary">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              )}
            </button>
          ))}
          <div className="mt-1 border-t border-border px-3 pb-1 pt-2 text-xs text-muted-foreground">
            <p>
              <span className="font-semibold text-primary">*</span> {t("nav.communityTranslation")}
            </p>
            {isCommunityLocale(current) && (
              <a href={reportTranslationUrl(current)} target="_blank" rel="noopener noreferrer" onClick={close} className="mt-1.5 block font-medium text-primary hover:underline">
                {t("nav.reportTranslation")}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
