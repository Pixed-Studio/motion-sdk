import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const IR_DOCUMENT = {
  "id": "vertical_words",
  "name": "Vertical words",
  "format": {
    "width": 1080,
    "height": 1920,
    "fps": 60,
    "durationFrames": 216
  },
  "scene": {
    "id": "vertical_words__scene-1",
    "name": "Word by word",
    "durationFrames": 216,
    "backgroundColor": "#0E131F"
  },
  "shaders": [],
  "nodes": [
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
        "color": "#0B5E57"
      },
      "base": {
        "x": -162.1,
        "y": 574.3,
        "width": 803,
        "height": 492,
        "blur": 59,
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
        "color": "#0B5E57"
      },
      "base": {
        "x": 563.8,
        "y": 855,
        "width": 685,
        "height": 449,
        "blur": 59,
        "opacity": 0.4,
        "originX": 0.5,
        "originY": 0.5
      }
    },
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
        "width": 1080,
        "height": 1920,
        "originX": 0.5,
        "originY": 0.5002604166666667
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
        "width": 1080,
        "height": 1920,
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
        "width": 1080,
        "height": 1920,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "line_3",
      "kind": "frame",
      "name": "Line 3",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "phrase",
      "layer": 3,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1080,
        "height": 1920,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "arrival_1",
      "kind": "frame",
      "name": "Meet",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "line_1",
      "layer": 1,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1080,
        "height": 1920,
        "originX": 0.14062962962962963,
        "originY": 0.4356770833333333
      }
    },
    {
      "id": "w_meet",
      "kind": "text",
      "name": "Meet",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_1",
      "layer": 1,
      "base": {
        "x": 151.88,
        "y": 767,
        "width": 250.22,
        "height": 139
      },
      "text": "Meet",
      "fontFamily": "Geist",
      "fontSize": 107,
      "fontWeight": 500,
      "letterSpacing": -2.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "arrival_2",
      "kind": "frame",
      "name": "agents that ship",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "line_2",
      "layer": 2,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1080,
        "height": 1920,
        "originX": 0.5,
        "originY": 0.5002604166666667
      }
    },
    {
      "id": "w_agents",
      "kind": "text",
      "name": "agents",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 1,
      "base": {
        "x": 151.88,
        "y": 891,
        "width": 331.54,
        "height": 139
      },
      "text": "agents",
      "fontFamily": "Geist",
      "fontSize": 107,
      "fontWeight": 500,
      "letterSpacing": -2.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "w_that",
      "kind": "text",
      "name": "that",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 2,
      "base": {
        "x": 504.82,
        "y": 891,
        "width": 196.72,
        "height": 139
      },
      "text": "that",
      "fontFamily": "Geist",
      "fontSize": 107,
      "fontWeight": 500,
      "letterSpacing": -2.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "w_ship",
      "kind": "text",
      "name": "ship",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 3,
      "base": {
        "x": 722.95,
        "y": 891,
        "width": 205.17,
        "height": 139
      },
      "text": "ship",
      "fontFamily": "Geist",
      "fontSize": 107,
      "fontWeight": 500,
      "letterSpacing": -2.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#00D4B2"
      }
    },
    {
      "id": "arrival_3",
      "kind": "frame",
      "name": "while you sleep.",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "line_3",
      "layer": 3,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1080,
        "height": 1920,
        "originX": 0.49316203703703704,
        "originY": 0.56484375
      }
    },
    {
      "id": "w_while",
      "kind": "text",
      "name": "while",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_3",
      "layer": 1,
      "base": {
        "x": 151.88,
        "y": 1015,
        "width": 258.62,
        "height": 139
      },
      "text": "while",
      "fontFamily": "Geist",
      "fontSize": 107,
      "fontWeight": 500,
      "letterSpacing": -2.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "w_you",
      "kind": "text",
      "name": "you",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_3",
      "layer": 2,
      "base": {
        "x": 431.9,
        "y": 1015,
        "width": 176.23,
        "height": 139
      },
      "text": "you",
      "fontFamily": "Geist",
      "fontSize": 107,
      "fontWeight": 500,
      "letterSpacing": -2.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "w_sleep",
      "kind": "text",
      "name": "sleep.",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_3",
      "layer": 3,
      "base": {
        "x": 629.53,
        "y": 1015,
        "width": 283.82,
        "height": 139
      },
      "text": "sleep.",
      "fontFamily": "Geist",
      "fontSize": 107,
      "fontWeight": 500,
      "letterSpacing": -2.3,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
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
      "durationFrames": 216,
      "reason": {
        "purpose": "respond",
        "cues": [
          "arrival-1",
          "arrival-2",
          "arrival-3"
        ],
        "lands": "peak",
        "peaks": [
          "arrival-2",
          "arrival-3"
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
          "frame": 12,
          "x": -7.03,
          "y": -3.28,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_a_answers_2_k2",
          "frame": 75,
          "x": -9.85,
          "y": -4.59,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_a_answers_2_k3",
          "frame": 85,
          "x": -13.15,
          "y": -6.13,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_a_answers_2_k4",
          "frame": 97,
          "x": -18.66,
          "y": -8.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_a_answers_2_k5",
          "frame": 131,
          "x": -20.86,
          "y": -9.73,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_a_answers_2_k6",
          "frame": 141,
          "x": -24.16,
          "y": -11.27,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_a_answers_2_k7",
          "frame": 153,
          "x": -29.67,
          "y": -13.84,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_a_answers_2_k8",
          "frame": 215,
          "x": -31.87,
          "y": -14.86
        }
      ]
    },
    {
      "id": "act_glow_b_answers_2",
      "name": "glow-b answers the arrivals",
      "targetId": "glow_b",
      "startFrame": 0,
      "durationFrames": 216,
      "reason": {
        "purpose": "respond",
        "cues": [
          "arrival-1",
          "arrival-2",
          "arrival-3"
        ],
        "lands": "peak",
        "peaks": [
          "arrival-2",
          "arrival-3"
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
          "frame": 12,
          "x": 7.38,
          "y": 2.4,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_b_answers_2_k2",
          "frame": 75,
          "x": 10.34,
          "y": 3.36,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_b_answers_2_k3",
          "frame": 85,
          "x": 13.8,
          "y": 4.48,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_b_answers_2_k4",
          "frame": 97,
          "x": 19.58,
          "y": 6.36,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_b_answers_2_k5",
          "frame": 131,
          "x": 21.89,
          "y": 7.11,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_b_answers_2_k6",
          "frame": 141,
          "x": 25.36,
          "y": 8.24,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_b_answers_2_k7",
          "frame": 153,
          "x": 31.14,
          "y": 10.12,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_b_answers_2_k8",
          "frame": 215,
          "x": 33.45,
          "y": 10.87
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_meet_in",
      "name": "Meet appears",
      "targetId": "w_meet",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 0,
      "durationFrames": 6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-1"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_meet_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_meet_in_k1",
          "frame": 5,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_meet_focus",
      "name": "Meet comes into focus",
      "targetId": "w_meet",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 6,
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
          "id": "act_w_meet_focus_k0",
          "frame": 0,
          "value": 7.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_meet_focus_k1",
          "frame": 5,
          "value": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_agents_in",
      "name": "agents appears",
      "targetId": "w_agents",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 85,
      "durationFrames": 6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_agents_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_agents_in_k1",
          "frame": 5,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_agents_focus",
      "name": "agents comes into focus",
      "targetId": "w_agents",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 85,
      "durationFrames": 6,
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
          "id": "act_w_agents_focus_k0",
          "frame": 0,
          "value": 7.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_agents_focus_k1",
          "frame": 5,
          "value": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_that_in",
      "name": "that appears",
      "targetId": "w_that",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 89,
      "durationFrames": 6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_that_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_that_in_k1",
          "frame": 5,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_that_focus",
      "name": "that comes into focus",
      "targetId": "w_that",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 89,
      "durationFrames": 6,
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
          "id": "act_w_that_focus_k0",
          "frame": 0,
          "value": 7.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_that_focus_k1",
          "frame": 5,
          "value": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_ship_in",
      "name": "ship appears",
      "targetId": "w_ship",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 93,
      "durationFrames": 6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_ship_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_ship_in_k1",
          "frame": 5,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_ship_focus",
      "name": "ship comes into focus",
      "targetId": "w_ship",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 93,
      "durationFrames": 6,
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
          "id": "act_w_ship_focus_k0",
          "frame": 0,
          "value": 7.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_ship_focus_k1",
          "frame": 5,
          "value": 0
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
      "startFrame": 141,
      "durationFrames": 6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_while_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_while_in_k1",
          "frame": 5,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_while_focus",
      "name": "while comes into focus",
      "targetId": "w_while",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 141,
      "durationFrames": 6,
      "baseValue": 0,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_while_focus_k0",
          "frame": 0,
          "value": 7.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_while_focus_k1",
          "frame": 5,
          "value": 0
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
      "startFrame": 145,
      "durationFrames": 6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_you_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_you_in_k1",
          "frame": 5,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_you_focus",
      "name": "you comes into focus",
      "targetId": "w_you",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 145,
      "durationFrames": 6,
      "baseValue": 0,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_you_focus_k0",
          "frame": 0,
          "value": 7.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_you_focus_k1",
          "frame": 5,
          "value": 0
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
      "startFrame": 149,
      "durationFrames": 6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_sleep_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_sleep_in_k1",
          "frame": 5,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_sleep_focus",
      "name": "sleep. comes into focus",
      "targetId": "w_sleep",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 149,
      "durationFrames": 6,
      "baseValue": 0,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_sleep_focus_k0",
          "frame": 0,
          "value": 7.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_sleep_focus_k1",
          "frame": 5,
          "value": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_arrival_1_punch",
      "name": "Meet lands large and settles",
      "targetId": "arrival_1",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 32,
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
          "x": 3.37,
          "y": 3.37,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_arrival_1_punch_k1",
          "frame": 31,
          "x": 1,
          "y": 1
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
        "frame": 85,
        "kind": "beat",
        "weight": 0.9,
        "why": "An arrival."
      },
      {
        "name": "arrival-3",
        "frame": 141,
        "kind": "beat",
        "weight": 0.9,
        "why": "An arrival."
      }
    ],
    "subjects": [
      {
        "nodeId": "w_meet",
        "cue": "arrival-1",
        "needsSec": 0.48,
        "untilFrame": 216,
        "accent": true
      },
      {
        "nodeId": "w_agents",
        "cue": "arrival-2",
        "needsSec": 1.02,
        "untilFrame": 216,
        "accent": false
      },
      {
        "nodeId": "w_that",
        "cue": "arrival-2",
        "needsSec": 1.02,
        "untilFrame": 216,
        "accent": false
      },
      {
        "nodeId": "w_ship",
        "cue": "arrival-2",
        "needsSec": 1.02,
        "untilFrame": 216,
        "accent": false
      },
      {
        "nodeId": "w_while",
        "cue": "arrival-3",
        "needsSec": 1.02,
        "untilFrame": 216,
        "accent": false
      },
      {
        "nodeId": "w_you",
        "cue": "arrival-3",
        "needsSec": 1.02,
        "untilFrame": 216,
        "accent": false
      },
      {
        "nodeId": "w_sleep",
        "cue": "arrival-3",
        "needsSec": 1.02,
        "untilFrame": 216,
        "accent": false
      }
    ],
    "claimFrames": 18,
    "regions": {
      "phrase": {
        "x": 152,
        "y": 767,
        "width": 776,
        "height": 387
      }
    },
    "safeArea": {
      "x": 86,
      "y": 173,
      "width": 908,
      "height": 1574
    },
    "invariants": [],
    "handoff": {
      "entry": {
        "frame": 0,
        "nodeId": "w_meet",
        "position": {
          "x": 573.5,
          "y": 836.5
        },
        "velocity": {
          "x": -2187,
          "y": 0
        },
        "size": 843,
        "color": "#F6F8FC"
      },
      "exit": {
        "frame": 215,
        "nodeId": "w_ship",
        "position": {
          "x": 825.5,
          "y": 960.5
        },
        "velocity": {
          "x": 0,
          "y": 0
        },
        "size": 205,
        "color": "#00D4B2"
      }
    },
    "notes": []
  }
} as const;
const LIVES: Record<string, { start: number; end: number }> = {"glow_a":{"start":0,"end":216},"glow_b":{"start":0,"end":216},"phrase":{"start":0,"end":216},"line_1":{"start":0,"end":216},"line_2":{"start":0,"end":216},"line_3":{"start":0,"end":216},"arrival_1":{"start":0,"end":216},"w_meet":{"start":0,"end":216},"arrival_2":{"start":0,"end":216},"w_agents":{"start":85,"end":216},"w_that":{"start":89,"end":216},"w_ship":{"start":93,"end":216},"arrival_3":{"start":0,"end":216},"w_while":{"start":141,"end":216},"w_you":{"start":145,"end":216},"w_sleep":{"start":149,"end":216}};
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

export const VerticalVeridianWordsMetadata = {
  id: "vertical_words",
  width: 1080,
  height: 1920,
  fps: 60,
  durationInFrames: 216,
};

export const VerticalVeridianWords: React.FC = () => {
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
