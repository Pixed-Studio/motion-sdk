import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const IR_DOCUMENT = {
  "id": "lead_and_rest",
  "name": "A lead word, then the rest",
  "format": {
    "width": 1280,
    "height": 720,
    "fps": 30,
    "durationFrames": 51
  },
  "scene": {
    "id": "lead_and_rest__scene-1",
    "name": "Word by word",
    "durationFrames": 51,
    "backgroundColor": "#F7F2EB"
  },
  "shaders": [],
  "nodes": [
    {
      "id": "phrase",
      "kind": "frame",
      "name": "Phrase",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "layer": 10,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720,
        "originX": 0.5,
        "originY": 0.5006944444444444
      }
    },
    {
      "id": "line_1",
      "kind": "frame",
      "name": "Line 1",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "phrase",
      "layer": 1,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "arrival_1",
      "kind": "frame",
      "name": "Into",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "line_1",
      "layer": 1,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720,
        "originX": 0.27284375,
        "originY": 0.5006944444444444
      }
    },
    {
      "id": "w_into",
      "kind": "text",
      "name": "Into",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_1",
      "layer": 1,
      "base": {
        "x": 296.99,
        "y": 321,
        "width": 104.5,
        "height": 79
      },
      "text": "Into",
      "fontFamily": "Geist",
      "fontSize": 61,
      "fontWeight": 420,
      "letterSpacing": -1.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "arrival_2",
      "kind": "frame",
      "name": "a complete floor plan",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "line_1",
      "layer": 2,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720,
        "originX": 0.54573828125,
        "originY": 0.5006944444444444
      }
    },
    {
      "id": "w_a",
      "kind": "text",
      "name": "a",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 1,
      "base": {
        "x": 414.08,
        "y": 321,
        "width": 33.79,
        "height": 79
      },
      "text": "a",
      "fontFamily": "Geist",
      "fontSize": 61,
      "fontWeight": 420,
      "letterSpacing": -1.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "w_complete",
      "kind": "text",
      "name": "complete",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 2,
      "base": {
        "x": 460.46,
        "y": 321,
        "width": 253.14,
        "height": 79
      },
      "text": "complete",
      "fontFamily": "Geist",
      "fontSize": 61,
      "fontWeight": 420,
      "letterSpacing": -1.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "w_floor_plan",
      "kind": "text",
      "name": "floor plan",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 3,
      "base": {
        "x": 726.19,
        "y": 321,
        "width": 256.82,
        "height": 79
      },
      "text": "floor plan",
      "fontFamily": "Geist",
      "fontSize": 61,
      "fontWeight": 420,
      "letterSpacing": -1.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#333CEE"
      }
    }
  ],
  "masks": [],
  "motions": [
    {
      "kind": "scalar",
      "id": "act_w_into_in",
      "name": "Into appears",
      "targetId": "w_into",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 0,
      "durationFrames": 3,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-1"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_into_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_into_in_k1",
          "frame": 2,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_into_focus",
      "name": "Into comes into focus",
      "targetId": "w_into",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 3,
      "baseValue": 0,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-1"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_into_focus_k0",
          "frame": 0,
          "value": 9,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_into_focus_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_a_in",
      "name": "a appears",
      "targetId": "w_a",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 17,
      "durationFrames": 3,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_a_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_a_in_k1",
          "frame": 2,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_a_focus",
      "name": "a comes into focus",
      "targetId": "w_a",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 17,
      "durationFrames": 3,
      "baseValue": 0,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_a_focus_k0",
          "frame": 0,
          "value": 9,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_a_focus_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_complete_in",
      "name": "complete appears",
      "targetId": "w_complete",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 19,
      "durationFrames": 3,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_complete_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_complete_in_k1",
          "frame": 2,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_complete_focus",
      "name": "complete comes into focus",
      "targetId": "w_complete",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 19,
      "durationFrames": 3,
      "baseValue": 0,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_complete_focus_k0",
          "frame": 0,
          "value": 9,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_complete_focus_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_floor_plan_in",
      "name": "floor plan appears",
      "targetId": "w_floor_plan",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 21,
      "durationFrames": 3,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_floor_plan_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_floor_plan_in_k1",
          "frame": 2,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_floor_plan_focus",
      "name": "floor plan comes into focus",
      "targetId": "w_floor_plan",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 21,
      "durationFrames": 3,
      "baseValue": 0,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_floor_plan_focus_k0",
          "frame": 0,
          "value": 9,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_floor_plan_focus_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_arrival_1_punch",
      "name": "Into lands large and settles",
      "targetId": "arrival_1",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 16,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-1"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_arrival_1_punch_k0",
          "frame": 0,
          "x": 3.6,
          "y": 3.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_arrival_1_punch_k1",
          "frame": 15,
          "x": 1,
          "y": 1
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_line_1_room",
      "name": "Line 1 makes room",
      "targetId": "line_1",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 25,
      "reason": {
        "purpose": "keep",
        "cues": [
          "arrival-1",
          "arrival-2"
        ]
      },
      "keys": [
        {
          "id": "act_line_1_room_k0",
          "frame": 0,
          "x": 290.76,
          "y": 0
        },
        {
          "id": "act_line_1_room_k1",
          "frame": 17,
          "x": 290.76,
          "y": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_line_1_room_k2",
          "frame": 19,
          "x": 267.57,
          "y": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_line_1_room_k3",
          "frame": 21,
          "x": 134.71,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_line_1_room_k4",
          "frame": 24,
          "x": 0,
          "y": 0
        }
      ]
    }
  ],
  "score": {
    "shot": "word-by-word",
    "cues": [
      {
        "name": "arrival-1",
        "frame": 0,
        "kind": "accent",
        "weight": 1.15,
        "why": "The arrival the phrase builds to. It keeps the stage longest and the world answers it hardest."
      },
      {
        "name": "arrival-2",
        "frame": 17,
        "kind": "beat",
        "weight": 0.9,
        "why": "An arrival."
      }
    ],
    "subjects": [
      {
        "nodeId": "w_into",
        "cue": "arrival-1",
        "needsSec": 0.48,
        "untilFrame": 51,
        "accent": true
      },
      {
        "nodeId": "w_a",
        "cue": "arrival-2",
        "needsSec": 0.85,
        "untilFrame": 51,
        "accent": false
      },
      {
        "nodeId": "w_complete",
        "cue": "arrival-2",
        "needsSec": 0.85,
        "untilFrame": 51,
        "accent": false
      },
      {
        "nodeId": "w_floor_plan",
        "cue": "arrival-2",
        "needsSec": 0.85,
        "untilFrame": 51,
        "accent": false
      }
    ],
    "claimFrames": 9,
    "regions": {
      "phrase": {
        "x": 297,
        "y": 321,
        "width": 686,
        "height": 79
      }
    },
    "safeArea": {
      "x": 102,
      "y": 65,
      "width": 1076,
      "height": 590
    },
    "invariants": [],
    "handoff": {
      "entry": {
        "frame": 0,
        "nodeId": "w_into",
        "position": {
          "x": 640,
          "y": 360.5
        },
        "velocity": {
          "x": 0,
          "y": 0
        },
        "size": 376,
        "color": "#000000"
      },
      "exit": {
        "frame": 50,
        "nodeId": "w_floor_plan",
        "position": {
          "x": 854.6,
          "y": 360.5
        },
        "velocity": {
          "x": 0,
          "y": 0
        },
        "size": 257,
        "color": "#333CEE"
      }
    },
    "notes": []
  }
} as const;
const LIVES: Record<string, { start: number; end: number }> = {"phrase":{"start":0,"end":51},"line_1":{"start":0,"end":51},"arrival_1":{"start":0,"end":51},"w_into":{"start":0,"end":51},"arrival_2":{"start":0,"end":51},"w_a":{"start":17,"end":51},"w_complete":{"start":19,"end":51},"w_floor_plan":{"start":21,"end":51}};
const SVG_PATHS: Record<string, string> = {};

function solveBezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const cx = (t: number) => ((1 - 3 * x2 + 3 * x1) * t * t * t) + ((3 * x2 - 6 * x1) * t * t) + (3 * x1 * t);
  const cy = (t: number) => ((1 - 3 * y2 + 3 * y1) * t * t * t) + ((3 * y2 - 6 * y1) * t * t) + (3 * y1 * t);
  let lo = 0, hi = 1, t = x;
  for (let i = 0; i < 16; i++) {
    const v = cx(t);
    if (Math.abs(v - x) < 1e-5) break;
    if (x > v) lo = t; else hi = t;
    t = 0.5 * (lo + hi);
  }
  return cy(t);
}

function easeValue(spec: any, rawT: number): number {
  const t = Math.max(0, Math.min(1, rawT));
  if (!spec || spec.kind === "linear") return t;
  if (spec.kind === "hold") return t >= 1 ? 1 : 0;
  if (spec.kind === "cubicBezier") return solveBezier(spec.x1, spec.y1, spec.x2, spec.y2, t);
  switch (spec.preset) {
    case "easeInQuad": return t * t;
    case "easeOutQuad": return 1 - (1 - t) * (1 - t);
    case "easeInOutQuad": return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case "easeInCubic": return t * t * t;
    case "easeOutCubic": return 1 - Math.pow(1 - t, 3);
    case "easeOutQuart": return 1 - Math.pow(1 - t, 4);
    case "easeInSine": return 1 - Math.cos((t * Math.PI) / 2);
    case "easeOutSine": return Math.sin((t * Math.PI) / 2);
    case "easeInOutSine": return -(Math.cos(Math.PI * t) - 1) / 2;
    default: return t;
  }
}

function sampleScalar(keys: readonly any[], localF: number, fallback: number): number {
  if (!keys.length) return fallback;
  if (localF <= keys[0].frame) return keys[0].value;
  const last = keys[keys.length - 1];
  if (localF >= last.frame) return last.value;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (localF >= a.frame && localF <= b.frame) {
      const u = easeValue(a.easing, (localF - a.frame) / Math.max(1e-6, b.frame - a.frame));
      return a.value + (b.value - a.value) * u;
    }
  }
  return last.value;
}

function sampleVec2(keys: readonly any[], localF: number, fallback: { x: number; y: number }) {
  if (!keys.length) return fallback;
  if (localF <= keys[0].frame) return { x: keys[0].x, y: keys[0].y };
  const last = keys[keys.length - 1];
  if (localF >= last.frame) return { x: last.x, y: last.y };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (localF >= a.frame && localF <= b.frame) {
      const u = easeValue(a.easing, (localF - a.frame) / Math.max(1e-6, b.frame - a.frame));
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
    }
  }
  return { x: last.x, y: last.y };
}

export const LeadAndRestMetadata = {
  id: "lead_and_rest",
  width: 1280,
  height: 720,
  fps: 30,
  durationInFrames: 51,
};

export const LeadAndRest: React.FC = () => {
  const frame = useCurrentFrame();

  const guideTables = useMemo(() => {
    const map = new Map<string, { pts: { x: number; y: number; len: number }[]; total: number }>();
    for (const n of IR_DOCUMENT.nodes as readonly any[]) {
      if (n.kind === "path" && n.role === "guide") {
        const vMap = new Map<string, any>(n.network.vertices.map((v: any) => [v.id, v]));
        const pts: { x: number; y: number; len: number }[] = [];
        let total = 0;
        n.network.segments.forEach((seg: any, sIdx: number) => {
          const p0 = vMap.get(seg.startVertexId)!;
          const p3 = vMap.get(seg.endVertexId)!;
          const ts = seg.tangentStart ?? { x: 0, y: 0 };
          const te = seg.tangentEnd ?? { x: 0, y: 0 };
          const p1 = { x: p0.x + ts.x, y: p0.y + ts.y };
          const p2 = { x: p3.x + te.x, y: p3.y + te.y };
          for (let k = sIdx === 0 ? 0 : 1; k <= 24; k++) {
            const t = k / 24, mt = 1 - t;
            const x = mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x;
            const y = mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y;
            if (pts.length) {
              const prev = pts[pts.length - 1]!;
              total += Math.hypot(n.base.x + x - prev.x, n.base.y + y - prev.y);
            }
            pts.push({ x: n.base.x + x, y: n.base.y + y, len: total });
          }
        });
        map.set(n.id, { pts, total });
      }
    }
    return map;
  }, []);

  const evalNodeTransform = (node: any) => {
    const life = LIVES[node.id as string]!;
    const inRange = frame >= life.start && frame < life.end;
    let x = node.base.x as number;
    let y = node.base.y as number;
    let rot = (node.base.rotation ?? 0) as number;
    let op = (node.base.opacity ?? 1) as number;
    let blur = (node.base.blur ?? 0) as number;
    let sx = 1, sy = 1;
    let letterSpacing = node.kind === "text" ? (node.letterSpacing as number) : 0;
    let followed: { x: number; y: number } | null = null;

    for (const m of IR_DOCUMENT.motions as readonly any[]) {
      if (m.targetId !== node.id || frame < m.startFrame) continue;
      const lf = Math.min(frame - m.startFrame, Math.max(0, m.durationFrames - 1));
      if (m.kind === "scalar") {
        const v = sampleScalar(m.keys, lf, m.baseValue ?? 0);
        if (m.property === "opacity") op = m.mode === "set" ? v : op + v;
        else if (m.property === "layerBlur") blur = m.mode === "set" ? v : blur + v;
        else if (m.property === "rotation") rot = m.mode === "set" ? v : rot + v;
        else if (m.property === "letterSpacing") letterSpacing = v;
      } else if (m.kind === "vec2") {
        const v = sampleVec2(m.keys, lf, m.mode === "multiply" ? { x: 1, y: 1 } : { x: 0, y: 0 });
        if (m.property === "move") { x += v.x; y += v.y; }
        else if (m.property === "scale") { sx *= v.x; sy *= v.y; }
      } else if (m.kind === "followPath") {
        const g = guideTables.get(m.guidePathId);
        if (g && g.pts.length) {
          const u = easeValue(m.progressEasing, m.durationFrames <= 1 ? 1 : lf / (m.durationFrames - 1));
          const target = Math.max(0, Math.min(1, u)) * g.total;
          followed = g.pts[g.pts.length - 1]!;
          for (let i = 0; i < g.pts.length - 1; i++) {
            if (target >= g.pts[i]!.len && target <= g.pts[i + 1]!.len) {
              const f = (target - g.pts[i]!.len) / Math.max(1e-6, g.pts[i + 1]!.len - g.pts[i]!.len);
              followed = {
                x: g.pts[i]!.x + (g.pts[i + 1]!.x - g.pts[i]!.x) * f,
                y: g.pts[i]!.y + (g.pts[i + 1]!.y - g.pts[i]!.y) * f,
              };
              break;
            }
          }
        }
      }
    }

    const ox = node.base.width * (node.base.originX ?? 0.5);
    const oy = node.base.height * (node.base.originY ?? 0.5);
    const tx = followed ? followed.x - ox : x;
    const ty = followed ? followed.y - oy : y;
    const transform = `translate(${tx.toFixed(2)},${ty.toFixed(2)}) translate(${ox.toFixed(2)},${oy.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${sx.toFixed(4)},${sy.toFixed(4)}) translate(${(-ox).toFixed(2)},${(-oy).toFixed(2)})`;
    return { inRange, transform, opacity: Math.max(0, Math.min(1, op)), blur, letterSpacing };
  };

  const nodes = IR_DOCUMENT.nodes as readonly any[];
  const masks = IR_DOCUMENT.masks as readonly any[];
  const maskSourceIds = new Set(masks.map((m) => m.sourceObjectId));
  const clipByTarget = new Map(masks.map((m) => [m.targetObjectId, `clip_${m.id}`]));

  const renderSubtree = (parentId?: string): React.ReactNode => {
    return nodes
      .filter((n) => n.parentId === parentId && n.role !== "guide" && !maskSourceIds.has(n.id))
      .sort((a, b) => a.layer - b.layer)
      .map((n) => {
        const st = evalNodeTransform(n);
        if (!st.inRange) return null;
        const clipPath = clipByTarget.has(n.id) ? `url(#${clipByTarget.get(n.id)})` : undefined;
        const style: React.CSSProperties = {
          opacity: st.opacity,
          filter: st.blur > 0.2 ? `blur(${st.blur.toFixed(1)}px)` : undefined,
        };
        if (n.kind === "frame") {
          return (
            <g key={n.id} data-slot={n.slot} clipPath={clipPath}>
              <g transform={st.transform} style={style}>{renderSubtree(n.id)}</g>
            </g>
          );
        }
        if (n.kind === "text") {
          return (
            <g key={n.id} data-slot={n.slot} clipPath={clipPath}>
              <text
                transform={st.transform}
                x={n.base.width / 2}
                y={Math.round(n.fontSize * 0.92)}
                textAnchor="middle"
                fill={n.fill.color}
                fontFamily={`${n.fontFamily}, system-ui, sans-serif`}
                fontSize={n.fontSize}
                fontWeight={n.fontWeight}
                style={{ ...style, letterSpacing: `${st.letterSpacing.toFixed(2)}px` }}
              >
                {n.text}
              </text>
            </g>
          );
        }
        const fillRef = n.fill.kind === "solid" ? n.fill.color : n.fill.kind === "linear" || n.fill.kind === "radial" ? `url(#grad_${n.id})` : "transparent";
        if (n.kind === "shape") {
          return (
            <g key={n.id} data-slot={n.slot} clipPath={clipPath}>
              <g transform={st.transform} style={style}>
                {n.shape === "ellipse" ? (
                  <ellipse cx={n.base.width / 2} cy={n.base.height / 2} rx={n.base.width / 2} ry={n.base.height / 2} fill={fillRef} />
                ) : (
                  <rect x={0} y={0} width={n.base.width} height={n.base.height} rx={n.borderRadius ?? 0} fill={fillRef} />
                )}
              </g>
            </g>
          );
        }
        return (
          <g key={n.id} data-slot={n.slot} clipPath={clipPath}>
            <g transform={st.transform} style={style}>
              <path d={SVG_PATHS[n.id]} fill={fillRef} />
            </g>
          </g>
        );
      });
  };

  return (
    <AbsoluteFill style={{ backgroundColor: IR_DOCUMENT.scene.backgroundColor }}>
      <svg viewBox={`0 0 ${IR_DOCUMENT.format.width} ${IR_DOCUMENT.format.height}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          {nodes.map((n) => {
            if (n.fill?.kind === "linear") {
              const rad = ((n.fill.angleDeg - 90) * Math.PI) / 180;
              return (
                <linearGradient key={n.id} id={`grad_${n.id}`} x1={`${(50 - Math.cos(rad) * 50).toFixed(1)}%`} y1={`${(50 - Math.sin(rad) * 50).toFixed(1)}%`} x2={`${(50 + Math.cos(rad) * 50).toFixed(1)}%`} y2={`${(50 + Math.sin(rad) * 50).toFixed(1)}%`}>
                  {n.fill.stops.map((s: any, idx: number) => <stop key={idx} offset={`${s.offset * 100}%`} stopColor={s.color} />)}
                </linearGradient>
              );
            }
            if (n.fill?.kind === "radial") {
              const d = n.fill.domain;
              return (
                <radialGradient key={n.id} id={`grad_${n.id}`} cx={`${((d.x + d.width / 2) * 100).toFixed(1)}%`} cy={`${((d.y + d.height / 2) * 100).toFixed(1)}%`} r={`${((d.width / 2) * 125).toFixed(1)}%`}>
                  {n.fill.stops.map((s: any, idx: number) => <stop key={idx} offset={`${s.offset * 100}%`} stopColor={s.color} />)}
                </radialGradient>
              );
            }
            return null;
          })}
          {masks.map((m) => {
            const src = nodes.find((n) => n.id === m.sourceObjectId);
            if (!src) return null;
            const st = evalNodeTransform(src);
            return (
              <clipPath key={m.id} id={`clip_${m.id}`} clipPathUnits="userSpaceOnUse">
                {src.kind === "shape" && src.shape === "ellipse" ? (
                  <ellipse transform={st.transform} cx={src.base.width / 2} cy={src.base.height / 2} rx={src.base.width / 2} ry={src.base.height / 2} />
                ) : src.kind === "shape" ? (
                  <rect transform={st.transform} x={0} y={0} width={src.base.width} height={src.base.height} rx={src.borderRadius ?? 0} />
                ) : (
                  <path transform={st.transform} d={SVG_PATHS[src.id]} />
                )}
              </clipPath>
            );
          })}
        </defs>
        {renderSubtree(undefined)}
      </svg>
    </AbsoluteFill>
  );
};
