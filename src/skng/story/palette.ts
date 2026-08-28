import { interpolate } from "remotion";
import { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT } from "../brand";

/**
 * Palette for the 90-second story film, taken verbatim from the brief.
 *
 * This is deliberately *not* `BRAND` from `../brand.ts`. That one is the
 * product's light-surface palette (`#165538` on `#e4f4f1`); this one is a
 * dark-first film palette built around `#171E26`. The two coexist: the film's
 * ground, type and network lines use STORY, and the phone interiors keep the
 * product's own structure so the UI is reproduced rather than redesigned.
 *
 * The brief's rule is solid colours only — no gradients anywhere. Nothing in
 * `story/` may use `linear-gradient`, `radial-gradient` or `conic-gradient`.
 * Depth comes from flat value steps (`dark` -> `dark2` -> `line`), from scale
 * and from motion, not from falloff.
 */
export const STORY = {
  green: "#278058",
  dark: "#171E26",
  dark2: "#202730",
  muted: "#8AAA9F",
  white: "#F0F6F5",

  /** Flat tints of the palette, for borders and inactive states. */
  line: "#2B333D",
  line2: "#39424D",
  /** The one warm note, used only for the "untrusted information" beat. */
  warn: "#C2683F",
} as const;

export { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT };

export const FPS = 30;

/** 16:9 at 1080p. Every layout number in `story/` is in this space. */
export const W = 1920;
export const H = 1080;

/**
 * Scene-level dissolve. Each scene fades itself in and out so the film reads
 * as continuous on a plain `<Series>`, without the overlap arithmetic a
 * `<TransitionSeries>` would need — and the brief fixes every scene boundary
 * to the second, which overlapping transitions would quietly shift.
 */
export const sceneFade = (
  frame: number,
  duration: number,
  fadeIn = 14,
  fadeOut = 14,
) => {
  // Three cuts in this film are deliberately hard, and pass 0 here. Guard both
  // ends: `interpolate` requires a strictly increasing input range, so a 0
  // would build the range [duration, duration] and throw mid-render.
  const inP =
    fadeIn <= 0
      ? 1
      : interpolate(frame, [0, fadeIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const outP =
    fadeOut <= 0
      ? 1
      : interpolate(frame, [duration - fadeOut, duration], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  return Math.min(inP, outP);
};

/** 0 -> 1 across [from, to], clamped both ends. The workhorse of this film. */
export const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Smooth ease-in-out, which the brief names as the film's default easing. */
export const ease = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

/** `ramp` with the film's easing already applied. */
export const eramp = (frame: number, from: number, to: number) =>
  ease(ramp(frame, from, to));
