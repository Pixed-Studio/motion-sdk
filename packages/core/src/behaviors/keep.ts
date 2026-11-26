import { linear } from "../kernel/easing.ts";
import { sampleScalarKeys } from "../kernel/evaluate.ts";
import type { FillSpec, MotionBlockIR, ScalarKey, ScalarMotionIR, SceneNodeIR } from "../kernel/ir.ts";
import type { Score } from "../kernel/score.ts";

/**
 * Keeps an object facing the way it was drawn while the group that carries it turns. Use it for
 * anything lit from one side: a sphere whose highlight swings round with its ring reads as a
 * sticker on a wheel. The counter-turn is the carrier's own keys negated, so it holds on every
 * frame however the carrier is timed, and the score records the relation for the audit.
 */
export function keepUpright(score: Score, nodeId: string, turning: ScalarMotionIR): ScalarMotionIR {
  const node = score.node(nodeId);
  const end = turning.startFrame + turning.durationFrames;
  const start = Math.max(turning.startFrame, node.range?.startFrame ?? turning.startFrame);
  const at = (frame: number) => -sampleScalarKeys(turning.keys, frame - turning.startFrame, 0);
  const blockId = score.id(`act_${nodeId}_upright`);

  const keys: ScalarKey[] = [];
  const push = (frame: number, key?: ScalarKey) => {
    keys.push({
      id: `${blockId}_k${keys.length}`,
      frame: frame - start,
      value: Math.round(at(frame) * 100) / 100,
      easing: key?.easing ?? linear,
    });
  };
  // A carrier key the object's life starts inside is followed frame by frame up to the next key.
  const absolute = turning.keys.map((k) => ({ key: k, frame: turning.startFrame + k.frame }));
  const firstAfter = absolute.findIndex((k) => k.frame > start);
  const onKey = absolute.some((k) => k.frame === start);
  if (firstAfter === -1) {
    push(start);
  } else {
    const upTo = absolute[firstAfter]!.frame;
    if (onKey) push(start, absolute.find((k) => k.frame === start)!.key);
    else for (let f = start; f < upTo; f++) push(f);
    for (let i = firstAfter; i < absolute.length; i++) push(absolute[i]!.frame, absolute[i]!.key);
  }
  delete keys[keys.length - 1]!.easing;

  score.invariants.push({
    kind: "upright",
    nodeId,
    toleranceDeg: 1,
    why: "It is lit from one side, so it must not turn with the group that carries it.",
  });
  return score.track({
    kind: "scalar",
    id: blockId,
    name: `${node.name} stays upright`,
    targetId: nodeId,
    property: "rotation",
    mode: "add",
    stage: "custom",
    startFrame: start,
    durationFrames: end - start,
    reason: { purpose: "keep" },
    keys,
  });
}

function follower(
  score: Score,
  sourceId: string,
  as: { id: string; name: string; slot: string; role: SceneNodeIR["role"]; layer: number; fill: FillSpec; range?: SceneNodeIR["range"] }
): SceneNodeIR {
  const source = score.node(sourceId);
  if (source.kind === "frame" || source.kind === "text") {
    throw new Error(`"${sourceId}" is a ${source.kind}; only shapes and paths can be followed.`);
  }
  const copy = score.add({
    ...source,
    id: score.id(as.id),
    name: as.name,
    slot: as.slot,
    role: as.role,
    layer: as.layer,
    fill: as.fill,
    range: as.range ?? (source.range && { ...source.range }),
    base: { ...source.base },
  });
  for (const m of [...score.motions]) {
    if (m.targetId !== sourceId) continue;
    const id = score.id(`${m.id}__${copy.id}`);
    const rekey = <K extends { id: string }>(keys: K[]) => keys.map((k, i) => ({ ...k, id: `${id}_k${i}` }));
    const moved = { ...m, id, name: `${as.name}: ${m.name}`, targetId: copy.id, reason: { purpose: "keep" as const } };
    if (moved.kind === "scalar") moved.keys = rekey(moved.keys);
    else if (moved.kind === "vec2") moved.keys = rekey(moved.keys);
    score.track(moved as MotionBlockIR);
  }
  return copy;
}

/**
 * Shows an object in another fill wherever it lies over a second object, while both keep moving:
 * a shape that changes colour as it crosses into a host, or the lens where two shapes overlap.
 * State the relation and the fill. It is built from a copy of the second object used as a mask
 * and a recoloured copy of the first, each following its original exactly, so the result stays
 * a native mask a person can open and adjust.
 *
 * Call it after both objects have all their motion: the copies take what is there.
 */
export function recolorWhere(
  score: Score,
  opts: { object: string; over: string; fill: FillSpec; layer: number; name: string }
): { mask: SceneNodeIR; shown: SceneNodeIR } {
  const object = score.node(opts.object);
  const over = score.node(opts.over);
  const total = score.format.durationFrames;
  const life = (n: SceneNodeIR) => ({
    start: n.range?.startFrame ?? 0,
    end: n.range ? n.range.startFrame + n.range.durationFrames : total,
  });
  const a = life(object);
  const b = life(over);
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  if (end <= start) throw new Error(`"${opts.object}" and "${opts.over}" are never on stage together.`);

  const mask = follower(score, opts.over, {
    id: `mask_${opts.over}_for_${opts.object}`,
    name: `Mask: ${over.name} for ${opts.name}`,
    slot: "mask",
    role: "mask",
    layer: opts.layer,
    fill: { kind: "solid", color: "#FFFFFF" },
  });
  const shown = follower(score, opts.object, {
    id: `${opts.object}_over_${opts.over}`,
    name: opts.name,
    slot: `${object.slot}-recolored`,
    role: object.role,
    layer: opts.layer + 1,
    fill: opts.fill,
    range: { startFrame: start, durationFrames: end - start },
  });
  score.masks.push({
    id: score.id(`clip_${shown.id}`),
    name: opts.name,
    sourceObjectId: mask.id,
    targetObjectId: shown.id,
    mode: "vector",
    inverted: false,
  });
  return { mask, shown };
}
