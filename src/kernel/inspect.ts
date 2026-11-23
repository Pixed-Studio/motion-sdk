import { boxesIntersect, padBox, sampleGuideNetworkAtProgress } from "./geometry.ts";
import type {
  BBox,
  MotionDocument,
  PathNodeIR,
  ScalarKey,
  SceneNodeIR,
  Vec2Key,
} from "./ir.ts";
import { evaluateEasing } from "./tokens.ts";

export interface SlotSnapshotEntry {
  id: string;
  slot: string;
  role: string;
  label: string;
  worldCenter: { x: number; y: number };
  worldBBox: BBox;
  opacity: number;
  blur: number;
  rotation: number;
  scale: number;
}

export interface MotionAuditFinding {
  rule:
    | "wcag-text-contrast"
    | "safe-zone-headline"
    | "focal-clearance"
    | "mask-sync"
    | "timeline-liveness";
  severity: "error" | "warning";
  message: string;
  frame?: number;
  nodeId?: string;
}

export interface MotionAuditReport {
  ok: boolean;
  contrastRatio: number;
  slotCounts: Record<string, number>;
  findings: MotionAuditFinding[];
}

function sampleScalarKeys(keys: ScalarKey[], localFrame: number, fallback: number): number {
  if (keys.length === 0) return fallback;
  if (localFrame <= keys[0]!.frame) return keys[0]!.value;
  const last = keys[keys.length - 1]!;
  if (localFrame >= last.frame) return last.value;

  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i]!;
    const k1 = keys[i + 1]!;
    if (localFrame >= k0.frame && localFrame <= k1.frame) {
      const span = Math.max(1e-6, k1.frame - k0.frame);
      const u = evaluateEasing(k0.easing, (localFrame - k0.frame) / span);
      return k0.value + (k1.value - k0.value) * u;
    }
  }
  return last.value;
}

function sampleVec2Keys(
  keys: Vec2Key[],
  localFrame: number,
  fallback: { x: number; y: number }
): { x: number; y: number } {
  if (keys.length === 0) return fallback;
  if (localFrame <= keys[0]!.frame) return { x: keys[0]!.x, y: keys[0]!.y };
  const last = keys[keys.length - 1]!;
  if (localFrame >= last.frame) return { x: last.x, y: last.y };

  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i]!;
    const k1 = keys[i + 1]!;
    if (localFrame >= k0.frame && localFrame <= k1.frame) {
      const span = Math.max(1e-6, k1.frame - k0.frame);
      const u = evaluateEasing(k0.easing, (localFrame - k0.frame) / span);
      return {
        x: k0.x + (k1.x - k0.x) * u,
        y: k0.y + (k1.y - k0.y) * u,
      };
    }
  }
  return { x: last.x, y: last.y };
}

interface EvaluatedNodeState {
  visible: boolean;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  blur: number;
}

export function evaluateSceneAtFrame(
  doc: MotionDocument,
  frame: number
): Map<string, EvaluatedNodeState> {
  const nodeMap = new Map<string, SceneNodeIR>(doc.nodes.map((n) => [n.id, n]));
  const memo = new Map<string, EvaluatedNodeState>();

  const evalNode = (node: SceneNodeIR): EvaluatedNodeState => {
    const cached = memo.get(node.id);
    if (cached) return cached;

    if (node.range) {
      const end = node.range.startFrame + node.range.durationFrames;
      if (frame < node.range.startFrame || frame >= end) {
        const hidden: EvaluatedNodeState = {
          visible: false,
          centerX: 0,
          centerY: 0,
          width: 0,
          height: 0,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 0,
          blur: 0,
        };
        memo.set(node.id, hidden);
        return hidden;
      }
    }

    const originX = node.base.originX ?? 0.5;
    const originY = node.base.originY ?? 0.5;
    let x = node.base.x;
    let y = node.base.y;
    let rotation = node.base.rotation ?? 0;
    let opacity = node.base.opacity ?? 1;
    let blur = node.base.blur ?? 0;
    let scaleX = 1;
    let scaleY = 1;
    let followedCenter: { x: number; y: number } | null = null;

    for (const m of doc.motions) {
      if (m.targetId !== node.id) continue;
      const endFrame = m.startFrame + m.durationFrames - 1;
      const activeOrHeld = frame >= m.startFrame;
      if (!activeOrHeld) continue;
      const localF = Math.min(frame - m.startFrame, Math.max(0, m.durationFrames - 1));

      if (m.kind === "scalar") {
        if (frame > endFrame && m.post === "none") continue;
        const val = sampleScalarKeys(m.keys, localF, m.baseValue ?? 0);
        if (m.property === "opacity") {
          opacity = m.mode === "set" ? val : opacity + val;
        } else if (m.property === "layerBlur") {
          blur = m.mode === "set" ? val : blur + val;
        } else if (m.property === "rotation") {
          rotation = m.mode === "set" ? val : rotation + val;
        }
      } else if (m.kind === "vec2") {
        const v = sampleVec2Keys(m.keys, localF, m.mode === "multiply" ? { x: 1, y: 1 } : { x: 0, y: 0 });
        if (m.property === "move") {
          x += v.x;
          y += v.y;
        } else if (m.property === "scale") {
          scaleX *= v.x;
          scaleY *= v.y;
        }
      } else if (m.kind === "followPath") {
        const guide = nodeMap.get(m.guidePathId) as PathNodeIR | undefined;
        if (guide && guide.kind === "path") {
          const rawU =
            m.durationFrames <= 1 ? 1 : localF / (m.durationFrames - 1);
          const easedU = evaluateEasing(m.progressEasing, rawU);
          followedCenter = sampleGuideNetworkAtProgress(
            guide.network,
            guide.base.x,
            guide.base.y,
            easedU
          );
        }
      }
    }

    let cx = followedCenter
      ? followedCenter.x
      : x + node.base.width * originX;
    let cy = followedCenter
      ? followedCenter.y
      : y + node.base.height * originY;

    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        const pState = evalNode(parent);
        if (!pState.visible || pState.opacity <= 0.001) {
          const hidden: EvaluatedNodeState = {
            visible: false,
            centerX: cx,
            centerY: cy,
            width: node.base.width * scaleX,
            height: node.base.height * scaleY,
            rotation,
            scaleX,
            scaleY,
            opacity: 0,
            blur,
          };
          memo.set(node.id, hidden);
          return hidden;
        }
        const pOriginX = parent.base.x + parent.base.width * (parent.base.originX ?? 0.5);
        const pOriginY = parent.base.y + parent.base.height * (parent.base.originY ?? 0.5);
        const rad = (pState.rotation * Math.PI) / 180;
        const dx = cx - pOriginX;
        const dy = cy - pOriginY;
        cx = pState.centerX + dx * Math.cos(rad) - dy * Math.sin(rad);
        cy = pState.centerY + dx * Math.sin(rad) + dy * Math.cos(rad);
        rotation += pState.rotation;
        opacity *= pState.opacity;
        blur += pState.blur;
      }
    }

    const res: EvaluatedNodeState = {
      visible: opacity > 0.001,
      centerX: cx,
      centerY: cy,
      width: node.base.width * scaleX,
      height: node.base.height * scaleY,
      rotation,
      scaleX,
      scaleY,
      opacity,
      blur,
    };
    memo.set(node.id, res);
    return res;
  };

  for (const n of doc.nodes) evalNode(n);
  return memo;
}

/**
 * Semantic scene snapshot for AI agents (mirrors `@ui-sdk/core/agent` `snapshot()`).
 * Lists visible, non-auxiliary slots with world-space bounding boxes without rendering pixels.
 */
export function snapshotMotion(
  doc: MotionDocument,
  frame: number
): SlotSnapshotEntry[] {
  const states = evaluateSceneAtFrame(doc, frame);
  const out: SlotSnapshotEntry[] = [];

  for (const node of doc.nodes) {
    if (
      node.kind === "frame" ||
      node.role === "guide-path" ||
      node.role === "mask-source"
    ) {
      continue;
    }
    const st = states.get(node.id);
    if (!st || !st.visible) continue;

    const w = st.width;
    const h = st.height;
    out.push({
      id: node.id,
      slot: node.slot,
      role: node.role,
      label: node.kind === "text" ? node.text : node.name,
      worldCenter: {
        x: Math.round(st.centerX * 10) / 10,
        y: Math.round(st.centerY * 10) / 10,
      },
      worldBBox: {
        x: Math.round((st.centerX - w / 2) * 10) / 10,
        y: Math.round((st.centerY - h / 2) * 10) / 10,
        width: Math.round(w * 10) / 10,
        height: Math.round(h * 10) / 10,
      },
      opacity: Math.round(st.opacity * 1000) / 1000,
      blur: Math.round(st.blur * 10) / 10,
      rotation: Math.round(st.rotation * 10) / 10,
      scale: Math.round(st.scaleX * 1000) / 1000,
    });
  }
  return out;
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "").slice(0, 6);
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function wcagContrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

/**
 * Deterministic choreography & layout audit (mirrors `@ui-sdk/core/testing` `checkPattern`).
 */
export function auditMotion(doc: MotionDocument): MotionAuditReport {
  const findings: MotionAuditFinding[] = [];
  const slotCounts: Record<string, number> = {};
  for (const n of doc.nodes) {
    slotCounts[n.slot] = (slotCounts[n.slot] ?? 0) + 1;
  }

  // 1. WCAG contrast check on focal text against canvas surface
  let minContrast = 21;
  for (const n of doc.nodes) {
    if (n.kind === "text" && n.role === "focal-text") {
      const ratio = wcagContrastRatio(n.fill.color, doc.scene.backgroundColor);
      minContrast = Math.min(minContrast, ratio);
      if (ratio < 4.5) {
        findings.push({
          rule: "wcag-text-contrast",
          severity: "error",
          nodeId: n.id,
          message: `Text "${n.text}" contrast ${ratio}:1 is below WCAG AA 4.5:1 against ${doc.scene.backgroundColor}`,
        });
      }
    }
  }

  // 2. Safe-zone check at settled read frame (just before focus-pull transition)
  const readFrame = Math.max(0, doc.annotations.convergeStartFrame - 6);
  const readSnap = snapshotMotion(doc, readFrame);
  const safeBox: BBox = {
    x: doc.annotations.safeMargin.x,
    y: doc.annotations.safeMargin.y,
    width: doc.format.width - doc.annotations.safeMargin.x * 2,
    height: doc.format.height - doc.annotations.safeMargin.y * 2,
  };

  for (const item of readSnap) {
    if (item.role === "focal-text") {
      const b = item.worldBBox;
      if (
        b.x < safeBox.x ||
        b.y < safeBox.y ||
        b.x + b.width > safeBox.x + safeBox.width ||
        b.y + b.height > safeBox.y + safeBox.height
      ) {
        findings.push({
          rule: "safe-zone-headline",
          severity: "error",
          frame: readFrame,
          nodeId: item.id,
          message: `Headline "${item.label}" overflows safe margin at frame ${readFrame}`,
        });
      }
    }
  }

  // 3. Focal-clearance check: orbit items must not park their centers inside inner headline box at readFrame
  const innerCore = padBox(doc.annotations.focalBounds, -18, -18);
  for (const item of readSnap) {
    if (item.role === "orbit-item") {
      const centerPointBox: BBox = {
        x: item.worldCenter.x - 4,
        y: item.worldCenter.y - 4,
        width: 8,
        height: 8,
      };
      if (boxesIntersect(centerPointBox, innerCore)) {
        findings.push({
          rule: "focal-clearance",
          severity: "warning",
          frame: readFrame,
          nodeId: item.id,
          message: `Orbit item "${item.label}" center intrudes into headline focal core at frame ${readFrame}`,
        });
      }
    }
  }

  // 4. Mask synchronization check
  const nodeById = new Map(doc.nodes.map((n) => [n.id, n]));
  for (const mask of doc.masks) {
    const src = nodeById.get(mask.sourceObjectId);
    const dst = nodeById.get(mask.targetObjectId);
    if (!src || !dst) {
      findings.push({
        rule: "mask-sync",
        severity: "error",
        message: `Mask "${mask.id}" references missing source or target node`,
      });
      continue;
    }
    if (src.range && dst.range) {
      const srcEnd = src.range.startFrame + src.range.durationFrames;
      const dstEnd = dst.range.startFrame + dst.range.durationFrames;
      if (src.range.startFrame > dst.range.startFrame || srcEnd < dstEnd) {
        findings.push({
          rule: "mask-sync",
          severity: "error",
          nodeId: mask.id,
          message: `Mask source "${src.id}" range [${src.range.startFrame}..${srcEnd}] does not cover target "${dst.id}" [${dst.range.startFrame}..${dstEnd}]`,
        });
      }
    }
  }

  // 5. Liveness check prior to emblem settle
  const maxDeadFrames = Math.ceil(doc.format.fps * 0.65);
  let deadRun = 0;
  let prevSig = "";
  for (let f = 0; f <= doc.annotations.emblemSettleFrame; f++) {
    const snap = snapshotMotion(doc, f);
    const sig = snap
      .map(
        (s) =>
          `${s.id}:${s.worldCenter.x},${s.worldCenter.y},${s.rotation},${s.scale},${s.opacity},${s.blur}`
      )
      .join("|");
    if (f > 0 && sig === prevSig) {
      deadRun++;
      if (deadRun > maxDeadFrames) {
        findings.push({
          rule: "timeline-liveness",
          severity: "error",
          frame: f,
          message: `Dead zone exceeding ${maxDeadFrames} static frames detected ending at frame ${f}`,
        });
        break;
      }
    } else {
      deadRun = 0;
    }
    prevSig = sig;
  }

  return {
    ok: findings.every((f) => f.severity !== "error"),
    contrastRatio: minContrast,
    slotCounts,
    findings,
  };
}
