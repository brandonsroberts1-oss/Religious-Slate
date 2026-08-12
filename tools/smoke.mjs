#!/usr/bin/env node
/**
 * Smoke test: boots the editor in a headless browser and checks the things
 * that would quietly ruin a production run.
 *
 *   node tools/serve.mjs & node tools/smoke.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:4173';

const checks = [];
const check = (name, ok, detail = '') => {
  checks.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__studio?.ready, null, { timeout: 30000 });

check('page boots with no JS errors', errors.length === 0, errors.slice(0, 3).join(' | '));

// Preview actually drew something.
const previewPaths = await page.locator('#board svg path').count();
check('preview renders geometry', previewPaths > 5, `${previewPaths} paths`);

// Export SVG shape and units.
const svg = await page.evaluate(() => {
  const s = window.__studio;
  return s.toExportSvg(s.state.design, s.VERSES.find((v) => v.id === s.state.design.verseId));
});

check('export declares physical mm size', /width="203\.2mm"\s+height="298\.45mm"/.test(svg), svg.match(/width="[^"]+"\s+height="[^"]+"/)?.[0]);
check('export viewBox matches mm 1:1', /viewBox="0 0 203\.2 298\.45"/.test(svg));
check('export has no <text> elements', !/<text[\s>]/.test(svg), 'text must be outlined');
check('export has no CSS classes or <style>', !/<style[\s>]/.test(svg) && !/class="/.test(svg));
check('export has no transforms', !/transform="/.test(svg));
check('export contains outlined glyphs', (svg.match(/<path /g) || []).length >= 4, `${(svg.match(/<path /g) || []).length} paths`);
check('badge box exported as even-odd ring', /id="badge-box"[^>]*fill-rule="evenodd"/.test(svg));

// Geometry sanity: every coordinate must land on the board.
const coords = [...svg.matchAll(/[-\d.]+/g)].map(Number).filter(Number.isFinite);
check('no NaN in path data', !/NaN/.test(svg));

// The load-bearing promise: preview and export are the same geometry.
const same = await page.evaluate(() => {
  const s = window.__studio;
  const verse = s.VERSES.find((v) => v.id === s.state.design.verseId);
  const ops = s.layout(s.state.design, verse).ops;
  const svg = s.toExportSvg(s.state.design, verse);
  return ops.every((op) => svg.includes(op.d));
});
check('export geometry is identical to the laid-out preview', same);

// Thickness controls must change real geometry, not just a stroke hint.
const thickness = await page.evaluate(() => {
  const s = window.__studio;
  const verse = s.VERSES.find((v) => v.id === s.state.design.verseId);
  const measure = (t) => {
    const d = s.clone(s.state.design);
    d.badge.box.thicknessMm = t;
    const box = s.layout(d, verse).ops.find((o) => o.id === 'badge-box');
    const ys = [...box.d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[2]));
    return Math.min(...ys);
  };
  const thin = measure(0.5);
  const thick = measure(4);
  return { thin, thick };
});
check('box thickness alters the ring geometry', Math.abs(thickness.thin - thickness.thick) < 0.001,
  'outer edge stays put while the wall thickens inward');

// Switching a verse must repaint the whole plaque.
await page.evaluate(() => {
  const s = window.__studio;
  s.state.design.verseId = 'joshua-1-9';
  s.update();
});
await page.waitForTimeout(400);
const afterSwitch = await page.evaluate(() => {
  const s = window.__studio;
  const verse = s.VERSES.find((v) => v.id === 'joshua-1-9');
  return {
    verse: s.resolveText(s.state.design, 'verse', verse),
    word: s.resolveText(s.state.design, 'badge', verse),
    ref: s.resolveText(s.state.design, 'reference', verse),
  };
});
check('verse switch updates verse, reference and subject word',
  afterSwitch.verse.startsWith('Be strong') && afterSwitch.word === 'COURAGE' && afterSwitch.ref === 'JOSHUA 1:9',
  JSON.stringify(afterSwitch));

// Every collection must lay out without warnings on its lead size.
const collectionIssues = await page.evaluate(async () => {
  const s = window.__studio;
  const out = [];
  for (const c of s.COLLECTIONS) {
    const verse = s.VERSES.find((v) => v.set === c.id);
    const d = s.applyCollection(s.DEFAULT_DESIGN(), c.id);
    d.verseId = verse.id;
    await s.fonts.preload(s.faceSpecs(d));
    const { warnings } = s.layout(d, verse);
    if (warnings.length) out.push(`${c.id}: ${warnings.join('; ')}`);
  }
  return out;
});
check('every collection lays out cleanly', collectionIssues.length === 0, collectionIssues.join(' | '));

// Two previews on one page must not share SVG ids. They did once: every board
// defined `clipPath id="board-clip"`, so the second plaque got clipped to the
// first one's outline — invisible in the editor, which only ever shows one.
const idClash = await page.evaluate(() => {
  const s = window.__studio;
  const a = s.toPreviewSvg(s.DEFAULT_DESIGN(), s.VERSES[0]);
  const b = s.toPreviewSvg(s.DEFAULT_DESIGN(), s.VERSES[1]);
  const ids = (svg) => [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const first = new Set(ids(a));
  return ids(b).filter((x) => first.has(x));
});
check('two previews share no SVG ids', idClash.length === 0, idClash.slice(0, 4).join(', '));

// Symbols must survive the exporter's no-transform contract. Scaling is a
// uniform map over coordinate pairs, which only holds while every command is
// absolute and takes nothing but coordinates — one stray arc would break it.
const symbolSyntax = await page.evaluate(async () => {
  const { SYMBOLS } = await import('/assets/js/symbols.js');
  const bad = [];
  for (const s of SYMBOLS) {
    const commands = [...s.d.matchAll(/[A-Za-z]/g)].map((m) => m[0]);
    const illegal = [...new Set(commands.filter((c) => !'MLCQZ'.includes(c)))];
    if (illegal.length) bad.push(`${s.id}: ${illegal.join('')}`);
    if (!/^M/.test(s.d.trim())) bad.push(`${s.id}: does not start with M`);
    if (!(s.w > 0 && s.h > 0)) bad.push(`${s.id}: bad box`);
    if (/NaN|undefined/.test(s.d)) bad.push(`${s.id}: NaN in path`);
  }
  return bad;
});
check('every symbol uses only absolute M/L/C/Q/Z', symbolSyntax.length === 0, symbolSyntax.slice(0, 4).join(', '));

// A placed symbol must land at exactly the requested height, centred on its
// anchor and seated on its top edge. Measured with the browser's own getBBox
// rather than our bounds maths, so the two have to agree independently.
const placement = await page.evaluate(async () => {
  const { SYMBOLS, placeSymbol, symbolWidth } = await import('/assets/js/symbols.js');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  svg.append(path);
  document.body.append(svg);

  const out = [];
  for (const s of SYMBOLS) {
    path.setAttribute('d', placeSymbol(s.id, 100, 20, 40));
    const box = path.getBBox();
    if (Math.abs(box.height - 40) > 0.05) out.push(`${s.id}: height ${box.height.toFixed(2)}`);
    if (Math.abs(box.y - 20) > 0.05) out.push(`${s.id}: top ${box.y.toFixed(2)}`);
    if (Math.abs(box.x + box.width / 2 - 100) > 0.05) out.push(`${s.id}: centre off`);
    if (Math.abs(box.width - symbolWidth(s.id, 40)) > 0.05) out.push(`${s.id}: width ${box.width.toFixed(2)}`);
  }
  svg.remove();
  return out;
});
check('symbols place at exactly the requested size and centre', placement.length === 0, placement.slice(0, 4).join(', '));

// The symbol has to reach the exported file, not just the preview.
const symbolExport = await page.evaluate(async () => {
  const s = window.__studio;
  const d = s.clone(s.state.design);
  Object.assign(d.symbol, { on: true, id: 'star-of-david', sizeMm: 30, slot: 'top' });
  const svg = s.toExportSvg(d, s.VERSES.find((v) => v.id === d.verseId));
  return { has: /id="symbol"/.test(svg), transforms: /transform="/.test(svg), arcs: /[Aa]\d/.test(svg) };
});
check('symbol reaches the export with no transforms', symbolExport.has && !symbolExport.transforms, JSON.stringify(symbolExport));

// Reset, and its undo.
const resetBehaviour = await page.evaluate(async () => {
  const s = window.__studio;
  s.state.design.verse.sizeMm = 44;
  s.state.design.badge.box.thicknessMm = 5.5;
  s.state.design.verseId = 'psalm-23-1';
  s.update();

  document.getElementById('btn-reset').click();
  const after = {
    size: s.state.design.verse.sizeMm,
    thickness: s.state.design.badge.box.thicknessMm,
    verse: s.state.design.verseId,
  };

  const undo = document.querySelector('#toast button');
  const hadUndo = !!undo;
  if (undo) undo.click();

  return {
    after,
    hadUndo,
    restored: s.state.design.verse.sizeMm,
    defaults: { size: s.DEFAULT_DESIGN().verse.sizeMm, verse: s.DEFAULT_DESIGN().verseId },
  };
});
check('reset restores every default in one click',
  resetBehaviour.after.size === resetBehaviour.defaults.size &&
    resetBehaviour.after.thickness === 1.6 &&
    resetBehaviour.after.verse === resetBehaviour.defaults.verse,
  JSON.stringify(resetBehaviour.after));
check('reset offers a working undo', resetBehaviour.hadUndo && resetBehaviour.restored === 44,
  `restored ${resetBehaviour.restored}`);

// Every font in the book must parse and outline.
const fontIssues = await page.evaluate(async () => {
  const s = window.__studio;
  const bad = [];
  for (const fam of s.fonts.families()) {
    for (const face of fam.faces) {
      try {
        const font = await s.fonts.loadFace(fam.id, face.weight, face.italic);
        const d = s.fonts.textToPath(font, 'PEACE be to this house 123', 0, 0, 10, {});
        if (!d || d.length < 40) bad.push(`${fam.id} ${face.weight}`);
      } catch (e) {
        bad.push(`${fam.id} ${face.weight}: ${e.message}`);
      }
    }
  }
  return bad;
});
check('all bundled faces outline text', fontIssues.length === 0, fontIssues.slice(0, 5).join(', '));

await browser.close();

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
