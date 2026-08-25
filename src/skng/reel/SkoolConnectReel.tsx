import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { BRAND } from "../brand";
import {
  ReelAudience,
  ReelCTA,
  ReelExplorer,
  ReelHook,
  ReelIdentity,
  ReelLogoSlam,
  ReelMentorship,
  ReelMessaging,
  ReelOffline,
  ReelProblem,
  ReelPromise,
  ReelPunch,
  ReelResources,
} from "./scenes";

/**
 * Vertical 1080x1920 social cut — 13 scenes in 1800 frames (60s at 30fps).
 *
 * Unlike the 16:9 film, scenes are butted together with no overlap: hard cuts
 * on a roughly 4-5 second cadence keep the piece moving in a feed. Each scene
 * fades in over ~5 frames rather than cross-dissolving.
 */
const SCENES = [
  { id: "hook", duration: 120, Component: ReelHook },
  { id: "problem", duration: 130, Component: ReelProblem },
  { id: "slam", duration: 110, Component: ReelLogoSlam },
  { id: "promise", duration: 120, Component: ReelPromise },
  { id: "identity", duration: 150, Component: ReelIdentity },
  { id: "explorer", duration: 150, Component: ReelExplorer },
  { id: "messaging", duration: 150, Component: ReelMessaging },
  { id: "resources", duration: 150, Component: ReelResources },
  { id: "mentorship", duration: 150, Component: ReelMentorship },
  { id: "offline", duration: 130, Component: ReelOffline },
  { id: "audience", duration: 140, Component: ReelAudience },
  { id: "punch", duration: 130, Component: ReelPunch },
  { id: "cta", duration: 170, Component: ReelCTA },
];

export const SkoolConnectReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.primary }}>
      <Series>
        {SCENES.map(({ id, duration, Component }) => (
          <Series.Sequence key={id} durationInFrames={duration}>
            <Component duration={duration} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
