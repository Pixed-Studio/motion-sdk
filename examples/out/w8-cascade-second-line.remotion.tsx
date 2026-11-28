import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const IR_DOCUMENT = {
  "id": "second_line",
  "name": "A second line",
  "format": {
    "width": 1280,
    "height": 720,
    "fps": 30,
    "durationFrames": 66
  },
  "scene": {
    "id": "second_line__scene-1",
    "name": "Word by word",
    "durationFrames": 66,
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
      "name": "while you",
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
        "originX": 0.4335,
        "originY": 0.5006944444444444
      }
    },
    {
      "id": "w_while",
      "kind": "text",
      "name": "while",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_1",
      "layer": 1,
      "base": {
        "x": 427.16,
        "y": 321,
        "width": 144.37,
        "height": 79
      },
      "text": "while",
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
      "id": "w_you",
      "kind": "text",
      "name": "you",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_1",
      "layer": 2,
      "base": {
        "x": 584.12,
        "y": 321,
        "width": 98.48,
        "height": 79
      },
      "text": "you",
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
      "name": "sleep.",
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
        "originX": 0.6046992187500001,
        "originY": 0.5006944444444444
      }
    },
    {
      "id": "w_sleep",
      "kind": "text",
      "name": "sleep.",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 1,
      "base": {
        "x": 695.19,
        "y": 321,
        "width": 157.65,
        "height": 79
      },
      "text": "sleep.",
      "fontFamily": "Geist",
      "fontSize": 61,
      "fontWeight": 420,
      "letterSpacing": -1.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#333CEE"
      }
    },
    {
      "id": "glow_a",
      "name": "glow-a",
      "slot": "ambient",
      "role": "ambient",
      "plane": "backdrop",
      "layer": 1,
      "kind": "shape",
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#DCFC5E"
      },
      "base": {
        "x": 239.6,
        "y": 140.1,
        "width": 458,
        "height": 281,
        "blur": 70,
        "opacity": 0.55,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "glow_b",
      "name": "glow-b",
      "slot": "ambient",
      "role": "ambient",
      "plane": "backdrop",
      "layer": 2,
      "kind": "shape",
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#DCFC5E"
      },
      "base": {
        "x": 653.9,
        "y": 300.4,
        "width": 390,
        "height": 256,
        "blur": 70,
        "opacity": 0.4,
        "originX": 0.5,
        "originY": 0.5
      }
    }
  ],
  "masks": [],
  "motions": [
    {
      "id": "act_glow_a_answers_2",
      "name": "glow-a answers the arrivals",
      "targetId": "glow_a",
      "startFrame": 0,
      "durationFrames": 66,
      "reason": {
        "purpose": "respond",
        "cues": [
          "arrival-1",
          "arrival-2"
        ],
        "lands": "peak",
        "peaks": [
          "arrival-2"
        ]
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_glow_a_answers_2_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_a_answers_2_k1",
          "frame": 6,
          "x": -10.15,
          "y": -4.73,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_a_answers_2_k2",
          "frame": 9,
          "x": -14.5,
          "y": -6.76,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_a_answers_2_k3",
          "frame": 15,
          "x": -21.75,
          "y": -10.14,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_a_answers_2_k4",
          "frame": 65,
          "x": -24.65,
          "y": -11.5
        }
      ]
    },
    {
      "id": "act_glow_b_answers_2",
      "name": "glow-b answers the arrivals",
      "targetId": "glow_b",
      "startFrame": 0,
      "durationFrames": 66,
      "reason": {
        "purpose": "respond",
        "cues": [
          "arrival-1",
          "arrival-2"
        ],
        "lands": "peak",
        "peaks": [
          "arrival-2"
        ]
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_glow_b_answers_2_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_b_answers_2_k1",
          "frame": 6,
          "x": 10.65,
          "y": 3.46,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_b_answers_2_k2",
          "frame": 9,
          "x": 15.22,
          "y": 4.94,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_b_answers_2_k3",
          "frame": 15,
          "x": 22.83,
          "y": 7.42,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_b_answers_2_k4",
          "frame": 65,
          "x": 25.87,
          "y": 8.41
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_while_in",
      "name": "while appears",
      "targetId": "w_while",
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
          "id": "act_w_while_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_while_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "id": "act_w_while_join",
      "name": "while rises into place",
      "targetId": "w_while",
      "startFrame": 0,
      "durationFrames": 16,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-1"
        ],
        "lands": "start",
        "beat": "join",
        "why": "while rises into place"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_while_join_k0",
          "frame": 0,
          "x": 0,
          "y": 36.6,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.1,
            "y1": 0.72,
            "x2": 0.56,
            "y2": 1
          }
        },
        {
          "id": "act_w_while_join_k1",
          "frame": 15,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_you_in",
      "name": "you appears",
      "targetId": "w_you",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 2,
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
          "id": "act_w_you_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_you_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "id": "act_w_you_join",
      "name": "you rises into place",
      "targetId": "w_you",
      "startFrame": 2,
      "durationFrames": 16,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-1"
        ],
        "lands": "start",
        "beat": "join",
        "why": "you rises into place"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_you_join_k0",
          "frame": 0,
          "x": 0,
          "y": 36.6,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.1,
            "y1": 0.72,
            "x2": 0.56,
            "y2": 1
          }
        },
        {
          "id": "act_w_you_join_k1",
          "frame": 15,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_sleep_in",
      "name": "sleep. appears",
      "targetId": "w_sleep",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 9,
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
          "id": "act_w_sleep_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_sleep_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "id": "act_w_sleep_join",
      "name": "sleep. rises into place",
      "targetId": "w_sleep",
      "startFrame": 9,
      "durationFrames": 16,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start",
        "beat": "join",
        "why": "sleep. rises into place"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_sleep_join_k0",
          "frame": 0,
          "x": 0,
          "y": 36.6,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.1,
            "y1": 0.72,
            "x2": 0.56,
            "y2": 1
          }
        },
        {
          "id": "act_w_sleep_join_k1",
          "frame": 15,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_phrase_pushes_in",
      "name": "Phrase pushes in",
      "targetId": "phrase",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 36,
      "reason": {
        "purpose": "carry",
        "cues": [
          "arrival-1"
        ],
        "lands": "start",
        "beat": "handoff"
      },
      "keys": [
        {
          "id": "act_phrase_pushes_in_k0",
          "frame": 0,
          "x": 207.4,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutExpo"
          }
        },
        {
          "id": "act_phrase_pushes_in_k1",
          "frame": 35,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "id": "act_phrase_falls_back",
      "name": "Phrase falls back",
      "targetId": "phrase",
      "startFrame": 57,
      "durationFrames": 9,
      "reason": {
        "purpose": "depart",
        "cues": [
          "exit"
        ],
        "lands": "start",
        "beat": "leave",
        "why": "Phrase falls back"
      },
      "kind": "vec2",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "keys": [
        {
          "id": "act_phrase_falls_back_k0",
          "frame": 0,
          "x": 1,
          "y": 1,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.6,
            "y1": 0,
            "x2": 1,
            "y2": 0.8
          }
        },
        {
          "id": "act_phrase_falls_back_k1",
          "frame": 8,
          "x": 0.65,
          "y": 0.65
        }
      ]
    },
    {
      "id": "act_phrase_softens",
      "name": "Phrase softens as it goes",
      "targetId": "phrase",
      "startFrame": 60,
      "durationFrames": 6,
      "reason": {
        "purpose": "depart",
        "cues": [
          "exit"
        ],
        "beat": "leave",
        "why": "Phrase softens as it goes"
      },
      "kind": "scalar",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "keys": [
        {
          "id": "act_phrase_softens_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_phrase_softens_k1",
          "frame": 5,
          "value": 4
        }
      ],
      "baseValue": 0
    },
    {
      "targetId": "glow_a",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 57,
      "durationFrames": 9,
      "reason": {
        "purpose": "depart",
        "cues": [
          "exit"
        ],
        "lands": "start",
        "beat": "leave",
        "why": "Phrase falls back"
      },
      "kind": "vec2",
      "id": "act_glow_a_falls_back",
      "name": "glow-a falls back",
      "property": "scale",
      "keys": [
        {
          "id": "act_glow_a_falls_back_k0",
          "frame": 0,
          "x": 1,
          "y": 1,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.6,
            "y1": 0,
            "x2": 1,
            "y2": 0.8
          }
        },
        {
          "id": "act_glow_a_falls_back_k1",
          "frame": 8,
          "x": 0.895,
          "y": 0.895
        }
      ]
    },
    {
      "targetId": "glow_a",
      "mode": "add",
      "stage": "custom",
      "startFrame": 57,
      "durationFrames": 9,
      "reason": {
        "purpose": "depart",
        "cues": [
          "exit"
        ],
        "lands": "start",
        "beat": "leave",
        "why": "Phrase falls back"
      },
      "kind": "vec2",
      "id": "act_glow_a_goes",
      "name": "glow-a goes with the line",
      "property": "move",
      "keys": [
        {
          "id": "act_glow_a_goes_k0",
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
          "id": "act_glow_a_goes_k1",
          "frame": 8,
          "x": 18,
          "y": 8.39
        }
      ]
    },
    {
      "targetId": "glow_b",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 57,
      "durationFrames": 9,
      "reason": {
        "purpose": "depart",
        "cues": [
          "exit"
        ],
        "lands": "start",
        "beat": "leave",
        "why": "Phrase falls back"
      },
      "kind": "vec2",
      "id": "act_glow_b_falls_back",
      "name": "glow-b falls back",
      "property": "scale",
      "keys": [
        {
          "id": "act_glow_b_falls_back_k0",
          "frame": 0,
          "x": 1,
          "y": 1,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.6,
            "y1": 0,
            "x2": 1,
            "y2": 0.8
          }
        },
        {
          "id": "act_glow_b_falls_back_k1",
          "frame": 8,
          "x": 0.895,
          "y": 0.895
        }
      ]
    },
    {
      "targetId": "glow_b",
      "mode": "add",
      "stage": "custom",
      "startFrame": 57,
      "durationFrames": 9,
      "reason": {
        "purpose": "depart",
        "cues": [
          "exit"
        ],
        "lands": "start",
        "beat": "leave",
        "why": "Phrase falls back"
      },
      "kind": "vec2",
      "id": "act_glow_b_goes",
      "name": "glow-b goes with the line",
      "property": "move",
      "keys": [
        {
          "id": "act_glow_b_goes_k0",
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
          "id": "act_glow_b_goes_k1",
          "frame": 8,
          "x": -21.93,
          "y": -7.13
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
        "why": "An arrival."
      },
      {
        "name": "arrival-2",
        "frame": 9,
        "kind": "beat",
        "weight": 1,
        "why": "An arrival."
      },
      {
        "name": "exit",
        "frame": 57,
        "kind": "structure",
        "weight": 0.5,
        "why": "The phrase starts to leave. The cut comes while it is still gaining speed."
      }
    ],
    "subjects": [
      {
        "nodeId": "w_while",
        "cue": "arrival-1",
        "needsSec": 0.71,
        "untilFrame": 66,
        "accent": false
      },
      {
        "nodeId": "w_you",
        "cue": "arrival-1",
        "needsSec": 0.64,
        "untilFrame": 66,
        "accent": false
      },
      {
        "nodeId": "w_sleep",
        "cue": "arrival-2",
        "needsSec": 0.57,
        "untilFrame": 66,
        "accent": false
      }
    ],
    "claimFrames": 9,
    "regions": {
      "phrase": {
        "x": 427,
        "y": 321,
        "width": 426,
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
        "nodeId": "w_while",
        "position": {
          "x": 706.7,
          "y": 397.1
        },
        "velocity": {
          "x": -1118,
          "y": -319
        },
        "size": 144,
        "color": "#000000"
      },
      "exit": {
        "frame": 65,
        "nodeId": "w_sleep",
        "position": {
          "x": 727.1,
          "y": 360.5
        },
        "velocity": {
          "x": -488,
          "y": 0
        },
        "size": 102,
        "color": "#333CEE"
      }
    },
    "notes": [],
    "intent": "Finish the thought the line before started.",
    "cast": {
      "w_while": "link",
      "w_you": "link",
      "w_sleep": "point",
      "phrase": "camera",
      "glow_a": "ground",
      "glow_b": "ground"
    },
    "hold": {
      "completeFrame": 20,
      "leaveFrame": 57
    }
  }
} as const;
const LIVES: Record<string, { start: number; end: number }> = {"phrase":{"start":0,"end":66},"line_1":{"start":0,"end":66},"arrival_1":{"start":0,"end":66},"w_while":{"start":0,"end":66},"w_you":{"start":2,"end":66},"arrival_2":{"start":0,"end":66},"w_sleep":{"start":9,"end":66},"glow_a":{"start":0,"end":66},"glow_b":{"start":0,"end":66}};
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

export const SecondLineMetadata = {
  id: "second_line",
  width: 1280,
  height: 720,
  fps: 30,
  durationInFrames: 66,
};

export const SecondLine: React.FC = () => {
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
