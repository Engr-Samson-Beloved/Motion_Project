import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Film grade — grain, bloom, vignette and chromatic aberration.
 *
 * Deliberately dependency-free: this is an SVG filter chain plus one CSS
 * overlay, which is most of the "shot on something" look for almost no cost.
 *
 * Every primitive is driven by the frame number alone, so the grade is
 * deterministic — frame N always produces the same noise field, whether it is
 * rendered in Studio, in a preview, or on the tenth retry of a render.
 */

export type FilmGradeProps = {
  children: React.ReactNode;
  /** Film grain strength. 0 disables the primitive entirely. */
  grain?: number;
  /** Highlight bloom. Blurs the source and screens it back over itself. */
  bloom?: number;
  /** Corner darkening. Rendered as a CSS overlay, not part of the filter. */
  vignette?: number;
  /** Lateral RGB split, in pixels at the widest. Keep this low. */
  aberration?: number;
  /** Grain size. Higher is finer. */
  grainFrequency?: number;
  style?: React.CSSProperties;
};

export const FilmGrade: React.FC<FilmGradeProps> = ({
  children,
  grain = 0.18,
  bloom = 0.35,
  vignette = 0.45,
  aberration = 0,
  grainFrequency = 0.85,
  style,
}) => {
  const frame = useCurrentFrame();
  const id = React.useId().replace(/:/g, "");
  const filterId = `grade-${id}`;

  // Consecutive feTurbulence seeds produce visibly similar fields, so stride
  // through the seed space instead of using the raw frame number.
  const seed = (frame * 7919) % 65536;

  const primitives: React.ReactNode[] = [];
  let last = "SourceGraphic";

  if (aberration > 0) {
    primitives.push(
      <React.Fragment key="ab">
        <feOffset in={last} dx={aberration} dy={0} result="abRShift" />
        <feColorMatrix
          in="abRShift"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="abR"
        />
        <feOffset in={last} dx={-aberration} dy={0} result="abBShift" />
        <feColorMatrix
          in="abBShift"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
          result="abB"
        />
        <feColorMatrix
          in={last}
          type="matrix"
          values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="abG"
        />
        <feBlend in="abR" in2="abG" mode="screen" result="abRG" />
        <feBlend in="abRG" in2="abB" mode="screen" result="aberrated" />
      </React.Fragment>,
    );
    last = "aberrated";
  }

  if (bloom > 0) {
    primitives.push(
      <React.Fragment key="bloom">
        <feGaussianBlur in={last} stdDeviation={10 + bloom * 26} result="bloomBlur" />
        <feComponentTransfer in="bloomBlur" result="bloomGlow">
          <feFuncA type="linear" slope={bloom} />
        </feComponentTransfer>
        <feBlend in={last} in2="bloomGlow" mode="screen" result="bloomed" />
      </React.Fragment>,
    );
    last = "bloomed";
  }

  if (grain > 0) {
    primitives.push(
      <React.Fragment key="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={grainFrequency}
          numOctaves={2}
          seed={seed}
          stitchTiles="stitch"
          result="grainNoise"
        />
        <feColorMatrix in="grainNoise" type="saturate" values="0" result="grainMono" />
        {/*
          Overlay blending compares colour channels, so the noise has to live in
          RGB centred on 0.5 — mid grey is overlay's no-op. Scaling the alpha
          channel instead (the obvious first guess) produces a filter that is
          technically applied and completely invisible.

          Alpha is forced opaque for the same reason: feTurbulence writes noise
          into alpha too, which would punch holes in the frame.
        */}
        <feComponentTransfer in="grainMono" result="grainField">
          <feFuncR type="linear" slope={grain} intercept={0.5 - grain / 2} />
          <feFuncG type="linear" slope={grain} intercept={0.5 - grain / 2} />
          <feFuncB type="linear" slope={grain} intercept={0.5 - grain / 2} />
          <feFuncA type="linear" slope={0} intercept={1} />
        </feComponentTransfer>
        <feBlend in={last} in2="grainField" mode="overlay" result="grained" />
      </React.Fragment>,
    );
    last = "grained";
  }

  const hasFilter = primitives.length > 0;

  return (
    <AbsoluteFill style={style}>
      {hasFilter ? (
        <svg
          width={0}
          height={0}
          style={{ position: "absolute", pointerEvents: "none" }}
          aria-hidden
        >
          <defs>
            {/*
              The filter region is the element exactly, with no bleed. The grain
              primitive is opaque across the whole region, so any overflow would
              paint grey noise outside the content. These are full-frame grades,
              so clipping the bloom at the frame edge costs nothing.
            */}
            <filter
              id={filterId}
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              {primitives}
            </filter>
          </defs>
        </svg>
      ) : null}

      <AbsoluteFill style={hasFilter ? { filter: `url(#${filterId})` } : undefined}>
        {children}
      </AbsoluteFill>

      {vignette > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(72% 62% at 50% 48%, rgba(0,0,0,0) 42%, rgba(0,0,0,${vignette}) 100%)`,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
