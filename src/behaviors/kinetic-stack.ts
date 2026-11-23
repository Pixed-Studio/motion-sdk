import { estimateTextBox } from "../kernel/geometry.ts";
import type {
  BBox,
  MotionBlockIR,
  MotionFormat,
  SceneNodeIR,
  TextNodeIR,
} from "../kernel/ir.ts";
import { SNAPPY_EDITORIAL_FEEL, type BrandTheme, type FeelPreset } from "../kernel/tokens.ts";
import type { BeatGridSchedule } from "./beat-grid.ts";

export interface HeadlineLineSlotItem {
  id?: string;
  text: string;
  slideOffsetPx?: number;
  startLetterSpacing?: number;
}

export interface KineticStackOptions {
  parentId: string;
  format: MotionFormat;
  theme: BrandTheme;
  schedule: BeatGridSchedule;
  lines: (string | HeadlineLineSlotItem)[];
  feel?: FeelPreset;
  safeMarginX?: number;
  safeMarginY?: number;
  layer?: number;
}

export interface KineticStackResult {
  nodes: SceneNodeIR[];
  motions: MotionBlockIR[];
  focalBounds: BBox;
  fontSize: number;
}

/**
 * L1 Behavior: Variable-Cardinality Kinetic Typography Stack.
 * Accepts 1..N lines, scales font size & vertical rhythm automatically so any line count
 * or phrase length stays balanced inside safe margins, and exports `focalBounds` for other behaviors.
 */
export function createKineticStack(opts: KineticStackOptions): KineticStackResult {
  const feel = opts.feel ?? SNAPPY_EDITORIAL_FEEL;
  const items: HeadlineLineSlotItem[] = opts.lines.map((l) =>
    typeof l === "string" ? { text: l } : l
  );
  const count = items.length;
  const safeX = opts.safeMarginX ?? Math.round(opts.format.width * 0.08);
  const safeY = opts.safeMarginY ?? Math.round(opts.format.height * 0.09);
  const maxAllowedW = opts.format.width - safeX * 2;
  const maxAllowedH = opts.format.height - safeY * 2;

  // Base editorial scale: 93px at 720p for <=3 lines; gently scale down for 4+ lines
  const baseScaleByCount =
    count <= 2 ? 0.138 : count === 3 ? 0.1292 : count === 4 ? 0.106 : 0.088;
  let fontSize = Math.round(opts.format.height * baseScaleByCount);
  const targetTracking = Math.round(-fontSize * 0.0215 * 10) / 10;

  // Shrink fontSize if the widest phrase or total stack height exceeds safe bounds
  for (let guard = 0; guard < 12; guard++) {
    const widest = Math.max(
      ...items.map((it) => estimateTextBox(it.text, fontSize, targetTracking).width)
    );
    const pitch = Math.round(fontSize * 1.025);
    const totalH = (count - 1) * pitch + Math.round(fontSize * 1.3);
    if (widest <= maxAllowedW * 0.64 && totalH <= maxAllowedH * 0.76) {
      break;
    }
    fontSize = Math.max(28, Math.floor(fontSize * 0.92));
  }

  const linePitch = Math.round(fontSize * 1.025);
  const lineBoxH = Math.round(fontSize * 1.3);
  const stackHeight = (count - 1) * linePitch + lineBoxH;
  // Optical center sits ~1% above geometric canvas midpoint
  const startY = Math.round((opts.format.height * 0.995 - stackHeight) / 2);

  const groupId = "headline_group";
  const nodes: SceneNodeIR[] = [
    {
      id: groupId,
      kind: "frame",
      name: "Headline Typography",
      slot: "headline-group",
      role: "focal-group",
      parentId: opts.parentId,
      layer: opts.layer ?? 3,
      base: {
        x: 0,
        y: 0,
        width: opts.format.width,
        height: opts.format.height,
      },
    },
  ];

  const motions: MotionBlockIR[] = [];
  let minX = Infinity;
  let maxX = -Infinity;

  items.forEach((item, idx) => {
    const slug =
      item.id ??
      `txt_${
        item.text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "") || `line_${idx + 1}`
      }`;
    const measured = estimateTextBox(item.text, fontSize, targetTracking);
    const x = Math.round(((opts.format.width - measured.width) / 2) * 100) / 100;
    const y = startY + idx * linePitch;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + measured.width);

    const textNode: TextNodeIR = {
      id: slug,
      kind: "text",
      name: item.text,
      slot: "headline-line",
      role: "focal-text",
      parentId: groupId,
      layer: idx + 1,
      base: {
        x,
        y,
        width: measured.width,
        height: lineBoxH,
      },
      text: item.text,
      fontFamily: opts.theme.fontFamily,
      fontSize,
      fontWeight: opts.theme.fontWeight,
      letterSpacing: targetTracking,
      textAlign: "center",
      fill: { kind: "solid", color: opts.theme.ink },
    };
    nodes.push(textNode);

    const beatFrame = opts.schedule.beatFrames[idx] ?? 0;
    const slideDur = opts.schedule.framesForSec(feel.lineSlideSec, 12);
    const trackDur = opts.schedule.framesForSec(feel.lineTrackSec, 10);
    const slidePx =
      item.slideOffsetPx ??
      Math.round(fontSize * (0.48 + (idx % 2 === 1 ? 0.14 : 0)));
    const startTrack =
      item.startLetterSpacing ??
      Math.round((targetTracking + fontSize * 0.055) * 10) / 10;

    motions.push({
      kind: "vec2",
      id: `act_${slug}_slide`,
      name: `${item.text} slide in`,
      targetId: slug,
      property: "move",
      mode: "add",
      stage: idx === 0 ? "custom" : "in",
      startFrame: beatFrame,
      durationFrames: slideDur,
      keys: [
        {
          id: `${slug}_move_k0`,
          frame: 0,
          x: slidePx,
          y: 0,
          easing: feel.textSlideEase,
        },
        {
          id: `${slug}_move_k1`,
          frame: slideDur - 1,
          x: 0,
          y: 0,
        },
      ],
    });

    motions.push({
      kind: "scalar",
      id: `act_${slug}_track`,
      name: `${item.text} tracking tighten`,
      targetId: slug,
      property: "letterSpacing",
      mode: "set",
      stage: "custom",
      startFrame: beatFrame,
      durationFrames: trackDur,
      baseValue: targetTracking,
      keys: [
        {
          id: `${slug}_track_k0`,
          frame: 0,
          value: startTrack,
          easing: feel.textSlideEase,
        },
        {
          id: `${slug}_track_k1`,
          frame: trackDur - 1,
          value: targetTracking,
        },
      ],
    });
  });

  const focalBounds: BBox = {
    x: Math.round(minX),
    y: startY,
    width: Math.round(maxX - minX),
    height: stackHeight,
  };

  return { nodes, motions, focalBounds, fontSize };
}
