import { FPS } from "./theme";

/**
 * VERIFIED — a 30-second cut for SkoolConnectNG.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THE SCRIPT
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   COLD OPEN — hard cut in, no fade
 *
 *      WHO TOLD YOU?
 *
 *   SOURCES — three fast cuts, each one a real answer a Nigerian student
 *   has actually given
 *
 *      A SENIOR.
 *      A GROUP CHAT.
 *      SOMEONE'S COUSIN.
 *      NOBODY ACTUALLY KNOWS.
 *
 *   THE TURN
 *
 *      CAMPUS RUNS ON RUMOUR.
 *
 *   THE RUN — eight cuts, accelerating, each one ticked. The first four
 *   narrow (school → faculty → department → level), the last four are what
 *   you get once you are in.
 *
 *      YOUR SCHOOL.      ✓
 *      YOUR FACULTY.     ✓
 *      YOUR DEPARTMENT.  ✓
 *      YOUR LEVEL.       ✓
 *      PAST QUESTIONS.   ✓
 *      LECTURE NOTES.    ✓
 *      CAMPUS EVENTS.    ✓
 *      ALUMNI.           ✓
 *
 *   THE CLAIM
 *
 *      NOT A GROUP CHAT.
 *      A VERIFIED NETWORK.
 *
 *   CLOSE
 *
 *      [mark]  skoolconnectng.com
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HOW IT IS SHOT
 * ─────────────────────────────────────────────────────────────────────────
 *
 * The camera is the argument.
 *
 * A fast cut is easy to make loud and hard to make mean anything, so the
 * craft here carries the script rather than decorating it: **the frame
 * becomes reliable as the film goes on.** The cold open is handheld at full
 * intensity, chromatically split, off-centre, tilted, and set in grey. By
 * the claim the camera is at zero, the aberration is gone, the type is
 * centred and white, and the green has arrived. Nothing announces this. It
 * is simply true that the first third of the film is unsteady and the last
 * third is not — which is the difference between a rumour and a record,
 * said in the only language a film actually has.
 *
 * `trust` on each cut below is the one number that drives it: colour,
 * horizontal offset, tilt, aberration and camera intensity are all read off
 * it. That is deliberate. Six separate ramps would drift apart the first
 * time anyone retimed a cut.
 *
 * The cuts accelerate — 84 frames at the open, 30 by the end of the run —
 * and every act boundary is a three-frame black flash, which is a real edit
 * and the cheapest honest way to make a film feel fast.
 */

export const TOTAL_FRAMES = 900;
export const TARGET_FRAMES = 30 * FPS;

/** 120 BPM: a beat is 15 frames, a bar is 60. Every cut lands on a beat. */
export const BEAT = 15;

export type Cut = {
  at: number;
  /** Frames until the next cut. */
  hold: number;
  lines: string[];
  /**
   * 0 = rumour, 1 = record. Drives colour, offset, tilt and the grade.
   * Nothing else in the piece is allowed a second opinion about it.
   */
  trust: number;
  /** Design size. `Lines` fits down from this; it never goes up. */
  size: number;
  tick?: boolean;
};

export const CUTS: Cut[] = [
  // Cold open. Held longest — the audience has to read a question.
  { at: 6, hold: 84, lines: ["WHO TOLD", "YOU?"], trust: 0.12, size: 172 },

  // The sources. Grey, thrown about, getting faster.
  { at: 90, hold: 60, lines: ["A SENIOR."], trust: 0, size: 150 },
  { at: 150, hold: 50, lines: ["A GROUP", "CHAT."], trust: 0, size: 150 },
  { at: 200, hold: 50, lines: ["SOMEONE'S", "COUSIN."], trust: 0, size: 146 },
  { at: 250, hold: 50, lines: ["NOBODY", "ACTUALLY", "KNOWS."], trust: 0.2, size: 140 },

  // The turn.
  { at: 303, hold: 87, lines: ["CAMPUS RUNS", "ON RUMOUR."], trust: 0.34, size: 126 },

  // The run. Narrowing, then what you get. Accelerating all the way.
  { at: 393, hold: 43, lines: ["YOUR SCHOOL."], trust: 0.55, size: 124, tick: true },
  { at: 436, hold: 42, lines: ["YOUR FACULTY."], trust: 0.61, size: 118, tick: true },
  { at: 478, hold: 40, lines: ["YOUR", "DEPARTMENT."], trust: 0.67, size: 130, tick: true },
  { at: 518, hold: 38, lines: ["YOUR LEVEL."], trust: 0.73, size: 134, tick: true },
  { at: 556, hold: 36, lines: ["PAST", "QUESTIONS."], trust: 0.79, size: 138, tick: true },
  { at: 592, hold: 34, lines: ["LECTURE", "NOTES."], trust: 0.85, size: 138, tick: true },
  { at: 626, hold: 32, lines: ["CAMPUS", "EVENTS."], trust: 0.91, size: 138, tick: true },
  { at: 658, hold: 30, lines: ["ALUMNI."], trust: 0.97, size: 164, tick: true },

  // The claim. Locked, centred, white — then green.
  { at: 691, hold: 59, lines: ["NOT A", "GROUP CHAT."], trust: 1, size: 138 },
  { at: 750, hold: 60, lines: ["A VERIFIED", "NETWORK."], trust: 1, size: 142 },
];

/** Three-frame black flashes at the act boundaries. A real edit, not a fade. */
export const FLASHES = [300, 390, 688] as const;

/** The sign-off has the frame to itself. */
export const T_SIGN = 810;

export const SITE = "skoolconnectng.com";

/**
 * The one line that is not shouted.
 *
 * It sits under the mark at the very end, in mono, and it is the only place
 * in thirty seconds where the film says what the product literally is.
 */
export const SIGN_LINE = "THE VERIFIED STUDENT NETWORK";
