import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FC } from "react";
import { Player } from "@remotion/player";

import {
  compileComposition,
  type CompiledComposition,
  type CompileResult,
} from "./lib/compile";
import { SYSTEM_PROMPT, editPreamble, repairPreamble } from "./lib/skill";
import { EXAMPLE_NAME, EXAMPLE_SOURCE } from "./lib/example";
import {
  PROVIDERS,
  clearCredentials,
  generateComposition,
  listModels,
  loadCredentials,
  saveCredentials,
  type Credentials,
  type ProviderId,
} from "./lib/providers";
import {
  deleteComposition,
  downloadBlob,
  listCompositions,
  newId,
  saveComposition,
  slugify,
  type SavedComposition,
} from "./lib/storage";
import {
  checkSupport,
  renderToBlob,
  type RenderProgress,
  type RenderQuality,
  type SupportReport,
} from "./lib/render";

const DEFAULT_CREDENTIALS: Credentials = {
  provider: "google",
  apiKey: "",
  model: "gemini-3.5-flash",
  baseUrl: "",
};

const EXAMPLES = [
  "A 10-second vertical title card: WEEK ONE lands hard, a green rule wipes under it, then a line about orientation week.",
  "15 seconds, dark: five dots find each other and wire into a network, then the word TOGETHER sets underneath.",
  "A 12-second countdown from 5 to 1, each numeral rolling over like an odometer, then RESULTS ARE OUT.",
];

/* ------------------------------------------------------------- key dialog */

const SettingsPanel: FC<{
  credentials: Credentials;
  onChange: (next: Credentials) => void;
  onClose: () => void;
}> = ({ credentials, onChange, onClose }) => {
  const provider = PROVIDERS.find((p) => p.id === credentials.provider);

  const [models, setModels] = useState<string[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  // A model list belongs to one key on one provider. Drop it whenever either
  // changes, or the picker offers models the new key cannot reach.
  useEffect(() => {
    setModels(null);
    setCheckError(null);
  }, [credentials.provider, credentials.apiKey, credentials.baseUrl]);

  const check = async () => {
    setChecking(true);
    setCheckError(null);
    try {
      const found = await listModels(credentials);
      setModels(found);
      // If the current model is not one this key can reach, the generation
      // would 404 with a message that reads like a bad key. Move to something
      // real instead, and say so by just changing the field.
      if (found.length > 0 && !found.includes(credentials.model)) {
        onChange({ ...credentials, model: found[0] });
      }
    } catch (error) {
      setCheckError(error instanceof Error ? error.message : String(error));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="sheet" role="dialog" aria-label="API key">
      <div className="sheet-head">
        <h2>Your API key</h2>
        <button type="button" className="ghost" onClick={onClose}>
          Close
        </button>
      </div>

      <p className="sheet-note">
        The key goes straight from this page to the provider. It is never sent
        anywhere else, never stored on a server, and is dropped when you close
        the tab.
      </p>

      <label className="field">
        <span>Provider</span>
        <select
          value={credentials.provider}
          onChange={(event) => {
            const id = event.target.value as ProviderId;
            const next = PROVIDERS.find((p) => p.id === id);
            onChange({
              ...credentials,
              provider: id,
              model: next?.defaultModel ?? "",
            });
          }}
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      {provider?.needsBaseUrl ? (
        <label className="field">
          <span>Base URL</span>
          <input
            type="url"
            placeholder="https://openrouter.ai/api/v1"
            value={credentials.baseUrl}
            onChange={(event) =>
              onChange({ ...credentials, baseUrl: event.target.value })
            }
          />
        </label>
      ) : null}

      <label className="field">
        <span>API key</span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="Paste your key"
          value={credentials.apiKey}
          onChange={(event) =>
            onChange({ ...credentials, apiKey: event.target.value })
          }
        />
        <small>{provider?.keyHint}</small>
      </label>

      <div className="check-row">
        <button
          type="button"
          className="ghost"
          disabled={checking || !credentials.apiKey.trim()}
          onClick={() => void check()}
        >
          {checking ? "Checking…" : "Test key & list models"}
        </button>
        {models ? (
          <span className="check-ok">
            Key works — {models.length} model{models.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {checkError ? <p className="check-error">{checkError}</p> : null}

      <label className="field">
        <span>Model</span>
        {models && models.length > 0 ? (
          <select
            value={credentials.model}
            onChange={(event) =>
              onChange({ ...credentials, model: event.target.value })
            }
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Model name"
            value={credentials.model}
            onChange={(event) =>
              onChange({ ...credentials, model: event.target.value })
            }
          />
        )}
        <small>
          {models
            ? "Live from the provider — these are the ones this key can reach."
            : "Test the key to replace this with the models it can actually reach."}
        </small>
      </label>

      <div className="sheet-actions">
        <button
          type="button"
          className="ghost danger"
          onClick={() => {
            clearCredentials();
            onChange({ ...DEFAULT_CREDENTIALS });
          }}
        >
          Forget key
        </button>
        <button type="button" className="primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- the page */

export const Studio: FC<{ onBack: () => void }> = ({ onBack }) => {
  const [credentials, setCredentials] = useState<Credentials>(
    () => loadCredentials() ?? DEFAULT_CREDENTIALS,
  );
  const [showSettings, setShowSettings] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [source, setSource] = useState("");
  const [compiled, setCompiled] = useState<CompileResult | null>(null);

  const [busy, setBusy] = useState<null | "generating" | "repairing">(null);
  const [streamed, setStreamed] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"preview" | "source">("preview");

  const [saved, setSaved] = useState<SavedComposition[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState("Untitled");

  const [support, setSupport] = useState<SupportReport | null>(null);
  const [rendering, setRendering] = useState<RenderProgress | null>(null);
  const [quality, setQuality] = useState<RenderQuality>("draft");

  const generateAbort = useRef<AbortController | null>(null);
  const renderAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    void listCompositions().then(setSaved);
  }, []);

  // /studio?example opens with the worked example already compiled, so the
  // page can be linked to as a demonstration rather than described as one.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("example")) {
      return;
    }
    setSource(EXAMPLE_SOURCE);
    setName(EXAMPLE_NAME);
    setCompiled(compileComposition(EXAMPLE_SOURCE));
  }, []);

  useEffect(() => {
    saveCredentials(credentials);
  }, [credentials]);

  const ready: CompiledComposition | null =
    compiled?.ok === true ? compiled.value : null;

  useEffect(() => {
    if (!ready) {
      setSupport(null);
      return;
    }
    let live = true;
    void checkSupport(ready.config).then((report) => {
      if (live) {
        setSupport(report);
      }
    });
    return () => {
      live = false;
    };
  }, [ready]);

  const compile = useCallback((next: string) => {
    const result = compileComposition(next);
    setCompiled(result);
    return result;
  }, []);

  const run = useCallback(
    async (userPrompt: string, mode: "create" | "edit") => {
      setError(null);
      setBusy("generating");
      setStreamed("");
      setTab("source");

      const controller = new AbortController();
      generateAbort.current = controller;

      try {
        const first = await generateComposition({
          credentials,
          system: SYSTEM_PROMPT,
          prompt:
            mode === "edit" && source
              ? `${editPreamble(source)}\n\nThe change: ${userPrompt}`
              : userPrompt,
          signal: controller.signal,
          onToken: (chunk) => setStreamed((prior) => prior + chunk),
        });

        setSource(first);
        let result = compile(first);

        // One automatic repair. The model sees its own output and the error,
        // which fixes most first-attempt failures — a stray import, a missing
        // export — without the person driving having to read a stack trace.
        if (!result.ok) {
          setBusy("repairing");
          setStreamed("");
          const fixed = await generateComposition({
            credentials,
            system: SYSTEM_PROMPT,
            prompt: repairPreamble(first, result.message),
            signal: controller.signal,
            onToken: (chunk) => setStreamed((prior) => prior + chunk),
          });
          setSource(fixed);
          result = compile(fixed);
        }

        if (result.ok) {
          setTab("preview");
          if (mode === "create") {
            setName(userPrompt.slice(0, 48) || "Untitled");
            setCurrentId(null);
          }
        } else {
          setError(`${result.stage}: ${result.message}`);
        }
      } catch (thrown) {
        if (!controller.signal.aborted) {
          setError(
            thrown instanceof Error ? thrown.message : String(thrown),
          );
        }
      } finally {
        setBusy(null);
        setStreamed("");
        generateAbort.current = null;
      }
    },
    [compile, credentials, source],
  );

  const onSave = useCallback(async () => {
    if (!source) {
      return;
    }
    const now = Date.now();
    const record: SavedComposition = {
      id: currentId ?? newId(),
      name: name.trim() || "Untitled",
      source,
      prompt,
      createdAt: now,
      updatedAt: now,
    };
    await saveComposition(record);
    setCurrentId(record.id);
    setSaved(await listCompositions());
  }, [currentId, name, prompt, source]);

  const onExportSource = useCallback(() => {
    downloadBlob(
      new Blob([source], { type: "text/plain;charset=utf-8" }),
      `${slugify(name)}.tsx`,
    );
  }, [name, source]);

  const onExportVideo = useCallback(async () => {
    if (!ready) {
      return;
    }
    setError(null);
    const controller = new AbortController();
    renderAbort.current = controller;
    setRendering({ progress: 0, encodedFrames: 0, totalFrames: ready.config.durationInFrames });

    try {
      const blob = await renderToBlob({
        component: ready.component,
        config: ready.config,
        quality,
        signal: controller.signal,
        onProgress: setRendering,
      });
      downloadBlob(blob, `${slugify(name)}${quality === "draft" ? "-draft" : ""}.mp4`);
    } catch (thrown) {
      if (!controller.signal.aborted) {
        setError(thrown instanceof Error ? thrown.message : String(thrown));
      }
    } finally {
      setRendering(null);
      renderAbort.current = null;
    }
  }, [name, quality, ready]);

  const openSaved = useCallback(
    (record: SavedComposition) => {
      setCurrentId(record.id);
      setName(record.name);
      setSource(record.source);
      setPrompt(record.prompt);
      compile(record.source);
      setTab("preview");
      setError(null);
    },
    [compile],
  );

  const durationLabel = useMemo(() => {
    if (!ready) {
      return null;
    }
    const seconds = ready.config.durationInFrames / ready.config.fps;
    return `${ready.config.width}x${ready.config.height} · ${seconds.toFixed(1)}s · ${ready.config.fps}fps`;
  }, [ready]);

  const hasKey = credentials.apiKey.trim().length > 0;

  return (
    <div className="studio">
      <header className="studio-bar">
        <a
          href="/"
          className="back"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey) {
              return;
            }
            event.preventDefault();
            onBack();
          }}
        >
          &larr; Gallery
        </a>
        <input
          className="title-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label="Composition name"
        />
        <button
          type="button"
          className={hasKey ? "ghost" : "primary"}
          onClick={() => setShowSettings(true)}
        >
          {hasKey
            ? `${PROVIDERS.find((p) => p.id === credentials.provider)?.label} · ${credentials.model}`
            : "Add API key"}
        </button>
      </header>

      {showSettings ? (
        <SettingsPanel
          credentials={credentials}
          onChange={setCredentials}
          onClose={() => setShowSettings(false)}
        />
      ) : null}

      <div className="studio-body">
        <aside className="composer">
          <label className="field">
            <span>{source ? "Describe a change" : "Describe the piece"}</span>
            <textarea
              rows={6}
              value={prompt}
              placeholder={
                source
                  ? "Make the title land harder and hold two seconds longer."
                  : "A 10-second vertical card where..."
              }
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  void run(prompt, source ? "edit" : "create");
                }
              }}
            />
          </label>

          <div className="composer-actions">
            {busy ? (
              <button
                type="button"
                className="ghost danger"
                onClick={() => generateAbort.current?.abort()}
              >
                Stop
              </button>
            ) : (
              <button
                type="button"
                className="primary"
                disabled={!prompt.trim() || !hasKey}
                onClick={() => void run(prompt, source ? "edit" : "create")}
              >
                {source ? "Apply change" : "Generate"}
              </button>
            )}
            {source && !busy ? (
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setSource("");
                  setCompiled(null);
                  setCurrentId(null);
                  setName("Untitled");
                  setError(null);
                }}
              >
                New
              </button>
            ) : null}
          </div>

          {busy ? (
            <p className="status">
              {busy === "repairing"
                ? "That did not compile — asking for a fix"
                : "Writing"}
              <span className="counter">{streamed.length} chars</span>
            </p>
          ) : null}

          {!source && !busy ? (
            <div className="examples">
              <span className="label">No key yet?</span>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setSource(EXAMPLE_SOURCE);
                  setName(EXAMPLE_NAME);
                  setCurrentId(null);
                  setError(null);
                  compile(EXAMPLE_SOURCE);
                  setTab("preview");
                }}
              >
                Load a worked example
              </button>
              <span className="label">Try</span>
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="example"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          ) : null}

          {saved.length > 0 ? (
            <div className="saved">
              <span className="label">Saved here</span>
              {saved.map((record) => (
                <div
                  key={record.id}
                  className={`saved-row${record.id === currentId ? " on" : ""}`}
                >
                  <button type="button" onClick={() => openSaved(record)}>
                    {record.name}
                  </button>
                  <button
                    type="button"
                    className="x"
                    aria-label={`Delete ${record.name}`}
                    onClick={async () => {
                      await deleteComposition(record.id);
                      setSaved(await listCompositions());
                      if (record.id === currentId) {
                        setCurrentId(null);
                      }
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </aside>

        <main className="workbench">
          <div className="tabs">
            <button
              type="button"
              className={tab === "preview" ? "on" : ""}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              className={tab === "source" ? "on" : ""}
              onClick={() => setTab("source")}
            >
              Source
            </button>
            {durationLabel ? (
              <span className="spec-inline">{durationLabel}</span>
            ) : null}
          </div>

          {error ? <div className="error-bar">{error}</div> : null}

          {tab === "preview" ? (
            <div className="stage">
              {ready ? (
                <div
                  className="stage-frame"
                  style={{
                    aspectRatio: `${ready.config.width} / ${ready.config.height}`,
                    maxWidth: `calc(62vh * ${ready.config.width / ready.config.height})`,
                  }}
                >
                  <Player
                    // Remount on every recompile, or the player keeps the
                    // previous component's internal state.
                    key={source}
                    component={ready.component}
                    inputProps={{}}
                    durationInFrames={ready.config.durationInFrames}
                    fps={ready.config.fps}
                    compositionWidth={ready.config.width}
                    compositionHeight={ready.config.height}
                    // Open partway in, not on frame 0. Almost every
                    // composition fades up from nothing, so frame 0 is an
                    // empty rectangle — which, right after a generation,
                    // looks exactly like a piece that failed to render.
                    initialFrame={Math.floor(ready.config.durationInFrames * 0.35)}
                    controls
                    loop
                    clickToPlay
                    allowFullscreen
                    style={{ width: "100%", height: "100%" }}
                    errorFallback={({ error: playerError }) => (
                      <div className="render-error">
                        <span className="render-error-label">Threw while playing</span>
                        <span className="render-error-message">
                          {playerError.message}
                        </span>
                      </div>
                    )}
                  />
                </div>
              ) : (
                <div className="empty">
                  <p>
                    {hasKey
                      ? "Describe a piece on the left. It compiles and plays here."
                      : "Add an API key to start. It stays in this browser."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <textarea
              className="source"
              spellCheck={false}
              value={busy && streamed ? streamed : source}
              onChange={(event) => {
                setSource(event.target.value);
                compile(event.target.value);
              }}
              placeholder="The generated composition appears here, and you can edit it."
            />
          )}

          <div className="export-bar">
            <button
              type="button"
              className="ghost"
              disabled={!source}
              onClick={() => void onSave()}
            >
              Save
            </button>
            <button
              type="button"
              className="ghost"
              disabled={!source}
              onClick={onExportSource}
            >
              Export .tsx
            </button>

            <div className="spacer" />

            {ready && support && !support.canRender ? (
              <span className="unsupported">
                {support.issues[0]?.message ?? "This browser cannot encode video."}
              </span>
            ) : null}

            <select
              value={quality}
              onChange={(event) =>
                setQuality(event.target.value as RenderQuality)
              }
              aria-label="Export quality"
              disabled={rendering !== null}
            >
              <option value="draft">Draft (half size)</option>
              <option value="full">Full size</option>
            </select>

            {rendering ? (
              <button
                type="button"
                className="ghost danger"
                onClick={() => renderAbort.current?.abort()}
              >
                Cancel {Math.round(rendering.progress * 100)}%
              </button>
            ) : (
              <button
                type="button"
                className="primary"
                disabled={!ready || support?.canRender === false}
                onClick={() => void onExportVideo()}
              >
                Export MP4
              </button>
            )}
          </div>

          {rendering ? (
            <div className="progress">
              <div
                className="progress-fill"
                style={{ width: `${Math.round(rendering.progress * 100)}%` }}
              />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};
