/**
 * Print the voice-over recording script for SkoolConnectStory, with real
 * timings taken from the same data the film renders from.
 *
 *   node scripts/vo-sheet.js            # to stdout
 *   node scripts/vo-sheet.js out/vo-script.txt
 *
 * The film deliberately carries no captions — the brief requires the story to
 * work without them and rules out text overlays — so the words exist only in
 * `script.ts` and only as cue data. This turns that data into something a
 * narrator can read from, and something an editor can check a take against.
 *
 * Reads the TypeScript source directly rather than importing it: `script.ts`
 * imports from `palette.ts`, which imports `remotion`, which does not load
 * outside a render. The two shapes it needs — the timecode label and the
 * `{ at, text }` cue lines — are simple enough to lift with a regex, and the
 * script fails loudly if the file's shape changes.
 */

const fs = require("fs");
const path = require("path");

const FPS = 30;
const root = path.resolve(__dirname, "..");
const src = fs.readFileSync(
  path.join(root, "src", "skng", "story", "script.ts"),
  "utf8",
);

const body = src.slice(
  src.indexOf("export const SCRIPT"),
  src.indexOf("/* ── Scene content"),
);

const scenes = [];
const sceneRe =
  /\{\s*id:\s*"([^"]+)",\s*time:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*vo:\s*\[([\s\S]*?)\],\s*\}/g;

let m;
while ((m = sceneRe.exec(body)) !== null) {
  const [, id, time, title, voBlock] = m;
  const vo = [];
  const lineRe = /\{\s*at:\s*(\d+),\s*text:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;
  let l;
  while ((l = lineRe.exec(voBlock)) !== null) {
    vo.push({ at: Number(l[1]), text: l[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\") });
  }
  scenes.push({ id, time, title, vo });
}

if (scenes.length === 0) {
  console.error(
    "vo-sheet: parsed no scenes from script.ts — its shape has changed, " +
      "so this script needs updating rather than trusting.",
  );
  process.exit(1);
}

const secs = (tc) => {
  const [mm, ss] = tc.split(":").map(Number);
  return mm * 60 + ss;
};

const tc = (seconds) => {
  const mm = Math.floor(seconds / 60);
  const ss = seconds - mm * 60;
  return `${String(mm).padStart(2, "0")}:${ss.toFixed(1).padStart(4, "0")}`;
};

const out = [];
out.push("SkoolConnectNG — 90 second film");
out.push("Voice-over script and cue sheet");
out.push("");
out.push("Tone: calm, confident, youthful Nigerian. Natural, deliberate pacing.");
out.push("Emotional arc: curiosity -> frustration -> discovery -> confidence -> inspiration.");
out.push("");
out.push("Times are absolute from the top of the film. A cue is where the line");
out.push("should START; the picture is cut so each line has room to land before");
out.push("the next one begins.");
out.push("");
out.push("=".repeat(74));

let words = 0;
let total = 0;

for (const [i, s] of scenes.entries()) {
  const [from, to] = s.time.split("-");
  const start = secs(from);
  const dur = secs(to) - start;
  total = secs(to);

  out.push("");
  out.push(`${String(i + 1).padStart(2, "0")}  ${s.title}`);
  out.push(`    ${s.time}   (${dur}s · ${dur * FPS} frames)`);
  out.push("");
  for (const line of s.vo) {
    words += line.text.split(/\s+/).filter(Boolean).length;
    out.push(`    ${tc(start + line.at / FPS)}   ${line.text}`);
  }
  out.push("");
  out.push("    " + "-".repeat(68));
}

out.push("");
out.push(
  `Total: ${total}s · ${words} words · ${(words / (total / 60)).toFixed(0)} words per minute.`,
);
out.push(
  "Unhurried narration sits around 130 wpm and comfortable narration around",
);
out.push(
  "150. This copy is the brief's, word for word, so the read is on the brisk",
);
out.push(
  "side of deliberate — it fits, but there is no slack. If a take runs long,",
);
out.push(
  "the cue times are where to check, not the picture: every scene boundary is",
);
out.push("fixed by the brief to the second.");
out.push("");

const text = out.join("\n");
const dest = process.argv[2];
if (dest) {
  const full = path.resolve(root, dest);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, text, "utf8");
  console.log(`wrote ${full}`);
} else {
  console.log(text);
}
