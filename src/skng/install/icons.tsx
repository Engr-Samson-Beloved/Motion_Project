import React from "react";
import { IOS } from "./theme";

/**
 * The glyphs iOS puts on screen, drawn rather than fetched.
 *
 * SF Symbols cannot ship with a render — they are licensed for use in Apple
 * software, not for redistribution inside a video file — so every mark below is
 * an original approximation on Apple's own 24-unit grid. They are recognisable
 * at the size the phone is on screen, which is all the piece needs of them: the
 * viewer has to be able to match "the square with the arrow coming out of it"
 * against the button on their own device.
 *
 * All of them are stroke-first and inherit a single colour, so a row can hand
 * down `IOS.label` and get a consistent weight without each glyph carrying its
 * own palette.
 */

type IconProps = {
  size?: number;
  color?: string;
  /** Stroke weight on the 24-unit grid, before scaling. */
  weight?: number;
};

const G: React.FC<IconProps & { children: React.ReactNode; box?: number }> = ({
  size = 22,
  color = IOS.label,
  weight = 1.6,
  box = 24,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${box} ${box}`}
    fill="none"
    stroke={color}
    strokeWidth={weight}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", flex: "none" }}
  >
    {children}
  </svg>
);

/* ── Safari chrome ────────────────────────────────────────────────────── */

export const ChevronLeft: React.FC<IconProps> = (p) => (
  <G {...p}>
    <path d="M15 5 L8 12 L15 19" />
  </G>
);

export const ChevronRight: React.FC<IconProps> = (p) => (
  <G {...p}>
    <path d="M9 5 L16 12 L9 19" />
  </G>
);

/** The square with the arrow leaving it — the one glyph the film is about. */
export const Share: React.FC<IconProps> = (p) => (
  <G {...p}>
    <path d="M12 3 L12 15" />
    <path d="M8 7 L12 3 L16 7" />
    <path d="M7 10 H5 V21 H19 V10 H17" />
  </G>
);

export const Book: React.FC<IconProps> = (p) => (
  <G {...p}>
    <path d="M4 5 h6 a2 2 0 0 1 2 2 v13 a2 2 0 0 0 -2 -2 H4 z" />
    <path d="M20 5 h-6 a2 2 0 0 0 -2 2 v13 a2 2 0 0 1 2 -2 h6 z" />
  </G>
);

export const Tabs: React.FC<IconProps> = (p) => (
  <G {...p}>
    <rect x="3" y="7" width="12" height="12" rx="2.5" />
    <path d="M8 7 V6 a2 2 0 0 1 2 -2 h9 a2 2 0 0 1 2 2 v9 a2 2 0 0 1 -2 2 h-1" />
  </G>
);

export const Reload: React.FC<IconProps> = (p) => (
  <G {...p}>
    <path d="M20 12 a8 8 0 1 1 -2.6 -5.9" />
    <path d="M20 4 v4 h-4" />
  </G>
);

export const Lock: React.FC<IconProps> = (p) => (
  <G {...p}>
    <rect x="5" y="10" width="14" height="10" rx="2.5" />
    <path d="M8 10 V7 a4 4 0 0 1 8 0 v3" />
  </G>
);

/* ── Share-sheet actions ──────────────────────────────────────────────── */

export const Copy: React.FC<IconProps> = (p) => (
  <G {...p}>
    <rect x="8" y="3" width="13" height="16" rx="2.5" />
    <path d="M16 19 v0 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 V8 a2 2 0 0 1 2 -2 h0" />
  </G>
);

export const Glasses: React.FC<IconProps> = (p) => (
  <G {...p}>
    <circle cx="6" cy="14" r="3.4" />
    <circle cx="18" cy="14" r="3.4" />
    <path d="M9.4 14 h5.2" />
    <path d="M2.6 14 a5 5 0 0 1 2.2 -5" />
    <path d="M21.4 14 a5 5 0 0 0 -2.2 -5" />
  </G>
);

export const Star: React.FC<IconProps> = (p) => (
  <G {...p}>
    <path d="M12 3.5 l2.7 5.6 6.1 .8 -4.5 4.2 1.2 6.1 -5.5 -3 -5.5 3 1.2 -6.1 -4.5 -4.2 6.1 -.8 z" />
  </G>
);

export const FindPage: React.FC<IconProps> = (p) => (
  <G {...p}>
    <path d="M6 3 h8 l5 5 v6" />
    <path d="M19 18 v3 H6 V3" />
    <circle cx="13.5" cy="13.5" r="3.6" />
    <path d="M16.2 16.2 L19.5 19.5" />
  </G>
);

/** The square with the plus — the row the whole piece is aiming at. */
export const PlusSquare: React.FC<IconProps> = (p) => (
  <G {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <path d="M12 8 v8 M8 12 h8" />
  </G>
);

export const Markup: React.FC<IconProps> = (p) => (
  <G {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 15.5 L15.5 8.5" />
    <path d="M14 7 l3 3" />
  </G>
);

export const Printer: React.FC<IconProps> = (p) => (
  <G {...p}>
    <path d="M7 9 V3 h10 v6" />
    <rect x="3" y="9" width="18" height="8" rx="2" />
    <path d="M7 14 h10 v7 H7 z" />
  </G>
);

export const Pinned: React.FC<IconProps> = (p) => (
  <G {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 18 l3 -11" />
    <path d="M9.5 12.5 a3.5 3.5 0 1 0 4.5 -4" />
  </G>
);

export const Box: React.FC<IconProps> = (p) => (
  <G {...p}>
    <path d="M7 4 L12 7.5 L7 11 L2 7.5 z" />
    <path d="M17 4 L22 7.5 L17 11 L12 7.5 z" />
    <path d="M7 12 L12 15.5 L7 19 L2 15.5 z" />
    <path d="M17 12 L22 15.5 L17 19 L12 15.5 z" />
  </G>
);

/** In list order, so a row can look its glyph up by index. */
export const ACTION_ICONS = [
  Copy,
  Glasses,
  Book,
  Star,
  FindPage,
  PlusSquare,
  Markup,
  Printer,
  Pinned,
  Box,
] as const;

/* ── Status bar ───────────────────────────────────────────────────────── */

export const Cellular: React.FC<{ size?: number; color?: string }> = ({
  size = 17,
  color = IOS.label,
}) => (
  <svg width={size} height={(size * 12) / 17} viewBox="0 0 17 12" style={{ display: "block" }}>
    {[0, 1, 2, 3].map((i) => (
      <rect
        key={i}
        x={i * 4.4}
        y={11 - (i + 1) * 2.6}
        width="3"
        height={(i + 1) * 2.6}
        rx="1"
        fill={color}
      />
    ))}
  </svg>
);

export const Wifi: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = IOS.label,
}) => (
  <svg width={size} height={(size * 12) / 16} viewBox="0 0 16 12" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" style={{ display: "block" }}>
    <path d="M1 4.2 a10 10 0 0 1 14 0" />
    <path d="M3.6 7 a6.2 6.2 0 0 1 8.8 0" />
    <circle cx="8" cy="10" r="1.1" fill={color} stroke="none" />
  </svg>
);

export const Battery: React.FC<{ size?: number; color?: string }> = ({
  size = 25,
  color = IOS.label,
}) => (
  <svg width={size} height={(size * 12) / 25} viewBox="0 0 25 12" style={{ display: "block" }}>
    <rect x="0.6" y="0.6" width="20" height="10.8" rx="3" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="1.1" />
    <rect x="2.2" y="2.2" width="16.8" height="7.6" rx="1.9" fill={color} />
    <path d="M22.3 4.2 a2.4 2.4 0 0 1 0 3.6" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="1.1" />
  </svg>
);

/* ── Share targets, and the dock ──────────────────────────────────────── */

/**
 * The app marks in the share row and the dock.
 *
 * Each is a filled disc or squircle with a white mark on it, in the colour the
 * real app uses. They exist to be recognised at a glance and never carry a
 * label the viewer has to read, so they are drawn to silhouette rather than to
 * detail.
 */
export const AirDropMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <circle cx="12" cy="12" r="12" fill="#3E7BF6" />
    <g fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
      <path d="M7.6 14.4 a6 6 0 0 1 0 -6.4" />
      <path d="M16.4 14.4 a6 6 0 0 0 0 -6.4" />
      <path d="M12 17 V9.4" />
      <path d="M9.6 11.8 L12 9.4 L14.4 11.8" />
    </g>
  </svg>
);

export const MessagesMark: React.FC<{ size: number; radius?: number }> = ({
  size,
  radius,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <rect width="24" height="24" rx={radius ?? 12} fill="#4CD964" />
    <path
      d="M12 5.6 c4.3 0 7.2 2.5 7.2 5.9 0 3.4 -2.9 5.9 -7.2 5.9 a9.6 9.6 0 0 1 -2 -.2 l-3.4 1.6 .9 -2.6 c-1.7 -1.1 -2.7 -2.8 -2.7 -4.7 0 -3.4 2.9 -5.9 7.2 -5.9 z"
      fill="#fff"
    />
  </svg>
);

export const MailMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <circle cx="12" cy="12" r="12" fill="#1F8DF5" />
    <rect x="5" y="8" width="14" height="9" rx="2" fill="#fff" />
    <path d="M5.6 9 L12 13.4 L18.4 9" fill="none" stroke="#1F8DF5" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const WhatsAppMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path
      d="M12 5.4 a6.6 6.6 0 0 0 -5.7 9.9 l-1 3.3 3.4 -1 A6.6 6.6 0 1 0 12 5.4 z"
      fill="#fff"
    />
    <path
      d="M9.6 9.1 c.2 -.4 .5 -.4 .8 -.4 .2 0 .4 0 .5 .4 l.6 1.4 c.1 .3 0 .5 -.2 .7 l-.4 .4 c-.1 .2 -.1 .3 0 .5 a5 5 0 0 0 2.3 2 c.2 .1 .4 .1 .5 -.1 l.5 -.6 c.2 -.2 .4 -.2 .6 -.1 l1.3 .7 c.3 .2 .3 .4 .3 .6 0 .5 -.4 1.1 -1 1.3 -.6 .2 -1.4 .2 -3 -.6 a8.6 8.6 0 0 1 -3.3 -3.4 c-.6 -1.2 -.5 -2.1 -.3 -2.5 z"
      fill="#25D366"
    />
  </svg>
);

export const PhoneMark: React.FC<{ size: number; radius: number }> = ({ size, radius }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <rect width="24" height="24" rx={radius} fill="#4CD964" />
    <path
      d="M8.4 5.6 c.6 -.3 1.2 -.1 1.5 .5 l1.1 2 c.3 .6 .2 1.2 -.3 1.6 l-.8 .6 c-.2 .2 -.3 .4 -.2 .7 a8.4 8.4 0 0 0 3.3 3.3 c.3 .1 .5 0 .7 -.2 l.6 -.8 c.4 -.5 1 -.6 1.6 -.3 l2 1.1 c.6 .3 .8 .9 .5 1.5 -.6 1.2 -1.8 1.9 -3.1 1.7 -4 -.5 -8 -4.5 -8.5 -8.5 -.2 -1.3 .5 -2.5 1.6 -3.2 z"
      fill="#fff"
    />
  </svg>
);

export const SafariMark: React.FC<{ size: number; radius: number }> = ({ size, radius }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <rect width="24" height="24" rx={radius} fill="#1F8DF5" />
    <circle cx="12" cy="12" r="8.2" fill="#F2F6FB" />
    <path d="M16.4 7.6 L10.6 10.6 L7.6 16.4 L13.4 13.4 z" fill="#FF3B30" />
    <path d="M10.6 10.6 L13.4 13.4 L7.6 16.4 z" fill="#F2F2F7" />
  </svg>
);

export const MusicMark: React.FC<{ size: number; radius: number }> = ({ size, radius }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <rect width="24" height="24" rx={radius} fill="#FA3C55" />
    <path
      d="M16.4 5.4 L10.2 6.9 v7.9 a2.3 2.3 0 1 0 1.5 2.2 V9.2 l4.7 -1.1 v5.2 a2.3 2.3 0 1 0 1.5 2.2 V5.4 z"
      fill="#fff"
    />
  </svg>
);

/* ── Marks the film itself draws ──────────────────────────────────────── */

export const Check: React.FC<IconProps> = (p) => (
  <G {...p} weight={p.weight ?? 2.6}>
    <path d="M5 12.5 L10 17.5 L19 7" />
  </G>
);
