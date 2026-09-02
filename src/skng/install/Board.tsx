import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  BODY_FONT,
  HEADING_FONT,
  HEADING_TRACKING,
  MONO_FONT,
  STORY,
} from "../story/palette";
import { AddToHome } from "./AddToHome";
import { FPS } from "./theme";
import { TOTAL_FRAMES } from "./script";

/**
 * Contact sheet for AddToHome.
 *
 *     npm run install-board
 *
 * Sampled at the frames that can actually be wrong, not at even intervals.
 * For this piece that means every frame where something is *in flight*: a sheet
 * half-risen, a list mid-drag, the browser collapsing. A five-step procedure
 * shot as five static states would look correct in every thumbnail and still be
 * broken, because the whole film is the transitions.
 *
 * Three specific things the sheet is here to catch:
 *
 *   the pointer landing somewhere other than the control it is pressing —
 *   the tell that the interaction is faked;
 *   a ring drawn around a box that has since moved, which is what happens the
 *   moment a sheet's position and a ring's position stop coming from the same
 *   number;
 *   two app icons on screen at once during the flight, where the sheet's copy
 *   and the flying one overlap by a frame.
 *
 * Dark board on purpose even though the piece is light: at this scale a
 * near-white thumbnail needs something to sit against.
 */

const SAMPLES = [
  { at: 70, note: "title" },
  { at: 146, note: "phone rising, title out" },
  { at: 196, note: "step 1 — Safari" },
  { at: 268, note: "ring on Share" },
  { at: 292, note: "tap — Share" },
  { at: 316, note: "sheet mid-rise" },
  { at: 360, note: "step 2 — share sheet" },
  { at: 446, note: "mid-drag, list moving" },
  { at: 500, note: "ring on the row" },
  { at: 540, note: "tap — Add to Home Screen" },
  { at: 584, note: "sheets crossing" },
  { at: 640, note: "step 4 — name and keyboard" },
  { at: 700, note: "ring on Add" },
  { at: 726, note: "tap — Add" },
  { at: 764, note: "icon in flight, browser collapsing" },
  { at: 812, note: "landed" },
  { at: 862, note: "step 5 — home screen" },
  { at: 1046, note: "lockup and address" },
] as const;

const COLUMNS = 9;
const SCALE = 0.17;
const THUMB_W = Math.round(1080 * SCALE);
const THUMB_H = Math.round(1920 * SCALE);
const GAP = 18;
const CAPTION_H = 42;
const PAD = 44;
const HEADER_H = 126;

const ROWS = Math.ceil(SAMPLES.length / COLUMNS);

export const BOARD_WIDTH = PAD * 2 + COLUMNS * THUMB_W + (COLUMNS - 1) * GAP;
export const BOARD_HEIGHT =
  PAD * 2 + HEADER_H + ROWS * (THUMB_H + CAPTION_H) + (ROWS - 1) * GAP;

const timecode = (frame: number) => `0:${(frame / FPS).toFixed(1).padStart(4, "0")}`;

export const Board: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0F141A", padding: PAD }}>
    <div style={{ height: HEADER_H }}>
      <div
        style={{
          fontFamily: HEADING_FONT,
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: HEADING_TRACKING,
          color: STORY.white,
        }}
      >
        Add to Home Screen — contact sheet
      </div>
      <div style={{ fontFamily: BODY_FONT, fontSize: 18, color: STORY.muted, marginTop: 9 }}>
        {TOTAL_FRAMES} frames · {(TOTAL_FRAMES / FPS).toFixed(0)}s · 1080x1920 ·
        light mode · iOS drawn to points
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
                <AddToHome />
              </Sequence>
            </div>
          </div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 12, color: STORY.muted, marginTop: 8 }}>
            f{s.at} · {timecode(s.at)}
          </div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: STORY.line2, marginTop: 2 }}>
            {s.note}
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
