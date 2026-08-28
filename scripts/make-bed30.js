/**
 * The 30-second music bed for SameQuestion.
 *
 *   npm run bed30
 *
 * Only the arrangement lives here; the synthesiser is `lib/synth.js`.
 *
 * 120 BPM again, so a beat is 15 frames at 30fps and every section boundary
 * lands on one. The six sections are the six beats of the piece, and their
 * boundaries are the frame numbers in `SameQuestion.tsx` — change one and the
 * other has to move with it.
 *
 * Shorter arc than the 90s bed and steeper: alone, joined, connected,
 * answered, together, resolved. There is no room here for a slow build, so
 * the percussion arrives at 5s rather than 8s and never fully drops out until
 * the lockup.
 */

const path = require("path");
const { NOTE, renderBed, ffmpegPath } = require("./lib/synth");

const SECTIONS = [
  // 1 Alone — one student, no percussion at all
  { from: 0, to: 5, root: NOTE.A1, chord: [NOTE.A2, NOTE.E3], pad: 0.45, drive: 0, tension: 0, bright: 0.12 },
  // 2 Others — more students, half time, a little unease
  { from: 5, to: 11, root: NOTE.F2, chord: [NOTE.F2, NOTE.A2, NOTE.C3], pad: 0.55, drive: 1, tension: 0.2, bright: 0.25 },
  // 3 Connection — the lines draw, the bed opens
  { from: 11, to: 17, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3], pad: 0.72, drive: 2, tension: 0, bright: 0.55, arp: [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.E4] },
  // 4 Answer — the pulse travels
  { from: 17, to: 23, root: NOTE.G2, chord: [NOTE.G3, NOTE.B3, NOTE.D4], pad: 0.75, drive: 2, tension: 0, bright: 0.7, arp: [NOTE.D4, NOTE.G4, NOTE.B3, NOTE.D4] },
  // 5 Together — the network alive
  { from: 23, to: 27, root: NOTE.F2, chord: [NOTE.F3, NOTE.A3, NOTE.C4, NOTE.F4], pad: 0.88, drive: 2, tension: 0, bright: 0.85, impact: true, arp: [NOTE.F4, NOTE.C5, NOTE.A4, NOTE.C5] },
  // 6 Lockup — warm resolution, percussion gone
  { from: 27, to: 30, root: NOTE.C2, chord: [NOTE.C3, NOTE.G3, NOTE.C4, NOTE.E4, NOTE.G4], pad: 1.0, drive: 0, tension: 0, bright: 0.9, impact: true },
];

const out = path.resolve(__dirname, "..", "public", "bed30.mp3");
const { peak, bytes } = renderBed({
  seconds: 30,
  bpm: 120,
  sections: SECTIONS,
  outPath: out,
  ffmpeg: ffmpegPath(),
  fadeOut: 2.2,
});

console.log(`wrote ${out} (${(bytes / 1e6).toFixed(2)} MB, peak ${peak.toFixed(3)})`);
