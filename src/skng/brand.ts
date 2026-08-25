import { interpolate } from "remotion";
import "./fonts.css";

/**
 * SkoolConnectNG brand tokens, taken verbatim from
 * `SkoolConnectNG_Brand_Guidelines.pdf` and `app/globals.css`.
 */
export const BRAND = {
  primary: "#165538", // Growth — main branding, active states
  secondary: "#208251", // Renewal — hover, secondary interactive
  accent: "#1b7247", // Wisdom — deep emphasis, decorative
  ink: "#1a373f", // Text / foreground
  surface: "#e4f4f1", // App surface, page backgrounds
  white: "#ffffff",
  red: "#e31e24", // Destructive — errors, failure states
  border: "#e2e8f0",
  radius: 12,
} as const;

/**
 * The product renders headings with `--font-modica`, which `app/layout.tsx`
 * implements as Montserrat — the fallback named in the brand guidelines.
 *
 * The file is self-hosted in `public/fonts` rather than fetched from Google at
 * render time: a network stall during a fetch would block every frame.
 */
export const HEADING_FONT =
  'MontserratLocal, Montserrat, ui-sans-serif, system-ui, sans-serif';

/** Body copy is Geist Sans, whose documented fallback is system-ui. */
export const BODY_FONT =
  'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const MONO_FONT =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

/** Heading tracking from the guidelines: -0.025em. */
export const HEADING_TRACKING = "-0.025em";

/**
 * Scene-level fade. Each scene handles its own in/out so the film reads as
 * continuous without needing transition components between sequences.
 */
export const sceneOpacity = (
  frame: number,
  duration: number,
  fadeIn = 16,
  fadeOut = 16,
) =>
  Math.min(
    interpolate(frame, [0, fadeIn], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    interpolate(frame, [duration - fadeOut, duration], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
