import {
  estimateTextBox,
  roundedPolygonNetwork,
  roundedTriangleNetwork,
  waypointsToSmoothGuideNetwork,
} from "../kernel/geometry.ts";
import type {
  AttentionRole,
  BBox,
  DepthPlane,
  FillSpec,
  FrameNodeIR,
  NodeRange,
  PathNodeIR,
  Point2D,
  ShapeNodeIR,
  TextNodeIR,
} from "../kernel/ir.ts";
import type { Score } from "../kernel/score.ts";
import type { Look } from "../look/index.ts";

const round = (n: number, places = 2) => {
  const k = 10 ** places;
  return Math.round(n * k) / k;
};

/** A full-stage group. What it carries moves, turns, blurs and fades with it. */
export function group(
  score: Score,
  opts: { id: string; name: string; slot: string; plane?: DepthPlane; parentId?: string; layer: number; range?: NodeRange }
): FrameNodeIR {
  return score.add({
    id: score.id(opts.id),
    kind: "frame",
    name: opts.name,
    slot: opts.slot,
    role: "group",
    plane: opts.plane,
    parentId: opts.parentId,
    layer: opts.layer,
    range: opts.range,
    base: { x: 0, y: 0, width: score.format.width, height: score.format.height, originX: 0.5, originY: 0.5 },
  });
}

/** A shape by its outline, in pixels. Scale design sizes with `score.du()` or `scaleShape`. */
export type ShapeSpec =
  | { kind: "ellipse"; width: number; height?: number }
  | { kind: "rounded-rect"; width: number; height?: number; radius: number }
  | { kind: "rounded-triangle"; width: number; radius: number; originY?: number }
  | { kind: "polygon"; sides: number; diameter: number; radius: number };

export function scaleShape(shape: ShapeSpec, k: number): ShapeSpec {
  if (shape.kind === "ellipse") {
    return { kind: "ellipse", width: round(shape.width * k), height: shape.height && round(shape.height * k) };
  }
  if (shape.kind === "rounded-rect") {
    return {
      kind: "rounded-rect",
      width: round(shape.width * k),
      height: shape.height && round(shape.height * k),
      radius: round(shape.radius * k),
    };
  }
  if (shape.kind === "rounded-triangle") {
    return { ...shape, width: round(shape.width * k), radius: round(shape.radius * k) };
  }
  return { ...shape, diameter: round(shape.diameter * k), radius: round(shape.radius * k) };
}

/** The larger side of a shape's box. */
export function shapeExtent(shape: ShapeSpec): number {
  if (shape.kind === "polygon") return shape.diameter;
  if (shape.kind === "rounded-triangle") return shape.width;
  return Math.max(shape.width, shape.height ?? shape.width);
}

export interface PlaceOptions {
  id: string;
  name: string;
  slot: string;
  role: AttentionRole;
  plane?: DepthPlane;
  parentId?: string;
  layer: number;
  shape: ShapeSpec;
  fill: FillSpec;
  /** Where the shape's origin sits, in its parent's space. */
  center: Point2D;
  rotation?: number;
  blur?: number;
  opacity?: number;
  range?: NodeRange;
}

/** Puts a shape on the score with its origin at `center`. */
export function place(score: Score, opts: PlaceOptions): ShapeNodeIR | PathNodeIR {
  const common = {
    id: score.id(opts.id),
    name: opts.name,
    slot: opts.slot,
    role: opts.role,
    plane: opts.plane,
    parentId: opts.parentId,
    layer: opts.layer,
    range: opts.range,
  };
  const transform = (width: number, height: number, originY = 0.5) => ({
    x: round(opts.center.x - width / 2, 1),
    y: round(opts.center.y - height * originY, 1),
    width,
    height,
    rotation: opts.rotation,
    blur: opts.blur,
    opacity: opts.opacity,
    originX: 0.5,
    originY,
  });
  const s = opts.shape;
  if (s.kind === "ellipse" || s.kind === "rounded-rect") {
    return score.add({
      ...common,
      kind: "shape",
      shape: s.kind === "ellipse" ? "ellipse" : "rectangle",
      borderRadius: s.kind === "rounded-rect" ? s.radius : undefined,
      fill: opts.fill,
      base: transform(s.width, s.height ?? s.width),
    });
  }
  const outline =
    s.kind === "rounded-triangle"
      ? roundedTriangleNetwork(s.width, s.radius)
      : roundedPolygonNetwork(s.sides, s.diameter, s.radius);
  return score.add({
    ...common,
    kind: "path",
    network: outline.network,
    fill: opts.fill,
    base: transform(outline.width, outline.height, s.kind === "rounded-triangle" ? (s.originY ?? 0.5) : 0.5),
  });
}

/** An invisible curve through the given points, for something to travel along. */
export function guide(
  score: Score,
  opts: { id: string; name: string; parentId?: string; layer: number; points: Point2D[] }
): PathNodeIR {
  const solved = waypointsToSmoothGuideNetwork(opts.points);
  return score.add({
    id: score.id(opts.id),
    kind: "path",
    name: opts.name,
    slot: "guide",
    role: "guide",
    parentId: opts.parentId,
    layer: opts.layer,
    base: { x: solved.x, y: solved.y, width: solved.width, height: solved.height, opacity: 0 },
    network: solved.network,
    fill: { kind: "none" },
    strokeZero: true,
  });
}

export function polar(center: Point2D, angleDeg: number, radius: number): Point2D {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: center.x + Math.cos(rad) * radius, y: center.y + Math.sin(rad) * radius };
}

export interface StackLine {
  text: string;
  id?: string;
  /** Seconds this line needs to be read, when its length misleads (a number, a name, a long word). */
  needsSec?: number;
}

export interface StackOptions {
  look: Look;
  parentId?: string;
  slot?: string;
  layer?: number;
  plane?: DepthPlane;
  /** Centre of the block, as fractions of the stage. Defaults to the middle. */
  at?: Point2D;
  /** Type size as a share of stage height, while it fits. Default 0.13, the reference's headline size. */
  maxSize?: number;
  /**
   * Share of the stage height the block may fill. Type keeps its size as lines are added and only
   * shrinks once the block would pass this. Default 0.6.
   */
  maxHeight?: number;
  /** Share of the safe width the widest line may take. A long word shrinks the whole block. Default 0.64. */
  maxWidth?: number;
  /** The name the block's bounds are published under, for other objects to compose against. */
  region?: string;
}

export interface Stack {
  group: FrameNodeIR;
  lines: TextNodeIR[];
  /** The block's bounds at rest. */
  region: BBox;
  fontSize: number;
}

const LINE_PITCH = 1.025;
const LINE_BOX = 1.3;

/**
 * Sets any number of lines as one centred block. The type holds one size from one line to
 * several and shrinks only when the block gets too tall or a line too wide, and the bounds are
 * published for whatever has to keep clear of the text.
 */
export function stack(score: Score, lines: (string | StackLine)[], opts: StackOptions): Stack {
  const { width, height } = score.format;
  const items = lines.map((l) => (typeof l === "string" ? { text: l } : l));
  const count = items.length;
  const em = (count - 1) * LINE_PITCH + LINE_BOX;
  const trackingEm = opts.look.type.trackingEm;
  const widestEm = Math.max(...items.map((it) => estimateTextBox(it.text, 100, trackingEm * 100).width / 100), 0.01);
  const fontSize = Math.max(
    12,
    Math.floor(
      Math.min(
        height * (opts.maxSize ?? 0.13),
        (height * (opts.maxHeight ?? 0.6)) / em,
        (score.safeArea.width * (opts.maxWidth ?? 0.64)) / widestEm
      )
    )
  );
  const tracking = round(fontSize * trackingEm, 1);
  const pitch = Math.round(fontSize * LINE_PITCH);
  const box = Math.round(fontSize * LINE_BOX);
  const blockHeight = (count - 1) * pitch + box;
  const at = opts.at ?? { x: 0.5, y: 0.5 };
  const top = Math.round(height * at.y - blockHeight / 2);

  const holder = group(score, {
    id: "statement",
    name: "Statement",
    slot: `${opts.slot ?? "lines"}-group`,
    plane: opts.plane ?? "focal",
    parentId: opts.parentId,
    layer: opts.layer ?? 3,
  });

  let left = Infinity;
  let right = -Infinity;
  const nodes = items.map((item, i) => {
    const measured = estimateTextBox(item.text, fontSize, tracking);
    const x = round(width * at.x - measured.width / 2);
    left = Math.min(left, x);
    right = Math.max(right, x + measured.width);
    return score.add<TextNodeIR>({
      id: score.id(item.id ?? `txt_${item.text.toLowerCase()}`),
      kind: "text",
      name: item.text,
      slot: opts.slot ?? "lines",
      role: "subject",
      plane: opts.plane ?? "focal",
      parentId: holder.id,
      layer: i + 1,
      base: { x, y: top + i * pitch, width: measured.width, height: box },
      text: item.text,
      fontFamily: opts.look.type.family,
      fontSize,
      fontWeight: opts.look.type.weight,
      letterSpacing: tracking,
      textAlign: "center",
      fill: { kind: "solid", color: opts.look.ink },
    });
  });

  const region: BBox = { x: Math.round(left), y: top, width: Math.round(right - left), height: blockHeight };
  if (opts.region) score.regions[opts.region] = region;
  return { group: holder, lines: nodes, region, fontSize };
}
