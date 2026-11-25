import { respond } from "../../behaviors/respond.ts";
import type { Feel } from "../../feel/index.ts";
import { ease, linear, type EasingSpec } from "../../kernel/easing.ts";
import type { BBox, CueIR, ScalarKey } from "../../kernel/ir.ts";
import type { Score } from "../../kernel/score.ts";
import { CHEVRON_RIBBON_SKSL } from "./ribbon-sksl.ts";

const SHADER_ID = "chevron_ribbon";
const PLACEMENT_ID = "fill_chevron_ribbon";

/** The ribbon on a 2D canvas, for targets without SkSL. Same picture, same parameters. */
export const CHEVRON_RIBBON_CANVAS = `ctx.clearRect(0, 0, width, height);
var R = params.pillarSize * 0.70710678, theta = params.spinAngle * 0.0174532925;
var verts = [0.78539816, 2.35619449, 3.92699082, 5.49778714].map(function (a) {
  return { x: R * Math.sin(theta + a), y: R * Math.cos(theta + a) };
});
var xs = verts.map(function (v) { return v.x; });
var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
var hex = String(params.color).replace("#", "");
var rgb = parseInt(hex.slice(0, 2), 16) + "," + parseInt(hex.slice(2, 4), 16) + "," + parseInt(hex.slice(4, 6), 16);
var cx = width / 2, cy = height / 2, fade = Math.max(1, params.fadeHeight);
for (var px = Math.max(0, Math.floor(cx + xMin)); px <= Math.min(width - 1, Math.ceil(cx + xMax)); px++) {
  var x = px - cx, z = -1e6;
  for (var e = 0; e < 4; e++) {
    var a = verts[e], b = verts[(e + 1) % 4], lo = Math.min(a.x, b.x), hi = Math.max(a.x, b.x);
    if (hi - lo > 0.001 && x >= lo - 0.5 && x <= hi + 0.5) {
      var t = Math.max(0, Math.min(1, (x - a.x) / (b.x - a.x)));
      z = Math.max(z, a.y + (b.y - a.y) * t);
    }
  }
  var inner = Math.max(3, params.baseHalfGap - params.chevronSlope * z);
  var up = ctx.createLinearGradient(0, cy - inner, 0, cy - inner - fade);
  up.addColorStop(0, "rgba(" + rgb + ",1)"); up.addColorStop(1, "rgba(" + rgb + ",0)");
  ctx.fillStyle = up; ctx.fillRect(px, cy - inner - fade, 1, fade);
  var down = ctx.createLinearGradient(0, cy + inner, 0, cy + inner + fade);
  down.addColorStop(0, "rgba(" + rgb + ",1)"); down.addColorStop(1, "rgba(" + rgb + ",0)");
  ctx.fillStyle = down; ctx.fillRect(px, cy + inner, 1, fade);
}`;

/** Degrees per second the ribbon turns, shared out over the cues like the world's own turn. */
const TURN_RATE = -160;

/**
 * This shot's backdrop: a square pillar seen edge-on, turning behind the statement, open in the
 * middle where the text sits. It is this atom's own picture, so it lives here; what it does on
 * each cue is the shared `respond` behavior, the same rule that turns the world ring.
 */
export function ribbon(
  score: Score,
  opts: {
    parentId: string;
    color: string;
    /** The statement's bounds. The opening in the ribbon is sized to them. */
    statement: BBox;
    cues: CueIR[];
    /** The cue the ribbon pinches on: the one before the accent, so the accent opens it out. */
    pinch: CueIR;
    settle: CueIR;
    feel: Feel;
    gapSec: (index: number) => number;
    end: number;
    layer: number;
  }
): void {
  const { width, height } = score.format;
  const boxW = Math.round(score.du(360));
  const boxH = Math.round(height * 0.9444);
  const pillar = Math.round(score.du(161));
  const gap = Math.round(Math.max(height * 0.12, Math.min(height * 0.2, opts.statement.height * 0.335)));
  const fade = Math.round(height * 0.403);
  const number = (id: string, label: string, value: number, min: number, max: number, unit?: string) => ({
    id,
    label,
    type: "number" as const,
    uniformName: `p_${id}`,
    defaultValue: value,
    min,
    max,
    step: id === "chevronSlope" ? 0.01 : 1,
    unit,
  });

  score.shaders.push({
    id: SHADER_ID,
    version: 1,
    name: "Spinning chevron ribbon",
    description: "A turning square pillar seen edge-on, open in the middle, fading up and down",
    cost: "light",
    sksl: CHEVRON_RIBBON_SKSL,
    canvas2d: CHEVRON_RIBBON_CANVAS,
    properties: [
      number("spinAngle", "Spin angle", -222, -1440, 360, "deg"),
      number("pillarSize", "Pillar width", pillar, 20, 640, "px"),
      number("baseHalfGap", "Half gap", gap, 10, 480, "px"),
      number("chevronSlope", "Chevron slope", 0.86, 0, 2),
      number("fadeHeight", "Fade height", fade, 20, 1200, "px"),
      { id: "color", label: "Ribbon colour", type: "color", uniformName: "p_limeColor", defaultValue: opts.color },
    ],
  });

  const node = score.add({
    id: score.id("backdrop_ribbon"),
    kind: "shape",
    name: "Backdrop ribbon",
    slot: "backdrop",
    role: "ambient",
    plane: "backdrop",
    parentId: opts.parentId,
    layer: opts.layer,
    base: { x: Math.round((width - boxW) / 2), y: Math.round((height - boxH) / 2), width: boxW, height: boxH },
    shape: "rectangle",
    fill: {
      kind: "shader",
      shaderId: SHADER_ID,
      placementId: PLACEMENT_ID,
      params: { spinAngle: -20, pillarSize: pillar, baseHalfGap: gap, chevronSlope: 0.86, fadeHeight: fade, color: opts.color },
    },
  });

  respond(
    score,
    node.id,
    { property: "shader", param: "spinAngle", shaderId: SHADER_ID, placementId: PLACEMENT_ID },
    {
      feel: opts.feel,
      from: -20,
      start: 0,
      end: opts.end,
      id: "act_ribbon_spin",
      name: "Ribbon snaps round on each arrival",
      answers: opts.cues.map((cue, i) => {
        const opening = cue.frame === 0;
        return {
          cue,
          amount: TURN_RATE * Math.min(opts.gapSec(i), 0.6) * cue.weight * (opening ? 0.45 : 1),
          windUpSec: 0.27,
          releaseSec: opening ? 0.33 : 0.25,
          anticipate: 0.48,
          drift: 0.08,
          easeOut: opening ? ease("easeOutQuad") : ease("easeOutQuart"),
        };
      }),
    }
  );

  // The body breathes once: it narrows into the pinch cue and opens out of it, then stands.
  const last = opts.end - 1;
  const p = opts.pinch.frame;
  const s = Math.max(p + 2, Math.min(last - 1, opts.settle.frame));
  const f = (sec: number) => score.frames(sec);
  const track = (name: string, points: [number, number, EasingSpec?][]): ScalarKey[] => {
    const keys: ScalarKey[] = [];
    for (const [frame, value, easing] of points) {
      const at = Math.max(0, Math.min(last, frame));
      if (keys.length && at <= keys[keys.length - 1]!.frame) continue;
      keys.push({ id: `act_ribbon_body_${name}_k${keys.length}`, frame: at, value: Math.round(value), easing: easing ?? linear });
    }
    delete keys[keys.length - 1]!.easing;
    return keys;
  };
  const opens = p === 0;
  score.track({
    kind: "shaderParams",
    id: score.id("act_ribbon_body"),
    name: "Ribbon narrows and opens",
    targetId: node.id,
    shaderId: SHADER_ID,
    placementId: PLACEMENT_ID,
    startFrame: 0,
    durationFrames: opts.end,
    reason: { purpose: "respond", cues: [opts.pinch.name], lands: "start" },
    tracks: {
      pillarSize: opens
        ? track("pillar", [[0, pillar * 0.55, ease("easeOutCubic")], [f(0.2), pillar * 0.94], [s, pillar], [last, pillar]])
        : track("pillar", [
            [0, pillar * 0.78],
            [p - f(0.1), pillar * 0.73, ease("easeInQuad")],
            [p, pillar * 0.55, ease("easeOutCubic")],
            [p + f(0.2), pillar * 0.94],
            [s, pillar],
            [last, pillar],
          ]),
      baseHalfGap: track("gap", [
        [0, gap + score.du(8)],
        [p - 1, gap + score.du(4)],
        [p, gap - score.du(4), ease("easeOutQuad")],
        [p + f(0.23), gap + score.du(2)],
        [s, gap],
        [last, gap],
      ]),
      fadeHeight: track("fade", [
        [0, fade * 0.53, ease("easeOutQuad")],
        [Math.max(1, p - 1), fade * 0.74],
        [p + f(0.23), fade * 0.91],
        [s + f(0.3), fade * 1.05],
        [last, fade * 1.05],
      ]),
    },
  });
}
