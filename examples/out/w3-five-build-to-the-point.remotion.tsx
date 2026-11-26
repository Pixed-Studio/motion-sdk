import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const IR_DOCUMENT = {
  "id": "five_build",
  "name": "Five words that build",
  "format": {
    "width": 1280,
    "height": 720,
    "fps": 30,
    "durationFrames": 102
  },
  "scene": {
    "id": "five_build__scene-1",
    "name": "Word by word",
    "durationFrames": 102,
    "backgroundColor": "#F7F2EB"
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
      "name": "Plan,",
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
        "originX": 0.23935937499999999,
        "originY": 0.5006944444444444
      }
    },
    {
      "id": "w_plan",
      "kind": "text",
      "name": "Plan,",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_1",
      "layer": 1,
      "base": {
        "x": 240.14,
        "y": 321,
        "width": 132.48,
        "height": 79
      },
      "text": "Plan,",
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
      "name": "build,",
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
        "originX": 0.35680859375,
        "originY": 0.5006944444444444
      }
    },
    {
      "id": "w_build",
      "kind": "text",
      "name": "build,",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_2",
      "layer": 1,
      "base": {
        "x": 385.21,
        "y": 321,
        "width": 143.01,
        "height": 79
      },
      "text": "build,",
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
      "id": "arrival_3",
      "kind": "frame",
      "name": "test,",
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
        "originX": 0.4693476562499999,
        "originY": 0.5006944444444444
      }
    },
    {
      "id": "w_test",
      "kind": "text",
      "name": "test,",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_3",
      "layer": 1,
      "base": {
        "x": 540.81,
        "y": 321,
        "width": 119.91,
        "height": 79
      },
      "text": "test,",
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
      "id": "arrival_4",
      "kind": "frame",
      "name": "ship",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "line_1",
      "layer": 4,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720,
        "originX": 0.5707265625,
        "originY": 0.5006944444444444
      }
    },
    {
      "id": "w_ship",
      "kind": "text",
      "name": "ship",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_4",
      "layer": 1,
      "base": {
        "x": 673.31,
        "y": 321,
        "width": 114.44,
        "height": 79
      },
      "text": "ship",
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
      "id": "arrival_5",
      "kind": "frame",
      "name": "together.",
      "slot": "arrivals-group",
      "role": "group",
      "plane": "focal",
      "parentId": "line_1",
      "layer": 5,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720,
        "originX": 0.625265625,
        "originY": 0.5006944444444444
      }
    },
    {
      "id": "w_together",
      "kind": "text",
      "name": "together.",
      "slot": "arrivals",
      "role": "subject",
      "plane": "focal",
      "parentId": "arrival_5",
      "layer": 1,
      "base": {
        "x": 800.34,
        "y": 321,
        "width": 239.52,
        "height": 79
      },
      "text": "together.",
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
      "id": "act_glow_a_answers_2",
      "name": "glow-a answers the arrivals",
      "targetId": "glow_a",
      "startFrame": 0,
      "durationFrames": 102,
      "reason": {
        "purpose": "respond",
        "cues": [
          "arrival-1",
          "arrival-2",
          "arrival-3",
          "arrival-4",
          "arrival-5"
        ],
        "lands": "peak",
        "peaks": [
          "arrival-2",
          "arrival-3",
          "arrival-4",
          "arrival-5"
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
          "x": -5.8,
          "y": -2.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_a_answers_2_k2",
          "frame": 11,
          "x": -8.12,
          "y": -3.79,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_a_answers_2_k3",
          "frame": 16,
          "x": -11.91,
          "y": -5.55,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_a_answers_2_k4",
          "frame": 22,
          "x": -18.22,
          "y": -8.49,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_a_answers_2_k5",
          "frame": 26,
          "x": -20.74,
          "y": -9.67,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_a_answers_2_k6",
          "frame": 31,
          "x": -24.78,
          "y": -11.55,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_a_answers_2_k7",
          "frame": 37,
          "x": -31.52,
          "y": -14.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_a_answers_2_k8",
          "frame": 42,
          "x": -34.22,
          "y": -15.96,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_a_answers_2_k9",
          "frame": 47,
          "x": -38.57,
          "y": -17.99,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_a_answers_2_k10",
          "frame": 53,
          "x": -45.82,
          "y": -21.37,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_a_answers_2_k11",
          "frame": 58,
          "x": -48.72,
          "y": -22.72,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_a_answers_2_k12",
          "frame": 63,
          "x": -53.73,
          "y": -25.05,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_a_answers_2_k13",
          "frame": 69,
          "x": -62.06,
          "y": -28.94,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_a_answers_2_k14",
          "frame": 101,
          "x": -65.4,
          "y": -30.5
        }
      ]
    },
    {
      "id": "act_glow_b_answers_2",
      "name": "glow-b answers the arrivals",
      "targetId": "glow_b",
      "startFrame": 0,
      "durationFrames": 102,
      "reason": {
        "purpose": "respond",
        "cues": [
          "arrival-1",
          "arrival-2",
          "arrival-3",
          "arrival-4",
          "arrival-5"
        ],
        "lands": "peak",
        "peaks": [
          "arrival-2",
          "arrival-3",
          "arrival-4",
          "arrival-5"
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
          "x": 6.09,
          "y": 1.98,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_b_answers_2_k2",
          "frame": 11,
          "x": 8.52,
          "y": 2.77,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_b_answers_2_k3",
          "frame": 16,
          "x": 12.5,
          "y": 4.06,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_b_answers_2_k4",
          "frame": 22,
          "x": 19.12,
          "y": 6.21,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_b_answers_2_k5",
          "frame": 26,
          "x": 21.76,
          "y": 7.07,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_b_answers_2_k6",
          "frame": 31,
          "x": 26,
          "y": 8.45,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_b_answers_2_k7",
          "frame": 37,
          "x": 33.08,
          "y": 10.75,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_b_answers_2_k8",
          "frame": 42,
          "x": 35.91,
          "y": 11.67,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_b_answers_2_k9",
          "frame": 47,
          "x": 40.48,
          "y": 13.15,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_b_answers_2_k10",
          "frame": 53,
          "x": 48.09,
          "y": 15.62,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_b_answers_2_k11",
          "frame": 58,
          "x": 51.13,
          "y": 16.61,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_glow_b_answers_2_k12",
          "frame": 63,
          "x": 56.38,
          "y": 18.32,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_glow_b_answers_2_k13",
          "frame": 69,
          "x": 65.13,
          "y": 21.16,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_glow_b_answers_2_k14",
          "frame": 101,
          "x": 68.63,
          "y": 22.3
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_plan_in",
      "name": "Plan, appears",
      "targetId": "w_plan",
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
          "id": "act_w_plan_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_plan_in_k1",
          "frame": 2,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_plan_focus",
      "name": "Plan, comes into focus",
      "targetId": "w_plan",
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
          "id": "act_w_plan_focus_k0",
          "frame": 0,
          "value": 9,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_plan_focus_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_build_in",
      "name": "build, appears",
      "targetId": "w_build",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 16,
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
          "id": "act_w_build_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_build_in_k1",
          "frame": 2,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_build_focus",
      "name": "build, comes into focus",
      "targetId": "w_build",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 16,
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
          "id": "act_w_build_focus_k0",
          "frame": 0,
          "value": 9,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_build_focus_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_test_in",
      "name": "test, appears",
      "targetId": "w_test",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 31,
      "durationFrames": 3,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_test_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_test_in_k1",
          "frame": 2,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_test_focus",
      "name": "test, comes into focus",
      "targetId": "w_test",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 31,
      "durationFrames": 3,
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
          "id": "act_w_test_focus_k0",
          "frame": 0,
          "value": 9,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_test_focus_k1",
          "frame": 2,
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
      "startFrame": 47,
      "durationFrames": 3,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-4"
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
          "frame": 2,
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
      "startFrame": 47,
      "durationFrames": 3,
      "baseValue": 0,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-4"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_ship_focus_k0",
          "frame": 0,
          "value": 9,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_ship_focus_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_together_in",
      "name": "together. appears",
      "targetId": "w_together",
      "property": "opacity",
      "mode": "set",
      "stage": "in",
      "startFrame": 63,
      "durationFrames": 3,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_together_in_k0",
          "frame": 0,
          "value": 0.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_together_in_k1",
          "frame": 2,
          "value": 1
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_w_together_focus",
      "name": "together. comes into focus",
      "targetId": "w_together",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 63,
      "durationFrames": 3,
      "baseValue": 0,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_w_together_focus_k0",
          "frame": 0,
          "value": 9,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_w_together_focus_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_arrival_5_punch",
      "name": "together. lands large and settles",
      "targetId": "arrival_5",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 63,
      "durationFrames": 16,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "arrival-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_arrival_5_punch_k0",
          "frame": 0,
          "x": 1.14,
          "y": 1.14,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_arrival_5_punch_k1",
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
      "durationFrames": 67,
      "reason": {
        "purpose": "keep",
        "cues": [
          "arrival-1",
          "arrival-2",
          "arrival-3",
          "arrival-4",
          "arrival-5"
        ]
      },
      "keys": [
        {
          "id": "act_line_1_room_k0",
          "frame": 0,
          "x": 333.62,
          "y": 0
        },
        {
          "id": "act_line_1_room_k1",
          "frame": 16,
          "x": 333.62,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_line_1_room_k2",
          "frame": 19,
          "x": 255.82,
          "y": 0
        },
        {
          "id": "act_line_1_room_k3",
          "frame": 31,
          "x": 255.82,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_line_1_room_k4",
          "frame": 34,
          "x": 189.57,
          "y": 0
        },
        {
          "id": "act_line_1_room_k5",
          "frame": 47,
          "x": 189.57,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_line_1_room_k6",
          "frame": 50,
          "x": 126.06,
          "y": 0
        },
        {
          "id": "act_line_1_room_k7",
          "frame": 63,
          "x": 126.06,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_line_1_room_k8",
          "frame": 66,
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
        "kind": "beat",
        "weight": 0.8,
        "why": "A step of the run-up toward the accent."
      },
      {
        "name": "arrival-2",
        "frame": 16,
        "kind": "beat",
        "weight": 0.87,
        "why": "A step of the run-up toward the accent."
      },
      {
        "name": "arrival-3",
        "frame": 31,
        "kind": "beat",
        "weight": 0.93,
        "why": "A step of the run-up toward the accent."
      },
      {
        "name": "arrival-4",
        "frame": 47,
        "kind": "beat",
        "weight": 1,
        "why": "A step of the run-up toward the accent."
      },
      {
        "name": "arrival-5",
        "frame": 63,
        "kind": "accent",
        "weight": 1.15,
        "why": "The arrival the phrase builds to. It keeps the stage longest and the world answers it hardest."
      }
    ],
    "subjects": [
      {
        "nodeId": "w_plan",
        "cue": "arrival-1",
        "needsSec": 0.52,
        "untilFrame": 102,
        "accent": false
      },
      {
        "nodeId": "w_build",
        "cue": "arrival-2",
        "needsSec": 0.57,
        "untilFrame": 102,
        "accent": false
      },
      {
        "nodeId": "w_test",
        "cue": "arrival-3",
        "needsSec": 0.52,
        "untilFrame": 102,
        "accent": false
      },
      {
        "nodeId": "w_ship",
        "cue": "arrival-4",
        "needsSec": 0.48,
        "untilFrame": 102,
        "accent": false
      },
      {
        "nodeId": "w_together",
        "cue": "arrival-5",
        "needsSec": 0.71,
        "untilFrame": 102,
        "accent": true
      }
    ],
    "claimFrames": 9,
    "regions": {
      "phrase": {
        "x": 240,
        "y": 321,
        "width": 800,
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
        "nodeId": "w_plan",
        "position": {
          "x": 640,
          "y": 360.5
        },
        "velocity": {
          "x": 0,
          "y": 0
        },
        "size": 132,
        "color": "#000000"
      },
      "exit": {
        "frame": 101,
        "nodeId": "w_together",
        "position": {
          "x": 920.1,
          "y": 360.5
        },
        "velocity": {
          "x": 0,
          "y": 0
        },
        "size": 240,
        "color": "#333CEE"
      }
    },
    "notes": []
  }
} as const;
const LIVES: Record<string, { start: number; end: number }> = {"glow_a":{"start":0,"end":102},"glow_b":{"start":0,"end":102},"phrase":{"start":0,"end":102},"line_1":{"start":0,"end":102},"arrival_1":{"start":0,"end":102},"w_plan":{"start":0,"end":102},"arrival_2":{"start":0,"end":102},"w_build":{"start":16,"end":102},"arrival_3":{"start":0,"end":102},"w_test":{"start":31,"end":102},"arrival_4":{"start":0,"end":102},"w_ship":{"start":47,"end":102},"arrival_5":{"start":0,"end":102},"w_together":{"start":63,"end":102}};
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

export const FiveBuildToThePointMetadata = {
  id: "five_build",
  width: 1280,
  height: 720,
  fps: 30,
  durationInFrames: 102,
};

export const FiveBuildToThePoint: React.FC = () => {
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
