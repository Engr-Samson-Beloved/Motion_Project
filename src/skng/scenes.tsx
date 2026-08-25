import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BODY_FONT,
  BRAND,
  HEADING_FONT,
  HEADING_TRACKING,
  MONO_FONT,
  sceneOpacity,
} from "./brand";
import {
  DarkField,
  Eyebrow,
  Heading,
  LightField,
  LogoChip,
  NetworkGraph,
} from "./ui";

type SceneProps = { duration: number };

/** Shared spring helper: settles with no overshoot unless damping is lowered. */
const useSpring = (fps: number, frame: number) =>
  React.useCallback(
    (delay: number, durationInFrames = 30, damping = 200) =>
      spring({
        frame: frame - delay,
        fps,
        config: { damping },
        durationInFrames,
      }),
    [fps, frame],
  );

/* ------------------------------------------------------------------ */
/* 01 — Open: the network assembles around the mark                    */
/* ------------------------------------------------------------------ */

export const SceneOpen: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = useSpring(fps, frame);

  const logo = sp(40, 40, 14);
  const word = sp(66, 34);
  const tag = sp(92, 30);
  const drift = interpolate(frame, [0, duration], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration, 14, 22) }}>
      <DarkField drift={drift} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 760,
              height: 760,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: -150,
            }}
          >
            <div style={{ position: "absolute" }}>
              <NetworkGraph
                frame={frame}
                fps={fps}
                delay={4}
                nodes={6}
                radius={250}
                size={760}
                opacity={0.9}
              />
            </div>
            <LogoChip size={236} scale={logo} />
          </div>

          <div
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: HEADING_TRACKING,
              color: BRAND.white,
              clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`,
            }}
          >
            SkoolConnectNG
          </div>

          <div
            style={{
              fontFamily: BODY_FONT,
              fontSize: 30,
              fontWeight: 500,
              lineHeight: 1.6,
              color: BRAND.surface,
              opacity: tag * 0.85,
              transform: `translateY(${(1 - tag) * 18}px)`,
              marginTop: 22,
            }}
          >
            A Unified Digital Network for Nigeria&rsquo;s Student Ecosystem
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 02 — Problem: three failure points drift apart                      */
/* ------------------------------------------------------------------ */

const PROBLEMS = [
  {
    title: "Fragmented Identity",
    body: "No verified, portable academic profile. Each platform holds only a piece of who a student is.",
  },
  {
    title: "Unreliable Information",
    body: "Aspirants choose institutions on hearsay. Portals sit abandoned; blogs go unverified and stale.",
  },
  {
    title: "Lost Community",
    body: "Academic communities dissolve after graduation, cutting off mentorship and continuity.",
  },
];

export const SceneProblem: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = useSpring(fps, frame);

  const eyebrow = sp(0, 24);
  const heading = sp(12, 34);

  // The cards pull apart as the scene runs — fragmentation made literal.
  const spread = interpolate(frame, [90, duration - 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration) }}>
      <LightField />

      <AbsoluteFill
        style={{
          padding: "0 150px",
          justifyContent: "center",
        }}
      >
        <Eyebrow progress={eyebrow}>The Problem</Eyebrow>

        <div style={{ marginTop: 26, marginBottom: 68 }}>
          <Heading progress={heading} size={80} maxWidth={1300}>
            Nigeria&rsquo;s student ecosystem is structurally fragmented.
          </Heading>
        </div>

        <div style={{ display: "flex", gap: 40 }}>
          {PROBLEMS.map((p, i) => {
            const enter = sp(56 + i * 20, 34);
            const offset = (i - 1) * spread * 30;

            return (
              <div
                key={p.title}
                style={{
                  flex: 1,
                  backgroundColor: BRAND.white,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: BRAND.radius,
                  padding: "38px 36px 44px",
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 46}px) translateX(${offset}px)`,
                  boxShadow: "0 18px 40px rgba(26,55,63,0.07)",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 4,
                    borderRadius: 4,
                    backgroundColor: BRAND.red,
                    marginBottom: 26,
                    transform: `scaleX(${enter})`,
                    transformOrigin: "left",
                  }}
                />
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 34,
                    fontWeight: 800,
                    letterSpacing: HEADING_TRACKING,
                    color: BRAND.ink,
                    marginBottom: 16,
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 22,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    color: BRAND.ink,
                    opacity: 0.68,
                  }}
                >
                  {p.body}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 03 — Solution: four groups wire into one hub                        */
/* ------------------------------------------------------------------ */

const GROUPS = [
  { label: "Students", sub: "Verified identity + community", x: 545, y: 560 },
  { label: "Aspirants", sub: "Guided decision-making", x: 1375, y: 560 },
  { label: "Institutions", sub: "Official presence", x: 545, y: 830 },
  { label: "Alumni", sub: "Network beyond graduation", x: 1375, y: 830 },
];

const HUB = { x: 960, y: 695 };

export const SceneSolution: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = useSpring(fps, frame);

  const eyebrow = sp(0, 24);
  const heading = sp(12, 34);
  const hub = sp(38, 40, 13);
  const drift = interpolate(frame, [0, duration], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration) }}>
      <DarkField drift={drift} />

      <AbsoluteFill
        style={{ alignItems: "center", paddingTop: 150 }}
      >
        <Eyebrow progress={eyebrow} color={BRAND.surface}>
          The Solution
        </Eyebrow>
        <div style={{ marginTop: 24 }}>
          <Heading
            progress={heading}
            size={82}
            color={BRAND.white}
            align="center"
            maxWidth={1400}
          >
            One verified ecosystem.
          </Heading>
        </div>
      </AbsoluteFill>

      {/* Spokes drawn from the hub out to each group. */}
      <AbsoluteFill>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          {GROUPS.map((g, i) => {
            const len = Math.hypot(g.x - HUB.x, g.y - HUB.y);
            const p = sp(62 + i * 13, 30);
            return (
              <line
                key={g.label}
                x1={HUB.x}
                y1={HUB.y}
                x2={g.x}
                y2={g.y}
                stroke={BRAND.white}
                strokeWidth={2.5}
                strokeOpacity={0.4}
                strokeDasharray={len}
                strokeDashoffset={len * (1 - p)}
              />
            );
          })}
        </svg>
      </AbsoluteFill>

      {GROUPS.map((g, i) => {
        const enter = sp(70 + i * 13, 32);
        return (
          <div
            key={g.label}
            style={{
              position: "absolute",
              left: g.x - 165,
              top: g.y - 52,
              width: 330,
              padding: "20px 26px",
              borderRadius: BRAND.radius,
              backgroundColor: "rgba(255,255,255,0.09)",
              border: "1px solid rgba(255,255,255,0.24)",
              opacity: enter,
              transform: `translateY(${(1 - enter) * 20}px)`,
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: HEADING_TRACKING,
                color: BRAND.white,
              }}
            >
              {g.label}
            </div>
            <div
              style={{
                fontFamily: BODY_FONT,
                fontSize: 19,
                fontWeight: 500,
                color: BRAND.surface,
                opacity: 0.72,
                marginTop: 4,
              }}
            >
              {g.sub}
            </div>
          </div>
        );
      })}

      {/* Hub carries the mark itself. */}
      <div
        style={{ position: "absolute", left: HUB.x - 82, top: HUB.y - 82 }}
      >
        <LogoChip size={164} scale={hub} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 04 — Differentiation: what others do vs. what this does             */
/* ------------------------------------------------------------------ */

const CONTRASTS = [
  ["Open, unverified social profiles", "Verified academic identity"],
  ["Communities that die after graduation", "Alumni continuity by design"],
  ["Frontend-enforced permissions", "Row-level security at the database"],
];

export const SceneDifference: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = useSpring(fps, frame);

  const eyebrow = sp(0, 24);
  const heading = sp(12, 34);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration) }}>
      <LightField />

      <AbsoluteFill style={{ padding: "0 150px", justifyContent: "center" }}>
        <Eyebrow progress={eyebrow}>What Sets It Apart</Eyebrow>

        <div style={{ marginTop: 26, marginBottom: 58 }}>
          <Heading progress={heading} size={76} maxWidth={1400}>
            Not another social app.{" "}
            <span style={{ color: BRAND.primary }}>
              Structural infrastructure.
            </span>
          </Heading>
        </div>

        <div>
          {CONTRASTS.map(([before, after], i) => {
            const enter = sp(58 + i * 26, 32);
            const strike = sp(74 + i * 26, 26);

            return (
              <div
                key={before}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 44,
                  padding: "26px 0",
                  borderBottom: `1px solid ${BRAND.border}`,
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 26}px)`,
                }}
              >
                <div style={{ width: 520 }}>
                  {/* Inline-block so the rule matches the text, not the column. */}
                  <span style={{ position: "relative", display: "inline-block" }}>
                    <span
                      style={{
                        fontFamily: BODY_FONT,
                        fontSize: 27,
                        fontWeight: 500,
                        color: BRAND.ink,
                        opacity: 0.42,
                      }}
                    >
                      {before}
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        top: "52%",
                        left: 0,
                        height: 2,
                        width: "100%",
                        backgroundColor: BRAND.red,
                        opacity: 0.7,
                        transform: `scaleX(${strike})`,
                        transformOrigin: "left",
                      }}
                    />
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: 26,
                    color: BRAND.secondary,
                    opacity: strike,
                  }}
                >
                  &rarr;
                </div>

                <div
                  style={{
                    flex: 1,
                    fontFamily: HEADING_FONT,
                    fontSize: 34,
                    fontWeight: 800,
                    letterSpacing: HEADING_TRACKING,
                    color: BRAND.primary,
                  }}
                >
                  {after}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 05 — Pillars: trust is engineered                                   */
/* ------------------------------------------------------------------ */

const PILLARS = [
  ["01", "Verified", "Identity earned through role progression"],
  ["02", "Offline-First", "Offline is assumed, not an edge case"],
  ["03", "Secure by Default", "Row-level security at the database layer"],
];

export const ScenePillars: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = useSpring(fps, frame);

  const heading = sp(6, 34);
  const drift = interpolate(frame, [0, duration], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration) }}>
      <DarkField drift={drift} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 150px",
        }}
      >
        <Heading
          progress={heading}
          size={72}
          color={BRAND.white}
          align="center"
          maxWidth={1560}
        >
          Trust is engineered, not hoped for.
        </Heading>

        <div style={{ display: "flex", gap: 48, marginTop: 92 }}>
          {PILLARS.map(([num, title, body], i) => {
            const enter = sp(46 + i * 20, 34);
            return (
              <div
                key={num}
                style={{
                  flex: 1,
                  maxWidth: 420,
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 34}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: 22,
                    color: BRAND.surface,
                    opacity: 0.5,
                    marginBottom: 18,
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    height: 3,
                    backgroundColor: BRAND.surface,
                    opacity: 0.35,
                    marginBottom: 22,
                    transform: `scaleX(${enter})`,
                    transformOrigin: "left",
                  }}
                />
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 38,
                    fontWeight: 800,
                    letterSpacing: HEADING_TRACKING,
                    color: BRAND.white,
                    marginBottom: 12,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 21,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    color: BRAND.surface,
                    opacity: 0.7,
                  }}
                >
                  {body}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 06 — Close                                                          */
/* ------------------------------------------------------------------ */

export const SceneClose: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = useSpring(fps, frame);

  const logo = sp(4, 40, 13);
  const line = sp(30, 30);
  const punch = sp(48, 34);
  const url = sp(74, 30);
  const drift = interpolate(frame, [0, duration], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration, 16, 26) }}>
      <DarkField drift={drift} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ marginBottom: 34 }}>
          <LogoChip size={168} scale={logo} />
        </div>

        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: 1,
            color: BRAND.surface,
            opacity: line * 0.75,
            transform: `translateY(${(1 - line) * 16}px)`,
            marginBottom: 20,
          }}
        >
          The system is ready. The students are ready.
        </div>

        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 104,
            fontWeight: 900,
            letterSpacing: HEADING_TRACKING,
            color: BRAND.white,
            clipPath: `inset(0 ${(1 - punch) * 100}% 0 0)`,
          }}
        >
          The time is now.
        </div>

        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: url,
            transform: `translateY(${(1 - url) * 14}px)`,
          }}
        >
          <div
            style={{
              width: 34,
              height: 2,
              backgroundColor: BRAND.surface,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              fontFamily: MONO_FONT,
              fontSize: 26,
              letterSpacing: 3,
              color: BRAND.surface,
            }}
          >
            skoolconnect.ng
          </div>
          <div
            style={{
              width: 34,
              height: 2,
              backgroundColor: BRAND.surface,
              opacity: 0.5,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
