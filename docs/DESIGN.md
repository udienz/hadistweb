# hadistweb design

This file is the single source of truth for the design of hadistweb. There is no other design document: update it with
any visible change. The record of the redesign and the open work are in the last section.

hadistweb uses the editorial design of quranweb. The full system (colours, type, components, do's and don'ts) is in
`docs/DESIGN.md` of `udienz/quranweb`; this file lists what hadistweb takes from it and where it differs.

The direction: a calm reading room with the text at the centre, warm paper, deep forest, muted gold, ink brown. A
quiet place to read. It is a visual change, not a change of product or data.

## Shared with quranweb

- **Tokens** (`src/app/globals.css`, `:root` and `.dark`): the same values as quranweb. Light: paper `42 33% 94%`, ink
  `34 21% 20%`, forest `143 19% 25%`, gold `39 34% 56%`. Dark: a night green. Change a colour in both repositories
  together. `--paper` (parchment panels) and `--rule` (thin lines) are extra tokens used by the editorial classes.
- **Fonts:** Plus Jakarta Sans, Space Grotesk and Amiri, unchanged. The "Honorific Signs" family stays: it draws ﷺ and
  the other honorific signs from Amiri.
- **Header:** the logo on a forest tile, `NavLink` with an underline on the current page, the navigation on a second row
  on phones, then search, text size, language and theme. No account menu: hadistweb has no sign-in.
- **Page head** (`PageHead`): centred, the Arabic name of a book above its title, a gold rule with a diamond under it.
  Used on the book, chapter and topic pages.
- **Hadith card:** a card on the paper with a thin gold frame inside and the hadith number in a gold ring.

## Different from quranweb

- **Home hero:** parchment with the text on the start side and the basmalah in a gold arch on the other. quranweb has a
  photograph of an open mushaf there; a hadith site has no such picture, so no photograph is used. In right-to-left the
  arch moves to the other side with the grid, and the tagline is not slanted (Arabic script has no italic).
- **List of books** instead of the list of surahs: ten cards, with a filter box that narrows the list in place by number,
  name or Arabic name (`BookList`). It has no suggestions, since ten books fit on the page.
- **Tagline** "A quiet place to read" (`home.tagline`) under the subtitle of the home page.

## Boundaries and rules

- No change to routes, query strings, cookies, the search index, bookmarks, reading progress, sharing, or any hadith,
  translation or HadeethEnc text. HadeethEnc pages keep the credit line and unmodified text.
- All 25 interface languages keep working. Logical CSS properties only, so the right-to-left languages (ar, ur, fa)
  mirror. The Arabic is always `dir="rtl"`.
- No new dependencies and no font changes. No hard-coded strings: every visible text is in the 25 catalogs.
- A client component takes no function from a server component as a prop (`NavLink` takes a `section` name, not a
  function): Next.js passes the build and then fails when the page renders.
- Contrast: check both themes with the contrast checker of the antislop-human skill before a new colour pair ships.

## Redesign record and open work

### Decisions (we decided, 2026-11-24)

- **Direction:** quranweb's editorial design (its PRs #139, #140, #142 and #144), after we reviewed static mockups of the
  home and chapter pages. The mockups and the first proposal are in the workspace repository `udienz/claude-project`,
  folder `project/hadistweb/mockups/`.
- **Header:** the same as quranweb's.
- **Hero:** no photograph; the basmalah in a gold arch on the end side, on one line.
- **Search box of the book list:** it did not exist, so we built it. It narrows the ten books in place.
- **Tagline:** "A quiet place to read" is used, in all 25 catalogs (community drafts by Claude, not reviewed by speakers,
  for the 23 languages besides English and Indonesian).
- **Scope:** all of it in one PR (tokens, header, home, page heads, hadith card), one PR, reviewed on QA before release.

### Implemented

- PR #48, released as `v0.6.0` on 2026-11-24: the tokens, `NavLink` and the header, `PageHead`, `BookList` with its
  filter, the home page (hero, "continue reading", the hadith of the day as a panel, the links to narrators and topics),
  the head of the book, chapter and topic pages, the hadith card, the theme colour of the manifest, the app icons
  (`scripts/app-icons.mjs`), `public/og.png` (`scripts/og-image.mjs`) and the README screenshots
  (`scripts/readme-screenshots.mjs`, taken from QA with real data).
- quranweb's own icons are still teal; hadistweb's are forest.

### Checked (2026-11-24)

- `npm run lint`, `npm test` (118 tests) and `npm run build` pass; the 18 browser tests and the one for the filter pass.
- By eye in a browser, with the test fixtures: the home, chapter and book pages, light and dark, at 1280 and 390 px.
- By eye with the Arabic interface: the home and chapter pages mirror, no horizontal overflow at 1280 and 390 px.
- On QA and in production after the release: the home page, a chapter, `/about`, `robots.txt` and `og.png` answer 200
  and carry the new classes.
- Not checked: the tablet width, Urdu and Persian by eye, and computed colour contrast of every pair in both themes.

### Lessons

- The first `NavLink` took a function prop from the server layout. The build passed and every page then failed to
  render ("Functions cannot be passed directly to Client Components"). Only a real browser run against the build showed
  it. Run the built app and open a page before calling a change done.
- The hadith card holds a lot of text (sanad, Arabic, two translations, grades, share menu). Parchment on parchment can
  lose separation; the gold frame and the rules carry it, and the longest chapters are the place to look.
- quranweb's CSS is scoped class by class (`.quran-reading__*`) and carries Qur'an-specific rules. hadistweb has its own
  smaller `hw-*` classes and shares only the tokens and the patterns.

### Open work

- An editorial head for the bookmarks, search, narrators, about and privacy pages. They follow the new colours already.
- A full re-measure of the computed styles, light and dark, and the contrast of every colour pair.
- The tablet width, Urdu and Persian by eye.
- The two repositories drift unless the tokens are changed in both; a shared design package stays a later idea
  (`ROADMAP.md` in the workspace repository).
