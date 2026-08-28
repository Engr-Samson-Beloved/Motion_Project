/**
 * The 90-second music bed for SkoolConnectStory.
 *
 *   npm run bed90
 *
 * Only the arrangement lives here; the synthesiser is `lib/synth.js`.
 *
 * Tempo is 120 BPM, which is 15 frames per beat at 30fps and exactly two beats
 * per second. Every scene boundary in the brief falls on a whole second, so at
 * this tempo every boundary also falls on a beat — the cuts land on the music
 * without the scene timings having to bend to it. The opening plays in half
 * time so it still reads as atmospheric rather than driving.
 *
 * The arrangement follows the brief's emotional arc:
 *   curiosity -> frustration -> discovery -> confidence -> inspiration
 */

const path = require("path");
const { NOTE, renderBed, ffmpegPath } = require("./lib/synth");

const SECTIONS = [
  // 01 Every Student Has a Story — subtle and atmospheric
  { from: 0, to: 8, root: NOTE.A1, chord: [NOTE.A2, NOTE.C3, NOTE.E3], pad: 0.5, drive: 0, tension: 0, bright: 0.15 },
  // 02 The Information Problem — slightly faster and tense, building
  { from: 8, to: 15, root: NOTE.F2, chord: [NOTE.F2, NOTE.A2, NOTE.C3], pad: 0.55, drive: 1, tension: 0.25, bright: 0.2 },
  { from: 15, to: 22, root: NOTE.F2, chord: [NOTE.F2, NOTE.A2, NOTE.C3, NOTE.D3], pad: 0.62, drive: 2, tension: 0.6, bright: 0.3 },
  // 03 The Missing Connection — the freeze, then space
  { from: 22, to: 26, root: NOTE.D2, chord: [NOTE.D3], pad: 0.3, drive: 0, tension: 0.15, bright: 0.1 },
  { from: 26, to: 34, root: NOTE.D2, chord: [NOTE.D3, NOTE.F3, NOTE.A3], pad: 0.5, drive: 1, tension: 0.1, bright: 0.2 },
  // 04 The Question — anticipation
  { from: 34, to: 43, root: NOTE.G2, chord: [NOTE.G3, NOTE.D4], pad: 0.55, drive: 1, tension: 0, bright: 0.35, riser: true },
  // 05 The Reveal — the music opens up
  { from: 43, to: 50, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3, NOTE.C4], pad: 0.85, drive: 2, tension: 0, bright: 0.7, impact: true },
  // 06 Connect — confident momentum
  { from: 50, to: 57, root: NOTE.C2, chord: [NOTE.C3, NOTE.E3, NOTE.G3], pad: 0.7, drive: 2, tension: 0, bright: 0.6, arp: [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.E4] },
  { from: 57, to: 65, root: NOTE.G2, chord: [NOTE.G3, NOTE.B3, NOTE.D4], pad: 0.7, drive: 2, tension: 0, bright: 0.6, arp: [NOTE.D4, NOTE.G4, NOTE.D4, NOTE.B3] },
  // 07 Discover
  { from: 65, to: 72, root: NOTE.A2, chord: [NOTE.A3, NOTE.C4, NOTE.E4], pad: 0.7, drive: 2, tension: 0, bright: 0.65, arp: [NOTE.A4, NOTE.C5, NOTE.E5, NOTE.C5] },
  { from: 72, to: 78, root: NOTE.F2, chord: [NOTE.F3, NOTE.A3, NOTE.C4], pad: 0.72, drive: 2, tension: 0, bright: 0.7, arp: [NOTE.C5, NOTE.A4, NOTE.F4, NOTE.A4] },
  // 08 Break the Boundary — expansion
  { from: 78, to: 85, root: NOTE.F2, chord: [NOTE.F3, NOTE.C4, NOTE.F4], pad: 0.85, drive: 2, tension: 0, bright: 0.85, impact: true, arp: [NOTE.F4, NOTE.C5, NOTE.F4, NOTE.G5] },
  // 09 The Vision — warm, inspiring resolution
  { from: 85, to: 90, root: NOTE.C2, chord: [NOTE.C3, NOTE.G3, NOTE.C4, NOTE.E4, NOTE.G4], pad: 1.0, drive: 0, tension: 0, bright: 0.9, impact: true },
];

const out = path.resolve(__dirname, "..", "public", "bed90.mp3");
const { peak, bytes } = renderBed({
  seconds: 90,
  bpm: 120,
  sections: SECTIONS,
  outPath: out,
  ffmpeg: ffmpegPath(),
});

console.log(`wrote ${out} (${(bytes / 1e6).toFixed(2)} MB, peak ${peak.toFixed(3)})`);
