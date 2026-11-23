export type EasingPreset =
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeOutQuart"
  | "easeInSine"
  | "easeOutSine"
  | "easeInOutSine";

export type EasingSpec =
  | { kind: "linear" }
  | { kind: "hold" }
  | { kind: "easing"; preset: EasingPreset }
  | { kind: "cubicBezier"; x1: number; y1: number; x2: number; y2: number };

export interface ColorStop {
  offset: number;
  color: string;
}

export interface BrandTheme {
  id: string;
  name: string;
  surface: string;
  ink: string;
  brandPrimary: string;
  accentFresh: string;
  accentWarm: string;
  fontFamily: string;
  fontWeight: number;
  orbRadialStops: ColorStop[];
  warmLinearStops: ColorStop[];
  freshRadialStops: ColorStop[];
  emblemOutWarmStops: ColorStop[];
  emblemInPrimaryStops: ColorStop[];
  emblemInSecondaryStops: ColorStop[];
}

export interface FeelPreset {
  id: string;
  name: string;
  lineSlideSec: number;
  lineTrackSec: number;
  focusPullSec: number;
  introFadeSec: number;
  emblemLeadSec: number;
  minBeatHoldSec: number;
  minEndHoldSec: number;
  textSlideEase: EasingSpec;
  pulseEase: EasingSpec;
}

export const GLEAN_EDITORIAL_THEME: BrandTheme = {
  id: "glean-editorial",
  name: "Glean Warm Editorial",
  surface: "#F7F2EB",
  ink: "#000000",
  brandPrimary: "#333CEE",
  accentFresh: "#DCFC5E",
  accentWarm: "#FFA488",
  fontFamily: "Geist",
  fontWeight: 420,
  orbRadialStops: [
    { offset: 0, color: "#435CFF" },
    { offset: 0.55, color: "#2A37E6" },
    { offset: 1, color: "#1C24CC" },
  ],
  warmLinearStops: [
    { offset: 0, color: "#B7D3EB" },
    { offset: 0.48, color: "#DEC8C4" },
    { offset: 1, color: "#FFA488" },
  ],
  freshRadialStops: [
    { offset: 0, color: "#DBFD49" },
    { offset: 0.45, color: "#C6F384" },
    { offset: 1, color: "#B3E8CF" },
  ],
  emblemOutWarmStops: [
    { offset: 0, color: "#FFA385" },
    { offset: 0.55, color: "#D6C9CF" },
    { offset: 1, color: "#B8CCE5" },
  ],
  emblemInPrimaryStops: [
    { offset: 0, color: "#DDF05B" },
    { offset: 0.65, color: "#CCEE57" },
    { offset: 1, color: "#B3E853" },
  ],
  emblemInSecondaryStops: [
    { offset: 0, color: "#BBE954" },
    { offset: 0.5, color: "#8EE151" },
    { offset: 1, color: "#62D34D" },
  ],
};

export const VERIDIAN_NOIR_THEME: BrandTheme = {
  id: "veridian-noir",
  name: "Veridian Obsidian & Coral",
  surface: "#0E131F",
  ink: "#F6F8FC",
  brandPrimary: "#00D4B2",
  accentFresh: "#3BF5C8",
  accentWarm: "#FF7A59",
  fontFamily: "Geist",
  fontWeight: 500,
  orbRadialStops: [
    { offset: 0, color: "#3DF5D4" },
    { offset: 0.55, color: "#00B89C" },
    { offset: 1, color: "#007A6E" },
  ],
  warmLinearStops: [
    { offset: 0, color: "#FFD166" },
    { offset: 0.5, color: "#FF926B" },
    { offset: 1, color: "#FF5E7E" },
  ],
  freshRadialStops: [
    { offset: 0, color: "#80FFDB" },
    { offset: 0.5, color: "#5390D9" },
    { offset: 1, color: "#6930C3" },
  ],
  emblemOutWarmStops: [
    { offset: 0, color: "#FF7A59" },
    { offset: 0.55, color: "#FFB56B" },
    { offset: 1, color: "#FFE082" },
  ],
  emblemInPrimaryStops: [
    { offset: 0, color: "#FFFDF7" },
    { offset: 0.6, color: "#B8FFF1" },
    { offset: 1, color: "#5CE6CC" },
  ],
  emblemInSecondaryStops: [
    { offset: 0, color: "#FFE66D" },
    { offset: 0.5, color: "#A8FF78" },
    { offset: 1, color: "#3BF5C8" },
  ],
};

export const SNAPPY_EDITORIAL_FEEL: FeelPreset = {
  id: "snappy-editorial",
  name: "Snappy Editorial",
  lineSlideSec: 0.88,
  lineTrackSec: 0.82,
  focusPullSec: 0.5,
  introFadeSec: 0.2,
  emblemLeadSec: 0.67,
  minBeatHoldSec: 0.45,
  minEndHoldSec: 0.2,
  textSlideEase: { kind: "easing", preset: "easeOutQuart" },
  pulseEase: { kind: "easing", preset: "easeOutCubic" },
};

export function solveCubicBezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const sampleCurveX = (t: number) => ((1 - 3 * x2 + 3 * x1) * t * t * t) + ((3 * x2 - 6 * x1) * t * t) + (3 * x1 * t);
  const sampleCurveY = (t: number) => ((1 - 3 * y2 + 3 * y1) * t * t * t) + ((3 * y2 - 6 * y1) * t * t) + (3 * y1 * t);
  const sampleDerivX = (t: number) => (3 * (1 - 3 * x2 + 3 * x1) * t * t) + (2 * (3 * x2 - 6 * x1) * t) + (3 * x1);

  let t = x;
  for (let i = 0; i < 8; i++) {
    const err = sampleCurveX(t) - x;
    if (Math.abs(err) < 1e-6) return sampleCurveY(t);
    const d = sampleDerivX(t);
    if (Math.abs(d) < 1e-6) break;
    t -= err / d;
  }
  let lo = 0;
  let hi = 1;
  t = x;
  for (let i = 0; i < 14; i++) {
    const v = sampleCurveX(t);
    if (Math.abs(v - x) < 1e-6) break;
    if (x > v) lo = t;
    else hi = t;
    t = 0.5 * (lo + hi);
  }
  return sampleCurveY(t);
}

export function evaluateEasing(spec: EasingSpec | undefined, rawT: number): number {
  const t = Math.max(0, Math.min(1, rawT));
  if (!spec || spec.kind === "linear") return t;
  if (spec.kind === "hold") return t >= 1 ? 1 : 0;
  if (spec.kind === "cubicBezier") {
    return solveCubicBezier(spec.x1, spec.y1, spec.x2, spec.y2, t);
  }
  switch (spec.preset) {
    case "easeInQuad":
      return t * t;
    case "easeOutQuad":
      return 1 - (1 - t) * (1 - t);
    case "easeInOutQuad":
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case "easeInCubic":
      return t * t * t;
    case "easeOutCubic":
      return 1 - Math.pow(1 - t, 3);
    case "easeInOutCubic":
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case "easeOutQuart":
      return 1 - Math.pow(1 - t, 4);
    case "easeInSine":
      return 1 - Math.cos((t * Math.PI) / 2);
    case "easeOutSine":
      return Math.sin((t * Math.PI) / 2);
    case "easeInOutSine":
      return -(Math.cos(Math.PI * t) - 1) / 2;
  }
}
