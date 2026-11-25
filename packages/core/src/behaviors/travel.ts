import { ease, linear, type EasingSpec } from "../kernel/easing.ts";
import type { CueIR, Point2D } from "../kernel/ir.ts";
import type { Score } from "../kernel/score.ts";
import type { Feel } from "../feel/index.ts";

/** One point of a pass: how far along it is (0..1), where (pixels from its start), and the ease leaving it. */
export interface PassPoint {
  at: number;
  x: number;
  y: number;
  ease?: EasingSpec;
}

/**
 * Sends an object across the frame once: something large and out of focus in front of the
 * subject, to give a beat depth and speed. It exists only while it moves. Keep a pass short
 * unless it is filling a hold, and send the last ones the way attention is about to go.
 */
export function pass(
  score: Score,
  nodeId: string,
  opts: {
    cue: CueIR;
    start: number;
    frames: number;
    path: PassPoint[];
    /** Ease leaving the start. */
    ease?: EasingSpec;
    /** Degrees it turns on the way. */
    spin?: number;
    /** Frames of fade at the end, for a pass that would otherwise stop in view. */
    fadeFrames?: number;
  }
): void {
  const last = Math.max(1, opts.frames - 1);
  const reason = { purpose: "respond" as const, cues: [opts.cue.name], lands: "start" as const };
  const moveId = score.id(`act_${nodeId}_pass`);
  const points = [{ at: 0, x: 0, y: 0, ease: opts.ease ?? ease("easeOutQuad") }, ...opts.path];
  const keys = points
    .map((p, i) => ({
      id: `${moveId}_k${i}`,
      frame: Math.round(p.at * last),
      x: Math.round(p.x * 10) / 10,
      y: Math.round(p.y * 10) / 10,
      easing: i < points.length - 1 ? (p.ease ?? linear) : undefined,
    }))
    .filter((k, i, all) => i === 0 || k.frame > all[i - 1]!.frame);
  score.track({
    kind: "vec2",
    id: moveId,
    name: `${score.node(nodeId).name} passes`,
    targetId: nodeId,
    property: "move",
    mode: "add",
    stage: "in",
    startFrame: opts.start,
    durationFrames: opts.frames,
    reason,
    keys,
  });
  if (opts.spin) {
    const spinId = score.id(`act_${nodeId}_turn`);
    score.track({
      kind: "scalar",
      id: spinId,
      name: `${score.node(nodeId).name} turns`,
      targetId: nodeId,
      property: "rotation",
      mode: "add",
      stage: "custom",
      startFrame: opts.start,
      durationFrames: opts.frames,
      reason: { purpose: "drift" },
      keys: [
        { id: `${spinId}_k0`, frame: 0, value: 0, easing: linear },
        { id: `${spinId}_k1`, frame: last, value: opts.spin },
      ],
    });
  }
  const fade = Math.min(opts.fadeFrames ?? 0, opts.frames - 1);
  if (fade >= 2) {
    const fadeId = score.id(`act_${nodeId}_out`);
    score.track({
      kind: "scalar",
      id: fadeId,
      name: `${score.node(nodeId).name} leaves`,
      targetId: nodeId,
      property: "opacity",
      mode: "set",
      stage: "out",
      startFrame: opts.start + opts.frames - fade,
      durationFrames: fade,
      reason: { purpose: "depart" },
      keys: [
        { id: `${fadeId}_k0`, frame: 0, value: 1, easing: linear },
        { id: `${fadeId}_k1`, frame: fade - 1, value: 0 },
      ],
    });
  }
}

/**
 * Lets go of a whole group by pulling focus from it: it blurs, then fades, while it keeps moving.
 * Use it when attention should pass to something that arrives sharp. The viewer stops reading
 * what is in the group when the blur starts, so that frame, returned as `from`, is the end of
 * its subjects' reading time; the group is gone at `gone`.
 */
export function focusPull(
  score: Score,
  groupId: string,
  opts: { turn: CueIR; feel: Feel }
): { from: number; gone: number } {
  const { feel, turn } = opts;
  const total = score.format.durationFrames;
  const from = Math.max(0, turn.frame - score.frames(feel.depart.leadSec));
  const gone = Math.min(total, turn.frame + score.frames(feel.depart.tailSec, 2));
  const blurEnd = Math.max(from + 2, gone - 2);
  const blur = Math.round(score.du(feel.depart.blur));
  const reason = { purpose: "depart" as const, cues: [turn.name] };

  const blurId = score.id(`act_${groupId}_defocus`);
  score.track({
    kind: "scalar",
    id: blurId,
    name: "Focus leaves the group",
    targetId: groupId,
    property: "layerBlur",
    mode: "set",
    stage: "custom",
    startFrame: from,
    durationFrames: blurEnd - from + 1,
    post: "hold",
    reason,
    keys: [
      { id: `${blurId}_k0`, frame: 0, value: 0, easing: ease("easeInQuad") },
      { id: `${blurId}_k1`, frame: Math.round(((blurEnd - from) * 2) / 3), value: Math.round(blur / 3), easing: ease("easeInQuad") },
      { id: `${blurId}_k2`, frame: blurEnd - from, value: blur },
    ],
  });

  const fade = Math.max(2, Math.min(gone - from, score.frames(feel.depart.fadeSec, 2)));
  const fadeId = score.id(`act_${groupId}_fade`);
  score.track({
    kind: "scalar",
    id: fadeId,
    name: "The group fades out",
    targetId: groupId,
    property: "opacity",
    mode: "set",
    stage: "out",
    startFrame: gone - fade,
    durationFrames: fade,
    reason,
    keys: [
      { id: `${fadeId}_k0`, frame: 0, value: 1, easing: ease("easeInQuad") },
      { id: `${fadeId}_k1`, frame: fade - 1, value: 0 },
    ],
  });
  return { from, gone };
}

/**
 * Carries an object along a guide to where it lands, shrinking from near the camera and turning
 * as it comes. The path is a smooth curve through a few points, never a key on every frame, so
 * a person can reshape the approach by moving one point.
 */
export function travel(
  score: Score,
  nodeId: string,
  opts: {
    guideId: string;
    start: number;
    frames: number;
    /** How progress along the path is spent. Front-load it for something that sweeps in and settles. */
    ease: EasingSpec;
    /** Scale at the start, optionally partway, and at rest. */
    scale?: { from: number; mid?: number; to: number };
    /** Degrees it turns on the way. */
    spin?: number;
    cue?: CueIR;
  }
): void {
  const last = Math.max(1, opts.frames - 1);
  const name = score.node(nodeId).name;
  const reason = { purpose: "carry" as const, cues: opts.cue ? [opts.cue.name] : undefined, lands: "end" as const };
  score.track({
    kind: "followPath",
    id: score.id(`act_${nodeId}_travel`),
    name: `${name} travels in`,
    targetId: nodeId,
    guidePathId: opts.guideId,
    orientToPath: false,
    stage: "custom",
    startFrame: opts.start,
    durationFrames: opts.frames,
    progressEasing: opts.ease,
    reason,
  });
  if (opts.scale) {
    const id = score.id(`act_${nodeId}_scale`);
    const mid = opts.scale.mid ?? (opts.scale.from + opts.scale.to) / 2;
    score.track({
      kind: "vec2",
      id,
      name: `${name} comes down to size`,
      targetId: nodeId,
      property: "scale",
      mode: "multiply",
      stage: "custom",
      startFrame: opts.start,
      durationFrames: opts.frames,
      reason,
      keys: [
        { id: `${id}_k0`, frame: 0, x: opts.scale.from, y: opts.scale.from, easing: ease("easeInSine") },
        { id: `${id}_k1`, frame: Math.round(last * 0.45), x: mid, y: mid, easing: ease("easeInSine") },
        { id: `${id}_k2`, frame: last, x: opts.scale.to, y: opts.scale.to },
      ],
    });
  }
  if (opts.spin) {
    const id = score.id(`act_${nodeId}_spin`);
    score.track({
      kind: "scalar",
      id,
      name: `${name} turns in`,
      targetId: nodeId,
      property: "rotation",
      mode: "add",
      stage: "custom",
      startFrame: opts.start,
      durationFrames: opts.frames,
      reason,
      keys: [
        { id: `${id}_k0`, frame: 0, value: 0, easing: ease("easeOutQuad") },
        { id: `${id}_k1`, frame: Math.round(last * 0.42), value: Math.round(opts.spin * 0.55), easing: ease("easeOutQuad") },
        { id: `${id}_k2`, frame: last, value: opts.spin },
      ],
    });
  }
}

export function unit(angleDeg: number): Point2D {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad), y: Math.sin(rad) };
}
