# hadistweb

A website for reading hadith: Arabic text with an Indonesian or English
translation, book by book and chapter by chapter. It will live at
[hadist.udienz.web.id](https://hadist.udienz.web.id).

## Running it

Node.js 24 or later.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
npm run lint
npm run build && npm start
```

By default the hadith data is read from the source on GitHub. To use a copy of it (a mirror over HTTP, or a folder on
disk with the same layout as fawazahmed0/hadith-api), set `HADITH_FAWAZ_URL`; see `.env.example`.

## Sources

- [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api) for the
  books: Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi,
  Sunan an-Nasa'i, Sunan Ibn Majah, Muwatta Malik, and the forty-hadith
  collections of an-Nawawi, Qudsi and Shah Waliullah Dehlawi.
- [HadeethEnc.com](https://hadeethenc.com/) for hadiths by topic, with their
  explanations.

## Licence

The code is under the MIT licence (`LICENSE`). The hadith texts and
translations keep the terms of their sources.
