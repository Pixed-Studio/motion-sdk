import { readingSec } from "../../behaviors/arrive.ts";
import { respond } from "../../behaviors/respond.ts";
import { unit } from "../../behaviors/travel.ts";
import { snappyEditorial, type Feel } from "../../feel/index.ts";
import { ease, linear } from "../../kernel/easing.ts";
import { measureHandoff } from "../../kernel/handoff.ts";
import type { FrameNodeIR, MotionReason, Point2D, TextNodeIR, Vec2Key } from "../../kernel/ir.ts";
import { defineShot, slot } from "../../kernel/shot.ts";
import { flat, gleanEditorial, type Look, type MaterialName } from "../../look/index.ts";
import { createClock, type Tempo } from "../../rhythm/clock.ts";
import { solvePhrase } from "../../rhythm/phrase.ts";
import { group, place, polar } from "../../stage/index.ts";
import { setPhrase, type SetWord } from "./layout.ts";

export { setPhrase } from "./layout.ts";

/** Words that come in together, on one cue. */
export interface Arrival {
  /** One word or several. Several come in as one gesture, a moment apart. */
  text: string;
  /** The words of it the sentence is about. They are set in the look's primary colour. */
  key?: string | string[];
  /** Seconds it needs to be read, when its length misleads. */
  needsSec?: number;
  /** Start a new line here, whatever the width. */
  breakBefore?: boolean;
}

/** Something soft behind the phrase that moves a little each time words arrive. */
export interface AmbientItem {
  id: string;
  /** Its colour. Left out, it takes the look's backdrop colour, which is chosen to hold the ink. */
  material?: MaterialName;
  /** Where it sits from the middle of the phrase: a direction, and a distance in type sizes. */
  angleDeg: number;
  distance: number;
  /** Its width and height in type sizes. */
  width: number;
  height?: number;
  opacity?: number;
  /** How far it moves out on a full-weight arrival, in design units. Defaults to 16. */
  answer?: number;
}

export interface WordByWordDecisions {
  width?: number;
  height?: number;
  fps?: number;
  durationSec?: number;
  look?: Look;
  feel?: Feel;
  tempo?: Tempo;
  accent?: "last" | "first" | "none" | number;
  hold?: number;
  cueSeconds?: number[];
  punch?: number | false;
  enter?: "focus" | "rise" | "fade";
  layout?: "recentre" | "anchored";
  align?: "center" | "left";
  at?: Point2D;
  size?: number;
  maxWidth?: number;
  maxLines?: number;
  exit?: "cut" | "shrink";
}

/** The largest an accent may start when other words are already on its line. */
const BESIDE_PUNCH = 1.14;
/** Share of the space to a neighbour an accent may grow into. */
const BESIDE_CLEARANCE = 0.4;
/** How small the phrase gets as it leaves, when it leaves by shrinking. Measured: 0.8 over a third of a second. */
const EXIT_SCALE = 0.8;
/** How far a word rises into place, in em, when words rise. */
const RISE_EM = 0.42;
/** A word is already this visible on its cue's frame, so the cue is where it is first seen. */
const FIRST_SEEN = 0.7;

export function defaultAmbient(): AmbientItem[] {
  return [
    { id: "glow-a", angleDeg: 205, distance: 3.1, width: 7.5, height: 4.6, opacity: 0.55 },
    { id: "glow-b", angleDeg: 18, distance: 3.6, width: 6.4, height: 4.2, opacity: 0.4 },
  ];
}

/**
 * Shot 2: a sentence arrives a few words at a time. Each arrival is a group of words on one cue;
 * the words inside it follow one another faster than the eye separates them, and the arrival that
 * carries the sentence gets more: the stage to itself, a larger entrance, a longer hold.
 */
export const wordByWord = defineShot<
  WordByWordDecisions,
  {
    arrivals: ReturnType<typeof slot.many<string | Arrival>>;
    ambient: ReturnType<typeof slot.many<AmbientItem>>;
  }
>({
  name: "word-by-word",
  intent:
    "The viewer reads a sentence in the order and with the stress it would be spoken. Words do not all weigh the same: " +
    "the sentence is given as arrivals, each a word or a few that land on one cue, and one arrival is the accent. " +
    "Inside an arrival the words follow each other too fast to count, so it reads as one gesture. The accent is what " +
    "the eye is given time for; when it comes first it can start large with the stage to itself and settle into the " +
    "line as the rest joins. The line makes room as it grows, so what has arrived always sits centred.",
  slots: {
    arrivals: slot.many<string | Arrival>({
      role: "subject",
      plane: "focal",
      min: 1,
      describe:
        "The sentence, split where a speaker would breathe or stress: \"Into\", then \"a complete floor plan\". " +
        "Each entry lands on its own cue; several words in one entry come in together. Three words on three beats are " +
        "three entries of one word. Mark the words the sentence is about with { text, key }. Two words joined by a " +
        "non-breaking space (\\u00a0) come in as one.",
    }),
    ambient: slot.many<AmbientItem>({
      role: "ambient",
      plane: "backdrop",
      describe:
        "Soft shapes behind the phrase that move outward a little on every arrival, so the ground answers the words. " +
        "They must hold the ink: check the audit's contrast. An empty list leaves a bare ground.",
    }),
  },
  decisions: {
    width: "Stage width in pixels. Type and travel scale by the shorter relative side.",
    height: "Stage height in pixels.",
    fps: "Frames per second. Transients are in seconds and stay as sharp at 60 as at 30.",
    durationSec: "Length of the shot. Entrances keep their length; extra time goes to holding the accent and the finished line.",
    look: "Colours and type. Key words take the look's primary colour. Defaults to the Glean look.",
    feel:
      "How fast words follow one another inside an arrival, how quickly they come into focus, and how an accent settles. " +
      "Defaults to snappy editorial.",
    tempo:
      "The music's tempo. With one, the arrivals land on its grid, the accent on a whole beat. Without one they share the time by weight.",
    accent:
      "Which arrival carries the sentence. Defaults to the last, for a line that builds to its point. \"first\" states the " +
      "point and lets the rest complete it: with the stage empty, the accent starts large (see punch). \"none\" gives every " +
      "arrival the same time, for words that are equals on a beat.",
    hold: "How many steps of time the accent keeps before the next arrival. Defaults to 1.5 for up to three arrivals and 2.5 above.",
    cueSeconds:
      "Exact arrival times, one per arrival, for cutting to a voice or to marked audio. They replace the solver; the audit still checks them.",
    punch:
      "How large the accent starts, as a multiple of its resting size. By default it starts large (the feel's punch, " +
      "as far as the safe area allows) when it arrives on an empty stage, and barely larger than rest when other words " +
      "are already beside it. false gives the accent no size change: it is marked by time alone.",
    enter:
      "How a word comes into view. \"focus\" (default) sharpens from a blur in a few frames: quick and quiet, right for " +
      "product copy. \"rise\" lifts each word into place: more physical, right when the line should feel built. \"fade\" " +
      "only fades: use it over a busy ground where blur or travel would add noise.",
    layout:
      "\"recentre\" (default) keeps whatever has arrived centred, so the line slides to make room for each word. " +
      "\"anchored\" sets every word where it will rest: calmer, and the right choice for left-aligned copy or lines read as a list.",
    align: "\"center\" (default) or \"left\". Left-aligned lines are anchored.",
    at: "Centre of the phrase as fractions of the stage. Defaults to the middle.",
    size: "Type size as a share of stage height, while the phrase fits. Defaults to 0.085.",
    maxWidth: "Share of the safe width the widest line may take. Defaults to 0.86.",
    maxLines: "Lines the phrase may wrap to before the type shrinks. Defaults to 2.",
    exit:
      "\"cut\" (default) holds the finished line to the last frame, for the next shot to take over. \"shrink\" lets it " +
      "fall back and fade over the feel's departure, when this shot hands over to nothing.",
  },
  whenContentChanges: [
    "The sentence: decide the arrivals before anything else. Split where it is stressed, not every word; a word that only joins two others travels with one of them.",
    "The accent: which arrival is the point. If it moved from first to last, the large entrance no longer has an empty stage; read the note the shot leaves.",
    "Word count: a longer sentence wraps or shrinks. Check the type size the shot settled on, and each arrival's clear reading time in the audit.",
    "Duration or tempo: check the gaps between arrivals against the feel's claim, then the hold the accent gets.",
    "The ground: after changing what is behind the phrase, read the audit's contrast and which object it says covers a word.",
  ],
  stage: { width: 1280, height: 720, fps: 30, durationSec: 3 },
  defaults: () => ({ ambient: defaultAmbient() }),
  compose: (score, { decisions, slots }) => {
    const look = decisions.look ?? gleanEditorial;
    const feel = decisions.feel ?? snappyEditorial;
    const { width, height } = score.format;
    const total = score.format.durationFrames;
    const align = decisions.align ?? "center";
    const recentre = (decisions.layout ?? "recentre") === "recentre" && align === "center";
    const enter = decisions.enter ?? "focus";
    score.background = look.surface;
    score.sceneName = "Word by word";
    score.claimFrames = score.frames(feel.claimSec);

    const arrivals = slots.arrivals.map((a) => {
      const spec = typeof a === "string" ? { text: a } : a;
      const keys = spec.key === undefined ? [] : Array.isArray(spec.key) ? spec.key : [spec.key];
      return {
        text: spec.text.trim(),
        // Words joined by a non-breaking space stay one unit: they come in, and wrap, together.
        words: spec.text.trim().split(/[ \t\n]+/).map((w) => w.replaceAll("\u00a0", " ")),
        key: new Set(keys.flatMap((k) => k.trim().split(/\s+/))),
        needsSec: spec.needsSec ?? readingSec(spec.text.trim()),
        breakBefore: Boolean(spec.breakBefore),
      };
    });

    const set = setPhrase(arrivals, {
      stage: { width, height },
      safeWidth: score.safeArea.width,
      at: decisions.at ?? { x: 0.5, y: 0.5 },
      align,
      size: decisions.size ?? 0.085,
      maxWidth: decisions.maxWidth ?? 0.86,
      maxLines: decisions.maxLines ?? 2,
      trackingEm: look.type.trackingEm,
      metrics: look.type.metrics,
    });
    score.regions.phrase = set.region;
    const middle = { x: set.region.x + set.region.width / 2, y: set.region.y + set.region.height / 2 };

    // Time: the shot stops offering the phrase where it starts to leave.
    const exitFrames = decisions.exit === "shrink" ? score.frames(feel.depart.tailSec, 2) : 0;
    const until = total - exitFrames;
    const stagger = score.frames(feel.arrive.staggerSec, 1);
    const focus = score.frames(feel.arrive.focusSec, 2);
    const shift = score.frames(feel.arrive.shiftSec, 2);
    const clock = createClock({ fps: score.format.fps, durationSec: score.sec(total), tempo: decisions.tempo });
    const phrase = solvePhrase({
      count: arrivals.length,
      window: { from: 0, to: until },
      clock,
      accent: decisions.accent,
      hold: decisions.hold,
      needFrames: arrivals.map((a) => score.frames(a.needsSec) + (a.words.length - 1) * stagger + focus),
      claimFrames: score.claimFrames,
      at: decisions.cueSeconds,
      prefix: "arrival",
    });
    phrase.cues.forEach((cue) => score.cue(cue));
    score.notes.push(...phrase.notes);
    const onset = (w: SetWord) => phrase.cues[w.arrival]!.frame + w.order * stagger;

    // Ground: soft shapes placed from the phrase, each answering every arrival.
    slots.ambient.forEach((item, i) => {
      const node = place(score, {
        id: item.id,
        name: item.id,
        slot: "ambient",
        role: "ambient",
        plane: "backdrop",
        layer: i + 1,
        shape: { kind: "ellipse", width: Math.round(item.width * set.fontSize), height: Math.round((item.height ?? item.width) * set.fontSize) },
        fill: item.material ? flat(look, item.material) : { kind: "solid", color: look.backdrop },
        center: polar(middle, item.angleDeg, item.distance * set.fontSize),
        blur: Math.round(score.du(70)),
        opacity: item.opacity ?? 0.5,
      });
      respond(score, node.id, { property: "move", along: unit(item.angleDeg) }, {
        answers: phrase.cues.map((cue) => ({ cue, amount: score.du(item.answer ?? 16) * cue.weight })),
        feel,
        end: total,
        id: score.id(`act_${node.id}_answers`),
        name: `${item.id} answers the arrivals`,
      });
    });

    // Objects: the phrase, its lines, each arrival's share of a line, and the words.
    const originAt = (node: FrameNodeIR, point: Point2D) => {
      node.base.originX = point.x / width;
      node.base.originY = point.y / height;
      return node;
    };
    const root = originAt(group(score, { id: "phrase", name: "Phrase", slot: "arrivals-group", plane: "focal", layer: 10 }), middle);
    const lineGroups = set.lines.map((_, line) =>
      group(score, { id: `line_${line + 1}`, name: `Line ${line + 1}`, slot: "arrivals-group", plane: "focal", parentId: root.id, layer: line + 1 })
    );
    const parts = new Map<string, { node: FrameNodeIR; words: SetWord[] }>();
    const nodes = new Map<SetWord, TextNodeIR>();
    for (const word of set.words) {
      const partKey = `${word.arrival}:${word.line}`;
      if (!parts.has(partKey)) {
        const mine = set.words.filter((w) => w.arrival === word.arrival && w.line === word.line);
        const left = mine[0]!.x;
        const right = mine.at(-1)!.x + mine.at(-1)!.width;
        const node = group(score, {
          id: `arrival_${word.arrival + 1}${set.words.some((w) => w.arrival === word.arrival && w.line !== word.line) ? `_line_${word.line + 1}` : ""}`,
          name: arrivals[word.arrival]!.text,
          slot: "arrivals-group",
          plane: "focal",
          parentId: lineGroups[word.line]!.id,
          layer: word.arrival + 1,
        });
        parts.set(partKey, { node: originAt(node, { x: (left + right) / 2, y: set.lines[word.line]!.y + set.box / 2 }), words: mine });
      }
      nodes.set(
        word,
        score.add<TextNodeIR>({
          id: score.id(`w_${word.text.toLowerCase()}`),
          kind: "text",
          name: word.text,
          slot: "arrivals",
          role: "subject",
          plane: "focal",
          parentId: parts.get(partKey)!.node.id,
          layer: word.order + 1,
          base: { x: word.x, y: set.lines[word.line]!.y, width: word.width, height: set.box },
          text: word.text,
          fontFamily: look.type.family,
          fontSize: set.fontSize,
          fontWeight: look.type.weight,
          letterSpacing: set.tracking,
          textAlign: "center",
          fill: { kind: "solid", color: word.key ? look.materials.primary.flat : look.ink },
        })
      );
    }

    // Each word comes into view on its own moment of its arrival's cue.
    for (const [word, node] of nodes) {
      const cue = phrase.cues[word.arrival]!;
      const at = onset(word);
      const reason: MotionReason = { purpose: "arrive", cues: [cue.name], lands: "start" };
      const fade = enter === "fade" ? focus * 2 : focus;
      const opacityId = score.id(`act_${node.id}_in`);
      score.track({
        kind: "scalar", id: opacityId, name: `${word.text} appears`, targetId: node.id, property: "opacity", mode: "set", stage: "in",
        startFrame: at, durationFrames: fade, reason,
        keys: [
          { id: `${opacityId}_k0`, frame: 0, value: FIRST_SEEN, easing: ease("easeOutQuad") },
          { id: `${opacityId}_k1`, frame: fade - 1, value: 1 },
        ],
      });
      if (enter === "focus") {
        const blurId = score.id(`act_${node.id}_focus`);
        score.track({
          kind: "scalar", id: blurId, name: `${word.text} comes into focus`, targetId: node.id, property: "layerBlur", mode: "set", stage: "custom",
          startFrame: at, durationFrames: focus, baseValue: 0, reason,
          keys: [
            { id: `${blurId}_k0`, frame: 0, value: Math.round(score.du(feel.arrive.focusBlur) * 10) / 10, easing: ease("easeOutQuad") },
            { id: `${blurId}_k1`, frame: focus - 1, value: 0 },
          ],
        });
      }
      if (enter === "rise") {
        const rise = score.frames(feel.arrive.travelSec * 0.4, 2);
        const riseId = score.id(`act_${node.id}_rise`);
        score.track({
          kind: "vec2", id: riseId, name: `${word.text} rises into place`, targetId: node.id, property: "move", mode: "add", stage: "custom",
          startFrame: at, durationFrames: rise, reason,
          keys: [
            { id: `${riseId}_k0`, frame: 0, x: 0, y: Math.round(set.fontSize * RISE_EM), easing: feel.arrive.ease },
            { id: `${riseId}_k1`, frame: rise - 1, x: 0, y: 0 },
          ],
        });
      }
      score.subjects.push({
        nodeId: node.id,
        cue: cue.name,
        needsSec: arrivals[word.arrival]!.needsSec,
        untilFrame: until,
        accent: cue.kind === "accent",
      });
    }

    // The accent starts larger than it rests: far larger with the stage to itself, barely when it has neighbours.
    if (phrase.accent !== null && decisions.punch !== false) {
      const cue = phrase.cues[phrase.accent]!;
      const alone = phrase.cues.every((c, i) => i === phrase.accent || c.frame > cue.frame);
      for (const [key, part] of parts) {
        if (Number(key.split(":")[0]) !== phrase.accent) continue;
        const left = part.words[0]!.x;
        const right = part.words.at(-1)!.x + part.words.at(-1)!.width;
        const partWidth = right - left;
        // Words already on its line when it lands. It grows away from them, or only into part of the space between.
        const line = part.words[0]!.line;
        const beside = set.words.filter((w) => w.line === line && w.arrival !== phrase.accent && onset(w) <= cue.frame);
        const before = beside.filter((w) => w.x < left).at(-1);
        const after = beside.find((w) => w.x > left);
        const gapBefore = before ? left - (before.x + before.width) : Infinity;
        const gapAfter = after ? after.x - right : Infinity;
        // Left-aligned copy keeps its left edge; otherwise it grows from its middle.
        const origin = (before && !after) || (align === "left" && !before) ? left : after && !before ? right : (left + right) / 2;
        part.node.base.originX = origin / width;
        const safeRight = score.safeArea.x + score.safeArea.width;
        const fits = Math.min(
          origin > left ? (origin - score.safeArea.x) / (origin - left) : Infinity,
          right > origin ? (safeRight - origin) / (right - origin) : Infinity
        );
        const asked = decisions.punch ?? (alone ? feel.punch.scale : BESIDE_PUNCH);
        const room = alone
          ? Math.min(fits, (score.safeArea.height * 0.55) / set.box)
          : before && after
            ? Math.min(BESIDE_PUNCH, 1 + (2 * BESIDE_CLEARANCE * Math.min(gapBefore, gapAfter)) / partWidth)
            : BESIDE_PUNCH;
        const scale = Math.round(Math.max(1, Math.min(asked, room)) * 100) / 100;
        if (decisions.punch !== undefined && asked > room + 0.005) {
          score.notes.push({
            rule: "budget",
            severity: "warning",
            message: alone
              ? `"${part.node.name}" was asked to start ${asked} times its size; the safe area holds ${room.toFixed(2)} times, so it starts there.`
              : `"${part.node.name}" was asked to start ${asked} times its size, but other words are already on its line; it starts ${room.toFixed(2)} times, which keeps clear of them.`,
            fix: alone ? "Use a smaller type size, or accept the smaller entrance." : "Make it the first arrival (accent: \"first\") to give it the stage, or keep the small entrance.",
          });
        }
        if (scale <= 1.001) continue;
        const frames = score.frames(feel.punch.sec, 2);
        const punchId = score.id(`act_${part.node.id}_punch`);
        score.track({
          kind: "vec2", id: punchId, name: `${part.node.name} lands large and settles`, targetId: part.node.id, property: "scale", mode: "multiply", stage: "custom",
          startFrame: cue.frame, durationFrames: frames, reason: { purpose: "arrive", cues: [cue.name], lands: "start" },
          keys: [
            { id: `${punchId}_k0`, frame: 0, x: scale, y: scale, easing: feel.punch.ease },
            { id: `${punchId}_k1`, frame: frames - 1, x: 1, y: 1 },
          ],
        });
      }
    }

    // The line makes room: whatever has arrived on it stays centred.
    if (recentre) {
      set.lines.forEach((line, index) => {
        const mine = set.words.filter((w) => w.line === index).sort((a, b) => onset(a) - onset(b));
        const centre = line.x + line.width / 2;
        const offsets: { frame: number; dx: number }[] = [];
        let left = Infinity;
        let right = -Infinity;
        for (const word of mine) {
          left = Math.min(left, word.x);
          right = Math.max(right, word.x + word.width);
          const dx = Math.round((centre - (left + right) / 2) * 100) / 100;
          const last = offsets.at(-1);
          if (last && last.frame === onset(word)) last.dx = dx;
          else offsets.push({ frame: onset(word), dx });
        }
        if (offsets.length < 2 && Math.abs(offsets[0]?.dx ?? 0) < 0.5) return;
        const start = offsets[0]!.frame;
        const keys: Vec2Key[] = [];
        const moveId = score.id(`act_${lineGroups[index]!.id}_room`);
        const push = (frame: number, dx: number, easing?: Vec2Key["easing"]) => {
          const same = keys.at(-1);
          if (same && same.frame === frame - start) {
            same.x = dx;
            same.easing = easing;
          } else keys.push({ id: `${moveId}_k${keys.length}`, frame: frame - start, x: dx, y: 0, easing });
        };
        push(start, offsets[0]!.dx);
        for (let j = 1; j < offsets.length; j++) {
          const next = offsets[j + 1]?.frame ?? Infinity;
          const end = Math.min(offsets[j]!.frame + shift, next);
          // A word that joins before the line has finished moving keeps it moving at an even pace.
          push(offsets[j]!.frame, offsets[j - 1]!.dx, end === next ? linear : ease("easeOutCubic"));
          push(end, offsets[j]!.dx);
        }
        if (keys.length === 1) keys.push({ id: `${moveId}_k1`, frame: 1, x: keys[0]!.x, y: 0 });
        score.track({
          kind: "vec2", id: moveId, name: `Line ${index + 1} makes room`, targetId: lineGroups[index]!.id, property: "move", mode: "add", stage: "custom",
          startFrame: start, durationFrames: keys.at(-1)!.frame + 1,
          reason: { purpose: "keep", cues: [...new Set(mine.map((w) => phrase.cues[w.arrival]!.name))] },
          keys,
        });
      });
    }

    // Leaving: the whole phrase falls back and fades.
    if (exitFrames > 0) {
      const exit = score.cue({
        name: "exit",
        frame: until,
        kind: "structure",
        weight: 0.5,
        why: "The phrase has been read; it lets go of the viewer.",
      });
      const reason: MotionReason = { purpose: "depart", cues: [exit.name], lands: "start" };
      const scaleId = score.id("act_phrase_falls_back");
      score.track({
        kind: "vec2", id: scaleId, name: "Phrase falls back", targetId: root.id, property: "scale", mode: "multiply", stage: "out",
        startFrame: until, durationFrames: exitFrames, reason,
        keys: [
          { id: `${scaleId}_k0`, frame: 0, x: 1, y: 1, easing: ease("easeInQuad") },
          { id: `${scaleId}_k1`, frame: exitFrames - 1, x: EXIT_SCALE, y: EXIT_SCALE },
        ],
      });
      const fadeId = score.id("act_phrase_fades");
      score.track({
        kind: "scalar", id: fadeId, name: "Phrase fades", targetId: root.id, property: "opacity", mode: "set", stage: "out",
        startFrame: until, durationFrames: exitFrames, baseValue: 1, reason,
        keys: [
          { id: `${fadeId}_k0`, frame: 0, value: 1, easing: ease("easeInQuad") },
          { id: `${fadeId}_k1`, frame: exitFrames - 1, value: 0 },
        ],
      });
    }

    // Handoffs: attention starts on the first word to arrive and leaves on the word the sentence is about.
    const byOnset = [...nodes].sort((a, b) => onset(a[0]) - onset(b[0]));
    const carrier =
      [...nodes].reverse().find(([w]) => w.key) ??
      [...nodes].reverse().find(([w]) => w.arrival === (phrase.accent ?? arrivals.length - 1)) ??
      byOnset.at(-1)!;
    const doc = score.toDocument("handoff", "handoff");
    score.handoff.entry = measureHandoff(doc, byOnset[0]![1].id, onset(byOnset[0]![0]));
    score.handoff.exit = measureHandoff(doc, carrier[1].id, until - 1);
  },
});
