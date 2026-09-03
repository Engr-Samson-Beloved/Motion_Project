/**
 * The 16-second music bed for NewMonth.
 *
 *   npm run bed16
 *
 * Only the arrangement lives here; the synthesiser is `lib/synth.js`.
 *
 * 120 BPM, so a beat is 15 frames at 30fps. Every boundary below is a frame
 * from `src/skng/month/script.ts` converted to seconds — move a block there
 * and this has to move with it, or the bed resolves somewhere the picture
 * does not.
 *
 * There are five sections for four blocks. The extra boundary at 2.07s is the
 * digit roll: 08 becoming 09 is the one *event* in a piece that is otherwise
 * a poster assembling itself, so it takes the only `impact` in the bed. The
 * mark at the end deliberately does not get one — landing a hit under a logo
 * is the reflex, and it would make the loudest moment of a month post the
 * part with the least in it.
 */

const path = require("path");
const { NOTE, renderBed, ffmpegPath } = require("./lib/synth");

const SECTIONS = [
  // 0-2.07s  The frame builds. One held fifth, nothing moving underneath.
  { from: 0, to: 2.07, root: NOTE.C2, chord: [NOTE.C3, NOTE.G3], pad: 0.5, drive: 0, tension: 0, bright: 0.32 },
  // 2.07-4.33s  The turn. The third arrives with the new digit.
  { from: 2.07, to: 4.33, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3], pad: 0.7, drive: 0, tension: 0, bright: 0.52, impact: true },
  // 4.33-9.87s  The month sets and the grid fills. The pulse starts here.
  { from: 4.33, to: 9.87, root: NOTE.F2, chord: [NOTE.F3, NOTE.A3, NOTE.C4], pad: 0.76, drive: 1, tension: 0, bright: 0.6, arp: [NOTE.C4, NOTE.F4, NOTE.A4, NOTE.F4] },
  // 9.87-13.33s  The line.
  { from: 9.87, to: 13.33, root: NOTE.G2, chord: [NOTE.G3, NOTE.B3, NOTE.D4], pad: 0.84, drive: 2, tension: 0, bright: 0.72, arp: [NOTE.D4, NOTE.G4, NOTE.B3, NOTE.G4] },
  // 13.33-16s  The mark. Percussion gone, one held chord, home.
  { from: 13.33, to: 16, root: NOTE.C2, chord: [NOTE.C3, NOTE.G3, NOTE.C4, NOTE.E4], pad: 1.0, drive: 0, tension: 0, bright: 0.82 },
];

const out = path.resolve(__dirname, "..", "public", "bed16.mp3");
const { peak, bytes } = renderBed({
  seconds: 16,
  bpm: 120,
  sections: SECTIONS,
  outPath: out,
  ffmpeg: ffmpegPath(),
  fadeOut: 2.2,
});

console.log(`wrote ${out} (${(bytes / 1e6).toFixed(2)} MB, peak ${peak.toFixed(3)})`);
