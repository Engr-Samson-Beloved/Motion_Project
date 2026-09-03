/**
 * Turning a string of TSX into a running Remotion composition, in the browser.
 *
 * This is the piece that makes web authoring possible at all. In the terminal
 * the loop is: write a .tsx file, a bundler compiles it, Studio renders it.
 * Here there is no bundler and no filesystem, so both halves are done in the
 * page — Sucrase compiles, and a `require` shim resolves imports against a
 * fixed map of modules rather than against node_modules.
 *
 * That map is the security boundary as much as it is a convenience. Generated
 * code is evaluated, so the honest way to think about it is: whatever a module
 * in `MODULES` can do, generated code can do. Nothing resolves except what is
 * listed, and nothing in the list reaches the network or storage.
 */

import { transform } from "sucrase";
import * as React from "react";
import * as JsxRuntime from "react/jsx-runtime";
import * as Remotion from "remotion";
import * as Noise from "@remotion/noise";
import * as Paths from "@remotion/paths";
import * as MotionBlur from "@remotion/motion-blur";
import * as LayoutUtils from "@remotion/layout-utils";
import * as MediaUtils from "@remotion/media-utils";

import * as Cinema from "../../src/lib/cinema";
import * as Character from "../../src/lib/character";
import * as Motion from "../../src/skng/story/palette";

import { brandModule, type BrandProfile } from "./brand";
import { directionModule, type Direction } from "./direction";
import { isDark } from "./brand";
import { makeStageModule } from "./stage";

/**
 * The modules that are the same whatever brand is active.
 *
 * `@remotion/transitions` and `@remotion/shapes` are deliberately absent. Both
 * draw through Remotion's HTML-in-Canvas, which Chrome keeps behind
 * chrome://flags/#canvas-draw-element and leaves off — it is why `CinemaProbe`
 * renders as a black rectangle in this app. Offering them here would let the
 * model write a composition that typechecks, compiles, previews black, and
 * gives no clue why.
 */
const FIXED_MODULES: Readonly<Record<string, unknown>> = {
  react: React,
  "react/jsx-runtime": JsxRuntime,
  remotion: Remotion,
  "@remotion/noise": Noise,
  "@remotion/paths": Paths,
  "@remotion/motion-blur": MotionBlur,
  "@remotion/layout-utils": LayoutUtils,
  "@remotion/media-utils": MediaUtils,
  "@/cinema": Cinema,
  "@/character": Character,
  // Easing and ramp helpers. These were in the story film's palette module and
  // are pure timing maths — nothing brand-specific about them.
  "@/motion": {
    ramp: Motion.ramp,
    eramp: Motion.eramp,
    ease: Motion.ease,
    sceneFade: Motion.sceneFade,
  },
};

/**
 * The three that change with the brand and the direction.
 *
 * This is the seam the whole strategy turns on. A model told to "use #165538 for
 * headings" drifts — it paraphrases hex codes, invents near-misses, and has
 * forgotten by line 200. A model told to `import {BRAND} from "@/brand"` cannot
 * drift, because the values never appear in its output at all. The brand becomes
 * unforgeable rather than merely requested, and the same generated source
 * re-renders as any other brand by swapping what this function returns.
 */
export const modulesFor = (brand: BrandProfile, direction: Direction) => ({
  ...FIXED_MODULES,
  "@/brand": brandModule(brand),
  "@/direction": directionModule(direction, isDark(brand)),
  "@/stage": makeStageModule(brand, direction),
});

export const AVAILABLE_MODULES = [
  ...Object.keys(FIXED_MODULES),
  "@/brand",
  "@/direction",
  "@/stage",
];

export type CompositionConfig = {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
};

export type CompiledComposition = {
  component: React.FC<Record<string, unknown>>;
  config: CompositionConfig;
};

export type CompileResult =
  | { ok: true; value: CompiledComposition }
  | { ok: false; stage: "transform" | "evaluate" | "contract"; message: string };

const DEFAULT_CONFIG: CompositionConfig = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 300,
};

const asMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * A config is only usable if every field is a finite, positive number, and the
 * dimensions are even — h264 encodes in 2x2 blocks, so an odd width or height
 * fails at export rather than at preview, which is the worst place to find out.
 */
const readConfig = (raw: unknown): CompositionConfig => {
  if (typeof raw !== "object" || raw === null) {
    return DEFAULT_CONFIG;
  }
  const source = raw as Partial<Record<keyof CompositionConfig, unknown>>;
  const pick = (key: keyof CompositionConfig) => {
    const value = source[key];
    return typeof value === "number" && Number.isFinite(value) && value > 0
      ? Math.round(value)
      : DEFAULT_CONFIG[key];
  };
  const even = (n: number) => (n % 2 === 0 ? n : n + 1);
  return {
    width: even(pick("width")),
    height: even(pick("height")),
    fps: pick("fps"),
    durationInFrames: pick("durationInFrames"),
  };
};

/**
 * Strips a markdown fence if the model wrapped its answer in one. Asking for
 * bare code in the prompt works most of the time; handling the other times
 * here costs four lines and removes a whole category of confusing failure.
 */
export const stripCodeFence = (source: string) => {
  const fenced = /^\s*```(?:tsx?|typescript|jsx|javascript)?\s*\n([\s\S]*?)\n\s*```\s*$/;
  const match = fenced.exec(source);
  return match ? match[1] : source;
};

export const compileComposition = (
  rawSource: string,
  brand: BrandProfile,
  direction: Direction,
): CompileResult => {
  const source = stripCodeFence(rawSource);
  const modules = modulesFor(brand, direction);

  let code: string;
  try {
    code = transform(source, {
      transforms: ["typescript", "jsx", "imports"],
      jsxRuntime: "automatic",
      production: true,
    }).code;
  } catch (error) {
    return { ok: false, stage: "transform", message: asMessage(error) };
  }

  const moduleObject = { exports: {} as Record<string, unknown> };
  const requireShim = (name: string) => {
    if (Object.prototype.hasOwnProperty.call(modules, name)) {
      return modules[name as keyof typeof modules];
    }
    throw new Error(
      `Cannot import "${name}". This composition runs in the browser with a ` +
        `fixed set of modules, not from node_modules. Available: ` +
        `${AVAILABLE_MODULES.join(", ")}.`,
    );
  };

  try {
    const factory = new Function("require", "module", "exports", code);
    factory(requireShim, moduleObject, moduleObject.exports);
  } catch (error) {
    return { ok: false, stage: "evaluate", message: asMessage(error) };
  }

  const exported = moduleObject.exports;
  const component = exported.default;

  if (typeof component !== "function") {
    return {
      ok: false,
      stage: "contract",
      message:
        "No default export. The file must `export default` the composition " +
        "component, and `export const config = {width, height, fps, durationInFrames}`.",
    };
  }

  return {
    ok: true,
    value: {
      component: component as React.FC<Record<string, unknown>>,
      config: readConfig(exported.config),
    },
  };
};
