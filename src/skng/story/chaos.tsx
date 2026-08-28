import React from "react";
import { noise2D } from "@remotion/noise";
import { BODY_FONT, MONO_FONT, STORY, ease } from "./palette";
import type { Clutter } from "./script";
import { BellGlyph, ChatGlyph, DocGlyph, SearchGlyph } from "./ui";

/**
 * The clutter of scene 02.
 *
 * Every card is generic on purpose: a message is a bubble, never a real
 * platform's mark, and a portal is a form, never a named institution's site.
 * The overload has to come from quantity, speed and contradiction, not from
 * recognisable logos.
 *
 * Cards keep drifting after they land, with the drift speed rising across the
 * scene, so the frame ends genuinely overwhelmed rather than merely full.
 */

const CHROME_DOT = "#4A545F";

const Shell: React.FC<{
  children: React.ReactNode;
  width: number;
  doubt?: boolean;
}> = ({ children, width, doubt }) => (
  <div
    style={{
      width,
      backgroundColor: STORY.dark2,
      border: `1px solid ${doubt ? STORY.warn : STORY.line}`,
      borderRadius: 8,
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

const Label: React.FC<{ text: string; mono?: boolean; dim?: boolean }> = ({
  text,
  mono = false,
  dim = false,
}) => (
  <div
    style={{
      fontFamily: mono ? MONO_FONT : BODY_FONT,
      fontSize: 15,
      lineHeight: 1.35,
      color: dim ? STORY.muted : STORY.white,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    {text}
  </div>
);

const CardBody: React.FC<{ item: Clutter }> = ({ item }) => {
  switch (item.kind) {
    case "window":
    case "portal":
      return (
        <Shell width={item.kind === "window" ? 330 : 300} doubt={item.doubt}>
          <div
            style={{
              height: 26,
              backgroundColor: STORY.dark,
              borderBottom: `1px solid ${STORY.line}`,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 10px",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: CHROME_DOT,
                }}
              />
            ))}
          </div>
          <div style={{ padding: "12px 12px 14px" }}>
            <Label text={item.label} />
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {(item.kind === "portal" ? [0.9, 0.75, 0.55] : [0.7, 0.45]).map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: item.kind === "portal" ? 10 : 6,
                    width: `${w * 100}%`,
                    borderRadius: 3,
                    border: item.kind === "portal" ? `1px solid ${STORY.line}` : "none",
                    backgroundColor: item.kind === "portal" ? "transparent" : STORY.line,
                  }}
                />
              ))}
            </div>
          </div>
        </Shell>
      );

    case "chat":
      return (
        <div
          style={{
            maxWidth: 320,
            backgroundColor: STORY.dark2,
            border: `1px solid ${item.doubt ? STORY.warn : STORY.line}`,
            borderRadius: 14,
            borderBottomLeftRadius: 4,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <ChatGlyph size={20} color={item.doubt ? STORY.warn : STORY.muted} strokeWidth={1.8} />
          <Label text={item.label} />
        </div>
      );

    case "doc":
      return (
        <div
          style={{
            backgroundColor: STORY.dark2,
            border: `1px solid ${item.duplicate ? STORY.line2 : STORY.line}`,
            borderRadius: 8,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 11,
          }}
        >
          <DocGlyph size={22} color={STORY.muted} strokeWidth={1.8} />
          <Label text={item.label} mono dim={item.duplicate} />
        </div>
      );

    case "bell":
      return (
        <div
          style={{
            backgroundColor: STORY.green,
            borderRadius: 999,
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          <BellGlyph size={18} color={STORY.white} strokeWidth={2} />
          <div
            style={{
              fontFamily: BODY_FONT,
              fontSize: 15,
              fontWeight: 700,
              color: STORY.white,
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </div>
        </div>
      );

    case "search":
    default:
      return (
        <div
          style={{
            width: 380,
            height: 46,
            backgroundColor: STORY.dark2,
            border: `1px solid ${item.doubt ? STORY.warn : STORY.line2}`,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "0 18px",
          }}
        >
          <SearchGlyph size={19} color={STORY.muted} strokeWidth={2} />
          <Label text={item.label} dim />
        </div>
      );
  }
};

/**
 * One clutter card, positioned, drifting, and optionally struck through.
 *
 * `turbulence` rises across the scene and multiplies the drift, which is what
 * makes the second half feel like it is getting away from you.
 */
export const ClutterCard: React.FC<{
  item: Clutter;
  index: number;
  frame: number;
  turbulence: number;
  width: number;
  height: number;
}> = ({ item, index, frame, turbulence, width, height }) => {
  const age = frame - item.at;
  if (age < 0) return null;

  const p = ease(Math.max(0, Math.min(1, age / 12)));
  const t = frame * 0.012;
  // Separate seeds per axis so cards wander rather than sliding as a block.
  const dx = noise2D(`cx${index}`, t, index * 0.3) * 46 * turbulence;
  const dy = noise2D(`cy${index}`, t, index * 0.3 + 9) * 34 * turbulence;
  const rot = noise2D(`cr${index}`, t * 0.7, index) * 2.4 * turbulence;

  return (
    <div
      style={{
        position: "absolute",
        left: item.x * width,
        top: item.y * height,
        transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${(0.86 + p * 0.14) * item.scale})`,
        opacity: p * (item.duplicate ? 0.72 : 1),
        // Duplicates and doubtful cards sit *under* the confident ones, so the
        // eye finds the contradiction rather than being handed it.
        zIndex: item.duplicate || item.doubt ? 1 : 2,
      }}
    >
      <div style={{ position: "relative", filter: item.doubt ? "blur(0.6px)" : undefined }}>
        <CardBody item={item} />
        {item.doubt ? (
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <line
              x1={4}
              y1={92}
              x2={4 + 92 * ease(Math.max(0, Math.min(1, (age - 14) / 14)))}
              y2={92 - 84 * ease(Math.max(0, Math.min(1, (age - 14) / 14)))}
              stroke={STORY.warn}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : null}
      </div>
    </div>
  );
};
