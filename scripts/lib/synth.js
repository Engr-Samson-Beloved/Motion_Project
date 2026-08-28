/**
 * A small deterministic music-bed synthesiser.
 *
 * Extracted from `make-bed90.js` when a second bed was needed. Remotion's
 * bundled ffmpeg is stripped — no `aevalsrc`, no `alimiter`, no `afade` — so
 * beds are generated sample by sample in Node and handed to ffmpeg as a
 * finished WAV.
 *
 * Deterministic by construction: the noise source is a seeded xorshift, so
 * regenerating a bed with the same section plan produces a byte-identical MP3.
 * That is worth having — it means an asset can be rebuilt years later without
 * silently changing the film it is cut to.
 *
 * A section plan is a list of:
 *
 *   { from, to,            seconds
 *     root,                sub frequency
 *     chord: [f, ...],     pad voices
 *     pad,                 pad level 0..1
 *     drive,               0 silent, 1 half time, 2 four on the floor + hats
 *     tension,             detuned voice, 0..1
 *     bright,              upper-octave opening, 0..1
 *     riser?,              pitch sweep to the section's end
 *     impact?,             one low hit on the downbeat
 *     arp?: [f, ...] }     eighth-note figure
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RATE = 44100;

/** Equal temperament, A4 = 440. */
const NOTE = {
  A1: 55, C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0,
  A2: 110, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0,
  A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.0, A4: 440, C5: 523.25, E5: 659.26, G5: 784.0,
};

/**
 * Render a bed to MP3.
 *
 * @param {object} opts
 * @param {number} opts.seconds
 * @param {number} opts.bpm
 * @param {Array} opts.sections
 * @param {string} opts.outPath   destination .mp3
 * @param {string} opts.ffmpeg    path to ffmpeg.exe
 * @param {number} [opts.fadeIn]  seconds
 * @param {number} [opts.fadeOut] seconds
 * @param {number} [opts.seed]
 */
const renderBed = ({
  seconds,
  bpm,
  sections,
  outPath,
  ffmpeg,
  fadeIn = 1.2,
  fadeOut = 3.0,
  seed = 987654321,
}) => {
  const BEAT = 60 / bpm;
  const N = RATE * seconds;
  const L = new Float64Array(N);
  const R = new Float64Array(N);

  const sectionAt = (t) =>
    sections.find((s) => t >= s.from && t < s.to) ?? sections[sections.length - 1];

  /** Cosine ramp at section edges, so joins do not click. */
  const xfade = (t, s) => {
    const edge = 0.35;
    const shape = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, x)));
    return shape((t - s.from) / edge) * shape((s.to - t) / edge);
  };

  const add = (i, l, r) => {
    L[i] += l;
    R[i] += r;
  };

  /* ── Sustained voices ───────────────────────────────────────────────── */

  for (let i = 0; i < N; i++) {
    const t = i / RATE;
    const s = sectionAt(t);
    const env = xfade(t, s);
    if (env <= 0) continue;

    const sub =
      Math.sin(2 * Math.PI * s.root * t) * 0.5 +
      Math.sin(2 * Math.PI * s.root * 2 * t) * 0.12;
    add(i, sub * 0.26 * env, sub * 0.26 * env);

    // Each chord tone is doubled at a small detune and panned apart, which is
    // what gives the bed width without a stereo effect.
    for (let k = 0; k < s.chord.length; k++) {
      const f = s.chord[k];
      const pan = s.chord.length === 1 ? 0 : (k / (s.chord.length - 1) - 0.5) * 0.7;
      const slow = 1 + 0.0015 * Math.sin(2 * Math.PI * (0.07 + k * 0.013) * t);
      const a = Math.sin(2 * Math.PI * f * slow * t);
      const b = Math.sin(2 * Math.PI * f * 1.0028 * t + k);
      const hi = Math.sin(2 * Math.PI * f * 2 * t + k * 0.7) * s.bright * 0.22;
      const v = ((a + b) * 0.5 + hi) * (s.pad / s.chord.length) * 0.5 * env;
      add(i, v * (1 - Math.max(0, pan)), v * (1 + Math.min(0, pan)));
    }

    if (s.tension > 0) {
      const v = Math.sin(2 * Math.PI * s.root * 3.0 * 1.06 * t) * 0.05 * s.tension * env;
      add(i, v, -v * 0.6);
    }

    if (s.riser) {
      const p = (t - s.from) / (s.to - s.from);
      const v = Math.sin(2 * Math.PI * (180 + p * p * 1100) * t) * 0.035 * p * p * env;
      add(i, v, v);
    }
  }

  /* ── Percussion ─────────────────────────────────────────────────────── */

  let rng = seed;
  const noise = () => {
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
        v = Math.sin(2 * Math.PI * (92 * Math.exp(-x * 3.4) + 42) * (j / RATE)) * decay;
      } else if (kind === "snap") {
        v = (noise() * 0.7 + Math.sin(2 * Math.PI * 240 * (j / RATE)) * 0.3) * decay;
      } else {
        v = noise() * decay * 0.5;
      }
      add(start + j, v * gain, v * gain * (kind === "hat" ? 0.85 : 1));
    }
  };

  const totalBeats = Math.floor(seconds / BEAT);
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

  /* ── Arpeggios and impacts ──────────────────────────────────────────── */

  for (const s of sections) {
    if (s.arp) {
      const step = BEAT / 2;
      let k = 0;
      for (let t = s.from; t < s.to - 0.01; t += step, k++) {
        const f = s.arp[k % s.arp.length];
        const len = Math.floor(step * 1.6 * RATE);
        const start = Math.floor(t * RATE);
        for (let j = 0; j < len && start + j < N; j++) {
          const x = j / len;
          const v =
            Math.sin(2 * Math.PI * f * (j / RATE)) * Math.exp(-x * 5.5) * (1 - x) * 0.05;
          const pan = k % 2 === 0 ? 0.25 : -0.25;
          add(start + j, v * (1 - Math.max(0, pan)), v * (1 + Math.min(0, pan)));
        }
      }
    }

    if (s.impact) {
      const start = Math.floor(s.from * RATE);
      const len = Math.floor(1.1 * RATE);
      for (let j = 0; j < len && start + j < N; j++) {
        const x = j / len;
        const decay = Math.exp(-x * 5);
        const f = 58 * Math.exp(-x * 2.2) + 30;
        const v =
          (Math.sin(2 * Math.PI * f * (j / RATE)) * 0.8 +
            noise() * 0.12 * Math.exp(-x * 24)) *
          decay *
          0.5;
        add(start + j, v, v);
      }
    }
  }

  /* ── Master ─────────────────────────────────────────────────────────── */

  const FADE_IN = fadeIn * RATE;
  const FADE_OUT = fadeOut * RATE;
  const softClip = (x) => Math.tanh(x * 1.15);

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
  const pcm = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    const q = (v) => Math.max(-32768, Math.min(32767, Math.round(v * norm * 32767)));
    pcm.writeInt16LE(q(L[i]), i * 4);
    pcm.writeInt16LE(q(R[i]), i * 4 + 2);
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

  const wav = outPath.replace(/\.mp3$/, ".wav");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(wav, Buffer.concat([header, pcm]));

  execFileSync(
    ffmpeg,
    ["-y", "-i", wav, "-codec:a", "libmp3lame", "-b:a", "192k", outPath],
    { stdio: "pipe" },
  );
  fs.unlinkSync(wav);

  return { peak, bytes: fs.statSync(outPath).size };
};

/** Remotion's bundled ffmpeg. Run scripts/restore-binaries.ps1 if it is missing. */
const ffmpegPath = () =>
  path.resolve(
    __dirname,
    "..",
    "..",
    "node_modules",
    "@remotion",
    "compositor-win32-x64-msvc",
    "ffmpeg.exe",
  );

module.exports = { NOTE, RATE, renderBed, ffmpegPath };
