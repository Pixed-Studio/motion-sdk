import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const IR_DOCUMENT = {
  "id": "settles_and_floats",
  "name": "Settles and floats",
  "format": {
    "width": 1280,
    "height": 720,
    "fps": 30,
    "durationFrames": 90
  },
  "scene": {
    "id": "settles_and_floats__scene-1",
    "name": "Word by word",
    "durationFrames": 90,
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
      "id": "line_2",
      "kind": "frame",
      "name": "Line 2",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "phrase",
      "layer": 2,
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
      "name": "Know",
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
        "originX": 0.24546484375,
        "originY": 0.44166666666666665
      }
    },
    {
      "id": "w_know",
      "kind": "text",
      "name": "Know",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_1",
      "layer": 1,
      "base": {
        "x": 224.07,
        "y": 271,
        "width": 180.25,
        "height": 94
      },
      "text": "Know",
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
      "name": "what you can spend",
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
        "originX": 0.5762421875,
        "originY": 0.44166666666666665
      }
    },
    {
      "id": "w_what",
      "kind": "text",
      "name": "what",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 1,
      "base": {
        "x": 419.25,
        "y": 271,
        "width": 159.95,
        "height": 94
      },
      "text": "what",
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
      "id": "w_you",
      "kind": "text",
      "name": "you",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 2,
      "base": {
        "x": 594.13,
        "y": 271,
        "width": 116.3,
        "height": 94
      },
      "text": "you",
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
      "id": "w_can",
      "kind": "text",
      "name": "can",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 3,
      "base": {
        "x": 725.36,
        "y": 271,
        "width": 118.32,
        "height": 94
      },
      "text": "can",
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
      "id": "w_spend",
      "kind": "text",
      "name": "spend",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 4,
      "base": {
        "x": 858.6,
        "y": 271,
        "width": 197.33,
        "height": 94
      },
      "text": "spend",
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
      "name": "today.",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "line_2",
      "layer": 3,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720,
        "originX": 0.5,
        "originY": 0.5583333333333333
      }
    },
    {
      "id": "w_today",
      "kind": "text",
      "name": "today.",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_3",
      "layer": 1,
      "base": {
        "x": 544.86,
        "y": 355,
        "width": 190.28,
        "height": 94
      },
      "text": "today.",
      "fontFamily": "Geist",
      "fontSize": 72,
      "fontWeight": 420,
      "letterSpacing": -1.5,
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
      "id": "act_phrase_lands",
      "name": "Know lands and falls a little past its size",
      "targetId": "phrase",
      "startFrame": 0,
      "durationFrames": 46,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-1"
        ],
        "lands": "start",
        "beat": "hit",
        "why": "Know lands and falls a little past its size"
      },
      "kind": "vec2",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "keys": [
        {
          "id": "act_phrase_lands_k0",
          "frame": 0,
          "x": 2.4,
          "y": 2.4,
          "easing": {
            "kind": "easing",
            "preset": "easeOutExpo"
          }
        },
        {
          "id": "act_phrase_lands_k1",
          "frame": 19,
          "x": 0.93,
          "y": 0.93,
          "easing": {
            "kind": "easing",
            "preset": "easeInOutSine"
          }
        },
        {
          "id": "act_phrase_lands_k2",
          "frame": 45,
          "x": 1,
          "y": 1
        }
      ]
    },
    {
      "id": "act_phrase_dips",
      "name": "Know sinks as it lands, then floats up",
      "targetId": "phrase",
      "startFrame": 0,
      "durationFrames": 46,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-1"
        ],
        "lands": "start",
        "beat": "hit",
        "why": "Know sinks as it lands, then floats up"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_phrase_dips_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutExpo"
          }
        },
        {
          "id": "act_phrase_dips_k1",
          "frame": 19,
          "x": 0,
          "y": 8.64,
          "easing": {
            "kind": "easing",
            "preset": "easeInOutSine"
          }
        },
        {
          "id": "act_phrase_dips_k2",
          "frame": 45,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "targetId": "glow_a",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 46,
      "reason": {
        "purpose": "respond",
        "cues": [
          "arrival-1"
        ],
        "lands": "start",
        "beat": "hit",
        "why": "Know lands and falls a little past its size"
      },
      "kind": "vec2",
      "id": "act_glow_a_lands",
      "name": "glow-a lands with the lead",
      "property": "scale",
      "keys": [
        {
          "id": "act_glow_a_lands_k0",
          "frame": 0,
          "x": 1.42,
          "y": 1.42,
          "easing": {
            "kind": "easing",
            "preset": "easeOutExpo"
          }
        },
        {
          "id": "act_glow_a_lands_k1",
          "frame": 19,
          "x": 0.979,
          "y": 0.979,
          "easing": {
            "kind": "easing",
            "preset": "easeInOutSine"
          }
        },
        {
          "id": "act_glow_a_lands_k2",
          "frame": 45,
          "x": 1,
          "y": 1
        }
      ]
    },
    {
      "targetId": "glow_a",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 46,
      "reason": {
        "purpose": "respond",
        "cues": [
          "arrival-1"
        ],
        "lands": "start",
        "beat": "hit",
        "why": "Know lands and falls a little past its size"
      },
      "kind": "vec2",
      "id": "act_glow_a_closes_in",
      "name": "glow-a closes in",
      "property": "move",
      "keys": [
        {
          "id": "act_glow_a_closes_in_k0",
          "frame": 0,
          "x": -84.97,
          "y": -39.61,
          "easing": {
            "kind": "easing",
            "preset": "easeOutExpo"
          }
        },
        {
          "id": "act_glow_a_closes_in_k1",
          "frame": 19,
          "x": 4.25,
          "y": 1.98,
          "easing": {
            "kind": "easing",
            "preset": "easeInOutSine"
          }
        },
        {
          "id": "act_glow_a_closes_in_k2",
          "frame": 45,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "targetId": "glow_b",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 46,
      "reason": {
        "purpose": "respond",
        "cues": [
          "arrival-1"
        ],
        "lands": "start",
        "beat": "hit",
        "why": "Know lands and falls a little past its size"
      },
      "kind": "vec2",
      "id": "act_glow_b_lands",
      "name": "glow-b lands with the lead",
      "property": "scale",
      "keys": [
        {
          "id": "act_glow_b_lands_k0",
          "frame": 0,
          "x": 1.42,
          "y": 1.42,
          "easing": {
            "kind": "easing",
            "preset": "easeOutExpo"
          }
        },
        {
          "id": "act_glow_b_lands_k1",
          "frame": 19,
          "x": 0.979,
          "y": 0.979,
          "easing": {
            "kind": "easing",
            "preset": "easeInOutSine"
          }
        },
        {
          "id": "act_glow_b_lands_k2",
          "frame": 45,
          "x": 1,
          "y": 1
        }
      ]
    },
    {
      "targetId": "glow_b",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 46,
      "reason": {
        "purpose": "respond",
        "cues": [
          "arrival-1"
        ],
        "lands": "start",
        "beat": "hit",
        "why": "Know lands and falls a little past its size"
      },
      "kind": "vec2",
      "id": "act_glow_b_closes_in",
      "name": "glow-b closes in",
      "property": "move",
      "keys": [
        {
          "id": "act_glow_b_closes_in_k0",
          "frame": 0,
          "x": 103.53,
          "y": 33.64,
          "easing": {
            "kind": "easing",
            "preset": "easeOutExpo"
          }
        },
        {
          "id": "act_glow_b_closes_in_k1",
          "frame": 19,
          "x": -5.18,
          "y": -1.68,
          "easing": {
            "kind": "easing",
            "preset": "easeInOutSine"
          }
        },
        {
          "id": "act_glow_b_closes_in_k2",
          "frame": 45,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_know_in",
      "name": "Know appears",
      "targetId": "w_know",
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
          "id": "act_w_know_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_know_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_what_in",
      "name": "what appears",
      "targetId": "w_what",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 18,
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
          "id": "act_w_what_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_what_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "id": "act_w_what_join",
      "name": "what rises into place",
      "targetId": "w_what",
      "startFrame": 18,
      "durationFrames": 15,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start",
        "beat": "join",
        "why": "what rises into place"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_what_join_k0",
          "frame": 0,
          "x": 0,
          "y": 44.64,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0,
            "y1": 0.28,
            "x2": 0.2,
            "y2": 0.95
          }
        },
        {
          "id": "act_w_what_join_k1",
          "frame": 14,
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
      "startFrame": 21,
      "durationFrames": 15,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
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
          "y": 44.64,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0,
            "y1": 0.28,
            "x2": 0.2,
            "y2": 0.95
          }
        },
        {
          "id": "act_w_you_join_k1",
          "frame": 14,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_can_in",
      "name": "can appears",
      "targetId": "w_can",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 24,
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
          "id": "act_w_can_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_can_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "id": "act_w_can_join",
      "name": "can rises into place",
      "targetId": "w_can",
      "startFrame": 24,
      "durationFrames": 15,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start",
        "beat": "join",
        "why": "can rises into place"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_can_join_k0",
          "frame": 0,
          "x": 0,
          "y": 44.64,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0,
            "y1": 0.28,
            "x2": 0.2,
            "y2": 0.95
          }
        },
        {
          "id": "act_w_can_join_k1",
          "frame": 14,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_spend_in",
      "name": "spend appears",
      "targetId": "w_spend",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 27,
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
          "id": "act_w_spend_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_spend_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "id": "act_w_spend_join",
      "name": "spend rises into place",
      "targetId": "w_spend",
      "startFrame": 27,
      "durationFrames": 15,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start",
        "beat": "join",
        "why": "spend rises into place"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_spend_join_k0",
          "frame": 0,
          "x": 0,
          "y": 44.64,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0,
            "y1": 0.28,
            "x2": 0.2,
            "y2": 0.95
          }
        },
        {
          "id": "act_w_spend_join_k1",
          "frame": 14,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_today_in",
      "name": "today. appears",
      "targetId": "w_today",
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
          "id": "act_w_today_in_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_w_today_in_k1",
          "frame": 1,
          "value": 1
        }
      ]
    },
    {
      "id": "act_w_today_join",
      "name": "today. rises into place",
      "targetId": "w_today",
      "startFrame": 36,
      "durationFrames": 15,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "lands": "start",
        "beat": "join",
        "why": "today. rises into place"
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_w_today_join_k0",
          "frame": 0,
          "x": 0,
          "y": 44.64,
          "easing": {
            "kind": "cubicBezier",
            "x1": 0,
            "y1": 0.28,
            "x2": 0.2,
            "y2": 0.95
          }
        },
        {
          "id": "act_w_today_join_k1",
          "frame": 14,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_line_1_makes_room",
      "name": "Know makes room",
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
          "x": 325.81,
          "y": 42,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "act_line_1_makes_room_k1",
          "frame": 10,
          "x": 325.81,
          "y": 42,
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
          "frame": 18,
          "x": 229.28,
          "y": 29.56,
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
      "durationFrames": 79,
      "reason": {
        "purpose": "drift",
        "beat": "hold"
      },
      "keys": [
        {
          "id": "act_phrase_drifts_size_k0",
          "frame": 0,
          "x": 0.9699,
          "y": 0.9699,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_phrase_drifts_size_k1",
          "frame": 78,
          "x": 1.0199,
          "y": 1.0199
        }
      ]
    },
    {
      "id": "act_phrase_goes",
      "name": "Phrase goes",
      "targetId": "phrase",
      "startFrame": 78,
      "durationFrames": 12,
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
            "x1": 0.58,
            "y1": 0,
            "x2": 1,
            "y2": 0.8
          }
        },
        {
          "id": "act_phrase_goes_k1",
          "frame": 11,
          "x": 0,
          "y": -64.8
        }
      ]
    },
    {
      "targetId": "glow_a",
      "mode": "add",
      "stage": "custom",
      "startFrame": 78,
      "durationFrames": 12,
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
            "x1": 0.58,
            "y1": 0,
            "x2": 1,
            "y2": 0.8
          }
        },
        {
          "id": "act_glow_a_goes_k1",
          "frame": 11,
          "x": 0,
          "y": -19.44
        }
      ]
    },
    {
      "targetId": "glow_b",
      "mode": "add",
      "stage": "custom",
      "startFrame": 78,
      "durationFrames": 12,
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
            "x1": 0.58,
            "y1": 0,
            "x2": 1,
            "y2": 0.8
          }
        },
        {
          "id": "act_glow_b_goes_k1",
          "frame": 11,
          "x": 0,
          "y": -19.44
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
        "frame": 18,
        "kind": "beat",
        "weight": 0.9,
        "why": "A word joins the line."
      },
      {
        "name": "arrival-3",
        "frame": 36,
        "kind": "accent",
        "weight": 1.15,
        "why": "The arrival the sentence resolves on."
      },
      {
        "name": "exit",
        "frame": 78,
        "kind": "structure",
        "weight": 0.5,
        "why": "The phrase starts to leave. The cut comes while it is still gaining speed."
      }
    ],
    "subjects": [
      {
        "nodeId": "w_know",
        "cue": "arrival-1",
        "needsSec": 0.48,
        "untilFrame": 90,
        "accent": false
      },
      {
        "nodeId": "w_what",
        "cue": "arrival-2",
        "needsSec": 1.11,
        "untilFrame": 90,
        "accent": false
      },
      {
        "nodeId": "w_you",
        "cue": "arrival-2",
        "needsSec": 1.01,
        "untilFrame": 90,
        "accent": false
      },
      {
        "nodeId": "w_can",
        "cue": "arrival-2",
        "needsSec": 0.91,
        "untilFrame": 90,
        "accent": false
      },
      {
        "nodeId": "w_spend",
        "cue": "arrival-2",
        "needsSec": 0.81,
        "untilFrame": 90,
        "accent": false
      },
      {
        "nodeId": "w_today",
        "cue": "arrival-3",
        "needsSec": 0.57,
        "untilFrame": 90,
        "accent": true
      }
    ],
    "claimFrames": 6,
    "regions": {
      "phrase": {
        "x": 224,
        "y": 271,
        "width": 832,
        "height": 178
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
          "w_know"
        ],
        "frame": 0,
        "x": 640,
        "tolerance": 1.5,
        "why": "The lead has the stage to itself and sits in the middle of it."
      },
      {
        "kind": "centred",
        "nodeIds": [
          "w_know",
          "w_what",
          "w_you",
          "w_can",
          "w_spend",
          "w_today"
        ],
        "frame": 47,
        "x": 640,
        "tolerance": 8.5,
        "why": "Once every word has landed the sentence is centred where the lead stood."
      },
      {
        "kind": "apart",
        "a": "w_know",
        "b": "w_what",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      },
      {
        "kind": "apart",
        "a": "w_what",
        "b": "w_you",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      },
      {
        "kind": "apart",
        "a": "w_you",
        "b": "w_can",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      },
      {
        "kind": "apart",
        "a": "w_can",
        "b": "w_spend",
        "why": "Words of a line keep their order while they come in.",
        "maxShare": 0.1
      }
    ],
    "handoff": {
      "entry": {
        "frame": 0,
        "nodeId": "w_know",
        "position": {
          "x": 640,
          "y": 360
        },
        "velocity": {
          "x": 0,
          "y": 79
        },
        "size": 420,
        "color": "#000000"
      },
      "exit": {
        "frame": 89,
        "nodeId": "w_today",
        "position": {
          "x": 640,
          "y": 338
        },
        "velocity": {
          "x": 0,
          "y": -533
        },
        "size": 194,
        "color": "#333CEE"
      }
    },
    "notes": [],
    "intent": "Calm certainty: the number is known, and it is today's.",
    "cast": {
      "w_know": "lead",
      "w_what": "link",
      "w_you": "link",
      "w_can": "link",
      "w_spend": "link",
      "w_today": "point",
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
      "completeFrame": 47,
      "leaveFrame": 78
    }
  }
} as const;
const LIVES: Record<string, { start: number; end: number }> = {"phrase":{"start":0,"end":90},"line_1":{"start":0,"end":90},"line_2":{"start":0,"end":90},"arrival_1":{"start":0,"end":90},"w_know":{"start":0,"end":90},"arrival_2":{"start":0,"end":90},"w_what":{"start":18,"end":90},"w_you":{"start":21,"end":90},"w_can":{"start":24,"end":90},"w_spend":{"start":27,"end":90},"arrival_3":{"start":0,"end":90},"w_today":{"start":36,"end":90},"glow_a":{"start":0,"end":90},"glow_b":{"start":0,"end":90}};
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

export const SettlesAndFloatsMetadata = {
  id: "settles_and_floats",
  width: 1280,
  height: 720,
  fps: 30,
  durationInFrames: 90,
};

export const SettlesAndFloats: React.FC = () => {
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
