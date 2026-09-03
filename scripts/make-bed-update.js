/**
 * The 30-second music bed for MonthlyUpdate.
 *
 *   npm run bed-update
 *
 * Only the arrangement lives here; the synthesiser is `lib/synth.js`.
 *
 * Named for the piece rather than its length because `bed30.mp3` is already
 * taken by SameQuestion, and that one is arranged to a completely different
 * set of scene boundaries — reusing it would put the music's turns in the
 * wrong places.
 *
 * 120 BPM, so a beat is 15 frames at 30fps. Every boundary below is a frame
 * from `src/skng/update/script.ts` converted to seconds.
 *
 * Unlike the other beds this one carries a real progression — C, F, back to C,
 * then A minor, G, C — because the piece has an argument to make rather than a
 * procedure to mark. The G at 23s is the only unresolved chord in it and it
 * sits under "Build your profile": the music wants to land and does not, which
 * is what a call to action is. The one `impact` is at 14.87s, where the count
 * reaches 300 — not under the logo, which is the reflex and would make the
 * loudest moment of the piece the part with the least in it.
 */

const path = require("path");
const { NOTE, renderBed, ffmpegPath } = require("./lib/synth");

const SECTIONS = [
  // 0-7s  Welcome to September. One held chord, nothing underneath.
  { from: 0, to: 7, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3], pad: 0.6, drive: 0, tension: 0, bright: 0.4 },
  // 7-14.87s  The count runs and the field fills. The pulse starts here.
  { from: 7, to: 14.87, root: NOTE.F2, chord: [NOTE.F3, NOTE.A3, NOTE.C4], pad: 0.74, drive: 1, tension: 0, bright: 0.58, arp: [NOTE.C4, NOTE.F4, NOTE.A4, NOTE.F4] },
  // 14.87-17.67s  300. The one hit in the piece.
  { from: 14.87, to: 17.67, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3, NOTE.C4], pad: 0.9, drive: 2, tension: 0, bright: 0.8, impact: true, arp: [NOTE.E4, NOTE.G4, NOTE.C5, NOTE.G4] },
  // 17.67-23s  "The space is still fresh." Minor, and softer — this is the
  // reflective beat, not a second peak.
  { from: 17.67, to: 23, root: NOTE.A1, chord: [NOTE.A2, NOTE.C3, NOTE.E3], pad: 0.78, drive: 1, tension: 0, bright: 0.62, arp: [NOTE.A3, NOTE.E4, NOTE.C4, NOTE.E4] },
  // 23-27s  "Build your profile." G, and it never resolves.
  { from: 23, to: 27, root: NOTE.G2, chord: [NOTE.G3, NOTE.B3, NOTE.D4], pad: 0.86, drive: 2, tension: 0, bright: 0.76, arp: [NOTE.D4, NOTE.G4, NOTE.B3, NOTE.G4] },
  // 27-30s  The mark. Percussion gone, home.
  { from: 27, to: 30, root: NOTE.C2, chord: [NOTE.C3, NOTE.G3, NOTE.C4, NOTE.E4], pad: 1.0, drive: 0, tension: 0, bright: 0.84 },
];

const out = path.resolve(__dirname, "..", "public", "bed-update.mp3");
const { peak, bytes } = renderBed({
  seconds: 30,
  bpm: 120,
  sections: SECTIONS,
  outPath: out,
  ffmpeg: ffmpegPath(),
  fadeOut: 2.4,
});

console.log(`wrote ${out} (${(bytes / 1e6).toFixed(2)} MB, peak ${peak.toFixed(3)})`);
