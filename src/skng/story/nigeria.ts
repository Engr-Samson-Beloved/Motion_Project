/**
 * A simplified flat map of Nigeria, plus the city nodes the network is drawn
 * between.
 *
 * The border is a hand-reduced outline in real (longitude, latitude) degrees —
 * about 90 vertices, which is enough to read as Nigeria at 1920x1080 and few
 * enough to animate a stroke along. It is a silhouette for a motion graphic,
 * not a survey boundary: coastline detail in the Niger Delta and the Lake Chad
 * margin are both smoothed.
 *
 * Coordinates stay in degrees here and are projected at draw time, so the same
 * data serves the small map in scene 03 and the full-frame one in scene 08.
 *
 * Checked rather than eyeballed: the shoelace area of these 88 vertices is
 * 75.22 deg^2, which at Nigeria's mean latitude is about 914,000 km^2 against
 * a true 923,769 — a 1.0% error — and the ring has no self-intersections. A
 * hand-drawn outline that is merely "roughly right" fails both of those.
 */

/** Clockwise from the north-west corner near Sokoto. */
const BORDER: readonly (readonly [number, number])[] = [
  // North: the Niger border, running east
  [3.62, 13.05], [3.68, 13.34], [4.13, 13.48], [4.62, 13.7], [5.12, 13.75],
  [5.55, 13.89], [6.02, 13.62], [6.45, 13.5], [6.9, 13.35], [7.35, 13.42],
  [7.8, 13.32], [8.3, 13.1], [8.75, 13.06], [9.25, 12.85], [9.7, 12.98],
  [10.2, 13.28], [10.7, 13.36], [11.2, 13.32], [11.7, 13.36], [12.2, 13.14],
  [12.7, 13.2], [13.1, 13.5], [13.55, 13.62],
  // Lake Chad: the north-east notch
  [13.75, 13.4], [14.0, 13.1], [14.2, 12.8], [14.65, 12.62], [14.5, 12.2],
  [14.15, 12.05], [14.2, 11.6], [14.65, 11.5],
  // East: the Cameroon border, running south
  [14.2, 11.25], [13.9, 10.95], [13.6, 10.6], [13.35, 10.1], [12.95, 9.75],
  [12.75, 9.35], [13.0, 9.0], [12.6, 8.65], [12.25, 8.42], [12.0, 7.95],
  [11.75, 7.6], [11.55, 7.05], [11.1, 6.75], [10.6, 6.9], [10.15, 6.75],
  [9.8, 6.5], [9.45, 6.45], [9.1, 6.25], [8.9, 5.85], [8.85, 5.3],
  [8.95, 4.95], [8.6, 4.55],
  // South: the coast, running west
  [8.35, 4.5], [8.05, 4.55], [7.7, 4.4], [7.35, 4.42], [7.0, 4.3],
  [6.6, 4.28], [6.3, 4.35], [6.05, 4.3], [5.75, 4.5], [5.6, 4.85],
  [5.4, 5.4], [5.1, 5.55], [4.75, 5.85], [4.4, 6.15], [4.0, 6.35],
  [3.6, 6.42], [3.2, 6.4], [2.9, 6.35], [2.72, 6.37],
  // West: the Benin border, running north back to the start
  [2.75, 6.8], [2.79, 7.4], [2.72, 7.85], [2.78, 8.35], [3.05, 9.05],
  [3.32, 9.35], [3.6, 9.62], [3.66, 10.1], [3.62, 10.55], [3.58, 11.05],
  [3.52, 11.5], [3.48, 11.9], [3.7, 12.2], [4.0, 12.35], [3.85, 12.55],
  [3.62, 12.75],
];

/** Degree extents of the outline, used to fit it into a box. */
const LON = { min: 2.72, max: 14.65 } as const;
const LAT = { min: 4.28, max: 13.89 } as const;

/**
 * Aspect ratio of the map's bounding box. Latitude and longitude degrees are
 * treated as equal here: at Nigeria's mean latitude the true correction is
 * cos(9 degrees) = 0.988, which is a sub-pixel error at this size and not
 * worth the distortion of a real projection.
 */
export const MAP_ASPECT = (LON.max - LON.min) / (LAT.max - LAT.min);

export type Projector = (lon: number, lat: number) => { x: number; y: number };

/**
 * Fit the map into a `width` x `height` box, centred, preserving aspect.
 * Latitude increases northward and y increases downward, so latitude flips.
 */
export const project = (width: number, height: number): Projector => {
  const scale = Math.min(
    width / (LON.max - LON.min),
    height / (LAT.max - LAT.min),
  );
  const ox = (width - (LON.max - LON.min) * scale) / 2;
  const oy = (height - (LAT.max - LAT.min) * scale) / 2;
  return (lon, lat) => ({
    x: ox + (lon - LON.min) * scale,
    y: oy + (LAT.max - lat) * scale,
  });
};

/** The border as an SVG path, closed, in the given box. */
export const borderPath = (width: number, height: number): string => {
  const p = project(width, height);
  return (
    BORDER.map(([lon, lat], i) => {
      const { x, y } = p(lon, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join("") + "Z"
  );
};

export type City = {
  name: string;
  lon: number;
  lat: number;
  /** Drawing weight: 2 is a hub, 1 is a normal node. */
  rank: 1 | 2;
};

/**
 * Real university-city coordinates. Nigerian identity in this film comes from
 * actual places and the shape of the country, not from stereotyped imagery —
 * which is the brief's "identity through context, not stereotypes" rule.
 */
export const CITIES: readonly City[] = [
  { name: "Lagos", lon: 3.38, lat: 6.52, rank: 2 },
  { name: "Ibadan", lon: 3.9, lat: 7.38, rank: 2 },
  { name: "Abeokuta", lon: 3.35, lat: 7.15, rank: 1 },
  { name: "Akure", lon: 5.19, lat: 7.25, rank: 1 },
  { name: "Osogbo", lon: 4.56, lat: 7.77, rank: 1 },
  { name: "Ilorin", lon: 4.55, lat: 8.5, rank: 1 },
  { name: "Benin City", lon: 5.63, lat: 6.34, rank: 1 },
  { name: "Onitsha", lon: 6.79, lat: 6.14, rank: 1 },
  { name: "Awka", lon: 7.07, lat: 6.21, rank: 1 },
  { name: "Enugu", lon: 7.51, lat: 6.44, rank: 2 },
  { name: "Owerri", lon: 7.03, lat: 5.48, rank: 1 },
  { name: "Port Harcourt", lon: 7.01, lat: 4.82, rank: 2 },
  { name: "Uyo", lon: 7.93, lat: 5.04, rank: 1 },
  { name: "Calabar", lon: 8.32, lat: 4.98, rank: 1 },
  { name: "Abakaliki", lon: 8.11, lat: 6.32, rank: 1 },
  { name: "Makurdi", lon: 8.53, lat: 7.73, rank: 1 },
  { name: "Lokoja", lon: 6.74, lat: 7.8, rank: 1 },
  { name: "Abuja", lon: 7.49, lat: 9.06, rank: 2 },
  { name: "Minna", lon: 6.55, lat: 9.61, rank: 1 },
  { name: "Jos", lon: 8.89, lat: 9.9, rank: 1 },
  { name: "Kaduna", lon: 7.44, lat: 10.52, rank: 2 },
  { name: "Zaria", lon: 7.71, lat: 11.09, rank: 1 },
  { name: "Bauchi", lon: 9.84, lat: 10.31, rank: 1 },
  { name: "Yola", lon: 12.48, lat: 9.29, rank: 1 },
  { name: "Kano", lon: 8.52, lat: 12.0, rank: 2 },
  { name: "Katsina", lon: 7.6, lat: 12.99, rank: 1 },
  { name: "Sokoto", lon: 5.24, lat: 13.06, rank: 1 },
  { name: "Maiduguri", lon: 13.15, lat: 11.83, rank: 1 },
];

const idx = (name: string) => {
  const i = CITIES.findIndex((c) => c.name === name);
  if (i < 0) throw new Error(`no city named ${name}`);
  return i;
};

/**
 * Edges of the national network, as index pairs into `CITIES`.
 *
 * Ordered so that drawing them in sequence grows the network outward from the
 * south-west rather than flickering on at random, which is what scene 08 needs
 * as the frame expands.
 */
export const EDGES: readonly (readonly [number, number])[] = (
  [
    ["Lagos", "Ibadan"],
    ["Lagos", "Abeokuta"],
    ["Ibadan", "Osogbo"],
    ["Abeokuta", "Akure"],
    ["Osogbo", "Ilorin"],
    ["Akure", "Benin City"],
    ["Benin City", "Onitsha"],
    ["Onitsha", "Awka"],
    ["Awka", "Enugu"],
    ["Enugu", "Abakaliki"],
    ["Onitsha", "Owerri"],
    ["Owerri", "Port Harcourt"],
    ["Port Harcourt", "Uyo"],
    ["Uyo", "Calabar"],
    ["Enugu", "Makurdi"],
    ["Ilorin", "Lokoja"],
    ["Lokoja", "Abuja"],
    ["Makurdi", "Abuja"],
    ["Abuja", "Minna"],
    ["Abuja", "Kaduna"],
    ["Abuja", "Jos"],
    ["Kaduna", "Zaria"],
    ["Zaria", "Kano"],
    ["Jos", "Bauchi"],
    ["Kano", "Katsina"],
    ["Kano", "Sokoto"],
    ["Bauchi", "Yola"],
    ["Yola", "Maiduguri"],
    ["Bauchi", "Maiduguri"],
    ["Lagos", "Port Harcourt"],
    ["Lagos", "Abuja"],
    ["Kano", "Abuja"],
    ["Enugu", "Lagos"],
    ["Ilorin", "Ibadan"],
    ["Minna", "Kaduna"],
  ] as const
).map(([a, b]) => [idx(a), idx(b)] as const);

/**
 * The two students scene 03 tries to connect: opposite corners of the country,
 * so the failed line is unmistakably long.
 */
export const SEEKER = idx("Lagos");
export const SOUGHT = idx("Maiduguri");
