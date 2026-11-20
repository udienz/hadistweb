"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

/** Copies the address of one hadith's page. */
export default function CopyLinkButton({ href }: { href: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${location.origin}${href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="relative flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground after:absolute after:-inset-1 after:rounded-full"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
        <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
      </svg>
      <span aria-live="polite">{copied ? t("hadith.copied") : t("hadith.copyLink")}</span>
    </button>
  );
}
