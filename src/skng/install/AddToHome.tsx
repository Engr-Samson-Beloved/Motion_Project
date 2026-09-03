import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { FilmGrade, Track } from "../../lib/cinema";
import { LockupLight } from "../tour/device";
import { Check } from "./icons";
import {
  AddSheet,
  AppIcon,
  Dim,
  HomeScreen,
  Island,
  LandingPage,
  PhoneShell,
  Ring,
  SafariChrome,
  Screen,
  ShareSheet,
  Touch,
} from "./ios";
import {
  ADD_ROW,
  ADD_SHEET,
  BODY_FONT,
  CAP_Y,
  DEVICE_CX,
  DEVICE_CY,
  EYEBROW_Y,
  HEADING_FONT,
  HEADING_TRACKING,
  HOME,
  LIST_SCROLL,
  MONO_FONT,
  PT,
  PT_H,
  RAIL_W,
  RAIL_Y,
  SHEET,
  SHEET_ICON,
  TOUR,
  W,
  bell,
  ease,
  eramp,
  ramp,
  settle,
  onScreen,
} from "./theme";
import {
  DRAG,
  ENDING,
  type Frag,
  MARKS,
  PATH,
  SHOWN,
  STEPS,
  STEP_AT,
  T,
  TAPS,
  TARGET_FRAMES,
  TITLE,
  TOTAL_FRAMES,
  stepEnd,
} from "./script";

/**
 * AddToHome — 1080x1920, 1080 frames, 36s. Light mode.
 *
 * How to install SkoolConnectNG on an iPhone, demonstrated rather than
 * diagrammed. The reference designs in `public/screens/raw/` lay the procedure
 * out as five phones in a row, which is the right shape for a poster and the
 * wrong one for a film: five frozen states, and the reader has to imagine every
 * transition between them. Those transitions are precisely what a first-time
 * user is unsure about — where the sheet comes from, how far to scroll, what
 * happens after Add. So this is one phone, held for the whole thirty-six
 * seconds, with the flow performed inside it.
 *
 * Three decisions carry it:
 *
 *   One phone, never cut. Nothing dissolves into anything; every state on the
 *   glass is reached by a gesture the viewer watches. If a beat cannot be
 *   reached by a gesture it is a beat that does not belong in this piece.
 *
 *   Apple's chrome, drawn to Apple's metrics, wearing none of the brand.
 *   `ios.tsx` lays everything out in real points — a 54pt status bar, a 60pt
 *   icon — and uses Apple's greys and Apple's blue throughout. A green Add
 *   button would look better and would teach the viewer something false.
 *
 *   The green stays outside the glass. Everything the *film* says — the ring,
 *   the pointer, the step rail, the caption — is the brand's; everything the
 *   *phone* says is Apple's. The line between them is never crossed, which is
 *   what lets the ring be read as "look here" rather than as part of iOS.
 *
 * Solid colours, as everywhere in `skng/`. The single exception is the phone's
 * drop shadow, which is the same exception CampusTour makes: without it a
 * device on a near-white ground sits in the page instead of on it.
 */

if (TOTAL_FRAMES !== TARGET_FRAMES) {
  throw new Error(
    `Piece is ${TOTAL_FRAMES} frames, expected ${TARGET_FRAMES} (36s at 30fps).`,
  );
}

export const ADD_TO_HOME_DURATION = TOTAL_FRAMES;

/* ── The pointer ──────────────────────────────────────────────────────── */

/** Position along `PATH`: eased between arrivals, held outside them. */
const pointerAt = (frame: number) => {
  if (frame <= PATH[0].at) return PATH[0];
  for (let i = 1; i < PATH.length; i++) {
    const a = PATH[i - 1];
    const b = PATH[i];
    if (frame < b.at) {
      const p = ease(ramp(frame, a.at, b.at));
      return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
    }
  }
  return PATH[PATH.length - 1];
};

/* ── The piece ────────────────────────────────────────────────────────── */

export const AddToHome: React.FC = () => {
  const frame = useCurrentFrame();

  /* Title, and the phone arriving under it. */
  const title = eramp(frame, 14, 48) * (1 - eramp(frame, 100, 134));

  // Opaque well before it stops moving. Fading a phone in over the same span it
  // rises washes the dark landing page out to grey for half a second, and the
  // first thing the viewer sees of the product is a grey rectangle.
  const phoneFade = eramp(frame, 116, 144);
  const phoneRise = eramp(frame, 120, 178);
  const phoneOut = eramp(frame, T.end, T.end + 40);
  const phoneP = phoneFade * (1 - phoneOut);
  const phoneCy = DEVICE_CY + (1 - phoneRise) * 300;
  const phoneScale = (0.95 + phoneRise * 0.05) * (1 - phoneOut * 0.06);

  /* The share sheet. Its position is computed here rather than owned by the
     component, because the pointer's target and the ring's box are derived
     from the same number — three animations of one thing drift by a frame. */
  const sheetP = eramp(frame, 296, 336) * (1 - eramp(frame, 566, 598));
  const sheetTop = PT_H + (SHEET.top - PT_H) * sheetP;
  const scroll = eramp(frame, DRAG.from, DRAG.to) * LIST_SCROLL;
  const rowPressed = frame >= TAPS[1] && frame < TAPS[1] + 16 ? ADD_ROW : -1;

  /* The Add sheet. It never slides back down: it is dismissed by the whole
     browser collapsing into the icon's slot, which is what iOS does. */
  const addP = eramp(frame, 566, 606);
  const addTop = PT_H + (ADD_SHEET.top - PT_H) * addP;
  const addPressed = frame >= TAPS[2] && frame < TAPS[2] + 14;
  const caret = addP > 0.9 && frame % 30 < 17 ? 1 : 0;

  /* The dismissal. iOS collapses a web app into the slot its icon will occupy,
     so the shrink is towards that point and the fade trails it — you watch it
     become an icon rather than watching it disappear. */
  const dismiss = eramp(frame, 738, 790);
  const dismissFade = eramp(frame, 756, 792);

  /* The icon in flight — the one thing that survives the dismissal, which is
     why the eye stays on it while everything else zooms away.
     The handoff to the grid icon is a hard swap on frame 800, not a cross-fade:
     both are the same 60pt icon in the same place, and fading between them only
     puts one frame of half-opacity icon on screen at the moment of arrival. */
  const flying = frame >= 738 && frame < 800;
  const fp = ramp(frame, 740, 794);
  const fpos = settle(fp, 1.1);
  const fx = SHEET_ICON.x + (HOME.cols[0] - SHEET_ICON.x) * fpos;
  const fy = SHEET_ICON.y + (HOME.row1 - SHEET_ICON.y) * fpos;
  const fsize = HOME.icon + 24 * bell(frame, 764, 24);
  const installed = frame >= 800 ? 1 : 0;
  const labelled = eramp(frame, 806, 830);

  /* The pointer. */
  const pt = pointerAt(frame);
  const win = SHOWN.find(([a, b]) => frame >= a && frame < b);
  const shown = win
    ? Math.min(eramp(frame, win[0], win[0] + 10), 1 - eramp(frame, win[1] - 10, win[1]))
    : 0;
  const dragging = frame >= DRAG.from && frame < DRAG.to ? 1 : 0;
  const pressed = Math.max(dragging, ...TAPS.map((t) => bell(frame, t + 2, 9)));
  // One expanding ring per press, and only while that press is recent.
  const tapAge = TAPS.reduce(
    (acc, t) => (frame >= t && frame < t + 20 ? ramp(frame, t, t + 20) : acc),
    0,
  );

  const ptFrame = onScreen(pt.x, pt.y);

  /* The step rail: one eased advance per boundary, summed. */
  let railPos = 0;
  for (let i = 1; i < STEP_AT.length; i++) {
    railPos += eramp(frame, STEP_AT[i] - 14, STEP_AT[i] + 14);
  }
  const railIn = eramp(frame, 22, 62);
  const railNodes = eramp(frame, 62, 108);
  const railOut = eramp(frame, T.end, T.end + 26);

  const capAt = (i: number) =>
    Math.min(
      eramp(frame, STEP_AT[i] + 16, STEP_AT[i] + 44),
      1 - eramp(frame, stepEnd(i) - 28, stepEnd(i) - 8),
    );

  return (
    <AbsoluteFill style={{ backgroundColor: TOUR.field }}>
      <Track src={staticFile("bed36.mp3")} volume={0.84} fadeOutFrames={54} />

      {/*
        Grain only, and no handheld camera — the one piece in `skng/` without
        one. Every other composition is drawn from shapes and photographs, which
        a sub-pixel drift flatters. This one is drawn from hairlines and 13pt
        UI text; drifting that a third of a pixel per frame makes the whole
        screen crawl, and the viewer is being asked to *read* it.
      */}
      <FilmGrade grain={0.05} bloom={0} vignette={0} aberration={0}>
        <AbsoluteFill style={{ backgroundColor: TOUR.field }} />

        {/* ── The phone ──────────────────────────────────────────────── */}
        <PhoneShell cx={DEVICE_CX} cy={phoneCy} scale={phoneScale} opacity={phoneP}>
          <Screen>
            {frame >= 720 ? (
              <HomeScreen installed={installed} labelled={labelled} />
            ) : null}

            {dismissFade < 1 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `scale(${1 - dismiss * 0.52})`,
                  transformOrigin: `${HOME.cols[0]}px ${HOME.row1}px`,
                  borderRadius: dismiss * 90,
                  overflow: "hidden",
                  opacity: 1 - dismissFade,
                }}
              >
                <SafariChrome>
                  <LandingPage />
                </SafariChrome>
                <Dim opacity={0.3 * Math.max(sheetP, addP)} />
                {sheetP > 0.002 ? (
                  <ShareSheet top={sheetTop} scroll={scroll} pressed={rowPressed} />
                ) : null}
                {addP > 0.002 ? (
                  <AddSheet
                    top={addTop}
                    caret={caret}
                    pressed={addPressed}
                    showIcon={frame < 738}
                  />
                ) : null}
              </div>
            ) : null}

            {flying ? (
              <div
                style={{
                  position: "absolute",
                  left: fx - fsize / 2,
                  top: fy - fsize / 2,
                }}
              >
                <AppIcon size={fsize} />
              </div>
            ) : null}

            <Island />
          </Screen>
        </PhoneShell>

        {/* ── What the film draws on the glass ───────────────────────── */}
        {phoneP > 0.5
          ? MARKS.map((m, i) => {
              const c = onScreen(m.x, m.y);
              return (
                <Ring
                  key={i}
                  x={c.x}
                  y={c.y}
                  w={m.w * PT}
                  h={m.h * PT}
                  r={m.r * PT}
                  progress={eramp(frame, m.from, m.to)}
                  opacity={1 - eramp(frame, m.out, m.out + 14)}
                />
              );
            })
          : null}

        <Touch
          x={ptFrame.x}
          y={ptFrame.y}
          opacity={shown * phoneP}
          down={pressed}
          tap={tapAge}
        />

        {/* ── Furniture ──────────────────────────────────────────────── */}
        <Eyebrow frame={frame} />
        <StepRail pos={railPos} draw={railIn} nodes={railNodes} out={railOut} />

        {STEPS.map((s, i) => (
          <Caption key={i} lines={s.lines} progress={capAt(i)} />
        ))}

        {title > 0 ? <TitleCard progress={title} /> : null}
        <EndCard frame={frame} />
      </FilmGrade>
    </AbsoluteFill>
  );
};

/* ── Furniture ────────────────────────────────────────────────────────── */

/**
 * One slot at the top of the frame, holding two different things.
 *
 * The brand while the title is up, the subject once it is gone. A vertical
 * video is often met mid-scroll, and after the title card the most useful
 * thing that line can say is not who made this but what it will teach.
 */
const Eyebrow: React.FC<{ frame: number }> = ({ frame }) => {
  const swap = eramp(frame, 118, 152);
  const base: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: EYEBROW_Y,
    width: W,
    textAlign: "center",
    fontFamily: MONO_FONT,
    fontSize: 25,
    fontWeight: 600,
    letterSpacing: "0.3em",
    color: TOUR.green,
  };
  return (
    <>
      <div style={{ ...base, opacity: (1 - swap) * eramp(frame, 8, 34) }}>
        SKOOLCONNECTNG
      </div>
      <div style={{ ...base, opacity: swap * (1 - eramp(frame, 906, 934)) }}>
        ADD TO HOME SCREEN
      </div>
    </>
  );
};

/**
 * The step rail: five nodes on a hairline, with the completed ones ticked.
 *
 * It is the same object CampusTour stands its devices on — a line with nodes,
 * which is the brand's connection motif doing structural work. Here it is also
 * a progress read, which an instructional piece owes the viewer: at any frame
 * they can see how many steps are left without waiting for a caption.
 */
const StepRail: React.FC<{
  pos: number;
  draw: number;
  nodes: number;
  out: number;
}> = ({ pos, draw, nodes, out }) => {
  const n = 5;
  const gap = RAIL_W / (n - 1);
  const x0 = W / 2 - RAIL_W / 2;
  const active = Math.round(pos);
  const alpha = 1 - out;
  if (alpha <= 0) return null;

  return (
    <div style={{ position: "absolute", left: 0, top: RAIL_Y, width: W, opacity: alpha }}>
      {/* The track, and the part of it already walked. */}
      <div
        style={{
          position: "absolute",
          left: W / 2 - (RAIL_W / 2) * draw,
          top: -1,
          width: RAIL_W * draw,
          height: 2,
          backgroundColor: TOUR.hair,
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x0,
          top: -1.5,
          width: gap * pos,
          height: 3,
          backgroundColor: TOUR.green,
          opacity: nodes,
        }}
      />

      {Array.from({ length: n }, (_, i) => {
        const done = i < active;
        const on = i === active;
        const r = on ? 21 : 11;
        const p = Math.min(1, Math.max(0, nodes * 3 - i * 0.5));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + i * gap - r,
              top: -r,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              backgroundColor: done || on ? TOUR.green : TOUR.field,
              border: done || on ? "none" : `2px solid ${TOUR.hair}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO_FONT,
              fontSize: 20,
              fontWeight: 700,
              color: TOUR.white,
              opacity: p,
              transform: `scale(${0.8 + p * 0.2})`,
            }}
          >
            {on ? i + 1 : done ? <Check size={13} color={TOUR.white} weight={3.4} /> : null}
          </div>
        );
      })}
    </div>
  );
};

/** The step caption: two lines, with the words iOS itself uses picked out. */
const Caption: React.FC<{ lines: Frag[][]; progress: number }> = ({
  lines,
  progress,
}) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: CAP_Y,
        width: W,
        textAlign: "center",
        fontFamily: HEADING_FONT,
        fontSize: 44,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: HEADING_TRACKING,
        color: TOUR.ink,
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>
          {line.map((f, j) =>
            typeof f === "string" ? (
              <span key={j}>{f}</span>
            ) : (
              <span key={j} style={{ color: TOUR.green, fontWeight: 700 }}>
                {f.g}
              </span>
            ),
          )}
        </div>
      ))}
    </div>
  );
};

/* ── The ends ─────────────────────────────────────────────────────────── */

const TitleCard: React.FC<{ progress: number }> = ({ progress }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      opacity: progress,
      // Lifted off the frame's centre, so the block sits against the eyebrow
      // and the rail rather than floating in the middle with air above it.
      transform: `translateY(${-74 + (1 - progress) * -26}px)`,
    }}
  >
    <div
      style={{
        fontFamily: HEADING_FONT,
        fontSize: 86,
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: HEADING_TRACKING,
        color: TOUR.ink,
        textAlign: "center",
      }}
    >
      Add <span style={{ color: TOUR.green }}>SkoolConnectNG</span>
      <br />
      {TITLE.head[1]}
      <br />
      {TITLE.head[2]}
    </div>
    <div
      style={{
        marginTop: 46,
        fontFamily: BODY_FONT,
        fontSize: 36,
        fontWeight: 500,
        color: TOUR.muted,
      }}
    >
      {TITLE.sub}
    </div>
  </AbsoluteFill>
);

/**
 * The lockup, the product's own line, and the address.
 *
 * The address is the point. Every other piece in `skng/` can end on a mark and
 * a promise; this one has just spent half a minute telling a viewer to open a
 * page in Safari, and it would be a strange film that never said which page.
 * Timed backwards from the last frame so the URL — the last thing to arrive —
 * still gets a second and a half to sit.
 */
const EndCard: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame - T.end;
  if (t < 0) return null;

  const logo = eramp(t, 12, 48);
  const rule = eramp(t, 96, 118);
  const url = eramp(t, 108, 134);

  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
    >
      <LockupLight progress={logo} width={660} />
      <div style={{ height: 70 }} />
      <div style={{ display: "flex", gap: 24 }}>
        {ENDING.clauses.map((c, i) => {
          const p = eramp(t, 44 + i * 12, 68 + i * 12);
          return (
            <div
              key={c}
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 66,
                fontWeight: 700,
                letterSpacing: HEADING_TRACKING,
                color: TOUR.ink,
                opacity: p,
                transform: `translateY(${(1 - p) * 16}px)`,
              }}
            >
              {c}
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 54,
          width: 96 * rule,
          height: 4,
          backgroundColor: TOUR.green,
        }}
      />
      <div
        style={{
          marginTop: 40,
          fontFamily: MONO_FONT,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "0.16em",
          color: TOUR.green,
          opacity: url,
        }}
      >
        {ENDING.url}
      </div>
    </AbsoluteFill>
  );
};
