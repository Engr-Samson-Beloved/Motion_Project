import { FPS } from "./palette";

/**
 * The 90-second story film, as data.
 *
 * Scene boundaries are fixed by the brief to the second, so durations are
 * derived from the timecodes rather than hand-counted — change `time` and the
 * frame count follows, and `TOTAL_FRAMES` will refuse to be wrong.
 *
 * Voice-over lines carry cue frames relative to the start of their scene.
 * Nothing in the film renders them as captions (the brief forbids text
 * overlays, and requires the story to work without them) — they exist so that
 * `npm run vo-sheet` can print a recording script with real timings, and so
 * that the visual beats can be pinned to the words they illustrate.
 */

export type VoLine = {
  /** Frames after the scene starts. */
  at: number;
  text: string;
};

export type StoryScene = {
  id: string;
  /** `mm:ss-mm:ss`, verbatim from the brief. */
  time: string;
  title: string;
  vo: readonly VoLine[];
};

const secs = (tc: string) => {
  const [m, s] = tc.split(":").map(Number);
  return m * 60 + s;
};

/** Frames a scene runs for, from its `mm:ss-mm:ss` label. */
export const framesFor = (scene: StoryScene) => {
  const [from, to] = scene.time.split("-");
  return Math.round((secs(to) - secs(from)) * FPS);
};

export const SCRIPT: readonly StoryScene[] = [
  {
    id: "story",
    time: "00:00-00:08",
    title: "Every Student Has a Story",
    vo: [
      { at: 12, text: "Every student has a story." },
      { at: 90, text: "A dream." },
      { at: 126, text: "A question." },
      { at: 162, text: "An opportunity they're looking for." },
    ],
  },
  {
    id: "scatter",
    time: "00:08-00:22",
    title: "The Information Problem",
    vo: [
      { at: 10, text: "But sometimes, the hardest part isn't knowing what you want..." },
      { at: 96, text: "It's knowing where to find it." },
      { at: 160, text: "School information is scattered." },
      { at: 226, text: "Opportunities are buried in group chats." },
      { at: 292, text: "Study materials are shared from one person to another." },
      { at: 356, text: "And sometimes, you're not even sure which information to trust." },
    ],
  },
  {
    id: "missing",
    time: "00:22-00:34",
    title: "The Missing Connection",
    vo: [
      { at: 30, text: "Meanwhile, the right person you need to meet..." },
      { at: 150, text: "could be studying in another school entirely." },
    ],
  },
  {
    id: "question",
    time: "00:34-00:43",
    title: "The Question",
    vo: [
      { at: 8, text: "So we asked ourselves:" },
      { at: 56, text: "What if students didn't have to search everywhere?" },
      { at: 132, text: "What if the people, information, resources, and opportunities they need..." },
      { at: 216, text: "could exist in one place?" },
    ],
  },
  {
    id: "reveal",
    time: "00:43-00:50",
    title: "The Reveal",
    vo: [
      { at: 14, text: "That's why we built SkoolConnectNG." },
      { at: 96, text: "A digital network created around the Nigerian student journey." },
    ],
  },
  {
    id: "connect",
    time: "00:50-01:05",
    title: "Connect",
    vo: [
      { at: 12, text: "Connect with students across institutions." },
      { at: 150, text: "Build your network." },
      { at: 246, text: "Join communities where ideas, questions, and knowledge can move freely." },
    ],
  },
  {
    id: "discover",
    time: "01:05-01:18",
    title: "Discover",
    vo: [
      { at: 10, text: "Discover academic resources to help you learn." },
      { at: 126, text: "Explore opportunities, events, and career pathways that could change your next chapter." },
      { at: 268, text: "And access trusted information to make better decisions about your education." },
    ],
  },
  {
    id: "boundary",
    time: "01:18-01:25",
    title: "Break the Boundary",
    vo: [
      { at: 6, text: "Because your school shouldn't be the boundary of your network." },
      { at: 74, text: "Your classroom shouldn't be the limit of your opportunities." },
      { at: 138, text: "And finding the right information shouldn't feel like detective work." },
    ],
  },
  {
    id: "vision",
    time: "01:25-01:30",
    title: "The Vision",
    vo: [
      { at: 4, text: "We're building a Nigeria where students can connect, discover, and grow together." },
      { at: 78, text: "SkoolConnectNG." },
      { at: 104, text: "Connection changes everything." },
    ],
  },
];

/* ── Scene content ────────────────────────────────────────────────────── */

/**
 * Scene 02's clutter. Every label is a real thing a Nigerian undergraduate
 * hunts for, which is what makes the overload read as *their* overload rather
 * than as generic screen noise. Icons stay generic: the brief rules out any
 * real platform's interface, so a chat is a chat bubble, never a brand mark.
 */
export type Clutter = {
  kind: "window" | "chat" | "doc" | "bell" | "search" | "portal";
  label: string;
  /** Fraction of the frame, 0..1. */
  x: number;
  y: number;
  scale: number;
  /** Frames after the scene starts. */
  at: number;
  /** Crossed out or blurred, for the "which to trust" beat. */
  doubt?: boolean;
  /** A near-duplicate of an earlier card. */
  duplicate?: boolean;
};

export const CLUTTER: readonly Clutter[] = [
  { kind: "search", label: "post utme past questions", x: 0.5, y: 0.46, scale: 1.15, at: 6 },
  { kind: "window", label: "School Portal — Login", x: 0.22, y: 0.26, scale: 1, at: 22 },
  { kind: "chat", label: "anyone has the CHM 101 material?", x: 0.75, y: 0.22, scale: 1, at: 34 },
  { kind: "doc", label: "GST_lecture_note_FINAL.pdf", x: 0.15, y: 0.62, scale: 0.95, at: 48 },
  { kind: "bell", label: "23 new messages", x: 0.85, y: 0.52, scale: 0.9, at: 60 },
  { kind: "window", label: "Hostel allocation — page not found", x: 0.62, y: 0.68, scale: 1, at: 74, doubt: true },
  { kind: "chat", label: "scholarship deadline moved??", x: 0.34, y: 0.78, scale: 0.95, at: 88 },
  { kind: "doc", label: "GST_lecture_note_FINAL_v2.pdf", x: 0.28, y: 0.4, scale: 0.9, at: 104, duplicate: true },
  { kind: "portal", label: "Course registration", x: 0.88, y: 0.78, scale: 0.9, at: 116 },
  { kind: "bell", label: "7 unread", x: 0.08, y: 0.36, scale: 0.8, at: 128 },
  { kind: "search", label: "is the internship real?", x: 0.7, y: 0.4, scale: 0.95, at: 140, doubt: true },
  { kind: "doc", label: "GST_lecture_note_FINAL_v2 (1).pdf", x: 0.44, y: 0.6, scale: 0.85, at: 152, duplicate: true },
  { kind: "chat", label: "forwarded 14 times", x: 0.56, y: 0.14, scale: 0.85, at: 164, doubt: true },
  { kind: "window", label: "Result checker — try again later", x: 0.12, y: 0.14, scale: 0.9, at: 176 },
  { kind: "portal", label: "Bursary application", x: 0.9, y: 0.14, scale: 0.85, at: 188 },
  { kind: "chat", label: "who has the timetable?", x: 0.24, y: 0.9, scale: 0.85, at: 200 },
  { kind: "doc", label: "screenshot_2024_11_03.jpg", x: 0.68, y: 0.88, scale: 0.85, at: 212 },
  { kind: "search", label: "which one is correct", x: 0.44, y: 0.28, scale: 0.9, at: 224, doubt: true },
];

/** Scene 04: what converges into one place. */
export const CONVERGE = [
  { key: "people", label: "People" },
  { key: "info", label: "Information" },
  { key: "resources", label: "Resources" },
  { key: "opportunities", label: "Opportunities" },
] as const;

/**
 * Scene 06 content. Names are ordinary Nigerian names and the institutions are
 * real universities — the brief allows realistic names where the product's own
 * data would supply them, and invented "Student A" placeholders would read as
 * a mockup rather than as a product.
 */
export const PEOPLE = [
  { initials: "AO", name: "Adaeze Okonkwo", school: "University of Nigeria, Nsukka" },
  { initials: "IB", name: "Ibrahim Bello", school: "Ahmadu Bello University, Zaria" },
  { initials: "TA", name: "Tolu Adeyemi", school: "University of Ibadan" },
  { initials: "NE", name: "Ngozi Eze", school: "University of Lagos" },
  { initials: "MS", name: "Musa Sani", school: "Bayero University, Kano" },
] as const;

export const POSTS = [
  {
    initials: "TA",
    name: "Tolu Adeyemi",
    school: "University of Ibadan",
    text: "Sharing my CHM 101 summary notes — comment if you want the full set.",
    replies: 34,
  },
  {
    initials: "IB",
    name: "Ibrahim Bello",
    school: "Ahmadu Bello University, Zaria",
    text: "Has anyone here done the NNPC internship? How long did the response take?",
    replies: 51,
  },
  {
    initials: "NE",
    name: "Ngozi Eze",
    school: "University of Lagos",
    text: "Study group for GST 105 this weekend. Everyone across schools is welcome.",
    replies: 27,
  },
] as const;

/** Scene 07: the Resources tab. */
export const RESOURCES = [
  { tag: "Past questions", title: "MTH 101 — 2019 to 2024, fully solved", meta: "PDF · 4.2 MB · 1,204 saves" },
  { tag: "Lecture notes", title: "Introduction to Microeconomics", meta: "PDF · 2.1 MB · 862 saves" },
  { tag: "Study guide", title: "How to prepare for a viva", meta: "Article · 6 min read" },
] as const;

/** Scene 07: the Discover tab. */
export const OPPORTUNITIES = [
  { tag: "Scholarship", title: "NNPC/SNEPCo National Undergraduate Scholarship", meta: "Closes 14 March · Nationwide" },
  { tag: "Internship", title: "Software Engineering Intern — 12 weeks", meta: "Lagos · Applications open" },
  { tag: "Event", title: "West Africa Student Innovation Summit", meta: "Abuja · 2,400 attending" },
] as const;

/** Scene 07: the trusted-information beat. */
export const FACTS = [
  { label: "Verified by the institution", value: "Course & fee information" },
  { label: "Confirmed source", value: "Admission requirements" },
  { label: "Updated this week", value: "Academic calendar" },
] as const;

/* ── Derived timing ───────────────────────────────────────────────────── */

export const SCENE_FRAMES = SCRIPT.map(framesFor);

export const SCENE_STARTS = SCENE_FRAMES.reduce<number[]>((acc, d, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENE_FRAMES[i - 1]);
  return acc;
}, []);

export const TOTAL_FRAMES = SCENE_FRAMES.reduce((a, b) => a + b, 0);

/** 90 seconds, exactly. */
export const TARGET_FRAMES = 90 * FPS;
