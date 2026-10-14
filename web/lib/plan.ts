/** A small, inspectable contract between creative planning and frame rendering. */
export type SceneKind = "type" | "orbit" | "signal" | "image" | "split";
export type SceneMotion = "rise" | "wipe" | "scale" | "drift";
export type MotionScene = {
  id: string;
  kind: SceneKind;
  motion: SceneMotion;
  beats: number;
  kicker: string;
  headline: string;
  detail: string;
  asset?: string;
};
export type MotionPlan = {
  title: string;
  thesis: string;
  format: "vertical" | "square" | "wide";
  scenes: MotionScene[];
};

const kinds: SceneKind[] = ["type", "orbit", "signal", "image", "split"];
const motions: SceneMotion[] = ["rise", "wipe", "scale", "drift"];
const textField = (value: unknown, name: string, max: number, required = false) => {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new Error(`${name} must be ${required ? "nonempty and " : ""}under ${max} characters.`);
  return value.trim();
};

export const parseMotionPlan = (raw: string, assets: string[]): MotionPlan => {
  const unfenced = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let value: unknown;
  try { value = JSON.parse(unfenced); } catch { throw new Error("The model did not return a JSON scene plan. Try generating again."); }
  if (!value || typeof value !== "object") throw new Error("The scene plan must be an object.");
  const item = value as Record<string, unknown>;
  if (!(["vertical", "square", "wide"] as unknown[]).includes(item.format)) throw new Error("Choose vertical, square, or wide format.");
  if (!Array.isArray(item.scenes) || item.scenes.length < 2 || item.scenes.length > 8) throw new Error("A plan needs 2 to 8 scenes.");
  const ids = new Set<string>();
  const scenes = item.scenes.map((rawScene, index): MotionScene => {
    if (!rawScene || typeof rawScene !== "object") throw new Error(`Scene ${index + 1} is invalid.`);
    const scene = rawScene as Record<string, unknown>;
    const id = textField(scene.id, `Scene ${index + 1} id`, 32, true);
    if (ids.has(id)) throw new Error(`Scene id ${id} is repeated.`);
    ids.add(id);
    if (!kinds.includes(scene.kind as SceneKind)) throw new Error(`Scene ${id} has an unknown visual kind.`);
    if (!motions.includes(scene.motion as SceneMotion)) throw new Error(`Scene ${id} has an unknown motion.`);
    if (!Number.isInteger(scene.beats) || (scene.beats as number) < 2 || (scene.beats as number) > 32) throw new Error(`Scene ${id} needs 2 to 32 beats.`);
    const asset = scene.asset === undefined || scene.asset === "" ? undefined : textField(scene.asset, `Scene ${id} asset`, 120);
    if (asset && !assets.includes(asset)) throw new Error(`Scene ${id} refers to missing asset ${asset}.`);
    if (scene.kind === "image" && !asset) throw new Error(`Image scene ${id} needs an attached asset.`);
    return { id, kind: scene.kind as SceneKind, motion: scene.motion as SceneMotion,
      beats: scene.beats as number, kicker: textField(scene.kicker, `Scene ${id} kicker`, 36),
      headline: textField(scene.headline, `Scene ${id} headline`, 80, true),
      detail: textField(scene.detail, `Scene ${id} detail`, 130), asset };
  });
  if (scenes.reduce((sum, scene) => sum + scene.beats, 0) > 256) throw new Error("The plan is too long; use at most 256 beats.");
  if (new Set(scenes.map((scene) => scene.kind)).size < 2) throw new Error("Use at least two distinct visual arrangements.");
  return { title: textField(item.title, "Title", 80, true), thesis: textField(item.thesis, "Visual thesis", 200, true), format: item.format as MotionPlan["format"], scenes };
};

export const planSystemPrompt = `You are a motion design director. Return only a valid JSON object, no prose or markdown. Create a specific visual thesis and a sequence of 2 to 8 scenes. Schema: {"title":"short name","thesis":"one visual idea carried through the film","format":"vertical|square|wide","scenes":[{"id":"unique-slug","kind":"type|orbit|signal|image|split","motion":"rise|wipe|scale|drift","beats":4,"kicker":"short label","headline":"short on-screen phrase","detail":"one short support line","asset":"optional exact filename"}]}. Beats are at the selected direction's BPM; total beats should match the requested duration as closely as possible. Use at least two kinds, varied scale and pacing, and a final scene with a clear action if the brief has a CTA. Treat supplied facts and exact copy as binding. Never invent claims, URLs, or assets. Choose image only when an attached filename exists. type is expressive typography; orbit is a large focal sphere and satellites; signal is a flowing network of lines and nodes; split is a two-part contrast or transformation. The visual kinds are ingredients, not a formula; pick what fits the subject.`;

export const requestedBeats = (request: string, bpm: number): number | null => {
  const seconds = /\b(\d+(?:\.\d+)?)\s*(?:-\s*)?(?:seconds?|secs?|s)\b/i.exec(request);
  const minutes = /\b(\d+(?:\.\d+)?)\s*(?:-\s*)?(?:minutes?|mins?)\b/i.exec(request);
  const duration = seconds ? Number(seconds[1]) : minutes ? Number(minutes[1]) * 60 : null;
  return duration !== null && duration >= 2 && duration <= 120 ? Math.round(duration * bpm / 60) : null;
};

/** Snap explicit durations to the beat grid without changing the scene arc. */
export const fitPlanToBeats = (plan: MotionPlan, target: number | null): MotionPlan => {
  if (target === null) return plan;
  const min = plan.scenes.length * 2;
  const max = plan.scenes.length * 32;
  if (target < min || target > max) throw new Error(`The requested duration needs ${target} beats, outside this ${plan.scenes.length}-scene plan. Add or remove scenes.`);
  const scenes = plan.scenes.map((scene) => ({...scene}));
  let current = scenes.reduce((sum, scene) => sum + scene.beats, 0);
  while (current !== target) {
    const increasing = current < target;
    const candidates = scenes.filter((scene) => increasing ? scene.beats < 32 : scene.beats > 2);
    if (!candidates.length) break;
    const candidate = candidates.reduce((a, b) => increasing ? (a.beats <= b.beats ? a : b) : (a.beats >= b.beats ? a : b));
    candidate.beats += increasing ? 1 : -1;
    current += increasing ? 1 : -1;
  }
  return {...plan, scenes};
};

export const planPrompt = (request: string, bpm: number, assets: string[], previous?: MotionPlan) =>
  `${previous ? `Revise this scene plan while preserving its useful decisions:\n${JSON.stringify(previous)}\n\nRequested change: ` : "Create a scene plan for: "}${request}\n\nTempo: ${bpm} BPM.${requestedBeats(request,bpm) ? ` Total exactly ${requestedBeats(request,bpm)} beats.` : ""} Attached filenames: ${assets.length ? assets.join(", ") : "none"}.`;

export const sourceFromPlan = (plan: MotionPlan, beatFrames: number) => {
  const dimensions = plan.format === "wide" ? [1920, 1080] : plan.format === "square" ? [1080, 1080] : [1080, 1920];
  const duration = plan.scenes.reduce((sum, scene) => sum + scene.beats, 0) * beatFrames;
  return `import {StoryFilm} from "@/story";\nexport const config = {width:${dimensions[0]},height:${dimensions[1]},fps:30,durationInFrames:${duration}};\nexport const motionPlan = ${JSON.stringify(plan, null, 2)};\nexport default function Composition(){return <StoryFilm plan={motionPlan}/>;}\n`;
};
