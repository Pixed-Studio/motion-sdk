import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const IR_DOCUMENT = {
  "id": "adaptive_4lines_3s",
  "name": "Adaptive 4-Line Statement (3.0s @ 30fps)",
  "format": {
    "width": 1280,
    "height": 720,
    "fps": 30,
    "durationFrames": 90
  },
  "scene": {
    "id": "adaptive_4lines_3s__scene-1",
    "name": "Orchestrate autonomous enterprise workflows -> Emblem",
    "durationFrames": 90,
    "backgroundColor": "#F7F2EB"
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
          "defaultValue": 112,
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
          "defaultValue": "#DCFC5E"
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
          "baseHalfGap": 112,
          "chevronSlope": 0.86,
          "fadeHeight": 290,
          "limeColor": "#DCFC5E"
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
      "id": "txt_orchestrate",
      "kind": "text",
      "name": "Orchestrate",
      "slot": "headline-line",
      "role": "focal-text",
      "parentId": "headline_group",
      "layer": 1,
      "base": {
        "x": 444.7,
        "y": 192,
        "width": 390.6,
        "height": 99
      },
      "text": "Orchestrate",
      "fontFamily": "Geist",
      "fontSize": 76,
      "fontWeight": 420,
      "letterSpacing": -1.6,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "txt_autonomous",
      "kind": "text",
      "name": "autonomous",
      "slot": "headline-line",
      "role": "focal-text",
      "parentId": "headline_group",
      "layer": 2,
      "base": {
        "x": 432.5,
        "y": 270,
        "width": 415,
        "height": 99
      },
      "text": "autonomous",
      "fontFamily": "Geist",
      "fontSize": 76,
      "fontWeight": 420,
      "letterSpacing": -1.6,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "txt_enterprise",
      "kind": "text",
      "name": "enterprise",
      "slot": "headline-line",
      "role": "focal-text",
      "parentId": "headline_group",
      "layer": 3,
      "base": {
        "x": 471.26,
        "y": 348,
        "width": 337.48,
        "height": 99
      },
      "text": "enterprise",
      "fontFamily": "Geist",
      "fontSize": 76,
      "fontWeight": 420,
      "letterSpacing": -1.6,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "txt_workflows",
      "kind": "text",
      "name": "workflows",
      "slot": "headline-line",
      "role": "focal-text",
      "parentId": "headline_group",
      "layer": 4,
      "base": {
        "x": 470.46,
        "y": 426,
        "width": 339.08,
        "height": 99
      },
      "text": "workflows",
      "fontFamily": "Geist",
      "fontSize": 76,
      "fontWeight": 420,
      "letterSpacing": -1.6,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
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
        "x": 791.3,
        "y": 356.3,
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
            "color": "#435CFF"
          },
          {
            "offset": 0.55,
            "color": "#2A37E6"
          },
          {
            "offset": 1,
            "color": "#1C24CC"
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
        "x": 646.6,
        "y": 50.8,
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
            "color": "#DBFD49"
          },
          {
            "offset": 0.45,
            "color": "#C6F384"
          },
          {
            "offset": 1,
            "color": "#B3E8CF"
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
        "x": 574.3,
        "y": 539.1,
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
            "color": "#DBFD49"
          },
          {
            "offset": 0.45,
            "color": "#C6F384"
          },
          {
            "offset": 1,
            "color": "#B3E8CF"
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
        "startFrame": 14,
        "durationFrames": 66
      },
      "base": {
        "x": 394.7,
        "y": 242.6,
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
            "color": "#435CFF"
          },
          {
            "offset": 0.55,
            "color": "#2A37E6"
          },
          {
            "offset": 1,
            "color": "#1C24CC"
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
        "startFrame": 14,
        "durationFrames": 66
      },
      "base": {
        "x": 417.2,
        "y": 411.2,
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
            "color": "#B7D3EB"
          },
          {
            "offset": 0.48,
            "color": "#DEC8C4"
          },
          {
            "offset": 1,
            "color": "#FFA488"
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
        "startFrame": 27,
        "durationFrames": 53
      },
      "base": {
        "x": 441.5,
        "y": 51.8,
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
            "color": "#B7D3EB"
          },
          {
            "offset": 0.48,
            "color": "#DEC8C4"
          },
          {
            "offset": 1,
            "color": "#FFA488"
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
        "startFrame": 27,
        "durationFrames": 53
      },
      "base": {
        "x": 759.7,
        "y": 546.4,
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
            "color": "#B7D3EB"
          },
          {
            "offset": 0.48,
            "color": "#DEC8C4"
          },
          {
            "offset": 1,
            "color": "#FFA488"
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
        "startFrame": 14,
        "durationFrames": 11
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
            "color": "#435CFF"
          },
          {
            "offset": 0.55,
            "color": "#2A37E6"
          },
          {
            "offset": 1,
            "color": "#1C24CC"
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
        "startFrame": 14,
        "durationFrames": 11
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
            "color": "#B7D3EB"
          },
          {
            "offset": 0.48,
            "color": "#DEC8C4"
          },
          {
            "offset": 1,
            "color": "#FFA488"
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
        "startFrame": 29,
        "durationFrames": 41
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
            "color": "#435CFF"
          },
          {
            "offset": 0.55,
            "color": "#2A37E6"
          },
          {
            "offset": 1,
            "color": "#1C24CC"
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
        "startFrame": 33,
        "durationFrames": 37
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
            "color": "#B7D3EB"
          },
          {
            "offset": 0.48,
            "color": "#DEC8C4"
          },
          {
            "offset": 1,
            "color": "#FFA488"
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
        "startFrame": 67,
        "durationFrames": 9
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
            "color": "#DBFD49"
          },
          {
            "offset": 0.45,
            "color": "#C6F384"
          },
          {
            "offset": 1,
            "color": "#B3E8CF"
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
      "id": "guide_hero_host_circle",
      "kind": "path",
      "name": "Guide: Hero Brand Circle",
      "slot": "guide-path",
      "role": "guide-path",
      "parentId": "emblem_assembly",
      "layer": 30,
      "base": {
        "x": -90,
        "y": -210,
        "width": 1147,
        "height": 795,
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
            "x": 450,
            "y": 0
          },
          {
            "id": "v2",
            "x": 930,
            "y": 90
          },
          {
            "id": "v3",
            "x": 1147,
            "y": 349
          },
          {
            "id": "v4",
            "x": 1129,
            "y": 601
          },
          {
            "id": "v5",
            "x": 1009,
            "y": 747
          },
          {
            "id": "v6",
            "x": 875,
            "y": 795
          },
          {
            "id": "v7",
            "x": 767,
            "y": 777
          },
          {
            "id": "v8",
            "x": 664,
            "y": 672
          },
          {
            "id": "v9",
            "x": 665,
            "y": 584
          },
          {
            "id": "v10",
            "x": 698,
            "y": 547
          },
          {
            "id": "v11",
            "x": 724,
            "y": 545
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1",
            "tangentStart": {
              "x": 135,
              "y": -151.5
            },
            "tangentEnd": {
              "x": -139.5,
              "y": 62.25
            }
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2",
            "tangentStart": {
              "x": 139.5,
              "y": -62.25
            },
            "tangentEnd": {
              "x": -104.55,
              "y": -52.35
            }
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3",
            "tangentStart": {
              "x": 104.55,
              "y": 52.35
            },
            "tangentEnd": {
              "x": -29.85,
              "y": -76.65
            }
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4",
            "tangentStart": {
              "x": 29.85,
              "y": 76.65
            },
            "tangentEnd": {
              "x": 20.7,
              "y": -59.7
            }
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v5",
            "tangentStart": {
              "x": -20.7,
              "y": 59.7
            },
            "tangentEnd": {
              "x": 38.1,
              "y": -29.1
            }
          },
          {
            "id": "s5",
            "startVertexId": "v5",
            "endVertexId": "v6",
            "tangentStart": {
              "x": -38.1,
              "y": 29.1
            },
            "tangentEnd": {
              "x": 36.3,
              "y": -4.5
            }
          },
          {
            "id": "s6",
            "startVertexId": "v6",
            "endVertexId": "v7",
            "tangentStart": {
              "x": -36.3,
              "y": 4.5
            },
            "tangentEnd": {
              "x": 31.65,
              "y": 18.45
            }
          },
          {
            "id": "s7",
            "startVertexId": "v7",
            "endVertexId": "v8",
            "tangentStart": {
              "x": -31.65,
              "y": -18.45
            },
            "tangentEnd": {
              "x": 15.3,
              "y": 28.95
            }
          },
          {
            "id": "s8",
            "startVertexId": "v8",
            "endVertexId": "v9",
            "tangentStart": {
              "x": -15.3,
              "y": -28.95
            },
            "tangentEnd": {
              "x": -5.1,
              "y": 18.75
            }
          },
          {
            "id": "s9",
            "startVertexId": "v9",
            "endVertexId": "v10",
            "tangentStart": {
              "x": 5.1,
              "y": -18.75
            },
            "tangentEnd": {
              "x": -8.85,
              "y": 5.85
            }
          },
          {
            "id": "s10",
            "startVertexId": "v10",
            "endVertexId": "v11",
            "tangentStart": {
              "x": 8.85,
              "y": -5.85
            },
            "tangentEnd": {
              "x": -7.8,
              "y": 0.6
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
      "id": "guide_hero_sq",
      "kind": "path",
      "name": "Guide: Hero Square",
      "slot": "guide-path",
      "role": "guide-path",
      "parentId": "emblem_assembly",
      "layer": 31,
      "base": {
        "x": 252,
        "y": 180,
        "width": 385,
        "height": 565,
        "opacity": 0
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 13,
            "y": 565
          },
          {
            "id": "v1",
            "x": 0,
            "y": 390
          },
          {
            "id": "v2",
            "x": 23,
            "y": 257
          },
          {
            "id": "v3",
            "x": 123,
            "y": 60
          },
          {
            "id": "v4",
            "x": 247,
            "y": 0
          },
          {
            "id": "v5",
            "x": 329,
            "y": 7
          },
          {
            "id": "v6",
            "x": 385,
            "y": 45
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1",
            "tangentStart": {
              "x": -3.9,
              "y": -52.5
            },
            "tangentEnd": {
              "x": -1.5,
              "y": 46.2
            }
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2",
            "tangentStart": {
              "x": 1.5,
              "y": -46.2
            },
            "tangentEnd": {
              "x": -18.45,
              "y": 49.5
            }
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3",
            "tangentStart": {
              "x": 18.45,
              "y": -49.5
            },
            "tangentEnd": {
              "x": -33.6,
              "y": 38.55
            }
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4",
            "tangentStart": {
              "x": 33.6,
              "y": -38.55
            },
            "tangentEnd": {
              "x": -30.9,
              "y": 7.95
            }
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v5",
            "tangentStart": {
              "x": 30.9,
              "y": -7.95
            },
            "tangentEnd": {
              "x": -20.7,
              "y": -6.75
            }
          },
          {
            "id": "s5",
            "startVertexId": "v5",
            "endVertexId": "v6",
            "tangentStart": {
              "x": 20.7,
              "y": 6.75
            },
            "tangentEnd": {
              "x": -16.8,
              "y": -11.4
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
      "id": "guide_hero_tri",
      "kind": "path",
      "name": "Guide: Hero Triangle",
      "slot": "guide-path",
      "role": "guide-path",
      "parentId": "emblem_assembly",
      "layer": 32,
      "base": {
        "x": 732,
        "y": -135,
        "width": 202,
        "height": 565,
        "opacity": 0
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 23,
            "y": 0
          },
          {
            "id": "v1",
            "x": 160,
            "y": 165
          },
          {
            "id": "v2",
            "x": 202,
            "y": 273
          },
          {
            "id": "v3",
            "x": 196,
            "y": 380
          },
          {
            "id": "v4",
            "x": 120,
            "y": 503
          },
          {
            "id": "v5",
            "x": 30,
            "y": 557
          },
          {
            "id": "v6",
            "x": 0,
            "y": 565
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1",
            "tangentStart": {
              "x": 41.1,
              "y": 49.5
            },
            "tangentEnd": {
              "x": -26.85,
              "y": -40.95
            }
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2",
            "tangentStart": {
              "x": 26.85,
              "y": 40.95
            },
            "tangentEnd": {
              "x": -5.4,
              "y": -32.25
            }
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3",
            "tangentStart": {
              "x": 5.4,
              "y": 32.25
            },
            "tangentEnd": {
              "x": 12.3,
              "y": -34.5
            }
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4",
            "tangentStart": {
              "x": -12.3,
              "y": 34.5
            },
            "tangentEnd": {
              "x": 24.9,
              "y": -26.55
            }
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v5",
            "tangentStart": {
              "x": -24.9,
              "y": 26.55
            },
            "tangentEnd": {
              "x": 18,
              "y": -9.3
            }
          },
          {
            "id": "s5",
            "startVertexId": "v5",
            "endVertexId": "v6",
            "tangentStart": {
              "x": -18,
              "y": 9.3
            },
            "tangentEnd": {
              "x": 9,
              "y": -2.4
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
      "id": "hero_sq_out",
      "kind": "shape",
      "name": "Hero Square (Outside)",
      "slot": "emblem-part",
      "role": "emblem-part",
      "parentId": "emblem_assembly",
      "layer": 1,
      "range": {
        "startFrame": 76,
        "durationFrames": 14
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 300,
        "height": 300,
        "rotation": -106
      },
      "shape": "rectangle",
      "borderRadius": 56,
      "fill": {
        "kind": "linear",
        "angleDeg": 115,
        "stops": [
          {
            "offset": 0,
            "color": "#FFA385"
          },
          {
            "offset": 0.55,
            "color": "#D6C9CF"
          },
          {
            "offset": 1,
            "color": "#B8CCE5"
          }
        ]
      }
    },
    {
      "id": "hero_tri_out",
      "kind": "path",
      "name": "Hero Triangle (Outside)",
      "slot": "emblem-part",
      "role": "emblem-part",
      "parentId": "emblem_assembly",
      "layer": 2,
      "range": {
        "startFrame": 79,
        "durationFrames": 11
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 360,
        "height": 311.77,
        "rotation": -10,
        "originX": 0.5,
        "originY": 0.62
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 180,
            "y": 0,
            "cornerRadius": 66
          },
          {
            "id": "v1",
            "x": 360,
            "y": 311.77,
            "cornerRadius": 66
          },
          {
            "id": "v2",
            "x": 0,
            "y": 311.77,
            "cornerRadius": 66
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
            "color": "#DBFD49"
          },
          {
            "offset": 0.45,
            "color": "#C6F384"
          },
          {
            "offset": 1,
            "color": "#B3E8CF"
          }
        ]
      }
    },
    {
      "id": "hero_host_circle",
      "kind": "shape",
      "name": "Hero Brand Circle",
      "slot": "emblem-host",
      "role": "emblem-host",
      "parentId": "emblem_assembly",
      "layer": 3,
      "range": {
        "startFrame": 70,
        "durationFrames": 20
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 700,
        "height": 700
      },
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#333CEE"
      }
    },
    {
      "id": "mask_host_for_hero_sq",
      "kind": "shape",
      "name": "Mask: Hero Brand Circle -> Hero Square",
      "slot": "mask-source",
      "role": "mask-source",
      "parentId": "emblem_assembly",
      "layer": 4,
      "range": {
        "startFrame": 70,
        "durationFrames": 20
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 700,
        "height": 700
      },
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      }
    },
    {
      "id": "hero_sq_in",
      "kind": "shape",
      "name": "Hero Square (Inside Host)",
      "slot": "emblem-part-inside",
      "role": "emblem-part",
      "parentId": "emblem_assembly",
      "layer": 5,
      "range": {
        "startFrame": 76,
        "durationFrames": 14
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 300,
        "height": 300,
        "rotation": -106
      },
      "shape": "rectangle",
      "borderRadius": 56,
      "fill": {
        "kind": "linear",
        "angleDeg": 235,
        "stops": [
          {
            "offset": 0,
            "color": "#DDF05B"
          },
          {
            "offset": 0.65,
            "color": "#CCEE57"
          },
          {
            "offset": 1,
            "color": "#B3E853"
          }
        ]
      }
    },
    {
      "id": "mask_host_for_hero_tri",
      "kind": "shape",
      "name": "Mask: Hero Brand Circle -> Hero Triangle",
      "slot": "mask-source",
      "role": "mask-source",
      "parentId": "emblem_assembly",
      "layer": 6,
      "range": {
        "startFrame": 70,
        "durationFrames": 20
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 700,
        "height": 700
      },
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      }
    },
    {
      "id": "hero_tri_in",
      "kind": "path",
      "name": "Hero Triangle (Inside Host)",
      "slot": "emblem-part-inside",
      "role": "emblem-part",
      "parentId": "emblem_assembly",
      "layer": 7,
      "range": {
        "startFrame": 79,
        "durationFrames": 11
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 360,
        "height": 311.77,
        "rotation": -10,
        "originX": 0.5,
        "originY": 0.62
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 180,
            "y": 0,
            "cornerRadius": 66
          },
          {
            "id": "v1",
            "x": 360,
            "y": 311.77,
            "cornerRadius": 66
          },
          {
            "id": "v2",
            "x": 0,
            "y": 311.77,
            "cornerRadius": 66
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
        "kind": "linear",
        "angleDeg": 265,
        "stops": [
          {
            "offset": 0,
            "color": "#BBE954"
          },
          {
            "offset": 0.5,
            "color": "#8EE151"
          },
          {
            "offset": 1,
            "color": "#62D34D"
          }
        ]
      }
    },
    {
      "id": "mask_hero_xor_src",
      "kind": "shape",
      "name": "Mask: Hero Square -> XOR Cutout (Square intersect Triangle)",
      "slot": "mask-source",
      "role": "mask-source",
      "parentId": "emblem_assembly",
      "layer": 8,
      "range": {
        "startFrame": 76,
        "durationFrames": 14
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 300,
        "height": 300,
        "rotation": -106
      },
      "shape": "rectangle",
      "borderRadius": 56,
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      }
    },
    {
      "id": "overlap_hero_xor_dst",
      "kind": "path",
      "name": "XOR Cutout (Square intersect Triangle)",
      "slot": "emblem-overlap",
      "role": "emblem-part",
      "parentId": "emblem_assembly",
      "layer": 9,
      "range": {
        "startFrame": 79,
        "durationFrames": 11
      },
      "base": {
        "x": 0,
        "y": 0,
        "width": 360,
        "height": 311.77,
        "rotation": -10,
        "originX": 0.5,
        "originY": 0.62
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 180,
            "y": 0,
            "cornerRadius": 66
          },
          {
            "id": "v1",
            "x": 360,
            "y": 311.77,
            "cornerRadius": 66
          },
          {
            "id": "v2",
            "x": 0,
            "y": 311.77,
            "cornerRadius": 66
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
        "kind": "solid",
        "color": "#333CEE"
      }
    }
  ],
  "masks": [
    {
      "id": "mb_in_hero_sq",
      "name": "Clip Hero Square to Hero Brand Circle",
      "sourceObjectId": "mask_host_for_hero_sq",
      "targetObjectId": "hero_sq_in",
      "mode": "vector",
      "inverted": false
    },
    {
      "id": "mb_in_hero_tri",
      "name": "Clip Hero Triangle to Hero Brand Circle",
      "sourceObjectId": "mask_host_for_hero_tri",
      "targetObjectId": "hero_tri_in",
      "mode": "vector",
      "inverted": false
    },
    {
      "id": "mb_hero_xor",
      "name": "XOR Cutout (Square intersect Triangle)",
      "sourceObjectId": "mask_hero_xor_src",
      "targetObjectId": "overlap_hero_xor_dst",
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
      "durationFrames": 79,
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
          "frame": 63,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "intro_blur_k2",
          "frame": 71,
          "value": 14,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "intro_blur_k3",
          "frame": 78,
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
      "startFrame": 74,
      "durationFrames": 6,
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
          "frame": 5,
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
      "durationFrames": 80,
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
            "frame": 8,
            "value": -53,
            "easing": {
              "kind": "easing",
              "preset": "easeOutSine"
            }
          },
          {
            "id": "rib_spin_1_pre",
            "frame": 13,
            "value": -52,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_spin_1_hit",
            "frame": 14,
            "value": -74,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "rib_spin_1_post",
            "frame": 22,
            "value": -107,
            "easing": {
              "kind": "easing",
              "preset": "easeOutSine"
            }
          },
          {
            "id": "rib_spin_2_pre",
            "frame": 26,
            "value": -106,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_spin_2_hit",
            "frame": 27,
            "value": -128,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "rib_spin_2_post",
            "frame": 35,
            "value": -161,
            "easing": {
              "kind": "easing",
              "preset": "easeOutSine"
            }
          },
          {
            "id": "rib_spin_3_pre",
            "frame": 40,
            "value": -160,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_spin_3_hit",
            "frame": 41,
            "value": -182,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "rib_spin_3_post",
            "frame": 49,
            "value": -215,
            "easing": {
              "kind": "easing",
              "preset": "easeOutSine"
            }
          },
          {
            "id": "rib_spin_end",
            "frame": 78,
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
            "frame": 14,
            "value": 89,
            "easing": {
              "kind": "easing",
              "preset": "easeOutCubic"
            }
          },
          {
            "id": "rib_pil_2",
            "frame": 21,
            "value": 161,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_pil_end",
            "frame": 78,
            "value": 161
          }
        ],
        "baseHalfGap": [
          {
            "id": "rib_gap_0",
            "frame": 0,
            "value": 120,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_gap_1",
            "frame": 14,
            "value": 108,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuad"
            }
          },
          {
            "id": "rib_gap_end",
            "frame": 78,
            "value": 112
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
            "frame": 43,
            "value": 305,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "rib_fade_end",
            "frame": 78,
            "value": 305
          }
        ]
      }
    },
    {
      "kind": "vec2",
      "id": "act_txt_orchestrate_slide",
      "name": "Orchestrate slide in",
      "targetId": "txt_orchestrate",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 26,
      "keys": [
        {
          "id": "txt_orchestrate_move_k0",
          "frame": 0,
          "x": 36,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_orchestrate_move_k1",
          "frame": 25,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_orchestrate_track",
      "name": "Orchestrate tracking tighten",
      "targetId": "txt_orchestrate",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 25,
      "baseValue": -1.6,
      "keys": [
        {
          "id": "txt_orchestrate_track_k0",
          "frame": 0,
          "value": 2.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_orchestrate_track_k1",
          "frame": 24,
          "value": -1.6
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_autonomous_slide",
      "name": "autonomous slide in",
      "targetId": "txt_autonomous",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 14,
      "durationFrames": 26,
      "keys": [
        {
          "id": "txt_autonomous_move_k0",
          "frame": 0,
          "x": 47,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_autonomous_move_k1",
          "frame": 25,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_autonomous_track",
      "name": "autonomous tracking tighten",
      "targetId": "txt_autonomous",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 14,
      "durationFrames": 25,
      "baseValue": -1.6,
      "keys": [
        {
          "id": "txt_autonomous_track_k0",
          "frame": 0,
          "value": 2.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_autonomous_track_k1",
          "frame": 24,
          "value": -1.6
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_enterprise_slide",
      "name": "enterprise slide in",
      "targetId": "txt_enterprise",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 27,
      "durationFrames": 26,
      "keys": [
        {
          "id": "txt_enterprise_move_k0",
          "frame": 0,
          "x": 36,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_enterprise_move_k1",
          "frame": 25,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_enterprise_track",
      "name": "enterprise tracking tighten",
      "targetId": "txt_enterprise",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 27,
      "durationFrames": 25,
      "baseValue": -1.6,
      "keys": [
        {
          "id": "txt_enterprise_track_k0",
          "frame": 0,
          "value": 2.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_enterprise_track_k1",
          "frame": 24,
          "value": -1.6
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_workflows_slide",
      "name": "workflows slide in",
      "targetId": "txt_workflows",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 41,
      "durationFrames": 26,
      "keys": [
        {
          "id": "txt_workflows_move_k0",
          "frame": 0,
          "x": 47,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_workflows_move_k1",
          "frame": 25,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_workflows_track",
      "name": "workflows tracking tighten",
      "targetId": "txt_workflows",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 41,
      "durationFrames": 25,
      "baseValue": -1.6,
      "keys": [
        {
          "id": "txt_workflows_track_k0",
          "frame": 0,
          "value": 2.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "txt_workflows_track_k1",
          "frame": 24,
          "value": -1.6
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
      "durationFrames": 80,
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
          "frame": 7,
          "value": 45,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "orb_spin_hit_1",
          "frame": 14,
          "value": 69,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "orb_spin_post_1",
          "frame": 21,
          "value": 113,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "orb_spin_hit_2",
          "frame": 27,
          "value": 137,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "orb_spin_post_2",
          "frame": 34,
          "value": 182,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "orb_spin_hit_3",
          "frame": 41,
          "value": 206,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "orb_spin_post_3",
          "frame": 48,
          "value": 250,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "orb_spin_end",
          "frame": 79,
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
      "durationFrames": 76,
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
          "frame": 24,
          "x": 83.01,
          "y": 25.38,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_blue_big_rad_k2",
          "frame": 52,
          "x": 133.88,
          "y": 40.93,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_blue_big_rad_k3",
          "frame": 75,
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
      "durationFrames": 80,
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
          "frame": 79,
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
      "durationFrames": 76,
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
          "frame": 24,
          "x": 26.73,
          "y": -57.31,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_tri_big_rad_k2",
          "frame": 52,
          "x": 43.11,
          "y": -92.44,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_tri_big_rad_k3",
          "frame": 75,
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
      "durationFrames": 80,
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
          "frame": 79,
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
      "durationFrames": 76,
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
          "frame": 24,
          "x": -11.28,
          "y": 107.29,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_tri_small_rad_k2",
          "frame": 52,
          "x": -18.19,
          "y": 173.05,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_tri_small_rad_k3",
          "frame": 75,
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
      "durationFrames": 80,
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
          "frame": 79,
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
      "startFrame": 14,
      "durationFrames": 62,
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
          "frame": 20,
          "x": -69.63,
          "y": -29.55,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_blue_small_rad_k2",
          "frame": 42,
          "x": -112.3,
          "y": -47.67,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_blue_small_rad_k3",
          "frame": 61,
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
      "startFrame": 14,
      "durationFrames": 66,
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
          "frame": 65,
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
      "startFrame": 14,
      "durationFrames": 62,
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
          "frame": 20,
          "x": -62.14,
          "y": 21.4,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_warm_tiny_rad_k2",
          "frame": 42,
          "x": -100.22,
          "y": 34.51,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_warm_tiny_rad_k3",
          "frame": 61,
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
      "startFrame": 27,
      "durationFrames": 49,
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
          "frame": 16,
          "x": -22.24,
          "y": -40.13,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_warm_big_rad_k2",
          "frame": 33,
          "x": -35.88,
          "y": -64.72,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_warm_big_rad_k3",
          "frame": 48,
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
      "startFrame": 27,
      "durationFrames": 53,
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
          "frame": 52,
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
      "startFrame": 27,
      "durationFrames": 49,
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
          "frame": 16,
          "x": 22.05,
          "y": 31.49,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "mid_warm_med_rad_k2",
          "frame": 33,
          "x": 35.56,
          "y": 50.79,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "mid_warm_med_rad_k3",
          "frame": 48,
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
      "startFrame": 14,
      "durationFrames": 11,
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
          "frame": 10,
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
      "startFrame": 22,
      "durationFrames": 3,
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
          "frame": 2,
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
      "startFrame": 14,
      "durationFrames": 11,
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
          "frame": 10,
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
      "startFrame": 14,
      "durationFrames": 11,
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
          "frame": 10,
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
      "startFrame": 22,
      "durationFrames": 3,
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
          "frame": 2,
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
      "startFrame": 29,
      "durationFrames": 41,
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
          "frame": 40,
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
      "startFrame": 33,
      "durationFrames": 37,
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
          "frame": 36,
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
      "startFrame": 33,
      "durationFrames": 37,
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
          "frame": 36,
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
      "startFrame": 67,
      "durationFrames": 9,
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
          "frame": 8,
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
      "startFrame": 67,
      "durationFrames": 9,
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
          "frame": 8,
          "value": -25
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_hero_sq_out",
      "name": "Follow Path",
      "targetId": "hero_sq_out",
      "guidePathId": "guide_hero_sq",
      "orientToPath": false,
      "startFrame": 76,
      "durationFrames": 14,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.3,
        "y1": 0.45,
        "x2": 0.4,
        "y2": 0.85
      }
    },
    {
      "kind": "vec2",
      "id": "sc_hero_sq_out",
      "name": "Hero Square (Outside) scale",
      "targetId": "hero_sq_out",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "keys": [
        {
          "id": "sc_hero_sq_out_k0",
          "frame": 0,
          "x": 1.24,
          "y": 1.24,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_hero_sq_out_k1",
          "frame": 6,
          "x": 1.113,
          "y": 1.113,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_hero_sq_out_k2",
          "frame": 13,
          "x": 0.913,
          "y": 0.913
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_hero_sq_out",
      "name": "Hero Square (Outside) spin",
      "targetId": "hero_sq_out",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "keys": [
        {
          "id": "rot_hero_sq_out_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_hero_sq_out_k1",
          "frame": 5,
          "value": 130,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_hero_sq_out_k2",
          "frame": 13,
          "value": 237
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_hero_tri_out",
      "name": "Follow Path",
      "targetId": "hero_tri_out",
      "guidePathId": "guide_hero_tri",
      "orientToPath": false,
      "startFrame": 79,
      "durationFrames": 11,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.16,
        "y1": 0.42,
        "x2": 0.56,
        "y2": 0.92
      }
    },
    {
      "kind": "vec2",
      "id": "sc_hero_tri_out",
      "name": "Hero Triangle (Outside) scale",
      "targetId": "hero_tri_out",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "keys": [
        {
          "id": "sc_hero_tri_out_k0",
          "frame": 0,
          "x": 1.22,
          "y": 1.22,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_hero_tri_out_k1",
          "frame": 5,
          "x": 1.11,
          "y": 1.11,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_hero_tri_out_k2",
          "frame": 10,
          "x": 0.98,
          "y": 0.98
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_hero_tri_out",
      "name": "Hero Triangle (Outside) spin",
      "targetId": "hero_tri_out",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "keys": [
        {
          "id": "rot_hero_tri_out_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_hero_tri_out_k1",
          "frame": 4,
          "value": 58,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_hero_tri_out_k2",
          "frame": 10,
          "value": 105
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_hero_host_circle",
      "name": "Follow Path",
      "targetId": "hero_host_circle",
      "guidePathId": "guide_hero_host_circle",
      "orientToPath": false,
      "startFrame": 70,
      "durationFrames": 20,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.15,
        "y1": 0.8,
        "x2": 0.5,
        "y2": 1
      }
    },
    {
      "kind": "vec2",
      "id": "sc_hero_host_circle",
      "name": "Hero Brand Circle scale",
      "targetId": "hero_host_circle",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 70,
      "durationFrames": 20,
      "keys": [
        {
          "id": "sc_hero_host_circle_k0",
          "frame": 0,
          "x": 1.157,
          "y": 1.157,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_hero_host_circle_k1",
          "frame": 9,
          "x": 1.045,
          "y": 1.045,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_hero_host_circle_k2",
          "frame": 19,
          "x": 0.838,
          "y": 0.838
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_mask_host_for_hero_sq",
      "name": "Follow Path",
      "targetId": "mask_host_for_hero_sq",
      "guidePathId": "guide_hero_host_circle",
      "orientToPath": false,
      "startFrame": 70,
      "durationFrames": 20,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.15,
        "y1": 0.8,
        "x2": 0.5,
        "y2": 1
      }
    },
    {
      "kind": "vec2",
      "id": "sc_mask_host_for_hero_sq",
      "name": "Mask Hero Brand Circle scale",
      "targetId": "mask_host_for_hero_sq",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 70,
      "durationFrames": 20,
      "keys": [
        {
          "id": "sc_mask_host_for_hero_sq_k0",
          "frame": 0,
          "x": 1.157,
          "y": 1.157,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_host_for_hero_sq_k1",
          "frame": 9,
          "x": 1.045,
          "y": 1.045,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_host_for_hero_sq_k2",
          "frame": 19,
          "x": 0.838,
          "y": 0.838
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_hero_sq_in",
      "name": "Follow Path",
      "targetId": "hero_sq_in",
      "guidePathId": "guide_hero_sq",
      "orientToPath": false,
      "startFrame": 76,
      "durationFrames": 14,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.3,
        "y1": 0.45,
        "x2": 0.4,
        "y2": 0.85
      }
    },
    {
      "kind": "vec2",
      "id": "sc_hero_sq_in",
      "name": "Hero Square (Inside Host) scale",
      "targetId": "hero_sq_in",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "keys": [
        {
          "id": "sc_hero_sq_in_k0",
          "frame": 0,
          "x": 1.24,
          "y": 1.24,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_hero_sq_in_k1",
          "frame": 6,
          "x": 1.113,
          "y": 1.113,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_hero_sq_in_k2",
          "frame": 13,
          "x": 0.913,
          "y": 0.913
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_hero_sq_in",
      "name": "Hero Square (Inside Host) spin",
      "targetId": "hero_sq_in",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "keys": [
        {
          "id": "rot_hero_sq_in_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_hero_sq_in_k1",
          "frame": 5,
          "value": 130,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_hero_sq_in_k2",
          "frame": 13,
          "value": 237
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_mask_host_for_hero_tri",
      "name": "Follow Path",
      "targetId": "mask_host_for_hero_tri",
      "guidePathId": "guide_hero_host_circle",
      "orientToPath": false,
      "startFrame": 70,
      "durationFrames": 20,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.15,
        "y1": 0.8,
        "x2": 0.5,
        "y2": 1
      }
    },
    {
      "kind": "vec2",
      "id": "sc_mask_host_for_hero_tri",
      "name": "Mask Hero Brand Circle scale",
      "targetId": "mask_host_for_hero_tri",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 70,
      "durationFrames": 20,
      "keys": [
        {
          "id": "sc_mask_host_for_hero_tri_k0",
          "frame": 0,
          "x": 1.157,
          "y": 1.157,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_host_for_hero_tri_k1",
          "frame": 9,
          "x": 1.045,
          "y": 1.045,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_host_for_hero_tri_k2",
          "frame": 19,
          "x": 0.838,
          "y": 0.838
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_hero_tri_in",
      "name": "Follow Path",
      "targetId": "hero_tri_in",
      "guidePathId": "guide_hero_tri",
      "orientToPath": false,
      "startFrame": 79,
      "durationFrames": 11,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.16,
        "y1": 0.42,
        "x2": 0.56,
        "y2": 0.92
      }
    },
    {
      "kind": "vec2",
      "id": "sc_hero_tri_in",
      "name": "Hero Triangle (Inside Host) scale",
      "targetId": "hero_tri_in",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "keys": [
        {
          "id": "sc_hero_tri_in_k0",
          "frame": 0,
          "x": 1.22,
          "y": 1.22,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_hero_tri_in_k1",
          "frame": 5,
          "x": 1.11,
          "y": 1.11,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_hero_tri_in_k2",
          "frame": 10,
          "x": 0.98,
          "y": 0.98
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_hero_tri_in",
      "name": "Hero Triangle (Inside Host) spin",
      "targetId": "hero_tri_in",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "keys": [
        {
          "id": "rot_hero_tri_in_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_hero_tri_in_k1",
          "frame": 4,
          "value": 58,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_hero_tri_in_k2",
          "frame": 10,
          "value": 105
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_mask_hero_xor_src",
      "name": "Follow Path",
      "targetId": "mask_hero_xor_src",
      "guidePathId": "guide_hero_sq",
      "orientToPath": false,
      "startFrame": 76,
      "durationFrames": 14,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.3,
        "y1": 0.45,
        "x2": 0.4,
        "y2": 0.85
      }
    },
    {
      "kind": "vec2",
      "id": "sc_mask_hero_xor_src",
      "name": "Mask Hero Square scale",
      "targetId": "mask_hero_xor_src",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "keys": [
        {
          "id": "sc_mask_hero_xor_src_k0",
          "frame": 0,
          "x": 1.24,
          "y": 1.24,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_hero_xor_src_k1",
          "frame": 6,
          "x": 1.113,
          "y": 1.113,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_mask_hero_xor_src_k2",
          "frame": 13,
          "x": 0.913,
          "y": 0.913
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_mask_hero_xor_src",
      "name": "Mask Hero Square spin",
      "targetId": "mask_hero_xor_src",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "keys": [
        {
          "id": "rot_mask_hero_xor_src_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_mask_hero_xor_src_k1",
          "frame": 5,
          "value": 130,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_mask_hero_xor_src_k2",
          "frame": 13,
          "value": 237
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "fp_overlap_hero_xor_dst",
      "name": "Follow Path",
      "targetId": "overlap_hero_xor_dst",
      "guidePathId": "guide_hero_tri",
      "orientToPath": false,
      "startFrame": 79,
      "durationFrames": 11,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.16,
        "y1": 0.42,
        "x2": 0.56,
        "y2": 0.92
      }
    },
    {
      "kind": "vec2",
      "id": "sc_overlap_hero_xor_dst",
      "name": "XOR Cutout (Square intersect Triangle) scale",
      "targetId": "overlap_hero_xor_dst",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "keys": [
        {
          "id": "sc_overlap_hero_xor_dst_k0",
          "frame": 0,
          "x": 1.22,
          "y": 1.22,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_overlap_hero_xor_dst_k1",
          "frame": 5,
          "x": 1.11,
          "y": 1.11,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "sc_overlap_hero_xor_dst_k2",
          "frame": 10,
          "x": 0.98,
          "y": 0.98
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "rot_overlap_hero_xor_dst",
      "name": "XOR Cutout (Square intersect Triangle) spin",
      "targetId": "overlap_hero_xor_dst",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "keys": [
        {
          "id": "rot_overlap_hero_xor_dst_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_overlap_hero_xor_dst_k1",
          "frame": 4,
          "value": 58,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "rot_overlap_hero_xor_dst_k2",
          "frame": 10,
          "value": 105
        }
      ]
    }
  ],
  "annotations": {
    "primitiveName": "statement-converge",
    "beatFrames": [
      0,
      14,
      27,
      41
    ],
    "convergeStartFrame": 70,
    "emblemSettleFrame": 89,
    "focalBounds": {
      "x": 433,
      "y": 192,
      "width": 415,
      "height": 333
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
  "guide_hero_host_circle": "M 0 505 C 135 353.5, 310.5 62.25, 450 0 C 589.5 -62.25, 825.45 37.65, 930 90 C 1034.55 142.35, 1117.15 272.35, 1147 349 C 1176.85 425.65, 1149.7 541.3, 1129 601 C 1108.3 660.7, 1047.1 717.9, 1009 747 C 970.9 776.1, 911.3 790.5, 875 795 C 838.7 799.5, 798.65 795.45, 767 777 C 735.35 758.55, 679.3 700.95, 664 672 C 648.7 643.05, 659.9 602.75, 665 584 C 670.1 565.25, 689.15 552.85, 698 547 C 706.85 541.15, 716.2 545.6, 724 545",
  "guide_hero_sq": "M 13 565 C 9.1 512.5, -1.5 436.2, 0 390 C 1.5 343.8, 4.55 306.5, 23 257 C 41.45 207.5, 89.4 98.55, 123 60 C 156.6 21.45, 216.1 7.95, 247 0 C 277.9 -7.95, 308.3 0.25, 329 7 C 349.7 13.75, 368.2 33.6, 385 45",
  "guide_hero_tri": "M 23 0 C 64.1 49.5, 133.15 124.05, 160 165 C 186.85 205.95, 196.6 240.75, 202 273 C 207.4 305.25, 208.3 345.5, 196 380 C 183.7 414.5, 144.9 476.45, 120 503 C 95.1 529.55, 48 547.7, 30 557 C 12 566.3, 9 562.6, 0 565",
  "hero_tri_out": "M 122.84 99 C 154.39 44.35, 205.61 44.35, 237.16 99 L 302.84 212.77 C 334.39 267.42, 308.79 311.77, 245.68 311.77 L 114.32 311.77 C 51.21 311.77, 25.61 267.42, 57.16 212.77 Z",
  "hero_tri_in": "M 122.84 99 C 154.39 44.35, 205.61 44.35, 237.16 99 L 302.84 212.77 C 334.39 267.42, 308.79 311.77, 245.68 311.77 L 114.32 311.77 C 51.21 311.77, 25.61 267.42, 57.16 212.77 Z",
  "overlap_hero_xor_dst": "M 122.84 99 C 154.39 44.35, 205.61 44.35, 237.16 99 L 302.84 212.77 C 334.39 267.42, 308.79 311.77, 245.68 311.77 L 114.32 311.77 C 51.21 311.77, 25.61 267.42, 57.16 212.77 Z"
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

export const AdaptiveFourLinesShotMetadata = {
  id: "adaptive_4lines_3s",
  width: 1280,
  height: 720,
  fps: 30,
  durationInFrames: 90,
};

export const AdaptiveFourLinesShot: React.FC = () => {
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
