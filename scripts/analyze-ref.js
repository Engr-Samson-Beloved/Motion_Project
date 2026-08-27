#!/usr/bin/env node
/**
 * Turn a reference image or video into a style profile.
 *
 *   node scripts/analyze-ref.js refs/something.mp4
 *   node scripts/analyze-ref.js refs/frame.png --out=refs/frame.json
 *
 * The point is to replace adjectives with numbers. "Fast and punchy" is not
 * something anyone can build against; "cuts every 17 frames, consistent with
 * 106 BPM, five dominant colours" is.
 *
 * For video it finds the cut points by frame differencing, which gives the
 * reference's actual cutting rhythm — and then checks whether those cuts sit on
 * a musical grid, so a piece can be timed to match instead of guessed at.
 *
 * No dependencies. Uses ffmpeg to decode to small PNGs and reads those directly.
 *
 * Note on ffmpeg: Remotion's bundled binary is the default, and it is a stripped
 * build (no fps filter, no rawvideo muxer) which is why this writes PNG files
 * rather than piping raw frames. It is also the binary the file infector on this
 * machine keeps replacing — pass --ffmpeg=<path> to use a known-clean copy.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const zlib = require("zlib");
const { execFileSync } = require("child_process");

/* ── args ─────────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const input = argv.find((a) => !a.startsWith("--"));
const flag = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

if (!input) {
  console.error("usage: node scripts/analyze-ref.js <image|video> [--out=...] [--ffmpeg=...] [--sample-fps=15]");
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`not found: ${input}`);
  process.exit(1);
}

const REPO = path.resolve(__dirname, "..");
const FFMPEG = flag(
  "ffmpeg",
  path.join(REPO, "node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"),
);
const FFPROBE = flag("ffprobe", FFMPEG.replace(/ffmpeg(-clean)?\.exe$/i, "ffprobe$1.exe"));
const SAMPLE_FPS = Number(flag("sample-fps", "15"));
const OUT = flag("out", path.join(REPO, "refs", `${path.parse(input).name}.json`));

/* ── tiny PNG reader (8-bit, non-interlaced) ──────────────────────────── */

const readPng = (file) => {
  const buf = fs.readFileSync(file);
  let pos = 8;
  let ihdr = null;
  const idat = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      ihdr = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), colorType: data[9] };
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ihdr.colorType];
  const stride = ihdr.width * channels;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(ihdr.height * stride);

  for (let y = 0; y < ihdr.height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const bb = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let v = src[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += bb;
      else if (filter === 3) v += (a + bb) >> 1;
      else if (filter === 4) {
        const p = a + bb - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - bb), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c;
      }
      cur[x] = v & 0xff;
    }
  }
  return { width: ihdr.width, height: ihdr.height, channels, stride, pixels: out };
};

/* ── probe ────────────────────────────────────────────────────────────── */

const probe = () => {
  const raw = execFileSync(
    FFPROBE,
    ["-v", "error", "-select_streams", "v:0",
     "-show_entries", "stream=width,height,r_frame_rate,nb_frames",
     "-show_entries", "format=duration",
     "-of", "default=noprint_wrappers=1", input],
    { encoding: "utf8" },
  );
  const get = (k) => (raw.match(new RegExp(`^${k}=(.*)$`, "m")) || [])[1];
  const rate = (get("r_frame_rate") || "0/1").split("/").map(Number);
  return {
    width: Number(get("width")),
    height: Number(get("height")),
    fps: rate[1] ? rate[0] / rate[1] : 0,
    duration: Number(get("duration")) || 0,
  };
};

/* ── colour ───────────────────────────────────────────────────────────── */

const hex = (r, g, b) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

const luminance = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/**
 * Dominant colours by coarse quantisation.
 *
 * 5 bits per channel is deliberately coarse: at 8 bits every pixel of a
 * gradient is its own bucket and the "palette" comes back as noise.
 */
const palette = (frames, topN = 6) => {
  const bins = new Map();
  for (const f of frames) {
    const { pixels, channels, width, height } = f;
    for (let i = 0; i < width * height; i++) {
      const o = i * channels;
      const r = pixels[o], g = pixels[o + 1], b = pixels[o + 2];
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      const cur = bins.get(key);
      if (cur) { cur.n++; cur.r += r; cur.g += g; cur.b += b; }
      else bins.set(key, { n: 1, r, g, b });
    }
  }
  const total = [...bins.values()].reduce((n, v) => n + v.n, 0);
  return [...bins.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, topN)
    .map((v) => ({
      hex: hex(v.r / v.n, v.g / v.n, v.b / v.n),
      share: +(v.n / total).toFixed(4),
      luminance: +luminance(v.r / v.n, v.g / v.n, v.b / v.n).toFixed(3),
    }));
};

/* ── cut detection ────────────────────────────────────────────────────── */

const meanAbsDiff = (a, b) => {
  let sum = 0;
  const n = Math.min(a.pixels.length, b.pixels.length);
  for (let i = 0; i < n; i++) sum += Math.abs(a.pixels[i] - b.pixels[i]);
  return sum / n / 255;
};

const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * A cut is a spike in frame-to-frame difference.
 *
 * The threshold is median + k * MAD rather than a fixed number, because a
 * high-contrast reference and a muted one have completely different baseline
 * difference levels and a fixed threshold finds everything or nothing.
 */
const detectCuts = (diffs, minGapSamples, k = 9) => {
  const med = median(diffs);
  const mad = median(diffs.map((d) => Math.abs(d - med))) || 1e-6;
  const threshold = Math.max(med + k * mad, 0.08);
  const cuts = [];
  for (let i = 1; i < diffs.length; i++) {
    // i is the index of the diff between sample i and i+1, so the cut lands on
    // the later frame.
    //
    // The gap matters more than it looks. A hard cut is one spike, but a fast
    // move — a motion-blurred slam, a whip, a shader transition — is a run of
    // large diffs that otherwise registers as several cuts a few frames apart.
    // Tested against a piece known to have 12 cuts, no gap gave 22.
    if (diffs[i] > threshold && (cuts.length === 0 || i - cuts[cuts.length - 1] >= minGapSamples)) {
      cuts.push(i + 1);
    }
  }
  return { cuts, threshold: +threshold.toFixed(4), baseline: +med.toFixed(4) };
};

/**
 * Best-fitting tempo for a set of cut positions.
 *
 * Scores each candidate BPM by how close the cuts sit to its beat grid. A low
 * error means the reference was cut to music, and its grid can be reused
 * directly. A high error means the cutting is not musical and the shot-length
 * statistics are the thing to copy instead.
 */
const fitTempo = (cutSeconds, fps) => {
  if (cutSeconds.length < 3) return null;
  let best = null;
  for (let bpm = 60; bpm <= 180; bpm += 0.25) {
    const beat = 60 / bpm;
    let err = 0;
    for (const t of cutSeconds) {
      const off = Math.abs(t / beat - Math.round(t / beat));
      err += Math.min(off, 1 - off);
    }
    err /= cutSeconds.length;
    if (!best || err < best.error) {
      best = { bpm: +bpm.toFixed(2), error: +err.toFixed(4), beatFrames: +(fps * beat).toFixed(2) };
    }
  }
  // 0 is a perfect grid, 0.25 is random. Below ~0.12 is a real match.
  best.confidence = +Math.max(0, 1 - best.error / 0.25).toFixed(3);
  return best;
};

/* ── extract ──────────────────────────────────────────────────────────── */

const run = () => {
  const info = probe();
  const isVideo = info.duration > 0.5;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ref-"));

  // 64px wide is plenty: cut detection and palette both work on gross change,
  // and small frames keep a 60s reference under a second of decoding.
  const w = 64;
  const h = Math.max(2, Math.round((w * info.height) / info.width / 2) * 2);

  const args = ["-v", "error", "-i", input, "-vf", `scale=w=${w}:h=${h}`];
  if (isVideo) args.push("-r", String(SAMPLE_FPS));
  else args.push("-frames:v", "1");
  args.push("-f", "image2", path.join(tmp, "%05d.png"));
  execFileSync(FFMPEG, args);

  const files = fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
  const frames = files.map((f) => readPng(path.join(tmp, f)));

  const profile = {
    source: path.relative(REPO, path.resolve(input)).replace(/\\/g, "/"),
    kind: isVideo ? "video" : "image",
    width: info.width,
    height: info.height,
    aspect: +(info.width / info.height).toFixed(4),
    orientation:
      info.width / info.height > 1.05 ? "landscape" : info.width / info.height < 0.95 ? "portrait" : "square",
    palette: palette(frames),
  };

  if (isVideo) {
    profile.fps = +info.fps.toFixed(3);
    profile.durationSeconds = +info.duration.toFixed(2);
    profile.sampleFps = SAMPLE_FPS;

    const diffs = [];
    for (let i = 1; i < frames.length; i++) diffs.push(meanAbsDiff(frames[i - 1], frames[i]));

    // Ignore anything closer together than a third of a second: below that it
    // is a fast move within a shot, not two shots.
    const minGap = Math.max(2, Math.round(SAMPLE_FPS / 3));
    const { cuts, threshold, baseline } = detectCuts(diffs, minGap);
    const cutSeconds = cuts.map((i) => +(i / SAMPLE_FPS).toFixed(3));
    const shots = [];
    for (let i = 1; i < cutSeconds.length; i++) shots.push(cutSeconds[i] - cutSeconds[i - 1]);

    profile.cutting = {
      cuts: cutSeconds.length,
      cutsPerMinute: +((cutSeconds.length / info.duration) * 60).toFixed(1),
      threshold,
      baseline,
      shotSeconds: {
        median: +median(shots).toFixed(3),
        mean: shots.length ? +(shots.reduce((a, b) => a + b, 0) / shots.length).toFixed(3) : 0,
        min: shots.length ? +Math.min(...shots).toFixed(3) : 0,
        max: shots.length ? +Math.max(...shots).toFixed(3) : 0,
      },
      medianShotFrames30: +(median(shots) * 30).toFixed(1),
      cutSeconds,
    };
    profile.tempo = fitTempo(cutSeconds, info.fps || 30);
  } else {
    const lum = profile.palette.reduce((n, p) => n + p.luminance * p.share, 0) /
      profile.palette.reduce((n, p) => n + p.share, 0);
    profile.key = lum < 0.35 ? "low-key (dark)" : lum > 0.65 ? "high-key (light)" : "mid-key";
    profile.meanLuminance = +lum.toFixed(3);
  }

  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(profile, null, 2));

  /* ── summary ───────────────────────────────────────────────────────── */

  console.log(`\n${profile.source}  ${profile.width}x${profile.height}  ${profile.orientation}  (${profile.kind})`);
  console.log(`\npalette`);
  for (const p of profile.palette) {
    console.log(`  ${p.hex}  ${(p.share * 100).toFixed(1).padStart(5)}%  lum ${p.luminance.toFixed(2)}`);
  }

  if (profile.cutting) {
    const c = profile.cutting;
    console.log(`\ncutting`);
    console.log(`  ${c.cuts} cuts over ${profile.durationSeconds}s  (${c.cutsPerMinute}/min)`);
    console.log(`  shot length: median ${c.shotSeconds.median}s  mean ${c.shotSeconds.mean}s  range ${c.shotSeconds.min}-${c.shotSeconds.max}s`);
    console.log(`  median shot = ${c.medianShotFrames30} frames at 30fps`);
    if (profile.tempo) {
      const t = profile.tempo;
      const verdict = t.confidence > 0.5 ? "cut to music" : "not on a musical grid";
      console.log(`\ntempo`);
      console.log(`  best fit ${t.bpm} BPM  (${t.beatFrames} frames/beat)  confidence ${t.confidence}  -> ${verdict}`);
      if (t.confidence > 0.5) {
        console.log(`  to match: set BPM ${Math.round(t.bpm)} and make every scene a multiple of ${Math.round(t.beatFrames)} frames`);
      } else {
        console.log(`  to match: ignore tempo, target a ${c.medianShotFrames30}-frame median shot`);
      }
    }
  } else {
    console.log(`\nkey  ${profile.key}  (mean luminance ${profile.meanLuminance})`);
  }

  console.log(`\nwritten to ${path.relative(REPO, OUT).replace(/\\/g, "/")}\n`);
};

run();
