import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { BRAND } from "./brand";
import {
  SceneClose,
  SceneDifference,
  SceneOpen,
  SceneProblem,
  SceneSolution,
  ScenePillars,
} from "./scenes";

/**
 * A 60-second brand film for SkoolConnectNG (1800 frames at 30fps).
 *
 * Scenes are overlapped by OVERLAP frames so each scene's own fade-out
 * cross-dissolves into the next scene's fade-in. Because of that overlap the
 * scene durations below sum to 1890, not 1800: 1890 - (5 x 18) = 1800.
 */
const OVERLAP = 18;

const SCENES = [
  { id: "open", duration: 258, Component: SceneOpen },
  { id: "problem", duration: 438, Component: SceneProblem },
  { id: "solution", duration: 378, Component: SceneSolution },
  { id: "difference", duration: 378, Component: SceneDifference },
  { id: "pillars", duration: 258, Component: ScenePillars },
  { id: "close", duration: 180, Component: SceneClose },
];

export const SkoolConnectFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.primary }}>
      <Series>
        {SCENES.map(({ id, duration, Component }, i) => (
          <Series.Sequence
            key={id}
            durationInFrames={duration}
            offset={i === 0 ? 0 : -OVERLAP}
          >
            <Component duration={duration} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
