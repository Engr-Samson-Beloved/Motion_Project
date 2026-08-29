import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  BODY_FONT,
  H,
  HEADING_FONT,
  HEADING_TRACKING,
  MONO_FONT,
  TOUR,
  W,
  ease,
} from "./theme";
import { CANVAS, type Rect } from "./shots";

/* ── Layout ───────────────────────────────────────────────────────────── */

/** A device at rest: centred across, a little above centre down. */
export const DEVICE_W = 560;
export const DEVICE_H = (DEVICE_W * CANVAS.h) / CANVAS.w;
export const DEVICE_X = W / 2;
export const DEVICE_Y = 760;

/** Distance between devices in the row. Wider than the frame, so the pan
 *  arrives on a clean screen rather than a pair of half-screens. */
export const SLOT = 980;

/**
 * The rail the devices stand on, and the floor for everything above it.
 *
 * A pan across a flat field is invisible: the phone is the only object, so it
 * reads as one screen dissolving into the next rather than as a camera moving.
 * The rail runs the length of the row in world space with a node under each
 * device, so the move has something to move against — and it is the brief's
 * connection line, doing structural work rather than decoration.
 *
 * It is also the hard floor. No device and no lens may cross it, which is what
 * keeps a push-in off its own caption.
 */
export const RAIL_Y = 1452;

/** The caption block, and the green rule that sits over it. */
export const RULE_Y = 1508;
export const RULE_W = 84;

/** Where a lens comes to rest, and how large it is allowed to get. */
export const LENS_X = W / 2;
export const LENS_Y = 1150;
export const LENS_MAX_W = 760;
export const LENS_MAX_H = 520;

/* ── Ground ───────────────────────────────────────────────────────────── */

export const Ground: React.FC<{ color?: string }> = ({ color = TOUR.field }) => (
  <AbsoluteFill style={{ backgroundColor: color }} />
);

/**
 * A faint square grid.
 *
 * `story/ui.tsx` has one, but its viewBox is 1920x1080 with
 * `preserveAspectRatio="none"`, so in a portrait frame its cells stretch into
 * tall rectangles. Squares matter more here: the devices are the only strong
 * verticals in the piece and a stretched grid fights them.
 */
export const MeshGrid: React.FC<{
  size?: number;
  opacity?: number;
  color?: string;
}> = ({ size = 90, opacity = 1, color = TOUR.grid }) => (
  <AbsoluteFill style={{ opacity }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {Array.from({ length: Math.ceil(W / size) + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i * size} y1={0} x2={i * size} y2={H} stroke={color} strokeWidth={1} />
      ))}
      {Array.from({ length: Math.ceil(H / size) + 1 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * size} x2={W} y2={i * size} stroke={color} strokeWidth={1} />
      ))}
    </svg>
  </AbsoluteFill>
);

/* ── The device ───────────────────────────────────────────────────────── */

/**
 * One captured mockup, placed by its centre.
 *
 * The capture already contains the phone — frame, bezel and a baked drop
 * shadow — so this deliberately does not wrap it in `product.tsx`'s shell.
 * Doing that would put a phone inside a phone. The shadow in the alpha is
 * also why the piece needs no shadow of its own, which keeps the no-gradient
 * rule intact: the only soft falloff on screen arrived with the asset.
 */
export const Device: React.FC<{
  file: string;
  cx: number;
  cy: number;
  width?: number;
  opacity?: number;
  scale?: number;
  rotate?: number;
}> = ({ file, cx, cy, width = DEVICE_W, opacity = 1, scale = 1, rotate = 0 }) => {
  if (opacity <= 0) return null;
  const height = (width * CANVAS.h) / CANVAS.w;
  return (
    <Img
      src={staticFile(file)}
      style={{
        position: "absolute",
        left: cx - width / 2,
        top: cy - height / 2,
        width,
        height,
        maxWidth: "none",
        opacity,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        display: "block",
      }}
    />
  );
};

/* ── The lens ─────────────────────────────────────────────────────────── */

/** The size a focus region is shown at, capped so it never fouls the caption. */
export const lensSize = (focus: Rect) => {
  const aspect = (focus.w * CANVAS.w) / (focus.h * CANVAS.h);
  const w = Math.min(LENS_MAX_W, LENS_MAX_H * aspect);
  return { w, h: w / aspect };
};

/**
 * A region of the screen, lifted off it.
 *
 * At progress 0 the lens sits exactly over its own place on the device, at the
 * device's own scale — identical pixels, so there is no seam and nothing to
 * see. It then grows to a card. That is why it reads as the detail being
 * lifted out rather than as a panel fading in on top: the motion starts from
 * the truth of where the thing actually lives.
 */
export const Lens: React.FC<{
  file: string;
  focus: Rect;
  progress: number;
  device: { cx: number; cy: number; width: number };
  x?: number;
  y?: number;
}> = ({ file, focus, progress, device, x = LENS_X, y = LENS_Y }) => {
  const p = ease(Math.max(0, Math.min(1, progress)));
  if (p <= 0) return null;

  // Where the region sits on the device right now.
  const s = device.width / CANVAS.w;
  const srcW = focus.w * CANVAS.w * s;
  const srcH = focus.h * CANVAS.h * s;
  const srcX = device.cx - device.width / 2 + focus.x * CANVAS.w * s + srcW / 2;
  const srcY =
    device.cy - ((device.width * CANVAS.h) / CANVAS.w) / 2 + focus.y * CANVAS.h * s + srcH / 2;

  const dst = lensSize(focus);
  const w = srcW + (dst.w - srcW) * p;
  const h = srcH + (dst.h - srcH) * p;
  const cx = srcX + (x - srcX) * p;
  const cy = srcY + (y - srcY) * p;

  // The image inside is sized so the focus region exactly fills the box.
  const imgW = w / focus.w;
  const imgH = (imgW * CANVAS.h) / CANVAS.w;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        overflow: "hidden",
        borderRadius: 6 + p * 16,
        border: `${(2.5 * p).toFixed(2)}px solid ${TOUR.green}`,
        backgroundColor: TOUR.white,
      }}
    >
      <Img
        src={staticFile(file)}
        style={{
          position: "absolute",
          left: -focus.x * imgW,
          top: -focus.y * imgH,
          width: imgW,
          height: imgH,
          maxWidth: "none",
          display: "block",
        }}
      />
    </div>
  );
};

/* ── Type ─────────────────────────────────────────────────────────────── */

/**
 * The caption: a kicker and one line, sitting under the green rule.
 *
 * The rule itself is not drawn here. It is the opening green field, collapsed
 * — one continuous element, animated by the composition — so by the time the
 * first caption appears the viewer has already watched it arrive, and it is
 * never introduced twice.
 */
export const Caption: React.FC<{
  kicker: string;
  line: string;
  /** 0 hidden, 1 shown. */
  progress: number;
}> = ({ kicker, line, progress }) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: RULE_Y,
        width: W,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          marginTop: 38,
          fontFamily: MONO_FONT,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.24em",
          color: TOUR.green,
          opacity: p,
          transform: `translateY(${(1 - p) * 14}px)`,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: HEADING_FONT,
          fontSize: 62,
          fontWeight: 700,
          letterSpacing: HEADING_TRACKING,
          color: TOUR.ink,
          opacity: p,
          transform: `translateY(${(1 - p) * 22}px)`,
        }}
      >
        {line}
      </div>
    </div>
  );
};

/* ── Marks ────────────────────────────────────────────────────────────── */

/**
 * The supplied lockup, in its light-ground form.
 *
 * `skng-lockup-light.png` is dark navy type on transparency, where
 * `skng-lockup-dark.png` — the one the other two pieces use — is the light
 * artwork meant for a dark ground. Both are 3375px square with the artwork
 * floating somewhere inside, so both need cropping to their own bounding box
 * before being sized: setting a width on the whole canvas would size the
 * transparent padding along with the logo and land it far smaller than asked.
 *
 * Measured, not guessed: `{ x: 0.2708, y: 0.4332, w: 0.4308, h: 0.1419 }`.
 * The dark file's box is different, so they are not interchangeable.
 */
const LOCKUP_LIGHT_BOX = { x: 0.2708, y: 0.4332, w: 0.4308, h: 0.1419 } as const;

export const LockupLight: React.FC<{ progress: number; width?: number }> = ({
  progress,
  width = 700,
}) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0) return null;
  const canvas = width / LOCKUP_LIGHT_BOX.w;
  const height = (width * LOCKUP_LIGHT_BOX.h) / LOCKUP_LIGHT_BOX.w;
  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        opacity: p,
        transform: `scale(${0.95 + p * 0.05})`,
      }}
    >
      <Img
        src={staticFile("skng-lockup-light.png")}
        style={{
          position: "absolute",
          width: canvas,
          height: canvas,
          left: -LOCKUP_LIGHT_BOX.x * canvas,
          top: -LOCKUP_LIGHT_BOX.y * canvas,
          maxWidth: "none",
          display: "block",
        }}
      />
    </div>
  );
};

/**
 * A hairline drawn around the region a push-in is heading for.
 *
 * Without it a slow push reads as drift rather than as attention — the viewer
 * sees the frame changing but is not told what it is changing towards. The
 * outline arrives first, then the camera follows it.
 */
export const FocusFrame: React.FC<{
  focus: Rect;
  progress: number;
  device: { cx: number; cy: number; width: number };
  opacity?: number;
}> = ({ focus, progress, device, opacity = 1 }) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0 || opacity <= 0) return null;

  const s = device.width / CANVAS.w;
  const height = (device.width * CANVAS.h) / CANVAS.w;
  const w = focus.w * CANVAS.w * s;
  const h = focus.h * CANVAS.h * s;
  const left = device.cx - device.width / 2 + focus.x * CANVAS.w * s;
  const top = device.cy - height / 2 + focus.y * CANVAS.h * s;
  const pad = 10;

  return (
    <svg
      width={w + pad * 2 + 6}
      height={h + pad * 2 + 6}
      style={{ position: "absolute", left: left - pad - 3, top: top - pad - 3 }}
    >
      <rect
        x={3}
        y={3}
        width={w + pad * 2}
        height={h + pad * 2}
        rx={16}
        fill="none"
        stroke={TOUR.green}
        strokeWidth={3}
        opacity={opacity}
        pathLength={1}
        strokeDasharray={`${p} 1`}
      />
    </svg>
  );
};

/**
 * The rail, in world space: a hairline the length of the row with a node
 * under each device. Rendered inside the pan, so it travels with the camera.
 */
export const Rail: React.FC<{
  panX: number;
  count: number;
  progress: number;
}> = ({ panX, count, progress }) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0) return null;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: DEVICE_X - SLOT + panX,
          top: RAIL_Y,
          width: SLOT * (count + 1),
          height: 2,
          backgroundColor: TOUR.hair,
          opacity: 0.72 * p,
        }}
      />
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: DEVICE_X + i * SLOT + panX - 7,
            top: RAIL_Y - 6,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: TOUR.green,
            opacity: p,
          }}
        />
      ))}
    </>
  );
};

/** Body copy on the light ground, for the one place the piece uses it. */
export const Sub: React.FC<{ children: React.ReactNode; opacity?: number }> = ({
  children,
  opacity = 1,
}) => (
  <div
    style={{
      fontFamily: BODY_FONT,
      fontSize: 34,
      fontWeight: 500,
      color: TOUR.muted,
      opacity,
    }}
  >
    {children}
  </div>
);
