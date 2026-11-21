"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { pageItems } from "@/lib/pagination";

/**
 * The pages of a list (a chapter, a topic): previous and next, the page numbers, and which hadiths are shown. Nothing for
 * one page. `basePath` is the address of the first page; later pages add `?page=n`. `prefetch={false}` for pages whose
 * data comes from an outside API (topics), so showing the numbers does not call it for every page.
 */
export default function Pagination({
  basePath,
  page,
  count,
  from,
  to,
  total,
  prefetch,
}: {
  basePath: string;
  prefetch?: boolean;
  page: number;
  count: number;
  from: number;
  to: number;
  total: number;
}) {
  const { t } = useI18n();
  if (count <= 1) return null;
  const href = (p: number) => (p > 1 ? `${basePath}?page=${p}` : basePath);

  // 36px to look at, 44px or more to tap: the ::after layer reaches 6px out from inside the 1px border.
  const box = "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium relative after:absolute after:-inset-1.5 after:rounded-full";
  const link = `${box} border border-border bg-card text-primary hover:bg-muted`;
  const off = `${box} border border-transparent text-muted-foreground/50`;

  return (
    <nav aria-label={t("pagination.label")} className="flex flex-wrap items-center justify-between gap-3 py-3">
      <p className="text-sm text-muted-foreground">{t("pagination.range", { from, to, total })}</p>
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link prefetch={prefetch} href={href(page - 1)} className={link} aria-label={t("pagination.previous")} rel="prev">
              &larr;
            </Link>
          ) : (
            <span className={off} aria-hidden>
              &larr;
            </span>
          )}
        </li>
        {pageItems(page, count).map((item, i) => (
          <li key={item === "gap" ? `gap-${i}` : item}>
            {item === "gap" ? (
              <span className={`${box} text-muted-foreground`} aria-hidden>
                …
              </span>
            ) : item === page ? (
              <span
                className={`${box} bg-primary text-white dark:text-[hsl(192_64%_8%)]`}
                aria-current="page"
                aria-label={t("pagination.page", { number: item })}
              >
                {item}
              </span>
            ) : (
              <Link prefetch={prefetch} href={href(item)} className={link} aria-label={t("pagination.page", { number: item })}>
                {item}
              </Link>
            )}
          </li>
        ))}
        <li>
          {page < count ? (
            <Link prefetch={prefetch} href={href(page + 1)} className={link} aria-label={t("pagination.next")} rel="next">
              &rarr;
            </Link>
          ) : (
            <span className={off} aria-hidden>
              &rarr;
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
