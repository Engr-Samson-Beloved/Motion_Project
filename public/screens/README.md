# Captured app screens

`node scripts/capture-screens.js` writes two PNGs per route here:

- `<name>.png` — the viewport exactly. One phone screen, for beats that hold.
- `<name>-full.png` — the whole scrollable page. This is the useful one:
  dropped into the phone shell and translated on Y by frame, it *is* a scroll,
  with the app's own type, spacing and data rather than a reconstruction.

Capture at deviceScaleFactor 3. The phone sits around 470px wide in a 1080p
frame, so 3x leaves headroom to push in on a card without the text mushing.
Do not capture at 1x.

Animate them with `src/skng/story/screens.tsx` — `ScreenShot`, `scrollAt`,
`ScreenSwap`, `Tap`, and `Phone bare` from `product.tsx`. Check `scrollRange()`
before animating a scroll: a capture only slightly taller than the screen gives
a few dozen pixels of travel, which reads as a glitch rather than as a scroll.

A screenshot is one flat bitmap. It can scroll, hold, swap, zoom and be masked,
but a single card cannot fly out of it — beats that need that use the rebuilt
components in `product.tsx` instead. Mixing the two is the point: screenshots
for "this is really the product", rebuilt UI for anything that has to come
apart.

The PNGs themselves are gitignored. They are large, they go stale as soon as
the app changes, and they may contain real user data. Re-capture rather than
commit.
