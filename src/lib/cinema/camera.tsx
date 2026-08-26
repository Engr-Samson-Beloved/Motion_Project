import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";

/**
 * Camera moves.
 *
 * A locked-off frame is the strongest tell that a piece was coded rather than
 * shot. Everything here exists to put the frame back in someone's hands
 * without the motion ever becoming the subject.
 *
 * All movement is sampled from `noise2D`, which is a pure function of its
 * inputs — so the drift is smooth and organic but still identical on every
 * render pass.
 */

const SEED = {
  x: "cam-x",
  y: "cam-y",
  rot: "cam-rot",
  scale: "cam-scale",
} as const;

export type HandheldCameraProps = {
  children: React.ReactNode;
  /** Overall strength. 0 is locked off, 1 is a operator who has had coffee. */
  intensity?: number;
  /** How fast the drift evolves. Lower is slower and heavier. */
  speed?: number;
  /** Maximum translation in pixels at intensity 1. */
  travel?: number;
  /** Maximum rotation in degrees at intensity 1. */
  sway?: number;
  style?: React.CSSProperties;
};

export const HandheldCamera: React.FC<HandheldCameraProps> = ({
  children,
  intensity = 1,
  speed = 0.6,
  travel = 26,
  sway = 0.55,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Seconds rather than frames, so the feel survives an fps change.
  const t = (frame / fps) * speed;

  const x = noise2D(SEED.x, t, 0) * travel * intensity;
  const y = noise2D(SEED.y, 0, t) * travel * 0.7 * intensity;
  const rot = noise2D(SEED.rot, t * 0.7, t * 0.7) * sway * intensity;

  // Always scale up a little: the frame must never expose its own edges as it
  // drifts, and rotation eats more margin than translation does.
  const breathe = noise2D(SEED.scale, t * 0.4, 0) * 0.012 * intensity;
  const safety = 1 + (travel / 1000) * intensity + Math.abs(sway) * 0.02 * intensity;

  return (
    <AbsoluteFill
      style={{
        ...style,
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${safety + breathe})`,
        transformOrigin: "center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export type PushInProps = {
  children: React.ReactNode;
  /** Start scale. */
  from?: number;
  /** End scale. */
  to?: number;
  /** Frames over which the push runs. Defaults to the whole sequence. */
  durationInFrames?: number;
  /** Origin of the push, as a CSS transform-origin. */
  origin?: string;
  style?: React.CSSProperties;
};

/** Slow scale ramp across a scene. Linear on purpose — a spring reads as a zoom. */
export const PushIn: React.FC<PushInProps> = ({
  children,
  from = 1,
  to = 1.08,
  durationInFrames,
  origin = "center",
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: total } = useVideoConfig();
  const span = durationInFrames ?? total;

  const scale = interpolate(frame, [0, span], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ ...style, transform: `scale(${scale})`, transformOrigin: origin }}>
      {children}
    </AbsoluteFill>
  );
};

export type ParallaxProps = {
  children: React.ReactNode;
  /**
   * How far back this layer sits. 0 is glued to the camera, 1 is the far
   * background. Nearer layers move further, which is what sells the depth.
   */
  depth?: number;
  /** Shared camera offset, normally driven by the same noise as HandheldCamera. */
  intensity?: number;
  speed?: number;
  travel?: number;
  style?: React.CSSProperties;
};

/**
 * A layer that drifts by an amount proportional to its distance from the
 * camera. Stack several of these inside one scene, giving each a different
 * `depth`, and a flat composite gains a z-axis.
 */
export const Parallax: React.FC<ParallaxProps> = ({
  children,
  depth = 0.5,
  intensity = 1,
  speed = 0.5,
  travel = 60,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame / fps) * speed;

  // Foreground layers travel most, so invert depth into a movement factor.
  const factor = (1 - depth) * intensity;
  const x = noise2D("plx-x", t, depth * 10) * travel * factor;
  const y = noise2D("plx-y", depth * 10, t) * travel * 0.6 * factor;

  return (
    <AbsoluteFill
      style={{
        ...style,
        transform: `translate(${x}px, ${y}px) scale(${1 + 0.06 * factor})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
