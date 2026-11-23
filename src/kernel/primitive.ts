import {
  auditMotion,
  snapshotMotion,
  type MotionAuditReport,
  type SlotSnapshotEntry,
} from "./inspect.ts";
import type { MotionDocument } from "./ir.ts";

export type SlotCardinality = "single" | "collection";

export interface SlotSpec<
  TItem,
  TCard extends SlotCardinality = SlotCardinality,
> {
  cardinality: TCard;
  required?: boolean;
  minItems?: number;
  description: string;
  _phantom?: TItem;
}

export function slot<TItem, const TCard extends SlotCardinality>(
  spec: Omit<SlotSpec<TItem, TCard>, "_phantom">
): SlotSpec<TItem, TCard> {
  return spec;
}

export type InferSlotsInput<TSlots extends Record<string, SlotSpec<any, any>>> = {
  [K in keyof TSlots]?: TSlots[K] extends SlotSpec<infer U, infer C>
    ? C extends "collection"
      ? U[]
      : U
    : never;
};

export type InferResolvedSlots<TSlots extends Record<string, SlotSpec<any, any>>> = {
  [K in keyof TSlots]: TSlots[K] extends SlotSpec<infer U, infer C>
    ? C extends "collection"
      ? U[]
      : U | undefined
    : never;
};

export interface AgentMeta {
  intent: string;
  actions: string[];
  invariants: string[];
  adaptableAxes: string[];
}

export interface ShotPrimitiveDefinition<
  TOptions extends object,
  TSlots extends Record<string, SlotSpec<any, any>>,
> {
  name: string;
  description: string;
  slots: TSlots;
  defaultSlots?: Partial<InferSlotsInput<TSlots>>;
  compose: (args: {
    id: string;
    name: string;
    options: TOptions;
    slots: InferResolvedSlots<TSlots>;
  }) => MotionDocument;
  agent: AgentMeta;
}

export interface CompiledShotInstance {
  readonly primitiveName: string;
  readonly ir: MotionDocument;
  snapshot: (frame: number) => SlotSnapshotEntry[];
  audit: () => MotionAuditReport;
}

/**
 * Mirrors `@ui-sdk/core`'s `definePrimitive`: binds options, variable-cardinality slots,
 * composed L1 behaviors, and agent inspection metadata into a target-agnostic blueprint.
 */
export function defineShotPrimitive<
  TOptions extends object,
  TSlots extends Record<string, SlotSpec<any, any>>,
>(def: ShotPrimitiveDefinition<TOptions, TSlots>) {
  const instantiate = (params: {
    id?: string;
    name?: string;
    options: TOptions;
    slots?: InferSlotsInput<TSlots>;
  }): CompiledShotInstance => {
    const mergedSlots: Record<string, any> = {
      ...(def.defaultSlots ?? {}),
      ...(params.slots ?? {}),
    };

    for (const [slotKey, spec] of Object.entries(def.slots)) {
      const val = mergedSlots[slotKey];
      if (spec.required && (val === undefined || val === null)) {
        throw new Error(
          `[${def.name}] Required slot "${slotKey}" is missing (${spec.description})`
        );
      }
      if (spec.cardinality === "collection") {
        if (!Array.isArray(val)) {
          mergedSlots[slotKey] = [];
        }
        const arr = mergedSlots[slotKey] as unknown[];
        if (spec.minItems !== undefined && arr.length < spec.minItems) {
          throw new Error(
            `[${def.name}] Collection slot "${slotKey}" requires at least ${spec.minItems} item(s), got ${arr.length}`
          );
        }
      }
    }

    const ir = def.compose({
      id: params.id ?? `${def.name}_project`,
      name: params.name ?? def.description,
      options: params.options,
      slots: mergedSlots as InferResolvedSlots<TSlots>,
    });

    return {
      primitiveName: def.name,
      ir,
      snapshot: (frame: number) => snapshotMotion(ir, frame),
      audit: () => auditMotion(ir),
    };
  };

  return Object.assign(instantiate, {
    primitiveName: def.name,
    description: def.description,
    slots: def.slots,
    agent: def.agent,
  });
}
