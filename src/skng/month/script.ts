import { FPS } from "./theme";

/**
 * The monthly post, as data.
 *
 * This is written to be re-pointed rather than rebuilt. A month post is not a
 * one-off — it comes round twelve times a year, and the version of this that
 * hardcodes "September" is a version somebody has to re-typeset every four
 * weeks and re-check for the day the 1st falls on. So the month is one
 * constant, the grid is computed from it, and the copy is a table.
 *
 * To ship October: change `THIS_MONTH` to `{ year: 2026, month: 9 }`. The
 * calendar re-derives, the numerals roll 09 -> 10, and the copy comes from
 * `VOICE[9]`. Nothing else moves.
 */

/** `month` is 0-based, as `Date` has it. 8 = September. */
export const THIS_MONTH = { year: 2026, month: 8 } as const;

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** Monday-first, as the academic calendar is read here. */
export const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

/* ── The calendar, computed ───────────────────────────────────────────── */

/**
 * UTC throughout. `new Date(2026, 8, 1)` is local time, and on a render
 * machine west of Greenwich that is the 31st of August — which would silently
 * shift the whole grid by a day. The month is a date on a wall, not a moment,
 * so it is built in UTC and never converted.
 */
const firstDay = (y: number, m: number) => new Date(Date.UTC(y, m, 1)).getUTCDay();
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

export type Cell = { day: number; col: number; row: number; weekend: boolean };

/** Every date in the month, placed on a Monday-first grid. */
export const buildGrid = (y: number, m: number): Cell[] => {
  // getUTCDay is Sunday-first; rotate so Monday is column 0.
  const lead = (firstDay(y, m) + 6) % 7;
  const total = daysIn(y, m);
  const cells: Cell[] = [];
  for (let d = 1; d <= total; d++) {
    const i = lead + d - 1;
    cells.push({ day: d, col: i % 7, row: Math.floor(i / 7), weekend: i % 7 >= 5 });
  }
  return cells;
};

export const CELLS = buildGrid(THIS_MONTH.year, THIS_MONTH.month);
export const ROWS = CELLS[CELLS.length - 1].row + 1;

export const NAME = MONTH_NAMES[THIS_MONTH.month];
export const YEAR = String(THIS_MONTH.year);
/** The numerals. Two digits, always — "09", not "9". */
export const NUM = String(THIS_MONTH.month + 1).padStart(2, "0");
export const PREV_NUM = String(((THIS_MONTH.month + 11) % 12) + 1).padStart(2, "0");
export const PREV_NAME = MONTH_NAMES[(THIS_MONTH.month + 11) % 12];

/* ── Copy ─────────────────────────────────────────────────────────────── */

/**
 * What each month actually means to a Nigerian student, rather than what it
 * means to a calendar.
 *
 * A month post whose whole content is "Hello September" is a card the audience
 * has seen a hundred times and will scroll past. The one line has to be
 * something only this product could say to this audience in this month —
 * September is resumption, which is exactly the week a student most needs the
 * thing SkoolConnectNG does.
 *
 * Only the months with something real to say carry an entry. The rest fall
 * back to `DEFAULT_VOICE` rather than reaching for a filler sentiment.
 */
export type Voice = { eyebrow: string; line1: string; line2: string; sub: string };

const DEFAULT_VOICE: Voice = {
  eyebrow: "NEW MONTH",
  line1: "A fresh page,",
  line2: "same campus.",
  sub: "Everything your school is doing, in one place.",
};

export const VOICE: Partial<Record<number, Voice>> = {
  // September — resumption. New session, and a campus full of strangers.
  8: {
    eyebrow: "RESUMPTION SEASON",
    line1: "New session,",
    line2: "new faces.",
    sub: "Find your people before you find your seat.",
  },
  // January — new year, second semester.
  0: {
    eyebrow: "NEW YEAR, NEW SEMESTER",
    line1: "Back to it,",
    line2: "better this time.",
    sub: "Every result, event and update, in one place.",
  },
  // June — exams and the long break.
  5: {
    eyebrow: "EXAM SEASON",
    line1: "Heads down,",
    line2: "then home.",
    sub: "Keep up with your campus while you revise.",
  },
};

export const COPY: Voice = VOICE[THIS_MONTH.month] ?? DEFAULT_VOICE;

/* ── Timing ───────────────────────────────────────────────────────────── */

/**
 * Sixteen seconds. Long enough to turn the month over, set the grid and land
 * a line; short enough to survive a feed. The four blocks are the bed's four
 * sections — see `scripts/make-bed16.js`, whose boundaries are these frames
 * converted to seconds.
 */
export const T = {
  /** 08 becomes 09. */
  turn: 0,
  /** The numerals shrink to a badge, the month sets, the grid draws. */
  month: 130,
  /** The grid clears and the line lands in its place. */
  copy: 296,
  /** The mark. */
  lock: 400,
} as const;

export const TOTAL_FRAMES = 480;
export const TARGET_FRAMES = 16 * FPS;

/**
 * The digit roll and the month word swap on the same frames — one event.
 *
 * 28 frames, not 34. A flat odometer spends its middle showing half of the
 * old figure above half of the new one, which is legible on a bank of small
 * wheels and reads as a broken glyph at 400px. The fix is not to soften it but
 * to spend less time there.
 */
export const ROLL = { from: 62, to: 90 } as const;

/**
 * Rows cascade rather than arriving together: six frames apart.
 *
 * It was nine, starting at 214, which put the last row's arrival at 283 and
 * the chip's settle at 298 — with the grid already fading out from 290. The
 * assembled month, which is the one thing the block exists to show, was on
 * screen complete for no frames at all. A cascade has to finish early enough
 * to leave a beat of stillness, or it is an animation of a calendar rather
 * than a calendar.
 */
export const ROW_IN = (r: number) => 198 + r * 6;

/** The chip on the 1st — the only overshoot in the piece. Settles by 262. */
export const CHIP_AT = 232;
