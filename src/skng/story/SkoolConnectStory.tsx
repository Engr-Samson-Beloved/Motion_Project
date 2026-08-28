import React from "react";
import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { FilmGrade, HandheldCamera, Track } from "../../lib/cinema";
import { STORY } from "./palette";
import { rendererFor } from "./scenes";
import { SCRIPT, TARGET_FRAMES, TOTAL_FRAMES, framesFor } from "./script";

/**
 * SkoolConnectNG — the 90-second story film. 1920x1080, 2700 frames.
 *
 * This file is only assembly. What the film says and how long each beat runs
 * live in `script.ts`; how a beat is drawn lives in `scenes.tsx`; the visual
 * vocabulary lives in `ui.tsx`, `product.tsx`, `chaos.tsx` and `map.tsx`.
 *
 * Two constraints from the brief shape everything below:
 *
 * 1. Solid colours only. There is no gradient anywhere in `story/` — which
 *    also means the grade runs with `bloom` and `vignette` at zero, since both
 *    of those are falloffs. Grain and a hair of chromatic aberration are
 *    texture rather than gradient, and they are what is left of the film look.
 *
 * 2. Scene boundaries are fixed to the second. That rules out a
 *    `TransitionSeries`, whose overlaps would pull every subsequent cut off
 *    its timecode; scenes dissolve themselves instead, via `sceneFade`.
 */

if (TOTAL_FRAMES !== TARGET_FRAMES) {
  // Silent otherwise: the film still renders, it just stops being 90 seconds
  // and every timecode in the brief stops being true.
  throw new Error(
    `Script is ${TOTAL_FRAMES} frames (${(TOTAL_FRAMES / 30).toFixed(2)}s), ` +
      `expected ${TARGET_FRAMES} (90s). Check the scene timecodes in script.ts.`,
  );
}

export const STORY_DURATION = TOTAL_FRAMES;

/**
 * Voice-over.
 *
 * The film is built for one — the brief says the voice-over carries the
 * narrative — but no recording was supplied, so it renders with music only.
 * Drop a 90-second `public/vo.mp3` cut to the timings in `out/vo-script.txt`
 * and flip this to true; the bed ducks under it automatically.
 */
const VOICEOVER = false;
const VO_FILE = "vo.mp3";

/** The bed sits back when there is a voice over it to sit back for. */
const BED_VOLUME = VOICEOVER ? 0.34 : 0.82;

export const SkoolConnectStory: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: STORY.dark }}>
    <Track src={staticFile("bed90.mp3")} volume={BED_VOLUME} fadeOutFrames={60} />
    {VOICEOVER ? <Audio src={staticFile(VO_FILE)} volume={1} /> : null}

    <FilmGrade grain={0.13} bloom={0} vignette={0} aberration={0.5}>
      {/*
        Barely there. The film is mostly flat fields and hairlines, and on that
        material a strong handheld reads as a wobble in the artwork rather than
        as a camera. Enough drift that the frame is being held, no more.
      */}
      <HandheldCamera intensity={0.3} travel={16} sway={0.18} speed={0.4}>
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
