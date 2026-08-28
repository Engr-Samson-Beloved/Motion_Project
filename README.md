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
  LowerThird.tsx     3s broadcast name tag.
  CinemaProbe.tsx    A/B rig for the cinema toolkit. Not a deliverable.
  index.css          Tailwind entry.
  CharacterSheet.tsx One walk cycle at 8 phases. The rig's verification still.
  CharacterLab.tsx   The rig moving: walk, blend, wave. 180 frames.
  lib/cinema/        Brand-agnostic film-look toolkit (see below).
  lib/character/     Jointed 2D character rig and its motion cycles.
  skng/              SkoolConnectNG brand system, scenes and films.
    reel/            Vertical 9:16 cut.
    pulse/           Vertical 60s cut, beat-locked, built from product assets.
    story/           16:9 90s awareness film. Its own palette — see below.
    together/        9:16 30s character-led piece. No product UI.
    three/           3D scenes.
public/
  skng-logo.png      The mark on its own. 512x512, 73% transparent.
  skng-lockup-*.png  The full lockup, dark and light. 3375x3375, ~97% transparent.
  bed.mp3            60s music bed at 100 BPM. Beat = 18 frames at 30fps.
  bed90.mp3          90s arranged bed at 120 BPM, for the story film.
  bed30.mp3          30s arranged bed at 120 BPM, for SameQuestion.
  screens/           Captured app screens (gitignored). See its README.
scripts/
  lib/synth.js       Deterministic music-bed synthesiser. Beds are arrangements.
  measure-png.js     Alpha bounding box of a PNG, as canvas fractions.
  make-bed90.js      Arrangement for public/bed90.mp3.
  make-bed30.js      Arrangement for public/bed30.mp3.
  vo-sheet.js        Voice-over cue sheet from src/skng/story/script.ts.
  capture-screens.js Screenshots the running app into public/screens/.
  restore-binaries.ps1  Undoes the file infector. Run before long renders.
  analyze-ref.js     Reference image/video analyzer. See "References" below.
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

### LowerThird — 1920x1080, 90 frames (3s)

A broadcast-style name/role tag anchored bottom-left, designed to sit over footage.

| Frames | Beat |
|---|---|
| 0–24 | Accent bar grows upward from the baseline (`scaleY`, origin bottom) |
| 4–34 | Panel expands rightward from the bar (`scaleX`, origin left) |
| 12–44 | Name wipes in left-to-right behind a hard `clip-path` edge |
| 24–54 | Role wipes in the same way, delayed |
| 70–90 | Lockup slides 70px left and fades out |

Props: `name`, `role`.

The type counter-scales against the panel's `scaleX` so the panel can expand without
stretching the letterforms — the reveal is a clip, not a squash.

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

**Everything hangs, including trivial commands.** This machine has an active Windows
file infector. It replaces an executable with a **533,504-byte** stub (SHA-256
`AA1DD5B1…`) and preserves the original alongside it as `g<name>.exe`, plus a 0-byte
`g<name>.ico`. Infected binaries hang instead of running.

There is a script for this. Run it before any long render, and again if one stalls:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\restore-binaries.ps1
powershell -ExecutionPolicy Bypass -File scripts\restore-binaries.ps1 -ScanOnly   # report only
```

It also catches the case a size scan misses: **the stub does not always survive.**
`ffmpeg.exe` once vanished outright, leaving only the hidden `gffmpeg.exe` beside it — a
533,504-byte scan calls that clean while every ffmpeg call fails with *"not recognized as
the name of a cmdlet"*. A `g<name>.exe` whose `<name>.exe` is missing is the same
infection and needs the same restore.

Re-infection happens **during renders**, not only during `npm install`. In one session it
struck eight times across `esbuild.exe`, `ffmpeg.exe`, `ffprobe.exe` and
`chrome-headless-shell.exe` — twice within minutes of a restore.

`esbuild.exe` is the one that bites: Remotion loads `remotion.config.ts` through esbuild
on **every** command, so an infected esbuild hangs the CLI before anything starts — with
no error and no output. That failure is easy to misread: a `remotion still` that sat for
25 minutes with an `esbuild.exe` child looked exactly like a slow bundle, and was an
infected binary. **Check CPU, not just process presence** — a blocked stub burns none:

```powershell
$a=(Get-Process -Id <pid>).CPU; Start-Sleep 6; (Get-Process -Id <pid>).CPU - $a
```

With a clean esbuild the same still rendered in under a minute.

`C:\Program Files\Git\bin\bash.exe` is also infected, so anything routed through Git Bash
hangs. Use PowerShell. The real fix is a **Microsoft Defender Offline Scan** (Windows
Security → Virus & threat protection → Scan options); Defender's real-time protection
does not detect this one.

**A still that "hangs" is usually just bundling.** `remotion still` bundles the whole of
`src/` before it opens a browser, and on a cold cache that is several minutes on this
machine — with no output at all until it finishes. Before assuming a hang, check for
child processes:

```powershell
Get-CimInstance Win32_Process -Filter "ParentProcessId=<node pid>" |
  Select-Object ProcessId, Name
```

`esbuild.exe` means it is bundling; `chrome-headless-shell.exe` means it has started
rendering. Neither, after a few minutes, is a real hang. Killing it and restarting throws
the cache away and pays the cost again — the second run is the fast one.

**Headless Shell download stalls.** Remotion downloads a 113 MB Chrome Headless Shell on
first render. If the download times out repeatedly, point it at an installed Chrome
instead:

```bash
npx remotion render WelcomeScreen out/welcome.mp4 \
  --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

### SkoolConnectFilm — 1920x1080, 1800 frames (60s)

A brand film for [SkoolConnectNG](https://skoolconnect.ng), built to their published
identity. Colours, typography and the logo come from the product itself; every line of
copy is taken from their brand guidelines and concept note.

| Scene | Frames | Beat |
|---|---|---|
| Open | 258 | Network draws itself into a graph around the mark; wordmark; positioning line |
| Problem | 438 | Three failure cards that drift apart as the scene runs |
| Solution | 378 | Spokes wire four user groups into one hub |
| Difference | 378 | Contrast rows; the old way struck through in destructive red |
| Pillars | 258 | Verified / Offline-First / Secure by Default |
| Close | 180 | Mark, "The time is now.", skoolconnect.ng |

Scenes live in `src/skng/`. They overlap by 18 frames so each fade-out cross-dissolves
into the next fade-in, which is why the scene durations sum to 1890 rather than 1800.

**Brand sources**

| Token | Value | Source |
|---|---|---|
| Primary / Secondary / Accent | `#165538` / `#208251` / `#1b7247` | Brand guidelines, `app/globals.css` |
| Text / Surface | `#1a373f` / `#e4f4f1` | same |
| Destructive | `#e31e24` | used only for failure states |
| Headings | Montserrat 900, tracking -0.025em | `app/layout.tsx` implements `--font-modica` as Montserrat |

Montserrat is **self-hosted** at `src/skng/montserrat-latin.woff2` and declared in
`src/skng/fonts.css`. Do not swap this for a runtime font fetch: a stalled network
request blocks every frame of the render.

> **Never call `delayRender()` for a font here.** Remotion fakes timers during
> rendering, so a `setTimeout` safety net will never fire and the render hangs until it
> times out. Bundled `@font-face` with `font-display: block` needs no `delayRender`.

### SkoolConnectReel — 1080x1920, 1800 frames (60s)

The vertical social cut for Instagram/TikTok. Where the 16:9 film sells the *idea*,
the reel explains the *product*: what SkoolConnectNG actually does, screen by screen.

Thirteen scenes on a ~4-second cadence with **hard cuts and no overlap** — a feed
format needs pace, not cross-dissolves. Springs here run at low damping so entrances
overshoot and land, which is what makes a cut read as a hit.

| # | Scene | Frames |
|---|---|---|
| 1 | Hook — group-chat noise, "Your academic life is scattered." | 120 |
| 2 | Problem — three red-dotted failures slam in | 130 |
| 3 | Logo slam | 110 |
| 4 | Promise — "One verified network for Nigerian students." | 120 |
| 5 | Verified profile — ticks pop on school, department, matric | 150 |
| 6 | School explorer — search and institution list | 150 |
| 7 | Scoped messaging — department chat arriving live | 150 |
| 8 | Resources — past questions and notes | 150 |
| 9 | Mentorship — role progression to alumni and mentor | 150 |
| 10 | Offline-first — signal bars, "Works on a bad network." | 130 |
| 11 | Audience — Students / Aspirants / Institutions / Alumni | 140 |
| 12 | Scale — "Tens of millions of students. One network." | 130 |
| 13 | CTA — mark, "The time is now.", skoolconnect.ng | 170 |

Feature scenes render mock UI inside a `Phone` shell that includes a bottom tab bar.
The tab bar is not decoration: without it the mock screens float in empty space and
read as unfinished. The lit tab also tells the viewer which part of the app they are
looking at.

## Cinematic toolkit — `src/lib/cinema/`

Everything above animates cleanly. What separated it from footage was the layer that
sits *on top of* the animation: blur, grade, camera, sound. That layer lives here, and
it knows nothing about SkoolConnectNG, so it is reusable on the next project.

| Module | Exports | What it is for |
|---|---|---|
| `grade.tsx` | `<FilmGrade>` | Grain, bloom, vignette, chromatic aberration. One SVG filter chain and one CSS overlay — **no dependencies**. |
| `camera.tsx` | `<HandheldCamera>`, `<PushIn>`, `<Parallax>` | Puts the frame in someone's hands. Drift is sampled from `noise2D`, so it is organic but identical on every render. |
| `blur.tsx` | `<Slam>`, `<Whip>` | Motion blur. `Slam` trails one moving element; `Whip` blurs the whole frame. |
| `type.tsx` | `<FitHeading>`, `useFittedFontSize` | Type that measures itself and shrinks to fit rather than overrunning the frame. |
| `audio.tsx` | `<Track>`, `beatPulse`, `beatGrid`, `useLevel` | The music bed and the beat grid to cut against. |

### Why each one earns its place

**Motion blur is the big one.** The reel's entrances run at spring damping 10–14, so they
cross a lot of distance in very few frames. Rendered crisply that reads as *strobing*,
not speed — the eye receives a row of sharp stills. `<Slam>` is what turns a fast cut
into a hit.

> Both blur components re-render their children several times per frame. Wrap the
> smallest subtree that actually moves; wrapping a whole scene multiplies its render cost
> by the sample count for nothing.

**A locked-off frame is the strongest tell that a piece was coded rather than shot.**
`<HandheldCamera>` scales up very slightly before it drifts, so the frame can never
expose its own edges — rotation eats more margin than translation, which is why the
safety margin accounts for `sway` as well as `travel`.

**Grain, bloom and vignette are nearly free.** No library, one filter chain. The grain
seed strides through the seed space (`frame * 7919`) rather than using the raw frame
number, because consecutive `feTurbulence` seeds produce visibly similar noise fields and
the grain would appear to crawl instead of shimmer.

### The beat grid

The bed is 100 BPM, which at 30fps makes a beat **exactly 18 frames**. Nothing has to
round, and a cut on a multiple of 18 is genuinely on the beat rather than nearly on it.

```tsx
const pulse = beatPulse(frame, fps);       // 1 on the beat, decaying to 0
transform: `scale(${1 + pulse * 0.06})`    // an element that breathes with the track
```

`public/bed.mp3` is synthesized, not licensed — regenerate or replace it freely.
Remotion's bundled ffmpeg is a stripped build with no `aevalsrc` filter, so the synthesis
happens in Node and ffmpeg only does the WAV to MP3 encode.

> Current reel scene durations (120/130/110/120/150…) are **not** multiples of 18. Beat-
> syncing that piece means re-timing its cuts, not just adding the audio.

### Transitions

`@remotion/transitions` ships considerably more than the docs index suggests —
`fade`, `slide`, `wipe`, `flip`, `clock-wipe`, `book-flip`, `zoom-blur`, `dreamy-zoom`,
`film-burn`, `linear-blur`, `zoom-in-out`, `iris`, `dissolve`, `ripple`, `crosswarp`,
`cross-zoom`, `swap`, `push-cut`, `none`.

The shader-backed ones (`zoom-blur`, `film-burn`, `dreamy-zoom`, `linear-blur`, the warps)
draw through WebGL, so they need the same ANGLE renderer as three.js. Their props are all
optional but the **argument is not** — `zoomBlur()` is a type error, `zoomBlur({})` is not.

`TransitionSeries` also removes the offset arithmetic that `Series` needs for
cross-dissolves: durations sum to the real total minus the transition lengths, instead of
the `-OVERLAP` bookkeeping in `SkoolConnectFilm.tsx`.

### 3D — `src/skng/three/LogoSlam3D.tsx`

The mark rebuilt as a lit sculpture with a real `Bloom` pass via
`@react-three/postprocessing`.

Two things to know before editing it:

1. **`Config.setChromiumOpenGlRenderer("angle")` is required.** Without it a
   `<ThreeCanvas>` renders as an *empty frame* rather than throwing — a failure that
   sails straight past a green exit code. The Node render APIs ignore
   `remotion.config.ts`, so they need `chromiumOptions: {gl: "angle"}` passed directly.
2. **Nothing in that file loads a texture.** `useLoader` suspends, and a suspended
   subtree during a render pass also produces blank frames rather than an error. The
   geometry is built from numbers and the logo PNG is composited over the top as a flat
   `<Img>`, which needs no async anything.

### CinemaProbe — 1080x1920, 300 frames (10s)

The A/B rig. Each beat renders the same content twice, treated and untreated, split down
the centre line.

| Frames | Left | Right |
|---|---|---|
| 0–80 | raw | `<FilmGrade>` — grain, bloom, vignette, aberration |
| 80–160 | locked off | `<HandheldCamera>` + two `<Parallax>` layers |
| 160–240 | crisp slam | `<Slam>` motion blur |
| 240–300 | three.js sculpture with bloom, full frame | |

A beat meter runs along the bottom: the tick row pulses from the frame number, the bars
above it come from the audio. If those two disagree, the bed and the grid have drifted
and nothing cut against them will land.

This is a test rig, not a deliverable. It exists so the toolkit can be judged against
what it replaced before either film is touched.

### SkoolConnectPulse — 1080x1920, 1800 frames (60s)

The dopamine cut, built entirely from the product's own material rather than from
approximations of it.

**The real logo, with nothing behind it.** `public/skng-lockup-{dark,light}.png` come from
the product's `public/modes/`. Both are ~97% fully transparent, so the lockup floats with
no plate — which retires the white disc earlier pieces needed.

> Two traps in those files. First, `rgba` in `ffprobe` only means a file *has* an alpha
> channel, not that anything is transparent — decode it if the answer matters. Second,
> the artwork occupies only the middle of a 3375x3375 canvas (56.7% of the width for the
> dark lockup, 43.1% for the light one), so setting `width` on the `<Img>` sizes the
> empty padding and the logo lands at about half the size you asked for. `<Lockup>` holds
> the measured content box and crops to it, so `width` means the width of the logo.

**The real icons.** `pulse/icons.tsx` ports the SVG paths from
`components/navigation/bottom-nav.tsx` verbatim, including each icon's filled and stroked
states. The tab order is the product's own — Feed, Inbox, Network, Resources, Profile —
and `Network` is not a tab at all: its grid cell renders empty and a gradient FAB sits
above the bar, exactly as the app does it.

**Real product facts.** Roles are `aspirant -> student -> alumni`, gated by verification.
Rooms are named `aspirant-lounge`, `student-network`, `alumni-network`.

| # | Scene | Beats |
|---|---|---|
| 1 | Ignition — the lockup slams in over a near-black field | 8 |
| 2 | Hook — group-chat noise, "It is all scattered." | 7 |
| 3 | Reveal — the phone rises | 7 |
| 4 | Feed — your campus, not the whole internet | 8 |
| 5 | Inbox — department chat | 8 |
| 6 | Network — the centre FAB, alumni and students | 8 |
| 7 | Resources — past questions | 8 |
| 8 | Profile — verification ticks | 8 |
| 9 | Rooms — who belongs where | 7 |
| 10 | Roles — aspirant, student, alumni | 8 |
| 11 | Offline — built for a bad network | 6 |
| 12 | Scale — 170+ institutions | 7 |
| 13 | CTA — the lockup, skoolconnect.ng | 10 |

**Beat lock.** The bed is 100 BPM, so a beat is exactly 18 frames at 30fps. Every scene
duration is a multiple of 18 and they sum to **100 beats = 1800 frames = 60s**, which puts
every hard cut *on* a beat rather than near one. Change a duration only in steps of 18,
and take the same number of beats off another scene.

**The mark needs a dark ground, not a brand-green one.** The dark lockup's wordmark is
white but its mark keeps the green gradient, which sits at almost the same value as
`BRAND.primary` — on the standard dark field the map disappears and only the wordmark
reads. Logo moments use `DeepField` (near-black) for that reason.

### SkoolConnectStory — 1920x1080, 2700 frames (90s)

`src/skng/story/`. An awareness film: problem, solution, vision, voice-over led. Built to
a supplied brief whose two hardest constraints shaped every file in the directory.

| # | Scene | Time | Frames | What happens |
|---|---|---|---|---|
| 01 | `story` | 00:00–00:08 | 240 | One student. Dream, question, opportunity move toward them. Pull back: a country of students, all disconnected. |
| 02 | `scatter` | 00:08–00:22 | 420 | Eighteen clutter cards arrive and drift, faster as it goes. Duplicates. Struck-through cards for what can't be trusted. |
| 03 | `missing` | 00:22–00:34 | 360 | Hard freeze on scene 02's exact last frame. Zoom out to Nigeria. A line reaches from Lagos toward Maiduguri and stops halfway. |
| 04 | `question` | 00:34–00:43 | 270 | A green circle. People, Information, Resources, Opportunities orbit it, then converge to one point. |
| 05 | `reveal` | 00:43–00:50 | 210 | The supplied lockup. Lines extend out to nodes across the country. The interface rises into place. |
| 06 | `connect` | 00:50–01:05 | 450 | Network tab, then a growing constellation of students, then the community feed. One continuous phone. |
| 07 | `discover` | 01:05–01:18 | 390 | Resources reaching students by wire, then Discover, then verified school information. |
| 08 | `boundary` | 01:18–01:25 | 210 | A campus rectangle. The student steps out. The rectangle becomes the country. |
| 09 | `vision` | 01:25–01:30 | 150 | The full network, breathing. Logo, one line, held clean for two seconds. |

**No gradients, anywhere.** The brief says solid colours only, and that constraint reaches
further than it first looks. It rules out `DarkField`, `DeepField` and `LightField` from
`pulse/ui.tsx` — all three are radial gradients — and it rules out two thirds of the film
grade, since bloom and vignette are both falloffs. So `story/` was built from scratch
rather than assembled from the existing kit, and the grade runs
`grain 0.13 / bloom 0 / vignette 0 / aberration 0.5`. Depth comes from flat value steps
(`dark` → `dark2` → `line` → `line2`), from a hairline grid, and from scale.

The product's own FAB is a three-stop gradient disc with a blurred gradient glow behind
it. In `story/product.tsx` it is a solid green disc: same shape, same position, same
affordance, one fill instead of three. That is the only place the reproduction departs
from the app, and it departs because the brief requires it.

**Its own palette.** `story/palette.ts` is *not* `skng/brand.ts`. The brief supplies a
dark-first film palette (`#278058` on `#171E26`); `brand.ts` is the product's light-surface
palette (`#165538` on `#e4f4f1`). The two coexist — the other four compositions still use
`BRAND` and are untouched.

**Scene boundaries are fixed to the second**, which rules out `TransitionSeries`: its
overlaps would pull every subsequent cut off its timecode. Scenes dissolve themselves with
`sceneFade` on a plain `<Series>` instead. Three cuts are deliberately hard — 02 into 03
is the freeze, 05 into 06 hands a moving phone across the cut, and 08 into 09 runs
straight through.

**Durations are derived, not typed.** `framesFor()` parses the `mm:ss-mm:ss` label, and
`SkoolConnectStory.tsx` throws at import if the total is not exactly 2700. Re-time a scene
and the film tells you immediately instead of silently becoming 91 seconds.

**The map is real geography.** `story/nigeria.ts` holds a ~90-vertex outline in true
degrees and 28 real university cities by coordinate. One `<NigeriaMap>` serves scenes 03,
05, 08 and 09, because those are the same picture at four stages.

**Voice-over is a slot, not a stub.** No recording was supplied, so the film renders with
music only. The lines live in `script.ts` as cue data, `npm run vo-sheet` turns them into
a recording script with absolute timings, and flipping `VOICEOVER` in
`SkoolConnectStory.tsx` mounts `public/vo.mp3` and ducks the bed from 0.82 to 0.34. The
copy is the brief's verbatim: 208 words over 90s, or 139 wpm — it fits, with no slack.

**The bed is arranged, not looped.** `scripts/make-bed90.js` writes 90s at 120 BPM, which
is two beats per second — and since every scene boundary in the brief is a whole second,
every boundary also lands on a beat. Twelve sections follow the brief's arc
(atmospheric → tense → anticipation → open → confident → warm), with the opening in half
time so it doesn't drive. One low impact at the reveal and one at the expansion; the brief
rules out excessive booms.

```bash
npm run story-board                          # contact sheet, seconds not minutes
npm run vo-sheet                             # out/vo-script.txt
npm run bed90                                # regenerate public/bed90.mp3
npx remotion render SkoolConnectStory out/story-frames --sequence --image-format=jpeg
```

### SameQuestion — 1080x1920, 900 frames (30s)

`src/skng/together/`. A character-led piece: no product UI at all. Seven students
in seven places, each stuck on the same question. Lines find them, an answer
travels along the lines, the question marks become ticks, and they end up
waving. It makes the same argument as the 90-second film with people instead of
screens — which is the only reason it is a separate piece rather than characters
bolted onto that one.

| Frames | Beat |
|---|---|
| 0–150 | Alone. One student walks in, pushed in tight, one question mark |
| 150–330 | The camera pulls back and finds six more, each with the same question |
| 330–510 | Green lines draw between them, one edge at a time |
| 510–690 | An answer travels the lines outward from the hero; each question becomes a tick as it arrives |
| 690–810 | Everyone waving, out of phase with each other |
| 810–900 | Lockup, one line, held clean |

**One continuous shot, not a `<Series>`.** The same seven characters are on
screen throughout and the camera never cuts, so sectioning it would re-mount
every character at each boundary and lose its cycle phase.

Same brand rules as the story film — the `story/palette.ts` tokens, solid
colours only, `FilmGrade` at `bloom 0 / vignette 0` — so the two sit together.

`cast.ts` holds everything: positions, cycles, phase offsets, the edge list,
and the frame each student's answer arrives. `BEATS` there are also the section
boundaries in `scripts/make-bed30.js`; move one and move the other, or the cuts
drift off the music.

```bash
npm run same-board        # eight sampled frames, one still
npm run bed30             # regenerate public/bed30.mp3
```

## Character animation — `src/lib/character/`

A jointed 2D rig, hand-built, no dependencies and no asset files.

```tsx
import { Character, walk, idle, wave, study, blendPose } from "./lib/character";

<Character pose={walk(frame, fps)} size={520} color="#F0F6F5" farColor="#7E8B95" />
```

The rig is a *hierarchy*, not a set of independently placed parts: the shin
rotates inside the thigh's group, so bending the hip carries the whole leg and
the knee stays attached. That is the entire trick — a few sine waves in
`cycles.ts` then produce a walk rather than a twitch.

Every cycle is `f(frame) -> pose`, like everything else here. Scrubbing to frame
1,412 gives the same pose as rendering to it, with no playhead state to keep in
sync. That is the reason to rig rather than import an animation file.

| Piece | What it does |
|---|---|
| `walk(frame, fps, speed?)` | Counter-phase legs, knees bending only on the swing, arms opposing their own leg, two body rises per stride |
| `idle(frame, fps)` | A breath and a slow head drift. A held pose is the clearest tell that nothing is animating |
| `wave(frame, fps)` | A wave over an idle body, so the rest keeps breathing |
| `study(frame, fps)` | Seated, head down |
| `blendPose(a, b, t)` | Crossfades joint angles, so a walk settles into a stand instead of snapping |

**Verify with `CharacterSheet`, not by watching.** It renders one walk cycle at
eight even phases as a single still:

```bash
npx remotion still CharacterSheet out/character-sheet.png
```

If the legs alternate, the knees bend only on the swing leg, and each arm
opposes its own leg, the walk is right. `CharacterLab` (180 frames) then shows
it moving — walk, blend, wave — for when you need to see it rather than read it.

Two things the sheet caught that were invisible in code: a 10-wide arm pivoting
on the centreline vanishes inside a 28-wide torso, so shoulders sit 6 units off
axis; and the ground line has to be computed from the rig (`top + 0.9205 × height`)
rather than placed by eye, or the character hovers.

### If you want richer character work

The rig is deliberately simple — flat, jointed, silhouette-friendly, and a match
for the story film's visual language. For expressive, hand-animated character
work the route is **`@remotion/lottie`**: it takes an After Effects export and
plays it frame-accurately, so a commissioned or licensed Lottie file drops
straight in. That is a sourcing decision, not an engineering one; nothing in the
repo blocks it.

## Screenshots of the real app — `scripts/capture-screens.js`

```bash
node scripts/capture-screens.js          # SKNG_URL=... to point elsewhere
```

Writes two PNGs per route into `public/screens/`: the viewport, and the whole
scrollable page. The full-page one is the useful one — dropped into the phone
shell and translated on Y by frame, it *is* a scroll, carrying the app's real
type, spacing and data.

Runs two ways. With **`puppeteer-core`** (`npm i -D --save-exact puppeteer-core`)
it drives the Chrome already installed on this machine — no 150 MB browser
download, one small pure-JS package rather than another binary for the infector
to find — and it can carry a session cookie, so authenticated routes work. With
nothing installed it falls back to Chrome's own `--headless --screenshot` flag,
which cannot log in, cannot wait for content and cannot capture full-page.
Run `scripts\restore-binaries.ps1` after any install.

Animate them with `src/skng/story/screens.tsx`:

| Piece | What it does |
|---|---|
| `ScreenShot` | A capture in a viewport: scroll, zoom about a focus point, clip |
| `scrollAt(frame, stops)` | Eased scroll between `[frame, position]` stops — a linear scroll reads as a machine |
| `ScreenSwap` | `push` for a stack navigator, `fade` for a tab change. The outgoing screen drifts, which is most of what sells a native push |
| `Tap` | A ring where a finger went. Without it the app appears to navigate itself |
| `<Phone bare>` | Hands the whole screen over — a real capture already contains its own status bar and tab bar |

**Check `scrollRange()` before animating a scroll.** A capture only slightly
taller than the screen gives a few dozen pixels of travel: 1750×3820 in a
454×940 screen is 51px, which reads as a glitch. A small range means the page
was captured at the viewport instead of full-page, or the screen genuinely does
not scroll and the beat should hold.

**Screenshots and animation trade off against each other**, and this is the
thing to decide per beat. A screenshot is one flat bitmap — it can scroll, hold,
swap, zoom and be masked, but a single card cannot fly out of it and connect to
something else. Beats that need elements to come apart use the rebuilt
components in `story/product.tsx`; beats that need to say "this is really the
product" use a capture. The two are meant to be mixed in one film.

## The working loop — script, storyboard, reference

Three pieces exist because the feedback loop was wrong. Four full renders went into
this project chasing things a one-minute check would have caught: a logo at half
size, a mark invisible against its own brand colour, a phone with 500px of dead
space above it.

### 1. The script is data — `src/skng/pulse/script.ts`

Everything anyone would want to change lives in one file that imports no React:
copy, scene lengths, which tab is lit, and every list row, message bubble and chip.

```ts
{
  id: "network",
  beats: 8,
  kicker: "Network",
  title: "Find the people who have been there.",
  tab: 2,
  screen: "Network",
  items: [{ kind: "person", who: "TA", name: "Tunde A.", meta: "Alumni, Software Engineer", alum: true }],
}
```

Timing is in **beats, not frames**. One beat is 18 frames at 100 BPM and 30fps, so
cuts land on the music by construction. `SkoolConnectPulse` throws at import if the
total drifts from 100 beats — otherwise the piece still renders and just quietly
stops landing on the beat.

Any scene id without a dedicated renderer falls through to the phone layout, so
adding a product screen needs no code — only a script entry with `tab`, `screen`
and `items`.

### 2. The storyboard — see it before you render

```bash
npm run storyboard      # ~45s, writes out/storyboard.png
```

All thirteen scenes as one contact sheet, each frozen 62% of the way through so
every entrance has landed. Numbered, labelled with scene id, timecode, beats and
frames. Judge layout, copy and pacing here; a full render is twenty minutes.

> Each cell shifts its scene's clock with `<Sequence from={-previewFrame}>`.
> `<Freeze frame={n}>` reads like the right tool and is not — on a one-frame
> composition it leaves every cell empty.

### 3. References — `refs/`

```bash
npm run ref -- refs/something.mp4
```

Frame-differences a reference to find its actual cut points, then fits a tempo to
them:

```
cutting   12 cuts over 60s · median shot 144 frames at 30fps
tempo     best fit 100 BPM (18 frames/beat) confidence 0.778 -> cut to music
          to match: set BPM 100 and make every scene a multiple of 18 frames
```

For an image it reports the dominant palette with shares and luminance, and whether
the frame is low-, mid- or high-key.

See `refs/README.md` for what direction to give alongside a reference. Dependency
free — it decodes small PNGs directly, because Remotion's bundled ffmpeg has no
`fps` filter and no `rawvideo` muxer.

> Cut detection needs a minimum gap between cuts. A hard cut is one spike in frame
> difference, but a fast move — a motion-blurred slam, a shader transition — is a
> *run* of large diffs. Without the gap, a piece with 12 real cuts reports 22, and
> the false ones drag the tempo fit below its confidence threshold.

## Adding a composition — the working recipe

Every piece in this repo was built and confirmed with the same five steps. Follow them
in order; each one fails loudly, so you always know which stage broke.

**1. Write the component.** Copy an existing file as the pattern: typed props exported
alongside the component, timing constants named and grouped at the top, springs for
entrances and `interpolate` for fades.

**2. Register it in `Root.tsx`.** Give it an `id`, dimensions, `fps`,
`durationInFrames`, and `defaultProps` typed with `satisfies`.

**3. Typecheck before rendering.** Rendering is slow; typechecking is seconds.

```bash
npm run lint
```

**4. Render it.**

```bash
npx remotion render <Id> out/<name>.mp4 \
  --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

Success looks like `Rendered 90/90`, then `Encoded 90/90`, then a size line. Exit code 0.

**5. Verify the file rather than trusting the exit code.** Confirm the container really
holds what you intended:

```bash
node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe -v error \
  -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames \
  -of default=noprint_wrappers=1 out/<name>.mp4
```

Then look at actual frames — pick timestamps that land mid-animation, where mistakes
show, not just the final held pose:

```bash
node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe -v error \
  -ss 0.95 -i out/<name>.mp4 -frames:v 1 -vf scale=760:-1 -y frame.png
```

A mid-wipe frame is the useful one: if a reveal is broken, a half-revealed frame shows
it and a finished frame does not.

## Where output goes

| What | Where |
|---|---|
| Rendered video | `C:\Remotion\out\` (gitignored) |
| Live preview | `localhost:3000` via `npm run dev` |
| Extracted frames | wherever you point `-y` |

**Encode step fails but frames render fine?** Render an image sequence and encode
separately — this splits the long frame pass from the short encode:

```bash
npx remotion render <Id> out/frames --sequence --image-format=jpeg --jpeg-quality=94
ffmpeg -framerate 30 -i out/frames/element-%03d.jpeg -i public/bed.mp3 \
  -map 0:v -map 1:a -t <seconds> \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart out/<name>.mp4
```

An image sequence carries no audio, so the bed is muxed in at this step rather than
coming from `<Track>`. That also means the tail fade `<Track>` applies is lost — add it
in ffmpeg, or accept a hard out on a test render.

> Remotion's bundled ffmpeg is a **stripped build**. It has `libmp3lame`, `aac` and
> `libx264`, but no `aevalsrc`, no `alimiter`, no `afade` and no `overlay`. Check with
> `ffmpeg -filters` before reaching for one rather than debugging the escaping.

**A graded piece will not encode at CRF 18.** Film grain is unique noise on every frame,
so inter-frame prediction has nothing to predict and the encoder preserves all of it.
`SkoolConnectPulse` came out at **586 MB** that way — roughly 78 Mbps. For delivery, cap
the rate:

```bash
-c:v libx264 -preset slow -crf 25 -maxrate 12M -bufsize 24M
```

Lowering the grain does **not** get you out of this. `SkoolConnectStory` runs grain at
0.13 — well under Pulse's 0.2 — and still came out at **331 MB** on plain `-crf 21`, or
29.5 Mbps for 90 seconds. Capped at `-crf 24 -maxrate 10M -bufsize 20M` it is 37.9 MB with
no visible loss. Assume any `<FilmGrade>` composition needs the cap.

That is 51 MB for the same 60 seconds, and the grain still reads. Ungraded compositions
are fine at CRF 18; check the file size on anything using `<FilmGrade>`.

**Render crashes partway with `target-closed` / "The browser crashed while rendering
frame N".** Memory, not code. At 1080x1920 with several full-frame composited layers,
concurrency 6 exhausts Chrome; 3 is stable. Lower `--concurrency` before suspecting the
composition.

## Status

Verified end to end: install, eslint, `tsc`, bundling, and full renders.

| Composition | Output | Result |
|---|---|---|
| `SkoolConnectStory` | `out/skoolconnect-story-90s.mp4` | h264 **1920x1080** 30fps, 2700 frames, 90.000s, AAC stereo, 37.9 MB |
| `SameQuestion` | `out/same-question-30s.mp4` | h264 1080x1920 30fps, 900 frames, 30.000s, AAC stereo, 9.6 MB |
| `CharacterLab` | `out/character-lab.mp4` | h264 1920x1080 30fps, 180 frames, 6.000s, 136 kB |
| `SkoolConnectPulse` | `out/skoolconnect-pulse-60s.mp4` | h264 1080x1920 30fps, 1800 frames, 60.000s, AAC stereo, 56.3 MB |
| `CinemaProbe` | `out/cinema-probe.mp4` | h264 1080x1920 30fps, 300 frames, 10.000s, **+ AAC stereo**, 15.0 MB |
| `SkoolConnectReel` | `out/skoolconnect-reel-60s.mp4` | h264 **1080x1920** 30fps, 1800 frames, 59.93s, 10.4 MB |
| `SkoolConnectFilm` | `out/skoolconnect-60s.mp4` | h264 1920x1080 30fps, 1800 frames, 59.93s, 7.9 MB |
| `WelcomeScreen` | `out/welcome.mp4` | h264 1920x1080 30fps, 150 frames, 5.056s, 1.2 MB |
| `LowerThird` | `out/lower-third.mp4` | h264 1920x1080 30fps, 90 frames, 197 kB |

## Goal

A repeatable pipeline for short motion graphics: a library of composable, prop-driven
animated pieces, previewed in Studio and rendered to MP4. `WelcomeScreen` and
`TextMotion` are the reference pattern — a typed props contract, timing constants
declared at the top, and springs doing the motion.
