import { auditMotion, type AuditReport } from "./audit.ts";
import { snapshot, type SnapshotEntry } from "./evaluate.ts";
import type { AttentionRole, DepthPlane, HandoffIR, MotionDocument } from "./ir.ts";
import { Score } from "./score.ts";

export interface SlotSpec<TItem, TCard extends "one" | "many"> {
  cardinality: TCard;
  /** What the slot's content is to the viewer. The audit holds it to that role's obligations. */
  role: AttentionRole;
  plane: DepthPlane;
  /** Fewest items a `many` slot takes. */
  min?: number;
  required?: boolean;
  /** What goes here and what the shot does with it, for whoever fills it. */
  describe: string;
  readonly __item?: TItem;
}

type SlotInit<TItem, TCard extends "one" | "many"> = Omit<SlotSpec<TItem, TCard>, "cardinality" | "__item">;

/**
 * A slot is a place for content, not a count of it. A `many` slot takes however many items the
 * content has, and the shot's solvers work from that number.
 */
export const slot = {
  one<TItem>(spec: SlotInit<TItem, "one">): SlotSpec<TItem, "one"> {
    return { ...spec, cardinality: "one" };
  },
  many<TItem>(spec: SlotInit<TItem, "many">): SlotSpec<TItem, "many"> {
    return { ...spec, cardinality: "many" };
  },
};

type AnySlots = Record<string, SlotSpec<any, any>>;

export type SlotsInput<TSlots extends AnySlots> = {
  [K in keyof TSlots]?: TSlots[K] extends SlotSpec<infer T, infer C> ? (C extends "many" ? T[] : T) : never;
};

export type SlotsResolved<TSlots extends AnySlots> = {
  [K in keyof TSlots]: TSlots[K] extends SlotSpec<infer T, infer C>
    ? C extends "many"
      ? T[]
      : T | undefined
    : never;
};

/** What every shot lets its author decide about the picture and its length. */
export interface StageDecisions {
  width?: number;
  height?: number;
  fps?: number;
  durationSec?: number;
}

export interface ShotDefinition<TDecisions extends StageDecisions, TSlots extends AnySlots> {
  name: string;
  /** What the viewer should come away with, and how the picture gets them there. */
  intent: string;
  slots: TSlots;
  /**
   * Every decision the shot leaves to its author: what the default does and when to choose
   * otherwise. TypeScript requires one entry per decision, so none goes undocumented.
   */
  decisions: { [K in keyof Required<TDecisions>]: string };
  /** What to reconsider when the content changes, in the order a designer would. */
  whenContentChanges: string[];
  stage: { width: number; height: number; fps: number; durationSec: number };
  /**
   * The shot's own content for slots the author leaves out. A slot given as an empty list stays
   * empty, so "no world" and "the usual world" are different requests.
   */
  defaults?: (decisions: TDecisions) => SlotsInput<TSlots>;
  compose: (score: Score, input: { decisions: TDecisions; slots: SlotsResolved<TSlots> }) => void;
}

export interface Shot {
  readonly shot: string;
  readonly ir: MotionDocument;
  /** What is on stage at a frame, without rendering. */
  snapshot: (frame: number) => SnapshotEntry[];
  /** Checks the shot against what it declared, frame by frame, and returns the measurements. */
  audit: () => AuditReport;
  readonly handoff: { entry?: HandoffIR; exit?: HandoffIR };
}

export interface ShotParams<TDecisions, TSlots extends AnySlots> {
  id?: string;
  name?: string;
  decisions?: TDecisions;
  slots?: SlotsInput<TSlots>;
}

/**
 * Defines a shot: its slots, the decisions it leaves open, and how it is composed from stage
 * helpers and behaviors. The result is a function from decisions and content to a document, with
 * `describe()` for an agent to read first.
 */
export function defineShot<TDecisions extends StageDecisions, TSlots extends AnySlots>(
  def: ShotDefinition<TDecisions, TSlots>
) {
  const build = (params: ShotParams<TDecisions, TSlots> = {}): Shot => {
    const decisions = (params.decisions ?? {}) as TDecisions;
    const given: Record<string, unknown> = { ...(def.defaults?.(decisions) ?? {}) };
    for (const [key, value] of Object.entries(params.slots ?? {})) {
      if (value !== undefined) given[key] = value;
    }
    const resolved: Record<string, unknown> = {};
    for (const [key, spec] of Object.entries(def.slots)) {
      const value = given[key];
      if (spec.cardinality === "many") {
        const items = Array.isArray(value) ? value : [];
        if (items.length < (spec.min ?? 0)) {
          throw new Error(
            `[${def.name}] Slot "${key}" takes at least ${spec.min} item(s) and got ${items.length}. ${spec.describe}`
          );
        }
        resolved[key] = items;
      } else {
        if (spec.required && value == null) {
          throw new Error(`[${def.name}] Slot "${key}" is required. ${spec.describe}`);
        }
        resolved[key] = value ?? undefined;
      }
    }

    const fps = Math.max(12, Math.round(decisions.fps ?? def.stage.fps));
    const durationSec = decisions.durationSec ?? def.stage.durationSec;
    const score = new Score(def.name, {
      width: decisions.width ?? def.stage.width,
      height: decisions.height ?? def.stage.height,
      fps,
      durationFrames: Math.max(2, Math.round(durationSec * fps)),
    });
    def.compose(score, { decisions, slots: resolved as SlotsResolved<TSlots> });

    const id = params.id ?? `${def.name.replace(/[^a-zA-Z0-9]+/g, "_")}_shot`;
    const ir = score.toDocument(id, params.name ?? def.name);
    return {
      shot: def.name,
      ir,
      snapshot: (frame) => snapshot(ir, frame),
      audit: () => auditMotion(ir),
      handoff: ir.score.handoff,
    };
  };

  const describe = (): string => {
    const lines = [`${def.name}`, "", def.intent, "", "Slots"];
    for (const [key, spec] of Object.entries(def.slots)) {
      const count = spec.cardinality === "many" ? `${spec.min ?? 0} or more` : spec.required ? "one" : "one, optional";
      lines.push(`- ${key} (${count}; ${spec.role}, ${spec.plane}): ${spec.describe}`);
    }
    lines.push("", "Decisions");
    for (const [key, text] of Object.entries(def.decisions)) lines.push(`- ${key}: ${text}`);
    lines.push("", "When the content changes");
    def.whenContentChanges.forEach((text, i) => lines.push(`${i + 1}. ${text}`));
    return lines.join("\n");
  };

  return Object.assign(build, {
    shotName: def.name,
    intent: def.intent,
    slots: def.slots,
    decisions: def.decisions,
    whenContentChanges: def.whenContentChanges,
    describe,
  });
}
