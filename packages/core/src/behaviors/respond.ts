import { linear, type EasingSpec } from "../kernel/easing.ts";
import type { CueIR, MotionBlockIR, Point2D, ScalarKey } from "../kernel/ir.ts";
import type { Score } from "../kernel/score.ts";
import type { Feel } from "../feel/index.ts";

/** One answer to one cue. Whatever it leaves out comes from the feel. */
export interface Answer {
  cue: CueIR;
  /** How far the property goes for this answer, in its own units. Negative goes the other way. */
  amount: number;
  /** Seconds of wind-up before the cue. */
  windUpSec?: number;
  /** Seconds to spend the speed after the cue. */
  releaseSec?: number;
  /**
   * Share of the travel done before the cue. Above 0 the property is already moving when the cue
   * comes, and its fastest frame is the cue: the hit is seen on the beat. Below 0 it first backs
   * away and launches on the cue, the classic anticipation for something that jumps. 0 starts
   * cold on the cue, which reads a touch late on anything slower than a snap. An answer with no
   * room to wind up (the first frame of a track) starts from rest and goes that much less far.
   */
  anticipate?: number;
  /** Share kept for slow travel until the next answer winds up. 0 lets the property rest. */
  drift?: number;
  easeIn?: EasingSpec;
  easeOut?: EasingSpec;
}

/** What an answer moves. One behavior serves a turning ring, a shape that jumps and a shader's dial. */
export type Responder =
  | { property: "rotation" }
  | { property: "move"; along: Point2D }
  | { property: "shader"; param: string; shaderId: string; placementId: string };

export interface RespondOptions {
  answers: Answer[];
  feel: Feel;
  /** The value before the first answer. Rotation and move add to the object's own; a shader parameter is set. */
  from?: number;
  /** First frame of the track. Defaults to the first answer's cue. */
  start?: number;
  /** The frame after the last one the track writes. */
  end: number;
  id?: string;
  name?: string;
}

/**
 * Makes a property answer cues: wind up, hit on the cue, spend the speed, drift until the next.
 *
 * This is the one rule behind a ring that kicks round on every word, shapes that jump outward to
 * make room, and a backdrop that snaps a quarter turn. Give it the cues and how far each answer
 * goes; the feel says how sharp the answers are. Answers closer together than their wind-up and
 * release keep their order and their peak, and give up drift first.
 */
export function respond(score: Score, targetId: string, write: Responder, opts: RespondOptions): MotionBlockIR {
  const { feel } = opts;
  const answers = [...opts.answers].sort((a, b) => a.cue.frame - b.cue.frame);
  if (answers.length === 0) throw new Error(`respond("${targetId}") needs at least one answer.`);
  const start = opts.start ?? answers[0]!.cue.frame;
  const last = opts.end - 1;
  const live = answers.filter((a) => a.cue.frame >= start && a.cue.frame < last);

  const blockId = score.id(opts.id ?? `act_${targetId}_respond`);
  const keys: { frame: number; value: number; easing?: EasingSpec }[] = [];
  const put = (frame: number, value: number, easing?: EasingSpec) => {
    const at = keys[keys.length - 1];
    if (at && at.frame === frame) {
      at.value = value;
      at.easing = easing;
    } else {
      keys.push({ frame, value, easing });
    }
  };

  const windUps = live.map((a, i) => {
    const anticipate = a.anticipate ?? feel.respond.anticipate;
    if (anticipate === 0) return 0;
    const since = a.cue.frame - (i === 0 ? start : live[i - 1]!.cue.frame);
    return Math.min(score.frames(a.windUpSec ?? feel.respond.windUpSec), Math.floor(since * 0.4));
  });

  let value = opts.from ?? 0;
  let owed = 0;
  put(start, value, linear);
  const peaks: string[] = [];

  live.forEach((a, i) => {
    const cue = a.cue.frame;
    const windUp = windUps[i]!;
    const anticipate = a.anticipate ?? feel.respond.anticipate;
    const next = live[i + 1];
    const nextStart = next ? next.cue.frame - windUps[i + 1]! : last;
    const release = Math.max(1, Math.min(score.frames(a.releaseSec ?? feel.respond.releaseSec), nextStart - cue));
    const releaseEnd = Math.min(last, cue + release);
    const drift = nextStart - releaseEnd >= 1 ? (a.drift ?? feel.respond.drift) * a.amount : 0;

    value += owed;
    let before = 0;
    if (windUp >= 1) {
      put(cue - windUp, value, a.easeIn ?? feel.respond.easeIn);
      before = anticipate * a.amount;
      value += before;
      if (anticipate > 0) peaks.push(a.cue.name);
    }
    put(cue, value, a.easeOut ?? feel.respond.easeOut);
    // With no room to wind up, the share it would have covered is given up, not made up after the cue.
    value += a.amount - (anticipate > 0 ? anticipate * a.amount : before) - drift;
    put(releaseEnd, value, linear);
    owed = drift;
  });
  if (owed !== 0) put(last, value + owed);
  else if (keys[keys.length - 1]!.frame < last) put(last, value);

  const cues = live.map((a) => a.cue.name);
  const reason = {
    purpose: "respond" as const,
    cues,
    lands: peaks.length > 0 ? ("peak" as const) : ("start" as const),
    peaks: peaks.length > 0 && peaks.length < cues.length ? peaks : undefined,
  };
  const round = (n: number) => Math.round(n * 100) / 100;
  const scalar: ScalarKey[] = keys.map((k, i) => ({
    id: `${blockId}_k${i}`,
    frame: k.frame - start,
    value: round(k.value),
    easing: i < keys.length - 1 ? k.easing : undefined,
  }));
  const base = {
    id: blockId,
    name: opts.name ?? `${targetId} answers its cues`,
    targetId,
    startFrame: start,
    durationFrames: opts.end - start,
    reason,
  };

  if (write.property === "rotation") {
    return score.track({ ...base, kind: "scalar", property: "rotation", mode: "add", stage: "custom", keys: scalar });
  }
  if (write.property === "move") {
    return score.track({
      ...base,
      kind: "vec2",
      property: "move",
      mode: "add",
      stage: "custom",
      keys: scalar.map((k) => ({
        id: k.id,
        frame: k.frame,
        x: round(k.value * write.along.x),
        y: round(k.value * write.along.y),
        easing: k.easing,
      })),
    });
  }
  return score.track({
    ...base,
    kind: "shaderParams",
    shaderId: write.shaderId,
    placementId: write.placementId,
    tracks: { [write.param]: scalar },
  });
}
