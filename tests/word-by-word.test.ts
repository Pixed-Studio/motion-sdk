import assert from "node:assert/strict";
import test from "node:test";
import {
  auditMotion,
  checkHandoff,
  evaluateAt,
  gleanEditorial,
  measureText,
  popAndGlide,
  wordByWord,
  type Finding,
  type MotionDocument,
  type Shot,
  type TextNodeIR,
  type Vec2MotionIR,
} from "motion-sdk";

const words = (shot: Shot) => shot.ir.nodes.filter((n): n is TextNodeIR => n.kind === "text");
const cueFrames = (shot: Shot) => shot.ir.score.cues.filter((c) => c.name.startsWith("arrival")).map((c) => c.frame);
/** The frame a word is first drawn on. */
const firstSeen = (shot: Shot, id: string) => {
  for (let f = 0; f < shot.ir.format.durationFrames; f++) if (evaluateAt(shot.ir, f).get(id)?.visible) return f;
  return -1;
};
const box = (shot: Shot, id: string, frame: number) => {
  const st = evaluateAt(shot.ir, frame).get(id)!;
  return { left: st.x - st.width / 2, right: st.x + st.width / 2, width: st.width, x: st.x, y: st.y, scale: st.scale, blur: st.blur, visible: st.visible };
};
/** Middle of everything that is on stage at a frame. */
const centreOf = (shot: Shot, frame: number) => {
  const seen = words(shot).map((w) => box(shot, w.id, frame)).filter((b) => b.visible);
  return (Math.min(...seen.map((b) => b.left)) + Math.max(...seen.map((b) => b.right))) / 2;
};
const motion = (shot: Shot, ending: string) => shot.ir.motions.find((m) => m.id.endsWith(ending)) as Vec2MotionIR;
const errors = (findings: Finding[]) => [...new Set(findings.filter((f) => f.severity === "error").map((f) => f.rule))];
/** Everything but the notes an author reads: what a shot left on its defaults is told about. */
const problems = (findings: Finding[]) => findings.filter((f) => f.severity !== "note");
const broken = (shot: Shot, change: (doc: MotionDocument) => void): Finding[] => {
  const doc: MotionDocument = structuredClone(shot.ir);
  change(doc);
  return auditMotion(doc).findings;
};

// ---------------------------------------------------------------------------------------------
// The lead pattern, the default. It was fitted to eight sentences from three launch films (Synaps,
// Lovable, Affinity), each rebuilt as an editable project and measured frame by frame. The numbers
// below are theirs.
// ---------------------------------------------------------------------------------------------

// The Synaps product film, frames 1009 to 1059 at 30 fps: "Into" lands 3.7 times its size and
// settles; "a", "complete" and "floor plan" show on frames 17, 19 and 21 while the lead slides left.
const reference = (decisions: Parameters<typeof wordByWord>[0] extends infer P ? (P extends { decisions?: infer D } ? D : never) : never = {}) =>
  wordByWord({
    decisions: { durationSec: 1.7, cueSeconds: [0, 17 / 30], ...decisions },
    slots: { arrivals: ["Into", { text: "a complete floor\u00a0plan", key: "floor plan", needsSec: 0.85 }], ambient: [] },
  });

test("the reference's words are first seen on the frames measured from the film", () => {
  const shot = reference();
  const seen = Object.fromEntries(words(shot).map((w) => [w.text, firstSeen(shot, w.id)]));
  assert.deepEqual(seen, { Into: 0, a: 17, complete: 19, "floor plan": 21 });
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
});

test("the lead lands large in the middle of the stage and falls to size along the measured curve", () => {
  const shot = reference({ hold: "still", leave: "cut" });
  const lead = words(shot)[0]!;
  // Measured sizes over the resting size: 3.73 on the cut, 1.96 three frames on, 1.34 after six, at rest by twelve.
  assert.ok(Math.abs(box(shot, lead.id, 0).scale - 3.6) < 0.15, `frame 0: ${box(shot, lead.id, 0).scale}`);
  assert.ok(Math.abs(box(shot, lead.id, 3).scale - 1.96) < 0.25, `frame 3: ${box(shot, lead.id, 3).scale}`);
  assert.ok(Math.abs(box(shot, lead.id, 6).scale - 1.34) < 0.12, `frame 6: ${box(shot, lead.id, 6).scale}`);
  assert.ok(box(shot, lead.id, 16).scale < 1.01);
  assert.ok(Math.abs(box(shot, lead.id, 0).x - shot.ir.format.width / 2) < 1, "alone, it is centred");
});

test("the lead makes room in one move whose fastest step starts as the next word shows", () => {
  const shot = reference({ hold: "still", leave: "cut" });
  const room = motion(shot, "makes_room");
  assert.equal(shot.ir.motions.filter((m) => m.id.includes("makes_room")).length, 1, "one move, however many words follow");
  const lead = words(shot)[0]!;
  const rest = box(shot, lead.id, 50).x;
  const travel = box(shot, lead.id, 0).x - rest;
  const left = (f: number) => (box(shot, lead.id, f).x - rest) / travel;
  // Measured: the lead holds for five frames, has 57% of its travel left on frame 17 and 33% a frame later.
  assert.ok(left(5) > 0.995, `frame 5: ${left(5)}`);
  assert.ok(Math.abs(left(17) - 0.57) < 0.1, `frame 17: ${left(17)}`);
  assert.ok(Math.abs(left(18) - 0.33) < 0.1, `frame 18: ${left(18)}`);
  assert.ok(left(29) < 0.005);
  const steps = Array.from({ length: 30 }, (_, f) => left(f) - left(f + 1));
  assert.equal(steps.indexOf(Math.max(...steps)), 17, "its fastest step is the one the next word shows on");
  assert.deepEqual(room.reason, { purpose: "carry", cues: ["arrival-2"], lands: "peak", beat: "room" });
  const answer = shot.audit().measures.answers.find((a) => a.motionId === room.id)!;
  assert.equal(answer.peakOffset, 0);
});

test("later words share one entrance in the moving line, on the curve measured from the film", () => {
  const shot = reference({ hold: "still", leave: "cut", hit: "plain" });
  const [lead, a, complete, floorPlan] = words(shot) as [TextNodeIR, TextNodeIR, TextNodeIR, TextNodeIR];
  // A word's distance from its place, seen from the lead: the line's own slide drops out.
  const off = (w: TextNodeIR, f: number) => box(shot, w.id, f).x - box(shot, lead.id, f).x - (box(shot, w.id, 50).x - box(shot, lead.id, 50).x);
  const from = [a, complete, floorPlan].map((w) => firstSeen(shot, w.id));
  assert.deepEqual(from, [17, 19, 21], "two frames apart");
  // Measured on all three words, as shares of the 96.6 px they show at: 1, 0.73, 0.57, 0.45, 0.36, 0.28, then to rest by 16 frames.
  const measured = [1, 0.726, 0.566, 0.449, 0.359, 0.285];
  const size = a.fontSize;
  for (const [i, w] of [a, complete, floorPlan].entries()) {
    const first = off(w, from[i]!);
    assert.ok(Math.abs(first / size - 1.28) < 0.02, `${w.text} shows 1.28 em to the right of its place: ${first / size}`);
    measured.forEach((share, k) => assert.ok(Math.abs(off(w, from[i]! + k) / first - share) < 0.02, `${w.text} +${k}: ${off(w, from[i]! + k) / first}`));
    assert.ok(Math.abs(off(w, from[i]! + 16)) < 0.5);
  }
});

test("two to five arrivals: one cue each, the lead alone first, the sentence centred at the end", () => {
  const copy = ["Now", "plan,", "build,", "test,", { text: "ship.", key: "ship." }];
  for (const count of [2, 3, 4, 5]) {
    const shot = wordByWord({ slots: { arrivals: [...copy.slice(0, count - 1), copy[4]!] } });
    const report = shot.audit();
    assert.equal(report.ok, true, `${count} arrivals: ${JSON.stringify(report.findings)}`);
    assert.deepEqual(problems(report.findings), [], `${count} arrivals`);
    assert.equal(cueFrames(shot).length, count);
    const middle = shot.ir.format.width / 2;
    const whole = report.measures.hold!.completeFrame + 2;
    assert.equal(words(shot).filter((w) => box(shot, w.id, 2).visible).length, 1, "the lead has the stage to itself");
    assert.ok(Math.abs(centreOf(shot, 2) - middle) < 1);
    assert.ok(Math.abs(centreOf(shot, whole) - middle) < 1.5, `${count} arrivals end centred on ${centreOf(shot, whole)}`);
    assert.equal(shot.ir.score.cues.find((c) => c.kind === "accent")!.name, `arrival-${count}`, "the sentence resolves on its last arrival");
    assert.equal(shot.ir.motions.filter((m) => m.reason.beat === "room").length, 1, "room is made once, however many arrivals follow");
  }
  const alone = wordByWord({ slots: { arrivals: ["Hello."] } });
  assert.equal(alone.audit().ok, true);
  assert.equal(alone.ir.motions.some((m) => m.id.includes("makes_room")), false, "one arrival has nobody to make room for");
});

test("on a tempo every arrival is a whole beat after the one before, whatever the tempo, unless a step says otherwise", () => {
  const at = (bpm: number, more: object = {}) => cueFrames(wordByWord({ decisions: { tempo: { bpm }, ...more }, slots: { arrivals: ["Now", "ship", "it."] } }));
  assert.deepEqual(at(120), [0, 15, 30]);
  assert.deepEqual(at(100), [0, 18, 36]);
  // Slower music is slower words: the step is a beat at any tempo, never a subdivision picked in silence.
  assert.deepEqual(at(84), [0, 21, 43]);
  assert.deepEqual(at(120, { step: 0.5 }), [0, 8, 15]);
  assert.deepEqual(at(84, { step: { sec: 0.5 } }), [0, 15, 30]);
  assert.deepEqual(at(120, { cueBeats: [0, 1, 1.5] }), [0, 15, 23]);
  assert.throws(() => wordByWord({ decisions: { step: 0.5 }, slots: { arrivals: ["Now", "ship", "it."] } }), /step: 0\.5 is in beats and the shot has no tempo/);
  // The Lovable film runs at about 109 BPM: its lead is on one kick and the next arrival on the next.
  const quick = wordByWord({ decisions: { tempo: { bpm: 109 }, feel: popAndGlide }, slots: { arrivals: ["Edit", "in", "place."] } });
  assert.deepEqual(cueFrames(quick), [0, 17, 33]);
  assert.equal(quick.audit().ok, true, JSON.stringify(quick.audit().findings));
  // The move that makes room is kept under way until the last arrival has shown, and is still fastest on the second cue.
  const room = motion(quick, "makes_room");
  assert.ok(room.startFrame + room.durationFrames - 1 >= 33, "it runs until the last arrival shows");
  assert.ok(Math.abs(quick.audit().measures.answers.find((a) => a.motionId === room.id)!.peakOffset) <= 1);
});

test("60 frames a second keeps every transient as long in seconds, and extra length goes to the finished line", () => {
  const make = (decisions: object) => wordByWord({ decisions: { durationSec: 3, ...decisions }, slots: { arrivals: ["Meet", "the new editor"] } });
  const slow = make({});
  const fast = make({ fps: 60 });
  for (const ending of ["phrase_lands", "makes_room", "w_the_join", "phrase_falls_back"]) {
    const a = motion(slow, ending).durationFrames;
    const b = motion(fast, ending).durationFrames;
    assert.ok(Math.abs(b - a * 2) <= 1, `${ending}: ${a} frames at 30, ${b} at 60`);
  }
  const long = make({ durationSec: 5 });
  assert.deepEqual(cueFrames(long), cueFrames(slow), "arrivals do not spread out");
  assert.equal(motion(long, "phrase_falls_back").durationFrames, motion(slow, "phrase_falls_back").durationFrames);
  const drift = (shot: Shot) => motion(shot, "phrase_drifts_size");
  assert.ok(Math.abs(drift(long).keys[0]!.x - drift(long).keys[1]!.x - (drift(slow).keys[0]!.x - drift(slow).keys[1]!.x)) < 1e-3, "a longer shot drifts as far, more slowly");
});

test("the finished line never sits still unless it is told to", () => {
  const moving = wordByWord({ decisions: { durationSec: 3, leave: "cut" }, slots: { arrivals: ["Meet", "the new editor"], ambient: [] } });
  assert.deepEqual(moving.audit().measures.stills, []);
  const still = wordByWord({ decisions: { durationSec: 3, leave: "cut", hold: "still" }, slots: { arrivals: ["Meet", "the new editor"], ambient: [] } });
  assert.ok(still.audit().measures.stills.length > 0);
  // The drift rests where the sentence reads complete: it was set at the size it has on that frame.
  const lead = words(moving)[0]!;
  const sizes = Array.from({ length: 90 }, (_, f) => box(moving, lead.id, f).scale);
  assert.ok(sizes[25]! > 1 && sizes[85]! < 1 && sizes[25]! - sizes[85]! > 0.04, `${sizes[25]} then ${sizes[85]}`);
});

test("a line that leaves is still gaining speed on the last frame, and the handoff carries that speed", () => {
  for (const exit of ["recede", "left", "right", "up", "down", { to: { x: 1.4, y: -0.8 }, curve: "launch" }] as const) {
    const shot = wordByWord({ decisions: { leave: exit }, slots: { arrivals: ["Meet", "the new editor"] } });
    assert.equal(shot.audit().ok, true, `${JSON.stringify(exit)}: ${JSON.stringify(shot.audit().findings)}`);
    const last = shot.ir.format.durationFrames - 1;
    const carrier = shot.handoff.exit!.nodeId;
    const step = (f: number) => Math.hypot(box(shot, carrier, f).x - box(shot, carrier, f - 1).x, box(shot, carrier, f).y - box(shot, carrier, f - 1).y);
    assert.ok(step(last) > step(last - 1) && step(last - 1) > step(last - 2), `${JSON.stringify(exit)} accelerates into the cut`);
    assert.ok(Math.hypot(shot.handoff.exit!.velocity.x, shot.handoff.exit!.velocity.y) > 100, `${JSON.stringify(exit)} hands over its speed`);
    assert.equal(box(shot, carrier, last).visible, true, "it does not fade: the cut removes it");
  }
  const held = wordByWord({ decisions: { leave: "cut", hold: "still" }, slots: { arrivals: ["Meet", "the new editor"] } });
  assert.deepEqual(held.handoff.exit!.velocity, { x: 0, y: 0 });
  assert.equal(held.handoff.entry?.nodeId, words(held)[0]!.id);
});

test("arrivals can come to rest on their cues instead of showing on them", () => {
  // Measured on the Lovable film: two words fly in on the lead's own curve and land on the kick.
  const shot = wordByWord({
    decisions: { feel: popAndGlide, lands: "end", cueSeconds: [0, 29 / 30, 36 / 30], durationSec: 2.2 },
    slots: { arrivals: ["Now", { text: "with", join: { from: { x: 1.3, y: 6.5 } } }, "everyone."] },
  });
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
  const [lead, second] = words(shot) as [TextNodeIR, TextNodeIR];
  const join = motion(shot, "w_with_join");
  assert.equal(join.startFrame + join.durationFrames - 1, 29, "it stops on its cue");
  assert.ok(join.startFrame < 29 - 10, "and showed well before it");
  const room = motion(shot, "makes_room");
  assert.equal(room.startFrame + room.durationFrames - 1, 29, "the lead's move ends with it");
  assert.equal(room.reason.lands, "end");
  assert.ok(box(shot, second.id, 15).y > box(shot, lead.id, 15).y + 100, "from below");
});

test("a lead can keep its size and be swapped for the line on its move's fastest step", () => {
  // Measured on the Lovable film's closing sentence: a large word holds for 18 frames, then is swapped mid-whip.
  const shot = wordByWord({ decisions: { feel: popAndGlide, settle: "swap", hit: { scale: 2.5 }, hold: "still", cueSeconds: [0, 0.6] }, slots: { arrivals: ["Now", "it is your turn"] } });
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
  const [lead, it] = words(shot) as [TextNodeIR, TextNodeIR];
  assert.ok(Math.abs(box(shot, lead.id, 17).scale - 2.5) < 0.01 && Math.abs(box(shot, lead.id, 18).scale - 1) < 0.01);
  // The line's own travel: the swap sits inside its biggest step.
  const lineAt = (f: number) => evaluateAt(shot.ir, f).get("line_1")!.x;
  const steps = Array.from({ length: 40 }, (_, f) => (f === 0 ? 0 : Math.abs(lineAt(f) - lineAt(f - 1))));
  assert.equal(steps.indexOf(Math.max(...steps)), 18, "the swap is on the line's biggest jump, so it is hidden in it");
  assert.equal(firstSeen(shot, it.id), 18 + 3, "what follows starts one stagger after the line-size word");
});

test("a lead that starts small is pushed in until the line has come to rest", () => {
  // Measured on the Affinity film: the line grows from 0.6 of its size for a second, through the second word's arrival.
  const shot = wordByWord({ decisions: { hit: { scale: 0.6 }, join: "pop", stagger: 0, hold: "still" }, slots: { arrivals: ["Acme", { text: "is free", key: "is free" }] } });
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
  const push = motion(shot, "phrase_lands");
  const room = motion(shot, "makes_room");
  assert.equal(push.startFrame + push.durationFrames, room.startFrame + room.durationFrames);
  const [lead, is, free] = words(shot) as [TextNodeIR, TextNodeIR, TextNodeIR];
  assert.equal(firstSeen(shot, is.id), firstSeen(shot, free.id), "the two words pop on together");
  const then = firstSeen(shot, is.id);
  assert.ok(box(shot, is.id, then).scale < 0.99 && Math.abs(box(shot, is.id, then).scale - box(shot, lead.id, then).scale) < 1e-6, "they join at the size the line has then");
});

test("the ground lands with the lead and leaves with the line, by its depth, and is still in between", () => {
  const shot = wordByWord({ decisions: { durationSec: 3, hold: "still" }, slots: { arrivals: ["Meet", "the new editor"], ambient: [{ id: "near", angleDeg: 200, distance: 3, width: 6, depth: 0.5 }, { id: "far", angleDeg: 20, distance: 3, width: 6, depth: 0 }] } });
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
  const scaleOf = (id: string, f: number) => evaluateAt(shot.ir, f).get(id)!.scale;
  const punch = box(shot, words(shot)[0]!.id, 0).scale;
  assert.ok(punch > 3, "the lead starts as large as the safe area allows");
  assert.ok(Math.abs(scaleOf("near", 0) - (1 + (punch - 1) * 0.5)) < 0.01);
  assert.equal(scaleOf("near", 40), 1);
  assert.ok(Math.abs(scaleOf("near", 89) - (1 - (1 - 0.65) * 0.5)) < 0.01);
  assert.equal(scaleOf("far", 0), 1);
  assert.equal(shot.ir.motions.some((m) => m.targetId === "far"), false);
});

test("a large entrance is taken as given; the audit names the crop until the author declares it", () => {
  const make = (more: object) => wordByWord({ decisions: { hit: { scale: 9 }, hold: "still", ...more }, slots: { arrivals: ["Designing", "buildings"] } });
  const shot = make({});
  assert.ok(Math.abs(box(shot, words(shot)[0]!.id, 0).scale - 9) < 0.01);
  const cut = shot.audit().findings.find((f) => f.rule === "in-frame")!;
  assert.equal(cut.severity, "error");
  assert.match(cut.message, /"Designing" is cut by the edge of the picture on frame 0, the frame it shows: it spans x -?\d+ to \d+ and y -?\d+ to \d+ on a 1280×720 stage/);
  assert.match(cut.fix ?? "", /declare the crop with its reason/);
  const meant = make({ crop: { lead: "the cut lands inside the word" } });
  assert.deepEqual(errors(meant.audit().findings), []);
  assert.deepEqual(meant.ir.score.crops, [{ nodeId: words(meant)[0]!.id, why: "the cut lands inside the word" }]);
});

test("a decision of the other pattern is named, not dropped in silence", () => {
  const shot = wordByWord({ decisions: { accent: "none", layout: "anchored" }, slots: { arrivals: ["Plan.", "Build.", "Ship."] } });
  const notes = shot.audit().findings.filter((f) => f.rule === "decision");
  assert.equal(notes.length, 2);
  assert.match(notes[0]!.message, /"accent" is a decision of the cascade pattern and this shot uses the lead pattern/);
  assert.match(notes[0]!.fix ?? "", /pattern: "cascade"/);
  const other = wordByWord({ decisions: { pattern: "cascade", settle: "swap" }, slots: { arrivals: ["Plan.", "Build."] } });
  assert.match(other.audit().findings.find((f) => f.rule === "decision")?.message ?? "", /"settle" is a decision of the lead pattern/);
});

// ---------------------------------------------------------------------------------------------
// The cascade pattern: every arrival takes its own step and shows where it rests.
// ---------------------------------------------------------------------------------------------

test("cascade: two to five words, one cue each, all read", () => {
  const copy = ["Plan.", "Build.", "Test.", "Ship.", "Repeat."];
  for (const count of [2, 3, 4, 5]) {
    const shot = wordByWord({ decisions: { pattern: "cascade" }, slots: { arrivals: copy.slice(0, count) } });
    assert.equal(cueFrames(shot).length, count);
    assert.equal(shot.audit().ok, true, `${count} words: ${JSON.stringify(shot.audit().findings)}`);
  }
});

test("cascade: on a tempo every word lands on the grid, and a change of tempo moves them all", () => {
  const at = (bpm: number) => cueFrames(wordByWord({ decisions: { pattern: "cascade", tempo: { bpm }, accent: "none" }, slots: { arrivals: ["Plan.", "Build.", "Ship."] } }));
  assert.deepEqual(at(120), [0, 15, 30]);
  assert.deepEqual(at(90), [0, 20, 40]);
});

test("cascade: an accent that comes first has the stage and starts large; one that comes last stays clear of its neighbours", () => {
  const first = wordByWord({ decisions: { pattern: "cascade", accent: "first" }, slots: { arrivals: ["Meet", "the new editor"] } });
  const lead = words(first)[0]!;
  assert.ok(box(first, lead.id, 0).width / box(first, lead.id, 60).width > 2.5);

  const last = wordByWord({ decisions: { pattern: "cascade" }, slots: { arrivals: ["Plan,", "build,", "ship", { text: "together.", key: "together." }] } });
  const [, , ship, together] = words(last) as [TextNodeIR, TextNodeIR, TextNodeIR, TextNodeIR];
  const lands = cueFrames(last).at(-1)!;
  assert.ok(box(last, together.id, lands).width / box(last, together.id, lands + 40).width <= 1.14 + 1e-6);
  for (let f = lands; f < last.ir.format.durationFrames; f++) {
    assert.ok(box(last, together.id, f).left >= box(last, ship.id, f).right, `frame ${f}: the accent runs into the word before it`);
  }
});

test("cascade: asking for a large entrance beside other words is answered with the numbers, not silently shrunk", () => {
  const shot = wordByWord({ decisions: { pattern: "cascade", hit: { scale: 3 } }, slots: { arrivals: ["Plan,", "build,", "ship"] } });
  const note = shot.audit().findings.find((f) => f.rule === "budget" && f.severity === "warning");
  assert.match(note?.message ?? "", /asked to start 3 times its size, but other words are already on its line; it starts 1\.14 times/);
  assert.match(note?.fix ?? "", /accent: "first"/);
});

test("cascade: the line keeps whatever has arrived centred, and an anchored line never moves", () => {
  const centred = wordByWord({ decisions: { pattern: "cascade", accent: "none", hit: "plain" }, slots: { arrivals: ["Plan.", "Build.", "Ship."], ambient: [] } });
  const middle = centred.ir.format.width / 2;
  for (const frame of [10, 25, 80]) assert.ok(Math.abs(centreOf(centred, frame) - middle) < 1, `frame ${frame}: what has arrived is centred on ${centreOf(centred, frame)}`);
  const anchored = wordByWord({ decisions: { pattern: "cascade", layout: "anchored", hit: "plain" }, slots: { arrivals: ["Plan.", "Build.", "Ship."] } });
  const first = words(anchored)[0]!;
  assert.equal(box(anchored, first.id, 2).left, box(anchored, first.id, 80).left);
});

test("cascade: 60 frames a second keeps the entrances as long in seconds, and a cut hands over a line at rest", () => {
  const slow = wordByWord({ decisions: { pattern: "cascade", accent: "first" }, slots: { arrivals: ["Meet", "the new editor"] } });
  const fast = wordByWord({ decisions: { pattern: "cascade", accent: "first", fps: 60 }, slots: { arrivals: ["Meet", "the new editor"] } });
  assert.equal(motion(fast, "_punch").durationFrames, motion(slow, "_punch").durationFrames * 2);
  assert.equal(slow.handoff.entry?.nodeId, words(slow)[0]!.id);
  assert.ok(slow.handoff.exit && slow.handoff.exit.velocity.x === 0 && slow.handoff.exit.velocity.y === 0);
});

test("a second line comes in on the speed the first left with: two shots, one join", () => {
  // Measured on the Synaps film's opening: line one whips off to the left, line two pushes in from the right, slowing,
  // and starts about 1.4 times as fast as line one ended.
  const one = wordByWord({
    decisions: { leave: "left", durationSec: 1.4, cueSeconds: [0, 0.47], mark: "none", relations: { marked: { none: "the first line only sets up the second" } } },
    slots: { arrivals: ["Designing", { text: "buildings", needsSec: 0.5 }], ambient: [] },
  });
  const second = (decisions: object) =>
    wordByWord({
      decisions: { pattern: "cascade", layout: "anchored", accent: "none", hit: "plain", entry: "push", leave: "recede", durationSec: 1.6, cueSeconds: [0, 0.3, 0.6], ...decisions },
      slots: { arrivals: ["has always", "been", { text: "hard", key: "hard", needsSec: 0.4 }], ambient: [] },
    });
  const two = second({});
  assert.equal(one.audit().ok, true, JSON.stringify(one.audit().findings));
  assert.equal(two.audit().ok, true, JSON.stringify(two.audit().findings));
  assert.ok(one.handoff.exit!.velocity.x < -500 && two.handoff.entry!.velocity.x < -500, "both travel left at the join");
  const join = checkHandoff(one.handoff.exit, two.handoff.entry).map((m) => m.what);
  assert.deepEqual(join, ["position"], "speed and direction carry across; the place does not, which is the author's to keep");
  const first = words(two)[0]!;
  assert.ok(box(two, first.id, 1).x - box(two, first.id, 38).x > 150, "the line comes from the right");
  // A push from three times as far starts three times as fast: the join then reads as a jolt, and the check says so.
  const jolt = checkHandoff(one.handoff.exit, second({ entry: { em: 11 } }).handoff.entry);
  assert.match(jolt.find((m) => m.what === "speed")?.message ?? "", /The join reads as a stop or a jolt/);
});

// ---------------------------------------------------------------------------------------------
// Setting the type, whatever the pattern.
// ---------------------------------------------------------------------------------------------

test("a long sentence wraps between arrivals before the type shrinks, and stays in the safe area", () => {
  const arrivals = ["We want you", "to express yourself", "your way."];
  for (const pattern of ["lead", "cascade"] as const) {
    const wrapped = wordByWord({ decisions: { pattern, durationSec: 4.5 }, slots: { arrivals } });
    const lines = [...new Set(words(wrapped).map((w) => w.base.y))];
    assert.equal(lines.length, 2);
    const secondLine = words(wrapped).filter((w) => w.base.y === lines[1]);
    assert.equal(secondLine[0]!.text, "to", "the break falls between two arrivals");
    assert.equal(wrapped.audit().ok, true, `${pattern}: ${JSON.stringify(wrapped.audit().findings)}`);
    const one = wordByWord({ decisions: { pattern, durationSec: 4.5, maxLines: 1 }, slots: { arrivals } });
    assert.ok(words(one)[0]!.fontSize < words(wrapped)[0]!.fontSize);
  }
  // A lead whose sentence wraps still starts in the middle of the stage, on both axes, and moves to its line.
  const shot = wordByWord({ decisions: { durationSec: 4.5, hit: "plain", hold: "still" }, slots: { arrivals, ambient: [] } });
  const lead = words(shot).filter((w) => w.base.y === words(shot)[0]!.base.y && firstSeen(shot, w.id) === 0);
  const ys = lead.map((w) => box(shot, w.id, 0).y);
  assert.ok(ys.every((y) => Math.abs(y - shot.ir.format.height / 2) < 1), `lead at ${ys}`);
});

test("words are spaced as the font spaces them", () => {
  // Widths of whole lines in Geist at weight 420, in thousandths of an em, as Chrome measures them.
  const real: Record<string, number> = { "Into a complete floor plan": 11780, "And now it's time for": 9421, "WAVE Totally": 5907 };
  for (const [text, width] of Object.entries(real)) {
    assert.ok(Math.abs(measureText(text, 1000, 0, gleanEditorial.type.metrics) - width) <= 2, text);
  }
  const shot = reference();
  const [, a, complete] = words(shot) as [TextNodeIR, TextNodeIR, TextNodeIR];
  const gap = complete.base.x - (a.base.x + a.base.width);
  const size = a.fontSize;
  const whole = measureText("a complete", size, a.letterSpacing, gleanEditorial.type.metrics);
  assert.ok(Math.abs(a.base.width + gap + complete.base.width - whole) < 0.05, `${a.base.width} + ${gap} + ${complete.base.width} against ${whole}`);
});

// ---------------------------------------------------------------------------------------------
// Break it on purpose. Each shot below is wrong in one way a viewer would see.
// ---------------------------------------------------------------------------------------------

test("a make-room move that peaks three frames after the word it should throw the eye to", () => {
  const findings = broken(reference(), (doc) => {
    doc.motions.find((m) => m.id.endsWith("makes_room"))!.startFrame += 3;
  });
  assert.ok(errors(findings).includes("answer"));
  assert.match(findings.find((f) => f.rule === "answer")!.message, /makes room" is fastest 3 frame\(s\) after "arrival-2"/);
});

test("a word set off its place: the sentence is no longer centred when it is whole", () => {
  const findings = broken(reference(), (doc) => {
    doc.nodes.find((n) => n.id === "w_floor_plan")!.base.x += 40;
  });
  assert.deepEqual(errors(findings), ["centred", "relation"]);
  assert.match(findings.find((f) => f.rule === "centred")!.message, /sits 20\.\d px right of x 640\. Once every word has landed the sentence is centred/);
  assert.match(findings.find((f) => f.relation === "composed")!.message, /lead · composed: Once every arrival has landed \(frame \d+\) the statement sits (19|20)\.\d px right of where "phrase" was declared/);
  const lead = broken(reference(), (doc) => {
    doc.motions = doc.motions.filter((m) => !m.id.endsWith("makes_room"));
  });
  assert.match(lead.find((f) => f.rule === "centred")!.message, /left of x 640\. The lead has the stage to itself/);
  assert.match(lead.find((f) => f.relation === "once")!.message, /No movement names the room beat/);
});

test("a word sent in across its neighbour", () => {
  const shot = wordByWord({ slots: { arrivals: ["Now", "ship", { text: "it.", join: { from: { x: -3, y: 0 } } }] } });
  const report = shot.audit();
  assert.deepEqual(errors(report.findings), ["apart"]);
  assert.match(report.findings.find((f) => f.rule === "apart")!.message, /"w_ship" and "w_it" are drawn over one another for \d+ frame\(s\)/);
});

test("a long-tailed ease declared to land on its cue has landed long before it", () => {
  // An exponential glide is nine tenths done in a third of its time: it cannot hit a beat by landing.
  const report = wordByWord({
    decisions: { lands: "end", join: { from: { x: 1.3, y: 0 }, sec: 0.67, curve: { kind: "easing", preset: "easeOutExpo" } } },
    slots: { arrivals: ["Now", "ship", "it."] },
  }).audit();
  assert.deepEqual(errors(report.findings), ["answer"]);
  assert.match(report.findings.find((f) => f.rule === "answer")!.message, /comes to rest \d+ frame\(s\) before "arrival-2" \(frame \d+\); it declared it lands there, and a landing more than 5 frame\(s\) ahead reads early/);
  const late = broken(wordByWord({ decisions: { lands: "end", feel: popAndGlide, join: { from: { x: 2, y: 0 }, curve: "even" } }, slots: { arrivals: ["Now", "ship", "it."] } }), (doc) => {
    doc.motions.find((m) => m.id === "act_w_ship_join")!.startFrame += 4;
  });
  assert.match(late.find((f) => f.rule === "answer")!.message, /comes to rest 4 frame\(s\) after "arrival-2"/);
});

test("a shot that starts to leave before the sentence is whole", () => {
  const report = wordByWord({ decisions: { durationSec: 1.2 }, slots: { arrivals: ["Into", "a complete floor plan"] } }).audit();
  assert.equal(report.ok, false);
  const budget = report.findings.find((f) => f.rule === "budget")!;
  assert.match(budget.message, /has come to rest 1\.17 s after the lead shows, and the line starts to leave after 0\.90 s/);
  assert.match(budget.fix!, /0\.27 s more/);
  assert.ok(errors(report.findings).includes("reading"));
});

test("a lead with too little time alone: its move is shortened, and the note has the numbers", () => {
  const shot = wordByWord({ decisions: { cueSeconds: [0, 0.2] }, slots: { arrivals: ["Now", "ship it."] } });
  const note = shot.audit().findings.find((f) => f.rule === "budget")!;
  assert.equal(note.severity, "warning");
  assert.match(note.message, /The lead has 0\.20 s before the next arrival, and its move to make room takes 0\.80 s, 0\.37 s of it before that arrival\. The move is shortened to 0\.\d\d s/);
  assert.equal(shot.audit().measures.answers.find((a) => a.motionId.endsWith("makes_room"))!.peakOffset, 0, "and it is still fastest on the cue");
});

test("cascade: five arrivals in a second: the budget and the crowding are named", () => {
  const report = wordByWord({ decisions: { pattern: "cascade", durationSec: 1 }, slots: { arrivals: ["Plan,", "build,", "test,", "ship,", "repeat."] } }).audit();
  assert.equal(report.ok, false);
  assert.ok(errors(report.findings).includes("budget"), JSON.stringify(report.findings));
  assert.ok(errors(report.findings).includes("attention"));
});

test("a sentence cut off before its last words can be read", () => {
  const report = wordByWord({ decisions: { durationSec: 1.2, leave: "cut", cueSeconds: [0, 0.9] }, slots: { arrivals: ["Into", "a complete floor plan"] } }).audit();
  const unread = report.findings.filter((f) => f.rule === "reading").map((f) => f.nodeId);
  assert.ok(unread.includes("w_plan"), JSON.stringify(report.findings));
});

test("a ground the ink cannot hold: the audit names what is behind the words", () => {
  const report = wordByWord({
    decisions: { look: { ...gleanEditorial, backdrop: "#222222" } },
    slots: { arrivals: ["Plan.", "Build."], ambient: [{ id: "wall", angleDeg: 0, distance: 0, width: 14, height: 6, opacity: 1 }] },
  }).audit();
  const blocked = report.measures.reading.flatMap((m) => m.blockedBy.map((b) => b.nodeId));
  assert.ok(errors(report.findings).includes("reading") && blocked.includes("wall"), JSON.stringify(report.findings));
});

test("words that share a cue are one arrival; the same words on cues of their own, as close, are crowded", () => {
  const shot = reference();
  assert.deepEqual(errors(shot.audit().findings), []);
  const doc: MotionDocument = structuredClone(shot.ir);
  const second = doc.score.cues.find((c) => c.name === "arrival-2")!;
  doc.score.cues.push({ ...second, name: "arrival-3", frame: second.frame + 2 });
  doc.score.subjects.at(-1)!.cue = "arrival-3";
  assert.ok(errors(auditMotion(doc).findings).includes("attention"));
});
