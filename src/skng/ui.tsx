import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile } from "remotion";
import {
  BODY_FONT,
  BRAND,
  HEADING_FONT,
  HEADING_TRACKING,
} from "./brand";

/** Deep Nigerian-green field used for the film's dark scenes. */
export const DarkField: React.FC<{ drift?: number }> = ({ drift = 0 }) => (
  <>
    <AbsoluteFill style={{ backgroundColor: BRAND.primary }} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(58% 55% at ${22 + drift * 6}% ${18 + drift * 5}%, ${BRAND.secondary} 0%, rgba(22,85,56,0) 66%)`,
        opacity: 0.75,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(52% 52% at ${80 - drift * 7}% ${78 - drift * 4}%, ${BRAND.accent} 0%, rgba(22,85,56,0) 70%)`,
        opacity: 0.8,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(80% 75% at 50% 50%, rgba(0,0,0,0) 45%, ${BRAND.ink} 100%)`,
        opacity: 0.72,
      }}
    />
  </>
);

/** Light application surface used for the film's editorial scenes. */
export const LightField: React.FC = () => (
  <>
    <AbsoluteFill style={{ backgroundColor: BRAND.surface }} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 55% at 78% 12%, ${BRAND.white} 0%, rgba(228,244,241,0) 60%)`,
        opacity: 0.9,
      }}
    />
  </>
);

/**
 * The mark's map of Nigeria is dark green, so it disappears against the dark
 * field. It always sits on a white disc — the same treatment the product gives
 * it as an app icon.
 */
export const LogoChip: React.FC<{ size: number; scale: number }> = ({
  size,
  scale,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: BRAND.white,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${scale})`,
      opacity: Math.min(1, scale),
      boxShadow: "0 0 70px rgba(228,244,241,0.30)",
    }}
  >
    <Img src={staticFile("skng-logo.png")} style={{ width: size * 0.8 }} />
  </div>
);

export const Eyebrow: React.FC<{
  children: React.ReactNode;
  color?: string;
  progress: number;
}> = ({ children, color = BRAND.secondary, progress }) => (
  <div
    style={{
      fontFamily: BODY_FONT,
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: 8,
      textTransform: "uppercase",
      color,
      opacity: progress,
      transform: `translateY(${(1 - progress) * 14}px)`,
    }}
  >
    {children}
  </div>
);

export const Heading: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  progress: number;
  maxWidth?: number;
  align?: "left" | "center";
}> = ({
  children,
  size = 78,
  color = BRAND.ink,
  progress,
  maxWidth = 1350,
  align = "left",
}) => (
  <div
    style={{
      fontFamily: HEADING_FONT,
      fontSize: size,
      fontWeight: 900,
      letterSpacing: HEADING_TRACKING,
      lineHeight: 1.08,
      color,
      maxWidth,
      textAlign: align,
      opacity: progress,
      transform: `translateY(${(1 - progress) * 34}px)`,
      filter: `blur(${(1 - progress) * 8}px)`,
    }}
  >
    {children}
  </div>
);

/**
 * The brand mark is a network of connected nodes over the map of Nigeria.
 * This redraws that motif as animated line work: nodes pop in around a ring,
 * then spokes and ring segments draw themselves to "connect" the network.
 */
export const NetworkGraph: React.FC<{
  frame: number;
  fps: number;
  delay?: number;
  nodes?: number;
  radius?: number;
  size?: number;
  stroke?: string;
  nodeFill?: string;
  opacity?: number;
}> = ({
  frame,
  fps,
  delay = 0,
  nodes = 6,
  radius = 300,
  size = 900,
  stroke = BRAND.white,
  nodeFill = BRAND.white,
  opacity = 1,
}) => {
  const c = size / 2;
  const local = frame - delay;

  const points = Array.from({ length: nodes }, (_, i) => {
    const angle = (i / nodes) * Math.PI * 2 - Math.PI / 2;
    return { x: c + Math.cos(angle) * radius, y: c + Math.sin(angle) * radius };
  });

  // Slow rotation keeps the graph alive without pulling focus.
  const spin = interpolate(local, [0, 600], [0, 24]);

  const drawn = (p1: { x: number; y: number }, p2: { x: number; y: number }, at: number) => {
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const p = spring({
      frame: local - at,
      fps,
      config: { damping: 200 },
      durationInFrames: 26,
    });
    return { len, offset: len * (1 - p) };
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ opacity, transform: `rotate(${spin}deg)` }}
    >
      {/* Ring segments between neighbouring nodes. */}
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        const { len, offset } = drawn(p, next, 16 + i * 5);
        return (
          <line
            key={`ring-${i}`}
            x1={p.x}
            y1={p.y}
            x2={next.x}
            y2={next.y}
            stroke={stroke}
            strokeWidth={2.5}
            strokeOpacity={0.55}
            strokeDasharray={len}
            strokeDashoffset={offset}
          />
        );
      })}

      {/* Spokes from the hub. */}
      {points.map((p, i) => {
        const { len, offset } = drawn({ x: c, y: c }, p, 4 + i * 5);
        return (
          <line
            key={`spoke-${i}`}
            x1={c}
            y1={c}
            x2={p.x}
            y2={p.y}
            stroke={stroke}
            strokeWidth={2}
            strokeOpacity={0.32}
            strokeDasharray={len}
            strokeDashoffset={offset}
          />
        );
      })}

      {points.map((p, i) => {
        const pop = spring({
          frame: local - (i * 5),
          fps,
          config: { damping: 12, mass: 0.6 },
          durationInFrames: 30,
        });
        return (
          <circle
            key={`node-${i}`}
            cx={p.x}
            cy={p.y}
            r={16 * pop}
            fill={nodeFill}
          />
        );
      })}
    </svg>
  );
};
