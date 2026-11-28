import { landsAfter, move } from "../../behaviors/move.ts";
import { driftShare, enter, land, largestThatFits, makeRoom, roomWindow, shareByDepth } from "../../behaviors/statement.ts";
import { ease } from "../../kernel/easing.ts";
import type { CueIR, MotionBlockIR } from "../../kernel/ir.ts";
import { createClock } from "../../rhythm/clock.ts";
import type { SetWord } from "../../stage/sentence.ts";
import { planJoin, resolveHit, resolveRoom, resolveSettle, restOf, writeMoves } from "./beats.ts";
import type { Assembled, BeatContext, PhraseStage } from "./types.ts";

const round = (n: number, places = 2) => Math.round(n * 10 ** places) / 10 ** places;

/**
 * Where the arrivals fall when no times are given. The lead is on the first frame, or the first
 * beat. On a tempo every arrival is one `step` after the one before, a whole beat unless the
 * author says otherwise, whatever the tempo is. Without a tempo the next arrival follows after the
 * feel's time alone and the rest a step of the feel apart.
 */
function placeArrivals(stage: PhraseStage, joinFrames: number, lands: "start" | "end"): number[] {
  const { score, feel, decisions, arrivals } = stage;
  const count = arrivals.length;
  const fps = score.format.fps;
  const clock = createClock({ fps, durationSec: score.sec(stage.total), tempo: decisions.tempo });
  if (decisions.cueSeconds || decisions.cueBeats) {
    const given = decisions.cueSeconds ?? decisions.cueBeats!.map((b) => clock.beat(b));
    if (given.length !== count) {
      throw new Error(`[word-by-word] Got ${given.length} cue time(s) for ${count} arrival(s). Give one per arrival, in ${decisions.cueSeconds ? "seconds" : "beats"}.`);
    }
    return given.map((s) => Math.round(s * fps));
  }
  if (count === 1) return [0];
  const step = decisions.step;
  if (typeof step === "object") return arrivals.map((_, i) => Math.round(i * step.sec * fps));
  if (clock.beatSec === undefined) {
    if (typeof step === "number") throw new Error(`[word-by-word] step: ${step} is in beats and the shot has no tempo. Give tempo: { bpm }, or step: { sec }.`);
    const alone = score.frames(feel.join.aloneSec, 2);
    // An arrival that lands on its cue has to show a whole travel earlier, and the lead keeps its time alone before that.
    const first = lands === "end" ? alone + joinFrames - 1 : alone;
    const apart = Math.max(score.claimFrames, score.frames(feel.join.stepSec));
    return [0, ...Array.from({ length: count - 1 }, (_, i) => first + i * apart)];
  }
  const from = clock.snap(0, 1, "up");
  return arrivals.map((_, i) => Math.round((from + i * (step ?? 1) * clock.beatSec!) * fps));
}

/**
 * The lead pattern. The first arrival has the stage: it stands where the sentence will be centred
 * and hits on the cut. It then gives its place to the sentence in one move, and the words that
 * follow join the moving line. When the last has landed the sentence is centred and whole. How the
 * lead hits and settles, how room is made and how each word joins are the author's; the shot
 * solves when, and how far the line has to travel.
 */
export function lead(stage: PhraseStage): Assembled {
  const { score, feel, decisions, arrivals, set, root, lines, words, parts, total, until, middle, em } = stage;
  const count = arrivals.length;
  const ctx = (beat: BeatContext["beat"]): BeatContext => ({ beat, stage, em, count });
  const lands = decisions.lands ?? "start";
  const hit = resolveHit(decisions.hit, ctx("hit"));
  const settle = resolveSettle(decisions.settle, ctx("settle"), feel);
  const room = resolveRoom(decisions.room, ctx("room"), feel);
  const swap = settle.kind === "swap" && count > 1;
  const extras = (decisions.extra ?? []).map((e) => ({ ...e, moves: Array.isArray(e.moves) ? e.moves : [e.moves] }));
  // The lead's own words show in place unless its arrival says how they come.
  const leadJoin = arrivals[0]!.join.own ? arrivals[0]!.join : planJoin(score, [], em, false);
  const joinOf = (arrival: number) => (arrival === 0 ? leadJoin : arrivals[arrival]!.join);

  const frames = placeArrivals(stage, arrivals[Math.min(1, count - 1)]!.join.frames, lands);
  const cues: CueIR[] = frames.map((frame, i) => {
    const last = i === frames.length - 1 && frames.length > 1;
    return score.cue({
      name: `arrival-${i + 1}`,
      frame,
      kind: last ? "accent" : "beat",
      weight: i === 0 ? 1 : last ? 1.15 : 0.9,
      why:
        i === 0
          ? "The lead. It has the stage to itself until the sentence joins it."
          : last
            ? "The arrival the sentence resolves on."
            : "A word joins the line.",
    });
  });
  const start = cues[0]!.frame;
  const second = cues[1]?.frame;

  // When each word shows. With a swap the lead comes back at line size on the second cue, as the
  // first word of what follows, so those words start one stagger later.
  const stagger = (order: number) => Math.round(order * stage.staggerFrames);
  const onset = (w: SetWord) => {
    if (w.arrival === 0) return start;
    const at = cues[w.arrival]!.frame + stagger(w.order + (swap ? 1 : 0));
    return Math.max(start, lands === "end" ? at - (joinOf(w.arrival).frames - 1) : at);
  };
  const rests = (w: SetWord) => onset(w) + (lands === "end" && w.arrival > 0 ? joinOf(w.arrival).frames - 1 : joinOf(w.arrival).restAfter);

  // The lead takes the middle of the stage; the line it belongs to is set off by the difference.
  const leadWords = set.words.filter((w) => w.arrival === 0);
  const leadLine = leadWords[0]!.line;
  const onLine = leadWords.filter((w) => w.line === leadLine);
  const leadWidth = onLine.at(-1)!.x + onLine.at(-1)!.width - onLine[0]!.x;
  const leadGroups = [...parts].filter(([key]) => key.startsWith("0:")).map(([, part]) => part.node);
  const hitOn = swap ? leadGroups : [root];

  // The move that gives the lead's place to the sentence. Its fastest step starts on the second
  // cue, so the next word shows as the line is thrown. A swap is hidden in that step instead. When
  // arrivals land on their cues the move ends there. Left to the feel, it is kept under way until
  // the last arrival has shown.
  const lastShown = Math.max(start, ...set.words.filter((w) => w.arrival > 0).map(onset));
  const roomOpts =
    second === undefined
      ? undefined
      : { from: start, next: cues[1]!, sec: room.sec, curve: room.curve, lands: lands === "end" ? ("end" as const) : ("peak" as const), centred: swap, until: room.timed ? undefined : lastShown };
  const roomAt = roomOpts && roomWindow(score, roomOpts);

  // The lead's size on the cut. One that starts small is pushed in until the line has come to rest;
  // one that is swapped keeps its size until the second cue.
  const stand0 = { x: middle.x - leadWidth / 2, y: middle.y - set.box / 2, width: leadWidth, height: set.box };
  const unfloated = largestThatFits(score, stand0, middle);
  const small = hit.scale !== undefined && hit.scale < 1;
  const punched = hit.scale === undefined ? Math.min(feel.punch.scale, unfloated) > 1.001 : Math.abs(hit.scale - 1) > 0.001;
  const fallFrames = score.frames(settle.sec, 2);
  const hitSpan = swap ? second! - start + 1 : small && roomAt ? Math.max(fallFrames, roomAt.end - start + 1) : fallFrames;
  const floats = settle.kind === "float";
  const floatFrames = score.frames(settle.floatSec, 2);
  const settled = swap ? second! : floats ? start + hitSpan - 1 + floatFrames - 1 : start + (punched ? landsAfter(settle.curve, hitSpan) : 0);

  const beatRest = (beat: string, at: number, sec: number) =>
    Math.max(at, ...extras.filter((e) => e.beat === beat).map((e) => at + restOf(stage, e.moves, sec)));
  let landed = Math.max(
    start,
    settled,
    roomAt ? roomAt.rest : start,
    start + restOf(stage, hit.moves, settle.sec, settle.curve),
    settled + restOf(stage, [...settle.then, ...settle.moves], 0.5),
    roomAt ? roomAt.from + restOf(stage, room.moves, score.sec(roomAt.end - roomAt.from + 1), room.curve) : start,
    beatRest("hit", start, settle.sec),
    beatRest("settle", settled, 0.5),
    roomAt ? beatRest("room", roomAt.from, score.sec(roomAt.end - roomAt.from + 1)) : start
  );
  for (const word of set.words) {
    landed = Math.max(landed, word.arrival === 0 && swap ? second! + stage.join.restAfter : rests(word));
    for (const e of extras.filter((x) => x.beat === "join")) landed = Math.max(landed, onset(word) + restOf(stage, e.moves, feel.join.sec));
  }

  // The lead is centred on the cut and the sentence when it is complete. A drift that travels runs
  // under both, so the lead's line is set off by what the drift will cover in between.
  const driftRun = { from: start, to: until >= total ? total - 1 : until };
  const share = driftShare(start, driftRun, Math.min(landed, total - 1));
  const drifted = { x: round(stage.drift.x * share), y: round(stage.drift.y * share) };
  const stand = { x: middle.x - drifted.x, y: middle.y - drifted.y };
  root.base.originX = stand.x / score.format.width;
  root.base.originY = stand.y / score.format.height;

  // As large as the feel says, as far as the safe area allows at the size the drift gives the line on the cut.
  const fits = largestThatFits(score, stand0, middle) / (1 + stage.drift.scale * share);
  const scale = round(hit.scale ?? Math.max(1, Math.min(feel.punch.scale, fits)), 3);

  const hitBlocks: MotionBlockIR[] = [];
  for (const target of hitOn) {
    if (floats) {
      const back = ease("easeInOutSine");
      const written = move(
        score,
        target,
        [
          { property: "scale", from: scale, to: round(1 - settle.dip, 4), id: "lands", reason: `${arrivals[0]!.text} lands and falls a little past its size`, then: { property: "scale", to: 1, sec: settle.floatSec, curve: back } },
          { property: "position", to: { y: settle.dipEm }, id: "dips", reason: `${arrivals[0]!.text} sinks as it lands, then floats up`, then: { property: "position", to: { y: 0 }, sec: settle.floatSec, curve: back } },
        ],
        { at: start, sec: score.sec(hitSpan), curve: settle.curve, em, beat: "hit", purpose: "arrive", cue: cues[0], lands: "start" }
      );
      hitBlocks.push(...written.blocks);
    } else {
      hitBlocks.push(...land(score, target, { at: start, cue: cues[0], scale, sec: settle.sec, frames: hitSpan, curve: settle.curve, held: swap }).blocks);
    }
    const shown = [
      ...(hit.from ? [{ property: "position" as const, from: hit.from, reason: `${arrivals[0]!.text} comes to its place` }] : []),
      ...(hit.blur ? [{ property: "blur" as const, from: hit.blur, reason: `${arrivals[0]!.text} comes into focus` }] : []),
    ];
    if (shown.length) move(score, target, shown, { at: start, sec: settle.sec, curve: settle.curve, em, beat: "hit", purpose: "arrive", cue: cues[0], lands: "start" });
  }
  writeMoves(stage, hit.moves, hitOn, { at: start, sec: settle.sec, curve: settle.curve, beat: "hit", cue: cues[0], lands: "start" });
  writeMoves(stage, [...settle.then, ...settle.moves], hitOn, { at: settled, sec: 0.5, beat: "settle", cue: cues[0] });
  // The ground lands with it, by each item's depth.
  const fall = hitBlocks.find((b) => b.kind === "vec2" && b.property === "scale");
  if (fall) {
    shareByDepth(score, stage.ground, [fall], {
      depth: (_, i) => stage.ambient[i]?.depth ?? 0.3,
      about: middle,
      stems: { scale: "lands", scaleMove: "closes_in", move: "closes_in" },
      names: { scale: "lands with the lead", move: "closes in" },
    });
  }

  // Every word comes into view.
  const hitMovesAside = [...hit.moves, ...(hit.from ? [{ property: "position" as const, from: hit.from }] : [])].some((m) => m.property === "position" && typeof m.from === "object" && (m.from.x ?? 0) !== 0);
  const leadOffCentre = leadJoin.from.x !== 0 || hitMovesAside;
  for (const [word, node] of words) {
    const cue = cues[word.arrival]!;
    if (word.arrival === 0) {
      enter(score, node, { at: start, cue, moves: leadJoin.moves, lands: "start", em });
      if (swap && (stage.join.from.x !== 0 || stage.join.from.y !== 0)) {
        const travel = stage.join.moves.find((m) => m.property === "position")!;
        move(score, node, { ...travel, id: "rejoins", reason: `${node.text} comes back at line size` }, { at: second!, em, beat: "join", purpose: "arrive", cue: cues[1], lands: "start" });
      }
      continue;
    }
    enter(score, node, { at: onset(word), cue, moves: joinOf(word.arrival).moves, lands: lands === "end" ? (word.order === 0 ? "end" : undefined) : "start", em });
  }

  if (roomOpts && roomAt) {
    const line = lines[leadLine]!;
    if (room.make) {
      const made = makeRoom(score, line, { ...roomOpts, lead: onLine.map((w) => words.get(w)!), stand: { x: stand.x, y: stand.y } });
      if (!leadOffCentre) {
        score.invariants.push({
          kind: "centred",
          nodeIds: leadWords.map((w) => words.get(w)!.id),
          frame: start,
          x: round(middle.x),
          tolerance: 1.5,
          why: "The lead has the stage to itself and sits in the middle of it.",
        });
      }
      // On the frame the eye takes the sentence as landed, the tails of the moves still have a fiftieth to go.
      const tails = 0.02 * (Math.abs(made.away.x) + Math.max(...arrivals.map((_, i) => Math.abs(joinOf(i).from.x))));
      score.invariants.push({
        kind: "centred",
        nodeIds: [...words.values()].map((n) => n.id),
        frame: Math.min(landed, total - 1),
        x: round(middle.x),
        tolerance: round(2 + tails, 1),
        why: "Once every word has landed the sentence is centred where the lead stood.",
      });
    }
    writeMoves(stage, room.moves, [line], { at: roomAt.from, sec: score.sec(roomAt.end - roomAt.from + 1), curve: room.curve, beat: "room", cue: cues[1] });
  }

  // Words keep their order on the line: none is drawn over its neighbour on the way in.
  set.lines.forEach((_, line) => {
    const mine = set.words.filter((w) => w.line === line);
    for (let i = 1; i < mine.length; i++) {
      score.invariants.push({
        kind: "apart",
        a: words.get(mine[i - 1]!)!.id,
        b: words.get(mine[i]!)!.id,
        why: "Words of a line keep their order while they come in.",
        // Two neighbours may touch for a moment on the way; one drawn across the other is a mistake.
        maxShare: 0.1,
      });
    }
  });

  if (landed > until) {
    score.notes.push({
      rule: "budget",
      severity: "error",
      message:
        `The sentence has come to rest ${score.sec(landed - start).toFixed(2)} s after the lead shows, and the line starts to leave after ${score.sec(until - start).toFixed(2)} s: ` +
        `it leaves before it has been whole.`,
      fix: `Give the shot ${score.sec(landed - until).toFixed(2)} s more, group the copy into fewer arrivals, or let it cut (leave: "cut").`,
    });
  }
  return { cues, onset, landed: Math.min(landed, total - 1), roomFrom: roomAt?.from, settled };
}
