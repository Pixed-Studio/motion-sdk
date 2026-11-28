import { measureMoves, move, type Move, type MoveOptions, type Offset, type Written } from "../../behaviors/move.ts";
import { FIRST_SEEN } from "../../behaviors/statement.ts";
import { brake, curveOf, even, whip, type Curve } from "../../feel/curves.ts";
import type { Feel } from "../../feel/index.ts";
import { ease, type EasingSpec } from "../../kernel/easing.ts";
import type { Beat, SceneNodeIR } from "../../kernel/ir.ts";
import type { Score } from "../../kernel/score.ts";
import type { Look } from "../../look/index.ts";
import type {
  BeatContext, BeatFn, BeatMove, Choice, HitName, HitSpec, HoldName, HoldSpec, JoinName, JoinPlan, JoinSpec, LeaveName, LeaveSpec, MarkName, MarkingSpec, PhraseStage, RoomName, RoomSpec, SettleName, SettleSpec,
} from "./types.ts";

// Every beat of the shot is decided the same way: a name, a spec, moves, a mix, or a function that
// returns moves. This file turns each decision into what the patterns write with. A named choice
// is nothing more than the moves it stands for, with the feel's numbers.

const round = (n: number, places = 2) => Math.round(n * 10 ** places) / 10 ** places;
const isMove = (item: unknown): item is BeatMove => typeof item === "object" && item !== null && "property" in item;

export const NAMES = {
  hit: ["large", "small", "plain"],
  settle: ["fall", "swap", "float"],
  room: ["whip", "glide"],
  join: ["slide", "rise", "drop", "pop", "focus", "fade"],
  mark: ["colour", "focus", "flicker", "sweep", "none"],
  hold: ["out", "in", "left", "right", "up", "down", "still"],
  leave: ["recede", "left", "right", "up", "down", "cut", "shrink"],
} as const;

/** A decision as a flat list of names, specs and moves. A name the beat does not know is named, with the ones it does. */
function read<Name extends string, Spec>(beat: keyof typeof NAMES, choice: unknown, ctx: BeatContext): { names: Name[]; specs: Spec[]; moves: BeatMove[] } {
  const given = choice === undefined ? [] : typeof choice === "function" ? (choice as BeatFn)(ctx) : choice;
  const list: unknown[] = Array.isArray(given) ? given : [given];
  const out = { names: [] as Name[], specs: [] as Spec[], moves: [] as BeatMove[] };
  for (const item of list) {
    if (typeof item === "string") {
      if (!(NAMES[beat] as readonly string[]).includes(item)) {
        throw new Error(`[word-by-word] ${beat}: "${item}" is not a ${beat} this shot knows. It knows ${NAMES[beat].map((n) => `"${n}"`).join(", ")}; or give a spec, moves of your own, or a function that returns moves.`);
      }
      out.names.push(item as Name);
    } else if (isMove(item)) out.moves.push(item);
    else if (typeof item === "object" && item !== null) out.specs.push(item as Spec);
    else throw new Error(`[word-by-word] ${beat}: ${JSON.stringify(item)} is not a name, a spec or a move.`);
  }
  return out;
}

export interface HitPlan {
  /** The size asked for on the cut; undefined is "as large as the feel says and the safe area allows". */
  scale: number | undefined;
  from?: Offset;
  blur?: number;
  moves: BeatMove[];
}

export function resolveHit(choice: Choice<HitName, HitSpec> | undefined, ctx: BeatContext): HitPlan {
  const { names, specs, moves } = read<HitName, HitSpec>("hit", choice, ctx);
  const plan: HitPlan = { scale: undefined, moves };
  // Moves alone are the whole hit: nothing of the shot's own is added to them.
  if (choice !== undefined && names.length === 0 && specs.length === 0) plan.scale = 1;
  for (const name of names) plan.scale = name === "large" ? undefined : name === "small" ? 0.6 : 1;
  for (const spec of specs) {
    if (spec.scale !== undefined) plan.scale = spec.scale;
    else if (names.length === 0) plan.scale = 1;
    if (spec.from) plan.from = spec.from;
    if (spec.blur !== undefined) plan.blur = spec.blur;
  }
  return plan;
}

export interface SettlePlan {
  kind: SettleName;
  sec: number;
  curve: EasingSpec;
  dip: number;
  dipEm: number;
  floatSec: number;
  then: BeatMove[];
  moves: BeatMove[];
}

export function resolveSettle(choice: Choice<SettleName, SettleSpec> | undefined, ctx: BeatContext, feel: Feel): SettlePlan {
  const { names, specs, moves } = read<SettleName, SettleSpec>("settle", choice, ctx);
  const plan: SettlePlan = { kind: "fall", sec: feel.punch.sec, curve: feel.punch.ease, dip: 0.06, dipEm: 0.12, floatSec: 0.7, then: [], moves };
  for (const name of names) plan.kind = name;
  for (const spec of specs) {
    if (spec.kind) plan.kind = spec.kind;
    if (spec.sec !== undefined) plan.sec = spec.sec;
    if (spec.curve !== undefined) plan.curve = curveOf(spec.curve, plan.curve);
    if (spec.dip !== undefined) plan.dip = spec.dip;
    if (spec.dipEm !== undefined) plan.dipEm = spec.dipEm;
    if (spec.floatSec !== undefined) plan.floatSec = spec.floatSec;
    if (spec.then) plan.then.push(...(Array.isArray(spec.then) ? spec.then : [spec.then]));
  }
  return plan;
}

export interface RoomPlan {
  /** Whether the shot writes the move that makes room. False when the author's moves are the whole beat and none of them does. */
  make: boolean;
  sec: number;
  curve: EasingSpec;
  /** The author gave its seconds: it is taken as given, and not lengthened to cover later arrivals. */
  timed: boolean;
  moves: BeatMove[];
}

export function resolveRoom(choice: Choice<RoomName, RoomSpec> | undefined, ctx: BeatContext, feel: Feel): RoomPlan {
  const { names, specs, moves } = read<RoomName, RoomSpec>("room", choice, ctx);
  const plan: RoomPlan = { make: choice === undefined || names.length > 0 || specs.length > 0, sec: feel.room.sec, curve: feel.room.ease, timed: false, moves: [] };
  for (const name of names) plan.curve = name === "whip" ? feel.room.ease : brake(0.85);
  for (const spec of specs) {
    if (spec.sec !== undefined) (plan.sec = spec.sec), (plan.timed = true);
    if (spec.curve !== undefined) plan.curve = curveOf(spec.curve, plan.curve);
  }
  for (const m of moves) {
    // A position move on the line that names no start is the move that makes room: the shot solves how far.
    const makes = m.property === "position" && m.from === undefined && m.to === undefined && (m.on === undefined || m.on === "line");
    if (!makes) {
      plan.moves.push(m);
      continue;
    }
    plan.make = true;
    if (m.sec !== undefined) (plan.sec = m.sec), (plan.timed = true);
    plan.curve = curveOf(m.curve, m.curve === undefined && names.length === 0 ? whip() : plan.curve);
  }
  return plan;
}

export function resolveJoin(score: Score, choice: Choice<JoinName, JoinSpec> | undefined, fallback: JoinName, ctx: BeatContext, feel: Feel): JoinPlan {
  const { names, specs, moves } = read<JoinName, JoinSpec>("join", choice, ctx);
  const focus = score.frames(feel.arrive.focusSec, 2) / score.format.fps;
  const out: Move[] = [];
  const travel = (from: Offset, sec?: number, curve?: Curve): Move => ({ property: "position", from, sec: sec ?? feel.join.sec, curve: curveOf(curve, feel.join.ease) });
  for (const name of choice === undefined ? [fallback] : names) {
    if (name === "slide") out.push(travel({ x: feel.join.slideEm }));
    else if (name === "rise") out.push(travel({ y: feel.join.riseEm }));
    else if (name === "drop") out.push(travel({ y: -feel.join.riseEm }));
    else if (name === "focus") out.push({ property: "opacity", from: FIRST_SEEN, sec: focus, curve: ease("easeOutQuad") }, { property: "blur", from: feel.arrive.focusBlur, sec: focus, curve: ease("easeOutQuad") });
    else if (name === "fade") out.push({ property: "opacity", from: FIRST_SEEN, sec: focus * 2, curve: ease("easeOutQuad") });
  }
  for (const spec of specs) {
    if (spec.from && ((spec.from.x ?? 0) !== 0 || (spec.from.y ?? 0) !== 0)) out.push(travel(spec.from, spec.sec, spec.curve));
    if (spec.blur) out.push({ property: "blur", from: spec.blur === true ? feel.arrive.focusBlur : spec.blur, sec: feel.join.focusSec, curve: even });
    if (spec.fade) out.push({ property: "opacity", from: FIRST_SEEN, sec: spec.sec ?? focus * 2, curve: ease("easeOutQuad") });
  }
  out.push(...moves.map(({ on: _on, ...m }) => ({ sec: feel.join.sec, curve: feel.join.ease, ...m })));
  return planJoin(score, out, ctx.em, choice !== undefined);
}

/** The frames a join takes and the frame it reads as landed: what travels decides; a word that only sharpens or fades is there when that ends. */
export function planJoin(score: Score, moves: Move[], em: number, own: boolean): JoinPlan {
  const travels = moves.filter((m) => m.property === "position" || m.property === "scale" || m.property === "rotation");
  if (travels.length > 0) {
    const measured = measureMoves(score, travels, { em });
    return { moves, frames: measured.frames, restAfter: measured.rest, from: { x: round(measured.from.x), y: round(measured.from.y) }, own };
  }
  const frames = moves.length > 0 ? measureMoves(score, moves, { em }).frames : 1;
  return { moves, frames, restAfter: frames - 1, from: { x: 0, y: 0 }, own };
}

export interface MarkPlan {
  /** The colour the point is set in, when colour marks it. */
  colour?: string;
  focus?: { blur: number; sec: number };
  flicker?: { sec: number; steps: number[] };
  sweep?: { color: string; sec: number; from: "left" | "right" | "top" | "bottom"; curve: Curve; during: "join" | "hold"; delay: number };
  moves: BeatMove[];
}

/** The film's own flicker on its key word, frame by frame, before it holds at full. */
const FLICKER = [0.15, 0.15, 0.45, 0.15, 0.15, 0.79, 0.81, 0.32, 0.69, 0.87];

export function resolveMark(choice: Choice<MarkName, MarkingSpec> | undefined, ctx: BeatContext, feel: Feel, look: Look): MarkPlan {
  const { names, specs, moves } = read<MarkName, MarkingSpec>("mark", choice, ctx);
  const colourOf = (c: string | undefined) => (c === undefined ? look.materials.primary.flat : c in look.materials ? look.materials[c as keyof typeof look.materials].flat : c);
  const plan: MarkPlan = { moves };
  const add = (spec: MarkingSpec) => {
    if (spec.kind === "colour") plan.colour = colourOf(spec.color);
    else if (spec.kind === "focus") plan.focus = { blur: spec.blur ?? feel.arrive.focusBlur, sec: spec.sec ?? feel.join.focusSec };
    else if (spec.kind === "flicker") {
      // One value a frame at 30 frames a second, as the film has it, unless the author gives the time.
      const steps = spec.steps ?? FLICKER;
      plan.flicker = { sec: spec.sec ?? (steps.length + 1) / 30, steps };
    }
    else if (spec.kind === "sweep") plan.sweep = { color: colourOf(spec.color), sec: spec.sec ?? 0.6, from: spec.from ?? "left", curve: spec.curve ?? "even", during: spec.during ?? "hold", delay: spec.delay ?? 0 };
    else throw new Error(`[word-by-word] mark: no kind "${(spec as { kind: string }).kind}". Kinds: colour, focus, flicker, sweep.`);
  };
  if (choice === undefined) add({ kind: "colour" });
  for (const name of names) if (name !== "none") add({ kind: name });
  for (const spec of specs) add(spec);
  return plan;
}

export interface HoldPlan {
  scale: number;
  x: number;
  y: number;
  /** Seconds the complete sentence stays before it leaves, when the shot's length follows its content. */
  sec: number;
  moves: BeatMove[];
}

export function resolveHold(choice: Choice<HoldName, HoldSpec> | undefined, fallback: HoldName, ctx: BeatContext, feel: Feel): HoldPlan {
  const { names, specs, moves } = read<HoldName, HoldSpec>("hold", choice, ctx);
  const em = ctx.em;
  const plan: HoldPlan = { scale: 0, x: 0, y: 0, sec: feel.hold.sec, moves };
  const { scale, em: travel } = feel.drift;
  for (const name of choice === undefined ? [fallback] : names) {
    if (name === "out") plan.scale = -scale;
    else if (name === "in") plan.scale = scale;
    else if (name === "left") plan.x = round(-travel * em);
    else if (name === "right") plan.x = round(travel * em);
    else if (name === "up") plan.y = round(-travel * em);
    else if (name === "down") plan.y = round(travel * em);
  }
  for (const spec of specs) {
    if (spec.scale !== undefined) plan.scale = spec.scale;
    if (spec.x !== undefined) plan.x = round(spec.x * em);
    if (spec.y !== undefined) plan.y = round(spec.y * em);
    if (spec.sec !== undefined) plan.sec = spec.sec;
  }
  return plan;
}

export interface LeavePlan {
  /** Frames from the moment it starts to go until the cut. 0: it is cut where it rests. */
  frames: number;
  to?: Offset;
  scale?: number;
  rotation?: number;
  blur?: number;
  fade: boolean;
  curve: EasingSpec;
  moves: BeatMove[];
}

export function resolveLeave(score: Score, choice: Choice<LeaveName, LeaveSpec> | undefined, fallback: LeaveName, ctx: BeatContext, feel: Feel): LeavePlan {
  const { names, specs, moves } = read<LeaveName, LeaveSpec>("leave", choice, ctx);
  const plan: LeavePlan = { frames: 0, fade: false, curve: feel.leave.ease, moves };
  let sec = feel.leave.sec;
  let goes = false;
  for (const name of choice === undefined ? [fallback] : names) {
    if (name === "cut") continue;
    goes = true;
    if (name === "recede") (plan.scale = feel.leave.recede), (plan.blur = feel.leave.blur);
    else if (name === "left") plan.to = { x: -feel.leave.whipEm };
    else if (name === "right") plan.to = { x: feel.leave.whipEm };
    else if (name === "up") plan.to = { y: -feel.leave.liftEm };
    else if (name === "down") plan.to = { y: feel.leave.liftEm };
    else if (name === "shrink") (plan.scale = 0.8), (plan.fade = true), (plan.curve = ease("easeInQuad")), (sec = feel.depart.tailSec);
  }
  for (const spec of specs) {
    goes = true;
    if (spec.to) plan.to = spec.to;
    if (spec.scale !== undefined) plan.scale = spec.scale;
    if (spec.rotation !== undefined) plan.rotation = spec.rotation;
    if (spec.blur !== undefined) plan.blur = spec.blur;
    if (spec.fade !== undefined) plan.fade = spec.fade;
    if (spec.sec !== undefined) sec = spec.sec;
    if (spec.curve !== undefined) plan.curve = curveOf(spec.curve, plan.curve);
  }
  if (goes) plan.frames = score.frames(sec, 2);
  if (moves.length > 0) plan.frames = Math.max(plan.frames, measureMoves(score, moves, { sec, em: ctx.em }).frames);
  return plan;
}

/** Writes a beat's moves, each on who it names or on the beat's own target. */
export function writeMoves(stage: PhraseStage, moves: BeatMove[], targets: SceneNodeIR[], opts: MoveOptions & { beat: Beat }): Written {
  let start = opts.at;
  let end = opts.at;
  let rest = opts.at;
  const blocks: Written["blocks"] = [];
  for (const { on, ...m } of moves) {
    for (const node of on === undefined ? targets : stage.nodesOf(on)) {
      const written = move(stage.score, node, m, { em: stage.em, ...opts });
      blocks.push(...written.blocks);
      start = Math.min(start, written.start);
      end = Math.max(end, written.end);
      rest = Math.max(rest, written.rest);
    }
  }
  return { blocks, start, end, rest };
}

/** When a beat's moves come to rest, counted from the beat's moment, without writing them. */
export function restOf(stage: PhraseStage, moves: BeatMove[], sec?: number, curve?: Curve): number {
  return moves.length === 0 ? 0 : measureMoves(stage.score, moves, { sec, curve, em: stage.em }).rest;
}

/** Marks the point words: the static colour now, and what moves once each word shows. */
export function markColour(stage: PhraseStage, mark: MarkPlan): void {
  if (!mark.colour) return;
  for (const word of stage.point) stage.words.get(word)!.fill = { kind: "solid", color: mark.colour };
}
