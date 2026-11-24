import { roundedPolygonNetwork, roundedTriangleNetwork } from "../kernel/geometry.ts";
import type {
  BBox,
  FillSpec,
  MotionBlockIR,
  MotionFormat,
  ScalarKey,
  SceneNodeIR,
  Vec2Key,
} from "../kernel/ir.ts";
import type { BrandTheme } from "../kernel/tokens.ts";
import type { BeatGridSchedule } from "./beat-grid.ts";

export type OrbitGeometryKind = "orb" | "rounded-square" | "rounded-triangle" | "rounded-hexagon";

export interface OrbitSlotItem {
  id: string;
  name: string;
  geometry: OrbitGeometryKind;
  size: number;
  angleDeg: number;
  /** Extra radial clearance outside the computed focal safety ring */
  radiusOffset?: number;
  /** Peak outward radial expansion during mid-statement breath */
  breathOutPx?: number;
  enterBeatIndex?: number;
  initialRotation?: number;
  spinDeltaDeg?: number;
  worldLockedLighting?: boolean;
  paletteRole?: "orb" | "warm" | "fresh";
  layer?: number;
}

export interface PulsedOrbitOptions {
  parentId: string;
  format: MotionFormat;
  theme: BrandTheme;
  schedule: BeatGridSchedule;
  focalBounds: BBox;
  items: OrbitSlotItem[];
  layer?: number;
}

export interface PulsedOrbitResult {
  nodes: SceneNodeIR[];
  motions: MotionBlockIR[];
}

function buildOrbitFill(role: "orb" | "warm" | "fresh", theme: BrandTheme): FillSpec {
  if (role === "orb") {
    return {
      kind: "radial",
      domain: { x: -0.14, y: -0.22, width: 0.92, height: 0.92 },
      stops: theme.orbRadialStops,
    };
  }
  if (role === "fresh") {
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
 * L1 Behavior: Clearance-Aware Pulsed Orbit Field.
 * Automatically expands orbital base radius whenever `focalBounds` grows (e.g. 4 long lines),
 * drives one parent ring with beat-synced clockwise spin pulses, and gives each child radial breath.
 */
export function createPulsedOrbit(opts: PulsedOrbitOptions): PulsedOrbitResult {
  const ringId = "midground_orbit_ring";
  const cx = opts.format.width / 2;
  const cy = opts.format.height / 2;
  const endFrame = opts.schedule.introEndFrame;

  // Minimum safe inner radius clears the headline focal box across any 360deg ring rotation
  const safeInnerRadius = Math.max(
    opts.format.height * 0.24,
    Math.min(
      opts.format.width * 0.34,
      Math.max(opts.focalBounds.width * 0.5, opts.focalBounds.height * 0.5) + 16
    )
  );

  const nodes: SceneNodeIR[] = [
    {
      id: ringId,
      kind: "frame",
      name: "Midground Orbit Ring",
      slot: "orbit-ring",
      role: "orbit-ring",
      parentId: opts.parentId,
      layer: opts.layer ?? 2,
      base: {
        x: 0,
        y: 0,
        width: opts.format.width,
        height: opts.format.height,
        originX: 0.5,
        originY: 0.5,
      },
    },
  ];

  const motions: MotionBlockIR[] = [];

  // Parent ring pulsed clockwise spin aligned with beatFrames
  const spinKeys: ScalarKey[] = [{ id: "orb_spin_0", frame: 0, value: 0, easing: { kind: "easing", preset: "easeOutCubic" } }];
  const totalSpin = 372;
  const beats = opts.schedule.beatFrames;
  const perBeatDeg = 274 / Math.max(1, beats.length);

  beats.forEach((bf, idx) => {
    const burstEnd = Math.min(endFrame - 6, bf + opts.schedule.framesForSec(0.22, 5));
    const baseAngle = idx * perBeatDeg;
    if (idx > 0 && bf > spinKeys[spinKeys.length - 1]!.frame + 1) {
      spinKeys.push({
        id: `orb_spin_hit_${idx}`,
        frame: bf,
        value: Math.round(baseAngle),
        easing: { kind: "easing", preset: "easeOutCubic" },
      });
    }
    if (burstEnd > spinKeys[spinKeys.length - 1]!.frame + 1) {
      spinKeys.push({
        id: `orb_spin_post_${idx}`,
        frame: burstEnd,
        value: Math.round(baseAngle + perBeatDeg * 0.65),
        easing: { kind: "linear" },
      });
    }
  });
  spinKeys.push({
    id: "orb_spin_end",
    frame: endFrame - 1,
    value: totalSpin,
  });

  motions.push({
    kind: "scalar",
    id: "act_orbit_ring_spin",
    name: "Orbit ring pulsed clockwise spin",
    targetId: ringId,
    property: "rotation",
    mode: "add",
    stage: "custom",
    startFrame: 0,
    durationFrames: endFrame,
    keys: spinKeys,
  });

  opts.items.forEach((item, idx) => {
    const rad = (item.angleDeg * Math.PI) / 180;
    const ux = Math.cos(rad);
    const uy = Math.sin(rad);
    const r0 = safeInnerRadius + (item.radiusOffset ?? 0);
    const paletteRole =
      item.paletteRole ??
      (item.geometry === "orb"
        ? "orb"
        : item.geometry === "rounded-triangle"
          ? "fresh"
          : "warm");
    const fill = buildOrbitFill(paletteRole, opts.theme);

    const enterBeatIdx = item.enterBeatIndex ?? 0;
    const startF =
      enterBeatIdx > 0
        ? (opts.schedule.beatFrames[Math.min(enterBeatIdx, opts.schedule.beatFrames.length - 1)] ?? 0)
        : 0;
    const range =
      startF > 0
        ? { startFrame: startF, durationFrames: Math.max(4, endFrame - startF) }
        : undefined;

    let nodeW = item.size;
    let nodeH = item.size;

    if (item.geometry === "rounded-triangle") {
      const tri = roundedTriangleNetwork(item.size, Math.round(item.size * 0.175));
      nodeW = tri.width;
      nodeH = tri.height;
      nodes.push({
        id: item.id,
        kind: "path",
        name: item.name,
        slot: "orbit-item",
        role: "orbit-item",
        parentId: ringId,
        layer: item.layer ?? 4 + idx,
        range,
        base: {
          x: Math.round((cx + ux * r0 - nodeW / 2) * 10) / 10,
          y: Math.round((cy + uy * r0 - nodeH / 2) * 10) / 10,
          width: nodeW,
          height: nodeH,
          rotation: item.initialRotation,
        },
        network: tri.network,
        fill,
      });
    } else if (item.geometry === "rounded-hexagon") {
      const hex = roundedPolygonNetwork(6, item.size, Math.round(item.size * 0.14));
      nodeW = hex.width;
      nodeH = hex.height;
      nodes.push({
        id: item.id,
        kind: "path",
        name: item.name,
        slot: "orbit-item",
        role: "orbit-item",
        parentId: ringId,
        layer: item.layer ?? 4 + idx,
        range,
        base: {
          x: Math.round((cx + ux * r0 - nodeW / 2) * 10) / 10,
          y: Math.round((cy + uy * r0 - nodeH / 2) * 10) / 10,
          width: nodeW,
          height: nodeH,
          rotation: item.initialRotation,
        },
        network: hex.network,
        fill,
      });
    } else {
      nodes.push({
        id: item.id,
        kind: "shape",
        name: item.name,
        slot: "orbit-item",
        role: "orbit-item",
        parentId: ringId,
        layer: item.layer ?? 4 + idx,
        range,
        base: {
          x: Math.round((cx + ux * r0 - nodeW / 2) * 10) / 10,
          y: Math.round((cy + uy * r0 - nodeH / 2) * 10) / 10,
          width: nodeW,
          height: nodeH,
          rotation: item.initialRotation,
        },
        shape: item.geometry === "orb" ? "ellipse" : "rectangle",
        borderRadius:
          item.geometry === "rounded-square" ? Math.round(item.size * 0.215) : undefined,
        fill,
      });
    }

    // Radial breathing motion along outward polar unit vector (ux, uy)
    const breathDur = Math.max(8, endFrame - startF - 4);
    const breathPeak = item.breathOutPx ?? Math.round(opts.format.height * 0.14);
    const midF1 = Math.round(breathDur * 0.32);
    const midF2 = Math.round(breathDur * 0.68);
    const radKeys: Vec2Key[] = [
      {
        id: `${item.id}_rad_k0`,
        frame: 0,
        x: 0,
        y: 0,
        easing: { kind: "easing", preset: "easeOutCubic" },
      },
      {
        id: `${item.id}_rad_k1`,
        frame: midF1,
        x: Math.round(ux * breathPeak * 0.62 * 100) / 100,
        y: Math.round(uy * breathPeak * 0.62 * 100) / 100,
        easing: { kind: "easing", preset: "easeOutCubic" },
      },
      {
        id: `${item.id}_rad_k2`,
        frame: midF2,
        x: Math.round(ux * breathPeak * 100) / 100,
        y: Math.round(uy * breathPeak * 100) / 100,
        easing: { kind: "easing", preset: "easeInQuad" },
      },
      {
        id: `${item.id}_rad_k3`,
        frame: breathDur - 1,
        x: Math.round(ux * breathPeak * 0.2 * 100) / 100,
        y: Math.round(uy * breathPeak * 0.2 * 100) / 100,
      },
    ];

    motions.push({
      kind: "vec2",
      id: `act_${item.id}_rad`,
      name: `${item.id} radial breath`,
      targetId: item.id,
      property: "move",
      mode: "add",
      stage: "custom",
      startFrame: startF,
      durationFrames: breathDur,
      keys: radKeys,
    });

    if (item.worldLockedLighting || (item.geometry === "orb" && item.worldLockedLighting !== false)) {
      const activeDur = endFrame - startF;
      motions.push({
        kind: "scalar",
        id: `act_${item.id}_crot`,
        name: "Keep sphere lighting upright",
        targetId: item.id,
        property: "rotation",
        mode: "add",
        stage: "custom",
        startFrame: startF,
        durationFrames: activeDur,
        keys: [
          { id: `${item.id}_crot_k0`, frame: 0, value: 0, easing: { kind: "linear" } },
          { id: `${item.id}_crot_k1`, frame: activeDur - 1, value: -360 },
        ],
      });
    } else if (item.spinDeltaDeg) {
      const activeDur = endFrame - startF;
      motions.push({
        kind: "scalar",
        id: `act_${item.id}_rot`,
        name: `${item.name} gentle spin`,
        targetId: item.id,
        property: "rotation",
        mode: "add",
        stage: "custom",
        startFrame: startF,
        durationFrames: activeDur,
        keys: [
          { id: `${item.id}_rot_k0`, frame: 0, value: 0, easing: { kind: "linear" } },
          { id: `${item.id}_rot_k1`, frame: activeDur - 1, value: item.spinDeltaDeg },
        ],
      });
    }
  });

  return { nodes, motions };
}
