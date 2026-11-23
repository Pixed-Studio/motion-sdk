import assert from "node:assert/strict";
import test from "node:test";
import {
  GLEAN_EDITORIAL_THEME,
  VERIDIAN_NOIR_THEME,
  compileToHyperframes,
  compileToMotionade,
  compileToRemotion,
  createBeatGrid,
  createConvergeEmblem,
  createKineticStack,
  defaultBrandEmblemSlots,
  defineShotPrimitive,
  slot,
  statementConverge,
} from "../src/index.ts";

test("Baseline 3-line Glean shot matches 3.0s@30fps beat landmarks and passes semantic audit", () => {
  const shot = statementConverge({
    id: "glean_baseline",
    options: {
      durationSec: 3.0,
      fps: 30,
      theme: GLEAN_EDITORIAL_THEME,
      cueSeconds: [0, 0.6, 1.2],
      convergeAtSec: 2.3334,
    },
    slots: {
      headlineLines: ["Work", "differently", "with AI"],
    },
  });

  assert.deepEqual(shot.ir.annotations.beatFrames, [0, 18, 36]);
  assert.equal(shot.ir.annotations.convergeStartFrame, 70);
  assert.equal(shot.ir.format.durationFrames, 90);

  const report = shot.audit();
  assert.equal(report.ok, true, JSON.stringify(report.findings));
  assert.ok(report.contrastRatio >= 18);
  assert.equal(shot.ir.masks.length, 3);
});

test("Variable-cardinality headline slot adapts cleanly from 2 lines to 4 lines without collision or overflow", () => {
  const twoLines = statementConverge({
    options: { durationSec: 3.0, fps: 30 },
    slots: { headlineLines: ["Think", "beyond limits"] },
  });
  const fourLines = statementConverge({
    options: { durationSec: 3.0, fps: 30 },
    slots: {
      headlineLines: ["Orchestrate", "autonomous", "enterprise", "workflows"],
    },
  });

  assert.equal(twoLines.ir.annotations.beatFrames.length, 2);
  assert.equal(fourLines.ir.annotations.beatFrames.length, 4);

  // 4-line typography automatically scales font down vs 2-line to preserve safe margins
  const font2 = twoLines.ir.nodes.find((n) => n.kind === "text")!;
  const font4 = fourLines.ir.nodes.find((n) => n.kind === "text")!;
  assert.ok(font2.kind === "text" && font4.kind === "text");
  assert.ok(font4.fontSize < font2.fontSize);

  assert.equal(twoLines.audit().ok, true);
  assert.equal(fourLines.audit().ok, true);
});

test("Elastic duration & fps (4.5s @ 60fps) keeps physical transient snap while expanding hold spacing", () => {
  const shot30 = statementConverge({
    options: { durationSec: 3.0, fps: 30 },
    slots: { headlineLines: ["One", "Two", "Three"] },
  });
  const shot60 = statementConverge({
    options: { durationSec: 4.5, fps: 60 },
    slots: { headlineLines: ["One", "Two", "Three"] },
  });

  assert.equal(shot60.ir.format.durationFrames, 270);

  // Slide transient in seconds stays constant (~0.88s), NOT sluggishly stretched 1.5x!
  const slide30 = shot30.ir.motions.find((m) => m.id.endsWith("_slide"))!;
  const slide60 = shot60.ir.motions.find((m) => m.id.endsWith("_slide"))!;
  const sec30 = slide30.durationFrames / 30;
  const sec60 = slide60.durationFrames / 60;
  assert.ok(Math.abs(sec30 - sec60) < 0.04);

  // Beat spacing in seconds expands naturally with longer shot duration
  const gapSec30 = (shot30.ir.annotations.beatFrames[2]! - shot30.ir.annotations.beatFrames[0]!) / 30;
  const gapSec60 = (shot60.ir.annotations.beatFrames[2]! - shot60.ir.annotations.beatFrames[0]!) / 60;
  assert.ok(gapSec60 > gapSec30);
  assert.equal(shot60.audit().ok, true);
});

test("Brand swap + custom polygon emblem lowers boolean overlap masks and compiles across all 3 targets", () => {
  const shot = statementConverge({
    id: "veridian_custom",
    options: {
      durationSec: 3.6,
      fps: 30,
      theme: VERIDIAN_NOIR_THEME,
    },
    slots: {
      headlineLines: ["Autonomous", "by design"],
      emblemHost: {
        id: "hex_host",
        name: "Hexagon Host",
        geometry: { kind: "rounded-polygon", sides: 6, diameter: 640, cornerRadius: 60 },
        outsideFill: { kind: "solid", color: VERIDIAN_NOIR_THEME.brandPrimary },
        waypoints1280: [
          { x: -80, y: 360 },
          { x: 420, y: 120 },
          { x: 640, y: 360 },
        ],
        scaleFrom: 1.15,
        scaleTo: 0.85,
        progressEasing: { kind: "easing", preset: "easeOutCubic" },
      },
      emblemParts: [
        {
          id: "wing_l",
          name: "Left Diamond",
          geometry: { kind: "rounded-polygon", sides: 4, diameter: 300, cornerRadius: 42 },
          outsideFill: { kind: "solid", color: VERIDIAN_NOIR_THEME.accentWarm },
          insideHostFill: { kind: "solid", color: "#FFFFFF" },
          waypoints1280: [
            { x: 200, y: 700 },
            { x: 580, y: 340 },
          ],
          enterDelaySec: 0.15,
          scaleFrom: 1.2,
          scaleTo: 0.9,
          progressEasing: { kind: "easing", preset: "easeOutQuart" },
        },
        {
          id: "wing_r",
          name: "Right Diamond",
          geometry: { kind: "rounded-polygon", sides: 4, diameter: 300, cornerRadius: 42 },
          outsideFill: { kind: "solid", color: VERIDIAN_NOIR_THEME.accentFresh },
          insideHostFill: { kind: "solid", color: "#FFE66D" },
          waypoints1280: [
            { x: 1080, y: 20 },
            { x: 700, y: 380 },
          ],
          enterDelaySec: 0.22,
          scaleFrom: 1.2,
          scaleTo: 0.9,
          progressEasing: { kind: "easing", preset: "easeOutQuart" },
        },
      ],
      overlapRules: [
        {
          id: "diamond_xor",
          name: "Diamond Overlap Lens",
          firstPartId: "wing_l",
          secondPartId: "wing_r",
          intersectionFill: { kind: "solid", color: VERIDIAN_NOIR_THEME.surface },
        },
      ],
    },
  });

  assert.equal(shot.audit().ok, true);

  const mOut = compileToMotionade(shot.ir);
  assert.ok(mOut.operations.some((o) => o.kind === "addShader"));
  assert.equal(
    mOut.operations.filter((o) => o.kind === "addMaskBinding").length,
    3
  );
  assert.ok(mOut.textView.includes("shader #glean_chevron_ribbon_v3"));

  const hfHtml = compileToHyperframes(shot.ir);
  assert.ok(hfHtml.includes('data-composition-id="veridian_custom"'));
  assert.ok(hfHtml.includes("window.__timelines[COMP_ID] = tl"));
  assert.ok(hfHtml.includes('<clipPath id="clip_mb_diamond_xor"'));

  const remotionTsx = compileToRemotion(shot.ir, "VeridianCustomComp");
  assert.ok(remotionTsx.includes("export const VeridianCustomComp: React.FC"));
  assert.ok(remotionTsx.includes("useCurrentFrame()"));
});

test("No-cliff composability: L1 behaviors assemble a brand-new minimal primitive without orbit or bokeh", () => {
  const minimalReveal = defineShotPrimitive({
    name: "minimal-title-badge",
    description: "Minimal kinetic title -> emblem without orbital clutter",
    slots: {
      lines: slot<string, "collection">({ cardinality: "collection", required: true, minItems: 1, description: "Title lines" }),
    },
    compose: ({ id, name, options, slots }: { id: string; name: string; options: { durationSec: number }; slots: { lines: string[] } }) => {
      const schedule = createBeatGrid({ durationSec: options.durationSec, fps: 30, itemCount: slots.lines.length });
      const format = { width: 1280, height: 720, fps: 30, durationFrames: schedule.totalFrames };
      const stack = createKineticStack({
        parentId: "stage_a",
        format,
        theme: GLEAN_EDITORIAL_THEME,
        schedule,
        lines: slots.lines,
      });
      const defEmblem = defaultBrandEmblemSlots(GLEAN_EDITORIAL_THEME);
      const emb = createConvergeEmblem({
        format,
        schedule,
        host: defEmblem.host,
        parts: defEmblem.parts.slice(0, 1),
      });
      return {
        id,
        name,
        format,
        scene: { id: `${id}__s1`, name, durationFrames: schedule.totalFrames, backgroundColor: GLEAN_EDITORIAL_THEME.surface },
        shaders: [],
        nodes: [
          { id: "stage_a", kind: "frame", name: "Stage A", slot: "stage", role: "stage", layer: 1, range: { startFrame: 0, durationFrames: schedule.introEndFrame }, base: { x: 0, y: 0, width: 1280, height: 720 } },
          ...stack.nodes,
          ...emb.nodes,
        ],
        masks: emb.masks,
        motions: [...stack.motions, ...emb.motions],
        annotations: {
          primitiveName: "minimal-title-badge",
          beatFrames: schedule.beatFrames,
          convergeStartFrame: schedule.convergeStartFrame,
          emblemSettleFrame: schedule.emblemSettleFrame,
          focalBounds: stack.focalBounds,
          safeMargin: { x: 100, y: 64 },
        },
      };
    },
    agent: { intent: "Minimalist opener", actions: ["audit"], invariants: [], adaptableAxes: ["lines"] },
  });

  const inst = minimalReveal({ options: { durationSec: 2.8 }, slots: { lines: ["Less noise", "More craft"] } });
  assert.equal(inst.audit().ok, true);
  assert.equal(inst.ir.masks.length, 1);
});
