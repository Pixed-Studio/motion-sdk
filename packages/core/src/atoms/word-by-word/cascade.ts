import { respond } from "../../behaviors/respond.ts";
import { enter } from "../../behaviors/statement.ts";
import { unit } from "../../behaviors/travel.ts";
import { ease, linear } from "../../kernel/easing.ts";
import type { CueIR, Vec2Key } from "../../kernel/ir.ts";
import { createClock } from "../../rhythm/clock.ts";
import { solvePhrase } from "../../rhythm/phrase.ts";
import type { SetWord } from "../../stage/sentence.ts";
import { resolveHit } from "./beats.ts";
import type { Assembled, PhraseStage, PushSpec } from "./types.ts";

const round = (n: number, places = 2) => Math.round(n * 10 ** places) / 10 ** places;

/** Brings the whole line in on the speed of the shot before: from the right, slowing all the way. */
function pushIn(stage: PhraseStage, cue: CueIR, spec: PushSpec): void {
  const { score, feel, root, set } = stage;
  const frames = score.frames(spec.sec ?? feel.push.sec, 2);
  const from = round((spec.em ?? feel.push.em) * set.fontSize);
  const id = score.id("act_phrase_pushes_in");
  score.track({
    kind: "vec2", id, name: "Phrase pushes in", targetId: root.id, property: "move", mode: "add", stage: "custom",
    startFrame: cue.frame, durationFrames: frames, reason: { purpose: "carry", cues: [cue.name], lands: "start", beat: "handoff" },
    keys: [
      { id: `${id}_k0`, frame: 0, x: from, y: 0, easing: spec.ease ?? feel.push.ease },
      { id: `${id}_k1`, frame: frames - 1, x: 0, y: 0 },
    ],
  });
}

/** The largest an accent may start when other words are already on its line. */
const BESIDE_PUNCH = 1.14;
/** Share of the space to a neighbour an accent may grow into. */
const BESIDE_CLEARANCE = 0.4;

/**
 * The cascade pattern. Every arrival takes its own step of time, shared out by weight or placed on
 * a tempo, and one of them is the accent: it keeps the stage longest and can start large. Words
 * show where they rest, and the line either keeps what has arrived centred, stepping aside for
 * each word, or is anchored.
 */
export function cascade(stage: PhraseStage): Assembled {
  const { score, feel, decisions, arrivals, set, lines, parts, words, total, until, em } = stage;
  const hit = resolveHit(decisions.hit, { beat: "hit", stage, em, count: arrivals.length });
  const { width } = score.format;
  const align = decisions.align ?? "center";
  const recentre = (decisions.layout ?? "recentre") === "recentre" && align === "center";
  const focus = score.frames(feel.arrive.focusSec, 2);
  const shift = score.frames(feel.arrive.shiftSec, 2);
  const stagger = (order: number) => Math.round(order * stage.staggerFrames);

  const clock = createClock({ fps: score.format.fps, durationSec: score.sec(total), tempo: decisions.tempo });
  const phrase = solvePhrase({
    count: arrivals.length,
    window: { from: 0, to: until },
    clock,
    accent: decisions.accent,
    hold: decisions.accentHold,
    needFrames: arrivals.map((a) => score.frames(a.needsSec) + stagger(a.words.length - 1) + focus),
    claimFrames: score.claimFrames,
    at: decisions.cueSeconds,
    prefix: "arrival",
  });
  phrase.cues.forEach((cue) => score.cue(cue));
  score.notes.push(...phrase.notes);
  const onset = (w: SetWord) => phrase.cues[w.arrival]!.frame + stagger(w.order);

  // The ground answers every arrival.
  stage.ground.forEach((node, i) => {
    const item = stage.ambient[i]!;
    respond(score, node.id, { property: "move", along: unit(item.angleDeg) }, {
      answers: phrase.cues.map((cue) => ({ cue, amount: score.du(item.answer ?? 16) * cue.weight })),
      feel,
      end: total,
      id: score.id(`act_${node.id}_answers`),
      name: `${item.id} answers the arrivals`,
    });
  });

  // Each word comes into view on its own moment of its arrival's cue.
  let landed = 0;
  for (const [word, node] of words) {
    const join = arrivals[word.arrival]!.join;
    enter(score, node, { at: onset(word), cue: phrase.cues[word.arrival]!, moves: join.moves, lands: "start", em });
    landed = Math.max(landed, onset(word) + join.restAfter);
  }

  // The accent starts larger than it rests: far larger with the stage to itself, barely when it has neighbours.
  if (phrase.accent !== null && hit.scale !== 1) {
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
      const asked = hit.scale ?? (alone ? feel.punch.scale : BESIDE_PUNCH);
      const room = alone
        ? Math.min(fits, (score.safeArea.height * 0.55) / set.box)
        : before && after
          ? Math.min(BESIDE_PUNCH, 1 + (2 * BESIDE_CLEARANCE * Math.min(gapBefore, gapAfter)) / partWidth)
          : BESIDE_PUNCH;
      const scale = Math.round(Math.max(1, Math.min(asked, room)) * 100) / 100;
      if (hit.scale !== undefined && asked > room + 0.005) {
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
        startFrame: cue.frame, durationFrames: frames, reason: { purpose: "arrive", cues: [cue.name], lands: "start", beat: "hit" },
        keys: [
          { id: `${punchId}_k0`, frame: 0, x: scale, y: scale, easing: feel.punch.ease },
          { id: `${punchId}_k1`, frame: frames - 1, x: 1, y: 1 },
        ],
      });
      landed = Math.max(landed, cue.frame + frames - 1);
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
      const moveId = score.id(`act_${lines[index]!.id}_room`);
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
        kind: "vec2", id: moveId, name: `Line ${index + 1} makes room`, targetId: lines[index]!.id, property: "move", mode: "add", stage: "custom",
        startFrame: start, durationFrames: keys.at(-1)!.frame + 1,
        reason: { purpose: "keep", cues: [...new Set(mine.map((w) => phrase.cues[w.arrival]!.name))], beat: "room" },
        keys,
      });
      landed = Math.max(landed, start + keys.at(-1)!.frame);
    });
  }

  // A line that takes over the speed of the shot before comes in whole, from the right.
  const entry = decisions.entry ?? "cut";
  if (entry !== "cut") pushIn(stage, phrase.cues[0]!, entry === "push" ? {} : entry);

  return { cues: phrase.cues, onset, landed: Math.min(landed, total - 1) };
}
