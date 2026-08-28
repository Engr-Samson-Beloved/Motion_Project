import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  BODY_FONT,
  H,
  HEADING_FONT,
  HEADING_TRACKING,
  STORY,
  W,
  ease,
  eramp,
  ramp,
  sceneFade,
} from "./palette";
import {
  CLUTTER,
  CONVERGE,
  FACTS,
  OPPORTUNITIES,
  PEOPLE,
  POSTS,
  RESOURCES,
  SCRIPT,
  type StoryScene,
  framesFor,
} from "./script";
import { ClutterCard } from "./chaos";
import { NigeriaMap, cityAt } from "./map";
import { MAP_ASPECT, SEEKER, SOUGHT } from "./nigeria";
import {
  CapGlyph,
  Field,
  Grid,
  InfoGlyph,
  Lockup,
  OpportunityGlyph,
  PeopleGlyph,
  QuestionGlyph,
  ResourceGlyph,
  Silhouette,
  StarGlyph,
  Wire,
  type Pt,
} from "./ui";
import {
  Card,
  ListingRow,
  PHONE_W,
  PersonRow,
  Phone,
  PostRow,
  ScreenTitle,
  SearchBar,
  Avatar,
} from "./product";

export type SceneProps = { scene: StoryScene };

/* ── Shared rig ───────────────────────────────────────────────────────── */

/**
 * The film's camera: scale about a point, plus translation.
 *
 * The brief asks for push-ins, horizontal pans and controlled zoom-outs, and
 * all three are the same operation. Keeping them in one wrapper means a scene
 * states its camera move once at the top rather than threading a transform
 * through every child.
 */
const Camera: React.FC<{
  children: React.ReactNode;
  scale?: number;
  x?: number;
  y?: number;
  originX?: number;
  originY?: number;
}> = ({ children, scale = 1, x = 0, y = 0, originX = 0.5, originY = 0.5 }) => (
  <AbsoluteFill
    style={{
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      transformOrigin: `${originX * 100}% ${originY * 100}%`,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Centres its children in the frame. */
const Center: React.FC<{
  children: React.ReactNode;
  gap?: number;
  style?: React.CSSProperties;
}> = ({ children, gap = 0, style }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap,
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Full-frame SVG layer in film coordinates, for the connection lines. */
const Lines: React.FC<{ children: React.ReactNode; opacity?: number }> = ({
  children,
  opacity = 1,
}) => (
  <AbsoluteFill style={{ opacity }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {children}
    </svg>
  </AbsoluteFill>
);

/** The clutter of scene 02, also rendered frozen at the top of scene 03. */
const ClutterField: React.FC<{ frame: number; turbulence: number }> = ({
  frame,
  turbulence,
}) => (
  <AbsoluteFill>
    {CLUTTER.map((item, i) => (
      <ClutterCard
        key={`${item.kind}-${i}`}
        item={item}
        index={i}
        frame={frame}
        turbulence={turbulence}
        width={W}
        height={H}
      />
    ))}
  </AbsoluteFill>
);

/**
 * Scene 03 opens on a hard freeze of scene 02's final frame, so it needs that
 * frame number and that turbulence value. Both are read from the script rather
 * than hard-coded: re-time the scene and the freeze follows it.
 */
const SCATTER_END = framesFor(SCRIPT.find((s) => s.id === "scatter")!);
const SCATTER_TURBULENCE = 1.7;

/**
 * How much of the student is still visible once the clutter has buried them.
 * Scene 02 fades down to this and scene 03's freeze redraws at it, so the two
 * must agree or the cut pops.
 */
const BURIED_OPACITY = 0.22;

/* ── 01 · Every Student Has a Story ───────────────────────────────────── */

/**
 * How much wider than the frame the crowd is laid out.
 *
 * The scene ends at scale 0.44, so a crowd placed inside the frame's own
 * bounds would collapse into the middle 44% and leave the edges empty. Laying
 * it out across 2.3 frame-widths means it fills the frame at the end of the
 * pull-back — and stays safely off-camera before it.
 */
const CROWD_SPREAD = 2.3;

/** The crowd revealed by the zoom-out. Positions avoid the centred student. */
const CROWD: readonly { x: number; y: number; v: 0 | 1 | 2 | 3; at: number }[] = [
  { x: 0.16, y: 0.24, v: 1, at: 158 },
  { x: 0.83, y: 0.2, v: 0, at: 164 },
  { x: 0.28, y: 0.72, v: 2, at: 170 },
  { x: 0.72, y: 0.76, v: 3, at: 176 },
  { x: 0.09, y: 0.56, v: 0, at: 182 },
  { x: 0.91, y: 0.52, v: 1, at: 186 },
  { x: 0.36, y: 0.16, v: 3, at: 190 },
  { x: 0.63, y: 0.14, v: 2, at: 194 },
  { x: 0.21, y: 0.88, v: 0, at: 198 },
  { x: 0.79, y: 0.9, v: 1, at: 202 },
  { x: 0.47, y: 0.9, v: 2, at: 206 },
  { x: 0.06, y: 0.82, v: 3, at: 210 },
  { x: 0.94, y: 0.8, v: 0, at: 214 },
  { x: 0.55, y: 0.62, v: 1, at: 218 },
];

const SceneStory: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = framesFor(scene);
  const fade = sceneFade(frame, duration, 20, 16);

  // A slow push toward the student, then a controlled pull back that reveals
  // how many other students were always there.
  const push = eramp(frame, 0, 150);
  const pull = eramp(frame, 150, 226);
  const scale = 1 + push * 0.16 - pull * 0.72;

  const you = eramp(frame, 6, 40);

  // Each symbol appears out at a radius and travels in toward the student.
  const symbols = [
    { Glyph: CapGlyph, at: 46, from: { x: -300, y: -190 } },
    { Glyph: QuestionGlyph, at: 82, from: { x: 320, y: -150 } },
    { Glyph: StarGlyph, at: 118, from: { x: -60, y: 260 } },
  ];

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Field />
      <Grid opacity={0.4 + push * 0.15} />

      <Camera scale={scale}>
        {/* The crowd sits behind, so the pull-back uncovers it. */}
        {CROWD.map((c, i) => {
          const p = eramp(frame, c.at, c.at + 22);
          if (p <= 0) return null;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: W / 2 + (c.x - 0.5) * W * CROWD_SPREAD,
                top: H / 2 + (c.y - 0.5) * H * CROWD_SPREAD,
                transform: `translate(-50%, -50%) scale(${(0.8 + p * 0.2) * 1.5})`,
                opacity: p * 0.62,
              }}
            >
              <Silhouette size={110} variant={c.v} color={STORY.muted} />
            </div>
          );
        })}

        <Center>
          <div style={{ position: "relative" }}>
            {symbols.map(({ Glyph, at, from }, i) => {
              const appear = eramp(frame, at, at + 16);
              const travel = eramp(frame, at + 14, at + 62);
              if (appear <= 0) return null;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: from.x * (1 - travel * 0.72),
                    top: from.y * (1 - travel * 0.72),
                    transform: `translate(-50%, -50%) scale(${(0.55 + appear * 0.45) * (1 - travel * 0.28)})`,
                    opacity: appear * (1 - travel * 0.25),
                  }}
                >
                  <Glyph size={92} color={STORY.green} strokeWidth={1.6} />
                </div>
              );
            })}

            <div
              style={{
                transform: `translate(-50%, -50%) scale(${(0.86 + you * 0.14) * 2.1})`,
                opacity: you,
                position: "absolute",
              }}
            >
              <Silhouette size={120} variant={0} color={STORY.white} />
            </div>
          </div>
        </Center>
      </Camera>
    </AbsoluteFill>
  );
};

/* ── 02 · The Information Problem ─────────────────────────────────────── */

const SceneScatter: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = framesFor(scene);
  const fade = sceneFade(frame, duration, 16, 0); // hard cut out: scene 03 freezes on this

  // Movement accelerates across the scene. By the end the frame should feel
  // like it is getting away from you rather than merely being full.
  const turbulence = 0.25 + eramp(frame, 0, 400) * (SCATTER_TURBULENCE - 0.25);

  // The student is still there underneath, being buried.
  const you = 1 - eramp(frame, 40, 200) * (1 - BURIED_OPACITY);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Field />
      <Grid opacity={0.35} />

      <Center>
        <div style={{ transform: "scale(1.5)", opacity: you }}>
          <Silhouette size={120} variant={0} color={STORY.white} />
        </div>
      </Center>

      <ClutterField frame={frame} turbulence={turbulence} />
    </AbsoluteFill>
  );
};

/* ── 03 · The Missing Connection ──────────────────────────────────────── */

const MAP_W_03 = 1010;
const MAP_H_03 = Math.round(MAP_W_03 / MAP_ASPECT);

const SceneMissing: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = framesFor(scene);
  const fade = sceneFade(frame, duration, 0, 18); // hard cut in: the freeze

  // The freeze. Scene 02's last frame, held stone still for 20 frames, then
  // released. A dissolve here would soften exactly the beat the brief wants
  // to land hard.
  const held = frame < 20;

  // The clutter's exit and the map's entrance overlap deliberately. Timed to
  // hand over cleanly they instead left a dead second where the chaos had gone
  // and the country had not yet arrived — visible immediately on a contact
  // sheet, invisible in the code.
  const clutterOut = 1 - eramp(frame, 24, 96);

  // Slow cinematic zoom-out from the student into the country.
  const out = eramp(frame, 24, 150);
  const chaosScale = 1 - out * 0.55;

  const outline = ramp(frame, 40, 130);
  const nodes = ramp(frame, 112, 200);

  // The attempted connection: it reaches halfway and stops.
  const reach = eramp(frame, 215, 290);
  const stall = ease(Math.max(0, Math.min(1, (frame - 290) / 22)));

  const box = { w: MAP_W_03, h: MAP_H_03 };
  const originX = (W - box.w) / 2;
  const originY = (H - box.h) / 2 + 20;
  const at = (i: number): Pt => {
    const p = cityAt(i, box.w, box.h);
    return { x: p.x + originX, y: p.y + originY };
  };

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Field />
      <Grid opacity={0.35} />

      {clutterOut > 0 ? (
        <AbsoluteFill style={{ opacity: clutterOut }}>
          {/* Frozen: the same frame scene 02 ended on, held stone still. The
              zoom-out starts once the freeze has been allowed to land.

              The buried student is part of that frame, so it is redrawn here
              at the opacity scene 02 left it at — without it, the cut into the
              freeze pops. */}
          <Camera scale={held ? 1 : chaosScale}>
            <Center>
              <div style={{ transform: "scale(1.5)", opacity: BURIED_OPACITY }}>
                <Silhouette size={120} variant={0} color={STORY.white} />
              </div>
            </Center>
            <ClutterField frame={SCATTER_END - 1} turbulence={SCATTER_TURBULENCE} />
          </Camera>
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill style={{ opacity: eramp(frame, 40, 88) }}>
        <div style={{ position: "absolute", left: originX, top: originY }}>
          <NigeriaMap
            width={box.w}
            height={box.h}
            outline={outline}
            nodes={nodes}
            labels={[SEEKER, SOUGHT]}
            highlight={[SEEKER, SOUGHT]}
          />
        </div>

        <Lines>
          {/* One student searching for another, from Lagos toward Maiduguri. */}
          <Wire
            a={at(SEEKER)}
            b={at(SOUGHT)}
            progress={reach}
            stop={0.5}
            bow={-0.09}
            width={2.6}
            opacity={1 - stall * 0.25}
          />
          {/* The far student, waiting, unreached. */}
          <circle
            cx={at(SOUGHT).x}
            cy={at(SOUGHT).y}
            r={16 + stall * 8}
            fill="none"
            stroke={STORY.green}
            strokeWidth={2}
            opacity={eramp(frame, 170, 212) * (1 - stall * 0.55)}
          />
        </Lines>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── 04 · The Question ────────────────────────────────────────────────── */

const SceneQuestion: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = framesFor(scene);
  const fade = sceneFade(frame, duration, 20, 16);

  // Large enough to be the subject of a 1920x1080 frame. At 250 the circle sat
  // in the middle of the picture rather than commanding it.
  const R = 310;
  const ring = eramp(frame, 10, 74);
  const appear = (i: number) => eramp(frame, 48 + i * 12, 48 + i * 12 + 24);
  // A slow quarter-turn, then everything falls inward to one point.
  const orbit = eramp(frame, 60, 168) * Math.PI * 0.42;
  const converge = eramp(frame, 168, 226);
  const labels = 1 - eramp(frame, 150, 190);
  const hold = eramp(frame, 222, 252);

  const Glyphs = [PeopleGlyph, InfoGlyph, ResourceGlyph, OpportunityGlyph];

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Field />
      <Grid opacity={0.35} />

      <Center>
        <div style={{ position: "relative", width: R * 2, height: R * 2 }}>
          {/* The single green circle, drawn as a solid stroke. */}
          <svg
            width={R * 2}
            height={R * 2}
            style={{ position: "absolute", inset: 0, opacity: 1 - converge * 0.8 }}
          >
            <circle
              cx={R}
              cy={R}
              r={R - 4}
              fill="none"
              stroke={STORY.green}
              strokeWidth={2}
              strokeDasharray={2 * Math.PI * (R - 4)}
              strokeDashoffset={2 * Math.PI * (R - 4) * (1 - ring)}
              transform={`rotate(-90 ${R} ${R})`}
            />
          </svg>

          {CONVERGE.map((c, i) => {
            const a = orbit + (i / CONVERGE.length) * Math.PI * 2 - Math.PI / 2;
            const r = (R - 4) * (1 - converge);
            const x = R + Math.cos(a) * r;
            const y = R + Math.sin(a) * r;
            const p = appear(i);
            const Glyph = Glyphs[i];
            return (
              <div
                key={c.key}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) scale(${(0.6 + p * 0.4) * (1 - converge * 0.55)})`,
                  opacity: p * (1 - converge * 0.35),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Glyph size={84} color={STORY.green} strokeWidth={1.6} />
                <div
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 20,
                    fontWeight: 600,
                    letterSpacing: 1,
                    color: STORY.muted,
                    opacity: labels,
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.label}
                </div>
              </div>
            );
          })}

          {/*
            The point everything becomes, and the ring it sends out.

            The dot alone held the last second of the scene and the frame read
            as empty rather than as anticipation. The ring gives the hold
            something to do and sets up the logo arriving in scene 05.
          */}
          <svg
            width={R * 2}
            height={R * 2}
            style={{ position: "absolute", inset: 0, opacity: converge }}
          >
            {[0, 1].map((i) => {
              const p = eramp(frame, 224 + i * 22, 224 + i * 22 + 46);
              if (p <= 0) return null;
              return (
                <circle
                  key={i}
                  cx={R}
                  cy={R}
                  r={18 + p * 150}
                  fill="none"
                  stroke={STORY.green}
                  strokeWidth={2}
                  opacity={(1 - p) * 0.75}
                />
              );
            })}
            <circle cx={R} cy={R} r={15 + hold * 15} fill={STORY.green} />
          </svg>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/* ── 05 · The Reveal ──────────────────────────────────────────────────── */

const MAP_W_05 = 980;
const MAP_H_05 = Math.round(MAP_W_05 / MAP_ASPECT);

/** Where the phone rests in scene 06, so scene 05 can hand off to it cleanly. */
const PHONE_REST_X = -430;

const SceneReveal: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = framesFor(scene);
  const fade = sceneFade(frame, duration, 14, 0); // hands straight to scene 06

  const logo = eramp(frame, 6, 44);
  const mapIn = eramp(frame, 34, 96);
  const spread = eramp(frame, 44, 128);
  // The last two seconds move the logo up and lift the phone into place, so
  // the cut to scene 06 lands on a continuous move rather than on a jump.
  const toUi = eramp(frame, 138, 205);

  const originX = (W - MAP_W_05) / 2;
  const originY = (H - MAP_H_05) / 2;
  const center: Pt = { x: W / 2, y: H / 2 - 10 };
  const at = (i: number): Pt => {
    const p = cityAt(i, MAP_W_05, MAP_H_05);
    return { x: p.x + originX, y: p.y + originY };
  };

  // Lines reach from the logo out to nodes across the country.
  const reached = [0, 2, 6, 9, 11, 13, 15, 17, 20, 22, 24, 26, 27, 19, 23];

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Field />
      <Grid opacity={0.35} />

      <AbsoluteFill style={{ opacity: mapIn * (1 - toUi) }}>
        <div style={{ position: "absolute", left: originX, top: originY, opacity: 0.75 }}>
          <NigeriaMap
            width={MAP_W_05}
            height={MAP_H_05}
            outline={mapIn}
            nodes={eramp(frame, 60, 130)}
            outlineColor={STORY.line}
            fill={STORY.dark2}
          />
        </div>

        <Lines>
          {reached.map((c, i) => (
            <Wire
              key={c}
              a={center}
              b={at(c)}
              progress={Math.max(
                0,
                Math.min(1, (spread - (i / reached.length) * 0.55) / 0.45),
              )}
              width={1.6}
              opacity={0.8}
            />
          ))}
        </Lines>
      </AbsoluteFill>

      {/* The supplied lockup, floating with no plate behind it. */}
      <Center>
        <div
          style={{
            transform: `translateY(${-toUi * 300}px) scale(${1 - toUi * 0.42})`,
            opacity: 1 - toUi * 0.15,
          }}
        >
          <Lockup progress={logo} width={780} settle={eramp(frame, 44, 90)} />
        </div>
      </Center>

      {/* The interface arrives from below and settles where scene 06 wants it. */}
      {toUi > 0 ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            transform: `translate(${PHONE_REST_X * toUi}px, ${(1 - toUi) * 900}px)`,
          }}
        >
          <Phone progress={toUi} activeTab={2}>
            <SearchBar progress={toUi} text="Search students, schools, resources" />
            {PEOPLE.slice(0, 3).map((p, i) => (
              <PersonRow
                key={p.name}
                progress={ramp(frame, 168 + i * 10, 188 + i * 10)}
                initials={p.initials}
                name={p.name}
                school={p.school}
              />
            ))}
          </Phone>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ── 06 · Connect ─────────────────────────────────────────────────────── */

/** Avatar constellation to the right of the phone, for the network beat. */
const CONSTELLATION: readonly { x: number; y: number; initials: string }[] = [
  { x: 1180, y: 300, initials: "AO" },
  { x: 1460, y: 200, initials: "IB" },
  { x: 1700, y: 340, initials: "TA" },
  { x: 1300, y: 540, initials: "NE" },
  { x: 1610, y: 610, initials: "MS" },
  { x: 1420, y: 810, initials: "CU" },
  { x: 1730, y: 830, initials: "FA" },
];

const CONSTELLATION_EDGES: readonly (readonly [number, number])[] = [
  [0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [3, 5], [4, 6], [5, 6], [0, 4],
];

const SceneConnect: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = framesFor(scene);
  const fade = sceneFade(frame, duration, 14, 14);

  // Three beats on one continuous phone: profiles, network, community.
  const beatB = eramp(frame, 140, 200);
  const beatC = eramp(frame, 290, 340);

  const phoneX = PHONE_REST_X;
  const at = (i: number): Pt => CONSTELLATION[i];

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Field />
      <Grid opacity={0.35} />

      {/* Beat B: the network the profiles belong to, growing to the right. */}
      <Lines opacity={beatB * (1 - beatC * 0.55)}>
        {CONSTELLATION_EDGES.map(([a, b], i) => (
          <Wire
            key={i}
            a={at(a)}
            b={at(b)}
            progress={Math.max(
              0,
              Math.min(1, (beatB - (i / CONSTELLATION_EDGES.length) * 0.6) / 0.4),
            )}
            width={1.8}
            opacity={0.85}
          />
        ))}
      </Lines>

      {CONSTELLATION.map((c, i) => {
        const p = eramp(frame, 150 + i * 9, 178 + i * 9) * (1 - beatC * 0.55);
        if (p <= 0) return null;
        return (
          <div
            key={c.initials}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              transform: `translate(-50%, -50%) scale(${0.7 + p * 0.3})`,
              opacity: p,
            }}
          >
            <Avatar label={c.initials} size={72} />
          </div>
        );
      })}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${phoneX}px)`,
        }}
      >
        <Phone progress={1} activeTab={beatC > 0.5 ? 0 : 2}>
          {/* Network, then the community feed. One screen cross-fades to the
              other in place, the way tabbing does in the app. */}
          <AbsoluteFill style={{ opacity: 1 - beatC }}>
            <ScreenTitle progress={1} sub="Students across institutions">
              Network
            </ScreenTitle>
            <SearchBar progress={1} text="Search students, schools, resources" />
            {PEOPLE.map((p, i) => (
              <PersonRow
                key={p.name}
                progress={ramp(frame, 8 + i * 14, 30 + i * 14)}
                initials={p.initials}
                name={p.name}
                school={p.school}
                action={i < 2 ? "Connected" : "Connect"}
              />
            ))}
          </AbsoluteFill>

          <AbsoluteFill style={{ opacity: beatC }}>
            <ScreenTitle progress={1} sub="Open to every campus">
              Community
            </ScreenTitle>
            {POSTS.map((p, i) => (
              <PostRow
                key={p.name}
                progress={ramp(frame, 306 + i * 26, 334 + i * 26)}
                initials={p.initials}
                name={p.name}
                school={p.school}
                text={p.text}
                replies={p.replies}
              />
            ))}
          </AbsoluteFill>
        </Phone>
      </AbsoluteFill>

      {/* Beat C: the discussion moving between people, not just sitting in a
          list. Lines run from the phone out to three of the avatars. */}
      <Lines opacity={beatC}>
        {[0, 3, 5].map((i, k) => (
          <Wire
            key={i}
            a={{ x: W / 2 + phoneX + PHONE_W / 2 + 10, y: H / 2 - 120 + k * 130 }}
            b={at(i)}
            progress={eramp(frame, 320 + k * 16, 372 + k * 16)}
            width={1.8}
            bow={0.05}
            opacity={0.9}
          />
        ))}
      </Lines>
    </AbsoluteFill>
  );
};

/* ── 07 · Discover ────────────────────────────────────────────────────── */

/**
 * Students the resources reach, to the right of the phone.
 *
 * `from` is the y the wire leaves the phone at. Sources and targets are both
 * ordered top to bottom so the wires never cross: five crossing lines read as
 * a tangle, which is scene 02's language, and this is the scene where things
 * are supposed to have become orderly.
 */
const LEARNERS: readonly {
  x: number;
  y: number;
  v: 0 | 1 | 2 | 3;
  from: number;
}[] = [
  { x: 1310, y: 236, v: 0, from: 268 },
  { x: 1655, y: 352, v: 1, from: 350 },
  { x: 1330, y: 588, v: 2, from: 470 },
  { x: 1700, y: 690, v: 3, from: 590 },
  { x: 1290, y: 878, v: 1, from: 700 },
];

const SceneDiscover: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = framesFor(scene);
  const fade = sceneFade(frame, duration, 14, 16);

  const beatB = eramp(frame, 116, 168); // Discover
  const beatC = eramp(frame, 258, 306); // trusted information

  const phoneX = PHONE_REST_X;
  const cardEdge = W / 2 + phoneX + PHONE_W / 2 + 10;

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Field />
      <Grid opacity={0.35} />

      {/* Resources reaching the students who need them. */}
      <Lines opacity={(1 - beatC) * 0.95}>
        {LEARNERS.map((l, i) => (
          <Wire
            key={i}
            a={{ x: cardEdge, y: l.from }}
            b={{ x: l.x, y: l.y }}
            progress={eramp(frame, 30 + i * 13, 86 + i * 13)}
            width={1.6}
            // All bowed the same way, so they read as a fan rather than a knot.
            bow={0.05}
            opacity={0.8}
          />
        ))}
      </Lines>

      {LEARNERS.map((l, i) => {
        const p = eramp(frame, 40 + i * 13, 74 + i * 13) * (1 - beatC * 0.7);
        if (p <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: l.x,
              top: l.y,
              transform: `translate(-50%, -50%) scale(${(0.8 + p * 0.2) * 1.25})`,
              opacity: p,
            }}
          >
            <Silhouette size={104} variant={l.v} color={STORY.line2} />
          </div>
        );
      })}

      {/* The trusted-information beat replaces the constellation rather than
          crowding it: three verified facts, flat ticks, no ornament. */}
      {beatC > 0 ? (
        <AbsoluteFill
          style={{
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 1160,
            flexDirection: "column",
            gap: 28,
            opacity: beatC,
          }}
        >
          {FACTS.map((f, i) => {
            const p = eramp(frame, 276 + i * 20, 310 + i * 20);
            return (
              <div
                key={f.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  opacity: p,
                  transform: `translateX(${(1 - p) * 30}px)`,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    backgroundColor: STORY.green,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke={STORY.white}
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: HEADING_FONT,
                      fontSize: 32,
                      fontWeight: 800,
                      letterSpacing: HEADING_TRACKING,
                      color: STORY.white,
                    }}
                  >
                    {f.value}
                  </div>
                  <div
                    style={{
                      fontFamily: BODY_FONT,
                      fontSize: 19,
                      color: STORY.muted,
                      marginTop: 2,
                    }}
                  >
                    {f.label}
                  </div>
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${phoneX}px)`,
        }}
      >
        <Phone progress={1} activeTab={beatB > 0.5 ? 0 : 3}>
          <AbsoluteFill style={{ opacity: 1 - beatB }}>
            <ScreenTitle progress={1} sub="Saved by students like you">
              Resources
            </ScreenTitle>
            {RESOURCES.map((r, i) => (
              <ListingRow
                key={r.title}
                progress={ramp(frame, 10 + i * 22, 36 + i * 22)}
                tag={r.tag}
                title={r.title}
                meta={r.meta}
              />
            ))}
          </AbsoluteFill>

          <AbsoluteFill style={{ opacity: beatB * (1 - beatC) }}>
            <ScreenTitle progress={1} sub="Opportunities, events, careers">
              Discover
            </ScreenTitle>
            <SearchBar progress={1} text="Scholarships, internships, events" />
            {OPPORTUNITIES.map((o, i) => (
              <ListingRow
                key={o.title}
                progress={ramp(frame, 140 + i * 24, 168 + i * 24)}
                tag={o.tag}
                title={o.title}
                meta={o.meta}
              />
            ))}
          </AbsoluteFill>

          <AbsoluteFill style={{ opacity: beatC }}>
            <ScreenTitle progress={1} sub="University of Ibadan">
              School profile
            </ScreenTitle>
            {FACTS.map((f, i) => (
              <Card key={f.value} progress={ramp(frame, 282 + i * 18, 306 + i * 18)} accent>
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 16,
                    fontWeight: 800,
                    color: STORY.dark,
                  }}
                >
                  {f.value}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: BODY_FONT,
                    fontSize: 12,
                    fontWeight: 700,
                    color: STORY.green,
                  }}
                >
                  {f.label}
                </div>
              </Card>
            ))}
          </AbsoluteFill>
        </Phone>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── 08 · Break the Boundary ──────────────────────────────────────────── */

const MAP_W_08 = 1080;
const MAP_H_08 = Math.round(MAP_W_08 / MAP_ASPECT);

const SceneBoundary: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = framesFor(scene);
  const fade = sceneFade(frame, duration, 14, 0); // runs straight into the vision

  // One campus, drawn as a plain rectangle. The student steps out of it, and
  // then the rectangle stops being a boundary by becoming the whole country.
  const box = eramp(frame, 4, 40);
  const step = eramp(frame, 42, 84);
  const expand = eramp(frame, 76, 140);
  const pullBack = eramp(frame, 80, 170);

  // 420x300 was subtle to the point of being small: on a 1920-wide frame it
  // read as a diagram of a campus rather than as one.
  const boxW = 660 + expand * 3200;
  const boxH = 470 + expand * 2000;
  const boxOpacity = (1 - eramp(frame, 100, 140)) * box;

  // The country arrives while the boundary is still expanding, not after it.
  // Sequenced strictly the frame sat empty for most of a second between the
  // rectangle leaving the screen and the map appearing.
  const mapIn = eramp(frame, 84, 130);
  const originX = (W - MAP_W_08) / 2;
  const originY = (H - MAP_H_08) / 2;

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Field />
      <Grid opacity={0.35} />

      <Camera scale={1.25 - pullBack * 0.25}>
        <Center>
          {/* The campus boundary. */}
          <div
            style={{
              position: "absolute",
              width: boxW,
              height: boxH,
              border: `2px solid ${STORY.line2}`,
              borderRadius: 6,
              opacity: boxOpacity,
            }}
          />
          {/* The student, inside, then outside. */}
          <div
            style={{
              position: "absolute",
              // Ends clear of the right edge, not straddling it: the point of
              // the beat is that the student is outside, not on the line.
              transform: `translate(${-190 + step * 650}px, ${step * 10}px) scale(${1.7 * (1 - expand * 0.45)})`,
              opacity: box * (1 - eramp(frame, 104, 146)),
            }}
          >
            <Silhouette size={110} variant={0} color={STORY.white} />
          </div>
        </Center>
      </Camera>

      {/* The country the boundary was hiding. */}
      <AbsoluteFill style={{ opacity: mapIn }}>
        <div style={{ position: "absolute", left: originX, top: originY }}>
          <NigeriaMap
            width={MAP_W_08}
            height={MAP_H_08}
            outline={eramp(frame, 84, 132)}
            nodes={ramp(frame, 104, 152)}
            edges={ramp(frame, 116, 205)}
            pulse={0}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── 09 · The Vision ──────────────────────────────────────────────────── */

const SceneVision: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();

  // No fade out. The brief wants the final frame clean and held, and fading
  // the film's last two seconds to black would throw away the hold.
  const inFade = ramp(frame, 0, 12);

  // The finished network, breathing.
  const pulse = (Math.sin((frame / 30) * Math.PI * 1.1) + 1) / 2;
  const mapOut = eramp(frame, 46, 88);

  const logo = eramp(frame, 62, 96);
  const line = eramp(frame, 86, 116);

  const originX = (W - MAP_W_08) / 2;
  const originY = (H - MAP_H_08) / 2;

  return (
    <AbsoluteFill style={{ opacity: inFade }}>
      <Field />
      <Grid opacity={0.35 * (1 - mapOut * 0.6)} />

      <AbsoluteFill style={{ opacity: 1 - mapOut }}>
        <div
          style={{
            position: "absolute",
            left: originX,
            top: originY,
            transform: `scale(${1 - mapOut * 0.08})`,
            transformOrigin: "50% 50%",
          }}
        >
          <NigeriaMap
            width={MAP_W_08}
            height={MAP_H_08}
            outline={1}
            nodes={1}
            edges={1}
            pulse={pulse}
          />
        </div>
      </AbsoluteFill>

      {/* Final frame: the supplied logo, one line beneath it, nothing else. */}
      <Center gap={44}>
        <Lockup progress={logo} width={760} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
            opacity: line,
          }}
        >
          <div style={{ width: 90 * line, height: 2, backgroundColor: STORY.green }} />
          <div
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: HEADING_TRACKING,
              color: STORY.white,
              transform: `translateY(${(1 - line) * 14}px)`,
            }}
          >
            Connection changes everything.
          </div>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/* ── Registry ─────────────────────────────────────────────────────────── */

export const RENDERERS: Record<string, React.FC<SceneProps>> = {
  story: SceneStory,
  scatter: SceneScatter,
  missing: SceneMissing,
  question: SceneQuestion,
  reveal: SceneReveal,
  connect: SceneConnect,
  discover: SceneDiscover,
  boundary: SceneBoundary,
  vision: SceneVision,
};

export const rendererFor = (scene: StoryScene): React.FC<SceneProps> => {
  const r = RENDERERS[scene.id];
  if (!r) throw new Error(`no renderer for scene "${scene.id}"`);
  return r;
};
