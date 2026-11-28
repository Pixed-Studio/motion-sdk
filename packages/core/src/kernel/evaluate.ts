import { evaluateEasing } from "./easing.ts";
import { sampleGuideNetworkAtProgress } from "./geometry.ts";
import type {
  BBox,
  ColorKey,
  MotionBlockIR,
  MotionDocument,
  PathNodeIR,
  Point2D,
  ScalarKey,
  SceneNodeIR,
  Vec2Key,
} from "./ir.ts";

/** One object at one frame, in stage pixels. */
export interface NodeState {
  visible: boolean;
  /** Centre of the object's box. */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  opacity: number;
  blur: number;
  /** Its solid fill on this frame, when a colour movement has written one. */
  color?: string;
}

export interface SnapshotEntry {
  id: string;
  slot: string;
  role: string;
  plane?: string;
  label: string;
  center: Point2D;
  box: BBox;
  opacity: number;
  blur: number;
  rotation: number;
  scale: number;
}

export function sampleScalarKeys(keys: ScalarKey[], localFrame: number, fallback: number): number {
  if (keys.length === 0) return fallback;
  const first = keys[0]!;
  const last = keys[keys.length - 1]!;
  if (localFrame <= first.frame) return first.value;
  if (localFrame >= last.frame) return last.value;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (localFrame >= a.frame && localFrame <= b.frame) {
      const u = evaluateEasing(a.easing, (localFrame - a.frame) / Math.max(1e-6, b.frame - a.frame));
      return a.value + (b.value - a.value) * u;
    }
  }
  return last.value;
}

export function sampleVec2Keys(keys: Vec2Key[], localFrame: number, fallback: Point2D): Point2D {
  if (keys.length === 0) return fallback;
  const first = keys[0]!;
  const last = keys[keys.length - 1]!;
  if (localFrame <= first.frame) return { x: first.x, y: first.y };
  if (localFrame >= last.frame) return { x: last.x, y: last.y };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (localFrame >= a.frame && localFrame <= b.frame) {
      const u = evaluateEasing(a.easing, (localFrame - a.frame) / Math.max(1e-6, b.frame - a.frame));
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
    }
  }
  return { x: last.x, y: last.y };
}

const channels = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? [...clean].map((c) => c + c).join("") : clean;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) || 0) as [number, number, number];
};

/** Two colours mixed channel by channel in sRGB. */
export function mixColor(a: string, b: string, u: number): string {
  const ca = channels(a);
  const cb = channels(b);
  return `#${ca.map((v, i) => Math.round(v + (cb[i]! - v) * u).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function sampleColorKeys(keys: ColorKey[], localFrame: number, fallback: string): string {
  if (keys.length === 0) return fallback;
  const first = keys[0]!;
  const last = keys[keys.length - 1]!;
  if (localFrame <= first.frame) return first.color;
  if (localFrame >= last.frame) return last.color;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (localFrame >= a.frame && localFrame <= b.frame) {
      return mixColor(a.color, b.color, evaluateEasing(a.easing, (localFrame - a.frame) / Math.max(1e-6, b.frame - a.frame)));
    }
  }
  return last.color;
}

/** How far through its keys a colour block is at a local frame, counting each pair of keys as one step. */
function colorProgress(keys: ColorKey[], localFrame: number): number {
  for (let i = keys.length - 2; i >= 0; i--) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (localFrame >= a.frame) return i + evaluateEasing(a.easing, (localFrame - a.frame) / Math.max(1e-6, b.frame - a.frame));
  }
  return 0;
}

/**
 * The value a block writes at a frame (fractional frames allowed): a number for a scalar block or
 * one shader track, a point for a vec2 block, progress 0..1 for a follow path.
 */
export function sampleMotion(m: MotionBlockIR, frame: number, track?: string): number | Point2D {
  const local = Math.min(Math.max(frame - m.startFrame, 0), Math.max(0, m.durationFrames - 1));
  if (m.kind === "scalar") return sampleScalarKeys(m.keys, local, m.baseValue ?? 0);
  if (m.kind === "color") return colorProgress(m.keys, local);
  if (m.kind === "vec2") {
    return sampleVec2Keys(m.keys, local, m.mode === "multiply" ? { x: 1, y: 1 } : { x: 0, y: 0 });
  }
  if (m.kind === "followPath") {
    return evaluateEasing(m.progressEasing, m.durationFrames <= 1 ? 1 : local / (m.durationFrames - 1));
  }
  const keys = m.tracks[track ?? Object.keys(m.tracks)[0] ?? ""] ?? [];
  return sampleScalarKeys(keys, local, 0);
}

/** How fast a block's value moves at a frame, per frame. For a point, the speed along its path. */
export function motionSpeed(m: MotionBlockIR, frame: number, track?: string): number {
  const a = sampleMotion(m, frame - 0.5, track);
  const b = sampleMotion(m, frame + 0.5, track);
  if (typeof a === "number" || typeof b === "number") return Math.abs((b as number) - (a as number));
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * The frames an object exists: its range, cut down to after its first `stage: "in"` motion starts
 * and before its last `stage: "out"` motion ends. `end` is exclusive.
 */
export function lifetime(doc: MotionDocument, node: SceneNodeIR): { start: number; end: number } {
  let start = node.range ? node.range.startFrame : 0;
  let end = node.range ? node.range.startFrame + node.range.durationFrames : doc.format.durationFrames;
  let firstIn = Infinity;
  let lastOut = -Infinity;
  for (const m of doc.motions) {
    if (m.targetId !== node.id || m.kind === "shaderParams") continue;
    if (m.stage === "in") firstIn = Math.min(firstIn, m.startFrame);
    if (m.stage === "out") lastOut = Math.max(lastOut, m.startFrame + m.durationFrames);
  }
  if (firstIn !== Infinity) start = Math.max(start, firstIn);
  if (lastOut !== -Infinity) end = Math.min(end, lastOut);
  return { start, end };
}

type Matrix = [number, number, number, number, number, number];

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function multiply(m: Matrix, n: Matrix): Matrix {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

function apply(m: Matrix, x: number, y: number): Point2D {
  return { x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] };
}

interface Resolved extends NodeState {
  world: Matrix;
}

const HIDDEN: Resolved = {
  visible: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  rotation: 0,
  scale: 1,
  opacity: 0,
  blur: 0,
  world: IDENTITY,
};

/**
 * Every object's state at a frame. A child's coordinates are in its parent's space; a parent's
 * move, rotation, scale, opacity and blur carry to its children.
 */
export function evaluateAt(doc: MotionDocument, frame: number): Map<string, NodeState> {
  const byId = new Map<string, SceneNodeIR>(doc.nodes.map((n) => [n.id, n]));
  const memo = new Map<string, Resolved>();

  const resolve = (node: SceneNodeIR): Resolved => {
    const cached = memo.get(node.id);
    if (cached) return cached;

    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    const up = parent ? resolve(parent) : undefined;
    const life = lifetime(doc, node);
    if (frame < life.start || frame >= life.end || (up && !up.visible)) {
      memo.set(node.id, HIDDEN);
      return HIDDEN;
    }

    const w = node.base.width;
    const h = node.base.height;
    const ox = w * (node.base.originX ?? 0.5);
    const oy = h * (node.base.originY ?? 0.5);
    let x = node.base.x;
    let y = node.base.y;
    let rotation = node.base.rotation ?? 0;
    let opacity = node.base.opacity ?? 1;
    let blur = node.base.blur ?? 0;
    let sx = 1;
    let sy = 1;
    let followed: Point2D | null = null;
    let color: string | undefined;

    for (const m of doc.motions) {
      if (m.targetId !== node.id || frame < m.startFrame || m.kind === "shaderParams") continue;
      const ended = frame > m.startFrame + m.durationFrames - 1;
      const local = Math.min(frame - m.startFrame, Math.max(0, m.durationFrames - 1));
      if (m.kind === "scalar") {
        if (ended && m.post === "none") continue;
        const v = sampleScalarKeys(m.keys, local, m.baseValue ?? 0);
        if (m.property === "opacity") opacity = m.mode === "set" ? v : opacity + v;
        else if (m.property === "layerBlur") blur = m.mode === "set" ? v : blur + v;
        else if (m.property === "rotation") rotation = m.mode === "set" ? v : rotation + v;
      } else if (m.kind === "vec2") {
        const v = sampleVec2Keys(m.keys, local, m.mode === "multiply" ? { x: 1, y: 1 } : { x: 0, y: 0 });
        if (m.property === "move") {
          x += v.x;
          y += v.y;
        } else {
          sx *= v.x;
          sy *= v.y;
        }
      } else if (m.kind === "color") {
        color = sampleColorKeys(m.keys, local, color ?? "#000000");
      } else {
        const guide = byId.get(m.guidePathId) as PathNodeIR | undefined;
        if (guide && guide.kind === "path") {
          const u = evaluateEasing(m.progressEasing, m.durationFrames <= 1 ? 1 : local / (m.durationFrames - 1));
          followed = sampleGuideNetworkAtProgress(guide.network, guide.base.x, guide.base.y, u);
        }
      }
    }

    const tx = followed ? followed.x - ox : x;
    const ty = followed ? followed.y - oy : y;
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // translate(tx + ox, ty + oy) · rotate · scale · translate(-ox, -oy)
    const a = cos * sx;
    const b = sin * sx;
    const c = -sin * sy;
    const d = cos * sy;
    const local: Matrix = [a, b, c, d, tx + ox - a * ox - c * oy, ty + oy - b * ox - d * oy];
    const world = up ? multiply(up.world, local) : local;
    const center = apply(world, w / 2, h / 2);
    const scale = (up ? up.scale : 1) * Math.sqrt(Math.abs(sx * sy));
    const worldOpacity = (up ? up.opacity : 1) * opacity;
    const state: Resolved = {
      visible: worldOpacity > 0.001,
      x: center.x,
      y: center.y,
      width: w * scale,
      height: h * scale,
      rotation: (up ? up.rotation : 0) + rotation,
      scale,
      opacity: worldOpacity,
      blur: (up ? up.blur : 0) + blur,
      world,
      ...(color ? { color } : {}),
    };
    memo.set(node.id, state);
    return state;
  };

  for (const n of doc.nodes) resolve(n);
  return memo;
}

export function boxOf(state: NodeState): BBox {
  return {
    x: state.x - state.width / 2,
    y: state.y - state.height / 2,
    width: state.width,
    height: state.height,
  };
}

/** Whether an object is drawn at all: groups, guides and mask sources are construction. */
export function isDrawn(node: SceneNodeIR): boolean {
  return node.kind !== "frame" && node.role !== "guide" && node.role !== "mask";
}

/**
 * Paint order as a comparable path of layers from the root: an object is in front of another
 * when its path sorts later.
 */
export function paintOrder(doc: MotionDocument): Map<string, number[]> {
  const byId = new Map<string, SceneNodeIR>(doc.nodes.map((n) => [n.id, n]));
  const out = new Map<string, number[]>();
  const pathOf = (node: SceneNodeIR): number[] => {
    const known = out.get(node.id);
    if (known) return known;
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    const path = [...(parent ? pathOf(parent) : []), node.layer];
    out.set(node.id, path);
    return path;
  };
  for (const n of doc.nodes) pathOf(n);
  return out;
}

export function isInFront(order: Map<string, number[]>, a: string, b: string): boolean {
  const pa = order.get(a) ?? [];
  const pb = order.get(b) ?? [];
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const va = pa[i] ?? -Infinity;
    const vb = pb[i] ?? -Infinity;
    if (va !== vb) return va > vb;
  }
  return false;
}

const round = (n: number, places: number) => {
  const k = 10 ** places;
  return Math.round(n * k) / k;
};

/**
 * What is on stage at a frame, without rendering: every drawn, visible object with its slot, role,
 * box, opacity and blur. The agent's eyes before pixels.
 */
export function snapshot(doc: MotionDocument, frame: number): SnapshotEntry[] {
  const states = evaluateAt(doc, frame);
  const out: SnapshotEntry[] = [];
  for (const node of doc.nodes) {
    if (!isDrawn(node)) continue;
    const st = states.get(node.id);
    if (!st || !st.visible) continue;
    const box = boxOf(st);
    out.push({
      id: node.id,
      slot: node.slot,
      role: node.role,
      plane: node.plane,
      label: node.kind === "text" ? node.text : node.name,
      center: { x: round(st.x, 1), y: round(st.y, 1) },
      box: { x: round(box.x, 1), y: round(box.y, 1), width: round(box.width, 1), height: round(box.height, 1) },
      opacity: round(st.opacity, 3),
      blur: round(st.blur, 1),
      rotation: round(st.rotation, 1),
      scale: round(st.scale, 3),
    });
  }
  return out;
}
