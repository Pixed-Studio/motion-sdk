import assert from "node:assert/strict";
import test from "node:test";
import {
  auditMotion,
  brake,
  compileToHyperframes,
  compileToMotionade,
  compileToRemotion,
  declarePattern,
  defineShot,
  drift,
  enter,
  evaluateAt,
  gleanEditorial,
  land,
  launch,
  leadPattern,
  leave,
  makeRoom,
  move,
  place,
  popAndGlide,
  sentence,
  sequence,
  slot,
  snappyEditorial,
  tuneFeel,
  veridianNoir,
  whip,
  wordByWord,
  type Finding,
  type MotionDocument,
  type ScalarMotionIR,
  type Shot,
  type TextNodeIR,
  type Vec2MotionIR,
} from "motion-sdk";

const words = (shot: Shot) => shot.ir.nodes.filter((n): n is TextNodeIR => n.kind === "text");
const word = (shot: Shot, text: string) => words(shot).find((w) => w.text === text)!;
const at = (shot: Shot, id: string, frame: number) => evaluateAt(shot.ir, frame).get(id)!;
const firstSeen = (shot: Shot, id: string) => {
  for (let f = 0; f < shot.ir.format.durationFrames; f++) if (at(shot, id, f).visible) return f;
  return -1;
};
const errors = (findings: Finding[]) => [...new Set(findings.filter((f) => f.severity === "error").map((f) => f.rule))];
const relation = (findings: Finding[], id: string) => findings.find((f) => f.rule === "relation" && f.relation === id);
const broken = (shot: Shot, change: (doc: MotionDocument) => void): Finding[] => {
  const doc: MotionDocument = structuredClone(shot.ir);
  change(doc);
  return auditMotion(doc).findings;
};

// One brief for most of what follows: the opening of a film, stressing one message, at 100 BPM.
type Decisions = NonNullable<Parameters<typeof wordByWord>[0]>["decisions"];
const COPY = ["Know", "what you can spend", { text: "today.", key: true as const }];
const opening = (decisions: Decisions = {}, arrivals: Parameters<typeof wordByWord>[0] extends infer P ? (P extends { slots?: { arrivals?: infer A } } ? A : never) : never = COPY) =>
  wordByWord({ decisions: { tempo: { bpm: 100 }, ...decisions }, slots: { arrivals, ambient: [] } });

// ---------------------------------------------------------------------------------------------
// The pattern is its relations. Roles are on the score, beats are on the movements, and the audit
// checks the relations whoever wrote the motion.
// ---------------------------------------------------------------------------------------------

test("the atom's shot declares the lead pattern, casts its roles, names its beats and passes every relation", () => {
  const shot = opening();
  const { pattern, cast } = shot.ir.score;
  assert.equal(pattern!.name, "lead");
  assert.match(pattern!.intent, /An opening that stresses one message/);
  assert.deepEqual(pattern!.relations.map((r) => r.id), ["alone", "once", "joins", "last", "marked", "composed", "whole"]);
  assert.equal(cast![word(shot, "Know").id], "lead");
  assert.deepEqual(["what", "you", "can", "spend"].map((t) => cast![word(shot, t).id]), ["link", "link", "link", "link"]);
  assert.equal(cast![word(shot, "today.").id], "point");
  assert.equal(cast!.phrase, "camera");
  assert.deepEqual([...new Set(shot.ir.motions.map((m) => m.reason.beat))], ["hit", "join", "room", "hold", "leave"]);
  assert.deepEqual(shot.audit().findings.filter((f) => f.rule === "relation"), []);
  assert.equal(shot.audit().ok, true);
  // No relation names a value, a direction, a curve or a property.
  for (const r of pattern!.relations) assert.deepEqual(Object.keys(r).filter((k) => /sec|px|em|ease|curve|property|angle|scale/i.test(k)), []);
});

test("alone: something else is on stage with the lead when it hits", () => {
  const findings = broken(opening(), (doc) => {
    doc.motions = doc.motions.filter((m) => m.id !== "act_w_what_in");
  });
  assert.match(relation(findings, "alone")!.message, /lead · alone: "what" is on stage on frame 0, the frame "Know" shows\. The lead is alone on stage when it hits\./);
  assert.equal(relation(findings, "alone")!.severity, "error");
});

test("once: a line that steps aside again for a later arrival", () => {
  const findings = broken(opening(), (doc) => {
    const room = doc.motions.find((m) => m.id.endsWith("makes_room")) as Vec2MotionIR;
    doc.motions.push({ ...structuredClone(room), id: "again", startFrame: room.startFrame + room.durationFrames + 6 });
  });
  assert.match(relation(findings, "once")!.message, /The room beat moves 2 times: frames \d+ to \d+, frames \d+ to \d+\. Room is made once/);
});

test("joins: an arrival that shows after room has been made, and the same break declared with its reason", () => {
  const late = opening({ room: { sec: 0.5 } });
  const finding = relation(late.audit().findings, "joins")!;
  assert.equal(late.audit().ok, false);
  assert.match(finding.message, /"today\." first shows on frame 36; the room beat moves from frame \d+ to frame \d+\./);
  assert.match(finding.fix ?? "", /waive this relation with the reason/);
  // Left to the feel, the move is kept under way until the last arrival has shown.
  assert.equal(relation(opening().audit().findings, "joins"), undefined);

  const meant = opening({ room: { sec: 0.5 }, relations: { joins: { none: "the point lands a beat later, into a line already at rest" } } });
  assert.equal(meant.audit().ok, true);
  const note = relation(meant.audit().findings, "joins")!;
  assert.equal(note.severity, "note");
  assert.match(note.message, /lead · joins is left out on purpose: the point lands a beat later/);
  assert.equal(meant.ir.score.pattern!.relations.find((r) => r.id === "joins")!.waived, "the point lands a beat later, into a line already at rest");

  assert.throws(() => opening({ relations: { join: { none: "a typo" } } }), /The lead pattern has no relation "join"\. Its relations: alone, once, joins, last, marked, composed, whole\./);
  assert.throws(() => opening({ relations: { joins: { none: " " } } }), /Relation "joins" is waived without a reason/);
});

test("last: the point is not the last arrival", () => {
  const shot = opening({}, ["Now", { text: "nothing", key: true }, "slips past you."]);
  assert.match(relation(shot.audit().findings, "last")!.message, /"slips", "past", "you\." arrive on frame 36, after the point "nothing" on frame 18\./);
  // A word that trails the point inside its own arrival comes with it.
  assert.equal(relation(opening({}, ["Time", "to", { text: "change it", key: "change" }]).audit().findings, "last"), undefined);
});

test("marked: a point that looks like the words around it", () => {
  const plain = opening({ mark: "none" });
  assert.match(relation(plain.audit().findings, "marked")!.message, /"today\." looks like the words around it, and no movement of the mark beat singles it out\./);
  // A movement on the mark beat marks it as well as a colour does.
  const flicker = opening({ mark: "flicker" });
  assert.equal(word(flicker, "today.").fill.color, word(flicker, "Know").fill.color);
  assert.equal(relation(flicker.audit().findings, "marked"), undefined);
  const waived = opening({ mark: "none", relations: { marked: { none: "the film marks nothing here" } } });
  assert.equal(waived.audit().ok, true);
  assert.equal(relation(waived.audit().findings, "marked")!.severity, "note");
});

test("composed: the composition the pattern names was never published", () => {
  const findings = broken(opening(), (doc) => {
    doc.score.regions = {};
  });
  assert.match(relation(findings, "composed")!.message, /The composition is declared as the region "phrase", and nothing published it\./);
});

test("whole: a word that leaves by itself, and a word that is gone before the rest", () => {
  const shot = opening({ leave: "up" });
  const apart = broken(shot, (doc) => {
    const goes = doc.motions.find((m) => m.id === "act_phrase_goes") as Vec2MotionIR;
    doc.motions.push({ ...structuredClone(goes), id: "today_goes_too", targetId: word(shot, "today.").id });
  });
  assert.match(relation(apart, "whole")!.message, /Under the leave beat "today\." does not go as "Know" does: by frame \d+ they have moved \d+\.\d px apart\. The sentence leaves as one\./);
  const early = broken(shot, (doc) => {
    const fade: ScalarMotionIR = {
      kind: "scalar", id: "know_fades", name: "Know fades", targetId: word(shot, "Know").id, property: "opacity", mode: "set", stage: "out", startFrame: 40, durationFrames: 6, reason: { purpose: "depart" },
      keys: [{ id: "a", frame: 0, value: 1 }, { id: "b", frame: 5, value: 0 }],
    };
    doc.motions.push(fade);
  });
  assert.match(relation(early, "whole")!.message, /"Know" is gone after frame 4\d while the rest stays to frame \d+\./);
});

test("a pattern written from outside: a shot composed by hand from the public pieces declares lead and is held to it", () => {
  const byHand = (wrong?: "late" | "twice") =>
    defineShot<{ width?: number; height?: number; fps?: number; durationSec?: number }, { parts: ReturnType<typeof slot.many<string>> }>({
      name: "by-hand",
      intent: "A lead pattern nobody's atom wrote.",
      slots: { parts: slot.many<string>({ role: "subject", plane: "focal", min: 2, describe: "The sentence in parts; the first is the lead and the last the point." }) },
      decisions: { width: "Stage width.", height: "Stage height.", fps: "Frames per second.", durationSec: "Length in seconds." },
      whenContentChanges: [],
      stage: { width: 1280, height: 720, fps: 30, durationSec: 2.4 },
      compose: (score, { slots }) => {
        const look = veridianNoir;
        score.background = look.surface;
        const s = sentence(score, slots.parts, { look });
        const [lead, ...rest] = slots.parts.map((_, i) => s.wordsOf(i));
        const point = rest.at(-1)!;
        for (const w of point) w.fill = { kind: "solid", color: look.materials.primary.flat };
        score.cast("lead", ...lead!);
        score.cast("link", ...rest.slice(0, -1).flat());
        score.cast("point", ...point);
        const hit = score.cue({ name: "hit", frame: 0, kind: "beat", weight: 1, why: "The lead." });
        const next = score.cue({ name: "next", frame: 14, kind: "accent", weight: 1, why: "The sentence joins." });
        // The lead drops in turned and small, from above; it is not the atom's punch.
        land(score, s.root, { at: 0, cue: hit, scale: 0.7, sec: 0.5, curve: "brake", moves: [{ property: "rotation", from: -6, curve: brake(0.9) }, { property: "position", from: { y: -1.2 } }] });
        for (const w of lead!) enter(score, w, { at: 0, cue: hit });
        rest.flat().forEach((w, i) => enter(score, w, { at: (wrong === "late" ? 40 : 14) + i * 3, cue: next, moves: [{ property: "position", from: { y: 0.8 }, sec: 0.4, curve: "brake" }] }));
        makeRoom(score, s.lines[0]!, { lead: lead!, stand: s.middle, from: 0, next, sec: 0.7, curve: whip(0.7) });
        if (wrong === "twice") move(score, s.lines[0]!, { property: "position", from: { x: 0.5 }, sec: 0.3 }, { at: 40, beat: "room" });
        drift(score, s.root, { from: 0, to: 62, rest: 30, travel: { y: -0.2 }, em: s.set.fontSize });
        leave(score, s.root, { at: 62, sec: 0.33, to: { x: 1.5 }, rotation: 4, curve: launch(0.7) });
        for (const w of s.words.values()) score.subjects.push({ nodeId: w.id, cue: score.roles[w.id] === "lead" ? "hit" : "next", needsSec: 0.4, untilFrame: 62, accent: false });
        declarePattern(score, leadPattern);
      },
    })({ slots: { parts: ["Stop", "guessing your", "budget."] } });

  const shot = byHand();
  assert.equal(shot.ir.score.pattern!.name, "lead");
  assert.deepEqual(shot.audit().findings.filter((f) => f.rule === "relation"), []);
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
  assert.match(relation(byHand("late").audit().findings, "joins")!.message, /"guessing" first shows on frame 40/);
  assert.match(relation(byHand("twice").audit().findings, "once")!.message, /The room beat moves 2 times/);
});

// ---------------------------------------------------------------------------------------------
// Moves are public pieces, and every beat of the atom takes them.
// ---------------------------------------------------------------------------------------------

test("a lead that shrinks and then floats back up: by name, by spec, and by a move that follows the settle", () => {
  const sizes = (shot: Shot) => Array.from({ length: 50 }, (_, f) => at(shot, word(shot, "Know").id, f).scale);
  const named = opening({ settle: "float", hold: "still" });
  const s = sizes(named);
  assert.ok(s[0]! > 3, "it lands large");
  assert.ok(Math.min(...s) < 0.95 && Math.min(...s) > 0.9, `it falls a little past its size: ${Math.min(...s)}`);
  assert.ok(s.indexOf(Math.min(...s)) < 20 && Math.abs(s[45]! - 1) < 0.005, "and floats back up");
  assert.equal(named.audit().ok, true, JSON.stringify(named.audit().findings));

  const deeper = sizes(opening({ settle: { kind: "float", dip: 0.15, floatSec: 0.4 }, hold: "still" }));
  assert.ok(Math.min(...deeper) < 0.86);

  // The same thing written out: what follows once it has settled is a move of the author's.
  const written = opening({ hold: "still", settle: { sec: 0.4, curve: "brake", then: { property: "position", from: { y: 0.2 }, to: { y: 0 }, sec: 0.6, curve: brake(0.4), reason: "It floats back up to its line." } } });
  const float = written.ir.motions.find((m) => m.reason.why === "It floats back up to its line.")!;
  assert.equal(float.reason.beat, "settle");
  assert.equal(float.name, "It floats back up to its line.");
  assert.equal(written.audit().ok, true, JSON.stringify(written.audit().findings));
});

test("the sentence leaves in any direction, and one curve family runs at different speeds", () => {
  const end = (decisions: Decisions) => {
    const shot = opening(decisions);
    const last = shot.ir.format.durationFrames - 1;
    const id = word(shot, "today.").id;
    const rest = shot.audit().measures.hold!.leaveFrame - 1;
    return { dx: at(shot, id, last).x - at(shot, id, rest).x, dy: at(shot, id, last).y - at(shot, id, rest).y, shot };
  };
  assert.ok(end({ leave: "left", hold: "still" }).dx < -60);
  assert.ok(end({ leave: "right", hold: "still" }).dx > 60);
  assert.ok(end({ leave: "up", hold: "still" }).dy < -30);
  assert.ok(end({ leave: "down", hold: "still" }).dy > 30);
  const diagonal = end({ leave: { to: { x: 2, y: -1 } }, hold: "still" });
  assert.ok(diagonal.dx > 100 && diagonal.dy < -50, "any direction");
  // The launch family, quick and slow: the same curve, another speed.
  const quick = end({ leave: { to: { y: -1 }, curve: launch(), sec: 0.2 } }).shot.ir.motions.find((m) => m.id === "act_phrase_goes") as Vec2MotionIR;
  const slow = end({ leave: { to: { y: -1 }, curve: "launch", sec: 0.6 } }).shot.ir.motions.find((m) => m.id === "act_phrase_goes") as Vec2MotionIR;
  assert.deepEqual(quick.keys[0]!.easing, slow.keys[0]!.easing);
  assert.equal(quick.durationFrames, 6);
  assert.equal(slow.durationFrames, 18);
  assert.deepEqual(whip(), { kind: "cubicBezier", x1: 0.84, y1: 0, x2: 0.16, y2: 1 });
  assert.throws(() => opening({ leave: { curve: "woosh" as never } }), /No curve family "woosh"\. Families: brake, launch, whip, even, step/);
});

test("every beat takes a name, a spec, moves, a mix, or a function", () => {
  // Hit as moves: the lead turns and comes down from above; the atom adds nothing of its own.
  const hit = opening({ hit: [{ property: "scale", from: 1.8 }, { property: "rotation", from: -8, on: "lead" }, { property: "position", from: { y: -0.6 }, on: "lead" }], settle: { sec: 0.5, curve: "brake" }, hold: "still" });
  const know = word(hit, "Know").id;
  // It stands in the middle of the stage on the cut: 0.6 em above it, at 1.8 times, is 78 px.
  assert.ok(Math.abs(at(hit, know, 0).scale - 1.8) < 0.01 && Math.abs(at(hit, know, 0).rotation + 8) < 0.01 && Math.abs(at(hit, know, 0).y - (360 - 0.6 * 72 * 1.8)) < 0.5);
  assert.equal(at(hit, know, 30).rotation, 0);
  assert.equal(hit.audit().ok, true, JSON.stringify(hit.audit().findings));

  // Room as moves: a position move with no start is the move that makes room, with the author's time and curve.
  const room = opening({ room: [{ property: "position", sec: 1, curve: whip(0.6) }, { property: "rotation", from: 0, via: [-2], to: 0, on: "lead" }] });
  const made = room.ir.motions.find((m) => m.id.endsWith("makes_room")) as Vec2MotionIR;
  assert.deepEqual(made.keys.find((k) => k.easing?.kind === "cubicBezier")!.easing, whip(0.6));
  assert.equal(room.ir.motions.filter((m) => m.reason.beat === "room").length, 2);

  // Join as a function of the arrival: each comes its own way.
  const join = opening({ hold: "still", join: ({ arrival }) => ({ property: "position", from: arrival === 2 ? { y: -1 } : { x: 0.5 }, sec: 0.4, curve: "brake" }) }, ["Know", "your", { text: "budget.", key: true }]);
  const budget = word(join, "budget.").id;
  assert.ok(at(join, budget, firstSeen(join, budget)).y < at(join, budget, firstSeen(join, budget) + 20).y - 30, "the point drops in");
  const your = word(join, "your").id;
  assert.ok(Math.abs(at(join, your, firstSeen(join, your)).y - at(join, your, firstSeen(join, your) + 20).y) < 1, "the link slides");

  // Hold as moves, counted from the frame the sentence is complete; extra moves on anyone at any beat.
  const hold = opening({ hold: { property: "rotation", to: 1.5 }, extra: [{ on: "ground", beat: "hit", moves: { property: "opacity", from: 0 } }, { on: { word: "spend" }, beat: "join", moves: { property: "scale", from: 1.3, sec: 0.3, curve: "brake" } }] });
  const turn = hold.ir.motions.find((m) => m.reason.beat === "hold" && m.kind === "scalar")!;
  assert.equal(turn.startFrame, hold.audit().measures.hold!.completeFrame);
  assert.ok(hold.ir.motions.some((m) => m.targetId === word(hold, "spend").id && m.kind === "vec2" && m.property === "scale"));

  assert.throws(() => opening({ extra: [{ on: { word: "tomorrow" }, beat: "join", moves: { property: "opacity", from: 0 } }] }), /on: \{ word: "tomorrow" \} and the sentence has no such word/);
});

test("the point's mark: flicker, focus, a colour that sweeps across during the hold, a colour move", () => {
  const flicker = opening({ mark: "flicker" });
  const today = word(flicker, "today.").id;
  const shows = firstSeen(flicker, today);
  const seen = Array.from({ length: 14 }, (_, k) => at(flicker, today, shows + k).opacity);
  assert.ok(seen[0]! < 0.2 && seen[5]! > 0.7 && seen[7]! < 0.4 && seen[13] === 1, `it flickers on: ${seen}`);

  const focus = opening({ mark: ["colour", { kind: "focus", sec: 0.4 }] });
  const id = word(focus, "today.").id;
  assert.ok(at(focus, id, firstSeen(focus, id)).blur > 5 && at(focus, id, firstSeen(focus, id) + 13).blur === 0);
  assert.notEqual(word(focus, "today.").fill.color, word(focus, "Know").fill.color);

  const sweep = opening({ mark: { kind: "sweep", color: "#E8590C", sec: 0.5 }, hold: { sec: 0.8 } });
  const swept = sweep.ir.nodes.find((n) => n.id.endsWith("_swept")) as TextNodeIR;
  const mask = sweep.ir.masks[0]!;
  assert.equal(swept.fill.color, "#E8590C");
  assert.equal(mask.targetObjectId, swept.id);
  const complete = sweep.audit().measures.hold!.completeFrame;
  const cover = (f: number) => at(sweep, mask.sourceObjectId, f).x - at(sweep, swept.id, f).x;
  assert.equal(at(sweep, mask.sourceObjectId, complete - 1).width, 0, "the mask is shut until the sweep starts");
  assert.ok(cover(complete) < -swept.base.width && Math.abs(cover(complete + 16)) < 0.5, "then it crosses the word from the left");
  assert.equal(sweep.audit().ok, true, JSON.stringify(sweep.audit().findings));
  assert.equal(relation(sweep.audit().findings, "marked"), undefined);

  // Colour is a property a move can change; a colour the ground cannot hold is named.
  const turned = opening({ mark: { property: "color", to: "#C2410C", sec: 0.3 } });
  const tid = word(turned, "today.").id;
  assert.equal(at(turned, tid, firstSeen(turned, tid) + 12).color, "#C2410C");
  assert.equal(turned.audit().ok, true, JSON.stringify(turned.audit().findings));
  const faint = opening({ mark: { property: "color", to: "#EDE6DC", sec: 0.3 } });
  assert.match(faint.audit().findings.find((f) => f.rule === "contrast")!.message, /"today\." in #EDE6DC has 1\.\d+:1 contrast against the background/);
});

test("a prop carries an arrival in, then lets go", () => {
  const shot = wordByWord({
    decisions: { tempo: { bpm: 100 }, join: { from: { x: 3, y: 2 }, sec: 0.5, curve: "brake" }, mark: "colour" },
    slots: { arrivals: ["Now", "with", { text: "everyone", key: true }], ambient: [], props: [{ id: "cursor", shape: { kind: "rounded-triangle", width: 0.5, radius: 0.08 }, material: "warm", rides: 3, at: { x: 1, y: 1, dx: 0.15, dy: 0.1 }, rotation: -30 }] },
  });
  const host = word(shot, "everyone").id;
  const shows = firstSeen(shot, host);
  assert.equal(firstSeen(shot, "cursor"), shows, "it shows when the word does");
  // Measured in the line's own space: the hold's slow change of size carries both.
  const gap = (f: number) => ({ x: (at(shot, "cursor", f).x - at(shot, host, f).x) / at(shot, host, f).scale, y: (at(shot, "cursor", f).y - at(shot, host, f).y) / at(shot, host, f).scale });
  for (const f of [shows, shows + 3, shows + 8]) assert.ok(Math.hypot(gap(f).x - gap(shows).x, gap(f).y - gap(shows).y) < 0.01, `frame ${f}: it rides the word exactly`);
  const last = shot.ir.format.durationFrames - 1;
  assert.equal(at(shot, "cursor", last).visible, false, "it has let go and is gone");
  assert.equal(shot.ir.score.cast!.cursor, "prop");
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
  assert.throws(() => wordByWord({ slots: { arrivals: ["a", "b"], props: [{ id: "p", shape: { kind: "ellipse", width: 1 }, rides: 5 }] } }), /Prop "p" rides 5, and the sentence has no such arrival/);
});

test("pattern can be a function: the author brings the sentence on, the shot adds the hold, the exit and the reading", () => {
  const shot = wordByWord({
    decisions: {
      durationSec: 2.4,
      leave: "down",
      pattern: (stage) => {
        // Every word falls into place from above, one every third of a second: no lead, no room.
        const cues = stage.arrivals.map((_, i) => stage.score.cue({ name: `drop-${i + 1}`, frame: i * 10, kind: "beat", weight: 1, why: "A word drops in." }));
        const onset = (w: { arrival: number; order: number }) => cues[w.arrival]!.frame + w.order * 2;
        let landed = 0;
        for (const [w, node] of stage.words) landed = Math.max(landed, enter(stage.score, node, { at: onset(w), cue: cues[w.arrival], moves: [{ property: "position", from: { y: -1.5 }, sec: 0.4, curve: "brake" }] }).rest);
        return { cues, onset, landed };
      },
    },
    slots: { arrivals: ["One", "two", "three."], ambient: [] },
  });
  assert.equal(shot.ir.score.pattern, undefined, "it declared no pattern, so none is checked");
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
  assert.ok(shot.ir.motions.some((m) => m.id === "act_phrase_goes"), "the shot's own exit is there");
  assert.equal(shot.ir.score.subjects.length, 3);
});

test("the generic move: layered properties, chains with then, relative units, and what it reports", () => {
  const shot = defineShot<{ width?: number; height?: number; fps?: number; durationSec?: number }, Record<string, never>>({
    name: "moves",
    intent: "One word, moved by hand.",
    slots: {},
    decisions: { width: "w", height: "h", fps: "fps", durationSec: "sec" },
    whenContentChanges: [],
    stage: { width: 1000, height: 500, fps: 30, durationSec: 3 },
    compose: (score) => {
      const s = sentence(score, ["Hello"], { look: gleanEditorial });
      const node = s.wordsOf(0)[0]!;
      const written = move(
        score,
        node,
        [
          { property: "position", from: { x: 0.1, unit: "stage" }, sec: 0.5, curve: "brake", reason: "It slides in from a tenth of the stage away.", then: { property: "position", to: { y: -1 }, sec: 0.5, delay: 0.2, curve: "even" } },
          { property: "letterSpacing", from: 0.2, sec: 0.5 },
          { property: "opacity", from: 0, sec: 0.2 },
        ],
        { at: 10, beat: "join", stage: "in" }
      );
      assert.equal(written.start, 10);
      assert.equal(written.blocks.length, 3);
    },
  })();
  const node = words(shot)[0]!;
  assert.equal(firstSeen(shot, node.id), 11, "stage in: it does not exist before its first move, and fades up from nothing on frame 10");
  assert.ok(Math.abs(at(shot, node.id, 10).x - at(shot, node.id, 24).x - 100) < 0.01, "a tenth of a 1000 px stage");
  // The chain is one block: it rests, waits its delay, then goes up one em and stays.
  const travel = shot.ir.motions.find((m) => m.kind === "vec2")! as Vec2MotionIR;
  assert.equal(travel.keys.length, 4);
  assert.equal(travel.reason.why, "It slides in from a tenth of the stage away.");
  assert.ok(Math.abs(at(shot, node.id, 24).y - at(shot, node.id, 30).y) < 0.01 && Math.abs(at(shot, node.id, 30).y - at(shot, node.id, 60).y - node.fontSize) < 0.01);
  const spacing = shot.ir.motions.find((m) => m.kind === "scalar" && m.property === "letterSpacing") as ScalarMotionIR;
  assert.ok(Math.abs(spacing.keys[0]!.value - (node.letterSpacing + 0.2 * node.fontSize)) < 0.01 && spacing.keys.at(-1)!.value === node.letterSpacing);
});

test("feels are taste: one number changed at a time", () => {
  const tuned = tuneFeel(popAndGlide, { room: { sec: 0.4 }, leave: { recede: 0.8 } });
  assert.equal(tuned.room.sec, 0.4);
  assert.deepEqual(tuned.room.ease, popAndGlide.room.ease);
  assert.equal(tuned.leave.recede, 0.8);
  assert.equal(tuned.leave.sec, popAndGlide.leave.sec);
  assert.equal(popAndGlide.room.sec, 0.6, "the feel itself is untouched");
  assert.throws(() => tuneFeel(snappyEditorial, { rooom: { sec: 1 } } as never), /A feel has no "rooom"/);
});

// ---------------------------------------------------------------------------------------------
// What the three trial models ran into.
// ---------------------------------------------------------------------------------------------

test("a shot left on every default is told which beats it did not decide; a designed one is not", () => {
  const plain = opening();
  const note = plain.audit().findings.find((f) => f.rule === "undecided")!;
  assert.equal(note.severity, "note");
  assert.equal(plain.audit().ok, true, "a note never fails the audit");
  assert.match(note.message, /Every beat of this shot is the atom's default; it is a starting point, not a design\. Not decided: hit \(now "large"\), settle \(now "fall"\), room \(now "whip"\), join \(now "slide"\), mark \(now "colour"\), hold \(now "out"\), leave \(now "recede"\)\. No intent is written\./);
  const some = opening({ intent: "Make the viewer feel the number is theirs today.", leave: "up", mark: "focus" });
  assert.match(some.audit().findings.find((f) => f.rule === "undecided")!.message, /^Not decided: hit \(now "large"\), settle \(now "fall"\), room \(now "whip"\), join \(now "slide"\), hold \(now "out"\)\.$/);
  const designed = opening({ intent: "Make the viewer feel the number is theirs today.", hit: "large", settle: "float", room: "whip", join: "rise", mark: "flicker", hold: "in", leave: "up" });
  assert.equal(designed.audit().findings.some((f) => f.rule === "undecided"), false);
  assert.equal(designed.ir.score.intent, "Make the viewer feel the number is theirs today.");
});

test("a misspelt decision, slot, pattern or choice is named, with what was meant", () => {
  const make = (params: object) => () => wordByWord({ slots: { arrivals: ["Now", "ship it."] }, ...params } as never);
  assert.throws(make({ decisions: { leav: "up" } }), /\[word-by-word\] Unknown decision "leav" \(did you mean "leave"\?\)\. This shot's decisions: intent, pattern, hit, settle, room, join, mark, hold, leave/);
  assert.throws(make({ decisions: { exit: "whip", enter: "slide" } }), /Unknown decisions "exit" \(now "leave"\), "enter" \(now "join"\)/);
  assert.throws(make({ decisions: { exitt: "wip" } }), /"exitt" \("exit" is now "leave"\)/);
  assert.throws(make({ slots: { arrival: ["Now"] } }), /Unknown slot "arrival" \(did you mean "arrivals"\?\)/);
  assert.throws(make({ decision: {} }), /Unknown parameter "decision" \(did you mean "decisions"\?\)/);
  assert.throws(make({ decisions: { pattern: "cascde" } }), /pattern: "cascde" is not a pattern this shot knows\. It knows "lead" and "cascade"/);
  assert.throws(make({ decisions: { leave: "wip" } }), /leave: "wip" is not a leave this shot knows\. It knows "recede", "left", "right", "up", "down", "cut", "shrink"/);
  assert.throws(make({ decisions: { join: "slid" } }), /join: "slid" is not a join this shot knows/);
});

test("the hold is reported: from the frame the sentence is complete to the frame it starts to leave", () => {
  const fitted = wordByWord({ slots: { arrivals: ["Just", { text: "listen.", key: true }] } });
  const hold = fitted.audit().measures.hold!;
  assert.equal(hold.leaveFrame, fitted.ir.score.cues.find((c) => c.name === "exit")!.frame);
  assert.ok(hold.completeFrame > fitted.ir.score.cues.at(-2)!.frame && hold.sec >= 0.5 && hold.sec < 0.6, JSON.stringify(hold));
  assert.equal(fitted.audit().findings.some((f) => f.rule === "hold"), false);
  // Three seconds on two words: the hold is long, and nothing was still enough for `stills` to see it.
  const long = wordByWord({ decisions: { durationSec: 3 }, slots: { arrivals: ["Just", { text: "listen.", key: true }] } });
  const finding = long.audit().findings.find((f) => f.rule === "hold")!;
  assert.equal(finding.severity, "warning");
  assert.match(finding.message, /The statement is complete on frame \d+ and starts to leave on frame 81: it holds 1\.\d\d s, and all of it reads in about \d\.\d\d s\./);
  assert.match(finding.fix ?? "", /Shorten the shot by up to \d\.\d\d s/);
  assert.deepEqual(long.audit().measures.stills, []);
  // Each word's clear time is also given up to the frame the line starts to leave, beside the time that runs on to the cut.
  const read = fitted.audit().measures.reading.at(-1)!;
  assert.ok(read.clearBeforeLeavingSec! > 0 && read.clearBeforeLeavingSec! < read.clearSec, JSON.stringify(read));
  assert.ok(Math.abs(read.clearSec - read.clearBeforeLeavingSec! - (fitted.ir.format.durationFrames - hold.leaveFrame) / 30) < 0.25);
});

test("a shot's length follows its content, and ends on a beat when there is a tempo", () => {
  const short = wordByWord({ slots: { arrivals: ["Just", { text: "listen.", key: true }] } });
  const long = wordByWord({ slots: { arrivals: ["Now", "nothing slips", "past", { text: "you.", key: true }] } });
  assert.ok(long.ir.format.durationFrames > short.ir.format.durationFrames + 15, `${short.ir.format.durationFrames} then ${long.ir.format.durationFrames}`);
  for (const shot of [short, long]) assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
  const onBeat = opening();
  const beats = onBeat.ir.format.durationFrames / onBeat.ir.format.fps / 0.6;
  assert.ok(Math.abs(beats - Math.round(beats)) < 0.02, `${beats} beats`);
  assert.equal(opening({ durationSec: "fit" }).ir.format.durationFrames, onBeat.ir.format.durationFrames);
  assert.equal(opening({ durationSec: 4 }).ir.format.durationFrames, 120);
  // A longer hold asked for is a longer shot.
  assert.ok(opening({ hold: { scale: -0.1, sec: 1.4 } }).ir.format.durationFrames > onBeat.ir.format.durationFrames);
});

test("things are checked on the frame they show and on the first frame, not only where they rest", () => {
  // A word that slides in from so far that the picture's edge cuts it on its cue frame.
  const cut = opening({ join: { from: { x: 6.5 }, sec: 0.5 } });
  const finding = cut.audit().findings.find((f) => f.rule === "in-frame")!;
  assert.equal(finding.severity, "error");
  assert.match(finding.message, /is cut by the edge of the picture on frame \d+, the frame it shows: it spans x \d+ to 1\d\d\d/);
  const meant = opening({ join: { from: { x: 6.5 }, sec: 0.5 }, crop: { link: "the words come from beyond the edge", point: "the words come from beyond the edge" } });
  assert.equal(meant.audit().findings.some((f) => f.rule === "in-frame"), false);
  // From fully outside the picture is an entrance, not a crop.
  assert.equal(opening({ join: { from: { x: 20 }, sec: 0.5 } }).audit().findings.some((f) => f.rule === "in-frame"), false);

  // A lead sized past the safe area is named on the shot's first frame.
  const wide = opening({ hit: { scale: 6.5 }, hold: "still" });
  assert.match(wide.audit().findings.find((f) => f.rule === "safe-area" && f.frame === 0)!.message, /"Know" is outside the safe area on the shot's first frame/);
  // Left to the atom, the lead stays inside it even while the hold's drift makes the line larger on the cut.
  const tall = wordByWord({ decisions: { width: 1080, height: 1920, fps: 60, tempo: { bpm: 84 } }, slots: { arrivals: ["Hear", "it", { text: "once.", key: true }] } });
  assert.deepEqual(tall.audit().findings.filter((f) => f.rule === "safe-area" || f.rule === "in-frame"), []);

  // A support parked half out of the picture.
  const parked = defineShot<{ width?: number; height?: number; fps?: number; durationSec?: number }, Record<string, never>>({
    name: "parked", intent: "A pill at the edge.", slots: {}, decisions: { width: "w", height: "h", fps: "f", durationSec: "s" }, whenContentChanges: [],
    stage: { width: 1280, height: 720, fps: 30, durationSec: 1 },
    compose: (score) => {
      place(score, { id: "pill", name: "Pill", slot: "world", role: "support", layer: 1, shape: { kind: "rounded-rect", width: 200, height: 60, radius: 30 }, fill: { kind: "solid", color: "#333CEE" }, center: { x: 640, y: 12 } });
    },
  })();
  const support = parked.audit().findings.find((f) => f.rule === "in-frame")!;
  assert.equal(support.severity, "warning");
  assert.match(support.message, /"Pill" is cut by the edge of the picture on frame 0, the frame it shows/);
});

test("type size follows the stage's shorter relative side, and key takes the words or true", () => {
  const size = (width: number, height: number) => words(wordByWord({ decisions: { width, height }, slots: { arrivals: ["Hi", "you"] } }))[0]!.fontSize;
  assert.equal(size(1280, 720), 72);
  assert.equal(size(1920, 1080), 108);
  assert.equal(size(1080, 1920), 60, "a tall stage counts its width");
  const cast = (key: true | string | string[]) => {
    const shot = wordByWord({ slots: { arrivals: ["Hear", { text: "it once.", key }] } });
    return words(shot).filter((w) => shot.ir.score.cast![w.id] === "point").map((w) => w.text);
  };
  assert.deepEqual(cast("once."), ["once."]);
  assert.deepEqual(cast("once"), ["once."], "with or without its punctuation");
  assert.deepEqual(cast(["it", "once"]), ["it", "once."]);
  assert.deepEqual(cast(true), ["it", "once."]);
});

// ---------------------------------------------------------------------------------------------
// Two shots on one timeline.
// ---------------------------------------------------------------------------------------------

test("two shots are joined on one timeline: one document, each audited against its own ground, the join checked", () => {
  const night = wordByWord({ id: "a", name: "Meetings end.", decisions: { look: veridianNoir, leave: { to: { x: -3 }, sec: 0.3 }, durationSec: 1.5, cueSeconds: [0, 0.5] }, slots: { arrivals: ["Meetings", { text: "end.", key: true }], ambient: [] } });
  const day = wordByWord({
    id: "b", name: "The notes are already there.",
    decisions: { pattern: "cascade", layout: "anchored", accent: "none", hit: "plain", entry: "push", join: "pop", stagger: 0, hold: "in", durationSec: 2, cueSeconds: [0] },
    slots: { arrivals: ["The notes are already there."], ambient: [] },
  });
  const film = sequence([night, day], { id: "film", joins: [{ accept: { color: "the look changes with the cut: night to day" } }] });
  assert.deepEqual(film.starts, [0, 45]);
  assert.equal(film.ir.format.durationFrames, 105);
  assert.equal(film.snapshot(10).some((e) => e.label === "Meetings"), true);
  assert.equal(film.snapshot(60).some((e) => e.label === "Meetings"), false);
  assert.equal(film.snapshot(60).some((e) => e.label === "notes"), true);
  const report = film.audit();
  assert.equal(report.shots.length, 2);
  assert.equal(report.ok, true, JSON.stringify(report.findings.filter((f) => f.severity === "error")));
  const join = report.findings.filter((f) => f.rule === "handoff");
  assert.ok(join.some((f) => f.severity === "note" && /Meant: the look changes with the cut/.test(f.message)), JSON.stringify(join));
  assert.ok(join.some((f) => f.severity === "warning" && f.frame === 45), "what was not accepted is still reported, on the joined timeline's frame");
  // Day's dark ink is read against day's own ground in the joined document as well.
  const whole = auditMotion(film.ir);
  assert.deepEqual(whole.findings.filter((f) => f.rule === "contrast"), []);
  assert.ok(whole.measures.contrast! > 4.5);
  // One page plays both.
  const page = compileToHyperframes(film.ir);
  assert.match(page, /data-duration="3.5"/);
  assert.ok(page.includes(">Meetings<") && page.includes(">notes<"));

  const overlapped = sequence([night, day], { joins: [{ overlapSec: 0.3 }] });
  assert.deepEqual(overlapped.starts, [0, 36], "the second comes in on the first one's exit");
  assert.throws(() => sequence([night, wordByWord({ decisions: { fps: 60 }, slots: { arrivals: ["a", "b"] } })]), /Shots on one timeline share a stage and a frame rate/);
});

test("the compilers carry a colour movement and the soundtrack", () => {
  const shot = opening({ mark: { property: "color", to: "#C2410C", sec: 0.3 } });
  const page = compileToHyperframes(shot.ir);
  assert.ok(page.includes('"kind":"color"') && page.includes("ownFill"));
  assert.ok(compileToRemotion(shot.ir, "Opening").includes("sampleColor"));
  const motionade = compileToMotionade(shot.ir);
  assert.ok(motionade.operations.some((op) => op.catalogId === "color"));
  assert.match(motionade.textView, /color custom at=\d+ dur=\d+ color=\[0:#[0-9A-F]{6}/);

  const scored = opening({ audio: { assetId: "music", clipId: "music-1", name: "Music", src: "music.wav", durationMs: 2400, sampleRate: 48000, channels: 2, startFrame: 0, durationFrames: 72, gain: 0.8 } });
  assert.match(compileToHyperframes(scored.ir), /<audio id="[^"]+audio" class="clip" data-start="0" data-duration="2.4" data-track-index="1" data-volume="0.8" src="music.wav"><\/audio>/);
  assert.ok(compileToMotionade(scored.ir).operations.some((op) => op.kind === "addAudioClip"));
  assert.equal(compileToHyperframes(shot.ir).includes("<audio"), false);
});
