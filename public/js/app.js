import { OCCASIONS, MOTTO } from "./occasions.js";
import { LANGS, t } from "./i18n.js";

const $ = (sel, el = document) => el.querySelector(sel);
const view = $("#view");
const LANG_ORDER = ["en", "hi", "te"];

// ---------- Per-device preferences (best effort; the site works without them) ----------
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem("awis:" + key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("awis:" + key, JSON.stringify(value));
    } catch {}
  },
};

const state = {
  ui: store.get("ui", "en"),
  langs: store.get("langs", ["en"]),
  saved: store.get("saved", []),
  zoom: store.get("zoom", 1),
  podiumLight: store.get("podiumLight", false),
  tab: "verses",
  query: "",
};
if (!LANGS[state.ui]) state.ui = "en";
state.langs = LANG_ORDER.filter((l) => state.langs.includes(l));
if (!state.langs.length) state.langs = ["en"];

let VERSES = {};

// ---------- Helpers ----------
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const tr = (key) => t(key, state.ui);
const occById = (id) => OCCASIONS.find((o) => o.id === id);
const occasionsFor = (ref) => OCCASIONS.filter((o) => o.verses.includes(ref));

const ICONS = {
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
  present: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  expand: '<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
};

function verseTextHTML(ref, lang, withVersion = true) {
  const e = VERSES[ref];
  if (!e) return "";
  const parts = e.text[lang];
  const showNums = parts.length > 1 || parts.some((p) => String(p.v).includes("-"));
  const body = parts.map((p) => (showNums ? `<sup>${esc(p.v)}</sup>` : "") + esc(p.t)).join(" ");
  const ver = withVersion ? `<span class="ver">${LANGS[lang].version}</span>` : "";
  return `<p class="verse-text" lang="${lang}">${body}${ver}</p>`;
}

function plainText(ref, langs = state.langs) {
  const e = VERSES[ref];
  return langs
    .map((l) => `${e.text[l].map((p) => p.t).join(" ")}\n— ${e.ref[l]} (${LANGS[l].version})`)
    .join("\n\n");
}

function verseCardHTML(ref, { occ, index, showOccasions = false } = {}) {
  const e = VERSES[ref];
  if (!e) return "";
  const [first, ...rest] = state.langs;
  const saved = state.saved.includes(ref);
  const inOcc = showOccasions
    ? occasionsFor(ref)
        .map((o) => `<a href="#/o/${o.id}">${o.icon} ${esc(o.name[state.ui])}</a>`)
        .join(" · ")
    : "";
  return `
    <article class="verse" data-ref="${esc(ref)}">
      <h3 class="verse-ref"><span lang="${first}">${esc(e.ref[first])}</span>${rest
        .map((l) => `<span class="alt" lang="${l}">${esc(e.ref[l])}</span>`)
        .join("")}</h3>
      ${inOcc ? `<p class="verse-in">${inOcc}</p>` : ""}
      ${state.langs.map((l) => verseTextHTML(ref, l)).join("")}
      <div class="icon-row">
        <button class="icon-btn" data-act="present" ${occ ? `data-occ="${occ.id}" data-index="${index}"` : ""}>${ICONS.present}${tr("present")}</button>
        <button class="icon-btn" data-act="copy">${ICONS.copy}${tr("copy")}</button>
        <button class="icon-btn" data-act="share">${ICONS.share}${tr("share")}</button>
        <button class="icon-btn" data-act="save" aria-pressed="${saved}">${ICONS.star}${tr(saved ? "unsave" : "save")}</button>
      </div>
    </article>`;
}

function langTogglesHTML() {
  return `
    <div class="toolbar">
      <span class="toolbar-label">${tr("showIn")}</span>
      <div class="toggles" role="group" aria-label="${esc(tr("showIn"))}">
        ${LANG_ORDER.map(
          (l) => `<button data-lang="${l}" aria-pressed="${state.langs.includes(l)}" lang="${l}">${LANGS[l].label}</button>`
        ).join("")}
      </div>
    </div>`;
}

function dayIndex(n) {
  const now = new Date();
  const days = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
  return days % n;
}

// ---------- Views ----------
function renderHome() {
  const pool = [...new Set(OCCASIONS.flatMap((o) => o.verses))];
  const votd = pool[dayIndex(pool.length)];
  const motto = VERSES[MOTTO];
  const q = state.query.trim().toLowerCase();

  let results = "";
  let occs = OCCASIONS;
  if (q) {
    occs = OCCASIONS.filter((o) =>
      [...Object.values(o.name), ...o.tags].some((s) => s.toLowerCase().includes(q))
    );
    const verseHits = Object.keys(VERSES).filter((ref) => {
      if (ref === MOTTO) return false;
      const e = VERSES[ref];
      const hay = [...Object.values(e.ref), ...LANG_ORDER.flatMap((l) => e.text[l].map((p) => p.t))].join(" ").toLowerCase();
      return hay.includes(q);
    });
    results = verseHits.length
      ? `<h2 class="section-title">${tr("matchingVerses")} (${verseHits.length})</h2>
         <div class="verse-list">${verseHits.slice(0, 30).map((r) => verseCardHTML(r, { showOccasions: true })).join("")}</div>`
      : "";
    if (!occs.length && !verseHits.length) results = `<p class="empty">${tr("noResults")}</p>`;
  }

  const lead = state.ui;
  view.innerHTML = `
    <section class="hero">
      <h1>${esc(tr("title"))}</h1>
      <p class="tagline">${esc(tr("tagline"))}</p>
      ${motto ? `<p class="motto" lang="${lead}">“${esc(motto.text[lead].map((p) => p.t).join(" "))}”<cite>${esc(motto.ref[lead])}</cite></p>` : ""}
      <div class="search">
        ${ICONS.search}
        <input id="q" type="search" autocomplete="off" placeholder="${esc(tr("search"))}" value="${esc(state.query)}" aria-label="${esc(tr("search"))}">
      </div>
    </section>
    ${
      q
        ? ""
        : `<section class="votd"><p class="eyebrow">${tr("verseOfDay")}</p>${langTogglesHTML()}${verseCardHTML(votd, { showOccasions: true }).replace('class="verse"', 'class="verse" style="border:0;padding:0;background:none"')}</section>`
    }
    ${occs.length ? `<h2 class="section-title">${q ? tr("occasions") : tr("allOccasions")}</h2><div class="grid">${occs.map(occCardHTML).join("")}</div>` : ""}
    ${results}
  `;
  const input = $("#q");
  input.addEventListener("input", () => {
    state.query = input.value;
    const pos = input.selectionStart;
    renderHome();
    const again = $("#q");
    again.focus();
    again.setSelectionRange(pos, pos);
  });
}

function occCardHTML(o) {
  const others = LANG_ORDER.filter((l) => l !== state.ui).map((l) => `<span lang="${l}">${esc(o.name[l])}</span>`).join(" · ");
  return `
    <a class="occ-card" href="#/o/${o.id}">
      <span class="occ-icon" aria-hidden="true">${o.icon}</span>
      <span class="occ-name">${esc(o.name[state.ui])}</span>
      <span class="occ-alt">${others}</span>
      <span class="occ-count">${o.verses.length} ${tr("versesCount")}</span>
    </a>`;
}

function renderOccasion(id) {
  const o = occById(id);
  if (!o) return renderNotFound();
  const others = LANG_ORDER.filter((l) => l !== state.ui).map((l) => `<span lang="${l}">${esc(o.name[l])}</span>`).join(" · ");
  const note = tr("kitNote");
  view.innerHTML = `
    <a class="back" href="#/">${ICONS.prev.replace("<svg", '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"')} ${tr("allOccasions")}</a>
    <div class="occ-head">
      <span class="occ-icon" aria-hidden="true">${o.icon}</span>
      <div>
        <h1>${esc(o.name[state.ui])}</h1>
        <div class="occ-alt">${others}</div>
      </div>
      <div class="actions">
        <button class="btn btn-primary" data-act="present-all" data-occ="${o.id}">${ICONS.present}${tr("presentAll")}</button>
      </div>
    </div>
    ${langTogglesHTML()}
    <div class="toggles tabs" role="tablist">
      <button role="tab" data-tab="verses" aria-pressed="${state.tab === "verses"}">${tr("verses")} (${o.verses.length})</button>
      <button role="tab" data-tab="kit" aria-pressed="${state.tab === "kit"}">${tr("kit")}</button>
    </div>
    <div class="layout" data-tab="${state.tab}">
      <section class="verse-list" aria-label="${esc(tr("verses"))}">
        ${o.verses.map((ref, i) => verseCardHTML(ref, { occ: o, index: i })).join("")}
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
                  <a class="pt-ref" href="#" data-act="jump" data-ref="${esc(p.ref)}">${esc(VERSES[p.ref]?.ref[state.langs[0]] ?? p.ref)}</a></li>`
              )
              .join("")}
          </ol>
          <h3>${tr("blessing")}</h3>
          <div class="verse" data-ref="${esc(o.kit.blessing)}">
            <p class="verse-ref">${esc(VERSES[o.kit.blessing].ref[state.langs[0]])}</p>
            ${state.langs.map((l) => verseTextHTML(o.kit.blessing, l)).join("")}
            <div class="icon-row">
              <button class="icon-btn" data-act="copy">${ICONS.copy}${tr("copy")}</button>
              <button class="icon-btn" data-act="present-blessing" data-occ="${o.id}">${ICONS.present}${tr("present")}</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  `;
}

function renderSaved() {
  const refs = state.saved.filter((r) => VERSES[r]);
  view.innerHTML = `
    <h1 class="section-title" style="font-size:1.8rem;margin-top:8px">${tr("savedTitle")}</h1>
    ${refs.length ? langTogglesHTML() : ""}
    ${
      refs.length
        ? `<div class="verse-list">${refs.map((r) => verseCardHTML(r, { showOccasions: true })).join("")}</div>`
        : `<p class="empty">${tr("savedEmpty")}</p>`
    }`;
}

function renderAbout() {
  view.innerHTML = `
    <article class="prose">
      <h1>A Word in Season</h1>
      <p>A companion for preachers and church speakers: hand-picked Bible verses for the occasions a church family celebrates and mourns together, with an opening prayer, talking points and a closing blessing for each — in English, Hindi and Telugu.</p>
      <h2>Podium mode</h2>
      <p>Press <strong>Present</strong> on any verse, or <strong>Present all</strong> on an occasion, to show the verses full-screen in large type — for reading from a phone at the pulpit or for a projector. Tap the left or right side of the screen, swipe, or use the arrow keys (most presentation clickers work too). <kbd>B</kbd> blanks the screen, <kbd>+</kbd>/<kbd>−</kbd> change the text size and <kbd>Esc</kbd> closes. The screen is kept awake while presenting.</p>
      <h2>Scripture sources</h2>
      <ul>
        <li><strong>English</strong> — King James Version (1769). Public domain.</li>
        <li><strong>हिंदी</strong> — इंडियन रिवाइज्ड वर्जन (IRV) हिंदी – 2019. Copyright © 2017, 2018, 2019 Bridge Connectivity Solutions. Licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</li>
        <li><strong>తెలుగు</strong> — ఇండియన్ రివైజ్డ్ వెర్షన్ (IRV) – 2019. Copyright © 2017, 2019 Bridge Connectivity Solutions. Licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</li>
      </ul>
      <p>All texts were obtained from <a href="https://ebible.org">eBible.org</a>. Verse text is reproduced unchanged except for removing inline cross-reference notes. Where a translation combines verses (for example Telugu Matthew 1:22–23), the combined verse is shown with its full verse range.</p>
      <p>Saved verses and language choices are stored only in this browser.</p>
    </article>`;
}

function renderNotFound() {
  view.innerHTML = `<p class="empty">${tr("notFound")} <a href="#/">${tr("allOccasions")}</a></p>`;
}

// ---------- Router ----------
function route() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const [, section, id] = hash.split("/");
  document.querySelectorAll(".nav a").forEach((a) => {
    const target = a.getAttribute("href").replace(/^#/, "");
    const active = target === "/" ? section === "" || section === "o" : hash.startsWith(target);
    a.toggleAttribute("aria-current", active);
    if (active) a.setAttribute("aria-current", "page");
  });
  if (!section) renderHome();
  else if (section === "o") renderOccasion(id);
  else if (section === "saved") renderSaved();
  else if (section === "about") renderAbout();
  else renderNotFound();
}

function rerender() {
  const y = window.scrollY;
  route();
  window.scrollTo(0, y);
}

function applyUiLang() {
  document.documentElement.lang = state.ui;
  $("#site-lang").value = state.ui;
  document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = tr(el.dataset.t)));
  document.title = `${tr("title")} — ${tr("tagline")}`;
}

// ---------- Actions ----------
let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  toast(tr("copied"));
}

async function shareText(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (err) {
      if (err.name === "AbortError") return;
    }
  }
  window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
}

document.addEventListener("click", (ev) => {
  const langBtn = ev.target.closest("[data-lang]");
  if (langBtn && !langBtn.closest("#podium")) {
    const l = langBtn.dataset.lang;
    const on = state.langs.includes(l);
    if (on && state.langs.length === 1) return;
    state.langs = LANG_ORDER.filter((x) => (x === l ? !on : state.langs.includes(x)));
    store.set("langs", state.langs);
    return rerender();
  }
  const tabBtn = ev.target.closest("[data-tab]");
  if (tabBtn && tabBtn.tagName === "BUTTON") {
    state.tab = tabBtn.dataset.tab;
    return rerender();
  }

  const btn = ev.target.closest("[data-act]");
  if (!btn || btn.closest("#podium")) return;
  const ref = btn.closest("[data-ref]")?.dataset.ref ?? btn.dataset.ref;
  const occ = btn.dataset.occ && occById(btn.dataset.occ);
  switch (btn.dataset.act) {
    case "copy":
      return copyText(plainText(ref));
    case "share":
      return shareText(plainText(ref) + "\n\n" + location.origin);
    case "save": {
      const i = state.saved.indexOf(ref);
      if (i >= 0) state.saved.splice(i, 1);
      else state.saved.unshift(ref);
      store.set("saved", state.saved);
      return rerender();
    }
    case "copy-prayer":
      return copyText(occ.kit.prayer);
    case "present":
      if (occ) return podium.open(slidesFor(occ, false), +btn.dataset.index, occ.name[state.ui]);
      return podium.open([{ kind: "verse", ref }], 0, VERSES[ref].ref[state.langs[0]]);
    case "present-all":
      return podium.open(slidesFor(occ, true), 0, occ.name[state.ui]);
    case "present-blessing": {
      const slides = slidesFor(occ, true);
      return podium.open(slides, slides.length - 1, occ.name[state.ui]);
    }
    case "jump": {
      ev.preventDefault();
      state.tab = "verses";
      rerender();
      const card = view.querySelector(`.verse-list [data-ref="${CSS.escape(ref)}"]`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.animate([{ boxShadow: "0 0 0 3px var(--focus)" }, { boxShadow: "0 0 0 0 transparent" }], { duration: 1600 });
      }
    }
  }
});

$("#site-lang").addEventListener("change", (e) => {
  state.ui = e.target.value;
  store.set("ui", state.ui);
  applyUiLang();
  rerender();
});

// ---------- Podium mode ----------
function slidesFor(occ, withKit) {
  const verses = occ.verses.map((ref) => ({ kind: "verse", ref }));
  if (!withKit) return verses;
  return [
    { kind: "prayer", text: occ.kit.prayer },
    ...verses,
    { kind: "blessing", ref: occ.kit.blessing },
  ];
}

const podium = (() => {
  const el = $("#podium");
  let slides = [];
  let index = 0;
  let title = "";
  let wakeLock = null;
  let touchX = null;

  function slideHTML(s) {
    if (s.kind === "prayer") {
      return `<div class="p-slide prose-slide langs-2"><p class="p-kind">${tr("prayer")}</p><p class="p-text" lang="en" style="font-style:italic">${esc(s.text)}</p></div>`;
    }
    const e = VERSES[s.ref];
    const kind = s.kind === "blessing" ? `<p class="p-kind">${tr("blessing")}</p>` : "";
    const blocks = state.langs
      .map((l) => {
        const parts = e.text[l];
        const showNums = parts.length > 1 || parts.some((p) => String(p.v).includes("-"));
        const body = parts.map((p) => (showNums ? `<sup>${esc(p.v)}</sup>` : "") + esc(p.t)).join(" ");
        return `<div class="p-block"><p class="p-text" lang="${l}">${body}</p><p class="p-ref" lang="${l}">${esc(e.ref[l])}</p></div>`;
      })
      .join("");
    return `<div class="p-slide langs-${state.langs.length}">${kind}${blocks}</div>`;
  }

  function render() {
    const s = slides[index];
    el.classList.toggle("light", state.podiumLight);
    el.innerHTML = `
      <div class="p-bar">
        <span class="p-title">${esc(title)}</span>
        <div class="toggles" role="group" aria-label="${esc(tr("showIn"))}" style="background:transparent">
          ${LANG_ORDER.map((l) => `<button class="p-btn" data-plang="${l}" aria-pressed="${state.langs.includes(l)}" style="${state.langs.includes(l) ? "" : "opacity:.45"}" lang="${l}">${LANGS[l].short}</button>`).join("")}
        </div>
        <button class="p-btn" data-p="smaller" title="${esc(tr("smaller"))}" aria-label="${esc(tr("smaller"))}">A−</button>
        <button class="p-btn" data-p="bigger" title="${esc(tr("bigger"))}" aria-label="${esc(tr("bigger"))}">A+</button>
        <button class="p-btn" data-p="theme" title="${esc(tr("theme"))}" aria-label="${esc(tr("theme"))}">${ICONS.sun}</button>
        <button class="p-btn" data-p="fullscreen" title="Fullscreen" aria-label="Fullscreen">${ICONS.expand}</button>
        <button class="p-btn" data-p="close" title="${esc(tr("close"))}" aria-label="${esc(tr("close"))}">${ICONS.close}</button>
      </div>
      <div class="p-stage">
        <div class="p-zone left" data-p="prev" aria-hidden="true"></div>
        ${slideHTML(s)}
        <div class="p-zone right" data-p="next" aria-hidden="true"></div>
      </div>
      <div class="p-foot">
        <button class="p-btn p-nav" data-p="prev" ${index === 0 ? "disabled style='opacity:.35'" : ""}>${ICONS.prev}<span>${tr("prev")}</span></button>
        <span class="p-help">${esc(tr("podiumHelp"))}</span>
        <span class="p-count">${index + 1} / ${slides.length}</span>
        <button class="p-btn p-nav" data-p="next" ${index === slides.length - 1 ? "disabled style='opacity:.35'" : ""}><span>${tr("next")}</span>${ICONS.next}</button>
      </div>`;
    el.style.setProperty("--zoom", state.zoom);
    fit();
  }

  // Shrink long passages until they fit the stage.
  function fit() {
    const stage = $(".p-stage", el);
    const slide = $(".p-slide", el);
    if (!stage || !slide) return;
    let f = 1;
    slide.style.setProperty("--fit", f);
    const avail = () => stage.clientHeight - parseFloat(getComputedStyle(stage).paddingTop) * 2;
    while (slide.scrollHeight > avail() && f > 0.35) {
      f -= 0.05;
      slide.style.setProperty("--fit", f);
    }
  }

  async function keepAwake() {
    try {
      wakeLock = await navigator.wakeLock?.request("screen");
    } catch {}
  }

  function go(d) {
    const n = Math.min(slides.length - 1, Math.max(0, index + d));
    if (n !== index) {
      index = n;
      render();
    }
  }

  function close() {
    el.hidden = true;
    el.classList.remove("blank");
    document.body.style.overflow = "";
    wakeLock?.release().catch(() => {});
    wakeLock = null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    rerender();
  }

  function onKey(e) {
    if (el.hidden) return;
    const k = e.key;
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) go(1);
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) go(-1);
    else if (k === "Escape") return close();
    else if (k === "b" || k === "B" || k === ".") el.classList.toggle("blank");
    else if (k === "+" || k === "=") zoomBy(0.1);
    else if (k === "-" || k === "_") zoomBy(-0.1);
    else if (k === "Home") { index = 0; render(); }
    else if (k === "End") { index = slides.length - 1; render(); }
    else return;
    e.preventDefault();
  }

  function zoomBy(d) {
    state.zoom = Math.round(Math.min(1.8, Math.max(0.6, state.zoom + d)) * 10) / 10;
    store.set("zoom", state.zoom);
    render();
  }

  el.addEventListener("click", (e) => {
    if (el.classList.contains("blank")) return el.classList.remove("blank");
    const lb = e.target.closest("[data-plang]");
    if (lb) {
      const l = lb.dataset.plang;
      const on = state.langs.includes(l);
      if (on && state.langs.length === 1) return;
      state.langs = LANG_ORDER.filter((x) => (x === l ? !on : state.langs.includes(x)));
      store.set("langs", state.langs);
      return render();
    }
    const b = e.target.closest("[data-p]");
    if (!b) return;
    switch (b.dataset.p) {
      case "next": return go(1);
      case "prev": return go(-1);
      case "close": return close();
      case "bigger": return zoomBy(0.1);
      case "smaller": return zoomBy(-0.1);
      case "theme":
        state.podiumLight = !state.podiumLight;
        store.set("podiumLight", state.podiumLight);
        return render();
      case "fullscreen":
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else el.requestFullscreen?.().catch(() => {});
    }
  });
  el.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  el.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  });
  document.addEventListener("keydown", onKey);
  window.addEventListener("resize", () => !el.hidden && fit());
  document.addEventListener("visibilitychange", () => {
    if (!el.hidden && document.visibilityState === "visible") keepAwake();
  });
  document.fonts?.ready.then(() => !el.hidden && fit());

  return {
    open(s, i, t) {
      slides = s;
      index = Math.max(0, Math.min(i || 0, s.length - 1));
      title = t;
      el.hidden = false;
      document.body.style.overflow = "hidden";
      render();
      keepAwake();
      $(".p-bar [data-p=close]", el)?.focus({ preventScroll: true });
    },
  };
})();

// ---------- Boot ----------
async function boot() {
  applyUiLang();
  try {
    const res = await fetch("/data/verses.json");
    if (!res.ok) throw new Error(res.status);
    VERSES = await res.json();
  } catch (err) {
    view.innerHTML = `<p class="empty">Could not load verses. Please check your connection and reload.</p>`;
    return;
  }
  window.addEventListener("hashchange", () => {
    if (location.hash && location.hash !== "#/") state.query = "";
    route();
    window.scrollTo(0, 0);
  });
  route();
}
boot();
