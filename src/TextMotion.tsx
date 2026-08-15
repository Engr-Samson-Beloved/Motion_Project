import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type TextMotionProps = {
  title: string;
  subtitle: string;
};

const FONT_STACK =
  '"Inter", "Segoe UI Variable Display", "Segoe UI", system-ui, -apple-system, sans-serif';

/**
 * Frames at which each stage of the animation begins. The composition is
 * 120 frames (4s at 30fps), so the tail leaves room for the exit fade.
 */
const WORD_STAGGER = 4;
const RULE_START = 22;
const SUBTITLE_START = 34;
const EXIT_LENGTH = 14;

export const TextMotion: React.FC<TextMotionProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const words = title.split(" ");

  // Everything fades out together over the final frames.
  const exit = interpolate(
    frame,
    [durationInFrames - EXIT_LENGTH, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Slow push-in on the whole scene keeps the frame from feeling static.
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.06]);

  const rule = spring({
    frame: frame - RULE_START,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const subtitleIn = spring({
    frame: frame - SUBTITLE_START,
    fps,
    config: { damping: 200 },
    durationInFrames: 28,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#08090c" }}>
      {/* Soft radial glow behind the type. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 55% at 50% 45%, #1d2b4d 0%, rgba(8,9,12,0) 70%)",
          opacity: exit,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${scale})`,
          opacity: exit,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0 28px",
            maxWidth: 1500,
          }}
        >
          {words.map((word, i) => {
            const enter = spring({
              frame: frame - i * WORD_STAGGER,
              fps,
              config: { damping: 200 },
              durationInFrames: 32,
            });

            return (
              <span
                key={`${word}-${i}`}
                style={{
                  fontFamily: FONT_STACK,
                  fontSize: 132,
                  fontWeight: 700,
                  letterSpacing: -4,
                  color: "#f4f6fb",
                  lineHeight: 1.1,
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 90}px)`,
                  filter: `blur(${(1 - enter) * 12}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        <div
          style={{
            width: 460,
            height: 3,
            marginTop: 44,
            borderRadius: 3,
            background: "linear-gradient(90deg, #4f8cff, #9d7bff)",
            transform: `scaleX(${rule})`,
          }}
        />

        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 34,
            fontWeight: 400,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#8d97ad",
            marginTop: 40,
            opacity: subtitleIn,
            transform: `translateY(${(1 - subtitleIn) * 24}px)`,
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
