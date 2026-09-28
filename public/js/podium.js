// Podium mode: full-screen, large-type verses for the pulpit or a projector.
// Loaded on first use, so it adds nothing to the initial page load.

import { LANGS, t } from "./i18n.js";
import { ICONS, LANG_ORDER, esc } from "./views.js";

// app = { state, store, verses(), ensureLangs(langs), onClose() }
export function createPodium(app) {
  const { state, store } = app;
  const tr = (k) => t(k, state.ui);
  const el = document.querySelector("#podium");
  let slides = [];
  let index = 0;
  let title = "";
  let wakeLock = null;
  let touchX = null;

  function slideHTML(s) {
    if (s.kind === "prayer") {
      return `<div class="p-slide prose-slide langs-2"><p class="p-kind">${tr("prayer")}</p><p class="p-text" lang="en" style="font-style:italic">${esc(s.text)}</p></div>`;
    }
    const e = app.verses()[s.ref];
    const kind = s.kind === "blessing" ? `<p class="p-kind">${tr("blessing")}</p>` : "";
    const blocks = state.langs
      .filter((l) => e.text[l])
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
        ${slideHTML(slides[index])}
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
    const stage = el.querySelector(".p-stage");
    const slide = el.querySelector(".p-slide");
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
    app.onClose();
  }

  function zoomBy(d) {
    state.zoom = Math.round(Math.min(1.8, Math.max(0.6, state.zoom + d)) * 10) / 10;
    store.set("zoom", state.zoom);
    render();
  }

  document.addEventListener("keydown", (e) => {
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
  });

  el.addEventListener("click", async (e) => {
    if (el.classList.contains("blank")) return el.classList.remove("blank");
    const lb = e.target.closest("[data-plang]");
    if (lb) {
      const l = lb.dataset.plang;
      const on = state.langs.includes(l);
      if (on && state.langs.length === 1) return;
      const next = LANG_ORDER.filter((x) => (x === l ? !on : state.langs.includes(x)));
      await app.ensureLangs(next);
      state.langs = next;
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
      el.querySelector(".p-bar [data-p=close]")?.focus({ preventScroll: true });
    },
  };
}
