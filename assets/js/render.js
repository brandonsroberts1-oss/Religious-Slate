/**
 * Layout and SVG generation.
 *
 * `layout()` turns a design document into a flat list of geometry in
 * millimetres. `toSvg()` paints that same geometry either as an on-screen
 * slate preview or as a laser-ready export. Because both outputs consume one
 * layout, what the operator approves on screen is what the machine cuts —
 * there is no second, "export-only" typesetting pass to drift out of sync.
 */

import * as F from './fonts.js';
import { rectRing, roundedRect, divider, frame as framePath, bar } from './shapes.js';
import { applyTransform, resolveText } from './model.js';

const round = (n) => Math.round(n * 1000) / 1000;
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * Build the geometry for a design.
 *
 * Returns { ops, board, warnings }. Each op is
 * `{ id, kind: 'fill' | 'stroke', d, rule?, width? }` in board millimetres.
 * Fonts for every enabled element must already be parsed — call
 * `fonts.preload(faceSpecs(design))` first.
 */
export function layout(design, verse) {
  const { board } = design;
  const W = board.widthMm;
  const H = board.heightMm;
  const m = board.margin;
  const x0 = m.left;
  const x1 = W - m.right;
  const contentW = Math.max(1, x1 - x0);
  const cx = (x0 + x1) / 2;

  const ops = [];
  const warnings = [];

  const face = (el) => F.peekFace(el.font, el.weight, el.italic);

  // ── Measure each block ───────────────────────────────────────────────────
  // A block's height runs from cap-top to baseline, so the gaps below are
  // measured the way a typographer sets them: baseline to the next cap line.
  const blocks = [];

  const pushTextBlock = (key, { align } = {}) => {
    const el = design[key];
    if (!el || !el.on) return;
    const font = face(el);
    const text = resolveText(design, key, verse);
    if (!font || !text) {
      if (!font) warnings.push(`${key}: font not loaded`);
      return;
    }
    const cap = F.capHeight(font, el.sizeMm);
    blocks.push({
      key,
      height: cap,
      gapAfter: el.gapAfter || 0,
      draw(top) {
        ops.push({
          id: key,
          kind: 'fill',
          rule: 'nonzero',
          d: F.textToPath(font, text, anchorX(align || el.align || 'center'), top + cap, el.sizeMm, {
            tracking: el.tracking,
            align: align || el.align || 'center',
          }),
        });
      },
    });
  };

  const anchorX = (align) => (align === 'left' ? x0 : align === 'right' ? x1 : cx);

  // Eyebrow
  pushTextBlock('eyebrow');

  // Verse — wrapped to the content width
  const verseEl = design.verse;
  if (verseEl.on) {
    const font = face(verseEl);
    const text = resolveText(design, 'verse', verse);
    if (font && text) {
      const maxWidth = (contentW * (verseEl.maxWidthPct || 100)) / 100;
      const lines = F.wrapText(font, text, verseEl.sizeMm, verseEl.tracking, maxWidth);
      const cap = F.capHeight(font, verseEl.sizeMm);
      const step = verseEl.lineHeight * verseEl.sizeMm;

      const overflow = lines.filter((l) => F.measureText(font, l, verseEl.sizeMm, verseEl.tracking) > maxWidth + 0.01);
      if (overflow.length) warnings.push(`Verse does not fit the content width — "${overflow[0]}" runs over.`);

      blocks.push({
        key: 'verse',
        height: cap + step * (lines.length - 1),
        gapAfter: verseEl.gapAfter || 0,
        draw(top) {
          const align = verseEl.align || 'center';
          const d = lines
            .map((line, i) =>
              F.textToPath(font, line, anchorX(align), top + cap + i * step, verseEl.sizeMm, {
                tracking: verseEl.tracking,
                align,
              }),
            )
            .filter(Boolean)
            .join(' ');
          ops.push({ id: 'verse', kind: 'fill', rule: 'nonzero', d });
        },
      });
    } else if (!font) {
      warnings.push('verse: font not loaded');
    }
  }

  // Divider rule
  const ruleEl = design.rule;
  if (ruleEl.on && ruleEl.style !== 'none') {
    const width = Math.min(ruleEl.widthMm, contentW);
    const probe = divider(ruleEl.style, cx, 0, width, ruleEl.thicknessMm);
    blocks.push({
      key: 'rule',
      height: probe.height,
      gapAfter: ruleEl.gapAfter || 0,
      draw(top) {
        const { d } = divider(ruleEl.style, cx, top, width, ruleEl.thicknessMm);
        if (d) ops.push({ id: 'rule', kind: 'fill', rule: 'nonzero', d });
      },
    });
  }

  // Chapter-and-verse line
  pushTextBlock('reference');

  // Badge: subject word, optionally boxed
  const badge = design.badge;
  if (badge.on) {
    const font = face(badge);
    const text = resolveText(design, 'badge', verse);
    if (font && text) {
      const cap = F.capHeight(font, badge.sizeMm);
      const textW = F.measureText(font, text, badge.sizeMm, badge.tracking);
      const box = badge.box;

      let boxW = 0;
      if (box.on) {
        if (box.mode === 'full') boxW = contentW;
        else if (box.mode === 'fixed') boxW = Math.min(box.widthMm, contentW);
        else boxW = textW + 2 * box.padXMm;
        if (boxW > contentW) {
          warnings.push('Badge box is wider than the content area — reduce the word size or padding.');
          boxW = contentW;
        }
      }
      const boxH = box.on ? cap + 2 * box.padYMm : cap;

      blocks.push({
        key: 'badge',
        height: boxH,
        gapAfter: 0,
        draw(top) {
          if (box.on) {
            const bx = cx - boxW / 2;
            if (box.render === 'stroke') {
              // Stroke sits centred on the path, so inset by half the width to
              // keep the outside edge where the operator placed it.
              const h = box.thicknessMm / 2;
              ops.push({
                id: 'badge-box',
                kind: 'stroke',
                width: box.thicknessMm,
                d: roundedRect(bx + h, top + h, boxW - box.thicknessMm, boxH - box.thicknessMm, Math.max(0, box.radiusMm - h)),
              });
            } else {
              ops.push({
                id: 'badge-box',
                kind: 'fill',
                rule: 'evenodd',
                d: rectRing(bx, top, boxW, boxH, box.thicknessMm, box.radiusMm),
              });
            }
          }
          const baseline = top + (box.on ? box.padYMm : 0) + cap;
          ops.push({
            id: 'badge-word',
            kind: 'fill',
            rule: 'nonzero',
            d: F.textToPath(font, text, cx, baseline, badge.sizeMm, { tracking: badge.tracking, align: 'center' }),
          });
        },
      });

      if (box.on && textW + 2 * box.padXMm > boxW + 0.01) {
        warnings.push('Subject word is wider than its box.');
      }
    } else if (!font) {
      warnings.push('badge: font not loaded');
    }
  }

  // ── Stack the blocks ─────────────────────────────────────────────────────
  const stackHeight = blocks.reduce(
    (sum, b, i) => sum + b.height + (i < blocks.length - 1 ? b.gapAfter : 0),
    0,
  );

  const availTop = m.top;
  const availH = H - m.top - m.bottom;
  let y;
  switch (design.layout.anchor) {
    case 'top':
      y = availTop;
      break;
    case 'center':
      y = availTop + (availH - stackHeight) / 2;
      break;
    case 'bottom':
      y = availTop + availH - stackHeight;
      break;
    default:
      y = design.layout.topMm;
  }

  const stackTop = y;
  for (let i = 0; i < blocks.length; i++) {
    blocks[i].draw(y);
    y += blocks[i].height + blocks[i].gapAfter;
  }
  const stackBottom = y - (blocks.length ? blocks[blocks.length - 1].gapAfter : 0);

  if (stackTop < m.top - 0.01) warnings.push('Content starts above the top margin.');
  if (stackBottom > H - m.bottom + 0.01) warnings.push('Content runs past the bottom margin.');

  // Footer is positioned from the bottom edge, independent of the stack.
  const footer = design.footer;
  if (footer.on) {
    const font = face(footer);
    const text = resolveText(design, 'footer', verse);
    if (font && text) {
      // Being anchored to the bottom is exactly why the footer can drift under
      // the stack as the verse grows — worth saying out loud rather than
      // leaving to be spotted on the finished stone.
      const footerTop = H - footer.fromBottomMm - F.capHeight(font, footer.sizeMm);
      if (footerTop < stackBottom) {
        warnings.push('Footer line overlaps the content above it.');
      }
      ops.push({
        id: 'footer',
        kind: 'fill',
        rule: 'nonzero',
        d: F.textToPath(font, text, cx, H - footer.fromBottomMm, footer.sizeMm, {
          tracking: footer.tracking,
          align: 'center',
        }),
      });
    }
  }

  // Border frame
  const fr = design.frame;
  if (fr.on) {
    const d = framePath(
      fr.insetMm,
      fr.insetMm,
      W - 2 * fr.insetMm,
      H - 2 * fr.insetMm,
      fr.thicknessMm,
      fr.radiusMm,
      fr.style,
      fr.gapMm,
    );
    ops.unshift({ id: 'frame', kind: 'fill', rule: 'evenodd', d });
  }

  return {
    ops: ops.filter((o) => o.d),
    board: { W, H, x0, x1, cx, contentW },
    metrics: { stackTop, stackBottom, stackHeight },
    warnings,
  };
}

// ── SVG output ─────────────────────────────────────────────────────────────

function opsToMarkup(ops, color, prefix = '') {
  return ops
    .map((op) => {
      const id = prefix ? `${op.id}-${prefix}` : op.id;
      if (op.kind === 'stroke') {
        return (
          `<path id="${id}" d="${op.d}" fill="none" stroke="${color}" ` +
          `stroke-width="${round(op.width)}" stroke-linejoin="miter"/>`
        );
      }
      return `<path id="${id}" d="${op.d}" fill="${color}" fill-rule="${op.rule || 'nonzero'}"/>`;
    })
    .join('\n    ');
}

/**
 * Laser-ready SVG.
 *
 * Written for importers like xTool Creative Space:
 *  - physical width/height in mm with a 1:1 viewBox, so it lands at true size;
 *  - every glyph already an outline, so nothing depends on fonts being
 *    installed on the machine driving the laser;
 *  - presentation attributes only — no <style> block, no CSS classes;
 *  - absolute coordinates, no transforms to be re-interpreted;
 *  - filled areas for engraving, kept apart from any stroked cut line.
 */
export function toExportSvg(design, verse, { includeMetadata = true } = {}) {
  const { ops, board } = layout(design, verse);
  const color = design.output.engrave || '#000000';

  const engrave = opsToMarkup(ops, color);

  let outline = '';
  if (design.output.boardOutline !== 'none') {
    const d = roundedRect(
      0,
      0,
      board.W,
      board.H,
      design.board.edge === 'square' ? 0 : design.board.cornerRadiusMm,
    );
    outline =
      `\n  <g id="${design.output.boardOutline === 'cut' ? 'cut' : 'score'}">` +
      `\n    <path id="board-outline" d="${d}" fill="none" ` +
      `stroke="${design.output.outlineColor}" stroke-width="0.1"/>\n  </g>`;
  }

  const meta = includeMetadata
    ? `\n  <title>${esc(design.name || 'Slate plaque')}</title>` +
      `\n  <desc>${esc(
        `${verse ? `${verse.ref} (${design.translation.toUpperCase()})` : 'custom text'} — ` +
          `${round(board.W)} x ${round(board.H)} mm`,
      )}</desc>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
  width="${round(board.W)}mm" height="${round(board.H)}mm"
  viewBox="0 0 ${round(board.W)} ${round(board.H)}">${meta}
  <g id="engrave">
    ${engrave}
  </g>${outline}
</svg>
`;
}

/**
 * On-screen preview: identical geometry, painted to look like engraved slate.
 * The texture is procedural so the preview stays self-contained.
 */
let previewSerial = 0;

export function toPreviewSvg(design, verse, { showGuides = false, seed = 7, idPrefix } = {}) {
  const { ops, board, metrics } = layout(design, verse);
  const { W, H } = board;
  const engraved = '#d8d2c6';

  // Every clipPath, filter and gradient below is namespaced. SVG ids share one
  // document-wide namespace, so two previews on the same page would otherwise
  // both resolve url(#board-clip) to whichever appeared first — silently
  // clipping one board to the other's outline.
  const ns = idPrefix || `sp${++previewSerial}`;
  const id = (name) => `${name}-${ns}`;
  const ref = (name) => `url(#${id(name)})`;

  const edge =
    design.board.edge === 'natural'
      ? naturalEdgePath(W, H, seed)
      : roundedRect(0, 0, W, H, design.board.edge === 'square' ? 0 : design.board.cornerRadiusMm);

  const guides = showGuides
    ? `<g id="${id('guides')}" fill="none" stroke="#7fd4ff" stroke-width="0.25" stroke-dasharray="1.6 1.6" opacity="0.75">
        <rect x="${round(design.board.margin.left)}" y="${round(design.board.margin.top)}"
              width="${round(W - design.board.margin.left - design.board.margin.right)}"
              height="${round(H - design.board.margin.top - design.board.margin.bottom)}"/>
        <line x1="${round(W / 2)}" y1="0" x2="${round(W / 2)}" y2="${round(H)}" opacity="0.5"/>
        <line x1="0" y1="${round(metrics.stackTop)}" x2="${round(W)}" y2="${round(metrics.stackTop)}" stroke="#ffb454"/>
        <line x1="0" y1="${round(metrics.stackBottom)}" x2="${round(W)}" y2="${round(metrics.stackBottom)}" stroke="#ffb454"/>
      </g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(W)} ${round(H)}"
  width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <defs>
    <clipPath id="${id('board-clip')}"><path d="${edge}"/></clipPath>

    <filter id="${id('slate-grain')}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 1.4" numOctaves="4" seed="${seed}" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.7"/></feComponentTransfer>
    </filter>

    <!-- Coarse mottling: the cloudy light and dark patches in riven slate,
         at a much larger scale than the surface grain. -->
    <filter id="${id('slate-mottle')}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.02" numOctaves="3" seed="${seed + 11}" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
    </filter>

    <filter id="${id('slate-cleave')}" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="3" seed="${seed + 3}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/>
    </filter>

    <linearGradient id="${id('slate-face')}" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#54585c"/>
      <stop offset="30%" stop-color="#383c40"/>
      <stop offset="70%" stop-color="#26292d"/>
      <stop offset="100%" stop-color="#191b1e"/>
    </linearGradient>

    <radialGradient id="${id('slate-sheen')}" cx="0.42" cy="0.08" r="0.95">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.17"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.34"/>
    </radialGradient>
  </defs>

  <g clip-path="${ref('board-clip')}">
    <rect width="${round(W)}" height="${round(H)}" fill="${ref('slate-face')}"/>
    <g filter="${ref('slate-cleave')}" opacity="0.5">
      <rect width="${round(W)}" height="${round(H)}" fill="${ref('slate-face')}"/>
    </g>
    <rect width="${round(W)}" height="${round(H)}" filter="${ref('slate-mottle')}" opacity="0.32"
          style="mix-blend-mode:soft-light"/>
    <rect width="${round(W)}" height="${round(H)}" filter="${ref('slate-grain')}" opacity="0.34"
          style="mix-blend-mode:overlay"/>
    <rect width="${round(W)}" height="${round(H)}" fill="${ref('slate-sheen')}"/>

    <g id="${id('engraving')}">
      <g opacity="0.55" transform="translate(0.18 0.18)">
        ${opsToMarkup(ops, '#0d0f11', `shadow-${ns}`)}
      </g>
      ${opsToMarkup(ops, engraved, ns)}
    </g>
    ${guides}
  </g>
  <path d="${edge}" fill="none" stroke="#12141600" stroke-width="0.4"/>
</svg>`;
}

/**
 * "Flat view" — the geometry with the stone taken away. This is what the laser
 * actually sees, and it is the honest check on whether a hairline rule or a
 * thin box wall survived the size the operator chose.
 */
export function toFlatSvg(design, verse, { showGuides = false } = {}) {
  const { ops, board, metrics } = layout(design, verse);
  const { W, H } = board;
  const m = design.board.margin;

  const guides = showGuides
    ? `<g fill="none" stroke="#2f9fd0" stroke-width="0.25" stroke-dasharray="1.6 1.6" opacity="0.9">
        <rect x="${round(m.left)}" y="${round(m.top)}" width="${round(W - m.left - m.right)}"
              height="${round(H - m.top - m.bottom)}"/>
        <line x1="${round(W / 2)}" y1="0" x2="${round(W / 2)}" y2="${round(H)}" opacity="0.5"/>
        <line x1="0" y1="${round(metrics.stackTop)}" x2="${round(W)}" y2="${round(metrics.stackTop)}" stroke="#e08a2f"/>
        <line x1="0" y1="${round(metrics.stackBottom)}" x2="${round(W)}" y2="${round(metrics.stackBottom)}" stroke="#e08a2f"/>
      </g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(W)} ${round(H)}"
  width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <rect width="${round(W)}" height="${round(H)}" fill="#ffffff"/>
  <g>${opsToMarkup(ops, '#111111')}</g>
  ${guides}
  <rect x="0.1" y="0.1" width="${round(W - 0.2)}" height="${round(H - 0.2)}"
        fill="none" stroke="#c9ccd2" stroke-width="0.2"/>
</svg>`;
}

/**
 * A chipped, split-stone outline like a real slate blank. Deterministic for a
 * given seed so the preview does not shimmer on every keystroke.
 */
function naturalEdgePath(W, H, seed) {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);

  /**
   * Value noise rather than per-step randomness. Independent jitter at every
   * step gives a sawtooth that reads as torn paper; interpolating between a few
   * control points gives the long shallow undulations with occasional bites out
   * of them that split stone actually has.
   */
  const noise = (steps, points, amp, bias) => {
    const ctrl = Array.from({ length: points + 1 }, () => (rnd() - 0.5) * 2);
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * points;
      const i0 = Math.floor(t);
      const f = t - i0;
      const smooth = f * f * (3 - 2 * f);
      const v = ctrl[i0] * (1 - smooth) + ctrl[Math.min(i0 + 1, points)] * smooth;
      // Occasional chip: a single step pulled past the base amplitude.
      const chip = rnd() > 0.96 ? (rnd() - 0.5) * amp * 1.1 : 0;
      out.push(v * amp + chip + bias);
    }
    return out;
  };

  const run = (from, to, steps, axis, base, amp, bias = 0) => {
    const n = noise(steps, Math.max(2, Math.round(steps / 3)), amp, bias);
    const pts = [];
    for (let i = 1; i <= steps; i++) {
      const v = from + (to - from) * (i / steps);
      const off = n[i];
      pts.push(axis === 'x' ? `L${round(v)} ${round(base + off)}` : `L${round(base + off)} ${round(v)}`);
    }
    return pts.join(' ');
  };

  // Sides of a slate blank are sawn and nearly straight; the top and bottom are
  // split along the cleavage plane and carry the irregularity.
  const inset = Math.min(W, H) * 0.012;
  const r = Math.min(W, H) * 0.02;
  const sideAmp = W * 0.004;
  const splitAmp = W * 0.016;

  return [
    `M${round(r)} ${round(inset)}`,
    run(r, W - r, 22, 'x', inset, splitAmp, splitAmp * 0.15),
    `Q${round(W - inset * 0.3)} ${round(inset)} ${round(W - inset)} ${round(r)}`,
    run(r, H - r, 14, 'y', W - inset, sideAmp),
    `Q${round(W - inset * 0.3)} ${round(H - inset)} ${round(W - r)} ${round(H - inset)}`,
    run(W - r, r, 20, 'x', H - inset, splitAmp * 0.7, -splitAmp * 0.12),
    `Q${round(inset * 0.3)} ${round(H - inset)} ${round(inset)} ${round(H - r)}`,
    run(H - r, r, 14, 'y', inset, sideAmp),
    `Q${round(inset * 0.3)} ${round(inset)} ${round(r)} ${round(inset)}`,
    'Z',
  ].join(' ');
}
