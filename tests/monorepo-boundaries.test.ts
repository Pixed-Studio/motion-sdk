import assert from "node:assert/strict";
import test from "node:test";
import * as corePkg from "@motion-sdk/core";
import {
  buildRemotionFrameElement,
  getRemotionCompositionConfig,
} from "@motion-sdk/remotion/tree";
import * as agentEntryPkg from "motion-sdk";
import { compileToMotionade } from "motion-sdk/compile/motionade";

test("@motion-sdk/core stays strictly target-agnostic (no compiler/adapter exports)", () => {
  assert.equal(typeof corePkg.statementConverge, "function");
  assert.equal(typeof corePkg.createBeatGrid, "function");
  assert.equal("compileToMotionade" in corePkg, false);
  assert.equal("compileToHyperframes" in corePkg, false);
  assert.equal("compileToRemotion" in corePkg, false);
});

test("motion-sdk single-package entry exposes both core behaviors and zero-dep compilers", () => {
  const shot = agentEntryPkg.statementConverge({
    id: "entry_smoke",
    options: { durationSec: 3.0, fps: 30 },
    slots: { headlineLines: ["One install", "Zero friction"] },
  });
  assert.equal(shot.audit().ok, true);
  const out = compileToMotionade(shot.ir);
  assert.ok(out.operations.length > 50);
  assert.ok(out.textView.includes('text="One install"'));
});

test("@motion-sdk/remotion runtime virtual-tree builder evaluates frames without intermediate TSX files", () => {
  const shot = corePkg.statementConverge({
    id: "remotion_runtime_test",
    options: { durationSec: 3.0, fps: 30 },
    slots: { headlineLines: ["Runtime", "Remotion"] },
  });

  const cfg = getRemotionCompositionConfig(shot);
  assert.deepEqual(cfg, {
    id: "remotion_runtime_test",
    width: 1280,
    height: 720,
    fps: 30,
    durationInFrames: 90,
  });

  const h = (type: any, props?: Record<string, unknown> | null, ...children: any[]) => ({
    type,
    props: props ?? {},
    children,
  });

  const treeAtRead = buildRemotionFrameElement(shot.ir, 45, h, "AbsoluteFill");
  assert.equal(treeAtRead.type, "AbsoluteFill");
  const serializedRead = JSON.stringify(treeAtRead);
  assert.ok(serializedRead.includes('"Runtime"'));
  assert.ok(serializedRead.includes('"Remotion"'));

  const treeAtEnd = buildRemotionFrameElement(shot.ir, 89, h, "AbsoluteFill");
  const serializedEnd = JSON.stringify(treeAtEnd);
  assert.ok(serializedEnd.includes("clip_mb_hero_xor"));
});
