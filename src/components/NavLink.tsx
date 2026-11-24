"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** A header link that marks the page it points to (an underline and `aria-current`), as in quranweb. */
export default function NavLink({ href, children, section }: { href: string; children: ReactNode; section?: "books" | "topics" }) {
  const pathname = usePathname();
  // "books" is the home page and every book and chapter page; "topics" every page under /topics. A function cannot be
  // passed from the server layout to this client component, so the rule is a name.
  const current =
    section === "books"
      ? pathname === "/" || !/^\/(topics|bookmarks|about|search|narrators|privacy)(\/|$)/.test(pathname)
      : section === "topics"
        ? pathname.startsWith("/topics")
        : pathname === href;
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className="relative inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap px-2.5 font-medium text-foreground/80 after:absolute after:inset-x-2.5 after:bottom-1.5 after:h-0.5 after:rounded-full hover:text-primary aria-[current=page]:text-primary aria-[current=page]:after:bg-primary sm:px-4 sm:after:inset-x-4"
    >
      {children}
    </Link>
  );
}
