/**
 * A brand, as data.
 *
 * The observation this whole file rests on: what makes the work in this repo
 * good was never the brand tokens. `lib/cinema` says so in its own header — it
 * knows nothing about SkoolConnectNG. So brand is not a variation on the craft,
 * it is a separate axis, and the only way one composition serves every client is
 * if the brand never appears in the composition's source at all.
 *
 * Colours carry ROLES, not names. Six hex codes with no semantics is exactly why
 * generated work looks amateur — the accent ends up as body text and the signal
 * red becomes decoration. A role can be checked for contrast, and it tells
 * `@/direction` which ground it is grading against.
 */

export type BrandProfile = {
  id: string;
  name: string;

  /** The field everything sits on. Decides light vs dark treatment. */
  ground: string;
  /** Primary type. Must clear contrast against `ground`. */
  ink: string;
  /** Secondary type, captions, supporting copy. */
  muted: string;
  /** The one colour that carries emphasis. Used sparingly, on purpose. */
  accent: string;
  /** Hairlines, borders, inactive states. */
  line: string;
  /** Reserved meanings. Never decoration. */
  warn: string;
  stop: string;

  headingFont: string;
  bodyFont: string;
  monoFont: string;
  /** Tracking for display type, as a CSS length. */
  headingTracking: string;

  /** Sentence case reads warmer; caps reads louder. Shapes generated copy. */
  voice: "sentence" | "caps";
  /** Free-text prohibitions, passed to the model verbatim. */
  forbid: string[];
};

/* ------------------------------------------------------------- luminance */

const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ] as const;
};

/** Relative luminance, per WCAG. */
export const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (a: string, b: string) => {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Whether a brand is dark-first. This is the single fact `@/direction` needs:
 * a light ground cannot take the same grade as a dark one — on a near-white
 * field, bloom and vignette read as a dirty print rather than as film.
 */
export const isDark = (brand: BrandProfile) => luminance(brand.ground) < 0.35;

/* --------------------------------------------------------------- checks */

export type BrandIssue = { field: string; message: string };

/**
 * Catches the two failures that are invisible in a profile and obvious in a
 * frame: type that cannot be read, and an accent that vanishes into the ground
 * it sits on. The README records the second one happening to this very repo —
 * the mark disappeared against a field at almost its own value.
 */
export const checkBrand = (brand: BrandProfile): BrandIssue[] => {
  const issues: BrandIssue[] = [];

  const ink = contrastRatio(brand.ink, brand.ground);
  if (ink < 4.5) {
    issues.push({
      field: "ink",
      message: `Primary type is ${ink.toFixed(1)}:1 against the ground. Below 4.5:1 it is hard to read at speed.`,
    });
  }

  const muted = contrastRatio(brand.muted, brand.ground);
  if (muted < 3) {
    issues.push({
      field: "muted",
      message: `Secondary type is ${muted.toFixed(1)}:1 against the ground. Below 3:1 it disappears on a phone.`,
    });
  }

  const accent = contrastRatio(brand.accent, brand.ground);
  if (accent < 1.7) {
    issues.push({
      field: "accent",
      message: `The accent is ${accent.toFixed(1)}:1 against the ground — close enough in value that a mark drawn in it will vanish.`,
    });
  }

  return issues;
};

/* ------------------------------------------------------------- defaults */

/** The story film's palette: the dark-first one, taken from the brief. */
export const SKNG_DARK: BrandProfile = {
  id: "skng-dark",
  name: "SkoolConnectNG — dark",
  ground: "#171E26",
  ink: "#F0F6F5",
  muted: "#8AAA9F",
  accent: "#278058",
  line: "#2B333D",
  warn: "#C2683F",
  stop: "#e31e24",
  headingFont:
    "MontserratLocal, Montserrat, ui-sans-serif, system-ui, sans-serif",
  bodyFont: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  monoFont: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  headingTracking: "-0.025em",
  voice: "sentence",
  forbid: [
    "gradients of any kind — the brief is solid colours only",
    "the stop colour as decoration; it means failure",
  ],
};

/** The product's own light surface palette. */
export const SKNG_LIGHT: BrandProfile = {
  id: "skng-light",
  name: "SkoolConnectNG — light",
  ground: "#e4f4f1",
  ink: "#1a373f",
  muted: "#5c7078",
  accent: "#165538",
  line: "#c3ddd6",
  warn: "#b4571f",
  stop: "#e31e24",
  headingFont:
    "MontserratLocal, Montserrat, ui-sans-serif, system-ui, sans-serif",
  bodyFont: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  monoFont: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  headingTracking: "-0.025em",
  voice: "sentence",
  forbid: ["the stop colour as decoration; it means failure"],
};

/**
 * Deliberately nothing to do with SkoolConnectNG — proof, in the picker, that
 * the same compositions render as any brand without new code.
 */
export const NEUTRAL: BrandProfile = {
  id: "neutral",
  name: "Unbranded — ink on paper",
  ground: "#0E0E0F",
  ink: "#F4F2EE",
  muted: "#9A9690",
  accent: "#FF4D17",
  line: "#2A2A2C",
  warn: "#E0A33C",
  stop: "#E0453C",
  headingFont: 'ui-sans-serif, system-ui, "Segoe UI", Helvetica, sans-serif',
  bodyFont: 'ui-sans-serif, system-ui, "Segoe UI", Helvetica, sans-serif',
  monoFont: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  headingTracking: "-0.03em",
  voice: "caps",
  forbid: [],
};

export const BUILT_IN_BRANDS: readonly BrandProfile[] = [
  SKNG_DARK,
  SKNG_LIGHT,
  NEUTRAL,
];

/**
 * The object generated code sees as `BRAND`. Deliberately a different shape
 * from the profile: no id, no voice, no prohibitions — those steer generation,
 * they are not values a composition draws with.
 */
export const brandModule = (brand: BrandProfile) => ({
  BRAND: {
    name: brand.name,
    ground: brand.ground,
    ink: brand.ink,
    muted: brand.muted,
    accent: brand.accent,
    line: brand.line,
    warn: brand.warn,
    stop: brand.stop,
    isDark: isDark(brand),
  },
  HEADING_FONT: brand.headingFont,
  BODY_FONT: brand.bodyFont,
  MONO_FONT: brand.monoFont,
  HEADING_TRACKING: brand.headingTracking,
});
