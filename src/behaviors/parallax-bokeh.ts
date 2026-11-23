import { roundedTriangleNetwork } from "../kernel/geometry.ts";
import type {
  FillSpec,
  MotionBlockIR,
  MotionFormat,
  SceneNodeIR,
} from "../kernel/ir.ts";
import type { BrandTheme } from "../kernel/tokens.ts";
import type { BeatGridSchedule } from "./beat-grid.ts";

export interface BokehSlotItem {
  id: string;
  name: string;
  geometry: "orb" | "rounded-square" | "rounded-triangle";
  size: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  /** Cue anchor: either a beat index ("beat:1") or "pre-converge" */
  trigger: { kind: "beat"; index: number; offsetSec?: number } | { kind: "pre-converge"; leadSec?: number };
  durationSec: number;
  blur?: number;
  initialRotation?: number;
  spinDeltaDeg?: number;
  fadeOutTail?: boolean;
}

export interface ParallaxBokehOptions {
  parentId: string;
  format: MotionFormat;
  theme: BrandTheme;
  schedule: BeatGridSchedule;
  items: BokehSlotItem[];
  layer?: number;
}

export interface ParallaxBokehResult {
  nodes: SceneNodeIR[];
  motions: MotionBlockIR[];
}

function bokehFill(
  geometry: BokehSlotItem["geometry"],
  theme: BrandTheme
): FillSpec {
  if (geometry === "orb") {
    return {
      kind: "radial",
      domain: { x: -0.14, y: -0.22, width: 0.92, height: 0.92 },
      stops: theme.orbRadialStops,
    };
  }
  if (geometry === "rounded-triangle") {
    return {
      kind: "radial",
      domain: { x: 0.14, y: 0.22, width: 0.72, height: 0.72 },
      stops: theme.freshRadialStops,
    };
  }
  return {
    kind: "linear",
    angleDeg: 35,
    stops: theme.warmLinearStops,
  };
}

/**
 * L1 Behavior: Foreground Depth-of-Field Bokeh Sweeps.
 * Automatically assigns optical blur proportional to foreground size and schedules tangential sweeps.
 */
export function createParallaxBokeh(opts: ParallaxBokehOptions): ParallaxBokehResult {
  const groupId = "foreground_bokeh_group";
  const nodes: SceneNodeIR[] = [
    {
      id: groupId,
      kind: "frame",
      name: "Foreground Bokeh Depth",
      slot: "bokeh-group",
      role: "bokeh-group",
      parentId: opts.parentId,
      layer: opts.layer ?? 4,
      base: {
        x: 0,
        y: 0,
        width: opts.format.width,
        height: opts.format.height,
      },
    },
  ];
  const motions: MotionBlockIR[] = [];

  opts.items.forEach((item, idx) => {
    const scaleX = opts.format.width / 1280;
    const scaleY = opts.format.height / 720;
    const size = Math.round(item.size * Math.min(scaleX, scaleY));
    const blur = item.blur ?? Math.round(Math.max(24, size * 0.165));
    const fill = bokehFill(item.geometry, opts.theme);

    let startF = 0;
    if (item.trigger.kind === "beat") {
      const clampedIdx = Math.min(
        item.trigger.index,
        Math.max(0, opts.schedule.beatFrames.length - 1)
      );
      startF =
        (opts.schedule.beatFrames[clampedIdx] ?? 0) +
        Math.round((item.trigger.offsetSec ?? 0) * opts.schedule.fps);
    } else {
      startF = Math.max(
        0,
        opts.schedule.convergeStartFrame -
          opts.schedule.framesForSec(item.trigger.leadSec ?? 0.14, 3)
      );
    }
    const durF = Math.min(
      Math.max(4, opts.schedule.introEndFrame - startF),
      opts.schedule.framesForSec(item.durationSec, 6)
    );
    startF = Math.max(0, Math.min(opts.schedule.introEndFrame - 4, startF));

    const x = Math.round(item.startX * scaleX * 10) / 10;
    const y = Math.round(item.startY * scaleY * 10) / 10;

    if (item.geometry === "rounded-triangle") {
      const tri = roundedTriangleNetwork(size, Math.round(size * 0.175));
      nodes.push({
        id: item.id,
        kind: "path",
        name: item.name,
        slot: "bokeh-item",
        role: "bokeh-item",
        parentId: groupId,
        layer: 10 + idx,
        range: { startFrame: startF, durationFrames: durF },
        base: {
          x,
          y,
          width: tri.width,
          height: tri.height,
          rotation: item.initialRotation,
          blur,
        },
        network: tri.network,
        fill,
      });
    } else {
      nodes.push({
        id: item.id,
        kind: "shape",
        name: item.name,
        slot: "bokeh-item",
        role: "bokeh-item",
        parentId: groupId,
        layer: 10 + idx,
        range: { startFrame: startF, durationFrames: durF },
        base: {
          x,
          y,
          width: size,
          height: size,
          rotation: item.initialRotation,
          blur,
        },
        shape: item.geometry === "orb" ? "ellipse" : "rectangle",
        borderRadius:
          item.geometry === "rounded-square" ? Math.round(size * 0.22) : undefined,
        fill,
      });
    }

    motions.push({
      kind: "vec2",
      id: `act_${item.id}_move`,
      name: `${item.name} sweep`,
      targetId: item.id,
      property: "move",
      mode: "add",
      stage: "in",
      startFrame: startF,
      durationFrames: durF,
      keys: [
        {
          id: `${item.id}_mv_k0`,
          frame: 0,
          x: 0,
          y: 0,
          easing: { kind: "easing", preset: "easeOutQuad" },
        },
        {
          id: `${item.id}_mv_k1`,
          frame: durF - 1,
          x: Math.round(item.deltaX * scaleX),
          y: Math.round(item.deltaY * scaleY),
        },
      ],
    });

    if (item.spinDeltaDeg) {
      motions.push({
        kind: "scalar",
        id: `act_${item.id}_rot`,
        name: `${item.name} rotation`,
        targetId: item.id,
        property: "rotation",
        mode: "add",
        stage: "custom",
        startFrame: startF,
        durationFrames: durF,
        keys: [
          { id: `${item.id}_rot_k0`, frame: 0, value: 0, easing: { kind: "linear" } },
          { id: `${item.id}_rot_k1`, frame: durF - 1, value: item.spinDeltaDeg },
        ],
      });
    }

    if (item.fadeOutTail) {
      const fadeDur = Math.min(durF, opts.schedule.framesForSec(0.1, 3));
      motions.push({
        kind: "scalar",
        id: `act_${item.id}_out`,
        name: `${item.name} exit`,
        targetId: item.id,
        property: "opacity",
        mode: "set",
        stage: "out",
        startFrame: startF + durF - fadeDur,
        durationFrames: fadeDur,
        keys: [
          { id: `${item.id}_out_k0`, frame: 0, value: 1, easing: { kind: "linear" } },
          { id: `${item.id}_out_k1`, frame: fadeDur - 1, value: 0 },
        ],
      });
    }
  });

  return { nodes, motions };
}
