# Motion_Project

Motion graphics built with [Remotion](https://remotion.dev) — video authored as React
components and rendered frame by frame.

## The core idea

A video here is not a timeline file. It is a React component that is re-rendered once
per frame. The only input that changes between frames is the frame number:

```tsx
const frame = useCurrentFrame();   // 0, 1, 2, ... 149
```

Your job is to answer one question: **given frame N, what does the picture look like?**
Remotion calls your component once per frame, screenshots each result, and encodes the
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
  index.ts           Entry point. Hands Root.tsx to Remotion. Never needs editing.
  Root.tsx           Registers every composition: size, fps, duration, default props.
  WelcomeScreen.tsx  5s welcome title card.
  TextMotion.tsx     4s text reveal.
  index.css          Tailwind entry.
remotion.config.ts   Bundler + render settings.
```

`Root.tsx` is the spec sheet — change a video's dimensions or length there. The
component files are the artwork — change how things look and move there.

## Compositions

### WelcomeScreen — 1920x1080, 150 frames (5s)

| Frames | Beat |
|---|---|
| 0–30 | Background blooms in: two drifting radial pools, blue and violet, over near-black |
| 6–51 | Circular badge springs in with slight overshoot, showing the brand initial |
| 6–150 | Conic-gradient ring rotates continuously behind the badge |
| 26–~80 | Title reveals letter by letter, 3-frame stagger, each rising 80px through a blur |
| 66–102 | Gradient rule wipes out; tagline rises and fades in |
| 82–112 | Brand lockup fades in, letterspaced caps |
| 134–150 | Everything fades out together |

Props: `title`, `tagline`, `brand`.

### TextMotion — 1920x1080, 120 frames (4s)

| Frames | Beat |
|---|---|
| 0–32 | Title words spring in, staggered 4 frames apart, rising 90px through a blur |
| 22–52 | Gradient rule wipes out horizontally |
| 34–62 | Subtitle rises and fades in |
| 0–120 | Slow 1.0 → 1.06 push-in across the whole scene |
| 106–120 | Shared exit fade |

Props: `title`, `subtitle`.

## How to use it

### Design loop

```bash
npm run dev
```

Opens Remotion Studio at `localhost:3000`. Scrub the timeline to inspect any frame,
edit props live in the right-hand panel, and save a file to hot-reload the preview.

### Render to a file

```bash
npx remotion render WelcomeScreen out/welcome.mp4
npx remotion render TextMotion out/text.mp4
```

`out/` is gitignored. Add `--props='{"title":"..."}'` to render a variant without
editing code.

### Before committing

```bash
npm run lint     # eslint + tsc
```

## Tuning guide

Duration lives in `Root.tsx` (`durationInFrames`). Exit fades are derived from it, so
shortening a composition keeps its fade at the tail automatically.

Timing constants sit at the top of each component file:

```
LETTER_STAGGER / WORD_STAGGER   gap between entrances — raise for a lazier reveal
RULE_START, TAGLINE_START, ...  frame each beat begins
EXIT_LENGTH                     frames reserved for the closing fade
```

Feel is controlled by `spring`'s `damping`. `200` settles with no overshoot; the badge
uses `13` for a deliberate bounce. Lower means springier.

## Troubleshooting

**Headless Shell download stalls.** Remotion downloads a 113 MB Chrome Headless Shell on
first render. If the download times out repeatedly, point it at an installed Chrome
instead:

```bash
npx remotion render WelcomeScreen out/welcome.mp4 \
  --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

## Status

Verified end to end: install, eslint, `tsc`, bundling, and a full render.
`out/welcome.mp4` renders as h264 1920x1080, 30fps, 150 frames, 5.056s.

## Goal

A repeatable pipeline for short motion graphics: a library of composable, prop-driven
animated pieces, previewed in Studio and rendered to MP4. `WelcomeScreen` and
`TextMotion` are the reference pattern — a typed props contract, timing constants
declared at the top, and springs doing the motion.
