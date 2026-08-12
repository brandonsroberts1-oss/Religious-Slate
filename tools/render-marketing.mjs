#!/usr/bin/env node
/**
 * Renders the marketing images in marketing/.
 *
 * The scenes are driven through the real editor modules — same layout engine,
 * same font outlines, same geometry the exporter writes — so a listing photo
 * cannot show a plaque the machine would not produce.
 *
 *   node tools/serve.mjs & node tools/render-marketing.mjs
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'marketing');
const BASE = process.env.BASE || 'http://localhost:4173';
const SCALE = Number(process.env.SCALE || 2);

/** 4:5 is the portrait ratio marketplaces and Instagram both favour. */
const PORTRAIT = { width: 1200, height: 1500 };
const SQUARE = { width: 1400, height: 1400 };
const WIDE = { width: 1800, height: 1100 };

const SCENES = [
  {
    file: 'hero-peace.jpg',
    ...PORTRAIT,
    scene: 'warm',
    fill: 0.8,
    pieces: [{ verseId: 'luke-10-5', collection: 'household', seed: 5 }],
  },
  {
    file: 'household-serve.jpg',
    ...PORTRAIT,
    scene: 'sage',
    fill: 0.8,
    pieces: [
      {
        verseId: 'joshua-24-15',
        collection: 'household',
        seed: 11,
        overrides: { verse: { sizeMm: 15 }, badge: { text: 'HOUSEHOLD' } },
      },
    ],
  },
  {
    file: 'covenant-love.jpg',
    ...PORTRAIT,
    scene: 'warm',
    fill: 0.78,
    pieces: [
      {
        verseId: '1-corinthians-13-8',
        collection: 'covenant',
        translation: 'web',
        size: 'small-5x7',
        seed: 17,
        overrides: {
          verse: { sizeMm: 15, gapAfter: 12 },
          rule: { gapAfter: 11 },
          reference: { sizeMm: 4, gapAfter: 20 },
          badge: { sizeMm: 11, box: { padYMm: 7 } },
          eyebrow: { on: true, text: 'SARAH & JAMES', sizeMm: 3.4, gapAfter: 8, font: 'cinzel' },
          footer: { on: true, text: 'xxi · vi · mmxxv', sizeMm: 3.4, fromBottomMm: 11, font: 'cormorant-garamond' },
          layout: { anchor: 'custom', topMm: 24 },
        },
      },
    ],
  },
  {
    file: 'sentinel-courage.jpg',
    ...PORTRAIT,
    scene: 'dark',
    fill: 0.8,
    pieces: [
      {
        verseId: 'joshua-1-9',
        collection: 'sentinel',
        seed: 23,
        overrides: { verse: { sizeMm: 14 }, badge: { text: 'COURAGE' } },
      },
    ],
  },
  {
    file: 'grace-be-still.jpg',
    ...PORTRAIT,
    scene: 'stone',
    fill: 0.78,
    pieces: [
      {
        verseId: 'psalm-46-10',
        collection: 'grace',
        seed: 31,
        overrides: { verse: { sizeMm: 19 }, badge: { text: 'BE STILL' } },
      },
    ],
  },
  {
    file: 'table-daily-bread.jpg',
    ...SQUARE,
    scene: 'warm',
    fill: 0.72,
    pieces: [
      {
        verseId: 'matthew-6-11',
        collection: 'table',
        size: 'landscape-12x8',
        seed: 3,
        overrides: {
          verse: { sizeMm: 21 },
          layout: { anchor: 'center' },
          reference: { gapAfter: 18 },
          badge: { sizeMm: 16 },
        },
      },
    ],
  },
  {
    file: 'pilgrim-symbol.jpg',
    ...PORTRAIT,
    scene: 'stone',
    fill: 0.8,
    pieces: [
      {
        verseId: 'psalm-119-105',
        collection: 'pilgrim',
        seed: 41,
        overrides: {
          symbol: { on: true, id: 'cross-celtic', sizeMm: 30, slot: 'top', gapAfter: 16 },
          verse: { sizeMm: 12, gapAfter: 13 },
          reference: { gapAfter: 26 },
          badge: { text: 'THE LAMP', sizeMm: 13 },
          layout: { anchor: 'custom', topMm: 38 },
        },
      },
    ],
  },
  {
    file: 'collection-lineup.jpg',
    ...WIDE,
    scene: 'warm',
    fill: 0.62,
    frameFill: 0.9,
    gapPx: 52,
    offset: '-4%',
    pieces: [
      { verseId: 'luke-10-5', collection: 'household', seed: 5, label: 'Household', sublabel: 'Luke 10:5' },
      {
        verseId: 'song-of-solomon-6-3', collection: 'covenant', seed: 9,
        label: 'Covenant', sublabel: 'Song of Solomon 6:3',
        overrides: { verse: { sizeMm: 16 }, badge: { text: 'BELOVED' } },
      },
      {
        verseId: 'psalm-18-2', collection: 'sentinel', seed: 13,
        label: 'Sentinel', sublabel: 'Psalm 18:2',
        overrides: { verse: { sizeMm: 13 }, badge: { text: 'FORTRESS' } },
      },
      {
        verseId: 'colossians-3-23', collection: 'cornerstone', seed: 21,
        label: 'Cornerstone', sublabel: 'Colossians 3:23',
        overrides: { verse: { sizeMm: 12 }, badge: { text: 'HEARTILY' } },
      },
    ],
  },
  {
    file: 'sizes-lineup.jpg',
    ...WIDE,
    scene: 'stone',
    fill: 0.68,
    frameFill: 0.88,
    gapPx: 56,
    offset: '-4%',
    pieces: [
      {
        verseId: 'numbers-6-24', collection: 'household', size: 'coaster-4x4', seed: 2,
        label: '4 × 4″', sublabel: 'Coaster',
        overrides: { verse: { sizeMm: 8, gapAfter: 6 }, rule: { widthMm: 22, gapAfter: 6 }, reference: { sizeMm: 2.8, gapAfter: 9 }, badge: { sizeMm: 7, box: { padXMm: 5, padYMm: 4, thicknessMm: 0.8 } }, layout: { anchor: 'center' }, board: { margin: { top: 8, bottom: 8, left: 7, right: 7 } } },
      },
      {
        verseId: 'psalm-4-8', collection: 'household', size: 'small-5x7', seed: 6,
        label: '5 × 7″', sublabel: 'Small',
        overrides: { verse: { sizeMm: 12, gapAfter: 10 }, rule: { widthMm: 30, gapAfter: 9 }, reference: { sizeMm: 3.6, gapAfter: 18 }, badge: { sizeMm: 11, box: { padXMm: 7, padYMm: 5.5, thicknessMm: 1.1 } }, layout: { anchor: 'center' } },
      },
      {
        verseId: 'luke-10-5', collection: 'household', size: 'plaque-8x1175', seed: 5,
        label: '8 × 11.75″', sublabel: 'Signature plaque',
      },
      {
        verseId: 'joshua-24-15', collection: 'household', size: 'large-12x16', seed: 15,
        label: '12 × 16″', sublabel: 'Statement',
        overrides: { verse: { sizeMm: 24, gapAfter: 22 }, rule: { widthMm: 66, thicknessMm: 1.1, gapAfter: 20 }, reference: { sizeMm: 7, gapAfter: 46 }, badge: { sizeMm: 24, text: 'HOUSEHOLD', box: { padXMm: 14, padYMm: 11, thicknessMm: 2.2 } }, layout: { anchor: 'center' } },
      },
    ],
  },
];

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: SCALE });
  const page = await context.newPage();

  const problems = [];
  page.on('pageerror', (e) => problems.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));

  await page.goto(`${BASE}/tools/marketing.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__sceneReady, null, { timeout: 30000 });

  for (const scene of SCENES) {
    await page.setViewportSize({ width: scene.width, height: scene.height });
    const warnings = await page.evaluate((cfg) => window.renderScene(cfg), scene);
    await page.waitForTimeout(260);

    if (warnings.length) {
      problems.push(`${scene.file}: ${warnings.join(' | ')}`);
      console.log(`✗ ${scene.file} — ${warnings.join(' | ')}`);
      continue;
    }

    const target = path.join(OUT, scene.file);
    await page.locator('#scene').screenshot({ path: target, type: 'jpeg', quality: 92 });
    console.log(`✓ ${scene.file}  ${scene.width}×${scene.height} @${SCALE}x`);
  }

  // The symbol library, as a sheet usable for listing dropdowns and proofs.
  await page.setViewportSize({ width: 1500, height: 1200 });
  await page.goto(`${BASE}/tools/symbol-sheet.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__sheetReady, null, { timeout: 20000 });
  await page.waitForTimeout(200);
  await page.locator('#sheet').screenshot({
    path: path.join(OUT, 'symbol-library.jpg'),
    type: 'jpeg',
    quality: 92,
  });
  console.log(`✓ symbol-library.jpg  @${SCALE}x`);

  await browser.close();

  if (problems.length) {
    console.error(`\n${problems.length} page error(s):`);
    for (const p of problems.slice(0, 5)) console.error(`  ${p}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
