import type { Finding } from "./audit.ts";
import { evaluateAt, isDrawn, sampleMotion, type NodeState } from "./evaluate.ts";
import type { Beat, MotionBlockIR, MotionDocument, PatternIR, RelationIR, Role, SceneNodeIR } from "./ir.ts";
import type { Score } from "./score.ts";

/** A pattern as an author writes it: its name, what it is for, and the relations that make it that pattern. */
export interface PatternSpec {
  name: string;
  intent: string;
  relations: RelationIR[];
}

/** The reason a relation is left out on purpose. The audit reports it instead of checking the relation. */
export type Waive = { none: string };

/**
 * The lead pattern (领词让位): an opening that stresses one message. The lead takes the eye on the cut,
 * gives its place to the sentence in one move, and the sentence resolves on its point. It is these
 * relations and nothing else: how each beat moves, which way and how fast is the author's.
 */
export const leadPattern: PatternSpec = {
  name: "lead",
  intent:
    "An opening that stresses one message. The lead takes the eye when the shot starts; it has the impact, not the meaning. " +
    "It gives its place to the sentence once, the rest joins during that move, and the point arrives last and is marked.",
  relations: [
    { id: "alone", kind: "alone", role: "lead", among: ["link", "point"], why: "The lead is alone on stage when it hits." },
    { id: "once", kind: "once", beat: "room", needs: ["link", "point"], why: "Room is made once, not once for every arrival." },
    { id: "joins", kind: "during", roles: ["link", "point"], beat: "room", why: "What follows the lead joins while room is being made, so the move throws the eye to it." },
    { id: "last", kind: "last", role: "point", after: ["lead", "link"], why: "The point is the last arrival: the sentence resolves on it." },
    { id: "marked", kind: "marked", role: "point", against: ["lead", "link"], beat: "mark", why: "The point is marked: it is what the viewer should remember." },
    { id: "composed", kind: "composed", roles: ["lead", "link", "point"], beats: ["prep", "hit", "settle", "room", "join"], region: "phrase", why: "When the last word has landed the sentence sits where its composition was declared." },
    { id: "whole", kind: "together", roles: ["lead", "link", "point"], beat: "leave", why: "The sentence leaves as one." },
  ],
};

/**
 * Declares that the shot on this score follows a pattern. The audit then checks the pattern's
 * relations against the roles cast on the score and the beats the movements name, whoever wrote
 * them. `waive` leaves a relation out on purpose: `{ marked: { none: "the film marks nothing here" } }`.
 */
export function declarePattern(score: Score, pattern: PatternSpec, waive: Record<string, Waive | undefined> = {}): void {
  const known = pattern.relations.map((r) => r.id);
  for (const [id, reason] of Object.entries(waive)) {
    if (!known.includes(id)) {
      throw new Error(`[${score.shot}] The ${pattern.name} pattern has no relation "${id}". Its relations: ${known.join(", ")}.`);
    }
    if (reason && !reason.none?.trim()) {
      throw new Error(`[${score.shot}] Relation "${id}" is waived without a reason. Write { none: "why this shot breaks it" }.`);
    }
  }
  score.pattern = {
    name: pattern.name,
    intent: pattern.intent,
    relations: pattern.relations.map((r) => (waive[r.id] ? { ...r, waived: waive[r.id]!.none } : { ...r })),
  };
}

/** A value changes by less than this between two frames: the movement is still. */
const STILL = 1e-3;
/** Things may miss a moment a relation names by this many frames. */
const SLACK_FRAMES = 1;
/** A sentence sits on its declared composition when its middle is within this share of the stage width of it. */
const COMPOSED_SHARE = 0.004;
/** Under one movement, two objects that go as one keep their arrangement to within this many pixels. */
const AS_ONE_PX = 0.75;

const changes = (m: MotionBlockIR, frame: number): boolean => {
  const tracks = m.kind === "shaderParams" ? Object.keys(m.tracks) : [undefined];
  return tracks.some((track) => {
    const a = sampleMotion(m, frame, track);
    const b = sampleMotion(m, frame + 1, track);
    if (typeof a === "number" || typeof b === "number") return Math.abs((b as number) - (a as number)) > STILL;
    return Math.hypot(b.x - a.x, b.y - a.y) > STILL;
  });
};

/** The runs of frames in which any of these blocks moves. A run from `from` to `to` moves on every step between them. */
function runsOf(blocks: MotionBlockIR[]): { from: number; to: number }[] {
  if (blocks.length === 0) return [];
  const first = Math.min(...blocks.map((m) => m.startFrame));
  const last = Math.max(...blocks.map((m) => m.startFrame + m.durationFrames - 1));
  const runs: { from: number; to: number }[] = [];
  for (let f = first; f < last; f++) {
    const moving = blocks.some((m) => f >= m.startFrame && f < m.startFrame + m.durationFrames - 1 && changes(m, f));
    if (!moving) continue;
    const open = runs.at(-1);
    if (open && open.to === f) open.to = f + 1;
    else runs.push({ from: f, to: f + 1 });
  }
  return runs;
}

/**
 * Checks the pattern a document declares. Each relation is read from who is cast as what and which
 * beat each movement names; a waived relation is reported with its reason.
 */
export function checkPattern(doc: MotionDocument, at: (frame: number) => Map<string, NodeState>): Finding[] {
  const pattern: PatternIR | undefined = doc.score.pattern;
  if (!pattern) return [];
  const total = doc.format.durationFrames;
  const cast = doc.score.cast ?? {};
  const byId = new Map<string, SceneNodeIR>(doc.nodes.map((n) => [n.id, n]));
  const label = (id: string) => {
    const n = byId.get(id);
    return n?.kind === "text" ? n.text : (n?.name ?? id);
  };
  const quoted = (ids: string[]) => ids.map((id) => `"${label(id)}"`).join(", ");

  // Who a role is: the drawn objects cast as it, and what a group cast as it carries.
  const under = (id: string): string[] => {
    const node = byId.get(id);
    if (!node) return [];
    if (node.kind !== "frame") return isDrawn(node) ? [id] : [];
    return doc.nodes.filter((n) => n.parentId === id && !(n.id in cast)).flatMap((n) => under(n.id));
  };
  const members = (roles: Role[]): string[] => [...new Set(Object.entries(cast).filter(([, r]) => roles.includes(r)).flatMap(([id]) => under(id)))];
  // On stage: drawn, and at least partly inside the picture. Something waiting beyond the edge has not shown yet.
  const { width, height } = doc.format;
  const inPicture = (id: string, f: number) => {
    const st = at(f).get(id);
    return Boolean(st && st.visible && st.x + st.width / 2 > 0 && st.x - st.width / 2 < width && st.y + st.height / 2 > 0 && st.y - st.height / 2 < height);
  };
  const shown = new Map<string, { first: number; last: number }>();
  const seen = (id: string) => {
    if (!shown.has(id)) {
      let first = -1;
      let last = -1;
      for (let f = 0; f < total; f++) {
        if (first < 0 && inPicture(id, f)) first = f;
        if (at(f).get(id)?.visible) last = f;
      }
      shown.set(id, { first, last });
    }
    return shown.get(id)!;
  };
  const onStage = (ids: string[]) => ids.filter((id) => seen(id).first >= 0);
  const blocks = (beats: Beat[]) => doc.motions.filter((m) => m.reason.beat !== undefined && beats.includes(m.reason.beat));
  const cueOf = new Map(doc.score.cues.map((c) => [c.name, c.frame]));
  const arrives = (id: string) => {
    const subject = doc.score.subjects.find((s) => s.nodeId === id);
    return (subject && cueOf.get(subject.cue)) ?? seen(id).first;
  };

  const findings: Finding[] = [];
  const report = (r: RelationIR, message: string, fix: string, frame?: number, nodeId?: string) =>
    findings.push({ rule: "relation", relation: r.id, severity: "error", message: `${pattern.name} · ${r.id}: ${message} ${r.why}`, fix, frame, nodeId });

  for (const r of pattern.relations) {
    if (r.waived) {
      findings.push({ rule: "relation", relation: r.id, severity: "note", message: `${pattern.name} · ${r.id} is left out on purpose: ${r.waived} (${r.why})` });
      continue;
    }

    if (r.kind === "alone") {
      const who = onStage(members([r.role]));
      if (who.length === 0) {
        report(r, `Nothing cast as ${r.role} is ever on stage.`, `Cast the object that takes the eye first: score.cast("${r.role}", node).`);
        continue;
      }
      const hit = Math.min(...who.map((id) => seen(id).first));
      const others = members(r.among).filter((id) => inPicture(id, hit));
      if (others.length > 0) {
        report(r, `${quoted(others)} ${others.length > 1 ? "are" : "is"} on stage on frame ${hit}, the frame ${quoted(who.filter((id) => seen(id).first === hit))} shows.`, "Bring the rest in later, or cast what shares the first frame as the lead.", hit, others[0]);
      }
    } else if (r.kind === "once") {
      const needed = onStage(members(r.needs));
      if (needed.length === 0) continue;
      const runs = runsOf(blocks([r.beat]));
      if (runs.length === 0) {
        report(r, `No movement names the ${r.beat} beat, and ${quoted(needed)} still ${needed.length > 1 ? "join" : "joins"}.`, `Give the move that makes room reason.beat: "${r.beat}" (makeRoom does), or waive this relation with the reason.`);
      } else if (runs.length > 1) {
        report(r, `The ${r.beat} beat moves ${runs.length} times: ${runs.map((run) => `frames ${run.from} to ${run.to}`).join(", ")}.`, "Make room in one move that covers every arrival, or use a pattern in which the line steps aside for each word.", runs[1]!.from);
      }
    } else if (r.kind === "during") {
      const runs = runsOf(blocks([r.beat]));
      if (runs.length === 0) continue;
      const from = runs[0]!.from;
      const to = runs.at(-1)!.to;
      const outside = onStage(members(r.roles)).filter((id) => seen(id).first < from - SLACK_FRAMES || seen(id).first > to + SLACK_FRAMES);
      if (outside.length > 0) {
        const worst = outside[0]!;
        report(r, `${outside.map((id) => `"${label(id)}" first shows on frame ${seen(id).first}`).join(", ")}; the ${r.beat} beat moves from frame ${from} to frame ${to}.`, `Let the ${r.beat} move run until the last arrival has shown, bring the arrivals closer together, or waive this relation with the reason.`, seen(worst).first, worst);
      }
    } else if (r.kind === "last") {
      const point = onStage(members([r.role]));
      if (point.length === 0) {
        if (onStage(members(r.after)).length > 0) report(r, `Nothing cast as ${r.role} is ever on stage.`, `Cast what the shot is about: score.cast("${r.role}", node).`);
        continue;
      }
      const pointAt = Math.max(...point.map(arrives));
      const later = onStage(members(r.after)).filter((id) => arrives(id) > pointAt);
      if (later.length > 0) {
        report(r, `${quoted(later)} ${later.length > 1 ? "arrive" : "arrives"} on frame ${Math.min(...later.map(arrives))}, after the ${r.role} ${quoted(point)} on frame ${pointAt}.`, "Reorder the arrivals so the point comes last, let what trails it arrive with it, or waive this relation with the reason.", Math.min(...later.map(arrives)), later[0]);
      }
    } else if (r.kind === "marked") {
      const point = members([r.role]);
      const others = members(r.against);
      if (point.length === 0 || others.length === 0) continue;
      const moved = blocks([r.beat]).some((m) => point.includes(m.targetId) || cast[m.targetId] === r.role || cast[m.targetId] === "prop");
      const look = (id: string) => {
        const n = byId.get(id)!;
        return n.kind === "text" ? JSON.stringify([n.fill, n.fontFamily, n.fontWeight, n.fontSize]) : n.kind === "frame" ? "" : JSON.stringify(n.fill);
      };
      const plain = new Set(others.map(look));
      const same = point.filter((id) => plain.has(look(id)));
      if (!moved && same.length > 0) {
        report(r, `${quoted(same)} ${same.length > 1 ? "look" : "looks"} like the words around ${same.length > 1 ? "them" : "it"}, and no movement of the ${r.beat} beat singles ${same.length > 1 ? "them" : "it"} out.`, "Mark it: a colour, a face, a size, or a movement on the mark beat (a flicker, a focus, a sweep, a prop). Or waive this relation with the reason.", undefined, same[0]);
      }
    } else if (r.kind === "composed") {
      const who = onStage(members(r.roles));
      if (who.length === 0) continue;
      const region = doc.score.regions[r.region];
      if (!region) {
        report(r, `The composition is declared as the region "${r.region}", and nothing published it.`, `Publish where the finished statement sits: score.regions.${r.region} = its bounds.`);
        continue;
      }
      // Where the building movements leave things, without what the hold and the exit add on top.
      const building = doc.motions.filter((m) => m.reason.beat === undefined || r.beats.includes(m.reason.beat));
      const done = Math.max(0, ...building.filter((m) => m.reason.beat !== undefined).map((m) => m.startFrame + m.durationFrames - 1), ...who.map((id) => seen(id).first));
      const built: MotionDocument = { ...doc, format: { ...doc.format, durationFrames: Math.max(total, done + 1) }, motions: building };
      const states = evaluateAt(built, done);
      const there = who.map((id) => states.get(id)).filter((st): st is NodeState => Boolean(st && st.visible));
      if (there.length === 0) continue;
      const left = Math.min(...there.map((st) => st.x - st.width / 2));
      const right = Math.max(...there.map((st) => st.x + st.width / 2));
      const top = Math.min(...there.map((st) => st.y - st.height / 2));
      const bottom = Math.max(...there.map((st) => st.y + st.height / 2));
      const dx = (left + right) / 2 - (region.x + region.width / 2);
      const dy = (top + bottom) / 2 - (region.y + region.height / 2);
      const allowed = Math.max(2, doc.format.width * COMPOSED_SHARE);
      if (Math.abs(dx) > allowed || Math.abs(dy) > allowed) {
        const off = [Math.abs(dx) > allowed ? `${Math.abs(dx).toFixed(1)} px ${dx > 0 ? "right" : "left"}` : "", Math.abs(dy) > allowed ? `${Math.abs(dy).toFixed(1)} px ${dy > 0 ? "below" : "above"}` : ""].filter(Boolean).join(" and ");
        report(r, `Once every arrival has landed (frame ${done}) the statement sits ${off} of where "${r.region}" was declared.`, "Let the move that makes room end where the composition is, or publish the composition you mean.", Math.min(done, total - 1), who[0]);
      }
    } else {
      const who = onStage(members(r.roles));
      if (who.length < 2) continue;
      const leaving = blocks([r.beat]);
      let reported = false;
      if (leaving.length > 0) {
        const from = Math.min(...leaving.map((m) => m.startFrame));
        const to = Math.min(total - 1, Math.max(...leaving.map((m) => m.startFrame + m.durationFrames - 1)));
        const only: MotionDocument = { ...doc, motions: leaving };
        const frame = (f: number) => {
          const states = evaluateAt(only, f);
          const anchor = states.get(who[0]!)!;
          const rad = (-anchor.rotation * Math.PI) / 180;
          return who.map((id) => {
            const st = states.get(id)!;
            const x = (st.x - anchor.x) / (anchor.scale || 1);
            const y = (st.y - anchor.y) / (anchor.scale || 1);
            return { id, x: x * Math.cos(rad) - y * Math.sin(rad), y: x * Math.sin(rad) + y * Math.cos(rad), visible: st.visible, scale: st.scale / (anchor.scale || 1) };
          });
        };
        const rest = frame(Math.max(0, from));
        search: for (let f = from + 1; f <= to; f++) {
          const now = frame(f);
          for (const [i, a] of now.entries()) {
            const b = rest[i]!;
            // Gone together is together: what has faded out with its carrier has no place left to compare.
            if (!a.visible && !now[0]!.visible) continue;
            if (Math.hypot(a.x - b.x, a.y - b.y) <= AS_ONE_PX && Math.abs(a.scale - b.scale) <= 0.005 && a.visible === now[0]!.visible) continue;
            report(r, `Under the ${r.beat} beat "${label(a.id)}" does not go as "${label(who[0]!)}" does: by frame ${f} they have moved ${Math.hypot(a.x - b.x, a.y - b.y).toFixed(1)} px apart.`, "Move what carries the whole sentence, or give every word the same movement.", f, a.id);
            reported = true;
            break search;
          }
        }
      }
      if (!reported) {
        const gone = who.map((id) => seen(id).last);
        const early = who.filter((_, i) => gone[i]! < Math.max(...gone));
        if (early.length > 0) {
          report(r, `${quoted(early)} ${early.length > 1 ? "are" : "is"} gone after frame ${Math.min(...early.map((id) => seen(id).last))} while the rest stays to frame ${Math.max(...gone)}.`, "Take the sentence off as a whole: one cut, or one movement on what carries it.", Math.min(...early.map((id) => seen(id).last)) + 1, early[0]);
        }
      }
    }
  }
  return findings;
}
