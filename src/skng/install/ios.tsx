import React from "react";
import { Img, staticFile } from "remotion";
import {
  ACTION_ICONS,
  AirDropMark,
  Battery,
  Book,
  Cellular,
  ChevronLeft,
  ChevronRight,
  Lock,
  MailMark,
  MessagesMark,
  MusicMark,
  PhoneMark,
  Reload,
  SafariMark,
  Share,
  Tabs,
  WhatsAppMark,
  Wifi,
} from "./icons";
import {
  ACTIONS,
  ADD_SHEET,
  BAR,
  BEZEL,
  BODY_FONT,
  DEVICE_H,
  DEVICE_W,
  HEADING_FONT,
  HOME,
  IOS,
  MONO_FONT,
  PAGE,
  PT,
  PT_H,
  PT_W,
  SAFARI,
  SCREEN_H,
  SCREEN_W,
  SHEET,
  TOUR,
} from "./theme";

/**
 * iOS, drawn.
 *
 * Everything in this file is laid out in iOS points against a 390x844 screen,
 * and scaled exactly once — in `Screen` — by `PT`. That is the only reason the
 * numbers below can be Apple's real ones: a 54pt status bar, a 50pt toolbar, a
 * 60pt app icon, a 291pt keyboard. Written in output pixels instead, every one
 * of those becomes an arbitrary constant that no later reader can check.
 *
 * The rule this file exists to keep: nothing inside the screen may wear the
 * brand. Apple's greys, Apple's blue, Apple's proportions. The one green thing
 * a viewer sees on the glass is the SkoolConnectNG page itself, which is green
 * because the product is. Everything the *film* says — the ring, the touch
 * indicator, the caption — is drawn outside the screen, in `AddToHome.tsx`.
 */

/* ── The device ───────────────────────────────────────────────────────── */

/**
 * The phone: a flat dark frame, a flat rim, and one soft shadow.
 *
 * The shadow is the single deliberate exception to `skng/`'s no-falloff rule,
 * and it is the same exception CampusTour makes — that piece got its shadow
 * baked into the supplied mockups' alpha. On a near-white ground a phone with
 * no shadow at all sits *in* the page rather than on it, and the whole piece
 * depends on the device reading as an object being held up to the viewer.
 */
export const PhoneShell: React.FC<{
  cx: number;
  cy: number;
  scale?: number;
  opacity?: number;
  children: React.ReactNode;
}> = ({ cx, cy, scale = 1, opacity = 1, children }) => {
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - DEVICE_W / 2,
        top: cy - DEVICE_H / 2,
        width: DEVICE_W,
        height: DEVICE_H,
        borderRadius: 62,
        backgroundColor: "#191C1A",
        boxShadow: "0 34px 80px rgba(23,30,38,0.20)",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* The polished rim, as a flat value step rather than a sheen. */}
      <div
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: 58,
          border: "2px solid #43474A",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: BEZEL,
          top: BEZEL,
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: 48,
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Point space. Children are laid out in 390x844 and scaled once, here. */
export const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: PT_W,
      height: PT_H,
      transform: `scale(${PT})`,
      transformOrigin: "0 0",
      fontFamily: BODY_FONT,
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

/* ── The app icon ─────────────────────────────────────────────────────── */

/** Measured, not guessed: `node scripts/measure-png.js public/skng-logo.png`. */
const LOGO_BOX = { x: 0.1875, y: 0.2051, w: 0.6992, h: 0.6016 } as const;
const LOGO_ASPECT = 1.1623;

/**
 * The home-screen icon.
 *
 * A web app added from Safari gets its icon from the site's apple-touch-icon,
 * which for this product is the mark on white. Sizing the 512px file directly
 * would size its 73% transparent padding along with it, so the mark is cropped
 * to its measured box first and then inset inside the squircle by hand — 0.68
 * of the side, which is roughly where Apple's own icon grid puts a centred
 * glyph.
 */
export const AppIcon: React.FC<{ size: number; radius?: number }> = ({
  size,
  radius,
}) => {
  const markW = size * 0.68;
  const markH = markW / LOGO_ASPECT;
  const canvas = markW / LOGO_BOX.w;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? size * 0.2237,
        backgroundColor: IOS.white,
        // This icon is white, and half the places it appears are white too —
        // the Add sheet's card most of all. Without the hairline the squircle
        // vanishes there and the mark reads as a loose graphic on the row
        // rather than as the icon about to be installed.
        boxShadow: `inset 0 0 0 ${Math.max(0.5, size * 0.012)}px rgba(0,0,0,0.10)`,
        overflow: "hidden",
        position: "relative",
        flex: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: (size - markW) / 2,
          top: (size - markH) / 2,
          width: markW,
          height: markH,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile("skng-logo.png")}
          style={{
            position: "absolute",
            width: canvas,
            height: canvas,
            left: -LOGO_BOX.x * canvas,
            top: -LOGO_BOX.y * canvas,
            maxWidth: "none",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

/* ── Status bar ───────────────────────────────────────────────────────── */

export const StatusBar: React.FC<{ light?: boolean }> = ({ light = false }) => {
  const c = light ? "#FFFFFF" : IOS.label;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: PT_W, height: BAR.status }}>
      <div
        style={{
          position: "absolute",
          left: 26,
          top: 15,
          width: 60,
          textAlign: "center",
          fontSize: 15,
          fontWeight: 700,
          color: c,
          letterSpacing: "0.01em",
        }}
      >
        9:41
      </div>
      <div
        style={{
          position: "absolute",
          right: 22,
          top: 18,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Cellular color={c} />
        <Wifi color={c} />
        <Battery color={c} />
      </div>
    </div>
  );
};

/** The Dynamic Island. Always black, so it vanishes on the home screen — which
 *  is exactly what it does on the device. */
export const Island: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: PT_W / 2 - 62,
      top: 11,
      width: 124,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#000",
    }}
  />
);

export const HomeIndicator: React.FC<{ light?: boolean }> = ({ light = false }) => (
  <div
    style={{
      position: "absolute",
      left: PT_W / 2 - 67,
      bottom: 8,
      width: 134,
      height: 5,
      borderRadius: 3,
      backgroundColor: light ? "#FFFFFF" : "#1C1C1E",
      opacity: light ? 0.85 : 0.32,
    }}
  />
);

/* ── Safari ───────────────────────────────────────────────────────────── */

const CONTENT_TOP = BAR.status + BAR.address;
const CONTENT_H = PT_H - CONTENT_TOP - BAR.toolbar;

export const SafariChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <div style={{ position: "absolute", inset: 0, backgroundColor: IOS.bar }} />
    <StatusBar />

    {/* The page, behind the bars so a scroll would run under them. */}
    <div
      style={{
        position: "absolute",
        left: 0,
        top: CONTENT_TOP,
        width: PT_W,
        height: CONTENT_H,
        overflow: "hidden",
      }}
    >
      {children}
    </div>

    {/* Address bar */}
    <div
      style={{
        position: "absolute",
        left: 0,
        top: BAR.status,
        width: PT_W,
        height: BAR.address,
        backgroundColor: IOS.bar,
        borderBottom: `0.5px solid ${IOS.sep}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 13,
          fontSize: 15,
          color: IOS.label,
          fontWeight: 500,
        }}
      >
        <span style={{ fontSize: 12 }}>A</span>A
      </div>
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 8,
          width: 278,
          height: 32,
          borderRadius: 9,
          backgroundColor: "#E3E3E8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
        }}
      >
        <Lock size={11} color={IOS.gray} weight={2} />
        <span style={{ fontSize: 15, color: IOS.label }}>skoolconnectng.com</span>
      </div>
      <div style={{ position: "absolute", left: 348, top: 13 }}>
        <Reload size={19} color={IOS.label} weight={1.8} />
      </div>
    </div>

    {/* Toolbar */}
    <div
      style={{
        position: "absolute",
        left: 0,
        top: PT_H - BAR.toolbar,
        width: PT_W,
        height: BAR.toolbar,
        backgroundColor: IOS.bar,
        borderTop: `0.5px solid ${IOS.sep}`,
      }}
    />
    {[
      <ChevronLeft key="b" size={22} color={IOS.label} weight={2} />,
      <ChevronRight key="f" size={22} color={IOS.gray4} weight={2} />,
      <Share key="s" size={22} color={IOS.label} weight={1.7} />,
      <Book key="k" size={22} color={IOS.label} weight={1.7} />,
      <Tabs key="t" size={22} color={IOS.label} weight={1.7} />,
    ].map((g, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: SAFARI.tools[i] - 11,
          top: SAFARI.toolY - 11,
        }}
      >
        {g}
      </div>
    ))}
    <HomeIndicator />
  </>
);

/* ── The product's own page ───────────────────────────────────────────── */

/**
 * The SkoolConnectNG landing page as Safari renders it.
 *
 * Redrawn rather than composited. The captures in `public/screens/` are device
 * mockups — a phone already inside them — so dropping one into this phone would
 * put a phone inside a phone, and the reference designs render this page at
 * about 180px wide, which is a diagram of it rather than a source.
 */
export const LandingPage: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: PAGE.bg }}>
    {/* Brand row */}
    <div style={{ position: "absolute", left: 24, top: 30, display: "flex", alignItems: "center", gap: 9 }}>
      <AppIcon size={28} radius={7} />
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: HEADING_FONT, letterSpacing: "-0.02em" }}>
        <span style={{ color: PAGE.text }}>SkoolConnect</span>
        <span style={{ color: PAGE.green }}>NG</span>
      </div>
    </div>

    <div
      style={{
        position: "absolute",
        left: 24,
        top: 92,
        width: 320,
        fontFamily: HEADING_FONT,
        fontSize: 27,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.03em",
        color: PAGE.text,
      }}
    >
      <span style={{ color: PAGE.green }}>Connect</span> with
      <br />
      Nigerian Students
      <br />
      Nationwide
    </div>

    <div
      style={{
        position: "absolute",
        left: 24,
        top: 212,
        width: 300,
        fontSize: 13,
        lineHeight: 1.55,
        color: PAGE.body,
      }}
    >
      Join a trusted network of students, aspirants and alumni. Learn, share and
      grow together.
    </div>

    <PageButton top={300} label="Get Started" fill />
    <PageButton top={356} label="Login" />

    <div
      style={{
        position: "absolute",
        left: 0,
        top: 418,
        width: PT_W,
        textAlign: "center",
        fontSize: 13,
        color: PAGE.body,
      }}
    >
      Continue as Guest
    </div>

    <div style={{ position: "absolute", left: 24, top: 470, width: 342, height: 1, backgroundColor: PAGE.line }} />
    <div
      style={{
        position: "absolute",
        left: 24,
        top: 492,
        fontFamily: MONO_FONT,
        fontSize: 9,
        letterSpacing: "0.24em",
        color: PAGE.body,
      }}
    >
      WHY SKOOLCONNECTNG
    </div>
    {[
      "Verified campus communities",
      "Peer learning and study groups",
      "Opportunities, updates, alumni",
    ].map((t, i) => (
      <div
        key={t}
        style={{
          position: "absolute",
          left: 24,
          top: 522 + i * 34,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          color: PAGE.text,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: PAGE.green }} />
        {t}
      </div>
    ))}

    {/*
      A second section, deliberately cut in half by the fold.
      Without it the page ends a third of the way up the viewport and reads as a
      one-screen site, which quietly contradicts the film: a page you would
      bother installing is a page that continues. The clip does the work — this
      is the only element here allowed to run past the content box.
    */}
    <div style={{ position: "absolute", left: 24, top: 634, width: 342, height: 1, backgroundColor: PAGE.line }} />
    <div
      style={{
        position: "absolute",
        left: 24,
        top: 656,
        fontFamily: HEADING_FONT,
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        color: PAGE.text,
      }}
    >
      Built by students, for students
    </div>
    <div
      style={{
        position: "absolute",
        left: 24,
        top: 682,
        width: 320,
        fontSize: 13,
        lineHeight: 1.55,
        color: PAGE.body,
      }}
    >
      Every campus on the platform is run by the people who study there.
    </div>
  </div>
);

const PageButton: React.FC<{ top: number; label: string; fill?: boolean }> = ({
  top,
  label,
  fill = false,
}) => (
  <div
    style={{
      position: "absolute",
      left: 24,
      top,
      width: 342,
      height: 42,
      borderRadius: 8,
      backgroundColor: fill ? PAGE.green : "transparent",
      border: fill ? "none" : `1px solid ${PAGE.line}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 15,
      fontWeight: 600,
      color: fill ? "#FFFFFF" : PAGE.text,
    }}
  >
    {label}
  </div>
);

/* ── The share sheet ──────────────────────────────────────────────────── */

const TARGETS = [
  { label: "AirDrop", mark: AirDropMark },
  { label: "Messages", mark: MessagesMark },
  { label: "Mail", mark: MailMark },
  { label: "WhatsApp", mark: WhatsAppMark },
] as const;

export const Dim: React.FC<{ opacity: number }> = ({ opacity }) =>
  opacity <= 0 ? null : (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#000", opacity }} />
  );

/**
 * The share sheet, at whatever height it has risen to.
 *
 * `top` is animated by the composition rather than by a transition inside here,
 * because the same number drives the touch indicator's target and the ring: if
 * the sheet owned its own animation those three would drift apart by a frame
 * and the press would land on nothing.
 */
export const ShareSheet: React.FC<{
  top: number;
  scroll: number;
  /** Index of the row showing iOS's press highlight, or -1. */
  pressed?: number;
}> = ({ top, scroll, pressed = -1 }) => {
  const height = PT_H - SHEET.top;
  const listH = height - SHEET.listTop - 34;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: PT_W,
        height,
        backgroundColor: IOS.bar,
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
        overflow: "hidden",
      }}
    >
      {/* Header: what is being shared. */}
      <div style={{ position: "absolute", left: 20, top: 18 }}>
        <AppIcon size={44} radius={10} />
      </div>
      <div style={{ position: "absolute", left: 76, top: 24, fontSize: 16, fontWeight: 600, color: IOS.label }}>
        SkoolConnectNG
      </div>
      <div style={{ position: "absolute", left: 76, top: 45, fontSize: 13, color: IOS.gray }}>
        skoolconnectng.com
      </div>
      <div
        style={{
          position: "absolute",
          left: 338,
          top: 24,
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "#E3E3E8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          color: IOS.gray,
        }}
      >
        ✕
      </div>
      <div style={{ position: "absolute", left: 0, top: 82, width: PT_W, height: 0.5, backgroundColor: IOS.sep }} />

      {/* Who to send it to. */}
      {TARGETS.map((t, i) => {
        const Mark = t.mark;
        return (
          <div
            key={t.label}
            style={{
              position: "absolute",
              left: 24 + i * 78,
              top: 100,
              width: 58,
              textAlign: "center",
            }}
          >
            <Mark size={58} />
            <div style={{ marginTop: 6, fontSize: 11, color: IOS.label }}>{t.label}</div>
          </div>
        );
      })}

      {/* What to do with it. The list is clipped and translated, so a drag
          moves real content rather than swapping one screenshot for another. */}
      <div
        style={{
          position: "absolute",
          left: SHEET.padX,
          top: SHEET.listTop,
          width: PT_W - SHEET.padX * 2,
          height: listH,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: -scroll,
            width: "100%",
            borderRadius: 12,
            backgroundColor: IOS.white,
            overflow: "hidden",
          }}
        >
          {ACTIONS.map((label, i) => {
            const Glyph = ACTION_ICONS[i];
            return (
              <div
                key={label}
                style={{
                  position: "relative",
                  height: SHEET.row,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 16,
                  paddingRight: 16,
                  backgroundColor: pressed === i ? IOS.gray4 : IOS.white,
                }}
              >
                <div style={{ flex: 1, fontSize: 16, color: IOS.label }}>{label}</div>
                <Glyph size={21} color={IOS.label} weight={1.6} />
                {i < ACTIONS.length - 1 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 16,
                      right: 0,
                      bottom: 0,
                      height: 0.5,
                      backgroundColor: IOS.sep,
                    }}
                  />
                ) : null}
              </div>
            );
          })}
          <div
            style={{
              height: SHEET.row,
              display: "flex",
              alignItems: "center",
              paddingLeft: 16,
              fontSize: 16,
              color: IOS.blue,
              backgroundColor: IOS.white,
              borderTop: `0.5px solid ${IOS.sep}`,
            }}
          >
            Edit Actions…
          </div>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
};

/* ── The Add to Home Screen sheet ─────────────────────────────────────── */

export const AddSheet: React.FC<{
  top: number;
  /** 0-1, the caret's blink. */
  caret: number;
  pressed?: boolean;
  /** Hidden while the icon is in flight, so there is only ever one of it. */
  showIcon?: boolean;
}> = ({ top, caret, pressed = false, showIcon = true }) => {
  const cardTop = ADD_SHEET.nav;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: PT_W,
        height: PT_H - ADD_SHEET.top,
        backgroundColor: IOS.bar,
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
        overflow: "hidden",
      }}
    >
      {/* Nav bar */}
      <div style={{ position: "absolute", left: 20, top: 19, fontSize: 16, color: IOS.blue }}>
        Cancel
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 19,
          width: PT_W,
          textAlign: "center",
          fontSize: 16,
          fontWeight: 600,
          color: IOS.label,
        }}
      >
        Add to Home Screen
      </div>
      <div
        style={{
          position: "absolute",
          right: 20,
          top: 19,
          fontSize: 16,
          fontWeight: 600,
          color: IOS.blue,
          opacity: pressed ? 0.4 : 1,
        }}
      >
        Add
      </div>

      {/* The icon and the name — the two things a user may change. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: cardTop,
          width: PT_W,
          height: 104,
          backgroundColor: IOS.white,
          borderTop: `0.5px solid ${IOS.sep}`,
          borderBottom: `0.5px solid ${IOS.sep}`,
        }}
      >
        <div style={{ position: "absolute", left: 24, top: 22, opacity: showIcon ? 1 : 0 }}>
          <AppIcon size={ADD_SHEET.icon} />
        </div>
        <div style={{ position: "absolute", left: 104, top: 26, display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 16, color: IOS.label }}>SkoolConnectNG</span>
          <span
            style={{
              width: 2,
              height: 19,
              marginLeft: 1,
              backgroundColor: IOS.blue,
              opacity: caret,
            }}
          />
        </div>
        <div style={{ position: "absolute", left: 104, right: 20, top: 54, height: 0.5, backgroundColor: IOS.sep }} />
        <div style={{ position: "absolute", left: 104, top: 64, fontSize: 14, color: IOS.gray }}>
          https://skoolconnectng.com/
        </div>
        <div style={{ position: "absolute", right: 20, top: 30 }}>
          <ChevronRight size={16} color={IOS.gray4} weight={2.2} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 24,
          top: cardTop + 122,
          width: 330,
          fontSize: 13,
          lineHeight: 1.45,
          color: IOS.gray,
        }}
      >
        An icon will be added to your Home Screen so you can quickly access this
        website.
      </div>

      <Keyboard top={PT_H - ADD_SHEET.top - 291} />
      <HomeIndicator />
    </div>
  );
};

/* ── The keyboard ─────────────────────────────────────────────────────── */

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"] as const;

const Key: React.FC<{
  x: number;
  y: number;
  w: number;
  label: string;
  dark?: boolean;
  blue?: boolean;
  small?: boolean;
}> = ({ x, y, w, label, dark = false, blue = false, small = false }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: 42,
      borderRadius: 5,
      backgroundColor: blue ? IOS.blue : dark ? IOS.keyDark : IOS.keyFace,
      color: blue ? "#FFFFFF" : IOS.label,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: small ? 13 : 20,
      fontWeight: small ? 500 : 400,
    }}
  >
    {label}
  </div>
);

const Keyboard: React.FC<{ top: number }> = ({ top }) => {
  const kw = 32;
  const gap = 6;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: PT_W,
        height: 291,
        backgroundColor: IOS.keyBed,
      }}
    >
      {ROWS.map((row, r) => {
        const chars = row.split("");
        const x0 = (PT_W - (chars.length * kw + (chars.length - 1) * gap)) / 2;
        return (
          <React.Fragment key={row}>
            {chars.map((ch, i) => (
              <Key key={ch} x={x0 + i * (kw + gap)} y={12 + r * 52} w={kw} label={ch} />
            ))}
          </React.Fragment>
        );
      })}
      <Key x={8} y={12 + 2 * 52} w={42} label="⇧" dark />
      <Key x={PT_W - 50} y={12 + 2 * 52} w={42} label="⌫" dark />
      <Key x={8} y={12 + 3 * 52} w={44} label="123" dark small />
      <Key x={58} y={12 + 3 * 52} w={PT_W - 58 - 96} label="space" small />
      <Key x={PT_W - 90} y={12 + 3 * 52} w={82} label="done" blue small />
    </div>
  );
};

/* ── The home screen ──────────────────────────────────────────────────── */

const DOCK = [
  { mark: PhoneMark },
  { mark: SafariMark },
  { mark: MessagesMark },
  { mark: MusicMark },
] as const;

/**
 * The home screen the whole procedure is aiming at.
 *
 * The wallpaper is two flat shapes rather than a photograph: the piece has a
 * no-gradient rule, and a stock iOS wallpaper is a gradient by construction.
 * Two solids read as *a* wallpaper without pretending to be a specific one,
 * which also keeps the frame honest — the viewer's own phone will not match it
 * whatever is drawn there.
 */
export const HomeScreen: React.FC<{
  /** 0 while the icon is still in flight, 1 once it has landed. */
  installed: number;
  /** The name under it, which arrives after the icon rather than with it. */
  labelled: number;
}> = ({ installed, labelled }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: IOS.wall }}>
    <svg width={PT_W} height={PT_H} viewBox={`0 0 ${PT_W} ${PT_H}`} style={{ position: "absolute" }}>
      <path
        d={`M ${PT_W} 250 C 300 300, 250 420, 300 560 C 340 680, 380 720, ${PT_W} 760 Z`}
        fill={IOS.wallBlob}
      />
      <path
        d={`M 0 700 C 90 660, 150 700, 200 ${PT_H} L 0 ${PT_H} Z`}
        fill={IOS.wallBlob}
        opacity={0.55}
      />
    </svg>

    <StatusBar light />

    <div
      style={{
        position: "absolute",
        left: HOME.cols[0] - HOME.icon / 2,
        top: HOME.row1 - HOME.icon / 2,
        width: HOME.icon,
        textAlign: "center",
        opacity: installed,
      }}
    >
      <AppIcon size={HOME.icon} />
      <div
        style={{
          marginTop: 6,
          fontSize: 11,
          color: "#FFFFFF",
          whiteSpace: "nowrap",
          opacity: labelled,
        }}
      >
        SkoolConnectNG
      </div>
    </div>

    {/* Page dots */}
    <div
      style={{
        position: "absolute",
        left: 0,
        top: HOME.dots,
        width: PT_W,
        display: "flex",
        justifyContent: "center",
        gap: 7,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#FFFFFF",
            opacity: i === 0 ? 1 : 0.36,
          }}
        />
      ))}
    </div>

    <div
      style={{
        position: "absolute",
        left: HOME.dock.x,
        top: HOME.dock.y,
        width: HOME.dock.w,
        height: HOME.dock.h,
        borderRadius: HOME.dock.r,
        backgroundColor: IOS.dock,
        opacity: 0.72,
      }}
    />
    {DOCK.map((d, i) => {
      const Mark = d.mark;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: HOME.dockCols[i] - 30,
            top: HOME.dock.y + HOME.dock.h / 2 - 30,
          }}
        >
          {/* Radius is in the mark's own 24-unit viewBox, not in pixels. iOS's
              0.2237 of a 60pt icon is 13.4px, which is 5.4 of those units —
              passing 13.4 here rounds every dock icon into a circle. */}
          <Mark size={60} radius={5.4} />
        </div>
      );
    })}

    <HomeIndicator light />
  </div>
);

/* ── What the film draws on top ───────────────────────────────────────── */

/**
 * The touch indicator.
 *
 * A drawn thumb was the alternative and is worse: at this size a hand covers
 * the control it is pressing at the exact moment the viewer needs to read it.
 * This is the indicator iOS itself draws when a screen recording has touches
 * turned on, so it is both honest about being a recording and already familiar
 * to anyone who has watched one.
 *
 * Drawn in frame space, outside `Screen`, so the press ring can spill over the
 * bezel without being clipped by the glass.
 */
export const Touch: React.FC<{
  x: number;
  y: number;
  opacity: number;
  /** 0-1, how hard it is pressed. */
  down: number;
  /** 0-1, one expanding ring per press. */
  tap: number;
}> = ({ x, y, opacity, down, tap }) => {
  if (opacity <= 0) return null;
  const r = 30 * PT * (1 - down * 0.22);
  return (
    <>
      {tap > 0 && tap < 1 ? (
        <div
          style={{
            position: "absolute",
            left: x - r,
            top: y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            border: `${3 * (1 - tap)}px solid ${TOUR.green}`,
            transform: `scale(${1 + tap * 1.5})`,
            opacity: (1 - tap) * opacity,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          backgroundColor: TOUR.green,
          opacity: (0.2 + down * 0.16) * opacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          border: `${2.5 * PT}px solid ${TOUR.green}`,
          opacity: (0.85 + down * 0.15) * opacity,
        }}
      />
    </>
  );
};

/**
 * The green ring the film draws around whatever is about to be pressed.
 *
 * The one place the brand colour is allowed near the screen, and it is always
 * *outside* the element it marks, never a fill on it — so a viewer never comes
 * away thinking iOS has a green button in it. `pathLength` normalises the
 * perimeter, so the draw-on reads at the same speed whatever the box's size.
 */
export const Ring: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  progress: number;
  opacity?: number;
}> = ({ x, y, w, h, r = 14, progress, opacity = 1 }) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0 || opacity <= 0) return null;
  // Enough clearance that the ring reads as the film pointing at the control
  // rather than as a border the control came with.
  const pad = 11;
  return (
    <svg
      width={w + pad * 2 + 8}
      height={h + pad * 2 + 8}
      style={{ position: "absolute", left: x - w / 2 - pad - 4, top: y - h / 2 - pad - 4 }}
    >
      <rect
        x={4}
        y={4}
        width={w + pad * 2}
        height={h + pad * 2}
        rx={r}
        fill="none"
        stroke={TOUR.green}
        strokeWidth={3.5}
        opacity={opacity}
        pathLength={1}
        strokeDasharray={`${p} 1`}
      />
    </svg>
  );
};
