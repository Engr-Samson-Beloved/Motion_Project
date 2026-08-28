import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmGrade, HandheldCamera, Track } from "../../lib/cinema";
import {
  Character,
  RIG_ASPECT,
  blendPose,
  idle,
  study,
  walk,
  wave,
} from "../../lib/character";
import { CheckIcon } from "../pulse/icons";
import {
  HEADING_FONT,
  HEADING_TRACKING,
  STORY,
  eramp,
  ramp,
} from "../story/palette";
import { Field, Grid, Lockup, QuestionGlyph, Wire } from "../story/ui";
import {
  BEATS,
  CAST,
  EDGES,
  PULSE_FRAMES,
  type Student,
  TARGET_FRAMES,
  TOTAL_FRAMES,
  WORLD,
  chestOf,
  headTopOf,
} from "./cast";

/**
 * SameQuestion — 1080x1920, 900 frames, 30s.
 *
 * Character-led: no product UI at all. Seven students stuck on the same
 * question, connected, answered, and left waving. Same brand rules as the
 * 90-second film — the palette from `story/palette.ts`, solid colours only,
 * no gradient anywhere — so the two pieces sit together.
 *
 * One continuous shot rather than a `<Series>` of scenes. The same seven
 * characters are on screen throughout and the camera never cuts; sectioning it
 * would mean seven characters re-mounting at every boundary and losing their
 * cycle phase.
 */

if (TOTAL_FRAMES !== TARGET_FRAMES) {
  throw new Error(
    `Piece is ${TOTAL_FRAMES} frames, expected ${TARGET_FRAMES} (30s at 30fps).`,
  );
}

export const SAME_QUESTION_DURATION = TOTAL_FRAMES;

/* ── One student ──────────────────────────────────────────────────────── */

const poseFor = (s: Student, frame: number, fps: number, heroWalk: number) => {
  const f = frame + s.phase;

  // Everyone ends up waving, shortly after the answer reaches them. That is
  // the payoff of the piece, so it is the one thing every character does.
  const toWave = eramp(frame, s.answeredAt + 8, s.answeredAt + 34);

  let base;
  if (s.cycle === "study") base = study(f, fps);
  else if (s.cycle === "walk") {
    // The hero walks only while travelling, then settles. A character that
    // keeps striding on the spot after it has stopped moving is the clearest
    // possible tell.
    base = blendPose(walk(f, fps), idle(f, fps), 1 - heroWalk);
  } else base = idle(f, fps);

  return blendPose(base, wave(f - s.answeredAt, fps), toWave);
};

const StudentFigure: React.FC<{
  s: Student;
  index: number;
  frame: number;
  fps: number;
  visible: number;
  heroWalk: number;
  xOffset: number;
}> = ({ s, index, frame, fps, visible, heroWalk, xOffset }) => {
  if (visible <= 0) return null;

  const width = s.size * RIG_ASPECT;
  const x = s.x + xOffset;
  // The sole sits at 0.9205 of the rig box, so this puts the feet on `s.feet`.
  const top = s.feet - 0.9205 * s.size;

  const answered = eramp(frame, s.answeredAt, s.answeredAt + 14);
  const glyph = s.size * 0.3;

  return (
    <>
      {/* Each student stands on their own short line — their own campus. A
          single shared ground line would put seven people in one room. */}
      <div
        style={{
          position: "absolute",
          left: x - s.size * 0.42,
          top: s.feet,
          width: s.size * 0.84,
          height: 1,
          backgroundColor: STORY.line2,
          opacity: visible * 0.9,
        }}
      />

      <div style={{ position: "absolute", left: x - width / 2, top, opacity: visible }}>
        <Character
          pose={poseFor(s, frame, fps, index === 0 ? heroWalk : 1)}
          size={s.size}
          color={index === 0 ? STORY.white : "#C8D3D0"}
          farColor={index === 0 ? "#7E8B95" : "#68757B"}
          head={s.head}
          flip={s.flip}
        />
      </div>

      {/* The question, and the tick that replaces it. */}
      <div
        style={{
          position: "absolute",
          left: x - glyph / 2,
          top: headTopOf(s) - glyph * 1.35,
          width: glyph,
          height: glyph,
          opacity: visible,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 1 - answered,
            transform: `translateY(${-answered * 16}px)`,
          }}
        >
          <QuestionGlyph size={glyph} color={STORY.green} strokeWidth={1.9} />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: answered,
            transform: `scale(${0.6 + answered * 0.4})`,
          }}
        >
          <div
            style={{
              width: glyph * 0.86,
              height: glyph * 0.86,
              borderRadius: "50%",
              backgroundColor: STORY.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckIcon size={glyph * 0.5} color={STORY.white} />
          </div>
        </div>
      </div>
    </>
  );
};

/* ── The piece ────────────────────────────────────────────────────────── */

export const SameQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hero = CAST[0];

  // The hero walks in, then stops. Travel and stride end on the same frame.
  const heroWalk = 1 - eramp(frame, 108, 148);
  const heroX = -150 + eramp(frame, 0, 148) * 150;

  // Push in on the hero, then pull back until the whole world is in frame.
  const pull = eramp(frame, 96, BEATS.connect);
  const scale = 2.15 - pull * 1.15;
  const focusX = hero.x + heroX * (1 - pull) + (WORLD.w / 2 - hero.x) * pull;
  const focusY = hero.feet - 250 + (WORLD.h / 2 - (hero.feet - 250)) * pull;

  const tx = WORLD.w / 2 - focusX * scale;
  const ty = WORLD.h / 2 - focusY * scale;

  // Everything clears for the lockup. Timed tight so the end card gets a
  // clean second to sit on — at the first pass it landed with ten frames to
  // spare, which is not a hold, it is an arrival.
  const clear = eramp(frame, BEATS.lockup, BEATS.lockup + 34);
  const logo = eramp(frame, BEATS.lockup + 16, BEATS.lockup + 44);
  const line = eramp(frame, BEATS.lockup + 36, BEATS.lockup + 62);

  return (
    <AbsoluteFill style={{ backgroundColor: STORY.dark }}>
      <Track src={staticFile("bed30.mp3")} volume={0.85} fadeOutFrames={48} />

      {/* Grain only. Bloom and vignette are falloffs, and this piece keeps the
          90-second film's no-gradient rule so the two can sit together. */}
      <FilmGrade grain={0.12} bloom={0} vignette={0} aberration={0.45}>
        <HandheldCamera intensity={0.28} travel={14} sway={0.16} speed={0.4}>
          <Field />
          <Grid opacity={0.38} />

          <AbsoluteFill
            style={{
              opacity: 1 - clear,
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              transformOrigin: "0 0",
            }}
          >
            {/* Lines sit behind the people. */}
            <svg
              width={WORLD.w}
              height={WORLD.h}
              viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
              style={{ position: "absolute", inset: 0 }}
            >
              {EDGES.map((e, i) => {
                const a = chestOf(CAST[e.from]);
                const b = chestOf(CAST[e.to]);
                // The hero's own chest moves while they walk in; by the time
                // any line is drawn they have stopped, so a is stable.
                return (
                  <Wire
                    key={i}
                    a={a}
                    b={b}
                    progress={ramp(frame, e.drawAt, e.drawAt + 42)}
                    width={2.4}
                    opacity={0.8}
                  />
                );
              })}

              {/* The answer, travelling. */}
              {EDGES.map((e, i) => {
                if (e.pulseAt === null) return null;
                const t = ramp(frame, e.pulseAt, e.pulseAt + PULSE_FRAMES);
                if (t <= 0 || t >= 1) return null;
                const a = chestOf(CAST[e.from]);
                const b = chestOf(CAST[e.to]);
                return (
                  <circle
                    key={`p${i}`}
                    cx={a.x + (b.x - a.x) * t}
                    cy={a.y + (b.y - a.y) * t}
                    r={13}
                    fill={STORY.green}
                  />
                );
              })}
            </svg>

            {CAST.map((s, i) => (
              <StudentFigure
                key={i}
                s={s}
                index={i}
                frame={frame}
                fps={fps}
                // The hero is there from the first frame; the others arrive
                // once the camera has started pulling back to find them.
                visible={
                  i === 0
                    ? eramp(frame, 0, 24)
                    : eramp(frame, BEATS.others + i * 22, BEATS.others + i * 22 + 30)
                }
                heroWalk={heroWalk}
                xOffset={i === 0 ? heroX : 0}
              />
            ))}
          </AbsoluteFill>

          {/* Final frame: the supplied logo, one line, nothing else. */}
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 38,
            }}
          >
            <Lockup progress={logo} width={720} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 22,
                opacity: line,
              }}
            >
              <div style={{ width: 84 * line, height: 2, backgroundColor: STORY.green }} />
              <div
                style={{
                  fontFamily: HEADING_FONT,
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: HEADING_TRACKING,
                  color: STORY.white,
                  transform: `translateY(${(1 - line) * 12}px)`,
                }}
              >
                Connection changes everything.
              </div>
            </div>
          </AbsoluteFill>
        </HandheldCamera>
      </FilmGrade>
    </AbsoluteFill>
  );
};
