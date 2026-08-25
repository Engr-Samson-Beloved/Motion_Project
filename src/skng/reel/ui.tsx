import React from "react";
import { spring } from "remotion";
import {
  BODY_FONT,
  BRAND,
  HEADING_FONT,
  HEADING_TRACKING,
  MONO_FONT,
} from "../brand";

/**
 * Vertical-format building blocks (1080x1920). Springs here run deliberately
 * springy — low damping gives the overshoot that makes a cut feel like a hit
 * rather than a fade.
 */

export const usePop = (fps: number, frame: number) =>
  React.useCallback(
    (delay: number, durationInFrames = 26, damping = 10) =>
      spring({
        frame: frame - delay,
        fps,
        config: { damping, mass: 0.6 },
        durationInFrames,
      }),
    [fps, frame],
  );

export const useSettle = (fps: number, frame: number) =>
  React.useCallback(
    (delay: number, durationInFrames = 28) =>
      spring({
        frame: frame - delay,
        fps,
        config: { damping: 200 },
        durationInFrames,
      }),
    [fps, frame],
  );

/** Big kinetic headline: each word lands on its own beat. */
export const WordStack: React.FC<{
  text: string;
  pop: (d: number, dur?: number, damp?: number) => number;
  start?: number;
  stagger?: number;
  size?: number;
  color?: string;
  accent?: string;
  accentFrom?: number;
  align?: "left" | "center";
}> = ({
  text,
  pop,
  start = 0,
  stagger = 3,
  size = 104,
  color = BRAND.white,
  accent,
  accentFrom = -1,
  align = "center",
}) => {
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0 20px",
        justifyContent: align === "center" ? "center" : "flex-start",
        maxWidth: 920,
      }}
    >
      {words.map((w, i) => {
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
              lineHeight: 1.06,
              color: isAccent && accent ? accent : color,
              opacity: Math.min(1, p),
              transform: `translateY(${(1 - p) * 44}px) scale(${0.86 + p * 0.14})`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Kicker: React.FC<{
  children: React.ReactNode;
  progress: number;
  color?: string;
}> = ({ children, progress, color = BRAND.surface }) => (
  <div
    style={{
      fontFamily: MONO_FONT,
      fontSize: 28,
      letterSpacing: 7,
      textTransform: "uppercase",
      color,
      opacity: progress * 0.85,
      transform: `translateY(${(1 - progress) * 12}px)`,
    }}
  >
    {children}
  </div>
);

export const Body: React.FC<{
  children: React.ReactNode;
  progress: number;
  color?: string;
  size?: number;
}> = ({ children, progress, color = BRAND.surface, size = 36 }) => (
  <div
    style={{
      fontFamily: BODY_FONT,
      fontSize: size,
      fontWeight: 500,
      lineHeight: 1.5,
      textAlign: "center",
      maxWidth: 860,
      color,
      opacity: progress * 0.82,
      transform: `translateY(${(1 - progress) * 16}px)`,
    }}
  >
    {children}
  </div>
);

const TABS = ["Home", "Explore", "Chat", "Profile"];

/** Bottom navigation — anchors the screen so mock UI doesn't float in space. */
const TabBar: React.FC<{ active: number }> = ({ active }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 92,
      backgroundColor: BRAND.white,
      borderTop: `1px solid ${BRAND.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      paddingBottom: 10,
    }}
  >
    {TABS.map((t, i) => {
      const on = i === active;
      return (
        <div
          key={t}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            opacity: on ? 1 : 0.38,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              backgroundColor: on ? BRAND.primary : BRAND.ink,
            }}
          />
          <div
            style={{
              fontFamily: BODY_FONT,
              fontSize: 15,
              fontWeight: 600,
              color: on ? BRAND.primary : BRAND.ink,
            }}
          >
            {t}
          </div>
        </div>
      );
    })}
  </div>
);

/** Phone shell that the feature scenes render their mock UI inside. */
export const Phone: React.FC<{
  progress: number;
  children: React.ReactNode;
  width?: number;
  height?: number;
  activeTab?: number;
}> = ({ progress, children, width = 500, height = 810, activeTab = 0 }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 56,
      backgroundColor: BRAND.white,
      border: `10px solid rgba(255,255,255,0.92)`,
      boxShadow: "0 40px 90px rgba(0,0,0,0.35)",
      overflow: "hidden",
      position: "relative",
      opacity: Math.min(1, progress),
      transform: `translateY(${(1 - progress) * 70}px) scale(${0.9 + progress * 0.1})`,
    }}
  >
    {/* Notch */}
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: 132,
        height: 26,
        borderRadius: 20,
        backgroundColor: BRAND.ink,
        opacity: 0.85,
        zIndex: 2,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: BRAND.surface,
        paddingTop: 62,
        paddingBottom: 100,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
    <TabBar active={activeTab} />
  </div>
);

/** A satisfying tick — scales past 1 before settling. */
export const Tick: React.FC<{ progress: number; size?: number }> = ({
  progress,
  size = 44,
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
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
      <path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke={BRAND.white}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const Chip: React.FC<{
  label: string;
  progress: number;
  filled?: boolean;
}> = ({ label, progress, filled = false }) => (
  <div
    style={{
      padding: "18px 34px",
      borderRadius: 999,
      backgroundColor: filled ? BRAND.white : "rgba(255,255,255,0.12)",
      border: `2px solid ${filled ? BRAND.white : "rgba(255,255,255,0.34)"}`,
      color: filled ? BRAND.primary : BRAND.white,
      fontFamily: HEADING_FONT,
      fontSize: 38,
      fontWeight: 800,
      letterSpacing: HEADING_TRACKING,
      opacity: Math.min(1, progress),
      transform: `scale(${0.8 + progress * 0.2})`,
    }}
  >
    {label}
  </div>
);

/** Generic mock row used inside the phone screens. */
export const MockRow: React.FC<{
  progress: number;
  title: string;
  sub?: string;
  trailing?: React.ReactNode;
  leadingColor?: string;
}> = ({ progress, title, sub, trailing, leadingColor = BRAND.secondary }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      backgroundColor: BRAND.white,
      borderRadius: BRAND.radius,
      border: `1px solid ${BRAND.border}`,
      padding: "18px 20px",
      margin: "0 22px 14px",
      opacity: Math.min(1, progress),
      transform: `translateX(${(1 - progress) * 40}px)`,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: leadingColor,
        flexShrink: 0,
        opacity: 0.9,
      }}
    />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontFamily: HEADING_FONT,
          fontSize: 24,
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
            fontSize: 18,
            color: BRAND.ink,
            opacity: 0.6,
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
    {trailing}
  </div>
);
