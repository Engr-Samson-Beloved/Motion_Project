import React from "react";
import { AbsoluteFill } from "remotion";
import { ScreenClip, clip } from "./skng/tour/clip";

/**
 * Temporary rig for verifying `ScreenClip` against a real video file.
 *
 * Not a deliverable. Delete this file and its registration once the video path
 * has been proven — it depends on a gitignored test asset that will not exist
 * in a fresh checkout.
 */

const TEST = clip("screens/_selftest.mp4", 804, 1638, 91);

export const ClipProbe: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#F4F8F6" }}>
    <ScreenClip clip={TEST} cx={540} cy={960} width={560} crop={{ top: 0.06, bottom: 0.06 }} outlined />
  </AbsoluteFill>
);
