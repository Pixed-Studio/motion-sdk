import { bezier, ease, type EasingSpec } from "../kernel/easing.ts";

export * from "./curves.ts";

/**
 * How things move, apart from what moves and when. A feel names its transients by the job they do
 * (arrive, respond, depart, carry), so any shot can take any feel. Transients are in seconds:
 * a longer shot keeps them and gives the extra time to holds.
 */
export interface Feel {
  id: string;
  name: string;
  /**
   * Seconds one arrival holds the eye: about the time it takes to do most of its travel. Two
   * arrivals closer than this compete, and the second is missed.
   */
  claimSec: number;
  arrive: {
    /** Seconds from showing on the cue to rest. Most of the travel is over within one claim. */
    travelSec: number;
    /** Seconds the letter-spacing takes to close. */
    settleSec: number;
    /** Travel in em for a line one em wide; it grows with the square root of the line's width. */
    travelEm: number;
    /** Extra letter-spacing at the start, in em. */
    looseEm: number;
    ease: EasingSpec;
    /** Seconds between the words of one arrival. Shorter than a claim on purpose: they read as one gesture. */
    staggerSec: number;
    /** Seconds a word takes to come into focus, and the blur it starts from in design units. */
    focusSec: number;
    focusBlur: number;
    /** Seconds what is already on the line takes to make room for a word joining it. */
    shiftSec: number;
  };
  punch: {
    /** How large an accent starts when it has the stage to itself, as a multiple of its resting size. */
    scale: number;
    /** Seconds it takes to settle to its resting size. Most of the fall is in the first third. */
    sec: number;
    ease: EasingSpec;
  };
  respond: {
    /** Seconds an answer winds up before its cue. */
    windUpSec: number;
    /** Seconds it takes to spend its speed after the cue. */
    releaseSec: number;
    /** Share of the answer's travel done before the cue. Above 0 the peak sits on the cue. */
    anticipate: number;
    /** Share left for slow travel between answers, so nothing stops dead. */
    drift: number;
    easeIn: EasingSpec;
    easeOut: EasingSpec;
  };
  depart: {
    /** Seconds before the turn that focus starts to go. The subjects are offered until then. */
    leadSec: number;
    /** Seconds after the turn until the outgoing world is gone. */
    tailSec: number;
    /** Seconds of the final fade. */
    fadeSec: number;
    /** Blur at the end, in design units. */
    blur: number;
  };
  carry: {
    /** Seconds the carrier travels from the turn to its landing. */
    sec: number;
  };
  /**
   * How a word that has had the stage to itself gives its place to the sentence: one move from the
   * middle to where it rests, slow to start and fastest as the next word shows.
   */
  room: {
    sec: number;
    ease: EasingSpec;
  };
  /** How a word joins a line that is already on stage: it shows beside or below its place and glides in. */
  join: {
    /** Seconds from showing to rest. Most of the travel is over in the first third. */
    sec: number;
    ease: EasingSpec;
    /** How far to the side of its place it shows, in em, when words slide in. */
    slideEm: number;
    /** How far below its place it shows, in em, when words rise in. */
    riseEm: number;
    /** Seconds a word takes to come into focus while it glides, when it is asked to. */
    focusSec: number;
    /** Seconds the lead has the stage before the next word shows. */
    aloneSec: number;
    /** Seconds from one arrival to the next once the lead has made room. */
    stepSec: number;
  };
  /**
   * What a finished line does while it is read, so that it is never still: the total change over
   * its time on stage. A longer shot drifts as far, more slowly.
   */
  drift: {
    /** Share of its size it gains or loses. */
    scale: number;
    /** Distance it travels, in em. */
    em: number;
  };
  /** How long a complete statement stays before it starts to leave, when the shot's length follows its content. */
  hold: {
    sec: number;
  };
  /** How a finished line leaves into a cut: it accelerates, and the cut takes it while it is still gaining speed. */
  leave: {
    sec: number;
    ease: EasingSpec;
    /** Size it has fallen back to when the cut comes, as a share of its resting size. */
    recede: number;
    /** Distance it has gone sideways by the cut, in em. */
    whipEm: number;
    /** Distance it has lifted by the cut, in em. */
    liftEm: number;
    /** Blur it has gathered by the cut, in design units. 0 keeps it sharp. */
    blur: number;
  };
  /** How a line comes in on the speed of the shot before: from the side that shot left by, slowing all the way. */
  push: {
    /** Distance it comes from, in em. */
    em: number;
    sec: number;
    ease: EasingSpec;
  };
}

/** Quick to arrive, long to settle, hard on the beat. Measured from the Glean opening, except where noted. */
export const snappyEditorial: Feel = {
  id: "snappy-editorial",
  name: "Snappy editorial",
  claimSec: 0.3,
  arrive: {
    travelSec: 0.88,
    settleSec: 0.82,
    travelEm: 0.31,
    looseEm: 0.054,
    ease: ease("easeOutQuart"),
    // The four below and the punch are measured from the Synaps product film: words two frames
    // apart at 30 fps, sharp within three, and a lead word falling from 3.6 times its size.
    staggerSec: 0.067,
    focusSec: 0.1,
    focusBlur: 9,
    shiftSec: 0.1,
  },
  punch: { scale: 3.6, sec: 0.53, ease: ease("easeOutQuart") },
  respond: {
    windUpSec: 0.17,
    releaseSec: 0.2,
    anticipate: 0.3,
    drift: 0.2,
    easeIn: ease("easeInQuad"),
    easeOut: ease("easeOutCubic"),
  },
  depart: { leadSec: 0.23, tailSec: 0.33, fadeSec: 0.2, blur: 42 },
  carry: { sec: 0.67 },
  // From here down: the same Synaps film, three sentences of it. The lead slides 0.8 s on a curve
  // that is slow for a third of its length; later words show 1.28 em to the right of their place in
  // the moving line and glide in over 16 frames; the line drifts 0.45 em while it is read and has
  // gone 1.25 em sideways when the cut takes it.
  room: { sec: 0.8, ease: bezier(0.85, 0, 0.17, 1) },
  join: { sec: 0.53, ease: bezier(0.1, 0.72, 0.56, 1), slideEm: 1.28, riseEm: 0.6, focusSec: 0.3, aloneSec: 0.57, stepSec: 0.3 },
  drift: { scale: 0.13, em: 0.45 },
  // The films hold a complete sentence for half a second at most before it leaves.
  hold: { sec: 0.5 },
  leave: { sec: 0.3, ease: bezier(0.6, 0, 1, 0.8), recede: 0.65, whipEm: 1.25, liftEm: 0.7, blur: 4 },
  // A line pushed in after a whip starts about as fast as that whip ended (the film's own pair is 0.7 to 1).
  push: { em: 3.4, sec: 1.2, ease: ease("easeOutExpo") },
};

/**
 * Words pop on almost where they rest and glide the last of the way; nothing blurs. Measured from
 * four sentences of the Lovable launch film, cut to music at about 109 BPM: a lead that falls to
 * size by a third every frame, later words a fifth of a second apart, and a line that has fallen
 * back to 0.72 of its size when the cut comes.
 */
export const popAndGlide: Feel = {
  ...snappyEditorial,
  id: "pop-and-glide",
  name: "Pop and glide",
  claimSec: 0.2,
  arrive: { ...snappyEditorial.arrive, staggerSec: 0.1, focusBlur: 5.5 },
  punch: { scale: 2.4, sec: 0.67, ease: ease("easeOutExpo") },
  room: { sec: 0.6, ease: bezier(0.82, 0.02, 0.15, 1) },
  join: { sec: 0.5, ease: bezier(0, 0.28, 0.2, 0.95), slideEm: 0.3, riseEm: 0.62, focusSec: 0.33, aloneSec: 0.43, stepSec: 0.2 },
  drift: { scale: 0.13, em: 0.5 },
  hold: { sec: 0.4 },
  leave: { sec: 0.3, ease: bezier(0.75, 0, 0.95, 0.6), recede: 0.72, whipEm: 1.25, liftEm: 0.69, blur: 0 },
  push: { em: 3.4, sec: 1.2, ease: ease("easeOutExpo") },
};

type Tuned<T> = T extends EasingSpec ? T : T extends object ? { [K in keyof T]?: Tuned<T[K]> } : T;

/**
 * A feel with some of its numbers changed, one at a time: `tuneFeel(popAndGlide, { room: { sec: 0.4 } })`.
 * The reference values are taste to draw on; everything not named keeps the feel's own value.
 */
export function tuneFeel(feel: Feel, changes: Tuned<Feel>): Feel {
  const merge = (base: unknown, change: unknown): unknown => {
    if (change === undefined) return base;
    if (typeof change !== "object" || change === null || "kind" in change || typeof base !== "object" || base === null) return change;
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(change)) {
      if (!(key in out)) throw new Error(`A feel has no "${key}". It has: ${Object.keys(out).join(", ")}.`);
      out[key] = merge(out[key], value);
    }
    return out;
  };
  return merge(feel, changes) as Feel;
}
