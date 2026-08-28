import React from "react";
import type { Pose } from "./cycles";

/**
 * A jointed 2D character, drawn as nested SVG rotations.
 *
 * The rig is a hierarchy, not a set of independently placed parts: the shin
 * rotates inside the thigh's group, so bending the hip carries the whole leg
 * with it and the knee stays attached. That is the entire trick, and it is why
 * a few sine waves in `cycles.ts` produce a walk rather than a twitch.
 *
 * Limbs are round-capped strokes rather than filled outlines. It costs one
 * attribute instead of a path per pose, it reads as solid flat colour, and it
 * survives being scaled from a 60px background figure to a 600px foreground
 * one without redrawing.
 *
 * Brand-agnostic on purpose, like `lib/cinema` — it takes colours, it does not
 * know any.
 */

/* Rig geometry, in a 120x220 local space. The figure faces +x. */
const HIP_X = 60;
const HIP_Y = 118;
const KNEE_Y = 158;
const ANKLE_Y = 196;
const FOOT_LEN = 16;
const SHOULDER_Y = 72;
const ELBOW_Y = 104;
const HAND_Y = 132;
const NECK_Y = 64;
const TORSO_TOP_Y = 70;
const HEAD_Y = 46;
const HEAD_R = 15;

export const RIG_WIDTH = 120;
export const RIG_HEIGHT = 220;
export const RIG_ASPECT = RIG_WIDTH / RIG_HEIGHT;

/**
 * Shoulders sit off the centreline.
 *
 * With both arms pivoting on the torso's own axis, a 10-wide arm hanging
 * inside a 28-wide torso is invisible for most of the cycle — the walk looked
 * armless until the swing was near its extreme. Pushing the near arm forward
 * and the far arm back keeps both readable against the body at every phase.
 */
const SHOULDER_OFFSET = 6;

const Limb: React.FC<{
  from: number;
  to: number;
  color: string;
  width: number;
  x?: number;
}> = ({ from, to, color, width, x = HIP_X }) => (
  <line
    x1={x}
    y1={from}
    x2={x}
    y2={to}
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
  />
);

const Leg: React.FC<{
  hip: number;
  knee: number;
  color: string;
  width: number;
}> = ({ hip, knee, color, width }) => (
  <g transform={`rotate(${hip} ${HIP_X} ${HIP_Y})`}>
    <Limb from={HIP_Y} to={KNEE_Y} color={color} width={width} />
    <g transform={`rotate(${knee} ${HIP_X} ${KNEE_Y})`}>
      <Limb from={KNEE_Y} to={ANKLE_Y} color={color} width={width} />
      <line
        x1={HIP_X}
        y1={ANKLE_Y}
        x2={HIP_X + FOOT_LEN}
        y2={ANKLE_Y}
        stroke={color}
        strokeWidth={width * 0.82}
        strokeLinecap="round"
      />
    </g>
  </g>
);

const Arm: React.FC<{
  shoulder: number;
  elbow: number;
  color: string;
  width: number;
  /** +1 for the near arm, -1 for the far one. */
  side: 1 | -1;
}> = ({ shoulder, elbow, color, width, side }) => {
  const x = HIP_X + SHOULDER_OFFSET * side;
  return (
    <g transform={`rotate(${shoulder} ${x} ${SHOULDER_Y})`}>
      <Limb from={SHOULDER_Y} to={ELBOW_Y} color={color} width={width} x={x} />
      <g transform={`rotate(${elbow} ${x} ${ELBOW_Y})`}>
        <Limb from={ELBOW_Y} to={HAND_Y} color={color} width={width} x={x} />
      </g>
    </g>
  );
};

export type CharacterProps = {
  pose: Pose;
  /** Rendered height in pixels. Width follows RIG_ASPECT. */
  size?: number;
  color: string;
  /** Far-side limbs. A flat darker tint of `color` — never a gradient. */
  farColor?: string;
  /** 0 none, 1 cap, 2 headwrap. Variation without reaching for costume. */
  head?: 0 | 1 | 2;
  /** Face -x instead of +x. */
  flip?: boolean;
  opacity?: number;
  style?: React.CSSProperties;
};

export const Character: React.FC<CharacterProps> = ({
  pose,
  size = 220,
  color,
  farColor,
  head = 0,
  flip = false,
  opacity = 1,
  style,
}) => {
  const far = farColor ?? color;
  const legW = 13;
  const armW = 10;

  return (
    <svg
      width={size * RIG_ASPECT}
      height={size}
      viewBox={`0 0 ${RIG_WIDTH} ${RIG_HEIGHT}`}
      style={{ opacity, overflow: "visible", ...style }}
    >
      <g
        transform={
          (flip ? `translate(${RIG_WIDTH} 0) scale(-1 1) ` : "") +
          `translate(0 ${pose.bob})`
        }
      >
        {/* Draw order is the depth: far limbs, then the body, then near ones. */}
        <Leg hip={pose.hip[1]} knee={pose.knee[1]} color={far} width={legW} />
        <Leg hip={pose.hip[0]} knee={pose.knee[0]} color={color} width={legW} />

        {/* Arms and head lean with the torso; legs do not. */}
        <g transform={`rotate(${pose.lean} ${HIP_X} ${HIP_Y})`}>
          <Arm
            shoulder={pose.shoulder[1]}
            elbow={pose.elbow[1]}
            color={far}
            width={armW}
            side={-1}
          />

          <Limb from={HIP_Y} to={TORSO_TOP_Y} color={color} width={28} />

          <g transform={`rotate(${pose.headTilt} ${HIP_X} ${NECK_Y})`}>
            <circle cx={HIP_X} cy={HEAD_Y} r={HEAD_R} fill={color} />
            {/*
              A cap is a dome that follows the skull plus a brim. Drawn as a
              triangle over the head it read as a chip knocked out of it.
            */}
            {head === 1 ? (
              <>
                <path
                  d={`M${HIP_X - HEAD_R},${HEAD_Y - 2} A${HEAD_R},${HEAD_R} 0 0 1 ${HIP_X + HEAD_R},${HEAD_Y - 2} Z`}
                  fill={color}
                />
                {/*
                  The brim carries the whole read: on a one-colour silhouette
                  the crown disappears into the skull, so only this says "cap".
                  It has to be a wedge with parallel edges — tapered to a point
                  it looked like a beak.
                */}
                <path
                  d={
                    `M${HIP_X - 2},${HEAD_Y - 8} ` +
                    `L${HIP_X + HEAD_R + 10},${HEAD_Y - 5} ` +
                    `L${HIP_X + HEAD_R + 9},${HEAD_Y} ` +
                    `L${HIP_X - 2},${HEAD_Y - 1} Z`
                  }
                  fill={color}
                />
              </>
            ) : null}
            {head === 2 ? (
              <path
                d={`M${HIP_X - 15},${HEAD_Y - 3} C${HIP_X - 15},${HEAD_Y - 20} ${HIP_X + 15},${HEAD_Y - 20} ${HIP_X + 15},${HEAD_Y - 3} C${HIP_X + 15},${HEAD_Y - 12} ${HIP_X - 15},${HEAD_Y - 12} ${HIP_X - 15},${HEAD_Y - 3} Z`}
                fill={color}
              />
            ) : null}
          </g>

          <Arm
            shoulder={pose.shoulder[0]}
            elbow={pose.elbow[0]}
            color={color}
            width={armW}
            side={1}
          />
        </g>
      </g>
    </svg>
  );
};
