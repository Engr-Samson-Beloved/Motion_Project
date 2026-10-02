import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FC } from "react";

import { useSandbox } from "./lib/use-sandbox";
import { editPreamble, repairPreamble, systemPrompt } from "./lib/skill";
import {
  BUILT_IN_BRANDS,
  SKNG_DARK,
  checkBrand,
  loadCustomBrands,
  saveCustomBrands,
  type BrandProfile,
} from "./lib/brand";
import {assetMap, prepareImageReference, readUserImage, type UserAsset} from "./lib/assets";
import { DIRECTIONS, findDirection, type Direction } from "./lib/direction";
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
import { scaleFor, type RenderQuality } from "./lib/render";
import { REMOTION_LICENSE_KEY } from "./lib/license";

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

const CREATIVE_STARTERS = [
  {name:"Connected wireframe", direction:"documentary", prompt:"Tell a clear story with one continuous connected wireframe board. Draw fine lines between scenes and let the camera glide along them. Reveal the full system before the final call to action."},
  {name:"Cinematic brand film", direction:"documentary", prompt:"Create a cinematic brand film with a vivid opening image, a human problem, an emotional turn, three rising visual beats, and a memorable final brand lockup. Use controlled camera movement, light, depth, and deliberate holds."},
  {name:"Fast social reel", direction:"feed", prompt:"Create a high-energy vertical social video with a visual hook in the first second, bold kinetic typography, varied compositions, fast beat-timed cuts, and a clear final call to action."},
  {name:"Product story", direction:"product", prompt:"Create a clean product story that begins with the audience problem, then reveals the product and demonstrates three benefits. Make each feature easy to read, and finish with one clear next step."},
  {name:"Editorial manifesto", direction:"poster", prompt:"Create an editorial manifesto with expressive typography, a strong central idea, considered negative space, an intentional colour system, and a final brand sign-off."},
];

const CUSTOM_FONT_OPTIONS = [
  "MontserratLocal, Montserrat, ui-sans-serif, system-ui, sans-serif",
  'ui-sans-serif, system-ui, "Segoe UI", sans-serif',
  'Georgia, "Times New Roman", serif',
  '"Courier New", ui-monospace, monospace',
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
          {checking ? "Checkingâ€¦" : "Test key & list models"}
        </button>
        {models ? (
          <span className="check-ok">
            Key works â€” {models.length} model{models.length === 1 ? "" : "s"}
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
            ? "Live from the provider â€” these are the ones this key can reach."
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

  const [busy, setBusy] = useState<null | "generating" | "repairing" | "refining">(null);
  const hasKey = credentials.apiKey.trim().length > 0;
  const [streamed, setStreamed] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"preview" | "source">("preview");

  const [saved, setSaved] = useState<SavedComposition[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState("Untitled");

  const [customBrands, setCustomBrands] = useState<BrandProfile[]>(loadCustomBrands);
  const brands = useMemo(() => [...BUILT_IN_BRANDS, ...customBrands], [customBrands]);
  const [brand, setBrand] = useState<BrandProfile>(() => loadCustomBrands()[0] ?? SKNG_DARK);
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const assetsByName = useMemo(() => assetMap(assets), [assets]);
  const [direction, setDirection] = useState<Direction>(() =>
    findDirection("feed"),
  );

  const [quality, setQuality] = useState<RenderQuality>("draft");

  const generateAbort = useRef<AbortController | null>(null);

  /**
   * Everything to do with running the composition happens in the sandbox
   * frame: compiling, playing, encoding. Nothing model-written is evaluated in
   * this page, so nothing model-written can reach the API key.
   */
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  // Destructured because `useSandbox` returns a fresh object each render; the
  // callbacks inside it are stable, the wrapper is not, and depending on the
  // wrapper in an effect would loop forever.
  const {
    state: sandboxState,
    load: loadSandbox,
    render: renderSandbox,
    cancelRender,
  } = useSandbox(frameRef);

  useEffect(() => {
    void listCompositions().then(setSaved);
  }, []);

  /**
   * /studio?example opens with the worked example already compiled, and
   * ?brand= / ?direction= pin the two axes — so a particular look can be sent
   * as a link rather than described, and the claim that one source serves every
   * brand can be checked rather than taken on trust.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const wantedBrand = params.get("brand");
    if (wantedBrand) {
      const found = [...BUILT_IN_BRANDS, ...loadCustomBrands()].find((b) => b.id === wantedBrand);
      if (found) {
        setBrand(found);
      }
    }

    const wantedDirection = params.get("direction");
    if (wantedDirection && DIRECTIONS.some((d) => d.id === wantedDirection)) {
      setDirection(findDirection(wantedDirection as Direction["id"]));
    }

    if (params.has("example")) {
      setSource(EXAMPLE_SOURCE);
      setName(EXAMPLE_NAME);
      // The recompile effect below picks it up from `source`.
    }
  }, []);

  useEffect(() => {
    saveCredentials(credentials);
  }, [credentials]);

  useEffect(() => saveCustomBrands(customBrands), [customBrands]);

  const config = sandboxState.config;

  /**
   * Recompile whenever the brand or the direction changes. This is the whole
   * thesis made visible: the same generated source, unedited, re-renders as a
   * different client in a different treatment â€” because no colour, font or
   * grade setting was ever in the source to begin with.
   */
  useEffect(() => {
    if (source) {
      void loadSandbox(source, brand, direction, assetsByName);
    }
  }, [assetsByName, brand, direction, loadSandbox, source]);

  const updateBrand = useCallback((patch: Partial<BrandProfile>) => {
    const next = {...brand, ...patch};
    setBrand(next);
    if (next.id.startsWith("custom-")) {
      setCustomBrands((prior) => prior.map((item) => item.id === next.id ? next : item));
    }
  }, [brand]);

  const createBrand = useCallback(() => {
    const next: BrandProfile = {...SKNG_DARK,id:`custom-${newId()}`,name:"My brand",forbid:[...SKNG_DARK.forbid]};
    setCustomBrands((prior)=>[...prior,next]);setBrand(next);
  }, []);

  const addImages = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const incoming = await Promise.all(Array.from(files).slice(0, Math.max(0,6-assets.length)).map(readUserImage));
      setAssets((prior) => {
        const names = new Set(prior.map((item) => item.name));
        return [...prior, ...incoming.map((item) => {
          const dot=item.name.lastIndexOf("."),stem=dot>0?item.name.slice(0,dot):item.name,ext=dot>0?item.name.slice(dot):"";
          let name=item.name;for(let i=2;names.has(name);i++)name=`${stem}-${i}${ext}`;names.add(name);return {...item,name};
        })];
      });setError(null);
    } catch (thrown) {setError(thrown instanceof Error?thrown.message:String(thrown));}
  }, [assets.length]);

  const run = useCallback(
    async (userPrompt: string, mode: "create" | "edit") => {
      setError(null);
      setBusy("generating");
      setStreamed("");
      setTab("source");

      const controller = new AbortController();
      generateAbort.current = controller;

      try {
        const imageReferences = await Promise.all(assets.map(prepareImageReference));
        const assetGuidance = assets.length
          ? `\n\nLocal image assets: ${assets.map((asset) => `${asset.name} (${asset.type})`).join(", ")}. Import {ASSETS, LOGO_SRC} from "@/brand". Use the exact provided filename in <Img src={ASSETS["filename.png"]}/>; use LOGO_SRC for the selected brand logo. Do not embed image data in the source.`
          : "";
        const generationPrompt = mode === "edit" && source
          ? `${editPreamble(source)}\n\nThe change: ${userPrompt}${assetGuidance}`
          : `${userPrompt}${assetGuidance}`;
        const first = await generateComposition({
          credentials,
          system: systemPrompt(brand, direction),
          prompt: generationPrompt,
          images: imageReferences,
          signal: controller.signal,
          onToken: (chunk) => setStreamed((prior) => prior + chunk),
        });

        setSource(first);
        let result = await loadSandbox(first, brand, direction, assetsByName);

        // One automatic repair. The model sees its own output and the error,
        // which fixes most first-attempt failures â€” a stray import, a missing
        // export â€” without the person driving having to read a stack trace.
        if (!result.ok) {
          setBusy("repairing");
          setStreamed("");
          const fixed = await generateComposition({
            credentials,
            system: systemPrompt(brand, direction),
            prompt: `${repairPreamble(first, result.message)}${assetGuidance}`,
            images: imageReferences,
            signal: controller.signal,
            onToken: (chunk) => setStreamed((prior) => prior + chunk),
          });
          setSource(fixed);
          result = await loadSandbox(fixed, brand, direction, assetsByName);
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
    [assets, assetsByName, brand, credentials, direction, loadSandbox, source],
  );

  const refinePrompt = useCallback(async () => {
    const draft = prompt.trim();
    if (!draft || !hasKey || busy) return;
    setError(null);
    setBusy("refining");
    const controller = new AbortController();
    generateAbort.current = controller;
    try {
      const refined = await generateComposition({
        credentials,
        system: `You are a creative brief editor for a motion-design video generator. Rewrite the user's rough idea into one clear, vivid, actionable prompt that the video system can execute. Preserve their subject, goal, facts, names, and requested call to action. Do not invent product features, statistics, or promises. Make the opening hook, visual progression, motion language, text hierarchy, pacing, and ending clear where useful. Keep it concise (about 70–140 words). Respect the selected brand and creative direction. Return only the refined prompt as plain text; never return code, analysis, or a preamble.`,
        prompt: `Selected brand: ${brand.name}; voice: ${brand.voice}.\nCreative direction: ${direction.name} — ${direction.note}\n\nUser's draft:\n${draft}`,
        maxTokens: 1200,
        signal: controller.signal,
      });
      const cleaned = refined.trim().replace(/^```(?:text)?\s*|\s*```$/g, "");
      if (!cleaned) throw new Error("The provider returned an empty prompt. Try again.");
      setPrompt(cleaned);
    } catch (thrown) {
      if (!controller.signal.aborted) {
        setError(thrown instanceof Error ? thrown.message : String(thrown));
      }
    } finally {
      setBusy(null);
      generateAbort.current = null;
    }
  }, [brand.name, brand.voice, busy, credentials, direction.name, direction.note, hasKey, prompt]);

  const fixRuntimeError = useCallback(async () => {
    const runtimeError = sandboxState.error;
    if (!source || !hasKey || busy || runtimeError?.stage !== "runtime") return;
    setError(null);
    setBusy("repairing");
    setStreamed("");
    setTab("source");
    const controller = new AbortController();
    generateAbort.current = controller;
    try {
      const imageReferences = await Promise.all(assets.map(prepareImageReference));
      const assetGuidance = assets.length
        ? `\n\nAvailable image filenames: ${assets.map((asset) => asset.name).join(", ")}. Use only these exact ASSETS filenames; every Img must receive a valid src.`
        : "\n\nNo image assets were provided. Remove every Img component and build visuals from available shapes and typography instead.";
      const fixed = await generateComposition({
        credentials,
        system: systemPrompt(brand, direction),
        prompt: `${repairPreamble(source, runtimeError.message)}${assetGuidance}`,
        images: imageReferences,
        signal: controller.signal,
        onToken: (chunk) => setStreamed((prior) => prior + chunk),
      });
      setSource(fixed);
      const result = await loadSandbox(fixed, brand, direction, assetsByName);
      if (result.ok) {
        setError(null);
        setTab("preview");
      } else {
        setError(`${result.stage}: ${result.message}`);
      }
    } catch (thrown) {
      if (!controller.signal.aborted) {
        setError(thrown instanceof Error ? thrown.message : String(thrown));
      }
    } finally {
      setBusy(null);
      setStreamed("");
      generateAbort.current = null;
    }
  }, [assets, assetsByName, brand, busy, credentials, direction, hasKey, loadSandbox, sandboxState.error, source]);

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
      assets,
      brand,
      direction,
      createdAt: saved.find((item) => item.id === (currentId ?? ""))?.createdAt ?? now,
      updatedAt: now,
    };
    await saveComposition(record);
    setCurrentId(record.id);
    setSaved(await listCompositions());
  }, [assets, brand, currentId, direction, name, prompt, saved, source]);

  const onExportSource = useCallback(() => {
    downloadBlob(
      new Blob([source], { type: "text/plain;charset=utf-8" }),
      `${slugify(name)}.tsx`,
    );
  }, [name, source]);

  const onExportVideo = useCallback(async () => {
    if (!config) {
      return;
    }
    setError(null);
    try {
      const blob = await renderSandbox(scaleFor(quality));
      downloadBlob(
        blob,
        `${slugify(name)}${quality === "draft" ? "-draft" : ""}.mp4`,
      );
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : String(thrown));
    }
  }, [config, name, quality, renderSandbox]);

  const openSaved = useCallback((record: SavedComposition) => {
    setCurrentId(record.id);
    setName(record.name);
    setSource(record.source);
    setPrompt(record.prompt);
    setAssets(record.assets ?? []);
    if (record.brand) setBrand(record.brand);
    if (record.direction) setDirection(record.direction);
    setTab("preview");
    setError(null);
  }, []);

  // Contrast failures are invisible in a profile and obvious in a frame. The
  // README records this repo shipping exactly that mistake — a mark drawn in
  // the brand's own green, on a field at almost the same value.
  const brandIssues = useMemo(() => checkBrand(brand), [brand]);

  const durationLabel = useMemo(() => {
    if (!config) {
      return null;
    }
    const seconds = config.durationInFrames / config.fps;
    return `${config.width}x${config.height} · ${seconds.toFixed(1)}s · ${config.fps}fps`;
  }, [config]);

  const exportBrand = useCallback(() => {
    downloadBlob(new Blob([JSON.stringify(brand, null, 2)], {type:"application/json"}), `${slugify(brand.name)}-brand.json`);
  }, [brand]);

  const importBrand = useCallback(async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 100_000) throw new Error("Brand files must be under 100 KB.");
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object") throw new Error("That file is not a brand profile.");
      const candidate = parsed as BrandProfile;
      const colorKeys = ["ground","ink","muted","accent","line","warn","stop"] as const;
      if (!colorKeys.every((key) => /^#[0-9a-f]{6}$/i.test(String(candidate[key] ?? "")))) throw new Error("Brand colours must be six-digit hex values.");
      if (typeof candidate.name !== "string" || candidate.name.length > 60) throw new Error("Add a brand name under 60 characters.");
      if (!CUSTOM_FONT_OPTIONS.includes(candidate.headingFont)) throw new Error("Choose a supported display typeface.");
      const next: BrandProfile = {...SKNG_DARK,...candidate,id:`custom-${newId()}`,logoAsset:undefined,headingFont:candidate.headingFont,bodyFont:SKNG_DARK.bodyFont,monoFont:SKNG_DARK.monoFont,headingTracking:SKNG_DARK.headingTracking,voice:candidate.voice==="caps"?"caps":"sentence",forbid:Array.isArray(candidate.forbid)?candidate.forbid.filter((x):x is string=>typeof x==="string").slice(0,12):[]};
      setCustomBrands((prior)=>[...prior,next]);setBrand(next);setError(null);
    } catch (thrown) { setError(thrown instanceof Error?thrown.message:String(thrown)); }
  }, []);

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
              disabled={busy === "refining"}
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

          <div className="prompt-tools">
            <button
              type="button"
              className="ghost"
              disabled={!prompt.trim() || !hasKey || busy !== null}
              onClick={() => void refinePrompt()}
            >
              {busy === "refining" ? "Refining brief…" : "✦ Refine prompt"}
            </button>
            <small>{hasKey ? "Uses your selected model; provider charges may apply. This won’t create a video." : "Add your API key to refine with AI."}</small>
          </div>

          {/*
            Brand and Direction are the two axes the whole tool turns on: the
            client's colour and type on one side, the film craft on the other.
            They sit above the button because they change what gets written,
            not what happens after it.
          */}
          <div className="axis-row">
            <label className="field">
              <span>Brand</span>
              <select
                value={brand.id}
                onChange={(event) => setBrand(brands.find((b) => b.id === event.target.value) ?? SKNG_DARK)}
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Direction</span>
              <select
                value={direction.id}
                onChange={(event) =>
                  setDirection(findDirection(event.target.value as Direction["id"]))
                }
              >
                {DIRECTIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="studio-tool-row">
            <button type="button" className="ghost" onClick={createBrand}>＋ New brand</button>
            <label className="ghost file-button">Import brand<input type="file" accept="application/json,.json" onChange={(event)=>{void importBrand(event.target.files?.[0]);event.currentTarget.value="";}}/></label>
            <button type="button" className="ghost" onClick={exportBrand}>Export brand</button>
          </div>

          <details className="brand-editor" open={brand.id.startsWith("custom-")}>
            <summary>Edit {brand.id.startsWith("custom-") ? "brand kit" : "brand copy"}</summary>
            <label className="field"><span>Brand name</span><input value={brand.name} maxLength={60} onChange={(event)=>updateBrand({name:event.target.value})}/></label>
            <div className="brand-colors">
              {(["ground","ink","muted","accent","line","warn","stop"] as const).map((key)=><label key={key}><span>{key}</span><input type="color" aria-label={`${key} colour`} value={brand[key]} onChange={(event)=>updateBrand({[key]:event.target.value})}/><code>{brand[key]}</code></label>)}
            </div>
            <label className="field"><span>Display typeface</span><select value={brand.headingFont} onChange={(event)=>updateBrand({headingFont:event.target.value})}>{CUSTOM_FONT_OPTIONS.map((font)=><option key={font} value={font}>{font.split(",")[0].replace(/"/g,"")}</option>)}</select></label>
            <label className="field"><span>Voice</span><select value={brand.voice} onChange={(event)=>updateBrand({voice:event.target.value as BrandProfile["voice"]})}><option value="sentence">Sentence case</option><option value="caps">Uppercase display</option></select></label>
            {brand.id.startsWith("custom-")&&<button type="button" className="ghost danger" onClick={()=>{setCustomBrands((prior)=>prior.filter((item)=>item.id!==brand.id));setBrand(SKNG_DARK);}}>Delete this brand</button>}
          </details>

          <details className="creative-starters">
            <summary>Creative starting points</summary>
            <div className="starter-list">{CREATIVE_STARTERS.map((starter)=><button key={starter.name} type="button" className="example" onClick={()=>{setPrompt(starter.prompt);setDirection(findDirection(starter.direction as Direction["id"]));}}><strong>{starter.name}</strong><span>{starter.prompt}</span></button>)}</div>
          </details>

          <details className="asset-library" open={assets.length>0}>
            <summary>Reference images · {assets.length}/6</summary>
            <label className="field file-button">Add PNG, JPEG, or WebP<input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={assets.length>=6} onChange={(event)=>{void addImages(event.target.files);event.currentTarget.value="";}}/><small>Up to 5 MB each. When you generate, images are sent to your selected AI provider as visual references and kept in this browser for rendering.</small></label>
            {assets.map((asset)=><div className="asset-row" key={asset.name}><img src={asset.dataUrl} alt=""/><span>{asset.name}</span><button type="button" className="x" aria-label={`Remove ${asset.name}`} onClick={()=>{setAssets((prior)=>prior.filter((item)=>item.name!==asset.name));if(brand.logoAsset===asset.name)updateBrand({logoAsset:undefined});}}>×</button><button type="button" className="ghost" onClick={()=>updateBrand({logoAsset:asset.name})}>{brand.logoAsset===asset.name?"Brand logo ✓":"Use as logo"}</button></div>)}
          </details>

          <div className="axis-note">
            <span className="swatches" aria-hidden="true">
              <span style={{ background: brand.ground }} />
              <span style={{ background: brand.ink }} />
              <span style={{ background: brand.accent }} />
              <span style={{ background: brand.muted }} />
            </span>
            {direction.note}
          </div>

          {brandIssues.length > 0 ? (
            <div className="axis-warn">
              {brandIssues.map((issue) => (
                <div key={issue.field}>{issue.message}</div>
              ))}
            </div>
          ) : null}

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
            <p className="status" aria-live="polite">
              {busy === "repairing"
                ? "That did not compile â€” asking for a fix"
                : busy === "refining" ? "Clarifying your brief" : "Writing"}
              {busy !== "refining" ? <span className="counter">{streamed.length} chars</span> : null}
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

          {error ?? sandboxState.error ? (
            <div className="error-bar">
              <span>{error ?? `${sandboxState.error?.stage}: ${sandboxState.error?.message}`}</span>
              {!error && sandboxState.error?.stage === "runtime" && source ? (
                <button type="button" className="ghost" disabled={!hasKey || busy !== null} onClick={() => void fixRuntimeError()}>
                  {busy === "repairing" ? "Repairing…" : "Fix with AI"}
                </button>
              ) : null}
            </div>
          ) : null}

          {/*
            The sandbox is mounted for the life of the page rather than only
            when there is something to show: it is a separate document, and
            remounting it on every generation would pay for its whole bundle
            again. It is hidden until something compiles.

            `sandbox="allow-scripts"` WITHOUT `allow-same-origin` is the point
            of the whole arrangement. That combination puts the frame on an
            opaque origin, so model-written code cannot reach this page's
            sessionStorage, where the API key lives.
          */}
          <div className="stage" hidden={tab !== "preview"}>
            {/*
              Sized even before anything compiles, and never `hidden`. A
              display:none iframe is deprioritised by the browser — it loaded
              eventually, sometimes, which presented as a preview that worked
              on one run in four. It is transparent until it has something to
              show, and the empty message sits over it.
            */}
            <div
              className="stage-frame"
              style={{
                aspectRatio: config
                  ? `${config.width} / ${config.height}`
                  : "9 / 16",
                maxWidth: `calc(62vh * ${
                  config ? config.width / config.height : 9 / 16
                })`,
                opacity: config ? 1 : 0,
              }}
            >
              <iframe
                ref={frameRef}
                title="Composition preview"
                src="/sandbox.html"
                sandbox="allow-scripts"
                style={{
                  width: "100%",
                  height: "100%",
                  border: 0,
                  display: "block",
                }}
              />
            </div>

            {!config ? (
              <div className="empty">
                <p>
                  {hasKey
                    ? "Describe a piece on the left. It compiles and plays here."
                    : "Add an API key to start. It stays in this browser."}
                </p>
              </div>
            ) : null}
          </div>

          {tab === "source" ? (
            <textarea
              className="source"
              spellCheck={false}
              value={busy && streamed ? streamed : source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="The generated composition appears here, and you can edit it."
            />
          ) : null}

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

            {config && sandboxState.support && !sandboxState.support.canRender ? (
              <span className="unsupported">
                {sandboxState.support.issues[0] ??
                  "This browser cannot encode video."}
              </span>
            ) : null}

            <select
              value={quality}
              onChange={(event) =>
                setQuality(event.target.value as RenderQuality)
              }
              aria-label="Export quality"
              disabled={sandboxState.progress !== null}
            >
              <option value="draft">Draft (half size)</option>
              <option value="full">Full size</option>
            </select>

            {sandboxState.progress ? (
              <button type="button" className="ghost danger" onClick={cancelRender}>
                Cancel {Math.round(sandboxState.progress.progress * 100)}%
              </button>
            ) : (
              <button
                type="button"
                className="primary"
                disabled={!config || sandboxState.support?.canRender === false}
                onClick={() => void onExportVideo()}
              >
                Export MP4
              </button>
            )}
          </div>

          {sandboxState.progress ? (
            <div className="progress">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.round(sandboxState.progress.progress * 100)}%`,
                }}
              />
            </div>
          ) : null}
          {!REMOTION_LICENSE_KEY ? (
            <p className="license-note">
              Before publishing: check <a href="https://www.remotion.dev/license" target="_blank" rel="noreferrer">Remotion’s licence</a> for your use. Configure <code>VITE_REMOTION_LICENSE_KEY</code> in the deployment build if required.
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
};
