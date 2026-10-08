# Studio audit: from prompt to founder-ready motion design

Date: 8 October 2026. Scope: the browser Studio in `web/`, its Remotion sandbox, provider adapters, saved designs, and browser export. This is a code and product audit, not a claim that every provider/model combination has been tested live.

## Executive finding

Studio currently produces **AI-written TSX**, not a planned video assembled from reliable design components. The path is prompt → one long code completion → compile → optional repair → preview → optional six-frame visual revision → browser MP4. Compiling proves that the file can run; it does not prove that the story, typography, motion, brand use, or exported film is good. That explains why a successful generation can still look generic.

For a product that any founder can use, the default path should become **brief → storyboard → art direction → structured scene plan → deterministic motion renderer → visual/audio checks → selective revision → export**. Keep the current TSX generation as an advanced mode, not the main quality contract.

## Current generation path

1. Founder types a prompt, chooses one of four directions and a brand, and may add up to six PNG/JPEG/WebP images (`web/studio.tsx`, `web/lib/assets.ts`). The initial brand falls back to SkoolConnectNG.
2. `productionBrief()` appends broad creative instructions. `systemPrompt()` appends a long Remotion coding contract, brand rules, and direction rules (`web/lib/brief.ts`, `web/lib/skill.ts`). There is no separate structured brief or approved storyboard.
3. The chosen provider returns one TSX file. Google uses a nonstreaming call; others stream text. All providers share a 32,000-token default and a narrow model-name filter (`web/lib/providers.ts`).
4. Sucrase transforms that TSX, `new Function()` evaluates it in an opaque-origin iframe, and the exported config is normalized (`web/lib/compile.ts`, `web/sandbox.tsx`). A failed compile triggers one model repair; errors during later frames can escape this first repair.
5. The player previews the composition. “Review & improve visuals” is optional. It samples six frames, asks a vision-capable model to rewrite the entire TSX file, and falls back to source-only revision if images are unsupported (`web/lib/stills.ts`, `web/studio.tsx`).
6. Designs and their assets save to IndexedDB in that browser. Export uses `@remotion/web-renderer` and WebCodecs to produce an MP4 in the tab (`web/lib/storage.ts`, `web/lib/render.ts`).

## Findings and risks

| Priority | Finding | Evidence and consequence | Improvement |
| --- | --- | --- | --- |
| P0 | The default creative pipeline has no explicit scene plan or design review before code generation. | `run()` sends the brief straight to `generateComposition()`. The model chooses script, visuals, timing and implementation in one answer, so even a valid file can be a sequence of generic title cards. | Generate a validated storyboard JSON first; present 2–3 genuinely different concepts, then render the selected one from reusable scene components. |
| P0 | Generated code can still reach the network from the sandbox. | `new Function()` runs with browser globals. The iframe lacks `allow-same-origin`, which protects the parent API key, but it receives uploaded image data and has no sandbox-specific CSP in `web/sandbox.html` or `vercel.json`. | Host generated output on a separate origin or isolated worker/frame with a restrictive CSP; block network and navigation for generated compositions; audit the message boundary. Treat uploaded assets as private. |
| P0 | Export is limited to browser capability and long renders run on the user's device. | `renderMediaOnWeb()` is the only export path. Older or constrained browsers, mobile memory pressure, and long 1080p videos can fail or take minutes. | Add an optional queued server render for production exports; retain browser draft exports. Show estimated duration and browser support before starting. |
| P1 | A valid key/model list does not mean the model can write long TSX or inspect images. | Model discovery filters names, not context size, output limit, coding quality or vision support. OpenAI-compatible APIs differ; a single 32k output cap is sent to all. | Store verified capabilities per model; run a short capability test; choose request shape and token budget by provider/model; offer a quality-ranked model picker and text-only fallback. |
| P1 | An incomplete model answer may be treated as code. | The SSE parser accumulates `delta.content` strings but does not inspect finish reason or detect truncation. The Google path returns empty text for blocked/empty candidates without a useful reason. | Parse finish/status metadata, reject incomplete or empty output before compile, handle provider-specific errors, and retry with a smaller scene scope. |
| P1 | Loading and resetting have race and hang paths. | `setSource(first)` triggers the `useEffect` compile while `run()` also calls `loadSandbox(first)` directly. `useSandbox.request()` has no timeout. A missing `ready` message or cancelled render can leave a pending promise. | Make one controller own each load, add request IDs/version tokens and timeouts, reject pending requests on clear/cancel/unmount, and ignore stale compiled/support messages. |
| P1 | Output validation is too shallow. | `readConfig()` silently substitutes defaults for malformed values. Compile checks the entry point and config, but no full-frame render, overflow, safe-area, contrast, missing asset, CTA or audio check runs before export. | Reject invalid config; render strategic frames and first/last seconds automatically; run text-overflow, asset, safe-area and motion checks; require a successful low-resolution proof export before marking the video ready. |
| P1 | The revision loop can lose quality or break good work. | “Review & improve visuals” rewrites the whole TSX from six samples. It does not compare before/after scores or preserve a version history. `setSource()` happens on new generations before validation. | Save immutable versions; compare contact sheets; patch only the weak scene; keep the last successful source active until the candidate passes checks. |
| P1 | Founder branding is too shallow and starts with one client's identity. | Default brand is `SKNG_DARK`; custom kits cover a few colours, font choices, voice case and an optional logo. Imported brand JSON clears `logoAsset`. There is no audience, positioning, proof, forbidden claims, imagery, motion signature or CTA guidance. | Start with a neutral brand setup wizard and persistent founder workspace; support logo, custom fonts, media, tone, audience, proof and reusable motion rules. |
| P1 | Media and sound capabilities are narrow. | Inputs accept only six small still images. The generated module list does not expose a full video/audio asset path. The house prompt enforces visual rhythm but does not create music, effects, narration or captions. | Add video/audio upload, media inspection, transcript/caption pipeline, licensed soundtrack and SFX library, and explicit silent/social or narrated modes. |
| P2 | Text motion is a coding suggestion, not a controlled design system. | `@/stage` supplies Heading, Kicker, Body and Rule. The model still authors word/letter reveals, masks, easing, sequencing and line breaks itself. | Add brand-aware word/line/letter animation components, baseline grids, fit and safe-area rules, reusable kinetic typography recipes, and live controls for weight, pace and emphasis. |
| P2 | The four directions constrain variety without guaranteeing authorship. | Documentary, Feed, Poster and Product mainly set grade, camera and timing. Feed explicitly locks the camera, which can conflict with a requested cinematic vertical move. | Separate story format, visual world, motion language, camera and tempo into independent controls; allow a prompt to override a preset intentionally. |
| P2 | Projects are local to one browser. | IndexedDB saves source/assets only on the current origin; no account, sync, team review, link sharing, undo/redo or version history exists. | Add accounts/workspaces and asset storage when multi-founder use is intended; preserve offline/local mode and exportable project bundles. |
| P2 | Export options are minimal. | Studio offers draft/full MP4 only; no alternate aspect ratio reframing, captions, transparent export, audio mix controls, or delivery presets. | Add validated social exports for 9:16, 1:1 and 16:9, poster/thumbnail, captions, format/codec choices and export checklist. |

## Comparison with current tools

- [Canva Magic Video](https://www.canva.com/video-editor/ai/) combines user clips/photos with automatic sequencing, transitions, soundtracks, brand kits and an editable video canvas. Studio is stronger at programmable custom motion but lacks this media and edit loop.
- [Adobe Express](https://news.adobe.com/news/2025/04/adobe-introduces-new-ai-powered-video-tools-adobe-express) combines on-brand controls, similar-asset generation, and generated b-roll/background footage. Studio currently cannot create or edit real footage.
- [Jitter](https://jitter.video/product/) offers direct line/word/letter text animation, easing presets, custom fonts, media and audio. Studio has motion code but few controllable typography tools.
- [Runway Edit Studio](https://help.runwayml.com/hc/en-us/articles/51683104370451-Creating-with-Edit-Studio) offers keyframe selection and before/after visual previews before applying an edit. Studio's six-frame rewrite is less targeted and has no compare/undo flow.
- [Remotion's browser renderer](https://www.remotion.dev/docs/client-side-rendering) supports local export but has browser/HTML limits. The current architecture should keep that as a fast path and provide a dependable production render path. The [Remotion editor feature list](https://www.remotion.dev/docs/editor-starter/features) shows timeline, captions, waveform and codec controls as useful reference points, not a requirement to copy the whole editor.

These are product capabilities stated in official vendor sources; they are not controlled benchmark results. An AI-written motion graphic and a generated live-action clip are different products, so a quality comparison must use the same brief and assets.

## Recommended generation system

1. **Understand the brief.** Extract brand, audience, offer, proof, CTA, format, duration, assets, tone and factual constraints into typed JSON. Show only consequential assumptions; do not invent product claims. Keep the raw prompt alongside the normalized brief.
2. **Pitch visual concepts.** Ask the model for 2–3 distinct metaphors with an opening frame, scene arc, typography treatment and transition logic. Let the founder pick or remix. Use the provider for creative decisions, not low-level timing math.
3. **Build a scene graph.** A validated schema lists scenes, text, element roles, transitions, timing, asset IDs, captions and audio cues. Reject bad duration totals, missing assets, unreadable copy and absent CTA before rendering.
4. **Render with a motion system.** Deterministic React/Remotion components implement kinetic type, connected boards, diagrams, product windows, logo reveals and scene transitions. Every component respects brand tokens, safe zones and format. Keep free-form TSX as advanced escape hatch.
5. **Review actual frames and audio.** Make a storyboard sheet plus a low-resolution proof export. Check six representative frames *and* scene boundaries, text fit, contrast, missing media, motion continuity and final CTA hold. Use a vision model only for the subjective review, with a source-only fallback.
6. **Revise selectively.** Revise a scene or property, preserve a working version, and show before/after. Track the reason for a change rather than replacing the full file blindly.
7. **Deliver.** Offer browser draft MP4, queued production MP4, social aspect variants, caption file, thumbnail, editable project and brand reuse.

## Delivery order and acceptance criteria

**Phase 1 — reliability (first):** isolate sandbox network access; remove duplicate load and pending-request hangs; reject incomplete provider responses and invalid configs; preserve last good preview; add provider capability checks. Acceptance: no stuck loading/export cancellation in repeated tests, no silent fallback dimensions, and unsupported models fail with an actionable message.

**Phase 2 — design floor:** create structured brief/storyboard schemas, 8–12 high-quality scene and kinetic-text components, brand-safe layout rules, and a contact-sheet review. Acceptance: given the same brief across supported text models, each output has the requested format/duration, a visible visual thesis, varied scene compositions, readable text and a correct final CTA; human reviewers can choose between distinct concepts.

**Phase 3 — founder product:** neutral onboarding, persistent brand kits, asset library, video/audio/captions, project versioning and targeted edits. Acceptance: two founders with different brands can produce and revise films without inherited SkoolConnectNG copy or colours, and can reopen the same project on another device.

**Phase 4 — production export and evaluation:** queued render, aspect-ratio adaptations, telemetry and repeatable evaluation. Use a test set of real founder briefs (product launch, hiring, event, fundraise, explainer, testimonial) and score brief fidelity, originality, legibility, motion, brand fit, render success and edit effort. Track median generation time and cost per approved video, not just compile success.

## What has and has not been verified

This audit is based on the current code and official product documentation. It does not include real provider completions from multiple keys, user interviews, a browser matrix, or side-by-side rendered video judging. Those are the next evidence needed to quantify output quality and provider differences.
