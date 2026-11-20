import type { Plural } from "../translate";

const plural = (other: string, one?: string): Plural => ({ one, other });

/** English is the source catalog: the shape of every other language is derived from it. */
export const en = {
  meta: {
    title: "HadistWeb",
    description: "Read the hadith collections: Arabic text with Indonesian and English translations.",
  },
  nav: {
    books: "Books",
    about: "About",
    language: "Language",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
  },
  footer: {
    about: "About and sources",
  },
  common: {
    hadiths: plural("{count} hadiths", "{count} hadith"),
    chapters: plural("{count} chapters", "{count} chapter"),
  },
  home: {
    title: "The hadith collections",
    subtitle: "Arabic text with a translation, book by book and chapter by chapter.",
    start: "Start with Sahih al-Bukhari",
    listTitle: "Books",
    englishOnly: "English translation",
  },
  book: {
    chapters: "Chapters",
    unnamedChapter: "Hadiths without a chapter in the source",
    chapterLabel: "Chapter {number}",
    chapterNamesNote: "Chapter names are in English, as in the source.",
  },
  chapter: {
    previous: "Previous chapter",
    next: "Next chapter",
    backToBook: "All chapters",
  },
  hadith: {
    number: "Hadith {number}",
    arabicNumber: "Arabic numbering: {number}",
    fallback: {
      en: "English translation (there is no Indonesian translation of this hadith)",
      id: "Indonesian translation (there is no English translation of this hadith)",
    },
    noTranslation: "The source has no translation of this hadith.",
    noArabic: "The source has no Arabic text for this number.",
    grades: "Grades",
    copyLink: "Copy link",
    copied: "Link copied",
    open: "Open hadith {number}",
    inBook: "{book}, hadith {number}",
  },
  pagination: {
    label: "Pages of the chapter",
    range: "{from} to {to} of {total} hadiths",
    previous: "Previous page",
    next: "Next page",
    page: "Page {number}",
  },
  notFound: {
    title: "Page not found",
    description: "The page you are looking for does not exist or has moved.",
    home: "Back to the books",
  },
  error: {
    title: "The hadith data could not be loaded",
    description: "The source did not answer. Try again in a moment.",
    retry: "Try again",
  },
  about: {
    title: "About",
    intro:
      "HadistWeb shows the hadith collections with their Arabic text and a translation in Indonesian or English. The texts are shown as the sources publish them; nothing is edited here.",
    sourcesTitle: "Sources",
    fawaz:
      "The books, their chapters, translations and grades come from fawazahmed0/hadith-api, published under the Unlicense. We serve them from our own copy.",
    fallback:
      "When a hadith has no translation in your language, the other translation is shown and labelled. The Indonesian translation has no text for many hadiths, because its source joins several narrations into one entry; the Arabic text is never paired with the translation of another hadith to fill a gap.",
    chapterNames: "Chapter names are in English, as in the source. Indonesian chapter names will follow.",
    code: "The code of this site is open source under the MIT licence.",
    codeLink: "View the code on GitHub",
  },
};
