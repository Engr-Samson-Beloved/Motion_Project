import { FPS } from "../story/palette";

/**
 * "Same Question" — a 30-second character-led piece.
 *
 * Seven students, in seven different places, each stuck on the same question.
 * Lines find them, an answer travels along the lines, and the question marks
 * become ticks. It is the same argument the 90-second film makes with product
 * screens, made instead with people — which is the only reason to build it
 * separately rather than bolt characters onto that film.
 *
 * Everything here is data. The composition is assembly.
 */

/* ── Beats ────────────────────────────────────────────────────────────── */

/**
 * Section boundaries, in frames. These are also the section boundaries of
 * `scripts/make-bed30.js` — 120 BPM puts a beat on every 15th frame, and each
 * of these lands on one. Move a boundary here and move it there too, or the
 * cuts drift off the music.
 */
export const BEATS = {
  alone: 0,
  others: 150,
  connect: 330,
  answer: 510,
  together: 690,
  lockup: 810,
  end: 900,
} as const;

export const TOTAL_FRAMES = BEATS.end;
export const TARGET_FRAMES = 30 * FPS;

/* ── The world ────────────────────────────────────────────────────────── */

/** Students are placed in a 1080x1920 world, which is also the frame. */
export const WORLD = { w: 1080, h: 1920 } as const;

export type Cycle = "walk" | "idle" | "study";

export type Student = {
  /** Horizontal centre, in world units. */
  x: number;
  /** Where the feet are. The rig's sole sits at 0.9205 of its height. */
  feet: number;
  /** Rendered height. */
  size: number;
  cycle: Cycle;
  /** Frame offset, so seven students are not breathing in lockstep. */
  phase: number;
  head: 0 | 1 | 2;
  flip?: boolean;
  /** Frame the answer reaches them, and their question becomes a tick. */
  answeredAt: number;
};

/**
 * The hero is index 0 and sits low and central: the piece opens pushed in on
 * them, and the camera pulls back from there.
 */
export const CAST: readonly Student[] = [
  { x: 540, feet: 1580, size: 430, cycle: "walk", phase: 0, head: 1, answeredAt: 510 },
  { x: 248, feet: 1230, size: 300, cycle: "study", phase: 37, head: 0, answeredAt: 543 },
  { x: 836, feet: 1188, size: 300, cycle: "idle", phase: 12, head: 2, flip: true, answeredAt: 553 },
  { x: 378, feet: 908, size: 282, cycle: "idle", phase: 61, head: 0, answeredAt: 583 },
  { x: 812, feet: 786, size: 270, cycle: "walk", phase: 24, head: 1, flip: true, answeredAt: 593 },
  { x: 252, feet: 568, size: 252, cycle: "idle", phase: 88, head: 2, answeredAt: 623 },
  { x: 764, feet: 412, size: 240, cycle: "study", phase: 50, head: 0, flip: true, answeredAt: 633 },
];

/** Where a student's chest is — the point lines attach to. */
export const chestOf = (s: Student) => ({ x: s.x, y: s.feet - s.size * 0.55 });

/** Where the top of a student's head is, for the glyph above it. */
export const headTopOf = (s: Student) => s.feet - s.size * 0.78;

/* ── The network ──────────────────────────────────────────────────────── */

export type Edge = {
  from: number;
  to: number;
  /** Frame the line starts drawing. */
  drawAt: number;
  /**
   * Frame an answer starts travelling along it, or null for the cross-links,
   * which exist to make the network a mesh rather than a tree but carry
   * nothing.
   */
  pulseAt: number | null;
};

/** Travel time of a pulse along one edge. */
export const PULSE_FRAMES = 30;

/**
 * Ordered so the mesh grows upward and outward from the hero. The `pulseAt`
 * times are what `answeredAt` in CAST is derived from — an edge that starts
 * pulsing at 513 delivers at 543.
 */
export const EDGES: readonly Edge[] = [
  { from: 0, to: 1, drawAt: 336, pulseAt: 513 },
  { from: 0, to: 2, drawAt: 354, pulseAt: 523 },
  { from: 1, to: 2, drawAt: 372, pulseAt: null },
  { from: 1, to: 3, drawAt: 390, pulseAt: 553 },
  { from: 2, to: 4, drawAt: 408, pulseAt: 563 },
  { from: 3, to: 4, drawAt: 426, pulseAt: null },
  { from: 3, to: 5, drawAt: 444, pulseAt: 593 },
  { from: 4, to: 6, drawAt: 462, pulseAt: 603 },
  { from: 5, to: 6, drawAt: 480, pulseAt: null },
];
