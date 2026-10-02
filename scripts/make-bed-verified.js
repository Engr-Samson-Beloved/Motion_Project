/**
 * The 30-second music bed for Verified.
 *
 *   npm run bed-verified
 *
 * Only the arrangement lives here; the synthesiser is `lib/synth.js`.
 *
 * 120 BPM, so a beat is 15 frames at 30fps. Every boundary below is an act
 * break in `src/skng/verified/script.ts` converted to seconds — 3s is the end
 * of the cold open, 10s and 13s are two of the three black flashes, 23s is
 * the claim and 27s is the sign-off.
 *
 * The only bed in this repo that uses `tension`, and the reason it exists.
 * `tension` is a detuned voice, and the first ten seconds of this film are
 * about information you cannot trust — a second oscillator pulling against
 * the first is that, exactly, without a lyric. It falls to zero at the turn
 * and never comes back.
 *
 * The progression walks the same way the picture does: A minor twice while
 * the film is asking who told you, F as it turns, then C — home — for the
 * run, and G under the claim so the last thing before the mark is a chord
 * that has not landed yet. The `riser` sits in the F, sweeping into the black
 * flash at 13s, and the one `impact` is on the claim at 23s rather than under
 * the logo, which is the reflex and would put the loudest moment of the film
 * on the part with the least in it.
 */

const path = require("path");
const { NOTE, renderBed, ffmpegPath } = require("./lib/synth");

const SECTIONS = [
  // 0-3s  "WHO TOLD YOU?" Sparse, detuned, no pulse yet.
  { from: 0, to: 3, root: NOTE.A1, chord: [NOTE.A2, NOTE.C3, NOTE.E3], pad: 0.5, drive: 0, tension: 0.8, bright: 0.22 },
  // 3-10s  The sources. The pulse starts and the detune widens.
  { from: 3, to: 10, root: NOTE.A1, chord: [NOTE.A2, NOTE.C3, NOTE.E3], pad: 0.66, drive: 1, tension: 0.9, bright: 0.34, arp: [NOTE.A3, NOTE.E4, NOTE.C4, NOTE.E4] },
  // 10-13s  The turn. Tension halves and a riser sweeps into the flash.
  { from: 10, to: 13, root: NOTE.F2, chord: [NOTE.F3, NOTE.A3, NOTE.C4], pad: 0.76, drive: 1, tension: 0.55, bright: 0.5, riser: true },
  // 13-18s  The run begins. Home, and clean — no detune from here on.
  { from: 13, to: 18, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3], pad: 0.84, drive: 2, tension: 0, bright: 0.66, arp: [NOTE.C4, NOTE.G4, NOTE.E4, NOTE.G4] },
  // 18-23s  The run accelerates.
  { from: 18, to: 23, root: NOTE.F2, chord: [NOTE.F3, NOTE.A3, NOTE.C4], pad: 0.9, drive: 2, tension: 0, bright: 0.78, arp: [NOTE.C4, NOTE.F4, NOTE.A4, NOTE.F4] },
  // 23-27s  The claim. The one hit, and a chord that does not resolve.
  { from: 23, to: 27, root: NOTE.G2, chord: [NOTE.G3, NOTE.B3, NOTE.D4], pad: 0.95, drive: 2, tension: 0, bright: 0.88, impact: true, arp: [NOTE.D4, NOTE.G4, NOTE.B3, NOTE.G4] },
  // 27-30s  The mark. Percussion gone, home at last.
  { from: 27, to: 30, root: NOTE.C2, chord: [NOTE.C3, NOTE.G3, NOTE.C4, NOTE.E4], pad: 1.0, drive: 0, tension: 0, bright: 0.92 },
];

const out = path.resolve(__dirname, "..", "public", "bed-verified.mp3");
const { peak, bytes } = renderBed({
  seconds: 30,
  bpm: 120,
  sections: SECTIONS,
  outPath: out,
  ffmpeg: ffmpegPath(),
  fadeOut: 2.2,
});

console.log(`wrote ${out} (${(bytes / 1e6).toFixed(2)} MB, peak ${peak.toFixed(3)})`);
