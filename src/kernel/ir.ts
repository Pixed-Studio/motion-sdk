import type { ColorStop, EasingSpec } from "./tokens.ts";

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MotionFormat {
  width: number;
  height: number;
  fps: number;
  durationFrames: number;
}

export type FillSpec =
  | { kind: "none" }
  | { kind: "solid"; color: string }
  | { kind: "linear"; angleDeg: number; stops: ColorStop[] }
  | {
      kind: "radial";
      domain: { x: number; y: number; width: number; height: number };
      stops: ColorStop[];
    }
  | {
      kind: "shader";
      shaderId: string;
      placementId: string;
      params: Record<string, number | string>;
    };

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
  tangentStart?: { x: number; y: number };
  tangentEnd?: { x: number; y: number };
}

export interface VectorNetworkIR {
  vertices: VectorVertex[];
  segments: VectorSegment[];
  closed: boolean;
  trailName: "Edge" | "Path";
}

export type SemanticNodeRole =
  | "stage"
  | "backdrop"
  | "focal-group"
  | "focal-text"
  | "orbit-ring"
  | "orbit-item"
  | "bokeh-group"
  | "bokeh-item"
  | "guide-path"
  | "emblem-host"
  | "emblem-part"
  | "mask-source";

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
  slot: string;
  role: SemanticNodeRole;
  parentId?: string;
  layer: number;
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

export interface ScalarKey {
  id: string;
  frame: number; // relative to motion block startFrame
  value: number;
  easing?: EasingSpec;
}

export interface Vec2Key {
  id: string;
  frame: number; // relative to motion block startFrame
  x: number;
  y: number;
  easing?: EasingSpec;
}

export interface ScalarMotionIR {
  kind: "scalar";
  id: string;
  name: string;
  targetId: string;
  property: "layerBlur" | "opacity" | "letterSpacing" | "rotation";
  mode: "set" | "add";
  stage: "in" | "out" | "custom";
  startFrame: number;
  durationFrames: number;
  baseValue?: number;
  post?: "hold" | "none";
  keys: ScalarKey[];
}

export interface Vec2MotionIR {
  kind: "vec2";
  id: string;
  name: string;
  targetId: string;
  property: "move" | "scale";
  mode: "add" | "multiply";
  stage: "in" | "out" | "custom";
  startFrame: number;
  durationFrames: number;
  keys: Vec2Key[];
}

export interface FollowPathMotionIR {
  kind: "followPath";
  id: string;
  name: string;
  targetId: string;
  guidePathId: string;
  orientToPath: boolean;
  startFrame: number;
  durationFrames: number;
  progressEasing: EasingSpec;
}

export interface ShaderMotionIR {
  kind: "shaderParams";
  id: string;
  name: string;
  targetId: string;
  placementId: string;
  shaderId: string;
  startFrame: number;
  durationFrames: number;
  tracks: Record<string, ScalarKey[]>;
}

export type MotionBlockIR =
  | ScalarMotionIR
  | Vec2MotionIR
  | FollowPathMotionIR
  | ShaderMotionIR;

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

export interface SemanticAnnotations {
  primitiveName: string;
  beatFrames: number[];
  convergeStartFrame: number;
  emblemSettleFrame: number;
  focalBounds: BBox;
  safeMargin: { x: number; y: number };
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
  annotations: SemanticAnnotations;
}
