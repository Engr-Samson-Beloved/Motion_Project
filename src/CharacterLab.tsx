import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Character,
  blendPose,
  idle,
  study,
  walk,
  wave,
} from "./lib/character";
import { Field, Grid } from "./skng/story/ui";
import { STORY, eramp } from "./skng/story/palette";

/**
 * The rig, moving. 1920x1080, 180 frames (6s).
 *
 * One continuous shot: a student walks in, stops, and waves, while two others
 * hold their own cycles behind. It exists to answer "does this actually
 * animate" with something you can watch rather than a claim — `CharacterSheet`
 * proves the joints, this proves the motion.
 *
 * The walk-to-stand-to-wave hand-off is the part worth looking at. Cutting
 * between cycles snaps hard; `blendPose` crossfades the joint angles, so the
 * legs settle out of the stride instead of teleporting to standing.
 */

const WALK_END = 96;
const SETTLE_END = 122;
const WAVE_START = 132;

export const CharacterLab: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Travel is tied to the same ramp that ends the walk, so the feet stop
  // sliding at the moment the stride stops. A character that keeps drifting
  // after it stops walking is the classic tell.
  const travel = eramp(frame, 0, WALK_END);
  const x = -260 + travel * 1080;

  // walk -> idle -> wave, blended rather than cut.
  const walking = walk(frame, fps);
  const standing = idle(frame, fps);
  const waving = wave(frame - WAVE_START, fps);

  const toStand = eramp(frame, WALK_END - 14, SETTLE_END);
  const toWave = eramp(frame, WAVE_START, WAVE_START + 22);

  const pose = blendPose(blendPose(walking, standing, toStand), waving, toWave);

  return (
    <AbsoluteFill>
      <Field />
      <Grid opacity={0.4} />

      {/* Background: two others, living their own cycles at their own phase. */}
      <div style={{ position: "absolute", left: 1320, top: 300 }}>
        <Character
          pose={idle(frame + 40, fps)}
          size={300}
          color={STORY.line2}
          farColor={STORY.line}
          head={2}
        />
      </div>
      <div style={{ position: "absolute", left: 1560, top: 470 }}>
        <Character
          pose={study(frame + 15, fps)}
          size={260}
          color={STORY.line2}
          farColor={STORY.line}
        />
      </div>

      {/* Foreground: the one doing the hand-off. */}
      <div style={{ position: "absolute", left: x, top: 420 }}>
        <Character
          pose={pose}
          size={520}
          color={STORY.white}
          farColor="#7E8B95"
          head={1}
        />
      </div>

      {/*
        A ground line, so the walk has something to walk on.

        Placed from the rig rather than by eye: the sole sits at 202.5 of the
        220-unit rig box, so for a figure of height H at top T the feet land at
        T + 0.9205*H. Guessing put the line 35px under the feet and the
        character read as hovering.
      */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: Math.round(420 + 0.9205 * 520),
          height: 1,
          backgroundColor: STORY.line2,
        }}
      />
    </AbsoluteFill>
  );
};

export const CHARACTER_LAB_DURATION = 180;
