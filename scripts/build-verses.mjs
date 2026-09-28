// Builds public/data/verses.json from the eBible.org VPL source files.
// Run: npm run build:verses   (downloads sources on first run)
//
// Sources (all from https://ebible.org):
//   en  King James Version (eng-kjv2006)             — Public Domain
//   hi  Indian Revised Version Hindi 2019 (hin2017)  — CC BY-SA 4.0, Bridge Connectivity Solutions
//   te  Indian Revised Version Telugu 2019 (tel2017) — CC BY-SA 4.0, Bridge Connectivity Solutions

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { OCCASIONS, allRefs } from "../public/js/occasions.js";
import { BOOKS } from "./books.mjs";
import { DEDICATION } from "../public/js/site.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "sources");
const SOURCES = { en: "eng-kjv2006", hi: "hin2017", te: "tel2017" };

// eBible's VPL files use older book codes for a few books.
const VPL_TO_USFM = { JOH: "JHN", MAR: "MRK", PHI: "PHP", JAM: "JAS", SOL: "SNG", EZE: "EZK", JOE: "JOL", NAH: "NAM", "1JO": "1JN", "2JO": "2JN", "3JO": "3JN" };

async function ensureSource(id) {
  const sql = join(srcDir, `${id}_vpl.sql`);
  if (existsSync(sql)) return sql;
  mkdirSync(srcDir, { recursive: true });
  const zip = join(srcDir, `${id}_vpl.zip`);
  console.log(`Downloading ${id}…`);
  const res = await fetch(`https://ebible.org/Scriptures/${id}_vpl.zip`);
  if (!res.ok) throw new Error(`Download failed for ${id}: ${res.status}`);
  writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
  // The SQL export (unlike the .txt) records bridged verses, e.g. Telugu MAT 1:22-23.
  try {
    execFileSync("unzip", ["-o", "-j", zip, `${id}_vpl.sql`, "-d", srcDir]);
  } catch {
    execFileSync("tar", ["-xf", zip, "-C", srcDir, `${id}_vpl.sql`]);
  }
  return sql;
}

function clean(lang, text) {
  let t = text.replace(/¶/g, "");
  if (lang === "en") t = t.replace(/[\[\]]/g, ""); // KJV italics markers: [is] -> is
  // IRV Hindi appends cross-references such as "(यशा. 40:11)" — not part of the verse.
  t = t.replace(/\s*\([^()]*\d+\s*:\s*\d+[^()]*\)/g, "");
  return t.replace(/\s+/g, " ").trim();
}

// Returns segments per chapter: "JHN 3" -> [{ from, to, t }]. A segment covers
// more than one verse where the translation bridges verses together.
function loadBible(lang, file) {
  const map = new Map();
  const row = /^INSERT INTO \w+ VALUES \("[^"]*","[^"]*","(\w+)","(\d+)","(\d+)","(\d+)","(.*)"\);\s*$/;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(row);
    if (!m) continue;
    const key = `${VPL_TO_USFM[m[1]] || m[1]} ${m[2]}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ from: +m[3], to: +m[4], t: clean(lang, m[5].replace(/\\"/g, '"')) });
  }
  return map;
}

function parseRef(ref) {
  const m = ref.match(/^(\w{3}) (\d+):(\d+)(?:-(\d+))?$/);
  if (!m) throw new Error(`Bad reference: ${ref}`);
  const [, book, ch, from, to] = m;
  return { book, ch: +ch, from: +from, to: to ? +to : +from };
}

const bibles = {};
for (const [lang, id] of Object.entries(SOURCES)) bibles[lang] = loadBible(lang, await ensureSource(id));

const out = {};
const problems = [];
for (const ref of new Set([...allRefs(), DEDICATION.verse])) {
  const { book, ch, from, to } = parseRef(ref);
  if (!BOOKS[book]) problems.push(`${ref}: unknown book`);
  const entry = { ref: {}, text: {} };
  for (const lang of Object.keys(SOURCES)) {
    const range = from === to ? `${from}` : `${from}-${to}`;
    entry.ref[lang] = `${BOOKS[book][lang]} ${ch}:${range}`;
    const segs = (bibles[lang].get(`${book} ${ch}`) || []).filter((s) => s.to >= from && s.from <= to && s.t);
    entry.text[lang] = segs.map((s) => ({ v: s.from === s.to ? `${s.from}` : `${s.from}-${s.to}`, t: s.t }));
    for (let v = from; v <= to; v++) {
      if (!segs.some((s) => s.from <= v && v <= s.to)) problems.push(`${ref} [${lang}] missing verse ${v}`);
    }
  }
  out[ref] = entry;
}

if (problems.length) {
  console.error("Problems:\n  " + problems.join("\n  "));
  process.exit(1);
}

// One file per language, so a visitor only downloads the languages they read.
for (const lang of Object.keys(SOURCES)) {
  const data = Object.fromEntries(Object.entries(out).map(([ref, e]) => [ref, { ref: e.ref[lang], text: e.text[lang] }]));
  const file = join(root, "public", "data", `verses-${lang}.json`);
  writeFileSync(file, JSON.stringify(data));
  console.log(`  verses-${lang}.json  ${(JSON.stringify(data).length / 1024).toFixed(0)} KB`);
}
console.log(`Wrote ${Object.keys(out).length} passages for ${OCCASIONS.length} occasions.`);
