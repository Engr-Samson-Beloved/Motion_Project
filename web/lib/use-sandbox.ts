/**
 * The composer's side of the sandbox.
 *
 * Holds the iframe, speaks the protocol, and exposes the three things the page
 * actually needs: what compiled, whether this browser can encode it, and
 * promises for a render or a set of stills.
 *
 * The frame is created with `sandbox="allow-scripts"` and deliberately WITHOUT
 * `allow-same-origin`. That combination is what makes this worth doing: the
 * frame lands on an opaque origin, so generated code cannot reach the
 * composer's `sessionStorage` — where the API key lives — cannot read its
 * cookies, and cannot touch its DOM.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { BrandProfile } from "./brand";
import type { Direction } from "./direction";
import type { CompositionConfig } from "./compile";
import {
  unwrap,
  wrap,
  type FromSandbox,
  type ToSandbox,
} from "./sandbox-protocol";

export type SandboxState = {
  ready: boolean;
  config: CompositionConfig | null;
  error: { stage: string; message: string } | null;
  support: { canRender: boolean; issues: string[] } | null;
  progress: { progress: number; encodedFrames: number; totalFrames: number } | null;
};

type Pending = {
  resolve: (value: never) => void;
  reject: (reason: Error) => void;
};

export type CompileOutcome =
  | { ok: true; config: CompositionConfig }
  | { ok: false; stage: string; message: string };

export const useSandbox = (frame: RefObject<HTMLIFrameElement | null>) => {
  const [state, setState] = useState<SandboxState>({
    ready: false,
    config: null,
    error: null,
    support: null,
    progress: null,
  });

  const pending = useRef(new Map<string, Pending>());
  // Messages sent before the frame says "ready" would be dropped, so they wait.
  const queue = useRef<ToSandbox[]>([]);
  const isReady = useRef(false);

  const post = useCallback(
    (message: ToSandbox) => {
      const target = frame.current?.contentWindow;
      if (!target || !isReady.current) {
        queue.current.push(message);
        return;
      }
      target.postMessage(wrap(message), "*");
    },
    [frame],
  );

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      // The frame is on an opaque origin, so `event.origin` is "null" and
      // cannot identify it. Checking the source window is what authenticates.
      if (event.source !== frame.current?.contentWindow) {
        return;
      }
      const message = unwrap<FromSandbox>(event.data);
      if (!message) {
        return;
      }

      switch (message.type) {
        case "ready": {
          isReady.current = true;
          setState((s) => ({ ...s, ready: true }));
          const backlog = queue.current;
          queue.current = [];
          for (const queued of backlog) {
            frame.current?.contentWindow?.postMessage(wrap(queued), "*");
          }
          break;
        }
        case "compiled": {
          setState((s) =>
            message.ok
              ? { ...s, config: message.config, error: null, support: null }
              : {
                  ...s,
                  config: null,
                  support: null,
                  error: { stage: message.stage, message: message.message },
                },
          );
          // Resolves rather than rejects on a failed compile: the repair loop
          // wants the error as a value it can hand back to the model, not a
          // throw it has to catch.
          pending.current.get(message.requestId)?.resolve(
            (message.ok
              ? { ok: true, config: message.config }
              : {
                  ok: false,
                  stage: message.stage,
                  message: message.message,
                }) as never,
          );
          pending.current.delete(message.requestId);
          break;
        }
        case "support":
          setState((s) => ({
            ...s,
            support: { canRender: message.canRender, issues: message.issues },
          }));
          break;
        case "render-progress":
          setState((s) => ({
            ...s,
            progress: {
              progress: message.progress,
              encodedFrames: message.encodedFrames,
              totalFrames: message.totalFrames,
            },
          }));
          break;
        case "render-done": {
          pending.current.get(message.requestId)?.resolve(message.blob as never);
          pending.current.delete(message.requestId);
          setState((s) => ({ ...s, progress: null }));
          break;
        }
        case "render-error": {
          pending.current
            .get(message.requestId)
            ?.reject(new Error(message.message));
          pending.current.delete(message.requestId);
          setState((s) => ({ ...s, progress: null }));
          break;
        }
        case "stills-done": {
          pending.current
            .get(message.requestId)
            ?.resolve(message.images as never);
          pending.current.delete(message.requestId);
          break;
        }
        case "stills-error": {
          pending.current
            .get(message.requestId)
            ?.reject(new Error(message.message));
          pending.current.delete(message.requestId);
          break;
        }
        case "runtime-error":
          setState((s) => ({
            ...s,
            error: { stage: "runtime", message: message.message },
          }));
          break;
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [frame]);

  const request = useCallback(
    <T,>(build: (requestId: string) => ToSandbox) => {
      const requestId = `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      return new Promise<T>((resolve, reject) => {
        pending.current.set(requestId, {
          resolve: resolve as (value: never) => void,
          reject,
        });
        post(build(requestId));
      });
    },
    [post],
  );

  /** Resolves with the compile outcome, so the repair loop can await it. */
  const load = useCallback(
    (source: string, brand: BrandProfile, direction: Direction) => {
      setState((s) => ({ ...s, error: null }));
      return request<CompileOutcome>((requestId) => ({
        type: "load",
        source,
        brand,
        direction,
        requestId,
      }));
    },
    [request],
  );

  const render = useCallback(
    (scale: number) =>
      request<Blob>((requestId) => ({ type: "render", scale, requestId })),
    [request],
  );

  const stills = useCallback(
    (frames: number[]) =>
      request<string[]>((requestId) => ({
        type: "stills",
        frames,
        requestId,
      })),
    [request],
  );

  const cancelRender = useCallback(() => {
    post({ type: "cancel-render" });
    setState((s) => ({ ...s, progress: null }));
  }, [post]);

  return { state, load, render, stills, cancelRender };
};
