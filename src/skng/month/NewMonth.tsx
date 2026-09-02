import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { FilmGrade, Track } from "../../lib/cinema";
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
  Site,
} from "./ui";
import {
  BADGE,
  BADGE_DX,
  BADGE_YEAR_DX,
  MONO_FONT,
  MONTH,
  PLATE,
  Y,
  copyY,
  eramp,
  plateCY,
  plateH,
} from "./theme";
import {
  CELLS,
  CHIP_AT,
  COPY,
  NAME,
  NUM,
  PREV_NAME,
  PREV_NUM,
  ROLL,
  ROWS,
  ROW_IN,
  T,
  TARGET_FRAMES,
  TOTAL_FRAMES,
  YEAR,
} from "./script";

/**
 * NewMonth — 1080x1920, 480 frames, 16s. Dark.
 *
 * The monthly post. It exists because "it is a new month" comes round twelve
 * times a year, and the version of this that is designed once and re-typeset
 * every four weeks is a version that drifts: a wrong weekday on the 1st, a
 * headline nobody re-read, a year that is still last year in March. So the
 * month is a constant in `script.ts`, the calendar is computed from it, and
 * the copy is a table. Pointing this at October is one line.
 *
 * Three decisions carry it:
 *
 *   The number is the transition, the word is the subject. A month post that
 *   opens on its own answer has nothing to play; this one opens on 08, turns
 *   it over to 09, and only then sets SEPTEMBER. The turn is the reason to
 *   make it move at all — a still can say which month it is, but only motion
 *   can say that a month has *changed*, which is the actual occasion.
 *
 *   One plate, two contents. The calendar and the line occupy the same panel,
 *   and the panel never moves. The frame is not rebuilt between them; what is
 *   inside a fixed shape is swapped. Without that the copy arrives unrelated
 *   to the grid it replaced and the piece reads as two posts spliced together.
 *
 *   The dates are real. Rendering a plausible-looking grid would have been
 *   easier and is the one thing here a viewer can actually catch: a student
 *   knows what day the 1st is. `buildGrid` derives it in UTC, and a month that
 *   needs a sixth row gets a taller plate rather than a clipped last week.
 *
 * No camera. `install/` skipped the handheld drift because it was full of
 * hairlines and 13pt UI text; this one skips it because it is a poster built
 * on a visible seven-column measure, and drift on a grid reads as a wobble
 * rather than as life.
 */

// The bed is cut to the same sixteen seconds and its four sections are this
// file's four blocks. If one moves without the other, the music resolves
// somewhere the picture does not.
if (TOTAL_FRAMES !== TARGET_FRAMES) {
  throw new Error(
    `Piece is ${TOTAL_FRAMES} frames, expected ${TARGET_FRAMES} (16s at 30fps).`,
  );
}

export const NEW_MONTH_DURATION = TOTAL_FRAMES;

export const NewMonth: React.FC = () => {
  const frame = useCurrentFrame();

  const ph = plateH(ROWS);
  const cy = plateCY(ROWS);
  const CY = copyY(cy);

  /* Ground and top furniture — present from the first second to the last. */
  const field = eramp(frame, 0, 44);
  const eyeIn = eramp(frame, 8, 34);
  const ruleIn = eramp(frame, 20, 56);

  /* The numerals: hero, then badge. */
  const heroIn = eramp(frame, 26, 58);
  const roll = eramp(frame, ROLL.from, ROLL.to);
  const toBadge = eramp(frame, T.month, T.month + 52);
  const numSize = 400 + (BADGE.size - 400) * toBadge;
  const numY = Y.heroBig + (Y.badge - Y.heroBig) * toBadge;
  const numDX = BADGE_DX * toBadge;
  const badgeIn = eramp(frame, T.month + 38, T.month + 66);

  /* The small month word under the hero, which swaps on the same frames. */
  const smallIn = eramp(frame, 40, 68);
  const smallOut = eramp(frame, T.month, T.month + 30);
  const smallP = smallIn * (1 - smallOut);

  /* The word, and the green rule under it. */
  const monthRule = eramp(frame, 190, 218);

  /* The plate, and the two things that sit in it. */
  const plateIn = eramp(frame, 172, 216);
  const calOut = eramp(frame, T.copy, T.copy + 28);

  /* Everything above the mark clears together. */
  const out = eramp(frame, T.lock, T.lock + 26);
  const plateP = plateIn * (1 - out);

  /* The mark. Eighty frames, and the last line has to settle inside them. */
  const lockIn = eramp(frame, T.lock + 8, T.lock + 40);
  const footRule = eramp(frame, T.lock + 22, T.lock + 44);
  const footMonth = eramp(frame, T.lock + 30, T.lock + 54);
  const footSite = eramp(frame, T.lock + 38, T.lock + 62);

  return (
    <AbsoluteFill style={{ background: MONTH.ground }}>
      <Track src={staticFile("bed16.mp3")} volume={0.68} fadeOutFrames={70} />

      {/*
        Bloom is held down to 0.08. The frame is one 148px word on a near-black
        ground, which is the single most bloom-prone thing a grade can be given
        — at 0.14 the hero grew a visible halo and stopped looking set. Grain
        and vignette do the filmic work here instead.
      */}
      <FilmGrade grain={0.07} bloom={0.08} vignette={0.34} aberration={0}>
        <AbsoluteFill>
          <Field progress={field} />

          <Eyebrow
            text="SKOOLCONNECTNG"
            y={Y.eyebrow}
            opacity={eyeIn}
            rise={(1 - eyeIn) * 10}
          />
          <Rule y={Y.rule} progress={ruleIn} />

          {/*
            The turn.

            The box is painted BEFORE the numerals and must stay that way.
            Neither carries a z-index, so paint order is document order, and
            the box's fill is opaque `panel` — with the two the other way round
            the badge swallowed its own digits and read as an empty chip for
            the last nine seconds of the piece.
          */}
          <BadgeBox y={Y.badge} progress={badgeIn * (1 - out)} />
          <At y={numY} style={{ opacity: heroIn * (1 - out) }}>
            <div style={{ transform: `translateX(${numDX}px)` }}>
              <Numerals from={PREV_NUM} to={NUM} p={roll} size={numSize} />
            </div>
          </At>
          <At y={Y.badge} style={{ opacity: badgeIn * (1 - out) }}>
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

          {/* The month the frame is leaving, and the one it is arriving at. */}
          {/*
            34px of travel each way, not 18. Both words are 26px tall, so at
            the old setting the outgoing and incoming names were closer
            together than their own line height for the whole middle of the
            dissolve and read as one smudged word. They have to pass each
            other, not sit on each other.
          */}
          <Eyebrow
            text={PREV_NAME.toUpperCase()}
            y={Y.swap}
            size={26}
            opacity={smallP * (1 - roll)}
            rise={-34 * roll}
          />
          <Eyebrow
            text={NAME.toUpperCase()}
            y={Y.swap}
            size={26}
            color={MONTH.greenType}
            opacity={smallP * roll}
            rise={34 * (1 - roll)}
          />

          {/* The subject. */}
          <At y={Y.month}>
            <MonthWord name={NAME} frame={frame} at={146} out={out} />
          </At>
          <Rule
            y={Y.monthRule}
            progress={monthRule * (1 - out)}
            width={200}
            color={MONTH.green}
            thickness={4}
          />

          {/* The plate, holding first the grid and then the line. */}
          <Plate
            x={PLATE.x}
            y={PLATE.y}
            w={PLATE.w}
            h={ph}
            r={PLATE.r}
            progress={plateP}
          />
          <Calendar
            cells={CELLS}
            frame={frame}
            rowIn={ROW_IN}
            chipAt={CHIP_AT}
            opacity={(1 - calOut) * (1 - out)}
          />
          <Copy
            eyebrow={COPY.eyebrow}
            line1={COPY.line1}
            line2={COPY.line2}
            sub={COPY.sub}
            y={CY}
            frame={frame}
            at={T.copy + 12}
            opacity={1 - out}
          />

          {/* The mark. */}
          <At y={Y.lockup} style={{ opacity: lockIn }}>
            <Lockup progress={lockIn} width={560} />
          </At>
          <Rule
            y={Y.footRule}
            progress={footRule}
            width={200}
            color={MONTH.green}
            thickness={4}
          />
          <Eyebrow
            text={`${NAME.toUpperCase()} ${YEAR}`}
            y={Y.footMonth}
            size={24}
            opacity={footMonth}
            rise={(1 - footMonth) * 10}
          />
          <Site text="skoolconnectng.com" y={Y.footSite} opacity={footSite} />
        </AbsoluteFill>
      </FilmGrade>
    </AbsoluteFill>
  );
};
