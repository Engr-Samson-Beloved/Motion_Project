/**
 * Synthesize the 90-second music bed for SkoolConnectStory.
 *
 *   node scripts/make-bed90.js
 *
 * Written by hand rather than assembled in ffmpeg because Remotion's bundled
 * ffmpeg build is stripped: it has libmp3lame, aac and libx264, but no
 * `aevalsrc`, no `alimiter`, no `afade` and no `rawvideo` muxer. Generating
 * samples in Node and handing ffmpeg a finished WAV sidesteps all of that.
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

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RATE = 44100;
const SECONDS = 90;
const BPM = 120;
const BEAT = 60 / BPM; // 0.5s
const N = RATE * SECONDS;

const L = new Float64Array(N);
const R = new Float64Array(N);

/* ── Sections, keyed to the brief's scene boundaries ──────────────────── */

const NOTE = {
  A1: 55, C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0,
  A2: 110, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0,
  A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440, C5: 523.25, E5: 659.26, G5: 784.0,
};

/**
 * `drive` is percussion density: 0 silent, 1 half-time, 2 four-on-the-floor
 * with hats. `tension` adds a detuned upper voice that beats against the pad.
 */
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

const sectionAt = (t) =>
  SECTIONS.find((s) => t >= s.from && t < s.to) ?? SECTIONS[SECTIONS.length - 1];

/** Cosine ramp, so section joins do not click. */
const xfade = (t, s) => {
  const edge = 0.35;
  const inP = Math.min(1, (t - s.from) / edge);
  const outP = Math.min(1, (s.to - t) / edge);
  const shape = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, x)));
  return shape(inP) * shape(outP);
};

const add = (i, l, r) => {
  L[i] += l;
  R[i] += r;
};

/* ── Sustained voices ─────────────────────────────────────────────────── */

for (let i = 0; i < N; i++) {
  const t = i / RATE;
  const s = sectionAt(t);
  const env = xfade(t, s);
  if (env <= 0) continue;

  // Sub. A soft square-ish sine keeps weight without muddying the mids.
  const sub = Math.sin(2 * Math.PI * s.root * t) * 0.5 + Math.sin(2 * Math.PI * s.root * 2 * t) * 0.12;
  add(i, sub * 0.26 * env, sub * 0.26 * env);

  // Pad. Each chord tone is doubled at a small detune, panned apart, which is
  // what gives the bed width without a stereo effect.
  for (let k = 0; k < s.chord.length; k++) {
    const f = s.chord[k];
    const pan = s.chord.length === 1 ? 0 : (k / (s.chord.length - 1) - 0.5) * 0.7;
    const slow = 1 + 0.0015 * Math.sin(2 * Math.PI * (0.07 + k * 0.013) * t);
    const a = Math.sin(2 * Math.PI * f * slow * t);
    const b = Math.sin(2 * Math.PI * f * 1.0028 * t + k);
    // Brightness opens a soft upper octave as the film resolves.
    const hi = Math.sin(2 * Math.PI * f * 2 * t + k * 0.7) * s.bright * 0.22;
    const v = ((a + b) * 0.5 + hi) * (s.pad / s.chord.length) * 0.5 * env;
    add(i, v * (1 - Math.max(0, pan)), v * (1 + Math.min(0, pan)));
  }

  // Tension: a voice a semitone off the fifth, only in the problem section.
  if (s.tension > 0) {
    const f = s.root * 3.0 * 1.06;
    const v = Math.sin(2 * Math.PI * f * t) * 0.05 * s.tension * env;
    add(i, v, -v * 0.6);
  }

  // Riser for the anticipation beat: pitch and level sweep to the reveal.
  if (s.riser) {
    const p = (t - s.from) / (s.to - s.from);
    const f = 180 + p * p * 1100;
    const v = Math.sin(2 * Math.PI * f * t) * 0.035 * p * p * env;
    add(i, v, v);
  }
}

/* ── Percussion ───────────────────────────────────────────────────────── */

let rng = 987654321;
const noise = () => {
  // xorshift, so the render is byte-identical every time it is regenerated
  rng ^= rng << 13; rng >>>= 0;
  rng ^= rng >> 17;
  rng ^= rng << 5; rng >>>= 0;
  return (rng / 0xffffffff) * 2 - 1;
};

const strike = (at, kind, gain) => {
  const start = Math.floor(at * RATE);
  const dur = kind === "kick" ? 0.16 : kind === "snap" ? 0.12 : 0.045;
  const len = Math.floor(dur * RATE);
  for (let j = 0; j < len && start + j < N; j++) {
    const x = j / len;
    const decay = Math.exp(-x * (kind === "kick" ? 7 : kind === "snap" ? 9 : 22));
    let v;
    if (kind === "kick") {
      const f = 92 * Math.exp(-x * 3.4) + 42;
      v = Math.sin(2 * Math.PI * f * (j / RATE)) * decay;
    } else if (kind === "snap") {
      v = (noise() * 0.7 + Math.sin(2 * Math.PI * 240 * (j / RATE)) * 0.3) * decay;
    } else {
      v = noise() * decay * 0.5;
    }
    add(start + j, v * gain, v * gain * (kind === "hat" ? 0.85 : 1));
  }
};

const totalBeats = Math.floor(SECONDS / BEAT);
for (let b = 0; b < totalBeats; b++) {
  const t = b * BEAT;
  const s = sectionAt(t);
  if (s.drive === 0) continue;

  const inBar = b % 4;
  if (s.drive === 1) {
    if (inBar === 0 || inBar === 2) strike(t, "kick", 0.34);
    if (inBar === 2) strike(t, "snap", 0.1);
  } else {
    strike(t, "kick", 0.4);
    if (inBar === 1 || inBar === 3) strike(t, "snap", 0.16);
    strike(t, "hat", 0.1);
    strike(t + BEAT / 2, "hat", 0.06);
  }
}

/* ── Arpeggio and impacts ─────────────────────────────────────────────── */

for (const s of SECTIONS) {
  if (s.arp) {
    // Eighth notes, so the momentum sections move without the pad having to.
    const step = BEAT / 2;
    let k = 0;
    for (let t = s.from; t < s.to - 0.01; t += step, k++) {
      const f = s.arp[k % s.arp.length];
      const len = Math.floor(step * 1.6 * RATE);
      const start = Math.floor(t * RATE);
      for (let j = 0; j < len && start + j < N; j++) {
        const x = j / len;
        const env = Math.exp(-x * 5.5) * (1 - x);
        const v = Math.sin(2 * Math.PI * f * (j / RATE)) * env * 0.05;
        const pan = k % 2 === 0 ? 0.25 : -0.25;
        add(start + j, v * (1 - Math.max(0, pan)), v * (1 + Math.min(0, pan)));
      }
    }
  }

  if (s.impact) {
    // A low, short impact on the downbeat — the brief asks for one on the logo
    // reveal and explicitly rules out excessive cinematic booms, so it is a
    // single hit at the top of the section, not a tail.
    const start = Math.floor(s.from * RATE);
    const len = Math.floor(1.1 * RATE);
    for (let j = 0; j < len && start + j < N; j++) {
      const x = j / len;
      const decay = Math.exp(-x * 5);
      const f = 58 * Math.exp(-x * 2.2) + 30;
      const v =
        (Math.sin(2 * Math.PI * f * (j / RATE)) * 0.8 + noise() * 0.12 * Math.exp(-x * 24)) *
        decay *
        0.5;
      add(start + j, v, v);
    }
  }
}

/* ── Master: fades, soft clip, write ──────────────────────────────────── */

const FADE_IN = 1.2 * RATE;
const FADE_OUT = 3.0 * RATE;
const softClip = (x) => Math.tanh(x * 1.15);

const pcm = Buffer.alloc(N * 4);
let peak = 0;
for (let i = 0; i < N; i++) {
  let l = L[i];
  let r = R[i];
  if (i < FADE_IN) {
    const g = i / FADE_IN;
    l *= g; r *= g;
  }
  if (i > N - FADE_OUT) {
    const g = (N - i) / FADE_OUT;
    l *= g; r *= g;
  }
  l = softClip(l);
  r = softClip(r);
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
  L[i] = l;
  R[i] = r;
}

const norm = 0.89 / Math.max(peak, 1e-6);
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * norm * 32767))), i * 4);
  pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * norm * 32767))), i * 4 + 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const root = path.resolve(__dirname, "..");
const wav = path.join(root, "public", "bed90.wav");
const mp3 = path.join(root, "public", "bed90.mp3");
fs.writeFileSync(wav, Buffer.concat([header, pcm]));
console.log(`wrote ${wav} (${(fs.statSync(wav).size / 1e6).toFixed(1)} MB, peak ${peak.toFixed(3)})`);

const ffmpeg = path.join(
  root,
  "node_modules",
  "@remotion",
  "compositor-win32-x64-msvc",
  "ffmpeg.exe",
);

execFileSync(ffmpeg, ["-y", "-i", wav, "-codec:a", "libmp3lame", "-b:a", "192k", mp3], {
  stdio: "inherit",
});
fs.unlinkSync(wav);
console.log(`wrote ${mp3} (${(fs.statSync(mp3).size / 1e6).toFixed(2)} MB)`);
