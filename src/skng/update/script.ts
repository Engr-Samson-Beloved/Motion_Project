import { DOT_RAMP, FPS, MEMBERS } from "./theme";

/**
 * The monthly community update, as data.
 *
 * Like `month/`, this is written to be re-pointed rather than rebuilt. The
 * month comes from `month/script.ts` — one source of truth for which month it
 * is across both pieces — and the only thing that changes here from one update
 * to the next is `COUNT` and the two lines of copy.
 *
 * `COUNT` must stay a multiple of the grid's column count, or the last row of
 * dots comes out short and the "300" on screen stops matching the shape under
 * it. 300 is 20 x 15. The next honest number to ship this at is 320, 340, 360.
 */
export { NAME, NUM, THIS_MONTH, YEAR } from "../month/script";

export const COUNT = MEMBERS;

/* ── Copy ─────────────────────────────────────────────────────────────── */

/**
 * The awkward part of this brief, and the thing the piece is actually about.
 *
 * "300+ users" and "the space is still fresh" pull against each other: the
 * first is a boast, the second admits it is small. Most posts would pick one
 * and drop the other, and the result would either sound like a bigger network
 * pretending, or like an empty one apologising.
 *
 * The resolution is to say both on purpose and let the visual carry it — three
 * hundred dots is plainly a real community and plainly not a crowded one, and
 * three empty rows underneath turn "small" into "early". Hence the line: not
 * "we're growing", which is what every account posts, but "you're early, not
 * late", which is the only thing a student weighing whether to bother actually
 * wants to know.
 */
export const COPY = {
  welcome: "Welcome to",
  /** Anchors the foot of the welcome beat, which otherwise has an empty
   *  lower two-thirds, and says what kind of post this is. */
  standfirst: "MONTHLY UPDATE",
  news: "GOOD NEWS",
  caption: "students on SkoolConnectNG.",
  fresh1: "The space is still fresh.",
  fresh2: "You're early, not late.",
  build1: "Build your profile.",
  build2: "Two minutes, and people can find you.",
  site: "skoolconnectng.com",
} as const;

/* ── Timing ───────────────────────────────────────────────────────────── */

/**
 * Thirty seconds, five blocks. The boundaries below are the bed's section
 * boundaries in `scripts/make-bed-update.js`, converted to seconds — move one
 * without the other and the music resolves somewhere the picture does not.
 */
export const T = {
  /** Welcome to September. The frame to itself. */
  welcome: 0,
  /** The number counts up and the dots fill in with it. */
  news: 210,
  /** The empty rows appear and the line lands. */
  fresh: 530,
  /** One green dot joins — the viewer's. */
  build: 690,
  /** The mark. */
  sign: 810,
} as const;

export const TOTAL_FRAMES = 900;
export const TARGET_FRAMES = 30 * FPS;

/**
 * The count and the fill are one animation, not two.
 *
 * The number and the grid are the same fact stated twice, so they are driven
 * by a single ramp — a counter that finishes before its dots, or after them,
 * turns one claim into two and the viewer notices without knowing why.
 */
export const FILL = { from: 252, to: 446 } as const;

/**
 * The fill is driven past the last dot, not to it.
 *
 * Dot `i` finishes when the fill reaches `i + DOT_RAMP`. Ramping to exactly
 * COUNT leaves the final six dots permanently part-scaled and part-opaque, so
 * the bottom-right corner of a grid that is supposed to read as exactly three
 * hundred tapers off into nothing. The counter clamps at COUNT regardless, so
 * the number still lands on 300 while the last dots settle under it.
 */
export const FILL_TO = COUNT + DOT_RAMP;

/** The "+" arrives once the count has settled, not with it. */
export const PLUS_AT = 454;

/** Your dot: lands, then the ring is drawn around it. */
export const YOU_AT = 704;
export const RING = { from: 726, to: 762 } as const;
