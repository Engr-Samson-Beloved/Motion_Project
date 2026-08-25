import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type LowerThirdProps = {
  name: string;
  role: string;
};

const FONT_STACK =
  '"Inter", "Segoe UI Variable Display", "Segoe UI", system-ui, -apple-system, sans-serif';

/** Frame each beat begins. Composition is 90 frames (3s at 30fps). */
const BAR_START = 0;
const PANEL_START = 4;
const NAME_START = 12;
const ROLE_START = 24;
const EXIT_START = 70;

export const LowerThird: React.FC<LowerThirdProps> = ({ name, role }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Lower thirds animate out rather than simply fading, so the exit both
  // slides the whole lockup left and fades it.
  const exit = interpolate(frame, [EXIT_START, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const bar = spring({
    frame: frame - BAR_START,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });

  const panel = spring({
    frame: frame - PANEL_START,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  // Clip-path wipes reveal the text from left to right behind a hard edge.
  const nameWipe = spring({
    frame: frame - NAME_START,
    fps,
    config: { damping: 200 },
    durationInFrames: 32,
  });

  const roleWipe = spring({
    frame: frame - ROLE_START,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d12" }}>
      {/* Stand-in backdrop so the element is legible when rendered alone. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 60% at 30% 30%, #182238 0%, rgba(11,13,18,0) 70%)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          paddingLeft: 170,
          paddingBottom: 190,
          opacity: 1 - exit,
          transform: `translateX(${-exit * 70}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "stretch" }}>
          {/* Accent bar grows upward from the baseline. */}
          <div
            style={{
              width: 6,
              borderRadius: 6,
              background: "linear-gradient(180deg, #4f8cff, #9d7bff)",
              transform: `scaleY(${bar})`,
              transformOrigin: "bottom",
            }}
          />

          {/* Glass panel expands from the bar outward. */}
          <div
            style={{
              marginLeft: 26,
              paddingRight: 70,
              transform: `scaleX(${panel})`,
              transformOrigin: "left",
            }}
          >
            <div
              style={{
                fontFamily: FONT_STACK,
                fontSize: 76,
                fontWeight: 700,
                letterSpacing: -2,
                lineHeight: 1.12,
                color: "#f4f6fb",
                clipPath: `inset(0 ${(1 - nameWipe) * 100}% 0 0)`,
                // Counter-scale so the panel's scaleX does not stretch the type.
                transform: `scaleX(${1 / Math.max(panel, 0.001)})`,
                transformOrigin: "left",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </div>

            <div
              style={{
                fontFamily: FONT_STACK,
                fontSize: 30,
                fontWeight: 500,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "#8d97ad",
                marginTop: 14,
                clipPath: `inset(0 ${(1 - roleWipe) * 100}% 0 0)`,
                transform: `scaleX(${1 / Math.max(panel, 0.001)})`,
                transformOrigin: "left",
                whiteSpace: "nowrap",
              }}
            >
              {role}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
