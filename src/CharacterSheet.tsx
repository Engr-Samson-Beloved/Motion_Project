import React from "react";
import { AbsoluteFill } from "remotion";
import {
  Character,
  idle,
  study,
  walk,
  walkCycleFrames,
  wave,
} from "./lib/character";
import { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT, STORY } from "./skng/story/palette";

/**
 * One still that proves the rig actually articulates.
 *
 *     npx remotion still CharacterSheet out/character-sheet.png
 *
 * The top row is a single walk cycle sampled at eight even phases. That is the
 * whole verification: if the legs alternate, the knees bend only on the swing,
 * and the arms oppose their own leg, the walk is right. A rendered clip tells
 * you the same thing in twenty times the wall clock, and a frozen pose tells
 * you nothing at all.
 *
 * The bottom row is the other cycles at a size you can actually judge.
 */

const FPS = 30;
const PHASES = 8;

const Panel: React.FC<{
  label: string;
  sub?: string;
  children: React.ReactNode;
  width: number;
  height: number;
}> = ({ label, sub, children, width, height }) => (
  <div style={{ width }}>
    <div
      style={{
        width,
        height,
        backgroundColor: STORY.dark2,
        border: `1px solid ${STORY.line}`,
        borderRadius: 8,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 18,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
    <div
      style={{
        fontFamily: MONO_FONT,
        fontSize: 13,
        color: STORY.muted,
        marginTop: 7,
        textAlign: "center",
      }}
    >
      {label}
    </div>
    {sub ? (
      <div
        style={{
          fontFamily: MONO_FONT,
          fontSize: 12,
          color: STORY.line2,
          textAlign: "center",
          marginTop: 2,
        }}
      >
        {sub}
      </div>
    ) : null}
  </div>
);

export const CharacterSheet: React.FC = () => {
  const cycle = walkCycleFrames(FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0F141A", padding: 54 }}>
      <div
        style={{
          fontFamily: HEADING_FONT,
          fontSize: 42,
          fontWeight: 900,
          letterSpacing: HEADING_TRACKING,
          color: STORY.white,
        }}
      >
        Character rig — cycle check
      </div>
      <div
        style={{
          fontFamily: BODY_FONT,
          fontSize: 19,
          color: STORY.muted,
          marginTop: 8,
          marginBottom: 30,
        }}
      >
        One walk cycle is {cycle.toFixed(1)} frames at {FPS}fps, sampled at{" "}
        {PHASES} even phases. Knees must bend only on the swing leg; each arm
        must oppose its own leg.
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {Array.from({ length: PHASES }, (_, i) => {
          const f = (cycle / PHASES) * i;
          return (
            <Panel
              key={i}
              label={`${Math.round((i / PHASES) * 100)}%`}
              sub={`f${f.toFixed(1)}`}
              width={186}
              height={330}
            >
              <Character
                pose={walk(f, FPS)}
                size={280}
                color={STORY.white}
                farColor={STORY.line2}
                head={i % 3 === 1 ? 1 : 0}
              />
            </Panel>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 22, marginTop: 40 }}>
        <Panel label="idle · breathing" width={330} height={400}>
          <Character pose={idle(40, FPS)} size={340} color={STORY.white} farColor={STORY.line2} />
        </Panel>
        <Panel label="wave" width={330} height={400}>
          <Character
            pose={wave(22, FPS)}
            size={340}
            color={STORY.white}
            farColor={STORY.line2}
            head={2}
          />
        </Panel>
        <Panel label="study · seated" width={330} height={400}>
          <Character pose={study(30, FPS)} size={340} color={STORY.white} farColor={STORY.line2} />
        </Panel>
        <Panel label="walk · brand green, flipped" width={330} height={400}>
          <Character
            pose={walk(cycle * 0.3, FPS)}
            size={340}
            color={STORY.green}
            farColor="#1B5A3D"
            flip
            head={1}
          />
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

export const CHARACTER_SHEET_WIDTH = 1700;
/** Tall enough for both rows plus their captions — at 1000 the bottom clipped. */
export const CHARACTER_SHEET_HEIGHT = 1110;
