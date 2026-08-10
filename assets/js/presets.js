/**
 * Product collections.
 *
 * A collection is a house style plus the slice of the verse library it suits.
 * Each one is a saleable line: same blank, same machine settings, different
 * typographic voice. `style` is a partial design merged over the current
 * document, so applying a collection never disturbs the board size, margins or
 * personalisation the operator has already set.
 */

export const COLLECTIONS = [
  {
    id: 'household',
    name: 'The Household Collection',
    tagline: 'Blessings for the door, the hall and the hearth.',
    blurb:
      'The signature line. A quiet Garamond verse over a hairline rule, the reference set in spaced monospace, ' +
      'and the subject word squared off in a heavy border. Reads as calm rather than decorative — the reason it ' +
      'suits an entryway.',
    sizes: ['plaque-8x1175', 'medium-6x8', 'small-5x7'],
    style: {
      verse: { font: 'eb-garamond', weight: 400, italic: false, sizeMm: 18, lineHeight: 1.55, tracking: 0, transform: 'none' },
      rule: { on: true, style: 'line', widthMm: 44, thicknessMm: 0.8, gapAfter: 15 },
      reference: { font: 'jetbrains-mono', weight: 400, sizeMm: 5, tracking: 0.3, transform: 'upper', gapAfter: 34 },
      badge: {
        font: 'archivo-black', weight: 400, sizeMm: 17, tracking: 0.02, transform: 'upper',
        box: { on: true, mode: 'hug', thicknessMm: 1.6, radiusMm: 0, padXMm: 10, padYMm: 8, render: 'fill' },
      },
      frame: { on: false },
    },
  },

  {
    id: 'covenant',
    name: 'The Covenant Collection',
    tagline: 'Weddings, anniversaries, vows kept.',
    blurb:
      'High-contrast Cormorant in italic over a tapered rule, with the reference in Roman capitals. The box is ' +
      'drawn fine and gently radiused so it frames the word without shouting. Built for gift wrapping.',
    sizes: ['small-5x7', 'medium-6x8', 'plaque-8x1175'],
    style: {
      verse: { font: 'cormorant-garamond', weight: 400, italic: true, sizeMm: 20, lineHeight: 1.4, tracking: 0.01, transform: 'none' },
      rule: { on: true, style: 'tapered', widthMm: 52, thicknessMm: 1.1, gapAfter: 13 },
      reference: { font: 'cinzel', weight: 400, sizeMm: 4.6, tracking: 0.34, transform: 'upper', gapAfter: 30 },
      badge: {
        font: 'league-spartan', weight: 700, sizeMm: 13, tracking: 0.16, transform: 'upper',
        box: { on: true, mode: 'hug', thicknessMm: 0.7, radiusMm: 3, padXMm: 12, padYMm: 8, render: 'fill' },
      },
      frame: { on: false },
    },
  },

  {
    id: 'sentinel',
    name: 'The Sentinel Collection',
    tagline: 'Strength, courage, and the people who need it named.',
    blurb:
      'Condensed capitals, tight leading and a border heavy enough to read across a workshop. Sells to men who ' +
      'would not buy a decorative plaque, and to anyone marking a deployment, a promotion or a hard year.',
    sizes: ['medium-6x8', 'plaque-8x1175', 'large-12x16'],
    style: {
      verse: { font: 'oswald', weight: 500, italic: false, sizeMm: 15, lineHeight: 1.3, tracking: 0.02, transform: 'upper' },
      rule: { on: true, style: 'line', widthMm: 70, thicknessMm: 1.8, gapAfter: 13 },
      reference: { font: 'barlow-condensed', weight: 600, sizeMm: 5.2, tracking: 0.3, transform: 'upper', gapAfter: 28 },
      badge: {
        font: 'anton', weight: 400, sizeMm: 20, tracking: 0.04, transform: 'upper',
        box: { on: true, mode: 'full', thicknessMm: 2.4, radiusMm: 0, padXMm: 8, padYMm: 9, render: 'fill' },
      },
      frame: { on: false },
    },
  },

  {
    id: 'grace',
    name: 'The Grace Collection',
    tagline: 'Comfort, remembrance, and words for hard days.',
    blurb:
      'The softest line in the range: light Cormorant, a diamond divider, and the subject word set in Roman ' +
      'capitals with no box at all. Intended for sympathy and memorial orders, where a heavy border reads wrong.',
    sizes: ['small-5x7', 'medium-6x8', 'plaque-8x1175'],
    style: {
      verse: { font: 'cormorant-garamond', weight: 300, italic: false, sizeMm: 19, lineHeight: 1.5, tracking: 0.01, transform: 'none' },
      rule: { on: true, style: 'diamond', widthMm: 54, thicknessMm: 0.6, gapAfter: 14 },
      reference: { font: 'cormorant-garamond', weight: 500, sizeMm: 5, tracking: 0.26, transform: 'upper', gapAfter: 30 },
      badge: {
        font: 'cinzel', weight: 600, sizeMm: 12, tracking: 0.2, transform: 'upper',
        box: { on: false, mode: 'hug', thicknessMm: 0.6, radiusMm: 0, padXMm: 10, padYMm: 7, render: 'fill' },
      },
      frame: { on: false },
    },
  },

  {
    id: 'cornerstone',
    name: 'The Cornerstone Collection',
    tagline: 'Offices, workshops, and businesses built on something.',
    blurb:
      'Contemporary grotesque throughout, inside a ruled border. The only line that frames the whole board, which ' +
      'is what makes it read as signage rather than décor. Corporate gifting and trade-show orders live here.',
    sizes: ['medium-6x8', 'square-8x8', 'plaque-8x1175'],
    style: {
      verse: { font: 'inter', weight: 400, italic: false, sizeMm: 14, lineHeight: 1.45, tracking: 0, transform: 'none' },
      rule: { on: true, style: 'line', widthMm: 30, thicknessMm: 1.2, gapAfter: 12 },
      reference: { font: 'ibm-plex-mono', weight: 500, sizeMm: 4.4, tracking: 0.28, transform: 'upper', gapAfter: 26 },
      badge: {
        font: 'inter', weight: 900, sizeMm: 13, tracking: 0.06, transform: 'upper',
        box: { on: true, mode: 'fixed', widthMm: 130, thicknessMm: 1.2, radiusMm: 1.5, padXMm: 10, padYMm: 8, render: 'fill' },
      },
      frame: { on: true, insetMm: 9, thicknessMm: 0.9, radiusMm: 2, style: 'double', gapMm: 2.2 },
    },
  },

  {
    id: 'table',
    name: 'The Table Collection',
    tagline: 'Kitchens, dining rooms, and grace before meals.',
    blurb:
      'Playfair with a cross divider and a Bebas subject word. Works especially well on the landscape blanks and ' +
      'on coasters, where the verse drops to a single line.',
    sizes: ['landscape-12x8', 'medium-6x8', 'coaster-4x4'],
    style: {
      verse: { font: 'playfair-display', weight: 400, italic: false, sizeMm: 17, lineHeight: 1.4, tracking: 0, transform: 'none' },
      rule: { on: true, style: 'cross', widthMm: 48, thicknessMm: 0.9, gapAfter: 13 },
      reference: { font: 'space-mono', weight: 400, sizeMm: 4.6, tracking: 0.26, transform: 'upper', gapAfter: 26 },
      badge: {
        font: 'bebas-neue', weight: 400, sizeMm: 18, tracking: 0.12, transform: 'upper',
        box: { on: true, mode: 'hug', thicknessMm: 1.1, radiusMm: 0, padXMm: 11, padYMm: 6, render: 'fill' },
      },
      frame: { on: false },
    },
  },

  {
    id: 'nursery',
    name: 'The Nursery Collection',
    tagline: 'Births, baptisms, dedications and first bedrooms.',
    blurb:
      'Soft infant serif, a rounded box and generous padding. The eyebrow line is switched on by default because ' +
      'nursery orders are nearly always personalised with a name and a date.',
    sizes: ['small-5x7', 'mini-4x6', 'medium-6x8'],
    style: {
      eyebrow: { on: true, font: 'cormorant-infant', weight: 400, sizeMm: 5, tracking: 0.24, transform: 'upper', gapAfter: 11 },
      verse: { font: 'cormorant-infant', weight: 400, italic: false, sizeMm: 18, lineHeight: 1.45, tracking: 0, transform: 'none' },
      rule: { on: true, style: 'diamond', widthMm: 40, thicknessMm: 0.55, gapAfter: 12 },
      reference: { font: 'montserrat', weight: 400, sizeMm: 4.2, tracking: 0.3, transform: 'upper', gapAfter: 24 },
      badge: {
        font: 'montserrat', weight: 700, sizeMm: 11, tracking: 0.14, transform: 'upper',
        box: { on: true, mode: 'hug', thicknessMm: 0.8, radiusMm: 5, padXMm: 11, padYMm: 7, render: 'fill' },
      },
      frame: { on: false },
    },
  },

  {
    id: 'pilgrim',
    name: 'The Pilgrim Collection',
    tagline: 'Trust, guidance and the long walk.',
    blurb:
      'Roman inscriptional capitals throughout — the closest thing in the range to carved stone. Slow to read, ' +
      'which is the point. Best on the larger blanks where the letterspacing has room.',
    sizes: ['plaque-8x1175', 'large-12x16', 'medium-6x8'],
    style: {
      verse: { font: 'cinzel', weight: 400, italic: false, sizeMm: 13, lineHeight: 1.7, tracking: 0.06, transform: 'upper' },
      rule: { on: true, style: 'double', widthMm: 58, thicknessMm: 0.6, gapAfter: 14 },
      reference: { font: 'marcellus', weight: 400, sizeMm: 5, tracking: 0.3, transform: 'upper', gapAfter: 30 },
      badge: {
        font: 'forum', weight: 400, sizeMm: 16, tracking: 0.22, transform: 'upper',
        box: { on: true, mode: 'hug', thicknessMm: 0.9, radiusMm: 0, padXMm: 13, padYMm: 9, render: 'fill' },
      },
      frame: { on: false },
    },
  },
];

export const collection = (id) => COLLECTIONS.find((c) => c.id === id) || COLLECTIONS[0];

/** Merge a collection's style over a design without touching board or content. */
export function applyCollection(design, id) {
  const style = collection(id).style;
  const next = structuredClone(design);
  for (const [key, patch] of Object.entries(style)) {
    if (!next[key]) next[key] = {};
    for (const [prop, value] of Object.entries(patch)) {
      if (prop === 'box') next[key].box = { ...next[key].box, ...value };
      else next[key][prop] = value;
    }
  }
  return next;
}
