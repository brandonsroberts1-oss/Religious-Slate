/**
 * Path builders for the non-text geometry: rules, badge boxes and frames.
 *
 * Everything is emitted as explicit path data in millimetres. Boxes are built
 * as *filled rings* rather than stroked rectangles by default — a stroke is a
 * hint that a renderer may interpret at its own scale, whereas a ring is a
 * closed area whose thickness is part of the geometry. On a laser that is the
 * difference between a border that measures 1.2 mm and one that measures
 * whatever the importer felt like. Stroke output stays available for anyone
 * who wants the border scored or cut instead of filled.
 */

const r = (n) => Math.round(n * 1000) / 1000;

/**
 * Rounded rectangle as a closed subpath.
 * `sweep` flips the arc direction so an inner contour can be wound opposite to
 * its outer one, which keeps the hole a hole under either fill rule.
 */
export function roundedRect(x, y, w, h, radius, sweep = 1) {
  const rad = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
  if (w <= 0 || h <= 0) return '';

  if (rad === 0) {
    return sweep
      ? `M${r(x)} ${r(y)} H${r(x + w)} V${r(y + h)} H${r(x)} Z`
      : `M${r(x)} ${r(y)} V${r(y + h)} H${r(x + w)} V${r(y)} Z`;
  }

  const [x0, x1, y0, y1] = [x, x + w, y, y + h];
  if (sweep) {
    return [
      `M${r(x0 + rad)} ${r(y0)}`,
      `H${r(x1 - rad)}`,
      `A${r(rad)} ${r(rad)} 0 0 1 ${r(x1)} ${r(y0 + rad)}`,
      `V${r(y1 - rad)}`,
      `A${r(rad)} ${r(rad)} 0 0 1 ${r(x1 - rad)} ${r(y1)}`,
      `H${r(x0 + rad)}`,
      `A${r(rad)} ${r(rad)} 0 0 1 ${r(x0)} ${r(y1 - rad)}`,
      `V${r(y0 + rad)}`,
      `A${r(rad)} ${r(rad)} 0 0 1 ${r(x0 + rad)} ${r(y0)}`,
      'Z',
    ].join(' ');
  }
  return [
    `M${r(x0 + rad)} ${r(y0)}`,
    `A${r(rad)} ${r(rad)} 0 0 0 ${r(x0)} ${r(y0 + rad)}`,
    `V${r(y1 - rad)}`,
    `A${r(rad)} ${r(rad)} 0 0 0 ${r(x0 + rad)} ${r(y1)}`,
    `H${r(x1 - rad)}`,
    `A${r(rad)} ${r(rad)} 0 0 0 ${r(x1)} ${r(y1 - rad)}`,
    `V${r(y0 + rad)}`,
    `A${r(rad)} ${r(rad)} 0 0 0 ${r(x1 - rad)} ${r(y0)}`,
    'Z',
  ].join(' ');
}

/**
 * A rectangular ring of exact wall thickness: outer contour plus a
 * counter-wound inner contour. Render with fill-rule="evenodd".
 */
export function rectRing(x, y, w, h, thickness, radius = 0) {
  const t = Math.max(0.01, Math.min(thickness, Math.min(w, h) / 2));
  const outer = roundedRect(x, y, w, h, radius, 1);
  const inner = roundedRect(x + t, y + t, w - 2 * t, h - 2 * t, Math.max(0, radius - t), 0);
  return inner ? `${outer} ${inner}` : outer;
}

/** Solid bar — used for the divider rule and for filled underlines. */
export function bar(cx, y, width, thickness, radius = 0) {
  return roundedRect(cx - width / 2, y, width, thickness, radius, 1);
}

/**
 * Divider styles. Each returns { d, height } where `d` is path data drawn with
 * `y` as the top of the ornament and `cx` as the horizontal centre.
 */
export function divider(style, cx, y, width, thickness) {
  const t = Math.max(0.05, thickness);

  switch (style) {
    case 'none':
      return { d: '', height: 0 };

    case 'double': {
      const gap = t * 2.5;
      return { d: `${bar(cx, y, width, t)} ${bar(cx, y + t + gap, width, t)}`, height: t * 2 + gap };
    }

    case 'tapered': {
      // A rule that thins towards both ends — reads as engraved, not printed.
      const half = width / 2;
      const d = [
        `M${r(cx - half)} ${r(y + t / 2)}`,
        `L${r(cx - half * 0.5)} ${r(y)}`,
        `L${r(cx + half * 0.5)} ${r(y)}`,
        `L${r(cx + half)} ${r(y + t / 2)}`,
        `L${r(cx + half * 0.5)} ${r(y + t)}`,
        `L${r(cx - half * 0.5)} ${r(y + t)}`,
        'Z',
      ].join(' ');
      return { d, height: t };
    }

    case 'diamond': {
      const s = Math.max(t * 3, 1.6);
      const arm = (width - s * 2.4) / 2;
      const cy = y + s / 2;
      const dia = [
        `M${r(cx)} ${r(cy - s / 2)}`,
        `L${r(cx + s / 2)} ${r(cy)}`,
        `L${r(cx)} ${r(cy + s / 2)}`,
        `L${r(cx - s / 2)} ${r(cy)}`,
        'Z',
      ].join(' ');
      const left = arm > 0 ? bar(cx - s * 1.2 - arm / 2, cy - t / 2, arm, t) : '';
      const right = arm > 0 ? bar(cx + s * 1.2 + arm / 2, cy - t / 2, arm, t) : '';
      return { d: `${left} ${dia} ${right}`.trim(), height: s };
    }

    case 'cross': {
      const s = Math.max(t * 6, 3.2);
      const armW = t;
      const cy = y + s / 2;
      const vert = roundedRect(cx - armW / 2, y, armW, s, 0, 1);
      const horiz = roundedRect(cx - s * 0.32, y + s * 0.3 - armW / 2, s * 0.64, armW, 0, 1);
      const gap = s * 0.9;
      const arm = (width - gap * 2) / 2;
      const left = arm > 0 ? bar(cx - gap - arm / 2, cy - t / 2, arm, t) : '';
      const right = arm > 0 ? bar(cx + gap + arm / 2, cy - t / 2, arm, t) : '';
      return { d: `${left} ${vert} ${horiz} ${right}`.trim(), height: s };
    }

    case 'line':
    default:
      return { d: bar(cx, y, width, t), height: t };
  }
}

/**
 * Border frame inset from the board edge. `style` 'double' draws a heavy rule
 * with a hairline companion, the way an engraved certificate border reads.
 */
export function frame(x, y, w, h, thickness, radius, style = 'single', gap = 2) {
  const outer = rectRing(x, y, w, h, thickness, radius);
  if (style !== 'double') return outer;

  const inset = thickness + gap;
  const thin = Math.max(0.3, thickness * 0.35);
  const inner = rectRing(
    x + inset,
    y + inset,
    w - 2 * inset,
    h - 2 * inset,
    thin,
    Math.max(0, radius - inset),
  );
  return `${outer} ${inner}`;
}
