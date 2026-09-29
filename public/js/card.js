// Greeting cards: draws a shareable 1080×1350 card on a canvas.
// drawCard(ctx, card, time) — `time` in seconds drives the entrance animation
// (0–3s) and the gentle background motion; any time ≥ END shows the full card.

export const W = 1080;
export const H = 1350;
export const END = 3.2; // entrance finished
export const VIDEO_SECONDS = 7;

const FONTS = { en: '"Noto Serif", Georgia, serif', hi: '"Noto Serif Devanagari", serif', te: '"Noto Serif Telugu", serif' };
const EMOJI = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

export const STYLES = {
  dawn: {
    label: "Dawn",
    bg: ["#ffe9cf", "#f8c7a6", "#e08a8f", "#8a3050"],
    panel: "rgba(255,250,244,0.9)", border: "rgba(255,255,255,0.9)",
    ink: "#3a2622", accent: "#8a2f45", accent2: "#b07a1e", swatch: "#f0a58f",
  },
  garden: {
    label: "Garden",
    bg: ["#fdf7ee", "#fbeee0"],
    panel: "rgba(255,255,255,0.84)", border: "rgba(255,255,255,0.95)",
    ink: "#3b2a24", accent: "#b0475e", accent2: "#6c8f5a", swatch: "#f3c7cf",
  },
  night: {
    label: "Night",
    bg: ["#2e2f78", "#0b0e2c"],
    panel: "rgba(14,16,46,0.62)", border: "rgba(255,255,255,0.18)",
    ink: "#f7f1e6", accent: "#f2cf7a", accent2: "#c9b8ff", swatch: "#23265f",
  },
  royal: {
    label: "Royal",
    bg: ["#6b1a37", "#2b0a1e"],
    panel: "rgba(255,248,236,0.93)", border: "rgba(242,207,122,0.9)",
    ink: "#2a1a14", accent: "#7a1f3a", accent2: "#a8791f", swatch: "#7a1f3a",
  },
  serene: {
    label: "Serene",
    bg: ["#e4ebf2", "#bccad8", "#8fa3b9"],
    panel: "rgba(255,255,255,0.82)", border: "rgba(255,255,255,0.95)",
    ink: "#2f3a46", accent: "#465c76", accent2: "#8a6a3a", swatch: "#a9b9ca",
  },
};

// Deterministic particles so every frame (and the saved image) matches.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const particles = (() => {
  const r = rng(7);
  return Array.from({ length: 70 }, () => ({ x: r(), y: r(), s: r(), p: r() * Math.PI * 2, v: 0.4 + r() * 0.6 }));
})();

const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

// ---------- Backgrounds ----------
function background(ctx, st, name, time) {
  const g = ctx.createLinearGradient(0, 0, name === "night" ? W * 0.3 : 0, H);
  st.bg.forEach((c, i) => g.addColorStop(i / (st.bg.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (name === "dawn") {
    // Slowly turning light rays from a sun above the card.
    ctx.save();
    ctx.translate(W / 2, -80);
    ctx.rotate(time * 0.04);
    for (let i = 0; i < 18; i++) {
      ctx.rotate((Math.PI * 2) / 18);
      const ray = ctx.createLinearGradient(0, 0, 0, H * 1.2);
      ray.addColorStop(0, "rgba(255,255,255,0.28)");
      ray.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = ray;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-70, H * 1.2);
      ctx.lineTo(70, H * 1.2);
      ctx.fill();
    }
    ctx.restore();
    glow(ctx, W / 2, -40, 380, "rgba(255,244,214,0.9)");
    bokeh(ctx, time, "rgba(255,246,230,", 34);
  } else if (name === "garden") {
    const blobs = [
      [0.12, 0.1, 360, "rgba(246,190,202,0.55)"], [0.92, 0.18, 320, "rgba(205,226,196,0.6)"],
      [0.08, 0.88, 340, "rgba(251,221,180,0.6)"], [0.9, 0.9, 380, "rgba(246,190,202,0.5)"],
      [0.55, 0.02, 260, "rgba(214,200,236,0.45)"],
    ];
    for (const [x, y, r, c] of blobs) glow(ctx, x * W + Math.sin(time * 0.5 + x * 9) * 18, y * H + Math.cos(time * 0.4 + y * 7) * 18, r, c);
    petals(ctx, time);
  } else if (name === "night") {
    glow(ctx, W * 0.2, H * 0.15, 420, "rgba(126,92,210,0.35)");
    glow(ctx, W * 0.85, H * 0.8, 460, "rgba(64,120,210,0.3)");
    for (const p of particles) {
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(time * 1.6 * p.v + p.p));
      star(ctx, p.x * W, p.y * H, 1.5 + p.s * 3.5, `rgba(255,248,220,${tw})`);
    }
  } else if (name === "royal") {
    ctx.strokeStyle = "rgba(242,207,122,0.35)";
    ctx.lineWidth = 2;
    for (const [cx, cy] of [[0, 0], [W, 0], [0, H], [W, H]]) {
      for (let i = 1; i <= 6; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, 60 * i + Math.sin(time + i) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    for (const p of particles.slice(0, 40)) {
      const tw = Math.max(0, Math.sin(time * 2 * p.v + p.p));
      sparkle(ctx, p.x * W, p.y * H, 4 + p.s * 10 * tw, `rgba(255,222,150,${0.2 + tw * 0.8})`);
    }
  } else if (name === "serene") {
    glow(ctx, W * 0.25, H * 0.2, 380, "rgba(255,255,255,0.55)");
    glow(ctx, W * 0.8, H * 0.35, 300, "rgba(255,255,255,0.4)");
    const flicker = 0.85 + Math.sin(time * 6) * 0.05 + Math.sin(time * 9.3) * 0.04;
    glow(ctx, W / 2, H + 60, 520 * flicker, "rgba(255,214,150,0.55)");
    bokeh(ctx, time, "rgba(255,255,255,", 22);
  }
}

function glow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function bokeh(ctx, time, rgbaPrefix, n) {
  for (const p of particles.slice(0, n)) {
    const y = ((p.y - time * 0.02 * p.v) % 1 + 1) % 1;
    const r = 10 + p.s * 36;
    const g = ctx.createRadialGradient(p.x * W, y * H, 0, p.x * W, y * H, r);
    g.addColorStop(0, rgbaPrefix + (0.25 + p.s * 0.3) + ")");
    g.addColorStop(1, rgbaPrefix + "0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x * W, y * H, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function petals(ctx, time) {
  const colors = ["rgba(236,150,170,0.7)", "rgba(250,196,160,0.7)", "rgba(190,210,170,0.7)"];
  for (const [i, p] of particles.slice(0, 26).entries()) {
    const y = ((p.y + time * 0.035 * p.v) % 1) * (H + 80) - 40;
    const x = p.x * W + Math.sin(time * 0.8 + p.p) * 30;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 0.6 * p.v + p.p);
    ctx.fillStyle = colors[i % 3];
    ctx.beginPath();
    ctx.ellipse(0, 0, 9 + p.s * 8, 4 + p.s * 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function sparkle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

// ---------- Text layout ----------
function wrap(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? line + " " + w : w;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// Builds the list of text blocks at scale k; returns blocks and total height.
function layout(ctx, card, st, k, maxW) {
  const blocks = [];
  const lang0 = card.lang;
  const lh = (lang) => (lang === "en" ? 1.36 : 1.62);
  const add = (text, { lang = "en", size, weight = 400, italic = false, color = st.ink, spacing = 0, gapBefore = 0, delay = 0, upper = false }) => {
    const font = `${italic ? "italic " : ""}${weight} ${Math.round(size)}px ${FONTS[lang]}`;
    ctx.font = font;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${spacing}px`;
    const lines = wrap(ctx, upper ? text.toUpperCase() : text, maxW);
    blocks.push({ kind: "text", lines, font, size, color, spacing, lineHeight: size * lh(lang), gapBefore, delay });
  };
  if (card.dear) add(card.dear, { lang: lang0, size: 36 * k, italic: lang0 === "en", color: st.ink, delay: 0.45 });
  if (card.greeting) add(card.greeting, { lang: lang0, size: 58 * k, weight: 600, color: st.accent, gapBefore: card.dear ? 10 * k : 0, delay: 0.6 });
  if (card.greeting || card.dear) blocks.push({ kind: "divider", h: 44 * k, gapBefore: 26 * k, delay: 1.0 });
  card.verses.forEach((v, i) => {
    add(`“${v.text}”`, { lang: v.lang, size: 38 * k, color: st.ink, gapBefore: i ? 34 * k : 12 * k, delay: 1.25 + i * 0.35 });
    add(`${v.ref} · ${v.version}`, { lang: v.lang, size: 25 * k, weight: 600, color: st.accent2, spacing: 1, gapBefore: 10 * k, delay: 1.35 + i * 0.35 });
  });
  const d = 1.5 + card.verses.length * 0.35;
  blocks.push({ kind: "divider", h: 44 * k, gapBefore: 28 * k, delay: d });
  add(card.from, { lang: lang0, size: 38 * k, weight: 600, color: st.ink, gapBefore: 18 * k, delay: d + 0.2 });
  add(card.church, { lang: "en", size: 22 * k, weight: 600, color: st.accent2, spacing: 4, upper: true, gapBefore: 8 * k, delay: d + 0.3 });
  const height = blocks.reduce((sum, b) => sum + b.gapBefore + (b.kind === "text" ? b.lines.length * b.lineHeight : b.h), 0);
  return { blocks, height };
}

const layoutCache = new WeakMap();

export function drawCard(ctx, card, time) {
  const st = STYLES[card.style] ?? STYLES.dawn;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  background(ctx, st, card.style, time);

  // Panel slides up and fades in.
  const pIn = ease(time / 0.7);
  const panel = { x: 80, y: 170, w: W - 160, h: H - 290 };
  ctx.globalAlpha = pIn;
  ctx.save();
  ctx.translate(0, (1 - pIn) * 40);
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 18;
  roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 46);
  ctx.fillStyle = st.panel;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = 3;
  ctx.strokeStyle = st.border;
  ctx.stroke();
  ctx.restore();

  // Occasion badge.
  const bIn = ease((time - 0.25) / 0.6);
  const bx = W / 2, by = panel.y;
  ctx.globalAlpha = bIn;
  ctx.save();
  ctx.translate(bx, by);
  ctx.scale(0.6 + 0.4 * bIn, 0.6 + 0.4 * bIn);
  ctx.beginPath();
  ctx.arc(0, 0, 82, 0, Math.PI * 2);
  ctx.fillStyle = card.style === "night" ? "#1a1c4a" : "#fffaf3";
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = 5;
  ctx.strokeStyle = st.accent2;
  ctx.stroke();
  ctx.font = `86px ${EMOJI}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(card.icon || "✝️", 0, 6);
  ctx.restore();

  // Text: largest size that fits the panel.
  const top = panel.y + 120, bottom = panel.y + panel.h - 64, maxW = panel.w - 150;
  let lay = layoutCache.get(card);
  if (!lay) {
    for (let k = 1.15; k >= 0.4; k -= 0.03) {
      lay = layout(ctx, card, st, k, maxW);
      if (lay.height <= bottom - top) break;
    }
    layoutCache.set(card, lay);
  }
  let y = top + (bottom - top - lay.height) / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const b of lay.blocks) {
    y += b.gapBefore;
    const a = ease((time - b.delay) / 0.6);
    ctx.globalAlpha = a * pIn;
    const dy = (1 - a) * 18;
    if (b.kind === "divider") {
      const cy = y + b.h / 2 + dy, half = 150 * a;
      ctx.strokeStyle = st.accent2;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 22 - half, cy);
      ctx.lineTo(W / 2 - 22, cy);
      ctx.moveTo(W / 2 + 22, cy);
      ctx.lineTo(W / 2 + 22 + half, cy);
      ctx.stroke();
      sparkle(ctx, W / 2, cy, 14, st.accent2);
      y += b.h;
    } else {
      ctx.font = b.font;
      if ("letterSpacing" in ctx) ctx.letterSpacing = `${b.spacing}px`;
      ctx.fillStyle = b.color;
      for (const line of b.lines) {
        ctx.fillText(line, W / 2, y + dy + (b.lineHeight - b.size) / 2);
        y += b.lineHeight;
      }
    }
  }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Makes sure the scripture fonts are ready before drawing (they are cached offline after first use).
export async function loadCardFonts(langs) {
  if (!document.fonts?.load) return;
  const loads = [];
  for (const l of new Set(["en", ...langs])) {
    const fam = FONTS[l].split(",")[0];
    loads.push(document.fonts.load(`400 40px ${fam}`, "अ అ a"), document.fonts.load(`600 40px ${fam}`, "अ అ a"));
  }
  loads.push(document.fonts.load(`italic 400 40px ${FONTS.en.split(",")[0]}`));
  await Promise.race([Promise.allSettled(loads), new Promise((r) => setTimeout(r, 2500))]);
}
