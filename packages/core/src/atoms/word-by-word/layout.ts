import { measureText, type FontMetrics } from "../../kernel/geometry.ts";
import type { BBox } from "../../kernel/ir.ts";

export interface SetWord {
  text: string;
  /** Index of the arrival it belongs to. */
  arrival: number;
  /** Its place among the words of that arrival. */
  order: number;
  key: boolean;
  line: number;
  x: number;
  width: number;
}

export interface SetPhrase {
  fontSize: number;
  tracking: number;
  /** Height of one line's box and the distance from one line's top to the next. */
  box: number;
  pitch: number;
  words: SetWord[];
  /** Each line's top, left edge and width at rest. */
  lines: { y: number; x: number; width: number }[];
  region: BBox;
}

export interface SetOptions {
  stage: { width: number; height: number };
  safeWidth: number;
  /** Centre of the block, as fractions of the stage. */
  at: { x: number; y: number };
  align: "center" | "left";
  /** Type size as a share of stage height, while the phrase fits. */
  size: number;
  /** Share of the safe width the widest line may take. */
  maxWidth: number;
  /** Most lines the phrase may wrap to before the type shrinks. */
  maxLines: number;
  trackingEm: number;
  metrics?: FontMetrics;
}

const LINE_PITCH = 1.16;
const LINE_BOX = 1.3;
/** What a break inside an arrival costs, in em of line width: prefer breaking between arrivals. */
const SPLIT_COST = 2.5;

/**
 * Sets words into lines at one type size. The phrase stays on one line while it fits, wraps where
 * the lines come out most even (between arrivals when it can), and shrinks only when the allowed
 * lines are not enough. Every word gets its own box, spaced as the font spaces it.
 */
export function setPhrase(
  arrivals: { words: string[]; key: Set<string>; breakBefore: boolean }[],
  opts: SetOptions
): SetPhrase {
  const flat = arrivals.flatMap((a, arrival) =>
    a.words.map((text, order) => ({
      text,
      arrival,
      order,
      key: text.split(" ").every((part) => a.key.has(part) || a.key.has(part.replace(/[.,!?;:]+$/, ""))),
    }))
  );
  const em = (text: string) => measureText(text, 100, opts.trackingEm * 100, opts.metrics) / 100;
  const widths = flat.map((w) => em(w.text));
  // The gap a space makes between two words, with the font's kerning on both sides of it.
  const gaps = flat.slice(1).map((w, i) => em(`${flat[i]!.text} ${w.text}`) - widths[i]! - widths[i + 1]!);
  const lineEm = (from: number, to: number) => {
    let total = 0;
    for (let i = from; i < to; i++) total += widths[i]! + (i > from ? gaps[i - 1]! : 0);
    return total;
  };

  const forced = flat.flatMap((w, i) => (i > 0 && w.order === 0 && arrivals[w.arrival]!.breakBefore ? [i] : []));
  const desired = opts.stage.height * opts.size;
  const limitEm = (opts.safeWidth * opts.maxWidth) / desired;
  const widest = (breaks: number[]) => {
    const edges = [0, ...breaks, flat.length];
    return Math.max(...edges.slice(1).map((to, i) => lineEm(edges[i]!, to)));
  };
  const cost = (breaks: number[]) =>
    widest(breaks) + breaks.filter((b) => !forced.includes(b) && flat[b]!.order !== 0).length * SPLIT_COST;

  const best = (lines: number, betweenArrivals: boolean): number[] | null => {
    const free = lines - 1 - forced.length;
    if (free < 0) return null;
    const open = Array.from({ length: flat.length - 1 }, (_, i) => i + 1).filter(
      (b) => !forced.includes(b) && (!betweenArrivals || flat[b]!.order === 0)
    );
    let found: number[] | null = null;
    const choose = (from: number, picked: number[]) => {
      if (picked.length === free) {
        const breaks = [...forced, ...picked].sort((a, b) => a - b);
        if (!found || cost(breaks) < cost(found)) found = breaks;
        return;
      }
      for (let i = from; i < open.length; i++) choose(i + 1, [...picked, open[i]!]);
    };
    choose(0, []);
    return found;
  };

  // Fewest lines first; at each count a break between arrivals is taken over one inside an arrival
  // whenever it fits, because an arrival is a breath and a line break in the middle of one reads wrong.
  const most = Math.min(Math.max(opts.maxLines, forced.length + 1), flat.length);
  let breaks: number[] = best(most, false) ?? [];
  search: for (let lines = forced.length + 1; lines <= most; lines++) {
    for (const betweenArrivals of [true, false]) {
      const candidate = best(lines, betweenArrivals);
      if (candidate && widest(candidate) <= limitEm) {
        breaks = candidate;
        break search;
      }
    }
  }

  const fontSize = Math.max(12, Math.floor(Math.min(desired, (opts.safeWidth * opts.maxWidth) / widest(breaks))));
  const tracking = Math.round(fontSize * opts.trackingEm * 10) / 10;
  const box = Math.round(fontSize * LINE_BOX);
  const pitch = Math.round(fontSize * LINE_PITCH);
  const edges = [0, ...breaks, flat.length];
  const count = edges.length - 1;
  const blockHeight = (count - 1) * pitch + box;
  const top = Math.round(opts.stage.height * opts.at.y - blockHeight / 2);
  // Positions are measured again at the real size and its rounded tracking, so each word's box and
  // the space beside it add up to the width the font gives the run.
  const px = (text: string) => measureText(text, fontSize, tracking, opts.metrics);
  const widthPx = flat.map((w) => px(w.text));
  const gapPx = flat.slice(1).map((w, i) => px(`${flat[i]!.text} ${w.text}`) - widthPx[i]! - widthPx[i + 1]!);
  const lineWidths = edges.slice(1).map((to, line) => {
    let total = 0;
    for (let i = edges[line]!; i < to; i++) total += widthPx[i]! + (i > edges[line]! ? gapPx[i - 1]! : 0);
    return total;
  });
  const blockWidth = Math.max(...lineWidths);
  const centre = opts.stage.width * opts.at.x;

  const words: SetWord[] = [];
  const lines = lineWidths.map((width, line) => {
    const x = opts.align === "left" ? centre - blockWidth / 2 : centre - width / 2;
    let cursor = x;
    for (let i = edges[line]!; i < edges[line + 1]!; i++) {
      if (i > edges[line]!) cursor += gapPx[i - 1]!;
      const w = widthPx[i]!;
      words.push({ ...flat[i]!, line, x: Math.round(cursor * 100) / 100, width: Math.round(w * 100) / 100 });
      cursor += w;
    }
    return { y: top + line * pitch, x: Math.round(x * 100) / 100, width: Math.round(width * 100) / 100 };
  });

  const left = Math.min(...lines.map((l) => l.x));
  return {
    fontSize,
    tracking,
    box,
    pitch,
    words,
    lines,
    region: { x: Math.round(left), y: top, width: Math.round(blockWidth), height: blockHeight },
  };
}
