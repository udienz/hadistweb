# hadistweb design

hadistweb uses the editorial design of quranweb. The full system (colours, type, components, do's and don'ts) is in
`docs/DESIGN.md` of `udienz/quranweb`; this file lists what hadistweb takes from it and where it differs.

The direction: a calm reading room with the text at the centre, warm paper, deep forest, muted gold, ink brown. A
quiet place to read.

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
  photograph of an open mushaf there; a hadith site has no such picture, so no photograph is used.
- **List of books** instead of the list of surahs: ten cards, with a filter box that narrows the list in place by number,
  name or Arabic name (`BookList`). It has no suggestions, since ten books fit on the page.
- **Tagline** "A quiet place to read" (`home.tagline`) under the subtitle of the home page.

## Rules

- Logical CSS properties only, so the right-to-left languages (ar, ur, fa) mirror. The Arabic is always `dir="rtl"`.
- A client component takes no function from a server component as a prop (`NavLink` takes a `section` name, not a
  function): Next.js passes the build and then fails when the page renders.
- No hard-coded strings: every visible text is in the 25 catalogs.
- Do not change hadith or HadeethEnc text; this is a look, not a content change.

## Not done yet

- The bookmarks, search, narrators, about and privacy pages follow the new tokens but have no editorial head yet.
- The app icons, `public/og.png` and the README screenshots were redrawn for the forest palette on 2026-11-24
  (`scripts/app-icons.mjs`, `scripts/og-image.mjs`, `scripts/readme-screenshots.mjs`). quranweb's own icons are still teal.
