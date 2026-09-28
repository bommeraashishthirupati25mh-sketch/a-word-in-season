# A Word in Season

Bible verses, an opening prayer, talking points and a closing blessing for every church occasion — birthdays, weddings, baptisms, funerals, housewarmings and more — in **English, Hindi and Telugu**, with a full-screen **podium mode** for reading at the pulpit or projecting.

> “A word spoken in due season, how good is it!” — Proverbs 15:23

## Features

- **17 occasions**, each with 8–12 hand-picked passages
- **Speaker's kit** per occasion: opening prayer, three talking points linked to verses, and a closing blessing
- **Three languages**, shown alone or side by side (KJV, Hindi IRV, Telugu IRV); site interface in all three
- **Podium mode**: large type that auto-fits the screen, tap/swipe/arrow keys or a presentation clicker, `B` to blank the screen, `+`/`−` text size, light/dark, keeps the phone screen awake
- Copy, share (WhatsApp / phone share sheet), save favourites on the device, search in any language, verse of the day

## Project layout

```
public/              ← the whole website (static, no build step)
  index.html
  css/styles.css
  js/app.js          ← views, podium mode
  js/occasions.js    ← occasions, verse references, prayers, talking points  ✏️ edit here
  js/i18n.js         ← interface text in en / hi / te
  data/verses.json   ← generated verse text (committed)
scripts/
  build-verses.mjs   ← pulls exact verse text for every reference from the source Bibles
  books.mjs          ← book names in all three languages
wrangler.jsonc       ← Cloudflare Workers static-assets config
```

## Adding or changing verses

1. Edit `public/js/occasions.js` — references use USFM book codes, e.g. `"JHN 3:16"`, `"1CO 13:4-7"`.
2. Run `npm run build:verses` (first run downloads the three Bibles from eBible.org into `sources/`).
3. The script fails loudly if a reference is missing in any language. Commit `public/data/verses.json` along with your change.

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

Texts from [eBible.org](https://ebible.org). `public/data/verses.json` is a derivative of these texts and is shared under CC BY-SA 4.0. Inline cross-reference notes are removed; verses a translation combines are shown with their full range.
