/**
 * The design document: board, layout and every element on the plaque.
 *
 * All dimensions are millimetres. Millimetres are the unit the laser thinks in,
 * so keeping the model in mm means nothing has to be converted at export time
 * and a "1.6 mm border" is 1.6 mm on the finished slate.
 */

export const MM_PER_INCH = 25.4;
export const inches = (n) => Math.round(n * MM_PER_INCH * 100) / 100;

/** Blank sizes that match slate stock people actually buy. */
export const BOARD_SIZES = [
  { id: 'coaster-4x4', label: 'Coaster — 4 × 4 in', w: inches(4), h: inches(4) },
  { id: 'mini-4x6', label: 'Mini — 4 × 6 in', w: inches(4), h: inches(6) },
  { id: 'small-5x7', label: 'Small — 5 × 7 in', w: inches(5), h: inches(7) },
  { id: 'medium-6x8', label: 'Medium — 6 × 8 in', w: inches(6), h: inches(8) },
  { id: 'plaque-8x1175', label: 'Cheeseboard plaque — 8 × 11.75 in', w: inches(8), h: inches(11.75) },
  { id: 'square-8x8', label: 'Square — 8 × 8 in', w: inches(8), h: inches(8) },
  { id: 'large-12x16', label: 'Large — 12 × 16 in', w: inches(12), h: inches(16) },
  { id: 'landscape-12x8', label: 'Landscape — 12 × 8 in', w: inches(12), h: inches(8) },
  { id: 'runner-4x12', label: 'Address bar — 4 × 12 in', w: inches(4), h: inches(12) },
  { id: 'custom', label: 'Custom…', w: 0, h: 0 },
];

export const DIVIDER_STYLES = [
  { id: 'none', label: 'None' },
  { id: 'line', label: 'Single rule' },
  { id: 'double', label: 'Double rule' },
  { id: 'tapered', label: 'Tapered rule' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'cross', label: 'Cross' },
];

/** Where a symbol can sit in the vertical stack. */
export const SYMBOL_SLOTS = [
  { id: 'top', label: 'Above everything', after: null },
  { id: 'after-eyebrow', label: 'Below the eyebrow', after: 'eyebrow' },
  { id: 'after-verse', label: 'Below the verse', after: 'verse' },
  { id: 'after-rule', label: 'Below the divider', after: 'rule' },
  { id: 'after-reference', label: 'Below the reference', after: 'reference' },
  { id: 'bottom', label: 'Below the subject word', after: 'badge' },
];

export const TRANSFORMS = [
  { id: 'none', label: 'As typed' },
  { id: 'upper', label: 'UPPERCASE' },
  { id: 'lower', label: 'lowercase' },
  { id: 'title', label: 'Title Case' },
];

export function applyTransform(text, transform) {
  const s = String(text ?? '');
  switch (transform) {
    case 'upper':
      return s.toUpperCase();
    case 'lower':
      return s.toLowerCase();
    case 'title':
      return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
    default:
      return s;
  }
}

/**
 * The starting point — a faithful rebuild of the reference plaque:
 * two-line Garamond verse, hairline rule, spaced monospace reference, and a
 * heavy grotesque subject word inside a boxed border.
 */
export const DEFAULT_DESIGN = () => ({
  version: 1,
  name: 'Peace Be To This House',
  verseId: 'luke-10-5',
  translation: 'kjv',

  board: {
    sizeId: 'plaque-8x1175',
    widthMm: inches(8),
    heightMm: inches(11.75),
    edge: 'natural', // preview only: natural | rounded | square
    cornerRadiusMm: 5,
    margin: { top: 20, right: 16, bottom: 20, left: 16 },
  },

  layout: { anchor: 'custom', topMm: 55 },

  frame: { on: false, insetMm: 8, thicknessMm: 1.2, radiusMm: 0, style: 'single', gapMm: 2.5 },

  symbol: {
    on: false,
    id: 'cross-latin',
    sizeMm: 22,
    slot: 'top', // where it sits in the stack — see SYMBOL_SLOTS
    gapBefore: 0,
    gapAfter: 12,
  },

  eyebrow: {
    on: false,
    text: 'THE ROBERTS FAMILY',
    font: 'jetbrains-mono', weight: 400, italic: false,
    sizeMm: 4, tracking: 0.3, transform: 'upper', gapAfter: 12,
  },

  verse: {
    on: true,
    text: '', // empty -> taken from the selected verse
    font: 'eb-garamond', weight: 400, italic: false,
    sizeMm: 18, lineHeight: 1.55, tracking: 0, transform: 'none',
    align: 'center', maxWidthPct: 86, gapAfter: 16,
  },

  rule: { on: true, style: 'line', widthMm: 44, thicknessMm: 0.8, gapAfter: 15 },

  reference: {
    on: true,
    text: '',
    font: 'jetbrains-mono', weight: 400, italic: false,
    sizeMm: 5, tracking: 0.3, transform: 'upper', gapAfter: 34,
  },

  badge: {
    on: true,
    text: '',
    font: 'archivo-black', weight: 400, italic: false,
    sizeMm: 17, tracking: 0.02, transform: 'upper',
    box: {
      on: true,
      mode: 'hug', // hug | fixed | full
      widthMm: 120,
      thicknessMm: 1.6,
      radiusMm: 0,
      padXMm: 10,
      padYMm: 8,
      render: 'fill', // fill (ring) | stroke
    },
  },

  footer: {
    on: false,
    text: '',
    font: 'eb-garamond', weight: 400, italic: false,
    sizeMm: 4.5, tracking: 0.1, transform: 'none', fromBottomMm: 14,
  },

  output: {
    engrave: '#111111',
    boardOutline: 'none', // none | score | cut
    outlineColor: '#ff0000',
  },
});

/** Deep clone that is good enough for plain design documents. */
export const clone = (o) => JSON.parse(JSON.stringify(o));

/** Recursively fill in anything a saved design predates. */
export function withDefaults(design) {
  const merge = (base, over) => {
    if (Array.isArray(base) || base === null || typeof base !== 'object') {
      return over === undefined ? base : over;
    }
    const out = { ...base };
    for (const key of Object.keys(base)) {
      out[key] = merge(base[key], over ? over[key] : undefined);
    }
    // Preserve keys the caller added that defaults do not know about.
    if (over) for (const key of Object.keys(over)) if (!(key in out)) out[key] = over[key];
    return out;
  };
  return merge(DEFAULT_DESIGN(), design || {});
}

/** Every (font, weight, italic) triple a design needs loaded before layout. */
export function faceSpecs(design) {
  return ['eyebrow', 'verse', 'reference', 'badge', 'footer']
    .filter((k) => design[k] && design[k].on)
    .map((k) => ({ font: design[k].font, weight: design[k].weight, italic: !!design[k].italic }));
}

/**
 * Text actually rendered for an element. Elements left blank inherit from the
 * chosen verse, so switching verses updates the whole plaque at once, while a
 * typed-in value always wins.
 */
export function resolveText(design, key, verse) {
  const el = design[key] || {};
  const typed = (el.text || '').trim();
  if (typed) return applyTransform(typed, el.transform);

  let inherited = '';
  if (verse) {
    if (key === 'verse') inherited = (design.translation === 'web' && verse.web) || verse.text;
    else if (key === 'reference') inherited = verse.ref;
    else if (key === 'badge') inherited = verse.word;
  }
  return applyTransform(inherited, el.transform);
}
