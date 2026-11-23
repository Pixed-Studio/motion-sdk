import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const IR_DOCUMENT = {
  "id": "veridian_rebrand_60fps",
  "name": "Veridian Noir Rebrand + Hex Emblem (4.5s @ 60fps)",
  "format": {
    "width": 1280,
    "height": 720,
    "fps": 60,
    "durationFrames": 270
  },
  "scene": {
    "id": "veridian_rebrand_60fps__scene-1",
    "name": "Ship fearless agentic systems at planetary scale -> Emblem",
    "durationFrames": 270,
    "backgroundColor": "#0E131F"
  },
  "shaders": [
    {
      "id": "glean_chevron_ribbon_v3",
      "version": 1,
      "name": "Spinning Chevron Ribbon",
      "description": "3D-projected rotating square-pillar chevron hourglass ribbon with vertical fade",
      "cost": "light",
      "sksl": "uniform float4 ms_contentRect;\nuniform float ms_dpr;\nuniform float p_spinAngle;\nuniform float p_pillarSize;\nuniform float p_baseHalfGap;\nuniform float p_chevronSlope;\nuniform float p_fadeHeight;\nuniform float4 p_limeColor;\n\nfloat2 frontProfile(float x, float S, float theta) {\n  float R = S * 0.70710678;\n  float a0 = theta + 0.78539816;\n  float a1 = theta + 2.35619449;\n  float a2 = theta + 3.92699082;\n  float a3 = theta + 5.49778714;\n  float2 v0 = float2(R * sin(a0), R * cos(a0));\n  float2 v1 = float2(R * sin(a1), R * cos(a1));\n  float2 v2 = float2(R * sin(a2), R * cos(a2));\n  float2 v3 = float2(R * sin(a3), R * cos(a3));\n\n  float xMin = min(min(v0.x, v1.x), min(v2.x, v3.x));\n  float xMax = max(max(v0.x, v1.x), max(v2.x, v3.x));\n  float insideX = min(x - xMin, xMax - x);\n\n  float zMax = -1e6;\n  float xc = clamp(x, xMin, xMax);\n  float lo0 = min(v0.x, v1.x); float hi0 = max(v0.x, v1.x);\n  if (hi0 - lo0 > 0.001 && xc >= lo0 - 0.001 && xc <= hi0 + 0.001) {\n    float t = clamp((xc - v0.x) / (v1.x - v0.x), 0.0, 1.0);\n    zMax = max(zMax, mix(v0.y, v1.y, t));\n  }\n  float lo1 = min(v1.x, v2.x); float hi1 = max(v1.x, v2.x);\n  if (hi1 - lo1 > 0.001 && xc >= lo1 - 0.001 && xc <= hi1 + 0.001) {\n    float t = clamp((xc - v1.x) / (v2.x - v1.x), 0.0, 1.0);\n    zMax = max(zMax, mix(v1.y, v2.y, t));\n  }\n  float lo2 = min(v2.x, v3.x); float hi2 = max(v2.x, v3.x);\n  if (hi2 - lo2 > 0.001 && xc >= lo2 - 0.001 && xc <= hi2 + 0.001) {\n    float t = clamp((xc - v2.x) / (v3.x - v2.x), 0.0, 1.0);\n    zMax = max(zMax, mix(v2.y, v3.y, t));\n  }\n  float lo3 = min(v3.x, v0.x); float hi3 = max(v3.x, v0.x);\n  if (hi3 - lo3 > 0.001 && xc >= lo3 - 0.001 && xc <= hi3 + 0.001) {\n    float t = clamp((xc - v3.x) / (v0.x - v3.x), 0.0, 1.0);\n    zMax = max(zMax, mix(v3.y, v0.y, t));\n  }\n  return float2(zMax, insideX);\n}\n\nhalf4 main(float2 fragCoord) {\n  float dpr = max(ms_dpr, 0.001);\n  float2 center = ms_contentRect.xy + 0.5 * ms_contentRect.zw;\n  float2 p = (fragCoord - center) / dpr;\n\n  float theta = p_spinAngle * 0.0174532925;\n  float2 prof = frontProfile(p.x, p_pillarSize, theta);\n  float zFront = prof.x;\n  float insideX = prof.y;\n\n  float aaX = smoothstep(-0.75, 0.75, insideX);\n  if (aaX <= 0.0001) return half4(0.0);\n\n  float innerHalf = max(3.0, p_baseHalfGap - p_chevronSlope * zFront);\n  float ay = abs(p.y);\n  float d = ay - innerHalf;\n\n  float aaInner = smoothstep(-0.75, 0.75, d);\n  float u = clamp(max(d, 0.0) / max(p_fadeHeight, 1.0), 0.0, 1.0);\n  float fadeAlpha = 1.0 - smoothstep(0.0, 1.0, pow(u, 1.2));\n\n  float a = aaX * aaInner * fadeAlpha * p_limeColor.a;\n  float3 rgb = p_limeColor.a > 0.001 ? (p_limeColor.rgb / p_limeColor.a) : float3(0.0);\n  return half4(half3(rgb * a), half(a));\n}",
      "properties": [
        {
          "id": "spinAngle",
          "label": "Spin Angle",
          "type": "number",
          "uniformName": "p_spinAngle",
          "defaultValue": -222,
          "min": -720,
          "max": 360,
          "step": 1,
          "unit": "deg"
        },
        {
          "id": "pillarSize",
          "label": "Pillar Width",
          "type": "number",
          "uniformName": "p_pillarSize",
          "defaultValue": 161,
          "min": 40,
          "max": 320,
          "step": 1,
          "unit": "px"
        },
        {
          "id": "baseHalfGap",
          "label": "Outer Half Gap",
          "type": "number",
          "uniformName": "p_baseHalfGap",
          "defaultValue": 95,
          "min": 10,
          "max": 240,
          "step": 1,
          "unit": "px"
        },
        {
          "id": "chevronSlope",
          "label": "Chevron Slope",
          "type": "number",
          "uniformName": "p_chevronSlope",
          "defaultValue": 0.86,
          "min": 0,
          "max": 2,
          "step": 0.01
        },
        {
          "id": "fadeHeight",
          "label": "Fade Height",
          "type": "number",
          "uniformName": "p_fadeHeight",
          "defaultValue": 290,
          "min": 40,
          "max": 520,
          "step": 1,
          "unit": "px"
        },
        {
          "id": "limeColor",
          "label": "Ribbon Color",
          "type": "color",
          "uniformName": "p_limeColor",
          "defaultValue": "#3BF5C8"
        }
      ]
    }
  ],
  "nodes": [
    {
      "id": "intro_world",
      "kind": "frame",
      "name": "Intro World",
      "slot": "intro-stage",
      "role": "stage",
      "layer": 1,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720
      }
    },
    {
      "id": "central_lime_ribbon",
      "kind": "shape",
      "name": "Central Chevron Ribbon",
      "slot": "backdrop-ribbon",
      "role": "backdrop",
      "parentId": "intro_world",
      "layer": 1,
      "base": {
        "x": 460,
        "y": 20,
        "width": 360,
        "height": 680
      },
      "shape": "rectangle",
      "fill": {
        "kind": "shader",
        "shaderId": "glean_chevron_ribbon_v3",
        "placementId": "fill_chevron_ribbon",
        "params": {
          "spinAngle": -222,
          "pillarSize": 161,
          "baseHalfGap": 95,
          "chevronSlope": 0.86,
          "fadeHeight": 290,
          "limeColor": "#3BF5C8"
        }
      }
    },
    {
      "id": "headline_group",
      "kind": "frame",
      "name": "Headline Typography",
      "slot": "headline-group",
      "role": "focal-group",
      "parentId": "intro_world",
      "layer": 3,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720
      }
    },
    {
      "id": "txt_ship_fearless",
      "kind": "text",
      "name": "Ship fearless",
      "slot": "headline-line",
      "role": "focal-text",
      "parentId": "headline_group",
      "layer": 1,
      "base": {
        "x": 400.4,
        "y": 216,
        "width": 479.2,
        "height": 111
      },
      "text": "Ship fearless",
      "fontFamily": "Geist",
      "fontSize": 85,
      "fontWeight": 500,
      "letterSpacing": -2,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "txt_agentic_systems",
      "kind": "text",
      "name": "agentic systems",
      "slot": "headline-line",
      "role": "focal-text",
      "parentId": "headline_group",
      "layer": 2,
      "base": {
        "x": 341.2,
        "y": 303,
        "width": 597.6,
        "height": 111
      },
      "text": "agentic systems",
      "fontFamily": "Geist",
      "fontSize": 85,
      "fontWeight": 500,
      "letterSpacing": -2,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "txt_at_planetary_scale",
      "kind": "text",
      "name": "at planetary scale",
      "slot": "headline-line",
      "role": "focal-text",
      "parentId": "headline_group",
      "layer": 3,
      "base": {
        "x": 314.45,
        "y": 390,
        "width": 651.1,
        "height": 111
      },
      "text": "at planetary scale",
      "fontFamily": "Geist",
      "fontSize": 85,
      "fontWeight": 500,
      "letterSpacing": -2,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "midground_orbit_ring",
      "kind": "frame",
      "name": "Midground Orbit Ring",
      "slot": "orbit-ring",
      "role": "orbit-ring",
      "parentId": "intro_world",
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
      "id": "mid_blue_big",
      "kind": "shape",
      "name": "Primary Orb Large",
      "slot": "orbit-item",
      "role": "orbit-item",
      "parentId": "midground_orbit_ring",
      "layer": 7,
      "base": {
        "x": 904.1,
        "y": 390.8,
        "width": 144,
        "height": 144
      },
      "shape": "ellipse",
      "fill": {
        "kind": "radial",
        "domain": {
          "x": -0.14,
          "y": -0.22,
          "width": 0.92,
          "height": 0.92
        },
        "stops": [
          {
            "offset": 0,
            "color": "#3DF5D4"
          },
          {
            "offset": 0.55,
            "color": "#00B89C"
          },
          {
            "offset": 1,
            "color": "#007A6E"
          }
        ]
      }
    },
    {
      "id": "mid_tri_big",
      "kind": "path",
      "name": "Fresh Triangle Large",
      "slot": "orbit-item",
      "role": "orbit-item",
      "parentId": "midground_orbit_ring",
      "layer": 8,
      "base": {
        "x": 696.5,
        "y": -56.1,
        "width": 196,
        "height": 169.74,
        "rotation": 52
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 98,
            "y": 0,
            "cornerRadius": 34
          },
          {
            "id": "v1",
            "x": 196,
            "y": 169.74,
            "cornerRadius": 34
          },
          {
            "id": "v2",
            "x": 0,
            "y": 169.74,
            "cornerRadius": 34
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "radial",
        "domain": {
          "x": 0.14,
          "y": 0.22,
          "width": 0.72,
          "height": 0.72
        },
        "stops": [
          {
            "offset": 0,
            "color": "#80FFDB"
          },
          {
            "offset": 0.5,
            "color": "#5390D9"
          },
          {
            "offset": 1,
            "color": "#6930C3"
          }
        ]
      }
    },
    {
      "id": "mid_tri_small",
      "kind": "path",
      "name": "Fresh Triangle Small",
      "slot": "orbit-item",
      "role": "orbit-item",
      "parentId": "midground_orbit_ring",
      "layer": 9,
      "base": {
        "x": 561.9,
        "y": 656.4,
        "width": 86,
        "height": 74.48,
        "rotation": -35
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 43,
            "y": 0,
            "cornerRadius": 15
          },
          {
            "id": "v1",
            "x": 86,
            "y": 74.48,
            "cornerRadius": 15
          },
          {
            "id": "v2",
            "x": 0,
            "y": 74.48,
            "cornerRadius": 15
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "radial",
        "domain": {
          "x": 0.14,
          "y": 0.22,
          "width": 0.72,
          "height": 0.72
        },
        "stops": [
          {
            "offset": 0,
            "color": "#80FFDB"
          },
          {
            "offset": 0.5,
            "color": "#5390D9"
          },
          {
            "offset": 1,
            "color": "#6930C3"
          }
        ]
      }
    },
    {
      "id": "mid_blue_small",
      "kind": "shape",
      "name": "Primary Orb Small",
      "slot": "orbit-item",
      "role": "orbit-item",
      "parentId": "midground_orbit_ring",
      "layer": 5,
      "range": {
        "startFrame": 75,
        "durationFrames": 152
      },
      "base": {
        "x": 286.1,
        "y": 196.5,
        "width": 46,
        "height": 46
      },
      "shape": "ellipse",
      "fill": {
        "kind": "radial",
        "domain": {
          "x": -0.14,
          "y": -0.22,
          "width": 0.92,
          "height": 0.92
        },
        "stops": [
          {
            "offset": 0,
            "color": "#3DF5D4"
          },
          {
            "offset": 0.55,
            "color": "#00B89C"
          },
          {
            "offset": 1,
            "color": "#007A6E"
          }
        ]
      }
    },
    {
      "id": "mid_warm_tiny",
      "kind": "shape",
      "name": "Warm Square Tiny",
      "slot": "orbit-item",
      "role": "orbit-item",
      "parentId": "midground_orbit_ring",
      "layer": 4,
      "range": {
        "startFrame": 75,
        "durationFrames": 152
      },
      "base": {
        "x": 305.7,
        "y": 449.6,
        "width": 38,
        "height": 38,
        "rotation": 18
      },
      "shape": "rectangle",
      "borderRadius": 8,
      "fill": {
        "kind": "linear",
        "angleDeg": 35,
        "stops": [
          {
            "offset": 0,
            "color": "#FFD166"
          },
          {
            "offset": 0.5,
            "color": "#FF926B"
          },
          {
            "offset": 1,
            "color": "#FF5E7E"
          }
        ]
      }
    },
    {
      "id": "mid_warm_big",
      "kind": "shape",
      "name": "Warm Square Large",
      "slot": "orbit-item",
      "role": "orbit-item",
      "parentId": "midground_orbit_ring",
      "layer": 6,
      "range": {
        "startFrame": 150,
        "durationFrames": 77
      },
      "base": {
        "x": 384.3,
        "y": -51.4,
        "width": 124,
        "height": 124,
        "rotation": 24
      },
      "shape": "rectangle",
      "borderRadius": 27,
      "fill": {
        "kind": "linear",
        "angleDeg": 35,
        "stops": [
          {
            "offset": 0,
            "color": "#FFD166"
          },
          {
            "offset": 0.5,
            "color": "#FF926B"
          },
          {
            "offset": 1,
            "color": "#FF5E7E"
          }
        ]
      }
    },
    {
      "id": "mid_warm_med",
      "kind": "shape",
      "name": "Warm Square Medium",
      "slot": "orbit-item",
      "role": "orbit-item",
      "parentId": "midground_orbit_ring",
      "layer": 5,
      "range": {
        "startFrame": 150,
        "durationFrames": 77
      },
      "base": {
        "x": 827.4,
        "y": 643.1,
        "width": 72,
        "height": 72,
        "rotation": 36
      },
      "shape": "rectangle",
      "borderRadius": 15,
      "fill": {
        "kind": "linear",
        "angleDeg": 35,
        "stops": [
          {
            "offset": 0,
            "color": "#FFD166"
          },
          {
            "offset": 0.5,
            "color": "#FF926B"
          },
          {
            "offset": 1,
            "color": "#FF5E7E"
          }
        ]
      }
    },
    {
      "id": "foreground_bokeh_group",
      "kind": "frame",
      "name": "Foreground Bokeh Depth",
      "slot": "bokeh-group",
      "role": "bokeh-group",
      "parentId": "intro_world",
      "layer": 4,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720
      }
    },
    {
      "id": "bokeh_b2_orb",
      "kind": "shape",
      "name": "Bokeh Orb Beat 2",
      "slot": "bokeh-item",
      "role": "bokeh-item",
      "parentId": "foreground_bokeh_group",
      "layer": 10,
      "range": {
        "startFrame": 75,
        "durationFrames": 22
      },
      "base": {
        "x": 1030,
        "y": 284,
        "width": 244,
        "height": 244,
        "blur": 40
      },
      "shape": "ellipse",
      "fill": {
        "kind": "radial",
        "domain": {
          "x": -0.14,
          "y": -0.22,
          "width": 0.92,
          "height": 0.92
        },
        "stops": [
          {
            "offset": 0,
            "color": "#3DF5D4"
          },
          {
            "offset": 0.55,
            "color": "#00B89C"
          },
          {
            "offset": 1,
            "color": "#007A6E"
          }
        ]
      }
    },
    {
      "id": "bokeh_b2_warm",
      "kind": "shape",
      "name": "Bokeh Warm Beat 2",
      "slot": "bokeh-item",
      "role": "bokeh-item",
      "parentId": "foreground_bokeh_group",
      "layer": 11,
      "range": {
        "startFrame": 75,
        "durationFrames": 22
      },
      "base": {
        "x": 77,
        "y": 122,
        "width": 256,
        "height": 256,
        "rotation": 44,
        "blur": 42
      },
      "shape": "rectangle",
      "borderRadius": 56,
      "fill": {
        "kind": "linear",
        "angleDeg": 35,
        "stops": [
          {
            "offset": 0,
            "color": "#FFD166"
          },
          {
            "offset": 0.5,
            "color": "#FF926B"
          },
          {
            "offset": 1,
            "color": "#FF5E7E"
          }
        ]
      }
    },
    {
      "id": "bokeh_b3_orb_big",
      "kind": "shape",
      "name": "Bokeh Orb Sweep Left",
      "slot": "bokeh-item",
      "role": "bokeh-item",
      "parentId": "foreground_bokeh_group",
      "layer": 12,
      "range": {
        "startFrame": 154,
        "durationFrames": 73
      },
      "base": {
        "x": 63,
        "y": 623,
        "width": 244,
        "height": 244,
        "blur": 40
      },
      "shape": "ellipse",
      "fill": {
        "kind": "radial",
        "domain": {
          "x": -0.14,
          "y": -0.22,
          "width": 0.92,
          "height": 0.92
        },
        "stops": [
          {
            "offset": 0,
            "color": "#3DF5D4"
          },
          {
            "offset": 0.55,
            "color": "#00B89C"
          },
          {
            "offset": 1,
            "color": "#007A6E"
          }
        ]
      }
    },
    {
      "id": "bokeh_b3_warm_right",
      "kind": "shape",
      "name": "Bokeh Warm Sweep Right",
      "slot": "bokeh-item",
      "role": "bokeh-item",
      "parentId": "foreground_bokeh_group",
      "layer": 13,
      "range": {
        "startFrame": 162,
        "durationFrames": 65
      },
      "base": {
        "x": 1141,
        "y": 101,
        "width": 268,
        "height": 268,
        "rotation": 166,
        "blur": 44
      },
      "shape": "rectangle",
      "borderRadius": 59,
      "fill": {
        "kind": "linear",
        "angleDeg": 35,
        "stops": [
          {
            "offset": 0,
            "color": "#FFD166"
          },
          {
            "offset": 0.5,
            "color": "#FF926B"
          },
          {
            "offset": 1,
            "color": "#FF5E7E"
          }
        ]
      }
    },
    {
      "id": "bokeh_pre_tri",
      "kind": "path",
      "name": "Bokeh Fresh Finale",
      "slot": "bokeh-item",
      "role": "bokeh-item",
      "parentId": "foreground_bokeh_group",
      "layer": 14,
      "range": {
        "startFrame": 204,
        "durationFrames": 18
      },
      "base": {
        "x": 50,
        "y": 621,
        "width": 320,
        "height": 277.13,
        "blur": 36
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 160,
            "y": 0,
            "cornerRadius": 56
          },
          {
            "id": "v1",
            "x": 320,
            "y": 277.13,
            "cornerRadius": 56
          },
          {
            "id": "v2",
            "x": 0,
            "y": 277.13,
            "cornerRadius": 56
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "radial",
        "domain": {
          "x": 0.14,
          "y": 0.22,
          "width": 0.72,
          "height": 0.72
        },
        "stops": [
          {
            "offset": 0,
            "color": "#80FFDB"
          },
          {
            "offset": 0.5,
            "color": "#5390D9"
          },
          {
            "offset": 1,
            "color": "#6930C3"
          }
        ]
      }
    },
    {
      "id": "emblem_assembly",
      "kind": "frame",
      "name": "Emblem Assembly",
      "slot": "emblem-stage",
      "role": "stage",
      "layer": 10,
      "base": {
        "x": 0,
        "y": 0,
        "width": 1280,
        "height": 720
      }
    },
    {
      "id": "guide_veridian_hex_host",
      "kind": "path",
      "name": "Guide: Veridian Hexagon Core",
      "slot": "guide-path",
      "role": "guide-path",
      "parentId": "emblem_assembly",
      "layer": 30,
      "base": {
        "x": -110,
        "y": -160,
        "width": 1130,
        "height": 680,
        "opacity": 0
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 0,
            "y": 520
          },
          {
            "id": "v1",
            "x": 450,
            "y": 0
          },
          {
            "id": "v2",
            "x": 1000,
            "y": 100
          },
          {
            "id": "v3",
            "x": 1130,
            "y": 420
          },
          {
            "id": "v4",
            "x": 970,
            "y": 680
          },
          {
            "id": "v5",
            "x": 750,
            "y": 520
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1",
            "tangentStart": {
              "x": 135,
              "y": -156
            },
            "tangentEnd": {
              "x": -150,
              "y": 63
            }
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2",
            "tangentStart": {
              "x": 150,
              "y": -63
            },
            "tangentEnd": {
              "x": -102,
              "y": -63
            }
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3",
            "tangentStart": {
              "x": 102,
              "y": 63
            },
            "tangentEnd": {
              "x": 4.5,
              "y": -87
            }
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4",
            "tangentStart": {
              "x": -4.5,
              "y": 87
            },
            "tangentEnd": {
              "x": 57,
              "y": -15
            }
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v5",
            "tangentStart": {
              "x": -57,
              "y": 15
            },
            "tangentEnd": {
              "x": 66,
              "y": 48
            }
          }
        ],
        "closed": false,
        "trailName": "Path"
      },
      "fill": {
        "kind": "none"
      },
      "strokeZero": true
    },
    {
      "id": "guide_veridian_diamond_a",
      "kind": "path",
      "name": "Guide: Veridian North Wing",
      "slot": "guide-path",
      "role": "guide-path",
      "parentId": "emblem_assembly",
      "layer": 31,
      "base": {
        "x": 210,
        "y": 255,
        "width": 380,
        "height": 505,
        "opacity": 0
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 0,
            "y": 505
          },
          {
            "id": "v1",
            "x": 90,
            "y": 235
          },
          {
            "id": "v2",
            "x": 240,
            "y": 15
          },
          {
            "id": "v3",
            "x": 380,
            "y": 0
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1",
            "tangentStart": {
              "x": 27,
              "y": -81
            },
            "tangentEnd": {
              "x": -36,
              "y": 73.5
            }
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2",
            "tangentStart": {
              "x": 36,
              "y": -73.5
            },
            "tangentEnd": {
              "x": -43.5,
              "y": 35.25
            }
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3",
            "tangentStart": {
              "x": 43.5,
              "y": -35.25
            },
            "tangentEnd": {
              "x": -42,
              "y": 4.5
            }
          }
        ],
        "closed": false,
        "trailName": "Path"
      },
      "fill": {
        "kind": "none"
      },
      "strokeZero": true
    },
    {
      "id": "guide_veridian_pent_b",
      "kind": "path",
      "name": "Guide: Veridian South Prism",
      "slot": "guide-path",
      "role": "guide-path",
      "parentId": "emblem_assembly",
      "layer": 32,
      "base": {
        "x": 705,
        "y": -140,
        "width": 255,
        "height": 585,
        "opacity": 0
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 255,
            "y": 0
          },
          {
            "id": "v1",
            "x": 235,
            "y": 300
          },
          {
            "id": "v2",
            "x": 115,
            "y": 500
          },
          {
            "id": "v3",
            "x": 0,
            "y": 585
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1",
            "tangentStart": {
              "x": -6,
              "y": 90
            },
            "tangentEnd": {
              "x": 21,
              "y": -75
            }
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2",
            "tangentStart": {
              "x": -21,
              "y": 75
            },
            "tangentEnd": {
              "x": 35.25,
              "y": -42.75
            }
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3",
            "tangentStart": {
              "x": -35.25,
              "y": 42.75
            },
            "tangentEnd": {
              "x": 34.5,
              "y": -25.5
            }
          }
        ],
        "closed": false,
        "trailName": "Path"
      },
      "fill": {
        "kind": "none"
      },
      "strokeZero": true
    },
    {
      "id": "veridian_diamond_a_out",
      "kind": "path",
      "name": "Veridian North Wing (Outside)",
      "slot": "emblem-part",
      "role": "emblem-part",
      "parentId": "emblem_assembly",
      "layer": 1,
      "range": {
        "startFrame": 217,
        "durationFrames": 53
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 330,
        "height": 330,
        "rotation": -80,
        "originX": 0.5,
        "originY": 0.5
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 165,
            "y": 0,
            "cornerRadius": 48
          },
          {
            "id": "v1",
            "x": 330,
            "y": 165,
            "cornerRadius": 48
          },
          {
            "id": "v2",
            "x": 165,
            "y": 330,
            "cornerRadius": 48
          },
          {
            "id": "v3",
            "x": 0,
            "y": 165,
            "cornerRadius": 48
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3"
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "linear",
        "angleDeg": 120,
        "stops": [
          {
            "offset": 0,
            "color": "#FF7A59"
          },
          {
            "offset": 0.55,
            "color": "#FFB56B"
          },
          {
            "offset": 1,
            "color": "#FFE082"
          }
        ]
      }
    },
    {
      "id": "veridian_pent_b_out",
      "kind": "path",
      "name": "Veridian South Prism (Outside)",
      "slot": "emblem-part",
      "role": "emblem-part",
      "parentId": "emblem_assembly",
      "layer": 2,
      "range": {
        "startFrame": 223,
        "durationFrames": 47
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 332.87,
        "height": 316.58,
        "rotation": 25,
        "originX": 0.5,
        "originY": 0.5
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 166.43,
            "y": 0,
            "cornerRadius": 46
          },
          {
            "id": "v1",
            "x": 332.87,
            "y": 120.92,
            "cornerRadius": 46
          },
          {
            "id": "v2",
            "x": 269.3,
            "y": 316.58,
            "cornerRadius": 46
          },
          {
            "id": "v3",
            "x": 63.57,
            "y": 316.58,
            "cornerRadius": 46
          },
          {
            "id": "v4",
            "x": 0,
            "y": 120.92,
            "cornerRadius": 46
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3"
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4"
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "radial",
        "domain": {
          "x": 0.14,
          "y": 0.22,
          "width": 0.72,
          "height": 0.72
        },
        "stops": [
          {
            "offset": 0,
            "color": "#80FFDB"
          },
          {
            "offset": 0.5,
            "color": "#5390D9"
          },
          {
            "offset": 1,
            "color": "#6930C3"
          }
        ]
      }
    },
    {
      "id": "veridian_hex_host",
      "kind": "path",
      "name": "Veridian Hexagon Core",
      "slot": "emblem-host",
      "role": "emblem-host",
      "parentId": "emblem_assembly",
      "layer": 3,
      "range": {
        "startFrame": 207,
        "durationFrames": 63
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 571.58,
        "height": 660,
        "rotation": -30,
        "originX": 0.5,
        "originY": 0.5
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 285.79,
            "y": 0,
            "cornerRadius": 68
          },
          {
            "id": "v1",
            "x": 571.58,
            "y": 165,
            "cornerRadius": 68
          },
          {
            "id": "v2",
            "x": 571.58,
            "y": 495,
            "cornerRadius": 68
          },
          {
            "id": "v3",
            "x": 285.79,
            "y": 660,
            "cornerRadius": 68
          },
          {
            "id": "v4",
            "x": 0,
            "y": 495,
            "cornerRadius": 68
          },
          {
            "id": "v5",
            "x": 0,
            "y": 165,
            "cornerRadius": 68
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3"
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4"
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v5"
          },
          {
            "id": "s5",
            "startVertexId": "v5",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "solid",
        "color": "#00D4B2"
      }
    },
    {
      "id": "mask_host_for_veridian_diamond_a",
      "kind": "path",
      "name": "Mask: Veridian Hexagon Core -> Veridian North Wing",
      "slot": "mask-source",
      "role": "mask-source",
      "parentId": "emblem_assembly",
      "layer": 4,
      "range": {
        "startFrame": 207,
        "durationFrames": 63
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 571.58,
        "height": 660,
        "rotation": -30,
        "originX": 0.5,
        "originY": 0.5
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 285.79,
            "y": 0,
            "cornerRadius": 68
          },
          {
            "id": "v1",
            "x": 571.58,
            "y": 165,
            "cornerRadius": 68
          },
          {
            "id": "v2",
            "x": 571.58,
            "y": 495,
            "cornerRadius": 68
          },
          {
            "id": "v3",
            "x": 285.79,
            "y": 660,
            "cornerRadius": 68
          },
          {
            "id": "v4",
            "x": 0,
            "y": 495,
            "cornerRadius": 68
          },
          {
            "id": "v5",
            "x": 0,
            "y": 165,
            "cornerRadius": 68
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3"
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4"
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v5"
          },
          {
            "id": "s5",
            "startVertexId": "v5",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      }
    },
    {
      "id": "veridian_diamond_a_in",
      "kind": "path",
      "name": "Veridian North Wing (Inside Host)",
      "slot": "emblem-part-inside",
      "role": "emblem-part",
      "parentId": "emblem_assembly",
      "layer": 5,
      "range": {
        "startFrame": 217,
        "durationFrames": 53
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 330,
        "height": 330,
        "rotation": -80,
        "originX": 0.5,
        "originY": 0.5
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 165,
            "y": 0,
            "cornerRadius": 48
          },
          {
            "id": "v1",
            "x": 330,
            "y": 165,
            "cornerRadius": 48
          },
          {
            "id": "v2",
            "x": 165,
            "y": 330,
            "cornerRadius": 48
          },
          {
            "id": "v3",
            "x": 0,
            "y": 165,
            "cornerRadius": 48
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3"
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "linear",
        "angleDeg": 220,
        "stops": [
          {
            "offset": 0,
            "color": "#FFFDF7"
          },
          {
            "offset": 0.6,
            "color": "#B8FFF1"
          },
          {
            "offset": 1,
            "color": "#5CE6CC"
          }
        ]
      }
    },
    {
      "id": "mask_host_for_veridian_pent_b",
      "kind": "path",
      "name": "Mask: Veridian Hexagon Core -> Veridian South Prism",
      "slot": "mask-source",
      "role": "mask-source",
      "parentId": "emblem_assembly",
      "layer": 6,
      "range": {
        "startFrame": 207,
        "durationFrames": 63
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 571.58,
        "height": 660,
        "rotation": -30,
        "originX": 0.5,
        "originY": 0.5
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 285.79,
            "y": 0,
            "cornerRadius": 68
          },
          {
            "id": "v1",
            "x": 571.58,
            "y": 165,
            "cornerRadius": 68
          },
          {
            "id": "v2",
            "x": 571.58,
            "y": 495,
            "cornerRadius": 68
          },
          {
            "id": "v3",
            "x": 285.79,
            "y": 660,
            "cornerRadius": 68
          },
          {
            "id": "v4",
            "x": 0,
            "y": 495,
            "cornerRadius": 68
          },
          {
            "id": "v5",
            "x": 0,
            "y": 165,
            "cornerRadius": 68
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3"
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4"
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v5"
          },
          {
            "id": "s5",
            "startVertexId": "v5",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      }
    },
    {
      "id": "veridian_pent_b_in",
      "kind": "path",
      "name": "Veridian South Prism (Inside Host)",
      "slot": "emblem-part-inside",
      "role": "emblem-part",
      "parentId": "emblem_assembly",
      "layer": 7,
      "range": {
        "startFrame": 223,
        "durationFrames": 47
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 332.87,
        "height": 316.58,
        "rotation": 25,
        "originX": 0.5,
        "originY": 0.5
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 166.43,
            "y": 0,
            "cornerRadius": 46
          },
          {
            "id": "v1",
            "x": 332.87,
            "y": 120.92,
            "cornerRadius": 46
          },
          {
            "id": "v2",
            "x": 269.3,
            "y": 316.58,
            "cornerRadius": 46
          },
          {
            "id": "v3",
            "x": 63.57,
            "y": 316.58,
            "cornerRadius": 46
          },
          {
            "id": "v4",
            "x": 0,
            "y": 120.92,
            "cornerRadius": 46
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3"
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4"
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "linear",
        "angleDeg": 260,
        "stops": [
          {
            "offset": 0,
            "color": "#FFE66D"
          },
          {
            "offset": 0.5,
            "color": "#A8FF78"
          },
          {
            "offset": 1,
            "color": "#3BF5C8"
          }
        ]
      }
    },
    {
      "id": "mask_veridian_lens_src",
      "kind": "path",
      "name": "Mask: Veridian North Wing -> Veridian Core Intersection Lens",
      "slot": "mask-source",
      "role": "mask-source",
      "parentId": "emblem_assembly",
      "layer": 8,
      "range": {
        "startFrame": 217,
        "durationFrames": 53
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 330,
        "height": 330,
        "rotation": -80,
        "originX": 0.5,
        "originY": 0.5
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 165,
            "y": 0,
            "cornerRadius": 48
          },
          {
            "id": "v1",
            "x": 330,
            "y": 165,
            "cornerRadius": 48
          },
          {
            "id": "v2",
            "x": 165,
            "y": 330,
            "cornerRadius": 48
          },
          {
            "id": "v3",
            "x": 0,
            "y": 165,
            "cornerRadius": 48
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3"
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      }
    },
    {
      "id": "overlap_veridian_lens_dst",
      "kind": "path",
      "name": "Veridian Core Intersection Lens",
      "slot": "emblem-overlap",
      "role": "emblem-part",
      "parentId": "emblem_assembly",
      "layer": 9,
      "range": {
        "startFrame": 223,
        "durationFrames": 47
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 332.87,
        "height": 316.58,
        "rotation": 25,
        "originX": 0.5,
        "originY": 0.5
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 166.43,
            "y": 0,
            "cornerRadius": 46
          },
          {
            "id": "v1",
            "x": 332.87,
            "y": 120.92,
            "cornerRadius": 46
          },
          {
            "id": "v2",
            "x": 269.3,
            "y": 316.58,
            "cornerRadius": 46
          },
          {
            "id": "v3",
            "x": 63.57,
            "y": 316.58,
            "cornerRadius": 46
          },
          {
            "id": "v4",
            "x": 0,
            "y": 120.92,
            "cornerRadius": 46
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1"
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2"
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3"
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4"
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v0"
          }
        ],
        "closed": true,
        "trailName": "Edge"
      },
      "fill": {
        "kind": "solid",
        "color": "#0E131F"
      }
    }
  ],
  "masks": [
    {
      "id": "mb_in_veridian_diamond_a",
      "name": "Clip Veridian North Wing to Veridian Hexagon Core",
      "sourceObjectId": "mask_host_for_veridian_diamond_a",
      "targetObjectId": "veridian_diamond_a_in",
      "mode": "vector",
      "inverted": false
    },
    {
      "id": "mb_in_veridian_pent_b",
      "name": "Clip Veridian South Prism to Veridian Hexagon Core",
      "sourceObjectId": "mask_host_for_veridian_pent_b",
      "targetObjectId": "veridian_pent_b_in",
      "mode": "vector",
      "inverted": false
    },
    {
      "id": "mb_veridian_lens",
      "name": "Veridian Core Intersection Lens",
      "sourceObjectId": "mask_veridian_lens_src",
      "targetObjectId": "overlap_veridian_lens_dst",
      "mode": "vector",
      "inverted": false
    }
  ],
  "motions": [
    {
      "kind": "scalar",
      "id": "act_intro_blur",
      "name": "Focus pull blur out",
      "targetId": "intro_world",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 226,
      "post": "hold",
      "keys": [
        {
          "id": "intro_blur_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "hold"
          }
        },
        {
          "id": "intro_blur_k1",
          "frame": 193,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "intro_blur_k2",
          "frame": 209,
          "value": 14,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "intro_blur_k3",
          "frame": 225,
          "value": 42
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_intro_fade_out",
      "name": "Fade out intro world",
      "targetId": "intro_world",
      "property": "opacity",
      "mode": "set",
      "stage": "out",
      "startFrame": 215,
      "durationFrames": 12,
      "keys": [
        {
          "id": "intro_out_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "intro_out_k1",
          "frame": 11,
          "value": 0
        }
      ]
    },
    {
      "kind": "shaderParams",
      "id": "central_lime_ribbon__objectFill__fill_chevron_ribbon__keys",
      "name": "Spinning Chevron Ribbon",
      "targetId": "central_lime_ribbon",
      "placementId": "fill_chevron_ribbon",
      "shaderId": "glean_chevron_ribbon_v3",
      "startFrame": 0,
      "durationFrames": 227,
      "tracks": {
        "spinAngle": [
          {
            "id": "rib_spin_0a",
            "frame": 0,
            "value": -20,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuad"
            }
          },
          {
            "id": "rib_spin_0_post",
            "frame": 17,
            "value": -65,
            "easing": {
              "kind": "easing",
              "preset": "easeOutSine"
            }
          },
          {
            "id": "rib_spin_1_pre",
            "frame": 74,
            "value": -70,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_spin_1_hit",
            "frame": 75,
            "value": -92,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "rib_spin_1_post",
            "frame": 92,
            "value": -137,
            "easing": {
              "kind": "easing",
              "preset": "easeOutSine"
            }
          },
          {
            "id": "rib_spin_2_pre",
            "frame": 149,
            "value": -142,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_spin_2_hit",
            "frame": 150,
            "value": -164,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "rib_spin_2_post",
            "frame": 167,
            "value": -209,
            "easing": {
              "kind": "easing",
              "preset": "easeOutSine"
            }
          },
          {
            "id": "rib_spin_end",
            "frame": 225,
            "value": -236
          }
        ],
        "pillarSize": [
          {
            "id": "rib_pil_0",
            "frame": 0,
            "value": 126,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_pil_1",
            "frame": 75,
            "value": 89,
            "easing": {
              "kind": "easing",
              "preset": "easeOutCubic"
            }
          },
          {
            "id": "rib_pil_2",
            "frame": 88,
            "value": 161,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_pil_end",
            "frame": 225,
            "value": 161
          }
        ],
        "baseHalfGap": [
          {
            "id": "rib_gap_0",
            "frame": 0,
            "value": 103,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_gap_1",
            "frame": 75,
            "value": 91,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuad"
            }
          },
          {
            "id": "rib_gap_end",
            "frame": 225,
            "value": 95
          }
        ],
        "fadeHeight": [
          {
            "id": "rib_fade_0",
            "frame": 0,
            "value": 154,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuad"
            }
          },
          {
            "id": "rib_fade_mid",
            "frame": 124,
            "value": 305,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_fade_end",
            "frame": 225,
            "value": 305
          }
        ]
      }
    },
    {
      "kind": "vec2",
      "id": "act_txt_ship_fearless_slide",
      "name": "Ship fearless slide in",
      "targetId": "txt_ship_fearless",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 53,
      "keys": [
        {
          "id": "txt_ship_fearless_move_k0",
          "frame": 0,
          "x": 41,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_ship_fearless_move_k1",
          "frame": 52,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_ship_fearless_track",
      "name": "Ship fearless tracking tighten",
      "targetId": "txt_ship_fearless",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 49,
      "baseValue": -2,
      "keys": [
        {
          "id": "txt_ship_fearless_track_k0",
          "frame": 0,
          "value": 2.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_ship_fearless_track_k1",
          "frame": 48,
          "value": -2
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_agentic_systems_slide",
      "name": "agentic systems slide in",
      "targetId": "txt_agentic_systems",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 75,
      "durationFrames": 53,
      "keys": [
        {
          "id": "txt_agentic_systems_move_k0",
          "frame": 0,
          "x": 53,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_agentic_systems_move_k1",
          "frame": 52,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_agentic_systems_track",
      "name": "agentic systems tracking tighten",
      "targetId": "txt_agentic_systems",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 75,
      "durationFrames": 49,
      "baseValue": -2,
      "keys": [
        {
          "id": "txt_agentic_systems_track_k0",
          "frame": 0,
          "value": 2.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_agentic_systems_track_k1",
          "frame": 48,
          "value": -2
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_at_planetary_scale_slide",
      "name": "at planetary scale slide in",
      "targetId": "txt_at_planetary_scale",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 150,
      "durationFrames": 53,
      "keys": [
        {
          "id": "txt_at_planetary_scale_move_k0",
          "frame": 0,
          "x": 41,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_at_planetary_scale_move_k1",
          "frame": 52,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_at_planetary_scale_track",
      "name": "at planetary scale tracking tighten",
      "targetId": "txt_at_planetary_scale",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 150,
      "durationFrames": 49,
      "baseValue": -2,
      "keys": [
        {
          "id": "txt_at_planetary_scale_track_k0",
          "frame": 0,
          "value": 2.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_at_planetary_scale_track_k1",
          "frame": 48,
          "value": -2
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_orbit_ring_spin",
      "name": "Orbit ring pulsed clockwise spin",
      "targetId": "midground_orbit_ring",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 227,
      "keys": [
        {
          "id": "orb_spin_0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "orb_spin_post_0",
          "frame": 13,
          "value": 59,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "orb_spin_hit_1",
          "frame": 75,
          "value": 91,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "orb_spin_post_1",
          "frame": 88,
          "value": 151,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "orb_spin_hit_2",
          "frame": 150,
          "value": 183,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "orb_spin_post_2",
          "frame": 163,
          "value": 242,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "orb_spin_end",
          "frame": 226,
          "value": 372
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_mid_blue_big_rad",
      "name": "mid_blue_big radial breath",
      "targetId": "mid_blue_big",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 223,
      "keys": [
        {
          "id": "mid_blue_big_rad_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_blue_big_rad_k1",
          "frame": 71,
          "x": 83.01,
          "y": 25.38,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_blue_big_rad_k2",
          "frame": 152,
          "x": 133.88,
          "y": 40.93,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_blue_big_rad_k3",
          "frame": 222,
          "x": 26.78,
          "y": 8.19
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mid_blue_big_crot",
      "name": "Keep sphere lighting upright",
      "targetId": "mid_blue_big",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 227,
      "keys": [
        {
          "id": "mid_blue_big_crot_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "mid_blue_big_crot_k1",
          "frame": 226,
          "value": -360
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_mid_tri_big_rad",
      "name": "mid_tri_big radial breath",
      "targetId": "mid_tri_big",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 223,
      "keys": [
        {
          "id": "mid_tri_big_rad_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_tri_big_rad_k1",
          "frame": 71,
          "x": 26.73,
          "y": -57.31,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_tri_big_rad_k2",
          "frame": 152,
          "x": 43.11,
          "y": -92.44,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_tri_big_rad_k3",
          "frame": 222,
          "x": 8.62,
          "y": -18.49
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mid_tri_big_rot",
      "name": "Fresh Triangle Large gentle spin",
      "targetId": "mid_tri_big",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 227,
      "keys": [
        {
          "id": "mid_tri_big_rot_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "mid_tri_big_rot_k1",
          "frame": 226,
          "value": 78
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_mid_tri_small_rad",
      "name": "mid_tri_small radial breath",
      "targetId": "mid_tri_small",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 223,
      "keys": [
        {
          "id": "mid_tri_small_rad_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_tri_small_rad_k1",
          "frame": 71,
          "x": -11.28,
          "y": 107.29,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_tri_small_rad_k2",
          "frame": 152,
          "x": -18.19,
          "y": 173.05,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_tri_small_rad_k3",
          "frame": 222,
          "x": -3.64,
          "y": 34.61
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mid_tri_small_rot",
      "name": "Fresh Triangle Small gentle spin",
      "targetId": "mid_tri_small",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 227,
      "keys": [
        {
          "id": "mid_tri_small_rot_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "mid_tri_small_rot_k1",
          "frame": 226,
          "value": 80
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_mid_blue_small_rad",
      "name": "mid_blue_small radial breath",
      "targetId": "mid_blue_small",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 75,
      "durationFrames": 148,
      "keys": [
        {
          "id": "mid_blue_small_rad_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_blue_small_rad_k1",
          "frame": 47,
          "x": -69.63,
          "y": -29.55,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_blue_small_rad_k2",
          "frame": 101,
          "x": -112.3,
          "y": -47.67,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_blue_small_rad_k3",
          "frame": 147,
          "x": -22.46,
          "y": -9.53
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mid_blue_small_crot",
      "name": "Keep sphere lighting upright",
      "targetId": "mid_blue_small",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 75,
      "durationFrames": 152,
      "keys": [
        {
          "id": "mid_blue_small_crot_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "mid_blue_small_crot_k1",
          "frame": 151,
          "value": -360
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_mid_warm_tiny_rad",
      "name": "mid_warm_tiny radial breath",
      "targetId": "mid_warm_tiny",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 75,
      "durationFrames": 148,
      "keys": [
        {
          "id": "mid_warm_tiny_rad_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_warm_tiny_rad_k1",
          "frame": 47,
          "x": -62.14,
          "y": 21.4,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_warm_tiny_rad_k2",
          "frame": 101,
          "x": -100.22,
          "y": 34.51,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_warm_tiny_rad_k3",
          "frame": 147,
          "x": -20.04,
          "y": 6.9
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_mid_warm_big_rad",
      "name": "mid_warm_big radial breath",
      "targetId": "mid_warm_big",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 150,
      "durationFrames": 73,
      "keys": [
        {
          "id": "mid_warm_big_rad_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_warm_big_rad_k1",
          "frame": 23,
          "x": -22.24,
          "y": -40.13,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_warm_big_rad_k2",
          "frame": 50,
          "x": -35.88,
          "y": -64.72,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_warm_big_rad_k3",
          "frame": 72,
          "x": -7.18,
          "y": -12.94
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mid_warm_big_rot",
      "name": "Warm Square Large gentle spin",
      "targetId": "mid_warm_big",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 150,
      "durationFrames": 77,
      "keys": [
        {
          "id": "mid_warm_big_rot_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "mid_warm_big_rot_k1",
          "frame": 76,
          "value": -35
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_mid_warm_med_rad",
      "name": "mid_warm_med radial breath",
      "targetId": "mid_warm_med",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 150,
      "durationFrames": 73,
      "keys": [
        {
          "id": "mid_warm_med_rad_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_warm_med_rad_k1",
          "frame": 23,
          "x": 22.05,
          "y": 31.49,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_warm_med_rad_k2",
          "frame": 50,
          "x": 35.56,
          "y": 50.79,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_warm_med_rad_k3",
          "frame": 72,
          "x": 7.11,
          "y": 10.16
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_bokeh_b2_orb_move",
      "name": "Bokeh Orb Beat 2 sweep",
      "targetId": "bokeh_b2_orb",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 75,
      "durationFrames": 22,
      "keys": [
        {
          "id": "bokeh_b2_orb_mv_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "bokeh_b2_orb_mv_k1",
          "frame": 21,
          "x": -187,
          "y": 349
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_bokeh_b2_orb_out",
      "name": "Bokeh Orb Beat 2 exit",
      "targetId": "bokeh_b2_orb",
      "property": "opacity",
      "mode": "set",
      "stage": "out",
      "startFrame": 91,
      "durationFrames": 6,
      "keys": [
        {
          "id": "bokeh_b2_orb_out_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "bokeh_b2_orb_out_k1",
          "frame": 5,
          "value": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_bokeh_b2_warm_move",
      "name": "Bokeh Warm Beat 2 sweep",
      "targetId": "bokeh_b2_warm",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 75,
      "durationFrames": 22,
      "keys": [
        {
          "id": "bokeh_b2_warm_mv_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "bokeh_b2_warm_mv_k1",
          "frame": 21,
          "x": 255,
          "y": -360
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_bokeh_b2_warm_rot",
      "name": "Bokeh Warm Beat 2 rotation",
      "targetId": "bokeh_b2_warm",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 75,
      "durationFrames": 22,
      "keys": [
        {
          "id": "bokeh_b2_warm_rot_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "bokeh_b2_warm_rot_k1",
          "frame": 21,
          "value": 34
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_bokeh_b2_warm_out",
      "name": "Bokeh Warm Beat 2 exit",
      "targetId": "bokeh_b2_warm",
      "property": "opacity",
      "mode": "set",
      "stage": "out",
      "startFrame": 91,
      "durationFrames": 6,
      "keys": [
        {
          "id": "bokeh_b2_warm_out_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "bokeh_b2_warm_out_k1",
          "frame": 5,
          "value": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_bokeh_b3_orb_big_move",
      "name": "Bokeh Orb Sweep Left sweep",
      "targetId": "bokeh_b3_orb_big",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 154,
      "durationFrames": 73,
      "keys": [
        {
          "id": "bokeh_b3_orb_big_mv_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "bokeh_b3_orb_big_mv_k1",
          "frame": 72,
          "x": 400,
          "y": -590
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_bokeh_b3_warm_right_move",
      "name": "Bokeh Warm Sweep Right sweep",
      "targetId": "bokeh_b3_warm_right",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 162,
      "durationFrames": 65,
      "keys": [
        {
          "id": "bokeh_b3_warm_right_mv_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "bokeh_b3_warm_right_mv_k1",
          "frame": 64,
          "x": -595,
          "y": 525
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_bokeh_b3_warm_right_rot",
      "name": "Bokeh Warm Sweep Right rotation",
      "targetId": "bokeh_b3_warm_right",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 162,
      "durationFrames": 65,
      "keys": [
        {
          "id": "bokeh_b3_warm_right_rot_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "bokeh_b3_warm_right_rot_k1",
          "frame": 64,
          "value": 52
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_bokeh_pre_tri_move",
      "name": "Bokeh Fresh Finale sweep",
      "targetId": "bokeh_pre_tri",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 204,
      "durationFrames": 18,
      "keys": [
        {
          "id": "bokeh_pre_tri_mv_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "bokeh_pre_tri_mv_k1",
          "frame": 17,
          "x": 183,
          "y": -445
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_bokeh_pre_tri_rot",
      "name": "Bokeh Fresh Finale rotation",
      "targetId": "bokeh_pre_tri",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 204,
      "durationFrames": 18,
      "keys": [
        {
          "id": "bokeh_pre_tri_rot_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "bokeh_pre_tri_rot_k1",
          "frame": 17,
          "value": -25
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_veridian_diamond_a_out",
      "name": "Follow Path",
      "targetId": "veridian_diamond_a_out",
      "guidePathId": "guide_veridian_diamond_a",
      "orientToPath": false,
      "startFrame": 217,
      "durationFrames": 30,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.28,
        "y1": 0.48,
        "x2": 0.38,
        "y2": 0.9
      }
    },
    {
      "kind": "vec2",
      "id": "sc_veridian_diamond_a_out",
      "name": "Veridian North Wing (Outside) scale",
      "targetId": "veridian_diamond_a_out",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 217,
      "durationFrames": 30,
      "keys": [
        {
          "id": "sc_veridian_diamond_a_out_k0",
          "frame": 0,
          "x": 1.2,
          "y": 1.2,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_veridian_diamond_a_out_k1",
          "frame": 13,
          "x": 1.05,
          "y": 1.05,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_veridian_diamond_a_out_k2",
          "frame": 29,
          "x": 0.9,
          "y": 0.9
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_veridian_diamond_a_out",
      "name": "Veridian North Wing (Outside) spin",
      "targetId": "veridian_diamond_a_out",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 217,
      "durationFrames": 30,
      "keys": [
        {
          "id": "rot_veridian_diamond_a_out_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_veridian_diamond_a_out_k1",
          "frame": 12,
          "value": 69,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_veridian_diamond_a_out_k2",
          "frame": 29,
          "value": 125
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_veridian_pent_b_out",
      "name": "Follow Path",
      "targetId": "veridian_pent_b_out",
      "guidePathId": "guide_veridian_pent_b",
      "orientToPath": false,
      "startFrame": 223,
      "durationFrames": 24,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.18,
        "y1": 0.44,
        "x2": 0.52,
        "y2": 0.94
      }
    },
    {
      "kind": "vec2",
      "id": "sc_veridian_pent_b_out",
      "name": "Veridian South Prism (Outside) scale",
      "targetId": "veridian_pent_b_out",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 223,
      "durationFrames": 24,
      "keys": [
        {
          "id": "sc_veridian_pent_b_out_k0",
          "frame": 0,
          "x": 1.22,
          "y": 1.22,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_veridian_pent_b_out_k1",
          "frame": 10,
          "x": 1.08,
          "y": 1.08,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_veridian_pent_b_out_k2",
          "frame": 23,
          "x": 0.94,
          "y": 0.94
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_veridian_pent_b_out",
      "name": "Veridian South Prism (Outside) spin",
      "targetId": "veridian_pent_b_out",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 223,
      "durationFrames": 24,
      "keys": [
        {
          "id": "rot_veridian_pent_b_out_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_veridian_pent_b_out_k1",
          "frame": 10,
          "value": -52,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_veridian_pent_b_out_k2",
          "frame": 23,
          "value": -95
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_veridian_hex_host",
      "name": "Follow Path",
      "targetId": "veridian_hex_host",
      "guidePathId": "guide_veridian_hex_host",
      "orientToPath": false,
      "startFrame": 207,
      "durationFrames": 40,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.16,
        "y1": 0.82,
        "x2": 0.44,
        "y2": 1
      }
    },
    {
      "kind": "vec2",
      "id": "sc_veridian_hex_host",
      "name": "Veridian Hexagon Core scale",
      "targetId": "veridian_hex_host",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 207,
      "durationFrames": 40,
      "keys": [
        {
          "id": "sc_veridian_hex_host_k0",
          "frame": 0,
          "x": 1.18,
          "y": 1.18,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_veridian_hex_host_k1",
          "frame": 18,
          "x": 1.02,
          "y": 1.02,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_veridian_hex_host_k2",
          "frame": 39,
          "x": 0.82,
          "y": 0.82
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_veridian_hex_host",
      "name": "Veridian Hexagon Core spin",
      "targetId": "veridian_hex_host",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 207,
      "durationFrames": 40,
      "keys": [
        {
          "id": "rot_veridian_hex_host_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_veridian_hex_host_k1",
          "frame": 16,
          "value": 17,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_veridian_hex_host_k2",
          "frame": 39,
          "value": 30
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_mask_host_for_veridian_diamond_a",
      "name": "Follow Path",
      "targetId": "mask_host_for_veridian_diamond_a",
      "guidePathId": "guide_veridian_hex_host",
      "orientToPath": false,
      "startFrame": 207,
      "durationFrames": 40,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.16,
        "y1": 0.82,
        "x2": 0.44,
        "y2": 1
      }
    },
    {
      "kind": "vec2",
      "id": "sc_mask_host_for_veridian_diamond_a",
      "name": "Mask Veridian Hexagon Core scale",
      "targetId": "mask_host_for_veridian_diamond_a",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 207,
      "durationFrames": 40,
      "keys": [
        {
          "id": "sc_mask_host_for_veridian_diamond_a_k0",
          "frame": 0,
          "x": 1.18,
          "y": 1.18,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_host_for_veridian_diamond_a_k1",
          "frame": 18,
          "x": 1.02,
          "y": 1.02,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_host_for_veridian_diamond_a_k2",
          "frame": 39,
          "x": 0.82,
          "y": 0.82
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_mask_host_for_veridian_diamond_a",
      "name": "Mask Veridian Hexagon Core spin",
      "targetId": "mask_host_for_veridian_diamond_a",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 207,
      "durationFrames": 40,
      "keys": [
        {
          "id": "rot_mask_host_for_veridian_diamond_a_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_mask_host_for_veridian_diamond_a_k1",
          "frame": 16,
          "value": 17,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_mask_host_for_veridian_diamond_a_k2",
          "frame": 39,
          "value": 30
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_veridian_diamond_a_in",
      "name": "Follow Path",
      "targetId": "veridian_diamond_a_in",
      "guidePathId": "guide_veridian_diamond_a",
      "orientToPath": false,
      "startFrame": 217,
      "durationFrames": 30,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.28,
        "y1": 0.48,
        "x2": 0.38,
        "y2": 0.9
      }
    },
    {
      "kind": "vec2",
      "id": "sc_veridian_diamond_a_in",
      "name": "Veridian North Wing (Inside Host) scale",
      "targetId": "veridian_diamond_a_in",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 217,
      "durationFrames": 30,
      "keys": [
        {
          "id": "sc_veridian_diamond_a_in_k0",
          "frame": 0,
          "x": 1.2,
          "y": 1.2,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_veridian_diamond_a_in_k1",
          "frame": 13,
          "x": 1.05,
          "y": 1.05,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_veridian_diamond_a_in_k2",
          "frame": 29,
          "x": 0.9,
          "y": 0.9
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_veridian_diamond_a_in",
      "name": "Veridian North Wing (Inside Host) spin",
      "targetId": "veridian_diamond_a_in",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 217,
      "durationFrames": 30,
      "keys": [
        {
          "id": "rot_veridian_diamond_a_in_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_veridian_diamond_a_in_k1",
          "frame": 12,
          "value": 69,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_veridian_diamond_a_in_k2",
          "frame": 29,
          "value": 125
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_mask_host_for_veridian_pent_b",
      "name": "Follow Path",
      "targetId": "mask_host_for_veridian_pent_b",
      "guidePathId": "guide_veridian_hex_host",
      "orientToPath": false,
      "startFrame": 207,
      "durationFrames": 40,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.16,
        "y1": 0.82,
        "x2": 0.44,
        "y2": 1
      }
    },
    {
      "kind": "vec2",
      "id": "sc_mask_host_for_veridian_pent_b",
      "name": "Mask Veridian Hexagon Core scale",
      "targetId": "mask_host_for_veridian_pent_b",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 207,
      "durationFrames": 40,
      "keys": [
        {
          "id": "sc_mask_host_for_veridian_pent_b_k0",
          "frame": 0,
          "x": 1.18,
          "y": 1.18,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_host_for_veridian_pent_b_k1",
          "frame": 18,
          "x": 1.02,
          "y": 1.02,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_host_for_veridian_pent_b_k2",
          "frame": 39,
          "x": 0.82,
          "y": 0.82
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_mask_host_for_veridian_pent_b",
      "name": "Mask Veridian Hexagon Core spin",
      "targetId": "mask_host_for_veridian_pent_b",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 207,
      "durationFrames": 40,
      "keys": [
        {
          "id": "rot_mask_host_for_veridian_pent_b_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_mask_host_for_veridian_pent_b_k1",
          "frame": 16,
          "value": 17,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_mask_host_for_veridian_pent_b_k2",
          "frame": 39,
          "value": 30
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_veridian_pent_b_in",
      "name": "Follow Path",
      "targetId": "veridian_pent_b_in",
      "guidePathId": "guide_veridian_pent_b",
      "orientToPath": false,
      "startFrame": 223,
      "durationFrames": 24,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.18,
        "y1": 0.44,
        "x2": 0.52,
        "y2": 0.94
      }
    },
    {
      "kind": "vec2",
      "id": "sc_veridian_pent_b_in",
      "name": "Veridian South Prism (Inside Host) scale",
      "targetId": "veridian_pent_b_in",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 223,
      "durationFrames": 24,
      "keys": [
        {
          "id": "sc_veridian_pent_b_in_k0",
          "frame": 0,
          "x": 1.22,
          "y": 1.22,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_veridian_pent_b_in_k1",
          "frame": 10,
          "x": 1.08,
          "y": 1.08,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_veridian_pent_b_in_k2",
          "frame": 23,
          "x": 0.94,
          "y": 0.94
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_veridian_pent_b_in",
      "name": "Veridian South Prism (Inside Host) spin",
      "targetId": "veridian_pent_b_in",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 223,
      "durationFrames": 24,
      "keys": [
        {
          "id": "rot_veridian_pent_b_in_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_veridian_pent_b_in_k1",
          "frame": 10,
          "value": -52,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_veridian_pent_b_in_k2",
          "frame": 23,
          "value": -95
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_mask_veridian_lens_src",
      "name": "Follow Path",
      "targetId": "mask_veridian_lens_src",
      "guidePathId": "guide_veridian_diamond_a",
      "orientToPath": false,
      "startFrame": 217,
      "durationFrames": 30,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.28,
        "y1": 0.48,
        "x2": 0.38,
        "y2": 0.9
      }
    },
    {
      "kind": "vec2",
      "id": "sc_mask_veridian_lens_src",
      "name": "Mask Veridian North Wing scale",
      "targetId": "mask_veridian_lens_src",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 217,
      "durationFrames": 30,
      "keys": [
        {
          "id": "sc_mask_veridian_lens_src_k0",
          "frame": 0,
          "x": 1.2,
          "y": 1.2,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_veridian_lens_src_k1",
          "frame": 13,
          "x": 1.05,
          "y": 1.05,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_veridian_lens_src_k2",
          "frame": 29,
          "x": 0.9,
          "y": 0.9
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_mask_veridian_lens_src",
      "name": "Mask Veridian North Wing spin",
      "targetId": "mask_veridian_lens_src",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 217,
      "durationFrames": 30,
      "keys": [
        {
          "id": "rot_mask_veridian_lens_src_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_mask_veridian_lens_src_k1",
          "frame": 12,
          "value": 69,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_mask_veridian_lens_src_k2",
          "frame": 29,
          "value": 125
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_overlap_veridian_lens_dst",
      "name": "Follow Path",
      "targetId": "overlap_veridian_lens_dst",
      "guidePathId": "guide_veridian_pent_b",
      "orientToPath": false,
      "startFrame": 223,
      "durationFrames": 24,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.18,
        "y1": 0.44,
        "x2": 0.52,
        "y2": 0.94
      }
    },
    {
      "kind": "vec2",
      "id": "sc_overlap_veridian_lens_dst",
      "name": "Veridian Core Intersection Lens scale",
      "targetId": "overlap_veridian_lens_dst",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 223,
      "durationFrames": 24,
      "keys": [
        {
          "id": "sc_overlap_veridian_lens_dst_k0",
          "frame": 0,
          "x": 1.22,
          "y": 1.22,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_overlap_veridian_lens_dst_k1",
          "frame": 10,
          "x": 1.08,
          "y": 1.08,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_overlap_veridian_lens_dst_k2",
          "frame": 23,
          "x": 0.94,
          "y": 0.94
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_overlap_veridian_lens_dst",
      "name": "Veridian Core Intersection Lens spin",
      "targetId": "overlap_veridian_lens_dst",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 223,
      "durationFrames": 24,
      "keys": [
        {
          "id": "rot_overlap_veridian_lens_dst_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_overlap_veridian_lens_dst_k1",
          "frame": 10,
          "value": -52,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_overlap_veridian_lens_dst_k2",
          "frame": 23,
          "value": -95
        }
      ]
    }
  ],
  "annotations": {
    "primitiveName": "statement-converge",
    "beatFrames": [
      0,
      75,
      150
    ],
    "convergeStartFrame": 207,
    "emblemSettleFrame": 246,
    "focalBounds": {
      "x": 314,
      "y": 216,
      "width": 651,
      "height": 285
    },
    "safeMargin": {
      "x": 102,
      "y": 65
    }
  }
} as const;
const SVG_PATHS: Record<string, string> = {
  "mid_tri_big": "M 68.56 51 C 84.81 22.85, 111.19 22.85, 127.44 51 L 166.55 118.74 C 182.81 146.89, 169.62 169.74, 137.11 169.74 L 58.89 169.74 C 26.38 169.74, 13.19 146.89, 29.45 118.74 Z",
  "mid_tri_small": "M 30.01 22.5 C 37.18 10.08, 48.82 10.08, 55.99 22.5 L 73.01 51.98 C 80.18 64.4, 74.36 74.48, 60.02 74.48 L 25.98 74.48 C 11.64 74.48, 5.82 64.4, 12.99 51.98 Z",
  "bokeh_pre_tri": "M 111.5 84 C 138.27 37.63, 181.73 37.63, 208.5 84 L 271.5 193.13 C 298.27 239.5, 276.55 277.13, 223.01 277.13 L 96.99 277.13 C 43.45 277.13, 21.73 239.5, 48.5 193.13 Z",
  "guide_veridian_hex_host": "M 0 520 C 135 364, 300 63, 450 0 C 600 -63, 898 37, 1000 100 C 1102 163, 1134.5 333, 1130 420 C 1125.5 507, 1027 665, 970 680 C 913 695, 816 568, 750 520",
  "guide_veridian_diamond_a": "M 0 505 C 27 424, 54 308.5, 90 235 C 126 161.5, 196.5 50.25, 240 15 C 283.5 -20.25, 338 4.5, 380 0",
  "guide_veridian_pent_b": "M 255 0 C 249 90, 256 225, 235 300 C 214 375, 150.25 457.25, 115 500 C 79.75 542.75, 34.5 559.5, 0 585",
  "veridian_diamond_a_out": "M 131.06 33.94 C 149.79 15.21, 180.21 15.21, 198.94 33.94 L 296.06 131.06 C 314.79 149.79, 314.79 180.21, 296.06 198.94 L 198.94 296.06 C 180.21 314.79, 149.79 314.79, 131.06 296.06 L 33.94 198.94 C 15.21 180.21, 15.21 149.79, 33.94 131.06 Z",
  "veridian_pent_b_out": "M 139.39 19.64 C 154.32 8.8, 178.54 8.8, 193.47 19.64 L 305.83 101.28 C 320.76 112.12, 328.24 135.16, 322.54 152.71 L 279.63 284.79 C 273.93 302.34, 254.33 316.58, 235.88 316.58 L 96.99 316.58 C 78.54 316.58, 58.94 302.34, 53.24 284.79 L 10.33 152.7 C 4.63 135.16, 12.11 112.12, 27.04 101.28 Z",
  "veridian_hex_host": "M 251.79 19.63 C 270.56 8.79, 301.02 8.79, 319.79 19.63 L 537.58 145.37 C 556.35 156.21, 571.58 182.59, 571.58 204.26 L 571.58 455.74 C 571.58 477.41, 556.35 503.79, 537.58 514.63 L 319.79 640.37 C 301.02 651.21, 270.56 651.21, 251.79 640.37 L 34 514.63 C 15.23 503.79, 0 477.41, 0 455.74 L 0 204.26 C 0 182.59, 15.23 156.21, 34 145.37 Z",
  "mask_host_for_veridian_diamond_a": "M 251.79 19.63 C 270.56 8.79, 301.02 8.79, 319.79 19.63 L 537.58 145.37 C 556.35 156.21, 571.58 182.59, 571.58 204.26 L 571.58 455.74 C 571.58 477.41, 556.35 503.79, 537.58 514.63 L 319.79 640.37 C 301.02 651.21, 270.56 651.21, 251.79 640.37 L 34 514.63 C 15.23 503.79, 0 477.41, 0 455.74 L 0 204.26 C 0 182.59, 15.23 156.21, 34 145.37 Z",
  "veridian_diamond_a_in": "M 131.06 33.94 C 149.79 15.21, 180.21 15.21, 198.94 33.94 L 296.06 131.06 C 314.79 149.79, 314.79 180.21, 296.06 198.94 L 198.94 296.06 C 180.21 314.79, 149.79 314.79, 131.06 296.06 L 33.94 198.94 C 15.21 180.21, 15.21 149.79, 33.94 131.06 Z",
  "mask_host_for_veridian_pent_b": "M 251.79 19.63 C 270.56 8.79, 301.02 8.79, 319.79 19.63 L 537.58 145.37 C 556.35 156.21, 571.58 182.59, 571.58 204.26 L 571.58 455.74 C 571.58 477.41, 556.35 503.79, 537.58 514.63 L 319.79 640.37 C 301.02 651.21, 270.56 651.21, 251.79 640.37 L 34 514.63 C 15.23 503.79, 0 477.41, 0 455.74 L 0 204.26 C 0 182.59, 15.23 156.21, 34 145.37 Z",
  "veridian_pent_b_in": "M 139.39 19.64 C 154.32 8.8, 178.54 8.8, 193.47 19.64 L 305.83 101.28 C 320.76 112.12, 328.24 135.16, 322.54 152.71 L 279.63 284.79 C 273.93 302.34, 254.33 316.58, 235.88 316.58 L 96.99 316.58 C 78.54 316.58, 58.94 302.34, 53.24 284.79 L 10.33 152.7 C 4.63 135.16, 12.11 112.12, 27.04 101.28 Z",
  "mask_veridian_lens_src": "M 131.06 33.94 C 149.79 15.21, 180.21 15.21, 198.94 33.94 L 296.06 131.06 C 314.79 149.79, 314.79 180.21, 296.06 198.94 L 198.94 296.06 C 180.21 314.79, 149.79 314.79, 131.06 296.06 L 33.94 198.94 C 15.21 180.21, 15.21 149.79, 33.94 131.06 Z",
  "overlap_veridian_lens_dst": "M 139.39 19.64 C 154.32 8.8, 178.54 8.8, 193.47 19.64 L 305.83 101.28 C 320.76 112.12, 328.24 135.16, 322.54 152.71 L 279.63 284.79 C 273.93 302.34, 254.33 316.58, 235.88 316.58 L 96.99 316.58 C 78.54 316.58, 58.94 302.34, 53.24 284.79 L 10.33 152.7 C 4.63 135.16, 12.11 112.12, 27.04 101.28 Z"
};

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

export const VeridianRebrandElasticShotMetadata = {
  id: "veridian_rebrand_60fps",
  width: 1280,
  height: 720,
  fps: 60,
  durationInFrames: 270,
};

export const VeridianRebrandElasticShot: React.FC = () => {
  const frame = useCurrentFrame();

  const guideTables = useMemo(() => {
    const map = new Map<string, { pts: { x: number; y: number; len: number }[]; total: number }>();
    for (const n of IR_DOCUMENT.nodes as readonly any[]) {
      if (n.kind === "path" && n.role === "guide-path") {
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
    const inRange =
      !node.range ||
      (frame >= node.range.startFrame && frame < node.range.startFrame + node.range.durationFrames);
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
      .filter((n) => n.parentId === parentId && n.role !== "guide-path" && !maskSourceIds.has(n.id))
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
                <g transform={st.transform}>
                  {src.kind === "shape" && src.shape === "ellipse" ? (
                    <ellipse cx={src.base.width / 2} cy={src.base.height / 2} rx={src.base.width / 2} ry={src.base.height / 2} />
                  ) : src.kind === "shape" ? (
                    <rect x={0} y={0} width={src.base.width} height={src.base.height} rx={src.borderRadius ?? 0} />
                  ) : (
                    <path d={SVG_PATHS[src.id]} />
                  )}
                </g>
              </clipPath>
            );
          })}
        </defs>
        {renderSubtree(undefined)}
      </svg>
    </AbsoluteFill>
  );
};
