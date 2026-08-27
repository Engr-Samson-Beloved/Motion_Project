import React from "react";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { BRAND } from "../brand";
import { FilmGrade, HandheldCamera, Track } from "../../lib/cinema";
import { rendererFor } from "./scenes";
import { SCRIPT, TARGET_BEATS, TOTAL_BEATS, TOTAL_FRAMES, framesFor } from "./script";

/**
 * SkoolConnectNG - Pulse. Vertical 1080x1920, 1800 frames, 60s.
 *
 * This file is only assembly. What the piece says, how long each scene runs and
 * what is on each screen all live in `script.ts`; how a scene is drawn lives in
 * `scenes.tsx`. Editing the piece should almost always mean editing the script.
 *
 * Built from the product's own material: the real transparent logo lockup with
 * no plate behind it, the real bottom-nav icons with their filled and stroked
 * states, the real tab order with Network as the centre FAB, and the real role
 * ladder and room names.
 */

if (TOTAL_BEATS !== TARGET_BEATS) {
  // Beat drift is silent otherwise: the piece still renders, it just stops
  // landing its cuts on the music. Fail loudly at import instead.
  throw new Error(
    `Script is ${TOTAL_BEATS} beats, expected ${TARGET_BEATS}. ` +
      `Add or remove beats elsewhere so the total holds.`,
  );
}

export const PULSE_DURATION = TOTAL_FRAMES;

export const SkoolConnectPulse: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BRAND.primary }}>
    <Track src={staticFile("bed.mp3")} volume={0.9} fadeOutFrames={36} />

    {/*
      The grade and the camera wrap the whole piece rather than each scene, so
      grain and drift stay continuous across every cut. Handheld intensity is
      deliberately low: at this cutting rate anything stronger reads as a wobble
      rather than as a held frame.
    */}
    {/*
      Vignette stays low on purpose. DarkField and DeepField already carry
      their own ink falloff, so a strong global vignette double-darkens the
      dark scenes and, worse, turns the light ones (rooms, scale) into flat
      grey — black at 42% over white is grey, and no amount of brightening
      inside the scene can win against it.
    */}
    <FilmGrade grain={0.2} bloom={0.32} vignette={0.2} aberration={0.7}>
      <HandheldCamera intensity={0.45} travel={20} sway={0.32} speed={0.5}>
        <Series>
          {SCRIPT.map((scene) => {
            const Renderer = rendererFor(scene);
            return (
              <Series.Sequence key={scene.id} durationInFrames={framesFor(scene)}>
                <Renderer scene={scene} />
              </Series.Sequence>
            );
          })}
        </Series>
      </HandheldCamera>
    </FilmGrade>
  </AbsoluteFill>
);
