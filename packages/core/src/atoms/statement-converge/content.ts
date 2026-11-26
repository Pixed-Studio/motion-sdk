import type { PassPoint } from "../../behaviors/travel.ts";
import { bezier, ease, type EasingSpec } from "../../kernel/easing.ts";
import type { FillSpec, Point2D } from "../../kernel/ir.ts";
import { flat, lit, turned, type Look, type MaterialName } from "../../look/index.ts";
import type { ShapeSpec } from "../../stage/index.ts";

/**
 * A shape in the statement's world. It is placed by its relation to the statement, never by
 * stage coordinates: an angle around it and a distance from its centre. Sizes and distances are
 * design units (a pixel on a 1280×720 stage).
 */
export interface WorldItem {
  id: string;
  name: string;
  shape: "orb" | "square" | "triangle" | ShapeSpec;
  size: number;
  material: MaterialName;
  /** Where it sits around the statement, in degrees clockwise from the right. */
  angleDeg: number;
  /** Its distance from the statement's centre when it appears. */
  radius: number;
  /**
   * How far it has moved out by the time the statement is complete. It moves a part of this on
   * every arrival it is there for, so the world makes room as the statement grows. A wider or
   * taller statement pushes it further, until it clears the text.
   */
  push: number;
  /** When it joins, as a share of the phrase: 0 is there from the start, 1 joins on the last arrival. */
  joins?: number;
  /** Its starting angle, in degrees. */
  turn?: number;
  /** Degrees it turns over its life, for something that tumbles. */
  spin?: number;
  /** Order within the world; higher is in front. */
  layer: number;
}

/**
 * Something large and out of focus that crosses in front. Positions are fractions of the stage,
 * because a pass is composed against the frame: it enters by a corner or an edge.
 */
export interface PassItem {
  id: string;
  name: string;
  shape: "orb" | "square" | "triangle";
  size: number;
  material: MaterialName;
  /** Its centre when it appears, as fractions of the stage. Outside 0..1 is off stage. */
  from: Point2D;
  /** Where it goes: each point is how far along (0..1), an offset from `from` in stage fractions, and the ease leaving it. */
  path: PassPoint[];
  /** The ease leaving the start. */
  ease?: EasingSpec;
  /** Which moment sets it off: the arrival before the accent, the accent, or the turn. */
  on: "lead-in" | "accent" | "turn";
  offsetSec?: number;
  /** Seconds it takes. Left out, it fills the hold: it runs until the world is gone. */
  overSec?: number;
  blur: number;
  turn?: number;
  spin?: number;
  /** Fades at the end, for a pass that stops in view. */
  fades?: boolean;
}

/** A piece of the mark. Its seat is where it rests; its approach is the way it comes. */
export interface MarkPiece {
  id: string;
  name: string;
  /** Its outline at full size, in design units. */
  shape: ShapeSpec;
  fill: FillSpec;
  /** How it shows where it lies over the host. Leave out to keep one fill. */
  through?: FillSpec;
  /** Points it travels through, as offsets from its seat in design units. The last is the seat: [0, 0]. */
  approach: [number, number][];
  /** Seconds after the turn that it sets off. Stagger the pieces so the mark assembles in order. */
  delaySec?: number;
  turn?: number;
  spin?: number;
  /** Scale on the way in. `to` is its size at rest, so the shape is drawn large and lands small. */
  scale: { from: number; mid?: number; to: number };
  ease: EasingSpec;
}

/**
 * The mark the statement resolves into. The host is seated on the stage; each part is seated on
 * the host, in units of the host's width from its centre. The mark therefore assembles the same
 * way in any format.
 */
export interface MarkSpec {
  /** The host's centre at rest, as fractions of the stage. */
  seat?: Point2D;
  host: MarkPiece;
  parts: (MarkPiece & { at: Point2D })[];
  /** Pairs of parts whose overlap takes its own fill. The two must cross at rest. */
  overlaps?: { first: string; second: string; fill: FillSpec; name: string }[];
}

export function shapeOf(shape: WorldItem["shape"], size: number): ShapeSpec {
  if (typeof shape !== "string") return shape;
  if (shape === "orb") return { kind: "ellipse", width: size };
  if (shape === "square") return { kind: "rounded-rect", width: size, radius: Math.round(size * 0.21) };
  return { kind: "rounded-triangle", width: size, radius: Math.round(size * 0.175) };
}

/** The world measured from the Glean opening: seven shapes, three there from the start. */
export function defaultWorld(): WorldItem[] {
  return [
    { id: "mid_blue_big", name: "Large orb", shape: "orb", size: 144, material: "primary", angleDeg: 17, radius: 192, push: 140, joins: 0, layer: 7 },
    { id: "mid_tri_big", name: "Large triangle", shape: "triangle", size: 196, material: "fresh", angleDeg: -65, radius: 212, push: 103, joins: 0, turn: 52, spin: 78, layer: 8 },
    { id: "mid_tri_small", name: "Small triangle", shape: "triangle", size: 86, material: "fresh", angleDeg: 96, radius: 175, push: 174, joins: 0, turn: -35, spin: 80, layer: 9 },
    { id: "mid_blue_small", name: "Small orb", shape: "orb", size: 46, material: "primary", angleDeg: -157, radius: 229, push: 123, joins: 0.5, layer: 5 },
    { id: "mid_warm_tiny", name: "Tiny square", shape: "square", size: 38, material: "warm", angleDeg: 161, radius: 175, push: 106, joins: 0.5, turn: 18, layer: 4 },
    { id: "mid_warm_big", name: "Large square", shape: "square", size: 124, material: "warm", angleDeg: -119, radius: 306, push: 73, joins: 1, turn: 24, spin: -35, layer: 6 },
    { id: "mid_warm_med", name: "Medium square", shape: "square", size: 72, material: "warm", angleDeg: 55, radius: 304, push: 62, joins: 1, turn: 36, layer: 5 },
  ];
}

const W = 1280;
const H = 720;
/** A stage position measured on the 1280×720 reference, as fractions. */
const at = (x: number, y: number): Point2D => ({ x: x / W, y: y / H });
/** A pass point measured on the reference: frame of the pass, its length in frames, and the offset in pixels. */
const pt = (frame: number, of: number, dx: number, dy: number, leaving?: EasingSpec): PassPoint => ({
  at: frame / of,
  x: dx / W,
  y: dy / H,
  ease: leaving,
});

/**
 * The passes measured from the Glean opening. Two cross on the arrival before the accent, a
 * burst and three slow ones answer the accent and fill its hold, and two race off as focus goes.
 */
export function defaultPasses(): PassItem[] {
  const outQuad = ease("easeOutQuad");
  const inQuad = ease("easeInQuad");
  const inSine = ease("easeInSine");
  return [
    { id: "pass_lead_orb", name: "Lead-in orb", shape: "orb", size: 244, material: "primary", from: at(1152, 406), on: "lead-in", overSec: 0.37, blur: 40, fades: true, path: [pt(3, 10, -37, 204), pt(6, 10, -96, 259), pt(10, 10, -187, 349)] },
    { id: "pass_lead_square", name: "Lead-in square", shape: "square", size: 256, material: "warm", from: at(205, 250), on: "lead-in", overSec: 0.37, blur: 42, turn: 44, spin: 34, fades: true, path: [pt(2, 10, 30, -115), pt(7, 10, 161, -222), pt(10, 10, 255, -360)] },
    { id: "pass_hold_orb", name: "Slow orb", shape: "orb", size: 244, material: "primary", from: at(185, 745), on: "accent", offsetSec: 0.067, blur: 40, ease: ease("easeOutCubic"), path: [pt(4, 40, -94, -116, outQuad), pt(7, 40, -128, -213), pt(16, 40, -144, -391), pt(22, 40, -133, -489, inSine), pt(30, 40, -75, -605, inQuad), pt(36, 40, 134, -663), pt(38, 40, 291, -648), pt(40, 40, 400, -590)] },
    { id: "pass_hold_square", name: "Slow square", shape: "square", size: 268, material: "warm", from: at(1275, 235), on: "accent", offsetSec: 0.2, blur: 44, turn: 166, spin: 52, path: [pt(3, 36, -92, 122), pt(18, 36, -96, 348, inSine), pt(26, 36, -193, 406, inQuad), pt(32, 36, -395, 480), pt(36, 36, -595, 525)] },
    { id: "pass_hold_small", name: "Slow small orb", shape: "orb", size: 100, material: "primary", from: at(1125, -45), on: "accent", offsetSec: 0.2, blur: 26, path: [pt(3, 35, 48, 79), pt(12, 35, 124, 230), pt(18, 35, 123, 328), pt(26, 35, 74, 464, inQuad), pt(31, 35, -48, 568), pt(35, 35, -175, 685)] },
    { id: "pass_burst_square", name: "Burst square", shape: "square", size: 220, material: "warm", from: at(66, 653), on: "accent", overSec: 0.23, blur: 40, turn: 45, spin: 30, fades: true, ease: { kind: "linear" }, path: [pt(1, 1, -186, -133)] },
    { id: "pass_burst_triangle", name: "Burst triangle", shape: "triangle", size: 270, material: "fresh", from: at(1164, 624), on: "accent", overSec: 0.27, blur: 38, spin: 30, fades: true, ease: { kind: "linear" }, path: [pt(1, 1, 156, 136)] },
    { id: "pass_burst_small", name: "Burst small square", shape: "square", size: 105, material: "warm", from: at(220, 32), on: "accent", overSec: 0.53, blur: 28, turn: 28, spin: 32, fades: true, path: [pt(9, 15, -132, -2), pt(15, 15, -280, -17)] },
    { id: "pass_exit_square", name: "Exit square", shape: "square", size: 105, material: "warm", from: at(1060, -15), on: "turn", offsetSec: -0.133, overSec: 0.43, blur: 26, turn: 20, spin: 25, ease: { kind: "linear" }, path: [pt(3, 12, -67, 40), pt(8, 12, -240, 50), pt(12, 12, -314, 107)] },
    { id: "pass_exit_triangle", name: "Exit triangle", shape: "triangle", size: 320, material: "fresh", from: at(210, 760), on: "turn", overSec: 0.3, blur: 36, spin: -25, ease: { kind: "linear" }, path: [pt(3, 8, 45, -115), pt(5, 8, 75, -205), pt(6, 8, 111, -277), pt(8, 8, 183, -445)] },
  ];
}

/**
 * The Glean mark: a circle that sweeps round the frame and settles, a square and a triangle that
 * arc into it, change colour where they cross it, and leave the host's colour where they cross
 * each other. Seats and approaches are measured from the opening and stated relative to the
 * host, in the look's materials.
 */
export function defaultMark(look: Look): MarkSpec {
  return {
    seat: { x: 0.4953, y: 0.4653 },
    host: {
      id: "mark_host",
      name: "Mark circle",
      shape: { kind: "ellipse", width: 700 },
      fill: flat(look, "primary"),
      approach: [[-724, -40], [-274, -545], [206, -455], [423, -196], [405, 56], [285, 202], [151, 250], [43, 232], [-60, 127], [-59, 39], [-26, 2], [0, 0]],
      scale: { from: 1.157, mid: 1.045, to: 0.838 },
      ease: bezier(0.15, 0.8, 0.5, 1),
    },
    parts: [
      {
        id: "mark_square",
        name: "Mark square",
        shape: { kind: "rounded-rect", width: 300, radius: 56 },
        fill: turned(lit(look, "warm"), 115, true),
        through: look.materials.warm.through,
        at: { x: 0.005, y: -0.187 },
        approach: [[-372, 520], [-385, 345], [-362, 212], [-262, 15], [-138, -45], [-56, -38], [0, 0]],
        delaySec: 0.2,
        turn: -106,
        spin: 237,
        scale: { from: 1.24, mid: 1.113, to: 0.913 },
        ease: bezier(0.3, 0.45, 0.4, 0.85),
      },
      {
        id: "mark_triangle",
        name: "Mark triangle",
        shape: { kind: "rounded-triangle", width: 360, radius: 66, originY: 0.62 },
        fill: lit(look, "fresh"),
        through: look.materials.fresh.through,
        at: { x: 0.167, y: 0.162 },
        approach: [[23, -565], [160, -400], [202, -292], [196, -185], [120, -62], [30, -8], [0, 0]],
        delaySec: 0.3,
        turn: -10,
        spin: 105,
        scale: { from: 1.22, mid: 1.11, to: 0.98 },
        ease: bezier(0.16, 0.42, 0.56, 0.92),
      },
    ],
    overlaps: [{ first: "mark_square", second: "mark_triangle", fill: flat(look, "primary"), name: "Where the square and triangle cross" }],
  };
}
