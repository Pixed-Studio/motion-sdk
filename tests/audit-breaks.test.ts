import assert from "node:assert/strict";
import test from "node:test";
import { auditMotion, defaultMark, gleanEditorial, statementConverge, type Finding, type MotionDocument } from "motion-sdk";

// Break it on purpose. Each shot below is wrong in one way a viewer would see, and the rule that
// names it must fire. A rule no break can trip is testing nothing.

const REFERENCE = ["Work", "differently", "with AI"];
const rules = (findings: Finding[]) => [...new Set(findings.filter((f) => f.severity === "error").map((f) => f.rule))];
const broken = (change: (doc: MotionDocument) => void): Finding[] => {
  const doc: MotionDocument = structuredClone(statementConverge({ slots: { lines: REFERENCE } }).ir);
  change(doc);
  return auditMotion(doc).findings;
};

test("the unbroken shot has no findings", () => {
  assert.deepEqual(statementConverge({ slots: { lines: REFERENCE } }).audit().findings, []);
});

test("eight lines in two seconds: the budget, the crowding and the unread lines are all named", () => {
  const report = statementConverge({
    decisions: { durationSec: 2 },
    slots: { lines: ["Work", "differently", "with AI", "every", "single", "day", "from", "now"] },
  }).audit();
  assert.equal(report.ok, false);
  assert.deepEqual(rules(report.findings), ["budget", "reading", "attention"]);
  const budget = report.findings.find((f) => f.rule === "budget")!;
  assert.match(budget.message, /needs 2\.53 s and has 1\.10 s/);
  assert.match(budget.fix!, /1\.43 s more/);
});

test("three lines in 1.2 seconds: the last line is not read", () => {
  const report = statementConverge({ decisions: { durationSec: 1.2 }, slots: { lines: REFERENCE } }).audit();
  const unread = report.findings.filter((f) => f.rule === "reading").map((f) => f.nodeId);
  assert.ok(unread.includes("txt_with_ai"), JSON.stringify(report.findings));
});

test("every line on the same frame: no progression", () => {
  const report = statementConverge({ decisions: { cueSeconds: [0, 0, 0] }, slots: { lines: REFERENCE } }).audit();
  assert.ok(rules(report.findings).includes("attention"));
});

test("a shape parked in front of a line: the audit names it", () => {
  const report = statementConverge({
    slots: {
      lines: REFERENCE,
      passes: [
        { id: "blocker", name: "Blocker", shape: "square", size: 520, material: "primary", from: { x: 0.5, y: 0.5 }, path: [{ at: 1, x: 0.01, y: 0 }], on: "accent", blur: 0 },
      ],
    },
  }).audit();
  const last = report.measures.reading.at(-1)!;
  assert.equal(last.blockedBy[0]?.nodeId, "blocker");
  assert.equal(last.clearSec, 0);
  assert.ok(report.findings.some((f) => f.rule === "reading" && f.message.includes('"blocker" covers it')));
});

test("a lit orb left to turn with its ring", () => {
  const findings = broken((doc) => {
    doc.motions = doc.motions.filter((m) => m.id !== "act_mid_blue_big_upright");
  });
  assert.deepEqual(rules(findings), ["upright"]);
});

test("an answer that arrives three frames after its cue", () => {
  const findings = broken((doc) => {
    doc.motions.find((m) => m.id === "act_world_ring_turn")!.startFrame += 3;
  });
  assert.ok(rules(findings).includes("answer"));
  assert.match(findings.find((f) => f.rule === "answer")!.message, /fastest 3 frame\(s\) after "line-2"/);
});

test("an answer that starts cold on a cue it claimed to land on", () => {
  const findings = broken((doc) => {
    const turn = doc.motions.find((m) => m.id === "act_world_ring_turn")!;
    if (turn.kind !== "scalar") throw new Error("expected a scalar track");
    // Flatten the wind-up into line-2: the ring now waits for the cue and then moves.
    const hit = turn.keys.findIndex((k) => k.frame === 18);
    turn.keys[hit]!.value = turn.keys[hit - 1]!.value;
  });
  assert.match(findings.find((f) => f.rule === "answer")!.message, /starts from "line-2" instead of landing on it/);
});

test("a part of the mark seated off its host", () => {
  const mark = defaultMark(gleanEditorial);
  mark.parts[0]!.at = { x: 0.9, y: 0 };
  mark.overlaps = [];
  const report = statementConverge({ slots: { lines: REFERENCE, mark } }).audit();
  assert.deepEqual(rules(report.findings), ["overlap"]);
});

test("two parts whose overlap is coloured but who never cross", () => {
  const mark = defaultMark(gleanEditorial);
  mark.parts[0]!.at = { x: -0.25, y: -0.25 };
  mark.parts[1]!.at = { x: 0.25, y: 0.25 };
  const report = statementConverge({ slots: { lines: REFERENCE, mark } }).audit();
  assert.ok(report.findings.some((f) => f.rule === "overlap" && f.message.includes("needs 3%")));
});

test("a mask that ends before what it clips", () => {
  const findings = broken((doc) => {
    doc.nodes.find((n) => n.role === "mask")!.range!.durationFrames = 5;
  });
  assert.deepEqual(rules(findings), ["mask-cover"]);
});

test("a handoff that names something already gone", () => {
  const findings = broken((doc) => {
    doc.score.handoff.exit!.nodeId = "txt_work";
  });
  assert.deepEqual(rules(findings), ["handoff"]);
});

test("ink too close to the ground", () => {
  const look = { ...gleanEditorial, ink: "#D8D2CA" };
  const report = statementConverge({ decisions: { look }, slots: { lines: REFERENCE } }).audit();
  assert.ok(rules(report.findings).includes("contrast"));
});
