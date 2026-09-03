import { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT } from "../brand";
import { TOUR, bell, ease, eramp, ramp } from "../tour/theme";

/**
 * Tokens and geometry for the monthly community update.
 *
 * Light, and deliberately the opposite of `month/`. That piece is a poster —
 * one word on a near-black ground, made to stop a thumb. This one is an
 * *update*: a number, a grid of three hundred people, and something to go and
 * do. It is closer to a page than to a poster, and pages in this system are
 * light. `tour/theme.ts` already argued the light palette out, so this reuses
 * `TOUR` verbatim rather than inventing a third one.
 *
 * Same standing rule as everywhere in `skng/`: solid colours only. No gradient
 * in this module — the dot field gets its depth from opacity steps on one
 * green, not from a falloff.
 */
export const LIGHT = {
  ...TOUR,
  /** The card the grid and the copy sit on. */
  card: TOUR.white,
  /** Its hairline, and the empty slots below the filled grid. */
  edge: "#DCE9E4",
} as const;

export { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT };
export { bell, ease, eramp, ramp };

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** Story and status UI eats both ends of the frame on every platform. */
export const SAFE_TOP = 190;
export const SAFE_BOTTOM = 1750;

/* ── The dot field ────────────────────────────────────────────────────── */

/**
 * Three hundred students, drawn as three hundred dots.
 *
 * 20 x 15 is exactly 300, which is the whole reason the grid is that shape:
 * the claim on screen is countable. A field of "roughly this many" dots would
 * have been easier to lay out and would quietly turn a fact into a decoration.
 *
 * The three rows *below* the filled ones are the other half of the message.
 * They are drawn as empty slots and faded out downward rather than closed off
 * with a border, because "the space is still fresh" is a statement about room
 * to grow, and a bounded grid would imply a cap — 300 of 360 reads as nearly
 * full, which is the opposite of what is being said.
 */
export const GRID = {
  cols: 20,
  rows: 15,
  /** Square pitch. Equal spacing both ways or it reads as a table. */
  pitch: 38,
  dot: 16,
  /** First column centre. 179 + 19*38 = 901, symmetric about 540. */
  x0: 179,
  y0: 800,
  /** Empty rows shown beneath the filled ones. */
  spare: 3,
} as const;

/**
 * How many dots wide the arriving band is.
 *
 * Each dot ramps in over this many dots of fill, which puts a soft travelling
 * edge across the grid instead of a hard one. It also means the fill has to be
 * driven `DOT_RAMP` past the last index or the final dots never finish — see
 * `FILL_TO` in `script.ts`.
 */
export const DOT_RAMP = 6;

export const MEMBERS = GRID.cols * GRID.rows;

export const dotX = (c: number) => GRID.x0 + c * GRID.pitch;
export const dotY = (r: number) => GRID.y0 + r * GRID.pitch;

/** Where the viewer's own dot lands: first slot of the first empty row. */
export const YOURS = { col: 0, row: GRID.rows } as const;

/* ── Layout ───────────────────────────────────────────────────────────── */

export const COL = { x: 148, w: 784 } as const;

export const Y = {
  eyebrow: 190,
  rule: 240,
  badge: 316,

  /**
   * Beat one, which has the frame to itself — set low, with a label at the
   * foot. At 640/780 the hero sat in the top third and left two-thirds of a
   * near-white frame with nothing in it, which on light reads as unfinished
   * rather than as generous.
   */
  welcome: 820,
  month: 960,
  monthRule: 1070,
  standfirst: 1700,

  /** Beat two onward. `news` clears the badge by 68px; at 390 it read as a
   *  caption hanging off the chip rather than as the section's own eyebrow. */
  news: 428,
  counter: 580,
  caption: 730,

  /**
   * The copy slot under the grid. Two beats pass through it — "still fresh"
   * and then "build your profile" — and it does not move between them, the
   * same fixed-shape rule the month poster's plate follows.
   */
  line1: 1540,
  line2: 1612,

  /** The sign-off, which has the frame to itself again. */
  lockup: 900,
  signRule: 1050,
  site: 1120,
} as const;

/**
 * Overshoot-and-settle: easeOutBack, 0 -> 1 with one bounce past the target.
 * Used for the dots popping in and for the viewer's own dot landing.
 */
export const settle = (t: number, amount = 1.7) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const u = t - 1;
  return 1 + (amount + 1) * u ** 3 + amount * u ** 2;
};
