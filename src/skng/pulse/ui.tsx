import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile } from "remotion";
import {
  BODY_FONT,
  BRAND,
  HEADING_FONT,
  HEADING_TRACKING,
  MONO_FONT,
} from "../brand";
import { CheckIcon, TABS, UsersIcon } from "./icons";

/** The real lockups. Both are ~97% transparent, so they need no plate. */
export const LOCKUP_DARK = staticFile("skng-lockup-dark.png");
export const LOCKUP_LIGHT = staticFile("skng-lockup-light.png");

export const usePop = (fps: number, frame: number) =>
  React.useCallback(
    (delay: number, durationInFrames = 24, damping = 9) =>
      spring({
        frame: frame - delay,
        fps,
        config: { damping, mass: 0.55 },
        durationInFrames,
      }),
    [fps, frame],
  );

export const useSettle = (fps: number, frame: number) =>
  React.useCallback(
    (delay: number, durationInFrames = 26) =>
      spring({
        frame: frame - delay,
        fps,
        config: { damping: 200 },
        durationInFrames,
      }),
    [fps, frame],
  );

/* ── Type ─────────────────────────────────────────────────────────────── */

export const Kicker: React.FC<{
  children: React.ReactNode;
  progress: number;
  color?: string;
  // Surface, not secondary: BRAND.secondary against the dark field is almost
  // the same value, and the kicker reads as a smudge rather than as type.
}> = ({ children, progress, color = BRAND.surface }) => (
  <div
    style={{
      fontFamily: MONO_FONT,
      fontSize: 26,
      letterSpacing: 8,
      textTransform: "uppercase",
      color,
      opacity: progress * 0.92,
      transform: `translateY(${(1 - progress) * 14}px)`,
    }}
  >
    {children}
  </div>
);

export const Headline: React.FC<{
  text: string;
  pop: (d: number, dur?: number, damp?: number) => number;
  start?: number;
  stagger?: number;
  size?: number;
  color?: string;
  accent?: string;
  accentFrom?: number;
  align?: "left" | "center";
  maxWidth?: number;
}> = ({
  text,
  pop,
  start = 0,
  stagger = 3,
  size = 96,
  color = BRAND.white,
  accent,
  accentFrom = -1,
  align = "center",
  maxWidth = 900,
}) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "0 18px",
      justifyContent: align === "center" ? "center" : "flex-start",
      maxWidth,
    }}
  >
    {text.split(" ").map((w, i) => {
      const p = pop(start + i * stagger);
      const isAccent = accentFrom >= 0 && i >= accentFrom;
      return (
        <span
          key={`${w}-${i}`}
          style={{
            fontFamily: HEADING_FONT,
            fontSize: size,
            fontWeight: 900,
            letterSpacing: HEADING_TRACKING,
            lineHeight: 1.05,
            color: isAccent && accent ? accent : color,
            opacity: Math.min(1, p),
            transform: `translateY(${(1 - p) * 46}px) scale(${0.84 + p * 0.16})`,
          }}
        >
          {w}
        </span>
      );
    })}
  </div>
);

export const Body: React.FC<{
  children: React.ReactNode;
  progress: number;
  color?: string;
  size?: number;
}> = ({ children, progress, color = BRAND.surface, size = 34 }) => (
  <div
    style={{
      fontFamily: BODY_FONT,
      fontSize: size,
      fontWeight: 500,
      lineHeight: 1.5,
      textAlign: "center",
      maxWidth: 820,
      color,
      opacity: progress * 0.82,
      transform: `translateY(${(1 - progress) * 16}px)`,
    }}
  >
    {children}
  </div>
);

/* ── Fields ───────────────────────────────────────────────────────────── */

export const DarkField: React.FC<{ drift?: number; pulse?: number }> = ({
  drift = 0,
  pulse = 0,
}) => (
  <>
    <AbsoluteFill style={{ backgroundColor: BRAND.primary }} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(58% 48% at ${26 + drift * 8}% ${20 + drift * 6}%, ${BRAND.secondary} 0%, rgba(22,85,56,0) 68%)`,
        opacity: 0.72 + pulse * 0.18,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(52% 46% at ${78 - drift * 8}% ${80 - drift * 5}%, ${BRAND.accent} 0%, rgba(22,85,56,0) 70%)`,
        opacity: 0.78,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(78% 70% at 50% 50%, rgba(0,0,0,0) 42%, ${BRAND.ink} 100%)`,
        opacity: 0.7,
      }}
    />
  </>
);

/**
 * Near-black field for the logo moments.
 *
 * The dark lockup's wordmark is white but its mark keeps the green gradient,
 * which sits at almost the same value as BRAND.primary — on the standard dark
 * field the map simply disappears. Dropping the ground to near-black gives
 * both halves of the lockup something to read against.
 */
export const DeepField: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <>
    <AbsoluteFill style={{ backgroundColor: "#08201a" }} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(58% 42% at 50% 46%, ${BRAND.accent} 0%, rgba(8,32,26,0) 70%)`,
        opacity: 0.4 + glow * 0.28,
      }}
    />
    <AbsoluteFill
      style={{
        background: "radial-gradient(86% 76% at 50% 50%, rgba(0,0,0,0) 32%, #04120e 100%)",
        opacity: 0.88,
      }}
    />
  </>
);

export const LightField: React.FC = () => (
  <>
    <AbsoluteFill style={{ backgroundColor: BRAND.surface }} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(62% 50% at 76% 14%, ${BRAND.white} 0%, rgba(228,244,241,0) 62%)`,
        opacity: 0.92,
      }}
    />
  </>
);

/* ── The app's own tab bar ────────────────────────────────────────────── */

/**
 * Reproduces `BottomNav`: five cells, Network's cell left empty because the
 * FAB is absolutely positioned above the bar on a gradient disc with a blurred
 * glow behind it. Active tabs render the filled icon in primary; inactive ones
 * render the stroked icon at 45% foreground.
 */
export const TabBar: React.FC<{ active: number; pulse?: number }> = ({
  active,
  pulse = 0,
}) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
    {/* Network FAB */}
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: -30,
        transform: "translateX(-50%)",
        zIndex: 3,
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            background: `linear-gradient(to top right, ${BRAND.primary}, ${BRAND.secondary}, ${BRAND.accent})`,
            filter: "blur(10px)",
            opacity: 0.6 + pulse * 0.3,
          }}
        />
        <div
          style={{
            position: "relative",
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: `linear-gradient(to top right, ${BRAND.primary}, ${BRAND.secondary}, ${BRAND.accent})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 28px rgba(22,85,56,0.35)",
            transform: `scale(${1 + pulse * 0.06})`,
            ...(active === 2
              ? { outline: `3px solid rgba(255,255,255,0.4)`, outlineOffset: 2 }
              : {}),
          }}
        >
          <UsersIcon size={30} color={BRAND.white} filled />
        </div>
      </div>
    </div>

    <div
      style={{
        height: 96,
        backgroundColor: BRAND.white,
        borderTop: `1px solid ${BRAND.border}`,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        alignItems: "center",
        paddingBottom: 12,
      }}
    >
      {TABS.map((t, i) => {
        if (t.isFab) return <div key={t.label} />;
        const on = i === active;
        const color = on ? BRAND.primary : "rgba(26,55,63,0.45)";
        const Icon = t.Icon;
        return (
          <div
            key={t.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Icon filled={on} size={30} color={color} />
            <div
              style={{
                fontFamily: BODY_FONT,
                fontSize: 15,
                fontWeight: on ? 700 : 500,
                color,
              }}
            >
              {t.label}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/** Phone shell. Content sits above the tab bar. */
export const Phone: React.FC<{
  progress: number;
  children: React.ReactNode;
  activeTab?: number;
  pulse?: number;
  width?: number;
  height?: number;
}> = ({
  progress,
  children,
  activeTab = 0,
  pulse = 0,
  width = 644,
  height = 1310,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 58,
      backgroundColor: BRAND.white,
      border: "10px solid rgba(255,255,255,0.9)",
      boxShadow: "0 44px 96px rgba(0,0,0,0.38)",
      overflow: "hidden",
      position: "relative",
      opacity: Math.min(1, progress),
      transform: `translateY(${(1 - progress) * 76}px) scale(${0.9 + progress * 0.1})`,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: 136,
        height: 26,
        borderRadius: 20,
        backgroundColor: BRAND.ink,
        opacity: 0.85,
        zIndex: 4,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: BRAND.surface,
        paddingTop: 62,
        paddingBottom: 104,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
    <TabBar active={activeTab} pulse={pulse} />
  </div>
);

/* ── Content pieces ───────────────────────────────────────────────────── */

export const ScreenTitle: React.FC<{ children: React.ReactNode; progress: number }> = ({
  children,
  progress,
}) => (
  <div
    style={{
      fontFamily: HEADING_FONT,
      fontSize: 30,
      fontWeight: 900,
      letterSpacing: HEADING_TRACKING,
      color: BRAND.ink,
      padding: "6px 24px 16px",
      opacity: progress,
      transform: `translateY(${(1 - progress) * 12}px)`,
    }}
  >
    {children}
  </div>
);

export const Card: React.FC<{
  progress: number;
  children: React.ReactNode;
  from?: "left" | "right" | "bottom";
}> = ({ progress, children, from = "left" }) => {
  const d = (1 - progress) * 44;
  const t =
    from === "left"
      ? `translateX(${-d}px)`
      : from === "right"
        ? `translateX(${d}px)`
        : `translateY(${d}px)`;
  return (
    <div
      style={{
        backgroundColor: BRAND.white,
        borderRadius: BRAND.radius,
        border: `1px solid ${BRAND.border}`,
        padding: "20px 20px",
        margin: "0 24px 15px",
        opacity: Math.min(1, progress),
        transform: t,
      }}
    >
      {children}
    </div>
  );
};

export const Avatar: React.FC<{ label: string; color?: string; size?: number }> = ({
  label,
  color = BRAND.secondary,
  size = 44,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: color,
      color: BRAND.white,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: HEADING_FONT,
      fontWeight: 800,
      fontSize: size * 0.38,
      flexShrink: 0,
    }}
  >
    {label}
  </div>
);

export const Tick: React.FC<{ progress: number; size?: number }> = ({
  progress,
  size = 40,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: BRAND.secondary,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${progress})`,
      flexShrink: 0,
    }}
  >
    <CheckIcon size={size * 0.55} color={BRAND.white} />
  </div>
);

export const Chip: React.FC<{
  label: string;
  progress: number;
  filled?: boolean;
  size?: number;
}> = ({ label, progress, filled = false, size = 34 }) => (
  <div
    style={{
      padding: "14px 28px",
      borderRadius: 999,
      backgroundColor: filled ? BRAND.white : "rgba(255,255,255,0.1)",
      border: `2px solid ${filled ? BRAND.white : "rgba(255,255,255,0.32)"}`,
      color: filled ? BRAND.primary : BRAND.white,
      fontFamily: HEADING_FONT,
      fontSize: size,
      fontWeight: 800,
      letterSpacing: HEADING_TRACKING,
      opacity: Math.min(1, progress),
      transform: `scale(${0.82 + progress * 0.18})`,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);

/**
 * Content box of each lockup as a fraction of its 3375x3375 canvas, measured
 * by decoding the PNGs and taking the bounding box of every pixel with alpha.
 *
 * Both files are ~97% empty. Setting `width` on the <Img> directly sizes the
 * transparent canvas, so the visible logo lands at roughly half the number you
 * asked for. These fractions let the component size the artwork instead.
 */
const BBOX = {
  dark: { x: 0.1985, y: 0.3873, w: 0.5668, h: 0.1867 },
  light: { x: 0.2708, y: 0.4332, w: 0.4311, h: 0.1419 },
} as const;

/**
 * The real lockup, cropped to its artwork and floating with no plate behind
 * it. `width` is the width of the logo itself.
 */
export const Lockup: React.FC<{
  progress: number;
  variant?: "dark" | "light";
  width?: number;
  pulse?: number;
}> = ({ progress, variant = "dark", width = 760, pulse = 0 }) => {
  const box = BBOX[variant];
  const canvas = width / box.w;
  const height = (width * box.h) / box.w;

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        opacity: Math.min(1, progress),
        transform: `scale(${0.86 + progress * 0.14 + pulse * 0.02})`,
      }}
    >
      <Img
        src={variant === "dark" ? LOCKUP_DARK : LOCKUP_LIGHT}
        style={{
          position: "absolute",
          width: canvas,
          height: canvas,
          left: -box.x * canvas,
          top: -box.y * canvas,
          maxWidth: "none",
        }}
      />
    </div>
  );
};

/** Stacked message bubbles for the Inbox screen. */
export const Bubble: React.FC<{
  progress: number;
  text: string;
  mine?: boolean;
}> = ({ progress, text, mine = false }) => (
  <div
    style={{
      display: "flex",
      justifyContent: mine ? "flex-end" : "flex-start",
      margin: "0 22px 10px",
      opacity: Math.min(1, progress),
      transform: `translateY(${(1 - progress) * 26}px) scale(${0.94 + progress * 0.06})`,
    }}
  >
    <div
      style={{
        maxWidth: "78%",
        backgroundColor: mine ? BRAND.primary : BRAND.white,
        color: mine ? BRAND.white : BRAND.ink,
        border: mine ? "none" : `1px solid ${BRAND.border}`,
        borderRadius: 18,
        borderBottomRightRadius: mine ? 5 : 18,
        borderBottomLeftRadius: mine ? 18 : 5,
        padding: "12px 16px",
        fontFamily: BODY_FONT,
        fontSize: 19,
        lineHeight: 1.35,
      }}
    >
      {text}
    </div>
  </div>
);

export const barScale = (p: number) =>
  interpolate(p, [0, 1], [0, 1], { extrapolateRight: "clamp" });
