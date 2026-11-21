import Link from "next/link";
import type { GradeFilter } from "@/lib/hadith/grade";
import type { Translator } from "@/lib/i18n/translate";

/**
 * Show all hadiths of a chapter, or only the sahih and hasan ones, or only the sahih ones, by one grader
 * (lib/hadith/grade.ts). Plain links (the filter is in the URL), so the choice can be shared and works without JavaScript.
 */
export default function GradeFilterLinks({ i18n, grader, current, href }: { i18n: Translator; grader: string; current: GradeFilter | null; href: (filter: GradeFilter | null) => string }) {
  const { t } = i18n;
  const options: [GradeFilter | null, string][] = [
    [null, t("grade.all")],
    ["accepted", t("grade.accepted")],
    ["sahih", t("grade.sahih")],
  ];
  return (
    <nav aria-label={t("grade.by", { grader })} className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">{t("grade.by", { grader })}</span>
      <span className="flex flex-wrap rounded-full border border-border bg-card p-0.5">
        {options.map(([filter, label]) => (
          <Link
            key={filter ?? "all"}
            href={href(filter)}
            aria-current={filter === current ? "true" : undefined}
            className={`relative rounded-full px-3 py-1 font-medium after:absolute after:-inset-1 after:rounded-full ${
              filter === current ? "bg-primary text-white dark:text-[hsl(192_64%_8%)]" : "text-primary hover:bg-muted"
            }`}
          >
            {label}
          </Link>
        ))}
      </span>
    </nav>
  );
}
