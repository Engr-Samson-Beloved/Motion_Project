/**
 * Motion cycles for the rig in `rig.tsx`.
 *
 * Every cycle is a pure function of the frame, exactly like the rest of this
 * codebase: `f(frame) -> pose`. That is the whole reason to hand-rig rather
 * than import an animation file — a scrub to frame 1,412 produces the same
 * pose as a render that arrives there, with no playhead state to keep in sync.
 *
 * Angles are degrees, SVG convention: positive is clockwise on a y-down
 * canvas, and the figure faces +x. So a positive hip angle swings the leg
 * *backward*, and a positive knee angle bends the heel backward — which is the
 * only direction a knee goes.
 */

export type Pose = {
  /** Vertical offset in rig units. Negative is up. */
  bob: number;
  /** Forward lean of the torso, about the hip. */
  lean: number;
  /** Head nod, about the neck. Positive looks down. */
  headTilt: number;
  /** [near, far] limb angles. The far side is drawn behind and dimmer. */
  hip: [number, number];
  knee: [number, number];
  shoulder: [number, number];
  elbow: [number, number];
};

/** Full two-step strides per second. */
const STRIDES_PER_SEC = 0.85;

/** Frames in one complete walk cycle. Useful for looping and for sampling. */
export const walkCycleFrames = (fps: number) => fps / STRIDES_PER_SEC;

const TAU = Math.PI * 2;

/**
 * A walk.
 *
 * Legs are counter-phase sines. Knees bend only on the swing — `max(0, ...)`
 * is doing real work there, because a knee that bends on the stance leg reads
 * instantly as broken. Arms swing opposite their own leg, which is what stops
 * a walk looking like a march.
 */
export const walk = (frame: number, fps: number, speed = 1): Pose => {
  const p = (frame / fps) * STRIDES_PER_SEC * speed * TAU;
  const swing = 27;

  // The knee lifts as its leg travels from behind to in front, so its peak
  // trails the hip's rearmost point by an eighth of a cycle.
  const bend = (phase: number) => Math.max(0, Math.sin(phase - Math.PI / 4)) * 52;

  return {
    // Two rises per stride: the body lifts over each stance leg, not once.
    bob: -Math.abs(Math.sin(p)) * 4.5,
    lean: 6,
    headTilt: 0,
    hip: [Math.sin(p) * swing, Math.sin(p + Math.PI) * swing],
    knee: [bend(p), bend(p + Math.PI)],
    shoulder: [Math.sin(p + Math.PI) * 27, Math.sin(p) * 27],
    elbow: [14 + Math.max(0, Math.sin(p)) * 16, 14 + Math.max(0, Math.sin(p + Math.PI)) * 16],
  };
};

/**
 * Standing, alive.
 *
 * A character that holds a pose exactly is the clearest tell that nothing is
 * animating. This is almost nothing — a breath and a slow head drift — and it
 * is the difference between a figure and a sticker.
 */
export const idle = (frame: number, fps: number): Pose => {
  const t = (frame / fps) * TAU * 0.26;
  return {
    bob: Math.sin(t) * 1.8,
    lean: 1.5,
    headTilt: Math.sin(t * 0.55) * 2.4,
    hip: [3, -3],
    knee: [2, 3],
    shoulder: [5 + Math.sin(t) * 2, -5 - Math.sin(t) * 2],
    elbow: [11, 12],
  };
};

/** A wave, over an idle body, so the rest of the figure keeps breathing. */
export const wave = (frame: number, fps: number): Pose => {
  const base = idle(frame, fps);
  const t = (frame / fps) * TAU * 1.35;
  return {
    ...base,
    shoulder: [-158, -7],
    // The forearm does the waving; the upper arm holds it up.
    elbow: [26 + Math.sin(t) * 30, 11],
  };
};

/** Seated, head down over a book or a phone. */
export const study = (frame: number, fps: number): Pose => {
  const t = (frame / fps) * TAU * 0.32;
  return {
    bob: 24,
    lean: 15,
    headTilt: 17 + Math.sin(t) * 1.5,
    hip: [-76, -70],
    knee: [80, 76],
    shoulder: [-32, -28],
    elbow: [60 + Math.sin(t) * 7, 56],
  };
};

/**
 * Blend two poses. `t` 0 is `a`, 1 is `b`.
 *
 * Cutting between cycles snaps; this is how a character stops walking and
 * starts waving without a jump.
 */
export const blendPose = (a: Pose, b: Pose, t: number): Pose => {
  const k = Math.max(0, Math.min(1, t));
  const m = (x: number, y: number) => x + (y - x) * k;
  const p = (x: [number, number], y: [number, number]): [number, number] => [
    m(x[0], y[0]),
    m(x[1], y[1]),
  ];
  return {
    bob: m(a.bob, b.bob),
    lean: m(a.lean, b.lean),
    headTilt: m(a.headTilt, b.headTilt),
    hip: p(a.hip, b.hip),
    knee: p(a.knee, b.knee),
    shoulder: p(a.shoulder, b.shoulder),
    elbow: p(a.elbow, b.elbow),
  };
};
