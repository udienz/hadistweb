#!/usr/bin/env node
// Take the README screenshots from a running site, in English and Indonesian.
//
//   node scripts/readme-screenshots.mjs [https://hadist-qa.udienz.web.id]
//
// Writes docs/screenshots/<en|id>/*.png. Needs Playwright's Chromium (the devDependency @playwright/test; on the
// workspace VM run it in the mcr.microsoft.com/playwright image). Pictures meant for people are taken at twice the
// pixel density.

import { chromium, devices } from "@playwright/test";

const BASE = (process.argv[2] ?? "https://hadist-qa.udienz.web.id").replace(/\/$/, "");
const OUT = new URL("../docs/screenshots/", import.meta.url).pathname;
const desktop = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 };
const phone = devices["Pixel 7"];

async function context(browser, lang, options, scheme = "light") {
  const ctx = await browser.newContext({ ...options, colorScheme: scheme });
  await ctx.addCookies([{ name: "hw-lang", value: lang, url: BASE }]);
  return ctx;
}

async function shot(browser, lang, name, path, options, prepare, scheme) {
  const ctx = await context(browser, lang, options, scheme);
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  if (prepare) await prepare(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}${lang}/${name}.png` });
  await ctx.close();
  console.log(`${lang}/${name}.png`);
}

const browser = await chromium.launch();
for (const lang of ["en", "id"]) {
  await shot(browser, lang, "home", "/", desktop);
  // The first hadith card just under the sticky header.
  const toFirstCard = (p) => p.locator("article").first().evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120));
  await shot(browser, lang, "reading", "/bukhari/chapter/1", desktop, toFirstCard);
  await shot(browser, lang, "hadith-phone", "/bukhari/349", phone, (p) =>
    p.locator("article div[lang]:not([lang=ar])").first().evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 90)),
  );
  await shot(browser, lang, "topics", "/topics/hadith/66512", desktop);
  await shot(browser, lang, "search", `/search?q=${lang === "id" ? "niat" : "intention"}`, desktop);
  await shot(browser, lang, "language", "/", phone, (p) => p.locator("header button[aria-haspopup=menu]").click());
  await shot(browser, lang, "text-size", "/abudawud/1", phone, (p) => p.locator("header button[aria-haspopup=dialog]").click());
  await shot(browser, lang, "reading-dark", "/bukhari/chapter/2", desktop, toFirstCard, "dark");
}
await browser.close();
