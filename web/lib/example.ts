/**
 * A worked example, in the house style.
 *
 * It earns its place twice. For anyone opening the composer without a key, it
 * is the difference between an empty page and a thing that visibly works. And
 * for us it is the end-to-end test of the part that is easy to get wrong —
 * Sucrase's transform, the `require` shim, the module map, and the handoff to
 * `<Player>` — exercised without spending a token.
 *
 * It is also the concrete answer to "what does good look like here", so keep it
 * honest: real timing constants at the top, comments about why rather than
 * what, and cuts that land on the beat.
 */

export const EXAMPLE_NAME = "Orientation Week";

export const EXAMPLE_SOURCE = `import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from "remotion";
import {STORY, HEADING_FONT, BODY_FONT, MONO_FONT, HEADING_TRACKING, eramp} from "@/palette";

export const config = {width: 1080, height: 1920, fps: 30, durationInFrames: 300};

// 120 BPM at 30fps is exactly 15 frames per beat, so every constant below is a
// whole number of beats and no cut lands "nearly" on the music.
const BEAT = 15;

const KICKER_IN = BEAT * 1;    //  15 — the small line arrives first
const TITLE_IN = BEAT * 2;     //  30 — then the word it introduces
const RULE_IN = BEAT * 5;      //  75 — the rule draws under the settled title
const BODY_IN = BEAT * 7;      // 105
const EXIT = BEAT * 3;         //  45 reserved for the tail

export default function OrientationWeek() {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // One spring carries the title. Damping 14 overshoots and lands, which is
  // what makes it read as a hit rather than a slide.
  const title = spring({frame: frame - TITLE_IN, fps, config: {damping: 14}});

  const kicker = eramp(frame, KICKER_IN, KICKER_IN + 12);
  const rule = eramp(frame, RULE_IN, RULE_IN + 20);
  const body = eramp(frame, BODY_IN, BODY_IN + 18);

  // Derived from duration, so shortening the piece keeps the fade at the tail.
  const exit = interpolate(
    frame,
    [durationInFrames - EXIT, durationInFrames],
    [1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  return (
    <AbsoluteFill style={{backgroundColor: STORY.dark, opacity: exit}}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 96px",
          gap: 28,
        }}
      >
        <div
          style={{
            fontFamily: MONO_FONT,
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: STORY.green,
            opacity: kicker,
            transform: \`translateY(\${(1 - kicker) * 14}px)\`,
          }}
        >
          September
        </div>

        <div
          style={{
            fontFamily: HEADING_FONT,
            fontWeight: 900,
            fontSize: 148,
            lineHeight: 0.94,
            letterSpacing: HEADING_TRACKING,
            color: STORY.white,
            opacity: Math.min(1, title * 1.4),
            transform: \`translateY(\${(1 - title) * 90}px)\`,
          }}
        >
          Orientation
          <br />
          week.
        </div>

        {/* The rule wipes rather than fades — a hard edge travelling reads as
            deliberate where an opacity ramp reads as an afterthought. */}
        <div
          style={{
            height: 6,
            width: 320,
            backgroundColor: STORY.green,
            transform: \`scaleX(\${rule})\`,
            transformOrigin: "left center",
          }}
        />

        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 40,
            lineHeight: 1.4,
            maxWidth: 720,
            color: STORY.muted,
            opacity: body,
            transform: \`translateY(\${(1 - body) * 20}px)\`,
          }}
        >
          Find your people before you find your seat.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
`;
