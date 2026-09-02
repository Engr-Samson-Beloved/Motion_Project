/**
 * The 36-second music bed for AddToHome.
 *
 *   npm run bed36
 *
 * Only the arrangement lives here; the synthesiser is `lib/synth.js`.
 *
 * 120 BPM, so a beat is 15 frames at 30fps and every section boundary below is
 * a step boundary in `src/skng/install/script.ts` converted to seconds. Change
 * a step and this has to move with it, or the bed will resolve somewhere other
 * than where the picture does.
 *
 * The lightest of the four beds, and the least eventful on purpose. This is an
 * instruction, not a story: the viewer is being asked to follow a procedure and
 * remember it, so the music's whole job is to mark the five blocks and stay out
 * of the way. No `tension` anywhere, drive held at 1 through the middle, and
 * the single `impact` saved for 25s — the moment the icon lands on the home
 * screen, which is the only thing in thirty-six seconds worth a hit.
 */

const path = require("path");
const { NOTE, renderBed, ffmpegPath } = require("./lib/synth");

const SECTIONS = [
  // 0-5s  Title — one held chord, no percussion
  { from: 0, to: 5, root: NOTE.C2, chord: [NOTE.C3, NOTE.G3], pad: 0.55, drive: 0, tension: 0, bright: 0.35 },
  // 5-10s  Step 1 — Safari. The pulse starts as the phone settles.
  { from: 5, to: 10, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3], pad: 0.68, drive: 1, tension: 0, bright: 0.5, arp: [NOTE.G3, NOTE.C4, NOTE.E4, NOTE.C4] },
  // 10-15s  Step 2 — the share sheet arrives
  { from: 10, to: 15, root: NOTE.F2, chord: [NOTE.F3, NOTE.A3, NOTE.C4], pad: 0.7, drive: 1, tension: 0, bright: 0.56, arp: [NOTE.C4, NOTE.F4, NOTE.A4, NOTE.F4] },
  // 15-20s  Step 3 — the scroll and the row
  { from: 15, to: 20, root: NOTE.A1, chord: [NOTE.A2, NOTE.C3, NOTE.E3], pad: 0.72, drive: 1, tension: 0, bright: 0.6, arp: [NOTE.A3, NOTE.E4, NOTE.C4, NOTE.E4] },
  // 20-25s  Step 4 — the name, and Add
  { from: 20, to: 25, root: NOTE.G2, chord: [NOTE.G3, NOTE.B3, NOTE.D4], pad: 0.78, drive: 2, tension: 0, bright: 0.68, arp: [NOTE.D4, NOTE.G4, NOTE.B3, NOTE.G4] },
  // 25-30s  Step 5 — installed. The one hit in the piece.
  { from: 25, to: 30, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3, NOTE.C4], pad: 0.95, drive: 2, tension: 0, bright: 0.88, impact: true, arp: [NOTE.E4, NOTE.G4, NOTE.C5, NOTE.G4] },
  // 30-36s  Lockup — percussion gone, one held chord
  { from: 30, to: 36, root: NOTE.C2, chord: [NOTE.C3, NOTE.G3, NOTE.C4, NOTE.E4], pad: 1.0, drive: 0, tension: 0, bright: 0.82 },
];

const out = path.resolve(__dirname, "..", "public", "bed36.mp3");
const { peak, bytes } = renderBed({
  seconds: 36,
  bpm: 120,
  sections: SECTIONS,
  outPath: out,
  ffmpeg: ffmpegPath(),
  fadeOut: 2.4,
});

console.log(`wrote ${out} (${(bytes / 1e6).toFixed(2)} MB, peak ${peak.toFixed(3)})`);
