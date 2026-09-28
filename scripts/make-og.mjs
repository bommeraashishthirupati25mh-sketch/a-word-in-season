// Social share images (1200×630) for the home page and every occasion,
// drawn by headless Chrome so Hindi and Telugu text render properly.
// Run: npm run build:og   (needs Google Chrome or Edge installed; set CHROME_PATH otherwise)

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { OCCASIONS, MOTTO } from "../public/js/occasions.js";
import { SITE_NAME } from "../public/js/site.js";
import { esc } from "../public/js/views.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "og");
mkdirSync(out, { recursive: true });
const en = JSON.parse(readFileSync(join(root, "public", "data", "verses-en.json"), "utf8"));

const chrome = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => p && existsSync(p));
if (!chrome) throw new Error("Chrome not found — set CHROME_PATH");

const verseText = (ref) => en[ref].text.map((p) => p.t).join(" ");

function card({ icon, title, alt, quote, cite }) {
  return `<!doctype html><html><head><meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Devanagari:wght@600&family=Noto+Serif+Telugu:wght@600&display=block" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; background: #faf6ef; font-family: "Noto Serif", serif; color: #2a211a; }
    .frame { position: absolute; inset: 28px; border: 2px solid #e7dccb; border-radius: 28px; padding: 56px 64px; display: flex; flex-direction: column; }
    .band { position: absolute; left: 0; top: 0; bottom: 0; width: 14px; background: #7a2e2e; border-radius: 28px 0 0 28px; }
    .top { display: flex; align-items: center; gap: 18px; font-size: 30px; font-weight: 600; color: #7a2e2e; }
    .mark { width: 56px; height: 56px; border-radius: 14px; background: #7a2e2e; display: grid; place-items: center; }
    .mark svg { width: 36px; height: 36px; }
    h1 { font-size: ${title.length > 22 ? 64 : 78}px; line-height: 1.1; margin-top: 44px; font-weight: 600; display: flex; align-items: center; gap: 24px; }
    .alt { font-size: 34px; color: #6e6152; margin-top: 14px; font-family: "Noto Serif Devanagari", "Noto Serif Telugu", serif; }
    .quote { margin-top: auto; font-size: 28px; font-style: italic; line-height: 1.45; color: #4a3d31; max-width: 980px;
             display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .cite { font-size: 22px; color: #a8791f; margin-top: 10px; font-weight: 600; font-style: normal; }
  </style></head><body><div class="frame"><div class="band"></div>
    <div class="top"><div class="mark"><svg viewBox="0 0 32 32"><path d="M16 5v22M9 12h14" stroke="#f3dca4" stroke-width="3.2" stroke-linecap="round" fill="none"/></svg></div>${SITE_NAME}</div>
    <h1>${icon ? `<span style="font-size:.85em">${icon}</span>` : ""}${esc(title)}</h1>
    <div class="alt">${alt}</div>
    <p class="quote">“${esc(quote)}”</p>
    <p class="cite">${esc(cite)}</p>
  </div></body></html>`;
}

const jobs = [
  {
    file: "home.png",
    html: card({
      title: "Scripture for every occasion",
      alt: "English · हिंदी · తెలుగు",
      quote: verseText(MOTTO),
      cite: en[MOTTO].ref,
    }),
  },
  ...OCCASIONS.map((o) => ({
    file: `${o.id}.png`,
    html: card({
      icon: o.icon,
      title: `${o.name.en} Bible Verses`,
      alt: `${o.name.hi} · ${o.name.te}`,
      quote: verseText(o.verses[0]),
      cite: `${en[o.verses[0]].ref} · ${o.verses.length} verses, prayer & talking points`,
    }),
  })),
];

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
for (const job of jobs) {
  await page.setContent(job.html, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(out, job.file), type: "png" });
}
await browser.close();
console.log(`Wrote ${jobs.length} share images to public/og/`);
