import React from "react";
import { OffthreadVideo, staticFile } from "remotion";
import { TOUR } from "./theme";

/**
 * Screen *recordings*, as opposed to screenshots.
 *
 * Everything else in `tour/` animates still captures, because that is what
 * arrived. A recording is the better source when it can be had: it carries the
 * app's real scroll physics, its real transitions and a real thumb, none of
 * which can be faked convincingly from a viewport still — and these particular
 * captures cannot be scrolled at all, since every one is exactly one viewport
 * tall with nothing below the fold.
 *
 * Two ways to use one, and they are not interchangeable:
 *
 *   Play it. `ScreenClip` drops the recording straight into the frame. Real
 *   motion, but the recording's own timing, which will not land on the beat
 *   grid unless it happens to. `speed` bends it; anything past about 1.3x
 *   starts to read as a fast-forward.
 *
 *   Mine it. `scripts/probe-clip.js --stills` pulls exact frames out as PNGs,
 *   which then animate through `Device` and `Lens` like any other capture.
 *   A recording is a far better *source of stills* than a screenshot session:
 *   it holds every intermediate state, and the frame is chosen afterwards.
 *
 * Prefer mining for anything cut to music. Prefer playing for a single beat
 * that is specifically about interaction.
 *
 * Audio is muted unconditionally. A screen recording carries UI clicks and
 * whatever the room sounded like, and the piece already has a bed.
 */

/** A recording, and the pixel size it was captured at. Measure, do not guess:
 *  `npm run probe-clip -- public/screens/scroll.mp4` prints this literal. */
export type Clip = {
  /** Path under `public/`, e.g. "screens/feed-scroll.mp4". */
  file: string;
  width: number;
  height: number;
  /** Source frame count, so trims can be checked against the real length. */
  frames: number;
};

export const clip = (file: string, width: number, height: number, frames: number): Clip => ({
  file,
  width,
  height,
  frames,
});

export type ScreenClipProps = {
  clip: Clip;
  /** Centre of the box, in frame coordinates. */
  cx: number;
  cy: number;
  /** Rendered width. Height follows the source aspect unless `crop` trims it. */
  width: number;
  /**
   * Fractions of the source height to cut off, before scaling.
   *
   * A raw phone recording opens with the OS status bar — a real carrier, a
   * real clock — and closes with the home indicator. Dropped whole into a
   * designed frame that already has its own chrome, that is two status bars.
   */
  crop?: { top?: number; bottom?: number };
  /** Frames into the source to start at. */
  trimBefore?: number;
  trimAfter?: number;
  speed?: number;
  opacity?: number;
  radius?: number;
  /** Draw the green hairline the rest of the piece uses on lifted elements. */
  outlined?: boolean;
};

/**
 * A recording, cropped and placed.
 *
 * The clip's clock is the composition's, so a clip placed here starts at the
 * composition's frame 0. To start it later, wrap it in a `<Sequence from={n}>`
 * — that shifts the child's clock, which is the same trick the contact sheets
 * use to sample a frame.
 */
export const ScreenClip: React.FC<ScreenClipProps> = ({
  clip: c,
  cx,
  cy,
  width,
  crop,
  trimBefore,
  trimAfter,
  speed = 1,
  opacity = 1,
  radius = 12,
  outlined = false,
}) => {
  if (opacity <= 0) return null;

  const top = crop?.top ?? 0;
  const bottom = crop?.bottom ?? 0;
  const kept = Math.max(0.05, 1 - top - bottom);

  // Size by width; the source keeps its aspect and the box clips the rest,
  // which is what a screen does. Squashing a recording to fit is always wrong.
  const fullH = (width * c.height) / c.width;
  const boxH = fullH * kept;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - width / 2,
        top: cy - boxH / 2,
        width,
        height: boxH,
        overflow: "hidden",
        borderRadius: radius,
        border: outlined ? `2.5px solid ${TOUR.green}` : undefined,
        backgroundColor: TOUR.white,
        opacity,
      }}
    >
      <OffthreadVideo
        src={staticFile(c.file)}
        muted
        playbackRate={speed}
        trimBefore={trimBefore}
        trimAfter={trimAfter}
        style={{
          position: "absolute",
          left: 0,
          top: -top * fullH,
          width,
          height: fullH,
          maxWidth: "none",
          display: "block",
        }}
      />
    </div>
  );
};
