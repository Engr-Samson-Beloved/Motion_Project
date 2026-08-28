/**
 * Measure the alpha bounding box of a PNG, as fractions of its canvas.
 *
 * Logo files are usually mostly transparent padding. Setting `width` on an
 * <Img> sizes that padding along with the artwork, so the visible logo lands
 * far smaller than asked for. These fractions let a component crop to the
 * artwork and size *that* instead.
 *
 *   node scripts/measure-png.js public/skng-logo.png
 */

const fs = require("fs");
const zlib = require("zlib");

const readPng = (file) => {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`${file} is not a PNG`);

  let off = 8;
  let ihdr = null;
  const idat = [];
  let plte = null;
  let trns = null;

  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        depth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === "IDAT") idat.push(data);
    else if (type === "PLTE") plte = data;
    else if (type === "tRNS") trns = data;
    else if (type === "IEND") break;
    off += 12 + len;
  }

  if (!ihdr) throw new Error("no IHDR");
  if (ihdr.interlace !== 0) throw new Error("interlaced PNGs are not supported");
  if (ihdr.depth !== 8) throw new Error(`bit depth ${ihdr.depth} is not supported`);

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ihdr.colorType];
  if (!channels) throw new Error(`colour type ${ihdr.colorType} is not supported`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = ihdr.width * bpp;
  const out = Buffer.alloc(stride * ihdr.height);

  // Undo the per-scanline filters. Each row is prefixed with its filter byte.
  for (let y = 0; y < ihdr.height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;

    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = src[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }

  return { ...ihdr, channels, pixels: out, plte, trns };
};

const alphaAt = (png, x, y) => {
  const i = (y * png.width + x) * png.channels;
  switch (png.colorType) {
    case 6:
      return png.pixels[i + 3];
    case 4:
      return png.pixels[i + 1];
    case 3: {
      const idx = png.pixels[i];
      return png.trns && idx < png.trns.length ? png.trns[idx] : 255;
    }
    default:
      return 255;
  }
};

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/measure-png.js <file.png>");
  process.exit(1);
}

const png = readPng(file);
const THRESHOLD = 16; // ignore near-invisible antialiasing fringe

let minX = png.width;
let minY = png.height;
let maxX = -1;
let maxY = -1;
let opaque = 0;

for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    if (alphaAt(png, x, y) <= THRESHOLD) continue;
    opaque++;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

if (maxX < 0) {
  console.log(`${file}: fully transparent`);
  process.exit(0);
}

const total = png.width * png.height;
const w = maxX - minX + 1;
const h = maxY - minY + 1;
const f = (n) => n.toFixed(4);

console.log(`${file}`);
console.log(`  canvas       ${png.width} x ${png.height}  (colour type ${png.colorType})`);
console.log(`  artwork px   ${w} x ${h}  at (${minX}, ${minY})`);
console.log(`  transparent  ${(100 - (opaque / total) * 100).toFixed(1)}%`);
console.log(
  `  bbox         { x: ${f(minX / png.width)}, y: ${f(minY / png.height)}, ` +
    `w: ${f(w / png.width)}, h: ${f(h / png.height)} }`,
);
console.log(`  aspect       ${(w / h).toFixed(4)}`);
