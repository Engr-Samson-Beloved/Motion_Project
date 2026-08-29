/**
 * A minimal PNG decoder: zlib inflate plus scanline unfiltering.
 *
 * Enough to answer questions about an asset before it goes into a composition
 * — where the artwork actually sits inside its canvas, what colour a region
 * is — without adding an image library to a project that needs one for
 * nothing else.
 *
 * Handles the 8-bit non-interlaced colour types Figma, Chrome and the usual
 * exporters emit. It is deliberately not a general decoder.
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

/** RGB at a pixel, as [r, g, b]. Palette entries are resolved via PLTE. */
const rgbAt = (png, x, y) => {
  const i = (y * png.width + x) * png.channels;
  switch (png.colorType) {
    case 6:
    case 2:
      return [png.pixels[i], png.pixels[i + 1], png.pixels[i + 2]];
    case 4:
    case 0:
      return [png.pixels[i], png.pixels[i], png.pixels[i]];
    case 3: {
      const p = png.pixels[i] * 3;
      return png.plte ? [png.plte[p], png.plte[p + 1], png.plte[p + 2]] : [0, 0, 0];
    }
    default:
      return [0, 0, 0];
  }
};

const luma = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase();

/** Alpha bounding box of the visible artwork, in pixels. */
const alphaBox = (png, threshold = 16) => {
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;
  let opaque = 0;

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      if (alphaAt(png, x, y) <= threshold) continue;
      opaque++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) return null;
  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    opaque,
    total: png.width * png.height,
  };
};

/** Mean colour of a rectangle, ignoring transparent pixels. */
const meanRgb = (png, x0, y0, w, h) => {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = Math.max(0, y0); y < Math.min(png.height, y0 + h); y++) {
    for (let x = Math.max(0, x0); x < Math.min(png.width, x0 + w); x++) {
      if (alphaAt(png, x, y) <= 16) continue;
      const c = rgbAt(png, x, y);
      r += c[0];
      g += c[1];
      b += c[2];
      n++;
    }
  }
  if (n === 0) return null;
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
};

/* ── Writing ──────────────────────────────────────────────────────────── */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
};

const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};

/**
 * Write 8-bit RGBA back out.
 *
 * Filter 0 on every scanline — no attempt at the adaptive filtering a real
 * encoder does. These are intermediate assets read once by a renderer, so a
 * larger file costs nothing and the simplicity is worth more.
 */
const writePng = (file, { width, height, pixels }) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  fs.writeFileSync(
    file,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", ihdr),
      chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
};

module.exports = { readPng, writePng, alphaAt, rgbAt, alphaBox, meanRgb, luma, hex };
