import {
  createBeatGrid,
  createChevronRibbon,
  createConvergeEmblem,
  createFocusPull,
  createKineticStack,
  createParallaxBokeh,
  createPulsedOrbit,
  type BokehSlotItem,
  type EmblemPieceSlotItem,
  type HeadlineLineSlotItem,
  type OrbitSlotItem,
  type PairwiseOverlapRule,
} from "../behaviors/index.ts";
import type { AudioTrackIR, MotionDocument } from "../kernel/ir.ts";
import { defineShotPrimitive, slot } from "../kernel/primitive.ts";
import {
  GLEAN_EDITORIAL_THEME,
  SNAPPY_EDITORIAL_FEEL,
  type BrandTheme,
  type FeelPreset,
} from "../kernel/tokens.ts";

export interface StatementConvergeOptions {
  width?: number;
  height?: number;
  fps?: number;
  durationSec?: number;
  theme?: BrandTheme;
  feel?: FeelPreset;
  cueSeconds?: number[];
  convergeAtSec?: number;
  includeRibbonBackdrop?: boolean;
  audio?: AudioTrackIR;
}

export function defaultEditorialOrbitItems(): OrbitSlotItem[] {
  return [
    {
      id: "mid_blue_big",
      name: "Primary Orb Large",
      geometry: "orb",
      size: 144,
      angleDeg: 17,
      radiusOffset: 10,
      breathOutPx: 140,
      enterBeatIndex: 0,
      worldLockedLighting: true,
      layer: 7,
    },
    {
      id: "mid_tri_big",
      name: "Fresh Triangle Large",
      geometry: "rounded-triangle",
      size: 196,
      angleDeg: -65,
      radiusOffset: 24,
      breathOutPx: 102,
      enterBeatIndex: 0,
      initialRotation: 52,
      spinDeltaDeg: 78,
      layer: 8,
    },
    {
      id: "mid_tri_small",
      name: "Fresh Triangle Small",
      geometry: "rounded-triangle",
      size: 86,
      angleDeg: 96,
      radiusOffset: -6,
      breathOutPx: 174,
      enterBeatIndex: 0,
      initialRotation: -35,
      spinDeltaDeg: 80,
      layer: 9,
    },
    {
      id: "mid_blue_small",
      name: "Primary Orb Small",
      geometry: "orb",
      size: 46,
      angleDeg: -157,
      radiusOffset: 18,
      breathOutPx: 122,
      enterBeatIndex: 1,
      worldLockedLighting: true,
      layer: 5,
    },
    {
      id: "mid_warm_tiny",
      name: "Warm Square Tiny",
      geometry: "rounded-square",
      size: 38,
      angleDeg: 161,
      radiusOffset: -8,
      breathOutPx: 106,
      enterBeatIndex: 1,
      initialRotation: 18,
      layer: 4,
    },
    {
      id: "mid_warm_big",
      name: "Warm Square Large",
      geometry: "rounded-square",
      size: 124,
      angleDeg: -119,
      radiusOffset: 58,
      breathOutPx: 74,
      enterBeatIndex: 2,
      initialRotation: 24,
      spinDeltaDeg: -35,
      layer: 6,
    },
    {
      id: "mid_warm_med",
      name: "Warm Square Medium",
      geometry: "rounded-square",
      size: 72,
      angleDeg: 55,
      radiusOffset: 48,
      breathOutPx: 62,
      enterBeatIndex: 2,
      initialRotation: 36,
      layer: 5,
    },
  ];
}

export function defaultBokehSweepItems(): BokehSlotItem[] {
  return [
    {
      id: "bokeh_b2_orb",
      name: "Bokeh Orb Beat 2",
      geometry: "orb",
      size: 244,
      startX: 1030,
      startY: 284,
      deltaX: -187,
      deltaY: 349,
      trigger: { kind: "beat", index: 1 },
      durationSec: 0.37,
      blur: 40,
      fadeOutTail: true,
    },
    {
      id: "bokeh_b2_warm",
      name: "Bokeh Warm Beat 2",
      geometry: "rounded-square",
      size: 256,
      startX: 77,
      startY: 122,
      deltaX: 255,
      deltaY: -360,
      trigger: { kind: "beat", index: 1 },
      durationSec: 0.37,
      blur: 42,
      initialRotation: 44,
      spinDeltaDeg: 34,
      fadeOutTail: true,
    },
    {
      id: "bokeh_b3_orb_big",
      name: "Bokeh Orb Sweep Left",
      geometry: "orb",
      size: 244,
      startX: 63,
      startY: 623,
      deltaX: 400,
      deltaY: -590,
      trigger: { kind: "beat", index: 2, offsetSec: 0.06 },
      durationSec: 1.36,
      blur: 40,
    },
    {
      id: "bokeh_b3_warm_right",
      name: "Bokeh Warm Sweep Right",
      geometry: "rounded-square",
      size: 268,
      startX: 1141,
      startY: 101,
      deltaX: -595,
      deltaY: 525,
      trigger: { kind: "beat", index: 2, offsetSec: 0.2 },
      durationSec: 1.23,
      blur: 44,
      initialRotation: 166,
      spinDeltaDeg: 52,
    },
    {
      id: "bokeh_pre_tri",
      name: "Bokeh Fresh Finale",
      geometry: "rounded-triangle",
      size: 320,
      startX: 50,
      startY: 621,
      deltaX: 183,
      deltaY: -445,
      trigger: { kind: "pre-converge", leadSec: 0.02 },
      durationSec: 0.3,
      blur: 36,
      spinDeltaDeg: -25,
    },
  ];
}

export function defaultBrandEmblemSlots(theme: BrandTheme): {
  host: EmblemPieceSlotItem;
  parts: EmblemPieceSlotItem[];
  overlaps: PairwiseOverlapRule[];
} {
  const host: EmblemPieceSlotItem = {
    id: "hero_host_circle",
    name: "Hero Brand Circle",
    geometry: { kind: "ellipse", width: 700, height: 700 },
    outsideFill: { kind: "solid", color: theme.brandPrimary },
    waypoints1280: [
      { x: -90, y: 295 },
      { x: 360, y: -210 },
      { x: 840, y: -120 },
      { x: 1057, y: 139 },
      { x: 1039, y: 391 },
      { x: 919, y: 537 },
      { x: 785, y: 585 },
      { x: 677, y: 567 },
      { x: 574, y: 462 },
      { x: 575, y: 374 },
      { x: 608, y: 337 },
      { x: 634, y: 335 },
    ],
    enterDelaySec: 0,
    scaleFrom: 1.157,
    scaleMid: 1.045,
    scaleTo: 0.838,
    progressEasing: { kind: "cubicBezier", x1: 0.15, y1: 0.8, x2: 0.5, y2: 1.0 },
  };

  const squarePart: EmblemPieceSlotItem = {
    id: "hero_sq",
    name: "Hero Square",
    geometry: { kind: "rounded-rect", width: 300, height: 300, borderRadius: 56 },
    outsideFill: { kind: "linear", angleDeg: 115, stops: theme.emblemOutWarmStops },
    insideHostFill: { kind: "linear", angleDeg: 235, stops: theme.emblemInPrimaryStops },
    waypoints1280: [
      { x: 265, y: 745 },
      { x: 252, y: 570 },
      { x: 275, y: 437 },
      { x: 375, y: 240 },
      { x: 499, y: 180 },
      { x: 581, y: 187 },
      { x: 637, y: 225 },
    ],
    enterDelaySec: 0.2,
    initialRotation: -106,
    spinDeltaDeg: 237,
    scaleFrom: 1.24,
    scaleMid: 1.113,
    scaleTo: 0.913,
    progressEasing: { kind: "cubicBezier", x1: 0.3, y1: 0.45, x2: 0.4, y2: 0.85 },
  };

  const trianglePart: EmblemPieceSlotItem = {
    id: "hero_tri",
    name: "Hero Triangle",
    geometry: { kind: "rounded-triangle", width: 360, cornerRadius: 66, originY: 0.62 },
    outsideFill: {
      kind: "radial",
      domain: { x: 0.14, y: 0.22, width: 0.72, height: 0.72 },
      stops: theme.freshRadialStops,
    },
    insideHostFill: { kind: "linear", angleDeg: 265, stops: theme.emblemInSecondaryStops },
    waypoints1280: [
      { x: 755, y: -135 },
      { x: 892, y: 30 },
      { x: 934, y: 138 },
      { x: 928, y: 245 },
      { x: 852, y: 368 },
      { x: 762, y: 422 },
      { x: 732, y: 430 },
    ],
    enterDelaySec: 0.3,
    initialRotation: -10,
    spinDeltaDeg: 105,
    scaleFrom: 1.22,
    scaleMid: 1.11,
    scaleTo: 0.98,
    progressEasing: { kind: "cubicBezier", x1: 0.16, y1: 0.42, x2: 0.56, y2: 0.92 },
  };

  const overlaps: PairwiseOverlapRule[] = [
    {
      id: "hero_xor",
      name: "XOR Cutout (Square intersect Triangle)",
      firstPartId: "hero_sq",
      secondPartId: "hero_tri",
      intersectionFill: { kind: "solid", color: theme.brandPrimary },
    },
  ];

  return { host, parts: [squarePart, trianglePart], overlaps };
}

/**
 * Shot Primitive #1: `statement-converge`
 * Act 1: Beat-driven kinetic statement stack + clearance-aware orbit universe + procedural ribbon + foreground bokeh.
 * Handoff: Optical focus-pull blur exit.
 * Act 2: Multi-part C1 Bezier spiral/arc convergence into a brand emblem with dynamic boolean color-shifts.
 */
export const statementConverge = defineShotPrimitive<
  StatementConvergeOptions,
  {
    headlineLines: ReturnType<typeof slot<string | HeadlineLineSlotItem, "collection">>;
    orbitItems: ReturnType<typeof slot<OrbitSlotItem, "collection">>;
    bokehItems: ReturnType<typeof slot<BokehSlotItem, "collection">>;
    emblemHost: ReturnType<typeof slot<EmblemPieceSlotItem, "single">>;
    emblemParts: ReturnType<typeof slot<EmblemPieceSlotItem, "collection">>;
    overlapRules: ReturnType<typeof slot<PairwiseOverlapRule, "collection">>;
  }
>({
  name: "statement-converge",
  description: "Kinetic Brand Statement -> Focus Pull -> Spiral Emblem Convergence",
  slots: {
    headlineLines: slot<string | HeadlineLineSlotItem, "collection">({
      cardinality: "collection",
      required: true,
      minItems: 1,
      description: "1..N statement lines; typography, focal box, and beat timing adapt automatically",
    }),
    orbitItems: slot<OrbitSlotItem, "collection">({
      cardinality: "collection",
      description: "Midground brand shapes orbiting outside the headline focal box",
    }),
    bokehItems: slot<BokehSlotItem, "collection">({
      cardinality: "collection",
      description: "Foreground out-of-focus depth shapes sweeping across beats",
    }),
    emblemHost: slot<EmblemPieceSlotItem, "single">({
      cardinality: "single",
      description: "Primary emblem container shape that clips inner color-shifted parts",
    }),
    emblemParts: slot<EmblemPieceSlotItem, "collection">({
      cardinality: "collection",
      description: "Entering emblem shapes that shift color inside host and optionally XOR-overlap",
    }),
    overlapRules: slot<PairwiseOverlapRule, "collection">({
      cardinality: "collection",
      description: "Declarative pairwise intersection color lenses lowered to vector masks",
    }),
  },
  compose: ({ id, name, options, slots }) => {
    const width = options.width ?? 1280;
    const height = options.height ?? 720;
    const fps = options.fps ?? 30;
    const durationSec = options.durationSec ?? 3.0;
    const theme = options.theme ?? GLEAN_EDITORIAL_THEME;
    const feel = options.feel ?? SNAPPY_EDITORIAL_FEEL;

    const schedule = createBeatGrid({
      durationSec,
      fps,
      itemCount: slots.headlineLines.length,
      feel,
      cueSeconds: options.cueSeconds,
      convergeAtSec: options.convergeAtSec,
    });

    const format = {
      width,
      height,
      fps,
      durationFrames: schedule.totalFrames,
    };

    const safeMarginX = Math.round(width * 0.08);
    const safeMarginY = Math.round(height * 0.09);

    const introStageId = "intro_world";
    const kinetic = createKineticStack({
      parentId: introStageId,
      format,
      theme,
      schedule,
      lines: slots.headlineLines,
      feel,
      safeMarginX,
      safeMarginY,
      layer: 3,
    });

    const useRibbon = options.includeRibbonBackdrop ?? true;
    const ribbon = useRibbon
      ? createChevronRibbon({
          parentId: introStageId,
          format,
          theme,
          schedule,
          focalBounds: kinetic.focalBounds,
          layer: 1,
        })
      : null;

    const orbitItems =
      slots.orbitItems.length > 0 ? slots.orbitItems : defaultEditorialOrbitItems();
    const orbit = createPulsedOrbit({
      parentId: introStageId,
      format,
      theme,
      schedule,
      focalBounds: kinetic.focalBounds,
      items: orbitItems,
      layer: 2,
    });

    const bokehItems =
      slots.bokehItems.length > 0 ? slots.bokehItems : defaultBokehSweepItems();
    const bokeh = createParallaxBokeh({
      parentId: introStageId,
      format,
      theme,
      schedule,
      items: bokehItems,
      layer: 4,
    });

    const focusPullMotions = createFocusPull({
      targetStageId: introStageId,
      schedule,
    });

    const defaultEmblem = defaultBrandEmblemSlots(theme);
    const host = slots.emblemHost ?? defaultEmblem.host;
    const parts = slots.emblemParts.length > 0 ? slots.emblemParts : defaultEmblem.parts;
    const overlaps =
      slots.overlapRules.length > 0 ? slots.overlapRules : defaultEmblem.overlaps;

    const emblem = createConvergeEmblem({
      format,
      schedule,
      host,
      parts,
      pairwiseOverlaps: overlaps,
      stageLayer: 10,
    });

    const doc: MotionDocument = {
      id,
      name,
      format,
      scene: {
        id: `${id}__scene-1`,
        name: `${slots.headlineLines
          .map((l) => (typeof l === "string" ? l : l.text))
          .join(" ")} -> Emblem`,
        durationFrames: schedule.totalFrames,
        backgroundColor: theme.surface,
      },
      shaders: ribbon ? [ribbon.shader] : [],
      audio: options.audio,
      nodes: [
        {
          id: introStageId,
          kind: "frame",
          name: "Intro World",
          slot: "intro-stage",
          role: "stage",
          layer: 1,
          base: { x: 0, y: 0, width, height },
        },
        ...(ribbon ? [ribbon.node] : []),
        ...kinetic.nodes,
        ...orbit.nodes,
        ...bokeh.nodes,
        ...emblem.nodes,
      ],
      masks: emblem.masks,
      motions: [
        ...focusPullMotions,
        ...(ribbon ? [ribbon.motion] : []),
        ...kinetic.motions,
        ...orbit.motions,
        ...bokeh.motions,
        ...emblem.motions,
      ],
      annotations: {
        primitiveName: "statement-converge",
        beatFrames: schedule.beatFrames,
        convergeStartFrame: schedule.convergeStartFrame,
        emblemSettleFrame: schedule.emblemSettleFrame,
        focalBounds: kinetic.focalBounds,
        safeMargin: { x: safeMarginX, y: safeMarginY },
      },
    };

    return doc;
  },
  agent: {
    intent:
      "Editorial brand opener that reveals 1..N headline lines on musical beats surrounded by a clearance-safe orbital brand universe, then focus-pulls into a multi-part converging emblem with boolean color-shift masks.",
    actions: ["snapshot", "audit", "compileToMotionade", "compileToHyperframes", "compileToRemotion"],
    invariants: [
      "Headline lines never overflow safeMargin regardless of 2, 3, or 4+ line count",
      "Orbiting brand shapes automatically expand radius around headline focalBounds",
      "Radial-lit spheres counter-rotate to keep world lighting upright",
      "Vector mask sources cover target lifetimes and share synchronized trajectories",
    ],
    adaptableAxes: ["durationSec", "fps", "theme", "headlineLines", "emblemHost", "emblemParts"],
  },
});
