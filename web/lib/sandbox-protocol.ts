/**
 * The wire between the composer and the sandbox.
 *
 * Generated code used to be evaluated with `new Function` in the main page,
 * which meant it ran in the page's global scope: it could call `fetch`, and it
 * could read `sessionStorage` — where the API key was kept. The module map
 * restricted what generated code could *import*; it never restricted what it
 * could *reach*. That is the gap this protocol closes.
 *
 * The composition now runs in an iframe carrying `sandbox="allow-scripts"` and
 * NOT `allow-same-origin`, which puts it on an opaque origin: no access to the
 * parent's storage, no same-origin DOM, no cookies. Everything crosses as a
 * structured-cloned message, so only data passes — never a live function.
 *
 * That constraint shapes the design. A React component cannot be sent over
 * `postMessage`, so the player and the encoder live inside the frame too, and
 * the parent drives them by message rather than by calling them.
 */

import type { BrandProfile } from "./brand";
import type { Direction } from "./direction";
import type { CompositionConfig } from "./compile";

/** Nothing here may hold a function; everything is structured-cloneable. */
export type ToSandbox =
  | {
      type: "load";
      source: string;
      brand: BrandProfile;
      direction: Direction;
      requestId: string;
    }
  | { type: "render"; scale: number; requestId: string }
  | { type: "cancel-render" }
  /** Frames for the critic, as PNG data URLs. */
  | { type: "stills"; frames: number[]; requestId: string };

export type FromSandbox =
  | { type: "ready" }
  | { type: "compiled"; requestId: string; ok: true; config: CompositionConfig }
  | {
      type: "compiled";
      requestId: string;
      ok: false;
      stage: string;
      message: string;
    }
  | { type: "support"; canRender: boolean; issues: string[] }
  | {
      type: "render-progress";
      progress: number;
      encodedFrames: number;
      totalFrames: number;
    }
  | { type: "render-done"; requestId: string; blob: Blob }
  | { type: "render-error"; requestId: string; message: string }
  | { type: "stills-done"; requestId: string; images: string[] }
  | { type: "stills-error"; requestId: string; message: string }
  /** A throw from inside the composition while playing. */
  | { type: "runtime-error"; message: string };

/**
 * Both sides check this. An opaque-origin iframe posts with `origin: "null"`,
 * so the origin cannot be used to authenticate the peer — the tag plus the
 * fact that we only ever accept messages from our own frame's `contentWindow`
 * is what does it.
 */
export const CHANNEL = "motion-project/sandbox/1";

export type Envelope<T> = { channel: typeof CHANNEL; payload: T };

export const wrap = <T,>(payload: T): Envelope<T> => ({
  channel: CHANNEL,
  payload,
});

export const unwrap = <T,>(data: unknown): T | null => {
  if (
    typeof data === "object" &&
    data !== null &&
    (data as Envelope<T>).channel === CHANNEL
  ) {
    return (data as Envelope<T>).payload;
  }
  return null;
};
