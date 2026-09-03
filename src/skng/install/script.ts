import {
  ADD_BTN,
  ADD_ROW,
  FPS,
  HOME,
  LIST_SCROLL,
  PT_W,
  SAFARI,
  SHEET,
  rowCentre,
} from "./theme";

/**
 * The install explainer, as data.
 *
 * The reference designs in `public/screens/raw/` are five phones in a row, one
 * per step — five frozen states, with the transitions left to the reader. This
 * is the same five steps with the transitions put back, so most of what is
 * below records *when things move* rather than when things appear. That is the
 * whole argument for making it a film: a poster can show you the share sheet,
 * but only a film can show you the share sheet arriving, which is the part a
 * first-time user is actually unsure about.
 *
 * 36 seconds at 30fps, 120 BPM, so a beat is 15 frames and a bar is 60. Every
 * block is exactly 150 frames — ten beats. The regularity is deliberate: this
 * is a numbered procedure, and a viewer should feel one step end and the next
 * begin without having to read the counter. Nothing *inside* a block is
 * regular, which is what keeps it from reading as a slideshow.
 */

export const T = {
  open: 0,
  s1: 150,
  s2: 300,
  s3: 450,
  s4: 600,
  s5: 750,
  end: 900,
} as const;

export const TOTAL_FRAMES = 1080;
export const TARGET_FRAMES = 36 * FPS;

/** Start frame of each numbered step, in order. */
export const STEP_AT = [T.s1, T.s2, T.s3, T.s4, T.s5] as const;

/** When step `i` gives way. */
export const stepEnd = (i: number) => (i < 4 ? STEP_AT[i + 1] : T.end);

/* ── Copy ─────────────────────────────────────────────────────────────── */

/**
 * A caption line, split so the phrase a viewer has to find on their own phone
 * can be picked out. `{ g }` renders green and semibold; a bare string does
 * not. Every word inside a `{ g }` appears verbatim in iOS — the highlight is
 * a promise that the viewer will see that exact string on their device, so it
 * is never used for emphasis on words of the film's own.
 */
export type Frag = string | { g: string };

export const STEPS: { lines: Frag[][] }[] = [
  { lines: [["Open SkoolConnectNG"], ["in your ", { g: "Safari" }, " browser."]] },
  { lines: [["Tap the ", { g: "Share" }, " button"], ["in the toolbar."]] },
  { lines: [["Scroll down and tap"], [{ g: "Add to Home Screen" }, "."]] },
  { lines: [["Edit the name if you like,"], ["then tap ", { g: "Add" }, "."]] },
  { lines: [["Done. SkoolConnectNG is"], ["on your ", { g: "Home Screen" }, "."]] },
];

export const TITLE = {
  head: ["Add SkoolConnectNG", "to your iPhone", "Home Screen."],
  sub: "One tap away. Always within reach.",
} as const;

export const ENDING = {
  clauses: ["Simple.", "Fast.", "Yours."],
  url: "skoolconnectng.com",
} as const;

/* ── The hand ─────────────────────────────────────────────────────────── */

/**
 * The pointer's path, as a sequence of arrivals in iOS points.
 *
 * A drawn thumb was the alternative and is worse: at this size a hand covers
 * the control it is pressing at the exact moment the viewer needs to read it.
 * What is drawn instead is the indicator iOS itself puts on screen when a
 * recording has touches enabled — honest about being a recording, and already
 * familiar to anyone who has watched one.
 *
 * Between two stops the pointer eases from one to the next; outside the list it
 * holds. `SHOWN` decides when it is on screen at all, so it can leave the frame
 * between steps rather than hovering through a beat it has no part in.
 */
export type Stop = { at: number; x: number; y: number };

/**
 * Where the "Add to Home Screen" row sits before and after the drag.
 *
 * The pointer grabs the row at its *un-scrolled* position and carries it up, so
 * at the end of the gesture the thumb is exactly on the row it just pulled into
 * reach. That is not a coincidence arranged in the layout — it is how the
 * gesture works on a real phone, and getting it wrong is the tell.
 */
export const ROW_BEFORE = rowCentre(ADD_ROW, 0);
export const ROW_AFTER = rowCentre(ADD_ROW, LIST_SCROLL);

export const PATH: Stop[] = [
  { at: 250, x: 210, y: 640 },
  { at: 286, x: SAFARI.tools[2], y: SAFARI.toolY },
  { at: 420, x: 200, y: ROW_BEFORE },
  { at: 468, x: 200, y: ROW_AFTER },
  // Held here through the ring and the press. Without this second stop the
  // pointer would start drifting towards Add the moment it lifted off the row,
  // and the drift is visible in the frames before it fades out.
  { at: 600, x: 200, y: ROW_AFTER },
  { at: 716, x: ADD_BTN.x, y: ADD_BTN.y },
];

/** Frames a press actually lands on. Three presses install the app. */
export const TAPS = [292, 540, 726] as const;

/** The scroll gesture: pointer down the whole way, list moving with it. */
export const DRAG = { from: 424, to: 468 } as const;

/** When the pointer is on screen. It leaves between steps rather than hovering. */
export const SHOWN: [number, number][] = [
  [242, 304],
  [402, 482],
  [500, 560],
  [668, 744],
];

/* ── What the film rings ──────────────────────────────────────────────── */

/**
 * The green ring, and the four things it marks.
 *
 * Boxes are in iOS points, centred. The ring is always drawn *outside* the
 * element and never as a fill on it: a viewer who comes away thinking iOS has
 * a green Add button will not find one on their own phone, and the whole piece
 * would then have taught them something false.
 */
export type Mark = {
  from: number;
  to: number;
  out: number;
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
};

export const MARKS: Mark[] = [
  // The Share button in Safari's toolbar.
  { from: 250, to: 284, out: 294, x: SAFARI.tools[2], y: SAFARI.toolY, w: 32, h: 32, r: 16 },
  // The row itself, once the drag has brought it into reach.
  { from: 480, to: 514, out: 546, x: 195, y: ROW_AFTER, w: PT_W - SHEET.padX * 2, h: SHEET.row, r: 8 },
  // The Add button in the sheet's nav bar.
  { from: 660, to: 692, out: 730, x: ADD_BTN.x, y: ADD_BTN.y, w: 46, h: 30, r: 8 },
  // And finally the thing itself, sitting on the home screen.
  { from: 812, to: 846, out: 884, x: HOME.cols[0], y: HOME.row1, w: HOME.icon, h: HOME.icon, r: 16 },
];
