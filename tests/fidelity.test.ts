import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAt, sampleMotion, statementConverge } from "motion-sdk";
import { REFERENCE_IDS, referenceDocument } from "../examples/reference.ts";

// The atom's default content was measured from the project /reconstruct built. Composed from
// behaviors with no cue given, it has to come back to that project. The limits are what the
// current fit reaches, with a little room; tighten them as the behaviors learn the reference.

const reference = referenceDocument();
const shot = statementConverge({ slots: { lines: ["Work", "differently", "with AI"] } });
const frames = shot.ir.format.durationFrames;

interface Fit {
  maxPx: number;
  meanPx: number;
  maxScale: number;
  hidden: number;
}

function fit(mine: string): Fit {
  const theirs = REFERENCE_IDS[mine]!;
  let maxPx = 0;
  let sum = 0;
  let n = 0;
  let maxScale = 0;
  let hidden = 0;
  for (let f = 0; f < frames; f++) {
    const a = evaluateAt(shot.ir, f).get(mine)!;
    const b = evaluateAt(reference, f).get(theirs)!;
    if (a.visible !== b.visible) hidden++;
    if (!a.visible || !b.visible) continue;
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    maxPx = Math.max(maxPx, d);
    sum += d;
    n++;
    maxScale = Math.max(maxScale, Math.abs(a.scale - b.scale));
  }
  return { maxPx, meanPx: sum / Math.max(1, n), maxScale, hidden };
}

test("every object is on stage on the same frames as in the reference", () => {
  for (const id of Object.keys(REFERENCE_IDS)) assert.equal(fit(id).hidden, 0, id);
});

test("the lines arrive as the reference's do", (t) => {
  for (const id of ["txt_work", "txt_differently", "txt_with_ai"]) {
    const f = fit(id);
    t.diagnostic(`${id}: within ${f.maxPx.toFixed(1)} px`);
    assert.ok(f.maxPx <= 4, `${id} is ${f.maxPx.toFixed(1)} px off`);
  }
});

test("focus leaves the statement on the same frames, by the same amounts", () => {
  for (let f = 0; f < frames; f++) {
    const a = evaluateAt(shot.ir, f).get("statement_world")!;
    const b = evaluateAt(reference, f).get("intro_world")!;
    assert.ok(Math.abs(a.blur - b.blur) < 0.5 && Math.abs(a.opacity - b.opacity) < 0.01, `frame ${f}`);
  }
});

test("the world turns with the reference", (t) => {
  let worst = 0;
  for (let f = 0; f < frames; f++) {
    const a = evaluateAt(shot.ir, f).get("world_ring")!;
    const b = evaluateAt(reference, f).get("midground_orbit_ring")!;
    if (a.visible && b.visible) worst = Math.max(worst, Math.abs(a.rotation - b.rotation));
  }
  t.diagnostic(`ring within ${worst.toFixed(1)}° on every frame`);
  assert.ok(worst <= 22, `the ring is ${worst.toFixed(1)}° off`);
  for (const id of Object.keys(REFERENCE_IDS).filter((k) => k.startsWith("mid_"))) {
    const f = fit(id);
    t.diagnostic(`${id}: mean ${f.meanPx.toFixed(0)} px, worst ${f.maxPx.toFixed(0)} px`);
    assert.ok(f.meanPx <= 55 && f.maxPx <= 135, `${id}: mean ${f.meanPx.toFixed(0)} px, worst ${f.maxPx.toFixed(0)} px`);
  }
});

test("the backdrop snaps round with the reference", (t) => {
  const mine = shot.ir.motions.find((m) => m.id === "act_ribbon_spin")!;
  const theirs = reference.motions.find((m) => m.id === "central_lime_ribbon__spinAngle")!;
  let worst = 0;
  for (let f = 0; f < 79; f++) {
    worst = Math.max(worst, Math.abs((sampleMotion(mine, f, "spinAngle") as number) - (sampleMotion(theirs, f, "spinAngle") as number)));
  }
  t.diagnostic(`ribbon within ${worst.toFixed(1)}°`);
  assert.ok(worst <= 18, `the ribbon is ${worst.toFixed(1)}° off`);
});

test("the mark travels the reference's paths and lands on its seats", (t) => {
  const limits: Record<string, number> = { mark_host: 4, mark_square: 2, mark_triangle: 10 };
  for (const [id, limit] of Object.entries(limits)) {
    const f = fit(id);
    t.diagnostic(`${id}: within ${f.maxPx.toFixed(1)} px, scale within ${f.maxScale.toFixed(3)}`);
    assert.ok(f.maxPx <= limit && f.maxScale <= 0.05, `${id}: ${f.maxPx.toFixed(1)} px, scale ${f.maxScale.toFixed(3)}`);
    const a = evaluateAt(shot.ir, frames - 1).get(id)!;
    const b = evaluateAt(reference, frames - 1).get(REFERENCE_IDS[id]!)!;
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) <= 1, `${id} lands off its seat`);
  }
});
