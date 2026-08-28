import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  BODY_FONT,
  FPS,
  H,
  HEADING_FONT,
  HEADING_TRACKING,
  MONO_FONT,
  STORY,
  W,
} from "./palette";
import { rendererFor } from "./scenes";
import {
  SCENE_STARTS,
  SCRIPT,
  TOTAL_FRAMES,
  type StoryScene,
  framesFor,
} from "./script";

/**
 * Every scene of the film as one contact sheet.
 *
 *     npm run story-board
 *
 * Rendering 2700 frames to find out that a layout is wrong costs half an hour.
 * This is a single still and costs seconds.
 *
 * Three samples per scene rather than one, because this film's scenes are long
 * — `connect` runs fifteen seconds and holds three distinct beats — and a
 * single thumbnail per scene would show one of them and hide the other two.
 * The samples sit at 22%, 55% and 88%, which brackets a three-beat scene and
 * still lands inside the composed part of a short one.
 *
 * Deliberately ungraded: FilmGrade and HandheldCamera wrap the whole film in
 * SkoolConnectStory, not the individual scenes, and grain at thumbnail size
 * reads as noise rather than as texture.
 */

const SAMPLES = [0.22, 0.55, 0.88] as const;
const SCALE = 0.28;
const THUMB_W = Math.round(W * SCALE);
const THUMB_H = Math.round(H * SCALE);
const GAP = 20;
const ROW_LABEL_H = 46;
/** The frame/timecode line under each thumbnail. Counted, or the last row clips. */
const CAPTION_H = 26;
const ROW_GAP = 26;
const PAD = 48;
const HEADER_H = 150;

export const STORYBOARD_WIDTH =
  PAD * 2 + SAMPLES.length * THUMB_W + (SAMPLES.length - 1) * GAP;
export const STORYBOARD_HEIGHT =
  PAD * 2 +
  HEADER_H +
  SCRIPT.length * (ROW_LABEL_H + THUMB_H + CAPTION_H) +
  (SCRIPT.length - 1) * ROW_GAP;

/** mm:ss.f from a frame number. */
const timecode = (frame: number) => {
  const total = frame / FPS;
  const m = Math.floor(total / 60);
  const s = total - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
};

const Thumb: React.FC<{ scene: StoryScene; at: number; caption: string }> = ({
  scene,
  at,
  caption,
}) => {
  const Renderer = rendererFor(scene);
  return (
    <div style={{ width: THUMB_W }}>
      <div
        style={{
          width: THUMB_W,
          height: THUMB_H,
          overflow: "hidden",
          position: "relative",
          borderRadius: 8,
          border: `1px solid ${STORY.line2}`,
          backgroundColor: STORY.dark,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: H,
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
          }}
        >
          {/*
            A Sequence with a negative `from` shifts the child's clock forward,
            so at the storyboard's frame 0 the scene renders as though it were
            at frame `at`. <Freeze> reads like the right tool here and is not —
            on a one-frame composition it leaves every cell empty.
          */}
          <Sequence from={-at} layout="none">
            <Renderer scene={scene} />
          </Sequence>
        </div>
      </div>
      <div
        style={{
          fontFamily: MONO_FONT,
          fontSize: 13,
          color: STORY.muted,
          marginTop: 6,
        }}
      >
        {caption}
      </div>
    </div>
  );
};

export const Storyboard: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0F141A", padding: PAD }}>
    <div style={{ height: HEADER_H }}>
      <div
        style={{
          fontFamily: HEADING_FONT,
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: HEADING_TRACKING,
          color: STORY.white,
        }}
      >
        SkoolConnectNG — 90s story film
      </div>
      <div
        style={{
          fontFamily: BODY_FONT,
          fontSize: 21,
          color: STORY.muted,
          marginTop: 10,
        }}
      >
        {SCRIPT.length} scenes · {TOTAL_FRAMES} frames ·{" "}
        {(TOTAL_FRAMES / FPS).toFixed(1)}s · 1920x1080 · samples at{" "}
        {SAMPLES.map((s) => `${Math.round(s * 100)}%`).join(", ")} of each scene
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: ROW_GAP }}>
      {SCRIPT.map((scene, i) => {
        const duration = framesFor(scene);
        return (
          <div key={scene.id}>
            <div
              style={{
                height: ROW_LABEL_H,
                display: "flex",
                alignItems: "baseline",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 15,
                  fontWeight: 700,
                  color: STORY.green,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontFamily: HEADING_FONT,
                  fontSize: 23,
                  fontWeight: 800,
                  letterSpacing: HEADING_TRACKING,
                  color: STORY.white,
                }}
              >
                {scene.title}
              </div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 14, color: STORY.muted }}>
                {scene.time} · {timecode(SCENE_STARTS[i])} · {duration}f · {scene.id}
              </div>
            </div>

            <div style={{ display: "flex", gap: GAP }}>
              {SAMPLES.map((s) => {
                const at = Math.round(duration * s);
                return (
                  <Thumb
                    key={s}
                    scene={scene}
                    at={at}
                    caption={`f${at} · ${timecode(SCENE_STARTS[i] + at)}`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);
