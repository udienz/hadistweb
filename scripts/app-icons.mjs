#!/usr/bin/env node
// Draw the app icons from src/app/icon.svg: public/icons/icon-192.png and icon-512.png (the rounded tile as it is),
// icon-maskable-512.png (full bleed, the logo inside the safe zone, for Android's shaped icons) and src/app/apple-icon.png
// (180 by 180, full bleed: iOS rounds the corners itself). Run it again when the logo changes; the results are committed.
//
//   node scripts/app-icons.mjs
//
// Needs Playwright's Chromium (on the workspace VM, run it in the mcr.microsoft.com/playwright image).

import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const svg = readFileSync(new URL("src/app/icon.svg", root), "utf8");
// The logo without its rounded tile, to set on a full-bleed background.
const logo = svg.replace(/<rect[^>]*\/>/, "");
const FOREST = "#344c3d";

const icons = [
  { file: "public/icons/icon-192.png", size: 192, html: svg, bleed: false },
  { file: "public/icons/icon-512.png", size: 512, html: svg, bleed: false },
  // Maskable: the platform may cut up to a circle of 80% of the width, so the logo takes 60%.
  { file: "public/icons/icon-maskable-512.png", size: 512, html: logo, bleed: true, scale: 0.6 },
  { file: "src/app/apple-icon.png", size: 180, html: logo, bleed: true, scale: 0.78 },
];

const browser = await chromium.launch();
for (const icon of icons) {
  const page = await browser.newPage({ viewport: { width: icon.size, height: icon.size } });
  const inner = icon.bleed ? Math.round(icon.size * icon.scale) : icon.size;
  await page.setContent(`<!doctype html><html><body style="margin:0;width:${icon.size}px;height:${icon.size}px;display:flex;align-items:center;justify-content:center;background:${icon.bleed ? FOREST : "transparent"}">
    <div style="width:${inner}px;height:${inner}px">${icon.html.replace("<svg ", '<svg width="100%" height="100%" ')}</div></body></html>`);
  await page.screenshot({ path: new URL(icon.file, root).pathname, omitBackground: !icon.bleed });
  await page.close();
  console.log("wrote", icon.file);
}
await browser.close();
