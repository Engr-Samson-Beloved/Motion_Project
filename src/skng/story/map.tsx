import React from "react";
import { BODY_FONT, STORY, ease } from "./palette";
import { CITIES, EDGES, borderPath, project } from "./nigeria";
import { NodeDot, Wire } from "./ui";

/**
 * Nigeria, as a simplified flat map with the student network drawn on it.
 *
 * One component serves scenes 03, 05, 08 and 09 because they are the same
 * picture at four stages: an outline with two lonely nodes, an outline with
 * lines reaching out from the logo, a country filling with connections, and a
 * finished network holding a steady pulse. Everything is driven by explicit
 * 0..1 progress props so a scene decides the stage rather than the map.
 */

export type MapProps = {
  width: number;
  height: number;
  /** 0..1, draws the border stroke. */
  outline: number;
  /** 0..1 across the whole city list, in order. */
  nodes?: number;
  /** 0..1 across the whole edge list, in order. */
  edges?: number;
  /** City indices drawn as hubs regardless of rank. */
  highlight?: readonly number[];
  /** City indices to label. */
  labels?: readonly number[];
  /** Breathing on the hub rings, 0..1. */
  pulse?: number;
  /** Scales node and label sizes without changing the map's geometry. */
  detail?: number;
  outlineColor?: string;
  fill?: string;
};

/** Where a city sits inside a `width` x `height` map box. */
export const cityAt = (i: number, width: number, height: number) => {
  const p = project(width, height);
  return p(CITIES[i].lon, CITIES[i].lat);
};

/**
 * Stagger a 0..1 whole-list progress into a per-item 0..1.
 *
 * `spread` is how much of the timeline is spent starting items rather than
 * finishing them: at 0.7 the last item begins at 70% and has the remaining
 * 30% to complete, so the list arrives in sequence and still lands together.
 */
const staggered = (progress: number, i: number, count: number, spread = 0.7) => {
  const start = count <= 1 ? 0 : (i / (count - 1)) * spread;
  const span = 1 - spread;
  return Math.max(0, Math.min(1, (progress - start) / (span || 1)));
};

export const NigeriaMap: React.FC<MapProps> = ({
  width,
  height,
  outline,
  nodes = 0,
  edges = 0,
  highlight = [],
  labels = [],
  pulse = 0,
  detail = 1,
  outlineColor = STORY.line2,
  fill = STORY.dark2,
}) => {
  const d = React.useMemo(() => borderPath(width, height), [width, height]);
  // The outline is ~2.5 box-widths of path once the coastline is counted;
  // over-length dashes only mean the stroke finishes slightly early, which is
  // far cheaper than measuring the path on every frame.
  const pathLen = (width + height) * 2.6;
  const o = ease(Math.max(0, Math.min(1, outline)));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Flat landmass, revealed after the outline has drawn itself. */}
      <path
        d={d}
        fill={fill}
        opacity={Math.max(0, Math.min(1, (o - 0.55) / 0.45)) * 0.9}
      />
      <path
        d={d}
        fill="none"
        stroke={outlineColor}
        strokeWidth={2 * detail}
        strokeLinejoin="round"
        strokeDasharray={pathLen}
        strokeDashoffset={pathLen * (1 - o)}
      />

      {edges > 0
        ? EDGES.map(([a, b], i) => (
            <Wire
              key={`e${i}`}
              a={cityAt(a, width, height)}
              b={cityAt(b, width, height)}
              progress={staggered(edges, i, EDGES.length, 0.72)}
              width={1.4 * detail}
              opacity={0.75}
            />
          ))
        : null}

      {nodes > 0
        ? CITIES.map((c, i) => {
            const p = staggered(nodes, i, CITIES.length, 0.75);
            if (p <= 0) return null;
            const at = cityAt(i, width, height);
            return (
              <NodeDot
                key={c.name}
                at={at}
                progress={p}
                hub={c.rank === 2 || highlight.includes(i)}
                pulse={pulse}
                scale={detail}
              />
            );
          })
        : null}

      {labels.map((i) => {
        const at = cityAt(i, width, height);
        return (
          <text
            key={`l${i}`}
            x={at.x + 14 * detail}
            y={at.y + 5 * detail}
            fill={STORY.muted}
            fontFamily={BODY_FONT}
            fontSize={15 * detail}
            fontWeight={600}
            opacity={Math.max(0, Math.min(1, nodes * 1.4 - 0.3))}
          >
            {CITIES[i].name}
          </text>
        );
      })}
    </svg>
  );
};
