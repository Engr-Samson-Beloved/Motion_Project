import React from "react";
import { AbsoluteFill } from "remotion";
import { FilmGrade } from "../../lib/cinema";
import { Lockup } from "../story/ui";
import {
  At,
  BadgeBox,
  Calendar,
  Copy,
  Eyebrow,
  Field,
  MonthWord,
  Numerals,
  Plate,
  Rule,
} from "./ui";
import {
  BADGE,
  BADGE_DX,
  BADGE_YEAR_DX,
  MONO_FONT,
  MONTH,
  PLATE,
  plateH,
} from "./theme";
import { CELLS, COPY, NAME, NUM, ROWS, YEAR } from "./script";

/**
 * The same month, standing still — 1080x1920, one frame.
 *
 * Not a frame grabbed from the film. The film's plate holds the calendar and
 * then the line, one after the other, which is a thing only motion can do; a
 * still has to show both at once, so the line moves below the plate and the
 * whole column is re-set around it. The mark comes down to the foot for the
 * same reason — a poster has to carry it, and the film's title card is a
 * separate beat that does not exist here.
 *
 * Everything is drawn at its settled state by feeding the components a frame
 * far past every ramp in them, rather than by threading a second "static"
 * branch through each one. One code path, two outputs.
 */

/** Past the last ramp in `ui.tsx` by an order of magnitude. */
const STILL = 10000;

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1920;

const Y = (rows: number) => {
  // Six-row months need the plate to start higher or the mark runs off the
  // bottom. Five is the common case and gets the roomier setting.
  const plateY = rows >= 6 ? 648 : 706;
  const bottom = plateY + plateH(rows);
  return {
    eyebrow: 190,
    rule: 240,
    badge: 336,
    month: 540,
    monthRule: 644,
    plateY,
    copyEyebrow: bottom + 92,
    line1: bottom + 184,
    line2: bottom + 262,
    sub: bottom + 354,
    lockup: bottom + 472,
  };
};

export const Poster: React.FC = () => {
  const ph = plateH(ROWS);
  const y = Y(ROWS);

  return (
    <AbsoluteFill style={{ background: MONTH.ground }}>
      {/* Same reasoning as the film: see the note in `NewMonth.tsx`. */}
      <FilmGrade grain={0.05} bloom={0.07} vignette={0.32} aberration={0}>
        <AbsoluteFill>
          <Field progress={1} />

          <Eyebrow text="SKOOLCONNECTNG" y={y.eyebrow} />
          <Rule y={y.rule} progress={1} />

          {/* The badge, already assembled. */}
          <BadgeBox y={y.badge} progress={1} />
          <At y={y.badge}>
            <div style={{ transform: `translateX(${BADGE_DX}px)` }}>
              <Numerals from={NUM} to={NUM} p={1} size={BADGE.size} />
            </div>
          </At>
          <At y={y.badge}>
            <span
              style={{
                fontFamily: MONO_FONT,
                fontSize: 30,
                letterSpacing: "0.22em",
                color: MONTH.muted,
                transform: `translateX(${BADGE_YEAR_DX}px)`,
              }}
            >
              {YEAR}
            </span>
          </At>

          <At y={y.month}>
            <MonthWord name={NAME} frame={STILL} at={0} />
          </At>
          <Rule
            y={y.monthRule}
            progress={1}
            width={200}
            color={MONTH.green}
            thickness={4}
          />

          <Plate
            x={PLATE.x}
            y={y.plateY}
            w={PLATE.w}
            h={ph}
            r={PLATE.r}
            progress={1}
          />
          <Calendar
            cells={CELLS}
            frame={STILL}
            rowIn={() => 0}
            chipAt={0}
            opacity={1}
            dy={y.plateY - PLATE.y}
          />

          <Copy
            eyebrow={COPY.eyebrow}
            line1={COPY.line1}
            line2={COPY.line2}
            sub={COPY.sub}
            y={{
              eyebrow: y.copyEyebrow,
              line1: y.line1,
              line2: y.line2,
              sub: y.sub,
            }}
            frame={STILL}
            at={0}
            opacity={1}
          />

          <At y={y.lockup}>
            <Lockup progress={1} width={340} />
          </At>
        </AbsoluteFill>
      </FilmGrade>
    </AbsoluteFill>
  );
};
