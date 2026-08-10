#!/usr/bin/env node
/**
 * Downloads the bundled font set (static TTFs) from Google Fonts and writes
 * assets/fonts/manifest.json.
 *
 * Static TTFs are required (not WOFF2): opentype.js parses TTF/OTF only, and the
 * exporter converts every glyph to an outline so the SVG that reaches xTool does
 * not depend on fonts being installed on the machine running the laser.
 *
 * Every family below is licensed OFL 1.1 or Apache 2.0 — both permit commercial
 * use and embedding in the products you sell. See docs/LICENSING.md.
 *
 *   node tools/fetch-fonts.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'fonts');

// Old-style UA makes the Google Fonts API serve `format('truetype')` URLs.
const LEGACY_UA = 'Mozilla/4.0';

/**
 * role: which slots in the plaque this face is good for. Drives the grouped
 * font pickers in the editor.
 *   verse | reference | word | accent
 */
const FAMILIES = [
  // ── Serif: the voice of scripture ────────────────────────────────────────
  { family: 'EB Garamond',       styles: ['400', '500', '600', '700', 'i400'], roles: ['verse', 'reference', 'accent'], group: 'Serif', note: 'Closest match to the original sample plaque.' },
  { family: 'Cormorant Garamond',styles: ['300', '400', '500', '600', '700', 'i400'], roles: ['verse', 'accent'], group: 'Serif', note: 'High contrast, elegant. Engraves best at larger sizes.' },
  { family: 'Playfair Display',  styles: ['400', '500', '700', '900', 'i400'], roles: ['verse', 'word', 'accent'], group: 'Serif' },
  { family: 'Libre Baskerville', styles: ['400', '700', 'i400'], roles: ['verse', 'reference'], group: 'Serif', note: 'Sturdy. Very forgiving on slate.' },
  { family: 'Lora',              styles: ['400', '500', '600', '700'], roles: ['verse', 'reference'], group: 'Serif' },
  { family: 'Crimson Pro',       styles: ['300', '400', '600', '700'], roles: ['verse'], group: 'Serif' },
  { family: 'Spectral',          styles: ['300', '400', '600', '700'], roles: ['verse'], group: 'Serif' },
  { family: 'Cardo',             styles: ['400', '700'], roles: ['verse'], group: 'Serif', note: 'Designed for classical and biblical texts.' },
  { family: 'Cinzel',            styles: ['400', '600', '700', '900'], roles: ['verse', 'word', 'reference', 'accent'], group: 'Inscriptional', note: 'Roman monument capitals. Caps only.' },
  { family: 'Cinzel Decorative', styles: ['400', '700', '900'], roles: ['accent', 'word'], group: 'Inscriptional' },
  { family: 'Marcellus',         styles: ['400'], roles: ['verse', 'accent'], group: 'Inscriptional' },
  { family: 'Forum',             styles: ['400'], roles: ['accent', 'word'], group: 'Inscriptional', note: 'Free stand-in for Trajan-style lettering.' },

  // ── Sans: the subject word ───────────────────────────────────────────────
  { family: 'Montserrat',        styles: ['400', '600', '700', '800', '900'], roles: ['word', 'reference', 'verse'], group: 'Sans' },
  { family: 'Inter',             styles: ['400', '600', '700', '800', '900'], roles: ['word', 'reference', 'verse'], group: 'Sans' },
  { family: 'Archivo Black',     styles: ['400'], roles: ['word'], group: 'Sans', note: 'Heavy grotesque — matches the sample badge word.' },
  { family: 'Anton',             styles: ['400'], roles: ['word'], group: 'Sans', note: 'Tall and condensed. Great for long subject words.' },
  { family: 'Oswald',            styles: ['400', '500', '600', '700'], roles: ['word', 'reference'], group: 'Sans' },
  { family: 'Bebas Neue',        styles: ['400'], roles: ['word', 'reference'], group: 'Sans' },
  { family: 'Barlow Condensed',  styles: ['400', '500', '600', '700'], roles: ['word', 'reference'], group: 'Sans' },
  { family: 'League Spartan',    styles: ['400', '700', '900'], roles: ['word'], group: 'Sans' },

  // ── Mono: the chapter-and-verse line ─────────────────────────────────────
  { family: 'JetBrains Mono',    styles: ['400', '500', '700'], roles: ['reference'], group: 'Mono', note: 'Matches the sample reference line.' },
  { family: 'Roboto Mono',       styles: ['400', '500', '700'], roles: ['reference'], group: 'Mono' },
  { family: 'Space Mono',        styles: ['400', '700'], roles: ['reference'], group: 'Mono' },
  { family: 'IBM Plex Mono',     styles: ['400', '500', '600'], roles: ['reference'], group: 'Mono' },

  // ── Script: accents and personalisation ──────────────────────────────────
  { family: 'Great Vibes',       styles: ['400'], roles: ['accent', 'verse'], group: 'Script', note: 'Keep above ~14mm — hairlines can drop out on slate.' },
  { family: 'Parisienne',        styles: ['400'], roles: ['accent'], group: 'Script' },
  { family: 'Cormorant Infant',  styles: ['400', '600'], roles: ['accent', 'verse'], group: 'Script' },
];

function styleToSpec(style) {
  const italic = style.startsWith('i');
  const weight = Number(italic ? style.slice(1) : style);
  return { italic, weight };
}

function cssUrl(family, styles) {
  const specs = styles.map(styleToSpec);
  const hasItalic = specs.some((s) => s.italic);
  const axis = hasItalic ? 'ital,wght@' : 'wght@';
  const tuples = specs
    .map((s) => (hasItalic ? `${s.italic ? 1 : 0},${s.weight}` : `${s.weight}`))
    .sort();
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${axis}${tuples.join(';')}&display=swap`;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': LEGACY_UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

function parseFaces(css) {
  const faces = [];
  const blockRe = /@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = blockRe.exec(css))) {
    const block = m[1];
    const pick = (re) => (block.match(re) || [])[1];
    const src = pick(/src:\s*url\(([^)]+)\)/);
    if (!src) continue;
    faces.push({
      weight: Number(pick(/font-weight:\s*(\d+)/) || 400),
      italic: /font-style:\s*italic/.test(block),
      url: src,
    });
  }
  return faces;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = [];
  let bytes = 0;

  for (const entry of FAMILIES) {
    const family = entry.alias || entry.family;
    const css = await fetchText(cssUrl(family, entry.styles));
    const faces = parseFaces(css);
    if (!faces.length) {
      console.warn(`!! no faces resolved for ${family}`);
      continue;
    }

    const record = { id: slug(family), family, group: entry.group, roles: entry.roles, faces: [] };
    if (entry.note) record.note = entry.note;

    for (const face of faces) {
      const file = `${slug(family)}-${face.weight}${face.italic ? 'i' : ''}.ttf`;
      const res = await fetch(face.url, { headers: { 'User-Agent': LEGACY_UA } });
      if (!res.ok) throw new Error(`${res.status} downloading ${face.url}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(path.join(OUT_DIR, file), buf);
      bytes += buf.length;
      record.faces.push({ weight: face.weight, italic: face.italic, file });
      process.stdout.write(`  ${file} (${(buf.length / 1024).toFixed(0)} KB)\n`);
    }

    record.faces.sort((a, b) => a.italic - b.italic || a.weight - b.weight);
    manifest.push(record);
    console.log(`✓ ${family} — ${record.faces.length} face(s)`);
  }

  manifest.sort((a, b) => a.group.localeCompare(b.group) || a.family.localeCompare(b.family));
  await writeFile(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ generated: new Date().toISOString().slice(0, 10), families: manifest }, null, 2) + '\n',
  );

  const faceCount = manifest.reduce((n, f) => n + f.faces.length, 0);
  console.log(`\n${manifest.length} families / ${faceCount} faces / ${(bytes / 1048576).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
