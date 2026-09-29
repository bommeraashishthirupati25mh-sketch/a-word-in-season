// Page markup, shared by the browser app and the build script (which uses it
// to pre-render every page). Pure functions: they take a context and return HTML.
//
// ctx = { ui, langs, saved, verses, query, tab, today }
//   verses[ref] = { ref: { en, hi, te }, text: { en: [{ v, t }], … } } — languages load on demand.

import { OCCASIONS, MOTTO, occasionById } from "./occasions.js";
import { LANGS, t } from "./i18n.js";
import { SITE_NAME, DEDICATION } from "./site.js";

export const LANG_ORDER = ["en", "hi", "te"];

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const ICONS = {
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  share: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
  present: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  cross: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 5v22M9 12h14"/></svg>',
};

// ---------- URLs and page identity ----------

export const occasionPath = (o) => `/occasions/${o.id}`;
export const refAnchor = (ref) => ref.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Maps a pathname to the page it shows.
export function pageFor(pathname) {
  const path = pathname.replace(/\/+$/, "").replace(/\.html$/, "") || "/";
  if (path === "/" || path === "/index") return { kind: "home" };
  if (path === "/saved") return { kind: "saved" };
  if (path === "/about") return { kind: "about" };
  const m = path.match(/^\/occasions\/([a-z0-9-]+)$/);
  if (m && occasionById(m[1])) return { kind: "occasion", occ: occasionById(m[1]) };
  return { kind: "notFound" };
}

// Title, description and indexing rules for a page, in the given interface language.
export function metaFor(page, ui = "en") {
  const tr = (k) => t(k, ui);
  const site = ui === "en" ? SITE_NAME : `${tr("title")} · ${SITE_NAME}`;
  switch (page.kind) {
    case "home":
      return {
        path: "/",
        title: ui === "en" ? `${SITE_NAME} — Bible Verses for Every Church Occasion` : `${tr("title")} — ${tr("tagline")}`,
        description:
          "Hand-picked Bible verses for birthdays, weddings, baptisms, funerals and every church occasion — with prayers, talking points and a podium mode. In English, Hindi and Telugu.",
      };
    case "occasion": {
      const o = page.occ;
      return {
        path: occasionPath(o),
        title: ui === "en" ? `${o.name.en} Bible Verses — English, Hindi & Telugu | ${SITE_NAME}` : `${o.name[ui]} — ${tr("verses")} | ${site}`,
        description: `${o.verses.length} Bible verses for ${o.about}, with an opening prayer, three talking points and a closing blessing — in English (KJV), Hindi and Telugu (IRV).`,
        image: `/og/${o.id}.png`,
      };
    }
    case "saved":
      return { path: "/saved", title: `${tr("savedTitle")} | ${site}`, description: "Your starred Bible verses from A Word in Season, kept privately on this device — ready to copy, share or present in podium mode.", noindex: true };
    case "about":
      return {
        path: "/about",
        title: ui === "en" ? `About & Scripture Credits | ${SITE_NAME}` : `${tr("about")} | ${site}`,
        description: `How ${SITE_NAME} works, podium mode, the Bible translations it uses and their licences. Built for ${DEDICATION.name}, ${DEDICATION.church}.`,
      };
    default:
      return { path: null, title: `${t("notFound", ui).replace(/[.।]$/, "")} | ${site}`, description: "This page could not be found.", noindex: true };
  }
}

// ---------- Small pieces ----------

const occasionsFor = (ref) => OCCASIONS.filter((o) => o.verses.includes(ref));
const refLabel = (e, lang) => (e.ref[lang] ?? e.ref.en ?? "");

function verseTextHTML(ctx, ref, lang) {
  const e = ctx.verses[ref];
  const parts = e?.text[lang];
  if (!parts) return "";
  const showNums = parts.length > 1 || parts.some((p) => String(p.v).includes("-"));
  const body = parts.map((p) => (showNums ? `<sup>${esc(p.v)}</sup>` : "") + esc(p.t)).join(" ");
  return `<p class="verse-text" lang="${lang}">${body}<span class="ver">${LANGS[lang].version}</span></p>`;
}

export function plainText(ctx, ref) {
  const e = ctx.verses[ref];
  return ctx.langs
    .filter((l) => e.text[l])
    .map((l) => `${e.text[l].map((p) => p.t).join(" ")}\n— ${e.ref[l]} (${LANGS[l].version})`)
    .join("\n\n");
}

function verseCardHTML(ctx, ref, { occ, index, showOccasions = false, flat = false, anchor = false } = {}) {
  const e = ctx.verses[ref];
  if (!e) return "";
  const tr = (k) => t(k, ctx.ui);
  const [first, ...rest] = ctx.langs;
  const saved = ctx.saved.includes(ref);
  const inOcc = showOccasions
    ? occasionsFor(ref).map((o) => `<a href="${occasionPath(o)}">${o.icon} ${esc(o.name[ctx.ui])}</a>`).join(" · ")
    : "";
  return `
    <article class="verse${flat ? " flat" : ""}" data-ref="${esc(ref)}"${anchor ? ` id="${refAnchor(ref)}"` : ""}>
      <h3 class="verse-ref"><span lang="${first}">${esc(refLabel(e, first))}</span>${rest
        .map((l) => `<span class="alt" lang="${l}">${esc(refLabel(e, l))}</span>`)
        .join("")}</h3>
      ${inOcc ? `<p class="verse-in">${inOcc}</p>` : ""}
      ${ctx.langs.map((l) => verseTextHTML(ctx, ref, l)).join("")}
      <div class="icon-row">
        <button class="icon-btn" data-act="present" ${occ ? `data-occ="${occ.id}" data-index="${index}"` : ""}>${ICONS.present}${tr("present")}</button>
        <button class="icon-btn" data-act="copy">${ICONS.copy}${tr("copy")}</button>
        <button class="icon-btn" data-act="share">${ICONS.share}${tr("share")}</button>
        <button class="icon-btn" data-act="save" aria-pressed="${saved}">${ICONS.star}${tr(saved ? "unsave" : "save")}</button>
      </div>
    </article>`;
}

function toolbarHTML(ctx) {
  const tr = (k) => t(k, ctx.ui);
  return `
    <div class="toolbar">
      <span class="toolbar-label">${tr("showIn")}</span>
      <div class="toggles" role="group" aria-label="${esc(tr("showIn"))}">
        ${LANG_ORDER.map((l) => `<button data-lang="${l}" aria-pressed="${ctx.langs.includes(l)}" lang="${l}">${LANGS[l].label}</button>`).join("")}
      </div>
      <div class="toggles text-size" role="group" aria-label="${esc(tr("textSize"))}">
        <button data-read="-1" aria-label="${esc(tr("smaller"))}">A−</button>
        <button data-read="1" aria-label="${esc(tr("bigger"))}">A+</button>
      </div>
    </div>`;
}

function occCardHTML(ctx, o) {
  const others = LANG_ORDER.filter((l) => l !== ctx.ui).map((l) => `<span lang="${l}">${esc(o.name[l])}</span>`).join(" · ");
  return `
    <a class="occ-card" href="${occasionPath(o)}">
      <span class="occ-icon" aria-hidden="true">${o.icon}</span>
      <span class="occ-name">${esc(o.name[ctx.ui])}</span>
      <span class="occ-alt">${others}</span>
      <span class="occ-count">${o.verses.length} ${t("versesCount", ctx.ui)}</span>
    </a>`;
}

function crumbsHTML(ctx, current) {
  const tr = (k) => t(k, ctx.ui);
  return `
    <nav class="crumbs" aria-label="${esc(tr("breadcrumb"))}">
      <ol>
        <li><a href="/">${esc(tr("home"))}</a></li>
        <li aria-current="page">${esc(current)}</li>
      </ol>
    </nav>`;
}

function dayIndex(date, n) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000) % n;
}

// ---------- Pages ----------

export function homeHTML(ctx) {
  const tr = (k) => t(k, ctx.ui);
  const pool = [...new Set(OCCASIONS.flatMap((o) => o.verses))];
  const votd = pool[dayIndex(ctx.today, pool.length)];
  const motto = ctx.verses[MOTTO];
  const lead = motto?.text[ctx.ui] ? ctx.ui : "en";
  const q = ctx.query.trim().toLowerCase();

  let occs = OCCASIONS;
  let results = "";
  if (q) {
    occs = OCCASIONS.filter((o) => [...Object.values(o.name), ...o.tags].some((s) => s.toLowerCase().includes(q)));
    const hits = Object.keys(ctx.verses).filter((ref) => {
      if (ref === MOTTO) return false;
      const e = ctx.verses[ref];
      const hay = [...Object.values(e.ref), ...Object.values(e.text).flat().map((p) => p.t)].join(" ").toLowerCase();
      return hay.includes(q);
    });
    if (hits.length) {
      results = `<h2 class="section-title">${tr("matchingVerses")} (${hits.length})</h2>
        <div class="verse-list">${hits.slice(0, 30).map((r) => verseCardHTML(ctx, r, { showOccasions: true })).join("")}</div>`;
    } else if (!occs.length) {
      results = `<p class="empty">${tr("noResults")}</p>`;
    }
  }

  return `
    <section class="hero">
      <h1>${esc(tr("title"))}</h1>
      <p class="tagline">${esc(tr("tagline"))}</p>
      ${motto ? `<p class="motto" lang="${lead}">“${esc(motto.text[lead].map((p) => p.t).join(" "))}”<cite>${esc(refLabel(motto, lead))}</cite></p>` : ""}
      <div class="search" role="search">
        ${ICONS.search}
        <input id="q" type="search" autocomplete="off" enterkeyhint="search" placeholder="${esc(tr("search"))}" value="${esc(ctx.query)}" aria-label="${esc(tr("search"))}">
      </div>
    </section>
    ${q ? "" : `<section class="votd" aria-label="${esc(tr("verseOfDay"))}"><p class="eyebrow">${tr("verseOfDay")}</p>${toolbarHTML(ctx)}${verseCardHTML(ctx, votd, { showOccasions: true, flat: true })}</section>`}
    ${occs.length ? `<h2 class="section-title" id="occasions">${q ? tr("occasions") : tr("allOccasions")}</h2><div class="grid">${occs.map((o) => occCardHTML(ctx, o)).join("")}</div>` : ""}
    ${results}`;
}

export function occasionHTML(ctx, o) {
  const tr = (k) => t(k, ctx.ui);
  const others = LANG_ORDER.filter((l) => l !== ctx.ui).map((l) => `<span lang="${l}">${esc(o.name[l])}</span>`).join(" · ");
  const note = tr("kitNote");
  const lead = ctx.langs[0];
  const blessing = ctx.verses[o.kit.blessing];
  return `
    ${crumbsHTML(ctx, o.name[ctx.ui])}
    <div class="occ-head">
      <span class="occ-icon" aria-hidden="true">${o.icon}</span>
      <div>
        <h1>${esc(o.name[ctx.ui])}</h1>
        <div class="occ-alt">${others}</div>
      </div>
      <div class="actions">
        <button class="btn btn-primary" data-act="present-all" data-occ="${o.id}">${ICONS.present}${tr("presentAll")}</button>
      </div>
    </div>
    ${toolbarHTML(ctx)}
    <div class="occ-body">
    <div class="toggles tabs" role="group">
      <button data-tab="verses" aria-pressed="${ctx.tab === "verses"}">${tr("verses")} (${o.verses.length})</button>
      <button data-tab="kit" aria-pressed="${ctx.tab === "kit"}">${tr("kit")}</button>
    </div>
    <div class="layout" data-tab="${ctx.tab}">
      <section class="verse-list" aria-label="${esc(tr("verses"))}">
        ${o.verses.map((ref, i) => verseCardHTML(ctx, ref, { occ: o, index: i, anchor: true })).join("")}
      </section>
      <aside class="kit" aria-label="${esc(tr("kit"))}">
        <div class="kit-box">
          <h2>${tr("kit")}</h2>
          ${note ? `<p class="kit-note">${esc(note)}</p>` : ""}
          <h3>${tr("prayer")}</h3>
          <p class="prayer" lang="en">${esc(o.kit.prayer)}</p>
          <div class="icon-row"><button class="icon-btn" data-act="copy-prayer" data-occ="${o.id}">${ICONS.copy}${tr("copy")}</button></div>
          <h3>${tr("points")}</h3>
          <ol class="points" lang="en">
            ${o.kit.points
              .map(
                (p) => `<li><strong>${esc(p.title)}</strong><p>${esc(p.text)}</p>
                  <a class="pt-ref" href="#${refAnchor(p.ref)}" data-act="jump" data-ref="${esc(p.ref)}">${esc(ctx.verses[p.ref] ? refLabel(ctx.verses[p.ref], lead) : p.ref)}</a></li>`
              )
              .join("")}
          </ol>
          <h3>${tr("blessing")}</h3>
          <div class="verse flat" data-ref="${esc(o.kit.blessing)}">
            <p class="verse-ref">${esc(blessing ? refLabel(blessing, lead) : o.kit.blessing)}</p>
            ${ctx.langs.map((l) => verseTextHTML(ctx, o.kit.blessing, l)).join("")}
            <div class="icon-row">
              <button class="icon-btn" data-act="copy">${ICONS.copy}${tr("copy")}</button>
              <button class="icon-btn" data-act="share">${ICONS.share}${tr("share")}</button>
              <button class="icon-btn" data-act="present-blessing" data-occ="${o.id}">${ICONS.present}${tr("present")}</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
    </div>
    <section class="related">
      <h2 class="section-title">${tr("related")}</h2>
      <div class="grid">${o.related.map((id) => occCardHTML(ctx, occasionById(id))).join("")}</div>
    </section>`;
}

export function savedHTML(ctx) {
  const tr = (k) => t(k, ctx.ui);
  const refs = ctx.saved.filter((r) => ctx.verses[r]);
  return `
    ${crumbsHTML(ctx, tr("savedTitle"))}
    <h1 class="page-title">${tr("savedTitle")}</h1>
    <p class="lead">${tr("savedLead")}</p>
    ${refs.length ? toolbarHTML(ctx) : ""}
    ${
      refs.length
        ? `<div class="verse-list">${refs.map((r) => verseCardHTML(ctx, r, { showOccasions: true })).join("")}</div>`
        : `<p class="empty">${tr("savedEmpty")}</p>`
    }`;
}

export function aboutHTML(ctx) {
  const tr = (k) => t(k, ctx.ui);
  return `
    ${crumbsHTML(ctx, tr("about"))}
    <article class="prose">
      <h1>About ${SITE_NAME}</h1>
      <p>A companion for preachers and church speakers: hand-picked Bible verses for the occasions a church family celebrates and mourns together, with an opening prayer, talking points and a closing blessing for each — in English, Hindi and Telugu. Start from any of the <a href="/#occasions">${OCCASIONS.length} occasions</a>, for example <a href="${occasionPath(occasionById("wedding"))}">weddings</a>, <a href="${occasionPath(occasionById("baptism"))}">baptisms</a> or <a href="${occasionPath(occasionById("funeral-and-comfort"))}">funerals</a>.</p>
      <h2>Dedication</h2>
      <p>This site was built for <strong>${esc(DEDICATION.name)}</strong> of <strong>${esc(DEDICATION.church)}</strong>, who brings a word from Scripture to the church family's celebrations and sorrows. May it help that word always come in season.</p>
      <h2>Podium mode</h2>
      <p>Press <strong>Present</strong> on any verse, or <strong>Present all</strong> on an occasion, to show the verses full-screen in large type — for reading from a phone at the pulpit or for a projector. Tap the left or right side of the screen, swipe, or use the arrow keys (most presentation clickers work too). <kbd>B</kbd> blanks the screen, <kbd>+</kbd>/<kbd>−</kbd> change the text size and <kbd>Esc</kbd> closes. The screen is kept awake while presenting.</p>
      <h2>Use it offline</h2>
      <p>Install the site on your phone (Android: the Install button in the header; iPhone: Share → Add to Home Screen). It then opens from its own icon and works without an internet connection.</p>
      <h2>Scripture sources</h2>
      <ul>
        <li><strong>English</strong> — King James Version (1769). Public domain.</li>
        <li><strong lang="hi">हिंदी</strong> — <span lang="hi">इंडियन रिवाइज्ड वर्जन (IRV) हिंदी – 2019</span>. Copyright © 2017, 2018, 2019 Bridge Connectivity Solutions. Licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</li>
        <li><strong lang="te">తెలుగు</strong> — <span lang="te">ఇండియన్ రివైజ్డ్ వెర్షన్ (IRV) – 2019</span>. Copyright © 2017, 2019 Bridge Connectivity Solutions. Licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</li>
      </ul>
      <p>All texts were obtained from <a href="https://ebible.org">eBible.org</a>. Verse text is reproduced unchanged except for removing inline cross-reference notes. Where a translation combines verses (for example Telugu Matthew 1:22–23), the combined verse is shown with its full verse range.</p>
      <p>Saved verses and language choices are stored only in this browser.</p>
    </article>`;
}

export function notFoundHTML(ctx) {
  const tr = (k) => t(k, ctx.ui);
  return `
    <section class="hero">
      <h1>${esc(tr("notFound"))}</h1>
      <p class="tagline">${esc(tr("notFoundLead"))}</p>
    </section>
    <div class="grid">${OCCASIONS.map((o) => occCardHTML(ctx, o)).join("")}</div>`;
}

export function pageHTML(ctx, page) {
  switch (page.kind) {
    case "home": return homeHTML(ctx);
    case "occasion": return occasionHTML(ctx, page.occ);
    case "saved": return savedHTML(ctx);
    case "about": return aboutHTML(ctx);
    default: return notFoundHTML(ctx);
  }
}

// Footer dedication, in the interface language.
export function dedicationHTML(ctx) {
  const e = ctx.verses[DEDICATION.verse];
  const lang = e?.text[ctx.ui] ? ctx.ui : "en";
  const line = esc(t("builtFor", ctx.ui)).replace("{name}", `<strong>${esc(DEDICATION.name)}</strong>`);
  return `
    <span class="ded-mark">${ICONS.cross}</span>
    <p class="ded-line">${line}</p>
    <p class="ded-church">${esc(DEDICATION.church)}</p>
    ${e ? `<p class="ded-verse" lang="${lang}">“${esc(e.text[lang].map((p) => p.t).join(" "))}”<cite>${esc(refLabel(e, lang))}</cite></p>` : ""}`;
}
