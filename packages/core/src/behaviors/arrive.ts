import type { CueIR, TextNodeIR } from "../kernel/ir.ts";
import type { Score } from "../kernel/score.ts";
import type { Feel } from "../feel/index.ts";

/**
 * A first estimate of how long a short line takes to read at headline size: 0.3 s to find it,
 * and 0.045 s per character. Override it per line when the estimate misleads: a number or a name
 * needs longer, a word the viewer expects needs less.
 */
export function readingSec(text: string): number {
  return Math.round((0.3 + 0.045 * Array.from(text).length) * 100) / 100;
}

export interface ArriveOptions {
  /** One cue per line, in order. */
  on: CueIR[];
  feel: Feel;
  /** The frame the shot stops offering the lines: where focus goes, or the cut. */
  until: number;
  /** Seconds each line needs, in order. A missing entry uses `readingSec`. */
  needsSec?: (number | undefined)[];
  /** The side the lines come from. Defaults to `"right"`, against the reading direction, so each line settles into its start. */
  from?: "right" | "left" | "below" | "above";
}

/**
 * Brings lines in on their cues. Each shows whole on its cue and slides to rest while its
 * letter-spacing closes, so the cue is where it is first seen and the settle carries on under
 * the next arrival. Wider lines travel further, by the square root of their width, so a long
 * line does not look slower than a short one.
 *
 * It also records what each line is owed: its cue, its reading time and the frame the shot stops
 * offering it. The audit holds the shot to that.
 */
export function arrive(score: Score, lines: TextNodeIR[], opts: ArriveOptions): void {
  if (opts.on.length !== lines.length) {
    throw new Error(`arrive() got ${lines.length} line(s) and ${opts.on.length} cue(s). Give one cue per line.`);
  }
  const { feel } = opts;
  const side = opts.from ?? "right";
  const sign = side === "left" || side === "above" ? -1 : 1;
  const vertical = side === "below" || side === "above";

  lines.forEach((line, i) => {
    const cue = opts.on[i]!;
    const travel =
      Math.round(line.fontSize * feel.arrive.travelEm * Math.sqrt(Math.max(1, line.base.width / line.fontSize))) * sign;
    const slide = score.frames(feel.arrive.travelSec, 2);
    const settle = score.frames(feel.arrive.settleSec, 2);
    const loose = Math.round((line.letterSpacing + line.fontSize * feel.arrive.looseEm) * 10) / 10;
    const reason = { purpose: "arrive" as const, cues: [cue.name], lands: "start" as const };

    const slideId = score.id(`act_${line.id}_slide`);
    score.track({
      kind: "vec2",
      id: slideId,
      name: `${line.text} arrives`,
      targetId: line.id,
      property: "move",
      mode: "add",
      stage: "in",
      startFrame: cue.frame,
      durationFrames: slide,
      reason,
      keys: [
        { id: `${slideId}_k0`, frame: 0, x: vertical ? 0 : travel, y: vertical ? travel : 0, easing: feel.arrive.ease },
        { id: `${slideId}_k1`, frame: slide - 1, x: 0, y: 0 },
      ],
    });

    const trackId = score.id(`act_${line.id}_track`);
    score.track({
      kind: "scalar",
      id: trackId,
      name: `${line.text} closes up`,
      targetId: line.id,
      property: "letterSpacing",
      mode: "set",
      stage: "custom",
      startFrame: cue.frame,
      durationFrames: settle,
      baseValue: line.letterSpacing,
      reason,
      keys: [
        { id: `${trackId}_k0`, frame: 0, value: loose, easing: feel.arrive.ease },
        { id: `${trackId}_k1`, frame: settle - 1, value: line.letterSpacing },
      ],
    });

    score.subjects.push({
      nodeId: line.id,
      cue: cue.name,
      needsSec: opts.needsSec?.[i] ?? readingSec(line.text),
      untilFrame: opts.until,
      accent: cue.kind === "accent",
    });
  });
}
