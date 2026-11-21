# hadistweb

A website for reading hadith: the Arabic text with a translation in your language, book by book and chapter by
chapter, and selected hadiths by topic with an explanation. Live at
[hadist.udienz.web.id](https://hadist.udienz.web.id).

## Languages

The interface is in ten languages, the same as [QuranWeb](https://github.com/udienz/quranweb). English and Indonesian
are maintained with the site. The other eight are **community translations**: first drafts by Claude, an AI, not yet
checked by a speaker of the language. Each one has a link in the language menu to report a mistake. Arabic, Urdu and
Persian are written right to left, and the whole page turns with them.

The site follows your browser's language until you pick one with the globe button at the top.

| Language | Interface | Hadith translation | Topics and explanations (HadeethEnc) |
|---|---|---|---|
| English | yes | all 10 books | yes |
| Bahasa Indonesia | yes | 7 books, plus an-Nawawi and 20 Qudsi hadiths from HadeethEnc | yes |
| Türkçe | community | 8 books (not Qudsi, Dehlawi); 20 Qudsi hadiths from HadeethEnc | yes |
| Bahasa Melayu | community | none: English is shown; an-Nawawi and 20 Qudsi hadiths from HadeethEnc | yes |
| বাংলা (Bengali) | community | 8 books (not Qudsi, Dehlawi); 20 Qudsi hadiths from HadeethEnc | yes |
| Français | community | 9 books (not Tirmidhi) | yes |
| Русский | community | Bukhari, Muslim, Abu Dawud; an-Nawawi and 20 Qudsi hadiths from HadeethEnc | yes |
| اردو (Urdu) | community | 7 books; an-Nawawi and 20 Qudsi hadiths from HadeethEnc | yes |
| العربية | community | not needed: the hadiths are in Arabic | yes |
| فارسی (Persian) | community | none: English is shown; an-Nawawi and 20 Qudsi hadiths from HadeethEnc | yes |

When a hadith has no translation in your language, the English one is shown (or the Indonesian one), with a label
saying so. In Arabic no translation is shown. Chapter names are in Indonesian for Indonesian readers and in English in
the other languages.

Only the Arabic, Indonesian and English texts are kept in our own copy of the data. The other translations, and
everything from HadeethEnc, are read from their sources when a reader opens a page.

## Running it

Node.js 24 or later.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
npm run lint
npm run build && npm start
npm run test:e2e   # browser tests, after a build
```

By default the hadith data is read from the source on GitHub. To use a copy of it (a mirror over HTTP, or a folder on
disk with the same layout as fawazahmed0/hadith-api), set `HADITH_FAWAZ_URL`; see `.env.example`.

## Sources

- [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api) for the
  books: Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi,
  Sunan an-Nasa'i, Sunan Ibn Majah, Muwatta Malik, and the forty-hadith
  collections of an-Nawawi, Qudsi and Shah Waliullah Dehlawi, with their
  translations.
- [HadeethEnc.com](https://hadeethenc.com/) for hadiths by topic, with their
  explanations, in every language of the interface.

## Licence

The code is under the MIT licence (`LICENSE`). The hadith texts and
translations keep the terms of their sources.
