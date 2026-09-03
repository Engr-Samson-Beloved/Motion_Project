import React from "react";
import {
  BADGE,
  BADGE_DX,
  BODY_FONT,
  COL,
  GRID,
  HEADING_FONT,
  HEADING_TRACKING,
  H,
  MONTH,
  MONO_FONT,
  W,
  colX,
  eramp,
  ramp,
  rowY,
  settle,
} from "./theme";
import type { Cell } from "./script";

/**
 * The parts the monthly post is built from.
 *
 * Everything here is flat: solid fills, hairlines, and type. There is no
 * gradient, no drop shadow and no blur in this file, which is the standing
 * rule across `skng/` — depth comes from value steps and motion instead.
 */

/* ── Placement ────────────────────────────────────────────────────────── */

/**
 * A centred row whose `y` is its *middle*, not its top.
 *
 * Every vertical in `theme.ts` is written as the optical centre of the thing
 * it positions, because that is the number a layout is actually reasoned
 * about — "the month sits at 622" is checkable against a frame, "the month's
 * ascender starts at 548" is not.
 */
export const At: React.FC<{
  y: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ y, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y,
      transform: "translateY(-50%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── The ground ───────────────────────────────────────────────────────── */

/**
 * The ground, and the measure it is built on.
 *
 * The seven vertical hairlines are the calendar's own column edges, run the
 * full height of the frame. They arrive before the calendar does and outlast
 * it, so the grid the date block lands on is already there to land on — and
 * the copy that replaces the calendar sits on the same measure rather than
 * floating free. It is the cheapest possible way to make a poster look set
 * rather than typed.
 */
export const Field: React.FC<{ progress: number }> = ({ progress }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: MONTH.ground }} />
    <div style={{ position: "absolute", inset: 0, opacity: progress * 0.55 }}>
      {Array.from({ length: 8 }, (_, c) => (
        <div
          key={c}
          style={{
            position: "absolute",
            top: 0,
            height: H,
            left: COL.x + c * GRID.cell,
            width: 1,
            background: MONTH.line,
          }}
        />
      ))}
    </div>
  </>
);

/** Mono, letterspaced, upper. The eyebrow voice used across `skng/`. */
export const Eyebrow: React.FC<{
  text: string;
  y: number;
  color?: string;
  size?: number;
  opacity?: number;
  rise?: number;
}> = ({ text, y, color = MONTH.muted, size = 22, opacity = 1, rise = 0 }) => (
  <At y={y} style={{ opacity }}>
    <span
      style={{
        fontFamily: MONO_FONT,
        fontSize: size,
        letterSpacing: "0.34em",
        // The tracking is on the right of every glyph including the last, so
        // the block sits half a space right of centre unless it is pulled back.
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
}> = ({ y, progress, width = COL.w, color = MONTH.line2, thickness = 1 }) => (
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

/* ── The numerals ─────────────────────────────────────────────────────── */

/**
 * One digit on a roll.
 *
 * The box is exactly one line tall and clips, so translating the stack by its
 * own height carries the old figure out of the top as the new one arrives from
 * the bottom. Digits have no descender, so a 1em line box holds a figure with
 * room at both ends and nothing is ever cut.
 */
const Digit: React.FC<{
  from: string;
  to: string;
  p: number;
  size: number;
  color: string;
}> = ({ from, to, p, size, color }) => {
  const face: React.CSSProperties = {
    height: size,
    lineHeight: `${size}px`,
    fontFamily: HEADING_FONT,
    fontWeight: 800,
    fontSize: size,
    letterSpacing: HEADING_TRACKING,
    color,
    textAlign: "center",
  };

  // Nothing to roll: render the figure once. A stack held at p = 0 would still
  // pay for a transform every frame and can shimmer by a subpixel.
  if (from === to) {
    return <div style={{ ...face, width: size * 0.6 }}>{to}</div>;
  }

  return (
    <div style={{ width: size * 0.6, height: size, overflow: "hidden" }}>
      <div style={{ transform: `translateY(${-p * size}px)` }}>
        <div style={face}>{from}</div>
        <div style={face}>{to}</div>
      </div>
    </div>
  );
};

/**
 * The month's number, turning over.
 *
 * Rolls per digit rather than as a word, so the general case works: September
 * only moves the units column (08 -> 09), but December to January moves both
 * (12 -> 01) and has to read as one mechanism, not a special case somebody
 * remembers to write in eleven months' time.
 */
export const Numerals: React.FC<{
  from: string;
  to: string;
  p: number;
  size: number;
  color?: string;
}> = ({ from, to, p, size, color = MONTH.white }) => (
  <div style={{ display: "flex", gap: size * 0.02 }}>
    {to.split("").map((ch, i) => (
      <Digit
        key={i}
        from={from[i] ?? ch}
        to={ch}
        p={p}
        size={size}
        color={color}
      />
    ))}
  </div>
);

/**
 * The box the numerals end up inside.
 *
 * It fades in around them at the end of their move rather than waiting for
 * them at the destination. A box that is already there turns the move into a
 * thing being filed away; a box that closes around the number keeps the number
 * the subject of the shot to the last frame of the move.
 */
export const BadgeBox: React.FC<{ y: number; progress: number }> = ({
  y,
  progress,
}) => (
  <At y={y}>
    <div
      style={{
        width: BADGE.boxW,
        height: BADGE.boxH,
        borderRadius: BADGE.r,
        background: MONTH.panel,
        border: `1px solid ${MONTH.line2}`,
        opacity: progress,
        transform: `translateX(${BADGE_DX}px) scale(${0.9 + progress * 0.1})`,
      }}
    />
  </At>
);

/* ── The month ────────────────────────────────────────────────────────── */

/**
 * The word, set letter by letter.
 *
 * The size is derived from the length rather than fixed, because "May" and
 * "September" cannot share a font size without one of them looking like a
 * mistake.
 *
 * 0.696em is Montserrat's uppercase advance at weight 800, measured off a
 * rendered still rather than guessed. The first estimate was 0.665, which set
 * SEPTEMBER — the longest month, and the only one the cap does not catch —
 * about 40px wider than the space it was given. Every other month clamps at
 * 148 and never exercises the divisor, so the error would have shipped in
 * exactly one month of the twelve.
 */
export const monthSize = (name: string) =>
  Math.min(148, 884 / (name.length * 0.696));

export const MonthWord: React.FC<{
  name: string;
  frame: number;
  at: number;
  out?: number;
  /** Defaults to the dark piece's paper white; `update/` sets it in ink. */
  color?: string;
}> = ({ name, frame, at, out = 0, color = MONTH.white }) => {
  const size = monthSize(name);
  const chars = name.toUpperCase().split("");
  return (
    <div style={{ display: "flex" }}>
      {chars.map((ch, i) => {
        // 2.5 frames apart over 20, not 4 over 26. The word is nine letters
        // long: the looser setting took two full seconds to assemble, and a
        // half-faded letter on a near-black ground does not read as type
        // arriving, it reads as a render fault.
        const p = eramp(frame, at + i * 2.5, at + i * 2.5 + 20);
        return (
          <span
            key={i}
            style={{
              fontFamily: HEADING_FONT,
              fontWeight: 800,
              fontSize: size,
              letterSpacing: HEADING_TRACKING,
              color,
              opacity: p * (1 - out),
              transform: `translateY(${(1 - p) * 38}px)`,
              display: "inline-block",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/* ── The plate, and what sits in it ───────────────────────────────────── */

export const Plate: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  progress: number;
}> = ({ x, y, w, h, r, progress }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: r,
      background: MONTH.panel,
      border: `1px solid ${MONTH.line}`,
      opacity: progress,
      transform: `scale(${0.985 + progress * 0.015})`,
      transformOrigin: `${x + w / 2}px ${y + h / 2}px`,
    }}
  />
);

const WEEK_HEAD = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/**
 * The dates.
 *
 * Rows cascade rather than arriving together — a calendar that appears whole
 * is a picture of a calendar, one that fills week by week is the month being
 * laid out. The 1st takes the only filled green shape in the piece, which is
 * both the brand's one accent and the answer to the only question a month
 * post is really being asked.
 */
export const Calendar: React.FC<{
  cells: Cell[];
  frame: number;
  rowIn: (r: number) => number;
  chipAt: number;
  opacity: number;
  /** Shift the whole block, for layouts whose plate is not the film's. */
  dy?: number;
}> = ({ cells, frame, rowIn, chipAt, opacity, dy = 0 }) => (
  <div style={{ position: "absolute", inset: 0, opacity }}>
    {WEEK_HEAD.map((d, c) => {
      const p = eramp(frame, 194, 218);
      return (
        <div
          key={d}
          style={{
            position: "absolute",
            top: GRID.header + dy,
            left: colX(c) - GRID.cell / 2,
            width: GRID.cell,
            transform: "translateY(-50%)",
            textAlign: "center",
            fontFamily: MONO_FONT,
            fontSize: 19,
            letterSpacing: "0.16em",
            color: MONTH.muted,
            opacity: p * (c >= 5 ? 0.5 : 1),
          }}
        >
          {d}
        </div>
      );
    })}

    <At y={GRID.headRule + dy}>
      <div
        style={{
          width: COL.w * eramp(frame, 200, 228),
          height: 1,
          background: MONTH.line2,
        }}
      />
    </At>

    {cells.map((cell) => {
      const at = rowIn(cell.row);
      const p = eramp(frame, at, at + 24);
      const first = cell.day === 1;
      const pop = first ? settle(ramp(frame, chipAt, chipAt + 30)) : 0;
      return (
        <div
          key={cell.day}
          style={{
            position: "absolute",
            top: rowY(cell.row) + dy,
            left: colX(cell.col) - GRID.cell / 2,
            width: GRID.cell,
            height: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: p,
            transform: `translateY(${(1 - p) * 14}px)`,
          }}
        >
          {first ? (
            <div
              style={{
                position: "absolute",
                width: GRID.chip,
                height: GRID.chip,
                borderRadius: 20,
                background: MONTH.green,
                transform: `scale(${pop})`,
              }}
            />
          ) : null}
          <span
            style={{
              position: "relative",
              fontFamily: HEADING_FONT,
              fontWeight: first ? 700 : 500,
              fontSize: 36,
              letterSpacing: HEADING_TRACKING,
              color: first ? MONTH.white : MONTH.dim,
              opacity: first ? 1 : cell.weekend ? 0.5 : 0.88,
            }}
          >
            {cell.day}
          </span>
        </div>
      );
    })}
  </div>
);

/** The line that replaces the calendar inside the plate. */
export const Copy: React.FC<{
  eyebrow: string;
  line1: string;
  line2: string;
  sub: string;
  y: { eyebrow: number; line1: number; line2: number; sub: number };
  frame: number;
  at: number;
  opacity: number;
}> = ({ eyebrow, line1, line2, sub, y, frame, at, opacity }) => {
  // Tight, because the sub-line is the last thing in and the block starts
  // clearing 40 frames after it lands. At the first setting (12/22/40 apart,
  // over 32) the sub arrived at frame 384 and the fade began at 380 — it was
  // in the file, paid for a render, and could not be read.
  const e = eramp(frame, at, at + 24);
  const a = eramp(frame, at + 10, at + 38);
  const b = eramp(frame, at + 18, at + 46);
  const s = eramp(frame, at + 30, at + 58);
  const head = (text: string, yy: number, p: number) => (
    <At y={yy} style={{ opacity: p * opacity }}>
      <span
        style={{
          fontFamily: HEADING_FONT,
          fontWeight: 700,
          fontSize: 76,
          letterSpacing: HEADING_TRACKING,
          color: MONTH.white,
          transform: `translateY(${(1 - p) * 22}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </At>
  );

  return (
    <>
      <Eyebrow
        text={eyebrow}
        y={y.eyebrow}
        color={MONTH.greenType}
        size={22}
        opacity={e * opacity}
        rise={(1 - e) * 12}
      />
      {head(line1, y.line1, a)}
      {head(line2, y.line2, b)}
      <At y={y.sub} style={{ opacity: s * opacity }}>
        <span
          style={{
            fontFamily: BODY_FONT,
            fontSize: 36,
            lineHeight: 1.4,
            color: MONTH.muted,
            transform: `translateY(${(1 - s) * 14}px)`,
            whiteSpace: "nowrap",
          }}
        >
          {sub}
        </span>
      </At>
    </>
  );
};

/** The mono line the piece signs off with. */
export const Site: React.FC<{
  text: string;
  y: number;
  opacity: number;
  color?: string;
  size?: number;
}> = ({ text, y, opacity, color = MONTH.greenType, size = 26 }) => (
  <At y={y} style={{ opacity }}>
    <span
      style={{
        fontFamily: MONO_FONT,
        fontSize: size,
        letterSpacing: "0.14em",
        color,
      }}
    >
      {text}
    </span>
  </At>
);

export { W };
