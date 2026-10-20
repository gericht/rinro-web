// og.html の各 section.card を等倍の PNG に書き出す。
// - og-ja / og-en      → ../assets/og-image.png / og-image-en.png（1200x630）
// - thumb-ja / thumb-en → ../../assets/apps/yosuga-thumbnail.png / yosuga-thumbnail-en.png（1400x644）
// 実行: node export-og.mjs
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const outputs = {
  "og-ja": join(here, "..", "assets", "og-image.png"),
  "og-en": join(here, "..", "assets", "og-image-en.png"),
  "thumb-ja": join(here, "..", "..", "assets", "apps", "yosuga-thumbnail.png"),
  "thumb-en": join(here, "..", "..", "assets", "apps", "yosuga-thumbnail-en.png"),
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 800 }, deviceScaleFactor: 1 });
await page.goto("file://" + join(here, "og.html"), { waitUntil: "networkidle" });
await page.evaluate(() => document.body.classList.add("exporting")); // 原寸で書き出す
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every((im) => im.complete && im.naturalWidth > 0));
for (const [id, out] of Object.entries(outputs)) {
  await (await page.$(`section#${id}`)).screenshot({ path: out });
  console.log("✓", out);
}
await browser.close();
