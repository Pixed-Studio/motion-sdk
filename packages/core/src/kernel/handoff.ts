import { evaluateAt } from "./evaluate.ts";
import type { FillSpec, HandoffIR, MotionDocument } from "./ir.ts";

function dominantColor(fill: FillSpec, fallback: string): string {
  if (fill.kind === "solid") return fill.color;
  if (fill.kind === "linear" || fill.kind === "radial") {
    return fill.stops[Math.floor(fill.stops.length / 2)]?.color ?? fallback;
  }
  return fallback;
}

/**
 * Reads where an object is and how it moves at a frame: the anchor a neighbouring shot matches.
 * Velocity is measured over the two frames nearest the edge, so it is what the viewer last saw.
 */
export function measureHandoff(doc: MotionDocument, nodeId: string, frame: number): HandoffIR {
  const last = doc.format.durationFrames - 1;
  const f = Math.max(0, Math.min(last, frame));
  const a = Math.max(0, f === 0 ? 0 : f - 1);
  const b = f === 0 ? Math.min(last, 1) : f;
  const sa = evaluateAt(doc, a).get(nodeId);
  const sb = evaluateAt(doc, b).get(nodeId);
  const here = evaluateAt(doc, f).get(nodeId);
  const node = doc.nodes.find((n) => n.id === nodeId);
  if (!node || !here || !sa || !sb) throw new Error(`No object "${nodeId}" to hand over.`);
  const perSec = doc.format.fps / Math.max(1, b - a);
  const moving = sa.visible && sb.visible;
  return {
    frame: f,
    nodeId,
    position: { x: Math.round(here.x * 10) / 10, y: Math.round(here.y * 10) / 10 },
    velocity: {
      x: moving ? Math.round((sb.x - sa.x) * perSec) : 0,
      y: moving ? Math.round((sb.y - sa.y) * perSec) : 0,
    },
    size: Math.round(Math.max(here.width, here.height)),
    color: node.kind === "frame" ? "" : dominantColor(node.fill, ""),
  };
}

export interface HandoffMismatch {
  what: "position" | "speed" | "direction" | "color";
  message: string;
}

/**
 * Compares one shot's exit with the next shot's entry. A cut can carry motion across with no
 * overlap when the focus is in the same place, moving the same way, in the same colour. This
 * reports where the two disagree; a deliberate break is the author's to keep.
 */
export function checkHandoff(
  exit: HandoffIR | undefined,
  entry: HandoffIR | undefined,
  tolerance: { positionPx?: number; speedRatio?: number; directionDeg?: number } = {}
): HandoffMismatch[] {
  if (!exit || !entry) {
    return [
      {
        what: "position",
        message: !exit ? "The outgoing shot declares no exit handoff." : "The incoming shot declares no entry handoff.",
      },
    ];
  }
  const out: HandoffMismatch[] = [];
  const gap = Math.hypot(entry.position.x - exit.position.x, entry.position.y - exit.position.y);
  const allowed = tolerance.positionPx ?? Math.max(24, exit.size * 0.1);
  if (gap > allowed) {
    out.push({
      what: "position",
      message: `The focus leaves at (${exit.position.x}, ${exit.position.y}) and is picked up at (${entry.position.x}, ${entry.position.y}), ${Math.round(gap)} px apart.`,
    });
  }
  const vOut = Math.hypot(exit.velocity.x, exit.velocity.y);
  const vIn = Math.hypot(entry.velocity.x, entry.velocity.y);
  const still = 30;
  if (vOut > still || vIn > still) {
    const ratio = Math.min(vOut, vIn) / Math.max(vOut, vIn, 1e-6);
    if (ratio < (tolerance.speedRatio ?? 0.5)) {
      out.push({
        what: "speed",
        message: `It leaves at ${Math.round(vOut)} px/s and enters at ${Math.round(vIn)} px/s. The join reads as a stop or a jolt.`,
      });
    } else {
      const cos = (exit.velocity.x * entry.velocity.x + exit.velocity.y * entry.velocity.y) / (vOut * vIn);
      const angle = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
      if (angle > (tolerance.directionDeg ?? 35)) {
        out.push({ what: "direction", message: `The direction of travel turns ${Math.round(angle)}° across the join.` });
      }
    }
  }
  if (exit.color && entry.color && exit.color.toLowerCase() !== entry.color.toLowerCase()) {
    out.push({ what: "color", message: `The focus is ${exit.color} going out and ${entry.color} coming in.` });
  }
  return out;
}
