import type { BBox, Point2D, VectorNetworkIR, VectorSegment, VectorVertex } from "./ir.ts";

export function intersectionArea(a: BBox, b: BBox): number {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

export function unionBox(boxes: BBox[]): BBox {
  const x0 = Math.min(...boxes.map((b) => b.x));
  const y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.width));
  const y1 = Math.max(...boxes.map((b) => b.y + b.height));
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

export function padBox(box: BBox, padX: number, padY = padX): BBox {
  return {
    x: box.x - padX,
    y: box.y - padY,
    width: box.width + padX * 2,
    height: box.height + padY * 2,
  };
}

export function boxesIntersect(a: BBox, b: BBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

const CHAR_WIDTH_FACTORS: Record<string, number> = {
  i: 0.24,
  l: 0.24,
  I: 0.28,
  j: 0.25,
  f: 0.34,
  t: 0.36,
  r: 0.37,
  " ": 0.28,
  "-": 0.36,
  s: 0.49,
  c: 0.51,
  a: 0.54,
  e: 0.55,
  o: 0.57,
  n: 0.57,
  u: 0.57,
  h: 0.57,
  d: 0.58,
  b: 0.58,
  p: 0.58,
  q: 0.58,
  g: 0.57,
  k: 0.53,
  v: 0.51,
  x: 0.51,
  y: 0.52,
  z: 0.49,
  w: 0.76,
  m: 0.84,
  W: 0.94,
  M: 0.86,
  A: 0.66,
};

/**
 * Deterministic proportional glyph measurement calibrated against Geist 400–500.
 * Handles ASCII, punctuation, and wide CJK characters without requiring a live browser DOM.
 */
/** A font's own spacing: how far each character advances and how pairs close up, per `unitsPerEm`. */
export interface FontMetrics {
  unitsPerEm: number;
  advances: Record<string, number>;
  /** Adjustment between two characters, keyed by the pair. */
  kerning: Record<string, number>;
}

/**
 * Width of a run of text. With the font's metrics it is the width the font sets; without them it
 * falls back to `estimateTextBox`, which is within a few percent and good for a block of lines
 * but not for setting words side by side.
 */
export function measureText(text: string, fontSize: number, letterSpacing: number, metrics?: FontMetrics): number {
  if (!metrics) return estimateTextBox(text, fontSize, letterSpacing).width;
  const chars = Array.from(text);
  const fallback = metrics.advances["n"] ?? metrics.unitsPerEm * 0.56;
  let units = 0;
  chars.forEach((ch, i) => {
    units += metrics.advances[ch] ?? ((ch.codePointAt(0) ?? 32) > 0x2e80 ? metrics.unitsPerEm : fallback);
    if (i > 0) units += metrics.kerning[chars[i - 1]! + ch] ?? 0;
  });
  return Math.round(((units / metrics.unitsPerEm) * fontSize + Math.max(0, chars.length - 1) * letterSpacing) * 100) / 100;
}

export function estimateTextBox(
  text: string,
  fontSize: number,
  letterSpacing: number
): { width: number; height: number } {
  let width = 0;
  const chars = Array.from(text);
  for (const ch of chars) {
    const code = ch.codePointAt(0) ?? 32;
    if (code > 0x2e80) {
      width += fontSize * 1.0;
    } else if (CHAR_WIDTH_FACTORS[ch] !== undefined) {
      width += fontSize * CHAR_WIDTH_FACTORS[ch]!;
    } else if (ch >= "A" && ch <= "Z") {
      width += fontSize * 0.68;
    } else {
      width += fontSize * 0.56;
    }
  }
  if (chars.length > 1) {
    width += (chars.length - 1) * letterSpacing;
  }
  return {
    width: Math.round(width * 100) / 100,
    height: Math.round(fontSize * 1.3),
  };
}

/**
 * Builds a closed rounded equilateral triangle VectorNetwork (matches Motionade's native cornerRadius).
 */
export function roundedTriangleNetwork(width: number, cornerRadius: number): {
  network: VectorNetworkIR;
  width: number;
  height: number;
} {
  const height = Math.round(width * (Math.sqrt(3) / 2) * 100) / 100;
  const r = Math.min(cornerRadius, width * 0.25);
  return {
    width,
    height,
    network: {
      vertices: [
        { id: "v0", x: Math.round((width / 2) * 100) / 100, y: 0, cornerRadius: r },
        { id: "v1", x: width, y: height, cornerRadius: r },
        { id: "v2", x: 0, y: height, cornerRadius: r },
      ],
      segments: [
        { id: "s0", startVertexId: "v0", endVertexId: "v1" },
        { id: "s1", startVertexId: "v1", endVertexId: "v2" },
        { id: "s2", startVertexId: "v2", endVertexId: "v0" },
      ],
      closed: true,
      trailName: "Edge",
    },
  };
}

/**
 * Builds a closed regular N-gon (e.g. diamond/hexagon/pentagon) VectorNetwork with rounded corners.
 */
export function roundedPolygonNetwork(
  sides: number,
  diameter: number,
  cornerRadius: number,
  phaseDeg = -90
): { network: VectorNetworkIR; width: number; height: number } {
  const n = Math.max(3, Math.floor(sides));
  const rad = diameter / 2;
  const rawPts: Point2D[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((phaseDeg + (360 / n) * i) * Math.PI) / 180;
    rawPts.push({ x: rad + rad * Math.cos(a), y: rad + rad * Math.sin(a) });
  }
  const minX = Math.min(...rawPts.map((p) => p.x));
  const minY = Math.min(...rawPts.map((p) => p.y));
  const maxX = Math.max(...rawPts.map((p) => p.x));
  const maxY = Math.max(...rawPts.map((p) => p.y));

  const vertices: VectorVertex[] = rawPts.map((p, i) => ({
    id: `v${i}`,
    x: Math.round((p.x - minX) * 100) / 100,
    y: Math.round((p.y - minY) * 100) / 100,
    cornerRadius,
  }));
  const segments: VectorSegment[] = vertices.map((v, i) => ({
    id: `s${i}`,
    startVertexId: v.id,
    endVertexId: vertices[(i + 1) % n]!.id,
  }));

  return {
    width: Math.round((maxX - minX) * 100) / 100,
    height: Math.round((maxY - minY) * 100) / 100,
    network: {
      vertices,
      segments,
      closed: true,
      trailName: "Edge",
    },
  };
}

/**
 * Converts a sequence of world-space waypoints into a smooth C1-continuous cubic-Bezier
 * open VectorNetwork + normalized top-left origin (x, y, width, height).
 */
export function waypointsToSmoothGuideNetwork(
  worldPoints: Point2D[],
  tension = 0.3
): {
  x: number;
  y: number;
  width: number;
  height: number;
  network: VectorNetworkIR;
} {
  if (worldPoints.length < 2) {
    throw new Error("Guide path requires at least 2 waypoints");
  }
  const minX = Math.min(...worldPoints.map((p) => p.x));
  const minY = Math.min(...worldPoints.map((p) => p.y));
  const maxX = Math.max(...worldPoints.map((p) => p.x));
  const maxY = Math.max(...worldPoints.map((p) => p.y));

  const localPts = worldPoints.map((p) => ({
    x: Math.round((p.x - minX) * 100) / 100,
    y: Math.round((p.y - minY) * 100) / 100,
  }));

  const n = localPts.length;
  const tangents: Point2D[] = localPts.map((pt, i) => {
    const prev = localPts[Math.max(0, i - 1)]!;
    const next = localPts[Math.min(n - 1, i + 1)]!;
    const scale = tension * 0.5;
    return {
      x: (next.x - prev.x) * scale,
      y: (next.y - prev.y) * scale,
    };
  });

  const vertices: VectorVertex[] = localPts.map((p, i) => ({
    id: `v${i}`,
    x: p.x,
    y: p.y,
  }));

  const segments: VectorSegment[] = [];
  for (let i = 0; i < n - 1; i++) {
    const t0 = tangents[i]!;
    const t1 = tangents[i + 1]!;
    segments.push({
      id: `s${i}`,
      startVertexId: `v${i}`,
      endVertexId: `v${i + 1}`,
      tangentStart: {
        x: Math.round(t0.x * 100) / 100,
        y: Math.round(t0.y * 100) / 100,
      },
      tangentEnd: {
        x: Math.round(-t1.x * 100) / 100,
        y: Math.round(-t1.y * 100) / 100,
      },
    });
  }

  return {
    x: Math.round(minX * 100) / 100,
    y: Math.round(minY * 100) / 100,
    width: Math.max(1, Math.round((maxX - minX) * 100) / 100),
    height: Math.max(1, Math.round((maxY - minY) * 100) / 100),
    network: {
      vertices,
      segments,
      closed: false,
      trailName: "Path",
    },
  };
}

/**
 * Converts any VectorNetworkIR (including vertex cornerRadius or cubic-Bezier tangents)
 * into a standard SVG `d` path string for Hyperframes & Remotion rendering.
 */
export function vectorNetworkToSvgPath(network: VectorNetworkIR): string {
  const vMap = new Map(network.vertices.map((v) => [v.id, v]));
  if (network.closed && network.vertices.every((v) => (v.cornerRadius ?? 0) > 0)) {
    const verts = network.vertices;
    const n = verts.length;
    const cmds: string[] = [];
    for (let i = 0; i < n; i++) {
      const prev = verts[(i - 1 + n) % n]!;
      const curr = verts[i]!;
      const next = verts[(i + 1) % n]!;
      const r = curr.cornerRadius ?? 0;

      const dx1 = prev.x - curr.x;
      const dy1 = prev.y - curr.y;
      const len1 = Math.hypot(dx1, dy1) || 1;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;
      const len2 = Math.hypot(dx2, dy2) || 1;

      const halfAngle =
        Math.acos(
          Math.max(-1, Math.min(1, (dx1 * dx2 + dy1 * dy2) / (len1 * len2)))
        ) / 2;
      const cut = Math.min(
        r / Math.max(0.15, Math.tan(halfAngle)),
        len1 * 0.48,
        len2 * 0.48
      );

      const pStart = {
        x: curr.x + (dx1 / len1) * cut,
        y: curr.y + (dy1 / len1) * cut,
      };
      const pEnd = {
        x: curr.x + (dx2 / len2) * cut,
        y: curr.y + (dy2 / len2) * cut,
      };
      const c1 = {
        x: pStart.x + (curr.x - pStart.x) * 0.552,
        y: pStart.y + (curr.y - pStart.y) * 0.552,
      };
      const c2 = {
        x: pEnd.x + (curr.x - pEnd.x) * 0.552,
        y: pEnd.y + (curr.y - pEnd.y) * 0.552,
      };

      if (i === 0) {
        cmds.push(`M ${fmt(pStart.x)} ${fmt(pStart.y)}`);
      } else {
        cmds.push(`L ${fmt(pStart.x)} ${fmt(pStart.y)}`);
      }
      cmds.push(
        `C ${fmt(c1.x)} ${fmt(c1.y)}, ${fmt(c2.x)} ${fmt(c2.y)}, ${fmt(pEnd.x)} ${fmt(pEnd.y)}`
      );
    }
    cmds.push("Z");
    return cmds.join(" ");
  }

  const cmds: string[] = [];
  network.segments.forEach((seg, idx) => {
    const v0 = vMap.get(seg.startVertexId)!;
    const v1 = vMap.get(seg.endVertexId)!;
    if (idx === 0) {
      cmds.push(`M ${fmt(v0.x)} ${fmt(v0.y)}`);
    }
    if (seg.tangentStart || seg.tangentEnd) {
      const ts = seg.tangentStart ?? { x: 0, y: 0 };
      const te = seg.tangentEnd ?? { x: 0, y: 0 };
      cmds.push(
        `C ${fmt(v0.x + ts.x)} ${fmt(v0.y + ts.y)}, ${fmt(v1.x + te.x)} ${fmt(v1.y + te.y)}, ${fmt(v1.x)} ${fmt(v1.y)}`
      );
    } else {
      cmds.push(`L ${fmt(v1.x)} ${fmt(v1.y)}`);
    }
  });
  if (network.closed) cmds.push("Z");
  return cmds.join(" ");
}

/**
 * Samples an open VectorNetwork guide curve by normalized arc-length progress u ∈ [0, 1],
 * returning world coordinates when given the guide path node's (offsetX, offsetY).
 */
export function sampleGuideNetworkAtProgress(
  network: VectorNetworkIR,
  offsetX: number,
  offsetY: number,
  progress: number
): Point2D {
  const vMap = new Map(network.vertices.map((v) => [v.id, v]));
  const samples: { x: number; y: number; cumLen: number }[] = [];
  let totalLen = 0;
  const stepsPerSeg = 24;

  network.segments.forEach((seg, sIdx) => {
    const p0 = vMap.get(seg.startVertexId)!;
    const p3 = vMap.get(seg.endVertexId)!;
    const ts = seg.tangentStart ?? { x: 0, y: 0 };
    const te = seg.tangentEnd ?? { x: 0, y: 0 };
    const p1 = { x: p0.x + ts.x, y: p0.y + ts.y };
    const p2 = { x: p3.x + te.x, y: p3.y + te.y };

    const startK = sIdx === 0 ? 0 : 1;
    for (let k = startK; k <= stepsPerSeg; k++) {
      const t = k / stepsPerSeg;
      const mt = 1 - t;
      const x =
        mt * mt * mt * p0.x +
        3 * mt * mt * t * p1.x +
        3 * mt * t * t * p2.x +
        t * t * t * p3.x;
      const y =
        mt * mt * mt * p0.y +
        3 * mt * mt * t * p1.y +
        3 * mt * t * t * p2.y +
        t * t * t * p3.y;
      if (samples.length > 0) {
        const prev = samples[samples.length - 1]!;
        totalLen += Math.hypot(x - prev.x, y - prev.y);
      }
      samples.push({ x: offsetX + x, y: offsetY + y, cumLen: totalLen });
    }
  });

  if (samples.length === 0) return { x: offsetX, y: offsetY };
  const u = Math.max(0, Math.min(1, progress));
  const targetLen = u * totalLen;
  if (targetLen <= 0) return { x: samples[0]!.x, y: samples[0]!.y };
  if (targetLen >= totalLen) {
    const last = samples[samples.length - 1]!;
    return { x: last.x, y: last.y };
  }

  let lo = 0;
  let hi = samples.length - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid]!.cumLen <= targetLen) lo = mid;
    else hi = mid;
  }
  const a = samples[lo]!;
  const b = samples[hi]!;
  const span = Math.max(1e-6, b.cumLen - a.cumLen);
  const f = (targetLen - a.cumLen) / span;
  return {
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f,
  };
}

function fmt(n: number): number {
  return Math.round(n * 100) / 100;
}
