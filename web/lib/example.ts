/**
 * A worked example, in the house style.
 *
 * It earns its place twice. For anyone opening the composer without a key, it
 * is the difference between an empty page and a thing that visibly works. And
 * for us it is the end-to-end test of the part that is easy to get wrong —
 * Sucrase's transform, the `require` shim, the module map, and the handoff to
 * `<Player>` — exercised without spending a token.
 *
 * Note what it does not contain: a single colour literal, a font name, or a
 * grade setting. Switch the brand or the direction in the picker and this same
 * source re-renders as a different client, in a different treatment. That is
 * the whole argument for the split, demonstrated in one file.
 */

export const EXAMPLE_NAME = "Orientation Week";

export const EXAMPLE_SOURCE = `import {useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill} from "remotion";
import {Stage, Kicker, Heading, Body, Rule} from "@/stage";
import {DIRECTION} from "@/direction";
import {eramp} from "@/motion";

export const config = {width: 1080, height: 1920, fps: 30, durationInFrames: 300};

// Every constant below is a whole number of beats, so no cut lands "nearly" on
// the music. DIRECTION.beat is the frames-per-beat for this treatment.
const B = DIRECTION.beat;

const KICKER_IN = B * 1;
const TITLE_IN = B * 2;
const RULE_IN = B * 5;
const BODY_IN = B * 7;
const EXIT = B * 3;   // frames reserved for the tail

export default function OrientationWeek() {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // One spring carries the title. The damping comes from the direction, so a
  // Feed cut overshoots and lands where a Poster settles flat.
  const title = spring({
    frame: frame - TITLE_IN,
    fps,
    config: {damping: DIRECTION.damping},
  });

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
    <Stage>
      <AbsoluteFill style={{justifyContent: "center", padding: "0 96px", gap: 28, opacity: exit}}>
        <Kicker style={{opacity: kicker, transform: \`translateY(\${(1 - kicker) * 14}px)\`}}>
          September
        </Kicker>

        <Heading
          text={"Orientation\\nweek."}
          size={148}
          style={{
            opacity: Math.min(1, title * 1.4),
            transform: \`translateY(\${(1 - title) * 90}px)\`,
          }}
        />

        <Rule progress={rule} />

        <Body style={{opacity: body, transform: \`translateY(\${(1 - body) * 20}px)\`}}>
          Find your people before you find your seat.
        </Body>
      </AbsoluteFill>
    </Stage>
  );
}
`;
