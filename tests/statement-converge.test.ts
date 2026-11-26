import assert from "node:assert/strict";
import test from "node:test";
import {
  arrive,
  checkHandoff,
  compileToHyperframes,
  compileToMotionade,
  compileToRemotion,
  createClock,
  defineShot,
  evaluateAt,
  gleanEditorial,
  group,
  place,
  respond,
  slot,
  snappyEditorial,
  solvePhrase,
  stack,
  statementConverge,
  veridianNoir,
} from "motion-sdk";

const REFERENCE = ["Work", "differently", "with AI"];
const FIVE = ["Plan", "build", "test", "ship", "with AI"];
const cues = (shot: { ir: { score: { cues: { name: string; frame: number }[] } } }) =>
  Object.fromEntries(shot.ir.score.cues.map((c) => [c.name, c.frame]));

test("three lines land where the reference's do, with no cue given", () => {
  const shot = statementConverge({ slots: { lines: REFERENCE } });
  assert.deepEqual(cues(shot), { "line-1": 0, "line-2": 18, "line-3": 36, turn: 70, land: 89 });
  assert.equal(shot.ir.format.durationFrames, 90);
  const report = shot.audit();
  assert.equal(report.ok, true, JSON.stringify(report.findings));
});

test("five lines are a run-up and a landing, not the same arrival five times", () => {
  const free = statementConverge({ slots: { lines: FIVE } });
  const frames = free.ir.score.cues.filter((c) => c.name.startsWith("line")).map((c) => c.frame);
  const steps = frames.slice(1).map((f, i) => f - frames[i]!);
  const hold = free.ir.score.subjects[4]!.untilFrame - frames[4]!;
  assert.ok(Math.max(...steps) < hold, `the accent holds ${hold} frames; the run-up steps are ${steps}`);
  const weights = free.ir.score.cues.filter((c) => c.name.startsWith("line")).map((c) => c.weight);
  assert.deepEqual([...weights].sort((a, b) => a - b), weights, "each step answers harder than the one before");
  assert.equal(free.ir.score.cues.find((c) => c.kind === "accent")!.name, "line-5");
  assert.equal(free.audit().ok, true);

  // On a tempo the same decision lands on the grid: an eighth-note run-up, the accent on a whole beat.
  const onBeat = statementConverge({ decisions: { tempo: { bpm: 100 } }, slots: { lines: FIVE } });
  assert.deepEqual(
    onBeat.ir.score.cues.filter((c) => c.name.startsWith("line")).map((c) => c.frame),
    [0, 9, 18, 27, 36]
  );
  assert.equal(onBeat.audit().ok, true, JSON.stringify(onBeat.audit().findings));
});

test("the accent is the author's to move", () => {
  const even = statementConverge({ decisions: { accent: "none" }, slots: { lines: FIVE } });
  const frames = even.ir.score.cues.filter((c) => c.name.startsWith("line")).map((c) => c.frame);
  const steps = frames.slice(1).map((f, i) => f - frames[i]!);
  assert.ok(Math.max(...steps) - Math.min(...steps) <= 1, `even steps, got ${steps}`);
  assert.equal(even.ir.score.cues.some((c) => c.kind === "accent"), false);

  const marked = statementConverge({ decisions: { cueSeconds: [0, 0.6, 1.2] }, slots: { lines: REFERENCE } });
  assert.deepEqual(cues(marked), cues(statementConverge({ slots: { lines: REFERENCE } })));
});

test("a longer shot at another frame rate keeps its transients and spends the time on reading", () => {
  const short = statementConverge({ slots: { lines: REFERENCE } });
  const long = statementConverge({ decisions: { durationSec: 4.5, fps: 60 }, slots: { lines: REFERENCE } });
  const seconds = (shot: typeof short, id: string) => {
    const m = shot.ir.motions.find((x) => x.id === id)!;
    return m.durationFrames / shot.ir.format.fps;
  };
  for (const id of ["act_txt_work_slide", "act_mark_host_travel", "act_statement_world_fade"]) {
    assert.ok(Math.abs(seconds(short, id) - seconds(long, id)) < 0.04, id);
  }
  const reading = (shot: typeof short) => shot.audit().measures.reading.at(-1)!.clearSec;
  assert.ok(reading(long) > reading(short) + 0.3);
  assert.equal(long.audit().ok, true, JSON.stringify(long.audit().findings));
});

test("the world makes room for whatever the statement becomes", () => {
  const wide = statementConverge({ slots: { lines: ["Orchestrate", "autonomous", "enterprise", "workflows"] } });
  const region = wide.ir.score.regions.statement!;
  const clear = Math.max(region.width, region.height) / 2;
  const read = wide.ir.score.subjects[0]!.untilFrame - 1;
  const ring = evaluateAt(wide.ir, read).get("world_ring")!;
  for (const node of wide.ir.nodes.filter((n) => n.slot === "world")) {
    const st = evaluateAt(wide.ir, read).get(node.id)!;
    const distance = Math.hypot(st.x - ring.x, st.y - ring.y);
    assert.ok(distance >= clear, `${node.id} rests ${distance.toFixed(0)} px out; the statement reaches ${clear}`);
  }
  assert.equal(wide.audit().ok, true, JSON.stringify(wide.audit().findings));
});

test("the mark assembles the same way in every format", () => {
  const shares: number[] = [];
  for (const [width, height] of [[1280, 720], [1920, 1080], [1080, 1080], [1080, 1920]] as const) {
    const shot = statementConverge({ decisions: { width, height }, slots: { lines: REFERENCE } });
    const report = shot.audit();
    assert.equal(report.ok, true, `${width}x${height}: ${JSON.stringify(report.findings)}`);
    const at = evaluateAt(shot.ir, shot.ir.score.cues.find((c) => c.name === "land")!.frame);
    const host = at.get("mark_host")!;
    const square = at.get("mark_square")!;
    shares.push((square.x - host.x) / host.width, (square.y - host.y) / host.width, square.width / host.width);
  }
  for (let i = 3; i < shares.length; i++) {
    assert.ok(Math.abs(shares[i]! - shares[i % 3]!) < 0.005, "the square sits on the host the same way");
  }
});

test("lit orbs stay upright however the ring is timed", () => {
  for (const lines of [REFERENCE, FIVE]) {
    const shot = statementConverge({ decisions: { tempo: { bpm: 128 } }, slots: { lines } });
    for (let f = 0; f < shot.ir.format.durationFrames; f++) {
      for (const id of ["mid_blue_big", "mid_blue_small"]) {
        const st = evaluateAt(shot.ir, f).get(id)!;
        if (st.visible) assert.ok(Math.abs(st.rotation) < 0.6, `${id} is turned ${st.rotation}° at frame ${f}`);
      }
    }
  }
});

test("a shot says where attention is at its edges, and a join can be checked", () => {
  const shot = statementConverge({ slots: { lines: REFERENCE } });
  const exit = shot.handoff.exit!;
  assert.equal(exit.nodeId, "mark_host");
  assert.equal(exit.frame, 89);
  assert.equal(exit.color, gleanEditorial.materials.primary.flat);
  assert.deepEqual(checkHandoff(exit, { ...exit, frame: 0 }), []);
  const far = checkHandoff(exit, { ...exit, frame: 0, position: { x: 100, y: 100 }, color: "#FF0000" });
  assert.deepEqual(far.map((m) => m.what), ["position", "color"]);
});

test("one document compiles to three targets", () => {
  const shot = statementConverge({ id: "veridian", decisions: { look: veridianNoir }, slots: { lines: ["Autonomous", "by design"] } });
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));

  const html = compileToHyperframes(shot.ir);
  assert.ok(html.includes('data-composition-id="veridian"'));
  assert.ok(html.includes("window.__timelines[COMP_ID] = tl"));
  // A clip path holds its shape directly: a group inside one clips everything away.
  assert.match(html, /<clipPath id="veridian__clip_[^"]+" clipPathUnits="userSpaceOnUse"><(ellipse|rect|path) /);
  assert.ok(!/<clipPath[^>]*><g/.test(html));
  // Two things HyperFrames' compile step does to a page, found by rendering with its CLI: it
  // rewrites the ids of SVG elements, and it turns an empty canvas into <canvas />.
  assert.ok(!html.includes("getElementById"), "elements are found by attribute, not by id");
  assert.ok(!/<canvas[^>]*><\/canvas>/.test(html), "the shader's canvas is never empty");

  const motionade = compileToMotionade(shot.ir);
  assert.equal(motionade.operations.filter((o) => o.kind === "addMaskBinding").length, 3);
  assert.ok(motionade.operations.some((o) => o.kind === "addShader"));
  assert.ok(motionade.textView.includes('text="Autonomous"'));

  const tsx = compileToRemotion(shot.ir, "Veridian");
  assert.ok(tsx.includes("export const Veridian: React.FC"));
});

test("the same behaviors make a shot that looks nothing like the first", () => {
  // A countdown: numbers arrive on the beat, one bar under them jumps wider on each.
  const countdown = defineShot<{ width?: number; height?: number; fps?: number; durationSec?: number }, { counts: ReturnType<typeof slot.many<string>> }>({
    name: "countdown",
    intent: "Numbers arrive on the beat over one bar that widens with each.",
    slots: { counts: slot.many<string>({ role: "subject", plane: "focal", min: 1, describe: "The counts, in order." }) },
    decisions: { width: "Stage width.", height: "Stage height.", fps: "Frame rate.", durationSec: "Length." },
    whenContentChanges: ["Count: check each number's reading time."],
    stage: { width: 1080, height: 1080, fps: 30, durationSec: 3 },
    compose: (score, { slots }) => {
      const clock = createClock({ fps: 30, durationSec: 3, tempo: { bpm: 120 } });
      const until = score.format.durationFrames;
      const world = group(score, { id: "world", name: "World", slot: "world", layer: 1 });
      const phrase = solvePhrase({
        count: slots.counts.length,
        window: { from: 0, to: until },
        clock,
        accent: "none",
        needFrames: slots.counts.map(() => 9),
        claimFrames: 9,
      });
      const beats = phrase.cues.map((c) => score.cue(c));
      const text = stack(score, slots.counts.map((t) => ({ text: t, needsSec: 0.3 })), { look: gleanEditorial, parentId: world.id });
      arrive(score, text.lines, { on: beats, feel: snappyEditorial, until, from: "below", needsSec: slots.counts.map(() => 0.3) });
      const bar = place(score, {
        id: "bar",
        name: "Bar",
        slot: "bar",
        role: "support",
        parentId: world.id,
        layer: 1,
        shape: { kind: "rounded-rect", width: 80, height: 16, radius: 8 },
        fill: { kind: "solid", color: gleanEditorial.materials.primary.flat },
        center: { x: 200, y: 900 },
      });
      respond(score, bar.id, { property: "move", along: { x: 1, y: 0 } }, {
        feel: snappyEditorial,
        start: 0,
        end: until,
        answers: beats.map((cue) => ({ cue, amount: 180 })),
      });
    },
  });
  const shot = countdown({ slots: { counts: ["3", "2", "1"] } });
  assert.deepEqual(shot.ir.score.cues.map((c) => c.frame), [0, 15, 30]);
  assert.equal(shot.audit().ok, true, JSON.stringify(shot.audit().findings));
  assert.ok(compileToHyperframes(shot.ir).includes("countdown_shot"));
  assert.ok(countdown.describe().includes("The counts, in order."));
});
