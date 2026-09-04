/**
 * Exporting an MP4, in the tab.
 *
 * This is the step that makes "without using the terminal" literally true.
 * `renderMediaOnWeb` walks the DOM once per frame, paints it to a canvas and
 * encodes through WebCodecs, so the machine doing the work is the viewer's —
 * no headless Chrome, no ffmpeg, no Lambda, and nothing for the host to run.
 *
 * Two things are worth knowing before changing anything here. The renderer
 * paints CSS itself rather than using Chrome's compositor, so it supports a
 * subset — check a piece before promising an export of it. And a full-length
 * 1080p render is minutes of sustained work in a tab, which is why draft mode
 * exists and why every call takes an AbortSignal.
 */

import {
  canRenderMediaOnWeb,
  renderMediaOnWeb,
  type CanRenderIssue,
} from "@remotion/web-renderer";
import type React from "react";
import type { CompositionConfig } from "./compile";

export type RenderProgress = {
  /** 0 to 1. */
  progress: number;
  encodedFrames: number;
  totalFrames: number;
};

export type RenderQuality = "draft" | "full";

/** Draft halves the linear dimensions, so it is a quarter of the pixels and
 *  roughly a quarter of the time. Enough to check timing and composition. */
export const scaleFor = (quality: RenderQuality) =>
  quality === "draft" ? 0.5 : 1;

export type RenderRequest = {
  component: React.FC<Record<string, unknown>>;
  config: CompositionConfig;
  scale: number;
  signal: AbortSignal;
  onProgress: (progress: RenderProgress) => void;
};

export type SupportReport = {
  canRender: boolean;
  issues: CanRenderIssue[];
};

/**
 * Asked once, before the button is offered. Finding out that a browser cannot
 * encode h264 at the *end* of a five-minute render is the failure this avoids.
 */
export const checkSupport = async (
  config: CompositionConfig,
): Promise<SupportReport> => {
  try {
    const result = await canRenderMediaOnWeb({
      width: config.width,
      height: config.height,
      container: "mp4",
    });
    return { canRender: result.canRender, issues: result.issues };
  } catch (error) {
    return {
      canRender: false,
      issues: [
        {
          type: "webcodecs-unavailable",
          severity: "error",
          message:
            error instanceof Error
              ? error.message
              : "This browser cannot encode video.",
        },
      ],
    };
  }
};

export const renderToBlob = async ({
  component,
  config,
  scale,
  signal,
  onProgress,
}: RenderRequest): Promise<Blob> => {
  const result = await renderMediaOnWeb({
    composition: {
      id: "preview",
      component,
      width: config.width,
      height: config.height,
      fps: config.fps,
      durationInFrames: config.durationInFrames,
      defaultProps: {},
    },
    inputProps: {},
    container: "mp4",
    scale,
    signal,
    onProgress: ({ progress, encodedFrames }) => {
      onProgress({
        progress,
        encodedFrames,
        totalFrames: config.durationInFrames,
      });
    },
  });

  return result.getBlob();
};
