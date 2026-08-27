import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BODY_FONT, BRAND, HEADING_FONT, HEADING_TRACKING, MONO_FONT } from "../brand";
import { rendererFor } from "./scenes";
import type { ScriptScene } from "./script";
import {
  BEAT,
  BPM,
  SCENE_STARTS,
  SCRIPT,
  TOTAL_BEATS,
  TOTAL_FRAMES,
  framesFor,
} from "./script";

/**
 * Every scene of the piece as one contact sheet.
 *
 * This exists because the feedback loop was wrong. Rendering 1800 frames to
 * find out that a headline is weak or a phone sits too low costs twenty
 * minutes; this is a single still and costs seconds:
 *
 *     npx remotion still Storyboard out/storyboard.png
 *
 * Each cell freezes its scene at a frame late enough that every entrance has
 * landed, so what you see is the composed shot rather than a half-played
 * animation. Judge layout, copy and pacing here. Only then pay for a render.
 *
 * Deliberately ungraded: <FilmGrade> and <HandheldCamera> wrap the whole piece
 * in SkoolConnectPulse, not the individual scenes. Leaving them off keeps the
 * grain out of thumbnails this small, where it would read as noise rather than
 * as texture.
 */

const COLUMNS = 5;
const SCALE = 0.19;
const THUMB_W = Math.round(1080 * SCALE);
const THUMB_H = Math.round(1920 * SCALE);
const GAP = 22;
const LABEL_H = 52;
const PAD = 48;
const HEADER_H = 128;

const ROWS = Math.ceil(SCRIPT.length / COLUMNS);

export const STORYBOARD_WIDTH = PAD * 2 + COLUMNS * THUMB_W + (COLUMNS - 1) * GAP;
export const STORYBOARD_HEIGHT =
  PAD * 2 + HEADER_H + ROWS * (THUMB_H + LABEL_H) + (ROWS - 1) * GAP;

/** mm:ss.f from a frame number at 30fps. */
const timecode = (frame: number) => {
  const total = frame / 30;
  const m = Math.floor(total / 60);
  const s = total - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
};

/**
 * Which frame of a scene to show.
 *
 * 62% through: late enough that staggered entrances have all landed, early
 * enough to sit before the exit fade. A scene that looks wrong here is wrong.
 */
const previewFrameFor = (duration: number) => Math.round(duration * 0.62);

const Cell: React.FC<{
  index: number;
  scene: ScriptScene;
  startFrame: number;
}> = ({ index, scene, startFrame }) => {
  const duration = framesFor(scene);
  const Renderer = rendererFor(scene);

  return (
    <div style={{ width: THUMB_W }}>
      <div
        style={{
          width: THUMB_W,
          height: THUMB_H,
          overflow: "hidden",
          position: "relative",
          borderRadius: 12,
          border: `1px solid rgba(255,255,255,0.16)`,
          backgroundColor: BRAND.primary,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
          }}
        >
          {/*
            A Sequence with a negative `from` shifts the child's clock forward:
            the child sees `parentFrame - from`, so at the storyboard's frame 0
            it renders as though it were at previewFrame.

            <Freeze frame={n}> reads like the right tool here and is not — on a
            one-frame composition it left every cell empty.
          */}
          <Sequence from={-previewFrameFor(duration)} layout="none">
            <Renderer scene={scene} />
          </Sequence>
        </div>

        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: "rgba(0,0,0,0.62)",
            color: BRAND.white,
            fontFamily: MONO_FONT,
            fontSize: 16,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {index + 1}
        </div>
      </div>

      <div style={{ height: LABEL_H, paddingTop: 8 }}>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: HEADING_TRACKING,
            color: BRAND.white,
          }}
        >
          {scene.id}
        </div>
        <div
          style={{
            fontFamily: MONO_FONT,
            fontSize: 13,
            color: BRAND.surface,
            opacity: 0.66,
            marginTop: 2,
          }}
        >
          {timecode(startFrame)} · {scene.beats}b · {duration}f
        </div>
      </div>
    </div>
  );
};

export const Storyboard: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a2019", padding: PAD }}>
      <div style={{ height: HEADER_H }}>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 46,
            fontWeight: 900,
            letterSpacing: HEADING_TRACKING,
            color: BRAND.white,
          }}
        >
          SkoolConnectPulse — storyboard
        </div>
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 21,
            color: BRAND.surface,
            opacity: 0.7,
            marginTop: 8,
          }}
        >
          {SCRIPT.length} scenes · {TOTAL_BEATS} beats · {TOTAL_FRAMES} frames ·{" "}
          {(TOTAL_FRAMES / 30).toFixed(1)}s · 1 beat = {BEAT} frames at {BPM} BPM
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: GAP,
          alignContent: "flex-start",
        }}
      >
        {SCRIPT.map((scene, i) => (
          <Cell key={scene.id} index={i} scene={scene} startFrame={SCENE_STARTS[i]} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
