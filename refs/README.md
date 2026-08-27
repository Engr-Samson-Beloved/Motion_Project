# References and direction

Drop a reference here, run one command, and the piece gets built against numbers
instead of adjectives.

```bash
node scripts/analyze-ref.js refs/your-video.mp4
node scripts/analyze-ref.js refs/your-frame.png
```

Media files in this folder are gitignored; the `.json` profiles are committed, so
the style target travels with the repo even when the source file does not.

## What it tells you

**For a video** — the cut points, found by frame differencing. That gives the
reference's real cutting rhythm, and then a tempo fit checks whether those cuts sit
on a musical grid:

```
cutting
  12 cuts over 60s  (12/min)
  shot length: median 4.8s  mean 5.449s  range 4.067-8.533s
  median shot = 144 frames at 30fps

tempo
  best fit 100 BPM  (18 frames/beat)  confidence 0.778  -> cut to music
  to match: set BPM 100 and make every scene a multiple of 18 frames
```

That last line is the whole point. "Fast and punchy" is not something anyone can
build against; "every scene is a multiple of 18 frames" is.

Confidence above ~0.5 means the reference was cut to music and its grid can be
reused directly. Below that, the cutting is not musical and the median shot length
is the thing to copy instead.

**For an image** — dominant palette with each colour's share and luminance, plus
whether the frame is low-key, mid-key or high-key.

## The direction that actually helps

A reference answers *look* and *pace*. It cannot answer intent. Four things worth
saying alongside it, roughly in order of how much they change the work:

1. **The one thing that must land.** If a viewer remembers a single fact after
   sixty seconds, which fact? Everything else is staging for it.
2. **What to take from the reference, and what to ignore.** "Its pace, not its
   palette" and "its palette, not its pace" produce completely different pieces.
   Without this the reference gets copied wholesale, including the parts that
   fight the brand.
3. **Where it is going.** A feed autoplays muted with a thumb hovering; a pitch
   deck plays with sound and attention. Same content, different cut.
4. **What is off limits.** Colours, claims, or competitor comparisons to avoid.

Notes on an existing cut are cheapest by scene id, since those are stable and
appear on the storyboard:

> `network` is weak — cut it to 6 beats and give the 2 to `verify`
> `hook` copy should be sharper
> `scale` — the stat is doing all the work, drop the headline

## The loop

```bash
# 1. edit src/skng/pulse/script.ts        copy, beats, screens, list content
npm run lint                            # ~20s, catches beat drift and type errors
npm run storyboard                      # ~45s, all 13 scenes as one still
# 2. look at out/storyboard.png, iterate on the script
# 3. only then render                    ~20min
```

Step 2 is the one that matters. Four full renders were spent this project on things
a storyboard would have shown in a minute: a logo at half size, a mark invisible
against its own brand colour, a phone with 500px of dead space above it.
