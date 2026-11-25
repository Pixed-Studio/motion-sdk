import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  estimateTextBox,
  type EasingSpec,
  type FillSpec,
  type MotionBlockIR,
  type MotionDocument,
  type SceneNodeIR,
} from "motion-sdk";
import { CHEVRON_RIBBON_CANVAS } from "motion-sdk/atoms/statement-converge";

const here = path.dirname(fileURLToPath(import.meta.url));

/** The reference's ids for the objects the atom's default content was measured from. */
export const REFERENCE_IDS: Record<string, string> = {
  statement_world: "intro_world",
  world_ring: "midground_orbit_ring",
  txt_work: "txt_work",
  txt_differently: "txt_differently",
  txt_with_ai: "txt_with_ai",
  mid_blue_big: "mid_blue_big",
  mid_tri_big: "mid_tri_big",
  mid_tri_small: "mid_tri_small",
  mid_blue_small: "mid_blue_small",
  mid_warm_tiny: "mid_peach_tiny",
  mid_warm_big: "mid_peach_big",
  mid_warm_med: "mid_peach_med",
  mark_host: "hero_blue_circle",
  mark_square: "hero_out_sq",
  mark_triangle: "hero_out_tri",
};

const timing = (t: any): EasingSpec | undefined =>
  !t
    ? undefined
    : t.kind === "easing"
      ? { kind: "easing", preset: t.preset }
      : t.kind === "cubicBezier"
        ? { kind: "cubicBezier", x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2 }
        : { kind: t.kind };

function fill(style: any): FillSpec {
  const f = style?.primaryFill;
  if (!f) return { kind: "none" };
  if (f.kind === "solid") return { kind: "solid", color: f.color };
  if (f.type === "linear") return { kind: "linear", angleDeg: f.angle, stops: f.stops };
  return { kind: "radial", domain: { x: f.domain.x, y: f.domain.y, width: f.domain.width, height: f.domain.height }, stops: f.stops };
}

/**
 * Reads the project `/reconstruct` built from the Glean opening (the 138 accepted operations)
 * into a motion document, unchanged. It is the measure the atom's own output is held against,
 * and it renders through the same targets, so the two can be looked at side by side.
 */
export function referenceDocument(): MotionDocument {
  const ops: any[] = JSON.parse(fs.readFileSync(path.join(here, "glean-reference/all_accepted_operations.json"), "utf8"));
  const nodes = new Map<string, SceneNodeIR>();
  const motions: MotionBlockIR[] = [];
  const doc: MotionDocument = {
    id: "glean_reference",
    name: "Glean opening as reconstructed",
    format: { width: 1280, height: 720, fps: 30, durationFrames: 90 },
    scene: { id: "scene-1", name: "", durationFrames: 90, backgroundColor: "#FFFFFF" },
    shaders: [],
    nodes: [],
    masks: [],
    motions,
    score: {
      shot: "reference",
      cues: [],
      subjects: [],
      claimFrames: 9,
      regions: {},
      safeArea: { x: 0, y: 0, width: 1280, height: 720 },
      invariants: [],
      handoff: {},
      notes: [],
    },
  };
  const reason = { purpose: "keep" as const };
  let order = 0;

  for (const op of ops) {
    if (op.kind === "updateSceneName") doc.scene.name = op.name;
    else if (op.kind === "setSceneBackgroundFill") doc.scene.backgroundColor = op.background.color;
    else if (op.kind === "addObject") {
      const o = op.object;
      const common = { id: o.id, name: o.name, slot: "reference", parentId: o.parentId, layer: o.layer ?? 100 + order++, range: o.range };
      if (o.kind === "frame") {
        nodes.set(o.id, { ...common, kind: "frame", role: "group", base: { ...o.base } });
      } else if (o.kind === "text") {
        const box = estimateTextBox(o.content.design.text, o.style.fontSize, o.style.letterSpacing);
        nodes.set(o.id, {
          ...common,
          kind: "text",
          role: "subject",
          base: { x: o.base.x - box.width / 2, y: o.base.y, width: box.width, height: box.height },
          text: o.content.design.text,
          fontFamily: o.style.fontFamily,
          fontSize: o.style.fontSize,
          fontWeight: o.style.fontWeight,
          letterSpacing: o.style.letterSpacing,
          textAlign: "center",
          fill: { kind: "solid", color: o.style.primaryFill.color },
        });
      } else {
        nodes.set(o.id, {
          ...common,
          kind: "shape",
          role: "support",
          base: { ...o.base, blur: o.style?.blur },
          shape: o.content.shape,
          borderRadius: o.style?.borderRadius,
          fill: fill(o.style),
        });
      }
    } else if (op.kind === "addVectorNetwork") {
      const closed = op.network.renderContours?.[0]?.closed ?? false;
      const xs = op.network.vertices.map((v: any) => v.x);
      const ys = op.network.vertices.map((v: any) => v.y);
      nodes.set(op.objectId, {
        id: op.objectId,
        name: op.name,
        slot: "reference",
        role: closed ? "support" : "guide",
        parentId: op.parentId,
        layer: 100 + order++,
        kind: "path",
        base: { x: op.x, y: op.y, width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) },
        network: { vertices: op.network.vertices, segments: op.network.segments, closed, trailName: closed ? "Edge" : "Path" },
        fill: fill(op.style),
      });
    } else if (op.kind === "updateObjectBase") Object.assign(nodes.get(op.objectId)!.base, op.base);
    else if (op.kind === "setObjectLayer") nodes.get(op.objectId)!.layer = op.layer;
    else if (op.kind === "setObjectRange") nodes.get(op.objectId)!.range = op.range;
    else if (op.kind === "addMaskBinding") {
      doc.masks.push(op.binding);
      nodes.get(op.binding.sourceObjectId)!.role = "mask";
    } else if (op.kind === "addShader") {
      const s = op.shader;
      doc.shaders.push({ id: s.definitionId, version: 1, name: s.name, description: s.description, cost: "light", sksl: s.sksl, canvas2d: CHEVRON_RIBBON_CANVAS, properties: [] });
      const params: Record<string, number | string> = {};
      for (const p of s.properties ?? []) params[p.id === "limeColor" ? "color" : p.id] = p.defaultValue?.value ?? p.defaultValue;
      const node = nodes.get(op.objectId)!;
      if (node.kind === "shape") node.fill = { kind: "shader", shaderId: s.definitionId, placementId: op.placementId, params };
    } else if (op.kind === "keyShaderProperty") {
      const node = nodes.get(op.objectId)!;
      const shaderId = node.kind === "shape" && node.fill.kind === "shader" ? node.fill.shaderId : "";
      const keys = op.keys.map((k: any, i: number) => ({ id: `${op.propertyId}_k${i}`, frame: k.frame, value: k.value.value, easing: timing(k.outgoingTiming) }));
      motions.push({
        kind: "shaderParams",
        id: `${op.objectId}__${op.propertyId}`,
        name: op.propertyId,
        targetId: op.objectId,
        shaderId,
        placementId: op.placementId,
        startFrame: 0,
        durationFrames: keys[keys.length - 1].frame + 1,
        reason,
        tracks: { [op.propertyId]: keys },
      });
    } else if (op.kind === "materializeActionFacets") {
      const meta = op.action.blockMetadata;
      const keys = op.facets[0].primitive.value.keys;
      const block = { id: meta.id, name: meta.name, targetId: meta.target.objectId, startFrame: meta.timing.startFrame, durationFrames: meta.timing.durationFrames, stage: meta.stage, reason };
      if (op.catalogId === "move" || op.catalogId === "scale") {
        motions.push({
          ...block,
          kind: "vec2",
          property: op.catalogId,
          mode: op.catalogId === "move" ? "add" : "multiply",
          keys: keys.map((k: any) => ({ id: k.id, frame: k.frame, x: k.value.x ?? k.value.scaleX, y: k.value.y ?? k.value.scaleY, easing: timing(k.outgoingTiming) })),
        });
      } else {
        motions.push({
          ...block,
          kind: "scalar",
          property: op.catalogId,
          mode: op.catalogId === "rotation" ? "add" : "set",
          post: "hold",
          keys: keys.map((k: any) => ({ id: k.id, frame: k.frame, value: k.value, easing: timing(k.outgoingTiming) })),
        });
      }
    } else if (op.kind === "addFollowPath") {
      motions.push({
        kind: "followPath",
        id: op.ids.motionBlockId,
        name: "Follow path",
        targetId: op.followerObjectId,
        guidePathId: op.guidePathObjectId,
        orientToPath: false,
        stage: "custom",
        startFrame: op.timing.startFrame,
        durationFrames: op.timing.durationFrames,
        progressEasing: { kind: "linear" },
        reason,
      });
    } else if (op.kind === "updateMotionSegmentTiming") {
      const m = motions.find((x) => x.id === op.motionBlockId);
      if (m && m.kind === "followPath") m.progressEasing = timing(op.timing)!;
    }
  }
  doc.nodes = [...nodes.values()];
  return doc;
}
