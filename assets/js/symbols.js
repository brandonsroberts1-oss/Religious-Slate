/**
 * Symbol library.
 *
 * Every symbol is *constructed* — circles, arcs and polygons composed from
 * primitives — rather than traced. Constructed geometry is exactly symmetrical,
 * scales to any size without artefacts, and carries no licensing baggage from
 * somebody else's clipart.
 *
 * Two rules govern everything in this file:
 *
 *   1. Only M, L, C, Q and Z, always absolute. No arc (`A`) commands. The
 *      exporter bakes absolute coordinates instead of emitting transforms, and
 *      those five commands take nothing but coordinate pairs — so scaling a
 *      symbol is a uniform map over every number in the path. An arc's radii
 *      and flags would not survive that. `arc()` below emits cubics.
 *
 *   2. Overlapping parts are wound consistently and filled `nonzero`, so a
 *      union is just concatenation. A ring's hole is wound backwards, which
 *      punches it out of the ring while leaving anything else that crosses it
 *      solid — that is what lets a Celtic cross's arms pass through the ring.
 *
 * Bold, closed shapes are also what slate actually wants: engraving is a
 * texture, not ink, and fine interior linework disappears into the grain.
 */

const TAU = Math.PI * 2;
const n = (v) => Math.round(v * 1000) / 1000;
const at = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

/**
 * Circular arc as cubic Béziers, split so no segment spans more than 90°.
 * Angles are radians, y-down; increasing angle reads clockwise on screen.
 * Emits only the `C` commands — the caller places the starting point.
 */
function arc(cx, cy, r, a0, a1) {
  const total = a1 - a0;
  const steps = Math.max(1, Math.ceil(Math.abs(total) / (Math.PI / 2)));
  const delta = total / steps;
  const k = (4 / 3) * Math.tan(delta / 4);
  const out = [];

  let a = a0;
  for (let i = 0; i < steps; i++) {
    const b = a + delta;
    const [x0, y0] = at(cx, cy, r, a);
    const [x1, y1] = at(cx, cy, r, b);
    out.push(
      `C${n(x0 - k * r * Math.sin(a))} ${n(y0 + k * r * Math.cos(a))} ` +
        `${n(x1 + k * r * Math.sin(b))} ${n(y1 - k * r * Math.cos(b))} ${n(x1)} ${n(y1)}`,
    );
    a = b;
  }
  return out.join(' ');
}

/** Full circle. `cw` false reverses the winding, making it a hole. */
function circle(cx, cy, r, cw = true) {
  const a0 = -Math.PI / 2;
  const [sx, sy] = at(cx, cy, r, a0);
  return `M${n(sx)} ${n(sy)} ${arc(cx, cy, r, a0, a0 + (cw ? TAU : -TAU))} Z`;
}

/** Annulus: outer contour plus a reversed inner one. */
const ring = (cx, cy, outer, inner) => `${circle(cx, cy, outer, true)} ${circle(cx, cy, inner, false)}`;

/** Shoelace sign. In y-down space a positive area reads clockwise. */
function isClockwise(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    area += x1 * y2 - x2 * y1;
  }
  return area > 0;
}

/** Closed polygon, forced to the requested winding. */
function poly(points, cw = true) {
  const pts = isClockwise(points) === cw ? points : [...points].reverse();
  return `M${pts.map(([x, y], i) => (i ? `L${n(x)} ${n(y)}` : `${n(x)} ${n(y)}`)).join(' ')} Z`;
}

const rect = (x, y, w, h, cw = true) =>
  poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], cw);

/** Star polygon alternating between two radii. */
function star(cx, cy, outer, inner, points, rotation = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    pts.push(at(cx, cy, r, rotation + (i * Math.PI) / points));
  }
  return poly(pts, true);
}

/** Equilateral triangle by circumradius. `up` false points it downwards. */
function triangle(cx, cy, r, up = true, cw = true) {
  const base = up ? -Math.PI / 2 : Math.PI / 2;
  return poly([0, 1, 2].map((i) => at(cx, cy, r, base + (i * TAU) / 3)), cw);
}

/** Triangular band: a triangle with a smaller one of the same orientation cut out. */
const triangleRing = (cx, cy, r, thickness, up = true) =>
  `${triangle(cx, cy, r, up, true)} ${triangle(cx, cy, r - 2 * thickness, up, false)}`;

/** Half-open band — the arms of a menorah, the fluke of an anchor. */
function arcBand(cx, cy, r, thickness, a0, a1) {
  const ro = r + thickness / 2;
  const ri = r - thickness / 2;
  const [sx, sy] = at(cx, cy, ro, a0);
  const [ex, ey] = at(cx, cy, ri, a1);
  return (
    `M${n(sx)} ${n(sy)} ${arc(cx, cy, ro, a0, a1)} ` +
    `L${n(ex)} ${n(ey)} ${arc(cx, cy, ri, a1, a0)} Z`
  );
}

/** Pointed leaf, symmetrical about its axis. */
function leaf(x, y, angle, length, width) {
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const px = -uy;
  const py = ux;
  const tipX = x + ux * length;
  const tipY = y + uy * length;
  const bulge = length * 0.42;
  const p = (dx, dy) => `${n(x + ux * dx + px * dy)} ${n(y + uy * dx + py * dy)}`;
  return (
    `M${n(x)} ${n(y)} ` +
    `C${p(bulge, width)} ${p(length - bulge, width)} ${n(tipX)} ${n(tipY)} ` +
    `C${p(length - bulge, -width)} ${p(bulge, -width)} ${n(x)} ${n(y)} Z`
  );
}

/** Teardrop flame with a slight curl. */
function flame(cx, baseY, width, height) {
  const w = width / 2;
  return (
    `M${n(cx)} ${n(baseY - height)} ` +
    `C${n(cx + w * 0.35)} ${n(baseY - height * 0.66)} ${n(cx + w)} ${n(baseY - height * 0.46)} ${n(cx + w)} ${n(baseY - height * 0.22)} ` +
    `C${n(cx + w)} ${n(baseY - height * 0.05)} ${n(cx + w * 0.6)} ${n(baseY)} ${n(cx)} ${n(baseY)} ` +
    `C${n(cx - w * 0.6)} ${n(baseY)} ${n(cx - w)} ${n(baseY - height * 0.05)} ${n(cx - w)} ${n(baseY - height * 0.22)} ` +
    `C${n(cx - w)} ${n(baseY - height * 0.46)} ${n(cx - w * 0.3)} ${n(baseY - height * 0.6)} ${n(cx)} ${n(baseY - height)} Z`
  );
}

/** Classic two-lobed heart, `h` tall, centred on `cx`, apex at `y + h`. */
function heart(cx, y, w, h) {
  const hw = w / 2;
  return (
    `M${n(cx)} ${n(y + h)} ` +
    `C${n(cx - hw * 0.55)} ${n(y + h * 0.72)} ${n(cx - hw)} ${n(y + h * 0.52)} ${n(cx - hw)} ${n(y + h * 0.32)} ` +
    `C${n(cx - hw)} ${n(y + h * 0.09)} ${n(cx - hw * 0.52)} ${n(y)} ${n(cx)} ${n(y + h * 0.19)} ` +
    `C${n(cx + hw * 0.52)} ${n(y)} ${n(cx + hw)} ${n(y + h * 0.09)} ${n(cx + hw)} ${n(y + h * 0.32)} ` +
    `C${n(cx + hw)} ${n(y + h * 0.52)} ${n(cx + hw * 0.55)} ${n(y + h * 0.72)} ${n(cx)} ${n(y + h)} Z`
  );
}

/**
 * Crescent bounded by two arcs meeting at the horns — not a circle with another
 * circle subtracted. Subtraction only works when the cutting shape stays inside
 * the one it cuts; here it does not, and the overhang would fill instead of
 * clear under either fill rule.
 */
function crescent(cx, cy, outer, innerR, offset) {
  // Where the two circles cross, measured from the outer circle's centre.
  const x = (offset * offset + outer * outer - innerR * innerR) / (2 * offset);
  const y = Math.sqrt(Math.max(0, outer * outer - x * x));

  const aOuter = Math.atan2(y, x);
  const aInner = Math.atan2(y, x - offset);

  // Both arcs take the long way round the far side. The inner circle reaches
  // past the outer one, so its near-side arc lies outside the crescent
  // altogether — following it would bulge the shape out instead of hollowing
  // it, which is a disc with a notch rather than a crescent.
  return (
    `M${n(cx + x)} ${n(cy + y)} ` +
    `${arc(cx, cy, outer, aOuter, TAU - aOuter)} ` +
    `${arc(cx + offset, cy, innerR, -aInner, aInner - TAU)} Z`
  );
}

// ── Symbols ────────────────────────────────────────────────────────────────
// Each entry declares its own design-space box (w × h). The renderer scales by
// height and centres by width, so the box must be tight.

const latinCross = (w = 64, h = 100, bar = 18, barTop = 26) =>
  `${rect((w - bar) / 2, 0, bar, h)} ${rect(0, barTop, w, bar)}`;

function flaredCross() {
  // Narrow at the crossing, flared at the tips — how a carved memorial cross is
  // cut, and it stops the arms looking like plain bars at small sizes.
  const pts = [
    [22, 0], [42, 0], [40, 24], [64, 22], [64, 42], [40, 40],
    [42, 100], [22, 100], [24, 40], [0, 42], [0, 22], [24, 24],
  ];
  return { w: 64, h: 100, d: poly(pts, true) };
}

function celticCross() {
  const w = 72;
  const h = 104;
  const bar = 17;
  const barTop = 28;
  const cx = w / 2;
  const cy = barTop + bar / 2;
  return {
    w, h,
    d: `${rect((w - bar) / 2, 0, bar, h)} ${rect(0, barTop, w, bar)} ${ring(cx, cy, 27, 19)}`,
  };
}

function orthodoxCross() {
  const w = 64;
  const h = 108;
  const stem = 15;
  const x = (w - stem) / 2;
  // Slanted footrest: the lower bar of a Russian cross tilts.
  const foot = poly([[13, 84], [51, 74], [51, 87], [13, 97]], true);
  return {
    w, h,
    d: `${rect(x, 0, stem, h)} ${rect(17, 14, 30, 12)} ${rect(0, 38, w, 14)} ${foot}`,
  };
}

function jerusalemCross() {
  const s = 100;
  const bar = 20;
  const mid = (s - bar) / 2;
  const big = `${rect(mid, 16, bar, s - 32)} ${rect(16, mid, s - 32, bar)}`;

  // Four smaller crosses, one to a quadrant.
  const small = (cx, cy) => {
    const b = 7;
    const len = 21;
    return `${rect(cx - b / 2, cy - len / 2, b, len)} ${rect(cx - len / 2, cy - b / 2, len, b)}`;
  };
  const off = 12;
  return {
    w: s, h: s,
    d: [big, small(off, off), small(s - off, off), small(off, s - off), small(s - off, s - off)].join(' '),
  };
}

function buddedCross() {
  const w = 76;
  const h = 100;
  const bar = 14;
  const cx = w / 2;
  const barY = 30;
  const lobe = 8;

  // Trefoil of three circles at each arm end.
  const trefoil = (x, y, dx, dy) => {
    const px = -dy;
    const py = dx;
    return [
      circle(x + dx * lobe * 0.5, y + dy * lobe * 0.5, lobe),
      circle(x + px * lobe * 0.95, y + py * lobe * 0.95, lobe * 0.82),
      circle(x - px * lobe * 0.95, y - py * lobe * 0.95, lobe * 0.82),
    ].join(' ');
  };

  return {
    w, h,
    d: [
      rect(cx - bar / 2, lobe, bar, h - lobe * 2),
      rect(lobe, barY, w - lobe * 2, bar),
      trefoil(cx, lobe + 1, 0, -1),
      trefoil(cx, h - lobe - 1, 0, 1),
      trefoil(lobe + 1, barY + bar / 2, -1, 0),
      trefoil(w - lobe - 1, barY + bar / 2, 1, 0),
    ].join(' '),
  };
}

function anchorCross() {
  const w = 72;
  const h = 104;
  const cx = w / 2;
  const stem = 11;
  const t = 10;
  const flukeR = 26;
  const flukeY = 66;

  // Barbs at the ends of the fluke, angled outward.
  const barb = (dir) => {
    const x = cx + dir * flukeR;
    return poly([
      [x - dir * (t / 2), flukeY + 2],
      [x + dir * (t / 2 + 9), flukeY - 9],
      [x + dir * (t / 2 + 2), flukeY + 9],
    ], true);
  };

  return {
    w, h,
    d: [
      ring(cx, 12, 11, 5),
      rect(cx - stem / 2, 14, stem, h - 20),
      rect(cx - 25, 28, 50, 9),
      arcBand(cx, flukeY, flukeR, t, 0, Math.PI),
      barb(1),
      barb(-1),
      circle(cx, h - 4, 6),
    ].join(' '),
  };
}

function ichthys() {
  // Solid silhouette. The traditional two-arc outline is a stroke, and a stroke
  // thin enough to read as one disappears on slate.
  return {
    w: 100, h: 62,
    d:
      'M100 31 ' +
      'C82 9 52 2 28 16 ' +
      'L0 2 ' +
      'C9 20 9 42 0 60 ' +
      'L28 46 ' +
      'C52 60 82 53 100 31 Z',
  };
}

function chiRho() {
  const w = 92;
  const h = 104;
  const stemX = 44;
  const t = 12;

  /** A bar of thickness `t` from one point to another. */
  const bar = (x0, y0, x1, y1, width) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const nx = (-(y1 - y0) / len) * (width / 2);
    const ny = ((x1 - x0) / len) * (width / 2);
    return poly([[x0 + nx, y0 + ny], [x0 - nx, y0 - ny], [x1 - nx, y1 - ny], [x1 + nx, y1 + ny]], true);
  };

  // The chi sits low so the rho's bowl has the top of the stem to itself.
  const cy = 66;
  return {
    w, h,
    d: [
      bar(stemX - 30, cy - 30, stemX + 30, cy + 30, t + 1),
      bar(stemX + 30, cy - 30, stemX - 30, cy + 30, t + 1),
      rect(stemX - t / 2, 2, t, h - 4),
      ring(stemX + 14, 21, 19, 9),
    ].join(' '),
  };
}

function crownOfThorns() {
  const r = 38;
  const c = 50;
  const parts = [ring(c, c, r, r - 9)];
  const count = 14;

  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    const out = i % 2 === 0;
    const base = out ? r - 2 : r - 7;
    const len = out ? 11 : -9;
    const [bx, by] = at(c, c, base, a);
    const [tx, ty] = at(c, c, base + len, a + (out ? 0.16 : -0.16));
    const px = -Math.sin(a) * 3.4;
    const py = Math.cos(a) * 3.4;
    parts.push(poly([[bx + px, by + py], [tx, ty], [bx - px, by - py]], true));
  }
  return { w: 100, h: 100, d: parts.join(' ') };
}

function sacredHeart() {
  const parts = [
    heart(50, 26, 74, 66),
    // Cross rising from the top of the heart.
    rect(45, 0, 10, 30),
    rect(33, 8, 34, 10),
  ];
  // Rays of flame behind the cross.
  for (const dx of [-20, 0, 20]) parts.push(flame(50 + dx, 22, 13, dx === 0 ? 0 : 16));
  return { w: 100, h: 92, d: parts.filter(Boolean).join(' ') };
}

function triquetra() {
  // Three overlapping circle bands. The classic trinity knot without the
  // over-under weave, which needs breaks the fill rule cannot express.
  const c = 50;
  const r = 29;
  const d = 17;
  const t = 8;
  const parts = [0, 1, 2].map((i) => {
    const a = -Math.PI / 2 + (i * TAU) / 3;
    const [cx, cy] = at(c, c, d, a);
    return ring(cx, cy, r, r - t);
  });
  return { w: 100, h: 100, d: parts.join(' ') };
}

function starOfDavid() {
  // Interlaced: two triangular bands. Under nonzero winding their union is the
  // familiar open Magen David.
  return {
    w: 100, h: 88,
    d: `${triangleRing(50, 44, 44, 9, true)} ${triangleRing(50, 44, 44, 9, false)}`,
  };
}

const starOfDavidSolid = () => ({
  w: 100, h: 88,
  d: star(50, 44, 44, 44 / Math.sqrt(3), 6, -Math.PI / 2),
});

function menorah() {
  const cx = 50;
  const h = 104;
  const t = 6;
  const top = 34; // height every branch rises to

  const parts = [
    rect(cx - t / 2, top, t, 52),                                            // shaft
    poly([[cx - 10, 84], [cx + 10, 84], [cx + 17, 96], [cx - 17, 96]], true), // stand
    rect(cx - 21, 96, 42, 8),                                                 // foot
  ];

  // Each arm is a quarter turn leaving the shaft and arriving vertical at the
  // top line. Centring the arc at (cx ∓ r, top + r) puts one end on the shaft
  // and the other exactly at the branch height, so all seven lights align.
  // Sweep direction matters: each arc has to rise from the shaft, so the right
  // arm runs π → 3π/2. Going to -π/2 instead is the same endpoint reached the
  // other way round, and it swings the branch down through the base.
  for (const r of [16, 29, 42]) {
    parts.push(arcBand(cx - r, top + r, r, t, 0, -Math.PI / 2));
    parts.push(arcBand(cx + r, top + r, r, t, Math.PI, Math.PI * 1.5));
  }

  for (const dx of [-42, -29, -16, 0, 16, 29, 42]) {
    parts.push(rect(cx + dx - 5, top - 7, 10, 8));
    parts.push(flame(cx + dx, top - 8, 10, 14));
  }

  return { w: 100, h, d: parts.join(' ') };
}

function dove() {
  // Assembled from the same leaf primitive as the olive branch: a tapered body,
  // a swept wing and a fanned tail read as a bird far more reliably than a
  // freehand outline does.
  const parts = [
    leaf(20, 44, -0.26, 56, 11),        // body, nose up towards the head
    circle(75, 29, 9),                  // head
    poly([[82, 26], [96, 30], [82, 34]], true), // beak
    leaf(46, 38, -2.05, 44, 14),        // wing, swept up and back
    leaf(24, 44, 2.72, 30, 6),          // tail feathers
    leaf(24, 46, 3.02, 32, 6),
    leaf(24, 48, 3.32, 29, 6),
  ];
  return { w: 100, h: 76, d: parts.join(' ') };
}

function oliveBranch() {
  const parts = [
    // Stem.
    'M4 66 C24 60 48 46 72 24 C78 18 86 12 96 8 ' +
      'C86 14 78 21 72 28 C48 51 24 64 6 70 Z',
  ];
  const leaves = [
    [22, 58, -1.15, 20, 6], [40, 48, -1.0, 22, 6.5], [58, 34, -0.85, 22, 6.5],
    [74, 20, -0.7, 20, 6], [30, 56, 0.35, 17, 5.5], [50, 42, 0.5, 18, 5.5],
    [68, 26, 0.65, 16, 5],
  ];
  for (const [x, y, a, len, wid] of leaves) parts.push(leaf(x, y, a, len, wid));
  return { w: 100, h: 76, d: parts.join(' ') };
}

function crown() {
  const parts = [
    poly([[4, 30], [26, 58], [50, 16], [74, 58], [96, 30], [88, 84], [12, 84]], true),
    rect(8, 84, 84, 12),
  ];
  for (const [x, y] of [[4, 30], [50, 16], [96, 30]]) parts.push(circle(x, y, 7));
  return { w: 100, h: 96, d: parts.join(' ') };
}

const heartSymbol = () => ({ w: 100, h: 90, d: heart(50, 0, 100, 90) });

function starOfBethlehem() {
  // Long lower ray, the way the nativity star is drawn.
  const pts = [
    [50, 0], [58, 42], [100, 50], [58, 58], [50, 130], [42, 58], [0, 50], [42, 42],
  ];
  const parts = [poly(pts, true)];
  for (let i = 0; i < 4; i++) {
    const a = -Math.PI / 4 + (i * Math.PI) / 2;
    const [x1, y1] = at(50, 50, 16, a);
    const [x2, y2] = at(50, 50, 40, a);
    const px = -Math.sin(a) * 3.5;
    const py = Math.cos(a) * 3.5;
    parts.push(poly([[x1 + px, y1 + py], [x2, y2], [x1 - px, y1 - py]], true));
  }
  return { w: 100, h: 130, d: parts.join(' ') };
}

function treeOfLife() {
  const c = 50;
  const parts = [ring(c, c, 48, 41)];

  // Trunk, tapering upward.
  parts.push(poly([[c - 7, 86], [c + 7, 86], [c + 5, 44], [c - 5, 44]], true));
  // Roots below mirror the branches above — the point of the symbol, so they
  // are drawn long enough to actually read against the trunk.
  const limbs = [
    [48, -0.75, 27, 5.5], [48, -2.39, 27, 5.5], [56, -0.32, 23, 5], [56, -2.82, 23, 5],
    [84, 0.75, 24, 5.5], [84, 2.39, 24, 5.5], [79, 0.32, 20, 5], [79, 2.82, 20, 5],
  ];
  for (const [y, a, len, wid] of limbs) parts.push(leaf(c, y, a, len, wid));

  // Canopy, kept clear of the ring so the branches stay visible beneath it.
  for (const [x, y, r] of [[c, 28, 13], [c - 17, 36, 10], [c + 17, 36, 10], [c - 8, 22, 8], [c + 8, 22, 8]]) {
    parts.push(circle(x, y, r));
  }
  return { w: 100, h: 100, d: parts.join(' ') };
}

const crescentStar = () => ({
  w: 100, h: 92,
  d: `${crescent(42, 46, 44, 36, 17)} ${star(84, 30, 17, 7.5, 5, -Math.PI / 2)}`,
});

function crucifix() {
  // Cross plus a stylised corpus. Deliberately a bold silhouette: engraving is
  // a texture rather than a line, and modelled detail turns to mud on slate.
  const w = 78;
  const h = 118;
  const cx = w / 2;
  const parts = [rect(cx - 8, 0, 16, h), rect(0, 28, w, 15)];

  parts.push(circle(cx, 24, 8.5));                                    // head
  parts.push(poly([[cx - 4, 31], [cx + 4, 31], [cx + 3, 37], [cx - 3, 37]], true)); // neck
  parts.push(poly([[cx - 11, 37], [cx + 11, 37], [cx + 8, 66], [cx - 8, 66]], true)); // torso
  parts.push(poly([[cx - 12, 64], [cx + 12, 64], [cx + 11, 74], [cx - 11, 74]], true)); // loincloth

  for (const dir of [-1, 1]) {
    // Arms reaching along the crossbar.
    parts.push(poly([
      [cx + dir * 8, 38], [cx + dir * 30, 33], [cx + dir * 32, 39], [cx + dir * 9, 46],
    ], true));
    // Legs, together and slightly angled.
    parts.push(poly([
      [cx + dir * 2, 72], [cx + dir * 10, 72], [cx + dir * 7, 100], [cx + dir * 1, 100],
    ], true));
  }
  return { w, h, d: parts.join(' ') };
}

function christRedeemer() {
  // Standing figure, arms open. The head is kept near a seventh of the height
  // and the robe flares from narrow shoulders — get either wrong and a robed
  // figure reads as a scarecrow.
  const cx = 50;
  const parts = [
    // A halo does more to place the figure than any amount of modelling, and
    // it is pure geometry — a ring reads at any size.
    ring(cx, 15, 15, 11.5),
    circle(cx, 16, 8),
    rect(cx - 3.5, 22, 7, 6),

    // Robe: narrow at the shoulders, falling to a wide hem.
    'M40 28 C44 25 56 25 60 28 ' +
      'C65 44 70 72 74 106 ' +
      'C66 109 34 109 26 106 ' +
      'C30 72 35 44 40 28 Z',

    // Arms, level and open, tapering towards the hands.
    poly([[cx - 12, 30], [cx - 42, 29], [cx - 42, 37], [cx - 12, 42]], true),
    poly([[cx + 12, 30], [cx + 42, 29], [cx + 42, 37], [cx + 12, 42]], true),
    circle(cx - 44, 33, 5),
    circle(cx + 44, 33, 5),

    // Sleeves hanging from the underside of each arm.
    poly([[cx - 40, 35], [cx - 22, 37], [cx - 20, 54], [cx - 36, 50]], true),
    poly([[cx + 40, 35], [cx + 22, 37], [cx + 20, 54], [cx + 36, 50]], true),
  ];
  return { w: 100, h: 110, d: parts.join(' ') };
}

/**
 * The catalogue. `group` drives the picker's sections.
 */
export const SYMBOLS = [
  { id: 'cross-latin', name: 'Latin cross', group: 'Crosses', ...{ w: 64, h: 100, d: latinCross() } },
  { id: 'cross-flared', name: 'Flared cross', group: 'Crosses', ...flaredCross() },
  { id: 'cross-greek', name: 'Greek cross', group: 'Crosses', w: 100, h: 100, d: `${rect(40, 0, 20, 100)} ${rect(0, 40, 100, 20)}` },
  { id: 'cross-celtic', name: 'Celtic cross', group: 'Crosses', ...celticCross() },
  { id: 'cross-orthodox', name: 'Orthodox cross', group: 'Crosses', ...orthodoxCross() },
  { id: 'cross-jerusalem', name: 'Jerusalem cross', group: 'Crosses', ...jerusalemCross() },
  { id: 'cross-budded', name: 'Budded cross', group: 'Crosses', ...buddedCross() },
  { id: 'cross-anchor', name: 'Anchor cross', group: 'Crosses', ...anchorCross() },

  { id: 'crucifix', name: 'Crucifix', group: 'Christian', ...crucifix() },
  { id: 'christ-redeemer', name: 'Christ, arms open', group: 'Christian', ...christRedeemer() },
  { id: 'ichthys', name: 'Ichthys', group: 'Christian', ...ichthys() },
  { id: 'chi-rho', name: 'Chi-Rho', group: 'Christian', ...chiRho() },
  { id: 'dove', name: 'Dove', group: 'Christian', ...dove() },
  { id: 'crown-of-thorns', name: 'Crown of thorns', group: 'Christian', ...crownOfThorns() },
  { id: 'sacred-heart', name: 'Sacred heart', group: 'Christian', ...sacredHeart() },
  { id: 'triquetra', name: 'Triquetra', group: 'Christian', ...triquetra() },

  { id: 'star-of-david', name: 'Star of David', group: 'Jewish', ...starOfDavid() },
  { id: 'star-of-david-solid', name: 'Star of David, solid', group: 'Jewish', ...starOfDavidSolid() },
  { id: 'menorah', name: 'Menorah', group: 'Jewish', ...menorah() },

  { id: 'flame', name: 'Flame', group: 'Universal', w: 68, h: 100, d: flame(34, 100, 68, 100) },
  { id: 'crown', name: 'Crown', group: 'Universal', ...crown() },
  { id: 'heart', name: 'Heart', group: 'Universal', ...heartSymbol() },
  { id: 'olive-branch', name: 'Olive branch', group: 'Universal', ...oliveBranch() },
  { id: 'star-bethlehem', name: 'Star of Bethlehem', group: 'Universal', ...starOfBethlehem() },
  { id: 'tree-of-life', name: 'Tree of life', group: 'Universal', ...treeOfLife() },

  { id: 'crescent-star', name: 'Crescent and star', group: 'Other traditions', ...crescentStar() },
];

// ── Exact bounds ───────────────────────────────────────────────────────────

/** Real roots of at² + bt + c in (0, 1). */
function rootsIn01(a, b, c) {
  const out = [];
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) > 1e-12) out.push(-c / b);
  } else {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const s = Math.sqrt(disc);
      out.push((-b + s) / (2 * a), (-b - s) / (2 * a));
    }
  }
  return out.filter((t) => t > 0 && t < 1);
}

const cubicAt = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};

const quadAt = (p0, p1, p2, t) => {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
};

/**
 * Tight bounding box of a path, solving each curve's derivative rather than
 * sampling it.
 *
 * The declared design boxes were estimates, and estimates are not good enough
 * here: the height control is in millimetres, so the box is what "24 mm tall"
 * actually means. An anchor whose barbs poke past its nominal width, or a dove
 * that fills three quarters of its box, would quietly come out the wrong size.
 */
export function pathBounds(d) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const hit = (x, y) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  let cx = 0;
  let cy = 0;
  for (const [, cmd, args] of d.matchAll(/([MLCQZ])([^MLCQZ]*)/g)) {
    const v = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);

    if (cmd === 'M' || cmd === 'L') {
      for (let i = 0; i + 1 < v.length; i += 2) {
        cx = v[i];
        cy = v[i + 1];
        hit(cx, cy);
      }
    } else if (cmd === 'C') {
      for (let i = 0; i + 5 < v.length; i += 6) {
        const [x1, y1, x2, y2, x3, y3] = v.slice(i, i + 6);
        hit(cx, cy);
        hit(x3, y3);
        for (const [p0, p1, p2, p3, axis] of [[cx, x1, x2, x3, 'x'], [cy, y1, y2, y3, 'y']]) {
          const a = 3 * (-p0 + 3 * p1 - 3 * p2 + p3);
          const b = 6 * (p0 - 2 * p1 + p2);
          const c = 3 * (p1 - p0);
          for (const t of rootsIn01(a, b, c)) {
            const value = cubicAt(p0, p1, p2, p3, t);
            if (axis === 'x') hit(value, cy);
            else hit(cx, value);
          }
        }
        cx = x3;
        cy = y3;
      }
    } else if (cmd === 'Q') {
      for (let i = 0; i + 3 < v.length; i += 4) {
        const [x1, y1, x2, y2] = v.slice(i, i + 4);
        hit(cx, cy);
        hit(x2, y2);
        for (const [p0, p1, p2, axis] of [[cx, x1, x2, 'x'], [cy, y1, y2, 'y']]) {
          const denom = p0 - 2 * p1 + p2;
          if (Math.abs(denom) > 1e-12) {
            const t = (p0 - p1) / denom;
            if (t > 0 && t < 1) {
              const value = quadAt(p0, p1, p2, t);
              if (axis === 'x') hit(value, cy);
              else hit(cx, value);
            }
          }
        }
        cx = x2;
        cy = y2;
      }
    }
  }

  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Replace every hand-declared box with the measured one, so `w`/`h` describe
// the ink rather than the author's intention.
for (const sym of SYMBOLS) {
  sym.box = pathBounds(sym.d);
  sym.w = sym.box.w;
  sym.h = sym.box.h;
}

export const SYMBOL_GROUPS = [...new Set(SYMBOLS.map((s) => s.group))];

export const symbol = (id) => SYMBOLS.find((s) => s.id === id) || SYMBOLS[0];

/**
 * Map a symbol's path into board millimetres.
 *
 * Every command in this file takes nothing but coordinate pairs, so scaling is
 * a uniform pass over the numbers — no transform attribute, and nothing for an
 * importer to reinterpret.
 */
export function placeSymbol(id, x, y, height) {
  const sym = symbol(id);
  const scale = height / sym.box.h;
  // Offset by the measured origin so the ink — not the author's coordinate
  // space — is what gets centred on `x` and seated at `y`.
  const dx = x - (sym.box.w * scale) / 2 - sym.box.x * scale;
  const dy = y - sym.box.y * scale;

  return sym.d.replace(/([MLCQZ])([^MLCQZ]*)/g, (_, cmd, args) => {
    if (cmd === 'Z') return 'Z';
    const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    const out = [];
    for (let i = 0; i < nums.length; i += 2) {
      out.push(n(nums[i] * scale + dx), n(nums[i + 1] * scale + dy));
    }
    return `${cmd}${out.join(' ')}`;
  });
}

/** Width in mm a symbol occupies at a given height. */
export const symbolWidth = (id, height) => (symbol(id).box.w / symbol(id).box.h) * height;

/** viewBox that frames a symbol tightly, for pickers and previews. */
export const symbolViewBox = (id) => {
  const { x, y, w, h } = symbol(id).box;
  return `${n(x)} ${n(y)} ${n(w)} ${n(h)}`;
};
