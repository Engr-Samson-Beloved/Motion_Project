# Motion_Project

Motion graphics built with [Remotion](https://remotion.dev) — video authored as React
components and rendered frame by frame.

## The core idea

A video here is not a timeline file. It is a React component that is re-rendered once
per frame. The only input that changes between frames is the frame number:

```tsx
const frame = useCurrentFrame();   // 0, 1, 2, ... 119
```

Your job is to answer one question: **given frame N, what does the picture look like?**
Remotion calls your component 120 times, screenshots each result, and encodes the
sequence into a video. Animation is therefore just math — mapping a frame number onto a
position, an opacity, a scale.

Two helpers do nearly all the work:

| Helper | What it does | Feels like |
|---|---|---|
| `interpolate(frame, [0, 30], [0, 1])` | Straight-line map from a frame range to a value range | Linear, mechanical |
| `spring({frame, fps})` | Physics-based settle from 0 to 1 | Natural, weighted |

`interpolate` is right for fades and slow drifts. `spring` is right for anything that
should feel like it has mass — entrances, pops, slides.

## File map

```
src/
  index.ts          Entry point. Hands Root.tsx to Remotion. Never needs editing.
  Root.tsx          Lists every composition in the project.
  Composition.tsx   Registers "TextMotion": its size, fps, length, default text.
  TextMotion.tsx    The actual animation. This is where design work happens.
  index.css         Tailwind entry.
remotion.config.ts  Bundler + render settings.
```

The split between `Composition.tsx` and `TextMotion.tsx` matters:

- **`Composition.tsx` is the spec sheet** — dimensions, frame rate, duration, and the
  default props. Change the video's length or size here.
- **`TextMotion.tsx` is the artwork** — what actually gets drawn and how it moves.
  Change the look here.

## What is built

One composition, `TextMotion` — 1920x1080, 30fps, 120 frames (4 seconds).

| Frames | Beat |
|---|---|
| 0–32 | Title words spring in, staggered 4 frames apart; each rises 90px as opacity and a 12px blur resolve |
| 22–52 | Gradient rule wipes outward horizontally (`scaleX` 0 → 1) |
| 34–62 | Subtitle rises 24px and fades in |
| 0–120 | Slow push-in across the whole scene, 1.0 → 1.06 |
| 106–120 | Everything fades out together |

The stagger is what makes it read as designed rather than as a single block moving:
each word's spring is offset by `i * WORD_STAGGER` frames, so they arrive in sequence.

Text is prop-driven (`title`, `subtitle`), so the wording can be changed in the Studio
without touching code.

## How to use it

### Design loop

```bash
npm run dev
```

Opens Remotion Studio at `localhost:3000`. This is the main workspace:

- **Scrub the timeline** to inspect any frame. Motion problems are almost always
  visible in a single frame held still.
- **Edit props in the right-hand panel** to retype the title and subtitle live.
- **Save a file and the preview hot-reloads** — the normal React feedback loop.

### Render to a file

```bash
npx remotion render TextMotion out/text.mp4
```

`out/` is gitignored. Add `--props='{"title":"...","subtitle":"..."}'` to render a
variant without editing code.

### Before committing

```bash
npm run lint     # eslint + tsc
```

## Tuning guide

Change duration in `Composition.tsx` (`durationInFrames`); the exit fade is derived from
it, so shortening the video keeps the fade at the tail automatically.

In `TextMotion.tsx`, the timing constants sit at the top of the file:

```
WORD_STAGGER   gap between word entrances — raise for a lazier reveal
RULE_START     frame the accent line begins its wipe
SUBTITLE_START frame the subtitle begins
EXIT_LENGTH    frames reserved for the closing fade
```

Feel is controlled by `spring`'s `damping`. It is currently `200` throughout, which
settles with no overshoot. Lower it (~12) for a springy bounce.

## Status

Verified: dependency install, eslint, `tsc`, and rspack bundling.

Not yet verified: the animation has never been viewed or rendered. Chrome-launching
operations (`remotion render`, `remotion still`, `remotion compositions`) hang in the
authoring agent's environment. Running `npm run dev` locally is the outstanding step —
it will confirm both that the piece looks right and whether the hang is environment
specific.

## Goal

Reach a repeatable pipeline for short motion graphics: a library of composable animated
pieces driven by props, previewed in Studio and rendered to MP4. `TextMotion` is the
first piece and the reference pattern — a typed props contract, timing constants
declared at the top, and springs doing the motion.
