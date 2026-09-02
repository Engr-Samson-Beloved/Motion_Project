/**
 * The composition registry.
 *
 * Every piece in this repo is declared here once, and read twice: `Root.tsx`
 * turns each entry into a `<Composition>` for the Remotion CLI and Studio, and
 * the web app in `web/` turns the same entry into a gallery card and a player.
 *
 * Before this file existed the list lived only in `Root.tsx` as twenty-one
 * hand-written tags, which was fine while the CLI was the only consumer. It is
 * not fine with two consumers: a second hand-kept copy drifts, and the drift
 * shows up as a composition that renders locally and is missing from the
 * deployed gallery.
 *
 * `posterFrame` is the only field here the CLI does not use. It is the frame a
 * gallery card freezes on, and it should be a frame *mid-animation* — a piece
 * judged by its final held pose looks like every other piece.
 */

import React from "react";

import {
  CHARACTER_SHEET_HEIGHT,
  CHARACTER_SHEET_WIDTH,
  CharacterSheet,
} from "./CharacterSheet";
import { CHARACTER_LAB_DURATION, CharacterLab } from "./CharacterLab";
import { CAMPUS_TOUR_DURATION, CampusTour } from "./skng/tour/CampusTour";
import { ADD_TO_HOME_DURATION, AddToHome } from "./skng/install/AddToHome";
import { NEW_MONTH_DURATION, NewMonth } from "./skng/month/NewMonth";
import {
  POSTER_HEIGHT,
  POSTER_WIDTH,
  Poster as MonthPoster,
} from "./skng/month/Poster";
import {
  MONTHLY_UPDATE_DURATION,
  MonthlyUpdate,
} from "./skng/update/MonthlyUpdate";
import {
  BOARD_HEIGHT as INSTALL_BOARD_HEIGHT,
  BOARD_WIDTH as INSTALL_BOARD_WIDTH,
  Board as AddToHomeBoard,
} from "./skng/install/Board";
import {
  BOARD_HEIGHT as TOUR_BOARD_HEIGHT,
  BOARD_WIDTH as TOUR_BOARD_WIDTH,
  Board as CampusTourBoard,
} from "./skng/tour/Board";
import {
  SAME_QUESTION_DURATION,
  SameQuestion,
} from "./skng/together/SameQuestion";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  Board as SameQuestionBoard,
} from "./skng/together/Board";
import { SkoolConnectFilm } from "./skng/SkoolConnectFilm";
import {
  PULSE_DURATION,
  SkoolConnectPulse,
} from "./skng/pulse/SkoolConnectPulse";
import {
  STORYBOARD_HEIGHT,
  STORYBOARD_WIDTH,
  Storyboard,
} from "./skng/pulse/Storyboard";
import {
  STORY_DURATION,
  SkoolConnectStory,
} from "./skng/story/SkoolConnectStory";
import {
  STORYBOARD_HEIGHT as STORY_BOARD_HEIGHT,
  STORYBOARD_WIDTH as STORY_BOARD_WIDTH,
  Storyboard as StoryBoard,
} from "./skng/story/Storyboard";
import { SkoolConnectReel } from "./skng/reel/SkoolConnectReel";
import { LowerThird, LowerThirdProps } from "./LowerThird";
import { TextMotion, TextMotionProps } from "./TextMotion";
import { WelcomeScreen, WelcomeScreenProps } from "./WelcomeScreen";

/**
 * What kind of thing a piece is. This drives grouping in the gallery, and it is
 * a real distinction rather than a label: a `still` is one frame and has no
 * timeline, a `lab` is a rig that exists to verify something rather than to be
 * published.
 */
export type CompositionKind = "film" | "social" | "still" | "lab";

/**
 * A composition that is fetched on demand rather than bundled into the first
 * load. Remotion's own `lazyComponent` prop, not `React.lazy` — the CLI awaits
 * this before it starts a render pass, whereas a suspended subtree during a
 * render pass yields blank frames and a green exit code.
 */
export type LazyLoader = () => Promise<{
  default: React.ComponentType<Record<string, unknown>>;
}>;

export type RegistryEntry = {
  readonly id: string;
  /** Exactly one of `component` and `lazyComponent` is set. */
  readonly component?: React.FC<Record<string, unknown>>;
  readonly lazyComponent?: LazyLoader;
  readonly durationInFrames: number;
  readonly fps: number;
  readonly width: number;
  readonly height: number;
  readonly defaultProps: Record<string, unknown>;

  /** Human title for the gallery. `id` stays the CLI's name for the piece. */
  readonly title: string;
  /** One line, in the gallery's voice: what it is, not how it was built. */
  readonly blurb: string;
  readonly kind: CompositionKind;
  /** Frame a gallery card freezes on. Pick one mid-animation. */
  readonly posterFrame: number;
  /**
   * True for pieces built from `public/screens/`, which is gitignored. They
   * render, but with missing sources, so the gallery says so rather than
   * showing a broken frame with no explanation.
   */
  readonly requiresCaptures?: boolean;
};

/**
 * Keeps `component` and `defaultProps` checked against each other at the call
 * site, then erases to one uniform entry type so both consumers can map over
 * the list without knowing each piece's props.
 */
const define = <P,>(entry: {
  id: string;
  component: React.FC<P>;
  durationInFrames: number;
  fps?: number;
  width: number;
  height: number;
  defaultProps?: P;
  title: string;
  blurb: string;
  kind: CompositionKind;
  posterFrame?: number;
  requiresCaptures?: boolean;
}): RegistryEntry =>
  ({
    fps: 30,
    defaultProps: {},
    posterFrame: 0,
    ...entry,
  }) as unknown as RegistryEntry;

/**
 * The same, for a piece that should not be in the first load.
 *
 * Only `CinemaProbe` needs this today, and it is worth its own code path: it is
 * the one composition that pulls in three.js, `@react-three/fiber` and
 * `@react-three/postprocessing`, which together were about two thirds of the
 * gallery's JavaScript — spent on a rig the README calls "a test rig, not a
 * deliverable". Everything else here is drawn with shapes and CSS and costs
 * almost nothing to bundle.
 */
const defineLazy = (entry: {
  id: string;
  lazyComponent: LazyLoader;
  durationInFrames: number;
  fps?: number;
  width: number;
  height: number;
  title: string;
  blurb: string;
  kind: CompositionKind;
  posterFrame?: number;
  requiresCaptures?: boolean;
}): RegistryEntry => ({
  fps: 30,
  defaultProps: {},
  posterFrame: 0,
  ...entry,
});

export const COMPOSITIONS: readonly RegistryEntry[] = [
  define({
    id: "SkoolConnectStory",
    component: SkoolConnectStory,
    durationInFrames: STORY_DURATION,
    width: 1920,
    height: 1080,
    kind: "film",
    title: "The Story",
    blurb:
      "Ninety seconds on the problem, the solution and the vision. Voice-over led, solid colours only, real Nigerian geography.",
    posterFrame: 1400,
  }),

  define({
    id: "SkoolConnectFilm",
    component: SkoolConnectFilm,
    durationInFrames: 1800,
    width: 1920,
    height: 1080,
    kind: "film",
    title: "Brand Film",
    blurb:
      "Sixty seconds built to the published identity: the network draws itself, three failures drift apart, four groups wire into one hub.",
    posterFrame: 300,
  }),

  define({
    id: "CampusTour",
    component: CampusTour,
    durationInFrames: CAMPUS_TOUR_DURATION,
    width: 1080,
    height: 1920,
    kind: "social",
    title: "Campus Tour",
    blurb:
      "Thirty-eight seconds of the real product, in its own light-mode colours. One continuous pan along seven captured screens.",
    posterFrame: 700,
    requiresCaptures: true,
  }),

  define({
    id: "AddToHome",
    component: AddToHome,
    durationInFrames: ADD_TO_HOME_DURATION,
    width: 1080,
    height: 1920,
    kind: "social",
    title: "Add to Home Screen",
    blurb:
      "How to install the app on an iPhone, performed rather than diagrammed. One phone held for all thirty-six seconds, iOS drawn to Apple's own point metrics.",
    posterFrame: 480,
  }),

  define({
    id: "SkoolConnectPulse",
    component: SkoolConnectPulse,
    durationInFrames: PULSE_DURATION,
    width: 1080,
    height: 1920,
    kind: "social",
    title: "Pulse",
    blurb:
      "The dopamine cut. Thirteen scenes on a hundred-beat grid, built from the product's own lockup, icons and room names.",
    posterFrame: 700,
  }),

  define({
    id: "SkoolConnectReel",
    component: SkoolConnectReel,
    durationInFrames: 1800,
    width: 1080,
    height: 1920,
    kind: "social",
    title: "Reel",
    blurb:
      "The vertical social cut. Where the film sells the idea, this explains the product, screen by screen, on hard four-second cuts.",
    posterFrame: 500,
  }),

  define({
    id: "SameQuestion",
    component: SameQuestion,
    durationInFrames: SAME_QUESTION_DURATION,
    width: 1080,
    height: 1920,
    kind: "social",
    title: "Same Question",
    blurb:
      "Seven students, seven places, one question. No product UI anywhere — the argument made with people instead of screens.",
    posterFrame: 620,
  }),

  define({
    id: "NewMonth",
    component: NewMonth,
    durationInFrames: NEW_MONTH_DURATION,
    width: 1080,
    height: 1920,
    kind: "social",
    title: "New Month",
    blurb:
      "The month turns over, the word sets, and a real calendar grid fills in behind it. Re-pointed by one constant.",
    posterFrame: 250,
  }),

  define({
    id: "MonthlyUpdate",
    component: MonthlyUpdate,
    durationInFrames: MONTHLY_UPDATE_DURATION,
    width: 1080,
    height: 1920,
    kind: "social",
    title: "Monthly Update",
    blurb:
      "Three hundred students drawn as three hundred countable dots, three empty rows underneath, and the viewer's dot arriving in the first of them.",
    posterFrame: 420,
  }),

  define({
    id: "MonthPoster",
    component: MonthPoster,
    durationInFrames: 1,
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    kind: "still",
    title: "Month Poster",
    blurb:
      "The same month standing still — the calendar and the line at once, which is the thing motion does one after the other.",
  }),

  define({
    id: "CampusTourBoard",
    component: CampusTourBoard,
    durationInFrames: 1,
    width: TOUR_BOARD_WIDTH,
    height: TOUR_BOARD_HEIGHT,
    kind: "still",
    title: "Campus Tour · contact sheet",
    blurb:
      "Fourteen frames sampled where the piece can actually be wrong: each transition, each lens at full lift, each push-in at its furthest.",
    requiresCaptures: true,
  }),

  define({
    id: "AddToHomeBoard",
    component: AddToHomeBoard,
    durationInFrames: 1,
    width: INSTALL_BOARD_WIDTH,
    height: INSTALL_BOARD_HEIGHT,
    kind: "still",
    title: "Add to Home · contact sheet",
    blurb: "Eighteen sampled frames of the install flow, as one still.",
  }),

  define({
    id: "SameQuestionBoard",
    component: SameQuestionBoard,
    durationInFrames: 1,
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    kind: "still",
    title: "Same Question · contact sheet",
    blurb: "Eight sampled frames, one still.",
  }),

  define({
    id: "StoryBoard",
    component: StoryBoard,
    durationInFrames: 1,
    width: STORY_BOARD_WIDTH,
    height: STORY_BOARD_HEIGHT,
    kind: "still",
    title: "Story · contact sheet",
    blurb:
      "Three sampled frames per scene. Judge layout, copy and pacing here; the full render is twenty minutes.",
  }),

  define({
    id: "Storyboard",
    component: Storyboard,
    durationInFrames: 1,
    width: STORYBOARD_WIDTH,
    height: STORYBOARD_HEIGHT,
    kind: "still",
    title: "Pulse · contact sheet",
    blurb:
      "All thirteen Pulse scenes, each frozen 62% of the way through so every entrance has landed.",
  }),

  define({
    id: "CharacterSheet",
    component: CharacterSheet,
    durationInFrames: 1,
    width: CHARACTER_SHEET_WIDTH,
    height: CHARACTER_SHEET_HEIGHT,
    kind: "still",
    title: "Character Sheet",
    blurb:
      "One walk cycle at eight even phases. If the legs alternate, the knees bend only on the swing leg, and each arm opposes its own leg, the walk is right.",
  }),

  define({
    id: "CharacterLab",
    component: CharacterLab,
    durationInFrames: CHARACTER_LAB_DURATION,
    width: 1920,
    height: 1080,
    kind: "lab",
    title: "Character Lab",
    blurb: "The jointed rig moving: walk, blend, wave. No assets, no libraries.",
    posterFrame: 60,
  }),

  defineLazy({
    id: "CinemaProbe",
    lazyComponent: () =>
      import("./CinemaProbe").then((m) => ({ default: m.CinemaProbe })),
    durationInFrames: 300,
    width: 1080,
    height: 1920,
    kind: "lab",
    title: "Cinema Probe",
    blurb:
      "The A/B rig. Each beat renders the same content twice, treated and untreated, split down the centre line.",
    posterFrame: 40,
  }),

  define({
    id: "WelcomeScreen",
    component: WelcomeScreen,
    durationInFrames: 150,
    width: 1920,
    height: 1080,
    kind: "lab",
    title: "Welcome Screen",
    blurb:
      "A five-second title card, and the reference pattern for this repo: typed props, timing constants at the top, springs doing the motion.",
    posterFrame: 100,
    defaultProps: {
      title: "Welcome",
      tagline: "Let's design some motion graphics",
      brand: "Motion Project",
    } satisfies WelcomeScreenProps,
  }),

  define({
    id: "LowerThird",
    component: LowerThird,
    durationInFrames: 90,
    width: 1920,
    height: 1080,
    kind: "lab",
    title: "Lower Third",
    blurb:
      "A broadcast name tag that sits over footage. The type counter-scales against the panel, so the reveal is a clip and not a squash.",
    posterFrame: 55,
    defaultProps: {
      name: "Samson Beloved",
      role: "Motion Design",
    } satisfies LowerThirdProps,
  }),

  define({
    id: "TextMotion",
    component: TextMotion,
    durationInFrames: 120,
    width: 1920,
    height: 1080,
    kind: "lab",
    title: "Text Motion",
    blurb:
      "Four seconds of text: words spring in staggered, a gradient rule wipes out, the whole scene pushes in.",
    posterFrame: 70,
    defaultProps: {
      title: "Motion in Four Seconds",
      subtitle: "Built with Remotion",
    } satisfies TextMotionProps,
  }),
];

export const findComposition = (id: string): RegistryEntry | undefined =>
  COMPOSITIONS.find((c) => c.id === id);

/**
 * The component half of the props for `<Composition>`, `<Player>` and
 * `<Thumbnail>` — all three take the same either/or, so all three get it from
 * here rather than each re-deriving which of the two fields is set.
 */
export const componentProps = (entry: RegistryEntry) =>
  entry.lazyComponent
    ? ({ lazyComponent: entry.lazyComponent } as const)
    : ({
        component: entry.component as React.FC<Record<string, unknown>>,
      } as const);

export const KIND_LABEL: Record<CompositionKind, string> = {
  film: "Films",
  social: "Vertical",
  still: "Stills",
  lab: "Rigs & templates",
};

export const KIND_NOTE: Record<CompositionKind, string> = {
  film: "16:9, made to be watched",
  social: "9:16, made for a feed",
  still: "One frame. Contact sheets and posters",
  lab: "Verification rigs and prop-driven templates",
};
