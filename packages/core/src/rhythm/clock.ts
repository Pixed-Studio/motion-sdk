/** A tempo to place cues on. `offsetSec` is where beat 0 falls. */
export interface Tempo {
  bpm: number;
  offsetSec?: number;
}

export interface Clock {
  fps: number;
  durationSec: number;
  totalFrames: number;
  tempo: Tempo | undefined;
  /** Seconds of one beat, or undefined without a tempo. */
  beatSec: number | undefined;
  frame: (sec: number) => number;
  sec: (frame: number) => number;
  /** Seconds at beat `n`. Fractions are subdivisions: 1.5 is the "and" of beat 1. */
  beat: (n: number) => number;
  /**
   * The grid position nearest `sec` in the given direction. `division` 1 is beats, 2 eighths,
   * 4 sixteenths. Without a tempo it returns `sec` unchanged.
   */
  snap: (sec: number, division?: number, direction?: "nearest" | "down" | "up") => number;
}

/**
 * The shot's clock. With a tempo, cues can be named in beats and snapped to the grid, which is
 * how a cut to music is made; without one, time is seconds and the solvers space things freely.
 */
export function createClock(opts: { fps: number; durationSec: number; tempo?: Tempo }): Clock {
  const fps = opts.fps;
  const beatSec = opts.tempo ? 60 / opts.tempo.bpm : undefined;
  const offset = opts.tempo?.offsetSec ?? 0;
  return {
    fps,
    durationSec: opts.durationSec,
    totalFrames: Math.round(opts.durationSec * fps),
    tempo: opts.tempo,
    beatSec,
    frame: (sec) => Math.round(sec * fps),
    sec: (frame) => frame / fps,
    beat: (n) => {
      if (beatSec === undefined) throw new Error("The clock has no tempo; name the time in seconds.");
      return offset + n * beatSec;
    },
    snap: (sec, division = 1, direction = "nearest") => {
      if (beatSec === undefined) return sec;
      const step = beatSec / division;
      const position = (sec - offset) / step;
      const eps = 1e-6;
      const index =
        direction === "down"
          ? Math.floor(position + eps)
          : direction === "up"
            ? Math.ceil(position - eps)
            : Math.round(position);
      return offset + index * step;
    },
  };
}
