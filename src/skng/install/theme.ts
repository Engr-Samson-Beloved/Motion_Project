import { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT } from "../brand";
import { TOUR } from "../tour/theme";
import { ease, eramp, ramp } from "../story/palette";

/**
 * Tokens and layout for the install explainer.
 *
 * Two palettes live side by side here, and the split is the whole design:
 *
 *   TOUR   the brand's light-mode surface — the ground, the type, the step
 *          rail, the rule. Everything *around* the phone.
 *   IOS    Apple's own system colours. Everything *inside* the screen.
 *
 * They must not bleed into each other. The moment the share sheet is tinted
 * green or the Add button is drawn in the brand's #278058 the piece stops being
 * an instruction and becomes an advert with a diagram in it — a viewer who then
 * goes looking for a green "Add" on their own phone will not find one. The one
 * agreed crossing is the green highlight ring, which is the film pointing at
 * the screen rather than a part of the screen, and it is always drawn *outside*
 * the element it marks.
 */
export const IOS = {
  /** systemGray6 — bar and sheet grounds. */
  bar: "#F2F2F7",
  gray5: "#E5E5EA",
  gray4: "#D1D1D6",
  /** The hairline iOS puts between list rows. */
  sep: "#C6C6C8",
  /** secondaryLabel, for subtitles and glyph strokes. */
  gray: "#8E8E93",
  label: "#1C1C1E",
  blue: "#007AFF",
  white: "#FFFFFF",

  /** The light keyboard: a cool ground with white keys. */
  keyBed: "#D1D4DB",
  keyFace: "#FCFCFE",
  keyDark: "#ADB3BE",

  /** Home screen. Flat, not a photograph — see WALL in `ios.tsx`. */
  wall: "#0A0F0D",
  wallBlob: "#0E3B2B",
  dock: "#2A322F",
} as const;

/** The product's own landing page, as Safari renders it: dark. */
export const PAGE = {
  bg: "#0B1210",
  bg2: "#101A17",
  text: "#EAF2EF",
  body: "#9FB3AC",
  green: "#2E9E63",
  line: "#1E2C27",
} as const;

export { TOUR };
export { BODY_FONT, HEADING_FONT, HEADING_TRACKING, MONO_FONT };
export { ease, eramp, ramp };

export const FPS = 30;

/** Vertical 1080p, same frame as CampusTour and SameQuestion. */
export const W = 1080;
export const H = 1920;

/* ── The phone ────────────────────────────────────────────────────────── */

/**
 * The device is drawn, not photographed.
 *
 * `tour/` animates supplied mockups, so its phone came with the asset. Nothing
 * here is supplied: the reference designs in `public/screens/raw/` render each
 * step at roughly 180px wide, which is a diagram of the flow rather than a
 * source for one at 1080p. Every pixel inside the screen below is built.
 *
 * Drawing it also buys the thing the reference cannot have — the states
 * *between* the five steps, which is the only reason to make this a film.
 */
export const BEZEL = 14;
export const DEVICE_W = 660;
export const SCREEN_W = DEVICE_W - BEZEL * 2;

/**
 * iPhone 14/15 logical size. Every measurement inside the screen is written in
 * these points and scaled once, at the screen boundary, by `PT` — so the iOS
 * chrome can be laid out against Apple's real metrics (a 54pt status bar, a
 * 50pt toolbar, a 60pt icon) instead of against arbitrary pixels.
 */
export const PT_W = 390;
export const PT_H = 844;
export const PT = SCREEN_W / PT_W;

export const SCREEN_H = Math.round(PT_H * PT);
export const DEVICE_H = SCREEN_H + BEZEL * 2;

export const DEVICE_CX = W / 2;
export const DEVICE_CY = 995;

/** Top-left of the screen in frame coordinates — what a tap position needs. */
export const SCREEN_X = DEVICE_CX - SCREEN_W / 2;
export const SCREEN_Y = DEVICE_CY - SCREEN_H / 2;

/** A point inside the screen, in iOS points, as a frame coordinate. */
export const onScreen = (x: number, y: number) => ({
  x: SCREEN_X + x * PT,
  y: SCREEN_Y + y * PT,
});

/* ── iOS geometry, in points ──────────────────────────────────────────── */

/**
 * Apple's metrics, not invented ones.
 *
 * These are shared rather than local to `ios.tsx` because the composition
 * needs them too: the touch indicator has to land on the real centre of the
 * Share button, and the highlight ring has to be drawn around the real box of
 * the "Add to Home Screen" row. A tap that lands near a control instead of on
 * it is the tell that the whole thing was faked.
 */
export const BAR = { status: 54, address: 48, toolbar: 50 } as const;

export const SAFARI = {
  /** Bottom toolbar glyph centres. Share is the middle one. */
  tools: [40, 112, 195, 278, 350],
  /** Above the toolbar's midline, to clear the home indicator beneath it. */
  toolY: PT_H - BAR.toolbar + 18,
} as const;

export const SHEET = {
  top: 120,
  /** Where the grouped action list starts, measured from the sheet's top. */
  listTop: 206,
  row: 54,
  padX: 16,
} as const;

/** The action list, in the order iOS shows it for a web page. */
export const ACTIONS = [
  "Copy",
  "Add to Reading List",
  "Add Bookmark",
  "Add to Favourites",
  "Find on Page",
  "Add to Home Screen",
  "Markup",
  "Print",
  "Save to Pinterest",
  "Save to Dropbox",
] as const;

export const ADD_ROW = ACTIONS.findIndex((a) => a === "Add to Home Screen");

/** How far the list is dragged in step three. */
export const LIST_SCROLL = 96;

/** Centre of a list row on screen, given the current scroll. */
export const rowCentre = (i: number, scroll: number) =>
  SHEET.top + SHEET.listTop + i * SHEET.row + SHEET.row / 2 - scroll;

export const ADD_SHEET = { top: 60, nav: 56, icon: 60 } as const;

/** The "Add" button in the sheet's nav bar. Right-aligned 20pt from the edge,
 *  so its centre is not the edge — a ring on 370 would sit half off the glass. */
export const ADD_BTN = { x: 353, y: ADD_SHEET.top + ADD_SHEET.nav / 2 } as const;

/** The sheet's app icon — where the home-screen icon flies *from*. */
export const SHEET_ICON = {
  x: 24 + ADD_SHEET.icon / 2,
  y: ADD_SHEET.top + ADD_SHEET.nav + 22 + ADD_SHEET.icon / 2,
} as const;

export const HOME = {
  icon: 60,
  /** Column centres for a four-across grid, and the first row's centre. */
  cols: [57, 142, 228, 313],
  row1: BAR.status + 30 + 30,
  dock: { x: 12, y: 734, w: PT_W - 24, h: 86, r: 34 },
  dockCols: [71, 148, 242, 319],
  dots: 706,
} as const;

/* ── Furniture around the phone ───────────────────────────────────────── */

export const EYEBROW_Y = 118;
/** The step rail: five nodes on a hairline, the same device the tour uses. */
export const RAIL_Y = 200;
export const RAIL_W = 620;
/** The caption under the phone: two lines, the key phrase picked out in green. */
export const CAP_Y = 1740;

/* ── Timing ───────────────────────────────────────────────────────────── */

/**
 * A bell that peaks at `at` and is zero beyond `half` frames either side.
 * Taps and impacts are symmetrical about their moment, not ramps into it.
 */
export const bell = (frame: number, at: number, half: number) => {
  const d = Math.abs(frame - at);
  if (d >= half) return 0;
  return ease(1 - d / half);
};

/**
 * Overshoot-and-settle: easeOutBack, 0 -> 1 with one bounce past the target.
 *
 * `amount` 1.7 peaks near 1.10 at about t=0.73. Used for the icon landing on
 * the home screen and nowhere else — iOS itself settles that way, and that
 * landing is the one frame of the piece a viewer is meant to feel rather than
 * read. Everywhere else the film's default easing applies.
 */
export const settle = (t: number, amount = 1.7) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const u = t - 1;
  return 1 + (amount + 1) * u ** 3 + amount * u ** 2;
};
