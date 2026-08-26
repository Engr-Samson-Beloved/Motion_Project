import React from "react";
import { Audio, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";

/**
 * Sound, and the beat grid that motion should be cut against.
 *
 * The tempo is chosen so the grid lands on whole frames: at 100 BPM and 30fps
 * a beat is exactly 18 frames. Nothing here has to round, and a cut placed on
 * a multiple of 18 is genuinely on the beat rather than nearly on it.
 *
 * Existing scene durations in `SkoolConnectReel` (120/130/110/...) are not
 * multiples of 18, so beat-syncing that piece means re-timing its cuts. The
 * helpers below are what it would be re-timed against.
 */

export const BPM = 100;

/** Frames per beat. 18 at 30fps. */
export const beatFrames = (fps: number) => (fps * 60) / BPM;

/** Frames per bar, four beats to the bar. 72 at 30fps. */
export const barFrames = (fps: number) => beatFrames(fps) * 4;

/** Frame numbers of every beat within a span — the grid to cut against. */
export const beatGrid = (fps: number, durationInFrames: number) => {
  const step = beatFrames(fps);
  const out: number[] = [];
  for (let f = 0; f < durationInFrames; f += step) out.push(Math.round(f));
  return out;
};

/** True on the exact frame a beat lands. */
export const onBeat = (frame: number, fps: number) =>
  Math.round(frame) % Math.round(beatFrames(fps)) === 0;

/** Position through the current beat, 0 at the beat and approaching 1 before the next. */
export const beatPhase = (frame: number, fps: number) => {
  const step = beatFrames(fps);
  return (frame % step) / step;
};

/**
 * 1 on the beat, decaying to 0 before the next one.
 *
 * Multiply a scale or an opacity by this to make an element breathe with the
 * track. `decay` above 1 snaps back faster and reads as percussive; below 1 it
 * sustains and reads as a pad.
 */
export const beatPulse = (frame: number, fps: number, decay = 3) =>
  Math.max(0, 1 - beatPhase(frame, fps) * decay);

/** Same, but only on the downbeat of each bar. */
export const barPulse = (frame: number, fps: number, decay = 2) => {
  const step = barFrames(fps);
  return Math.max(0, 1 - ((frame % step) / step) * decay);
};

export type TrackProps = {
  src: string;
  volume?: number;
  startFrom?: number;
  /** Frames of fade at the tail, so the piece does not end on a cut. */
  fadeOutFrames?: number;
};

/**
 * The music bed.
 *
 * `volume` accepts a callback that Remotion evaluates per frame, which is what
 * the tail fade uses — there is no separate envelope to keep in sync.
 */
export const Track: React.FC<TrackProps> = ({
  src,
  volume = 1,
  startFrom = 0,
  fadeOutFrames = 30,
}) => {
  const { durationInFrames } = useVideoConfig();

  return (
    <Audio
      src={src}
      startFrom={startFrom}
      volume={(f) => {
        if (fadeOutFrames <= 0) return volume;
        const start = durationInFrames - fadeOutFrames;
        if (f < start) return volume;
        return volume * Math.max(0, 1 - (f - start) / fadeOutFrames);
      }}
    />
  );
};

/**
 * `visualizeAudio` runs an FFT, so its sample count must be a power of two —
 * anything else throws `The argument "bars" must be a power of two`, and it
 * throws during the render rather than at build time. Snapping here means a
 * caller can ask for 24 bars and get 32 instead of a failed render pass.
 */
const toPowerOfTwo = (n: number) => 2 ** Math.max(1, Math.ceil(Math.log2(Math.max(2, n))));

/**
 * Frequency bands for the current frame, each 0-1ish.
 *
 * Returns an array of zeroes until the audio metadata has been fetched, so
 * callers never have to null-check. That also means the first frames of a
 * preview can render unreactive before settling — which is a preview artefact,
 * not a render one.
 *
 * `bands` is rounded up to the next power of two, so check the length of what
 * comes back rather than assuming you got the count you asked for.
 */
export const useLevel = (src: string, bands = 16): number[] => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(src);
  const samples = toPowerOfTwo(bands);

  return React.useMemo(() => {
    if (!audioData) return new Array(samples).fill(0);
    return visualizeAudio({
      fps,
      frame,
      audioData,
      numberOfSamples: samples,
    });
  }, [audioData, fps, frame, samples]);
};

/** Single overall loudness figure, for when a whole array is more than you need. */
export const useEnergy = (src: string, bands = 16): number => {
  const levels = useLevel(src, bands);
  return levels.reduce((a, b) => a + b, 0) / Math.max(1, levels.length);
};
