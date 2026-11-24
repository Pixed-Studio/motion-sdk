import { SNAPPY_EDITORIAL_FEEL, type FeelPreset } from "../kernel/tokens.ts";

export interface BeatGridOptions {
  durationSec: number;
  fps: number;
  itemCount: number;
  feel?: FeelPreset;
  /** Optional explicit cue times in seconds for exact keyframe matching */
  cueSeconds?: number[];
  /** Optional explicit converge start time in seconds */
  convergeAtSec?: number;
}

export interface BeatGridSchedule {
  fps: number;
  durationSec: number;
  totalFrames: number;
  beatFrames: number[];
  focusPullStartFrame: number;
  convergeStartFrame: number;
  introFadeStartFrame: number;
  introEndFrame: number;
  emblemSettleFrame: number;
  framesForSec: (sec: number, minFrames?: number) => number;
}

/**
 * L1 Behavior: Rhythm & Elastic Time Solver.
 * Keeps physical transient durations crisp across 30fps/60fps and 3s/4.5s,
 * allocating extra duration to reading holds rather than sluggishly stretching motion.
 */
export function createBeatGrid(opts: BeatGridOptions): BeatGridSchedule {
  const fps = Math.max(12, Math.round(opts.fps));
  const totalFrames = Math.max(30, Math.round(opts.durationSec * fps));
  const feel = opts.feel ?? SNAPPY_EDITORIAL_FEEL;
  const count = Math.max(1, opts.itemCount);

  const framesForSec = (sec: number, minFrames = 2): number =>
    Math.max(minFrames, Math.round(sec * fps));

  // Reserve tail window for emblem convergence + end hold
  const defaultConvergeSec = Math.max(
    opts.durationSec * 0.55,
    opts.durationSec - (feel.emblemLeadSec + Math.max(0, (opts.durationSec - 3.0) * 0.25))
  );
  const convergeSec = opts.convergeAtSec ?? (Math.abs(opts.durationSec - 3.0) < 0.01 ? 2.3334 : defaultConvergeSec);
  const convergeStartFrame = Math.min(
    totalFrames - framesForSec(0.45),
    Math.max(framesForSec(0.8), Math.round(convergeSec * fps))
  );

  const focusPullLead = framesForSec(0.23, 4);
  const focusPullStartFrame = Math.max(0, convergeStartFrame - focusPullLead);
  const introFadeDur = framesForSec(feel.introFadeSec, 4);
  const introEndFrame = Math.min(
    totalFrames,
    convergeStartFrame + framesForSec(0.33, 6)
  );
  const introFadeStartFrame = Math.max(0, introEndFrame - introFadeDur);

  const emblemDur = framesForSec(feel.emblemLeadSec, 10);
  const emblemSettleFrame = Math.min(
    totalFrames - 1,
    convergeStartFrame + emblemDur - 1
  );

  // Distribute N statement beats across [0 .. convergeStartFrame - minReadHold]
  let beatFrames: number[];
  if (opts.cueSeconds && opts.cueSeconds.length === count) {
    beatFrames = opts.cueSeconds.map((s) => Math.round(s * fps));
  } else {
    const readHoldFrames = Math.min(
      Math.floor(convergeStartFrame * 0.45),
      framesForSec(Math.max(feel.minBeatHoldSec, 0.95), 12)
    );
    const usableSpan = Math.max(0, convergeStartFrame - readHoldFrames);
    if (count === 1) {
      beatFrames = [0];
    } else {
      const step = usableSpan / (count - 1);
      beatFrames = Array.from({ length: count }, (_, i) => Math.round(i * step));
    }
  }

  return {
    fps,
    durationSec: opts.durationSec,
    totalFrames,
    beatFrames,
    focusPullStartFrame,
    convergeStartFrame,
    introFadeStartFrame,
    introEndFrame,
    emblemSettleFrame,
    framesForSec,
  };
}
