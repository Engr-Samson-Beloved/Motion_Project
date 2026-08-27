import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY_FONT, BRAND, HEADING_FONT, HEADING_TRACKING, sceneOpacity } from "../brand";
import { beatPulse } from "../../lib/cinema";
import { Slam } from "../../lib/cinema/blur";
import type { Item, ScriptScene } from "./script";
import { framesFor } from "./script";
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
 * Renderers for the script.
 *
 * Every scene takes a ScriptScene and draws it. No copy, no durations and no
 * list content live in this file — those are in `script.ts`, so the piece can
 * be rewritten and re-timed without touching React.
 */

export type SceneProps = { scene: ScriptScene };

const FADE_IN = 4;
const FADE_OUT = 5;

const Stack: React.FC<{
  children: React.ReactNode;
  gap?: number;
  justify?: "center" | "flex-start";
  /** Override for scenes with few elements, which otherwise centre into a
   *  narrow band with large dead margins above and below. */
  padding?: string;
}> = ({ children, gap = 32, justify = "center", padding = "170px 70px 210px" }) => (
  <AbsoluteFill
    style={{
      justifyContent: justify,
      alignItems: "center",
      gap,
      padding,
      textAlign: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);

const useScene = (scene: ScriptScene) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = framesFor(scene);
  return {
    frame,
    fps,
    duration,
    pop: usePop(fps, frame),
    settle: useSettle(fps, frame),
    opacity: sceneOpacity(frame, duration, FADE_IN, FADE_OUT),
    pulse: beatPulse(frame, fps, 3.6),
  };
};

/* ── Item renderer ────────────────────────────────────────────────────── */

const rowLabel = (title: string, sub?: string) => (
  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
    <div
      style={{
        fontFamily: HEADING_FONT,
        fontSize: 20,
        fontWeight: 800,
        color: BRAND.ink,
        letterSpacing: HEADING_TRACKING,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {title}
    </div>
    {sub ? (
      <div
        style={{
          fontFamily: BODY_FONT,
          fontSize: 15,
          color: BRAND.ink,
          opacity: 0.55,
          marginTop: 2,
        }}
      >
        {sub}
      </div>
    ) : null}
  </div>
);

const ItemView: React.FC<{ item: Item; progress: number; tickProgress: number }> = ({
  item,
  progress,
  tickProgress,
}) => {
  switch (item.kind) {
    case "bubble":
      return <Bubble progress={progress} text={item.text} mine={item.mine} />;

    case "post":
      return (
        <Card progress={progress}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <Avatar label={item.who} size={40} />
            {rowLabel(item.name, item.meta)}
          </div>
          <div
            style={{
              fontFamily: BODY_FONT,
              fontSize: 18,
              color: BRAND.ink,
              textAlign: "left",
            }}
          >
            {item.text}
          </div>
        </Card>
      );

    case "person":
      return (
        <Card progress={progress} from="right">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar
              label={item.who}
              color={item.alum ? BRAND.accent : BRAND.secondary}
              size={42}
            />
            {rowLabel(item.name, item.meta)}
            <div
              style={{
                padding: "7px 16px",
                borderRadius: 999,
                backgroundColor: BRAND.primary,
                color: BRAND.white,
                fontFamily: BODY_FONT,
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              Connect
            </div>
          </div>
        </Card>
      );

    case "resource":
      return (
        <Card progress={progress}>
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
            {rowLabel(item.title, item.sub)}
          </div>
        </Card>
      );

    case "verify":
      return (
        <Card progress={progress}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {rowLabel(item.title, item.sub)}
            <Tick progress={tickProgress} size={34} />
          </div>
        </Card>
      );
  }
};

/* ── Feature: anything that shows a phone ─────────────────────────────── */

/** Bubbles arrive faster than cards; a chat that trickles reads as lag. */
const stepFor = (item: Item | undefined) => (item?.kind === "bubble" ? 6 : 7);

export const PulseFeature: React.FC<SceneProps> = ({ scene }) => {
  const { pop, settle, opacity, pulse } = useScene(scene);
  const items = scene.items ?? [];
  const step = stepFor(items[0]);

  return (
    <AbsoluteFill style={{ opacity }}>
      <DarkField drift={0.1} pulse={pulse} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "150px 70px 0",
          gap: 14,
          textAlign: "center",
        }}
      >
        {scene.kicker ? <Kicker progress={settle(0)}>{scene.kicker}</Kicker> : null}
        {scene.title ? (
          <Headline
            text={scene.title}
            pop={pop}
            start={3}
            stagger={2}
            size={58}
            maxWidth={880}
            accent={BRAND.secondary}
            accentFrom={scene.titleAccentFrom ?? -1}
          />
        ) : null}
      </AbsoluteFill>

      <AbsoluteFill
        style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 34 }}
      >
        <Phone progress={pop(4, 28, 12)} activeTab={scene.tab ?? 0} pulse={pulse}>
          {scene.profile ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                paddingBottom: 18,
              }}
            >
              <div style={{ transform: `scale(${settle(18)})` }}>
                <Avatar label={scene.profile.initials} size={92} />
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
                {scene.profile.name}
              </div>
            </div>
          ) : (
            <ScreenTitle progress={settle(16)}>{scene.screen ?? ""}</ScreenTitle>
          )}

          {items.map((item, i) => (
            <ItemView
              key={i}
              item={item}
              progress={settle(22 + i * step)}
              tickProgress={settle(26 + i * step)}
            />
          ))}
        </Phone>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── Ignition ─────────────────────────────────────────────────────────── */

export const PulseIgnition: React.FC<SceneProps> = ({ scene }) => {
  const { pop, settle, opacity, pulse } = useScene(scene);
  const enter = pop(2, 30, 8);
  const line = settle(30);

  return (
    <AbsoluteFill style={{ opacity }}>
      <DeepField glow={pulse} />
      {/*
        Slam sits directly in the scene, not inside Stack. Trail stacks its
        layers by rendering the children repeatedly, which only composites
        correctly when they are absolutely positioned - dropping it into a flex
        column would lay out fourteen copies in the flow instead.
      */}
      <Slam layers={14} lagInFrames={0.45} trailOpacity={0.5}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Lockup progress={enter} variant="dark" width={860} pulse={pulse} />
        </AbsoluteFill>
      </Slam>
      <AbsoluteFill
        style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}
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
          {scene.tagline}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── Hook ─────────────────────────────────────────────────────────────── */

export const PulseHook: React.FC<SceneProps> = ({ scene }) => {
  const { pop, opacity } = useScene(scene);
  const lines = scene.lines ?? [];

  return (
    <AbsoluteFill style={{ opacity }}>
      <DarkField drift={-0.3} />
      <Stack gap={18}>
        {lines.map((n, i) => {
          const p = pop(2 + i * 5, 22, 11);
          return (
            <div
              key={n}
              style={{
                alignSelf: i % 2 ? "flex-end" : "flex-start",
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 18,
                padding: "18px 24px",
                fontFamily: BODY_FONT,
                fontSize: 30,
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
        {scene.title ? (
          <Headline
            text={scene.title}
            pop={pop}
            start={34}
            size={92}
            accent={BRAND.red}
            accentFrom={scene.titleAccentFrom ?? -1}
          />
        ) : null}
      </Stack>
    </AbsoluteFill>
  );
};

/* ── Rooms ────────────────────────────────────────────────────────────── */

export const PulseRooms: React.FC<SceneProps> = ({ scene }) => {
  const { pop, settle, opacity, pulse } = useScene(scene);
  const rooms = scene.rooms ?? [];

  return (
    <AbsoluteFill style={{ opacity }}>
      <LightField />
      <Stack gap={30} padding="130px 64px 150px">
        {scene.kicker ? (
          <Kicker progress={settle(0)} color={BRAND.primary}>
            {scene.kicker}
          </Kicker>
        ) : null}
        {scene.title ? (
          <Headline
            text={scene.title}
            pop={pop}
            start={3}
            stagger={2}
            size={78}
            color={BRAND.ink}
            accent={BRAND.secondary}
            accentFrom={scene.titleAccentFrom ?? -1}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: "100%",
            marginTop: 6,
          }}
        >
          {rooms.map((r, i) => {
            const p = pop(18 + i * 6, 24, 10);
            return (
              <div
                key={r.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  backgroundColor: BRAND.white,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: 16,
                  padding: "26px 28px",
                  boxShadow: "0 10px 30px rgba(26,55,63,0.08)",
                  opacity: Math.min(1, p),
                  transform: `translateX(${(1 - p) * 50}px) scale(${1 + pulse * 0.008})`,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 14,
                    backgroundColor: BRAND.surface,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <UsersIcon size={32} color={BRAND.primary} filled />
                </div>
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 34,
                      fontWeight: 700,
                      color: BRAND.ink,
                    }}
                  >
                    {r.name}
                  </div>
                  <div
                    style={{
                      fontFamily: BODY_FONT,
                      fontSize: 21,
                      color: BRAND.ink,
                      opacity: 0.55,
                      marginTop: 4,
                    }}
                  >
                    {r.who}
                  </div>
                </div>
                <Tick progress={pop(24 + i * 6)} size={40} />
              </div>
            );
          })}
        </div>
        {scene.body ? (
          <Body progress={settle(46)} color={BRAND.ink} size={30}>
            {scene.body}
          </Body>
        ) : null}
      </Stack>
    </AbsoluteFill>
  );
};

/* ── Roles ────────────────────────────────────────────────────────────── */

export const PulseRoles: React.FC<SceneProps> = ({ scene }) => {
  const { pop, settle, opacity, pulse } = useScene(scene);
  const chips = scene.chips ?? [];

  return (
    <AbsoluteFill style={{ opacity }}>
      <DarkField drift={0.35} pulse={pulse} />
      <Stack gap={38}>
        {scene.kicker ? <Kicker progress={settle(0)}>{scene.kicker}</Kicker> : null}
        {scene.title ? (
          <Headline text={scene.title} pop={pop} start={3} stagger={4} size={78} />
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
          {chips.map((r, i) => (
            <React.Fragment key={r}>
              <Chip
                label={r}
                progress={pop(22 + i * 8, 24, 9)}
                filled={i < chips.length - 1}
                size={30}
              />
              {i < chips.length - 1 ? (
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
        {scene.body ? <Body progress={settle(48)}>{scene.body}</Body> : null}
      </Stack>
    </AbsoluteFill>
  );
};

/* ── Offline ──────────────────────────────────────────────────────────── */

export const PulseOffline: React.FC<SceneProps> = ({ scene }) => {
  const { pop, settle, opacity, pulse } = useScene(scene);
  const lit = scene.barsLit ?? 2;
  const status = scene.status ?? [];

  return (
    <AbsoluteFill style={{ opacity }}>
      <DarkField drift={-0.4} />
      <Stack gap={40} padding="140px 64px 150px">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 210 }}>
          {[0.34, 0.56, 0.78, 1].map((h, i) => {
            const on = i < lit;
            const p = pop(2 + i * 4, 20, 12);
            return (
              <div
                key={h}
                style={{
                  width: 58,
                  height: 210 * h * Math.min(1, p),
                  borderRadius: 12,
                  backgroundColor: on ? BRAND.white : "rgba(255,255,255,0.16)",
                }}
              />
            );
          })}
        </div>

        {scene.title ? (
          <Headline
            text={scene.title}
            pop={pop}
            start={14}
            size={84}
            accentFrom={scene.titleAccentFrom ?? -1}
          />
        ) : null}

        {/*
          The claim needs evidence. Two dead signal bars and a sentence is an
          assertion; naming what survives the outage is the product working.
        */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}
        >
          {status.map((s, i) => {
            const p = pop(26 + i * 6, 22, 10);
            return (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  backgroundColor: "rgba(255,255,255,0.09)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 14,
                  padding: "20px 26px",
                  opacity: Math.min(1, p),
                  transform: `translateY(${(1 - p) * 26}px) scale(${1 + pulse * 0.006})`,
                }}
              >
                <Tick progress={pop(30 + i * 6)} size={38} />
                <div
                  style={{
                    fontFamily: HEADING_FONT,
                    fontSize: 32,
                    fontWeight: 800,
                    letterSpacing: HEADING_TRACKING,
                    color: BRAND.white,
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 24,
                    fontWeight: 600,
                    color: BRAND.surface,
                    opacity: 0.72,
                  }}
                >
                  {s.state}
                </div>
              </div>
            );
          })}
        </div>

        {scene.body ? <Body progress={settle(44)}>{scene.body}</Body> : null}
      </Stack>
    </AbsoluteFill>
  );
};

/* ── Scale ────────────────────────────────────────────────────────────── */

export const PulseScale: React.FC<SceneProps> = ({ scene }) => {
  const { pop, settle, opacity, pulse } = useScene(scene);
  const grow = pop(2, 30, 9);

  return (
    <AbsoluteFill style={{ opacity }}>
      <LightField />
      <Stack gap={20}>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 190,
            fontWeight: 900,
            letterSpacing: HEADING_TRACKING,
            color: BRAND.primary,
            lineHeight: 1,
            opacity: Math.min(1, grow),
            transform: `scale(${0.7 + grow * 0.3 + pulse * 0.03})`,
          }}
        >
          {scene.stat?.value}
        </div>
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 34,
            color: BRAND.ink,
            opacity: settle(18) * 0.75,
          }}
        >
          {scene.stat?.label}
        </div>
        <div style={{ height: 20 }} />
        {scene.title ? (
          <Headline
            text={scene.title}
            pop={pop}
            start={26}
            stagger={2}
            size={62}
            color={BRAND.ink}
            accent={BRAND.secondary}
            accentFrom={scene.titleAccentFrom ?? -1}
          />
        ) : null}
      </Stack>
    </AbsoluteFill>
  );
};

/* ── CTA ──────────────────────────────────────────────────────────────── */

export const PulseCTA: React.FC<SceneProps> = ({ scene }) => {
  const { pop, settle, opacity, pulse } = useScene(scene);
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
        {scene.title ? (
          <Headline text={scene.title} pop={pop} start={30} size={84} />
        ) : null}
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
          {scene.cta}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Which renderer draws which scene.
 *
 * Anything not named here falls through to PulseFeature, which is the phone
 * layout - so adding a new product screen to the script needs no code at all,
 * only an entry with `tab`, `screen` and `items`.
 */
export const RENDERERS: Record<string, React.FC<SceneProps>> = {
  ignition: PulseIgnition,
  hook: PulseHook,
  rooms: PulseRooms,
  roles: PulseRoles,
  offline: PulseOffline,
  scale: PulseScale,
  cta: PulseCTA,
};

export const rendererFor = (scene: ScriptScene): React.FC<SceneProps> =>
  RENDERERS[scene.id] ?? PulseFeature;
