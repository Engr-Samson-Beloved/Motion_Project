import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY_FONT, BRAND, HEADING_FONT, HEADING_TRACKING, sceneOpacity } from "../brand";
import { beatPulse } from "../../lib/cinema";
import { Slam } from "../../lib/cinema/blur";
import {
  Avatar,
  Body,
  Bubble,
  Card,
  Chip,
  DarkField,
  DeepField,
  Headline,
  Kicker,
  LightField,
  Lockup,
  Phone,
  ScreenTitle,
  Tick,
  usePop,
  useSettle,
} from "./ui";
import { BookIcon, UsersIcon } from "./icons";

/**
 * Thirteen scenes, every duration a multiple of 18 frames.
 *
 * 18 frames is one beat of the bed at 100 BPM and 30fps, so every hard cut
 * lands exactly on a beat rather than near one. The durations sum to 100 beats,
 * which is 1800 frames, which is 60 seconds.
 */

export type SceneProps = { duration: number };

const FADE_IN = 4;
const FADE_OUT = 5;

/** Shared vertical layout. Bottom padding clears the beat meter safe area. */
const Stack: React.FC<{
  children: React.ReactNode;
  gap?: number;
  justify?: "center" | "flex-start";
}> = ({ children, gap = 32, justify = "center" }) => (
  <AbsoluteFill
    style={{
      justifyContent: justify,
      alignItems: "center",
      gap,
      padding: "170px 70px 210px",
      textAlign: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);

const useScene = (duration: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return {
    frame,
    fps,
    pop: usePop(fps, frame),
    settle: useSettle(fps, frame),
    opacity: sceneOpacity(frame, duration, FADE_IN, FADE_OUT),
    pulse: beatPulse(frame, fps, 3.6),
  };
};

/* ── 1. Ignition (8 beats) ────────────────────────────────────────────── */

export const PulseIgnition: React.FC<SceneProps> = ({ duration }) => {
  const { pop, settle, opacity, pulse } = useScene(duration);
  const enter = pop(2, 30, 8);
  const line = settle(30);

  return (
    <AbsoluteFill style={{ opacity }}>
      <DeepField glow={pulse} />
      {/*
        Slam sits directly in the scene, not inside Stack. Trail stacks its
        layers by rendering the children repeatedly, which only composites
        correctly when they are absolutely positioned — dropping it into a flex
        column would lay out fourteen copies in the flow instead.
      */}
      <Slam layers={14} lagInFrames={0.45} trailOpacity={0.5}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Lockup progress={enter} variant="dark" width={860} pulse={pulse} />
        </AbsoluteFill>
      </Slam>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 300,
        }}
      >
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 30,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: BRAND.surface,
            opacity: line * 0.8,
            transform: `translateY(${(1 - line) * 16}px)`,
          }}
        >
          One network. Every campus.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── 2. Hook (7 beats) ────────────────────────────────────────────────── */

const NOISE = [
  "Where is the timetable?",
  "Is the portal down again?",
  "Anyone has last year's past questions?",
  "Which hostel is this?",
  "Who is the course rep??",
];

export const PulseHook: React.FC<SceneProps> = ({ duration }) => {
  const { pop, opacity } = useScene(duration);

  return (
    <AbsoluteFill style={{ opacity }}>
      <DarkField drift={-0.3} />
      <Stack gap={18}>
        {NOISE.map((n, i) => {
          const p = pop(2 + i * 5, 22, 11);
          return (
            <div
              key={n}
              style={{
                alignSelf: i % 2 ? "flex-end" : "flex-start",
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 18,
                padding: "16px 22px",
                fontFamily: BODY_FONT,
                fontSize: 27,
                color: BRAND.surface,
                opacity: Math.min(1, p) * 0.9,
                transform: `translateX(${(1 - p) * (i % 2 ? 60 : -60)}px)`,
              }}
            >
              {n}
            </div>
          );
        })}
        <div style={{ height: 12 }} />
        <Headline
          text="It is all scattered."
          pop={pop}
          start={34}
          size={92}
          accent={BRAND.red}
          accentFrom={2}
        />
      </Stack>
    </AbsoluteFill>
  );
};

/* ── 3. App reveal (7 beats) ──────────────────────────────────────────── */

export const PulseReveal: React.FC<SceneProps> = ({ duration }) => {
  const { pop, settle, opacity, pulse } = useScene(duration);
  const phone = pop(6, 32, 12);

  return (
    <AbsoluteFill style={{ opacity }}>
      <DarkField drift={0.2} pulse={pulse} />
      <Stack gap={30} justify="flex-start">
        <Kicker progress={settle(0)}>One app</Kicker>
        <Headline text="Everything in one place." pop={pop} start={4} size={74} />
      </Stack>
      <AbsoluteFill
        style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 40 }}
      >
        <Phone progress={phone} activeTab={0} pulse={pulse}>
          <ScreenTitle progress={settle(20)}>Feed</ScreenTitle>
        </Phone>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── Shared feature scaffold ──────────────────────────────────────────── */

const Feature: React.FC<{
  duration: number;
  tab: number;
  kicker: string;
  title: string;
  screen: (settle: (d: number, dur?: number) => number) => React.ReactNode;
}> = ({ duration, tab, kicker, title, screen }) => {
  const { pop, settle, opacity, pulse } = useScene(duration);

  return (
    <AbsoluteFill style={{ opacity }}>
      <DarkField drift={0.1} pulse={pulse} />
      {/*
        Title block pinned to the top, phone pinned to the bottom, sized so the
        two nearly meet. An earlier pass left ~500px of empty field between
        them, which read as a layout bug rather than as breathing room.
      */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "150px 70px 0",
          gap: 14,
          textAlign: "center",
        }}
      >
        <Kicker progress={settle(0)}>{kicker}</Kicker>
        <Headline text={title} pop={pop} start={3} stagger={2} size={58} maxWidth={880} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 34 }}
      >
        <Phone progress={pop(4, 28, 12)} activeTab={tab} pulse={pulse}>
          {screen(settle)}
        </Phone>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── 4. Feed (8 beats) ────────────────────────────────────────────────── */

export const PulseFeed: React.FC<SceneProps> = ({ duration }) => (
  <Feature
    duration={duration}
    tab={0}
    kicker="Feed"
    title="Your campus, not the whole internet."
    screen={(settle) => (
      <>
        <ScreenTitle progress={settle(16)}>Feed</ScreenTitle>
        {[
          { who: "AO", name: "Ada O.", meta: "Computer Science, 300L", text: "Lecture moved to LT2. Pass it on." },
          { who: "KB", name: "Kunle B.", meta: "Mechanical Eng, 200L", text: "Study group tonight, 7pm." },
          { who: "FM", name: "Fatima M.", meta: "Law, 400L", text: "Moot court results are out!" },
          { who: "CE", name: "Chidi E.", meta: "Economics, 100L", text: "Where do we collect matric numbers?" },
          { who: "ZY", name: "Zainab Y.", meta: "Pharmacy, 500L", text: "Clinical postings list is up." },
          { who: "DA", name: "Daniel A.", meta: "Architecture, 200L", text: "Studio review moved to Monday." },
        ].map((p, i) => (
          <Card key={p.name} progress={settle(22 + i * 7)}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
              <Avatar label={p.who} size={40} />
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 21,
                    fontWeight: 800,
                    color: BRAND.ink,
                    letterSpacing: HEADING_TRACKING,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontFamily: BODY_FONT, fontSize: 15, color: BRAND.ink, opacity: 0.55 }}>
                  {p.meta}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: BODY_FONT, fontSize: 18, color: BRAND.ink, textAlign: "left" }}>
              {p.text}
            </div>
          </Card>
        ))}
      </>
    )}
  />
);

/* ── 5. Inbox (8 beats) ───────────────────────────────────────────────── */

export const PulseInbox: React.FC<SceneProps> = ({ duration }) => (
  <Feature
    duration={duration}
    tab={1}
    kicker="Inbox"
    title="Talk to your department, not strangers."
    screen={(settle) => (
      <>
        <ScreenTitle progress={settle(16)}>CSC 300L</ScreenTitle>
        <Bubble progress={settle(22)} text="Assignment 3 submission moved to Friday." />
        <Bubble progress={settle(29)} text="Confirmed by the course rep." />
        <Bubble progress={settle(36)} text="Thank you! Was about to panic." mine />
        <Bubble progress={settle(43)} text="Notes are in Resources already." />
        <Bubble progress={settle(50)} text="You are a lifesaver." mine />
        <Bubble progress={settle(57)} text="Course rep pinned the timetable too." />
        <Bubble progress={settle(64)} text="Finally, one place for all of it." mine />
        <Bubble progress={settle(71)} text="Lab groups posted in Resources." />
        <Bubble progress={settle(78)} text="Adding it to my calendar now." mine />
        <Bubble progress={settle(85)} text="See everyone Friday." />
      </>
    )}
  />
);

/* ── 6. Network (8 beats) ─────────────────────────────────────────────── */

export const PulseNetwork: React.FC<SceneProps> = ({ duration }) => (
  <Feature
    duration={duration}
    tab={2}
    kicker="Network"
    title="Find the people who have been there."
    screen={(settle) => (
      <>
        <ScreenTitle progress={settle(16)}>Network</ScreenTitle>
        {[
          { who: "TA", name: "Tunde A.", meta: "Alumni, Software Engineer" },
          { who: "NE", name: "Ngozi E.", meta: "Alumni, Corporate Law" },
          { who: "SI", name: "Sade I.", meta: "Student, 500L Medicine" },
          { who: "BO", name: "Bola O.", meta: "Alumni, Product Design" },
          { who: "IU", name: "Ifeanyi U.", meta: "Student, 400L Civil Eng" },
          { who: "MA", name: "Maryam A.", meta: "Alumni, Data Analyst" },
          { who: "GC", name: "Gbenga C.", meta: "Student, 300L Accounting" },
        ].map((p, i) => (
          <Card key={p.name} progress={settle(24 + i * 8)} from="right">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar label={p.who} color={i < 2 ? BRAND.accent : BRAND.secondary} size={42} />
              <div style={{ textAlign: "left", flex: 1 }}>
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 21,
                    fontWeight: 800,
                    color: BRAND.ink,
                    letterSpacing: HEADING_TRACKING,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontFamily: BODY_FONT, fontSize: 15, color: BRAND.ink, opacity: 0.55 }}>
                  {p.meta}
                </div>
              </div>
              <div
                style={{
                  padding: "7px 16px",
                  borderRadius: 999,
                  backgroundColor: BRAND.primary,
                  color: BRAND.white,
                  fontFamily: BODY_FONT,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Connect
              </div>
            </div>
          </Card>
        ))}
      </>
    )}
  />
);

/* ── 7. Resources (8 beats) ───────────────────────────────────────────── */

export const PulseResources: React.FC<SceneProps> = ({ duration }) => (
  <Feature
    duration={duration}
    tab={3}
    kicker="Resources"
    title="Past questions that actually exist."
    screen={(settle) => (
      <>
        <ScreenTitle progress={settle(16)}>Resources</ScreenTitle>
        {[
          { t: "CSC 301 Past Questions", s: "PDF - 2019 to 2024" },
          { t: "Organic Chemistry Notes", s: "PDF - 42 pages" },
          { t: "MTH 202 Tutorial Pack", s: "PDF - solved" },
          { t: "Constitutional Law Summary", s: "PDF - 18 pages" },
          { t: "PHY 104 Lab Manual", s: "PDF - 2024 edition" },
          { t: "GST 111 Revision Guide", s: "PDF - 26 pages" },
          { t: "ACC 205 Marking Scheme", s: "PDF - solved" },
        ].map((r, i) => (
          <Card key={r.t} progress={settle(22 + i * 6)}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: BRAND.surface,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BookIcon size={22} color={BRAND.primary} filled />
              </div>
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 19,
                    fontWeight: 800,
                    color: BRAND.ink,
                    letterSpacing: HEADING_TRACKING,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {r.t}
                </div>
                <div style={{ fontFamily: BODY_FONT, fontSize: 15, color: BRAND.ink, opacity: 0.55 }}>
                  {r.s}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </>
    )}
  />
);

/* ── 8. Profile / verification (8 beats) ──────────────────────────────── */

export const PulseVerify: React.FC<SceneProps> = ({ duration }) => (
  <Feature
    duration={duration}
    tab={4}
    kicker="Verified"
    title="Everyone here is who they say they are."
    screen={(settle) => (
      <>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingBottom: 18 }}>
          <div style={{ transform: `scale(${settle(18)})` }}>
            <Avatar label="AO" size={92} />
          </div>
          <div
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 26,
              fontWeight: 900,
              color: BRAND.ink,
              letterSpacing: HEADING_TRACKING,
              opacity: settle(22),
            }}
          >
            Ada Okafor
          </div>
        </div>
        {[
          { t: "University of Lagos", s: "Institution" },
          { t: "Computer Science", s: "Department" },
          { t: "Matric 190591024", s: "Student ID" },
        ].map((v, i) => (
          <Card key={v.t} progress={settle(26 + i * 8)}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 19,
                    fontWeight: 800,
                    color: BRAND.ink,
                    letterSpacing: HEADING_TRACKING,
                  }}
                >
                  {v.t}
                </div>
                <div style={{ fontFamily: BODY_FONT, fontSize: 15, color: BRAND.ink, opacity: 0.55 }}>
                  {v.s}
                </div>
              </div>
              <Tick progress={settle(30 + i * 8)} size={34} />
            </div>
          </Card>
        ))}
      </>
    )}
  />
);

/* ── 9. Rooms (7 beats) ───────────────────────────────────────────────── */

const ROOMS = [
  { name: "aspirant-lounge", open: true },
  { name: "student-network", open: true },
  { name: "alumni-network", open: true },
];

export const PulseRooms: React.FC<SceneProps> = ({ duration }) => {
  const { pop, settle, opacity, pulse } = useScene(duration);

  return (
    <AbsoluteFill style={{ opacity }}>
      <LightField />
      <Stack gap={26}>
        <Kicker progress={settle(0)} color={BRAND.primary}>
          Rooms
        </Kicker>
        <Headline
          text="Rooms that know who belongs."
          pop={pop}
          start={3}
          stagger={2}
          size={70}
          color={BRAND.ink}
          accent={BRAND.secondary}
          accentFrom={3}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", marginTop: 10 }}>
          {ROOMS.map((r, i) => {
            const p = pop(18 + i * 6, 24, 10);
            return (
              <div
                key={r.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  backgroundColor: BRAND.white,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: 14,
                  padding: "20px 24px",
                  opacity: Math.min(1, p),
                  transform: `translateX(${(1 - p) * 50}px) scale(${1 + pulse * 0.008})`,
                }}
              >
                <UsersIcon size={30} color={BRAND.primary} filled />
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 30,
                    fontWeight: 700,
                    color: BRAND.ink,
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  {r.name}
                </div>
                <Tick progress={pop(24 + i * 6)} size={32} />
              </div>
            );
          })}
        </div>
      </Stack>
    </AbsoluteFill>
  );
};

/* ── 10. Roles ladder (8 beats) ───────────────────────────────────────── */

const ROLES = ["Aspirant", "Student", "Alumni"];

export const PulseRoles: React.FC<SceneProps> = ({ duration }) => {
  const { pop, settle, opacity, pulse } = useScene(duration);

  return (
    <AbsoluteFill style={{ opacity }}>
      <DarkField drift={0.35} pulse={pulse} />
      <Stack gap={38}>
        <Kicker progress={settle(0)}>Your account grows up</Kicker>
        <Headline text="Aspirant. Student. Alumni." pop={pop} start={3} stagger={4} size={78} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
          {ROLES.map((r, i) => (
            <React.Fragment key={r}>
              <Chip label={r} progress={pop(22 + i * 8, 24, 9)} filled={i < 2} size={30} />
              {i < ROLES.length - 1 ? (
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 34,
                    color: BRAND.surface,
                    opacity: settle(26 + i * 8) * 0.7,
                  }}
                >
                  &rarr;
                </div>
              ) : null}
            </React.Fragment>
          ))}
        </div>
        <Body progress={settle(48)}>
          Verification unlocks each step. Nobody skips the queue.
        </Body>
      </Stack>
    </AbsoluteFill>
  );
};

/* ── 11. Offline (6 beats) ────────────────────────────────────────────── */

export const PulseOffline: React.FC<SceneProps> = ({ duration }) => {
  const { pop, settle, opacity } = useScene(duration);

  return (
    <AbsoluteFill style={{ opacity }}>
      <DarkField drift={-0.4} />
      <Stack gap={34}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 100 }}>
          {[0.3, 0.55, 0.8, 1].map((h, i) => {
            const on = i < 2;
            const p = pop(2 + i * 4, 20, 12);
            return (
              <div
                key={h}
                style={{
                  width: 30,
                  height: 100 * h * Math.min(1, p),
                  borderRadius: 6,
                  backgroundColor: on ? BRAND.white : "rgba(255,255,255,0.2)",
                }}
              />
            );
          })}
        </div>
        <Headline
          text="Built for a bad network."
          pop={pop}
          start={16}
          size={80}
          accent={BRAND.secondary}
          accentFrom={3}
        />
        <Body progress={settle(38)}>Offline first. It keeps working when the data does not.</Body>
      </Stack>
    </AbsoluteFill>
  );
};

/* ── 12. Scale (7 beats) ──────────────────────────────────────────────── */

export const PulseScale: React.FC<SceneProps> = ({ duration }) => {
  const { pop, settle, opacity, pulse } = useScene(duration);

  return (
    <AbsoluteFill style={{ opacity }}>
      <LightField />
      <Stack gap={20}>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 170,
            fontWeight: 900,
            letterSpacing: HEADING_TRACKING,
            color: BRAND.primary,
            lineHeight: 1,
            opacity: Math.min(1, pop(2, 30, 9)),
            transform: `scale(${0.7 + pop(2, 30, 9) * 0.3 + pulse * 0.03})`,
          }}
        >
          170+
        </div>
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 34,
            color: BRAND.ink,
            opacity: settle(18) * 0.75,
          }}
        >
          institutions across Nigeria
        </div>
        <div style={{ height: 20 }} />
        <Headline
          text="Tens of millions of students. One network."
          pop={pop}
          start={26}
          stagger={2}
          size={62}
          color={BRAND.ink}
          accent={BRAND.secondary}
          accentFrom={5}
        />
      </Stack>
    </AbsoluteFill>
  );
};

/* ── 13. CTA (10 beats) ───────────────────────────────────────────────── */

export const PulseCTA: React.FC<SceneProps> = ({ duration }) => {
  const { pop, settle, opacity, pulse } = useScene(duration);
  const mark = pop(2, 32, 9);

  return (
    <AbsoluteFill style={{ opacity }}>
      <DeepField glow={pulse} />
      <Slam layers={10} lagInFrames={0.4} trailOpacity={0.42}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center", paddingBottom: 420 }}
        >
          <Lockup progress={mark} variant="dark" width={820} pulse={pulse} />
        </AbsoluteFill>
      </Slam>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 34,
          paddingBottom: 280,
        }}
      >
        <Headline text="The time is now." pop={pop} start={30} size={84} />
        <div
          style={{
            padding: "22px 54px",
            borderRadius: 999,
            backgroundColor: BRAND.white,
            color: BRAND.primary,
            fontFamily: HEADING_FONT,
            fontSize: 40,
            fontWeight: 900,
            letterSpacing: HEADING_TRACKING,
            opacity: settle(46),
            transform: `scale(${0.9 + settle(46) * 0.1 + pulse * 0.03})`,
            boxShadow: "0 18px 50px rgba(0,0,0,0.3)",
          }}
        >
          skoolconnect.ng
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
