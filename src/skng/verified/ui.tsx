import React from "react";
import { fitText } from "@remotion/layout-utils";
import {
  CINE,
  HEADING_FONT,
  HEADING_TRACKING,
  MEASURE,
  MONO_FONT,
} from "./theme";

/**
 * The parts the fast cut is built from.
 *
 * There are only three: a card of type, a tick, and the black flash between
 * acts. A thirty-frame cut cannot carry more than one idea, so there is no
 * point building furniture nobody will see.
 */

/**
 * A card of type, fitted to the measure.
 *
 * Every line in a card shares one size — the size that makes the *longest*
 * line fit. Fitting each line independently is the obvious implementation
 * and it is wrong: "YOUR" and "DEPARTMENT." would come out at wildly
 * different sizes and read as two unrelated words rather than one sentence
 * broken over two lines.
 *
 * `fitText` is called directly rather than through `useFittedFontSize`
 * because the number of lines changes from cut to cut, and a hook called
 * once per line would change hook count between frames.
 */
export const Lines: React.FC<{
  lines: string[];
  size: number;
  color: string;
  opacity: number;
}> = ({ lines, size, color, opacity }) => {
  const fontSize = React.useMemo(() => {
    const fits = lines.map(
      (line) =>
        fitText({
          text: line,
          withinWidth: MEASURE,
          fontFamily: HEADING_FONT,
          fontWeight: 900,
          letterSpacing: HEADING_TRACKING,
        }).fontSize,
    );
    return Math.min(size, ...fits);
  }, [lines, size]);

  return (
    <div
      style={{
        width: MEASURE,
        fontFamily: HEADING_FONT,
        fontWeight: 900,
        fontSize,
        letterSpacing: HEADING_TRACKING,
        lineHeight: 0.98,
        color,
        textAlign: "center",
        opacity,
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
};

/**
 * The tick.
 *
 * Drawn rather than set, so it can arrive as a stroke being made instead of
 * a glyph appearing — `pathLength={1}` normalises the path so the dash array
 * is a straight 0-to-1 progress regardless of the geometry. It lands a few
 * frames after its word, which is the right order: the claim, then the
 * verification of it.
 */
export const Tick: React.FC<{ draw: number; size?: number }> = ({
  draw,
  size = 92,
}) => {
  if (draw <= 0) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ overflow: "visible" }}>
      <circle
        cx={24}
        cy={24}
        r={21}
        fill="none"
        stroke={CINE.tick}
        strokeWidth={2.5}
        pathLength={1}
        strokeDasharray={`${draw} 1`}
        transform="rotate(-90 24 24)"
        opacity={0.55}
      />
      <path
        d="M14 24.5 L21 31.5 L34 17"
        fill="none"
        stroke={CINE.tick}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${Math.max(0, (draw - 0.25) / 0.75)} 1`}
      />
    </svg>
  );
};

/** Mono, letterspaced, upper. */
export const Mono: React.FC<{
  text: string;
  size?: number;
  color?: string;
  opacity?: number;
  tracking?: string;
}> = ({
  text,
  size = 24,
  color = CINE.grey,
  opacity = 1,
  tracking = "0.34em",
}) => (
  <span
    style={{
      fontFamily: MONO_FONT,
      fontSize: size,
      letterSpacing: tracking,
      // Tracking sits to the right of the last glyph too, so the block lands
      // half a space right of centre without this.
      textIndent: tracking,
      color,
      opacity,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </span>
);

/** A hairline that draws from the centre out. */
export const Rule: React.FC<{
  progress: number;
  width?: number;
  color?: string;
  thickness?: number;
}> = ({ progress, width = 200, color = CINE.green, thickness = 4 }) => (
  <div
    style={{
      width: width * Math.max(0, Math.min(1, progress)),
      height: thickness,
      background: color,
    }}
  />
);
