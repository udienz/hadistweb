"use client";

import { useEffect } from "react";
import { isBookId } from "@/lib/hadith/types";
import { recordLastRead } from "@/lib/reading";

/**
 * Remembers which hadith is being read, for "continue reading" on the home page: the first hadith card whose top is in
 * the upper part of the screen once the reader stops scrolling (or the only card, on a hadith's own page). Renders
 * nothing.
 */
export default function LastReadTracker() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const record = () => {
      const cards = [...document.querySelectorAll<HTMLElement>("article[data-book][data-hadith]")];
      const card = cards.find((c) => c.getBoundingClientRect().bottom > window.innerHeight * 0.25) ?? cards[0];
      const book = card?.dataset.book;
      const number = card?.dataset.hadith;
      if (card && isBookId(book) && number) recordLastRead(book, number);
    };
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(record, 800);
    };
    timer = setTimeout(record, 1500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}
