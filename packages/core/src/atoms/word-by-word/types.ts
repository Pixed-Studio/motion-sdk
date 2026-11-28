import type { Move, Offset } from "../../behaviors/move.ts";
import type { Curve } from "../../feel/curves.ts";
import type { Feel } from "../../feel/index.ts";
import type { EasingSpec } from "../../kernel/easing.ts";
import type { AudioTrackIR, Beat, CueIR, FillSpec, FrameNodeIR, PathNodeIR, Point2D, Role, SceneNodeIR, ShapeNodeIR, TextNodeIR } from "../../kernel/ir.ts";
import type { Waive } from "../../kernel/pattern.ts";
import type { Score } from "../../kernel/score.ts";
import type { Look, MaterialName } from "../../look/index.ts";
import type { Tempo } from "../../rhythm/clock.ts";
import type { ShapeSpec } from "../../stage/index.ts";
import type { SentencePart, SetPhrase, SetWord } from "../../stage/sentence.ts";

/** Who a move is written on, inside this shot. */
export type On =
  /** The group that carries the whole sentence: the camera. */
  | "sentence"
  /** The line the lead belongs to: what the room move carries. */
  | "line"
  /** The lead as one object, each word the sentence is about, each word between them. */
  | "lead"
  | "point"
  | "link"
  | "ground"
  | "prop"
  /** One arrival as one object, counted from 1. */
  | { arrival: number }
  /** One word, as written. */
  | { word: string };

/** A move inside a beat of this shot. `on` says who it moves when the beat's own target is not the one. */
export type BeatMove = Move & { on?: On };

/** What a beat's function is given: the sentence at rest and who is who. It returns the moves; it writes nothing itself. */
export interface BeatContext {
  beat: Beat;
  stage: PhraseStage;
  /** Pixels in one em of the sentence's type. */
  em: number;
  /** The arrival and word the beat is being decided for, where it is decided per word (join, mark). Arrivals count from 0 here. */
  arrival?: number;
  word?: SetWord;
  /** How many arrivals the sentence has. */
  count: number;
}

export type BeatFn = (beat: BeatContext) => BeatMove | BeatMove[];

/** A beat is decided by a name, a spec with numbers, moves of your own, a mix of them, or a function that returns moves. */
export type Choice<Name extends string, Spec> = Name | Spec | BeatMove | (Name | Spec | BeatMove)[] | BeatFn;

/** 砸. What the lead is on the frame it shows. */
export type HitName = "large" | "small" | "plain";
export interface HitSpec {
  /** Its size on the cut, as a multiple of its resting size. Above 1 it lands large; below 1 it starts small and is pushed in. */
  scale?: number;
  /** Where it shows, from its place. The lead as a whole comes from there on the settle's curve. */
  from?: Offset;
  /** Blur it shows with, in design units. */
  blur?: number;
}

/** 落定. How the hit's energy is spent. */
export type SettleName = "fall" | "swap" | "float";
export interface SettleSpec {
  /**
   * `"fall"`: to line size at once. `"swap"`: it keeps its size and is cut to line size inside the
   * fastest step of the room move. `"float"`: it falls a little past its size and low, then floats up.
   */
  kind?: SettleName;
  sec?: number;
  curve?: Curve;
  /** float: how far past its size it falls, as a share of it, and how far below its line, in em. */
  dip?: number;
  dipEm?: number;
  /** float: seconds it takes to float back. */
  floatSec?: number;
  /** What follows on the lead once it has settled. */
  then?: BeatMove | BeatMove[];
}

/** 让. How the lead's place is given to the sentence. The distance is solved; the rest is yours. */
export type RoomName = "whip" | "glide";
export interface RoomSpec {
  sec?: number;
  curve?: Curve;
}

/** 入. How a word joins. */
export type JoinName = "slide" | "rise" | "drop" | "pop" | "focus" | "fade";
export interface JoinSpec {
  /** Where it shows, from its place: any direction. */
  from?: Offset;
  sec?: number;
  curve?: Curve;
  /** It also sharpens as it comes: `true` for the feel's blur, or design units. */
  blur?: number | true;
  /** It fades up instead of popping on. */
  fade?: boolean;
}

/** 亮. How the point is singled out. */
export type MarkName = "colour" | "focus" | "flicker" | "sweep" | "none";
export type MarkingSpec =
  | { kind: "colour"; color?: string | MaterialName }
  | { kind: "focus"; blur?: number; sec?: number }
  | { kind: "flicker"; sec?: number; steps?: number[] }
  | { kind: "sweep"; color?: string | MaterialName; sec?: number; from?: "left" | "right" | "top" | "bottom"; curve?: Curve; during?: "join" | "hold"; delay?: number };

/** 留. What the finished line does while it is read. */
export type HoldName = "out" | "in" | "left" | "right" | "up" | "down" | "still";
export interface HoldSpec {
  /** Share of its size it gains (above 0) or loses over its time on stage. */
  scale?: number;
  /** Distance it travels over its time on stage, in em. */
  x?: number;
  y?: number;
  /** Seconds the complete sentence stays before it leaves, when the shot's length follows its content. Defaults to the feel's. */
  sec?: number;
}

/** 走. How the sentence leaves. */
export type LeaveName = "recede" | "left" | "right" | "up" | "down" | "cut" | "shrink";
export interface LeaveSpec {
  /** Where it has got to when the cut comes, from its place, in em: any direction. */
  to?: Offset;
  /** Its size at the cut, as a share of its resting size. */
  scale?: number;
  rotation?: number;
  /** Blur at the cut, in design units. */
  blur?: number;
  sec?: number;
  curve?: Curve;
  /** It fades to nothing: the shot hands over to nothing. */
  fade?: boolean;
}

/** Words that come in together, on one cue. */
export interface Arrival extends SentencePart {
  /** Seconds it needs to be read, when its length misleads. */
  needsSec?: number;
  /**
   * How this arrival joins, when it should differ from the shot's `join`. On the first arrival of
   * the lead pattern it is how the lead's own words show, inside whatever the hit does.
   */
  join?: Choice<JoinName, JoinSpec>;
}

/** Something soft behind the phrase. */
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
  /** How far it moves out on a full-weight arrival, in design units, when the ground answers arrivals. Defaults to 16. */
  answer?: number;
  /**
   * How much of the line's landing and leaving it shares, from 0 (it stays put) to 1 (it moves as
   * the type does). Further back is less. Defaults to 0.3.
   */
  depth?: number;
}

/** A shape of yours that carries an arrival in, then lets go. */
export interface PropItem {
  id: string;
  /** Its outline, with sizes in em of the sentence's type. */
  shape: ShapeSpec;
  /** Its colour: a material of the look, or a fill. Defaults to the primary. */
  material?: MaterialName;
  fill?: FillSpec;
  /** What it carries in: an arrival counted from 1 (its last word), or a word as written. */
  rides: number | string;
  /** Where it sits on that word: fractions of the word's box (`{ x: 1, y: 1 }` is its lower right corner) and an offset in em. */
  at?: { x: number; y: number; dx?: number; dy?: number };
  rotation?: number;
  /**
   * What it does once the word has landed: after `after` seconds it goes `to` (em, from where it sat)
   * and fades. `false` keeps it on the word.
   */
  letGo?: { after?: number; to?: Offset; sec?: number; curve?: Curve } | false;
}

export interface ExtraMoves {
  /** Who. */
  on: On;
  /** When: counted from that beat's moment for who it is written on. */
  beat: "hit" | "settle" | "room" | "join" | "mark" | "hold" | "leave";
  moves: Move | Move[];
}

export interface PushSpec {
  /** Distance the line comes from, in em. */
  em?: number;
  sec?: number;
  ease?: EasingSpec;
}

export interface WordByWordDecisions {
  width?: number;
  height?: number;
  fps?: number;
  durationSec?: number | "fit";
  intent?: string;
  look?: Look;
  feel?: Feel;
  tempo?: Tempo;
  audio?: AudioTrackIR;
  step?: number | { sec: number };
  cueSeconds?: number[];
  cueBeats?: number[];
  at?: Point2D;
  size?: number;
  maxWidth?: number;
  maxLines?: number;
  pattern?: "lead" | "cascade" | PatternFn;
  hit?: Choice<HitName, HitSpec>;
  settle?: Choice<SettleName, SettleSpec>;
  room?: Choice<RoomName, RoomSpec>;
  join?: Choice<JoinName, JoinSpec>;
  mark?: Choice<MarkName, MarkingSpec>;
  hold?: Choice<HoldName, HoldSpec>;
  leave?: Choice<LeaveName, LeaveSpec>;
  extra?: ExtraMoves[];
  relations?: Record<string, Waive>;
  crop?: Partial<Record<Role, string>>;
  stagger?: number;
  lands?: "start" | "end";
  accent?: "last" | "first" | "none" | number;
  accentHold?: number;
  layout?: "recentre" | "anchored";
  align?: "center" | "left";
  entry?: "cut" | "push" | PushSpec;
}

/** An arrival as the shot reads it. */
export interface ReadArrival {
  text: string;
  words: string[];
  needsSec: number;
  /** How it joins: the moves each of its words makes from the frame it shows. */
  join: JoinPlan;
}

/** How words join, resolved: the moves, how many frames they take and when the eye takes them as arrived. */
export interface JoinPlan {
  moves: Move[];
  /** Frames from showing to the last key of what travels. 1 for a word that appears in place. */
  frames: number;
  /** Frames from showing until it reads as landed. */
  restAfter: number;
  /** Where it shows, in pixels from its place. */
  from: Point2D;
  /** Whether the author decided it for this arrival. */
  own: boolean;
}

/** The sentence set at rest, the objects that hold it, and every beat as decided. A pattern starts from this. */
export interface PhraseStage {
  score: Score;
  look: Look;
  feel: Feel;
  decisions: WordByWordDecisions;
  arrivals: ReadArrival[];
  set: SetPhrase;
  /** Pixels in one em. */
  em: number;
  /** Middle of the phrase at rest, in pixels. */
  middle: Point2D;
  /** The group that carries the whole sentence. */
  root: FrameNodeIR;
  lines: FrameNodeIR[];
  /** Each arrival's share of a line, keyed `arrival:line`. */
  parts: Map<string, { node: FrameNodeIR; words: SetWord[] }>;
  words: Map<SetWord, TextNodeIR>;
  ground: (ShapeNodeIR | PathNodeIR)[];
  ambient: AmbientItem[];
  /** The words the sentence is about: the ones marked `key`, or the last arrival. */
  point: SetWord[];
  /** How words join when their arrival does not say. */
  join: JoinPlan;
  staggerFrames: number;
  /** The frame the phrase starts to leave. Equal to `total` when it is cut. */
  until: number;
  total: number;
  /** The drift the finished line has: scale as a share, travel in pixels, over the whole of its time on stage. */
  drift: { scale: number; x: number; y: number };
  /** The objects a move's `on` names. */
  nodesOf: (on: On) => SceneNodeIR[];
}

/** What a pattern hands back once the words are on stage. */
export interface Assembled {
  /** One cue per arrival, in order. */
  cues: CueIR[];
  /** The frame a word is first drawn on. */
  onset: (word: SetWord) => number;
  /** The frame every word has come to rest: the sentence reads complete. */
  landed: number;
  /** The frame the room move starts, when the pattern makes room. */
  roomFrom?: number;
  /** The frame the lead's hit has been spent. */
  settled?: number;
}

/**
 * A pattern of your own: given the sentence at rest, bring it on with the public pieces (`enter`,
 * `land`, `makeRoom`, `move`, `sweep`, `ride`), cast its roles, declare the pattern it follows if
 * it follows one, and say when each word shows and when the sentence is complete. The shot then
 * adds the hold, the exit, the reading it owes each word and the handoffs.
 */
export type PatternFn = (stage: PhraseStage) => Assembled;
