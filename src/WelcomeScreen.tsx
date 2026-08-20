import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type WelcomeScreenProps = {
  title: string;
  tagline: string;
  brand: string;
};

const FONT_STACK =
  '"Inter", "Segoe UI Variable Display", "Segoe UI", system-ui, -apple-system, sans-serif';

/** Frame at which each beat begins. Composition is 150 frames (5s at 30fps). */
const MARK_START = 6;
const LETTER_START = 26;
const LETTER_STAGGER = 3;
const TAGLINE_START = 66;
const BRAND_START = 82;
const EXIT_LENGTH = 16;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  title,
  tagline,
  brand,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Shared exit fade so every layer leaves together.
  const exit = interpolate(
    frame,
    [durationInFrames - EXIT_LENGTH, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Background glow blooms up over the first second, then drifts.
  const bloom = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const drift = interpolate(frame, [0, durationInFrames], [0, 1]);

  // The badge lands with a little overshoot — it is the first thing to arrive.
  const mark = spring({
    frame: frame - MARK_START,
    fps,
    config: { damping: 13, mass: 0.7 },
    durationInFrames: 45,
  });

  // Accent ring rotates continuously behind the badge.
  const spin = interpolate(frame, [0, durationInFrames], [0, 200]);

  const taglineIn = spring({
    frame: frame - TAGLINE_START,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const brandIn = spring({
    frame: frame - BRAND_START,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const rule = spring({
    frame: frame - TAGLINE_START,
    fps,
    config: { damping: 200 },
    durationInFrames: 36,
  });

  const letters = title.split("");

  return (
    <AbsoluteFill style={{ backgroundColor: "#05060a" }}>
      {/* Two drifting radial pools give the flat background some depth. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(55% 50% at ${46 + drift * 8}% ${38 + drift * 6}%, #24407a 0%, rgba(5,6,10,0) 68%)`,
          opacity: bloom * exit,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 45% at ${62 - drift * 10}% ${68 - drift * 5}%, #5a2f7d 0%, rgba(5,6,10,0) 70%)`,
          opacity: bloom * 0.8 * exit,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: exit,
        }}
      >
        {/* Badge with rotating accent ring. */}
        <div
          style={{
            position: "relative",
            width: 132,
            height: 132,
            marginBottom: 54,
            transform: `scale(${mark})`,
            opacity: Math.min(1, mark),
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `conic-gradient(from ${spin}deg, #4f8cff, #9d7bff, #4f8cff)`,
              filter: "blur(1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 3,
              borderRadius: "50%",
              backgroundColor: "#05060a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_STACK,
              fontSize: 54,
              fontWeight: 700,
              color: "#f4f6fb",
            }}
          >
            {brand.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Title, letter by letter. */}
        <div style={{ display: "flex" }}>
          {letters.map((char, i) => {
            const enter = spring({
              frame: frame - LETTER_START - i * LETTER_STAGGER,
              fps,
              config: { damping: 200 },
              durationInFrames: 32,
            });

            return (
              <span
                key={`${char}-${i}`}
                style={{
                  fontFamily: FONT_STACK,
                  fontSize: 148,
                  fontWeight: 700,
                  letterSpacing: -5,
                  lineHeight: 1.05,
                  color: "#f4f6fb",
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 80}px)`,
                  filter: `blur(${(1 - enter) * 14}px)`,
                  whiteSpace: "pre",
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        <div
          style={{
            width: 380,
            height: 3,
            marginTop: 38,
            borderRadius: 3,
            background: "linear-gradient(90deg, #4f8cff, #9d7bff)",
            transform: `scaleX(${rule})`,
          }}
        />

        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 36,
            fontWeight: 400,
            color: "#98a2ba",
            marginTop: 34,
            opacity: taglineIn,
            transform: `translateY(${(1 - taglineIn) * 22}px)`,
          }}
        >
          {tagline}
        </div>

        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#5c6880",
            marginTop: 58,
            opacity: brandIn * 0.75,
          }}
        >
          {brand}
        </div>
      </AbsoluteFill>

      {/* Vignette to settle the edges. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
