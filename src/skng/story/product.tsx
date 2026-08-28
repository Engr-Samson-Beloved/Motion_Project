import React from "react";
import {
  BODY_FONT,
  HEADING_FONT,
  HEADING_TRACKING,
  STORY,
  ease,
} from "./palette";
import { TABS } from "../pulse/icons";

/**
 * The SkoolConnectNG interface, reproduced for scenes 06 and 07.
 *
 * The brief says do not redesign the product UI, so the structure is the app's
 * own: the same five-tab bar with Network as the centre button, the same
 * icons (imported from `pulse/icons.tsx`, which ports them verbatim from
 * `components/navigation/bottom-nav.tsx`), the same card-and-row screens.
 *
 * What changed is the palette and only the palette. The app's real FAB is a
 * three-stop gradient disc with a blurred gradient glow behind it, and the
 * brief forbids gradients outright — so it is drawn as a solid green disc.
 * Same shape, same position, same affordance, one fill instead of three.
 */

const RADIUS = 12;

export const Avatar: React.FC<{ label: string; size?: number; solid?: boolean }> = ({
  label,
  size = 42,
  solid = true,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: solid ? STORY.green : "transparent",
      border: solid ? "none" : `2px solid ${STORY.green}`,
      color: solid ? STORY.white : STORY.green,
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

export const TabBar: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: -24,
        transform: "translateX(-50%)",
        zIndex: 3,
        width: 54,
        height: 54,
        borderRadius: "50%",
        backgroundColor: STORY.green,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(active === 2
          ? { outline: `3px solid ${STORY.white}`, outlineOffset: 3 }
          : {}),
      }}
    >
      {(() => {
        const Icon = TABS[2].Icon;
        return <Icon size={27} color={STORY.white} filled />;
      })()}
    </div>

    <div
      style={{
        height: 78,
        backgroundColor: STORY.white,
        borderTop: `1px solid #D6E0DC`,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        alignItems: "center",
        paddingBottom: 10,
      }}
    >
      {TABS.map((t, i) => {
        if (t.isFab) return <div key={t.label} />;
        const on = i === active;
        const color = on ? STORY.green : "#9AA6A2";
        const Icon = t.Icon;
        return (
          <div
            key={t.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon filled={on} size={25} color={color} />
            <div
              style={{
                fontFamily: BODY_FONT,
                fontSize: 12,
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

export const PHONE_W = 470;
export const PHONE_H = 956;

/**
 * Phone shell. Flat chrome, flat interior — the depth that a drop shadow would
 * normally give comes from a solid darker outline instead, so the frame still
 * separates from the #171E26 ground without a soft falloff.
 */
export const Phone: React.FC<{
  progress: number;
  children: React.ReactNode;
  activeTab?: number;
  width?: number;
  height?: number;
}> = ({
  progress,
  children,
  activeTab = 0,
  width = PHONE_W,
  height = PHONE_H,
}) => {
  const p = ease(Math.max(0, Math.min(1, progress)));
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 42,
        backgroundColor: STORY.white,
        border: `8px solid ${STORY.dark2}`,
        outline: `1px solid ${STORY.line2}`,
        overflow: "hidden",
        position: "relative",
        opacity: p,
        transform: `translateY(${(1 - p) * 46}px) scale(${0.94 + p * 0.06})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 104,
          height: 20,
          borderRadius: 16,
          backgroundColor: STORY.dark,
          zIndex: 4,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#EDF3F1",
          overflow: "hidden",
        }}
      >
        {/*
          The screen viewport is its own positioned box rather than padding on
          the parent. Scenes cross-fade whole screens with <AbsoluteFill>, and
          an absolutely positioned child resolves against the padding *box* —
          so with padding here those screens would start under the notch and
          run behind the tab bar.
        */}
        <div
          style={{
            position: "absolute",
            top: 46,
            left: 0,
            right: 0,
            bottom: 84,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
      <TabBar active={activeTab} />
    </div>
  );
};

export const ScreenTitle: React.FC<{
  children: React.ReactNode;
  progress: number;
  sub?: string;
}> = ({ children, progress, sub }) => (
  <div
    style={{
      padding: "8px 20px 14px",
      opacity: progress,
      transform: `translateY(${(1 - progress) * 10}px)`,
    }}
  >
    <div
      style={{
        fontFamily: HEADING_FONT,
        fontSize: 25,
        fontWeight: 900,
        letterSpacing: HEADING_TRACKING,
        color: STORY.dark,
      }}
    >
      {children}
    </div>
    {sub ? (
      <div
        style={{
          fontFamily: BODY_FONT,
          fontSize: 13,
          color: "#7C8A86",
          marginTop: 3,
        }}
      >
        {sub}
      </div>
    ) : null}
  </div>
);

export const Card: React.FC<{
  progress: number;
  children: React.ReactNode;
  from?: "left" | "right" | "bottom";
  accent?: boolean;
}> = ({ progress, children, from = "bottom", accent = false }) => {
  const p = ease(Math.max(0, Math.min(1, progress)));
  const d = (1 - p) * 34;
  const t =
    from === "left"
      ? `translateX(${-d}px)`
      : from === "right"
        ? `translateX(${d}px)`
        : `translateY(${d}px)`;
  return (
    <div
      style={{
        backgroundColor: STORY.white,
        borderRadius: RADIUS,
        border: `1px solid ${accent ? STORY.green : "#DCE5E2"}`,
        padding: "14px 16px",
        margin: "0 20px 11px",
        opacity: p,
        transform: t,
      }}
    >
      {children}
    </div>
  );
};

/** A person row: avatar, name, institution, and a follow affordance. */
export const PersonRow: React.FC<{
  progress: number;
  name: string;
  school: string;
  initials: string;
  action?: string;
}> = ({ progress, name, school, initials, action = "Connect" }) => (
  <Card progress={progress} from="left">
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar label={initials} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 17,
            fontWeight: 800,
            color: STORY.dark,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 13,
            color: "#7C8A86",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {school}
        </div>
      </div>
      <div
        style={{
          fontFamily: BODY_FONT,
          fontSize: 12,
          fontWeight: 700,
          color: STORY.green,
          border: `1px solid ${STORY.green}`,
          borderRadius: 999,
          padding: "5px 12px",
          flexShrink: 0,
        }}
      >
        {action}
      </div>
    </div>
  </Card>
);

/** A community post: author, body, and a flat reply count. */
export const PostRow: React.FC<{
  progress: number;
  name: string;
  school: string;
  initials: string;
  text: string;
  replies: number;
}> = ({ progress, name, school, initials, text, replies }) => (
  <Card progress={progress}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <Avatar label={initials} size={32} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 14,
            fontWeight: 800,
            color: STORY.dark,
          }}
        >
          {name}
        </div>
        <div style={{ fontFamily: BODY_FONT, fontSize: 11, color: "#7C8A86" }}>
          {school}
        </div>
      </div>
    </div>
    <div
      style={{
        fontFamily: BODY_FONT,
        fontSize: 14,
        lineHeight: 1.45,
        color: "#2C3A36",
      }}
    >
      {text}
    </div>
    <div
      style={{
        marginTop: 9,
        fontFamily: BODY_FONT,
        fontSize: 12,
        fontWeight: 700,
        color: STORY.green,
      }}
    >
      {replies} replies
    </div>
  </Card>
);

/** A resource or opportunity: a flat tag, a title, and one line of meta. */
export const ListingRow: React.FC<{
  progress: number;
  tag: string;
  title: string;
  meta: string;
  from?: "left" | "right" | "bottom";
}> = ({ progress, tag, title, meta, from = "right" }) => (
  <Card progress={progress} from={from}>
    <div
      style={{
        display: "inline-block",
        fontFamily: BODY_FONT,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: STORY.white,
        backgroundColor: STORY.green,
        borderRadius: 5,
        padding: "3px 8px",
        marginBottom: 8,
      }}
    >
      {tag}
    </div>
    <div
      style={{
        fontFamily: HEADING_FONT,
        fontSize: 16,
        fontWeight: 800,
        lineHeight: 1.3,
        color: STORY.dark,
      }}
    >
      {title}
    </div>
    <div
      style={{
        marginTop: 5,
        fontFamily: BODY_FONT,
        fontSize: 12,
        color: "#7C8A86",
      }}
    >
      {meta}
    </div>
  </Card>
);

/** A flat search bar, as it sits at the top of the Network and Discover tabs. */
export const SearchBar: React.FC<{ progress: number; text: string }> = ({
  progress,
  text,
}) => (
  <div
    style={{
      margin: "0 20px 12px",
      height: 38,
      borderRadius: 999,
      backgroundColor: STORY.white,
      border: `1px solid #DCE5E2`,
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "0 14px",
      opacity: progress,
    }}
  >
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <circle cx="10.6" cy="10.6" r="6.8" stroke="#9AA6A2" strokeWidth={2.4} />
      <path d="m15.6 15.6 4.8 4.8" stroke="#9AA6A2" strokeWidth={2.4} strokeLinecap="round" />
    </svg>
    <div style={{ fontFamily: BODY_FONT, fontSize: 13, color: "#9AA6A2" }}>{text}</div>
  </div>
);
