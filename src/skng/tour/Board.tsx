import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  BODY_FONT,
  HEADING_FONT,
  HEADING_TRACKING,
  MONO_FONT,
  STORY,
} from "../story/palette";
import { CampusTour } from "./CampusTour";
import { FPS } from "./theme";
import { TOTAL_FRAMES } from "./shots";

/**
 * Contact sheet for CampusTour.
 *
 *     npm run tour-board
 *
 * Fourteen frames, sampled at the moments that can actually be wrong rather
 * than at even intervals: each transition, each lens at full lift, each
 * push-in at its furthest, and the two frames where the piece changes shape.
 * Rendering 1140 frames to find out that a lens is sitting on top of the
 * caption costs minutes; this costs seconds.
 *
 * The board is dark on purpose even though the piece is light — a light
 * thumbnail needs something to sit against, and at this scale a border alone
 * is not enough to tell where a near-white frame ends.
 */

const SAMPLES = [
  { at: 96, note: "statement, full bleed" },
  { at: 132, note: "field collapsing" },
  { at: 178, note: "feed arrives" },
  { at: 236, note: "feed, pushed in" },
  // Dead centre of a pan. Nothing else in the sheet catches two devices in
  // flight, which is where the rail and the scale dip have to prove out.
  { at: 270, note: "mid-pan, feed to discover" },
  { at: 348, note: "discover, lens up" },
  { at: 432, note: "people, pushed in" },
  { at: 545, note: "connect, lens up" },
  { at: 650, note: "inbox, lens up" },
  { at: 748, note: "community, pushed in" },
  { at: 860, note: "profile, lens up" },
  { at: 936, note: "constellation forming" },
  { at: 1000, note: "mesh complete" },
  { at: 1104, note: "lockup" },
] as const;

const COLUMNS = 7;
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
        Campus Tour — contact sheet
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
        light mode · seven captured screens
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
                <CampusTour />
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
