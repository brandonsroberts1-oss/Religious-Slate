/**
 * Font book.
 *
 * Every face is a static TTF bundled in assets/fonts and parsed with
 * opentype.js. All measuring and all outline generation goes through here, so
 * the on-screen preview and the exported SVG are produced by one code path and
 * cannot drift apart.
 *
 * opentype.js is loaded as a global by index.html (it ships as a UMD bundle).
 */

// Resolved against this module rather than the page, so any entry point —
// index.html or the marketing scene renderer in tools/ — finds the same files.
const FONT_DIR = new URL('../fonts/', import.meta.url).href;

/** Order the pickers present groups in. */
export const GROUP_ORDER = ['Serif', 'Inscriptional', 'Sans', 'Mono', 'Script'];

let manifest = null;
const parsed = new Map(); // file -> opentype.Font
const inflight = new Map(); // file -> Promise

export async function loadManifest() {
  if (manifest) return manifest;
  const res = await fetch(`${FONT_DIR}manifest.json`);
  if (!res.ok) throw new Error(`Could not load the font manifest (${res.status}). Serve the app over http — see README.`);
  const data = await res.json();
  manifest = data.families;
  return manifest;
}

export function families() {
  if (!manifest) throw new Error('loadManifest() must run first');
  return manifest;
}

export function family(id) {
  return families().find((f) => f.id === id) || families()[0];
}

/** Families that make sense in a given slot: verse | reference | word | accent. */
export function familiesForRole(role) {
  const list = families().filter((f) => f.roles.includes(role));
  return list.sort(
    (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.family.localeCompare(b.family),
  );
}

/** Weights available for a family, ascending. */
export function weightsFor(id, italic = false) {
  return family(id)
    .faces.filter((f) => !!f.italic === !!italic)
    .map((f) => f.weight)
    .sort((a, b) => a - b);
}

export function hasItalic(id) {
  return family(id).faces.some((f) => f.italic);
}

/** Resolve a (family, weight, italic) request to the closest bundled face. */
export function resolveFace(id, weight = 400, italic = false) {
  const fam = family(id);
  const wanted = fam.faces.filter((f) => !!f.italic === !!italic);
  const pool = wanted.length ? wanted : fam.faces;
  return pool.reduce((best, f) => (Math.abs(f.weight - weight) < Math.abs(best.weight - weight) ? f : best));
}

/** Parse a face, caching both the promise and the result. */
export async function loadFace(id, weight = 400, italic = false) {
  const face = resolveFace(id, weight, italic);
  if (parsed.has(face.file)) return parsed.get(face.file);
  if (inflight.has(face.file)) return inflight.get(face.file);

  const promise = (async () => {
    const res = await fetch(FONT_DIR + face.file);
    if (!res.ok) throw new Error(`Missing font file ${face.file}`);
    const font = window.opentype.parse(await res.arrayBuffer());
    parsed.set(face.file, font);
    inflight.delete(face.file);
    return font;
  })();

  inflight.set(face.file, promise);
  return promise;
}

/** Synchronous accessor for a face already loaded. Returns null if not ready. */
export function peekFace(id, weight = 400, italic = false) {
  return parsed.get(resolveFace(id, weight, italic).file) || null;
}

/** Warm the cache for every face a design references. */
export async function preload(specs) {
  await Promise.all(specs.map((s) => loadFace(s.font, s.weight, s.italic).catch(() => null)));
}

/** Register a face with the browser too, so HTML previews can use it. */
const injected = new Set();
export function injectCss(id, weight = 400, italic = false) {
  const face = resolveFace(id, weight, italic);
  if (injected.has(face.file)) return;
  injected.add(face.file);
  const style = document.createElement('style');
  style.textContent =
    `@font-face{font-family:"${family(id).family} preview";` +
    `src:url("${FONT_DIR}${face.file}") format("truetype");` +
    `font-weight:${face.weight};font-style:${face.italic ? 'italic' : 'normal'};font-display:swap}`;
  document.head.appendChild(style);
}

// ── Metrics ────────────────────────────────────────────────────────────────
// Everything below works in millimetres. `size` is the em size in mm.

const unit = (font, size) => size / font.unitsPerEm;

export function glyphsOf(font, text) {
  return font.stringToGlyphs(text);
}

/**
 * Advance width of a string in mm, including letter-spacing.
 *
 * Tracking is added between glyphs only — never after the last one — so a
 * centred line stays optically centred instead of drifting left by half a
 * tracking step.
 */
export function measureText(font, text, size, trackingEm = 0) {
  if (!text) return 0;
  const scale = unit(font, size);
  const glyphs = glyphsOf(font, text);
  let w = 0;
  for (let i = 0; i < glyphs.length; i++) {
    w += glyphs[i].advanceWidth * scale;
    if (i < glyphs.length - 1) w += trackingEm * size;
  }
  return w;
}

/** Cap height in mm — the measurement that makes boxed words look centred. */
export function capHeight(font, size) {
  const os2 = font.tables.os2;
  let units = os2 && os2.sCapHeight ? os2.sCapHeight : 0;
  if (!units) {
    const h = font.charToGlyph('H');
    const m = h && h.getMetrics();
    units = m && m.yMax ? m.yMax : font.ascender * 0.7;
  }
  return units * unit(font, size);
}

/** x-height in mm. */
export function xHeight(font, size) {
  const os2 = font.tables.os2;
  let units = os2 && os2.sxHeight ? os2.sxHeight : 0;
  if (!units) {
    const x = font.charToGlyph('x');
    const m = x && x.getMetrics();
    units = m && m.yMax ? m.yMax : font.ascender * 0.5;
  }
  return units * unit(font, size);
}

export function ascent(font, size) {
  return font.ascender * unit(font, size);
}

export function descent(font, size) {
  return Math.abs(font.descender) * unit(font, size);
}

/**
 * Outline a string as SVG path data.
 *
 * `x` is the anchor point, interpreted according to `align`; `y` is the
 * baseline. Coordinates are absolute millimetres — no transforms are emitted,
 * because some importers (xTool Creative Space among them) handle baked
 * coordinates far more predictably than nested transform matrices.
 */
export function textToPath(font, text, x, y, size, { tracking = 0, align = 'center', decimals = 3 } = {}) {
  if (!text) return '';
  const scale = unit(font, size);
  const width = measureText(font, text, size, tracking);
  let cursor = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;

  const parts = [];
  for (const glyph of glyphsOf(font, text)) {
    const d = glyph.getPath(cursor, y, size).toPathData(decimals);
    if (d) parts.push(d);
    cursor += glyph.advanceWidth * scale + tracking * size;
  }
  return parts.join(' ');
}

/** Break `text` into lines that fit `maxWidth`, honouring explicit newlines. */
export function wrapText(font, text, size, tracking, maxWidth) {
  const lines = [];
  for (const paragraph of String(text).split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      continue;
    }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${line} ${words[i]}`;
      if (maxWidth > 0 && measureText(font, candidate, size, tracking) > maxWidth) {
        lines.push(line);
        line = words[i];
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Largest size (<= `startSize`) at which `text` fits `maxWidth` in `maxLines`.
 * Used by the "fit" buttons so a long verse can be dropped in without the
 * operator hand-tuning point sizes.
 */
export function fitSize(font, text, { maxWidth, maxLines = 3, startSize = 20, minSize = 4, tracking = 0 }) {
  let lo = minSize;
  let hi = startSize;
  let best = minSize;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const lines = wrapText(font, text, mid, tracking, maxWidth);
    const fits = lines.length <= maxLines && lines.every((l) => measureText(font, l, mid, tracking) <= maxWidth);
    if (fits) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return Math.round(best * 10) / 10;
}
