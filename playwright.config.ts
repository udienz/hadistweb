import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

// Browser tests (e2e/*.e2e.ts) against the production build (`npm run build` first), as in quranweb. The books come from
// the small data copy in e2e/fixtures/hadith-api, HadeethEnc from a fake server over e2e/fixtures/hadeethenc, so the tests
// need no network. CI runs them.
const PORT = Number(process.env.E2E_PORT ?? 3100);
const ENC_PORT = PORT + 1;
const fixtures = resolve(__dirname, "e2e/fixtures");

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Indonesian interface: the browser's locale decides Accept-Language.
    locale: "id-ID",
    trace: "off",
  },
  webServer: [
    {
      command: `node e2e/hadeethenc-fake.mjs ${ENC_PORT}`,
      url: `http://127.0.0.1:${ENC_PORT}/health`,
      reuseExistingServer: !process.env.CI,
    },
    {
      // The search index of the fixtures is built first (it is not committed: scripts/build-search-index.mjs).
      command: `node scripts/build-search-index.mjs e2e/fixtures/hadith-api && npm run start -- -p ${PORT} -H 127.0.0.1`,
      url: `http://127.0.0.1:${PORT}/about`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        HADITH_FAWAZ_URL: `${fixtures}/hadith-api`,
        HADEETHENC_API_URL: `http://127.0.0.1:${ENC_PORT}`,
      },
    },
  ],
});
