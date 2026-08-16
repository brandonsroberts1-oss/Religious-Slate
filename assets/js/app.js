/**
 * Slate Plaque Studio — editor.
 *
 * The control panel is generated from a schema rather than hand-written markup.
 * There are roughly sixty adjustable properties on a plaque; describing them
 * once as data keeps the wiring honest and means a new control is one line
 * rather than a block of DOM plumbing plus a matching event handler.
 */

import * as F from './fonts.js';
import { VERSES } from './verses.js';
import { COLLECTIONS, applyCollection } from './presets.js';
import {
  DEFAULT_DESIGN, BOARD_SIZES, DIVIDER_STYLES, TRANSFORMS, SYMBOL_SLOTS,
  withDefaults, clone, faceSpecs, resolveText,
} from './model.js';
import { SYMBOLS, SYMBOL_GROUPS, symbolViewBox } from './symbols.js';
import { layout, toExportSvg, toPreviewSvg, toFlatSvg } from './render.js';
import { makeZip } from './zip.js';

const $ = (sel) => document.querySelector(sel);
const el = (tag, props = {}, kids = []) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const kid of [].concat(kids)) node.append(kid);
  return node;
};

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
const set = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  keys.reduce((o, k) => (o[k] ??= {}), obj)[last] = value;
};

const STORE_KEY = 'sps.designs';
const LAST_KEY = 'sps.last';

const state = {
  design: DEFAULT_DESIGN(),
  ui: { search: '', filter: 'all', guides: false, flat: false },
};

const verseById = new Map(VERSES.map((v) => [v.id, v]));
const currentVerse = () => verseById.get(state.design.verseId) || null;

// ── Control schema ─────────────────────────────────────────────────────────

const opt = (value, label) => ({ value, label });
const transformOpts = TRANSFORMS.map((t) => opt(t.id, t.label));

/** Shared controls for any text element. */
const textControls = (key, role, extras = []) => [
  { type: 'toggle', path: `${key}.on`, label: 'Show' },
  { type: 'textarea', path: `${key}.text`, label: 'Text', rows: key === 'verse' ? 3 : 1, inherit: true },
  { type: 'font', path: key, role },
  { type: 'range', path: `${key}.sizeMm`, label: 'Size', min: 2, max: 60, step: 0.5, unit: 'mm' },
  { type: 'range', path: `${key}.tracking`, label: 'Letter spacing', min: -0.05, max: 0.6, step: 0.01, unit: 'em' },
  ...extras,
  { type: 'select', path: `${key}.transform`, label: 'Case', options: transformOpts },
];

const SECTIONS = [
  {
    id: 'verse', title: 'Verse', open: true,
    controls: [
      ...textControls('verse', 'verse', [
        { type: 'range', path: 'verse.lineHeight', label: 'Line height', min: 0.9, max: 2.6, step: 0.05, unit: '×' },
        { type: 'range', path: 'verse.maxWidthPct', label: 'Text width', min: 40, max: 100, step: 1, unit: '%' },
        { type: 'seg', path: 'verse.align', label: 'Align', options: [opt('left', 'Left'), opt('center', 'Centre'), opt('right', 'Right')] },
      ]),
      { type: 'range', path: 'verse.gapAfter', label: 'Gap below', min: 0, max: 80, step: 0.5, unit: 'mm' },
      { type: 'action', label: 'Fit to board', id: 'fit-verse', hint: 'Shrinks the verse until it sits inside the text width in three lines or fewer.' },
    ],
  },
  {
    id: 'rule', title: 'Divider',
    controls: [
      { type: 'toggle', path: 'rule.on', label: 'Show' },
      { type: 'select', path: 'rule.style', label: 'Style', options: DIVIDER_STYLES.map((d) => opt(d.id, d.label)) },
      { type: 'range', path: 'rule.widthMm', label: 'Width', min: 5, max: 200, step: 1, unit: 'mm' },
      { type: 'range', path: 'rule.thicknessMm', label: 'Thickness', min: 0.2, max: 8, step: 0.1, unit: 'mm' },
      { type: 'range', path: 'rule.gapAfter', label: 'Gap below', min: 0, max: 80, step: 0.5, unit: 'mm' },
    ],
  },
  {
    id: 'reference', title: 'Reference line',
    controls: [
      ...textControls('reference', 'reference'),
      { type: 'range', path: 'reference.gapAfter', label: 'Gap below', min: 0, max: 100, step: 0.5, unit: 'mm' },
    ],
  },
  {
    id: 'badge', title: 'Subject word', open: true,
    controls: [
      ...textControls('badge', 'word'),
      { type: 'swaps' },
      { type: 'heading', label: 'Box' },
      { type: 'toggle', path: 'badge.box.on', label: 'Show box' },
      { type: 'seg', path: 'badge.box.render', label: 'Draw as', options: [opt('fill', 'Filled ring'), opt('stroke', 'Stroke')], hint: 'A filled ring engraves at exactly the thickness below. Stroke is for scoring or cutting the outline instead.' },
      { type: 'range', path: 'badge.box.thicknessMm', label: 'Thickness', min: 0.2, max: 8, step: 0.1, unit: 'mm' },
      { type: 'select', path: 'badge.box.mode', label: 'Width', options: [opt('hug', 'Hug the word'), opt('fixed', 'Fixed width'), opt('full', 'Full content width')] },
      { type: 'range', path: 'badge.box.widthMm', label: 'Fixed width', min: 20, max: 300, step: 1, unit: 'mm', when: (d) => d.badge.box.mode === 'fixed' },
      { type: 'range', path: 'badge.box.padXMm', label: 'Pad — sides', min: 0, max: 40, step: 0.5, unit: 'mm' },
      { type: 'range', path: 'badge.box.padYMm', label: 'Pad — top/bottom', min: 0, max: 40, step: 0.5, unit: 'mm' },
      { type: 'range', path: 'badge.box.radiusMm', label: 'Corner radius', min: 0, max: 20, step: 0.5, unit: 'mm' },
    ],
  },
  {
    id: 'symbol', title: 'Symbol',
    controls: [
      { type: 'toggle', path: 'symbol.on', label: 'Show' },
      { type: 'symbols' },
      { type: 'range', path: 'symbol.sizeMm', label: 'Height', min: 4, max: 140, step: 0.5, unit: 'mm' },
      { type: 'select', path: 'symbol.slot', label: 'Position', options: SYMBOL_SLOTS.map((s) => opt(s.id, s.label)) },
      { type: 'range', path: 'symbol.gapBefore', label: 'Gap above', min: 0, max: 60, step: 0.5, unit: 'mm' },
      { type: 'range', path: 'symbol.gapAfter', label: 'Gap below', min: 0, max: 60, step: 0.5, unit: 'mm' },
      { type: 'hint', label: 'Symbols are solid shapes, which is what engraves cleanly on slate — fine interior linework disappears into the grain.' },
    ],
  },
  {
    id: 'eyebrow', title: 'Eyebrow line',
    controls: [
      ...textControls('eyebrow', 'reference'),
      { type: 'range', path: 'eyebrow.gapAfter', label: 'Gap below', min: 0, max: 60, step: 0.5, unit: 'mm' },
      { type: 'hint', label: 'Sits above the verse. Family names, dates, "Established 2019".' },
    ],
  },
  {
    id: 'footer', title: 'Footer line',
    controls: [
      ...textControls('footer', 'accent'),
      { type: 'range', path: 'footer.fromBottomMm', label: 'From bottom', min: 2, max: 80, step: 0.5, unit: 'mm' },
      { type: 'hint', label: 'Positioned from the bottom edge, independent of everything above it.' },
    ],
  },
  {
    id: 'frame', title: 'Border frame',
    controls: [
      { type: 'toggle', path: 'frame.on', label: 'Show' },
      { type: 'seg', path: 'frame.style', label: 'Style', options: [opt('single', 'Single'), opt('double', 'Double')] },
      { type: 'range', path: 'frame.insetMm', label: 'Inset', min: 2, max: 40, step: 0.5, unit: 'mm' },
      { type: 'range', path: 'frame.thicknessMm', label: 'Thickness', min: 0.2, max: 6, step: 0.1, unit: 'mm' },
      { type: 'range', path: 'frame.gapMm', label: 'Rule gap', min: 0.5, max: 12, step: 0.5, unit: 'mm', when: (d) => d.frame.style === 'double' },
      { type: 'range', path: 'frame.radiusMm', label: 'Corner radius', min: 0, max: 24, step: 0.5, unit: 'mm' },
    ],
  },
  {
    id: 'board', title: 'Board & layout',
    controls: [
      { type: 'select', path: 'board.sizeId', label: 'Blank', options: BOARD_SIZES.map((b) => opt(b.id, b.label)), onChange: applyBoardSize },
      { type: 'range', path: 'board.widthMm', label: 'Width', min: 50, max: 600, step: 0.1, unit: 'mm' },
      { type: 'range', path: 'board.heightMm', label: 'Height', min: 50, max: 600, step: 0.1, unit: 'mm' },
      { type: 'heading', label: 'Margins' },
      { type: 'range', path: 'board.margin.top', label: 'Top', min: 0, max: 80, step: 0.5, unit: 'mm' },
      { type: 'range', path: 'board.margin.bottom', label: 'Bottom', min: 0, max: 80, step: 0.5, unit: 'mm' },
      { type: 'range', path: 'board.margin.left', label: 'Left', min: 0, max: 80, step: 0.5, unit: 'mm' },
      { type: 'range', path: 'board.margin.right', label: 'Right', min: 0, max: 80, step: 0.5, unit: 'mm' },
      { type: 'heading', label: 'Vertical placement' },
      { type: 'select', path: 'layout.anchor', label: 'Anchor', options: [opt('custom', 'Fixed from top'), opt('top', 'Top margin'), opt('center', 'Centred'), opt('bottom', 'Bottom margin')] },
      { type: 'range', path: 'layout.topMm', label: 'Start at', min: 0, max: 400, step: 0.5, unit: 'mm', when: (d) => d.layout.anchor === 'custom' },
      { type: 'action', label: 'Centre the stack', id: 'centre-stack' },
      { type: 'heading', label: 'Preview only' },
      { type: 'select', path: 'board.edge', label: 'Edge', options: [opt('natural', 'Natural / chipped'), opt('rounded', 'Rounded'), opt('square', 'Square')] },
      { type: 'range', path: 'board.cornerRadiusMm', label: 'Corner radius', min: 0, max: 30, step: 0.5, unit: 'mm', when: (d) => d.board.edge === 'rounded' },
    ],
  },
  {
    id: 'output', title: 'Export',
    controls: [
      { type: 'color', path: 'output.engrave', label: 'Engrave fill' },
      { type: 'select', path: 'output.boardOutline', label: 'Board outline', options: [opt('none', 'Do not include'), opt('score', 'Include as score'), opt('cut', 'Include as cut')] },
      { type: 'color', path: 'output.outlineColor', label: 'Outline colour', when: (d) => d.output.boardOutline !== 'none' },
      { type: 'hint', label: 'The outline is a reference edge for aligning the blank — it is a separate group so it can be switched off or set to "ignore" in xTool Creative Space.' },
      { type: 'text', path: 'name', label: 'Design name' },
    ],
  },
];

// ── Panel construction ─────────────────────────────────────────────────────

const updaters = [];

function buildControls() {
  const host = $('#controls');
  host.textContent = '';
  updaters.length = 0;

  // A reset lives where the settings are. Someone who has lost track of what
  // they changed is looking at this panel, not at the toolbar.
  const reset = el('button', {
    className: 'btn btn--reset',
    type: 'button',
    textContent: 'Reset all settings to default',
  });
  reset.addEventListener('click', resetToDefaults);
  host.append(el('div', { className: 'panel-head' }, [
    reset,
    el('div', {
      className: 'hint',
      textContent: 'Puts every typeface, size, thickness and spacing back to the original. Undo is offered afterwards.',
      style: 'margin:7px 0 0',
    }),
  ]));

  for (const section of SECTIONS) {
    const body = el('div', { className: 'body' });
    for (const control of section.controls) body.append(buildControl(control));

    const details = el('details', { className: 'section', open: !!section.open }, [
      el('summary', { textContent: section.title }),
      body,
    ]);
    host.append(details);
  }
}

function buildControl(spec) {
  const wrap = el('div');
  const show = () => {
    wrap.hidden = spec.when ? !spec.when(state.design) : false;
  };

  const commit = (value) => {
    if (spec.path) set(state.design, spec.path, value);
    if (spec.onChange) spec.onChange(value);
    update();
  };

  switch (spec.type) {
    case 'heading':
      wrap.append(el('div', { className: 'hint', textContent: spec.label, style: 'margin:14px 0 6px;color:var(--ink-dim);font-weight:600;letter-spacing:.08em;text-transform:uppercase' }));
      break;

    case 'hint':
      wrap.append(el('div', { className: 'hint', textContent: spec.label }));
      break;

    case 'toggle': {
      const input = el('input', { type: 'checkbox' });
      input.addEventListener('change', () => commit(input.checked));
      wrap.append(el('label', { className: 'toggle', style: 'margin-bottom:9px' }, [input, spec.label]));
      updaters.push(() => { input.checked = !!get(state.design, spec.path); show(); });
      break;
    }

    case 'text':
    case 'textarea': {
      const input = spec.type === 'textarea'
        ? el('textarea', { rows: spec.rows || 2 })
        : el('input', { type: 'text' });
      input.addEventListener('input', () => commit(input.value));

      const row = el('div', { className: 'row row--wide' });
      const head = el('div', { style: 'display:flex;align-items:center;gap:6px;justify-content:space-between' }, [
        el('label', { textContent: spec.label, style: 'font-size:11.5px;color:var(--ink-dim)' }),
      ]);
      if (spec.inherit) {
        const reset = el('button', { className: 'btn btn--sm btn--ghost', textContent: 'Reset', title: 'Follow the selected verse again' });
        reset.addEventListener('click', () => { input.value = ''; commit(''); });
        head.append(reset);
      }
      row.append(head, input);
      wrap.append(row);

      updaters.push(() => {
        const value = get(state.design, spec.path) ?? '';
        if (document.activeElement !== input) input.value = value;
        if (spec.inherit) {
          const key = spec.path.split('.')[0];
          input.placeholder = resolveText(state.design, key, currentVerse()) || '—';
        }
        show();
      });
      break;
    }

    case 'range': {
      const range = el('input', { type: 'range', min: spec.min, max: spec.max, step: spec.step });
      const num = el('input', { type: 'number', className: 'num', min: spec.min, max: spec.max, step: spec.step });
      range.addEventListener('input', () => { num.value = range.value; commit(Number(range.value)); });
      num.addEventListener('change', () => { range.value = num.value; commit(Number(num.value)); });

      const row = el('div', { className: 'row row--split' }, [
        el('label', { textContent: spec.unit ? `${spec.label} (${spec.unit})` : spec.label }),
        range, num,
      ]);
      wrap.append(row);
      updaters.push(() => {
        const value = Number(get(state.design, spec.path) ?? 0);
        range.value = value;
        if (document.activeElement !== num) num.value = Math.round(value * 100) / 100;
        show();
      });
      break;
    }

    case 'select': {
      const select = el('select');
      for (const o of spec.options) select.append(el('option', { value: o.value, textContent: o.label }));
      select.addEventListener('change', () => commit(select.value));
      wrap.append(el('div', { className: 'row' }, [el('label', { textContent: spec.label }), select]));
      updaters.push(() => { select.value = get(state.design, spec.path); show(); });
      break;
    }

    case 'color': {
      const input = el('input', { type: 'color' });
      input.addEventListener('input', () => commit(input.value));
      wrap.append(el('div', { className: 'row' }, [el('label', { textContent: spec.label }), input]));
      updaters.push(() => { input.value = get(state.design, spec.path); show(); });
      break;
    }

    case 'seg': {
      const group = el('div', { className: 'seg' });
      const buttons = spec.options.map((o) => {
        const b = el('button', { type: 'button', textContent: o.label });
        b.dataset.value = o.value;
        b.addEventListener('click', () => commit(o.value));
        group.append(b);
        return b;
      });
      wrap.append(el('div', { className: 'row' }, [el('label', { textContent: spec.label }), group]));
      if (spec.hint) wrap.append(el('div', { className: 'hint', textContent: spec.hint }));
      updaters.push(() => {
        const value = get(state.design, spec.path);
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
        show();
      });
      break;
    }

    case 'font': {
      const fam = el('select');
      const weight = el('select', { style: 'width:82px' });
      const italic = el('input', { type: 'checkbox' });

      fam.addEventListener('change', () => {
        set(state.design, `${spec.path}.font`, fam.value);
        // Keep the nearest available weight rather than silently resetting.
        const want = Number(weight.value) || 400;
        const has = F.weightsFor(fam.value, italic.checked);
        set(state.design, `${spec.path}.weight`, has.reduce((a, b) => (Math.abs(b - want) < Math.abs(a - want) ? b : a), has[0]));
        if (!F.hasItalic(fam.value)) set(state.design, `${spec.path}.italic`, false);
        update();
      });
      weight.addEventListener('change', () => { set(state.design, `${spec.path}.weight`, Number(weight.value)); update(); });
      italic.addEventListener('change', () => { set(state.design, `${spec.path}.italic`, italic.checked); update(); });

      wrap.append(
        el('div', { className: 'row' }, [el('label', { textContent: 'Typeface' }), fam]),
        el('div', { className: 'row' }, [
          el('label', { textContent: 'Weight' }),
          el('div', { style: 'display:flex;gap:8px;align-items:center' }, [
            weight,
            el('label', { className: 'toggle' }, [italic, 'Italic']),
          ]),
        ]),
      );

      updaters.push(() => {
        const cfg = get(state.design, spec.path);
        // Family list is grouped by style of type, which is how anyone
        // choosing a face for a plaque actually narrows it down.
        if (!fam.options.length) {
          const groups = new Map();
          for (const f of F.familiesForRole(spec.role)) {
            if (!groups.has(f.group)) groups.set(f.group, el('optgroup', { label: f.group }));
            groups.get(f.group).append(el('option', { value: f.id, textContent: f.family }));
          }
          for (const g of groups.values()) fam.append(g);
        }
        if (!fam.querySelector(`option[value="${cfg.font}"]`)) {
          fam.append(el('option', { value: cfg.font, textContent: F.family(cfg.font).family }));
        }
        fam.value = cfg.font;

        const weights = F.weightsFor(cfg.font, cfg.italic);
        weight.textContent = '';
        for (const w of weights) weight.append(el('option', { value: w, textContent: String(w) }));
        weight.value = String(cfg.weight);

        italic.checked = !!cfg.italic;
        italic.disabled = !F.hasItalic(cfg.font);
        italic.parentElement.style.opacity = italic.disabled ? 0.4 : 1;
        show();
      });
      break;
    }

    case 'symbols': {
      const host = el('div');
      const buttons = new Map();

      for (const group of SYMBOL_GROUPS) {
        host.append(el('div', {
          className: 'hint',
          textContent: group,
          style: 'margin:10px 0 5px;color:var(--ink-faint);letter-spacing:.1em;text-transform:uppercase',
        }));

        const grid = el('div', { className: 'symbol-grid' });
        for (const sym of SYMBOLS.filter((s) => s.group === group)) {
          const button = el('button', { className: 'symbol-swatch', type: 'button', title: sym.name });
          // The swatch is the real geometry, so the picker cannot show one
          // thing and the plaque engrave another.
          button.innerHTML =
            `<svg viewBox="${symbolViewBox(sym.id)}" aria-label="${sym.name}">` +
            `<path d="${sym.d}" fill="currentColor" fill-rule="nonzero"/></svg>`;
          button.addEventListener('click', () => {
            set(state.design, 'symbol.id', sym.id);
            set(state.design, 'symbol.on', true);
            update();
          });
          grid.append(button);
          buttons.set(sym.id, button);
        }
        host.append(grid);
      }

      wrap.append(host);
      updaters.push(() => {
        const current = get(state.design, 'symbol.id');
        for (const [id, button] of buttons) {
          button.setAttribute('aria-pressed', String(id === current));
        }
        show();
      });
      break;
    }

    case 'swaps': {
      const box = el('div', { className: 'swaps' });
      wrap.append(box);
      updaters.push(() => {
        box.textContent = '';
        const verse = currentVerse();
        if (!verse) return;
        const words = [verse.word, ...(verse.alts || [])];
        for (const word of words) {
          const chip = el('button', { className: 'chip', type: 'button', textContent: word });
          chip.addEventListener('click', () => { set(state.design, 'badge.text', word); update(); });
          box.append(chip);
        }
        show();
      });
      break;
    }

    case 'action': {
      const button = el('button', { className: 'btn', type: 'button', textContent: spec.label, style: 'width:100%;margin-top:4px' });
      button.addEventListener('click', () => ACTIONS[spec.id]?.());
      wrap.append(button);
      if (spec.hint) wrap.append(el('div', { className: 'hint', textContent: spec.hint, style: 'margin-top:6px' }));
      updaters.push(show);
      break;
    }

    default:
      break;
  }

  return wrap;
}

// ── Actions ────────────────────────────────────────────────────────────────

const ACTIONS = {
  'fit-verse': () => {
    const d = state.design;
    const font = F.peekFace(d.verse.font, d.verse.weight, d.verse.italic);
    if (!font) return;
    const contentW = d.board.widthMm - d.board.margin.left - d.board.margin.right;
    d.verse.sizeMm = F.fitSize(font, resolveText(d, 'verse', currentVerse()), {
      maxWidth: (contentW * d.verse.maxWidthPct) / 100,
      maxLines: 3,
      startSize: 40,
      tracking: d.verse.tracking,
    });
    update();
  },

  'centre-stack': () => {
    const d = state.design;
    const { metrics } = layout(d, currentVerse());
    const avail = d.board.heightMm - d.board.margin.top - d.board.margin.bottom;
    d.layout.anchor = 'custom';
    d.layout.topMm = Math.round((d.board.margin.top + (avail - metrics.stackHeight) / 2) * 10) / 10;
    update();
  },
};

function applyBoardSize(id) {
  const size = BOARD_SIZES.find((b) => b.id === id);
  if (size && size.w) {
    state.design.board.widthMm = size.w;
    state.design.board.heightMm = size.h;
  }
}

// ── Verse browser ──────────────────────────────────────────────────────────

function buildFilters() {
  const host = $('#verse-filters');
  host.textContent = '';
  const entries = [{ id: 'all', name: 'All' }, ...COLLECTIONS.map((c) => ({ id: c.id, name: c.name.replace(/^The | Collection$/g, '') }))];
  for (const entry of entries) {
    const chip = el('button', { className: 'chip', type: 'button', textContent: entry.name });
    chip.dataset.id = entry.id;
    chip.addEventListener('click', () => { state.ui.filter = entry.id; renderVerseList(); });
    host.append(chip);
  }
}

function filteredVerses() {
  const q = state.ui.search.trim().toLowerCase();
  return VERSES.filter((v) => {
    if (state.ui.filter !== 'all' && v.set !== state.ui.filter) return false;
    if (!q) return true;
    return (
      v.text.toLowerCase().includes(q) ||
      (v.web || '').toLowerCase().includes(q) ||
      v.ref.toLowerCase().includes(q) ||
      v.word.toLowerCase().includes(q) ||
      v.alts.some((a) => a.toLowerCase().includes(q)) ||
      v.tags.some((t) => t.includes(q))
    );
  });
}

function renderVerseList() {
  const list = $('#verse-list');
  const verses = filteredVerses();
  list.textContent = '';

  for (const chip of $('#verse-filters').children) {
    chip.setAttribute('aria-pressed', String(chip.dataset.id === state.ui.filter));
  }
  $('#verse-count').textContent = `${verses.length} of ${VERSES.length} verses`;

  for (const verse of verses) {
    const card = el('button', { className: 'verse-card', type: 'button' }, [
      el('div', { className: 't', textContent: state.design.translation === 'web' && verse.web ? verse.web : verse.text }),
      el('div', { className: 'm' }, [
        el('span', { textContent: verse.ref }),
        el('b', { textContent: verse.word }),
      ]),
    ]);
    card.setAttribute('aria-selected', String(verse.id === state.design.verseId));
    card.addEventListener('click', () => {
      state.design.verseId = verse.id;
      update();
      renderVerseList();
    });
    list.append(card);
  }
}

// ── Render loop ────────────────────────────────────────────────────────────

let pending = false;
let renderToken = 0;

function update() {
  // One misbehaving control must not take the panel down with it. Without the
  // guard, a single throw halts the loop, every control after it stops
  // syncing, and the redraw below never runs — which looks to the operator
  // like the app has stopped responding to anything at all.
  for (const fn of updaters) {
    try {
      fn();
    } catch (err) {
      console.error('control failed to sync', err);
    }
  }
  scheduleDraw();
  persist();
}

function scheduleDraw() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(async () => {
    pending = false;
    const token = ++renderToken;
    await F.preload(faceSpecs(state.design));
    if (token !== renderToken) return; // a newer change already won
    draw();
  });
}

function draw() {
  const verse = currentVerse();
  const d = state.design;

  $('#board').innerHTML = state.ui.flat
    ? toFlatSvg(d, verse, { showGuides: state.ui.guides })
    : toPreviewSvg(d, verse, { showGuides: state.ui.guides });

  const { warnings, metrics } = layout(d, verse);
  const box = $('#warnings');
  box.textContent = '';
  for (const w of warnings) box.append(el('div', { className: 'warn', textContent: w }));

  const mm = (n) => `${Math.round(n * 10) / 10}`;
  $('#hud').textContent =
    `${mm(d.board.widthMm)} × ${mm(d.board.heightMm)} mm · ` +
    `${mm(d.board.widthMm / 25.4)}″ × ${mm(d.board.heightMm / 25.4)}″ · ` +
    `content ${mm(metrics.stackHeight)} mm`;

  $('#loading').hidden = true;
}

// ── Reset ──────────────────────────────────────────────────────────────────

let toastTimer;

function hideToast() {
  clearTimeout(toastTimer);
  $('#toast').hidden = true;
}

function toast(message, actionLabel, action) {
  const host = $('#toast');
  host.textContent = '';
  host.append(el('span', { textContent: message }));

  if (action) {
    const button = el('button', { className: 'btn btn--sm', type: 'button', textContent: actionLabel });
    button.addEventListener('click', () => { action(); hideToast(); });
    host.append(button);
  }

  host.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 10000);
}

/**
 * Briefly outline the board. A reset on a design that was already close to
 * default changes almost nothing on screen, and silence there is
 * indistinguishable from a broken button.
 */
function flashBoard() {
  const board = $('#board');
  board.classList.remove('flash');
  void board.offsetWidth; // restart the animation
  board.classList.add('flash');
  setTimeout(() => board.classList.remove('flash'), 700);
}

function syncTopbar() {
  $('#collection').value = state.design.collection;
  for (const b of $('#translation').children) {
    b.setAttribute('aria-pressed', String(b.dataset.value === state.design.translation));
  }
}

/**
 * Back to factory settings in one click.
 *
 * Offering undo rather than a confirmation dialog keeps it a single click for
 * the case that is actually common — wanting the defaults back — while still
 * being recoverable when it was a misclick.
 */
function resetToDefaults() {
  const previous = clone(state.design);
  const previousCollection = state.design.collection;

  state.design = DEFAULT_DESIGN();
  state.design.collection = 'household';

  syncTopbar();
  update();
  renderVerseList();
  flashBoard();

  toast('Reset to defaults — fonts, sizes, spacing and thicknesses.', 'Undo', () => {
    state.design = previous;
    state.design.collection = previousCollection;
    syncTopbar();
    update();
    renderVerseList();
  });
}

// ── Persistence ────────────────────────────────────────────────────────────

const persist = () => {
  try { localStorage.setItem(LAST_KEY, JSON.stringify(state.design)); } catch { /* private mode */ }
};

const readStore = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
};

const writeStore = (data) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* quota */ }
};

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const safeName = (s) => String(s).replace(/[^\w.-]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'plaque';

function exportFilename(design, verse, ext) {
  const size = `${Math.round(design.board.widthMm)}x${Math.round(design.board.heightMm)}mm`;
  const ref = verse ? safeName(verse.ref) : 'custom';
  const word = safeName(resolveText(design, 'badge', verse) || 'plaque');
  return `${ref}_${word}_${size}.${ext}`;
}

// ── PNG ────────────────────────────────────────────────────────────────────

async function exportPng(scale = 3) {
  const d = state.design;
  const svg = state.ui.flat ? toFlatSvg(d, currentVerse()) : toPreviewSvg(d, currentVerse());
  const width = Math.round(d.board.widthMm * scale);
  const height = Math.round(d.board.heightMm * scale);

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = 'sync';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Could not rasterise the preview'));
      img.src = url;
    });
    const canvas = el('canvas', { width, height });
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    const png = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    download(png, exportFilename(d, currentVerse(), 'png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ── Batch ──────────────────────────────────────────────────────────────────

function batchVerses() {
  const source = $('#batch-source').value;
  if (source === 'filtered') return filteredVerses();
  if (source === 'all') return VERSES.slice();
  return VERSES.filter((v) => v.set === source);
}

async function runBatch() {
  const limit = Math.max(1, Number($('#batch-limit').value) || 40);
  const autofit = $('#batch-fit').checked;
  const verses = batchVerses().slice(0, limit);

  const button = $('#btn-batch-go');
  button.disabled = true;
  button.textContent = 'Rendering…';

  try {
    const base = state.design;
    await F.preload(faceSpecs(base));

    const files = verses.map((verse) => {
      const d = clone(base);
      d.verseId = verse.id;
      // A batch spans verses of very different lengths; without refitting, the
      // long ones would silently run past the margins.
      if (autofit) {
        const font = F.peekFace(d.verse.font, d.verse.weight, d.verse.italic);
        if (font) {
          const contentW = d.board.widthMm - d.board.margin.left - d.board.margin.right;
          d.verse.sizeMm = F.fitSize(font, resolveText(d, 'verse', verse), {
            maxWidth: (contentW * d.verse.maxWidthPct) / 100,
            maxLines: 3,
            startSize: base.verse.sizeMm,
            tracking: d.verse.tracking,
          });
        }
      }
      return { name: exportFilename(d, verse, 'svg'), text: toExportSvg(d, verse) };
    });

    const label = safeName(state.design.collection);
    download(makeZip(files), `slate-plaques_${label}_${files.length}.zip`);
    $('#dlg-batch').close();
  } finally {
    button.disabled = false;
    button.textContent = 'Build .zip';
  }
}

// ── Wiring ─────────────────────────────────────────────────────────────────

function wireTopbar() {
  const collections = $('#collection');
  for (const c of COLLECTIONS) collections.append(el('option', { value: c.id, textContent: c.name }));
  collections.value = state.design.collection;
  collections.addEventListener('change', () => {
    state.design.collection = collections.value;
    state.design = applyCollection(state.design, collections.value);
    update();
  });

  for (const button of $('#translation').children) {
    button.addEventListener('click', () => {
      state.design.translation = button.dataset.value;
      for (const b of $('#translation').children) {
        b.setAttribute('aria-pressed', String(b.dataset.value === state.design.translation));
      }
      update();
      renderVerseList();
    });
  }

  $('#verse-search').addEventListener('input', (e) => {
    state.ui.search = e.target.value;
    renderVerseList();
  });

  $('#btn-guides').addEventListener('click', (e) => {
    state.ui.guides = !state.ui.guides;
    e.currentTarget.setAttribute('aria-pressed', String(state.ui.guides));
    scheduleDraw();
  });

  $('#btn-flat').addEventListener('click', (e) => {
    state.ui.flat = !state.ui.flat;
    e.currentTarget.setAttribute('aria-pressed', String(state.ui.flat));
    scheduleDraw();
  });

  $('#btn-svg').addEventListener('click', () => {
    const svg = toExportSvg(state.design, currentVerse());
    download(new Blob([svg], { type: 'image/svg+xml' }), exportFilename(state.design, currentVerse(), 'svg'));
  });

  $('#btn-png').addEventListener('click', () => exportPng());

  $('#btn-save').addEventListener('click', () => {
    const name = prompt('Save this design as:', state.design.name || 'Untitled');
    if (!name) return;
    state.design.name = name;
    const store = readStore();
    store[name] = clone(state.design);
    writeStore(store);
    update();
  });

  $('#btn-reset').addEventListener('click', resetToDefaults);

  $('#btn-open').addEventListener('click', () => { renderSaved(); $('#dlg-open').showModal(); });

  $('#btn-batch').addEventListener('click', () => {
    const select = $('#batch-source');
    select.textContent = '';
    select.append(el('option', { value: 'filtered', textContent: 'Whatever the browser is showing' }));
    for (const c of COLLECTIONS) {
      select.append(el('option', { value: c.id, textContent: c.name }));
    }
    select.append(el('option', { value: 'all', textContent: `Everything (${VERSES.length})` }));
    select.value = state.design.collection;
    const refresh = () => { $('#batch-count').textContent = `${batchVerses().length} verses match.`; };
    select.onchange = refresh;
    refresh();
    $('#dlg-batch').showModal();
  });

  $('#btn-batch-go').addEventListener('click', runBatch);

  for (const button of document.querySelectorAll('[data-close]')) {
    button.addEventListener('click', (e) => e.currentTarget.closest('dialog').close());
  }

  $('#btn-export-json').addEventListener('click', () => {
    download(
      new Blob([JSON.stringify(state.design, null, 2)], { type: 'application/json' }),
      `${safeName(state.design.name)}.json`,
    );
  });

  $('#btn-import').addEventListener('click', () => $('#file-import').click());
  $('#file-import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      state.design = withDefaults(JSON.parse(await file.text()));
      update();
      renderVerseList();
      $('#dlg-open').close();
    } catch {
      alert('That file is not a design export.');
    }
    e.target.value = '';
  });
}

function renderSaved() {
  const host = $('#saved-list');
  host.textContent = '';
  const store = readStore();
  const names = Object.keys(store).sort();

  if (!names.length) {
    host.append(el('div', { className: 'hint', textContent: 'Nothing saved yet.' }));
    return;
  }

  for (const name of names) {
    const design = store[name];
    const open = el('button', { className: 'btn btn--sm', textContent: 'Open' });
    open.addEventListener('click', () => {
      state.design = withDefaults(design);
      update();
      renderVerseList();
      $('#dlg-open').close();
    });

    const remove = el('button', { className: 'btn btn--sm btn--ghost', textContent: 'Delete' });
    remove.addEventListener('click', () => {
      const store2 = readStore();
      delete store2[name];
      writeStore(store2);
      renderSaved();
    });

    host.append(el('div', { className: 'saved-item' }, [
      el('span', { textContent: name }),
      el('small', { textContent: `${Math.round(design.board?.widthMm || 0)}×${Math.round(design.board?.heightMm || 0)}mm` }),
      open, remove,
    ]));
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────

async function boot() {
  try {
    await F.loadManifest();
  } catch (err) {
    $('#loading').textContent = err.message;
    return;
  }

  try {
    const saved = localStorage.getItem(LAST_KEY);
    if (saved) state.design = withDefaults(JSON.parse(saved));
  } catch { /* fall back to defaults */ }

  buildFilters();
  buildControls();
  wireTopbar();

  for (const b of $('#translation').children) {
    b.setAttribute('aria-pressed', String(b.dataset.value === state.design.translation));
  }

  renderVerseList();
  await F.preload(faceSpecs(state.design));
  update();
  draw();

  // Automation surface. tools/render-marketing.mjs drives the real renderer
  // through this rather than reimplementing layout in Node, so the marketing
  // images are produced by exactly the code that produces customer files.
  window.__studio = {
    state, update, draw,
    layout, toExportSvg, toPreviewSvg, toFlatSvg,
    fonts: F, VERSES, COLLECTIONS, applyCollection,
    DEFAULT_DESIGN, withDefaults, clone, faceSpecs, resolveText,
    ready: true,
  };
  document.documentElement.dataset.ready = 'true';
}

boot();
