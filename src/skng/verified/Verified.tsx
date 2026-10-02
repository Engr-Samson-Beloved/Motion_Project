import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { FilmGrade, HandheldCamera, Track } from "../../lib/cinema";
import { Lockup } from "../story/ui";
import { Lines, Mono, Rule, Tick } from "./ui";
import {
  CINE,
  CY,
  H,
  SIGN,
  W,
  eramp,
  mix,
  slamAt,
} from "./theme";
import {
  CUTS,
  FLASHES,
  SIGN_LINE,
  SITE,
  TARGET_FRAMES,
  TOTAL_FRAMES,
  T_SIGN,
  type Cut,
} from "./script";

/**
 * Verified — 1080x1920, 900 frames, 30s. Fast cut.
 *
 * The full script is in `script.ts` and should be read first; this file is
 * the shooting of it.
 *
 * Sixteen cards of type in thirty seconds, accelerating from eighty-four
 * frames to thirty, with three-frame black flashes at the act breaks. There
 * is no persistent furniture — no eyebrow, no rail, no rule holding the top
 * of the frame — because at this cut rate anything that survives a cut stops
 * reading as part of the film and starts reading as a bug in the player. The
 * brand appears once, at the end, and holds.
 *
 * The one idea worth defending:
 *
 *   **The camera is the argument.** `trust` on each cut is a single number
 *   from 0 to 1, and colour, horizontal offset, tilt, chromatic aberration,
 *   grain, vignette and handheld intensity are all read off it. The film
 *   opens unsteady, split, off-centre and grey; it ends locked, clean,
 *   centred and white. Nothing says so. It is simply the case that the first
 *   third moves and the last third does not — which is the difference
 *   between a rumour and a record, made in the language film actually has
 *   rather than asserted in a caption.
 *
 *   Driving all of it from one number is the point. Six ramps would drift
 *   apart the first time someone retimed a cut, and the effect only works
 *   while they agree.
 *
 * The grade steps *on* the cut rather than easing across it, which is how a
 * film graded per shot behaves. Within a shot the handheld noise is
 * continuous; at the cut it jumps, because it is a different shot.
 */

// The bed is cut to the same thirty seconds and its sections are these acts.
if (TOTAL_FRAMES !== TARGET_FRAMES) {
  throw new Error(
    `Piece is ${TOTAL_FRAMES} frames, expected ${TARGET_FRAMES} (30s at 30fps).`,
  );
}

export const VERIFIED_DURATION = TOTAL_FRAMES;

const cutAt = (frame: number): Cut | undefined =>
  CUTS.find((c) => frame >= c.at && frame < c.at + c.hold);

export const Verified: React.FC = () => {
  const frame = useCurrentFrame();

  const cut = cutAt(frame);
  const signing = frame >= T_SIGN;

  /* One number. Everything below reads off it. */
  const trust = signing ? 1 : (cut?.trust ?? 0);
  const doubt = 1 - trust;

  /* The slam, and the throw. Alternating by cut index so it is deterministic
     rather than random — a shot that lands left then right then left reads as
     coverage; one that lands anywhere reads as a fault. */
  const idx = cut ? CUTS.indexOf(cut) : 0;
  const side = idx % 2 === 0 ? -1 : 1;
  const slam = cut ? slamAt(frame, cut.at) : 1;
  const dx = side * 84 * doubt;
  const rot = side * 2.1 * doubt;

  /* Three-frame cuts to black at the act breaks. Rendered outside the grade
     so the flash is actually black rather than black plus grain. */
  const flash = FLASHES.some((f) => frame >= f && frame < f + 3) ? 1 : 0;

  /* The sign-off. */
  const lockIn = eramp(frame, T_SIGN + 6, T_SIGN + 40);
  const ruleIn = eramp(frame, T_SIGN + 26, T_SIGN + 50);
  const lineIn = eramp(frame, T_SIGN + 36, T_SIGN + 62);
  const siteIn = eramp(frame, T_SIGN + 46, T_SIGN + 74);

  return (
    <AbsoluteFill style={{ background: CINE.ground }}>
      <Track src={staticFile("bed-verified.mp3")} volume={0.9} fadeOutFrames={54} />

      <FilmGrade
        grain={0.16 - 0.06 * trust}
        bloom={0.3 + 0.12 * trust}
        // 0.72 down to 0.38. The heavier end is the rumour act, where a
        // closing-in frame is the point; the lighter end is the logo card,
        // which a cinema vignette only makes look underexposed.
        vignette={0.72 - 0.34 * trust}
        aberration={1.8 * doubt}
      >
        <HandheldCamera
          intensity={1.15 * doubt + 0.04}
          travel={26 * doubt + 3}
          sway={0.5 * doubt}
          speed={0.9}
        >
          <AbsoluteFill style={{ background: CINE.ground }} />

          {/* The card of type. */}
          {cut ? (
            <AbsoluteFill
              style={{
                alignItems: "center",
                justifyContent: "center",
                // The frame is 1920 tall and a card of type sits a little
                // above the true middle — dead centre reads as low once the
                // tick is under it.
                transform: `translateY(${CY - H / 2}px)`,
              }}
            >
              <div
                style={{
                  transform: `translateX(${dx}px) rotate(${rot}deg) scale(${1.18 - 0.18 * slam})`,
                  filter: `blur(${(1 - slam) * 16}px)`,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Lines
                  lines={cut.lines}
                  size={cut.size}
                  color={mix(CINE.grey, CINE.ink, trust)}
                  opacity={slam}
                />
              </div>
            </AbsoluteFill>
          ) : null}

          {/* The tick, a few frames behind its word: the claim, then the
              verification of it. */}
          {cut?.tick ? (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
              <div style={{ marginTop: 1240 }}>
                <Tick draw={eramp(frame, cut.at + 7, cut.at + 23)} />
              </div>
            </AbsoluteFill>
          ) : null}

          {/* The close. */}
          {signing ? (
            <AbsoluteFill>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: SIGN.lockup,
                  transform: "translateY(-50%)",
                  display: "flex",
                  justifyContent: "center",
                  opacity: lockIn,
                }}
              >
                <Lockup progress={lockIn} width={620} />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: SIGN.rule,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Rule progress={ruleIn} />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: SIGN.line,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Mono
                  text={SIGN_LINE}
                  size={22}
                  color={CINE.dim}
                  opacity={lineIn}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: SIGN.site,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Mono
                  text={SITE}
                  size={26}
                  color={CINE.tick}
                  tracking="0.14em"
                  opacity={siteIn}
                />
              </div>
            </AbsoluteFill>
          ) : null}
        </HandheldCamera>
      </FilmGrade>

      {flash ? (
        <AbsoluteFill style={{ background: "#000000" }} />
      ) : null}
    </AbsoluteFill>
  );
};

export { W };
