import { NextResponse, type NextRequest } from "next/server";
import { getHadithService } from "@/lib/hadith/service";
import { isBookId } from "@/lib/hadith/types";
import { chapterFromSegment, isHadithNumber } from "@/lib/links";

/** Four segments: no route of the app has that many, so Next.js answers 404. */
const NOT_FOUND_PATH = "/_/not/a/page";

/**
 * An address that is not a book, chapter or hadith answers 404. The pages show the not-found page themselves, but by
 * then the response has started streaming with status 200 (Cache Components), so search engines and link checkers would
 * see a normal page (the same problem quranweb solves in its proxy.ts). Here the address is checked before rendering:
 * its shape first, then the chapter or hadith number against the book's index. Anything unknown is rewritten to a path
 * that does not exist, which Next.js answers with the translated not-found page and status 404.
 *
 * When the index cannot be loaded, the request goes through: the page then shows the data error, not a false 404.
 */
export async function proxy(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const [book, second, third] = parts;
  const notFound = () => NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));

  if (!isBookId(book) || parts.length > 3) return notFound();
  if (parts.length === 1) return NextResponse.next();

  let target: { chapter: number } | { hadith: string };
  if (second === "chapter" && parts.length === 3) {
    const chapter = chapterFromSegment(third);
    if (chapter === null) return notFound();
    target = { chapter };
  } else if (parts.length === 2 && isHadithNumber(second)) {
    target = { hadith: second };
  } else {
    return notFound();
  }

  try {
    return (await getHadithService().exists(book, target)) ? NextResponse.next() : notFound();
  } catch {
    return NextResponse.next();
  }
}

// Everything except the pages and files that are not books.
export const config = { matcher: "/((?!_next/|about$|icon\\.svg$|favicon\\.ico$|_/not/a/page$).+)" };
