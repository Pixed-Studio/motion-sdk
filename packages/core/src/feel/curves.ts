import { bezier, hold, linear, type EasingSpec } from "../kernel/easing.ts";

/**
 * The curve families a motion designer names, each a function of how hard it is. A family keeps
 * its character at any speed: say the family, then give the move its seconds. The shapes come from
 * the reference films; `hard` runs from 0 (barely that shape) to 1 (as far as it goes).
 */

/**
 * 急停. Fastest on the frame it shows, then a long stop: a landing, a word gliding the last of its
 * way. The films' landings and entrances lose about three tenths of what is left every frame,
 * which is `brake()` over half a second to two thirds of one.
 */
export function brake(hard = 0.7): EasingSpec {
  const h = Math.max(0, Math.min(1, hard));
  return bezier(round(0.3 * (1 - h)), round(0.4 + 0.6 * h), round(0.7 - 0.45 * h), 1);
}

/**
 * 冲出. Slow to start and faster all the way, with no stop: an exit the cut takes while it is
 * still gaining speed. In the films each frame's step is about 1.4 times the one before.
 */
export function launch(hard = 0.5): EasingSpec {
  const h = Math.max(0, Math.min(1, hard));
  return bezier(round(0.4 + 0.45 * h), 0, 1, round(1 - 0.5 * h));
}

/**
 * 甩. Almost still at both ends and very fast between: the move that makes room. The films' are
 * near (0.84, 0, 0.16, 1), over 0.4 to 0.8 seconds, which is `whip()`.
 */
export function whip(hard = 0.85): EasingSpec {
  const h = Math.max(0, Math.min(1, hard));
  return bezier(round(0.5 + 0.4 * h), 0, round(0.5 - 0.4 * h), 1);
}

/** 匀. One steady pace: what a finished line does while it is read. */
export const even: EasingSpec = linear;

/** Each value is held until the next: a flicker, a swap. */
export const step: EasingSpec = hold;

export type CurveName = "brake" | "launch" | "whip" | "even" | "step";

/** A curve by its family's name, or any easing. */
export type Curve = CurveName | EasingSpec;

const named: Record<CurveName, EasingSpec> = { brake: brake(), launch: launch(), whip: whip(), even, step };

export function curveOf(curve: Curve | undefined, fallback: EasingSpec): EasingSpec {
  if (curve === undefined) return fallback;
  if (typeof curve !== "string") return curve;
  const found = named[curve];
  if (!found) throw new Error(`No curve family "${curve}". Families: ${Object.keys(named).join(", ")}; or give an easing (bezier(), ease()).`);
  return found;
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
