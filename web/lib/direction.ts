/**
 * Direction — the axis that has nothing to do with the client.
 *
 * Everything here is a decision about *film*: how much the camera moves, how
 * the frame is graded, how fast it cuts, how hard things land. Four presets,
 * not a slider, because the useful range is small and the failure modes at the
 * edges are severe.
 *
 * Two of these suppress the camera entirely, and that is the whole reason this
 * file exists rather than the prompt asking for a look. The README records both
 * rules and the pieces that earned them: `month/` has no camera because it is a
 * poster built on a visible seven-column measure and drift on a grid reads as a
 * wobble; `install/` has none because it is hairlines and 13pt UI text and the
 * viewer is being asked to *read* it. A model told about those rules forgets
 * them most of the time. A preset cannot.
 */

export type DirectionId = "documentary" | "feed" | "poster" | "product";

export type Direction = {
  id: DirectionId;
  name: string;
  /** One line, shown in the picker. */
  note: string;

  /** Beats per minute. Every preset divides 30fps into whole frames. */
  bpm: number;
  /** Frames per beat at 30fps. Derived, and always an integer — see below. */
  beat: number;

  /**
   * Handheld drift. `null` means locked off, and that is a rule rather than a
   * default: on a grid or on small type, any drift reads as a fault.
   */
  camera: { intensity: number; speed: number; travel: number; sway: number } | null;
  /** Slow scale ramp across the piece. `null` for none. */
  push: { from: number; to: number } | null;

  /** Passed straight to `<FilmGrade>`. Bloom and vignette get zeroed on light
   *  grounds by `gradeFor()` below. */
  grade: { grain: number; bloom: number; vignette: number; aberration: number };

  /** Default spring damping for entrances. Low overshoots and lands. */
  damping: number;
  /** Typical frames between one entrance and the next. */
  stagger: number;
};

/**
 * 30fps is the constant this repo renders at, so a beat is only a whole number
 * of frames at particular tempos. 90 BPM is 20 frames, 120 is 15, 100 is 18.
 * Nothing here rounds, which is what lets a cut land *on* the beat rather than
 * near it.
 */
const framesPerBeat = (bpm: number) => Math.round((60 / bpm) * 30);

export const DIRECTIONS: readonly Direction[] = [
  {
    id: "documentary",
    name: "Documentary",
    note: "Handheld, graded, unhurried. For story films and testimony.",
    bpm: 90,
    beat: framesPerBeat(90), // 20
    camera: { intensity: 0.55, speed: 0.35, travel: 26, sway: 0.5 },
    push: { from: 1, to: 1.05 },
    grade: { grain: 0.13, bloom: 0.3, vignette: 0.4, aberration: 0.5 },
    damping: 26,
    stagger: 4,
  },
  {
    id: "feed",
    name: "Feed",
    note: "Locked off, hard cuts, entrances that overshoot. For vertical social.",
    bpm: 120,
    beat: framesPerBeat(120), // 15
    camera: null,
    push: null,
    grade: { grain: 0.1, bloom: 0.22, vignette: 0, aberration: 0 },
    // 12 overshoots and lands. The README is explicit that this is what makes
    // a cut read as a hit rather than a slide.
    damping: 12,
    stagger: 3,
  },
  {
    id: "poster",
    name: "Poster",
    note: "No camera. One idea, held. For type-led posts and anything on a grid.",
    bpm: 120,
    beat: framesPerBeat(120), // 15
    // Locked, and not negotiable: this direction exists for layouts built on a
    // visible measure, where drift reads as a wobble.
    camera: null,
    push: null,
    grade: { grain: 0.05, bloom: 0, vignette: 0, aberration: 0 },
    damping: 200,
    stagger: 5,
  },
  {
    id: "product",
    name: "Product",
    note: "Steady, clean, legible. For UI tours and anything you must read.",
    bpm: 120,
    beat: framesPerBeat(120), // 15
    // Same reason as `install/`: hairlines and small UI text, and the viewer is
    // reading rather than watching.
    camera: null,
    push: { from: 1, to: 1.03 },
    grade: { grain: 0.05, bloom: 0.12, vignette: 0, aberration: 0 },
    damping: 40,
    stagger: 4,
  },
];

export const findDirection = (id: DirectionId) =>
  DIRECTIONS.find((d) => d.id === id) ?? DIRECTIONS[0];

/**
 * The grade a direction should actually use on a given ground.
 *
 * Bloom and vignette are both falloffs, and on a near-white field they read as
 * a dirty print rather than as film — which is why `tour/` and `update/` run
 * grain-only. Encoding it here means every light brand gets that correction
 * without anyone remembering to ask for it.
 */
export const gradeFor = (direction: Direction, dark: boolean) =>
  dark
    ? direction.grade
    : { ...direction.grade, bloom: 0, vignette: 0 };

/** The object generated code sees as `DIRECTION`. */
export const directionModule = (direction: Direction, dark: boolean) => ({
  DIRECTION: {
    name: direction.name,
    bpm: direction.bpm,
    beat: direction.beat,
    damping: direction.damping,
    stagger: direction.stagger,
    grade: gradeFor(direction, dark),
    handheld: direction.camera !== null,
  },
});
