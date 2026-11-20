# CLAUDE.md

Context for Claude (or anyone) working on this repository.

## What this is

A public hadith reading website at **hadist.udienz.web.id** (QA:
hadist-qa.udienz.web.id): Arabic text with a translation, read book by book and
chapter by chapter, plus a topic section with explanations. The interface is in
English and Indonesian.

No code yet. The plan, the decisions and the research live in the workspace
repository `udienz/claude-project`, folder `project/hadistweb/`:
`ROADMAP.md` (decisions, source register, data findings, phases) and `TODO.md`
(open work). Read both before starting.

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
