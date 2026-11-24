# Contributing

Contributions come as pull requests on GitHub. Open an issue first for anything larger than a small fix, so we can agree
on the approach before you spend time on it. The project's conventions (stack, code layout, data sources, the rule that
everything in the repository is written in English) are in [CLAUDE.md](CLAUDE.md), and how to run the site and its tests
is in [docs/development.md](docs/development.md).

Before you open a pull request, run:

```bash
npm ci
npm run lint
npm test
npm run build
npm run test:e2e   # browser tests against the build; needs Chromium (`npx playwright install chromium`)
```

CI runs the same commands on every pull request, and also builds and starts the Docker image. All three checks must pass
before a pull request can be merged. A pull request that changes only documentation (Markdown files, `docs/`, the licence)
skips them.

The issue forms ("Bug report", "Translation mistake", "Feature idea") and the pull request template ask for what we need;
please follow them. Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md), and security problems are
reported privately, see [SECURITY.md](SECURITY.md).

## The hadith texts are not edited here

The Arabic texts, their translations, the grades and everything from HadeethEnc.com come from published sources and are
shown as those sources publish them. A pull request does not correct, shorten or reword them, and does not pair a
translation with the Arabic of another hadith to fill a gap. A mistake in a text belongs with its source:
[fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api/issues) or [HadeethEnc.com](https://hadeethenc.com/).
Open an issue here too if the mistake is ours (a wrong hadith shown, a broken page, a layout that hides part of a text).

The Indonesian chapter names (`src/lib/hadith/chapter-names-id.json`) were written for this site and reviewed by the
owner; a change to them needs a source for the name.

## Licence of your contribution

HadistWeb's code is under the [MIT licence](LICENSE). By opening a pull request you agree that your contribution is under
the same licence. This covers code and interface text only: the hadith texts and translations keep the terms of their
sources.

## Translating the interface

You can translate HadistWeb's interface (menus, buttons, messages, and the About and privacy pages) into your language.
The interface is in English and Indonesian, and in 23 more languages as community translations, the same set as
QuranWeb (the README lists them). **Those 23 are first drafts made by Claude (an AI) at the owner's request**, published so
that speakers can correct them. A review of one of them, even of a few messages, is very welcome, and a reviewer can become
that language's maintainer.

**Only the interface is translated this way, never a hadith.** Hadith translations come only from published sources.

### Start a new language

1. Add the language code (ISO 639-1, for example `ms`) to `LOCALES`, its own name to `LOCALE_NAMES` and a flag to
   `LOCALE_FLAGS` in `src/lib/i18n/config.ts` (the SVG goes in `public/flags/`, from
   [flag-icons](https://github.com/lipis/flag-icons)), and the `Intl` locale (for example `ms-MY`) to `INTL_LOCALE` in
   `src/lib/i18n/translate.ts`. A right-to-left language also goes in `RTL_LOCALES`.
2. Copy `src/lib/i18n/messages/en.ts`, the source catalog, to `src/lib/i18n/messages/<code>.ts`, type the copy as
   `Messages` (look at `id.ts`), and translate every message.
3. Register the catalog in `src/lib/i18n/messages/index.ts`.
4. If fawazahmed0/hadith-api has hadith translations in the language, add its edition code to `src/lib/hadith/books.ts`.
5. Run the checks above. TypeScript refuses a catalog with a missing key, and `npm test` checks that every language has
   the same keys as English and that no message is empty. Check the placeholders yourself.

Improving an existing language is the same, but only the catalog changes.

### How to translate

- **Placeholders** in braces (`{count}`, `{language}`, `{name}`, ...) are filled in by the site. Keep them exactly as
  they are, in the place your grammar needs; do not translate the word inside the braces.
- **Plurals** use `plural(other, one)`, chosen by the language's CLDR rules. A language with more forms writes the
  object itself with `zero`, `one`, `two`, `few`, `many` and `other` as it needs; `other` is required.
- **Tone:** plain, calm and respectful, addressing the reader politely (in Indonesian, *Anda*). Short labels on buttons.
  Follow the meaning of the English message rather than its words.
- **Terms kept as they are** (in the spelling usual in your language): Allah, hadith, sanad, Qudsi. Words such as
  *chapter* and *book* are translated with the word your language uses for the parts of a hadith collection.
- **Names of books, narrators and sources** are not translated.

### Review

A translation is published as reviewed only after another speaker of the language has checked it.

1. **Automatic checks** run first in CI (missing keys, empty messages).
2. **A second speaker reviews it.** You do not approve your own translation. Each language's maintainers are listed in
   [.github/CODEOWNERS](.github/CODEOWNERS); GitHub asks them to review every change to their catalog. The owner merges
   after their approval.
3. **A language with no reviewer yet** is published as a **community translation**: the language menu marks it with an
   asterisk and offers a link to report a mistake (`COMMUNITY_LOCALES` in `src/lib/i18n/config.ts`). The mark is removed
   once a second speaker has reviewed it.

The Indonesian catalog (`messages/id.ts`) is maintained by @udienz.
