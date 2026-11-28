export type EasingPreset =
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeOutQuart"
  | "easeOutExpo"
  | "easeInSine"
  | "easeOutSine"
  | "easeInOutSine";

export type EasingSpec =
  | { kind: "linear" }
  | { kind: "hold" }
  | { kind: "easing"; preset: EasingPreset }
  | { kind: "cubicBezier"; x1: number; y1: number; x2: number; y2: number };

export const linear: EasingSpec = { kind: "linear" };
export const hold: EasingSpec = { kind: "hold" };

export function ease(preset: EasingPreset): EasingSpec {
  return { kind: "easing", preset };
}

export function bezier(x1: number, y1: number, x2: number, y2: number): EasingSpec {
  return { kind: "cubicBezier", x1, y1, x2, y2 };
}

export function solveCubicBezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const curveX = (t: number) => (1 - 3 * x2 + 3 * x1) * t * t * t + (3 * x2 - 6 * x1) * t * t + 3 * x1 * t;
  const curveY = (t: number) => (1 - 3 * y2 + 3 * y1) * t * t * t + (3 * y2 - 6 * y1) * t * t + 3 * y1 * t;
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 24; i++) {
    const v = curveX(t);
    if (Math.abs(v - x) < 1e-6) break;
    if (x > v) lo = t;
    else hi = t;
    t = 0.5 * (lo + hi);
  }
  return curveY(t);
}

export function evaluateEasing(spec: EasingSpec | undefined, rawT: number): number {
  const t = Math.max(0, Math.min(1, rawT));
  if (!spec || spec.kind === "linear") return t;
  if (spec.kind === "hold") return t >= 1 ? 1 : 0;
  if (spec.kind === "cubicBezier") return solveCubicBezier(spec.x1, spec.y1, spec.x2, spec.y2, t);
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
    case "easeOutExpo":
      // What is left halves every tenth of the span: a landing that is mostly over in its first third.
      return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    case "easeInSine":
      return 1 - Math.cos((t * Math.PI) / 2);
    case "easeOutSine":
      return Math.sin((t * Math.PI) / 2);
    case "easeInOutSine":
      return -(Math.cos(Math.PI * t) - 1) / 2;
  }
}
