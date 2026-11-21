# Development

Technical notes for running, testing and deploying HadistWeb. The overview for readers is in the
[README](../README.md); the project's conventions (code map, data sources, translation fallback, language rule) are in
[CLAUDE.md](../CLAUDE.md), and how to contribute is in [CONTRIBUTING.md](../CONTRIBUTING.md).

HadistWeb is built with Next.js (App Router, TypeScript, Tailwind), with the design and stack of
[QuranWeb](https://github.com/udienz/quranweb).

## Running locally

Node.js 24 or newer is needed (the Docker image and CI use Node 26).

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests, no network needed
npm run lint
npm run build && npm start
```

## Configuration

All variables are optional and read on the server at request time, so a running image can be pointed elsewhere without a
rebuild. See [.env.example](../.env.example).

- `HADITH_FAWAZ_URL`: where the books are read from, the folder that holds `editions/` and `info.min.json` of
  fawazahmed0/hadith-api. An HTTP URL or a local directory. Empty means raw GitHub
  (`https://raw.githubusercontent.com/fawazahmed0/hadith-api/1`). jsDelivr is not used: it refuses this package (over
  its 150 MB limit).
- `HADEETHENC_API_URL`: the HadeethEnc API. Empty means `https://hadeethenc.com/api/v1`. Only the browser tests change
  it.
- `PRIVACY_CONTACT_NAME` and `PRIVACY_CONTACT_EMAIL`: the contact shown on the privacy page.

## The mirror

Only the Arabic, Indonesian and English editions are kept in our own copy; the other translations, and everything from
HadeethEnc, are read from their sources when a page is opened, and cached in memory.

```bash
umask 022
node scripts/sync-mirror.mjs /srv/hadith-mirror/hadith-api
```

It downloads the editions from raw GitHub and also writes `hadistweb-counts.min.json`, the number of hadiths per
chapter, so the chapter lists match the pages, and `hadistweb-search.sqlite`, the search index (about 140 MB). On the
server a weekly systemd timer runs it; see [CLAUDE.md](../CLAUDE.md#deploy).

## Search

`/search` reads a SQLite FTS5 index (`node:sqlite`, Node.js 24 or later) that `scripts/build-search-index.mjs` builds from
a copy of the data in a folder. `sync-mirror.mjs` runs it on every sync; to build it for an existing mirror:

```bash
umask 022
node scripts/build-search-index.mjs /srv/hadith-mirror/hadith-api
```

The app finds the index in the folder `HADITH_FAWAZ_URL` points to, or at `HADITH_SEARCH_DB`. With the data read from
GitHub there is no index and the page says search is unavailable. Only the Arabic, Indonesian and English texts are
searchable. The browser tests build an index of the fixtures before they start.

## Browser tests

`e2e/*.e2e.ts` drive Chromium against the production build with a small copy of the data (`e2e/fixtures`, made by
`node scripts/e2e-fixtures.mjs`) and a fake HadeethEnc server (`e2e/hadeethenc-fake.mjs`), so they need no network.

```bash
npm run build
npx playwright install chromium   # once
npm run test:e2e                  # next start on port 3100 (E2E_PORT to change it), the fake on the next port
```

## Docker

```bash
bash scripts/docker-smoke.sh
```

Builds the production image, starts it, and checks that it serves its pages and static files. CI runs it on every pull
request; run it yourself before merging a change to the `Dockerfile` or to `public/`.

## CI

`.github/workflows/ci.yml` runs on every pull request. The `master` branch requires three checks: "Lint & build
(includes typecheck)", "Docker image starts" and "Browser tests".

## Deploying

QA (hadist-qa.udienz.web.id) is deployed with the manual "Deploy QA" workflow, production (hadist.udienz.web.id) by
pushing a `v*` tag on `master`, which runs "Deploy Production". Both run `scripts/deploy.sh` on the server over SSH. The
details (ports, nginx, secrets, the mirror timer) are in [CLAUDE.md](../CLAUDE.md#deploy).

## README screenshots

The pictures in `docs/screenshots/` are taken from a running site, in English and Indonesian:

```bash
node scripts/readme-screenshots.mjs https://hadist-qa.udienz.web.id
```

It needs Playwright's Chromium. Take them again when the pages they show change.
