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
    privacy: "Privacy",
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
    chapterNamesNote: "The English name from the source is shown under each chapter name.",
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
    sanad: "Chain of narrators",
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
  display: {
    textSize: "Text size",
    arabicSize: "Arabic text",
    latinSize: "Translation",
    smaller: "Smaller: {name}",
    larger: "Larger: {name}",
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
  privacy: {
    title: "Privacy policy",
    intro: "HadistWeb is a free hadith reading site. There are no accounts and nothing to sign up for. This page says what the site keeps and who else sees anything.",
    sections: {
      reading: {
        title: "What stays in your browser",
        body: "Your choice of light or dark theme is kept in your browser's local storage and does not leave it. Two small cookies keep the interface language (hw-lang) and how many hadiths a chapter page shows (hw-page-size), so the page appears the way you chose. The site stores nothing else about you: no reading history, no bookmarks, no account.",
      },
      sources: {
        title: "Where the texts come from",
        body: "The books come from our own copy of fawazahmed0/hadith-api on this server. The topic section and some Indonesian translations come from HadeethEnc.com: our server asks HadeethEnc for them, not your browser, so HadeethEnc does not see your IP address or anything else about you.",
      },
      analytics: {
        title: "Visitor statistics",
        body: "To see how much the site is used, we use Cloudflare Web Analytics. When a page opens, a small script from Cloudflare reports which page was viewed, the page you came from, the type of browser, operating system and device, the country, and how fast the page loaded. Cloudflare states that this tool sets no cookies, stores nothing in your browser, and does not use your IP address or browser details to identify or follow you. We only see totals (for example visits per page or per country), never a single visitor, and we use them only to understand the traffic of this site, never for advertising. If your browser or an extension blocks the script, the site works the same.",
      },
      recipients: {
        title: "Who handles data",
        body: "Cloudflare (DNS and proxying of the site, and the visitor statistics) and the hosting provider of the server. Our web server and Cloudflare handle IP addresses to deliver the pages, as every website does. We do not sell data or share it for any other purpose.",
      },
      law: {
        title: "Applicable law",
        body: "This policy follows Indonesian personal data protection law (Law No. 27 of 2022 on Personal Data Protection, UU PDP).",
      },
    },
    contactTitle: "Contact",
    contactBy: "This site is run by {name}.",
    contactEmail: "Questions about this policy: {email}",
    contactMissing: "The contact for questions about this policy has not been set up yet.",
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
      "The source names its chapters in English. The Indonesian chapter names were written for this site, with the Arabic name of each book in brackets, and reviewed; the English name from the source is shown with them.",
    code: "The code of this site is open source under the MIT licence.",
    codeLink: "View the code on GitHub",
  },
};
