import { boxOf, evaluateAt, isDrawn, isInFront, lifetime, motionSpeed, paintOrder, sampleMotion, type NodeState } from "./evaluate.ts";
import { intersectionArea } from "./geometry.ts";
import type { BBox, FillSpec, MotionDocument, SceneNodeIR } from "./ir.ts";
import { checkPattern } from "./pattern.ts";

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
    | "centred"
    | "apart"
    | "mask-cover"
    | "handoff"
    | "decision"
    | "relation"
    | "in-frame"
    | "hold"
    | "undecided";
  /** `note` is for the author to read (a relation left out on purpose, a decision left to a default). It never fails the audit. */
  severity: "error" | "warning" | "note";
  /** For a `relation` finding, the relation's id in the pattern the shot declared. */
  relation?: string;
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
  /**
   * The part of `clearSec` that comes before the shot starts to leave, for a shot that declares where
   * that is: what the word gets while the statement sits still enough to be read without following it.
   */
  clearBeforeLeavingSec?: number;
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
  /**
   * Offset in frames from the cue to the fastest frame nearby, for a movement that declared its
   * peak there. For one that declared it comes to rest on the cue, the offset to the frame it
   * stops. 0 means on the cue.
   */
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
    /** Lowest contrast of a subject's ink against what is behind it, or null without text. */
    contrast: number | null;
    /**
     * From the frame the statement is complete to the frame it starts to leave, for a shot that
     * declares both, and the seconds all of it takes to read. Null otherwise.
     */
    hold: { completeFrame: number; leaveFrame: number; sec: number; readsInSec: number } | null;
  };
}

/** A covered share of a subject's box below this does not stop it being read. */
const COVER_SHARE = 0.3;
/** Text over something this close to its own colour is not readable. */
const MIN_BEHIND_CONTRAST = 3;
/** An answer declared to land on its cue must already move this fast before it, relative to after. */
const MIN_WIND_UP = 0.25;
/** A movement declared to peak on its cue, or to still be travelling when its cue comes, may miss it by this many frames. */
const MAX_CUE_OFFSET = 1;
/** With this share of its travel left, a movement has come to rest. */
const AT_REST = 0.02;
/** A movement declared to land on its cue may be at rest this many seconds before it; earlier, the hit reads early. */
const MAX_EARLY_LANDING_SEC = 0.15;
/** A complete statement held longer than this many times what it takes to read, and longer than the seconds below, is reported. */
const LONG_HOLD_RATIO = 1.5;
const LONG_HOLD_MIN_SEC = 1;
/** The share of a text box above and below its ink: a line's box is taller than its letters. */
const TEXT_BOX_AIR = 0.15;
/** A shape that moves more than this share of its size in a frame is crossing the edge, not resting on it. */
const CROSSING_SPEED = 0.02;
/** Something softer than this many pixels of blur has no edge for the picture to cut. */
const SOFT_BLUR = 6;
const RULES = new Set<string>(["budget", "reading", "attention", "answer", "safe-area", "contrast", "upright", "overlap", "centred", "apart", "mask-cover", "handoff", "decision", "relation", "in-frame", "hold", "undecided"]);

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
    findings.push({ rule: (RULES.has(note.rule) ? note.rule : "budget") as Finding["rule"], severity: note.severity, message: note.message, fix: note.fix });
  }

  const { width, height } = doc.format;
  const leavesFrom = Math.min(total, ...doc.motions.filter((m) => m.reason.beat === "leave").map((m) => m.startFrame));
  const cropped = new Set((doc.score.crops ?? []).map((c) => c.nodeId));
  const firstShown = (id: string) => {
    for (let f = 0; f < total; f++) if (at(f).get(id)?.visible) return f;
    return -1;
  };
  /** The box the eye takes as the object: a line of text without the air above and below its letters. */
  const seenBox = (node: SceneNodeIR, st: NodeState): BBox => {
    const box = boxOf(st);
    if (node.kind !== "text") return box;
    return { x: box.x, y: box.y + box.height * TEXT_BOX_AIR, width: box.width, height: box.height * (1 - 2 * TEXT_BOX_AIR) };
  };
  const cutByEdge = (box: BBox) => {
    const inside = intersectionArea(box, { x: 0, y: 0, width, height });
    return inside > 1e-6 && inside < area(box) - 0.5 * Math.max(box.width, box.height);
  };
  /** An object cut by the edge of the picture on the frame it shows, or on the shot's first frame, was not placed for that frame. */
  const checkInFrame = (node: SceneNodeIR, what: string, severity: "error" | "warning", travelling: boolean) => {
    if (cropped.has(node.id)) return;
    const first = firstShown(node.id);
    if (first < 0) return;
    for (const f of new Set([first, 0])) {
      const st = at(f).get(node.id);
      if (!st || !st.visible || st.blur > SOFT_BLUR) continue;
      const box = seenBox(node, st);
      if (!cutByEdge(box)) continue;
      // A shape on its way in from beyond the edge is an entrance; one that sits there was placed there.
      const next = at(Math.min(total - 1, f + 1)).get(node.id);
      if (travelling && next && Math.hypot(next.x - st.x, next.y - st.y) > Math.max(st.width, st.height) * CROSSING_SPEED) continue;
      findings.push({
        rule: "in-frame",
        severity,
        nodeId: node.id,
        frame: f,
        message:
          `"${what}" is cut by the edge of the picture on frame ${f}${f === first ? ", the frame it shows" : ""}: it spans x ${box.x.toFixed(0)} to ${(box.x + box.width).toFixed(0)} ` +
          `and y ${box.y.toFixed(0)} to ${(box.y + box.height).toFixed(0)} on a ${width}×${height} stage.`,
        fix: "Start it smaller or nearer its place, bring it from fully outside the picture, or declare the crop with its reason (score.crop).",
      });
      return;
    }
  };
  /** What a subject is read against: the nearest opaque flat shape that lies under all of it, or the scene. */
  const groundBehind = (node: SceneNodeIR, frame: number): string => {
    const st = at(frame).get(node.id);
    if (!st) return doc.scene.backgroundColor;
    const box = boxOf(st);
    let found: SceneNodeIR | undefined;
    for (const other of drawn) {
      if (other.id === node.id || other.kind === "text" || other.kind === "frame" || other.fill.kind !== "solid") continue;
      const so = at(frame).get(other.id);
      if (!so || !so.visible || so.opacity < 0.99 || so.blur > 0.5 || !isInFront(order, node.id, other.id)) continue;
      if (intersectionArea(box, boxOf(so)) < area(box) - 1) continue;
      if (!found || isInFront(order, other.id, found.id)) found = other;
    }
    return found && found.kind !== "frame" && found.kind !== "text" && found.fill.kind === "solid" ? found.fill.color.slice(0, 7) : doc.scene.backgroundColor;
  };

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
    let clearEarly = 0;
    let offered = 0;
    const leavesAt = doc.score.hold?.leaveFrame;
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
      else {
        clear++;
        if (leavesAt !== undefined && f < leavesAt) clearEarly++;
      }
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
      ...(leavesAt !== undefined ? { clearBeforeLeavingSec: clearEarly / fps } : {}),
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
      const ground = groundBehind(node, Math.max(arrives, Math.min(total, until) - 1));
      // Every colour the word is given over the shot has to hold against what is behind it.
      const inks = [ink, ...doc.motions.flatMap((m) => (m.kind === "color" && m.targetId === node.id ? m.keys.map((k) => k.color) : []))];
      const worst = inks.map((c) => ({ c, ratio: contrastRatio(c, ground) })).sort((a, b) => a.ratio - b.ratio)[0]!;
      contrast = contrast === null ? worst.ratio : Math.min(contrast, worst.ratio);
      if (worst.ratio < 4.5) {
        findings.push({
          rule: "contrast",
          severity: "error",
          nodeId: node.id,
          message: `"${label}"${worst.c === ink ? "" : ` in ${worst.c}`} has ${worst.ratio}:1 contrast against the background ${ground}; text needs 4.5:1.`,
        });
      }
    }

    checkInFrame(node, label, "error", false);

    // Where it rests is where it is before anything starts to leave, not where an exit has taken it.
    const restFrame = Math.max(arrives, Math.min(until, leavesFrom) - 1);
    const rest = at(restFrame).get(node.id);
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
          frame: restFrame,
          message: `"${label}" rests outside the safe area at frame ${restFrame}.`,
        });
      }
    }
    // The shot's first frame is looked at longest of all: a cut lands on it.
    const opening = at(0).get(node.id);
    if (opening && opening.visible && !cropped.has(node.id)) {
      const box = seenBox(node, opening);
      const safe = doc.score.safeArea;
      const out = box.x < safe.x - 0.5 || box.y < safe.y - 0.5 || box.x + box.width > safe.x + safe.width + 0.5 || box.y + box.height > safe.y + safe.height + 0.5;
      const inside = intersectionArea(box, { x: 0, y: 0, width, height }) > 1e-6;
      if (out && inside && !cutByEdge(box)) {
        findings.push({
          rule: "safe-area",
          severity: "warning",
          nodeId: node.id,
          frame: 0,
          message: `"${label}" is outside the safe area on the shot's first frame: it spans x ${box.x.toFixed(0)} to ${(box.x + box.width).toFixed(0)} and y ${box.y.toFixed(0)} to ${(box.y + box.height).toFixed(0)}.`,
          fix: "Start it smaller or nearer the middle, or declare the crop with its reason (score.crop).",
        });
      }
    }
  }

  // Supports and props are placed for the frame they show on as well.
  const subjectIds = new Set(doc.score.subjects.map((sub) => sub.nodeId));
  for (const node of drawn) {
    if (subjectIds.has(node.id)) continue;
    if (node.role === "support" || node.role === "carrier" || doc.score.cast?.[node.id] === "prop") checkInFrame(node, node.name, "warning", true);
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
    if (m.reason.lands !== "end" || !m.reason.cues) continue;
    // A movement that declared it comes to rest on its cue: find the frame it has landed.
    if (m.kind === "shaderParams" || m.kind === "followPath") continue;
    const name = m.reason.cues.at(-1)!;
    const fc = cueFrame.get(name);
    if (fc === undefined) continue;
    const to = m.startFrame + m.durationFrames - 1;
    const left = (f: number) => {
      const here = sampleMotion(m, f);
      const end = sampleMotion(m, to);
      if (typeof here === "number" || typeof end === "number") return Math.abs((end as number) - (here as number));
      return Math.hypot(end.x - here.x, end.y - here.y);
    };
    let travel = 0;
    for (let f = m.startFrame; f <= to; f++) travel = Math.max(travel, left(f));
    if (travel <= 1e-6) continue;
    let lands = m.startFrame;
    while (lands < to && left(lands) > travel * AT_REST) lands++;
    const offset = lands - fc;
    const early = Math.max(MAX_CUE_OFFSET, Math.round(MAX_EARLY_LANDING_SEC * fps));
    answers.push({ motionId: m.id, cue: name, frame: fc, speedBefore: motionSpeed(m, fc - 0.5), speedAfter: motionSpeed(m, fc + 0.5), peakOffset: offset });
    if (offset > MAX_CUE_OFFSET || offset < -early) {
      findings.push({
        rule: "answer",
        severity: "error",
        frame: fc,
        nodeId: m.targetId,
        message:
          `"${m.name}" comes to rest ${Math.abs(offset)} frame(s) ${offset > 0 ? "after" : "before"} "${name}" (frame ${fc}); it declared it lands there` +
          (offset > 0 ? "." : `, and a landing more than ${early} frame(s) ahead reads early.`),
        fix:
          offset > 0
            ? "Start the movement sooner so it stops on the cue, or declare what it really does."
            : "Use an ease that keeps travelling until the cue (a long tail has landed well before its last key), start it later, or declare lands: \"start\".",
      });
    }
  }
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
        if (Math.abs(peakOffset) > MAX_CUE_OFFSET) {
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
    } else if (inv.kind === "centred") {
      const frame = Math.max(0, Math.min(total - 1, inv.frame));
      const seen = inv.nodeIds.map((id) => at(frame).get(id)).filter((st): st is NodeState => Boolean(st && st.visible));
      if (seen.length === 0) continue;
      const left = Math.min(...seen.map((st) => st.x - st.width / 2));
      const right = Math.max(...seen.map((st) => st.x + st.width / 2));
      const off = (left + right) / 2 - inv.x;
      if (Math.abs(off) > inv.tolerance) {
        findings.push({
          rule: "centred",
          severity: "error",
          nodeId: inv.nodeIds[0],
          frame,
          message: `At frame ${frame} what is on stage sits ${Math.abs(off).toFixed(1)} px ${off > 0 ? "right" : "left"} of x ${inv.x.toFixed(0)}. ${inv.why}`,
        });
      }
    } else if (inv.kind === "apart") {
      let worst = 0;
      let worstFrame = 0;
      let frames = 0;
      for (let f = 0; f < total; f++) {
        const a = at(f).get(inv.a);
        const b = at(f).get(inv.b);
        if (!a || !b || !a.visible || !b.visible) continue;
        const shared = intersectionArea(boxOf(a), boxOf(b)) / Math.min(area(boxOf(a)), area(boxOf(b)));
        if (shared <= Math.max(1e-6, inv.maxShare ?? 0)) continue;
        frames++;
        if (shared > worst) {
          worst = shared;
          worstFrame = f;
        }
      }
      if (frames > 0) {
        findings.push({
          rule: "apart",
          severity: "error",
          nodeId: inv.a,
          frame: worstFrame,
          message: `"${inv.a}" and "${inv.b}" are drawn over one another for ${frames} frame(s), by ${(worst * 100).toFixed(0)}% at frame ${worstFrame}. ${inv.why}`,
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

  // The pattern the shot declared.
  findings.push(...checkPattern(doc, at));

  // The hold: how long the complete statement stays before it starts to leave.
  let hold: AuditReport["measures"]["hold"] = null;
  if (doc.score.hold) {
    const { completeFrame, leaveFrame } = doc.score.hold;
    const perCue = new Map<string, number>();
    for (const sub of doc.score.subjects) perCue.set(sub.cue, Math.max(perCue.get(sub.cue) ?? 0, sub.needsSec));
    const readsInSec = Math.round([...perCue.values()].reduce((a, b) => a + b, 0) * 100) / 100;
    const sec = Math.max(0, leaveFrame - completeFrame) / fps;
    hold = { completeFrame, leaveFrame, sec: Math.round(sec * 100) / 100, readsInSec };
    if (sec > LONG_HOLD_MIN_SEC && sec > readsInSec * LONG_HOLD_RATIO) {
      findings.push({
        rule: "hold",
        severity: "warning",
        frame: completeFrame,
        message:
          `The statement is complete on frame ${completeFrame} and starts to leave on frame ${leaveFrame}: it holds ${secs(sec)}, ` +
          `and all of it reads in about ${secs(readsInSec)}.`,
        fix: `Shorten the shot by up to ${secs(sec - readsInSec)}, let its length follow its content, or give the hold something to do.`,
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
    measures: { reading, answers, stills, contrast, hold },
  };
}
