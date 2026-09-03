import React from "react";
import { At } from "../month/ui";
import {
  BODY_FONT,
  COL,
  DOT_RAMP,
  GRID,
  HEADING_FONT,
  HEADING_TRACKING,
  H,
  LIGHT,
  MONO_FONT,
  W,
  dotX,
  dotY,
  ramp,
  settle,
} from "./theme";

/**
 * The parts the community update is built from.
 *
 * Flat throughout: solid fills, hairlines, type. No gradient, no drop shadow,
 * no blur — the standing rule across `skng/`. `At` is shared with `month/`
 * because centring on an optical middle is not a per-piece decision.
 */

/* ── The ground ───────────────────────────────────────────────────────── */

/**
 * A near-white mint ground with the dot field's own column pitch running
 * through it.
 *
 * The dark piece drew seven verticals because its measure was a calendar's
 * seven columns. This one has twenty, so verticals every 38px would be a
 * corduroy texture rather than a measure. Instead the ground carries the four
 * lines that bound the *copy* column, which is the measure the type is set to,
 * and the grid supplies its own structure.
 */
export const Field: React.FC<{ progress: number }> = ({ progress }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: LIGHT.field }} />
    <div style={{ position: "absolute", inset: 0, opacity: progress * 0.85 }}>
      {[COL.x, COL.x + COL.w].map((x) => (
        <div
          key={x}
          style={{
            position: "absolute",
            top: 0,
            height: H,
            left: x,
            width: 1,
            background: LIGHT.grid,
          }}
        />
      ))}
    </div>
  </>
);

/** Mono, letterspaced, upper. */
export const Eyebrow: React.FC<{
  text: string;
  y: number;
  color?: string;
  size?: number;
  opacity?: number;
  rise?: number;
}> = ({ text, y, color = LIGHT.muted, size = 22, opacity = 1, rise = 0 }) => (
  <At y={y} style={{ opacity }}>
    <span
      style={{
        fontFamily: MONO_FONT,
        fontSize: size,
        letterSpacing: "0.34em",
        // Tracking sits to the right of every glyph, the last one included, so
        // the block lands half a space right of centre without this.
        textIndent: "0.34em",
        color,
        transform: `translateY(${rise}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  </At>
);

/** A hairline that draws from the centre out. */
export const Rule: React.FC<{
  y: number;
  progress: number;
  width?: number;
  color?: string;
  thickness?: number;
}> = ({ y, progress, width = COL.w, color = LIGHT.grid, thickness = 1 }) => (
  <At y={y}>
    <div
      style={{
        width: width * Math.max(0, Math.min(1, progress)),
        height: thickness,
        background: color,
      }}
    />
  </At>
);

/** The month's number in a bordered chip, with the year beside it. */
export const Badge: React.FC<{
  num: string;
  year: string;
  y: number;
  progress: number;
}> = ({ num, year, y, progress }) => (
  <At y={y} style={{ opacity: progress }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        transform: `scale(${0.92 + progress * 0.08})`,
      }}
    >
      <div
        style={{
          width: 94,
          height: 88,
          borderRadius: 18,
          background: LIGHT.card,
          border: `1px solid ${LIGHT.edge}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: HEADING_FONT,
          fontWeight: 800,
          fontSize: 66,
          letterSpacing: HEADING_TRACKING,
          color: LIGHT.ink,
        }}
      >
        {num}
      </div>
      <span
        style={{
          fontFamily: MONO_FONT,
          fontSize: 30,
          letterSpacing: "0.22em",
          color: LIGHT.muted,
        }}
      >
        {year}
      </span>
    </div>
  </At>
);

/* ── The number ───────────────────────────────────────────────────────── */

/**
 * The count, on fixed digit slots.
 *
 * Always as many slots as the final number has digits, filled from the right,
 * so 7 and 45 and 300 all occupy the same box and the block does not jump
 * about as it counts. Centring a growing string instead makes the number
 * shuffle sideways on almost every frame, which at this size reads as a fault
 * rather than as counting.
 */
export const Counter: React.FC<{
  value: number;
  max: number;
  size: number;
  plus: number;
  color?: string;
}> = ({ value, max, size, plus, color = LIGHT.ink }) => {
  const slots = String(max).length;
  const shown = String(Math.max(0, Math.min(max, value))).padStart(slots, " ");
  const face: React.CSSProperties = {
    fontFamily: HEADING_FONT,
    fontWeight: 800,
    fontSize: size,
    lineHeight: `${size}px`,
    letterSpacing: HEADING_TRACKING,
    color,
  };
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.split("").map((ch, i) => (
        <div key={i} style={{ ...face, width: size * 0.6, textAlign: "center" }}>
          {ch === " " ? "" : ch}
        </div>
      ))}
      <span
        style={{
          ...face,
          fontSize: size * 0.56,
          color: LIGHT.green,
          opacity: plus,
          marginLeft: size * 0.04,
          transform: `translateY(${(1 - plus) * 14}px)`,
        }}
      >
        +
      </span>
    </div>
  );
};

/* ── The field of people ──────────────────────────────────────────────── */

/**
 * Three hundred dots, and the room under them.
 *
 * `filled` is a float in dots, not a progress fraction, so the grid and the
 * counter above it are reading the same number rather than two ramps that
 * happen to line up. Each dot pops with a small overshoot six dots wide, which
 * at this fill rate puts a travelling band of arriving dots across the grid
 * instead of a hard edge.
 */
export const DotGrid: React.FC<{
  filled: number;
  spare: number;
  you: number;
  ring: number;
  yourCol: number;
  yourRow: number;
}> = ({ filled, spare, you, ring, yourCol, yourRow }) => {
  const total = GRID.cols * GRID.rows;
  const r = GRID.dot / 2;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* The empty rows below, faded out downward — room, not capacity. */}
      {Array.from({ length: GRID.spare }, (_, s) =>
        Array.from({ length: GRID.cols }, (_, c) => (
          <div
            key={`s${s}-${c}`}
            style={{
              position: "absolute",
              left: dotX(c) - r,
              top: dotY(GRID.rows + s) - r,
              width: GRID.dot,
              height: GRID.dot,
              borderRadius: "50%",
              border: `1px solid ${LIGHT.hair}`,
              opacity: spare * (0.34 - s * 0.1),
            }}
          />
        )),
      )}

      {/* The three hundred. */}
      {Array.from({ length: total }, (_, i) => {
        const p = settle(ramp(filled, i, i + DOT_RAMP));
        if (p <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dotX(i % GRID.cols) - r,
              top: dotY(Math.floor(i / GRID.cols)) - r,
              width: GRID.dot,
              height: GRID.dot,
              borderRadius: "50%",
              background: LIGHT.green,
              opacity: Math.min(1, p) * 0.32,
              transform: `scale(${p})`,
            }}
          />
        );
      })}

      {/* And yours. Solid, full strength, in the first slot that was empty. */}
      {you > 0 ? (
        <div
          style={{
            position: "absolute",
            left: dotX(yourCol) - r,
            top: dotY(yourRow) - r,
            width: GRID.dot,
            height: GRID.dot,
            borderRadius: "50%",
            background: LIGHT.green,
            transform: `scale(${settle(you) * 1.15})`,
          }}
        />
      ) : null}

      {ring > 0 ? (
        <svg
          width={72}
          height={72}
          viewBox="0 0 72 72"
          style={{
            position: "absolute",
            left: dotX(yourCol) - 36,
            top: dotY(yourRow) - 36,
            overflow: "visible",
          }}
        >
          <circle
            cx={36}
            cy={36}
            r={22}
            fill="none"
            stroke={LIGHT.green}
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${ring} 1`}
            transform="rotate(-90 36 36)"
          />
        </svg>
      ) : null}
    </div>
  );
};

/* ── The copy slot ────────────────────────────────────────────────────── */

/**
 * Two lines in a fixed place. Two beats pass through it and it never moves —
 * the copy changes, the shape does not.
 */
export const Lines: React.FC<{
  line1: string;
  line2: string;
  y1: number;
  y2: number;
  frame: number;
  at: number;
  opacity: number;
}> = ({ line1, line2, y1, y2, frame, at, opacity }) => {
  const a = Math.min(1, Math.max(0, (frame - at) / 26));
  const b = Math.min(1, Math.max(0, (frame - at - 12) / 28));
  const ea = a * a * (3 - 2 * a);
  const eb = b * b * (3 - 2 * b);
  return (
    <>
      <At y={y1} style={{ opacity: ea * opacity }}>
        <span
          style={{
            fontFamily: HEADING_FONT,
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: HEADING_TRACKING,
            color: LIGHT.ink,
            transform: `translateY(${(1 - ea) * 18}px)`,
            whiteSpace: "nowrap",
          }}
        >
          {line1}
        </span>
      </At>
      <At y={y2} style={{ opacity: eb * opacity }}>
        <span
          style={{
            fontFamily: BODY_FONT,
            fontSize: 36,
            color: LIGHT.muted,
            transform: `translateY(${(1 - eb) * 14}px)`,
            whiteSpace: "nowrap",
          }}
        >
          {line2}
        </span>
      </At>
    </>
  );
};

/** The mono line the piece signs off with. */
export const Site: React.FC<{ text: string; y: number; opacity: number }> = ({
  text,
  y,
  opacity,
}) => (
  <At y={y} style={{ opacity }}>
    <span
      style={{
        fontFamily: MONO_FONT,
        fontSize: 26,
        letterSpacing: "0.14em",
        color: LIGHT.green,
      }}
    >
      {text}
    </span>
  </At>
);

export { W };
