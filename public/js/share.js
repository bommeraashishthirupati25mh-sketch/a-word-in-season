// Share dialog: send a verse as text, a designed image card, or a short
// animated video card — with an occasion greeting and Bro. Raj Timothy's name.
// Loaded on first use.

import { OCCASIONS } from "./occasions.js";
import { LANGS, t } from "./i18n.js";
import { DEDICATION } from "./site.js";
import { LANG_ORDER, ICONS, esc, refAnchor } from "./views.js";
import { drawCard, loadCardFonts, STYLES, W, H, END, VIDEO_SECONDS } from "./card.js";

const VIDEO_MIME = (() => {
  if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) return null;
  return ["video/mp4;codecs=avc1.42E01E", "video/mp4;codecs=avc1", "video/mp4"].find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
})();
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

// app = { state, verses(), ensureLangs(langs), toast(msg) }
export function createShare(app) {
  const { state } = app;
  const tr = (k) => t(k, state.ui);
  const root = document.createElement("div");
  root.className = "sheet";
  root.hidden = true;
  root.innerHTML = `
    <div class="sheet-backdrop" data-close></div>
    <div class="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <div class="sheet-head">
        <h2 id="share-title"></h2>
        <button class="icon-pill" data-close aria-label="">${ICONS.close}</button>
      </div>
      <div class="sheet-body">
        <div class="sheet-controls"></div>
        <div class="sheet-preview">
          <canvas width="${W}" height="${H}" aria-label=""></canvas>
          <pre class="text-preview" hidden></pre>
        </div>
      </div>
      <div class="sheet-actions"></div>
    </div>`;
  document.body.append(root);
  const controls = root.querySelector(".sheet-controls");
  const actions = root.querySelector(".sheet-actions");
  const canvas = root.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const textPreview = root.querySelector(".text-preview");

  let opt = null; // { ref, format, langs, occ, name, style }
  let card = null;
  let raf = 0;
  let started = 0;
  let busy = false;
  let returnFocus = null;

  const verseText = (ref, l) => app.verses()[ref].text[l].map((p) => p.t).join(" ");

  function buildCard() {
    const lang = opt.langs[0];
    const e = app.verses()[opt.ref];
    card = {
      style: opt.style,
      icon: opt.occ?.icon ?? "✝️",
      lang,
      dear: opt.name.trim() ? t("dear", lang).replace("{name}", opt.name.trim()) : "",
      greeting: opt.occ ? opt.occ.greet[lang] : "",
      verses: opt.langs.map((l) => ({ lang: l, text: verseText(opt.ref, l), ref: e.ref[l], version: LANGS[l].version })),
      from: t("from", lang).replace("{name}", DEDICATION.name),
      church: DEDICATION.church,
    };
  }

  function messageText() {
    const lang = opt.langs[0];
    const e = app.verses()[opt.ref];
    const parts = [];
    if (opt.name.trim()) parts.push(t("dear", lang).replace("{name}", opt.name.trim()));
    if (opt.occ) parts.push(`${opt.occ.greet[lang]} ${opt.occ.icon}`);
    if (parts.length) parts.push("");
    for (const l of opt.langs) parts.push(`“${verseText(opt.ref, l)}”`, `— ${e.ref[l]} (${LANGS[l].version})`, "");
    parts.push(t("from", lang).replace("{name}", DEDICATION.name), DEDICATION.church);
    return parts.join("\n");
  }

  // ---------- Rendering ----------
  function renderControls() {
    const seg = (name, items, current) =>
      `<div class="toggles seg" role="group">${items
        .map(([v, label]) => `<button type="button" data-${name}="${v}" aria-pressed="${v === current}">${label}</button>`)
        .join("")}</div>`;
    const formats = [["text", tr("asText")], ["image", tr("asImage")], ...(VIDEO_MIME ? [["video", tr("asVideo")]] : [])];
    controls.innerHTML = `
      <div class="field">
        <span class="field-label">${tr("format")}</span>
        ${seg("format", formats, opt.format)}
        ${opt.format === "video" ? `<p class="field-note">${tr("videoNote")}</p>` : ""}
      </div>
      <div class="field">
        <span class="field-label">${tr("languages")}</span>
        <div class="toggles seg" role="group">
          ${LANG_ORDER.map((l) => `<button type="button" data-slang="${l}" aria-pressed="${opt.langs.includes(l)}" lang="${l}">${LANGS[l].label}</button>`).join("")}
        </div>
      </div>
      <label class="field">
        <span class="field-label">${tr("message")}</span>
        <select data-occ-select>
          <option value="">${esc(tr("noGreeting"))}</option>
          ${OCCASIONS.map((o) => `<option value="${o.id}" ${opt.occ?.id === o.id ? "selected" : ""}>${o.icon} ${esc(o.greet[state.ui])}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span class="field-label">${tr("toName")}</span>
        <input type="text" data-name maxlength="40" autocomplete="off" placeholder="${esc(tr("namePlaceholder"))}" value="${esc(opt.name)}">
      </label>
      ${
        opt.format === "text"
          ? ""
          : `<div class="field">
        <span class="field-label">${tr("design")}</span>
        <div class="swatches" role="group">
          ${Object.entries(STYLES)
            .map(([k, s]) => `<button type="button" class="swatch" data-style="${k}" aria-pressed="${k === opt.style}" style="--sw:${s.swatch}"><span></span>${s.label}</button>`)
            .join("")}
        </div>
      </div>`
      }`;
    renderActions();
  }

  function renderActions() {
    const main = opt.format === "text" ? tr("shareNow") : `${tr("shareNow")} · ${opt.format === "video" ? tr("asVideo") : tr("asImage")}`;
    actions.innerHTML = `
      <button type="button" class="btn btn-primary" data-do="share" ${busy ? "disabled" : ""}>${ICONS.share}<span>${busy ? tr("making") : main}</span></button>
      ${
        opt.format === "text"
          ? `<button type="button" class="btn btn-ghost" data-do="copy">${ICONS.copy}${tr("copyText")}</button>`
          : `<button type="button" class="btn btn-ghost" data-do="download" ${busy ? "disabled" : ""}>${tr("download")}</button>`
      }`;
  }

  function renderPreview() {
    const isText = opt.format === "text";
    canvas.hidden = isText;
    textPreview.hidden = !isText;
    cancelAnimationFrame(raf);
    if (isText) {
      textPreview.textContent = messageText();
      return;
    }
    buildCard();
    canvas.setAttribute("aria-label", `${card.greeting} ${card.verses.map((v) => v.ref).join(", ")}`);
    started = performance.now();
    const frame = (now) => {
      const time = reduceMotion.matches ? END + 5 : ((now - started) / 1000) % (VIDEO_SECONDS + 1.5);
      drawCard(ctx, card, time);
      if (!reduceMotion.matches && !root.hidden) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  function update() {
    renderControls();
    renderPreview();
  }

  // ---------- Output ----------
  const fileBase = () => `${opt.occ ? opt.occ.id + "-" : ""}${refAnchor(opt.ref)}`;

  function stillImage() {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    drawCard(c.getContext("2d"), card, END + 4.5);
    return new Promise((res) => c.toBlob((b) => res(new File([b], `${fileBase()}.jpg`, { type: "image/jpeg" })), "image/jpeg", 0.92));
  }

  function video() {
    return new Promise((resolve, reject) => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const g = c.getContext("2d");
      drawCard(g, card, 0);
      const rec = new MediaRecorder(c.captureStream(30), { mimeType: VIDEO_MIME, videoBitsPerSecond: 6_000_000 });
      const chunks = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onerror = (e) => reject(e.error);
      rec.onstop = () => resolve(new File([new Blob(chunks, { type: "video/mp4" })], `${fileBase()}.mp4`, { type: "video/mp4" }));
      const t0 = performance.now();
      rec.start(250);
      const tick = (now) => {
        const time = (now - t0) / 1000;
        drawCard(g, card, Math.min(time, VIDEO_SECONDS));
        if (time < VIDEO_SECONDS) requestAnimationFrame(tick);
        else rec.stop();
      };
      requestAnimationFrame(tick);
    });
  }

  async function makeFile() {
    if (opt.format === "image") return stillImage();
    busy = true;
    renderActions();
    try {
      return await video();
    } finally {
      busy = false;
      renderActions();
    }
  }

  function save(file) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    app.toast(tr("saved2"));
  }

  async function share() {
    if (opt.format === "text") {
      const text = messageText();
      if (navigator.share) {
        try {
          return await navigator.share({ text });
        } catch (err) {
          if (err.name === "AbortError") return;
        }
      }
      return window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
    }
    const file = await makeFile();
    if (navigator.canShare?.({ files: [file] })) {
      try {
        return await navigator.share({ files: [file] });
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }
    save(file);
  }

  // ---------- Events ----------
  root.addEventListener("click", async (e) => {
    const el = e.target.closest("button, [data-close]");
    if (!el) return;
    if (el.hasAttribute("data-close")) return close();
    if (el.dataset.format) {
      opt.format = el.dataset.format;
      return update();
    }
    if (el.dataset.slang) {
      const l = el.dataset.slang;
      const on = opt.langs.includes(l);
      if (on && opt.langs.length === 1) return;
      const next = LANG_ORDER.filter((x) => (x === l ? !on : opt.langs.includes(x)));
      await app.ensureLangs(next);
      await loadCardFonts(next);
      opt.langs = next;
      return update();
    }
    if (el.dataset.style) {
      opt.style = el.dataset.style;
      return update();
    }
    if (el.dataset.do === "share") return share().catch(() => app.toast(tr("offline")));
    if (el.dataset.do === "download") return makeFile().then(save);
    if (el.dataset.do === "copy") {
      await navigator.clipboard?.writeText(messageText()).catch(() => {});
      return app.toast(tr("copied"));
    }
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-occ-select]")) {
      opt.occ = OCCASIONS.find((o) => o.id === e.target.value) ?? null;
      if (opt.occ) opt.style = opt.occ.style;
      update();
    }
  });
  root.addEventListener("input", (e) => {
    if (e.target.matches("[data-name]")) {
      opt.name = e.target.value;
      renderPreview();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (!root.hidden && e.key === "Escape") close();
  });

  function close() {
    root.hidden = true;
    cancelAnimationFrame(raf);
    document.body.style.overflow = "";
    returnFocus?.focus({ preventScroll: true });
  }

  return {
    async open({ ref, occ }) {
      returnFocus = document.activeElement;
      const langs = [...state.langs];
      await Promise.all([app.ensureLangs(langs), loadCardFonts(langs)]);
      opt = { ref, format: opt?.format ?? "image", langs, occ, name: opt?.name ?? "", style: occ?.style ?? "dawn" };
      root.querySelector("#share-title").textContent = tr("shareTitle");
      root.querySelector(".sheet-head [data-close]").setAttribute("aria-label", tr("close"));
      root.hidden = false;
      document.body.style.overflow = "hidden";
      update();
      root.querySelector(".sheet-controls button[aria-pressed='true']")?.focus({ preventScroll: true });
    },
  };
}
