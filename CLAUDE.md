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
  chapter names written for this site and reviewed by the owner (2026-11-21),
  "Kitab <name> (<transliteration>)" in pesantren spelling; Bukhari follows the
  owner's list of its 97 books. Edit the JSON by hand; the review record is
  `project/hadistweb/data/chapter-names-proposal.tsv` in the workspace. Chapter 0
  of Muslim and Ibn Majah is named Muqaddimah. The source's English name is shown
  under each.
- `src/lib/hadith/hadeethenc-translation.ts` and `hadeethenc-pairs.json`: the
  Indonesian an-Nawawi (42 pairs, checked against the Arabic and the English
  texts) and 20 of the 40 hadiths Qudsi (checked by hand, 3 automatic matches
  rejected) from HadeethEnc. Shown with HadeethEnc's attribution line, its credit and a note
  that remarks after the hadith in the Arabic may not be translated.
- `src/lib/hadith/layout.ts`: how a translation is laid out (owner's choice,
  2026-11-21): the sanad small and quiet above (narrator names from the
  [brackets] in bold, brackets dropped; English "Narrated X:"), the text in
  paragraphs of about 400 characters, broken only at sentence ends and where a
  narrator takes the word. Display only: a test over the whole mirror found no
  character changed. Not for HadeethEnc texts (no changes allowed), which get
  the typography only. `layoutArabic` does the same for the Arabic text: sanad
  up to the first quote (opening with حدثنا/أخبرنا), paragraphs of about 300
  letters at the source's full stops, which it wraps in right-to-left marks.
- `src/components/TextSizeMenu.tsx` and `src/lib/display.ts`: text size for
  Arabic and translation, quranweb's steps, kept in local storage
  (`hadistweb:font-size`) and applied before the first paint.
- `src/lib/hadith/grade.ts`: the grade filter (2026-11-22), `?grade=sahih` or
  `accepted` (sahih and hasan) on chapter pages and in search. One grader per
  book (Al-Albani for the Sunan, Salim al-Hilali for Malik); Bukhari and Muslim
  count as sahih; the small books have none. The search index stores each
  hadith's level; `build-search-index.mjs` repeats `gradeLevel` (a test checks
  they agree). Rebuild the index on the server after changing it.
- `src/lib/hadith/quran-refs.ts`: a Qur'an reference in a translation links to
  the verse on QuranWeb (2026-11-22): the English "(3.77)" and the Indonesian
  "QS. Ali 'Imran: 77" with its many spellings of surah names (`nameKeys`, 99%
  of the names in the data recognized), kept only when the verse exists.
  QuranWeb's verse address is `/surah/<n>?page=<ceil(v/10)>#verse-<v>`. Not for
  HadeethEnc texts.
- `src/lib/second-translation.ts`: a second translation beside the first
  (2026-11-22), the reader's choice in the cookie `hw-second`, set in the text
  size menu; `getChapter`/`getHadith` take `{ second }`. Not shown when it is in
  the same language as the first.
- `src/lib/page-size.ts`: 5 or 10 hadiths per chapter page, the reader's
  choice, in the cookie `hw-page-size` (default 10).
- `src/lib/hadeethenc/client.ts`: the HadeethEnc API (categories, a page of a
  category, one hadith), read live with an in-process cache (`src/lib/memo.ts`).
  Texts are shown exactly as the API gives them: HadeethEnc's terms forbid
  changes, so no reformatting of its explanation or titles. Every page that
  shows its content carries the credit line.
- `src/lib/hadith/search.ts`, `src/app/search/`: search (owner's request,
  2026-11-21) over a SQLite FTS5 index in the mirror,
  `hadistweb-search.sqlite`, built by `scripts/build-search-index.mjs` (which
  `sync-mirror.mjs` runs before it swaps a new mirror in). Indonesian and English
  are searched by word with spelling variants (`VARIANTS`); Arabic, normalized
  (no harakat, one alif), by trigram, so النيات finds بالنيات. Only the mirrored
  editions are searchable. `reference.ts`: "Bukhari 349" in the search box opens
  that hadith. No index (data read from GitHub) means the page says search is
  unavailable. `node:sqlite` needs Node.js 24 or later.
- `src/lib/reading.ts`, `BookmarkButton`, `LastReadTracker`, `ContinueReading`,
  `src/app/bookmarks/`: bookmarks and "continue reading" (owner, 2026-11-21), in
  local storage (`hadistweb:reading`) only, never sent to the server. The last
  hadith read is the first card in view once scrolling stops. The privacy page
  says so; change it with them.
- `src/lib/hadith/explanations.ts` and `hadeethenc-explanations.json`: a book
  hadith links to HadeethEnc's explanation of it, and the explanation page back
  to the books (2026-11-22): 2,297 hadiths of the seven large books, matched by
  the Arabic text offline (workspace `project/hadistweb/scripts/
  match_books_hadeethenc.py` and `pick_book_pairs.py`, method and checks in its
  ROADMAP.md), plus the an-Nawawi and Qudsi pairs. Regenerate the JSON with
  those scripts; do not edit it by hand.
- `src/lib/daily.ts`, `src/components/DailyHadith.tsx`: the hadith of the day on
  the home page (2026-11-21), an-Nawawi 1 to 42 in turn, changing at midnight in
  Jakarta; read at request time (`connection()`), streamed in a Suspense
  boundary, and left out when the data cannot be read.
- `src/components/ShareMenu.tsx`: share a hadith (owner's request, 2026-11-21):
  copy text (the card's `data-share` parts as shown, then the reference and the
  link), copy link, the device share sheet, WhatsApp.
- `src/lib/site.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `public/og.png`
  (drawn by `scripts/og-image.mjs`): the origin comes from the Host nginx passes
  (or `SITE_URL`); only https://hadist.udienz.web.id is indexed, QA and local
  copies get `noindex` and a robots.txt that disallows everything. Sitemap 0
  lists the books, chapters and topics, 1 to 10 the hadiths of each book (from
  the search index). Every page sets its canonical address and Open Graph data
  with `shareMetadata`; a hadith's description is its matn (`excerpt.ts`).
- `src/proxy.ts`: answers 404 for addresses that are not a book, chapter,
  hadith or HadeethEnc topic or hadith, before rendering (a streamed page
  cannot change its status).
- `src/app/`: `/`, `/[book]`, `/[book]/chapter/[chapter]`,
  `/[book]/[hadith]`, `/topics`, `/topics/[category]`, `/topics/hadith/[id]`,
  `/about`.
- `src/lib/i18n/`: interface languages as in quranweb: `en` and `id` (default
  `id`), and community drafts by Claude in the other 23 of quranweb's 25
  (2026-11-21; `ar`, `ur`, `fa` right to left, `<html dir>` and logical CSS;
  `uz` in Cyrillic). The menu order is `MENU_LOCALES`, alphabetical by each
  language's own name. A language with no hadith translation shows English. `messages/en.ts` is the source catalog; strings shared with
  quranweb were taken from its catalogs.
- Hadith translations (`lib/hadith/books.ts`): `id`, `en`, `tr`, `bn`, `fr`,
  `ru`, `ur`, `ta` (Bukhari and Muslim only) from fawazahmed0. Only Arabic, Indonesian and English are mirrored;
  the others are read from raw GitHub when asked (owner's decision, 2026-11-21),
  and a failed read falls back to English. Order: the reader's language,
  English, Indonesian; Arabic readers get none. HadeethEnc is read in the
  interface language and fills an-Nawawi and Qudsi where fawazahmed0 has none.

Every hadith is read from its chapter file: decimal numbers such as `402.2`
have no single-hadith file in the source. Chapter 0 holds the hadiths the source
puts in no chapter (Bukhari 311, Muslim 344, ...); it is shown as its own
chapter, first when it starts the book (an introduction), otherwise last.

Commands: `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e`
(browser tests against the build, with fixtures in `e2e/fixtures` and a fake
HadeethEnc; regenerate the fixtures with `node scripts/e2e-fixtures.mjs`), `bash
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

## Documents

`README.md` and `README.id.md` are for readers who are not technical (the owner's
request, 2026-11-21): what the site does and how to use it, with screenshots from
`docs/screenshots/` (`scripts/readme-screenshots.mjs`). Keep commands, settings
and deployment out of them; they belong in `docs/development.md`. Change both
READMEs together. `CONTRIBUTING.md`, `SECURITY.md` and `CODE_OF_CONDUCT.md` are
adapted from quranweb's.

## Language rule

Code, comments, error messages, tests, scripts, documents, commit messages and
PRs are in English. Only the UI strings in Indonesian, `README.id.md` (when it
exists) and data that is Indonesian by nature are in Indonesian.

## Git

Default branch `master`. Work on a branch per piece of work and open a PR; do not
push to `master` directly. Commits use the owner's identity:
`Mahyuddin Susanto <udienz@gmail.com>`, with no `Co-Authored-By` lines.

## Deploy

Same server and pattern as quranweb. `scripts/deploy.sh <qa|prod> <ref>` runs on
the server (the "Deploy QA" workflow sends it over SSH): it builds the image in
`~/deploy/hadistweb-<env>`, runs it on 127.0.0.1:3010 (QA) or 3012 (prod),
checks `/` and `/bukhari/chapter/1`, and rolls back to the previous image if
they do not answer. nginx (`/etc/nginx/sites-available/hadist-qa`, certbot)
forwards hadist-qa.udienz.web.id to it. quranweb uses 3000 and 3002.

The books come from our mirror in `/srv/hadith-mirror/hadith-api`, built by
`node scripts/sync-mirror.mjs /srv/hadith-mirror/hadith-api` (run it with
`umask 022`: the server's umask is 007 and the container user, uid 1001, must
read the files). The container mounts `/srv/hadith-mirror`, the parent, because
the sync swaps the mirror directory. Restart or redeploy after a sync.

Production (hadist.udienz.web.id, vhost `hadist`) deploys from a `v*` tag on
`master` through "Deploy Production" (`deploy-prod.yml`), like quranweb.

The mirror is refreshed weekly by `hadistweb-mirror-sync.timer`
(`deploy/systemd/`), which runs `deploy/mirror-sync.sh`: the sync in a
`node:26-alpine` container (the host has no Node.js), then a restart of the
containers. Installed on the server with:

```bash
sudo install -d /usr/local/lib/hadistweb
sudo install -m 755 deploy/mirror-sync.sh /usr/local/lib/hadistweb/
sudo install -m 644 scripts/sync-mirror.mjs scripts/build-search-index.mjs /usr/local/lib/hadistweb/
sudo install -m 644 deploy/systemd/hadistweb-mirror-sync.* /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now hadistweb-mirror-sync.timer
```

Reinstall the three scripts after changing them: the timer runs the installed
copies, not the checkout.

The workflow needs the repository variable `QA_DEPLOY=true` and the `QA_SSH_*`
secrets listed in `.github/workflows/deploy-qa.yml`. Its SSH key is its own
(`github-actions-deploy@hadistweb`), not quranweb's, so either can be revoked
alone.
