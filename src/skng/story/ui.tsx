import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  BODY_FONT,
  HEADING_FONT,
  HEADING_TRACKING,
  MONO_FONT,
  STORY,
  ease,
} from "./palette";

/**
 * Primitives for the story film. Everything here is built from flat fills and
 * strokes — there is not a single gradient in this file, which is the brief's
 * hardest constraint and the easiest one to break by reflex.
 *
 * Where the equivalent piece already exists in `pulse/ui.tsx` it was rebuilt
 * rather than imported: those versions lean on radial gradients for depth and
 * on the product's light palette, and neither survives this brief.
 */

export const LOCKUP_DARK = staticFile("skng-lockup-dark.png");
export const LOGO_MARK = staticFile("skng-logo.png");

/* ── Ground ───────────────────────────────────────────────────────────── */

/** The film's ground. One flat colour, nothing else. */
export const Field: React.FC<{ color?: string }> = ({ color = STORY.dark }) => (
  <AbsoluteFill style={{ backgroundColor: color }} />
);

/**
 * A faint square grid of solid hairlines.
 *
 * This carries the "technology-focused" register that a gradient would
 * normally do, and it gives the handheld camera something to move against —
 * on a perfectly flat field, drift is invisible.
 */
export const Grid: React.FC<{
  size?: number;
  opacity?: number;
  color?: string;
}> = ({ size = 90, opacity = 0.5, color = STORY.line }) => {
  const cols = Math.ceil(2400 / size);
  const rows = Math.ceil(1500 / size);
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        {Array.from({ length: cols }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * size}
            y1={0}
            x2={i * size}
            y2={1080}
            stroke={color}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: rows }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * size}
            x2={1920}
            y2={i * size}
            stroke={color}
            strokeWidth={1}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* ── Type ─────────────────────────────────────────────────────────────── */

export const Kicker: React.FC<{
  children: React.ReactNode;
  progress: number;
  color?: string;
  size?: number;
}> = ({ children, progress, color = STORY.muted, size = 22 }) => (
  <div
    style={{
      fontFamily: MONO_FONT,
      fontSize: size,
      letterSpacing: 9,
      textTransform: "uppercase",
      color,
      opacity: progress,
      transform: `translateY(${(1 - progress) * 12}px)`,
    }}
  >
    {children}
  </div>
);

/**
 * Word-by-word headline. The brief calls for bold modern sans and smooth
 * ease-in-out, so words rise and settle rather than springing — a spring
 * overshoot reads as playful, and this film is confident, not bouncy.
 */
export const Headline: React.FC<{
  text: string;
  frame: number;
  start?: number;
  stagger?: number;
  rise?: number;
  size?: number;
  color?: string;
  accent?: string;
  /** Word indices rendered in `accent`. */
  accentWords?: readonly number[];
  align?: "left" | "center";
  maxWidth?: number;
  weight?: number;
}> = ({
  text,
  frame,
  start = 0,
  stagger = 3,
  rise = 18,
  size = 88,
  color = STORY.white,
  accent = STORY.green,
  accentWords,
  align = "center",
  maxWidth = 1400,
  weight = 900,
}) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: `0 ${Math.round(size * 0.24)}px`,
      justifyContent: align === "center" ? "center" : "flex-start",
      maxWidth,
    }}
  >
    {text.split(" ").map((w, i) => {
      const p = ease(
        Math.max(0, Math.min(1, (frame - start - i * stagger) / rise)),
      );
      return (
        <span
          key={`${w}-${i}`}
          style={{
            fontFamily: HEADING_FONT,
            fontSize: size,
            fontWeight: weight,
            letterSpacing: HEADING_TRACKING,
            lineHeight: 1.08,
            color: accentWords?.includes(i) ? accent : color,
            opacity: p,
            transform: `translateY(${(1 - p) * 34}px)`,
          }}
        >
          {w}
        </span>
      );
    })}
  </div>
);

export const Body: React.FC<{
  children: React.ReactNode;
  progress: number;
  color?: string;
  size?: number;
  maxWidth?: number;
  align?: "left" | "center";
}> = ({
  children,
  progress,
  color = STORY.muted,
  size = 30,
  maxWidth = 900,
  align = "center",
}) => (
  <div
    style={{
      fontFamily: BODY_FONT,
      fontSize: size,
      fontWeight: 500,
      lineHeight: 1.5,
      textAlign: align,
      maxWidth,
      color,
      opacity: progress,
      transform: `translateY(${(1 - progress) * 12}px)`,
    }}
  >
    {children}
  </div>
);

/* ── The recurring visual: connection lines ───────────────────────────── */

export type Pt = { x: number; y: number };

/**
 * A thin solid green line that draws itself from `a` to `b`.
 *
 * This is the film's one recurring motif, so it is a single component used
 * everywhere rather than re-implemented per scene. `progress` 0..1 is how much
 * of the line exists; `stop` truncates the *target* length, which is how
 * scene 03 shows a connection that reaches halfway and fails.
 */
export const Wire: React.FC<{
  a: Pt;
  b: Pt;
  progress: number;
  /** Fraction of the full span the line is allowed to reach. */
  stop?: number;
  color?: string;
  width?: number;
  opacity?: number;
  /** Curve the line by this fraction of its length, perpendicular to it. */
  bow?: number;
  dashed?: boolean;
}> = ({
  a,
  b,
  progress,
  stop = 1,
  color = STORY.green,
  width = 2,
  opacity = 1,
  bow = 0,
  dashed = false,
}) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const end = { x: a.x + dx * stop, y: a.y + dy * stop };
  const len = Math.hypot(end.x - a.x, end.y - a.y);
  const d =
    bow === 0
      ? `M${a.x},${a.y} L${end.x},${end.y}`
      : `M${a.x},${a.y} Q${(a.x + end.x) / 2 - dy * bow},${(a.y + end.y) / 2 + dx * bow} ${end.x},${end.y}`;
  // A quadratic bow is longer than its chord; pad so the dash offset still
  // clears the whole path at progress 1.
  const draw = len * (bow === 0 ? 1 : 1 + Math.abs(bow) * 1.6);

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      opacity={opacity}
      strokeDasharray={dashed ? `${width * 4} ${width * 4}` : draw}
      strokeDashoffset={dashed ? 0 : draw * (1 - Math.max(0, Math.min(1, progress)))}
    />
  );
};

/** A student node: a solid disc, optionally ringed when it is a hub. */
export const NodeDot: React.FC<{
  at: Pt;
  progress: number;
  hub?: boolean;
  pulse?: number;
  color?: string;
  scale?: number;
}> = ({ at, progress, hub = false, pulse = 0, color = STORY.green, scale = 1 }) => {
  const r = (hub ? 9 : 5.5) * scale;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <g opacity={p}>
      {hub ? (
        <circle
          cx={at.x}
          cy={at.y}
          r={r * (2.1 + pulse * 0.9)}
          fill="none"
          stroke={color}
          strokeWidth={1.5 * scale}
          opacity={0.45 * (1 - pulse * 0.5)}
        />
      ) : null}
      <circle cx={at.x} cy={at.y} r={r * (0.6 + p * 0.4)} fill={color} />
    </g>
  );
};

/* ── People ───────────────────────────────────────────────────────────── */

/**
 * A student silhouette: head, shoulders, and one of four simple build
 * variations. Solid fill, no facial detail — the brief asks for simple
 * character silhouettes, and detail here would tip into stock illustration.
 */
export const Silhouette: React.FC<{
  size?: number;
  color?: string;
  variant?: 0 | 1 | 2 | 3;
  opacity?: number;
}> = ({ size = 90, color = STORY.muted, variant = 0, opacity = 1 }) => {
  const shoulders = [
    "M8,64 C8,48 17,40 32,40 C47,40 56,48 56,64 Z",
    "M6,64 C6,47 16,39 32,39 C48,39 58,47 58,64 Z",
    "M9,64 C9,50 18,42 32,42 C46,42 55,50 55,64 Z",
    "M7,64 C7,46 18,38 32,38 C46,38 57,46 57,64 Z",
  ][variant];
  // A cap on one variant and a headwrap on another: variation without
  // reaching for national costume.
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ opacity }}>
      <circle cx={32} cy={22} r={13} fill={color} />
      {variant === 1 ? (
        <path d="M17,17 L47,17 L32,9 Z" fill={color} />
      ) : null}
      {variant === 3 ? (
        <path d="M19,20 C19,10 45,10 45,20 C45,14 19,14 19,20 Z" fill={color} />
      ) : null}
      <path d={shoulders} fill={color} />
    </svg>
  );
};

/* ── Glyphs ───────────────────────────────────────────────────────────── */

type GlyphProps = { size?: number; color?: string; strokeWidth?: number };

const g = ({ size = 64, color = STORY.green, strokeWidth = 2 }: GlyphProps) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: color,
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/** Scene 01: the dream. */
export const CapGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <path d="M2 8.5 12 4l10 4.5-10 4.5-10-4.5Z" />
    <path d="M6 10.6V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-5.4" />
    <path d="M21 9v5" />
  </svg>
);

/** Scene 01: the question. */
export const QuestionGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M9.3 9.2a2.8 2.8 0 1 1 3.5 2.7c-.5.2-.8.7-.8 1.2v.8" />
    <path d="M12 17.1h.01" />
  </svg>
);

/** Scene 01: the opportunity. */
export const StarGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <path d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3.2Z" />
  </svg>
);

/** Scene 02: a document that got passed around. */
export const DocGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <path d="M6 2.8h7.5L18 7.4V21a.6.6 0 0 1-.6.6H6a.6.6 0 0 1-.6-.6V3.4a.6.6 0 0 1 .6-.6Z" />
    <path d="M13.4 3v4.4H18" />
    <path d="M8.4 12.5h7M8.4 16h5" />
  </svg>
);

/** Scene 02: a generic message. Deliberately not any real platform's mark. */
export const ChatGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <path d="M3.4 6.2a2 2 0 0 1 2-2h13.2a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2H9l-4.4 3.6a.5.5 0 0 1-.8-.4l.02-3.2a2 2 0 0 1-1.4-2V6.2Z" />
  </svg>
);

/** Scene 02: a notification that will not stop. */
export const BellGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <path d="M18 8.6a6 6 0 1 0-12 0c0 5.4-2 6.9-2 6.9h16s-2-1.5-2-6.9Z" />
    <path d="M13.7 19.4a2 2 0 0 1-3.4 0" />
  </svg>
);

/** Scene 02: the search that keeps coming back empty. */
export const SearchGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <circle cx="10.6" cy="10.6" r="6.8" />
    <path d="m15.6 15.6 4.8 4.8" />
  </svg>
);

/** Scene 04 and 07: resources. */
export const ResourceGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <path d="M12 6.4A7.4 7.4 0 0 0 4 4.9v13.4A7.4 7.4 0 0 1 12 19.8a7.4 7.4 0 0 1 8-1.5V4.9a7.4 7.4 0 0 0-8 1.5Z" />
    <path d="M12 6.4v13.4" />
  </svg>
);

/** Scene 04 and 06: people. */
export const PeopleGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <circle cx="9" cy="8.4" r="3.4" />
    <path d="M2.8 19.4c0-3.2 2.8-5.2 6.2-5.2s6.2 2 6.2 5.2" />
    <path d="M16.2 5.4a3.4 3.4 0 0 1 0 6.4" />
    <path d="M17.4 14.6c2.3.6 3.8 2.3 3.8 4.8" />
  </svg>
);

/** Scene 04 and 07: trusted information. */
export const InfoGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <path d="M12 3 4.4 6.1v5.4c0 4.5 3.1 8.3 7.6 9.5 4.5-1.2 7.6-5 7.6-9.5V6.1L12 3Z" />
    <path d="m8.9 12.1 2.2 2.2 4-4.4" />
  </svg>
);

/** Scene 07: opportunities, events, careers. */
export const OpportunityGlyph: React.FC<GlyphProps> = (p) => (
  <svg {...g(p)}>
    <rect x="3" y="7.2" width="18" height="12.4" rx="1.8" />
    <path d="M8.8 7.2V5.6a1.8 1.8 0 0 1 1.8-1.8h2.8a1.8 1.8 0 0 1 1.8 1.8v1.6" />
    <path d="M3 12.4h18" />
  </svg>
);

/* ── The logo ─────────────────────────────────────────────────────────── */

/**
 * Alpha bounding boxes, measured with `scripts/measure-png.js`.
 *
 * Both files are mostly transparent padding, so setting `width` on the <Img>
 * sizes the padding and the artwork lands far smaller than asked for. These
 * fractions let the component crop to the artwork and size that instead. The
 * PNGs themselves are used exactly as supplied — cropping transparent margin
 * is not altering the logo.
 */
const BBOX = {
  lockup: { x: 0.1988, y: 0.3873, w: 0.5659, h: 0.1867 },
  mark: { x: 0.1875, y: 0.2051, w: 0.6992, h: 0.6016 },
} as const;

const Cropped: React.FC<{
  src: string;
  box: { x: number; y: number; w: number; h: number };
  width: number;
  style?: React.CSSProperties;
}> = ({ src, box, width, style }) => {
  const canvas = width / box.w;
  const height = (width * box.h) / box.w;
  return (
    <div style={{ width, height, position: "relative", overflow: "hidden", ...style }}>
      <Img
        src={src}
        style={{
          position: "absolute",
          width: canvas,
          height: canvas,
          left: -box.x * canvas,
          top: -box.y * canvas,
          maxWidth: "none",
        }}
      />
    </div>
  );
};

/** The supplied lockup, cropped to its artwork, floating with no plate. */
export const Lockup: React.FC<{
  progress: number;
  width?: number;
  settle?: number;
}> = ({ progress, width = 720, settle = 0 }) => (
  <Cropped
    src={LOCKUP_DARK}
    box={BBOX.lockup}
    width={width}
    style={{
      opacity: Math.min(1, progress),
      transform: `scale(${0.94 + Math.min(1, progress) * 0.06 + settle * 0.01})`,
    }}
  />
);

/** The supplied mark on its own, for the orbit and the final frame. */
export const Mark: React.FC<{ progress: number; width?: number }> = ({
  progress,
  width = 260,
}) => (
  <Cropped
    src={LOGO_MARK}
    box={BBOX.mark}
    width={width}
    style={{
      opacity: Math.min(1, progress),
      transform: `scale(${0.9 + Math.min(1, progress) * 0.1})`,
    }}
  />
);

export const LOCKUP_ASPECT = BBOX.lockup.w / BBOX.lockup.h;
