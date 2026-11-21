// The hadith of the day on the home page: one of the 42 hadiths of an-Nawawi's collection, in turn, changing at
// midnight in Indonesia (Asia/Jakarta, UTC+7, no daylight saving). An-Nawawi because its hadiths are short, widely
// known and translated into nearly every interface language (through HadeethEnc).

export const DAILY_BOOK = "nawawi" as const;
export const DAILY_COUNT = 42;
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Today's hadith number, read from the clock (call it at request time). */
export const todaysNumber = (): string => dailyNumber(Date.now());

/** The hadith number (1 to 42) for the day that `now` falls on in Jakarta. */
export function dailyNumber(now: number): string {
  const day = Math.floor((now + JAKARTA_OFFSET_MS) / DAY_MS);
  return String((((day % DAILY_COUNT) + DAILY_COUNT) % DAILY_COUNT) + 1);
}
