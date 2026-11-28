import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const IR_DOCUMENT = {
  "id": "point_flickers_on",
  "name": "The point flickers on",
  "format": {
    "width": 1280,
    "height": 720,
    "fps": 30,
    "durationFrames": 66
  },
  "scene": {
    "id": "point_flickers_on__scene-1",
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
      "name": "And then",
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
        "originX": 0.25236718750000003,
        "originY": 0.5
      }
    },
    {
      "id": "w_and",
      "kind": "text",
      "name": "And",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_1",
      "layer": 1,
      "base": {
        "x": 178.59,
        "y": 313,
        "width": 128.11,
        "height": 94
      },
      "text": "And",
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
      "id": "w_then",
      "kind": "text",
      "name": "then",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_1",
      "layer": 2,
      "base": {
        "x": 321.63,
        "y": 313,
        "width": 145.84,
        "height": 94
      },
      "text": "then",
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
      "name": "the lights",
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
        "originX": 0.49224999999999997,
        "originY": 0.5
      }
    },
    {
      "id": "w_the",
      "kind": "text",
      "name": "the",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 1,
      "base": {
        "x": 482.39,
        "y": 313,
        "width": 106.08,
        "height": 94
      },
      "text": "the",
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
      "id": "w_lights",
      "kind": "text",
      "name": "lights",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 2,
      "base": {
        "x": 603.4,
        "y": 313,
        "width": 174.37,
        "height": 94
      },
      "text": "lights",
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
      "id": "arrival_3",
      "kind": "frame",
      "name": "flicker on.",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "line_1",
      "layer": 3,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720,
        "originX": 0.73988671875,
        "originY": 0.5
      }
    },
    {
      "id": "w_flicker",
      "kind": "text",
      "name": "flicker",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_3",
      "layer": 1,
      "base": {
        "x": 792.7,
        "y": 313,
        "width": 199.44,
        "height": 94
      },
      "text": "flicker",
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
      "id": "w_on",
      "kind": "text",
      "name": "on.",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_3",
      "layer": 2,
      "base": {
        "x": 1007.07,
        "y": 313,
        "width": 94.34,
        "height": 94
      },
      "text": "on.",
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
        "x": 167.7,
        "y": 100.2,
        "width": 540,
        "height": 331,
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
        "x": 656,
        "y": 289.1,
        "width": 461,
        "height": 302,
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
      "kind": "scalar",
      "id": "act_w_and_in",
      "name": "And appears",
      "targetId": "w_and",
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
          "id": "act_w_and_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_and_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_then_in",
      "name": "then appears",
      "targetId": "w_then",
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
          "id": "act_w_then_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_then_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_the_in",
      "name": "the appears",
      "targetId": "w_the",
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
          "id": "act_w_the_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_the_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_lights_in",
      "name": "lights appears",
      "targetId": "w_lights",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 20,
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
          "id": "act_w_lights_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_lights_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_flicker_in",
      "name": "flicker appears",
      "targetId": "w_flicker",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 33,
      "durationFrames": 2,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "lands": "start",
        "beat": "join"
      },
      "keys": [
        {
          "id": "act_w_flicker_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_on_in",
      "name": "on. appears",
      "targetId": "w_on",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 36,
      "durationFrames": 2,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "lands": "start",
        "beat": "join"
      },
      "keys": [
        {
          "id": "act_w_on_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_on_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_line_1_makes_room",
      "name": "And then makes room",
      "targetId": "line_1",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 40,
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
          "x": 316.97,
          "y": 0,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_line_1_makes_room_k1",
          "frame": 9,
          "x": 316.97,
          "y": 0,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.8452,
            "y1": 0.0196,
            "x2": 0.9147,
            "y2": 0.5147
          }
        },
        {
          "id": "act_line_1_makes_room_k2",
          "frame": 17,
          "x": 226.1,
          "y": 0,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0.0803,
            "y1": 0.505,
            "x2": 0.1751,
            "y2": 1
          }
        },
        {
          "id": "act_line_1_makes_room_k3",
          "frame": 39,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_phrase_drifts_size",
      "name": "Phrase pushes in",
      "targetId": "phrase",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 58,
      "reason": {
        "purpose": "drift",
        "beat": "hold"
      },
      "keys": [
        {
          "id": "act_phrase_drifts_size_k0",
          "frame": 0,
          "x": 0.9179,
          "y": 0.9179,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_phrase_drifts_size_k1",
          "frame": 57,
          "x": 1.0479,
          "y": 1.0479
        }
      ]
    },
    {
      "id": "act_phrase_goes",
      "name": "Phrase goes",
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
            "x1": 0.75,
            "y1": 0,
            "x2": 0.95,
            "y2": 0.6
          }
        },
        {
          "id": "act_phrase_goes_k1",
          "frame": 8,
          "x": 0,
          "y": 49.68
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
        "why": "Phrase goes"
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
            "x1": 0.75,
            "y1": 0,
            "x2": 0.95,
            "y2": 0.6
          }
        },
        {
          "id": "act_glow_a_goes_k1",
          "frame": 8,
          "x": 0,
          "y": 14.9
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
        "why": "Phrase goes"
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
            "x1": 0.75,
            "y1": 0,
            "x2": 0.95,
            "y2": 0.6
          }
        },
        {
          "id": "act_glow_b_goes_k1",
          "frame": 8,
          "x": 0,
          "y": 14.9
        }
      ]
    },
    {
      "id": "act_w_flicker_flickers",
      "name": "flicker flickers on",
      "targetId": "w_flicker",
      "startFrame": 33,
      "durationFrames": 11,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "beat": "mark",
        "why": "flicker flickers on"
      },
      "kind": "scalar",
      "property": "opacity",
      "mode": "set",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_flicker_flickers_k0",
          "frame": 0,
          "value": 0.15,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_flickers_k1",
          "frame": 1,
          "value": 0.15,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_flickers_k2",
          "frame": 2,
          "value": 0.45,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_flickers_k3",
          "frame": 3,
          "value": 0.15,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_flickers_k4",
          "frame": 4,
          "value": 0.15,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_flickers_k5",
          "frame": 5,
          "value": 0.79,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_flickers_k6",
          "frame": 6,
          "value": 0.81,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_flickers_k7",
          "frame": 7,
          "value": 0.32,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_flickers_k8",
          "frame": 8,
          "value": 0.69,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_flickers_k9",
          "frame": 9,
          "value": 0.87,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_flicker_flickers_k10",
          "frame": 10,
          "value": 1
        }
      ],
      "baseValue": 1
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
        "kind": "beat",
        "weight": 0.9,
        "why": "A word joins the line."
      },
      {
        "name": "arrival-3",
        "frame": 33,
        "kind": "accent",
        "weight": 1.15,
        "why": "The arrival the sentence resolves on."
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
        "nodeId": "w_and",
        "cue": "arrival-1",
        "needsSec": 0.66,
        "untilFrame": 66,
        "accent": false
      },
      {
        "nodeId": "w_then",
        "cue": "arrival-1",
        "needsSec": 0.66,
        "untilFrame": 66,
        "accent": false
      },
      {
        "nodeId": "w_the",
        "cue": "arrival-2",
        "needsSec": 0.75,
        "untilFrame": 66,
        "accent": false
      },
      {
        "nodeId": "w_lights",
        "cue": "arrival-2",
        "needsSec": 0.65,
        "untilFrame": 66,
        "accent": false
      },
      {
        "nodeId": "w_flicker",
        "cue": "arrival-3",
        "needsSec": 0.8,
        "untilFrame": 66,
        "accent": true
      },
      {
        "nodeId": "w_on",
        "cue": "arrival-3",
        "needsSec": 0.7,
        "untilFrame": 66,
        "accent": true
      }
    ],
    "claimFrames": 6,
    "regions": {
      "phrase": {
        "x": 179,
        "y": 313,
        "width": 923,
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
          "w_and",
          "w_then"
        ],
        "frame": 0,
        "x": 640,
        "tolerance": 1.5,
        "why": "The lead has the stage to itself and sits in the middle of it."
      },
      {
        "kind": "centred",
        "nodeIds": [
          "w_and",
          "w_then",
          "w_the",
          "w_lights",
          "w_flicker",
          "w_on"
        ],
        "frame": 36,
        "x": 640,
        "tolerance": 8.3,
        "why": "Once every word has landed the sentence is centred where the lead stood."
      },
      {
        "kind": "apart",
        "a": "w_and",
        "b": "w_then",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      },
      {
        "kind": "apart",
        "a": "w_then",
        "b": "w_the",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      },
      {
        "kind": "apart",
        "a": "w_the",
        "b": "w_lights",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      },
      {
        "kind": "apart",
        "a": "w_lights",
        "b": "w_flicker",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      },
      {
        "kind": "apart",
        "a": "w_flicker",
        "b": "w_on",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      }
    ],
    "handoff": {
      "entry": {
        "frame": 0,
        "nodeId": "w_and",
        "position": {
          "x": 566.2,
          "y": 360
        },
        "velocity": {
          "x": -6,
          "y": 0
        },
        "size": 118,
        "color": "#000000"
      },
      "exit": {
        "frame": 65,
        "nodeId": "w_flicker",
        "position": {
          "x": 904.5,
          "y": 409.7
        },
        "velocity": {
          "x": 0,
          "y": 685
        },
        "size": 209,
        "color": "#000000"
      }
    },
    "notes": [],
    "intent": "Turn the film: the light is about to come on.",
    "cast": {
      "w_and": "lead",
      "w_then": "lead",
      "w_the": "link",
      "w_lights": "link",
      "w_flicker": "point",
      "w_on": "link",
      "phrase": "camera",
      "glow_a": "ground",
      "glow_b": "ground"
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
      "completeFrame": 36,
      "leaveFrame": 57
    }
  }
} as const;
const LIVES: Record<string, { start: number; end: number }> = {"phrase":{"start":0,"end":66},"line_1":{"start":0,"end":66},"arrival_1":{"start":0,"end":66},"w_and":{"start":0,"end":66},"w_then":{"start":0,"end":66},"arrival_2":{"start":0,"end":66},"w_the":{"start":17,"end":66},"w_lights":{"start":20,"end":66},"arrival_3":{"start":0,"end":66},"w_flicker":{"start":33,"end":66},"w_on":{"start":36,"end":66},"glow_a":{"start":0,"end":66},"glow_b":{"start":0,"end":66}};
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

export const PointFlickersOnMetadata = {
  id: "point_flickers_on",
  width: 1280,
  height: 720,
  fps: 30,
  durationInFrames: 66,
};

export const PointFlickersOn: React.FC = () => {
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
