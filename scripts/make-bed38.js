/**
 * The 38-second music bed for CampusTour.
 *
 *   npm run bed38
 *
 * Only the arrangement lives here; the synthesiser is `lib/synth.js`.
 *
 * 120 BPM again, so a beat is 15 frames at 30fps. The section boundaries below
 * are `T` in `src/skng/tour/shots.ts` converted to seconds — change a cut and
 * this has to move with it, or the bed will resolve somewhere other than where
 * the picture does.
 *
 * A lighter arrangement than the other two beds, because the picture is light:
 * no `tension` anywhere, percussion kept at drive 1 for most of the tour rather
 * than 2, and the one `impact` saved for the constellation. This is a product
 * walkthrough, not a story with a problem in the middle — nothing here should
 * sound like jeopardy.
 */

const path = require("path");
const { NOTE, renderBed, ffmpegPath } = require("./lib/synth");

const SECTIONS = [
  // 0-3s  Open — an empty field, a line drawing across it
  { from: 0, to: 3, root: NOTE.C2, chord: [NOTE.C3, NOTE.G3], pad: 0.5, drive: 0, tension: 0, bright: 0.3 },
  // 3-5s  Statement — the green field, full bleed
  { from: 3, to: 5, root: NOTE.F2, chord: [NOTE.F3, NOTE.A3, NOTE.C4], pad: 0.72, drive: 0, tension: 0, bright: 0.5, impact: true },
  // 5-12.5s  Feed, Discover — the tour opens, percussion in
  { from: 5, to: 12.5, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3], pad: 0.66, drive: 1, tension: 0, bright: 0.55, arp: [NOTE.G3, NOTE.C4, NOTE.E4, NOTE.C4] },
  // 12.5-19.5s  People, Connect — the social half
  { from: 12.5, to: 19.5, root: NOTE.A1, chord: [NOTE.A2, NOTE.C3, NOTE.E3], pad: 0.7, drive: 1, tension: 0, bright: 0.62, arp: [NOTE.A3, NOTE.E4, NOTE.C4, NOTE.E4] },
  // 19.5-26.5s  Inbox, Communities — busiest stretch of the picture
  { from: 19.5, to: 26.5, root: NOTE.F2, chord: [NOTE.F3, NOTE.A3, NOTE.C4], pad: 0.78, drive: 2, tension: 0, bright: 0.72, arp: [NOTE.C4, NOTE.F4, NOTE.A4, NOTE.F4] },
  // 26.5-30s  Profile — one screen, held
  { from: 26.5, to: 30, root: NOTE.G2, chord: [NOTE.G3, NOTE.B3, NOTE.D4], pad: 0.82, drive: 1, tension: 0, bright: 0.78, arp: [NOTE.D4, NOTE.G4, NOTE.B3, NOTE.G4] },
  // 30-34s  The constellation — everything at once
  { from: 30, to: 34, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3, NOTE.C4], pad: 0.95, drive: 2, tension: 0, bright: 0.9, impact: true, arp: [NOTE.E4, NOTE.G4, NOTE.C5, NOTE.G4] },
  // 34-38s  Lockup — percussion gone, one held chord
  { from: 34, to: 38, root: NOTE.C2, chord: [NOTE.C3, NOTE.G3, NOTE.C4, NOTE.E4], pad: 1.0, drive: 0, tension: 0, bright: 0.85 },
];

const out = path.resolve(__dirname, "..", "public", "bed38.mp3");
const { peak, bytes } = renderBed({
  seconds: 38,
  bpm: 120,
  sections: SECTIONS,
  outPath: out,
  ffmpeg: ffmpegPath(),
  fadeOut: 2.6,
});

console.log(`wrote ${out} (${(bytes / 1e6).toFixed(2)} MB, peak ${peak.toFixed(3)})`);
