import type { EasingSpec } from "./easing.ts";

/**
 * Canonical Motion IR: one shot as objects, keyed motion and the score that explains them.
 * The kernel knows no particular shot. Everything an audit or a target needs is in this document.
 */

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface MotionFormat {
  width: number;
  height: number;
  fps: number;
  durationFrames: number;
}

export interface ColorStop {
  offset: number;
  color: string;
}

export type FillSpec =
  | { kind: "none" }
  | { kind: "solid"; color: string }
  | { kind: "linear"; angleDeg: number; stops: ColorStop[] }
  | { kind: "radial"; domain: BBox; stops: ColorStop[] }
  | { kind: "shader"; shaderId: string; placementId: string; params: Record<string, number | string> };

export interface ShaderPropertyDef {
  id: string;
  label: string;
  type: "number" | "color";
  uniformName: string;
  defaultValue: number | string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface CustomShaderIR {
  id: string;
  version: number;
  name: string;
  description: string;
  cost: "light" | "medium" | "heavy";
  sksl: string;
  /**
   * The same picture for targets without SkSL: the body of
   * `function (ctx, width, height, params)` drawing on a 2D canvas the size of the object.
   */
  canvas2d?: string;
  properties: ShaderPropertyDef[];
}

export interface VectorVertex {
  id: string;
  x: number;
  y: number;
  cornerRadius?: number;
}

export interface VectorSegment {
  id: string;
  startVertexId: string;
  endVertexId: string;
  tangentStart?: Point2D;
  tangentEnd?: Point2D;
}

export interface VectorNetworkIR {
  vertices: VectorVertex[];
  segments: VectorSegment[];
  closed: boolean;
  trailName: "Edge" | "Path";
}

/**
 * What an object is to the viewer's attention. A role carries obligations the audit checks:
 * a `subject` must get the reading time it declares, a `carrier` must be on stage at the handoff.
 * `group`, `guide` and `mask` are construction and are never drawn as themselves.
 */
export type AttentionRole = "subject" | "support" | "ambient" | "carrier" | "group" | "guide" | "mask";

/** Where an object sits in depth. Planes paint in this order; `foreground` is in front of the subject. */
export type DepthPlane = "backdrop" | "midground" | "focal" | "foreground";

export interface BaseTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  originX?: number;
  originY?: number;
  blur?: number;
}

export interface NodeRange {
  startFrame: number;
  durationFrames: number;
}

export interface BaseNodeIR {
  id: string;
  name: string;
  /** The slot of the shot this object fills, or the construction it belongs to. */
  slot: string;
  role: AttentionRole;
  plane?: DepthPlane;
  parentId?: string;
  layer: number;
  /** Lifetime. An object is also hidden before its `stage: "in"` motion and after its `stage: "out"` motion. */
  range?: NodeRange;
  base: BaseTransform;
}

export interface FrameNodeIR extends BaseNodeIR {
  kind: "frame";
}

export interface ShapeNodeIR extends BaseNodeIR {
  kind: "shape";
  shape: "rectangle" | "ellipse";
  borderRadius?: number;
  fill: FillSpec;
}

export interface TextNodeIR extends BaseNodeIR {
  kind: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  textAlign: "left" | "center" | "right";
  fill: { kind: "solid"; color: string };
}

export interface PathNodeIR extends BaseNodeIR {
  kind: "path";
  network: VectorNetworkIR;
  fill: FillSpec;
  strokeZero?: boolean;
}

export type SceneNodeIR = FrameNodeIR | ShapeNodeIR | TextNodeIR | PathNodeIR;

export interface MaskBindingIR {
  id: string;
  name: string;
  sourceObjectId: string;
  targetObjectId: string;
  mode: "vector";
  inverted: boolean;
}

/**
 * Why a movement exists. Every motion block carries one, so a reader (a person in an editor,
 * an agent revising, the audit) can tell an arrival from an answer from an exit.
 */
export interface MotionReason {
  purpose: MotionPurpose;
  /** The cues it answers, by name. */
  cues?: string[];
  /** When its peak sits on only some of those cues, which ones. */
  peaks?: string[];
  /**
   * Which point of the movement sits on its cue. `start`: it begins there (an arrival shows on the cue).
   * `peak`: it is fastest there, having wound up before. `end`: it comes to rest there.
   */
  lands?: "start" | "peak" | "end";
}

/**
 * The shared vocabulary of purposes.
 * arrive: a subject comes into view. respond: something answers a cue. drift: slow travel between events.
 * depart: something lets go of the viewer. carry: something travels to where attention goes next.
 * keep: holds a relation to another object (a counter-rotation, a mask that follows its shape).
 */
export type MotionPurpose = "arrive" | "respond" | "drift" | "depart" | "carry" | "keep";

export interface ScalarKey {
  id: string;
  /** Relative to the block's startFrame. */
  frame: number;
  value: number;
  easing?: EasingSpec;
}

export interface Vec2Key {
  id: string;
  /** Relative to the block's startFrame. */
  frame: number;
  x: number;
  y: number;
  easing?: EasingSpec;
}

interface MotionBlockBase {
  id: string;
  name: string;
  targetId: string;
  startFrame: number;
  durationFrames: number;
  reason: MotionReason;
}

export interface ScalarMotionIR extends MotionBlockBase {
  kind: "scalar";
  property: "layerBlur" | "opacity" | "letterSpacing" | "rotation";
  mode: "set" | "add";
  stage: "in" | "out" | "custom";
  baseValue?: number;
  post?: "hold" | "none";
  keys: ScalarKey[];
}

export interface Vec2MotionIR extends MotionBlockBase {
  kind: "vec2";
  property: "move" | "scale";
  mode: "add" | "multiply";
  stage: "in" | "out" | "custom";
  keys: Vec2Key[];
}

export interface FollowPathMotionIR extends MotionBlockBase {
  kind: "followPath";
  guidePathId: string;
  orientToPath: boolean;
  stage: "in" | "out" | "custom";
  progressEasing: EasingSpec;
}

export interface ShaderMotionIR extends MotionBlockBase {
  kind: "shaderParams";
  placementId: string;
  shaderId: string;
  tracks: Record<string, ScalarKey[]>;
}

export type MotionBlockIR = ScalarMotionIR | Vec2MotionIR | FollowPathMotionIR | ShaderMotionIR;

export interface AudioTrackIR {
  assetId: string;
  clipId: string;
  name: string;
  src: string;
  durationMs: number;
  sampleRate: number;
  channels: number;
  startFrame: number;
  durationFrames: number;
  gain: number;
}

/** A named moment other things time themselves by. */
export interface CueIR {
  name: string;
  frame: number;
  /** beat: a step of the phrase. accent: the step that carries the weight. turn, land and the rest: structure the shot names. */
  kind: "beat" | "accent" | "structure";
  /** How hard the world answers it. 1 is a full answer. */
  weight: number;
  why: string;
}

/** What a subject is owed: time to be read, clear of everything else, before the shot stops offering it. */
export interface SubjectIR {
  nodeId: string;
  /** The cue it arrives on. */
  cue: string;
  /** Seconds of clear reading it needs. */
  needsSec: number;
  /** The frame the shot stops offering it (a blur, a cut, an exit). */
  untilFrame: number;
  accent: boolean;
}

/** A relation that must hold however the slots are filled. The audit evaluates each one. */
export type InvariantIR =
  | { kind: "upright"; nodeId: string; toleranceDeg: number; why: string }
  | { kind: "overlap"; a: string; b: string; frame: number; minShare: number; why: string };

/** Where attention is, and how it moves, at one edge of the shot. Shots chain by matching these. */
export interface HandoffIR {
  frame: number;
  nodeId: string;
  position: Point2D;
  /** Pixels per second. */
  velocity: Point2D;
  /** The carrier's larger side, in pixels. */
  size: number;
  color: string;
}

/** Something a solver could not give, with the numbers and what would fix it. */
export interface ScoreNote {
  rule: string;
  severity: "error" | "warning";
  message: string;
  fix?: string;
}

/** The designer's side of the document: the cues, what was promised to whom, and what must stay true. */
export interface ScoreIR {
  shot: string;
  cues: CueIR[];
  subjects: SubjectIR[];
  /** How long one arrival holds the eye, in frames. Two arrivals closer than this compete. */
  claimFrames: number;
  /** Bounds published for other objects to compose against, by name. */
  regions: Record<string, BBox>;
  safeArea: BBox;
  invariants: InvariantIR[];
  handoff: { entry?: HandoffIR; exit?: HandoffIR };
  notes: ScoreNote[];
}

export interface MotionDocument {
  id: string;
  name: string;
  format: MotionFormat;
  scene: {
    id: string;
    name: string;
    durationFrames: number;
    backgroundColor: string;
  };
  shaders: CustomShaderIR[];
  audio?: AudioTrackIR;
  nodes: SceneNodeIR[];
  masks: MaskBindingIR[];
  motions: MotionBlockIR[];
  score: ScoreIR;
}
