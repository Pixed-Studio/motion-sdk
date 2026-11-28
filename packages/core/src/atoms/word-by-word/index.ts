import { readingSec } from "../../behaviors/arrive.ts";
import { move } from "../../behaviors/move.ts";
import { drift, leave, ride, shareByDepth, sweep } from "../../behaviors/statement.ts";
import { step } from "../../feel/curves.ts";
import { snappyEditorial } from "../../feel/index.ts";
import { auditMotion } from "../../kernel/audit.ts";
import { measureHandoff } from "../../kernel/handoff.ts";
import type { SceneNodeIR } from "../../kernel/ir.ts";
import { declarePattern, leadPattern } from "../../kernel/pattern.ts";
import { defineShot, slot } from "../../kernel/shot.ts";
import { flat, gleanEditorial } from "../../look/index.ts";
import { createClock } from "../../rhythm/clock.ts";
import { place, polar, scaleShape } from "../../stage/index.ts";
import { sentence } from "../../stage/sentence.ts";
import { markColour, NAMES, resolveHold, resolveJoin, resolveLeave, resolveMark, writeMoves } from "./beats.ts";
import { cascade } from "./cascade.ts";
import { lead } from "./lead.ts";
import type { AmbientItem, Arrival, BeatContext, On, PhraseStage, PropItem, WordByWordDecisions } from "./types.ts";

export type {
  AmbientItem,
  Arrival,
  Assembled,
  BeatContext,
  BeatFn,
  BeatMove,
  Choice,
  ExtraMoves,
  HitName,
  HitSpec,
  HoldName,
  HoldSpec,
  JoinName,
  JoinSpec,
  LeaveName,
  LeaveSpec,
  MarkName,
  MarkingSpec,
  On,
  PatternFn,
  PhraseStage,
  PropItem,
  PushSpec,
  RoomName,
  RoomSpec,
  SettleName,
  SettleSpec,
  WordByWordDecisions,
} from "./types.ts";

/**
 * The patterns a sentence can arrive in. Each is one choreography with its own defaults for the
 * beats the patterns share and the decisions only it reads; a pattern of the author's own is a
 * function given as `pattern`.
 */
const patterns = {
  lead: { assemble: lead, size: 0.1, join: "slide", hold: "out", leave: "recede", beats: ["hit", "settle", "room", "join", "mark", "hold", "leave"], uses: ["settle", "room", "lands", "step", "cueBeats", "relations"] },
  cascade: { assemble: cascade, size: 0.085, join: "focus", hold: "still", leave: "cut", beats: ["hit", "join", "mark", "hold", "leave"], uses: ["accent", "accentHold", "layout", "align", "entry"] },
} as const;
const patternOnly = ["settle", "room", "lands", "step", "cueBeats", "relations", "accent", "accentHold", "layout", "align", "entry"] as const;
const named = (beat: keyof typeof NAMES) => NAMES[beat].map((n) => `"${n}"`).join(", ");

export function defaultAmbient(): AmbientItem[] {
  return [
    { id: "glow-a", angleDeg: 205, distance: 3.1, width: 7.5, height: 4.6, opacity: 0.55 },
    { id: "glow-b", angleDeg: 18, distance: 3.6, width: 6.4, height: 4.2, opacity: 0.4 },
  ];
}

/**
 * Shot 2: a sentence arrives a word or a few at a time. It is a set of beats the author designs
 * (how the lead hits and settles, how room is made, how words join, how the point is marked, what
 * the hold does, how the line leaves) on top of what the shot solves: setting the type, placing the
 * cues, and making room so the finished sentence sits where it was composed.
 */
export const wordByWord = defineShot<
  WordByWordDecisions,
  {
    arrivals: ReturnType<typeof slot.many<string | Arrival>>;
    ambient: ReturnType<typeof slot.many<AmbientItem>>;
    props: ReturnType<typeof slot.many<PropItem>>;
  }
>({
  name: "word-by-word",
  intent:
    "An opening that stresses one message: the viewer reads a sentence in the order and with the stress it would be spoken, " +
    "and comes away with its point. The sentence is given as arrivals, each a word or a few on one cue. In the lead pattern " +
    "(领词让位) the first arrival, the lead, takes the eye on the cut, alone; it has the impact, not the meaning. It gives its " +
    "place to the sentence once, the rest joins during that move, and the point arrives last and is marked. That is all the " +
    "pattern fixes, and the audit checks it. Every beat's movement is yours: its property, direction, amount, time and curve.",
  design: [
    "Intent. One sentence: what should the viewer come away with? Write it in `intent`. It decides how heavy everything else is.",
    "Roles. Split the sentence into arrivals. Which is the lead (it takes the eye; an opener, never the meaning)? Which words are the point (mark them `key`)? What is between is the link and should not compete. Is there a ground, a prop?",
    "Beats. For each, decide what it is for here before how it moves: hit, settle, room, join, mark, hold, leave. A beat can be plain; that is a decision too.",
    "Moves. For each beat pick a name, or write it: a property (position, scale, rotation, opacity, blur, letterSpacing, color), from and to in em, seconds, a curve, a reason. Layer several; chain with `then`; add more on anyone with `extra`.",
    "Feel. The feels hold what the reference films measured; say a curve family (brake, launch, whip, even) and give it your seconds. Change any number with tuneFeel.",
    "Relations. Run audit(). It checks the pattern's relations and what each word was promised, never a value or a direction. A relation you mean to break is waived with its reason in `relations`.",
  ],
  slots: {
    arrivals: slot.many<string | Arrival>({
      role: "subject",
      plane: "focal",
      min: 1,
      describe:
        "The sentence, split where a speaker would breathe or stress: \"Into\", then { text: \"a complete floor plan\", key: \"floor plan\" }. " +
        "Each entry lands on its own cue; several words in one entry come in together, a moment apart. In the lead pattern the " +
        "first entry is the lead. `key` takes the words the sentence is about, as written in `text` (or true for the whole entry); " +
        "they are the point. With no key anywhere the last entry is the point. Two words joined by a non-breaking space (\\u00a0) " +
        "come in as one. { text, join } says how one entry joins when it should differ from the rest.",
    }),
    ambient: slot.many<AmbientItem>({
      role: "ambient",
      plane: "backdrop",
      describe:
        "The ground: soft shapes behind the phrase. In the lead pattern they share the lead's landing and the line's leaving, each by " +
        "its depth, and are still in between; in the cascade pattern they move outward a little on every arrival. " +
        "They must hold the ink: check the audit's contrast. An empty list leaves a bare ground.",
    }),
    props: slot.many<PropItem>({
      role: "support",
      plane: "foreground",
      describe:
        "Shapes of yours that carry an arrival in and then let go: { id, shape, rides: 2, at: { x: 1, y: 1 } } sits on the lower right " +
        "corner of the second arrival's last word, travels in with it, then drifts off and fades. A prop that acts out the word is one way to mark the point.",
    }),
  },
  decisions: {
    intent: "What this shot is for, in a sentence of your own. It is recorded with the shot and never checked. The audit notes when it is missing.",
    pattern:
      "How the sentence comes together. \"lead\" (default): the pattern above, right for an opening that stresses one message. " +
      "\"cascade\": every arrival takes its own step and shows where it rests, with one accent; right for words that are equals on a beat, " +
      "left-aligned copy, and a second line after a lead line. Or a function of your own that brings the sentence on with the public pieces.",
    hit:
      `砸, the lead on the frame it shows. ${named("hit")}: "large" (default) starts as large as the feel says and the safe area allows; "small" starts at 0.6 and is pushed in; ` +
      "\"plain\" is its own size. { scale, from, blur } gives the size, where it comes from (em, any direction) and its blur yourself. " +
      "Or moves: [{ property: \"scale\", from: 3 }, { property: \"rotation\", from: -4 }]. Moves go on the whole sentence unless they say `on`. Cascade: how large the accent starts.",
    settle:
      `落定, how the hit's energy is spent (lead pattern). ${named("settle")}: "fall" (default) comes to size on the feel's curve; "swap" keeps its size and is cut to line size ` +
      "inside the room move's fastest step; \"float\" falls a little past its size and low, then floats up. { sec, curve, then } changes the speed and curve of the fall " +
      "and adds what follows once it has settled: then: { property: \"position\", to: { y: -0.1 }, sec: 0.8 }.",
    room:
      `让, how the lead's place is given to the sentence (lead pattern). The distance is solved, so the finished sentence is centred. ${named("room")}: "whip" (default) is slow at both ends ` +
      "and fastest as the next word shows; \"glide\" starts at once and stops long. { sec, curve } gives yours; left to the feel, the move is kept under way until the last arrival has shown. " +
      "As moves, { property: \"position\" } with no from is the move that makes room (give it your sec and curve) and anything else is layered on the line.",
    join:
      `入, how a word joins. ${named("join")}: "slide" (lead default) shows it beside its place and glides it in; "rise" and "drop" from below and above; "pop" in place; ` +
      "\"focus\" (cascade default) sharpens where it rests; \"fade\". { from, sec, curve, blur, fade } gives any direction in em: { from: { x: -2, y: 0.5 } }. " +
      "Or moves, or a function of ({ arrival, count }) that returns moves, so each arrival can come differently.",
    mark:
      `亮, how the point is singled out. ${named("mark")}: "colour" (default) sets it in the look's primary; "focus" brings it into focus as it lands; "flicker" flickers it on; ` +
      "\"sweep\" sweeps a second colour across it during the hold. { kind, ... } gives each its numbers; several can be combined in a list; or moves written on each point word " +
      "from the frame it shows. \"none\" marks nothing, which the lead pattern's `marked` relation reports unless it is waived.",
    hold:
      `留, what the finished line does while it is read, so that it is never a still. ${named("hold")}: "out" (lead default) eases back, "in" pushes in, the four directions travel, ` +
      "\"still\" (cascade default) holds. { scale, x, y } gives totals over its time on stage (x, y in em), and { sec } how long the complete sentence stays when the length is \"fit\". " +
      "Or moves, counted from the frame the sentence is complete.",
    leave:
      `走, how the sentence leaves, as one. ${named("leave")}: "recede" (lead default) falls back about its middle; "left", "right", "up", "down" go that way; all are still gaining speed ` +
      "on the last frame, so the cut is on the movement and the next shot takes it over (handoff.exit). \"cut\" (cascade default) holds to the last frame; \"shrink\" fades to nothing. " +
      "{ to, scale, rotation, blur, sec, curve, fade } gives any direction and mix: { to: { x: 1.5, y: -0.6 }, curve: \"launch\" }. Or moves.",
    extra:
      "More moves on anyone at any beat: [{ on: \"lead\", beat: \"settle\", moves: { property: \"rotation\", from: -3 } }]. `on` is \"sentence\", \"line\", \"lead\", \"point\", \"link\", " +
      "\"ground\", \"prop\", { arrival: 2 } or { word: \"plan\" }; the moves are counted from that beat's moment.",
    relations:
      "Lead pattern. A relation of the pattern you mean to break, with the reason: { marked: { none: \"the film marks nothing here\" } }. " +
      "The audit reports it instead of checking it. The relations: alone, once, joins, last, marked, composed, whole.",
    crop: "What may be cut by the edge of the picture when it shows, by role, with the reason: { lead: \"the cut lands inside the word\" }. Without it the audit reports the crop.",
    stagger: "Seconds between the words of one arrival. Defaults to the feel's (two frames at 30 fps for snappy editorial). 0 brings them in together.",
    lands:
      "Lead pattern. Which point of an arrival sits on its cue. \"start\" (default): it shows on the cue, and the room move is fastest there. " +
      "\"end\": it comes to rest on the cue, and the room move ends with the first of them; right when words fly in from far and should hit the beat as they land.",
    tempo: "The music's tempo. Lead pattern: the lead is on the first beat and each arrival one `step` later. Cascade: the arrivals land on the grid, the accent on a whole beat.",
    audio: "A soundtrack to place on the shot's clock. Every compiler carries it; give its tempo as `tempo` so the arrivals land on it.",
    step:
      "Lead pattern. How far apart the arrivals are: a number of beats (default 1, a whole beat, whatever the tempo; 0.5 is an eighth), or { sec } for seconds. " +
      "Without a tempo and without a step, the feel's own spacing is used.",
    cueSeconds: "Exact arrival times in seconds, one per arrival, for cutting to a voice or to marked audio. They replace the solver; the audit still checks them.",
    cueBeats: "Lead pattern. Exact arrival times in beats of the tempo, one per arrival: [0, 1, 1.5].",
    durationSec:
      "Length of the shot in seconds, or \"fit\" (default): as long as the content needs, which is every word's reading time, the hold and the exit, " +
      "ending on a beat when there is a tempo. Given a number, entrances and the exit keep their length and extra time goes to the hold; " +
      "the audit reports a hold much longer than the sentence takes to read.",
    look: "Colours and type. Defaults to the Glean look.",
    feel:
      "The numbers the beats draw on when you give none: measured from reference films and named (snappyEditorial, popAndGlide). " +
      "They are taste, not rules; change any one with tuneFeel(feel, { room: { sec: 0.5 } }).",
    at: "Centre of the phrase as fractions of the stage. Defaults to the middle.",
    size: "Type size as a share of the stage's shorter relative side (its height on 16:9; a tall stage counts its width times 9/16), while the phrase fits. Defaults to 0.1 in the lead pattern and 0.085 in the cascade pattern.",
    maxWidth: "Share of the safe width the widest line may take. Defaults to 0.86.",
    maxLines: "Lines the phrase may wrap to before the type shrinks. Defaults to 2.",
    width: "Stage width in pixels. Type and travel scale by the shorter relative side.",
    height: "Stage height in pixels.",
    fps: "Frames per second. Transients are in seconds and stay as sharp at 60 as at 30.",
    accent:
      "Cascade pattern. Which arrival carries the sentence. Defaults to the last, for a line that builds to its point. " +
      "\"first\" states the point and lets the rest complete it. \"none\" gives every arrival the same time, for words that are equals on a beat.",
    accentHold: "Cascade pattern. How many steps of time the accent keeps before the next arrival. Defaults to 1.5 for up to three arrivals and 2.5 above.",
    layout:
      "Cascade pattern. \"recentre\" (default) keeps whatever has arrived centred, so the line steps aside for each word. " +
      "\"anchored\" sets every word where it will rest: calmer, and the right choice for left-aligned copy or lines read as a list.",
    align: "Cascade pattern. \"center\" (default) or \"left\". Left-aligned lines are anchored. The lead pattern is always centred.",
    entry:
      "Cascade pattern. \"cut\" (default): the line is where it rests from its first frame. \"push\": the whole line comes " +
      "in from the right, slowing all the way, for a line that takes over the speed of the shot before. { em, sec, ease } gives the distance and time yourself.",
  },
  renamed: { enter: "join", drift: "hold", exit: "leave", punch: "hit", focus: "mark" },
  whenContentChanges: [
    "The sentence: decide the arrivals before anything else. Split where it is stressed, not every word; a word that only joins two others travels with one of them.",
    "The lead (lead pattern): it is the opener, short enough to read at a glance while it is large. If the point of the sentence moved to the front, the sentence wants the cascade pattern with accent \"first\", or rewording.",
    "The point: mark it as key. It belongs in the last arrival, where the line resolves; the `last` relation says so when it is not.",
    "Word count: a longer sentence wraps or shrinks. Check the type size the shot settled on, and each arrival's clear reading time in the audit.",
    "Tempo or step: read the cue frames, then measures.hold: how long the complete sentence stays before it starts to leave. Each word's clear time runs on to the cut while the line leaves whole and sharp, so read both.",
    "The cut: an exit that is still moving hands its speed to the next shot. Join the two with sequence([a, b]) and read what the join reports.",
    "The ground: after changing what is behind the phrase, read the audit's contrast and which object it says covers a word.",
  ],
  stage: { width: 1280, height: 720, fps: 30, durationSec: 3 },
  defaults: () => ({ ambient: defaultAmbient() }),
  fit: ({ decisions }, compose) => {
    // The cascade pattern shares its time out among the arrivals, so its length is the author's to give.
    if (decisions.pattern === "cascade" && !decisions.cueSeconds) return 3;
    // Long enough for the sentence to be whole, be read and leave; measured on the shot itself.
    const fps = Math.max(12, Math.round(decisions.fps ?? 30));
    const trial = compose(30);
    const complete = trial.hold?.completeFrame ?? 0;
    const leaving = trial.format.durationFrames - (trial.hold?.leaveFrame ?? trial.format.durationFrames);
    const cueAt = new Map(trial.cues.map((c) => [c.name, c.frame]));
    const read = Math.max(0, ...trial.subjects.map((s) => (cueAt.get(s.cue) ?? 0) + Math.ceil(s.needsSec * fps)));
    const feel = decisions.feel ?? snappyEditorial;
    const holdSec = [decisions.hold].flat().find((h): h is { sec: number } => typeof h === "object" && h !== null && "sec" in h && typeof h.sec === "number")?.sec ?? feel.hold.sec;
    const clock = createClock({ fps, durationSec: 30, tempo: decisions.tempo });
    let frames = Math.max(complete + Math.round(holdSec * fps) + leaving, read);
    for (let round = 0; round < 3; round++) {
      const sec = clock.snap(frames / fps, 1, "up");
      const short = auditMotion(compose(sec).toDocument("fit", "fit")).measures.reading.map((m) => m.needsSec - m.clearSec).filter((d) => d > 1e-9);
      if (short.length === 0) return sec;
      frames = Math.round(sec * fps) + Math.ceil(Math.max(...short) * fps);
    }
    return clock.snap(frames / fps, 1, "up");
  },
  compose: (score, { decisions, slots }) => {
    const look = decisions.look ?? gleanEditorial;
    const feel = decisions.feel ?? snappyEditorial;
    const patternName = typeof decisions.pattern === "function" ? "custom" : (decisions.pattern ?? "lead");
    if (patternName !== "custom" && !(patternName in patterns)) {
      throw new Error(`[word-by-word] pattern: "${patternName}" is not a pattern this shot knows. It knows "lead" and "cascade"; or give a function of your own.`);
    }
    const pattern = patternName === "custom" ? { ...patterns.lead, assemble: decisions.pattern as typeof lead, uses: patternOnly as readonly string[], beats: [] as readonly string[] } : patterns[patternName as "lead" | "cascade"];
    const total = score.format.durationFrames;
    const fps = score.format.fps;
    score.background = look.surface;
    score.sceneName = "Word by word";
    score.claimFrames = score.frames(feel.claimSec);
    score.intent = decisions.intent?.trim() || undefined;
    score.audio = decisions.audio;

    // A decision that belongs to the other pattern is named, never dropped in silence.
    for (const key of patternOnly) {
      if (decisions[key] === undefined || (pattern.uses as readonly string[]).includes(key)) continue;
      const owner = Object.entries(patterns).find(([, p]) => (p.uses as readonly string[]).includes(key))![0];
      score.notes.push({
        rule: "decision",
        severity: "warning",
        message: `"${key}" is a decision of the ${owner} pattern and this shot uses the ${patternName} pattern; it was not applied.`,
        fix: `Choose pattern: "${owner}", or leave "${key}" out.`,
      });
    }

    const given = slots.arrivals.map((a) => (typeof a === "string" ? { text: a } : a));
    const align = patternName === "lead" ? "center" : (decisions.align ?? "center");
    const set = sentence(score, given, { look, at: decisions.at, align, size: decisions.size ?? pattern.size, maxWidth: decisions.maxWidth, maxLines: decisions.maxLines });
    const em = set.set.fontSize;
    const middle = set.middle;

    // Ground: soft shapes placed from the phrase.
    const ground = slots.ambient.map((item, i) =>
      place(score, {
        id: item.id,
        name: item.id,
        slot: "ambient",
        role: "ambient",
        plane: "backdrop",
        layer: i + 1,
        shape: { kind: "ellipse", width: Math.round(item.width * em), height: Math.round((item.height ?? item.width) * em) },
        fill: item.material ? flat(look, item.material) : { kind: "solid", color: look.backdrop },
        center: polar(middle, item.angleDeg, item.distance * em),
        blur: Math.round(score.du(70)),
        opacity: item.opacity ?? 0.5,
      })
    );

    // Props: the author's shapes, each beside the word it carries in and in that word's group.
    const hostOf = (item: PropItem) => {
      const host = typeof item.rides === "number" ? set.wordsOf(item.rides - 1).at(-1) : [...set.words.values()].find((n) => n.text === item.rides || n.text.replace(/[.,!?;:]+$/, "") === item.rides);
      if (!host) throw new Error(`[word-by-word] Prop "${item.id}" rides ${JSON.stringify(item.rides)}, and the sentence has no such ${typeof item.rides === "number" ? "arrival" : "word"}.`);
      return host;
    };
    const props = slots.props.map((item, i) => {
      const host = hostOf(item);
      const at = item.at ?? { x: 1, y: 1 };
      return place(score, {
        id: item.id,
        name: item.id,
        slot: "props",
        role: "support",
        plane: "foreground",
        parentId: host.parentId,
        layer: 100 + i,
        shape: scaleShape(item.shape, em),
        fill: item.fill ?? flat(look, item.material ?? "primary"),
        center: { x: host.base.x + host.base.width * at.x + (at.dx ?? 0) * em, y: host.base.y + host.base.height * at.y + (at.dy ?? 0) * em },
        rotation: item.rotation,
      });
    });

    // Who is who. The point is what the author marked as key; with nothing marked, it is the last arrival.
    const keyed = set.set.words.filter((w) => w.key && (patternName !== "lead" || w.arrival > 0));
    const point = keyed.length > 0 ? keyed : given.length > 1 ? set.set.words.filter((w) => w.arrival === given.length - 1) : [];
    const groupsOf = (arrival: number) => set.groupsOf(arrival) as SceneNodeIR[];
    const nodesOf = (on: On): SceneNodeIR[] => {
      if (on === "sentence") return [set.root];
      if (on === "line") return [set.lines[set.set.words.find((w) => w.arrival === 0)!.line]!];
      if (on === "lead") return groupsOf(0);
      if (on === "point") return point.map((w) => set.words.get(w)!);
      if (on === "link") return set.set.words.filter((w) => w.arrival > 0 && !point.includes(w)).map((w) => set.words.get(w)!);
      if (on === "ground") return ground;
      if (on === "prop") return props;
      if (typeof on === "object" && "arrival" in on) {
        if (on.arrival < 1 || on.arrival > given.length) throw new Error(`[word-by-word] on: { arrival: ${on.arrival} } and the sentence has ${given.length} arrival(s), counted from 1.`);
        return groupsOf(on.arrival - 1);
      }
      if (typeof on === "object" && "word" in on) {
        const found = [...set.words.values()].filter((n) => n.text === on.word || n.text.replace(/[.,!?;:]+$/, "") === on.word);
        if (found.length === 0) throw new Error(`[word-by-word] on: { word: "${on.word}" } and the sentence has no such word. Its words: ${[...set.words.values()].map((n) => n.text).join(", ")}.`);
        return found;
      }
      throw new Error(`[word-by-word] on: ${JSON.stringify(on)} names nobody. Use "sentence", "line", "lead", "point", "link", "ground", "prop", { arrival } or { word }.`);
    };

    const stage: PhraseStage = {
      score, look, feel, decisions, arrivals: [], set: set.set, em, middle, root: set.root, lines: set.lines, parts: set.parts, words: set.words, ground,
      ambient: slots.ambient,
      point,
      join: { moves: [], frames: 1, restAfter: 0, from: { x: 0, y: 0 }, own: false },
      staggerFrames: (decisions.stagger ?? feel.arrive.staggerSec) * fps,
      until: total,
      total,
      drift: { scale: 0, x: 0, y: 0 },
      nodesOf,
    };
    const ctx = (beat: BeatContext["beat"], arrival?: number): BeatContext => ({ beat, stage, em, count: given.length, arrival });
    stage.join = resolveJoin(score, decisions.join, pattern.join, ctx("join"), feel);
    stage.arrivals = given.map((a, i) => ({
      text: a.text.trim(),
      words: set.wordsOf(i).map((n) => n.text),
      needsSec: a.needsSec ?? readingSec(a.text.trim()),
      join: { ...resolveJoin(score, a.join ?? decisions.join, pattern.join, ctx("join", i), feel), own: a.join !== undefined },
    }));
    const mark = resolveMark(decisions.mark, ctx("mark"), feel, look);
    markColour(stage, mark);
    const hold = resolveHold(decisions.hold, pattern.hold, ctx("hold"), feel);
    stage.drift = { scale: hold.scale, x: hold.x, y: hold.y };
    const exit = resolveLeave(score, decisions.leave, pattern.leave, ctx("leave"), feel);
    const until = total - exit.frames;
    stage.until = until;

    // Roles, for whoever checks a pattern against this shot.
    for (const [word, node] of set.words) score.cast(point.includes(word) ? "point" : word.arrival === 0 && patternName !== "cascade" ? "lead" : "link", node);
    score.cast("camera", set.root);
    if (ground.length) score.cast("ground", ...ground);
    if (props.length) score.cast("prop", ...props);

    const { cues, onset, landed, roomFrom, settled } = pattern.assemble(stage);
    const start = cues[0]!.frame;

    // 留: the finished line keeps moving while it is read.
    drift(score, set.root, { from: start, to: until >= total ? total - 1 : until, rest: landed, scale: hold.scale, travel: { x: hold.x, y: hold.y, unit: "px" } });
    writeMoves(stage, hold.moves, [set.root], { at: landed, sec: Math.max(0.1, score.sec(until - landed)), curve: "even", beat: "hold" });

    // 走: the sentence leaves as one, and the ground goes with it by its depth.
    if (exit.frames > 0) {
      const cue = score.cue({
        name: "exit",
        frame: until,
        kind: "structure",
        weight: 0.5,
        why: exit.fade ? "The phrase has been read; it lets go of the viewer." : "The phrase starts to leave. The cut comes while it is still gaining speed.",
      });
      const own = exit.moves.filter((m) => m.on === undefined).map(({ on: _on, ...m }) => m);
      const went = leave(score, set.root, { at: until, cue, sec: score.sec(exit.frames), curve: exit.curve, to: exit.to, scale: exit.scale, rotation: exit.rotation, blur: exit.blur, fade: exit.fade, moves: own, em });
      writeMoves(stage, exit.moves.filter((m) => m.on !== undefined), [set.root], { at: until, sec: score.sec(exit.frames), curve: exit.curve, beat: "leave", cue, lands: "start" });
      if (!exit.fade) {
        shareByDepth(score, ground, went.blocks, {
          depth: (_, i) => slots.ambient[i]?.depth ?? 0.3,
          about: middle,
          stems: { scale: "falls_back", scaleMove: "goes", move: "goes" },
          names: { scale: "falls back", move: "goes with the line" },
        });
      }
    }

    // More moves, on anyone, counted from the beat they name.
    const joined = (node: SceneNodeIR) => {
      const word = [...set.words].find(([, n]) => n.id === node.id)?.[0];
      return word ? onset(word) : (cues[1]?.frame ?? start);
    };
    const firstPoint = point.length ? Math.min(...point.map(onset)) : landed;
    for (const extra of decisions.extra ?? []) {
      const moves = Array.isArray(extra.moves) ? extra.moves : [extra.moves];
      const span = score.sec(Math.max(2, until - landed));
      for (const node of nodesOf(extra.on)) {
        const at = extra.beat === "hit" ? start : extra.beat === "settle" ? (settled ?? start) : extra.beat === "room" ? (roomFrom ?? cues[1]?.frame ?? start) : extra.beat === "join" ? joined(node) : extra.beat === "mark" ? firstPoint : extra.beat === "hold" ? landed : until;
        const sec = extra.beat === "hold" ? span : extra.beat === "leave" ? score.sec(Math.max(2, exit.frames)) : extra.beat === "join" || extra.beat === "mark" ? feel.join.sec : extra.beat === "room" ? feel.room.sec : extra.beat === "hit" ? feel.punch.sec : 0.5;
        move(score, node, moves, { at, sec, em, beat: extra.beat, curve: extra.beat === "hold" ? "even" : extra.beat === "leave" ? exit.curve : undefined });
      }
    }

    // 亮: the point is singled out from the frame it shows.
    for (const word of point) {
      const node = set.words.get(word)!;
      const at = onset(word);
      const cue = cues[word.arrival]!;
      if (mark.focus) move(score, node, { property: "blur", from: mark.focus.blur, sec: mark.focus.sec, curve: "even", id: "focus", reason: `${node.text} comes into focus` }, { at, em, beat: "mark", purpose: "arrive", cue });
      if (mark.flicker) move(score, node, { property: "opacity", from: mark.flicker.steps[0], via: mark.flicker.steps.slice(1), to: 1, sec: mark.flicker.sec, curve: step, id: "flickers", reason: `${node.text} flickers on` }, { at, em, beat: "mark", purpose: "arrive", cue });
      writeMoves(stage, mark.moves, [node], { at, sec: feel.join.focusSec, beat: "mark", cue });
    }
    for (const item of slots.props) {
      const i = slots.props.indexOf(item);
      const host = hostOf(item);
      const hostWord = [...set.words].find(([, n]) => n.id === host.id)![0];
      const rests = onset(hostWord) + stage.arrivals[hostWord.arrival]!.join.restAfter;
      const letGo = item.letGo === false ? undefined : { at: rests + score.frames(item.letGo?.after ?? 0.2), moves: [{ property: "position" as const, to: item.letGo?.to ?? { x: 1.1, y: 0.9 }, reason: `${item.id} lets go` }], sec: item.letGo?.sec ?? 0.5, curve: item.letGo?.curve, fade: true };
      ride(score, props[i]!, host, { letGo, em });
    }
    if (mark.sweep) {
      for (const word of point) {
        const at = mark.sweep.during === "hold" ? Math.min(landed, until - 2) : onset(word);
        sweep(score, set.words.get(word)!, { color: mark.sweep.color, at: at + Math.round(mark.sweep.delay * fps), sec: mark.sweep.sec, curve: mark.sweep.curve, from: mark.sweep.from });
      }
    }

    // What each word is owed. An arrival is read from its cue, so a word that shows a moment later owes that
    // much less. A line that is still whole and sharp while it leaves is offered to the cut; how long it sits
    // complete before it starts to go is the hold, reported by itself.
    const offeredUntil = exit.fade ? until : total;
    for (const [word, node] of set.words) {
      const cue = cues[word.arrival]!;
      const late = Math.max(0, score.sec(onset(word) - cue.frame));
      const needsSec = Math.max(0.1, Math.round((stage.arrivals[word.arrival]!.needsSec - late) * 100) / 100);
      score.subjects.push({ nodeId: node.id, cue: cue.name, needsSec, untilFrame: offeredUntil, accent: cue.kind === "accent" });
    }
    score.hold = { completeFrame: Math.min(landed, until), leaveFrame: until };

    // One arrival is a hit with nothing to make room for: there is no pattern to hold it to.
    if (patternName === "lead" && given.length > 1) declarePattern(score, leadPattern, decisions.relations);
    for (const [role, why] of Object.entries(decisions.crop ?? {})) if (why) score.crop(why, ...score.castAs(role));

    // Handoffs: attention starts on the first word to arrive and leaves on the word the sentence is about.
    const byOnset = [...set.words].sort((a, b) => onset(a[0]) - onset(b[0]));
    const accent = cues.findIndex((c) => c.kind === "accent");
    const carrier =
      [...set.words].reverse().find(([w]) => point.includes(w)) ??
      [...set.words].reverse().find(([w]) => w.arrival === (accent >= 0 ? accent : given.length - 1)) ??
      byOnset.at(-1)!;
    const doc = score.toDocument("handoff", "handoff");
    score.handoff.entry = measureHandoff(doc, byOnset[0]![1].id, onset(byOnset[0]![0]));
    score.handoff.exit = measureHandoff(doc, carrier[1].id, exit.fade ? until - 1 : total - 1);

    // A default is a place to start from, not a design: the beats the author did not decide are named.
    const open = (pattern.beats as readonly string[]).filter((beat) => decisions[beat as "hit"] === undefined && !(beat === "join" && given.length > 1 && given.slice(1).every((a) => a.join !== undefined)));
    if (open.length > 0 || !score.intent) {
      const defaults: Record<string, string> = { hit: "large", settle: "fall", room: "whip", join: pattern.join, mark: "colour", hold: pattern.hold, leave: pattern.leave };
      score.notes.push({
        rule: "undecided",
        severity: "note",
        message:
          (open.length > 0 && open.length === pattern.beats.length ? "Every beat of this shot is the atom's default; it is a starting point, not a design. " : "") +
          (open.length > 0 ? `Not decided: ${open.map((beat) => `${beat} (now "${defaults[beat]}")`).join(", ")}.` : "") +
          (score.intent ? "" : `${open.length > 0 ? " " : ""}No intent is written.`),
        fix: `${open.length > 0 ? "Decide each beat for this sentence: a name, a spec, or moves of your own (wordByWord.describe() lists them); naming the default keeps it on purpose." : ""}${score.intent ? "" : `${open.length > 0 ? " " : ""}Say what the shot is for in \`intent\`.`}`,
      });
    }
  },
});
