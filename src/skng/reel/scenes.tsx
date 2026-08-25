import React from "react";
import {
  AbsoluteFill,
  interpolate,
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
} from "../brand";
import { DarkField, LightField, LogoChip } from "../ui";
import {
  Body,
  Chip,
  Kicker,
  MockRow,
  Phone,
  Tick,
  usePop,
  useSettle,
  WordStack,
} from "./ui";

type SceneProps = { duration: number };

/** Cuts are short and hard: this is a scroll-stopping format, not a film. */
const FADE_IN = 5;
const FADE_OUT = 6;

const Stack: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 30,
}) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      padding: "180px 80px 240px",
      gap,
    }}
  >
    {children}
  </AbsoluteFill>
);

const Bubble: React.FC<{
  progress: number;
  text: string;
  rotate: number;
}> = ({ progress, text, rotate }) => (
  <div
    style={{
      padding: "20px 28px",
      borderRadius: 26,
      backgroundColor: BRAND.white,
      color: BRAND.ink,
      fontFamily: BODY_FONT,
      fontSize: 28,
      fontWeight: 500,
      maxWidth: 520,
      opacity: Math.min(1, progress) * 0.96,
      transform: `rotate(${rotate}deg) scale(${0.7 + progress * 0.3})`,
      boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
    }}
  >
    {text}
  </div>
);

/* 01 - Hook ------------------------------------------------------------- */

export const ReelHook: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const drift = interpolate(frame, [0, duration], [0, 1]);

  const bubbles = [
    { t: "anyone has the timetable??", r: -6, d: 0 },
    { t: "is the portal working?", r: 4, d: 5 },
    { t: "which school is better sha", r: -3, d: 10 },
    { t: "who has last year's questions", r: 5, d: 15 },
  ];

  return (
    <AbsoluteFill
      style={{ opacity: sceneOpacity(frame, duration, FADE_IN, FADE_OUT) }}
    >
      <DarkField drift={drift} />
      <Stack gap={26}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          {bubbles.map((b) => (
            <Bubble key={b.t} progress={pop(b.d)} text={b.t} rotate={b.r} />
          ))}
        </div>

        <WordStack
          text="Your academic life is scattered."
          pop={pop}
          start={26}
          size={92}
        />
      </Stack>
    </AbsoluteFill>
  );
};

/* 02 - Problem stack ---------------------------------------------------- */

const PROBLEMS = [
  "Unverified profiles",
  "Rumour-driven choices",
  "Networks that die at graduation",
];

export const ReelProblem: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);

  return (
    <AbsoluteFill
      style={{ opacity: sceneOpacity(frame, duration, FADE_IN, FADE_OUT) }}
    >
      <LightField />
      <Stack gap={26}>
        <Kicker progress={pop(0)} color={BRAND.red}>
          The problem
        </Kicker>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {PROBLEMS.map((p, i) => {
            const e = pop(10 + i * 9);
            return (
              <div
                key={p}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  backgroundColor: BRAND.white,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: BRAND.radius,
                  padding: "26px 34px",
                  opacity: Math.min(1, e),
                  transform: `translateX(${(1 - e) * -60}px) scale(${0.92 + e * 0.08})`,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: BRAND.red,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 44,
                    fontWeight: 800,
                    letterSpacing: HEADING_TRACKING,
                    color: BRAND.ink,
                  }}
                >
                  {p}
                </div>
              </div>
            );
          })}
        </div>
      </Stack>
    </AbsoluteFill>
  );
};

/* 03 - Logo slam -------------------------------------------------------- */

export const ReelLogoSlam: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const settle = useSettle(fps, frame);
  const drift = interpolate(frame, [0, duration], [0, 1]);

  const mark = pop(0, 30, 9);
  const word = settle(14, 26);

  return (
    <AbsoluteFill
      style={{ opacity: sceneOpacity(frame, duration, 3, FADE_OUT) }}
    >
      <DarkField drift={drift} />
      <Stack gap={44}>
        <LogoChip size={330} scale={mark} />
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: HEADING_TRACKING,
            color: BRAND.white,
            clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`,
          }}
        >
          SkoolConnectNG
        </div>
      </Stack>
    </AbsoluteFill>
  );
};

/* 04 - Promise ---------------------------------------------------------- */

export const ReelPromise: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const settle = useSettle(fps, frame);

  return (
    <AbsoluteFill
      style={{ opacity: sceneOpacity(frame, duration, FADE_IN, FADE_OUT) }}
    >
      <LightField />
      <Stack gap={34}>
        <WordStack
          text="One verified network for Nigerian students."
          pop={pop}
          size={96}
          color={BRAND.ink}
          accent={BRAND.primary}
          accentFrom={3}
        />
        <Body progress={settle(24)} color={BRAND.ink}>
          Identity, information and community in one place, built to last
          beyond graduation.
        </Body>
      </Stack>
    </AbsoluteFill>
  );
};

/* Feature scaffold ------------------------------------------------------ */

const FeatureScene: React.FC<
  SceneProps & {
    num: string;
    title: string;
    accentFrom?: number;
    body: string;
    activeTab?: number;
    children: React.ReactNode;
  }
> = ({ duration, num, title, accentFrom, body, activeTab = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const settle = useSettle(fps, frame);
  const drift = interpolate(frame, [0, duration], [0, 1]);

  return (
    <AbsoluteFill
      style={{ opacity: sceneOpacity(frame, duration, FADE_IN, FADE_OUT) }}
    >
      <DarkField drift={drift} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          padding: "150px 70px 120px",
          gap: 20,
        }}
      >
        <Kicker progress={pop(0)}>{num}</Kicker>

        <WordStack
          text={title}
          pop={pop}
          start={4}
          size={80}
          accent={BRAND.surface}
          accentFrom={accentFrom ?? -1}
        />

        <Body progress={settle(18)} size={32}>
          {body}
        </Body>

        <div style={{ marginTop: 30 }}>
          <Phone progress={settle(24, 32)} activeTab={activeTab}>
            {children}
          </Phone>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PhoneHeader: React.FC<{ progress: number; label: string }> = ({
  progress,
  label,
}) => (
  <div
    style={{
      margin: "0 22px 18px",
      fontFamily: MONO_FONT,
      fontSize: 18,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: BRAND.primary,
      opacity: progress * 0.8,
    }}
  >
    {label}
  </div>
);

/* 05 - Verified identity ------------------------------------------------ */

export const ReelIdentity: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const settle = useSettle(fps, frame);

  return (
    <FeatureScene
      duration={duration}
      num="01"
      title="A profile that proves who you are"
      body="One account per human. Verified, portable, and earned through role progression."
      accentFrom={3}
      activeTab={3}
    >
      <PhoneHeader progress={settle(34)} label="My Profile" />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          margin: "0 22px 22px",
          opacity: Math.min(1, settle(38)),
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: "50%",
            backgroundColor: BRAND.accent,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: HEADING_FONT,
              fontSize: 30,
              fontWeight: 900,
              color: BRAND.ink,
              letterSpacing: HEADING_TRACKING,
            }}
          >
            Adaeze O.
          </div>
          <div
            style={{
              fontFamily: BODY_FONT,
              fontSize: 20,
              color: BRAND.ink,
              opacity: 0.6,
            }}
          >
            300L / Computer Science
          </div>
        </div>
        <Tick progress={pop(52, 24, 8)} size={50} />
      </div>

      <MockRow
        progress={settle(56)}
        title="University of Lagos"
        sub="Institution verified"
        trailing={<Tick progress={pop(64, 22, 8)} size={34} />}
      />
      <MockRow
        progress={settle(62)}
        title="Computer Science"
        sub="Department verified"
        trailing={<Tick progress={pop(70, 22, 8)} size={34} />}
        leadingColor={BRAND.primary}
      />
      <MockRow
        progress={settle(68)}
        title="Matric number"
        sub="Confirmed by school"
        trailing={<Tick progress={pop(76, 22, 8)} size={34} />}
        leadingColor={BRAND.accent}
      />
    </FeatureScene>
  );
};

/* 06 - School explorer -------------------------------------------------- */

export const ReelExplorer: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settle = useSettle(fps, frame);

  return (
    <FeatureScene
      duration={duration}
      num="02"
      title="Choose a school on facts, not rumours"
      body="Departments, admission requirements and guides written by real students."
      accentFrom={4}
      activeTab={1}
    >
      <PhoneHeader progress={settle(34)} label="Explore schools" />
      <div
        style={{
          margin: "0 22px 18px",
          padding: "16px 20px",
          borderRadius: 999,
          backgroundColor: BRAND.white,
          border: `1px solid ${BRAND.border}`,
          fontFamily: BODY_FONT,
          fontSize: 20,
          color: BRAND.ink,
          opacity: Math.min(1, settle(38)) * 0.55,
        }}
      >
        Search universities, polytechnics...
      </div>
      <MockRow
        progress={settle(44)}
        title="University of Ibadan"
        sub="Oyo State"
      />
      <MockRow
        progress={settle(50)}
        title="Ahmadu Bello University"
        sub="Kaduna State"
        leadingColor={BRAND.primary}
      />
      <MockRow
        progress={settle(56)}
        title="Obafemi Awolowo University"
        sub="Osun State"
        leadingColor={BRAND.accent}
      />
      <MockRow
        progress={settle(62)}
        title="University of Nigeria, Nsukka"
        sub="Enugu State"
      />
    </FeatureScene>
  );
};

/* 07 - Scoped messaging ------------------------------------------------- */

export const ReelMessaging: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const settle = useSettle(fps, frame);

  const msgs: { t: string; mine: boolean; d: number }[] = [
    { t: "Lab moved to 2pm Thursday", mine: false, d: 40 },
    { t: "Confirmed by the department", mine: false, d: 50 },
    { t: "Adding it to my timetable", mine: true, d: 60 },
    { t: "Notes are in Resources", mine: false, d: 70 },
    { t: "Thanks, got them", mine: true, d: 80 },
  ];

  return (
    <FeatureScene
      duration={duration}
      num="03"
      title="Conversations scoped to your department"
      body="Real-time messaging by school, department and role, so it stays relevant."
      accentFrom={3}
      activeTab={2}
    >
      <PhoneHeader progress={settle(34)} label="CSC 300L Study group" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "0 22px",
        }}
      >
        {msgs.map((m) => {
          const p = pop(m.d, 24, 9);
          return (
            <div
              key={m.t}
              style={{
                alignSelf: m.mine ? "flex-end" : "flex-start",
                maxWidth: "82%",
                padding: "16px 20px",
                borderRadius: 22,
                backgroundColor: m.mine ? BRAND.primary : BRAND.white,
                color: m.mine ? BRAND.white : BRAND.ink,
                border: m.mine ? "none" : `1px solid ${BRAND.border}`,
                fontFamily: BODY_FONT,
                fontSize: 21,
                fontWeight: 500,
                opacity: Math.min(1, p),
                transform: `translateY(${(1 - p) * 20}px) scale(${0.9 + p * 0.1})`,
              }}
            >
              {m.t}
            </div>
          );
        })}
      </div>
    </FeatureScene>
  );
};

/* 08 - Resources -------------------------------------------------------- */

export const ReelResources: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const settle = useSettle(fps, frame);

  return (
    <FeatureScene
      duration={duration}
      num="04"
      title="Past questions and materials that stay put"
      body="Shared study resources and course insights, searchable instead of buried in a chat."
      accentFrom={5}
      activeTab={0}
    >
      <PhoneHeader progress={settle(34)} label="Resources" />
      <MockRow
        progress={settle(40)}
        title="MTH 201 Past questions"
        sub="2019 to 2024, 6 files"
        trailing={<Tick progress={pop(50, 22, 8)} size={34} />}
      />
      <MockRow
        progress={settle(46)}
        title="CSC 305 Lecture notes"
        sub="Updated last week"
        trailing={<Tick progress={pop(56, 22, 8)} size={34} />}
        leadingColor={BRAND.primary}
      />
      <MockRow
        progress={settle(52)}
        title="PHY 102 Lab manual"
        sub="Verified by department"
        trailing={<Tick progress={pop(62, 22, 8)} size={34} />}
        leadingColor={BRAND.accent}
      />
      <MockRow
        progress={settle(58)}
        title="GST 111 Study group"
        sub="42 members"
        leadingColor={BRAND.secondary}
      />
      <MockRow
        progress={settle(64)}
        title="CHM 101 Tutorial series"
        sub="12 sessions"
        leadingColor={BRAND.primary}
      />
    </FeatureScene>
  );
};

/* 09 - Mentorship ------------------------------------------------------- */

export const ReelMentorship: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settle = useSettle(fps, frame);

  const steps = [
    ["Aspirant", "Choosing a school"],
    ["Student", "Verified, in a department"],
    ["Alumni", "Still connected"],
    ["Mentor", "Guiding the next intake"],
  ];

  return (
    <FeatureScene
      duration={duration}
      num="05"
      title="Your network survives graduation"
      body="Role progression keeps alumni in the loop, so mentorship continues instead of ending."
      accentFrom={3}
      activeTab={3}
    >
      <PhoneHeader progress={settle(34)} label="Role progression" />
      <div style={{ padding: "0 22px" }}>
        {steps.map(([role, sub], i) => {
          const p = settle(40 + i * 8);
          const active = i < 3;
          return (
            <div
              key={role}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 16,
                opacity: Math.min(1, p),
                transform: `translateX(${(1 - p) * 34}px)`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: active ? BRAND.secondary : BRAND.border,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  backgroundColor: BRAND.white,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: BRAND.radius,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 26,
                    fontWeight: 800,
                    color: BRAND.ink,
                    letterSpacing: HEADING_TRACKING,
                  }}
                >
                  {role}
                </div>
                <div
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 18,
                    color: BRAND.ink,
                    opacity: 0.6,
                  }}
                >
                  {sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FeatureScene>
  );
};

/* 10 - Offline-first ---------------------------------------------------- */

export const ReelOffline: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const settle = useSettle(fps, frame);

  return (
    <AbsoluteFill
      style={{ opacity: sceneOpacity(frame, duration, FADE_IN, FADE_OUT) }}
    >
      <LightField />
      <Stack gap={30}>
        <Kicker progress={pop(0)} color={BRAND.primary}>
          Built for Nigeria
        </Kicker>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          {[0, 1, 2, 3].map((i) => {
            const p = pop(8 + i * 5, 26, 9);
            const on = i < 2;
            return (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40 + i * 34,
                  borderRadius: 10,
                  backgroundColor: on ? BRAND.primary : BRAND.border,
                  transform: `scaleY(${p})`,
                  transformOrigin: "bottom",
                }}
              />
            );
          })}
        </div>

        <WordStack
          text="Works on a bad network."
          pop={pop}
          start={26}
          size={92}
          color={BRAND.ink}
          accent={BRAND.primary}
          accentFrom={2}
        />
        <Body progress={settle(42)} color={BRAND.ink}>
          Offline is assumed, not an edge case. It caches, syncs in the
          background, and degrades gracefully.
        </Body>
      </Stack>
    </AbsoluteFill>
  );
};

/* 11 - Who it is for ---------------------------------------------------- */

export const ReelAudience: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const drift = interpolate(frame, [0, duration], [0, 1]);

  const groups = ["Students", "Aspirants", "Institutions", "Alumni"];

  return (
    <AbsoluteFill
      style={{ opacity: sceneOpacity(frame, duration, FADE_IN, FADE_OUT) }}
    >
      <DarkField drift={drift} />
      <Stack gap={40}>
        <WordStack text="One network. Four roles." pop={pop} size={86} />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "center",
            maxWidth: 900,
          }}
        >
          {groups.map((g, i) => (
            <Chip
              key={g}
              label={g}
              progress={pop(18 + i * 8, 26, 9)}
              filled={i % 2 === 0}
            />
          ))}
        </div>
      </Stack>
    </AbsoluteFill>
  );
};

/* 12 - Scale punch ------------------------------------------------------ */

export const ReelPunch: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const settle = useSettle(fps, frame);
  const drift = interpolate(frame, [0, duration], [0, 1]);

  return (
    <AbsoluteFill
      style={{ opacity: sceneOpacity(frame, duration, FADE_IN, FADE_OUT) }}
    >
      <DarkField drift={drift} />
      <Stack gap={34}>
        <WordStack text="Tens of millions of students." pop={pop} size={82} />
        <WordStack
          text="One network."
          pop={pop}
          start={16}
          size={112}
          color={BRAND.surface}
        />
        <Body progress={settle(34)}>
          Academic infrastructure that compounds in value as more students,
          schools and alumni join.
        </Body>
      </Stack>
    </AbsoluteFill>
  );
};

/* 13 - Call to action --------------------------------------------------- */

export const ReelCTA: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(fps, frame);
  const settle = useSettle(fps, frame);
  const drift = interpolate(frame, [0, duration], [0, 1]);

  const mark = pop(0, 32, 10);
  const punch = settle(22, 30);
  const url = settle(44, 28);

  return (
    <AbsoluteFill
      style={{ opacity: sceneOpacity(frame, duration, FADE_IN, 22) }}
    >
      <DarkField drift={drift} />
      <Stack gap={36}>
        <LogoChip size={260} scale={mark} />

        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 104,
            fontWeight: 900,
            letterSpacing: HEADING_TRACKING,
            color: BRAND.white,
            textAlign: "center",
            clipPath: `inset(0 ${(1 - punch) * 100}% 0 0)`,
          }}
        >
          The time is now.
        </div>

        <div
          style={{
            padding: "22px 54px",
            borderRadius: 999,
            backgroundColor: BRAND.white,
            fontFamily: MONO_FONT,
            fontSize: 34,
            letterSpacing: 3,
            color: BRAND.primary,
            opacity: Math.min(1, url),
            transform: `scale(${0.86 + url * 0.14})`,
          }}
        >
          skoolconnect.ng
        </div>
      </Stack>
    </AbsoluteFill>
  );
};
