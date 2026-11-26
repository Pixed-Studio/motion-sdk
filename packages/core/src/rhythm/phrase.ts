import type { CueIR, ScoreNote } from "../kernel/ir.ts";
import type { Clock } from "./clock.ts";

export interface PhraseOptions {
  /** How many things arrive. */
  count: number;
  /** The first arrival is on `from`. After `to` the shot stops offering the subjects (a blur, a cut). */
  window: { from: number; to: number };
  clock: Clock;
  /**
   * Which arrival carries the weight. It keeps the stage longest and the world answers it hardest.
   * `"last"` (the default) builds to a landing: right for a statement whose point is its end.
   * `"first"` states the point and lets the rest qualify it. `"none"` gives every arrival the same
   * time: right for a list of equals, where a build would promise a climax the copy does not have.
   * A number picks the arrival by index.
   */
  accent?: "last" | "first" | "none" | number;
  /**
   * How many run-up steps of time the accent keeps before the next event. Defaults to 1.5 for up to
   * three arrivals and 2.5 above. With more arrivals the early ones read as a run-up, each needs
   * less, and what they save goes to the landing. Lower it toward 1 for an even count.
   */
  hold?: number;
  /** Frames each arrival needs to be read, in order. */
  needFrames: number[];
  /** Frames one arrival holds the eye. Steps shorter than this are reported. */
  claimFrames: number;
  /** Arrival times in seconds. Given, the solver places nothing and only reports. */
  at?: number[];
  /** Cue names are `<prefix>-1`, `<prefix>-2`, and so on. */
  prefix?: string;
}

export interface Phrase {
  cues: CueIR[];
  /** Index of the accent among the cues, or null. */
  accent: number | null;
  notes: ScoreNote[];
}

function accentIndex(accent: PhraseOptions["accent"], count: number): number | null {
  if (accent === "none" || count < 2) return accent === "none" ? null : count === 1 ? 0 : null;
  if (accent === undefined || accent === "last") return count - 1;
  if (accent === "first") return 0;
  return Math.max(0, Math.min(count - 1, Math.round(accent)));
}

/** Shares the window out in units of time: one per arrival, `hold` for the accent. */
function solveFree(count: number, from: number, to: number, accent: number | null, hold: number): number[] {
  const units = Array.from({ length: count }, (_, i) => (i === accent ? hold : 1));
  const step = (to - from) / units.reduce((a, b) => a + b, 0);
  let elapsed = 0;
  return units.map((u) => {
    const frame = Math.round(from + elapsed * step);
    elapsed += u;
    return frame;
  });
}

/**
 * When the last arrival would be left less than its reading time, the arrivals before it close up
 * to give it that time, as far as one claim each allows. What still does not fit is for the audit.
 */
function makeRoom(frames: number[], opts: PhraseOptions): number[] {
  const { from, to } = opts.window;
  const last = frames.length - 1;
  const latest = to - (opts.needFrames[last] ?? 0);
  if (last < 1 || frames[last]! <= latest) return frames;
  const earliest = from + last * opts.claimFrames;
  const target = Math.max(latest, Math.min(earliest, frames[last]!));
  const k = (target - from) / (frames[last]! - from);
  return frames.map((f) => Math.round(from + (f - from) * k));
}

/**
 * Places the arrivals on the tempo's grid. The accent takes the whole beat nearest its free
 * position that still leaves it its reading time. The arrivals before it run from the first grid
 * position on consecutive steps of the coarsest division that leaves a step of rest before the
 * accent, so a longer run-up moves to eighths and then sixteenths. Arrivals after it follow on
 * the same division once the accent has had its hold.
 */
function solveOnGrid(opts: PhraseOptions, accent: number | null, hold: number, free: number[]): number[] {
  const { clock, count } = opts;
  const { from, to } = opts.window;
  const beat = clock.beatSec! * clock.fps;
  const first = clock.frame(clock.snap(clock.sec(from), 4, "up"));
  const latest = (i: number) => to - (opts.needFrames[i] ?? 0);
  const divisions = [1, 2, 4];

  if (accent === null) {
    const division = divisions.find((d) => first + (count - 1) * (beat / d) <= latest(count - 1)) ?? 4;
    return Array.from({ length: count }, (_, i) => Math.round(first + i * (beat / division)));
  }

  const after = count - 1 - accent;
  const wholeBeat = (frame: number, direction: "nearest" | "down") =>
    clock.frame(clock.snap(clock.sec(frame), 1, direction));
  let accentFrame = wholeBeat(free[accent]!, "nearest");
  const accentLatest = latest(accent) - (after > 0 ? after * opts.claimFrames : 0);
  if (accentFrame > accentLatest) accentFrame = wholeBeat(accentLatest, "down");
  if (accent > 0) accentFrame = Math.max(accentFrame, Math.round(first + beat / 4));
  else accentFrame = Math.max(first, accentFrame);

  const before = accent;
  const runUp = divisions.find((d) => first + before * (beat / d) <= accentFrame + 1e-6) ?? 4;
  const out: number[] = [];
  for (let i = 0; i < before; i++) out.push(Math.round(first + i * (beat / runUp)));
  out.push(accentFrame);
  if (after > 0) {
    const tail =
      divisions.find((d) => accentFrame + (Math.ceil(hold) + after - 1) * (beat / d) <= latest(count - 1)) ?? 4;
    for (let k = 0; k < after; k++) {
      out.push(Math.round(accentFrame + (Math.ceil(hold) + k) * (beat / tail)));
    }
  }
  return out;
}

/**
 * Turns "this many things arrive, and this one matters most" into cues.
 *
 * Without a tempo it shares the window out by weight. On a tempo it places the same decision on
 * the grid, which is what makes a build land on a beat. It never hides a squeeze: when the
 * arrivals cannot each hold the eye for one claim, the cues are still returned and the note says
 * how much time the phrase needs and what would give it.
 */
export function solvePhrase(opts: PhraseOptions): Phrase {
  const { count, clock } = opts;
  const { from, to } = opts.window;
  const prefix = opts.prefix ?? "arrival";
  const notes: ScoreNote[] = [];
  const accent = accentIndex(opts.accent, count);
  const hold = accent === null ? 1 : (opts.hold ?? (count <= 3 ? 1.5 : 2.5));

  let frames: number[];
  if (opts.at) {
    if (opts.at.length !== count) {
      throw new Error(`Got ${opts.at.length} cue time(s) for ${count} arrival(s). Give one per arrival, in seconds.`);
    }
    frames = opts.at.map((s) => clock.frame(s));
  } else {
    const free = makeRoom(solveFree(count, from, to, accent, hold), opts);
    frames = clock.tempo ? solveOnGrid(opts, accent, hold, free) : free;
  }

  let tightest = Infinity;
  for (let i = 1; i < frames.length; i++) tightest = Math.min(tightest, frames[i]! - frames[i - 1]!);
  if (count > 1 && tightest < opts.claimFrames) {
    const lastNeed = opts.needFrames[count - 1] ?? 0;
    const needed = (count - 1) * opts.claimFrames + lastNeed;
    const have = to - from;
    const fits = Math.max(1, Math.floor((have - lastNeed) / Math.max(1, opts.claimFrames)) + 1);
    notes.push({
      rule: "budget",
      severity: "error",
      message:
        `${count} arrivals are ${tightest} frame(s) apart at the tightest, and one arrival holds the eye for ` +
        `${opts.claimFrames} frames at this feel. The phrase needs ${clock.sec(needed).toFixed(2)} s and has ${clock.sec(have).toFixed(2)} s.`,
      fix:
        `Give the shot ${clock.sec(Math.max(0, needed - have)).toFixed(2)} s more, group the copy into ${fits} arrival(s) or fewer, ` +
        `or choose a feel with a shorter claim.`,
    });
  }

  const runUp = accent === null ? 0 : accent;
  const cues: CueIR[] = frames.map((frame, i) => {
    const isAccent = i === accent;
    const weight =
      accent === null ? 1 : isAccent ? 1.15 : i < accent ? (runUp <= 1 ? 0.9 : 0.8 + (0.2 * i) / (runUp - 1)) : 0.9;
    return {
      name: `${prefix}-${i + 1}`,
      frame,
      kind: isAccent ? "accent" : "beat",
      weight: Math.round(weight * 100) / 100,
      why: isAccent
        ? "The arrival the phrase builds to. It keeps the stage longest and the world answers it hardest."
        : accent !== null && i < accent
          ? "A step of the run-up toward the accent."
          : "An arrival.",
    };
  });

  return { cues, accent, notes };
}
