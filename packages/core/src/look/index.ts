import type { FontMetrics } from "../kernel/geometry.ts";
import type { FillSpec } from "../kernel/ir.ts";
import { geist420, geist500 } from "./geist-metrics.ts";

export type MaterialName = "primary" | "fresh" | "warm";

export interface Material {
  /** The colour as a flat fill. */
  flat: string;
  /** The same colour as a lit surface. */
  lit: FillSpec;
  /** How it shows where it sits inside the primary colour. */
  through?: FillSpec;
}

/**
 * What things look like, apart from how they move. Materials are named by their part in the
 * palette, never by the object that wears them, so a look fits any shot.
 */
export interface Look {
  id: string;
  name: string;
  surface: string;
  ink: string;
  /** A colour for large quiet areas behind text. It must hold the ink: check it against 3:1. */
  backdrop: string;
  type: {
    family: string;
    weight: number;
    /** Resting letter-spacing in em. */
    trackingEm: number;
    /** The font's own spacing at this weight. Shots that set words side by side need it. */
    metrics?: FontMetrics;
  };
  materials: Record<MaterialName, Material>;
}

export function lit(look: Look, material: MaterialName): FillSpec {
  return look.materials[material].lit;
}

export function flat(look: Look, material: MaterialName): FillSpec {
  return { kind: "solid", color: look.materials[material].flat };
}

/** A linear material turned to another angle, for two objects that should not look stamped alike. */
export function turned(fill: FillSpec, angleDeg: number, reverse = false): FillSpec {
  if (fill.kind !== "linear") return fill;
  const stops = reverse
    ? [...fill.stops].reverse().map((s) => ({ offset: Math.round((1 - s.offset) * 100) / 100, color: s.color }))
    : fill.stops;
  return { kind: "linear", angleDeg, stops };
}

const litSphere = { x: -0.14, y: -0.22, width: 0.92, height: 0.92 };
const litFacet = { x: 0.14, y: 0.22, width: 0.72, height: 0.72 };

export const gleanEditorial: Look = {
  id: "glean-editorial",
  name: "Glean warm editorial",
  surface: "#F7F2EB",
  ink: "#000000",
  backdrop: "#DCFC5E",
  type: { family: "Geist", weight: 420, trackingEm: -0.0215, metrics: geist420 },
  materials: {
    primary: {
      flat: "#333CEE",
      lit: {
        kind: "radial",
        domain: litSphere,
        stops: [
          { offset: 0, color: "#435CFF" },
          { offset: 0.55, color: "#2A37E6" },
          { offset: 1, color: "#1C24CC" },
        ],
      },
    },
    fresh: {
      flat: "#DCFC5E",
      lit: {
        kind: "radial",
        domain: litFacet,
        stops: [
          { offset: 0, color: "#DBFD49" },
          { offset: 0.45, color: "#C6F384" },
          { offset: 1, color: "#B3E8CF" },
        ],
      },
      through: {
        kind: "linear",
        angleDeg: 265,
        stops: [
          { offset: 0, color: "#BBE954" },
          { offset: 0.5, color: "#8EE151" },
          { offset: 1, color: "#62D34D" },
        ],
      },
    },
    warm: {
      flat: "#FFA488",
      lit: {
        kind: "linear",
        angleDeg: 35,
        stops: [
          { offset: 0, color: "#B7D3EB" },
          { offset: 0.48, color: "#DEC8C4" },
          { offset: 1, color: "#FFA488" },
        ],
      },
      through: {
        kind: "linear",
        angleDeg: 235,
        stops: [
          { offset: 0, color: "#DDF05B" },
          { offset: 0.65, color: "#CCEE57" },
          { offset: 1, color: "#B3E853" },
        ],
      },
    },
  },
};

export const veridianNoir: Look = {
  id: "veridian-noir",
  name: "Veridian obsidian and coral",
  surface: "#0E131F",
  ink: "#F6F8FC",
  backdrop: "#0B5E57",
  type: { family: "Geist", weight: 500, trackingEm: -0.0215, metrics: geist500 },
  materials: {
    primary: {
      flat: "#00D4B2",
      lit: {
        kind: "radial",
        domain: litSphere,
        stops: [
          { offset: 0, color: "#3DF5D4" },
          { offset: 0.55, color: "#00B89C" },
          { offset: 1, color: "#007A6E" },
        ],
      },
    },
    fresh: {
      flat: "#3BF5C8",
      lit: {
        kind: "radial",
        domain: litFacet,
        stops: [
          { offset: 0, color: "#80FFDB" },
          { offset: 0.5, color: "#5390D9" },
          { offset: 1, color: "#6930C3" },
        ],
      },
      through: {
        kind: "linear",
        angleDeg: 265,
        stops: [
          { offset: 0, color: "#FFE66D" },
          { offset: 0.5, color: "#A8FF78" },
          { offset: 1, color: "#3BF5C8" },
        ],
      },
    },
    warm: {
      flat: "#FF7A59",
      lit: {
        kind: "linear",
        angleDeg: 35,
        stops: [
          { offset: 0, color: "#FFD166" },
          { offset: 0.5, color: "#FF926B" },
          { offset: 1, color: "#FF5E7E" },
        ],
      },
      through: {
        kind: "linear",
        angleDeg: 235,
        stops: [
          { offset: 0, color: "#FFFDF7" },
          { offset: 0.6, color: "#B8FFF1" },
          { offset: 1, color: "#5CE6CC" },
        ],
      },
    },
  },
};
