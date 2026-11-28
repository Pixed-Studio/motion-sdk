import { measureText, type FontMetrics } from "../kernel/geometry.ts";
import type { BBox, FrameNodeIR, Point2D, TextNodeIR } from "../kernel/ir.ts";
import type { Score } from "../kernel/score.ts";
import type { Look } from "../look/index.ts";
import { group } from "./index.ts";

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
  /** Type size in pixels, while the phrase fits. */
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
  const desired = opts.size;
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

/** Words that belong together: they are set, and they wrap, as one unit of the sentence. */
export interface SentencePart {
  /** One word or several. Two words joined by a non-breaking space (\u00a0) stay one object. */
  text: string;
  /**
   * The words of this part the sentence is about: the words themselves, as written in `text`, with
   * or without their punctuation (`{ text: "once.", key: "once" }`, `{ text: "a complete floor plan",
   * key: "floor plan" }`), or `true` for all of it.
   */
  key?: true | string | string[];
  /** Start a new line here, whatever the width. */
  breakBefore?: boolean;
}

export interface SentenceOptions {
  look: Look;
  /** Centre of the block, as fractions of the stage. Defaults to the middle. */
  at?: Point2D;
  align?: "center" | "left";
  /** Type size as a share of the stage's shorter relative side (its height on 16:9, its width times 9/16 on a tall stage), while the sentence fits. Defaults to 0.1. */
  size?: number;
  /** Share of the safe width the widest line may take. Defaults to 0.86. */
  maxWidth?: number;
  /** Lines the sentence may wrap to before the type shrinks. Defaults to 2. */
  maxLines?: number;
  slot?: string;
  layer?: number;
  /** The name its bounds at rest are published under. Defaults to "phrase". */
  region?: string;
}

/** A sentence set at rest, and the objects that hold it. */
export interface Sentence {
  set: SetPhrase;
  /** Middle of the sentence at rest, in pixels. */
  middle: Point2D;
  /** The group that carries all of it: move this to move the sentence as one. */
  root: FrameNodeIR;
  lines: FrameNodeIR[];
  /** Each part's share of a line, keyed `part:line`. */
  parts: Map<string, { node: FrameNodeIR; words: SetWord[] }>;
  words: Map<SetWord, TextNodeIR>;
  /** The word objects of one part, in reading order. */
  wordsOf: (part: number) => TextNodeIR[];
  /** The groups that hold one part: one, or one per line it wraps over. */
  groupsOf: (part: number) => FrameNodeIR[];
  region: BBox;
}

/**
 * Sets a sentence given in parts and puts it on the score at rest: one text object per word, held
 * by a group per part, a group per line and one for the whole. The sentence stays on one line
 * while it fits, wraps between parts before it wraps inside one, and shrinks last. Its bounds are
 * published, so whatever surrounds it can keep clear. It adds no motion.
 */
export function sentence(score: Score, parts: (string | SentencePart)[], opts: SentenceOptions): Sentence {
  const { width, height } = score.format;
  const { look } = opts;
  const read = parts.map((part) => {
    const spec = typeof part === "string" ? { text: part } : part;
    const text = spec.text.trim();
    const keys = spec.key === undefined ? [] : spec.key === true ? [text] : Array.isArray(spec.key) ? spec.key : [spec.key];
    return {
      text,
      // Words joined by a non-breaking space stay one unit: they come in, and wrap, together.
      words: text.split(/[ \t\n]+/).map((w) => w.replaceAll("\u00a0", " ")),
      key: new Set(keys.flatMap((k) => k.trim().split(/\s+/))),
      breakBefore: Boolean(spec.breakBefore),
    };
  });
  const align = opts.align ?? "center";
  const at = opts.at ?? { x: 0.5, y: 0.5 };
  const set = setPhrase(read, {
    stage: { width, height },
    safeWidth: score.safeArea.width,
    at,
    align,
    size: score.du(720) * (opts.size ?? 0.1),
    maxWidth: opts.maxWidth ?? 0.86,
    maxLines: opts.maxLines ?? 2,
    trackingEm: look.type.trackingEm,
    metrics: look.type.metrics,
  });
  score.regions[opts.region ?? "phrase"] = set.region;
  // A centred sentence is centred on the point it was asked for; the published region is rounded to whole pixels.
  const middle = { x: align === "center" ? width * at.x : set.region.x + set.region.width / 2, y: set.region.y + set.region.height / 2 };
  const slot = opts.slot ?? "arrivals";
  const originAt = (node: FrameNodeIR, point: Point2D) => {
    node.base.originX = point.x / width;
    node.base.originY = point.y / height;
    return node;
  };
  const root = originAt(group(score, { id: "phrase", name: "Phrase", slot: `${slot}-group`, plane: "focal", layer: opts.layer ?? 10 }), middle);
  const lines = set.lines.map((_, line) =>
    group(score, { id: `line_${line + 1}`, name: `Line ${line + 1}`, slot: `${slot}-group`, plane: "focal", parentId: root.id, layer: line + 1 })
  );
  const held = new Map<string, { node: FrameNodeIR; words: SetWord[] }>();
  const words = new Map<SetWord, TextNodeIR>();
  for (const word of set.words) {
    const partKey = `${word.arrival}:${word.line}`;
    if (!held.has(partKey)) {
      const mine = set.words.filter((w) => w.arrival === word.arrival && w.line === word.line);
      const left = mine[0]!.x;
      const right = mine.at(-1)!.x + mine.at(-1)!.width;
      const node = group(score, {
        id: `arrival_${word.arrival + 1}${set.words.some((w) => w.arrival === word.arrival && w.line !== word.line) ? `_line_${word.line + 1}` : ""}`,
        name: read[word.arrival]!.text,
        slot: `${slot}-group`,
        plane: "focal",
        parentId: lines[word.line]!.id,
        layer: word.arrival + 1,
      });
      held.set(partKey, { node: originAt(node, { x: (left + right) / 2, y: set.lines[word.line]!.y + set.box / 2 }), words: mine });
    }
    words.set(
      word,
      score.add<TextNodeIR>({
        id: score.id(`w_${word.text.toLowerCase()}`),
        kind: "text",
        name: word.text,
        slot,
        role: "subject",
        plane: "focal",
        parentId: held.get(partKey)!.node.id,
        layer: word.order + 1,
        base: { x: word.x, y: set.lines[word.line]!.y, width: word.width, height: set.box },
        text: word.text,
        fontFamily: look.type.family,
        fontSize: set.fontSize,
        fontWeight: look.type.weight,
        letterSpacing: set.tracking,
        textAlign: "center",
        fill: { kind: "solid", color: look.ink },
      })
    );
  }
  return {
    set,
    middle,
    root,
    lines,
    parts: held,
    words,
    region: set.region,
    wordsOf: (part) => [...words].filter(([w]) => w.arrival === part).map(([, node]) => node),
    groupsOf: (part) => [...held].filter(([key]) => key.startsWith(`${part}:`)).map(([, h]) => h.node),
  };
}
