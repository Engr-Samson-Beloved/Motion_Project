/**
 * Cinema toolkit — brand-agnostic pieces that make a composition look shot
 * rather than drawn. Nothing in here knows about SkoolConnectNG except the
 * default fonts in `type.tsx`; the rest is reusable across any project.
 *
 *   grade   grain, bloom, vignette, chromatic aberration
 *   camera  handheld drift, push-in, parallax layers
 *   blur    motion blur for elements (Slam) and for the frame (Whip)
 *   type    text that sizes itself to the space it is given
 *   audio   the beat grid, the music bed, and audio-reactive levels
 */

export { FilmGrade } from "./grade";
export type { FilmGradeProps } from "./grade";

export { HandheldCamera, PushIn, Parallax } from "./camera";
export type { HandheldCameraProps, PushInProps, ParallaxProps } from "./camera";

export { Slam, Whip, Trail, CameraMotionBlur } from "./blur";
export type { SlamProps, WhipProps } from "./blur";

export { FitHeading, useFittedFontSize } from "./type";
export type { FitHeadingProps } from "./type";

export {
  BPM,
  Track,
  barFrames,
  barPulse,
  beatFrames,
  beatGrid,
  beatPhase,
  beatPulse,
  onBeat,
  useEnergy,
  useLevel,
} from "./audio";
export type { TrackProps } from "./audio";
