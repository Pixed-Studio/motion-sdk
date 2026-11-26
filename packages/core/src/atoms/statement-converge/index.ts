import { arrive, readingSec } from "../../behaviors/arrive.ts";
import { keepUpright, recolorWhere } from "../../behaviors/keep.ts";
import { respond } from "../../behaviors/respond.ts";
import { focusPull, pass, travel, unit } from "../../behaviors/travel.ts";
import { snappyEditorial, type Feel } from "../../feel/index.ts";
import { linear } from "../../kernel/easing.ts";
import { measureHandoff } from "../../kernel/handoff.ts";
import type { AudioTrackIR, CueIR, ScalarMotionIR } from "../../kernel/ir.ts";
import { defineShot, slot } from "../../kernel/shot.ts";
import { gleanEditorial, lit, type Look } from "../../look/index.ts";
import { createClock, type Tempo } from "../../rhythm/clock.ts";
import { solvePhrase } from "../../rhythm/phrase.ts";
import { group, guide, place, polar, scaleShape, shapeExtent, stack, type StackLine } from "../../stage/index.ts";
import {
  defaultMark,
  defaultPasses,
  defaultWorld,
  shapeOf,
  type MarkPiece,
  type MarkSpec,
  type PassItem,
  type WorldItem,
} from "./content.ts";
import { ribbon } from "./ribbon.ts";

export * from "./content.ts";
export { CHEVRON_RIBBON_CANVAS } from "./ribbon.ts";

export interface StatementConvergeDecisions {
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
  turnAtSec?: number;
  holdAfterLandSec?: number;
  backdrop?: boolean;
  audio?: AudioTrackIR;
}

/** The statement sits a little below the middle, as measured on the reference. */
const STATEMENT_AT = { x: 0.5, y: 0.509 };
/** Degrees per second the world turns, shared out over the arrivals. */
const WORLD_TURN_RATE = 175;
/** The longest stretch one answer is paid for. A long hold after it is drift, not a bigger kick. */
const ANSWER_SPAN_SEC = 0.6;

/**
 * Shot 1: a short statement builds line by line, the world around it answers every line, then
 * focus leaves the statement and a mark assembles where it was.
 */
export const statementConverge = defineShot<
  StatementConvergeDecisions,
  {
    lines: ReturnType<typeof slot.many<string | StackLine>>;
    world: ReturnType<typeof slot.many<WorldItem>>;
    passes: ReturnType<typeof slot.many<PassItem>>;
    mark: ReturnType<typeof slot.one<MarkSpec>>;
  }
>({
  name: "statement-converge",
  intent:
    "The viewer reads a short statement one line at a time and feels it gather weight, then sees whose statement it is. " +
    "The type stays calm: each line shows whole on its cue and settles. The energy is in the world around it, which " +
    "answers every line by turning and moving outward to make room, with more shapes joining as the statement grows. " +
    "On the turn, focus leaves the statement while the world is still moving, and the mark arrives sharp through it.",
  slots: {
    lines: slot.many<string | StackLine>({
      role: "subject",
      plane: "focal",
      min: 1,
      describe:
        "The statement, one entry per line, one to three words each. Every line is an arrival and gets a cue. " +
        "Break lines where the sense breaks; a line that needs longer than its length suggests takes { text, needsSec }.",
    }),
    world: slot.many<WorldItem>({
      role: "support",
      plane: "midground",
      describe:
        "Shapes around the statement, behind it. Each is placed by angle and distance from the statement and moves out " +
        "on every arrival it is there for. Stagger `joins` so the picture gets busier as the statement grows.",
    }),
    passes: slot.many<PassItem>({
      role: "ambient",
      plane: "foreground",
      describe:
        "Large out-of-focus shapes that cross in front on a cue. They give depth and speed; they must not sit over a line " +
        "while it is being read.",
    }),
    mark: slot.one<MarkSpec>({
      role: "carrier",
      plane: "focal",
      describe:
        "What the statement resolves into: a host and the parts that land on it. The host is what carries attention out of the shot.",
    }),
  },
  decisions: {
    width: "Stage width in pixels. Sizes scale by the shorter relative side, so the composition keeps its proportions.",
    height: "Stage height in pixels.",
    fps: "Frames per second. Transients are in seconds and stay as sharp at 60 as at 30.",
    durationSec:
      "Length of the shot. Arrivals, answers and the mark's travel keep their length; extra time goes to reading the statement.",
    look: "Colours, type and materials. Defaults to the Glean look.",
    feel: "How sharp arrivals and answers are, and how long one arrival holds the eye. Defaults to snappy editorial.",
    tempo:
      "The music's tempo. With one, the lines land on its grid: the accent on a whole beat, a long run-up on eighths. " +
      "Leave it out when there is no pulse to cut to, and the lines share the time by weight.",
    accent:
      "Which line carries the weight. Defaults to the last, for a statement that builds to its end. Use \"none\" for a list of equals.",
    hold:
      "How many run-up steps of time the accent keeps. Defaults to 1.5 for up to three lines and 2.5 above, so a longer " +
      "statement compresses its run-up and gives the room to the landing.",
    cueSeconds:
      "Exact arrival times, one per line, for cutting to marked audio or matching a reference. They replace the solver; the audit still checks them.",
    turnAtSec:
      "When attention passes to the mark. By default the mark lands on the shot's last frame, so the turn is one carry before the end.",
    holdAfterLandSec:
      "Seconds the finished mark is held. Defaults to 0: the next shot takes over as it lands. Give it a hold when this shot ends the film.",
    backdrop: "Whether the turning ribbon stands behind the statement. Defaults to true; turn it off for a bare ground.",
    audio: "A soundtrack to place on the shot's clock.",
  },
  whenContentChanges: [
    "Line count: decide which line is the accent before anything else. More lines do not mean the same arrival repeated; past three, the early lines are a run-up.",
    "Line length: a long line shrinks the type and widens the block, and the world moves further out to clear it. Read the reading times in the audit.",
    "Duration or tempo: check each line's clear reading time, then the gaps between arrivals against the feel's claim.",
    "The mark: seat every part on the host and check they still cross where an overlap is declared.",
    "The world or the passes: after any change, read which object the audit says covers a line, and for how long.",
  ],
  stage: { width: 1280, height: 720, fps: 30, durationSec: 3 },
  defaults: (decisions) => ({
    world: defaultWorld(),
    passes: defaultPasses(),
    mark: defaultMark(decisions.look ?? gleanEditorial),
  }),
  compose: (score, { decisions, slots }) => {
    const look = decisions.look ?? gleanEditorial;
    const feel = decisions.feel ?? snappyEditorial;
    const { width, height, fps, durationFrames: total } = score.format;
    const clock = createClock({ fps, durationSec: total / fps, tempo: decisions.tempo });
    const centre = { x: width / 2, y: height / 2 };
    const du = (n: number) => score.du(n);
    score.background = look.surface;
    score.claimFrames = score.frames(feel.claimSec);
    score.audio = decisions.audio;

    // Structure. The mark lands on the last frame unless told to hold; the turn is one carry before.
    const carry = score.frames(feel.carry.sec, 4);
    const landAt = total - 1 - (decisions.holdAfterLandSec ? score.frames(decisions.holdAfterLandSec) : 0);
    const turnAt = Math.max(
      2,
      Math.min(total - 4, decisions.turnAtSec !== undefined ? clock.frame(decisions.turnAtSec) : landAt - carry + 1)
    );
    const turn = score.cue({
      name: "turn",
      frame: turnAt,
      kind: "structure",
      weight: 1,
      why: "Attention passes from the statement to the mark.",
    });
    const land = score.cue({
      name: "land",
      frame: Math.min(total - 1, turnAt + carry - 1),
      kind: "structure",
      weight: 1,
      why: "The mark is complete and at rest.",
    });
    const offeredUntil = Math.max(1, turnAt - score.frames(feel.depart.leadSec));

    // The statement and its phrase.
    const world = group(score, { id: "statement_world", name: "Statement world", slot: "world-stage", layer: 1 });
    const statement = stack(score, slots.lines, { look, parentId: world.id, at: STATEMENT_AT, region: "statement", layer: 3 });
    const needsSec = slots.lines.map((l) => (typeof l === "string" ? readingSec(l) : (l.needsSec ?? readingSec(l.text))));
    const phrase = solvePhrase({
      count: statement.lines.length,
      window: { from: 0, to: offeredUntil },
      clock,
      accent: decisions.accent,
      hold: decisions.hold,
      needFrames: needsSec.map((s) => score.frames(s)),
      claimFrames: score.claimFrames,
      at: decisions.cueSeconds,
      prefix: "line",
    });
    const beats = phrase.cues.map((c) => score.cue(c));
    score.notes.push(...phrase.notes);
    score.sceneName = `${statement.lines.map((l) => l.text).join(" ")} -> mark`;
    arrive(score, statement.lines, { on: beats, feel, until: offeredUntil, needsSec });

    const depart = focusPull(score, world.id, { turn, feel });
    const worldEnd = depart.gone;
    const accentCue = beats[phrase.accent ?? beats.length - 1]!;
    const opening = beats[0]!.frame;
    // The arrival before the accent sets off the lead-in passes, unless it is the shot's first frame:
    // the opening belongs to the first line alone.
    const before: CueIR | undefined = beats[beats.indexOf(accentCue) - 1];
    const leadIn = before && before.frame > opening ? before : undefined;
    const gapSec = (i: number) => ((beats[i + 1]?.frame ?? offeredUntil) - beats[i]!.frame) / fps;

    if (decisions.backdrop ?? true) {
      ribbon(score, {
        parentId: world.id,
        color: look.backdrop,
        statement: statement.region,
        cues: beats,
        pinch: leadIn ?? accentCue,
        settle: accentCue,
        feel,
        gapSec,
        end: worldEnd,
        layer: 1,
      });
    }

    // The world: one ring that turns on every arrival, and shapes that move out to make room.
    const ring = group(score, { id: "world_ring", name: "World ring", slot: "world-ring", plane: "midground", parentId: world.id, layer: 2 });
    const turning = respond(
      score,
      ring.id,
      { property: "rotation" },
      {
        feel,
        start: 0,
        end: worldEnd,
        id: "act_world_ring_turn",
        name: "World turns on each arrival",
        answers: [
          ...beats.map((cue, i) => ({ cue, amount: WORLD_TURN_RATE * Math.min(gapSec(i), ANSWER_SPAN_SEC) * cue.weight })),
          // Into the turn the world gathers speed and keeps it: it leaves moving, under the blur.
          { cue: turn, amount: WORLD_TURN_RATE * ANSWER_SPAN_SEC, windUpSec: 0.33, releaseSec: 0.3, drift: 0, easeOut: linear },
        ],
      }
    ) as ScalarMotionIR;

    const clear = Math.max(statement.region.width, statement.region.height) / 2;
    for (const item of slots.world) {
      const shape = scaleShape(shapeOf(item.shape, item.size), du(1));
      const joinIndex = Math.round((item.joins ?? 0) * (beats.length - 1));
      const joins = beats[joinIndex]!;
      const rest = du(item.radius);
      const settled = Math.max(rest + du(item.push), clear + shapeExtent(shape) / 2 + du(8));
      const node = place(score, {
        id: item.id,
        name: item.name,
        slot: "world",
        role: "support",
        plane: "midground",
        parentId: ring.id,
        layer: item.layer,
        shape,
        fill: lit(look, item.material),
        center: polar(centre, item.angleDeg, rest),
        rotation: item.turn,
        range: joins.frame > 0 ? { startFrame: joins.frame, durationFrames: worldEnd - joins.frame } : undefined,
      });
      const mine = beats.slice(joinIndex);
      // At the opening the world is only waking, so the first answer of a shape that is there from the start is small.
      const shares = mine.map((cue) => cue.weight * (cue.frame === opening ? 0.3 : 1));
      const whole = shares.reduce((a, b) => a + b, 0);
      respond(
        score,
        node.id,
        { property: "move", along: unit(item.angleDeg) },
        {
          feel,
          start: joins.frame,
          end: worldEnd,
          id: `act_${item.id}_makes_room`,
          name: `${item.name} makes room`,
          answers: [
            ...mine.map((cue, k) => ({
              cue,
              amount: ((settled - rest) * shares[k]!) / whole,
              // It jumps on the cue from rest and eases back a little before the next one.
              anticipate: 0,
              drift: -0.07,
              releaseSec: 0.23,
            })),
            { cue: turn, amount: -(settled - rest) * 0.85, windUpSec: 0.4, anticipate: 0.45, drift: 0, easeOut: linear },
          ],
        }
      );
      if (item.shape === "orb") {
        keepUpright(score, node.id, turning);
      } else if (item.spin) {
        const id = score.id(`act_${item.id}_tumble`);
        const life = worldEnd - joins.frame;
        score.track({
          kind: "scalar",
          id,
          name: `${item.name} tumbles`,
          targetId: node.id,
          property: "rotation",
          mode: "add",
          stage: "custom",
          startFrame: joins.frame,
          durationFrames: life,
          reason: { purpose: "drift" },
          keys: [
            { id: `${id}_k0`, frame: 0, value: 0, easing: linear },
            { id: `${id}_k1`, frame: life - 1, value: item.spin },
          ],
        });
      }
    }

    // Passes in front.
    if (slots.passes.length > 0) {
      const front = group(score, { id: "foreground", name: "Foreground", slot: "passes-group", plane: "foreground", parentId: world.id, layer: 4 });
      slots.passes.forEach((item, i) => {
        const cue = item.on === "turn" ? turn : item.on === "lead-in" ? leadIn : accentCue;
        if (!cue) return;
        const start = Math.max(0, cue.frame + Math.round((item.offsetSec ?? 0) * fps));
        const frames = Math.min(worldEnd - start, item.overSec !== undefined ? score.frames(item.overSec, 2) : worldEnd);
        if (frames < 3) return;
        const node = place(score, {
          id: item.id,
          name: item.name,
          slot: "passes",
          role: "ambient",
          plane: "foreground",
          parentId: front.id,
          layer: 10 + i,
          shape: scaleShape(shapeOf(item.shape, item.size), du(1)),
          fill: lit(look, item.material),
          center: { x: item.from.x * width, y: item.from.y * height },
          rotation: item.turn,
          blur: Math.round(du(item.blur)),
        });
        pass(score, node.id, {
          cue,
          start,
          frames,
          ease: item.ease,
          path: item.path.map((p) => ({ at: p.at, x: p.x * width, y: p.y * height, ease: p.ease })),
          spin: item.spin,
          fadeFrames: item.fades ? score.frames(0.1, 2) : 0,
        });
      });
    }

    // The mark: each piece travels to its seat, then the colour relations are stated.
    const mark = slots.mark;
    if (mark) {
      const stage = group(score, { id: "mark", name: "Mark", slot: "mark-stage", plane: "focal", layer: 10 });
      const seat = { x: (mark.seat?.x ?? 0.5) * width, y: (mark.seat?.y ?? 0.5) * height };
      const hostWidth = shapeExtent(scaleShape(mark.host.shape, du(1))) * mark.host.scale.to;
      let layer = 1;
      const bring = (piece: MarkPiece, to: { x: number; y: number }, role: "carrier" | "support") => {
        const start = Math.min(land.frame - 4, turnAt + Math.round((piece.delaySec ?? 0) * fps));
        const path = guide(score, {
          id: `guide_${piece.id}`,
          name: `Guide: ${piece.name}`,
          parentId: stage.id,
          layer: 40 + layer,
          points: piece.approach.map(([x, y]) => ({ x: to.x + du(x), y: to.y + du(y) })),
        });
        const node = place(score, {
          id: piece.id,
          name: piece.name,
          slot: "mark",
          role,
          plane: "focal",
          parentId: stage.id,
          layer: layer++,
          shape: scaleShape(piece.shape, du(1)),
          fill: piece.fill,
          center: to,
          rotation: piece.turn,
          range: { startFrame: start, durationFrames: total - start },
        });
        travel(score, node.id, {
          guideId: path.id,
          start,
          frames: land.frame - start + 1,
          ease: piece.ease,
          scale: piece.scale,
          spin: piece.spin,
          cue: land,
        });
        return node;
      };

      const parts = mark.parts.map((part) =>
        bring(part, { x: seat.x + part.at.x * hostWidth, y: seat.y + part.at.y * hostWidth }, "support")
      );
      const host = bring(mark.host, seat, "carrier");
      mark.parts.forEach((part, i) => {
        score.invariants.push({
          kind: "overlap",
          a: parts[i]!.id,
          b: host.id,
          frame: land.frame,
          minShare: 0.5,
          why: "A part of the mark rests on its host; off it, the mark has come apart.",
        });
        if (!part.through) return;
        recolorWhere(score, { object: parts[i]!.id, over: host.id, fill: part.through, layer, name: `${part.name} inside the host` });
        layer += 2;
      });
      for (const rule of mark.overlaps ?? []) {
        const first = parts[mark.parts.findIndex((p) => p.id === rule.first)];
        const second = parts[mark.parts.findIndex((p) => p.id === rule.second)];
        if (!first || !second) {
          throw new Error(`[statement-converge] The overlap "${rule.name}" names a part the mark does not have.`);
        }
        score.invariants.push({
          kind: "overlap",
          a: second.id,
          b: first.id,
          frame: land.frame,
          minShare: 0.03,
          why: "The overlap has its own fill, so the two parts must cross at rest.",
        });
        recolorWhere(score, { object: second.id, over: first.id, fill: rule.fill, layer, name: rule.name });
        layer += 2;
      }

      const doc = score.toDocument("handoff", "handoff");
      score.handoff.exit = measureHandoff(doc, host.id, land.frame);
    }
    score.handoff.entry = measureHandoff(score.toDocument("handoff", "handoff"), statement.lines[0]!.id, opening);
  },
});
