// og.html の .card を 1200x630px の PNG (../assets/og-image.png) に書き出す。
// 実行: node export-og.mjs
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "assets", "og-image.png");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto("file://" + join(here, "og.html"), { waitUntil: "networkidle" });
await page.evaluate(() => document.body.classList.add("exporting")); // 原寸(1200x630)で書き出す
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every((im) => im.complete && im.naturalWidth > 0));
await (await page.$("section.card")).screenshot({ path: out });
console.log("✓", out);
await browser.close();
