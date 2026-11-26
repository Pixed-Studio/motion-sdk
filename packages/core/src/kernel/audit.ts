import { boxOf, evaluateAt, isDrawn, isInFront, lifetime, motionSpeed, paintOrder, type NodeState } from "./evaluate.ts";
import { intersectionArea } from "./geometry.ts";
import type { BBox, FillSpec, MotionDocument, SceneNodeIR } from "./ir.ts";

export interface Finding {
  rule:
    | "budget"
    | "reading"
    | "attention"
    | "answer"
    | "safe-area"
    | "contrast"
    | "upright"
    | "overlap"
    | "mask-cover"
    | "handoff";
  severity: "error" | "warning";
  message: string;
  fix?: string;
  frame?: number;
  nodeId?: string;
}

/** What one subject was promised and what the frames gave it. */
export interface ReadingMeasure {
  nodeId: string;
  label: string;
  cue: string;
  arrivesFrame: number;
  untilFrame: number;
  needsSec: number;
  /** Seconds on screen between its cue and the frame the shot stops offering it. */
  offeredSec: number;
  /** Seconds of those in which it is sharp, opaque and not covered. */
  clearSec: number;
  /** What covered it, and for how many frames. */
  blockedBy: { nodeId: string; frames: number }[];
}

/** How one answer sits on its cue: speed in the frame before the cue and in the frame after. */
export interface AnswerMeasure {
  motionId: string;
  track?: string;
  cue: string;
  frame: number;
  speedBefore: number;
  speedAfter: number;
  /** Offset in frames from the cue to the fastest frame nearby. 0 means on the cue. */
  peakOffset: number;
}

export interface AuditReport {
  ok: boolean;
  findings: Finding[];
  /** The numbers behind the findings. Read them even when the audit passes. */
  measures: {
    reading: ReadingMeasure[];
    answers: AnswerMeasure[];
    /** Runs of frames in which nothing drawn changes. A hold can be the point; this only locates them. */
    stills: { fromFrame: number; toFrame: number }[];
    /** Lowest contrast of a subject's ink against the background, or null without text. */
    contrast: number | null;
  };
}

/** A covered share of a subject's box below this does not stop it being read. */
const COVER_SHARE = 0.3;
/** Text over something this close to its own colour is not readable. */
const MIN_BEHIND_CONTRAST = 3;
/** An answer declared to land on its cue must already move this fast before it, relative to after. */
const MIN_WIND_UP = 0.25;

function luminance(hex: string): number {
  const clean = hex.replace("#", "").slice(0, 6);
  const channel = (i: number) => {
    const c = parseInt(clean.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = luminance(hexA);
  const b = luminance(hexB);
  return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
}

/** The colours a fill can show. A subject over the fill is judged against the worst of them. */
function fillColors(fill: FillSpec): string[] {
  if (fill.kind === "solid") return [fill.color];
  if (fill.kind === "linear" || fill.kind === "radial") return fill.stops.map((s) => s.color);
  if (fill.kind === "shader") {
    return Object.values(fill.params).filter((v): v is string => typeof v === "string" && v.startsWith("#"));
  }
  return [];
}

const area = (b: BBox) => Math.max(1e-6, b.width * b.height);
const secs = (n: number) => `${n.toFixed(2)} s`;

/**
 * Checks a document against its own score: what each subject was promised, what each answer
 * declared, and every invariant, frame by frame. It needs no pixels and knows no particular shot.
 */
export function auditMotion(doc: MotionDocument): AuditReport {
  const findings: Finding[] = [];
  const fps = doc.format.fps;
  const total = doc.format.durationFrames;
  const byId = new Map<string, SceneNodeIR>(doc.nodes.map((n) => [n.id, n]));
  const order = paintOrder(doc);
  const drawn = doc.nodes.filter(isDrawn);
  const frames: (Map<string, NodeState> | undefined)[] = new Array(total);
  const at = (f: number) => (frames[f] ??= evaluateAt(doc, f));
  const cueFrame = new Map(doc.score.cues.map((c) => [c.name, c.frame]));

  for (const note of doc.score.notes) {
    findings.push({ rule: "budget", severity: note.severity, message: note.message, fix: note.fix });
  }

  // Reading: each subject gets the clear time it declared.
  const reading: ReadingMeasure[] = [];
  const unseen = new Map<string, { behind: string; label: string; ratio: number }>();
  let contrast: number | null = null;
  for (const subject of doc.score.subjects) {
    const node = byId.get(subject.nodeId);
    if (!node) continue;
    const arrives = cueFrame.get(subject.cue) ?? 0;
    const until = Math.min(subject.untilFrame, total);
    const ink = node.kind === "text" ? node.fill.color : null;
    const label = node.kind === "text" ? node.text : node.name;
    const blocked = new Map<string, number>();
    let clear = 0;
    let offered = 0;
    for (let f = arrives; f < until; f++) {
      const states = at(f);
      const st = states.get(node.id);
      if (!st || !st.visible) continue;
      offered++;
      if (st.opacity < 0.85 || st.blur > 1.5) continue;
      const box = boxOf(st);
      let by: string | null = null;
      for (const other of drawn) {
        if (other.id === node.id || other.slot === node.slot) continue;
        const so = states.get(other.id);
        if (!so || !so.visible) continue;
        const share = (intersectionArea(box, boxOf(so)) / area(box)) * Math.min(1, so.opacity);
        if (share < COVER_SHARE) continue;
        if (isInFront(order, other.id, node.id)) {
          by = other.id;
          break;
        }
        if (ink && other.kind !== "text" && other.kind !== "frame") {
          const worst = Math.min(...fillColors(other.fill).map((c) => contrastRatio(ink, c)), Infinity);
          if (worst >= MIN_BEHIND_CONTRAST) continue;
          if (other.fill.kind === "shader") {
            // A shader paints only part of its box, and which part is not knowable here.
            unseen.set(`${other.id}|${node.id}`, { behind: other.id, label, ratio: worst });
            continue;
          }
          by = other.id;
          break;
        }
      }
      if (by) blocked.set(by, (blocked.get(by) ?? 0) + 1);
      else clear++;
    }
    const measure: ReadingMeasure = {
      nodeId: node.id,
      label,
      cue: subject.cue,
      arrivesFrame: arrives,
      untilFrame: until,
      needsSec: subject.needsSec,
      offeredSec: offered / fps,
      clearSec: clear / fps,
      blockedBy: [...blocked].map(([nodeId, n]) => ({ nodeId, frames: n })).sort((a, b) => b.frames - a.frames),
    };
    reading.push(measure);
    if (measure.clearSec + 1e-9 < subject.needsSec) {
      const cover = measure.blockedBy[0];
      findings.push({
        rule: "reading",
        severity: "error",
        nodeId: node.id,
        frame: arrives,
        message:
          `"${label}" needs ${secs(subject.needsSec)} of clear reading and gets ${secs(measure.clearSec)}. ` +
          `It arrives at frame ${arrives} and the shot stops offering it at frame ${until} (${secs(measure.offeredSec)} on screen)` +
          (cover ? `; "${cover.nodeId}" covers it for ${cover.frames} frame(s).` : "."),
        fix: cover
          ? "Move what covers it, shorten that pass, or give the line more time."
          : "Bring its cue forward, let the shot hold it longer, or declare a shorter need if it reads faster than its length suggests.",
      });
    }

    if (ink) {
      const ratio = contrastRatio(ink, doc.scene.backgroundColor);
      contrast = contrast === null ? ratio : Math.min(contrast, ratio);
      if (ratio < 4.5) {
        findings.push({
          rule: "contrast",
          severity: "error",
          nodeId: node.id,
          message: `"${label}" has ${ratio}:1 contrast against the background ${doc.scene.backgroundColor}; text needs 4.5:1.`,
        });
      }
    }

    const rest = at(Math.max(arrives, until - 1)).get(node.id);
    if (rest && rest.visible) {
      const box = boxOf(rest);
      const safe = doc.score.safeArea;
      if (
        box.x < safe.x - 0.5 ||
        box.y < safe.y - 0.5 ||
        box.x + box.width > safe.x + safe.width + 0.5 ||
        box.y + box.height > safe.y + safe.height + 0.5
      ) {
        findings.push({
          rule: "safe-area",
          severity: "error",
          nodeId: node.id,
          frame: until - 1,
          message: `"${label}" rests outside the safe area at frame ${until - 1}.`,
        });
      }
    }
  }

  for (const { behind, label, ratio } of unseen.values()) {
    findings.push({
      rule: "contrast",
      severity: "warning",
      nodeId: behind,
      message:
        `"${behind}" is behind "${label}" in a colour with ${ratio}:1 contrast against the ink. It is drawn by a shader, ` +
        `so the audit cannot tell how much of the line it covers.`,
      fix: "Look at a frame where both are on stage, or give it a colour that holds the ink.",
    });
  }

  // Attention: arrivals closer than one claim compete for the eye. Subjects that share a cue are
  // one arrival, made of several objects on purpose.
  const arrivals = [...new Map(doc.score.subjects.map((s) => [s.cue, s])).values()]
    .map((s) => ({ subject: s, frame: cueFrame.get(s.cue) ?? 0 }))
    .sort((a, b) => a.frame - b.frame);
  let crowded = 0;
  let tightest = Infinity;
  let tightestAt = 0;
  for (let i = 1; i < arrivals.length; i++) {
    const gap = arrivals[i]!.frame - arrivals[i - 1]!.frame;
    if (gap >= doc.score.claimFrames) continue;
    crowded++;
    if (gap < tightest) {
      tightest = gap;
      tightestAt = i;
    }
  }
  if (crowded > 0) {
    const a = byId.get(arrivals[tightestAt - 1]!.subject.nodeId);
    const b = byId.get(arrivals[tightestAt]!.subject.nodeId);
    findings.push({
      rule: "attention",
      severity: "error",
      frame: arrivals[tightestAt]!.frame,
      nodeId: b?.id,
      message:
        `${crowded} arrival(s) come before the one ahead has had the eye. The closest are "${a?.name}" and "${b?.name}", ` +
        `${tightest} frame(s) apart; one arrival holds the eye for ${doc.score.claimFrames} frames at this feel.`,
      fix: "Space the cues by at least one claim, or make the crowded lines one subject that arrives together on purpose.",
    });
  }

  // Answers: a motion that declares it lands on its cue must be at speed there.
  const answers: AnswerMeasure[] = [];
  for (const m of doc.motions) {
    if (m.reason.lands !== "peak" || !m.reason.cues) continue;
    const tracks = m.kind === "shaderParams" ? Object.keys(m.tracks) : [undefined];
    for (const track of tracks) {
      for (const name of m.reason.peaks ?? m.reason.cues) {
        const fc = cueFrame.get(name);
        if (fc === undefined || fc <= m.startFrame || fc >= m.startFrame + m.durationFrames - 1) continue;
        const before = motionSpeed(m, fc - 0.5, track);
        const after = motionSpeed(m, fc + 0.5, track);
        // Look for the fastest frame near the cue, but not as far as the answers on either side.
        let reach = 4;
        for (const other of m.reason.cues) {
          const fo = cueFrame.get(other);
          if (fo !== undefined && fo !== fc) reach = Math.min(reach, Math.floor(Math.abs(fo - fc) / 2));
        }
        let peakOffset = 0;
        let peak = -1;
        for (let k = -reach; k <= reach - 1; k++) {
          const v = motionSpeed(m, fc + k + 0.5, track);
          if (v > peak + 1e-9) {
            peak = v;
            peakOffset = k < 0 ? k + 1 : k;
          }
        }
        answers.push({ motionId: m.id, track, cue: name, frame: fc, speedBefore: before, speedAfter: after, peakOffset });
        const label = track ? `${m.name} (${track})` : m.name;
        if (Math.abs(peakOffset) > 1) {
          findings.push({
            rule: "answer",
            severity: "error",
            frame: fc,
            nodeId: m.targetId,
            message: `"${label}" is fastest ${Math.abs(peakOffset)} frame(s) ${peakOffset > 0 ? "after" : "before"} "${name}" (frame ${fc}); it declared its peak on the cue.`,
            fix: "Shift the answer so its fastest frame is the cue, or declare what it really does.",
          });
        } else if (after <= 1e-6 || before / after < MIN_WIND_UP) {
          findings.push({
            rule: "answer",
            severity: "error",
            frame: fc,
            nodeId: m.targetId,
            message:
              `"${label}" starts from "${name}" instead of landing on it: it moves ${before.toFixed(2)} per frame ` +
              `before the cue and ${after.toFixed(2)} after. The hit then reads late.`,
            fix: "Wind up before the cue (anticipate above 0), or declare lands: \"start\" if starting on the cue is the intent.",
          });
        }
      }
    }
  }

  // Invariants the shot declared.
  for (const inv of doc.score.invariants) {
    if (inv.kind === "upright") {
      let worst = 0;
      let worstFrame = 0;
      for (let f = 0; f < total; f++) {
        const st = at(f).get(inv.nodeId);
        if (!st || !st.visible) continue;
        const turned = Math.abs(((st.rotation % 360) + 540) % 360 - 180);
        if (turned > worst) {
          worst = turned;
          worstFrame = f;
        }
      }
      if (worst > inv.toleranceDeg) {
        findings.push({
          rule: "upright",
          severity: "error",
          nodeId: inv.nodeId,
          frame: worstFrame,
          message: `"${inv.nodeId}" turns ${worst.toFixed(1)}° at frame ${worstFrame}. ${inv.why}`,
        });
      }
    } else {
      const a = at(inv.frame).get(inv.a);
      const b = at(inv.frame).get(inv.b);
      const share = a && b && a.visible && b.visible ? intersectionArea(boxOf(a), boxOf(b)) / area(boxOf(a)) : 0;
      if (share + 1e-9 < inv.minShare) {
        findings.push({
          rule: "overlap",
          severity: "error",
          nodeId: inv.a,
          frame: inv.frame,
          message: `"${inv.a}" overlaps "${inv.b}" by ${(share * 100).toFixed(0)}% at frame ${inv.frame}; it needs ${(inv.minShare * 100).toFixed(0)}%. ${inv.why}`,
        });
      }
    }
  }

  // A mask must exist whenever what it clips exists.
  for (const mask of doc.masks) {
    const src = byId.get(mask.sourceObjectId);
    const dst = byId.get(mask.targetObjectId);
    if (!src || !dst) {
      findings.push({ rule: "mask-cover", severity: "error", message: `Mask "${mask.id}" names an object that does not exist.` });
      continue;
    }
    const s = lifetime(doc, src);
    const d = lifetime(doc, dst);
    if (s.start > d.start || s.end < d.end) {
      findings.push({
        rule: "mask-cover",
        severity: "error",
        nodeId: dst.id,
        message: `Mask source "${src.id}" lives ${s.start}..${s.end} and what it clips, "${dst.id}", lives ${d.start}..${d.end}. Outside the source's life the clip is empty.`,
      });
    }
  }

  // The exit handoff's carrier must be there to hand over.
  const exit = doc.score.handoff.exit;
  if (exit) {
    const st = at(Math.min(total - 1, exit.frame)).get(exit.nodeId);
    const onStage =
      st && st.visible && st.x >= 0 && st.x <= doc.format.width && st.y >= 0 && st.y <= doc.format.height;
    if (!onStage) {
      findings.push({
        rule: "handoff",
        severity: "error",
        nodeId: exit.nodeId,
        frame: exit.frame,
        message: `The exit handoff names "${exit.nodeId}" at frame ${exit.frame}, and it is not on stage then.`,
      });
    }
  }

  // Stills, for review only.
  const stills: { fromFrame: number; toFrame: number }[] = [];
  let runStart = 0;
  let previous = "";
  const minStill = Math.round(fps * 0.5);
  for (let f = 0; f <= total; f++) {
    let signature = "";
    if (f < total) {
      const states = at(f);
      for (const n of drawn) {
        const st = states.get(n.id);
        if (st && st.visible) {
          signature += `${n.id}:${st.x.toFixed(1)},${st.y.toFixed(1)},${st.rotation.toFixed(1)},${st.scale.toFixed(3)},${st.opacity.toFixed(2)},${st.blur.toFixed(1)}|`;
        }
      }
    }
    if (f === 0 || signature !== previous) {
      if (f - runStart >= minStill) stills.push({ fromFrame: runStart, toFrame: f - 1 });
      runStart = f;
    }
    previous = signature;
  }

  return {
    ok: findings.every((f) => f.severity !== "error"),
    findings,
    measures: { reading, answers, stills, contrast },
  };
}
