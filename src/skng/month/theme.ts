import { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT } from "../brand";
import { STORY, ease, eramp, ramp } from "../story/palette";

/**
 * Tokens and geometry for the monthly post.
 *
 * Dark, unlike `tour/` and `install/`. Those two are built around the product —
 * a light app, shot on a light ground so a device does not read as a hole
 * punched in a black field. This one has no product in it at all. It is a
 * poster: one word, one number, one line, and the mark. A poster wants presence
 * and a poster gets read at thumbnail size in a feed, so it is set on the
 * darkest ground in the system with the brand green as the only saturated
 * colour on the frame.
 *
 * The palette is `STORY`'s, one step deeper. The film's `#171E26` is a cool
 * near-black with no hue in it; this ground carries the green, because the
 * whole frame is one colour field and a neutral one would read as grey card
 * stock rather than as the brand.
 *
 * Same standing rule as the rest of `skng/`: solid colours only. No gradient
 * anywhere in this module. Depth is flat value steps (`ground` -> `panel` ->
 * `line`), scale, and motion.
 */
export const MONTH = {
  /** The ground. Green-black, not neutral black. */
  ground: "#0C1411",
  /** One flat step up, for the calendar plate and the badge. */
  panel: "#121D18",
  /** Two steps up. Hairlines, cell rules, the background grid. */
  line: "#1E2E27",
  line2: "#2A3E35",

  /** The brand green, unchanged. Fills and rules only. */
  green: STORY.green,
  /**
   * A lighter tint of the same green for small type.
   *
   * `#278058` on `#0C1411` is about 2.4:1 — fine as a 4px rule or a 56px
   * filled chip, illegible as a 22px letterspaced eyebrow. This is the same
   * hue lifted until the small type actually reads. It never appears as a
   * fill, so the two never sit adjacent and never look like two greens.
   */
  greenType: "#5CC08F",

  white: STORY.white,
  muted: STORY.muted,
  /** Date numerals: present, but a step below the headline. */
  dim: "#B7C9C2",
} as const;

export { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT };
export { ease, eramp, ramp };

export const FPS = 30;

/** Vertical 1080p — the frame every social piece in `skng/` is cut to. */
export const W = 1080;
export const H = 1920;

/**
 * Story and status UI eats the top and bottom of the frame on every platform
 * this gets posted to. Nothing that has to be read goes outside this band.
 */
export const SAFE_TOP = 200;
export const SAFE_BOTTOM = 1740;

/* ── Layout ───────────────────────────────────────────────────────────── */

/**
 * One column, centred, with the calendar's own grid setting the margins.
 *
 * The seven date columns are the only hard measurement in the piece: 7 x 112
 * is 784, which leaves a 148px margin either side. Every other block — the
 * rules, the headline, the copy — is set to that 784 so the frame has one
 * measure rather than several near-misses.
 */
export const COL = { x: 148, w: 784 } as const;
export const CX = W / 2;

export const Y = {
  eyebrow: 210,
  rule: 262,
  /** Where the numerals sit while they are the whole frame. */
  heroBig: 800,
  /**
   * The month being left, and the one being arrived at, under the numerals.
   *
   * 1120, not 1030. At 400px the figures reach y=1000, and a rolling digit
   * travels its own height — the descending 9 landed on top of the word at
   * 1030 for most of the turn.
   */
  swap: 1120,
  /** And where they land once they have become a badge. */
  badge: 392,
  month: 622,
  monthRule: 742,
  lockup: 900,
  footRule: 1046,
  footMonth: 1108,
  footSite: 1170,
} as const;

/**
 * The badge the numerals become: a bordered box with the year beside it.
 *
 * The widths are declared rather than measured because the row has to be
 * centred as a *unit* while the numerals inside it are animating from the
 * middle of the frame. Laying it out with flexbox would centre it correctly
 * and give no way to ask where the box ended up, which is the one number the
 * travelling numerals need.
 */
export const BADGE = {
  size: 66,
  boxW: 94,
  boxH: 88,
  r: 18,
  gap: 26,
  /** "2026" in mono at 30px with 0.22em tracking. */
  yearW: 98,
} as const;

const BADGE_TOTAL = BADGE.boxW + BADGE.gap + BADGE.yearW;
/** Offset from frame centre to the box's centre, once assembled. */
export const BADGE_DX = -BADGE_TOTAL / 2 + BADGE.boxW / 2;
/** And to the year's. */
export const BADGE_YEAR_DX = BADGE_TOTAL / 2 - BADGE.yearW / 2;

/**
 * The plate.
 *
 * One rounded panel that holds the calendar, and then holds the line once the
 * calendar clears. Making it a container rather than a backdrop is the point:
 * the frame does not rebuild itself between the two blocks, it swaps what is
 * inside a shape that never moves. Without it the grid fades from nothing to
 * nothing and the copy arrives with no relationship to what it replaced.
 */
export const PLATE = { x: 120, y: 838, w: 840, r: 28 } as const;

/** The date grid: seven columns, a header above them, five or six rows. */
export const GRID = {
  cell: 112,
  rowH: 84,
  header: 900,
  headRule: 930,
  row0: 976,
  /** The green chip on the 1st, which sets the bottom padding. */
  chip: 62,
} as const;

/**
 * The plate is sized to its contents, not to September.
 *
 * A month can need five rows or six depending on the weekday it opens on —
 * a 31-day month starting on a Sunday spills into a sixth. Fixing the height
 * to five would clip that month's last week, and only in that month, which is
 * the kind of bug that ships. So the height is derived, and the copy block is
 * positioned from the resulting centre rather than from absolute pixels.
 */
export const plateH = (rows: number) => 226 + (rows - 1) * GRID.rowH;
export const plateCY = (rows: number) => PLATE.y + plateH(rows) / 2;

/** The line, set inside the plate, measured from its centre. */
export const copyY = (cy: number) => ({
  eyebrow: cy - 171,
  line1: cy - 63,
  line2: cy + 27,
  sub: cy + 157,
});

/** Centre of column `c` (0 = Monday). */
export const colX = (c: number) => COL.x + c * GRID.cell + GRID.cell / 2;
/** Centre of date row `r`. */
export const rowY = (r: number) => GRID.row0 + r * GRID.rowH;

/* ── Timing ───────────────────────────────────────────────────────────── */

/**
 * A bell that peaks at `at` and is zero beyond `half` frames either side.
 * The same helper the other pieces carry; taps, pops and impacts are
 * symmetrical about their moment rather than ramps into it.
 */
export const bell = (frame: number, at: number, half: number) => {
  const d = Math.abs(frame - at);
  if (d >= half) return 0;
  return ease(1 - d / half);
};

/**
 * Overshoot-and-settle: easeOutBack, 0 -> 1 with one bounce past the target.
 *
 * `amount` 1.7 peaks near 1.10 at about t = 0.73. Used only where something
 * *arrives* — the badge landing, the chip on the 1st — and nowhere else. The
 * numerals themselves never overshoot: a digit that bounces reads as a toy.
 */
export const settle = (t: number, amount = 1.7) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const u = t - 1;
  return 1 + (amount + 1) * u ** 3 + amount * u ** 2;
};
