import {
  roundedPolygonNetwork,
  roundedTriangleNetwork,
  waypointsToSmoothGuideNetwork,
  type Point2D,
} from "../kernel/geometry.ts";
import type {
  FillSpec,
  MaskBindingIR,
  MotionBlockIR,
  MotionFormat,
  SceneNodeIR,
} from "../kernel/ir.ts";
import type { EasingSpec } from "../kernel/tokens.ts";
import type { BeatGridSchedule } from "./beat-grid.ts";

/**
 * L1 Behavior Part A: Stage-Wide Focus Pull Exit.
 */
export function createFocusPull(opts: {
  targetStageId: string;
  schedule: BeatGridSchedule;
  peakBlur?: number;
}): MotionBlockIR[] {
  const blurEnd = Math.max(opts.schedule.focusPullStartFrame + 4, opts.schedule.introEndFrame - 2);
  const peakBlur = opts.peakBlur ?? 42;
  const midBlurF = Math.round((opts.schedule.focusPullStartFrame + blurEnd) / 2);
  const fadeDur = Math.max(3, opts.schedule.introEndFrame - opts.schedule.introFadeStartFrame);

  return [
    {
      kind: "scalar",
      id: "act_intro_blur",
      name: "Focus pull blur out",
      targetId: opts.targetStageId,
      property: "layerBlur",
      mode: "set",
      stage: "custom",
      startFrame: 0,
      durationFrames: blurEnd + 1,
      post: "hold",
      keys: [
        { id: "intro_blur_k0", frame: 0, value: 0, easing: { kind: "hold" } },
        {
          id: "intro_blur_k1",
          frame: opts.schedule.focusPullStartFrame,
          value: 0,
          easing: { kind: "easing", preset: "easeInQuad" },
        },
        {
          id: "intro_blur_k2",
          frame: midBlurF,
          value: Math.round(peakBlur * 0.33),
          easing: { kind: "easing", preset: "easeInQuad" },
        },
        { id: "intro_blur_k3", frame: blurEnd, value: peakBlur },
      ],
    },
    {
      kind: "scalar",
      id: "act_intro_fade_out",
      name: "Fade out intro world",
      targetId: opts.targetStageId,
      property: "opacity",
      mode: "set",
      stage: "out",
      startFrame: opts.schedule.introFadeStartFrame,
      durationFrames: fadeDur,
      keys: [
        {
          id: "intro_out_k0",
          frame: 0,
          value: 1,
          easing: { kind: "easing", preset: "easeInQuad" },
        },
        { id: "intro_out_k1", frame: fadeDur - 1, value: 0 },
      ],
    },
  ];
}

export type EmblemGeometrySpec =
  | { kind: "ellipse"; width: number; height: number }
  | { kind: "rounded-rect"; width: number; height: number; borderRadius: number }
  | { kind: "rounded-triangle"; width: number; cornerRadius: number; originY?: number }
  | { kind: "rounded-polygon"; sides: number; diameter: number; cornerRadius: number };

export interface EmblemPieceSlotItem {
  id: string;
  name: string;
  geometry: EmblemGeometrySpec;
  /** Fill when outside the host emblem container */
  outsideFill: FillSpec;
  /** Optional fill when inside the host emblem container (triggers automatic vector mask lowering!) */
  insideHostFill?: FillSpec;
  /** Waypoints normalized to 1280×720 reference canvas (automatically scaled to any format) */
  waypoints1280: Point2D[];
  /** Entry delay in seconds after `convergeStartFrame` */
  enterDelaySec?: number;
  initialRotation?: number;
  spinDeltaDeg?: number;
  scaleFrom: number;
  scaleMid?: number;
  scaleTo: number;
  progressEasing: EasingSpec;
}

export interface PairwiseOverlapRule {
  id: string;
  name: string;
  firstPartId: string;
  secondPartId: string;
  intersectionFill: FillSpec;
}

export interface ConvergeEmblemOptions {
  format: MotionFormat;
  schedule: BeatGridSchedule;
  host: EmblemPieceSlotItem;
  parts: EmblemPieceSlotItem[];
  pairwiseOverlaps?: PairwiseOverlapRule[];
  stageLayer?: number;
}

export interface ConvergeEmblemResult {
  nodes: SceneNodeIR[];
  masks: MaskBindingIR[];
  motions: MotionBlockIR[];
}

function buildEmblemNode(params: {
  id: string;
  name: string;
  slot: string;
  role: "emblem-host" | "emblem-part" | "mask-source";
  parentId: string;
  layer: number;
  startFrame: number;
  durationFrames: number;
  geometry: EmblemGeometrySpec;
  initialRotation?: number;
  fill: FillSpec;
  scaleFactor: number;
}): SceneNodeIR {
  const g = params.geometry;
  const s = params.scaleFactor;
  if (g.kind === "ellipse") {
    return {
      id: params.id,
      kind: "shape",
      name: params.name,
      slot: params.slot,
      role: params.role,
      parentId: params.parentId,
      layer: params.layer,
      range: { startFrame: params.startFrame, durationFrames: params.durationFrames },
      base: {
        x: 0,
        y: 0,
        width: Math.round(g.width * s),
        height: Math.round(g.height * s),
        rotation: params.initialRotation,
      },
      shape: "ellipse",
      fill: params.fill,
    };
  }
  if (g.kind === "rounded-rect") {
    return {
      id: params.id,
      kind: "shape",
      name: params.name,
      slot: params.slot,
      role: params.role,
      parentId: params.parentId,
      layer: params.layer,
      range: { startFrame: params.startFrame, durationFrames: params.durationFrames },
      base: {
        x: 0,
        y: 0,
        width: Math.round(g.width * s),
        height: Math.round(g.height * s),
        rotation: params.initialRotation,
      },
      shape: "rectangle",
      borderRadius: Math.round(g.borderRadius * s),
      fill: params.fill,
    };
  }
  if (g.kind === "rounded-triangle") {
    const tri = roundedTriangleNetwork(
      Math.round(g.width * s),
      Math.round(g.cornerRadius * s)
    );
    return {
      id: params.id,
      kind: "path",
      name: params.name,
      slot: params.slot,
      role: params.role,
      parentId: params.parentId,
      layer: params.layer,
      range: { startFrame: params.startFrame, durationFrames: params.durationFrames },
      base: {
        x: 0,
        y: 0,
        width: tri.width,
        height: tri.height,
        rotation: params.initialRotation,
        originX: 0.5,
        originY: g.originY ?? 0.62,
      },
      network: tri.network,
      fill: params.fill,
    };
  }
  const poly = roundedPolygonNetwork(
    g.sides,
    Math.round(g.diameter * s),
    Math.round(g.cornerRadius * s)
  );
  return {
    id: params.id,
    kind: "path",
    name: params.name,
    slot: params.slot,
    role: params.role,
    parentId: params.parentId,
    layer: params.layer,
    range: { startFrame: params.startFrame, durationFrames: params.durationFrames },
    base: {
      x: 0,
      y: 0,
      width: poly.width,
      height: poly.height,
      rotation: params.initialRotation,
      originX: 0.5,
      originY: 0.5,
    },
    network: poly.network,
    fill: params.fill,
  };
}

function attachPieceChoreography(params: {
  targetId: string;
  label: string;
  guideId: string;
  piece: EmblemPieceSlotItem;
  startFrame: number;
  motionDuration: number;
}): MotionBlockIR[] {
  const out: MotionBlockIR[] = [
    {
      kind: "followPath",
      id: `fp_${params.targetId}`,
      name: "Follow Path",
      targetId: params.targetId,
      guidePathId: params.guideId,
      orientToPath: false,
      startFrame: params.startFrame,
      durationFrames: params.motionDuration,
      progressEasing: params.piece.progressEasing,
    },
    {
      kind: "vec2",
      id: `sc_${params.targetId}`,
      name: `${params.label} scale`,
      targetId: params.targetId,
      property: "scale",
      mode: "multiply",
      stage: "custom",
      startFrame: params.startFrame,
      durationFrames: params.motionDuration,
      keys: [
        {
          id: `sc_${params.targetId}_k0`,
          frame: 0,
          x: params.piece.scaleFrom,
          y: params.piece.scaleFrom,
          easing: { kind: "easing", preset: "easeInSine" },
        },
        {
          id: `sc_${params.targetId}_k1`,
          frame: Math.round((params.motionDuration - 1) * 0.45),
          x: params.piece.scaleMid ?? (params.piece.scaleFrom + params.piece.scaleTo) / 2,
          y: params.piece.scaleMid ?? (params.piece.scaleFrom + params.piece.scaleTo) / 2,
          easing: { kind: "easing", preset: "easeInSine" },
        },
        {
          id: `sc_${params.targetId}_k2`,
          frame: params.motionDuration - 1,
          x: params.piece.scaleTo,
          y: params.piece.scaleTo,
        },
      ],
    },
  ];

  if (params.piece.spinDeltaDeg) {
    out.push({
      kind: "scalar",
      id: `rot_${params.targetId}`,
      name: `${params.label} spin`,
      targetId: params.targetId,
      property: "rotation",
      mode: "add",
      stage: "custom",
      startFrame: params.startFrame,
      durationFrames: params.motionDuration,
      keys: [
        {
          id: `rot_${params.targetId}_k0`,
          frame: 0,
          value: 0,
          easing: { kind: "easing", preset: "easeOutQuad" },
        },
        {
          id: `rot_${params.targetId}_k1`,
          frame: Math.round((params.motionDuration - 1) * 0.42),
          value: Math.round(params.piece.spinDeltaDeg * 0.55),
          easing: { kind: "easing", preset: "easeOutQuad" },
        },
        {
          id: `rot_${params.targetId}_k2`,
          frame: params.motionDuration - 1,
          value: params.piece.spinDeltaDeg,
        },
      ],
    });
  }

  return out;
}

/**
 * L1 Behavior Part B: Multi-Part Spiral/Arc Convergence + Declarative Boolean Color-Shift Lowering.
 * Works for ANY emblem geometry (Glean's circle+square+triangle, dual hexagons, interlocking diamonds, etc.)!
 */
export function createConvergeEmblem(opts: ConvergeEmblemOptions): ConvergeEmblemResult {
  const stageId = "emblem_assembly";
  const scaleX = opts.format.width / 1280;
  const scaleY = opts.format.height / 720;
  const uniformScale = Math.min(scaleX, scaleY);

  const nodes: SceneNodeIR[] = [
    {
      id: stageId,
      kind: "frame",
      name: "Emblem Assembly",
      slot: "emblem-stage",
      role: "stage",
      layer: opts.stageLayer ?? 10,
      base: {
        x: 0,
        y: 0,
        width: opts.format.width,
        height: opts.format.height,
      },
    },
  ];
  const masks: MaskBindingIR[] = [];
  const motions: MotionBlockIR[] = [];

  const allPieces = [opts.host, ...opts.parts];
  const guideIdByPiece = new Map<string, string>();
  const timingByPiece = new Map<
    string,
    { startFrame: number; lifeDuration: number; motionDuration: number }
  >();

  // 1. Solve smooth C1 cubic-Bezier guide networks for host and every entering part
  allPieces.forEach((piece, idx) => {
    const guideId = `guide_${piece.id}`;
    const scaledPts = piece.waypoints1280.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));
    const solved = waypointsToSmoothGuideNetwork(scaledPts);
    nodes.push({
      id: guideId,
      kind: "path",
      name: `Guide: ${piece.name}`,
      slot: "guide-path",
      role: "guide-path",
      parentId: stageId,
      layer: 30 + idx,
      base: {
        x: solved.x,
        y: solved.y,
        width: solved.width,
        height: solved.height,
        opacity: 0,
      },
      network: solved.network,
      fill: { kind: "none" },
      strokeZero: true,
    });
    guideIdByPiece.set(piece.id, guideId);

    const delayFrames = Math.round((piece.enterDelaySec ?? 0) * opts.schedule.fps);
    const startFrame = Math.min(
      opts.schedule.emblemSettleFrame - 4,
      opts.schedule.convergeStartFrame + delayFrames
    );
    const motionDuration = Math.max(
      5,
      opts.schedule.emblemSettleFrame - startFrame + 1
    );
    const lifeDuration = Math.max(
      motionDuration,
      opts.schedule.totalFrames - startFrame
    );
    timingByPiece.set(piece.id, { startFrame, lifeDuration, motionDuration });
  });

  // 2. Painter z-order assembly:
  //    a) Outside parts sit behind host
  let z = 1;
  for (const part of opts.parts) {
    const t = timingByPiece.get(part.id)!;
    const outId = `${part.id}_out`;
    nodes.push(
      buildEmblemNode({
        id: outId,
        name: `${part.name} (Outside)`,
        slot: "emblem-part",
        role: "emblem-part",
        parentId: stageId,
        layer: z++,
        startFrame: t.startFrame,
        durationFrames: t.lifeDuration,
        geometry: part.geometry,
        initialRotation: part.initialRotation,
        fill: part.outsideFill,
        scaleFactor: uniformScale,
      })
    );
    motions.push(
      ...attachPieceChoreography({
        targetId: outId,
        label: `${part.name} (Outside)`,
        guideId: guideIdByPiece.get(part.id)!,
        piece: part,
        startFrame: t.startFrame,
        motionDuration: t.motionDuration,
      })
    );
  }

  //    b) Primary host container sits above outside parts
  const hostTiming = timingByPiece.get(opts.host.id)!;
  const hostGuide = guideIdByPiece.get(opts.host.id)!;
  nodes.push(
    buildEmblemNode({
      id: opts.host.id,
      name: opts.host.name,
      slot: "emblem-host",
      role: "emblem-host",
      parentId: stageId,
      layer: z++,
      startFrame: hostTiming.startFrame,
      durationFrames: hostTiming.lifeDuration,
      geometry: opts.host.geometry,
      initialRotation: opts.host.initialRotation,
      fill: opts.host.outsideFill,
      scaleFactor: uniformScale,
    })
  );
  motions.push(
    ...attachPieceChoreography({
      targetId: opts.host.id,
      label: opts.host.name,
      guideId: hostGuide,
      piece: opts.host,
      startFrame: hostTiming.startFrame,
      motionDuration: hostTiming.motionDuration,
    })
  );

  //    c) Lower declarative `insideHostFill` rules into synchronized host mask clones + clipped part layers
  for (const part of opts.parts) {
    if (!part.insideHostFill) continue;
    const partTiming = timingByPiece.get(part.id)!;
    const maskSrcId = `mask_host_for_${part.id}`;
    const inPartId = `${part.id}_in`;

    nodes.push(
      buildEmblemNode({
        id: maskSrcId,
        name: `Mask: ${opts.host.name} -> ${part.name}`,
        slot: "mask-source",
        role: "mask-source",
        parentId: stageId,
        layer: z++,
        startFrame: hostTiming.startFrame,
        durationFrames: hostTiming.lifeDuration,
        geometry: opts.host.geometry,
        initialRotation: opts.host.initialRotation,
        fill: { kind: "solid", color: "#FFFFFF" },
        scaleFactor: uniformScale,
      })
    );
    motions.push(
      ...attachPieceChoreography({
        targetId: maskSrcId,
        label: `Mask ${opts.host.name}`,
        guideId: hostGuide,
        piece: opts.host,
        startFrame: hostTiming.startFrame,
        motionDuration: hostTiming.motionDuration,
      })
    );

    nodes.push(
      buildEmblemNode({
        id: inPartId,
        name: `${part.name} (Inside Host)`,
        slot: "emblem-part-inside",
        role: "emblem-part",
        parentId: stageId,
        layer: z++,
        startFrame: partTiming.startFrame,
        durationFrames: partTiming.lifeDuration,
        geometry: part.geometry,
        initialRotation: part.initialRotation,
        fill: part.insideHostFill,
        scaleFactor: uniformScale,
      })
    );
    motions.push(
      ...attachPieceChoreography({
        targetId: inPartId,
        label: `${part.name} (Inside Host)`,
        guideId: guideIdByPiece.get(part.id)!,
        piece: part,
        startFrame: partTiming.startFrame,
        motionDuration: partTiming.motionDuration,
      })
    );

    masks.push({
      id: `mb_in_${part.id}`,
      name: `Clip ${part.name} to ${opts.host.name}`,
      sourceObjectId: maskSrcId,
      targetObjectId: inPartId,
      mode: "vector",
      inverted: false,
    });
  }

  //    d) Lower declarative `pairwiseOverlaps` (XOR / intersection lenses) into synchronized clones + vector masks
  const partMap = new Map(opts.parts.map((p) => [p.id, p]));
  for (const rule of opts.pairwiseOverlaps ?? []) {
    const pA = partMap.get(rule.firstPartId);
    const pB = partMap.get(rule.secondPartId);
    if (!pA || !pB) continue;
    const tA = timingByPiece.get(pA.id)!;
    const tB = timingByPiece.get(pB.id)!;
    // Ensure mask source lifetime covers target lifetime
    const maskStart = Math.min(tA.startFrame, tB.startFrame);
    const maskLife = opts.schedule.totalFrames - maskStart;

    const srcId = `mask_${rule.id}_src`;
    const dstId = `overlap_${rule.id}_dst`;

    nodes.push(
      buildEmblemNode({
        id: srcId,
        name: `Mask: ${pA.name} -> ${rule.name}`,
        slot: "mask-source",
        role: "mask-source",
        parentId: stageId,
        layer: z++,
        startFrame: maskStart,
        durationFrames: maskLife,
        geometry: pA.geometry,
        initialRotation: pA.initialRotation,
        fill: { kind: "solid", color: "#FFFFFF" },
        scaleFactor: uniformScale,
      })
    );
    motions.push(
      ...attachPieceChoreography({
        targetId: srcId,
        label: `Mask ${pA.name}`,
        guideId: guideIdByPiece.get(pA.id)!,
        piece: pA,
        startFrame: tA.startFrame,
        motionDuration: tA.motionDuration,
      })
    );

    nodes.push(
      buildEmblemNode({
        id: dstId,
        name: rule.name,
        slot: "emblem-overlap",
        role: "emblem-part",
        parentId: stageId,
        layer: z++,
        startFrame: tB.startFrame,
        durationFrames: tB.lifeDuration,
        geometry: pB.geometry,
        initialRotation: pB.initialRotation,
        fill: rule.intersectionFill,
        scaleFactor: uniformScale,
      })
    );
    motions.push(
      ...attachPieceChoreography({
        targetId: dstId,
        label: rule.name,
        guideId: guideIdByPiece.get(pB.id)!,
        piece: pB,
        startFrame: tB.startFrame,
        motionDuration: tB.motionDuration,
      })
    );

    masks.push({
      id: `mb_${rule.id}`,
      name: rule.name,
      sourceObjectId: srcId,
      targetObjectId: dstId,
      mode: "vector",
      inverted: false,
    });
  }

  return { nodes, masks, motions };
}
