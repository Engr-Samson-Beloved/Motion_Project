import React from "react";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { BRAND } from "../brand";
import { FilmGrade, HandheldCamera, Track } from "../../lib/cinema";
import {
  PulseCTA,
  PulseFeed,
  PulseHook,
  PulseIgnition,
  PulseInbox,
  PulseNetwork,
  PulseOffline,
  PulseResources,
  PulseReveal,
  PulseRoles,
  PulseRooms,
  PulseScale,
  PulseVerify,
} from "./scenes";

/**
 * SkoolConnectNG - Pulse. Vertical 1080x1920, 1800 frames, 60s.
 *
 * Built entirely from the product's own material: the real transparent logo
 * lockup (no plate behind it), the real bottom-nav icons with their filled and
 * stroked states, the real tab order with Network as the centre FAB, and the
 * real role ladder and room names.
 *
 * BEAT LOCK
 * The bed runs at 100 BPM, which at 30fps is exactly 18 frames per beat. Every
 * scene duration below is a multiple of 18 and they sum to 100 beats, so each
 * hard cut lands on a beat rather than near one. Change a duration only in
 * steps of 18, and take the same number of beats off another scene.
 */

const BEAT = 18;
const b = (beats: number) => beats * BEAT;

const SCENES = [
  { id: "ignition", beats: 8, Component: PulseIgnition },
  { id: "hook", beats: 7, Component: PulseHook },
  { id: "reveal", beats: 7, Component: PulseReveal },
  { id: "feed", beats: 8, Component: PulseFeed },
  { id: "inbox", beats: 8, Component: PulseInbox },
  { id: "network", beats: 8, Component: PulseNetwork },
  { id: "resources", beats: 8, Component: PulseResources },
  { id: "verify", beats: 8, Component: PulseVerify },
  { id: "rooms", beats: 7, Component: PulseRooms },
  { id: "roles", beats: 8, Component: PulseRoles },
  { id: "offline", beats: 6, Component: PulseOffline },
  { id: "scale", beats: 7, Component: PulseScale },
  { id: "cta", beats: 10, Component: PulseCTA },
];

export const PULSE_DURATION = SCENES.reduce((n, s) => n + b(s.beats), 0);

export const SkoolConnectPulse: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BRAND.primary }}>
    <Track src={staticFile("bed.mp3")} volume={0.9} fadeOutFrames={36} />

    {/*
      The grade and the camera wrap the whole piece rather than each scene, so
      grain and drift stay continuous across every cut. Handheld intensity is
      deliberately low: at this cutting rate anything stronger reads as a wobble
      rather than as a held frame.
    */}
    <FilmGrade grain={0.2} bloom={0.32} vignette={0.42} aberration={0.7}>
      <HandheldCamera intensity={0.45} travel={20} sway={0.32} speed={0.5}>
        <Series>
          {SCENES.map(({ id, beats, Component }) => (
            <Series.Sequence key={id} durationInFrames={b(beats)}>
              <Component duration={b(beats)} />
            </Series.Sequence>
          ))}
        </Series>
      </HandheldCamera>
    </FilmGrade>
  </AbsoluteFill>
);
