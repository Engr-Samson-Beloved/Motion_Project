/**
 * Where Brand meets Direction.
 *
 * Everything in here is a component the generated composition gets for free, so
 * that the decisions which make work look cheap when they are wrong are never
 * the model's to make. It wraps `lib/cinema`, which is the brand-agnostic craft
 * layer this whole split rests on.
 *
 * The argument for `<Stage>` in particular: a model asked to "wrap the scene in
 * FilmGrade at grain 0.13, bloom 0 on a light ground, and add a handheld camera
 * unless the layout is a grid" will get it right most of the time. Most of the
 * time is not good enough for the thing that separates footage from a drawing.
 * `<Stage>` gets it right every time, and the composition just says `<Stage>`.
 */

import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import {
  FilmGrade,
  HandheldCamera,
  PushIn,
  useFittedFontSize,
} from "../../src/lib/cinema";
import { isDark, type BrandProfile } from "./brand";
import { gradeFor, type Direction } from "./direction";

export const makeStageModule = (
  brand: BrandProfile,
  direction: Direction,
) => {
  const dark = isDark(brand);
  const grade = gradeFor(direction, dark);

  /**
   * The frame. Ground, grade, and camera — in that order, and the order
   * matters: grain sits on the lens, so it must not move with the camera.
   */
  const Stage: React.FC<{
    children: React.ReactNode;
    /** Override the brand ground for one scene. Rare, but a logo moment
     *  sometimes needs a deeper field than the brand's own surface. */
    background?: string;
  }> = ({ children, background }) => {
    let inner = <>{children}</>;

    if (direction.camera) {
      inner = <HandheldCamera {...direction.camera}>{inner}</HandheldCamera>;
    }
    if (direction.push) {
      inner = (
        <PushIn from={direction.push.from} to={direction.push.to}>
          {inner}
        </PushIn>
      );
    }

    /*
      The ground goes INSIDE the grade, as its first child — not behind it.
      `FilmGrade` is an SVG filter chain, and a filter with nothing opaque
      underneath composites its grain over transparency, which renders as a
      flat mid-grey field whatever colour the brand is. Every piece in `skng/`
      does it this way; `install/AddToHome.tsx` is the clearest example.
    */
    return (
      <AbsoluteFill>
        <FilmGrade {...grade}>
          <AbsoluteFill
            style={{ backgroundColor: background ?? brand.ground }}
          />
          {inner}
        </FilmGrade>
      </AbsoluteFill>
    );
  };

  /**
   * The small line above a headline. Mono, letterspaced, accent — the one
   * place the accent is always correct, which discourages spending it
   * elsewhere.
   */
  const Kicker: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
  }> = ({ children, style }) => (
    <div
      style={{
        fontFamily: brand.monoFont,
        fontSize: 26,
        letterSpacing: 8,
        textTransform: "uppercase",
        color: brand.accent,
        ...style,
      }}
    >
      {children}
    </div>
  );

  /**
   * Display type that measures itself against the frame it is in.
   *
   * `size` is a cap, not an instruction — the text renders at that size or
   * smaller, never larger. This is not a nicety: the same string is a different
   * width in every brand's face, and a brand whose voice is `caps` sets far
   * wider than one in sentence case. A fixed size that fits one client clips in
   * the next, and clipping is invisible in the source.
   *
   * The safe width also accounts for the camera. `<HandheldCamera>` scales the
   * frame up slightly before it drifts, so the frame can never expose its own
   * edges — which means anything near an edge is pushed out of shot.
   *
   * Takes `text` rather than children so it can be measured. Use "\n" for a
   * line break.
   */
  const Heading: React.FC<{
    text: string;
    size?: number;
    style?: React.CSSProperties;
  }> = ({ text, size = 132, style }) => {
    const { width } = useVideoConfig();
    const cased = brand.voice === "caps" ? text.toUpperCase() : text;
    const lines = cased.split("\n");

    // Tighter margin when a camera is active, because the push eats into it.
    const safe = width * (direction.camera ? 0.76 : 0.86);
    const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b), "");

    const fontSize = useFittedFontSize({
      text: longest,
      withinWidth: safe,
      maxFontSize: size,
      minFontSize: 32,
      fontFamily: brand.headingFont,
      fontWeight: 900,
      letterSpacing: brand.headingTracking,
    });

    return (
      <div
        style={{
          fontFamily: brand.headingFont,
          fontWeight: 900,
          fontSize,
          lineHeight: 0.96,
          letterSpacing: brand.headingTracking,
          color: brand.ink,
          maxWidth: safe,
          ...style,
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    );
  };

  const Body: React.FC<{
    children: React.ReactNode;
    size?: number;
    style?: React.CSSProperties;
  }> = ({ children, size = 40, style }) => (
    <div
      style={{
        fontFamily: brand.bodyFont,
        fontSize: size,
        lineHeight: 1.4,
        color: brand.muted,
        maxWidth: 720,
        ...style,
      }}
    >
      {children}
    </div>
  );

  /**
   * A rule that wipes rather than fades. `progress` is 0 to 1 — a hard edge
   * travelling reads as deliberate where an opacity ramp reads as an
   * afterthought.
   */
  const Rule: React.FC<{
    progress: number;
    width?: number;
    thickness?: number;
    style?: React.CSSProperties;
  }> = ({ progress, width = 320, thickness = 6, style }) => (
    <div
      style={{
        width,
        height: thickness,
        backgroundColor: brand.accent,
        transform: `scaleX(${Math.max(0, Math.min(1, progress))})`,
        transformOrigin: "left center",
        ...style,
      }}
    />
  );

  return { Stage, Kicker, Heading, Body, Rule };
};

export type StageModule = ReturnType<typeof makeStageModule>;
