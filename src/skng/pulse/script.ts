/**
 * The script.
 *
 * Everything a person would want to change about the piece lives here: what it
 * says, how long each scene runs, which screen is on, and what is on that
 * screen. Nothing in this file imports React, so copy can be rewritten and
 * scenes re-timed without touching a component.
 *
 * TIMING
 * `beats` is the unit, not frames. The bed is 100 BPM, so at 30fps one beat is
 * exactly 18 frames. Every cut therefore lands on a beat rather than near one.
 * Change a scene's `beats` and take the same number off another scene, so the
 * total stays at TARGET_BEATS - the composition asserts this on load.
 *
 * WORKFLOW
 * After editing, look before you render:
 *
 *     npx remotion still Storyboard out/storyboard.png
 *
 * That is one still of all thirteen scenes and takes under a minute. A full
 * render is twenty.
 */

export const BEAT = 18;
export const FPS = 30;
export const BPM = 100;

/** 100 beats = 1800 frames = 60s. */
export const TARGET_BEATS = 100;

export type Item =
  | { kind: "post"; who: string; name: string; meta: string; text: string }
  | { kind: "person"; who: string; name: string; meta: string; alum?: boolean }
  | { kind: "resource"; title: string; sub: string }
  | { kind: "bubble"; text: string; mine?: boolean }
  | { kind: "verify"; title: string; sub: string };

export type ScriptScene = {
  /** Stable id. Also selects which renderer draws this scene. */
  id: string;
  beats: number;

  /** Small mono line above the headline. */
  kicker?: string;
  /** The headline. Words animate in individually. */
  title?: string;
  /** Index of the first word to take the accent colour. -1 for none. */
  titleAccentFrom?: number;
  /** Supporting line under the headline. */
  body?: string;

  /** Which nav tab is lit: 0 Feed, 1 Inbox, 2 Network, 3 Resources, 4 Profile. */
  tab?: number;
  /** Title bar inside the phone. */
  screen?: string;
  items?: Item[];

  /** Scene-specific extras. */
  lines?: string[];
  chips?: string[];
  stat?: { value: string; label: string };
  tagline?: string;
  cta?: string;
  profile?: { initials: string; name: string };
  /** Signal bars for the offline scene: how many of four are lit. */
  barsLit?: number;
};

export const SCRIPT: ScriptScene[] = [
  {
    id: "ignition",
    beats: 8,
    tagline: "One network. Every campus.",
  },
  {
    id: "hook",
    beats: 7,
    title: "It is all scattered.",
    titleAccentFrom: 2,
    lines: [
      "Where is the timetable?",
      "Is the portal down again?",
      "Anyone has last year's past questions?",
      "Which hostel is this?",
      "Who is the course rep??",
    ],
  },
  {
    id: "reveal",
    beats: 7,
    kicker: "One app",
    title: "Everything in one place.",
    tab: 0,
    screen: "Feed",
    items: [
      { kind: "post", who: "AO", name: "Ada O.", meta: "Computer Science, 300L", text: "Lecture moved to LT2. Pass it on." },
      { kind: "post", who: "KB", name: "Kunle B.", meta: "Mechanical Eng, 200L", text: "Study group tonight, 7pm." },
      { kind: "post", who: "FM", name: "Fatima M.", meta: "Law, 400L", text: "Moot court results are out!" },
    ],
  },
  {
    id: "feed",
    beats: 8,
    kicker: "Feed",
    title: "Your campus, not the whole internet.",
    tab: 0,
    screen: "Feed",
    items: [
      { kind: "post", who: "AO", name: "Ada O.", meta: "Computer Science, 300L", text: "Lecture moved to LT2. Pass it on." },
      { kind: "post", who: "KB", name: "Kunle B.", meta: "Mechanical Eng, 200L", text: "Study group tonight, 7pm." },
      { kind: "post", who: "FM", name: "Fatima M.", meta: "Law, 400L", text: "Moot court results are out!" },
      { kind: "post", who: "CE", name: "Chidi E.", meta: "Economics, 100L", text: "Where do we collect matric numbers?" },
      { kind: "post", who: "ZY", name: "Zainab Y.", meta: "Pharmacy, 500L", text: "Clinical postings list is up." },
      { kind: "post", who: "DA", name: "Daniel A.", meta: "Architecture, 200L", text: "Studio review moved to Monday." },
    ],
  },
  {
    id: "inbox",
    beats: 8,
    kicker: "Inbox",
    title: "Talk to your department, not strangers.",
    tab: 1,
    screen: "CSC 300L",
    items: [
      { kind: "bubble", text: "Assignment 3 submission moved to Friday." },
      { kind: "bubble", text: "Confirmed by the course rep." },
      { kind: "bubble", text: "Thank you! Was about to panic.", mine: true },
      { kind: "bubble", text: "Notes are in Resources already." },
      { kind: "bubble", text: "You are a lifesaver.", mine: true },
      { kind: "bubble", text: "Course rep pinned the timetable too." },
      { kind: "bubble", text: "Finally, one place for all of it.", mine: true },
      { kind: "bubble", text: "Lab groups posted in Resources." },
      { kind: "bubble", text: "Adding it to my calendar now.", mine: true },
      { kind: "bubble", text: "See everyone Friday." },
    ],
  },
  {
    id: "network",
    beats: 8,
    kicker: "Network",
    title: "Find the people who have been there.",
    tab: 2,
    screen: "Network",
    items: [
      { kind: "person", who: "TA", name: "Tunde A.", meta: "Alumni, Software Engineer", alum: true },
      { kind: "person", who: "NE", name: "Ngozi E.", meta: "Alumni, Corporate Law", alum: true },
      { kind: "person", who: "SI", name: "Sade I.", meta: "Student, 500L Medicine" },
      { kind: "person", who: "BO", name: "Bola O.", meta: "Alumni, Product Design", alum: true },
      { kind: "person", who: "IU", name: "Ifeanyi U.", meta: "Student, 400L Civil Eng" },
      { kind: "person", who: "MA", name: "Maryam A.", meta: "Alumni, Data Analyst", alum: true },
      { kind: "person", who: "GC", name: "Gbenga C.", meta: "Student, 300L Accounting" },
    ],
  },
  {
    id: "resources",
    beats: 8,
    kicker: "Resources",
    title: "Past questions that actually exist.",
    tab: 3,
    screen: "Resources",
    items: [
      { kind: "resource", title: "CSC 301 Past Questions", sub: "PDF - 2019 to 2024" },
      { kind: "resource", title: "Organic Chemistry Notes", sub: "PDF - 42 pages" },
      { kind: "resource", title: "MTH 202 Tutorial Pack", sub: "PDF - solved" },
      { kind: "resource", title: "Constitutional Law Summary", sub: "PDF - 18 pages" },
      { kind: "resource", title: "PHY 104 Lab Manual", sub: "PDF - 2024 edition" },
      { kind: "resource", title: "GST 111 Revision Guide", sub: "PDF - 26 pages" },
      { kind: "resource", title: "ACC 205 Marking Scheme", sub: "PDF - solved" },
    ],
  },
  {
    id: "verify",
    beats: 8,
    kicker: "Verified",
    title: "Everyone here is who they say they are.",
    tab: 4,
    screen: "Profile",
    profile: { initials: "AO", name: "Ada Okafor" },
    items: [
      { kind: "verify", title: "University of Lagos", sub: "Institution" },
      { kind: "verify", title: "Computer Science", sub: "Department" },
      { kind: "verify", title: "Matric 190591024", sub: "Student ID" },
    ],
  },
  {
    id: "rooms",
    beats: 7,
    kicker: "Rooms",
    title: "Rooms that know who belongs.",
    titleAccentFrom: 3,
    lines: ["aspirant-lounge", "student-network", "alumni-network"],
  },
  {
    id: "roles",
    beats: 8,
    kicker: "Your account grows up",
    title: "Aspirant. Student. Alumni.",
    body: "Verification unlocks each step. Nobody skips the queue.",
    chips: ["Aspirant", "Student", "Alumni"],
  },
  {
    id: "offline",
    beats: 6,
    title: "Built for a bad network.",
    titleAccentFrom: 3,
    body: "Offline first. It keeps working when the data does not.",
    barsLit: 2,
  },
  {
    id: "scale",
    beats: 7,
    stat: { value: "170+", label: "institutions across Nigeria" },
    title: "Tens of millions of students. One network.",
    titleAccentFrom: 5,
  },
  {
    id: "cta",
    beats: 10,
    title: "The time is now.",
    cta: "skoolconnect.ng",
  },
];

export const framesFor = (scene: ScriptScene) => scene.beats * BEAT;

export const TOTAL_BEATS = SCRIPT.reduce((n, s) => n + s.beats, 0);
export const TOTAL_FRAMES = TOTAL_BEATS * BEAT;

/**
 * Start frame of each scene, for storyboard timecodes and for finding the
 * frame to inspect when a specific scene looks wrong.
 */
export const SCENE_STARTS = SCRIPT.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + framesFor(SCRIPT[i - 1]));
  return acc;
}, []);
