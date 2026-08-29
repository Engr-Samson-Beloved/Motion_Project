# Captured app screens

Two different kinds of capture end up here, and they animate differently.

## Device mockups (what `CampusTour` uses)

Rendered mockups of the live site — frame, bezel and a baked drop shadow, one
viewport per file. The seven at 804×1638 are the source for `src/skng/tour/`.

Run the tools **in this order** after any re-capture:

```bash
npm run probe-screens     # geometry and colour: what did we actually get?
npm run screens           # patch: locate the screen, paint the widget out
```

`patch-screens.js` moves originals to `raw/` and re-derives from them, so it is
safe to run repeatedly. It prints the screen rect inside each frame, which is
what a full-bleed crop needs.

Three things to know before using them:

- **Do not wrap them in `<Phone>`.** The artwork already contains the phone.
  The mockup *is* the element.
- **They do not scroll.** Every file is the same height, so there is no page
  below the fold. `scrollRange()` returns nothing useful. Use `Lens` and
  push-ins from `src/skng/tour/device.tsx` instead.
- **They arrive with the capture tool's floating widget on them** — a black disc
  near the right edge, in the same place every time, sitting over the app.
  `npm run screens` paints it out.

## Full-page captures (what `story/` expects)

`node scripts/capture-screens.js` writes two PNGs per route:

- `<name>.png` — the viewport exactly. One screen, for beats that hold.
- `<name>-full.png` — the whole scrollable page. Dropped into the phone shell
  and translated on Y by frame, it *is* a scroll, with the app's own type,
  spacing and data rather than a reconstruction.

Capture at deviceScaleFactor 3. The phone sits around 470px wide in a 1080p
frame, so 3x leaves headroom to push in on a card without the text mushing.
Do not capture at 1x.

Animate them with `src/skng/story/screens.tsx` — `ScreenShot`, `scrollAt`,
`ScreenSwap`, `Tap`, and `Phone bare` from `product.tsx`. Check `scrollRange()`
before animating a scroll: a capture only slightly taller than the screen gives
a few dozen pixels of travel, which reads as a glitch rather than as a scroll.

## Both kinds

A screenshot is one flat bitmap. It can scroll, hold, swap, zoom and be masked,
but a single card cannot fly out of it — beats that need that use the rebuilt
components in `product.tsx`. Mixing the two is the point: screenshots for "this
is really the product", rebuilt UI for anything that has to come apart.

The PNGs themselves are gitignored, `raw/` included. They are large, they go
stale as soon as the app changes, and they may contain real user data.
Re-capture rather than commit.
