import { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT } from "../brand";
import { ease, eramp, ramp } from "../story/palette";

/**
 * Light-mode palette for the vertical product tour.
 *
 * The 90-second film and SameQuestion are dark-first: `STORY.dark` ground,
 * light type. This piece inverts that, because it is built around captured
 * screens of the product and the product is a light app. A dark ground would
 * turn every device into a bright rectangle punched out of a black field, and
 * the eye would read the hole rather than the screen.
 *
 * The tokens are the brief's, used at their light-surface roles:
 *
 *   green   #278058 unchanged — the one accent, and the only saturated colour
 *   ink     #171E26 unchanged, now as type on light rather than ground
 *   field   a flat near-white mint, a step lighter and cooler than the app's
 *           own #E6F3F1 so a device separates from the ground behind it
 *
 * `muted` is the one token that cannot cross over directly. #8AAA9F is a
 * legible caption colour on #171E26 and an illegible one on #F4F8F6, so the
 * light palette carries a darkened flat tint of it for type and keeps the
 * original for hairlines. `story/palette.ts` already derives `line`/`line2`
 * the same way.
 *
 * Same rule as the rest of `skng/`: solid colours only. No gradient anywhere
 * in this module. Depth is flat value steps, scale and motion.
 */
export const TOUR = {
  green: "#278058",
  ink: "#171E26",
  ink2: "#3A4653",

  /** Caption type. A darkened flat tint of the brief's #8AAA9F. */
  muted: "#5E7A72",
  /** Hairlines and rules. The brief's muted, which is what it is good at. */
  hair: "#8AAA9F",
  /** The grid, at the faintest step that still survives the grain. */
  grid: "#DCE9E4",

  field: "#F4F8F6",
  white: "#FFFFFF",
} as const;

export { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT };
export { ease, eramp, ramp };

export const FPS = 30;

/** Vertical 1080p. Every layout number in `tour/` is in this space. */
export const W = 1080;
export const H = 1920;

/**
 * A bell that peaks at `at` and is zero beyond `half` frames either side.
 *
 * Transitions in this piece are symmetrical about a boundary rather than
 * tacked onto the end of a scene, so most of the timing wants "how far into a
 * move are we" rather than a one-way ramp.
 */
export const bell = (frame: number, at: number, half: number) => {
  const d = Math.abs(frame - at);
  if (d >= half) return 0;
  return ease(1 - d / half);
};
