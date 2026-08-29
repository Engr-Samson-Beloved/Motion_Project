import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { FilmGrade, HandheldCamera, Track } from "../../lib/cinema";
import { Wire } from "../story/ui";
import {
  Caption,
  DEVICE_H,
  DEVICE_W,
  DEVICE_X,
  DEVICE_Y,
  Device,
  FocusFrame,
  Ground,
  LENS_Y,
  Lens,
  LockupLight,
  MeshGrid,
  RAIL_Y,
  RULE_W,
  RULE_Y,
  Rail,
  SLOT,
} from "./device";
import {
  PAN_HALF,
  SHOTS,
  T,
  TARGET_FRAMES,
  TOTAL_FRAMES,
  WEB,
  WEB_EDGES,
  WEB_WIDTH,
  stripAt,
} from "./shots";
import {
  H,
  HEADING_FONT,
  HEADING_TRACKING,
  MONO_FONT,
  TOUR,
  W,
  bell,
  eramp,
  ramp,
} from "./theme";

/**
 * CampusTour — 1080x1920, 1140 frames, 38s. Light mode.
 *
 * A vertical tour of SkoolConnectNG built from captures of the live product.
 * The other two pieces in `skng/` are dark-first and argue for the product;
 * this one is light and simply *is* the product, shown in its own colours.
 *
 * Three ideas carry it, and each exists because of something the captures
 * turned out to be:
 *
 *   The row. Every capture is the same device at the same size, so they sit
 *   naturally in a line one slot apart, and the whole piece is one horizontal
 *   pan along it — the brief's "controlled horizontal pans", and a structure
 *   in which nothing ever mounts or unmounts. `stripAt` sums one eased step
 *   per boundary into a single continuous camera position.
 *
 *   The green rule. The piece opens on a full-bleed green field, which then
 *   collapses into the small green rule above the captions and stays there for
 *   the next thirty seconds. It is one element the whole way through, so the
 *   caption furniture is never introduced — it is what is left of the title.
 *
 *   The lens. The captures are viewport-only, all exactly 1638px tall, so
 *   there is nothing below the fold and nothing to scroll to. Detail has to
 *   come from magnification instead, and a lens that starts life exactly
 *   aligned with its own place on the screen reads as the detail being lifted
 *   out rather than as a panel appearing over the top.
 *
 * Same rule as the rest of `skng/`: solid colours only, no gradient anywhere.
 * The one soft falloff on screen is the drop shadow baked into each mockup's
 * alpha, which arrived with the asset.
 */

if (TOTAL_FRAMES !== TARGET_FRAMES) {
  throw new Error(
    `Piece is ${TOTAL_FRAMES} frames, expected ${TARGET_FRAMES} (38s at 30fps).`,
  );
}

export const CAMPUS_TOUR_DURATION = TOTAL_FRAMES;

/** When the shot at index `i` gives way. */
const shotEnd = (i: number) => (i < SHOTS.length - 1 ? T.shots[i + 1] : T.web);

/** Order the constellation fills in — the centre's neighbours first. */
const WEB_ORDER = [2, 3, 0, 1, 4, 5];

export const CampusTour: React.FC = () => {
  const frame = useCurrentFrame();

  /* ── The green field, and what becomes of it ────────────────────────── */

  // A line, then a field, then the caption rule. One element throughout.
  const openW = eramp(frame, 30, 58) * W;
  const openH = 4 + eramp(frame, 52, 92) * (H - 4);
  const collapse = eramp(frame, 108, T.strip);
  const ruleOut = eramp(frame, T.web - 24, T.web + 8);

  const gw = openW + (RULE_W - openW) * collapse;
  const gh = openH + (4 - openH) * collapse;
  const gcy = H / 2 + (RULE_Y + 2 - H / 2) * collapse;

  const statement = Math.min(eramp(frame, 66, 94), 1 - eramp(frame, 100, 120));

  /* ── The row ────────────────────────────────────────────────────────── */

  const pos = stripAt(frame, eramp);
  const panX = -pos * SLOT;

  // Scale dips through a pan, which reads as the camera easing off the
  // subject before it moves. Without it the row slides like a carousel.
  let moving = 0;
  for (let i = 1; i < T.shots.length; i++) {
    moving = Math.max(moving, bell(frame, T.shots[i], PAN_HALF));
  }
  const camScale = 1 - moving * 0.05;

  // The first device rises as the green field collapses out of the way. It is
  // also held invisible until then: parked at its entry offset it still showed
  // below the title card, so the statement played over a waiting phone.
  const entry = (1 - eramp(frame, 112, 158)) * 460;
  const stageIn = eramp(frame, 104, 148);

  const webP = eramp(frame, T.web, T.web + 66);
  const outP = eramp(frame, T.lockup, T.lockup + 34);

  /** Where shot `i` sits, including its push-in. */
  const place = (i: number) => {
    const shot = SHOTS[i];
    const stripX = DEVICE_X + i * SLOT + panX;
    const stripY = DEVICE_Y + entry;

    if (shot.detail !== "push") {
      return { cx: stripX, cy: stripY, width: DEVICE_W };
    }

    const start = T.shots[i];
    const end = shotEnd(i);
    // Rise into the push, then release it before the pan starts, so the next
    // move always begins from a device at rest.
    const push =
      eramp(frame, start + 20, end - 34) * (1 - eramp(frame, end - 30, end - 6));

    const k = 1 + 0.18 * push;
    // Offset of the focus point from the device centre, at rest.
    const fx = (shot.focus.x + shot.focus.w / 2 - 0.5) * DEVICE_W;
    const fy = (shot.focus.y + shot.focus.h / 2 - 0.5) * DEVICE_H;
    // Carry that point most of the way to the middle of the frame, and scale
    // about it rather than about the device centre.
    const px = stripX + fx + (W / 2 - (stripX + fx)) * push * 0.8;
    const py = stripY + fy + (DEVICE_Y - 40 - (stripY + fy)) * push * 0.8;

    // Bringing a *high* region to the middle of the frame moves the device
    // down, and a device scaled up and moved down runs straight through its
    // own caption — Communities overlapped it by 236px before this clamp.
    // A push-in may raise the device or hold it, never lower it, and its foot
    // may never cross the rail.
    const halfH = (DEVICE_H * k) / 2;
    const cy = Math.min(py - k * fy, stripY, RAIL_Y - 18 - halfH);

    return { cx: px - k * fx, cy, width: DEVICE_W * k };
  };

  /** How far the lens for shot `i` has been lifted. */
  const lensAt = (i: number) => {
    const start = T.shots[i];
    const end = shotEnd(i);
    return Math.min(
      eramp(frame, start + 30, start + 62),
      1 - eramp(frame, end - 30, end - 8),
    );
  };

  /** Caption progress for shot `i`. */
  const captionAt = (i: number) => {
    const start = T.shots[i];
    const end = shotEnd(i);
    return Math.min(
      eramp(frame, start + (i === 0 ? 8 : 14), start + (i === 0 ? 34 : 40)),
      1 - eramp(frame, end - 34, end - 14),
    );
  };

  const active = Math.round(pos);
  const hero = place(SHOTS.length - 1);
  const heroCx = hero.cx + (WEB[6].x - hero.cx) * webP;
  const heroCy = hero.cy + (WEB[6].y - hero.cy) * webP;
  const heroW = hero.width + (WEB_WIDTH - hero.width) * webP;

  return (
    <AbsoluteFill style={{ backgroundColor: TOUR.field }}>
      <Track src={staticFile("bed38.mp3")} volume={0.86} fadeOutFrames={52} />

      {/* Grain only, and less of it than the dark pieces carry: on a near-white
          ground grain is far more visible, and at the dark pieces' 0.12 it
          reads as a dirty print rather than as film. */}
      <FilmGrade grain={0.07} bloom={0} vignette={0} aberration={0.35}>
        <HandheldCamera intensity={0.22} travel={11} sway={0.13} speed={0.36}>
          <Ground />
          <MeshGrid opacity={eramp(frame, 8, 46) * 0.9} />

          {/* The green element: title field, then caption rule.
              Behind the row on purpose. While it is the title card nothing
              else is on screen, and once it starts collapsing the first device
              is fading up — so it recedes *behind* the phone instead of
              shrinking through it. */}
          <div
            style={{
              position: "absolute",
              left: W / 2 - gw / 2,
              top: gcy - gh / 2,
              width: gw,
              height: gh,
              backgroundColor: TOUR.green,
              opacity: 1 - Math.max(ruleOut, outP),
            }}
          />

          {/* The row, and the constellation it becomes. */}
          <AbsoluteFill style={{ transform: `scale(${camScale})`, opacity: 1 - outP }}>
            {/* The rail the row stands on, in world space so the pan has
                something to move against. */}
            <Rail
              panX={panX}
              count={SHOTS.length}
              progress={eramp(frame, 150, 194) * (1 - webP)}
            />

            {/* Devices still on the row. Anything more than a slot and a half
                from the camera is off-frame; not rendering it keeps seven
                800x1638 bitmaps from being composited every frame. */}
            {SHOTS.slice(0, -1).map((shot, i) => {
              if (Math.abs(i - pos) > 1.4) return null;
              const p = place(i);
              return (
                <Device
                  key={shot.id}
                  file={shot.file}
                  cx={p.cx}
                  cy={p.cy}
                  width={p.width}
                  opacity={(1 - webP) * stageIn}
                />
              );
            })}

            {/* The mesh, behind everything it connects. */}
            {webP > 0 ? (
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
                {WEB_EDGES.map((e, i) => (
                  <Wire
                    key={i}
                    a={WEB[e.from]}
                    b={WEB[e.to]}
                    progress={ramp(frame, T.web + e.at, T.web + e.at + 34)}
                    color={TOUR.green}
                    width={2.6}
                    opacity={0.85}
                  />
                ))}
              </svg>
            ) : null}

            {/* The other six, arriving at their places in the constellation. */}
            {webP > 0
              ? WEB_ORDER.map((i, k) => {
                  const p = eramp(frame, T.web + 8 + k * 6, T.web + 38 + k * 6);
                  return (
                    <Device
                      key={`web${i}`}
                      file={SHOTS[i].file}
                      cx={WEB[i].x}
                      cy={WEB[i].y}
                      width={WEB_WIDTH}
                      opacity={p}
                      scale={0.9 + p * 0.1}
                    />
                  );
                })
              : null}

            {/* The profile — the one that is *you* — travels there rather than
                appearing, and lands at the centre the others wire into. */}
            {Math.abs(SHOTS.length - 1 - pos) <= 1.4 || webP > 0 ? (
              <Device
                file={SHOTS[SHOTS.length - 1].file}
                cx={heroCx}
                cy={heroCy}
                width={heroW}
                opacity={stageIn}
              />
            ) : null}

            {/* Detail, over the device it came from. */}
            {webP <= 0 && active < SHOTS.length
              ? (() => {
                  const shot = SHOTS[active];
                  const p = place(active);
                  if (shot.detail === "lens") {
                    return (
                      <Lens
                        file={shot.file}
                        focus={shot.focus}
                        progress={lensAt(active)}
                        device={p}
                        y={LENS_Y}
                      />
                    );
                  }
                  const start = T.shots[active];
                  const end = shotEnd(active);
                  return (
                    <FocusFrame
                      focus={shot.focus}
                      device={p}
                      progress={eramp(frame, start + 14, start + 44)}
                      opacity={1 - eramp(frame, end - 40, end - 16)}
                    />
                  );
                })()
              : null}
          </AbsoluteFill>

          {/* The opening statement, reversed out of the field. */}
          {statement > 0 ? (
            <AbsoluteFill
              style={{
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                opacity: statement,
              }}
            >
              <div
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 26,
                  fontWeight: 600,
                  letterSpacing: "0.3em",
                  color: TOUR.white,
                  opacity: 0.82,
                  transform: `translateY(${(1 - statement) * -14}px)`,
                }}
              >
                SKOOLCONNECTNG
              </div>
              <div
                style={{
                  marginTop: 40,
                  fontFamily: HEADING_FONT,
                  fontSize: 96,
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: HEADING_TRACKING,
                  color: TOUR.white,
                  textAlign: "center",
                  transform: `translateY(${(1 - statement) * 22}px)`,
                }}
              >
                One app for
                <br />
                your campus.
              </div>
            </AbsoluteFill>
          ) : null}

          {/* Captions. At most two are ever non-zero, mid-pan. */}
          {SHOTS.map((shot, i) => (
            <Caption
              key={shot.id}
              kicker={shot.kicker}
              line={shot.line}
              progress={captionAt(i) * (1 - ruleOut)}
            />
          ))}

          <EndCard frame={frame} />
        </HandheldCamera>
      </FilmGrade>
    </AbsoluteFill>
  );
};

/* ── The end ──────────────────────────────────────────────────────────── */

/**
 * The lockup, then the product's own line, one clause at a time.
 *
 * Three clauses on three beats rather than one long line: it is the app's
 * own copy, and breaking it lets each half-second land instead of asking the
 * viewer to read a 42-character line in the time it takes to fade in.
 */
const EndCard: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame - T.lockup;
  if (t < 0) return null;

  const logo = eramp(t, 14, 48);
  const lines = [
    { text: "Your campus.", p: eramp(t, 36, 58) },
    { text: "Your people.", p: eramp(t, 48, 70) },
    { text: "Your space.", p: eramp(t, 60, 82) },
  ];
  const rule = eramp(t, 86, 106);

  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
    >
      <LockupLight progress={logo} width={720} />
      <div style={{ height: 76 }} />
      {lines.map((l) => (
        <div
          key={l.text}
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.34,
            letterSpacing: HEADING_TRACKING,
            color: TOUR.ink,
            opacity: l.p,
            transform: `translateY(${(1 - l.p) * 16}px)`,
          }}
        >
          {l.text}
        </div>
      ))}
      <div
        style={{
          marginTop: 54,
          width: 96 * rule,
          height: 4,
          backgroundColor: TOUR.green,
        }}
      />
    </AbsoluteFill>
  );
};
