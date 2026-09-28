// Draws the app icons (PNG) without any image libraries.
// Run: node scripts/make-icons.mjs  → public/icons/*.png

import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
mkdirSync(out, { recursive: true });

const BG = [0x7a, 0x2e, 0x2e];
const FG = [0xf3, 0xdc, 0xa4];

// Distance from point to segment, for round-capped strokes.
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Shape in a 32-unit box, matching favicon.svg. `maskable` = full bleed, cross shrunk into the safe zone.
function sample(x, y, maskable) {
  let inBg = true;
  if (!maskable) {
    const r = 7, cx = Math.min(Math.max(x, r), 32 - r), cy = Math.min(Math.max(y, r), 32 - r);
    inBg = Math.hypot(x - cx, y - cy) <= r;
  }
  if (!inBg) return null;
  const s = maskable ? 0.72 : 1;
  const u = 16 + (x - 16) / s, v = 16 + (y - 16) / s;
  const w = 1.5;
  const onCross = segDist(u, v, 16, 6, 16, 26) <= w || segDist(u, v, 10, 12.5, 22, 12.5) <= w;
  return onCross ? FG : BG;
}

function draw(size, maskable) {
  const ss = 4;
  const px = Buffer.alloc(size * size * 4);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sj = 0; sj < ss; sj++) {
        for (let si = 0; si < ss; si++) {
          const c = sample(((i + (si + 0.5) / ss) / size) * 32, ((j + (sj + 0.5) / ss) / size) * 32, maskable);
          if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
        }
      }
      const o = (j * size + i) * 4;
      if (a) { px[o] = r / a; px[o + 1] = g / a; px[o + 2] = b / a; }
      px[o + 3] = Math.round((a / (ss * ss)) * 255);
    }
  }
  return png(size, px);
}

const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (const byte of buf) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0)),
  ]);
}

const files = {
  "icon-192.png": draw(192, false),
  "icon-512.png": draw(512, false),
  "maskable-512.png": draw(512, true),
  "apple-touch-icon.png": draw(180, true), // iOS rounds the corners itself
};
for (const [name, buf] of Object.entries(files)) writeFileSync(join(out, name), buf);
console.log("Wrote", Object.keys(files).join(", "));
