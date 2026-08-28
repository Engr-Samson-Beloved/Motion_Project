/**
 * Character animation — a jointed 2D rig driven by frame-pure motion cycles.
 *
 *   rig     the puppet: nested SVG rotations, flat colour, any size
 *   cycles  what it does: walk, idle, wave, study, and blends between them
 *
 * Brand-agnostic, like `lib/cinema`. It takes colours and sizes; it knows no
 * palette.
 */

export { Character, RIG_ASPECT, RIG_HEIGHT, RIG_WIDTH } from "./rig";
export type { CharacterProps } from "./rig";

export { blendPose, idle, study, walk, walkCycleFrames, wave } from "./cycles";
export type { Pose } from "./cycles";
