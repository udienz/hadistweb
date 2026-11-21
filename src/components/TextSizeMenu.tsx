"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { writeCookie } from "@/lib/cookies";
import { TRANSLATION_LANGUAGES } from "@/lib/hadith/types";
import { languageName } from "@/lib/i18n/languages";
import { parseSecond, SECOND_COOKIE } from "@/lib/second-translation";
import {
  applyFontSize,
  DEFAULT_FONT_SIZE,
  FONT_SCALES,
  FONT_SIZE_KEY,
  parseFontSize,
  stepFontScale,
  subscribeDisplay,
  type FontSize,
} from "@/lib/display";
import { useI18n } from "@/lib/i18n/client";
import { useDismiss } from "@/lib/useDismiss";

// Snapshots are strings so useSyncExternalStore sees a stable value between renders (as in quranweb).
function rawFontSize(): string {
  try {
    return localStorage.getItem(FONT_SIZE_KEY) ?? "";
  } catch {
    return "";
  }
}

function useFontSize(): FontSize {
  const raw = useSyncExternalStore(subscribeDisplay, rawFontSize, () => "");
  try {
    return parseFontSize(JSON.parse(raw || "null")) ?? DEFAULT_FONT_SIZE;
  } catch {
    return DEFAULT_FONT_SIZE;
  }
}

function SizeRow({ kind }: { kind: keyof FontSize }) {
  const { t } = useI18n();
  const fontSize = useFontSize();
  const value = fontSize[kind];
  const label = t(kind === "arabic" ? "display.arabicSize" : "display.latinSize");
  const step = (direction: 1 | -1) => applyFontSize({ ...fontSize, [kind]: stepFontScale(value, direction) });
  const button =
    "relative flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background font-semibold transition after:absolute after:-inset-2 after:rounded-full hover:bg-muted disabled:opacity-40 disabled:hover:bg-background";
  return (
    <div role="group" aria-label={label} className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => step(-1)} disabled={value === FONT_SCALES[0]} aria-label={t("display.smaller", { name: label })} className={button}>
          <span aria-hidden dir="ltr" className="text-xs">
            {kind === "arabic" ? <span className="font-arabic text-sm">ع</span> : "A"}−
          </span>
        </button>
        <output aria-live="polite" className="w-12 text-center tabular-nums text-xs text-muted-foreground">
          {Math.round(value * 100)}%
        </output>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={value === FONT_SCALES[FONT_SCALES.length - 1]}
          aria-label={t("display.larger", { name: label })}
          className={button}
        >
          <span aria-hidden dir="ltr" className="text-sm">
            {kind === "arabic" ? <span className="font-arabic text-base">ع</span> : "A"}+
          </span>
        </button>
      </div>
    </div>
  );
}

function readSecondCookie(): string {
  return document.cookie.match(new RegExp(`(?:^|; )${SECOND_COOKIE}=([^;]*)`))?.[1] ?? "";
}

/** A second translation beside the first: a cookie the server reads, then the page is rendered again with it. */
function SecondTranslationRow() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const current = parseSecond(useSyncExternalStore(() => () => {}, readSecondCookie, () => "")) ?? "";
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{t("display.secondTranslation")}</span>
      <select
        value={current}
        disabled={pending}
        onChange={(e) => {
          writeCookie(SECOND_COOKIE, e.target.value);
          startTransition(() => router.refresh());
        }}
        className="h-9 rounded-full border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <option value="">{t("display.secondNone")}</option>
        {TRANSLATION_LANGUAGES.map((code) => (
          <option key={code} value={code}>
            {languageName(code, locale)}
          </option>
        ))}
      </select>
    </label>
  );
}

/** The text size button in the header: Arabic and translation sizes, each on quranweb's scale, kept in this browser. */
export default function TextSizeMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, box);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t("display.textSize")}
        title={t("display.textSize")}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-foreground transition hover:bg-muted"
      >
        <span aria-hidden>
          A<span className="text-xs">a</span>
        </span>
      </button>
      {open && (
        <div role="dialog" aria-label={t("display.textSize")} className="absolute end-0 top-full z-50 mt-2 w-72 rounded-2xl border border-border bg-card p-4 shadow-lg">
          <div className="flex flex-col gap-3">
            <SizeRow kind="arabic" />
            <SizeRow kind="latin" />
            <div className="border-t border-border pt-3">
              <SecondTranslationRow />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
