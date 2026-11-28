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
        "originX": 0.48010937499999995,
        "originY": 0.5
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
        "originX": 0.2315859375,
        "originY": 0.5
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
        "x": 234.71,
        "y": 313,
        "width": 123.44,
        "height": 94
      },
      "text": "Into",
      "fontFamily": "Geist",
      "fontSize": 72,
      "fontWeight": 420,
      "letterSpacing": -1.5,
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
        "originX": 0.55405078125,
        "originY": 0.5
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
        "x": 373.08,
        "y": 313,
        "width": 39.89,
        "height": 94
      },
      "text": "a",
      "fontFamily": "Geist",
      "fontSize": 72,
      "fontWeight": 420,
      "letterSpacing": -1.5,
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
        "x": 427.89,
        "y": 313,
        "width": 299.03,
        "height": 94
      },
      "text": "complete",
      "fontFamily": "Geist",
      "fontSize": 72,
      "fontWeight": 420,
      "letterSpacing": -1.5,
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
        "x": 741.85,
        "y": 313,
        "width": 303.44,
        "height": 94
      },
      "text": "floor plan",
      "fontFamily": "Geist",
      "fontSize": 72,
      "fontWeight": 420,
      "letterSpacing": -1.5,
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
      "kind": "vec2",
      "id": "act_phrase_lands",
      "name": "Phrase lands large and settles",
      "targetId": "phrase",
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
        "lands": "start",
        "beat": "hit"
      },
      "keys": [
        {
          "id": "act_phrase_lands_k0",
          "frame": 0,
          "x": 3.452,
          "y": 3.452,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_phrase_lands_k1",
          "frame": 15,
          "x": 1,
          "y": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_into_in",
      "name": "Into appears",
      "targetId": "w_into",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 0,
      "durationFrames": 2,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-1"
        ],
        "lands": "start",
        "beat": "join"
      },
      "keys": [
        {
          "id": "act_w_into_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_into_in_k1",
          "frame": 1,
          "value": 1
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
      "durationFrames": 2,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start",
        "beat": "join"
      },
      "keys": [
        {
          "id": "act_w_a_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_a_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "id": "act_w_a_join",
      "name": "a glides into place",
      "targetId": "w_a",
      "startFrame": 17,
      "durationFrames": 16,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start",
        "beat": "join",
        "why": "a glides into place"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_a_join_k0",
          "frame": 0,
          "x": 92.16,
          "y": 0,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.1,
            "y1": 0.72,
            "x2": 0.56,
            "y2": 1
          }
        },
        {
          "id": "act_w_a_join_k1",
          "frame": 15,
          "x": 0,
          "y": 0
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
      "durationFrames": 2,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start",
        "beat": "join"
      },
      "keys": [
        {
          "id": "act_w_complete_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_complete_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "id": "act_w_complete_join",
      "name": "complete glides into place",
      "targetId": "w_complete",
      "startFrame": 19,
      "durationFrames": 16,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start",
        "beat": "join",
        "why": "complete glides into place"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_complete_join_k0",
          "frame": 0,
          "x": 92.16,
          "y": 0,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.1,
            "y1": 0.72,
            "x2": 0.56,
            "y2": 1
          }
        },
        {
          "id": "act_w_complete_join_k1",
          "frame": 15,
          "x": 0,
          "y": 0
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
      "durationFrames": 2,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start",
        "beat": "join"
      },
      "keys": [
        {
          "id": "act_w_floor_plan_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_floor_plan_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "id": "act_w_floor_plan_join",
      "name": "floor plan glides into place",
      "targetId": "w_floor_plan",
      "startFrame": 21,
      "durationFrames": 16,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start",
        "beat": "join",
        "why": "floor plan glides into place"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_floor_plan_join_k0",
          "frame": 0,
          "x": 92.16,
          "y": 0,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.1,
            "y1": 0.72,
            "x2": 0.56,
            "y2": 1
          }
        },
        {
          "id": "act_w_floor_plan_join_k1",
          "frame": 15,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_line_1_makes_room",
      "name": "Into makes room",
      "targetId": "line_1",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 30,
      "reason": {
        "purpose": "carry",
        "cues": [
          "arrival-2"
        ],
        "lands": "peak",
        "beat": "room"
      },
      "keys": [
        {
          "id": "act_line_1_makes_room_k0",
          "frame": 0,
          "x": 318.11,
          "y": 0,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_line_1_makes_room_k1",
          "frame": 6,
          "x": 318.11,
          "y": 0,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.85,
            "y1": 0,
            "x2": 0.17,
            "y2": 1
          }
        },
        {
          "id": "act_line_1_makes_room_k2",
          "frame": 29,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_phrase_drifts",
      "name": "Phrase drifts",
      "targetId": "phrase",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 43,
      "reason": {
        "purpose": "drift",
        "beat": "hold"
      },
      "keys": [
        {
          "id": "act_phrase_drifts_k0",
          "frame": 0,
          "x": 25.46,
          "y": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_phrase_drifts_k1",
          "frame": 42,
          "x": -6.94,
          "y": 0
        }
      ]
    },
    {
      "id": "act_phrase_goes",
      "name": "Phrase goes",
      "targetId": "phrase",
      "startFrame": 42,
      "durationFrames": 9,
      "reason": {
        "purpose": "depart",
        "cues": [
          "exit"
        ],
        "lands": "start",
        "beat": "leave",
        "why": "Phrase goes"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_phrase_goes_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.6,
            "y1": 0,
            "x2": 1,
            "y2": 0.8
          }
        },
        {
          "id": "act_phrase_goes_k1",
          "frame": 8,
          "x": -90,
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
        "kind": "beat",
        "weight": 1,
        "why": "The lead. It has the stage to itself until the sentence joins it."
      },
      {
        "name": "arrival-2",
        "frame": 17,
        "kind": "accent",
        "weight": 1.15,
        "why": "The arrival the sentence resolves on."
      },
      {
        "name": "exit",
        "frame": 42,
        "kind": "structure",
        "weight": 0.5,
        "why": "The phrase starts to leave. The cut comes while it is still gaining speed."
      }
    ],
    "subjects": [
      {
        "nodeId": "w_into",
        "cue": "arrival-1",
        "needsSec": 0.48,
        "untilFrame": 51,
        "accent": false
      },
      {
        "nodeId": "w_a",
        "cue": "arrival-2",
        "needsSec": 0.85,
        "untilFrame": 51,
        "accent": true
      },
      {
        "nodeId": "w_complete",
        "cue": "arrival-2",
        "needsSec": 0.78,
        "untilFrame": 51,
        "accent": true
      },
      {
        "nodeId": "w_floor_plan",
        "cue": "arrival-2",
        "needsSec": 0.72,
        "untilFrame": 51,
        "accent": true
      }
    ],
    "claimFrames": 9,
    "regions": {
      "phrase": {
        "x": 235,
        "y": 313,
        "width": 811,
        "height": 94
      }
    },
    "safeArea": {
      "x": 102,
      "y": 65,
      "width": 1076,
      "height": 590
    },
    "invariants": [
      {
        "kind": "centred",
        "nodeIds": [
          "w_into"
        ],
        "frame": 0,
        "x": 640,
        "tolerance": 1.5,
        "why": "The lead has the stage to itself and sits in the middle of it."
      },
      {
        "kind": "centred",
        "nodeIds": [
          "w_into",
          "w_a",
          "w_complete",
          "w_floor_plan"
        ],
        "frame": 33,
        "x": 640,
        "tolerance": 10.2,
        "why": "Once every word has landed the sentence is centred where the lead stood."
      },
      {
        "kind": "apart",
        "a": "w_into",
        "b": "w_a",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      },
      {
        "kind": "apart",
        "a": "w_a",
        "b": "w_complete",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      },
      {
        "kind": "apart",
        "a": "w_complete",
        "b": "w_floor_plan",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      }
    ],
    "handoff": {
      "entry": {
        "frame": 0,
        "nodeId": "w_into",
        "position": {
          "x": 640,
          "y": 360
        },
        "velocity": {
          "x": -23,
          "y": 0
        },
        "size": 426,
        "color": "#000000"
      },
      "exit": {
        "frame": 50,
        "nodeId": "w_floor_plan",
        "position": {
          "x": 796.6,
          "y": 360
        },
        "velocity": {
          "x": -935,
          "y": 0
        },
        "size": 303,
        "color": "#333CEE"
      }
    },
    "notes": [],
    "intent": "Say what the sketch becomes: the result is the floor plan.",
    "cast": {
      "w_into": "lead",
      "w_a": "link",
      "w_complete": "link",
      "w_floor_plan": "point",
      "phrase": "camera"
    },
    "pattern": {
      "name": "lead",
      "intent": "An opening that stresses one message. The lead takes the eye when the shot starts; it has the impact, not the meaning. It gives its place to the sentence once, the rest joins during that move, and the point arrives last and is marked.",
      "relations": [
        {
          "id": "alone",
          "kind": "alone",
          "role": "lead",
          "among": [
            "link",
            "point"
          ],
          "why": "The lead is alone on stage when it hits."
        },
        {
          "id": "once",
          "kind": "once",
          "beat": "room",
          "needs": [
            "link",
            "point"
          ],
          "why": "Room is made once, not once for every arrival."
        },
        {
          "id": "joins",
          "kind": "during",
          "roles": [
            "link",
            "point"
          ],
          "beat": "room",
          "why": "What follows the lead joins while room is being made, so the move throws the eye to it."
        },
        {
          "id": "last",
          "kind": "last",
          "role": "point",
          "after": [
            "lead",
            "link"
          ],
          "why": "The point is the last arrival: the sentence resolves on it."
        },
        {
          "id": "marked",
          "kind": "marked",
          "role": "point",
          "against": [
            "lead",
            "link"
          ],
          "beat": "mark",
          "why": "The point is marked: it is what the viewer should remember."
        },
        {
          "id": "composed",
          "kind": "composed",
          "roles": [
            "lead",
            "link",
            "point"
          ],
          "beats": [
            "prep",
            "hit",
            "settle",
            "room",
            "join"
          ],
          "region": "phrase",
          "why": "When the last word has landed the sentence sits where its composition was declared."
        },
        {
          "id": "whole",
          "kind": "together",
          "roles": [
            "lead",
            "link",
            "point"
          ],
          "beat": "leave",
          "why": "The sentence leaves as one."
        }
      ]
    },
    "hold": {
      "completeFrame": 33,
      "leaveFrame": 42
    }
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
    case "easeOutExpo": return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
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

function sampleColor(keys: readonly any[], localF: number): string {
  const channels = (hex: string) => [0, 2, 4].map((i) => parseInt(hex.replace("#", "").slice(i, i + 2), 16));
  const mix = (a: string, b: string, u: number) => {
    const ca = channels(a), cb = channels(b);
    return `rgb(${ca.map((v, i) => Math.round(v + (cb[i]! - v) * u)).join(",")})`;
  };
  if (localF <= keys[0].frame) return keys[0].color;
  const last = keys[keys.length - 1];
  if (localF >= last.frame) return last.color;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (localF >= a.frame && localF <= b.frame) return mix(a.color, b.color, easeValue(a.easing, (localF - a.frame) / Math.max(1e-6, b.frame - a.frame)));
  }
  return last.color;
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
    let color: string | undefined;

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
      } else if (m.kind === "color") {
        color = sampleColor(m.keys, lf);
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
    return { inRange, transform, opacity: Math.max(0, Math.min(1, op)), blur, letterSpacing, color };
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
                fill={st.color ?? n.fill.color}
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
        const fillRef = st.color ?? (n.fill.kind === "solid" ? n.fill.color : n.fill.kind === "linear" || n.fill.kind === "radial" ? `url(#grad_${n.id})` : "transparent");
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
