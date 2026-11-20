# CLAUDE.md

Context for Claude (or anyone) working on this repository.

## What this is

A public hadith reading website at **hadist.udienz.web.id** (QA:
hadist-qa.udienz.web.id): Arabic text with a translation, read book by book and
chapter by chapter, plus a topic section with explanations. The interface is in
English and Indonesian.

The plan, the decisions and the research live in the workspace repository
`udienz/claude-project`, folder `project/hadistweb/`: `ROADMAP.md` (decisions,
source register, data findings, phases) and `TODO.md` (open work). Read both
before starting.

## Code map

- `src/lib/hadith/`: `books.ts` (the ten books, their names, the translation
  order), `service.ts` (reads fawazahmed0's chapter files and `info.min.json`
  through `transport.ts`, which takes an HTTP URL or a folder), `types.ts`.
- `src/lib/hadith/chapter-names.ts` and `chapter-names-id.json`: Indonesian
  chapter names from compressed_hadith_sqlite (Unlicense, confirmed by the
  owner 2026-11-20), built by `scripts/build-chapter-names.py`. Not reviewed
  yet, so the source's English name is always shown under them.
- `src/lib/page-size.ts`: 5 or 10 hadiths per chapter page, the reader's
  choice, in the cookie `hw-page-size` (default 10).
- `src/lib/hadeethenc/client.ts`: the HadeethEnc API (categories, a page of a
  category, one hadith), read live with an in-process cache (`src/lib/memo.ts`).
  Texts are shown exactly as the API gives them: HadeethEnc's terms forbid
  changes, so no reformatting of its explanation or titles. Every page that
  shows its content carries the credit line.
- `src/proxy.ts`: answers 404 for addresses that are not a book, chapter,
  hadith or HadeethEnc topic or hadith, before rendering (a streamed page
  cannot change its status).
- `src/app/`: `/`, `/[book]`, `/[book]/chapter/[chapter]`,
  `/[book]/[hadith]`, `/topics`, `/topics/[category]`, `/topics/hadith/[id]`,
  `/about`.
- `src/lib/i18n/`: interface languages `en` and `id` (default `id`), copied
  from quranweb; `messages/en.ts` is the source catalog.

Every hadith is read from its chapter file: decimal numbers such as `402.2`
have no single-hadith file in the source. Chapter 0 holds the hadiths the source
puts in no chapter (Bukhari 311, Muslim 344, ...); it is shown as its own
chapter, first when it starts the book (an introduction), otherwise last.

Commands: `npm test`, `npm run lint`, `npm run build`, `bash
scripts/docker-smoke.sh` (needs Docker). Run the Docker smoke test before
merging a change to the Dockerfile or to `public/`.

## Design and stack

Same design and stack as quranweb (`udienz/quranweb`): Next.js App Router,
TypeScript, Tailwind, light and dark themes, English/Indonesian switch. Copy its
patterns rather than inventing new ones, and read quranweb's `CLAUDE.md` first:
its decisions on modular providers, stable edition IDs, the source registry and
file-or-HTTP transport apply here too. Audio and tafsir do not exist here.

## Data sources

- **fawazahmed0/hadith-api** (Unlicense): the books (Bukhari, Muslim, Abu Dawud,
  Tirmidhi, Nasa'i, Ibn Majah, Malik, an-Nawawi, Qudsi, Dehlawi). **Mirrored**:
  jsDelivr refuses the package (over its 150 MB limit), so download the editions
  from `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/`
  and serve them from our own copy. Do not rely on jsDelivr at runtime.
- **HadeethEnc.com** (Rowwad Translation Center): the topic section, with grade,
  attribution, explanation and lessons. **Not mirrored**: call its API from the
  server and cache the responses. Terms: show the text unmodified and credit
  HadeethEnc.com as publisher and source.

## Translation fallback

When a hadith has no Indonesian translation, show the English one, labelled as
English. This covers whole books (an-Nawawi, Qudsi and Dehlawi have no
Indonesian edition, apart from the an-Nawawi and Qudsi hadiths matched to
HadeethEnc) and single hadiths with an empty Indonesian text (many: the
Indonesian source merges several narrations into one entry). If English is
missing too, show the Arabic alone with a note. Never pair a translation with
the Arabic of a different hadith to fill a gap.

## Language rule

Code, comments, error messages, tests, scripts, documents, commit messages and
PRs are in English. Only the UI strings in Indonesian, `README.id.md` (when it
exists) and data that is Indonesian by nature are in Indonesian.

## Git

Default branch `master`. Work on a branch per piece of work and open a PR; do not
push to `master` directly. Commits use the owner's identity:
`Mahyuddin Susanto <udienz@gmail.com>`, with no `Co-Authored-By` lines.
