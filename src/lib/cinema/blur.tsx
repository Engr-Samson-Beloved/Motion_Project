import React from "react";
import { CameraMotionBlur, Trail } from "@remotion/motion-blur";

/**
 * Motion blur.
 *
 * The reel's entrances run on very low spring damping, so they cover a lot of
 * distance in very few frames. Rendered crisply, that reads as strobing rather
 * than speed — the eye gets a series of sharp stills instead of a movement.
 * Blur is what turns a fast cut into a hit.
 *
 * Two flavours, and they are not interchangeable:
 *
 *   <Slam>    one element moving fast against a still frame
 *   <Whip>    the whole frame moving — a push, a whip pan, a scale slam
 *
 * Both re-render their children several times per frame, so wrap the smallest
 * subtree that actually moves. Wrapping a whole scene multiplies its render
 * cost by the sample count for no visible gain.
 */

export type SlamProps = {
  children: React.ReactNode;
  /**
   * Trail length. More layers is a smoother smear at linear cost.
   * Below ~8 the trail reads as ghosting rather than blur.
   */
  layers?: number;
  /** Frames between layers. Small values keep the trail tight to the object. */
  lagInFrames?: number;
  /** Opacity of the strongest trail layer. */
  trailOpacity?: number;
};

/**
 * Trailing blur for a single moving element.
 *
 * Children must be absolutely positioned — `<Trail>` stacks its layers on top
 * of one another, so anything in normal flow will be laid out N times instead.
 */
export const Slam: React.FC<SlamProps> = ({
  children,
  layers = 12,
  lagInFrames = 0.55,
  trailOpacity = 0.5,
}) => (
  <Trail layers={layers} lagInFrames={lagInFrames} trailOpacity={trailOpacity}>
    {children}
  </Trail>
);

export type WhipProps = {
  children: React.ReactNode;
  /**
   * Shutter angle in degrees, 0-360. 180 is the film convention and is what
   * most footage you have ever seen was shot at. Push past 270 only for a
   * deliberate smear.
   */
  shutterAngle?: number;
  /** Samples averaged per frame. 5-10 is the useful range; more costs render time. */
  samples?: number;
};

/** Whole-frame camera blur. Use on pushes, whips and scale slams. */
export const Whip: React.FC<WhipProps> = ({
  children,
  shutterAngle = 180,
  samples = 8,
}) => (
  <CameraMotionBlur shutterAngle={shutterAngle} samples={samples}>
    {children}
  </CameraMotionBlur>
);

export { CameraMotionBlur, Trail };
