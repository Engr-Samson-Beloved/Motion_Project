import { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT } from "../brand";
import { ease, eramp, ramp } from "../story/palette";

/**
 * Tokens for the fast cut.
 *
 * The darkest ground in the system, and on purpose. Every other dark piece
 * here (`story/`, `together/`, `month/`) sits on a near-black that still has
 * some lift in it, because those films hold shots long enough for a flat
 * black to look like a missing asset. This one cuts every thirty frames, and
 * at that rate the ground is never really seen — what is seen is the contrast
 * between one card of type and the next. So the ground goes to the floor and
 * the type takes all of the range.
 *
 * Same standing rule as the rest of `skng/`: solid colours only, no gradient.
 * The vignette is a grade primitive, not a fill.
 */
export const CINE = {
  ground: "#080B0D",
  /** The type, once the film can be trusted. */
  ink: "#F2F7F5",
  /**
   * The type while it cannot be. A cold grey with no green in it at all —
   * the palette's own `muted` is a green-grey and would read as brand, which
   * is exactly wrong for the four cuts that are the *problem*.
   */
  grey: "#5D6E76",
  /** Brand green, for rules and fills. */
  green: "#278058",
  /**
   * The tick, and the word "VERIFIED".
   *
   * `#278058` on `#080B0D` is about 2.1:1 — fine as a 4px rule, invisible as
   * a 3px check stroke seen for thirty frames. This is the same hue lifted
   * until it survives a cut. It is the only place the brighter tint appears,
   * so the two greens never sit side by side.
   */
  tick: "#39B87A",
  line: "#1A2227",
  /**
   * The one small line of type in the film, under the mark.
   *
   * Not `grey`. That colour exists to make four cards of type look untrusted
   * at 150px, and at 22px under a heavy vignette it stopped being a tone and
   * became unreadable. A caption and a mood are different jobs.
   */
  dim: "#9FB0B7",
} as const;

export { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT };
export { ease, eramp, ramp };

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** The measure every card of type is fitted to. */
export const MEASURE = 900;

/** Optical centre for a card of type. Slightly above the true middle. */
export const CY = 880;

/** The sign-off. */
export const SIGN = {
  lockup: 860,
  rule: 1010,
  line: 1070,
  site: 1136,
} as const;

/**
 * A bell that peaks at `at` and is zero beyond `half` frames either side.
 * The impact on a cut is symmetrical about it, not a ramp into it.
 */
export const bell = (frame: number, at: number, half: number) => {
  const d = Math.abs(frame - at);
  if (d >= half) return 0;
  return ease(1 - d / half);
};

/**
 * The entrance on every cut: a scale-and-blur slam over five frames.
 *
 * `lib/cinema` ships `Slam`, which is a real trailing blur and looks better —
 * but it re-renders its subtree once per trail layer, and this piece has
 * sixteen cuts across nine hundred frames at 1080x1920. A twelve-layer trail
 * on every one of them multiplies the render by an order of magnitude to
 * decorate a transition the audience sees for a sixth of a second. A CSS
 * blur plus an overshoot buys the same read for one draw.
 */
export const SLAM_FRAMES = 5;
export const slamAt = (frame: number, at: number) =>
  ease(Math.max(0, Math.min(1, (frame - at) / SLAM_FRAMES)));

/**
 * Blend two hex colours.
 *
 * The type walks from `grey` to `ink` across the film rather than switching
 * at a boundary. A hard switch would be an announcement — "this is the good
 * part now" — and the whole point of the grade here is that the change is
 * felt rather than pointed at.
 */
export const mix = (a: string, b: string, t: number) => {
  const p = Math.max(0, Math.min(1, t));
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * p);
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
};
