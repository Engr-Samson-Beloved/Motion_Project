/**
 * Contact sheets, rendered in the browser.
 *
 * This is the automation of a habit the README argues for at length: look at
 * the piece before committing to a full pass. Four renders went into this repo
 * chasing things a one-minute check would have caught — a logo at half size, a
 * mark invisible against its own brand colour, a phone with 500px of dead space
 * above it. The answer then was a still of every scene.
 *
 * `renderStillOnWeb` makes that cheap enough to do on every generation, and the
 * frames are exactly what a vision model needs to judge the piece. Both bugs
 * found while building Brand × Direction — a grey ground where the brand's
 * near-black should have been, a heading clipped by the frame edge — were
 * invisible in the source and obvious in a frame.
 */

import { renderStillOnWeb } from "@remotion/web-renderer";
import type React from "react";
import type { CompositionConfig } from "./compile";

/**
 * Frames worth looking at.
 *
 * Not evenly spaced. An even sample lands on held poses, which all look fine;
 * the useful frames are the ones where something is mid-move. These sit at
 * fractions chosen so the first is after the opening has landed and the last is
 * before the exit fade has taken everything away.
 */
export const sampleFrames = (durationInFrames: number, count = 6) => {
  const fractions = [0.12, 0.28, 0.42, 0.58, 0.74, 0.88];
  const chosen = fractions.slice(0, count);
  return chosen.map((f) =>
    Math.min(durationInFrames - 1, Math.max(0, Math.round(durationInFrames * f))),
  );
};

/**
 * Renders each frame to a JPEG data URL.
 *
 * JPEG at 0.8 and half scale on purpose: these go into a vision model, where a
 * lossless 1080x1920 PNG is a great many tokens for no extra signal. Clipped
 * type and a mark that vanishes into its ground are both perfectly legible at
 * this size.
 */
export const renderStills = async (
  component: React.FC<Record<string, unknown>>,
  config: CompositionConfig,
  frames: number[],
): Promise<string[]> => {
  const images: string[] = [];

  for (const frame of frames) {
    const still = await renderStillOnWeb({
      composition: {
        id: "still",
        component,
        width: config.width,
        height: config.height,
        fps: config.fps,
        durationInFrames: config.durationInFrames,
        defaultProps: {},
      },
      inputProps: {},
      frame,
      scale: 0.5,
    });

    const blob = await still.blob({ format: "jpeg", quality: 0.8 });
    images.push(await blobToDataUrl(blob));
  }

  return images;
};

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the rendered frame."));
    reader.readAsDataURL(blob);
  });
