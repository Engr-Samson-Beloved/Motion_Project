import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { STORY, ease } from "./palette";

/**
 * Animating captured screenshots of the real app.
 *
 * `scripts/capture-screens.js` writes two PNGs per route into
 * `public/screens/`: the viewport, and the whole scrollable page. The
 * full-page one is what these components want — dropped into the phone shell
 * and translated on Y by frame, it *is* a scroll, with the app's own type,
 * spacing and data rather than a reconstruction of them.
 *
 * What this can and cannot do is worth being clear about, because it decides
 * which beats should use screenshots at all:
 *
 *   can    scroll, hold, swap screens, push/slide between them, tap ripples,
 *          push in on a region, mask a region to draw the eye
 *   cannot animate one card independently of the rest
 *
 * A screenshot is one flat bitmap. If a beat needs a single row to fly out and
 * connect to something, that beat needs the rebuilt UI in `product.tsx`. The
 * two are meant to be mixed: screenshots for "this is really the product",
 * rebuilt components for anything that has to come apart.
 */

/** A captured screen: the file, and the pixel size it was captured at. */
export type Capture = {
  /** Path under `public/`, e.g. "screens/feed-full.png". */
  file: string;
  /** Real pixel width of the PNG (viewport width x deviceScaleFactor). */
  width: number;
  /** Real pixel height of the PNG. Full-page captures are tall. */
  height: number;
};

export const capture = (file: string, width: number, height: number): Capture => ({
  file,
  width,
  height,
});

/**
 * How far a capture can scroll inside a viewport of a given size, in the
 * viewport's own pixels. Zero when the capture is not taller than the screen.
 *
 * Check this number before animating a scroll. A capture only a little taller
 * than the screen gives a range of a few dozen pixels, and the "scroll" is
 * then a nudge that reads as a glitch — a 1750x3820 capture in a 454x940
 * screen has a range of 51px, which is nothing. If the range is small, the
 * page was captured at the viewport rather than full-page, or the screen
 * genuinely does not scroll and the beat should hold instead.
 */
export const scrollRange = (
  cap: Capture,
  viewportWidth: number,
  viewportHeight: number,
) => {
  const scale = viewportWidth / cap.width;
  return Math.max(0, cap.height * scale - viewportHeight);
};

export type ScreenShotProps = {
  cap: Capture;
  /** Viewport to fill — normally the phone's screen box. */
  width: number;
  height: number;
  /** 0 is the top of the page, 1 is as far as it scrolls. */
  scroll?: number;
  /** Scale about the focus point, for a push-in on part of the screen. */
  zoom?: number;
  /** Focus point for `zoom`, as fractions of the viewport. */
  focus?: { x: number; y: number };
  opacity?: number;
  style?: React.CSSProperties;
};

/**
 * A captured screen, scrolled and optionally pushed into.
 *
 * The image is sized by width and left to take whatever height it takes, so
 * the capture is never squashed — the viewport clips it instead, which is
 * exactly what a phone screen does.
 */
export const ScreenShot: React.FC<ScreenShotProps> = ({
  cap,
  width,
  height,
  scroll = 0,
  zoom = 1,
  focus = { x: 0.5, y: 0.5 },
  opacity = 1,
  style,
}) => {
  const range = scrollRange(cap, width, height);
  const y = -range * Math.max(0, Math.min(1, scroll));

  return (
    <div
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        backgroundColor: STORY.white,
        opacity,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom})`,
          transformOrigin: `${focus.x * 100}% ${focus.y * 100}%`,
        }}
      >
        <Img
          src={staticFile(cap.file)}
          style={{
            position: "absolute",
            top: y,
            left: 0,
            width,
            height: "auto",
            maxWidth: "none",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

/**
 * Scroll driven by a list of stops.
 *
 * `stops` are [frame, scroll] pairs; between them the value eases, which is
 * what a thumb flick looks like — a linear scroll reads as a machine. Outside
 * the list it holds the nearest stop.
 */
export const scrollAt = (
  frame: number,
  stops: readonly (readonly [number, number])[],
): number => {
  if (stops.length === 0) return 0;
  if (frame <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (frame >= last[0]) return last[1];

  for (let i = 0; i < stops.length - 1; i++) {
    const [f0, s0] = stops[i];
    const [f1, s1] = stops[i + 1];
    if (frame >= f0 && frame <= f1) {
      const t = f1 === f0 ? 1 : (frame - f0) / (f1 - f0);
      return s0 + (s1 - s0) * ease(t);
    }
  }
  return last[1];
};

/**
 * Two screens, one replacing the other the way the app navigates.
 *
 * `push` slides the incoming screen in from the right over the outgoing one,
 * which is what a stack navigator does; `fade` cross-dissolves, which is what
 * a tab change does. Getting these the wrong way round is a small thing that
 * makes a mock feel wrong without anyone being able to say why.
 */
export const ScreenSwap: React.FC<{
  from: React.ReactNode;
  to: React.ReactNode;
  /** 0 shows `from`, 1 shows `to`. */
  progress: number;
  mode?: "push" | "fade";
  width: number;
}> = ({ from, to, progress, mode = "push", width }) => {
  const p = ease(Math.max(0, Math.min(1, progress)));

  if (mode === "fade") {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ opacity: 1 - p }}>{from}</AbsoluteFill>
        <AbsoluteFill style={{ opacity: p }}>{to}</AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      {/* The outgoing screen drifts a little, it does not sit still — that
          parallax is most of what sells a native push. */}
      <AbsoluteFill style={{ transform: `translateX(${-p * width * 0.28}px)` }}>
        {from}
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${(1 - p) * width}px)` }}>
        {to}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * A tap: a ring that expands and fades where a finger went.
 *
 * Worth adding wherever a screen changes. Without it the app appears to
 * navigate itself, and the viewer reads the cut as an edit rather than as
 * someone using the product.
 */
export const Tap: React.FC<{
  /** Position as fractions of the screen. */
  at: { x: number; y: number };
  /** 0 at the moment of contact, 1 when the ring has gone. */
  progress: number;
  size?: number;
  color?: string;
}> = ({ at, progress, size = 26, color = STORY.green }) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0 || p >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: `${at.x * 100}%`,
        top: `${at.y * 100}%`,
        width: size * (1 + p * 2.4),
        height: size * (1 + p * 2.4),
        marginLeft: -(size * (1 + p * 2.4)) / 2,
        marginTop: -(size * (1 + p * 2.4)) / 2,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        opacity: 1 - p,
        pointerEvents: "none",
      }}
    />
  );
};
