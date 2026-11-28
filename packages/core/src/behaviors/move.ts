import { curveOf, type Curve } from "../feel/curves.ts";
import { evaluateEasing, type EasingSpec } from "../kernel/easing.ts";
import type { Beat, ColorKey, CueIR, MotionBlockIR, MotionPurpose, MotionReason, ScalarKey, SceneNodeIR, TextNodeIR, Vec2Key } from "../kernel/ir.ts";
import type { Score } from "../kernel/score.ts";

/** What a move changes. Every one composes with what the object's groups do. */
export type MoveProperty = "position" | "scale" | "rotation" | "opacity" | "blur" | "letterSpacing" | "color";

/**
 * A place or a distance, relative to where the object rests: `{ x: 1.28 }` is 1.28 em to its right,
 * `{ y: -0.5 }` half an em above. `unit: "stage"` reads x as a share of the stage width and y of
 * its height; `"px"` takes pixels as they are.
 */
export interface Offset {
  x?: number;
  y?: number;
  unit?: "em" | "stage" | "px";
}

/**
 * position: an `Offset` from its place. scale: a multiple of its resting size (or `{ x, y }`).
 * rotation: degrees from upright. opacity: 0 to 1. blur: design units. letterSpacing: em added to
 * its own. color: `#RRGGBB`.
 */
export type MoveValue = number | string | Offset;

/**
 * One move: what changes, from where to where, for how long, on which curve, and why. What is left
 * out is where the object rests: a position at its place, its own size, colour and spacing, sharp,
 * upright and opaque. So `{ property: "position", from: { x: 1.28 } }` comes in from the right, and
 * `{ property: "position", to: { y: -0.7 } }` goes up and stays there.
 */
export interface Move {
  property: MoveProperty;
  from?: MoveValue;
  to?: MoveValue;
  /** Values passed on the way, evenly spaced in time. With `curve: "step"` each is held: a flicker. */
  via?: MoveValue[];
  /** Seconds it takes. Left out, the time the beat it belongs to gives it. */
  sec?: number;
  /** Seconds after the beat's moment that it starts. */
  delay?: number;
  /** A family by name (`"brake"`, `"launch"`, `"whip"`, `"even"`, `"step"`) or any easing. */
  curve?: Curve;
  /** Why, in your words. It names the movement in an editor and stays in the document. */
  reason?: string;
  /**
   * What follows once this has ended. A following move of the same property carries on from where
   * this one stopped, so `then: { to: { y: 0 }, sec: 0.6 }` floats back to its place.
   */
  then?: Move | Move[];
  /** A stem for the movement's id, when something else has to find it. */
  id?: string;
}

export interface MoveOptions {
  /** The frame the moves are counted from. */
  at: number;
  /** Seconds a move takes when it gives none. */
  sec?: number;
  curve?: Curve;
  /** Pixels in one em. Defaults to the object's type size, or the type size of the first text it carries. */
  em?: number;
  /** The beat the moves belong to, so a pattern's relations can find them. */
  beat?: Beat;
  purpose?: MotionPurpose;
  cue?: CueIR;
  lands?: MotionReason["lands"];
  /** `"in"`: the object does not exist before its first move here. `"out"`: it is gone when the last one ends. */
  stage?: "in" | "out";
  /** Values a move starts from when it gives none, by property, in the move's own units. */
  rest?: Partial<Record<MoveProperty, MoveValue>>;
}

export interface Written {
  blocks: MotionBlockIR[];
  /** First and last frame written. */
  start: number;
  end: number;
  /** The frame the eye takes everything as arrived: a long tail lands well before its last key. */
  rest: number;
}

const round = (n: number, places = 2) => Math.round(n * 10 ** places) / 10 ** places;

/** With this share of its travel left, a movement has come to rest for the eye. The audit uses the same share. */
const AT_REST = 0.02;
/** Nearer its place than this, in em, an object reads as landed however long its travel was. */
const AT_REST_EM = 0.03;

/** The share of its span at which an ease moves fastest. */
export function fastestShare(spec: EasingSpec): number {
  let at = 0.5;
  let top = -1;
  for (let i = 1; i < 200; i++) {
    const t = i / 200;
    const v = evaluateEasing(spec, t + 0.0025) - evaluateEasing(spec, t - 0.0025);
    if (v > top) {
      top = v;
      at = t;
    }
  }
  return at;
}

/**
 * Frames after its first until a movement over `frames` on `spec` has come to rest for the eye.
 * `near` is the share of the travel that already counts as there.
 */
export function landsAfter(spec: EasingSpec | undefined, frames: number, near = AT_REST): number {
  const last = Math.max(1, frames - 1);
  for (let f = 0; f < last; f++) if (1 - evaluateEasing(spec, f / last) <= Math.max(AT_REST, near)) return f;
  return last;
}

/** The share of a travel of `distance` pixels that is within reading distance of its end. */
export function nearShare(distance: number, em: number): number {
  return distance <= 0 ? 1 : Math.min(1, (AT_REST_EM * em) / distance);
}

const PURPOSE: Record<string, MotionPurpose> = { prep: "arrive", hit: "arrive", settle: "arrive", join: "arrive", room: "carry", mark: "respond", hold: "drift", leave: "depart", handoff: "carry" };
const STEM: Record<MoveProperty, string> = { position: "moves", scale: "scales", rotation: "turns", opacity: "shows", blur: "focus", letterSpacing: "tracks", color: "colour" };
const VERB: Record<MoveProperty, string> = { position: "moves", scale: "changes size", rotation: "turns", opacity: "shows", blur: "changes focus", letterSpacing: "changes spacing", color: "changes colour" };

function fontSizeOf(score: Score, node: SceneNodeIR): number | undefined {
  if (node.kind === "text") return node.fontSize;
  for (const child of score.nodes) {
    if (child.parentId !== node.id) continue;
    const size = fontSizeOf(score, child);
    if (size) return size;
  }
  return undefined;
}

function textsUnder(score: Score, node: SceneNodeIR): TextNodeIR[] {
  if (node.kind === "text") return [node];
  return score.nodes.filter((n) => n.parentId === node.id).flatMap((n) => textsUnder(score, n));
}

/**
 * Writes moves on an object that already exists. Give one move or several: several are layered,
 * each on its own property, and a move's `then` follows it. Distances are in em of the object's
 * type unless a move says otherwise, times are seconds, and each movement keeps its reason. A move
 * on a group moves what the group carries; a colour or letter-spacing move on a group is written
 * on each text in it.
 *
 * This is the piece every beat of a shot is made of. `enter`, `land`, `makeRoom`, `drift` and
 * `leave` are moves with the solving a particular beat needs.
 */
export function move(score: Score, target: string | { id: string }, moves: Move | Move[], opts: MoveOptions): Written {
  const node = score.node(typeof target === "string" ? target : target.id);
  const fps = score.format.fps;
  const em = opts.em ?? fontSizeOf(score, node) ?? score.du(72);
  const label = node.kind === "text" ? node.text : node.name;
  const blocks: MotionBlockIR[] = [];
  let start = Infinity;
  let end = -Infinity;
  let rest = opts.at;

  const px = (value: MoveValue | undefined, fallback: { x: number; y: number }) => {
    if (value === undefined) return fallback;
    if (typeof value === "number") return { x: value * em, y: value * em };
    if (typeof value === "string") throw new Error(`A position is { x, y }, not "${value}".`);
    const kx = value.unit === "stage" ? score.format.width : value.unit === "px" ? 1 : em;
    const ky = value.unit === "stage" ? score.format.height : value.unit === "px" ? 1 : em;
    return { x: (value.x ?? 0) * kx, y: (value.y ?? 0) * ky };
  };
  const pair = (value: MoveValue | undefined, fallback: { x: number; y: number }) => {
    if (value === undefined) return fallback;
    if (typeof value === "number") return { x: value, y: value };
    if (typeof value === "string") throw new Error(`A scale is a number or { x, y }, not "${value}".`);
    return { x: value.x ?? 1, y: value.y ?? 1 };
  };
  const number = (value: MoveValue | undefined, fallback: number, what: string) => {
    if (value === undefined) return fallback;
    if (typeof value !== "number") throw new Error(`${what} is a number, not ${JSON.stringify(value)}.`);
    return value;
  };

  type Chain = { property: MoveProperty; target: SceneNodeIR; at: number; stops: { frame: number; value: unknown; easing?: EasingSpec }[]; first: Move; spans: { from: number; frames: number; easing: EasingSpec; distance: number }[] };
  const chains: Chain[] = [];

  const write = (m: Move, on: SceneNodeIR, at: number, open: Chain | undefined): void => {
    const from = at + Math.round((m.delay ?? 0) * fps);
    const frames = score.frames(m.sec ?? opts.sec ?? 0.3, 2);
    const easing = curveOf(m.curve ?? opts.curve, { kind: "easing", preset: "easeOutCubic" });
    const given = opts.rest?.[m.property];
    const read = (value: MoveValue | undefined, fallback: unknown): unknown => {
      if (m.property === "position") return px(value, fallback as { x: number; y: number });
      if (m.property === "scale") return pair(value, fallback as { x: number; y: number });
      if (m.property === "rotation") return number(value, fallback as number, "A rotation");
      if (m.property === "opacity") return number(value, fallback as number, "An opacity");
      if (m.property === "blur") return value === undefined ? fallback : round(score.du(number(value, 0, "A blur")), 1);
      if (m.property === "letterSpacing") {
        const own = on.kind === "text" ? on.letterSpacing : 0;
        return value === undefined ? fallback : round(own + number(value, 0, "Letter spacing") * (on.kind === "text" ? on.fontSize : em), 2);
      }
      if (value === undefined) return fallback;
      if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}/.test(value)) throw new Error(`A colour is "#RRGGBB", not ${JSON.stringify(value)}.`);
      return value.slice(0, 7).toUpperCase();
    };
    const home: unknown =
      m.property === "position" ? { x: 0, y: 0 }
      : m.property === "scale" ? { x: 1, y: 1 }
      : m.property === "rotation" || m.property === "blur" ? 0
      : m.property === "opacity" ? 1
      : m.property === "letterSpacing" ? (on.kind === "text" ? on.letterSpacing : 0)
      : on.kind !== "frame" && on.fill.kind === "solid" ? on.fill.color.slice(0, 7).toUpperCase() : "#000000";
    const carried = open?.stops.at(-1)?.value;
    const first = m.from !== undefined ? read(m.from, home) : carried !== undefined ? carried : given !== undefined ? read(given, home) : home;
    const values = [first, ...(m.via ?? []).map((v) => read(v, home)), read(m.to, home)];
    const chain: Chain = open ?? { property: m.property, target: on, at: from, stops: [], first: m, spans: [] };
    if (!open) chains.push(chain);
    else if (from > chain.at + chain.stops.at(-1)!.frame) chain.stops.at(-1)!.easing = { kind: "hold" };
    const base = from - chain.at;
    values.forEach((value, i) => {
      const frame = base + Math.round((i * (frames - 1)) / (values.length - 1));
      const last = chain.stops.at(-1);
      if (last && last.frame === frame) {
        last.value = value;
        last.easing = i < values.length - 1 ? easing : undefined;
      } else chain.stops.push({ frame, value, easing: i < values.length - 1 ? easing : undefined });
    });
    const far = (a: unknown, b: unknown) => (typeof a === "object" && a && typeof b === "object" && b ? Math.hypot((a as { x: number }).x - (b as { x: number }).x, (a as { y: number }).y - (b as { y: number }).y) : 0);
    const lastSpan = Math.max(2, frames - Math.round(((values.length - 2) * (frames - 1)) / (values.length - 1)));
    chain.spans.push({ from: from + frames - lastSpan, frames: lastSpan, easing, distance: m.property === "position" ? far(values.at(-2), values.at(-1)) : 0 });
    const next = m.then === undefined ? [] : Array.isArray(m.then) ? m.then : [m.then];
    for (const follow of next) write(follow, on, from + frames - 1, follow.property === m.property ? chain : undefined);
  };

  const targetsOf = (m: Move): SceneNodeIR[] => (node.kind === "frame" && (m.property === "color" || m.property === "letterSpacing") ? textsUnder(score, node) : [node]);
  for (const m of Array.isArray(moves) ? moves : [moves]) for (const on of targetsOf(m)) write(m, on, opts.at, undefined);

  const firstStart = Math.min(...chains.map((c) => c.at));
  const lastEnd = Math.max(...chains.map((c) => c.at + c.stops.at(-1)!.frame));
  for (const chain of chains) {
    const { property, first } = chain;
    const on = chain.target;
    const id = score.id(`act_${on.id}_${first.id ?? `${opts.beat ?? "move"}_${STEM[property]}`}`);
    const duration = chain.stops.at(-1)!.frame + 1;
    const travels = property === "position" || property === "scale" || property === "rotation";
    const reason: MotionReason = {
      purpose: opts.purpose ?? PURPOSE[opts.beat ?? ""] ?? "respond",
      ...(opts.cue ? { cues: [opts.cue.name] } : {}),
      ...(travels && opts.lands ? { lands: opts.lands } : property === "opacity" && opts.lands && opts.lands !== "end" ? { lands: opts.lands } : {}),
      ...(opts.beat ? { beat: opts.beat } : {}),
      ...(first.reason ? { why: first.reason } : {}),
    };
    const stage = opts.stage === "in" && chain.at === firstStart && chain === chains.find((c) => c.at === firstStart) ? "in" : opts.stage === "out" && chain.at + duration - 1 === lastEnd && chain === chains.findLast((c) => c.at + c.stops.at(-1)!.frame === lastEnd) ? "out" : "custom";
    const common = { id, name: first.reason ?? `${label} ${VERB[property]}`, targetId: on.id, startFrame: chain.at, durationFrames: duration, reason };
    let block: MotionBlockIR;
    if (property === "position" || property === "scale") {
      const keys: Vec2Key[] = chain.stops.map((s, i) => ({ id: `${id}_k${i}`, frame: s.frame, x: round((s.value as { x: number }).x, property === "scale" ? 4 : 2), y: round((s.value as { y: number }).y, property === "scale" ? 4 : 2), ...(s.easing ? { easing: s.easing } : {}) }));
      block = { ...common, kind: "vec2", property: property === "position" ? "move" : "scale", mode: property === "position" ? "add" : "multiply", stage, keys };
    } else if (property === "color") {
      const keys: ColorKey[] = chain.stops.map((s, i) => ({ id: `${id}_k${i}`, frame: s.frame, color: s.value as string, ...(s.easing ? { easing: s.easing } : {}) }));
      block = { ...common, kind: "color", property: "fill", stage: "custom", keys };
    } else {
      const keys: ScalarKey[] = chain.stops.map((s, i) => ({ id: `${id}_k${i}`, frame: s.frame, value: round(s.value as number, 4), ...(s.easing ? { easing: s.easing } : {}) }));
      const scalar = property === "blur" ? "layerBlur" : property;
      block = {
        ...common, kind: "scalar", property: scalar, mode: property === "rotation" ? "add" : "set", stage, keys,
        ...(property === "blur" ? { baseValue: 0 } : property === "opacity" ? { baseValue: 1 } : property === "letterSpacing" && on.kind === "text" ? { baseValue: on.letterSpacing } : {}),
      };
    }
    blocks.push(score.track(block));
    start = Math.min(start, chain.at);
    end = Math.max(end, chain.at + duration - 1);
    const tail = chain.spans.at(-1)!;
    rest = Math.max(rest, tail.from + landsAfter(tail.easing, tail.frames, property === "position" ? nearShare(tail.distance, em) : AT_REST));
  }
  return { blocks, start: Number.isFinite(start) ? start : opts.at, end: Number.isFinite(end) ? end : opts.at, rest };
}

/**
 * The frames a list of moves takes from its beat's moment, and the frame after which the eye takes
 * them as arrived, without writing anything. A solver uses it to place cues around moves it did not write.
 */
export function measureMoves(score: Score, moves: Move[], opts: { sec?: number; curve?: Curve; em: number }): { frames: number; rest: number; from: { x: number; y: number } } {
  const fps = score.format.fps;
  let frames = 1;
  let rest = 0;
  let from = { x: 0, y: 0 };
  const walk = (m: Move, at: number) => {
    const start = at + Math.round((m.delay ?? 0) * fps);
    const span = score.frames(m.sec ?? opts.sec ?? 0.3, 2);
    const easing = curveOf(m.curve ?? opts.curve, { kind: "easing", preset: "easeOutCubic" });
    const offset = (v: MoveValue | undefined) => {
      if (v === undefined || typeof v !== "object") return { x: 0, y: 0 };
      const kx = v.unit === "stage" ? score.format.width : v.unit === "px" ? 1 : opts.em;
      const ky = v.unit === "stage" ? score.format.height : v.unit === "px" ? 1 : opts.em;
      return { x: (v.x ?? 0) * kx, y: (v.y ?? 0) * ky };
    };
    if (m.property === "position" && at === 0 && !(m.delay ?? 0)) from = offset(m.from);
    const count = (m.via?.length ?? 0) + 1;
    const lastSpan = Math.max(2, span - Math.round(((count - 1) * (span - 1)) / count));
    const a = offset(m.via?.at(-1) ?? m.from);
    const b = offset(m.to);
    const near = m.property === "position" ? nearShare(Math.hypot(a.x - b.x, a.y - b.y), opts.em) : AT_REST;
    frames = Math.max(frames, start + span);
    rest = Math.max(rest, start + span - lastSpan + landsAfter(easing, lastSpan, near));
    for (const follow of m.then === undefined ? [] : Array.isArray(m.then) ? m.then : [m.then]) walk(follow, start + span - 1);
  };
  for (const m of moves) walk(m, 0);
  return { frames, rest, from };
}
