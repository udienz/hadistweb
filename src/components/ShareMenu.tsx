"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useDismiss } from "@/lib/useDismiss";

/**
 * The text to copy or share for one hadith: the parts of its card marked `data-share` (the Arabic text, the translation,
 * the source line where there is one) as the reader sees them, then the reference and the address. Read from the page
 * rather than passed in, so the texts are not sent to the browser a second time.
 */
export function shareText(card: Element | null, reference: string, url: string): string {
  const parts = card ? [...card.querySelectorAll<HTMLElement>("[data-share]")].map((el) => el.innerText.trim()).filter(Boolean) : [];
  return [...parts, `(${reference})`, url].join("\n\n");
}

const noSubscribe = () => () => {};

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
  </svg>
);

/**
 * Share one hadith: copy its text with the reference and link, copy only the link, the device's own share sheet (where
 * the browser has one, mostly on phones), or WhatsApp. `href` is the hadith's own page, `reference` how it is cited
 * ("Shahih al-Bukhari, hadis 1").
 */
export default function ShareMenu({ href, reference }: { href: string; reference: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<"text" | "link" | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, box);
  // The share sheet exists only in some browsers (mostly on phones); the server renders without it.
  const canShare = useSyncExternalStore(
    noSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );

  const url = () => `${location.origin}${href}`;
  const text = () => shareText(box.current?.closest("article") ?? null, reference, url());

  async function copy(what: "text" | "link") {
    try {
      await navigator.clipboard.writeText(what === "text" ? text() : url());
      setDone(what);
      setTimeout(() => setDone(null), 1500);
    } catch {}
    setOpen(false);
  }

  async function share() {
    setOpen(false);
    try {
      await navigator.share({ title: reference, text: text() });
    } catch {}
  }

  const item = "flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-start text-sm font-medium hover:bg-background";
  const label = done === "text" ? t("hadith.textCopied") : done === "link" ? t("hadith.copied") : t("hadith.share");

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground after:absolute after:-inset-1 after:rounded-full"
      >
        <ShareIcon />
        <span aria-live="polite">{label}</span>
      </button>
      {open && (
        <div role="menu" aria-label={t("hadith.share")} className="absolute end-0 top-full z-20 mt-1 w-56 rounded-2xl border border-border bg-card p-2 shadow-lg">
          <button type="button" role="menuitem" className={item} onClick={() => copy("text")}>
            {t("hadith.copyText")}
          </button>
          <button type="button" role="menuitem" className={item} onClick={() => copy("link")}>
            {t("hadith.copyLink")}
          </button>
          {canShare && (
            <button type="button" role="menuitem" className={item} onClick={share}>
              {t("hadith.shareVia")}
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              window.open(`https://wa.me/?text=${encodeURIComponent(text())}`, "_blank", "noopener,noreferrer");
              setOpen(false);
            }}
          >
            WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
