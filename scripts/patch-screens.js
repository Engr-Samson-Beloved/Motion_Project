/**
 * Paint the capture tool's floating widget out of the device mockups, and
 * report where the screen sits inside each one.
 *
 * Every shot in `public/screens/` carries the same black circular widget near
 * the right edge, a little over halfway down. It is not part of the product —
 * it sits *over* the app, covering a Connect button on one screen and crowding
 * the close button on another — so leaving it in would put a control in the
 * film that does not exist in the app.
 *
 * Two things had to be measured rather than assumed:
 *
 *   The screen rect. The device frame is light silver, not dark, so a plain
 *   luma threshold finds nothing. What separates frame from screen is a thin
 *   *black ring* between them. Scanning inward for the first dark run and
 *   taking what follows locates the screen exactly.
 *
 *   The widget. A fixed search window is fragile — the first attempt reached
 *   the bezel and grew the disc from 40px to 110px, so the fill spilled over
 *   the frame. Flood-filling the dark region from a seed cannot do that.
 *
 * The disc is then filled by inverse-distance blending of four boundary
 * samples, clamped to the screen rect so nothing is ever painted onto the
 * frame. On a flat field that is exact; over a photograph it reads as a soft
 * smear, still far less distracting than a black circle on someone's shoulder.
 *
 * Originals are kept in `public/screens/raw/`, so this is repeatable.
 *
 *   node scripts/patch-screens.js
 */

const fs = require("fs");
const path = require("path");
const { readPng, writePng, alphaAt, rgbAt, luma, hex } = require("./lib/png");

const DIR = path.join("public", "screens");
const RAW = path.join(DIR, "raw");

// Flat mint behind the widget here, which is what the locator wants.
const REFERENCE = "inbox.png";
const SEED = { x: 715, y: 906 };

const RING = 45; // the black ring between frame and screen
const WIDGET = 110; // the widget body; the app draws nothing this dark here
const PAD = 4; // grow the disc past its antialiased rim

/* ── Geometry ─────────────────────────────────────────────────────────── */

/**
 * The screen rect inside the device frame.
 *
 * Walks in from each canvas edge, skips anything transparent, crosses the
 * black ring, and stops at the first pixel after it.
 */
const screenRect = (png) => {
  const lum = (x, y) => (alphaAt(png, x, y) <= 16 ? null : luma(rgbAt(png, x, y)));

  // The frame is drawn with a thin dark contour at its outer edge as well, so
  // the first dark run inward is not the bezel. Keep going until a dark run is
  // thick enough to be one: the bezel is tens of pixels, the contour is two or
  // three. Taking the first run put the screen edge at x=8 and gave an aspect
  // of 0.494, where this device's screen is 0.461.
  const MIN_RING = 8;

  const inward = (fixed, from, to, axis) => {
    const step = to > from ? 1 : -1;
    const at = (i) => (axis === "x" ? lum(i, fixed) : lum(fixed, i));
    let i = from;
    while (i !== to) {
      while (i !== to && (at(i) === null || at(i) >= RING)) i += step;
      const start = i;
      while (i !== to && at(i) !== null && at(i) < RING) i += step;
      if (Math.abs(i - start) >= MIN_RING) return i;
    }
    return i;
  };

  const midY = Math.round(png.height / 2);
  const left = inward(midY, 0, png.width - 1, "x");
  const right = inward(midY, png.width - 1, 0, "x");
  // A little in from the screen's own left edge, clear of the Dynamic Island.
  const probeX = left + 30;
  const top = inward(probeX, 0, png.height - 1, "y");
  const bottom = inward(probeX, png.height - 1, 0, "y");

  return { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
};

/** Bounding box of the dark blob containing `seed`, by flood fill. */
const floodBox = (png, seed) => {
  const seen = new Uint8Array(png.width * png.height);
  const stack = [[seed.x, seed.y]];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -1;
  let maxY = -1;
  let n = 0;

  const dark = (x, y) =>
    alphaAt(png, x, y) > 16 && luma(rgbAt(png, x, y)) < WIDGET;

  if (!dark(seed.x, seed.y)) {
    // The seed can land on the widget's light icon rather than its body.
    // Nudge outward until it finds the body.
    let found = false;
    for (let r = 1; r <= 40 && !found; r++) {
      for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r]]) {
        if (dark(seed.x + dx, seed.y + dy)) {
          stack[0] = [seed.x + dx, seed.y + dy];
          found = true;
          break;
        }
      }
    }
    if (!found) throw new Error("no dark pixel near the seed");
  }

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
    const i = y * png.width + x;
    if (seen[i]) continue;
    seen[i] = 1;
    if (!dark(x, y)) continue;
    n++;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return { minX, minY, maxX, maxY, n };
};

/* ── Fill ─────────────────────────────────────────────────────────────── */

/** A boundary sample, or null if it left the screen rect. */
const sample = (png, rect, x, y) => {
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (xi < rect.x || yi < rect.y) return null;
  if (xi >= rect.x + rect.w || yi >= rect.y + rect.h) return null;
  if (alphaAt(png, xi, yi) <= 16) return null;
  return rgbAt(png, xi, yi);
};

const fill = (png, disc, rect) => {
  const { cx, cy, r } = disc;
  const out = Buffer.from(png.pixels);
  const stride = png.width * 4;

  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (Math.hypot(dx, dy) > r) continue;
      // Never paint onto the device frame.
      if (x < rect.x || y < rect.y) continue;
      if (x >= rect.x + rect.w || y >= rect.y + rect.h) continue;

      const span = Math.sqrt(Math.max(1, r * r - dy * dy));
      const spanY = Math.sqrt(Math.max(1, r * r - dx * dx));
      const points = [
        [sample(png, rect, cx - span - 2, y), Math.abs(x - (cx - span - 2))],
        [sample(png, rect, cx + span + 2, y), Math.abs(x - (cx + span + 2))],
        [sample(png, rect, x, cy - spanY - 2), Math.abs(y - (cy - spanY - 2))],
        [sample(png, rect, x, cy + spanY + 2), Math.abs(y - (cy + spanY + 2))],
      ].filter(([c]) => c);

      if (points.length === 0) continue;

      let wsum = 0;
      let r0 = 0;
      let g0 = 0;
      let b0 = 0;
      for (const [c, dist] of points) {
        const w = 1 / Math.max(1, dist);
        wsum += w;
        r0 += c[0] * w;
        g0 += c[1] * w;
        b0 += c[2] * w;
      }

      const i = y * stride + x * 4;
      out[i] = Math.round(r0 / wsum);
      out[i + 1] = Math.round(g0 / wsum);
      out[i + 2] = Math.round(b0 / wsum);
      out[i + 3] = 255;
    }
  }

  return out;
};

/* ── Run ──────────────────────────────────────────────────────────────── */

if (!fs.existsSync(RAW)) fs.mkdirSync(RAW, { recursive: true });

// Move anything still in place across to raw/ so re-runs start from the
// untouched capture. Never overwrite a file already in raw/: on a second run
// the file in DIR is a patched copy, and moving it would destroy the original.
for (const name of fs.readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".png"))) {
  const kept = path.join(RAW, name);
  if (fs.existsSync(kept)) fs.unlinkSync(path.join(DIR, name));
  else fs.renameSync(path.join(DIR, name), kept);
}

const raws = fs
  .readdirSync(RAW)
  .filter((f) => f.toLowerCase().endsWith(".png"))
  .sort();

if (!raws.includes(REFERENCE)) {
  throw new Error(`reference ${REFERENCE} not found in ${RAW}`);
}

const ref = readPng(path.join(RAW, REFERENCE));
const box = floodBox(ref, SEED);
const disc = {
  cx: (box.minX + box.maxX) / 2,
  cy: (box.minY + box.maxY) / 2,
  r: Math.max(box.maxX - box.minX, box.maxY - box.minY) / 2 + PAD,
};

console.log(
  `widget  ${box.maxX - box.minX + 1} x ${box.maxY - box.minY + 1} px ` +
    `(${box.n} dark) -> centre (${disc.cx}, ${disc.cy}) radius ${disc.r}`,
);

const f = (n) => n.toFixed(4);

for (const name of raws) {
  const png = readPng(path.join(RAW, name));
  const rect = screenRect(png);
  const pixels = fill(png, disc, rect);
  writePng(path.join(DIR, name), { width: png.width, height: png.height, pixels });
  const i = Math.round(disc.cy) * png.width * 4 + Math.round(disc.cx) * 4;
  console.log(
    `  ${name.padEnd(18)} screen ${String(rect.w).padStart(4)} x ${rect.h} ` +
      `at (${rect.x}, ${rect.y})  ` +
      `{ x: ${f(rect.x / png.width)}, y: ${f(rect.y / png.height)}, ` +
      `w: ${f(rect.w / png.width)}, h: ${f(rect.h / png.height)} }  ` +
      `patched ${hex([pixels[i], pixels[i + 1], pixels[i + 2]])}`,
  );
}
