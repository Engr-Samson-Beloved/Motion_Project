/**
 * The sandbox.
 *
 * This entry point runs inside an opaque-origin iframe and is the only place
 * model-written code is ever evaluated. It has no API key, no access to the
 * parent's storage, and nothing worth stealing: even if a generated
 * composition tried, `sessionStorage` here belongs to a different origin from
 * the one the composer uses, and reading it throws.
 *
 * Because a React component cannot cross `postMessage`, the player and the
 * encoder live here too. The parent sends source and settings; this sends back
 * compile results, progress, and finished blobs.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";

import { compileComposition, type CompiledComposition } from "./lib/compile";
import { checkSupport, renderToBlob } from "./lib/render";
import { renderStills } from "./lib/stills";
import {
  unwrap,
  wrap,
  type FromSandbox,
  type ToSandbox,
} from "./lib/sandbox-protocol";
import "./sandbox.css";

const send = (message: FromSandbox) => {
  window.parent.postMessage(wrap(message), "*");
};

const Sandboxed = () => {
  const [ready, setReady] = useState<CompiledComposition | null>(null);
  const [sourceKey, setSourceKey] = useState("");
  const renderAbort = useRef<AbortController | null>(null);

  const onMessage = useCallback(async (event: MessageEvent) => {
    /*
      Deliberately not checking `event.source === window.parent`.

      Across the opaque-origin boundary this frame runs on, the parent's
      WindowProxy seen through `window.parent` and the one arriving as
      `event.source` are not reliably the same object — the check silently
      dropped every command and cost an afternoon to find.

      It is also the wrong place for that check. The isolation that matters
      runs the other way: the parent authenticates this frame before trusting
      anything from it, because this frame is where untrusted code runs. This
      frame holds nothing worth protecting — no key, no storage, no origin —
      so the channel tag is enough to ignore unrelated chatter.
    */
    const message = unwrap<ToSandbox>(event.data);
    if (!message) {
      return;
    }

    if (message.type === "load") {
      /*
        Wrapped because `compileComposition` only catches what happens inside
        the generated code. Building the module map around it — the brand, the
        direction, the stage components — happens first and can throw on its
        own, and an unhandled rejection here is invisible: the parent simply
        never hears back and shows an empty frame with no explanation.
      */
      let result;
      try {
        result = compileComposition(
          message.source,
          message.brand,
          message.direction,
        );
      } catch (error) {
        setReady(null);
        send({
          type: "compiled",
          requestId: message.requestId,
          ok: false,
          stage: "modules",
          message:
            error instanceof Error
              ? `${error.message}\n${error.stack ?? ""}`
              : String(error),
        });
        return;
      }
      if (!result.ok) {
        setReady(null);
        send({
          type: "compiled",
          requestId: message.requestId,
          ok: false,
          stage: result.stage,
          message: result.message,
        });
        return;
      }

      setReady(result.value);
      setSourceKey(message.source);
      send({
        type: "compiled",
        requestId: message.requestId,
        ok: true,
        config: result.value.config,
      });

      const support = await checkSupport(result.value.config);
      send({
        type: "support",
        canRender: support.canRender,
        issues: support.issues.map((i) => i.message),
      });
      return;
    }

    if (message.type === "cancel-render") {
      renderAbort.current?.abort();
      return;
    }

    if (message.type === "render") {
      if (!ready) {
        send({
          type: "render-error",
          requestId: message.requestId,
          message: "Nothing compiled to render.",
        });
        return;
      }
      const controller = new AbortController();
      renderAbort.current = controller;
      try {
        const blob = await renderToBlob({
          component: ready.component,
          config: ready.config,
          scale: message.scale,
          signal: controller.signal,
          onProgress: (progress) =>
            send({
              type: "render-progress",
              progress: progress.progress,
              encodedFrames: progress.encodedFrames,
              totalFrames: progress.totalFrames,
            }),
        });
        send({ type: "render-done", requestId: message.requestId, blob });
      } catch (error) {
        if (!controller.signal.aborted) {
          send({
            type: "render-error",
            requestId: message.requestId,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      } finally {
        renderAbort.current = null;
      }
      return;
    }

    if (message.type === "stills") {
      if (!ready) {
        send({
          type: "stills-error",
          requestId: message.requestId,
          message: "Nothing compiled to sample.",
        });
        return;
      }
      try {
        const images = await renderStills(
          ready.component,
          ready.config,
          message.frames,
        );
        send({ type: "stills-done", requestId: message.requestId, images });
      } catch (error) {
        send({
          type: "stills-error",
          requestId: message.requestId,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }, [ready]);

  useEffect(() => {
    const listener = (event: MessageEvent) => void onMessage(event);
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [onMessage]);

  useEffect(() => {
    send({ type: "ready" });
  }, []);

  if (!ready) {
    return <div className="sandbox-empty" />;
  }

  /*
    Fills the frame rather than setting its own aspect. The composer already
    sizes the iframe to the composition's aspect ratio, and an `aspect-ratio`
    here with no resolved width collapsed the stage to nothing — which rendered
    as a black rectangle that looked exactly like a composition that had failed.
  */
  return (
    <div className="sandbox-stage">
      <Player
        key={sourceKey}
        component={ready.component}
        inputProps={{}}
        durationInFrames={ready.config.durationInFrames}
        fps={ready.config.fps}
        compositionWidth={ready.config.width}
        compositionHeight={ready.config.height}
        // Open partway in. Almost every composition fades up from nothing, so
        // frame 0 is an empty rectangle — which right after a generation looks
        // exactly like a piece that failed to render.
        initialFrame={Math.floor(ready.config.durationInFrames * 0.35)}
        controls
        loop
        clickToPlay
        style={{ width: "100%", height: "100%" }}
        errorFallback={({ error }) => {
          send({ type: "runtime-error", message: error.message });
          return (
            <div className="sandbox-error">
              <span>Threw while playing</span>
              <span>{error.message}</span>
            </div>
          );
        }}
      />
    </div>
  );
};

const el = document.getElementById("root");
if (!el) {
  throw new Error("#root is missing from sandbox.html");
}
createRoot(el).render(<Sandboxed />);
