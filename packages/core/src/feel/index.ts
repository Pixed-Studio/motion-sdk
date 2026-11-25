import { ease, type EasingSpec } from "../kernel/easing.ts";

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
}

/** Quick to arrive, long to settle, hard on the beat. Measured from the Glean opening. */
export const snappyEditorial: Feel = {
  id: "snappy-editorial",
  name: "Snappy editorial",
  claimSec: 0.3,
  arrive: { travelSec: 0.88, settleSec: 0.82, travelEm: 0.31, looseEm: 0.054, ease: ease("easeOutQuart") },
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
};
