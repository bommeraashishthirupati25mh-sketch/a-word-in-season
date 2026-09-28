// Checks a running copy of the site in headless Chrome.
// Run: npm run check [-- https://your-site]   (defaults to http://localhost:8790)
//
// Per page: status, zero console errors, one <h1>, unique <title>, meta
// description, canonical, valid JSON-LD, breadcrumbs, share image, alt text,
// no horizontal scroll on a phone, dedication present. Site-wide: every
// internal link resolves, 404 page returns 404, SEO files exist, no source
// maps, theme toggle works, offline mode works.

import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = (process.argv[2] || "http://localhost:8790").replace(/\/$/, "");
const chrome = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => p && existsSync(p));

const problems = [];
const fail = (msg) => problems.push(msg);
const ok = (msg) => console.log("  ✓ " + msg);

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });

async function inspect(path, { mobile = false } = {}) {
  const page = await browser.newPage();
  if (mobile) await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  else await page.setViewport({ width: 1280, height: 900 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("requestfailed", (r) => !r.url().includes("fonts.g") && errors.push(`request failed: ${r.url()}`));
  const res = await page.goto(BASE + path, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 300));
  const info = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelectorAll("h1").length,
    description: document.querySelector('meta[name="description"]')?.content,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
    robots: document.querySelector('meta[name="robots"]')?.content,
    jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
    crumbs: !!document.querySelector(".crumbs"),
    imgsNoAlt: [...document.querySelectorAll("img:not([alt])")].length,
    links: [...document.querySelectorAll("a[href]")].map((a) => a.href),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    dedication: document.querySelector("#dedication")?.textContent.replace(/\s+/g, " ").trim(),
    placeholder: /lorem ipsum|todo|placeholder text|coming soon/i.test(document.body.innerText),
    sourcemaps: [...document.scripts].some((s) => /sourceMappingURL/.test(s.textContent)),
  }));
  await page.close();
  return { status: res.status(), errors, ...info };
}

const paths = ["/", "/about", "/saved", ...(await (await fetch(BASE + "/sitemap.xml")).text()).match(/<loc>[^<]+<\/loc>/g).map((l) => new URL(l.slice(5, -6)).pathname)];
const unique = [...new Set(paths)];
console.log(`Checking ${unique.length} pages on ${BASE}`);

const titles = new Map();
const allLinks = new Set();
for (const path of unique) {
  for (const mobile of [false, true]) {
    const r = await inspect(path, { mobile });
    const where = `${path} (${mobile ? "phone" : "desktop"})`;
    if (r.status !== 200) fail(`${where}: HTTP ${r.status}`);
    if (r.errors.length) fail(`${where}: console errors: ${r.errors.join(" | ")}`);
    if (r.h1 !== 1) fail(`${where}: ${r.h1} <h1> elements`);
    if (r.overflow) fail(`${where}: horizontal scroll`);
    if (!r.dedication?.includes("Raj Timothy") || !r.dedication.includes("Smyrna House of Fellowship")) fail(`${where}: dedication missing`);
    if (r.imgsNoAlt) fail(`${where}: ${r.imgsNoAlt} images without alt`);
    if (r.placeholder) fail(`${where}: placeholder text`);
    if (r.sourcemaps) fail(`${where}: source map reference`);
    if (mobile) continue;
    if (titles.has(r.title)) fail(`${path}: title duplicates ${titles.get(r.title)}`);
    titles.set(r.title, path);
    if (!r.description || r.description.length < 50) fail(`${path}: weak meta description`);
    if (path !== "/saved" && !r.canonical) fail(`${path}: no canonical`);
    if (!r.ogImage) fail(`${path}: no og:image`);
    if (path !== "/" && !r.crumbs) fail(`${path}: no breadcrumbs`);
    for (const j of r.jsonld) {
      try {
        JSON.parse(j);
      } catch {
        fail(`${path}: invalid JSON-LD`);
      }
    }
    r.links.forEach((l) => allLinks.add(l.split("#")[0]));
  }
}
ok(`${unique.length} pages × desktop + phone`);

// Internal links and share images resolve.
const internal = [...allLinks].filter((l) => l.startsWith(BASE));
const ogs = [...unique].map((p) => (p === "/" || !p.startsWith("/occasions/") ? "/og/home.png" : `/og/${p.split("/").pop()}.png`));
for (const url of [...internal, ...new Set(ogs.map((o) => BASE + o))]) {
  const res = await fetch(url, { redirect: "manual" });
  if (res.status >= 400) fail(`broken link: ${url} (${res.status})`);
}
ok(`${internal.length} internal links + share images resolve`);

// SEO files and 404.
for (const f of ["/sitemap.xml", "/robots.txt", "/llms.txt", "/manifest.webmanifest"]) {
  const res = await fetch(BASE + f);
  if (res.status !== 200) fail(`${f}: HTTP ${res.status}`);
}
const nf = await fetch(BASE + "/this-page-does-not-exist");
if (nf.status !== 404) fail(`missing page returns ${nf.status}, not 404`);
else if (!(await nf.text()).includes("Page not found")) fail("404 page is not the custom one");
ok("sitemap.xml, robots.txt, llms.txt, manifest, custom 404");

// Theme toggle and offline mode.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
  await page.goto(BASE + "/occasions/wedding", { waitUntil: "networkidle0" });
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.click("#theme-btn");
  const after = await page.evaluate(() => [getComputedStyle(document.body).backgroundColor, document.documentElement.dataset.theme]);
  if (before === after[0] || after[1] !== "dark") fail(`theme toggle did not switch (${before} → ${after})`);
  await page.reload({ waitUntil: "networkidle0" });
  const kept = await page.evaluate(() => document.documentElement.dataset.theme);
  if (kept !== "dark") fail("theme choice not remembered after reload");
  ok(`theme toggle: ${before} → ${after[0]}, remembered after reload`);

  if (BASE.startsWith("https") || BASE.includes("localhost")) {
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.setOfflineMode(true);
    for (const p of ["/", "/occasions/funeral-and-comfort", "/about"]) {
      await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
      const h1 = await page.$eval("h1", (e) => e.textContent).catch(() => null);
      if (!h1) fail(`offline: ${p} did not load`);
    }
    await page.setOfflineMode(false);
    ok("works offline after first visit");
  }
  await page.close();
}

await browser.close();
if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s):\n  - ` + problems.join("\n  - "));
  process.exit(1);
}
console.log("\nAll checks passed.");
