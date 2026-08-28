import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  BODY_FONT,
  FPS,
  HEADING_FONT,
  HEADING_TRACKING,
  MONO_FONT,
  STORY,
} from "../story/palette";
import { SameQuestion } from "./SameQuestion";
import { TOTAL_FRAMES } from "./cast";

/**
 * Contact sheet for SameQuestion.
 *
 *     npm run same-board
 *
 * Eight sampled frames, chosen at the moments that can actually be wrong: the
 * push-in, the reveal, the lines drawing, the mesh complete, a pulse in
 * flight, the first waves, everyone waving, the lockup. Rendering 900 frames
 * to discover a character is standing in the wrong place costs minutes; this
 * costs seconds.
 *
 * Ungraded on purpose — FilmGrade wraps the piece, and grain at thumbnail size
 * reads as noise rather than texture. It is still visible here because this
 * samples the whole composition; that is a fair trade for not maintaining a
 * second copy of the staging.
 */

const SAMPLES = [
  { at: 60, note: "alone, pushed in" },
  { at: 240, note: "the others arrive" },
  { at: 400, note: "lines drawing" },
  { at: 500, note: "mesh complete" },
  { at: 560, note: "answer in flight" },
  { at: 660, note: "first waves" },
  { at: 770, note: "everyone waving" },
  { at: 880, note: "lockup" },
] as const;

const COLUMNS = 4;
const SCALE = 0.22;
const THUMB_W = Math.round(1080 * SCALE);
const THUMB_H = Math.round(1920 * SCALE);
const GAP = 20;
const CAPTION_H = 44;
const PAD = 48;
const HEADER_H = 132;

const ROWS = Math.ceil(SAMPLES.length / COLUMNS);

export const BOARD_WIDTH = PAD * 2 + COLUMNS * THUMB_W + (COLUMNS - 1) * GAP;
export const BOARD_HEIGHT =
  PAD * 2 + HEADER_H + ROWS * (THUMB_H + CAPTION_H) + (ROWS - 1) * GAP;

const timecode = (frame: number) => {
  const total = frame / FPS;
  return `0:${total.toFixed(1).padStart(4, "0")}`;
};

export const Board: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0F141A", padding: PAD }}>
    <div style={{ height: HEADER_H }}>
      <div
        style={{
          fontFamily: HEADING_FONT,
          fontSize: 42,
          fontWeight: 900,
          letterSpacing: HEADING_TRACKING,
          color: STORY.white,
        }}
      >
        Same Question — contact sheet
      </div>
      <div
        style={{
          fontFamily: BODY_FONT,
          fontSize: 19,
          color: STORY.muted,
          marginTop: 9,
        }}
      >
        {TOTAL_FRAMES} frames · {(TOTAL_FRAMES / FPS).toFixed(0)}s · 1080x1920 ·
        7 characters, one continuous shot
      </div>
    </div>

    <div style={{ display: "flex", flexWrap: "wrap", gap: GAP, alignContent: "flex-start" }}>
      {SAMPLES.map((s) => (
        <div key={s.at} style={{ width: THUMB_W }}>
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
                width: 1080,
                height: 1920,
                transform: `scale(${SCALE})`,
                transformOrigin: "top left",
              }}
            >
              {/* Negative `from` shifts the child's clock forward, so at the
                  sheet's frame 0 the piece renders as though at `s.at`. */}
              <Sequence from={-s.at} layout="none">
                <SameQuestion />
              </Sequence>
            </div>
          </div>
          <div
            style={{
              fontFamily: MONO_FONT,
              fontSize: 13,
              color: STORY.muted,
              marginTop: 8,
            }}
          >
            f{s.at} · {timecode(s.at)}
          </div>
          <div
            style={{
              fontFamily: MONO_FONT,
              fontSize: 12,
              color: STORY.line2,
              marginTop: 2,
            }}
          >
            {s.note}
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
