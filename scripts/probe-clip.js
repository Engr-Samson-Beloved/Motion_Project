/**
 * Measure a screen recording, and optionally pull exact frames out of it.
 *
 *   node scripts/probe-clip.js public/screens/scroll.mp4
 *   node scripts/probe-clip.js public/screens/scroll.mp4 --stills 0.5,2.25,4
 *
 * Without `--stills` it prints the `clip(...)` literal for `tour/clip.tsx`,
 * plus the source's own frame rate — which matters, because a recording made
 * at 60fps and played in a 30fps composition is running at half speed unless
 * `speed` says otherwise.
 *
 * With `--stills` it writes PNGs at the given timestamps (seconds) next to the
 * recording. That is usually the better path: a recording holds every
 * intermediate state of a scroll or a transition, so it is a far richer source
 * of stills than a screenshot session, and stills animate on the beat grid
 * where a played clip carries its own timing.
 *
 * Uses the ffmpeg that ships with @remotion/compositor, so there is no system
 * ffmpeg to install — and one fewer binary for the file infector to find.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const bin = (name) =>
  path.resolve(
    __dirname,
    "..",
    "node_modules",
    "@remotion",
    "compositor-win32-x64-msvc",
    name,
  );

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/probe-clip.js <file.mp4> [--stills 1.0,2.5]");
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`${file} not found`);
  process.exit(1);
}

const out = execFileSync(
  bin("ffprobe.exe"),
  [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height,r_frame_rate,nb_frames,duration",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1",
    file,
  ],
  { encoding: "utf8" },
);

const field = (k) => {
  const m = out.match(new RegExp(`^${k}=(.+)$`, "m"));
  return m ? m[1].trim() : null;
};

const width = Number(field("width"));
const height = Number(field("height"));
const rate = field("r_frame_rate") || "0/1";
const [num, den] = rate.split("/").map(Number);
const fps = den ? num / den : 0;
const duration = Number(field("duration"));
const nb = Number(field("nb_frames"));

// nb_frames is absent from some containers; fall back to duration x rate.
const srcFrames = Number.isFinite(nb) && nb > 0 ? nb : Math.round(duration * fps);
// What the recording is worth once it is inside a 30fps composition.
const atThirty = Math.round(duration * 30);

const rel = path
  .relative(path.resolve(__dirname, "..", "public"), path.resolve(file))
  .split(path.sep)
  .join("/");

console.log(`${file}`);
console.log(`  ${width} x ${height}  ${fps.toFixed(3)} fps  ${duration.toFixed(3)}s  ${srcFrames} frames`);
console.log(`  aspect ${(width / height).toFixed(4)}`);
console.log(`  occupies ${atThirty} frames of a 30fps composition at speed 1`);
if (Math.abs(fps - 30) > 0.5) {
  console.log(
    `  note: source is ${fps.toFixed(0)}fps, not 30. Remotion resamples by ` +
      `timestamp, so playback stays correct — but every ${(fps / 30).toFixed(2)} ` +
      `source frames become one rendered frame.`,
  );
}
console.log(`\n  clip("${rel}", ${width}, ${height}, ${srcFrames})`);

const flag = process.argv.indexOf("--stills");
if (flag === -1) process.exit(0);

const times = (process.argv[flag + 1] || "")
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n));

if (times.length === 0) {
  console.error("\n--stills needs a comma-separated list of seconds");
  process.exit(1);
}

const dir = path.dirname(file);
const base = path.basename(file, path.extname(file));

console.log("");
for (const t of times) {
  if (t < 0 || t > duration) {
    console.log(`  skipped ${t}s — outside the ${duration.toFixed(2)}s recording`);
    continue;
  }
  const dest = path.join(dir, `${base}-${t.toFixed(2).replace(".", "_")}.png`);
  execFileSync(bin("ffmpeg.exe"), [
    "-y", "-v", "error",
    "-i", file,
    "-ss", String(t),
    "-frames:v", "1",
    dest,
  ]);
  console.log(`  wrote ${dest}`);
}
