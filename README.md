# A Word in Season

Bible verses, an opening prayer, talking points and a closing blessing for every church occasion — birthdays, weddings, baptisms, funerals, housewarmings and more — in **English, Hindi and Telugu**, with a full-screen **podium mode** for reading at the pulpit or projecting.

> “A word spoken in due season, how good is it!” — Proverbs 15:23

*Lovingly built for Bro. Raj Timothy, Smyrna House of Fellowship.*

## Features

- **17 occasions**, each with 8–12 hand-picked passages
- **Speaker's kit** per occasion: opening prayer, three talking points linked to verses, and a closing blessing
- **Three languages**, shown alone or side by side (KJV, Hindi IRV, Telugu IRV); site interface in all three
- **Podium mode**: large type that auto-fits the screen, tap/swipe/arrow keys or a presentation clicker, `B` to blank the screen, `+`/`−` text size, light/dark, keeps the phone screen awake
- Copy, share (WhatsApp / phone share sheet), save favourites on the device, search in any language, verse of the day
- **Built for phones**: bottom tab bar, large tap targets, floating *Present all* button, adjustable reading size
- **Installable app (PWA)** that works fully **offline** after the first visit — handy in church halls with poor signal

## Installing on a phone

- **Android (Chrome)**: open the site and tap the **Install** (⬇) button in the header, or ⋮ → *Install app*.
- **iPhone (Safari)**: tap **Share** → **Add to Home Screen**. The site shows this hint once.

Once installed it opens full-screen from its own icon and needs no internet. When a new version is published, the app shows *“A new version is ready — Update”*.

## Publishing an update

Push to `main` and Cloudflare redeploys. Installed copies pick up changed files automatically in the background. If you change the list of files the app needs offline, update `APP_SHELL` in `public/sw.js` and bump its `VERSION`.

Icons are drawn by `node scripts/make-icons.mjs` (no image tools needed).

## Project layout

```
public/                  ← the deployed website (everything here is served as-is)
  js/occasions.js        ← occasions, verse references, prayers, talking points  ✏️ edit here
  js/i18n.js             ← interface text in en / hi / te
  js/site.js             ← site address, dedication                            ✏️ edit here
  js/views.js            ← page markup (used by the browser AND the page builder)
  js/app.js              ← navigation, languages, theme, actions, offline
  js/podium.js           ← podium mode (loaded on first use)
  css/styles.css
  index.html, about.html, saved.html, 404.html, occasions/*.html   ← generated
  data/verses-{en,hi,te}.json                                      ← generated
  og/*.png, icons/*.png                                            ← generated
  sitemap.xml, robots.txt, llms.txt, sw.js (precache list)         ← generated
scripts/
  build-verses.mjs       ← exact verse text for every reference, from the source Bibles
  build-pages.mjs        ← pre-renders every page + SEO files + service-worker list
  make-og.mjs            ← social share images (needs Chrome)
  make-icons.mjs         ← app icons
  check-site.mjs         ← end-to-end checks in headless Chrome
wrangler.jsonc           ← Cloudflare Workers static-assets config
```

Generated files are committed, so Cloudflare needs no build step. **Don't edit the generated HTML by hand** — change the sources and rebuild.

## SEO & quality

Every page is pre-rendered HTML with a unique title, meta description, canonical URL, one `<h1>`, breadcrumbs, Open Graph/Twitter share image and schema.org structured data (WebSite, Church, CollectionPage with the verse list, BreadcrumbList). Clean URLs (`/occasions/wedding-anniversary`), a real 404 page, `sitemap.xml`, `robots.txt` and `llms.txt` are generated. Old `/#/o/…` links redirect.

`npm run check` (with the site running locally, or `npm run check -- https://your-site`) verifies all of this on desktop and phone, plus zero console errors, working internal links, the theme toggle and offline mode.

## Adding or changing verses

1. Edit `public/js/occasions.js` — references use USFM book codes, e.g. `"JHN 3:16"`, `"1CO 13:4-7"`.
2. Run `npm run build:verses` (first run downloads the three Bibles from eBible.org into `sources/`). It fails loudly if a reference is missing in any language.
3. Run `npm run build` to regenerate the pages (and `npm run build:og` if you added or renamed an occasion).
4. Commit everything under `public/`.

## Custom domain

Connect the domain in Cloudflare (**Workers & Pages → a-word-in-season → Settings → Domains & Routes → Add → Custom domain**), then set `SITE_URL` in `public/js/site.js`, run `npm run build`, commit and push.

## Run locally

```bash
npm install
npm run dev
```

## Deploy (Cloudflare + GitHub)

Hosted on Cloudflare Workers (static assets). Connect the GitHub repo once in the Cloudflare dashboard — **Workers & Pages → Create → Import a repository** — leave the build command empty and use `npx wrangler deploy` as the deploy command. Every push to `main` then redeploys automatically.

Manual deploy: `npx wrangler login` then `npm run deploy`.

## Scripture credits

- **English** — King James Version. Public domain.
- **Hindi** — इंडियन रिवाइज्ड वर्जन (IRV) हिंदी – 2019, © 2017–2019 Bridge Connectivity Solutions, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- **Telugu** — ఇండియన్ రివైజ్డ్ వెర్షన్ (IRV) – 2019, © 2017, 2019 Bridge Connectivity Solutions, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Texts from [eBible.org](https://ebible.org). `public/data/verses-*.json` are derivatives of these texts and are shared under CC BY-SA 4.0. Inline cross-reference notes are removed; verses a translation combines are shown with their full range.
