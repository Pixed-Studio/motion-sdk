import { curveOf, type Curve } from "../feel/curves.ts";
import { bezier, ease, hold, linear, type EasingSpec } from "../kernel/easing.ts";
import type { BBox, Beat, CueIR, MotionBlockIR, MotionReason, PathNodeIR, Point2D, SceneNodeIR, ShapeNodeIR, TextNodeIR, Vec2Key, Vec2MotionIR } from "../kernel/ir.ts";
import type { Score } from "../kernel/score.ts";
import { fastestShare, landsAfter, move, type Move, type Offset, type Written } from "./move.ts";

// The pieces a statement's beats are made of. Each takes the score and objects that already exist,
// writes movement with its reason and its beat, and creates no content. `wordByWord` is composed
// from these and nothing else, so a shot written by hand can use the same ones.

const round = (n: number, places = 2) => Math.round(n * 10 ** places) / 10 ** places;
const labelOf = (node: SceneNodeIR) => (node.kind === "text" ? node.text : node.name);

/** An object is already this visible on the frame it shows, when it fades or sharpens in. */
export const FIRST_SEEN = 0.7;

export interface EnterOptions {
  /** The frame it shows. */
  at: number;
  cue?: CueIR;
  /**
   * How it comes in, counted from `at`: `[{ property: "position", from: { x: 1.28 } }]` shows it to
   * the right of its place and glides it in. None: it appears where it rests.
   */
  moves?: Move[];
  /** Seconds a move takes when it gives none, and its curve. */
  sec?: number;
  curve?: Curve;
  em?: number;
  /** Which point sits on the cue: `"start"` (it shows there) or `"end"` (it comes to rest there). */
  lands?: "start" | "end";
  beat?: Beat;
}

/**
 * 入. Brings an object into view at a frame. It does not exist before; it shows whole and its
 * moves carry it to where it rests. An opacity move that starts at once is how it appears;
 * without one it pops on. Returns the frame the eye takes it as arrived.
 */
export function enter(score: Score, target: string | { id: string }, opts: EnterOptions): Written {
  const node = score.node(typeof target === "string" ? target : target.id);
  const label = labelOf(node);
  const beat = opts.beat ?? "join";
  const moves = opts.moves ?? [];
  const appears = moves.find((m) => m.property === "opacity" && !m.delay);
  const others = moves.filter((m) => m !== appears);
  const blocks: MotionBlockIR[] = [];
  const reason: MotionReason = { purpose: "arrive", ...(opts.cue ? { cues: [opts.cue.name] } : {}), ...(opts.lands === "end" ? {} : { lands: "start" as const }), beat };
  let end = opts.at + 1;
  let stillRest = opts.at;
  if (appears) {
    const written = move(score, node, { id: "in", reason: `${label} appears`, ...appears }, { at: opts.at, sec: opts.sec, curve: opts.curve, em: opts.em, beat, purpose: "arrive", cue: opts.cue, lands: opts.lands === "end" ? undefined : "start", stage: "in" });
    blocks.push(...written.blocks);
    end = written.end;
    stillRest = written.end;
  } else {
    const id = score.id(`act_${node.id}_in`);
    blocks.push(
      score.track({
        kind: "scalar", id, name: `${label} appears`, targetId: node.id, property: "opacity", mode: "set", stage: "in", startFrame: opts.at, durationFrames: 2, reason,
        keys: [
          { id: `${id}_k0`, frame: 0, value: 1, easing: hold },
          { id: `${id}_k1`, frame: 1, value: 1 },
        ],
      })
    );
  }
  const named = others.map((m) => {
    if (m.id && m.reason) return m;
    const from = typeof m.from === "object" ? m.from : undefined;
    const stem = m.property === "position" ? "join" : m.property === "blur" ? "focus" : undefined;
    const why = m.property === "position" ? `${label} ${from && (from.y ?? 0) !== 0 && (from.x ?? 0) === 0 ? "rises" : "glides"} into place` : m.property === "blur" ? `${label} comes into focus` : undefined;
    return { ...m, id: m.id ?? stem, reason: m.reason ?? why };
  });
  const travels = named.filter((m) => m.property === "position" || m.property === "scale" || m.property === "rotation");
  let rest = stillRest;
  if (named.length > 0) {
    const common = { at: opts.at, sec: opts.sec, curve: opts.curve, em: opts.em, beat, purpose: "arrive" as const, cue: opts.cue };
    if (travels.length > 0) {
      const written = move(score, node, travels, { ...common, lands: opts.lands });
      blocks.push(...written.blocks);
      end = Math.max(end, written.end);
      rest = written.rest;
    }
    const still = named.filter((m) => !travels.includes(m));
    if (still.length > 0) {
      const written = move(score, node, still, common);
      blocks.push(...written.blocks);
      end = Math.max(end, written.end);
      if (travels.length === 0) rest = Math.max(rest, written.end);
    }
  }
  return { blocks, start: opts.at, end, rest };
}

/**
 * The largest multiple of its size at which a box, scaled about `about`, stays inside the safe
 * area and takes no more than `maxHeight` of its height. Never below 1.
 */
export function largestThatFits(score: Score, box: BBox, about: Point2D, maxHeight = 0.55): number {
  const safe = score.safeArea;
  const reach = Math.max(about.x - box.x, box.x + box.width - about.x, 1e-6);
  const room = Math.min(about.x - safe.x, safe.x + safe.width - about.x);
  return Math.max(1, Math.min(room / reach, (safe.height * maxHeight) / box.height));
}

export interface LandOptions {
  /** The frame it hits. */
  at: number;
  cue?: CueIR;
  /** How large it is on that frame, as a multiple of its resting size. Below 1 it starts small and is pushed in. */
  scale: number;
  /** Seconds it takes to come to size, and the curve. */
  sec: number;
  curve?: Curve;
  /** Frames the fall takes, when a solver has worked them out; `sec` is ignored then. */
  frames?: number;
  /** It keeps its size and is cut to its resting size on the last frame, instead of falling. */
  held?: boolean;
  /** Layered on the fall, counted from `at`: a rise, a turn, and what follows once it has settled. */
  moves?: Move[];
  em?: number;
}

/**
 * 砸 and 落定. Lands an object on a frame at a size and spends that energy: it falls (or is pushed)
 * to its resting size on the curve given. Write it on the group that carries everything that should
 * share the fall. Returns the frame the eye takes it as settled.
 */
export function land(score: Score, target: string | { id: string }, opts: LandOptions): Written {
  const node = score.node(typeof target === "string" ? target : target.id);
  const frames = opts.frames ?? score.frames(opts.sec, 2);
  const easing = opts.held ? hold : curveOf(opts.curve, ease("easeOutQuart"));
  const blocks: MotionBlockIR[] = [];
  let rest = opts.at;
  let end = opts.at;
  if (Math.abs(opts.scale - 1) > 0.001) {
    const id = score.id(`act_${node.id}_lands`);
    const name = opts.scale > 1 ? `${labelOf(node)} lands large and ${opts.held ? "holds" : "settles"}` : `${labelOf(node)} is pushed in`;
    blocks.push(
      score.track({
        kind: "vec2", id, name, targetId: node.id, property: "scale", mode: "multiply", stage: "custom", startFrame: opts.at, durationFrames: frames,
        reason: { purpose: "arrive", ...(opts.cue ? { cues: [opts.cue.name] } : {}), lands: "start", beat: "hit" },
        keys: [
          { id: `${id}_k0`, frame: 0, x: opts.scale, y: opts.scale, easing },
          { id: `${id}_k1`, frame: frames - 1, x: 1, y: 1 },
        ],
      })
    );
    end = opts.at + frames - 1;
    rest = opts.held ? end : opts.at + landsAfter(easing, frames);
  }
  if (opts.moves?.length) {
    const written = move(score, node, opts.moves, { at: opts.at, sec: opts.sec, curve: opts.curve, em: opts.em, beat: "hit", purpose: "arrive", cue: opts.cue, lands: "start" });
    blocks.push(...written.blocks);
    end = Math.max(end, written.end);
    rest = Math.max(rest, written.rest);
  }
  return { blocks, start: opts.at, end, rest };
}

/** A cubic-bezier easing cut in two at the moment it is fastest, each half an easing of its own. */
function splitAtFastest(spec: EasingSpec): { time: number; done: number; before: EasingSpec; after: EasingSpec } | null {
  if (spec.kind !== "cubicBezier") return null;
  const time = fastestShare(spec);
  const x = (t: number) => 3 * (1 - t) * (1 - t) * t * spec.x1 + 3 * (1 - t) * t * t * spec.x2 + t * t * t;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (x(mid) < time) lo = mid;
    else hi = mid;
  }
  const t = (lo + hi) / 2;
  const lerp = (a: Point2D, b: Point2D): Point2D => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const p0 = { x: 0, y: 0 };
  const p1 = { x: spec.x1, y: spec.y1 };
  const p2 = { x: spec.x2, y: spec.y2 };
  const p3 = { x: 1, y: 1 };
  const a = lerp(p0, p1);
  const b = lerp(p1, p2);
  const c = lerp(p2, p3);
  const d = lerp(a, b);
  const e = lerp(b, c);
  const at = lerp(d, e);
  if (at.x <= 1e-6 || at.x >= 1 - 1e-6 || at.y <= 1e-6 || at.y >= 1 - 1e-6) return null;
  const r = (n: number) => Math.round(n * 10000) / 10000;
  return {
    time: at.x,
    done: at.y,
    before: bezier(r(a.x / at.x), r(a.y / at.y), r(d.x / at.x), r(d.y / at.y)),
    after: bezier(r((e.x - at.x) / (1 - at.x)), r((e.y - at.y) / (1 - at.y)), r((c.x - at.x) / (1 - at.x)), r((c.y - at.y) / (1 - at.y))),
  };
}

export interface RoomOptions {
  /** What had the stage: it is held where it stood, then carried to where it rests. */
  lead: SceneNodeIR[];
  /** Where the lead stands until the move, in pixels: its middle. Usually the middle of the finished statement. */
  stand: Point2D;
  /** The frame the lead shows. */
  from: number;
  /** The arrival the move throws the eye to. */
  next: CueIR;
  /** Seconds the move takes, and its curve: slow at both ends and fast between throws the eye best. */
  sec: number;
  curve?: Curve;
  /**
   * `"peak"` (default): the fastest step starts on `next`, so what joins shows as the line is thrown.
   * `"end"`: the move is over on `next`, for arrivals that land on their cue.
   */
  lands?: "peak" | "end";
  /** The fastest step is centred on `next` instead of starting on it: something is swapped inside that step. */
  centred?: boolean;
  /**
   * The frame the last arrival shows. The move is kept under way until then by lengthening the
   * part after its fastest step, so that everything joins a line that is still moving.
   */
  until?: number;
}

export interface Room {
  block?: Vec2MotionIR;
  /** First and last frame of the move. */
  from: number;
  end: number;
  /** How far from its place the carrier is held before it, in pixels. */
  away: Point2D;
  /** The frame the eye takes the move as over. */
  rest: number;
}

/**
 * When the move that makes room runs, without writing it: its first and last frame and the frame
 * the eye takes it as over. A solver needs these before it knows where the lead stands.
 */
export function roomWindow(score: Score, opts: Pick<RoomOptions, "from" | "next" | "sec" | "curve" | "lands" | "centred" | "until">) {
  const lands = opts.lands ?? "peak";
  const start = opts.from;
  const second = opts.next.frame;
  const curve = curveOf(opts.curve, bezier(0.85, 0, 0.17, 1));
  const asked = score.frames(opts.sec, 2);
  const share = fastestShare(curve);
  const before = lands === "end" ? asked - 1 : Math.round(share * (asked - 1) + (opts.centred ? 0.5 : -0.5));
  const available = second - start;
  let span = asked;
  let from = second - before;
  const short = from < start;
  if (short) {
    span = Math.max(2, lands === "end" ? available + 1 : Math.floor((available + (opts.centred ? -0.5 : 0.5)) / share) + 1);
    from = start;
  }
  let end = from + span - 1;
  // Lengthened after its fastest step when arrivals come later than the move would last.
  // The two halves meet on the cue; when the fastest step is centred on the cue they meet a frame before it.
  const joint = opts.centred ? second - 1 : second;
  const cut = lands === "peak" && opts.until !== undefined && opts.until > end && joint > from ? splitAtFastest(curve) : null;
  let rest = from + landsAfter(curve, span);
  if (cut) {
    end = opts.until! + score.frames(0.1);
    rest = joint + landsAfter(cut.after, end - joint + 1);
  }
  return { from, end, span, rest, before, short, cut, joint };
}

/**
 * 让. Gives the lead's place to the statement in one move. Until then the carrier (the line, or
 * whatever holds the lead and everything that will join it) is held away from its place by exactly
 * what puts the lead on `stand`; then it travels to where it rests, so the finished statement sits
 * where it was composed. When the lead has less time alone than the move needs before the cue, the
 * move is shortened and the score says so with the numbers.
 */
export function makeRoom(score: Score, carrier: string | { id: string }, opts: RoomOptions): Room {
  const node = score.node(typeof carrier === "string" ? carrier : carrier.id);
  const lands = opts.lands ?? "peak";
  const start = opts.from;
  const second = opts.next.frame;
  const curve = curveOf(opts.curve, bezier(0.85, 0, 0.17, 1));
  const solved = roomWindow(score, opts);
  const { from, span } = solved;
  if (solved.short) {
    score.notes.push({
      rule: "budget",
      severity: "warning",
      message:
        `The lead has ${score.sec(second - start).toFixed(2)} s before the next arrival, and its move to make room takes ${opts.sec.toFixed(2)} s, ` +
        `${score.sec(solved.before).toFixed(2)} s of it before that arrival. The move is shortened to ${score.sec(span).toFixed(2)} s so that it is still ${lands === "end" ? "over" : "fastest"} on the cue.`,
      fix: `Give the lead ${score.sec(solved.before - (second - start)).toFixed(2)} s more alone, or give the move fewer seconds.`,
    });
  }
  const left = Math.min(...opts.lead.map((n) => n.base.x));
  const right = Math.max(...opts.lead.map((n) => n.base.x + n.base.width));
  const top = Math.min(...opts.lead.map((n) => n.base.y));
  const bottom = Math.max(...opts.lead.map((n) => n.base.y + n.base.height));
  const away = { x: round(opts.stand.x - (left + right) / 2), y: round(opts.stand.y - (top + bottom) / 2) };

  const { cut, end, rest } = solved;
  if (Math.abs(away.x) <= 0.5 && Math.abs(away.y) <= 0.5) return { from, end, away, rest };

  const id = score.id(`act_${node.id}_makes_room`);
  const keys: Vec2Key[] = [];
  if (from > start) keys.push({ id: `${id}_k0`, frame: 0, x: away.x, y: away.y, easing: hold });
  if (cut) {
    // The two halves meet at the same speed: the second covers more of the way in its longer time.
    const stretch = ((end - solved.joint) / Math.max(1e-6, (1 - cut.time) * (span - 1))) * ((cut.time * (span - 1)) / Math.max(1, solved.joint - from));
    const done = cut.done / (cut.done + stretch * (1 - cut.done));
    keys.push({ id: `${id}_k${keys.length}`, frame: from - start, x: away.x, y: away.y, easing: cut.before });
    keys.push({ id: `${id}_k${keys.length}`, frame: solved.joint - start, x: round(away.x * (1 - done)), y: round(away.y * (1 - done)), easing: cut.after });
  } else {
    keys.push({ id: `${id}_k${keys.length}`, frame: from - start, x: away.x, y: away.y, easing: curve });
  }
  keys.push({ id: `${id}_k${keys.length}`, frame: end - start, x: 0, y: 0 });
  const block = score.track<Vec2MotionIR>({
    kind: "vec2", id, name: `${opts.lead.map(labelOf).join(" ")} makes room`, targetId: node.id, property: "move", mode: "add", stage: "custom",
    startFrame: start, durationFrames: end - start + 1,
    // A move that is fastest as it starts (a glide) begins on the cue; one that winds up first peaks on it.
    reason: { purpose: "carry", cues: [opts.next.name], lands: lands === "peak" && solved.before <= 0 ? "start" : lands, beat: "room" },
    keys,
  });
  return { block, from, end, away, rest };
}

/**
 * How far along its drift something is at a frame, as a share of the whole: 0 on the frame it is
 * where it was set, below 0 before it.
 */
export function driftShare(frame: number, run: { from: number; to: number }, rest: number): number {
  const span = Math.max(1, run.to - run.from);
  const at = Math.max(run.from, Math.min(run.to, rest));
  return (Math.max(run.from, Math.min(run.to, frame)) - at) / span;
}

export interface DriftOptions {
  /** The frames it runs over. */
  from: number;
  to: number;
  /** The frame on which the object is exactly where and as large as it was set: usually the frame the statement is complete. */
  rest: number;
  /** Share of its size it gains (above 0) or loses over the run. */
  scale?: number;
  /** Distance it travels over the run. */
  travel?: Offset;
  em?: number;
}

/**
 * 留. Keeps something moving at one steady pace for as long as it is read, so a hold is never a
 * still. The amounts are totals over the run: a longer run drifts as far, more slowly.
 */
export function drift(score: Score, target: string | { id: string }, opts: DriftOptions): MotionBlockIR[] {
  const node = score.node(typeof target === "string" ? target : target.id);
  const run = { from: opts.from, to: opts.to };
  if (run.to - run.from < 2) return [];
  const a = driftShare(run.from, run, opts.rest);
  const b = driftShare(run.to, run, opts.rest);
  const frames = run.to - run.from + 1;
  const scale = opts.scale ?? 0;
  const k = opts.travel?.unit === "px" ? 1 : opts.travel?.unit === "stage" ? 0 : (opts.em ?? score.du(72));
  const x = opts.travel?.unit === "stage" ? (opts.travel.x ?? 0) * score.format.width : round((opts.travel?.x ?? 0) * k);
  const y = opts.travel?.unit === "stage" ? (opts.travel.y ?? 0) * score.format.height : round((opts.travel?.y ?? 0) * k);
  const blocks: MotionBlockIR[] = [];
  const reason: MotionReason = { purpose: "drift", beat: "hold" };
  if (scale !== 0) {
    const id = score.id(`act_${node.id}_drifts_size`);
    blocks.push(
      score.track({
        kind: "vec2", id, name: `${labelOf(node)} ${scale < 0 ? "eases back" : "pushes in"}`, targetId: node.id, property: "scale", mode: "multiply", stage: "custom",
        startFrame: run.from, durationFrames: frames, reason,
        keys: [
          { id: `${id}_k0`, frame: 0, x: round(1 + scale * a, 4), y: round(1 + scale * a, 4), easing: linear },
          { id: `${id}_k1`, frame: frames - 1, x: round(1 + scale * b, 4), y: round(1 + scale * b, 4) },
        ],
      })
    );
  }
  if (x !== 0 || y !== 0) {
    const id = score.id(`act_${node.id}_drifts`);
    blocks.push(
      score.track({
        kind: "vec2", id, name: `${labelOf(node)} drifts`, targetId: node.id, property: "move", mode: "add", stage: "custom",
        startFrame: run.from, durationFrames: frames, reason,
        keys: [
          { id: `${id}_k0`, frame: 0, x: round(x * a), y: round(y * a), easing: linear },
          { id: `${id}_k1`, frame: frames - 1, x: round(x * b), y: round(y * b) },
        ],
      })
    );
  }
  return blocks;
}

export interface LeaveOptions {
  /** The frame it starts to go. */
  at: number;
  cue?: CueIR;
  /** Seconds until the cut, and the curve: one that is still gaining speed on the last frame puts the cut on the movement. */
  sec: number;
  curve?: Curve;
  /** Where it has got to when the cut comes, from its place: any direction. */
  to?: Offset;
  /** Its size at the cut, as a share of its resting size. */
  scale?: number;
  /** Degrees it has turned by the cut. */
  rotation?: number;
  /** Blur it has gathered by the cut, in design units. */
  blur?: number;
  /** It fades to nothing and is gone at the end: for a shot that hands over to nothing. */
  fade?: boolean;
  /** Layered on the exit, counted from `at`. */
  moves?: Move[];
  em?: number;
}

/**
 * 走. Lets something go as a whole: write it on the group that carries everything that leaves, and
 * what it carries keeps its arrangement. Any direction, any mix of travel, size, turn and focus.
 */
export function leave(score: Score, target: string | { id: string }, opts: LeaveOptions): Written {
  const node = score.node(typeof target === "string" ? target : target.id);
  const label = labelOf(node);
  const frames = score.frames(opts.sec, 2);
  const fps = score.format.fps;
  const moves: Move[] = [];
  if (opts.scale !== undefined && Math.abs(opts.scale - 1) > 1e-4) moves.push({ property: "scale", to: round(opts.scale, 4), id: "falls_back", reason: `${label} falls back` });
  if (opts.to && (Math.abs(opts.to.x ?? 0) > 1e-6 || Math.abs(opts.to.y ?? 0) > 1e-6)) moves.push({ property: "position", to: opts.to, id: "goes", reason: `${label} goes` });
  if (opts.rotation) moves.push({ property: "rotation", to: opts.rotation, id: "turns_away", reason: `${label} turns as it goes` });
  if (opts.blur && opts.blur > 0 && !opts.fade) {
    const span = Math.max(2, Math.round(frames * 0.7));
    moves.push({ property: "blur", to: opts.blur, delay: (frames - span) / fps, sec: span / fps, curve: ease("easeInQuad"), id: "softens", reason: `${label} softens as it goes` });
  }
  moves.push(...(opts.moves ?? []));
  if (opts.fade) moves.push({ property: "opacity", to: 0, curve: ease("easeInQuad"), id: "fades", reason: `${label} fades` });
  if (moves.length === 0) return { blocks: [], start: opts.at, end: opts.at, rest: opts.at };
  return move(score, node, moves, { at: opts.at, sec: frames / fps, curve: opts.curve ?? "launch", em: opts.em, beat: "leave", purpose: "depart", cue: opts.cue, lands: "start", stage: opts.fade ? "out" : undefined });
}

/**
 * 场. Gives ground objects a share of a movement written on something else: where that scales about
 * `about` or travels, each ground object does the same by its depth, from 0 (it stays put) to 1 (it
 * moves as the original does). Further back is less, which is what makes it read as depth.
 */
export function shareByDepth(
  score: Score,
  ground: (ShapeNodeIR | PathNodeIR)[],
  blocks: MotionBlockIR[],
  opts: { depth: (node: ShapeNodeIR | PathNodeIR, index: number) => number; about: Point2D; stems?: { scale: string; scaleMove: string; move: string }; names?: { scale: string; move: string } }
): MotionBlockIR[] {
  const stems = opts.stems ?? { scale: "shares_size", scaleMove: "shares_place", move: "shares_travel" };
  const out: MotionBlockIR[] = [];
  ground.forEach((node, index) => {
    const depth = opts.depth(node, index);
    if (depth <= 0) return;
    const centre = { x: node.base.x + node.base.width / 2, y: node.base.y + node.base.height / 2 };
    for (const source of blocks) {
      if (source.kind !== "vec2") continue;
      const reason: MotionReason = { ...source.reason, purpose: source.reason.purpose === "arrive" ? "respond" : source.reason.purpose };
      const base = { targetId: node.id, mode: source.mode, stage: source.stage, startFrame: source.startFrame, durationFrames: source.durationFrames, reason };
      if (source.property === "scale") {
        const k = (v: number) => 1 + (v - 1) * depth;
        if (source.keys.every((key) => Math.abs(k(key.x) - 1) <= 1e-4)) continue;
        const id = score.id(`act_${node.id}_${stems.scale}`);
        out.push(score.track({ ...base, kind: "vec2", id, name: `${node.name} ${opts.names?.scale ?? "shares the size"}`, property: "scale", keys: source.keys.map((key, i) => ({ ...key, id: `${id}_k${i}`, x: round(k(key.x), 4), y: round(k(key.y), 4) })) }));
        const moveId = score.id(`act_${node.id}_${stems.scaleMove}`);
        const keys = source.keys.map((key, i) => ({ ...key, id: `${moveId}_k${i}`, x: round((k(key.x) - 1) * (centre.x - opts.about.x)), y: round((k(key.y) - 1) * (centre.y - opts.about.y)) }));
        if (keys.some((key) => Math.abs(key.x) > 0.05 || Math.abs(key.y) > 0.05)) {
          out.push(score.track({ ...base, kind: "vec2", id: moveId, name: `${node.name} ${opts.names?.move ?? "keeps its place in depth"}`, property: "move", mode: "add", stage: "custom", keys }));
        }
      } else {
        const keys = source.keys.map((key) => ({ ...key, x: round(key.x * depth), y: round(key.y * depth) }));
        if (!keys.some((key) => Math.abs(key.x) > 0.05 || Math.abs(key.y) > 0.05)) continue;
        const id = score.id(`act_${node.id}_${stems.move}`);
        out.push(score.track({ ...base, kind: "vec2", id, name: `${node.name} ${opts.names?.move ?? "goes with it"}`, property: "move", keys: keys.map((key, i) => ({ ...key, id: `${id}_k${i}` })) }));
      }
    }
  });
  return out;
}

/** Gives `copy` the movements `host` has now, so it goes exactly as the host does from here on. Call it after the host has its motion. */
function follow(score: Score, host: SceneNodeIR, copy: SceneNodeIR, reason: MotionReason, only?: (m: MotionBlockIR) => boolean): MotionBlockIR[] {
  const out: MotionBlockIR[] = [];
  for (const m of [...score.motions]) {
    if (m.targetId !== host.id || m.kind === "shaderParams" || (only && !only(m))) continue;
    const id = score.id(`${m.id}__${copy.id}`);
    const rekey = <K extends { id: string }>(keys: K[]) => keys.map((k, i) => ({ ...k, id: `${id}_k${i}` }));
    const moved = { ...m, id, name: `${copy.name}: ${m.name}`, targetId: copy.id, reason: { ...reason, cues: m.reason.cues } };
    if (moved.kind === "scalar") moved.keys = rekey(moved.keys);
    else if (moved.kind === "vec2") moved.keys = rekey(moved.keys);
    else if (moved.kind === "color") continue;
    out.push(score.track(moved as MotionBlockIR));
  }
  return out;
}

export interface RideOptions {
  /** What it does once the host has landed: it lets go. Counted from `at`. Left out, it stays on the host. */
  letGo?: { at: number; moves: Move[]; sec?: number; curve?: Curve; fade?: boolean };
  em?: number;
  beat?: Beat;
}

/**
 * 配. Makes a prop carry an object in: placed beside it and in the same group, the prop shows when
 * the host shows and travels exactly as the host does, then lets go by moves of its own. Call it
 * after the host has its entrance. The prop is the author's shape; this adds only its motion.
 */
export function ride(score: Score, prop: string | { id: string }, host: string | { id: string }, opts: RideOptions = {}): MotionBlockIR[] {
  const propNode = score.node(typeof prop === "string" ? prop : prop.id);
  const hostNode = score.node(typeof host === "string" ? host : host.id);
  if (propNode.parentId !== hostNode.parentId) {
    throw new Error(`[${score.shot}] "${propNode.id}" rides "${hostNode.id}" and must sit in the same group, so the group's own moves carry both.`);
  }
  const beat = opts.beat ?? "mark";
  const blocks = follow(score, hostNode, propNode, { purpose: "keep", beat, why: `It carries "${labelOf(hostNode)}" in.` }, (m) => m.kind !== "scalar" || m.property === "opacity");
  if (opts.letGo) {
    const moves = [...opts.letGo.moves, ...(opts.letGo.fade ? [{ property: "opacity" as const, to: 0, reason: `${propNode.name} lets go` }] : [])];
    blocks.push(...move(score, propNode, moves, { at: opts.letGo.at, sec: opts.letGo.sec ?? 0.4, curve: opts.letGo.curve ?? "launch", em: opts.em, beat, purpose: "depart", stage: opts.letGo.fade ? "out" : undefined }).blocks);
  }
  return blocks;
}

export interface SweepOptions {
  /** The colour that takes the object over. */
  color: string;
  /** The frame the sweep starts, and the seconds it takes to cross. */
  at: number;
  sec: number;
  curve?: Curve;
  /** The side it comes from. Defaults to `"left"`, the reading direction. */
  from?: "left" | "right" | "top" | "bottom";
  beat?: Beat;
}

/**
 * 亮, with colour. A second colour sweeps across a word: its edge travels from one side to the other
 * and the word is in the new colour behind it. It is a copy of the word in that colour behind a
 * mask that slides across, each following the word exactly, so it stays a native mask a person can
 * retime. Call it after the word has its motion.
 */
export function sweep(score: Score, target: string | { id: string }, opts: SweepOptions): { shown: TextNodeIR; mask: ShapeNodeIR } {
  const node = score.node(typeof target === "string" ? target : target.id);
  if (node.kind !== "text") throw new Error(`[${score.shot}] sweep() colours a word; "${node.id}" is a ${node.kind}.`);
  const beat = opts.beat ?? "mark";
  const side = opts.from ?? "left";
  const role = score.roles[node.id];
  const shown = score.add<TextNodeIR>({ ...node, id: score.id(`${node.id}_swept`), name: `${node.text} in ${opts.color}`, base: { ...node.base }, fill: { kind: "solid", color: opts.color } });
  const box: BBox = { x: node.base.x, y: node.base.y, width: node.base.width, height: node.base.height };
  // A little wider than the word, so the edge starts and ends clear of its letters.
  const pad = Math.round(node.fontSize * 0.12);
  const mask = score.add<ShapeNodeIR>({
    id: score.id(`mask_${node.id}_sweep`), kind: "shape", shape: "rectangle", name: `Mask: sweep over ${node.text}`, slot: "mask", role: "mask", plane: node.plane, parentId: node.parentId, layer: node.layer,
    base: { x: box.x - pad, y: box.y, width: box.width + pad * 2, height: box.height }, fill: { kind: "solid", color: "#FFFFFF" },
  });
  const keep: MotionReason = { purpose: "keep" };
  follow(score, node, shown, keep);
  follow(score, node, mask, keep, (m) => m.kind === "vec2" || (m.kind === "scalar" && m.stage !== "custom"));
  const across = side === "left" || side === "right" ? box.width + pad * 2 : box.height;
  const sign = side === "left" || side === "top" ? -1 : 1;
  move(score, mask, { property: "position", from: side === "left" || side === "right" ? { x: sign * across, unit: "px" } : { y: sign * across, unit: "px" }, id: "sweeps", reason: `${opts.color} sweeps across ${node.text}` }, { at: opts.at, sec: opts.sec, curve: opts.curve ?? "even", beat, purpose: "respond" });
  // Until the sweep starts the mask is closed to nothing, so none of the new colour shows whatever the word is doing.
  const waitId = score.id(`act_${mask.id}_waits`);
  score.track({
    kind: "vec2", id: waitId, name: `Mask stays shut until the sweep over ${node.text}`, targetId: mask.id, property: "scale", mode: "multiply", stage: "custom", startFrame: 0, durationFrames: Math.max(2, opts.at + 1),
    reason: keep,
    keys: [
      { id: `${waitId}_k0`, frame: 0, x: 0, y: 0, easing: hold },
      { id: `${waitId}_k1`, frame: Math.max(1, opts.at), x: 1, y: 1 },
    ],
  });
  score.masks.push({ id: score.id(`clip_${shown.id}`), name: `Sweep over ${node.text}`, sourceObjectId: mask.id, targetObjectId: shown.id, mode: "vector", inverted: false });
  if (role) score.cast(role, shown, mask);
  return { shown, mask };
}
