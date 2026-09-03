import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { FilmGrade, Track } from "../../lib/cinema";
import { LockupLight } from "../tour/device";
import { At, MonthWord } from "../month/ui";
import {
  Badge,
  Counter,
  DotGrid,
  Eyebrow,
  Field,
  Lines,
  Rule,
  Site,
} from "./ui";
import {
  BODY_FONT,
  LIGHT,
  W,
  Y,
  YOURS,
  eramp,
  ramp,
  settle,
} from "./theme";
import {
  COPY,
  COUNT,
  FILL,
  FILL_TO,
  NAME,
  NUM,
  PLUS_AT,
  RING,
  T,
  TARGET_FRAMES,
  TOTAL_FRAMES,
  YEAR,
  YOU_AT,
} from "./script";

/**
 * MonthlyUpdate — 1080x1920, 900 frames, 30s. Light.
 *
 * The monthly community update: welcome to the month, three hundred students
 * are here, the space is still open, come and build a profile.
 *
 * The brief contains a genuine tension and the piece is built on it rather
 * than around it. "300+ users" is a boast; "the space is still fresh" admits
 * the network is small. Post only the first and it sounds like a bigger
 * platform pretending; post only the second and it sounds like an empty one
 * apologising. Said together, with three hundred countable dots and three
 * empty rows underneath, "small" turns into "early" — which is the only thing
 * a student deciding whether to bother actually wants to know.
 *
 * Three decisions carry it:
 *
 *   The number is drawn, not just written. 20 x 15 is exactly 300, so the
 *   claim on screen is countable; a field of roughly-that-many dots would have
 *   been easier and would have turned a fact into a decoration. The counter
 *   and the grid run off one ramp, because they are the same fact stated
 *   twice and a counter that lands before its dots makes them two.
 *
 *   The empty rows fade out downward instead of being closed off. A bounded
 *   grid would read as capacity — 300 of 360, nearly full — which is the
 *   opposite of the sentence they are there to illustrate.
 *
 *   One dot is yours. The call to action is not a button drawn on a poster
 *   nobody can press; it is the 301st dot arriving in the first slot that was
 *   empty, which is literally what building a profile does.
 *
 * Light, where `month/` is dark. That piece is a poster and wants presence;
 * this one is closer to a page — a number, a field and something to go and do
 * — and pages in this system are light. It follows `tour/`'s light grade:
 * grain only, no bloom and no vignette, because on a near-white ground the
 * dark pieces' settings read as a dirty print rather than as film.
 *
 * No camera, for the reason `month/` has none: the frame is a twenty-column
 * grid of 16px dots, and handheld drift on a grid reads as a wobble.
 */

// The bed is cut to the same thirty seconds and its sections are this file's
// blocks. If one moves without the other the music resolves somewhere the
// picture does not.
if (TOTAL_FRAMES !== TARGET_FRAMES) {
  throw new Error(
    `Piece is ${TOTAL_FRAMES} frames, expected ${TARGET_FRAMES} (30s at 30fps).`,
  );
}

export const MONTHLY_UPDATE_DURATION = TOTAL_FRAMES;

export const MonthlyUpdate: React.FC = () => {
  const frame = useCurrentFrame();

  /* Ground and top furniture — first frame to last. */
  const field = eramp(frame, 0, 40);
  const eyeIn = eramp(frame, 8, 34);
  const ruleIn = eramp(frame, 18, 52);

  /* Everything above the mark clears for the sign-off. */
  const out = eramp(frame, T.sign, T.sign + 30);

  /* The badge names the month this update belongs to, and holds throughout. */
  const badgeIn = eramp(frame, 40, 76);

  /* Beat one: welcome. It has the frame to itself. */
  const welcomeIn = eramp(frame, 62, 94);
  const beat1Out = eramp(frame, T.news, T.news + 34);
  const monthRule = eramp(frame, 150, 182);

  /* Beat two: the number, and the field filling with it. */
  const newsIn = eramp(frame, T.news + 22, T.news + 54);
  const filled = eramp(frame, FILL.from, FILL.to) * FILL_TO;
  const plus = eramp(frame, PLUS_AT, PLUS_AT + 22);
  const captionIn = eramp(frame, 286, 318);

  /* Beat three: the room under them. */
  const spare = eramp(frame, T.fresh, T.fresh + 40);
  const freshOut = eramp(frame, T.build, T.build + 24);

  /* Beat four: your dot. */
  const you = settle(ramp(frame, YOU_AT, YOU_AT + 30));
  const ring = eramp(frame, RING.from, RING.to);

  /* Beat five: the mark. */
  const lockIn = eramp(frame, T.sign + 14, T.sign + 50);
  const signRule = eramp(frame, T.sign + 30, T.sign + 54);
  const siteIn = eramp(frame, T.sign + 38, T.sign + 66);

  return (
    <AbsoluteFill style={{ background: LIGHT.field }}>
      <Track src={staticFile("bed-update.mp3")} volume={0.8} fadeOutFrames={64} />

      <FilmGrade grain={0.06} bloom={0} vignette={0} aberration={0.3}>
        <AbsoluteFill>
          <Field progress={field} />

          <Eyebrow
            text="SKOOLCONNECTNG"
            y={Y.eyebrow}
            opacity={eyeIn}
            rise={(1 - eyeIn) * 10}
          />
          <Rule y={Y.rule} progress={ruleIn} />

          <Badge
            num={NUM}
            year={YEAR}
            y={Y.badge}
            progress={badgeIn * (1 - out)}
          />

          {/* Beat one. */}
          <At
            y={Y.welcome}
            style={{ opacity: welcomeIn * (1 - beat1Out) }}
          >
            <span
              style={{
                fontFamily: BODY_FONT,
                fontSize: 54,
                color: LIGHT.muted,
                transform: `translateY(${(1 - welcomeIn) * 16}px)`,
              }}
            >
              {COPY.welcome}
            </span>
          </At>
          <At y={Y.month}>
            <MonthWord
              name={NAME}
              frame={frame}
              at={86}
              out={beat1Out}
              color={LIGHT.ink}
            />
          </At>
          <Rule
            y={Y.monthRule}
            progress={monthRule * (1 - beat1Out)}
            width={200}
            color={LIGHT.green}
            thickness={4}
          />
          <Eyebrow
            text={COPY.standfirst}
            y={Y.standfirst}
            size={20}
            opacity={eramp(frame, 118, 152) * (1 - beat1Out)}
          />

          {/* Beat two: good news, and the count. */}
          <Eyebrow
            text={COPY.news}
            y={Y.news}
            color={LIGHT.green}
            opacity={newsIn * (1 - out)}
            rise={(1 - newsIn) * 12}
          />
          <At y={Y.counter} style={{ opacity: newsIn * (1 - out) }}>
            <Counter
              value={Math.min(COUNT, Math.round(filled))}
              max={COUNT}
              size={190}
              plus={plus}
            />
          </At>
          <At y={Y.caption} style={{ opacity: captionIn * (1 - out) }}>
            <span
              style={{
                fontFamily: BODY_FONT,
                fontSize: 36,
                color: LIGHT.muted,
                transform: `translateY(${(1 - captionIn) * 12}px)`,
              }}
            >
              {COPY.caption}
            </span>
          </At>

          <div style={{ opacity: 1 - out }}>
            <DotGrid
              filled={filled}
              spare={spare}
              you={you}
              ring={ring}
              yourCol={YOURS.col}
              yourRow={YOURS.row}
            />
          </div>

          {/* The copy slot: two beats pass through it, it never moves. */}
          <Lines
            line1={COPY.fresh1}
            line2={COPY.fresh2}
            y1={Y.line1}
            y2={Y.line2}
            frame={frame}
            at={T.fresh + 14}
            opacity={1 - freshOut}
          />
          <Lines
            line1={COPY.build1}
            line2={COPY.build2}
            y1={Y.line1}
            y2={Y.line2}
            frame={frame}
            at={T.build + 18}
            opacity={1 - out}
          />

          {/* Beat five: the mark. */}
          <At y={Y.lockup} style={{ opacity: lockIn }}>
            <LockupLight progress={lockIn} width={560} />
          </At>
          <Rule
            y={Y.signRule}
            progress={signRule}
            width={200}
            color={LIGHT.green}
            thickness={4}
          />
          <Site text={COPY.site} y={Y.site} opacity={siteIn} />
        </AbsoluteFill>
      </FilmGrade>
    </AbsoluteFill>
  );
};

export { W };
