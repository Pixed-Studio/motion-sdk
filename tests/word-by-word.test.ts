import assert from "node:assert/strict";
import test from "node:test";
import {
  auditMotion,
  evaluateAt,
  gleanEditorial,
  measureText,
  wordByWord,
  type Finding,
  type MotionDocument,
  type Shot,
  type TextNodeIR,
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
  return { left: st.x - st.width / 2, right: st.x + st.width / 2, width: st.width, visible: st.visible };
};
const errors = (findings: Finding[]) => [...new Set(findings.filter((f) => f.severity === "error").map((f) => f.rule))];

// The reference is the Synaps product film, frames 1009 to 1059 at 30 fps, measured frame by frame:
// "Into" lands 3.6 times its size and settles; "a", "complete" and "floor plan" follow from frame 17,
// two frames apart, and the line slides left to keep what has arrived centred.
const reference = () =>
  wordByWord({
    decisions: { accent: "first", durationSec: 1.7, cueSeconds: [0, 0.567] },
    slots: { arrivals: ["Into", { text: "a complete floor plan", key: "floor plan", needsSec: 0.85 }], ambient: [] },
  });

test("the reference's words are first seen on the frames measured from the film", () => {
  const shot = reference();
  const seen = Object.fromEntries(words(shot).map((w) => [w.text, firstSeen(shot, w.id)]));
  assert.deepEqual(seen, { Into: 0, a: 17, complete: 19, "floor plan": 21 });
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
});

test("the lead word falls from 3.6 times its size along the measured curve", () => {
  const shot = reference();
  const lead = words(shot)[0]!;
  const rest = box(shot, lead.id, 40).width;
  const scaleAt = (f: number) => box(shot, lead.id, f).width / rest;
  // Measured heights over the resting height: 3.6 on the cue, 1.97 three frames on, 1.34 after six, at rest by sixteen.
  assert.ok(Math.abs(scaleAt(0) - 3.6) < 0.05, `frame 0: ${scaleAt(0)}`);
  assert.ok(Math.abs(scaleAt(3) - 1.97) < 0.25, `frame 3: ${scaleAt(3)}`);
  assert.ok(Math.abs(scaleAt(6) - 1.34) < 0.12, `frame 6: ${scaleAt(6)}`);
  assert.ok(scaleAt(16) < 1.01, `frame 16: ${scaleAt(16)}`);
});

test("two, three, four and five words: one cue each, all read, nothing restated", () => {
  const copy = ["Plan.", "Build.", "Test.", "Ship.", "Repeat."];
  for (const count of [2, 3, 4, 5]) {
    const shot = wordByWord({ slots: { arrivals: copy.slice(0, count) } });
    assert.equal(cueFrames(shot).length, count);
    assert.equal(shot.audit().ok, true, `${count} words: ${JSON.stringify(shot.audit().findings)}`);
  }
});

test("on a tempo every word lands on the grid, and a change of tempo moves them all", () => {
  const at = (bpm: number) => cueFrames(wordByWord({ decisions: { tempo: { bpm }, accent: "none" }, slots: { arrivals: ["Plan.", "Build.", "Ship."] } }));
  assert.deepEqual(at(120), [0, 15, 30]);
  assert.deepEqual(at(90), [0, 20, 40]);
});

test("an accent that comes first has the stage and starts large; one that comes last stays clear of its neighbours", () => {
  const first = wordByWord({ decisions: { accent: "first" }, slots: { arrivals: ["Meet", "the new editor"] } });
  const lead = words(first)[0]!;
  assert.ok(box(first, lead.id, 0).width / box(first, lead.id, 60).width > 2.5);

  const last = wordByWord({ slots: { arrivals: ["Plan,", "build,", "ship", { text: "together.", key: "together." }] } });
  const [, , ship, together] = words(last) as [TextNodeIR, TextNodeIR, TextNodeIR, TextNodeIR];
  const lands = cueFrames(last).at(-1)!;
  assert.ok(box(last, together.id, lands).width / box(last, together.id, lands + 40).width <= 1.14 + 1e-6);
  for (let f = lands; f < last.ir.format.durationFrames; f++) {
    assert.ok(box(last, together.id, f).left >= box(last, ship.id, f).right, `frame ${f}: the accent runs into the word before it`);
  }
});

test("asking for a large entrance beside other words is answered with the numbers, not silently shrunk", () => {
  const shot = wordByWord({ decisions: { punch: 3 }, slots: { arrivals: ["Plan,", "build,", "ship"] } });
  const note = shot.audit().findings.find((f) => f.rule === "budget" && f.severity === "warning");
  assert.match(note?.message ?? "", /asked to start 3 times its size, but other words are already on its line; it starts 1\.14 times/);
  assert.match(note?.fix ?? "", /accent: "first"/);
});

test("the line keeps whatever has arrived centred, and an anchored line never moves", () => {
  const centred = wordByWord({ decisions: { accent: "none", punch: false }, slots: { arrivals: ["Plan.", "Build.", "Ship."], ambient: [] } });
  const middle = centred.ir.format.width / 2;
  for (const frame of [10, 25, 80]) {
    const seen = words(centred).map((w) => box(centred, w.id, frame)).filter((b) => b.visible);
    const centre = (Math.min(...seen.map((b) => b.left)) + Math.max(...seen.map((b) => b.right))) / 2;
    assert.ok(Math.abs(centre - middle) < 1, `frame ${frame}: what has arrived is centred on ${centre}`);
  }
  const anchored = wordByWord({ decisions: { layout: "anchored", punch: false }, slots: { arrivals: ["Plan.", "Build.", "Ship."] } });
  const first = words(anchored)[0]!;
  assert.equal(box(anchored, first.id, 2).left, box(anchored, first.id, 80).left);
});

test("a long sentence wraps between arrivals before the type shrinks, and stays in the safe area", () => {
  const arrivals = ["We want you", "to express yourself", "your way."];
  const wrapped = wordByWord({ decisions: { durationSec: 4.5 }, slots: { arrivals } });
  const lines = [...new Set(words(wrapped).map((w) => w.base.y))];
  assert.equal(lines.length, 2);
  const secondLine = words(wrapped).filter((w) => w.base.y === lines[1]);
  assert.equal(secondLine[0]!.text, "to", "the break falls between two arrivals");
  assert.equal(wrapped.audit().ok, true, JSON.stringify(wrapped.audit().findings));
  const one = wordByWord({ decisions: { durationSec: 4.5, maxLines: 1 }, slots: { arrivals } });
  assert.ok(words(one)[0]!.fontSize < words(wrapped)[0]!.fontSize);
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

test("60 frames a second keeps the entrances as long in seconds, and the shot says where attention enters and leaves", () => {
  const slow = wordByWord({ decisions: { accent: "first" }, slots: { arrivals: ["Meet", "the new editor"] } });
  const fast = wordByWord({ decisions: { accent: "first", fps: 60 }, slots: { arrivals: ["Meet", "the new editor"] } });
  const punch = (shot: Shot) => shot.ir.motions.find((m) => m.kind === "vec2" && m.property === "scale")!;
  assert.equal(punch(fast).durationFrames, punch(slow).durationFrames * 2);
  assert.equal(slow.handoff.entry?.nodeId, words(slow)[0]!.id);
  assert.ok(slow.handoff.exit && slow.handoff.exit.velocity.x === 0 && slow.handoff.exit.velocity.y === 0);
});

// Break it on purpose.

test("five arrivals in a second: the budget and the crowding are named", () => {
  const report = wordByWord({ decisions: { durationSec: 1 }, slots: { arrivals: ["Plan,", "build,", "test,", "ship,", "repeat."] } }).audit();
  assert.equal(report.ok, false);
  assert.ok(errors(report.findings).includes("budget"), JSON.stringify(report.findings));
  assert.ok(errors(report.findings).includes("attention"));
});

test("a sentence cut off before its last words can be read", () => {
  const report = wordByWord({ decisions: { durationSec: 1.2, cueSeconds: [0, 0.9] }, slots: { arrivals: ["Into", "a complete floor plan"] } }).audit();
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
