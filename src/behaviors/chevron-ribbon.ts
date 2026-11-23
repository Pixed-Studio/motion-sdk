import type {
  BBox,
  CustomShaderIR,
  MotionBlockIR,
  MotionFormat,
  ScalarKey,
  ShapeNodeIR,
} from "../kernel/ir.ts";
import type { BrandTheme } from "../kernel/tokens.ts";
import type { BeatGridSchedule } from "./beat-grid.ts";

export const CHEVRON_RIBBON_SKSL = `uniform float4 ms_contentRect;
uniform float ms_dpr;
uniform float p_spinAngle;
uniform float p_pillarSize;
uniform float p_baseHalfGap;
uniform float p_chevronSlope;
uniform float p_fadeHeight;
uniform float4 p_limeColor;

float2 frontProfile(float x, float S, float theta) {
  float R = S * 0.70710678;
  float a0 = theta + 0.78539816;
  float a1 = theta + 2.35619449;
  float a2 = theta + 3.92699082;
  float a3 = theta + 5.49778714;
  float2 v0 = float2(R * sin(a0), R * cos(a0));
  float2 v1 = float2(R * sin(a1), R * cos(a1));
  float2 v2 = float2(R * sin(a2), R * cos(a2));
  float2 v3 = float2(R * sin(a3), R * cos(a3));

  float xMin = min(min(v0.x, v1.x), min(v2.x, v3.x));
  float xMax = max(max(v0.x, v1.x), max(v2.x, v3.x));
  float insideX = min(x - xMin, xMax - x);

  float zMax = -1e6;
  float xc = clamp(x, xMin, xMax);
  float lo0 = min(v0.x, v1.x); float hi0 = max(v0.x, v1.x);
  if (hi0 - lo0 > 0.001 && xc >= lo0 - 0.001 && xc <= hi0 + 0.001) {
    float t = clamp((xc - v0.x) / (v1.x - v0.x), 0.0, 1.0);
    zMax = max(zMax, mix(v0.y, v1.y, t));
  }
  float lo1 = min(v1.x, v2.x); float hi1 = max(v1.x, v2.x);
  if (hi1 - lo1 > 0.001 && xc >= lo1 - 0.001 && xc <= hi1 + 0.001) {
    float t = clamp((xc - v1.x) / (v2.x - v1.x), 0.0, 1.0);
    zMax = max(zMax, mix(v1.y, v2.y, t));
  }
  float lo2 = min(v2.x, v3.x); float hi2 = max(v2.x, v3.x);
  if (hi2 - lo2 > 0.001 && xc >= lo2 - 0.001 && xc <= hi2 + 0.001) {
    float t = clamp((xc - v2.x) / (v3.x - v2.x), 0.0, 1.0);
    zMax = max(zMax, mix(v2.y, v3.y, t));
  }
  float lo3 = min(v3.x, v0.x); float hi3 = max(v3.x, v0.x);
  if (hi3 - lo3 > 0.001 && xc >= lo3 - 0.001 && xc <= hi3 + 0.001) {
    float t = clamp((xc - v3.x) / (v0.x - v3.x), 0.0, 1.0);
    zMax = max(zMax, mix(v3.y, v0.y, t));
  }
  return float2(zMax, insideX);
}

half4 main(float2 fragCoord) {
  float dpr = max(ms_dpr, 0.001);
  float2 center = ms_contentRect.xy + 0.5 * ms_contentRect.zw;
  float2 p = (fragCoord - center) / dpr;

  float theta = p_spinAngle * 0.0174532925;
  float2 prof = frontProfile(p.x, p_pillarSize, theta);
  float zFront = prof.x;
  float insideX = prof.y;

  float aaX = smoothstep(-0.75, 0.75, insideX);
  if (aaX <= 0.0001) return half4(0.0);

  float innerHalf = max(3.0, p_baseHalfGap - p_chevronSlope * zFront);
  float ay = abs(p.y);
  float d = ay - innerHalf;

  float aaInner = smoothstep(-0.75, 0.75, d);
  float u = clamp(max(d, 0.0) / max(p_fadeHeight, 1.0), 0.0, 1.0);
  float fadeAlpha = 1.0 - smoothstep(0.0, 1.0, pow(u, 1.2));

  float a = aaX * aaInner * fadeAlpha * p_limeColor.a;
  float3 rgb = p_limeColor.a > 0.001 ? (p_limeColor.rgb / p_limeColor.a) : float3(0.0);
  return half4(half3(rgb * a), half(a));
}`;

export interface ChevronRibbonOptions {
  parentId: string;
  format: MotionFormat;
  theme: BrandTheme;
  schedule: BeatGridSchedule;
  focalBounds: BBox;
  color?: string;
  chevronSlope?: number;
  layer?: number;
}

export interface ChevronRibbonResult {
  shader: CustomShaderIR;
  node: ShapeNodeIR;
  motion: MotionBlockIR;
}

/**
 * L1 Behavior: Procedural 3D-Projected Rotating Square-Pillar Chevron Ribbon.
 * Couples central gap & pillar width to `focalBounds` and pulses spin on every statement beat.
 */
export function createChevronRibbon(opts: ChevronRibbonOptions): ChevronRibbonResult {
  const shaderId = "glean_chevron_ribbon_v3";
  const placementId = "fill_chevron_ribbon";
  const nodeId = "central_lime_ribbon";
  const color = opts.color ?? opts.theme.accentFresh;
  const slope = opts.chevronSlope ?? 0.86;

  // Adapt ribbon proportions to canvas & headline focal box
  const boxW = Math.round(opts.format.width * 0.28125);
  const boxH = Math.round(opts.format.height * 0.9444);
  const settledPillar = Math.round(opts.format.width * 0.126);
  const settledGap = Math.round(
    Math.max(
      opts.format.height * 0.12,
      Math.min(opts.format.height * 0.2, opts.focalBounds.height * 0.335)
    )
  );
  const settledFade = Math.round(opts.format.height * 0.403);

  const shader: CustomShaderIR = {
    id: shaderId,
    version: 1,
    name: "Spinning Chevron Ribbon",
    description:
      "3D-projected rotating square-pillar chevron hourglass ribbon with vertical fade",
    cost: "light",
    sksl: CHEVRON_RIBBON_SKSL,
    properties: [
      {
        id: "spinAngle",
        label: "Spin Angle",
        type: "number",
        uniformName: "p_spinAngle",
        defaultValue: -222,
        min: -720,
        max: 360,
        step: 1,
        unit: "deg",
      },
      {
        id: "pillarSize",
        label: "Pillar Width",
        type: "number",
        uniformName: "p_pillarSize",
        defaultValue: settledPillar,
        min: 40,
        max: 320,
        step: 1,
        unit: "px",
      },
      {
        id: "baseHalfGap",
        label: "Outer Half Gap",
        type: "number",
        uniformName: "p_baseHalfGap",
        defaultValue: settledGap,
        min: 10,
        max: 240,
        step: 1,
        unit: "px",
      },
      {
        id: "chevronSlope",
        label: "Chevron Slope",
        type: "number",
        uniformName: "p_chevronSlope",
        defaultValue: slope,
        min: 0,
        max: 2,
        step: 0.01,
      },
      {
        id: "fadeHeight",
        label: "Fade Height",
        type: "number",
        uniformName: "p_fadeHeight",
        defaultValue: settledFade,
        min: 40,
        max: 520,
        step: 1,
        unit: "px",
      },
      {
        id: "limeColor",
        label: "Ribbon Color",
        type: "color",
        uniformName: "p_limeColor",
        defaultValue: color,
      },
    ],
  };

  const node: ShapeNodeIR = {
    id: nodeId,
    kind: "shape",
    name: "Central Chevron Ribbon",
    slot: "backdrop-ribbon",
    role: "backdrop",
    parentId: opts.parentId,
    layer: opts.layer ?? 1,
    base: {
      x: Math.round((opts.format.width - boxW) / 2),
      y: Math.round((opts.format.height - boxH) / 2),
      width: boxW,
      height: boxH,
    },
    shape: "rectangle",
    fill: {
      kind: "shader",
      shaderId,
      placementId,
      params: {
        spinAngle: -222,
        pillarSize: settledPillar,
        baseHalfGap: settledGap,
        chevronSlope: slope,
        fadeHeight: settledFade,
        limeColor: color,
      },
    },
  };

  const endF = Math.max(10, opts.schedule.introEndFrame - 2);
  const beats = opts.schedule.beatFrames;
  const spinKeys: ScalarKey[] = [];
  const totalSpinDeg = -216;
  const stepPerBeat = totalSpinDeg / Math.max(1, beats.length);

  beats.forEach((bf, i) => {
    const angleAtBeat = Math.round(-20 + i * stepPerBeat);
    if (i === 0) {
      spinKeys.push({
        id: `rib_spin_${i}a`,
        frame: 0,
        value: -20,
        easing: { kind: "easing", preset: "easeOutQuad" },
      });
    } else {
      const preF = Math.max(spinKeys[spinKeys.length - 1]!.frame + 1, bf - 1);
      spinKeys.push({
        id: `rib_spin_${i}_pre`,
        frame: preF,
        value: Math.round(angleAtBeat + 22),
        easing: { kind: "linear" },
      });
      spinKeys.push({
        id: `rib_spin_${i}_hit`,
        frame: bf,
        value: angleAtBeat,
        easing: { kind: "easing", preset: "easeOutQuart" },
      });
    }
    const nextLimit = beats[i + 1] ?? Math.min(endF - 4, bf + opts.schedule.framesForSec(0.35, 7));
    const settleF = Math.min(nextLimit - 2, bf + opts.schedule.framesForSec(0.28, 6));
    if (settleF > bf + 1) {
      spinKeys.push({
        id: `rib_spin_${i}_post`,
        frame: settleF,
        value: Math.round(angleAtBeat + stepPerBeat * 0.62),
        easing: { kind: "easing", preset: "easeOutSine" },
      });
    }
  });
  spinKeys.push({
    id: "rib_spin_end",
    frame: endF,
    value: -236,
  });

  const pinchBeat = beats[1] ?? Math.round(endF * 0.25);
  const pillarKeys: ScalarKey[] = [
    {
      id: "rib_pil_0",
      frame: 0,
      value: Math.round(settledPillar * 0.78),
      easing: { kind: "linear" },
    },
    {
      id: "rib_pil_1",
      frame: Math.max(1, pinchBeat),
      value: Math.round(settledPillar * 0.55),
      easing: { kind: "easing", preset: "easeOutCubic" },
    },
    {
      id: "rib_pil_2",
      frame: Math.min(endF - 2, pinchBeat + opts.schedule.framesForSec(0.22, 5)),
      value: settledPillar,
      easing: { kind: "linear" },
    },
    {
      id: "rib_pil_end",
      frame: endF,
      value: settledPillar,
    },
  ];

  const gapKeys: ScalarKey[] = [
    {
      id: "rib_gap_0",
      frame: 0,
      value: settledGap + 8,
      easing: { kind: "linear" },
    },
    {
      id: "rib_gap_1",
      frame: Math.max(1, pinchBeat),
      value: Math.max(16, settledGap - 4),
      easing: { kind: "easing", preset: "easeOutQuad" },
    },
    {
      id: "rib_gap_end",
      frame: endF,
      value: settledGap,
    },
  ];

  const fadeKeys: ScalarKey[] = [
    {
      id: "rib_fade_0",
      frame: 0,
      value: Math.round(settledFade * 0.53),
      easing: { kind: "easing", preset: "easeOutQuad" },
    },
    {
      id: "rib_fade_mid",
      frame: Math.min(endF - 2, Math.round(endF * 0.55)),
      value: Math.round(settledFade * 1.05),
      easing: { kind: "linear" },
    },
    {
      id: "rib_fade_end",
      frame: endF,
      value: Math.round(settledFade * 1.05),
    },
  ];

  const motion: MotionBlockIR = {
    kind: "shaderParams",
    id: `${nodeId}__objectFill__${placementId}__keys`,
    name: "Spinning Chevron Ribbon",
    targetId: nodeId,
    placementId,
    shaderId,
    startFrame: 0,
    durationFrames: endF + 2,
    tracks: {
      spinAngle: spinKeys,
      pillarSize: pillarKeys,
      baseHalfGap: gapKeys,
      fadeHeight: fadeKeys,
    },
  };

  return { shader, node, motion };
}
