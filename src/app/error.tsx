"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";

/** Shown when a page fails, in practice when the hadith data source does not answer. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">{t("error.title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("error.description")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-block rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-[hsl(190_70%_12%)] hover:opacity-90"
      >
        {t("error.retry")}
      </button>
    </div>
  );
}
