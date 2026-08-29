import { FPS } from "./theme";

/**
 * The piece as data: which capture, what it says, and what to look at.
 *
 * The captures in `public/screens/` are device mockups of the live product —
 * frame, bezel and all — at 804x1638 each. Two consequences shape everything
 * downstream, and both were measured rather than assumed:
 *
 *   They are viewport captures, not full-page ones. Every file is exactly the
 *   same height, so there is nothing below the fold to scroll to. The scroll
 *   machinery in `story/screens.tsx` is useless here; this piece is built from
 *   pans, push-ins and lens crops instead.
 *
 *   The artwork already includes the device. So a capture is never dropped
 *   into `product.tsx`'s phone shell — that would put a phone inside a phone.
 *   The mockup is the element, and it is moved as one.
 *
 * `scripts/patch-screens.js` measured the screen inside the frame and painted
 * out the capture tool's floating widget. Run it after any re-capture.
 */

/** Every capture shares this canvas. */
export const CANVAS = { w: 804, h: 1638 } as const;

/**
 * The live screen inside the device frame, as fractions of the canvas.
 * From `scripts/patch-screens.js`. Used to crop the frame away for the one
 * beat that goes full-bleed.
 */
export const SCREEN = { x: 0.0522, y: 0.0415, w: 0.898, h: 0.9182 } as const;

export type Rect = { x: number; y: number; w: number; h: number };

export type Shot = {
  id: string;
  /** Path under `public/`. */
  file: string;
  kicker: string;
  line: string;
  /**
   * The part of the capture worth looking at, as fractions of the canvas.
   * A lens crops to this, so it is also what the push-in frames.
   */
  focus: Rect;
  /**
   * How the detail is shown.
   *
   * `lens` lifts the region off the screen onto a card; `push` moves the
   * camera into it instead. Seven lenses in a row would turn the piece into a
   * spec sheet, so they alternate — and `push` suits a region that is already
   * large in frame, where a card would only duplicate what is behind it.
   */
  detail: "lens" | "push";
};

export const SHOTS: readonly Shot[] = [
  {
    id: "feed",
    file: "screens/feed.png",
    kicker: "EXPLORE",
    line: "Your campus, live.",
    // The post itself — a real student, a real talk, real tags. Already most
    // of the screen, so a card would only duplicate it: move the camera.
    focus: { x: 0.0896, y: 0.3034, w: 0.8246, h: 0.4902 },
    detail: "push",
  },
  {
    id: "discover",
    file: "screens/discover.png",
    kicker: "DISCOVER",
    line: "Jobs, events, offers.",
    // The job card rather than the hero: it carries the proof.
    focus: { x: 0.0896, y: 0.6319, w: 0.8246, h: 0.2655 },
    detail: "lens",
  },
  {
    id: "people",
    file: "screens/people.png",
    kicker: "PEOPLE",
    line: "Find your people.",
    focus: { x: 0.541, y: 0.34, w: 0.33, h: 0.245 },
    detail: "push",
  },
  {
    id: "connect",
    file: "screens/connect-card.png",
    kicker: "CONNECT",
    line: "One tap away.",
    focus: { x: 0.1094, y: 0.6716, w: 0.7861, h: 0.2198 },
    detail: "lens",
  },
  {
    id: "inbox",
    file: "screens/inbox.png",
    kicker: "INBOX",
    line: "Now you're talking.",
    focus: { x: 0.0896, y: 0.17, w: 0.7313, h: 0.112 },
    detail: "lens",
  },
  {
    id: "community",
    file: "screens/community.png",
    kicker: "COMMUNITIES",
    line: "Build your space.",
    focus: { x: 0.1094, y: 0.26, w: 0.7861, h: 0.11 },
    detail: "push",
  },
  {
    id: "profile",
    file: "screens/profile.png",
    kicker: "PROFILE",
    line: "All of it, yours.",
    focus: { x: 0.0746, y: 0.1618, w: 0.8209, h: 0.1557 },
    detail: "lens",
  },
] as const;

/* ── Time ─────────────────────────────────────────────────────────────── */

/**
 * 120 BPM, so a beat is 15 frames at 30fps. Every boundary below is a multiple
 * of 15 and therefore lands on a beat — the cuts sit in the music without the
 * timings having been bent to it. `scripts/make-bed38.js` takes its section
 * boundaries from these same numbers.
 */
export const BEAT = 15;

export const T = {
  /** Ground and grid arrive on an empty field. */
  open: 0,
  /** The green field is full-bleed and holds the opening statement. */
  statement: 90,
  /** It collapses into the caption rule; the first device rises. */
  strip: 150,
  /** One boundary per shot after the first. */
  shots: [150, 270, 375, 480, 585, 690, 795] as const,
  /** The row scatters into a connected constellation. */
  web: 900,
  /** Lockup. */
  lockup: 1020,
  end: 1140,
} as const;

export const TOTAL_FRAMES = T.end;
export const TARGET_FRAMES = 38 * FPS;

/** Frames either side of a boundary that the pan occupies. */
export const PAN_HALF = 18;

/**
 * Where the camera sits along the strip at a given frame, in slots.
 *
 * The devices are a row, one slot apart, and the camera pans between them.
 * Summing one eased step per boundary gives a single continuous position: no
 * scene ever mounts or unmounts, so nothing pops, and a device that is halfway
 * through a move is simply somewhere between two integers.
 */
export const stripAt = (frame: number, eramp: (f: number, a: number, b: number) => number) => {
  let pos = 0;
  for (let i = 1; i < T.shots.length; i++) {
    pos += eramp(frame, T.shots[i] - PAN_HALF, T.shots[i] + PAN_HALF);
  }
  return pos;
};

/** Index of the shot on screen at `frame`, for captions. */
export const shotAt = (frame: number) => {
  let i = 0;
  for (let k = 1; k < T.shots.length; k++) if (frame >= T.shots[k]) i = k;
  return i;
};

/* ── The constellation ────────────────────────────────────────────────── */

/**
 * Where each device lands when the row scatters, in frame coordinates.
 *
 * Three staggered rows rather than a grid: a grid reads as a spec sheet, and
 * the brief's recurring image is a network. Slot 6 — the profile, the one that
 * is *you* — sits at the centre of the middle row so the lines converge on it.
 */
export const WEB: readonly { x: number; y: number }[] = [
  { x: 268, y: 452 },
  { x: 812, y: 452 },
  { x: 190, y: 980 },
  { x: 890, y: 980 },
  { x: 322, y: 1500 },
  { x: 758, y: 1500 },
  { x: 540, y: 980 },
] as const;

/** Device width in the constellation. */
export const WEB_WIDTH = 224;

/**
 * Which pairs to wire, and when each line starts drawing.
 *
 * Everything reaches the centre first, then the ring closes around it — the
 * order is the point, so these are hand-ordered rather than generated.
 */
export const WEB_EDGES: readonly { from: number; to: number; at: number }[] = [
  { from: 6, to: 2, at: 26 },
  { from: 6, to: 3, at: 32 },
  { from: 6, to: 0, at: 40 },
  { from: 6, to: 1, at: 46 },
  { from: 6, to: 4, at: 54 },
  { from: 6, to: 5, at: 60 },
  { from: 0, to: 1, at: 66 },
  { from: 0, to: 2, at: 70 },
  { from: 1, to: 3, at: 74 },
  { from: 2, to: 4, at: 78 },
  { from: 3, to: 5, at: 82 },
  { from: 4, to: 5, at: 86 },
] as const;
