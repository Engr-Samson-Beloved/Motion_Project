/**
 * Probe the captured device mockups in `public/screens/`.
 *
 * These arrive as rendered iPhone mockups, not raw screenshots: the artwork is
 * a device with a bezel, and the screen sits somewhere inside it. Before any
 * of them can be pushed into, masked, or aligned to a layout, three things
 * have to be known, and none of them can be eyeballed reliably:
 *
 *   1. whether the canvas has transparent margins, and how much
 *   2. where the *screen* is inside the canvas, as fractions — so a push-in
 *      frames content rather than bezel
 *   3. the local background colour behind the capture tool's floating widget,
 *      so it can be patched out
 *
 *   node scripts/probe-screens.js [dir]
 */

const fs = require("fs");
const path = require("path");
const { readPng, alphaAt, alphaBox, meanRgb, rgbAt, luma, hex } = require("./lib/png");

const dir = process.argv[2] || path.join("public", "screens");

/**
 * Walk inward from both ends of a scanline until the bezel stops.
 *
 * The bezel is the darkest thing in the artwork by a wide margin, so a plain
 * luma threshold finds it — but the app's own header is dark green and the
 * Dynamic Island is black, so this only ever scans lines chosen to miss them.
 */
const edges = (png, fixed, from, to, axis, dark) => {
  const at = (i) => (axis === "x" ? rgbAt(png, i, fixed) : rgbAt(png, fixed, i));
  const solid = (i) =>
    axis === "x" ? alphaAt(png, i, fixed) > 16 : alphaAt(png, fixed, i) > 16;

  let lo = from;
  while (lo < to && (!solid(lo) || luma(at(lo)) < dark)) lo++;
  let hi = to;
  while (hi > lo && (!solid(hi) || luma(at(hi)) < dark)) hi--;
  return [lo, hi];
};

const files = fs
  .readdirSync(dir)
  .filter((f) => f.toLowerCase().endsWith(".png"))
  .sort();

if (files.length === 0) {
  console.error(`no PNGs in ${dir}`);
  process.exit(1);
}

const f = (n) => n.toFixed(4);

for (const name of files) {
  const png = readPng(path.join(dir, name));
  const box = alphaBox(png);
  console.log(`\n${name}`);
  console.log(`  canvas      ${png.width} x ${png.height}  (colour type ${png.colorType})`);

  if (!box) {
    console.log("  fully transparent");
    continue;
  }

  const clear = 100 - (box.opaque / box.total) * 100;
  console.log(`  artwork     ${box.w} x ${box.h} at (${box.x}, ${box.y})`);
  console.log(`  transparent ${clear.toFixed(1)}%`);

  // Mid-height misses both the Dynamic Island and the home indicator.
  const midY = box.y + Math.round(box.h * 0.5);
  const [sx0, sx1] = edges(png, midY, box.x, box.x + box.w - 1, "x", 60);

  // A quarter across misses the Island; the app's header is dark green, so
  // the vertical scan needs a lower threshold than the horizontal one and is
  // reported for confirmation rather than trusted blind.
  const quarterX = sx0 + Math.round((sx1 - sx0) * 0.25);
  const [sy0, sy1] = edges(png, quarterX, box.y, box.y + box.h - 1, "y", 45);

  const sw = sx1 - sx0 + 1;
  const sh = sy1 - sy0 + 1;
  console.log(`  screen      ${sw} x ${sh} at (${sx0}, ${sy0})  aspect ${(sw / sh).toFixed(4)}`);
  console.log(
    `  SCREEN      { x: ${f(sx0 / png.width)}, y: ${f(sy0 / png.height)}, ` +
      `w: ${f(sw / png.width)}, h: ${f(sh / png.height)} }`,
  );

  // The capture tool's floating widget sits in the same place on every shot.
  // Sample a ring just outside it to find what should be painted over it.
  const wx = Math.round(png.width * 0.889);
  const wy = Math.round(png.height * 0.553);
  const ring = [
    meanRgb(png, wx - 70, wy - 12, 22, 24),
    meanRgb(png, wx + 52, wy - 12, 18, 24),
    meanRgb(png, wx - 12, wy - 74, 24, 20),
    meanRgb(png, wx - 12, wy + 56, 24, 20),
  ].filter(Boolean);
  console.log(`  widget at   (${wx}, ${wy})  ring ${ring.map(hex).join(" ")}`);
}
