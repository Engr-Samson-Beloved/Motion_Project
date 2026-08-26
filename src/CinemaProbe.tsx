import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { linearBlur } from "@remotion/transitions/linear-blur";
import { zoomBlur } from "@remotion/transitions/zoom-blur";
import { filmBurn } from "@remotion/transitions/film-burn";
import {
  FilmGrade,
  HandheldCamera,
  Parallax,
  Slam,
  Track,
  beatFrames,
  beatPulse,
  useLevel,
} from "./lib/cinema";
import { BRAND, MONO_FONT } from "./skng/brand";
import { DarkField, LogoChip, NetworkGraph } from "./skng/ui";
import { LogoSlam3D } from "./skng/three/LogoSlam3D";

/**
 * A/B test rig for the cinema toolkit.
 *
 * Every beat shows the same content twice, treated and untreated, split down
 * the middle. That is the point: an effect described in a commit message always
 * sounds like an improvement, and the only honest way to judge grain, bloom or
 * motion blur is against the thing it replaced, in the same frame.
 *
 * Not intended to ship. This is the thing you look at before deciding whether
 * to touch the reel.
 */

const BED = staticFile("bed.mp3");

const Label: React.FC<{ children: React.ReactNode; side: "left" | "right" }> = ({
  children,
  side,
}) => (
  <div
    style={{
      position: "absolute",
      top: 148,
      [side]: 46,
      fontFamily: MONO_FONT,
      fontSize: 24,
      letterSpacing: 5,
      textTransform: "uppercase",
      color: BRAND.white,
      opacity: 0.72,
      zIndex: 20,
    }}
  >
    {children}
  </div>
);

/**
 * Two treatments of the same content, hard-split at the centre line.
 *
 * Each half renders the full frame and is then clipped, rather than each half
 * rendering into a half-width box — otherwise the two sides would lay out
 * differently and the comparison would be meaningless.
 */
const SplitCompare: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  leftLabel: string;
  rightLabel: string;
}> = ({ left, right, leftLabel, rightLabel }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ clipPath: "inset(0 50% 0 0)" }}>{left}</AbsoluteFill>
    <AbsoluteFill style={{ clipPath: "inset(0 0 0 50%)" }}>{right}</AbsoluteFill>

    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 2,
          marginLeft: -1,
          backgroundColor: BRAND.white,
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>

    <Label side="left">{leftLabel}</Label>
    <Label side="right">{rightLabel}</Label>
  </AbsoluteFill>
);

/** The content under test in beats 1 and 2. */
const Field: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <DarkField drift={Math.sin(frame / 60)} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <NetworkGraph frame={frame} fps={fps} radius={280} size={860} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Beat 1 - grain, bloom, vignette. */
const BeatGrade: React.FC = () => (
  <SplitCompare
    leftLabel="raw"
    rightLabel="graded"
    left={<Field />}
    right={
      <FilmGrade grain={0.26} bloom={0.42} vignette={0.5} aberration={1.1}>
        <Field />
      </FilmGrade>
    }
  />
);

/** Beat 2 - camera. Same field, one side locked to the pixel grid. */
const BeatCamera: React.FC = () => (
  <SplitCompare
    leftLabel="locked off"
    rightLabel="handheld"
    left={<Field />}
    right={
      <HandheldCamera intensity={1.15} travel={30} sway={0.7}>
        <Parallax depth={0.9}>
          <DarkField drift={0.4} />
        </Parallax>
        <Parallax depth={0.25}>
          <Field />
        </Parallax>
      </HandheldCamera>
    }
  />
);

/** The chip flies in fast enough that mid-flight frames are pure blur. */
const FlyingChip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Held back past the incoming transition. The transition's own zoom blur
  // covers the first 10 frames of this sequence, so a slam starting at 0 flies
  // entirely underneath it and the comparison shows nothing.
  const fly = spring({
    frame: frame - 18,
    fps,
    config: { damping: 10, mass: 0.7 },
    durationInFrames: 30,
  });
  // Vertical, not horizontal. A left-to-right slam spends its whole flight on
  // one side of a centre split, so the treated half has nothing to show until
  // the object has already stopped moving. Travelling down the divider keeps
  // the same object in both halves for every frame of the move.
  const y = interpolate(fly, [0, 1], [-780, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `translateY(${y}px)` }}>
        <LogoChip size={330} scale={1} />
      </div>
    </AbsoluteFill>
  );
};

/** Beat 3 - motion blur. */
const BeatBlur: React.FC = () => (
  <SplitCompare
    leftLabel="crisp"
    rightLabel="motion blur"
    left={
      <AbsoluteFill style={{ backgroundColor: BRAND.primary }}>
        <DarkField drift={0.2} />
        <FlyingChip />
      </AbsoluteFill>
    }
    right={
      <AbsoluteFill style={{ backgroundColor: BRAND.primary }}>
        <DarkField drift={0.2} />
        <Slam layers={14} lagInFrames={0.5} trailOpacity={0.55}>
          <AbsoluteFill>
            <FlyingChip />
          </AbsoluteFill>
        </Slam>
      </AbsoluteFill>
    }
  />
);

/** Beat 4 - the 3D sculpture, full frame, with a real bloom pass. */
const Beat3D: React.FC = () => (
  <AbsoluteFill>
    <LogoSlam3D />
    <Label side="left">three.js + bloom</Label>
  </AbsoluteFill>
);

/**
 * Beat grid readout.
 *
 * The tick row pulses on every beat straight from the frame number, and the
 * bars underneath come from the audio itself. If the two disagree, the bed and
 * the grid have drifted apart and nothing cut against them will land.
 */
const BeatMeter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const levels = useLevel(BED, 32);
  const pulse = beatPulse(frame, fps, 3.4);
  const step = beatFrames(fps);
  const beatIndex = Math.floor(frame / step);

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 6,
          height: 120,
          padding: "0 60px",
        }}
      >
        {levels.map((v, i) => {
          // Raw FFT magnitudes fall off a cliff above the first few bands, so
          // a linear meter is one loud bar and a flat line. sqrt for perceptual
          // loudness, plus a tilt that lifts the high bands back into view.
          const shaped = Math.min(1, Math.sqrt(v) * (0.5 + i * 0.045));
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: Math.max(4, shaped * 110),
                backgroundColor: BRAND.surface,
                opacity: 0.75,
                borderRadius: 3,
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          paddingBottom: 78,
        }}
      >
        {Array.from({ length: 8 }, (_, i) => {
          const on = i === beatIndex % 8;
          return (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: on ? BRAND.white : BRAND.surface,
                opacity: on ? 0.35 + pulse * 0.65 : 0.18,
                transform: `scale(${on ? 1 + pulse * 0.9 : 1})`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CinemaProbe: React.FC = () => {
  // 80 + 80 + 80 + 90 = 330, less three 10-frame transitions = 300.
  const t = linearTiming({ durationInFrames: 10 });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.primary }}>
      <Track src={BED} volume={0.85} fadeOutFrames={24} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={80}>
          <BeatGrade />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition timing={t} presentation={linearBlur({ intensity: 0.6 })} />

        <TransitionSeries.Sequence durationInFrames={80}>
          <BeatCamera />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition timing={t} presentation={zoomBlur({ rotation: 0.3 })} />

        <TransitionSeries.Sequence durationInFrames={80}>
          <BeatBlur />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition timing={t} presentation={filmBurn({ seed: 7 })} />

        <TransitionSeries.Sequence durationInFrames={90}>
          <Beat3D />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <BeatMeter />
    </AbsoluteFill>
  );
};
