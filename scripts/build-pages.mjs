// Pre-renders every page to static HTML and writes the SEO files.
// Run: npm run build:pages   (after build:verses when verses change)
//
// Output (all in public/):
//   index.html, about.html, saved.html, 404.html, occasions/<slug>.html
//   sitemap.xml, robots.txt, llms.txt
//   sw.js — its precache list and version are updated in place.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { OCCASIONS, occasionById } from "../public/js/occasions.js";
import { SITE_URL, SITE_NAME, DEDICATION } from "../public/js/site.js";
import { LANGS } from "../public/js/i18n.js";
import { pageHTML, metaFor, dedicationHTML, occasionPath, esc, ICONS } from "../public/js/views.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const today = new Date();
const isoDate = today.toISOString().slice(0, 10);

// Pre-rendered pages show the default view: English interface and verses.
const en = JSON.parse(readFileSync(join(pub, "data", "verses-en.json"), "utf8"));
const verses = Object.fromEntries(Object.entries(en).map(([ref, e]) => [ref, { ref: { en: e.ref }, text: { en: e.text } }]));
const ctx = { ui: "en", langs: ["en"], saved: [], verses, query: "", tab: "verses", today };

const abs = (path) => SITE_URL + path;
const WEBSITE_ID = `${SITE_URL}/#website`;
const CHURCH_ID = `${SITE_URL}/#church`;

// ---------- Structured data ----------
function jsonLd(page, meta) {
  const graph = [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: abs("/"),
      name: SITE_NAME,
      description: metaFor({ kind: "home" }).description,
      inLanguage: ["en", "hi", "te"],
      sourceOrganization: { "@id": CHURCH_ID },
    },
    // A church is a place of worship in schema.org terms (not a LocalBusiness).
    // Add address, telephone and service times here once provided.
    { "@type": "Church", "@id": CHURCH_ID, name: DEDICATION.church },
  ];
  const webPage = {
    "@id": abs(meta.path ?? "/404") + "#webpage",
    url: meta.path ? abs(meta.path) : undefined,
    name: meta.title,
    description: meta.description,
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en",
  };
  if (page.kind === "home") {
    graph.push({
      ...webPage,
      "@type": "WebPage",
      primaryImageOfPage: abs("/og/home.png"),
      mainEntity: {
        "@type": "ItemList",
        name: "Church occasions",
        numberOfItems: OCCASIONS.length,
        itemListElement: OCCASIONS.map((o, i) => ({ "@type": "ListItem", position: i + 1, name: o.name.en, url: abs(occasionPath(o)) })),
      },
    });
  } else if (page.kind === "occasion") {
    const o = page.occ;
    graph.push(
      {
        ...webPage,
        "@type": "CollectionPage",
        primaryImageOfPage: abs(meta.image),
        breadcrumb: { "@id": abs(meta.path) + "#breadcrumb" },
        about: { "@type": "Thing", name: `Bible verses for ${o.about}` },
        mainEntity: {
          "@type": "ItemList",
          name: `${o.name.en} Bible verses`,
          numberOfItems: o.verses.length,
          itemListElement: o.verses.map((ref, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${abs(meta.path)}#${ref.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            item: {
              "@type": "Quotation",
              name: verses[ref].ref.en,
              text: verses[ref].text.en.map((p) => p.t).join(" "),
              isPartOf: { "@type": "Book", name: "The Holy Bible, King James Version" },
            },
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": abs(meta.path) + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
          { "@type": "ListItem", position: 2, name: o.name.en, item: abs(meta.path) },
        ],
      }
    );
  } else if (page.kind === "about") {
    graph.push(
      { ...webPage, "@type": "AboutPage", breadcrumb: { "@id": abs("/about#breadcrumb") } },
      {
        "@type": "BreadcrumbList",
        "@id": abs("/about#breadcrumb"),
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
          { "@type": "ListItem", position: 2, name: "About", item: abs("/about") },
        ],
      }
    );
  } else {
    graph.push({ ...webPage, "@type": "WebPage" });
  }
  // `</` must not appear inside a <script> block.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

// ---------- Page template ----------
function htmlPage(page) {
  const meta = metaFor(page, "en");
  const image = meta.image ?? "/og/home.png";
  const imageAlt = page.kind === "occasion" ? `${page.occ.name.en} — Bible verses in English, Hindi and Telugu` : `${SITE_NAME} — Scripture for every occasion`;
  const url = meta.path ? abs(meta.path) : null;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}">
  ${url ? `<link rel="canonical" href="${url}">` : ""}
  ${meta.noindex ? `<meta name="robots" content="noindex, follow">` : ""}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.description)}">
  ${url ? `<meta property="og:url" content="${url}">` : ""}
  <meta property="og:image" content="${abs(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(imageAlt)}">
  <meta property="og:locale" content="en_IN">
  <meta property="og:locale:alternate" content="hi_IN">
  <meta property="og:locale:alternate" content="te_IN">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(meta.title)}">
  <meta name="twitter:description" content="${esc(meta.description)}">
  <meta name="twitter:image" content="${abs(image)}">
  <meta name="twitter:image:alt" content="${esc(imageAlt)}">
  <meta name="theme-color" content="#faf6ef" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#15110d" media="(prefers-color-scheme: dark)">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Word in Season">
  <script>try{var t=JSON.parse(localStorage.getItem("awis:theme"));if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- Serif faces for scripture only; interface text uses the phone's own fonts (which cover Hindi and Telugu). -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Serif+Telugu:wght@400;600&family=Noto+Serif:ital,wght@0,400;0,600;1,400&display=swap">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="modulepreload" href="/js/views.js">
  <link rel="modulepreload" href="/js/occasions.js">
  <link rel="modulepreload" href="/js/i18n.js">
  <link rel="modulepreload" href="/js/site.js">
  <script type="module" src="/js/app.js"></script>
  <script type="application/ld+json">${jsonLd(page, meta)}</script>
</head>
<body>
  <a class="skip" href="#view">Skip to content</a>
  <header class="topbar">
    <div class="wrap topbar-inner">
      <a class="brand" href="/">
        <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 5v22M9 12h14" /></svg>
        <span class="brand-name" data-t="title">${SITE_NAME}</span>
      </a>
      <nav class="nav" aria-label="Main">
        <a href="/" data-route="home"${page.kind === "home" || page.kind === "occasion" ? ' aria-current="page"' : ""}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Zm0 0A2 2 0 0 0 6 22h13"/><path d="M12 7v6M9 9.5h6"/></svg>
          <span data-t="occasions">Occasions</span>
        </a>
        <a href="/saved" data-route="saved"${page.kind === "saved" ? ' aria-current="page"' : ""}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>
          <span data-t="saved">Saved</span>
        </a>
        <a href="/about" data-route="about"${page.kind === "about" ? ' aria-current="page"' : ""}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>
          <span data-t="about">About</span>
        </a>
      </nav>
      <button id="install-btn" class="icon-pill install-btn" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/></svg>
        <span data-t="install">Install</span>
      </button>
      <button id="theme-btn" class="icon-pill theme-btn" type="button" aria-label="Switch theme">${ICONS.moon}</button>
      <label class="site-lang">
        <span class="sr-only" data-t="siteLang">Site language</span>
        <select id="site-lang">
          ${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" lang="${k}">${v.short === "EN" ? "EN" : v.label}</option>`).join("")}
        </select>
      </label>
    </div>
  </header>

  <main id="view" class="wrap" tabindex="-1">
${pageHTML(ctx, page)}
  </main>

  <footer class="footer">
    <section class="dedication wrap" id="dedication" aria-label="Dedication">
${dedicationHTML(ctx)}
    </section>
    <div class="wrap credits">
      <p>English: King James Version (public domain). Hindi &amp; Telugu: Indian Revised Version © Bridge Connectivity Solutions, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>, via <a href="https://ebible.org">eBible.org</a>. <a href="/about">About &amp; credits</a></p>
    </div>
  </footer>

  <div id="podium" class="podium" hidden></div>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
</body>
</html>
`;
}

// ---------- Write pages ----------
const pages = [
  { file: "index.html", page: { kind: "home" } },
  { file: "about.html", page: { kind: "about" } },
  { file: "saved.html", page: { kind: "saved" } },
  { file: "404.html", page: { kind: "notFound" } },
  ...OCCASIONS.map((o) => ({ file: `occasions/${o.id}.html`, page: { kind: "occasion", occ: o } })),
];
mkdirSync(join(pub, "occasions"), { recursive: true });
const titles = new Set();
for (const { file, page } of pages) {
  const html = htmlPage(page);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) throw new Error(`${file} has ${h1s} <h1> elements`);
  const title = metaFor(page).title;
  if (titles.has(title)) throw new Error(`Duplicate title: ${title}`);
  titles.add(title);
  writeFileSync(join(pub, file), html);
}
const missingImages = pages
  .map(({ page }) => metaFor(page).image ?? "/og/home.png")
  .filter((p, i, a) => a.indexOf(p) === i && !existsSync(join(pub, p)));
if (missingImages.length) console.warn(`⚠ Missing share images (run npm run build:og): ${missingImages.join(", ")}`);

// ---------- sitemap.xml, robots.txt, llms.txt ----------
const indexed = pages.filter(({ page }) => !metaFor(page).noindex);
writeFileSync(
  join(pub, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexed.map(({ page }) => `  <url><loc>${abs(metaFor(page).path)}</loc><lastmod>${isoDate}</lastmod></url>`).join("\n")}
</urlset>
`
);

writeFileSync(join(pub, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /saved\n\nSitemap: ${abs("/sitemap.xml")}\n`);

writeFileSync(
  join(pub, "llms.txt"),
  `# ${SITE_NAME}

> Hand-picked Bible verses for church occasions — birthdays, weddings, baptisms, funerals, housewarmings and more — each with an opening prayer, three talking points and a closing blessing. Verses are shown in English (King James Version), Hindi and Telugu (Indian Revised Version, 2019). Built for ${DEDICATION.name}, ${DEDICATION.church}.

Verse text is quoted exactly from the source translations. The KJV is public domain; the Hindi and Telugu IRV are © Bridge Connectivity Solutions under CC BY-SA 4.0 (via eBible.org) and must be attributed when reused.

## Occasions

${OCCASIONS.map((o) => `- [${o.name.en}](${abs(occasionPath(o))}): ${o.verses.length} verses for ${o.about}, e.g. ${o.verses.slice(0, 3).map((r) => verses[r].ref.en).join(", ")}`).join("\n")}

## About

- [About & scripture credits](${abs("/about")}): how the site works, podium mode, translations and licences

## Data

- [English verses (JSON)](${abs("/data/verses-en.json")})
- [Hindi verses (JSON)](${abs("/data/verses-hi.json")})
- [Telugu verses (JSON)](${abs("/data/verses-te.json")})
`
);

// ---------- Service worker precache list + version ----------
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const shellFiles = walk(pub)
  .map((p) => "/" + relative(pub, p).replace(/\\/g, "/"))
  .filter((u) => /\.(css|js|json|svg|webmanifest)$/.test(u) || u.startsWith("/icons/"))
  .filter((u) => u !== "/sw.js")
  .sort();
const shellPages = pages.filter(({ page }) => page.kind !== "notFound").map(({ page }) => metaFor(page).path);
const shell = [...shellPages, "/404", ...shellFiles];
const hash = createHash("sha256");
for (const u of shellFiles) hash.update(readFileSync(join(pub, u)));
for (const { file } of pages) hash.update(readFileSync(join(pub, file)));
const version = hash.digest("hex").slice(0, 10);

const swPath = join(pub, "sw.js");
let sw = readFileSync(swPath, "utf8");
sw = sw.replace(/const VERSION = "[^"]*";/, `const VERSION = "${version}";`);
sw = sw.replace(/\/\/ BUILD:SHELL-START[\s\S]*?\/\/ BUILD:SHELL-END/, `// BUILD:SHELL-START (generated by scripts/build-pages.mjs)\nconst APP_SHELL = ${JSON.stringify(shell, null, 2)};\n// BUILD:SHELL-END`);
writeFileSync(swPath, sw);

console.log(`Wrote ${pages.length} pages, sitemap (${indexed.length} URLs), robots.txt, llms.txt; service worker ${version} (${shell.length} files).`);
