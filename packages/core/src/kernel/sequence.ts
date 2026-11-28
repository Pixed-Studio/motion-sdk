import type { AuditReport, Finding } from "./audit.ts";
import { snapshot, type SnapshotEntry } from "./evaluate.ts";
import { checkHandoff, type HandoffMismatch } from "./handoff.ts";
import type { HandoffIR, InvariantIR, MotionBlockIR, MotionDocument, SceneNodeIR } from "./ir.ts";
import type { Shot } from "./shot.ts";

/** How one shot gives way to the next. */
export interface Join {
  /**
   * Seconds the next shot starts before this one ends, so it comes in on this one's exit.
   * Left out, the join is a cut: the next shot's first frame follows this one's last.
   */
  overlapSec?: number;
  /** What the two shots may disagree on at this join, each with the reason: `{ color: "the look changes with the cut" }`. */
  accept?: Partial<Record<HandoffMismatch["what"], string>>;
  tolerance?: Parameters<typeof checkHandoff>[2];
}

export interface JoinReport {
  /** The frame of the joined timeline the incoming shot starts on. */
  frame: number;
  from: string;
  to: string;
  mismatches: HandoffMismatch[];
}

export interface SequenceAudit {
  ok: boolean;
  /** Every shot's findings, on the joined timeline's frames, and what the joins disagree on. */
  findings: Finding[];
  /** Each shot audited by itself: against its own ground, its own pattern and its own promises. */
  shots: AuditReport[];
  joins: JoinReport[];
}

export interface Sequence {
  /** One document that plays the shots in order. Compile it as any other. */
  readonly ir: MotionDocument;
  readonly shots: Shot[];
  /** The frame each shot starts on. */
  readonly starts: number[];
  readonly joins: JoinReport[];
  snapshot: (frame: number) => SnapshotEntry[];
  audit: () => SequenceAudit;
  readonly handoff: { entry?: HandoffIR; exit?: HandoffIR };
}

/**
 * Plays shots one after another on one timeline. Each keeps its own ground and is audited by
 * itself; every join is compared with `checkHandoff`, and what the two shots disagree on is
 * reported unless the join accepts it with a reason. Shots must share a stage size and frame rate.
 */
export function sequence(shots: Shot[], opts: { id?: string; name?: string; joins?: (Join | undefined)[] } = {}): Sequence {
  if (shots.length === 0) throw new Error("sequence() needs at least one shot.");
  const first = shots[0]!.ir;
  const { width, height, fps } = first.format;
  for (const shot of shots) {
    const f = shot.ir.format;
    if (f.width !== width || f.height !== height || f.fps !== fps) {
      throw new Error(`sequence(): "${shot.ir.name}" is ${f.width}×${f.height} at ${f.fps} fps and "${first.name}" is ${width}×${height} at ${fps} fps. Shots on one timeline share a stage and a frame rate.`);
    }
  }

  const starts: number[] = [0];
  for (let i = 1; i < shots.length; i++) {
    const before = shots[i - 1]!.ir.format.durationFrames;
    const overlap = Math.min(before - 1, Math.max(0, Math.round((opts.joins?.[i - 1]?.overlapSec ?? 0) * fps)));
    starts.push(starts[i - 1]! + before - overlap);
  }
  const total = starts.at(-1)! + shots.at(-1)!.ir.format.durationFrames;
  const pre = (i: number) => `s${i + 1}__`;

  const nodes: SceneNodeIR[] = [];
  const motions: MotionBlockIR[] = [];
  const doc: MotionDocument = {
    id: opts.id ?? shots.map((s) => s.ir.id).join("__"),
    name: opts.name ?? shots.map((s) => s.ir.name).join(" → "),
    format: { width, height, fps, durationFrames: total },
    scene: { id: `${opts.id ?? first.id}__scene-1`, name: opts.name ?? first.scene.name, durationFrames: total, backgroundColor: first.scene.backgroundColor },
    shaders: [],
    nodes,
    masks: [],
    motions,
    score: { shot: "sequence", cues: [], subjects: [], claimFrames: Math.min(...shots.map((s) => s.ir.score.claimFrames)), regions: {}, safeArea: first.score.safeArea, invariants: [], handoff: {}, notes: [] },
  };

  shots.forEach((shot, i) => {
    const src = shot.ir;
    const p = pre(i);
    const at = starts[i]!;
    const span = src.format.durationFrames;
    const holder = `${p}shot`;
    nodes.push({ id: holder, kind: "frame", name: src.name, slot: "shot", role: "group", layer: i + 1, range: { startFrame: at, durationFrames: span }, base: { x: 0, y: 0, width, height, originX: 0.5, originY: 0.5 } });
    if (src.scene.backgroundColor.toLowerCase() !== doc.scene.backgroundColor.toLowerCase()) {
      // A shot with another ground brings it along. Where it overlaps the shot before, that shot keeps its own ground until it ends.
      const from = i > 0 ? Math.max(at, starts[i - 1]! + shots[i - 1]!.ir.format.durationFrames) : at;
      nodes.push({
        id: `${p}ground`, kind: "shape", shape: "rectangle", name: `${src.name}: ground`, slot: "ground", role: "ambient", plane: "backdrop", parentId: holder,
        layer: Math.min(0, ...src.nodes.filter((n) => !n.parentId).map((n) => n.layer)) - 1,
        range: { startFrame: from, durationFrames: at + span - from },
        base: { x: 0, y: 0, width, height }, fill: { kind: "solid", color: src.scene.backgroundColor },
      });
    }
    for (const n of src.nodes) {
      nodes.push({ ...n, id: p + n.id, parentId: n.parentId ? p + n.parentId : holder, range: n.range && { startFrame: n.range.startFrame + at, durationFrames: n.range.durationFrames } });
    }
    for (const m of src.motions) {
      const reason = { ...m.reason, cues: m.reason.cues?.map((c) => p + c), peaks: m.reason.peaks?.map((c) => p + c) };
      const moved = { ...m, id: p + m.id, targetId: p + m.targetId, startFrame: m.startFrame + at, reason };
      motions.push(moved.kind === "followPath" ? { ...moved, guidePathId: p + moved.guidePathId } : moved);
    }
    for (const mask of src.masks) doc.masks.push({ ...mask, id: p + mask.id, sourceObjectId: p + mask.sourceObjectId, targetObjectId: p + mask.targetObjectId });
    for (const shader of src.shaders) if (!doc.shaders.some((s) => s.id === shader.id)) doc.shaders.push(shader);
    if (src.audio && !doc.audio) doc.audio = { ...src.audio, startFrame: src.audio.startFrame + at };

    const score = src.score;
    for (const cue of score.cues) doc.score.cues.push({ ...cue, name: p + cue.name, frame: cue.frame + at });
    for (const sub of score.subjects) doc.score.subjects.push({ ...sub, nodeId: p + sub.nodeId, cue: p + sub.cue, untilFrame: sub.untilFrame + at });
    for (const [name, box] of Object.entries(score.regions)) doc.score.regions[p + name] = box;
    for (const inv of score.invariants) {
      const moved: InvariantIR =
        inv.kind === "upright" ? { ...inv, nodeId: p + inv.nodeId }
        : inv.kind === "centred" ? { ...inv, nodeIds: inv.nodeIds.map((id) => p + id), frame: inv.frame + at }
        : inv.kind === "apart" ? { ...inv, a: p + inv.a, b: p + inv.b }
        : { ...inv, a: p + inv.a, b: p + inv.b, frame: inv.frame + at };
      doc.score.invariants.push(moved);
    }
    for (const note of score.notes) doc.score.notes.push({ ...note, message: `[${src.name}] ${note.message}` });
    if (score.cast) doc.score.cast = { ...doc.score.cast, ...Object.fromEntries(Object.entries(score.cast).map(([id, role]) => [p + id, role])) };
    if (score.crops) doc.score.crops = [...(doc.score.crops ?? []), ...score.crops.map((c) => ({ ...c, nodeId: p + c.nodeId }))];
  });

  const entry = first.score.handoff.entry;
  const last = shots.at(-1)!.ir.score.handoff.exit;
  if (entry) doc.score.handoff.entry = { ...entry, nodeId: pre(0) + entry.nodeId };
  if (last) doc.score.handoff.exit = { ...last, nodeId: pre(shots.length - 1) + last.nodeId, frame: last.frame + starts.at(-1)! };
  doc.score.cues.sort((a, b) => a.frame - b.frame);

  const joins: JoinReport[] = shots.slice(1).map((shot, i) => ({
    frame: starts[i + 1]!,
    from: shots[i]!.ir.name,
    to: shot.ir.name,
    mismatches: checkHandoff(shots[i]!.ir.score.handoff.exit, shot.ir.score.handoff.entry, opts.joins?.[i]?.tolerance),
  }));

  return {
    ir: doc,
    shots,
    starts,
    joins,
    snapshot: (frame) => snapshot(doc, frame),
    handoff: doc.score.handoff,
    audit: () => {
      const reports = shots.map((s) => s.audit());
      const findings: Finding[] = reports.flatMap((report, i) =>
        report.findings.map((f) => ({ ...f, message: `[${shots[i]!.ir.name}] ${f.message}`, frame: f.frame === undefined ? undefined : f.frame + starts[i]!, nodeId: f.nodeId && pre(i) + f.nodeId }))
      );
      joins.forEach((join, i) => {
        const accept = opts.joins?.[i]?.accept ?? {};
        for (const miss of join.mismatches) {
          const reason = accept[miss.what];
          findings.push({
            rule: "handoff",
            severity: reason ? "note" : "warning",
            frame: join.frame,
            message: `[${join.from} → ${join.to}] ${miss.message}${reason ? ` Meant: ${reason}` : ""}`,
            fix: reason ? undefined : `Match the ${miss.what} of the incoming shot's entry to the outgoing shot's exit, or accept it at this join with the reason.`,
          });
        }
      });
      return { ok: findings.every((f) => f.severity !== "error"), findings, shots: reports, joins };
    },
  };
}
