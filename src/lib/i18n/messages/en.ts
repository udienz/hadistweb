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
    topics: "Topics",
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
    indonesianFrom: "Indonesian translation from {source}",
    indonesianPartly: "Indonesian translation of some hadiths, from {source}",
  },
  book: {
    chapters: "Chapters",
    unnamedChapter: "Hadiths without a chapter in the source",
    chapterLabel: "Chapter {number}",
    chapterNamesNote: "The Indonesian chapter names are not reviewed yet; the English name from the source is shown under each.",
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
    attribution: "Source",
    translationFrom: "Translation from {source}, shown without changes",
    translationScope: "It translates the hadith and its source; remarks that follow them in the Arabic text above (such as notes on its chains) may not be translated.",
    copyLink: "Copy link",
    copied: "Link copied",
    open: "Open hadith {number}",
    inBook: "{book}, hadith {number}",
  },
  topics: {
    title: "Hadiths by topic",
    intro: "Selected hadiths arranged by topic, each with its grade, its source, an explanation and the lessons drawn from it.",
    homeLink: "Read by topic",
    homeText: "Selected hadiths with an explanation, from HadeethEnc.com",
    subtopics: "Topics",
    hadiths: "Hadiths",
    all: "All topics",
    showSubtopics: "Show the topics",
    grade: "Grade",
    attribution: "Source",
    explanation: "Explanation",
    lessons: "Lessons",
    inTopics: "In the topics",
    otherLanguage: {
      en: "In English (this hadith has no Indonesian translation on HadeethEnc)",
      id: "In Indonesian (this hadith has no English translation on HadeethEnc)",
    },
    credit: "From HadeethEnc.com, published by the Rowwad Translation Center, shown without changes.",
    original: "View on HadeethEnc.com",
  },
  pagination: {
    label: "Pages",
    range: "{from} to {to} of {total} hadiths",
    previous: "Previous page",
    next: "Next page",
    page: "Page {number}",
    perPage: "Hadiths per page",
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
    hadeethenc:
      "The topic section comes from HadeethEnc.com (the Encyclopedia of Translated Prophetic Hadiths), published by the Rowwad Translation Center. Its texts may be reused without changes, with HadeethEnc.com named as publisher and source; they are read from its site and shown exactly as published. It also gives the Indonesian translation of the Forty Hadith of an-Nawawi and of 20 of the Forty Hadith Qudsi, which fawazahmed0/hadith-api does not have.",
    chapterNames:
      "The source names its chapters in English. The Indonesian chapter names come from compressed_hadith_sqlite by IsmailHosenIsmailJames; they have not been reviewed yet, so the English name is shown with them.",
    code: "The code of this site is open source under the MIT licence.",
    codeLink: "View the code on GitHub",
  },
};
