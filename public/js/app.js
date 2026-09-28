// Browser app. Every page is pre-rendered as HTML at build time; this script
// takes over for in-page navigation, language and theme choices, actions,
// podium mode and offline support.

import { LEGACY_IDS, occasionById } from "./occasions.js";
import { LANGS, t } from "./i18n.js";
import { LANG_ORDER, ICONS, pageFor, metaFor, pageHTML, homeHTML, dedicationHTML, plainText, occasionPath } from "./views.js";

const $ = (sel, el = document) => el.querySelector(sel);
const view = $("#view");

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
  read: store.get("read", 1),
  theme: store.get("theme", null), // "light" | "dark" | null (follow the phone)
  tab: "verses",
  query: "",
};
if (!LANGS[state.ui]) state.ui = "en";
state.langs = LANG_ORDER.filter((l) => state.langs.includes(l));
if (!state.langs.length) state.langs = ["en"];

const tr = (key) => t(key, state.ui);

// ---------- Verse text, one file per language, loaded on demand ----------
const VERSES = {};
const loaded = new Map();
function loadLang(lang) {
  if (!loaded.has(lang)) {
    const p = fetch(`/data/verses-${lang}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then((data) => {
        for (const [ref, e] of Object.entries(data)) {
          VERSES[ref] ??= { ref: {}, text: {} };
          VERSES[ref].ref[lang] = e.ref;
          VERSES[ref].text[lang] = e.text;
        }
      })
      .catch((err) => {
        loaded.delete(lang);
        throw err;
      });
    loaded.set(lang, p);
  }
  return loaded.get(lang);
}
// The interface language is needed too (motto, dedication verse).
const ensureLangs = (langs) => Promise.all([...new Set([...langs, state.ui, "en"])].map(loadLang));

const ctx = () => ({ ...state, verses: VERSES, today: new Date() });

// ---------- Rendering ----------
let page = pageFor(location.pathname);

function render() {
  view.innerHTML = pageHTML(ctx(), page);
  $("#dedication").innerHTML = dedicationHTML(ctx());
  const current = page.kind === "occasion" || page.kind === "home" ? "home" : page.kind;
  document.querySelectorAll(".nav a").forEach((a) => {
    if (a.dataset.route === current) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.title = metaFor(page, state.ui).title;
  bindSearch();
}

function rerender() {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

function bindSearch() {
  const input = $("#q");
  if (!input) return;
  input.addEventListener("input", async () => {
    state.query = input.value;
    const pos = input.selectionStart;
    if (state.query.trim()) await ensureLangs(LANG_ORDER).catch(() => {}); // search every language
    view.innerHTML = homeHTML(ctx());
    bindSearch();
    const again = $("#q");
    again.focus();
    again.setSelectionRange(pos, pos);
  });
}

function navigate(path, { replace = false } = {}) {
  if (replace) history.replaceState(null, "", path);
  else history.pushState(null, "", path);
  page = pageFor(location.pathname);
  state.query = "";
  state.tab = "verses";
  render();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  else window.scrollTo(0, 0);
  view.focus({ preventScroll: true });
}

function applyUiLang() {
  document.documentElement.lang = state.ui;
  $("#site-lang").value = state.ui;
  document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = tr(el.dataset.t)));
  updateThemeButton();
}

function applyReadSize() {
  document.documentElement.style.setProperty("--read", state.read);
}

// ---------- Theme ----------
const darkQuery = matchMedia("(prefers-color-scheme: dark)");
const effectiveTheme = () => state.theme ?? (darkQuery.matches ? "dark" : "light");

function applyTheme() {
  if (state.theme) document.documentElement.dataset.theme = state.theme;
  else delete document.documentElement.dataset.theme;
  const bg = getComputedStyle(document.body).backgroundColor;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", bg));
  updateThemeButton();
}

function updateThemeButton() {
  const btn = $("#theme-btn");
  const dark = effectiveTheme() === "dark";
  btn.innerHTML = dark ? ICONS.sun : ICONS.moon;
  btn.setAttribute("aria-label", tr(dark ? "toLight" : "toDark"));
  btn.title = tr(dark ? "toLight" : "toDark");
}

$("#theme-btn").addEventListener("click", () => {
  state.theme = effectiveTheme() === "dark" ? "light" : "dark";
  store.set("theme", state.theme);
  applyTheme();
});
darkQuery.addEventListener("change", () => !state.theme && applyTheme());

// ---------- Actions ----------
let toastTimer;
// A toast with an `action` ({ label, run }) stays until tapped or dismissed.
function toast(msg, action) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.toggle("has-action", Boolean(action));
  if (action) {
    const go = document.createElement("button");
    go.textContent = action.label;
    go.onclick = () => {
      el.classList.remove("show");
      action.run();
    };
    const x = document.createElement("button");
    x.textContent = "✕";
    x.className = "toast-x";
    x.setAttribute("aria-label", tr("dismiss"));
    x.onclick = () => el.classList.remove("show");
    el.append(go, x);
  }
  el.classList.add("show");
  clearTimeout(toastTimer);
  if (!action) toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
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

let podium = null;
async function openPodium(slides, index, title) {
  if (!podium) {
    const { createPodium } = await import("./podium.js");
    podium = createPodium({ state, store, verses: () => VERSES, ensureLangs, onClose: rerender });
  }
  podium.open(slides, index, title);
}

function slidesFor(occ, withKit) {
  const verses = occ.verses.map((ref) => ({ kind: "verse", ref }));
  if (!withKit) return verses;
  return [{ kind: "prayer", text: occ.kit.prayer }, ...verses, { kind: "blessing", ref: occ.kit.blessing }];
}

document.addEventListener("click", async (ev) => {
  if (ev.target.closest("#podium")) return;

  // In-site links: switch pages without a full reload.
  const a = ev.target.closest("a[href]");
  if (a && !a.dataset.act) {
    const href = a.getAttribute("href");
    const internal = a.origin === location.origin && !href.startsWith("#") && !a.target && !a.hasAttribute("download") && !/\.[a-z0-9]+$/i.test(a.pathname);
    if (internal && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey && !ev.altKey && ev.button === 0) {
      ev.preventDefault();
      navigate(a.pathname + a.hash);
    }
    return;
  }

  const langBtn = ev.target.closest("[data-lang]");
  if (langBtn) {
    const l = langBtn.dataset.lang;
    const on = state.langs.includes(l);
    if (on && state.langs.length === 1) return;
    const next = LANG_ORDER.filter((x) => (x === l ? !on : state.langs.includes(x)));
    await ensureLangs(next).catch(() => toast(tr("offline")));
    state.langs = next.filter((x) => loaded.has(x));
    store.set("langs", state.langs);
    return rerender();
  }
  const readBtn = ev.target.closest("[data-read]");
  if (readBtn) {
    state.read = Math.round(Math.min(1.5, Math.max(0.85, state.read + 0.1 * readBtn.dataset.read)) * 100) / 100;
    store.set("read", state.read);
    return applyReadSize();
  }
  const tabBtn = ev.target.closest("button[data-tab]");
  if (tabBtn) {
    state.tab = tabBtn.dataset.tab;
    return rerender();
  }

  const btn = ev.target.closest("[data-act]");
  if (!btn) return;
  const ref = btn.closest("[data-ref]")?.dataset.ref ?? btn.dataset.ref;
  const occ = btn.dataset.occ && occasionById(btn.dataset.occ);
  switch (btn.dataset.act) {
    case "copy":
      return copyText(plainText(ctx(), ref));
    case "share": {
      const url = page.kind === "occasion" ? location.origin + occasionPath(page.occ) : location.origin;
      return shareText(plainText(ctx(), ref) + "\n\n" + url);
    }
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
      if (occ) return openPodium(slidesFor(occ, false), +btn.dataset.index, occ.name[state.ui]);
      return openPodium([{ kind: "verse", ref }], 0, VERSES[ref].ref[state.langs[0]]);
    case "present-all":
      return openPodium(slidesFor(occ, true), 0, occ.name[state.ui]);
    case "present-blessing": {
      const slides = slidesFor(occ, true);
      return openPodium(slides, slides.length - 1, occ.name[state.ui]);
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

$("#site-lang").addEventListener("change", async (e) => {
  state.ui = e.target.value;
  store.set("ui", state.ui);
  await ensureLangs(state.langs).catch(() => {});
  applyUiLang();
  rerender();
});

window.addEventListener("popstate", () => {
  page = pageFor(location.pathname);
  render();
});

// ---------- Installable app / offline ----------
function setupPwa() {
  const secure = location.protocol === "https:" || location.hostname === "localhost";
  if ("serviceWorker" in navigator && secure) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data?.type === "update-ready") toast(tr("updateReady"), { label: tr("reload"), run: () => location.reload() });
    });
  }

  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const btn = $("#install-btn");
  let deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    btn.hidden = false;
  });
  btn.addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    deferred = null;
    btn.hidden = true;
  });
  window.addEventListener("appinstalled", () => (btn.hidden = true));

  // iPhone/iPad Safari has no install prompt — show the manual steps once.
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios && !standalone && !store.get("iosHintShown", false)) {
    store.set("iosHintShown", true);
    setTimeout(() => toast(tr("iosInstall"), { label: "OK", run: () => {} }), 2500);
  }

  window.addEventListener("offline", () => toast(tr("offline")));
}

// ---------- Boot ----------
async function boot() {
  // Links from before clean URLs: /#/o/wedding → /occasions/wedding
  const legacy = location.hash.match(/^#\/(o\/([a-z-]+)|saved|about)?\/?$/);
  if (legacy) {
    const id = legacy[2] && (LEGACY_IDS[legacy[2]] ?? legacy[2]);
    history.replaceState(null, "", id ? `/occasions/${id}` : legacy[1] ? `/${legacy[1]}` : "/");
    page = pageFor(location.pathname);
  }

  applyReadSize();
  applyTheme();
  applyUiLang();
  const prerendered = state.ui === "en" && state.langs.join() === "en" && state.saved.length === 0 && !legacy;
  try {
    await ensureLangs(state.langs);
  } catch {
    // The pre-rendered page is still readable; actions need the verse data.
    toast(tr("offline"));
    return;
  }
  // The pre-rendered HTML already matches the default view; otherwise re-render in the chosen languages.
  if (!prerendered || page.kind === "home" || page.kind === "saved") render();
  else bindSearch();
  setupPwa();
}

boot();
