import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const IR_DOCUMENT = {
  "id": "five_lines_100bpm",
  "name": "Five lines at 100 BPM",
  "format": {
    "width": 1280,
    "height": 720,
    "fps": 30,
    "durationFrames": 90
  },
  "scene": {
    "id": "five_lines_100bpm__scene-1",
    "name": "Plan build test ship with AI -> mark",
    "durationFrames": 90,
    "backgroundColor": "#F7F2EB"
  },
  "shaders": [
    {
      "id": "chevron_ribbon",
      "version": 1,
      "name": "Spinning chevron ribbon",
      "description": "A turning square pillar seen edge-on, open in the middle, fading up and down",
      "cost": "light",
      "sksl": "uniform float4 ms_contentRect;\nuniform float ms_dpr;\nuniform float p_spinAngle;\nuniform float p_pillarSize;\nuniform float p_baseHalfGap;\nuniform float p_chevronSlope;\nuniform float p_fadeHeight;\nuniform float4 p_limeColor;\n\nfloat2 frontProfile(float x, float S, float theta) {\n  float R = S * 0.70710678;\n  float a0 = theta + 0.78539816;\n  float a1 = theta + 2.35619449;\n  float a2 = theta + 3.92699082;\n  float a3 = theta + 5.49778714;\n  float2 v0 = float2(R * sin(a0), R * cos(a0));\n  float2 v1 = float2(R * sin(a1), R * cos(a1));\n  float2 v2 = float2(R * sin(a2), R * cos(a2));\n  float2 v3 = float2(R * sin(a3), R * cos(a3));\n\n  float xMin = min(min(v0.x, v1.x), min(v2.x, v3.x));\n  float xMax = max(max(v0.x, v1.x), max(v2.x, v3.x));\n  float insideX = min(x - xMin, xMax - x);\n\n  float zMax = -1e6;\n  float xc = clamp(x, xMin, xMax);\n  float lo0 = min(v0.x, v1.x); float hi0 = max(v0.x, v1.x);\n  if (hi0 - lo0 > 0.001 && xc >= lo0 - 0.001 && xc <= hi0 + 0.001) {\n    float t = clamp((xc - v0.x) / (v1.x - v0.x), 0.0, 1.0);\n    zMax = max(zMax, mix(v0.y, v1.y, t));\n  }\n  float lo1 = min(v1.x, v2.x); float hi1 = max(v1.x, v2.x);\n  if (hi1 - lo1 > 0.001 && xc >= lo1 - 0.001 && xc <= hi1 + 0.001) {\n    float t = clamp((xc - v1.x) / (v2.x - v1.x), 0.0, 1.0);\n    zMax = max(zMax, mix(v1.y, v2.y, t));\n  }\n  float lo2 = min(v2.x, v3.x); float hi2 = max(v2.x, v3.x);\n  if (hi2 - lo2 > 0.001 && xc >= lo2 - 0.001 && xc <= hi2 + 0.001) {\n    float t = clamp((xc - v2.x) / (v3.x - v2.x), 0.0, 1.0);\n    zMax = max(zMax, mix(v2.y, v3.y, t));\n  }\n  float lo3 = min(v3.x, v0.x); float hi3 = max(v3.x, v0.x);\n  if (hi3 - lo3 > 0.001 && xc >= lo3 - 0.001 && xc <= hi3 + 0.001) {\n    float t = clamp((xc - v3.x) / (v0.x - v3.x), 0.0, 1.0);\n    zMax = max(zMax, mix(v3.y, v0.y, t));\n  }\n  return float2(zMax, insideX);\n}\n\nhalf4 main(float2 fragCoord) {\n  float dpr = max(ms_dpr, 0.001);\n  float2 center = ms_contentRect.xy + 0.5 * ms_contentRect.zw;\n  float2 p = (fragCoord - center) / dpr;\n\n  float theta = p_spinAngle * 0.0174532925;\n  float2 prof = frontProfile(p.x, p_pillarSize, theta);\n  float zFront = prof.x;\n  float insideX = prof.y;\n\n  float aaX = smoothstep(-0.75, 0.75, insideX);\n  if (aaX <= 0.0001) return half4(0.0);\n\n  float innerHalf = max(3.0, p_baseHalfGap - p_chevronSlope * zFront);\n  float ay = abs(p.y);\n  float d = ay - innerHalf;\n\n  float aaInner = smoothstep(-0.75, 0.75, d);\n  float u = clamp(max(d, 0.0) / max(p_fadeHeight, 1.0), 0.0, 1.0);\n  float fadeAlpha = 1.0 - smoothstep(0.0, 1.0, pow(u, 1.2));\n\n  float a = aaX * aaInner * fadeAlpha * p_limeColor.a;\n  float3 rgb = p_limeColor.a > 0.001 ? (p_limeColor.rgb / p_limeColor.a) : float3(0.0);\n  return half4(half3(rgb * a), half(a));\n}",
      "canvas2d": "ctx.clearRect(0, 0, width, height);\nvar R = params.pillarSize * 0.70710678, theta = params.spinAngle * 0.0174532925;\nvar verts = [0.78539816, 2.35619449, 3.92699082, 5.49778714].map(function (a) {\n  return { x: R * Math.sin(theta + a), y: R * Math.cos(theta + a) };\n});\nvar xs = verts.map(function (v) { return v.x; });\nvar xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);\nvar hex = String(params.color).replace(\"#\", \"\");\nvar rgb = parseInt(hex.slice(0, 2), 16) + \",\" + parseInt(hex.slice(2, 4), 16) + \",\" + parseInt(hex.slice(4, 6), 16);\nvar cx = width / 2, cy = height / 2, fade = Math.max(1, params.fadeHeight);\nfor (var px = Math.max(0, Math.floor(cx + xMin)); px <= Math.min(width - 1, Math.ceil(cx + xMax)); px++) {\n  var x = px - cx, z = -1e6;\n  for (var e = 0; e < 4; e++) {\n    var a = verts[e], b = verts[(e + 1) % 4], lo = Math.min(a.x, b.x), hi = Math.max(a.x, b.x);\n    if (hi - lo > 0.001 && x >= lo - 0.5 && x <= hi + 0.5) {\n      var t = Math.max(0, Math.min(1, (x - a.x) / (b.x - a.x)));\n      z = Math.max(z, a.y + (b.y - a.y) * t);\n    }\n  }\n  var inner = Math.max(3, params.baseHalfGap - params.chevronSlope * z);\n  var up = ctx.createLinearGradient(0, cy - inner, 0, cy - inner - fade);\n  up.addColorStop(0, \"rgba(\" + rgb + \",1)\"); up.addColorStop(1, \"rgba(\" + rgb + \",0)\");\n  ctx.fillStyle = up; ctx.fillRect(px, cy - inner - fade, 1, fade);\n  var down = ctx.createLinearGradient(0, cy + inner, 0, cy + inner + fade);\n  down.addColorStop(0, \"rgba(\" + rgb + \",1)\"); down.addColorStop(1, \"rgba(\" + rgb + \",0)\");\n  ctx.fillStyle = down; ctx.fillRect(px, cy + inner, 1, fade);\n}",
      "properties": [
        {
          "id": "spinAngle",
          "label": "Spin angle",
          "type": "number",
          "uniformName": "p_spinAngle",
          "defaultValue": -222,
          "min": -1440,
          "max": 360,
          "step": 1,
          "unit": "deg"
        },
        {
          "id": "pillarSize",
          "label": "Pillar width",
          "type": "number",
          "uniformName": "p_pillarSize",
          "defaultValue": 161,
          "min": 20,
          "max": 640,
          "step": 1,
          "unit": "px"
        },
        {
          "id": "baseHalfGap",
          "label": "Half gap",
          "type": "number",
          "uniformName": "p_baseHalfGap",
          "defaultValue": 144,
          "min": 10,
          "max": 480,
          "step": 1,
          "unit": "px"
        },
        {
          "id": "chevronSlope",
          "label": "Chevron slope",
          "type": "number",
          "uniformName": "p_chevronSlope",
          "defaultValue": 0.86,
          "min": 0,
          "max": 2,
          "step": 0.01
        },
        {
          "id": "fadeHeight",
          "label": "Fade height",
          "type": "number",
          "uniformName": "p_fadeHeight",
          "defaultValue": 290,
          "min": 20,
          "max": 1200,
          "step": 1,
          "unit": "px"
        },
        {
          "id": "color",
          "label": "Ribbon colour",
          "type": "color",
          "uniformName": "p_limeColor",
          "defaultValue": "#DCFC5E"
        }
      ]
    }
  ],
  "nodes": [
    {
      "id": "statement_world",
      "kind": "frame",
      "name": "Statement world",
      "slot": "world-stage",
      "role": "group",
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
      "id": "statement",
      "kind": "frame",
      "name": "Statement",
      "slot": "lines-group",
      "role": "group",
      "plane": "focal",
      "parentId": "statement_world",
      "layer": 3,
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
      "id": "txt_plan",
      "kind": "text",
      "name": "Plan",
      "slot": "lines",
      "role": "subject",
      "plane": "focal",
      "parentId": "statement",
      "layer": 1,
      "base": {
        "x": 561.35,
        "y": 150,
        "width": 157.3,
        "height": 104
      },
      "text": "Plan",
      "fontFamily": "Geist",
      "fontSize": 80,
      "fontWeight": 420,
      "letterSpacing": -1.7,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "txt_build",
      "kind": "text",
      "name": "build",
      "slot": "lines",
      "role": "subject",
      "plane": "focal",
      "parentId": "statement",
      "layer": 2,
      "base": {
        "x": 555,
        "y": 232,
        "width": 170,
        "height": 104
      },
      "text": "build",
      "fontFamily": "Geist",
      "fontSize": 80,
      "fontWeight": 420,
      "letterSpacing": -1.7,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "txt_test",
      "kind": "text",
      "name": "test",
      "slot": "lines",
      "role": "subject",
      "plane": "focal",
      "parentId": "statement",
      "layer": 3,
      "base": {
        "x": 572.15,
        "y": 314,
        "width": 135.7,
        "height": 104
      },
      "text": "test",
      "fontFamily": "Geist",
      "fontSize": 80,
      "fontWeight": 420,
      "letterSpacing": -1.7,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "txt_ship",
      "kind": "text",
      "name": "ship",
      "slot": "lines",
      "role": "subject",
      "plane": "focal",
      "parentId": "statement",
      "layer": 4,
      "base": {
        "x": 567.35,
        "y": 396,
        "width": 145.3,
        "height": 104
      },
      "text": "ship",
      "fontFamily": "Geist",
      "fontSize": 80,
      "fontWeight": 420,
      "letterSpacing": -1.7,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "txt_with_ai",
      "kind": "text",
      "name": "with AI",
      "slot": "lines",
      "role": "subject",
      "plane": "focal",
      "parentId": "statement",
      "layer": 5,
      "base": {
        "x": 519.1,
        "y": 478,
        "width": 241.8,
        "height": 104
      },
      "text": "with AI",
      "fontFamily": "Geist",
      "fontSize": 80,
      "fontWeight": 420,
      "letterSpacing": -1.7,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#000000"
      }
    },
    {
      "id": "backdrop_ribbon",
      "kind": "shape",
      "name": "Backdrop ribbon",
      "slot": "backdrop",
      "role": "ambient",
      "plane": "backdrop",
      "parentId": "statement_world",
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
        "shaderId": "chevron_ribbon",
        "placementId": "fill_chevron_ribbon",
        "params": {
          "spinAngle": -20,
          "pillarSize": 161,
          "baseHalfGap": 144,
          "chevronSlope": 0.86,
          "fadeHeight": 290,
          "color": "#DCFC5E"
        }
      }
    },
    {
      "id": "world_ring",
      "kind": "frame",
      "name": "World ring",
      "slot": "world-ring",
      "role": "group",
      "plane": "midground",
      "parentId": "statement_world",
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
      "name": "Large orb",
      "slot": "world",
      "role": "support",
      "plane": "midground",
      "parentId": "world_ring",
      "layer": 7,
      "kind": "shape",
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
      },
      "base": {
        "x": 751.6,
        "y": 344.1,
        "width": 144,
        "height": 144,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mid_tri_big",
      "name": "Large triangle",
      "slot": "world",
      "role": "support",
      "plane": "midground",
      "parentId": "world_ring",
      "layer": 8,
      "kind": "path",
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
      },
      "base": {
        "x": 631.6,
        "y": 83,
        "width": 196,
        "height": 169.74,
        "rotation": 52,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mid_tri_small",
      "name": "Small triangle",
      "slot": "world",
      "role": "support",
      "plane": "midground",
      "parentId": "world_ring",
      "layer": 9,
      "kind": "path",
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
      },
      "base": {
        "x": 578.7,
        "y": 496.8,
        "width": 86,
        "height": 74.48,
        "rotation": -35,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mid_blue_small",
      "name": "Small orb",
      "slot": "world",
      "role": "support",
      "plane": "midground",
      "parentId": "world_ring",
      "layer": 5,
      "range": {
        "startFrame": 18,
        "durationFrames": 62
      },
      "kind": "shape",
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
      },
      "base": {
        "x": 406.2,
        "y": 247.5,
        "width": 46,
        "height": 46,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mid_warm_tiny",
      "name": "Tiny square",
      "slot": "world",
      "role": "support",
      "plane": "midground",
      "parentId": "world_ring",
      "layer": 4,
      "range": {
        "startFrame": 18,
        "durationFrames": 62
      },
      "kind": "shape",
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
      },
      "base": {
        "x": 455.5,
        "y": 398,
        "width": 38,
        "height": 38,
        "rotation": 18,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mid_warm_big",
      "name": "Large square",
      "slot": "world",
      "role": "support",
      "plane": "midground",
      "parentId": "world_ring",
      "layer": 6,
      "range": {
        "startFrame": 36,
        "durationFrames": 44
      },
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 26,
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
      },
      "base": {
        "x": 429.6,
        "y": 30.4,
        "width": 124,
        "height": 124,
        "rotation": 24,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mid_warm_med",
      "name": "Medium square",
      "slot": "world",
      "role": "support",
      "plane": "midground",
      "parentId": "world_ring",
      "layer": 5,
      "range": {
        "startFrame": 36,
        "durationFrames": 44
      },
      "kind": "shape",
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
      },
      "base": {
        "x": 778.4,
        "y": 573,
        "width": 72,
        "height": 72,
        "rotation": 36,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "foreground",
      "kind": "frame",
      "name": "Foreground",
      "slot": "passes-group",
      "role": "group",
      "plane": "foreground",
      "parentId": "statement_world",
      "layer": 4,
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
      "id": "pass_lead_orb",
      "name": "Lead-in orb",
      "slot": "passes",
      "role": "ambient",
      "plane": "foreground",
      "parentId": "foreground",
      "layer": 10,
      "kind": "shape",
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
      },
      "base": {
        "x": 1030,
        "y": 284,
        "width": 244,
        "height": 244,
        "blur": 40,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "pass_lead_square",
      "name": "Lead-in square",
      "slot": "passes",
      "role": "ambient",
      "plane": "foreground",
      "parentId": "foreground",
      "layer": 11,
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 54,
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
      },
      "base": {
        "x": 77,
        "y": 122,
        "width": 256,
        "height": 256,
        "rotation": 44,
        "blur": 42,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "pass_hold_orb",
      "name": "Slow orb",
      "slot": "passes",
      "role": "ambient",
      "plane": "foreground",
      "parentId": "foreground",
      "layer": 12,
      "kind": "shape",
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
      },
      "base": {
        "x": 63,
        "y": 623,
        "width": 244,
        "height": 244,
        "blur": 40,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "pass_hold_square",
      "name": "Slow square",
      "slot": "passes",
      "role": "ambient",
      "plane": "foreground",
      "parentId": "foreground",
      "layer": 13,
      "kind": "shape",
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
      },
      "base": {
        "x": 1141,
        "y": 101,
        "width": 268,
        "height": 268,
        "rotation": 166,
        "blur": 44,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "pass_hold_small",
      "name": "Slow small orb",
      "slot": "passes",
      "role": "ambient",
      "plane": "foreground",
      "parentId": "foreground",
      "layer": 14,
      "kind": "shape",
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
      },
      "base": {
        "x": 1075,
        "y": -95,
        "width": 100,
        "height": 100,
        "blur": 26,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "pass_burst_square",
      "name": "Burst square",
      "slot": "passes",
      "role": "ambient",
      "plane": "foreground",
      "parentId": "foreground",
      "layer": 15,
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 46,
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
      },
      "base": {
        "x": -44,
        "y": 543,
        "width": 220,
        "height": 220,
        "rotation": 45,
        "blur": 40,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "pass_burst_triangle",
      "name": "Burst triangle",
      "slot": "passes",
      "role": "ambient",
      "plane": "foreground",
      "parentId": "foreground",
      "layer": 16,
      "kind": "path",
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 135,
            "y": 0,
            "cornerRadius": 47
          },
          {
            "id": "v1",
            "x": 270,
            "y": 233.83,
            "cornerRadius": 47
          },
          {
            "id": "v2",
            "x": 0,
            "y": 233.83,
            "cornerRadius": 47
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
      },
      "base": {
        "x": 1029,
        "y": 507.1,
        "width": 270,
        "height": 233.83,
        "blur": 38,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "pass_burst_small",
      "name": "Burst small square",
      "slot": "passes",
      "role": "ambient",
      "plane": "foreground",
      "parentId": "foreground",
      "layer": 17,
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 22,
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
      },
      "base": {
        "x": 167.5,
        "y": -20.5,
        "width": 105,
        "height": 105,
        "rotation": 28,
        "blur": 28,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "pass_exit_square",
      "name": "Exit square",
      "slot": "passes",
      "role": "ambient",
      "plane": "foreground",
      "parentId": "foreground",
      "layer": 18,
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 22,
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
      },
      "base": {
        "x": 1007.5,
        "y": -67.5,
        "width": 105,
        "height": 105,
        "rotation": 20,
        "blur": 26,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "pass_exit_triangle",
      "name": "Exit triangle",
      "slot": "passes",
      "role": "ambient",
      "plane": "foreground",
      "parentId": "foreground",
      "layer": 19,
      "kind": "path",
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
      },
      "base": {
        "x": 50,
        "y": 621.4,
        "width": 320,
        "height": 277.13,
        "blur": 36,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mark",
      "kind": "frame",
      "name": "Mark",
      "slot": "mark-stage",
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
      "id": "guide_mark_square",
      "kind": "path",
      "name": "Guide: Mark square",
      "slot": "guide",
      "role": "guide",
      "parentId": "mark",
      "layer": 41,
      "base": {
        "x": 251.92,
        "y": 180.32,
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
              "x": -1.95,
              "y": -26.25
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
              "x": -8.4,
              "y": -5.7
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
      "id": "mark_square",
      "name": "Mark square",
      "slot": "mark",
      "role": "support",
      "plane": "focal",
      "parentId": "mark",
      "layer": 1,
      "range": {
        "startFrame": 76,
        "durationFrames": 14
      },
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 56,
      "fill": {
        "kind": "linear",
        "angleDeg": 115,
        "stops": [
          {
            "offset": 0,
            "color": "#FFA488"
          },
          {
            "offset": 0.52,
            "color": "#DEC8C4"
          },
          {
            "offset": 1,
            "color": "#B7D3EB"
          }
        ]
      },
      "base": {
        "x": 486.9,
        "y": 75.3,
        "width": 300,
        "height": 300,
        "rotation": -106,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "guide_mark_triangle",
      "kind": "path",
      "name": "Guide: Mark triangle",
      "slot": "guide",
      "role": "guide",
      "parentId": "mark",
      "layer": 42,
      "base": {
        "x": 731.95,
        "y": -134.95,
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
              "x": 20.55,
              "y": 24.75
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
              "x": 4.5,
              "y": -1.2
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
      "id": "mark_triangle",
      "name": "Mark triangle",
      "slot": "mark",
      "role": "support",
      "plane": "focal",
      "parentId": "mark",
      "layer": 2,
      "range": {
        "startFrame": 79,
        "durationFrames": 11
      },
      "kind": "path",
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
      },
      "base": {
        "x": 551.9,
        "y": 236.7,
        "width": 360,
        "height": 311.77,
        "rotation": -10,
        "originX": 0.5,
        "originY": 0.62
      }
    },
    {
      "id": "guide_mark_host",
      "kind": "path",
      "name": "Guide: Mark circle",
      "slot": "guide",
      "role": "guide",
      "parentId": "mark",
      "layer": 43,
      "base": {
        "x": -90.02,
        "y": -209.98,
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
              "x": 67.5,
              "y": -75.75
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
              "x": -3.9,
              "y": 0.3
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
      "id": "mark_host",
      "name": "Mark circle",
      "slot": "mark",
      "role": "carrier",
      "plane": "focal",
      "parentId": "mark",
      "layer": 3,
      "range": {
        "startFrame": 70,
        "durationFrames": 20
      },
      "kind": "shape",
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#333CEE"
      },
      "base": {
        "x": 284,
        "y": -15,
        "width": 700,
        "height": 700,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mask_mark_host_for_mark_square",
      "name": "Mask: Mark circle for Mark square inside the host",
      "slot": "mask",
      "role": "mask",
      "plane": "focal",
      "parentId": "mark",
      "layer": 4,
      "range": {
        "startFrame": 70,
        "durationFrames": 20
      },
      "kind": "shape",
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      },
      "base": {
        "x": 284,
        "y": -15,
        "width": 700,
        "height": 700,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mark_square_over_mark_host",
      "name": "Mark square inside the host",
      "slot": "mark-recolored",
      "role": "support",
      "plane": "focal",
      "parentId": "mark",
      "layer": 5,
      "range": {
        "startFrame": 76,
        "durationFrames": 14
      },
      "kind": "shape",
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
      },
      "base": {
        "x": 486.9,
        "y": 75.3,
        "width": 300,
        "height": 300,
        "rotation": -106,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mask_mark_host_for_mark_triangle",
      "name": "Mask: Mark circle for Mark triangle inside the host",
      "slot": "mask",
      "role": "mask",
      "plane": "focal",
      "parentId": "mark",
      "layer": 6,
      "range": {
        "startFrame": 70,
        "durationFrames": 20
      },
      "kind": "shape",
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      },
      "base": {
        "x": 284,
        "y": -15,
        "width": 700,
        "height": 700,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mark_triangle_over_mark_host",
      "name": "Mark triangle inside the host",
      "slot": "mark-recolored",
      "role": "support",
      "plane": "focal",
      "parentId": "mark",
      "layer": 7,
      "range": {
        "startFrame": 79,
        "durationFrames": 11
      },
      "kind": "path",
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
      },
      "base": {
        "x": 551.9,
        "y": 236.7,
        "width": 360,
        "height": 311.77,
        "rotation": -10,
        "originX": 0.5,
        "originY": 0.62
      }
    },
    {
      "id": "mask_mark_square_for_mark_triangle",
      "name": "Mask: Mark square for Where the square and triangle cross",
      "slot": "mask",
      "role": "mask",
      "plane": "focal",
      "parentId": "mark",
      "layer": 8,
      "range": {
        "startFrame": 76,
        "durationFrames": 14
      },
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 56,
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      },
      "base": {
        "x": 486.9,
        "y": 75.3,
        "width": 300,
        "height": 300,
        "rotation": -106,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "mark_triangle_over_mark_square",
      "name": "Where the square and triangle cross",
      "slot": "mark-recolored",
      "role": "support",
      "plane": "focal",
      "parentId": "mark",
      "layer": 9,
      "range": {
        "startFrame": 79,
        "durationFrames": 11
      },
      "kind": "path",
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
      },
      "base": {
        "x": 551.9,
        "y": 236.7,
        "width": 360,
        "height": 311.77,
        "rotation": -10,
        "originX": 0.5,
        "originY": 0.62
      }
    }
  ],
  "masks": [
    {
      "id": "clip_mark_square_over_mark_host",
      "name": "Mark square inside the host",
      "sourceObjectId": "mask_mark_host_for_mark_square",
      "targetObjectId": "mark_square_over_mark_host",
      "mode": "vector",
      "inverted": false
    },
    {
      "id": "clip_mark_triangle_over_mark_host",
      "name": "Mark triangle inside the host",
      "sourceObjectId": "mask_mark_host_for_mark_triangle",
      "targetObjectId": "mark_triangle_over_mark_host",
      "mode": "vector",
      "inverted": false
    },
    {
      "id": "clip_mark_triangle_over_mark_square",
      "name": "Where the square and triangle cross",
      "sourceObjectId": "mask_mark_square_for_mark_triangle",
      "targetObjectId": "mark_triangle_over_mark_square",
      "mode": "vector",
      "inverted": false
    }
  ],
  "motions": [
    {
      "kind": "vec2",
      "id": "act_txt_plan_slide",
      "name": "Plan arrives",
      "targetId": "txt_plan",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 0,
      "durationFrames": 26,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-1"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_plan_slide_k0",
          "frame": 0,
          "x": 35,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_plan_slide_k1",
          "frame": 25,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_plan_track",
      "name": "Plan closes up",
      "targetId": "txt_plan",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 25,
      "baseValue": -1.7,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-1"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_plan_track_k0",
          "frame": 0,
          "value": 2.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_plan_track_k1",
          "frame": 24,
          "value": -1.7
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_build_slide",
      "name": "build arrives",
      "targetId": "txt_build",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 9,
      "durationFrames": 26,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_build_slide_k0",
          "frame": 0,
          "x": 36,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_build_slide_k1",
          "frame": 25,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_build_track",
      "name": "build closes up",
      "targetId": "txt_build",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 9,
      "durationFrames": 25,
      "baseValue": -1.7,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_build_track_k0",
          "frame": 0,
          "value": 2.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_build_track_k1",
          "frame": 24,
          "value": -1.7
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_test_slide",
      "name": "test arrives",
      "targetId": "txt_test",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 18,
      "durationFrames": 26,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_test_slide_k0",
          "frame": 0,
          "x": 32,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_test_slide_k1",
          "frame": 25,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_test_track",
      "name": "test closes up",
      "targetId": "txt_test",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 18,
      "durationFrames": 25,
      "baseValue": -1.7,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_test_track_k0",
          "frame": 0,
          "value": 2.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_test_track_k1",
          "frame": 24,
          "value": -1.7
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_ship_slide",
      "name": "ship arrives",
      "targetId": "txt_ship",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 27,
      "durationFrames": 26,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-4"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_ship_slide_k0",
          "frame": 0,
          "x": 33,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_ship_slide_k1",
          "frame": 25,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_ship_track",
      "name": "ship closes up",
      "targetId": "txt_ship",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 27,
      "durationFrames": 25,
      "baseValue": -1.7,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-4"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_ship_track_k0",
          "frame": 0,
          "value": 2.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_ship_track_k1",
          "frame": 24,
          "value": -1.7
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_with_ai_slide",
      "name": "with AI arrives",
      "targetId": "txt_with_ai",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 36,
      "durationFrames": 26,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_with_ai_slide_k0",
          "frame": 0,
          "x": 43,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_with_ai_slide_k1",
          "frame": 25,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_with_ai_track",
      "name": "with AI closes up",
      "targetId": "txt_with_ai",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 36,
      "durationFrames": 25,
      "baseValue": -1.7,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_with_ai_track_k0",
          "frame": 0,
          "value": 2.6,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_with_ai_track_k1",
          "frame": 24,
          "value": -1.7
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_statement_world_defocus",
      "name": "Focus leaves the group",
      "targetId": "statement_world",
      "property": "layerBlur",
      "mode": "set",
      "stage": "custom",
      "startFrame": 63,
      "durationFrames": 16,
      "post": "hold",
      "reason": {
        "purpose": "depart",
        "cues": [
          "turn"
        ]
      },
      "keys": [
        {
          "id": "act_statement_world_defocus_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_statement_world_defocus_k1",
          "frame": 10,
          "value": 14,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_statement_world_defocus_k2",
          "frame": 15,
          "value": 42
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_statement_world_fade",
      "name": "The group fades out",
      "targetId": "statement_world",
      "property": "opacity",
      "mode": "set",
      "stage": "out",
      "startFrame": 74,
      "durationFrames": 6,
      "reason": {
        "purpose": "depart",
        "cues": [
          "turn"
        ]
      },
      "keys": [
        {
          "id": "act_statement_world_fade_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_statement_world_fade_k1",
          "frame": 5,
          "value": 0
        }
      ]
    },
    {
      "id": "act_ribbon_spin",
      "name": "Ribbon snaps round on each arrival",
      "targetId": "backdrop_ribbon",
      "startFrame": 0,
      "durationFrames": 80,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-1",
          "line-2",
          "line-3",
          "line-4",
          "line-5"
        ],
        "lands": "peak",
        "peaks": [
          "line-2",
          "line-3",
          "line-4",
          "line-5"
        ]
      },
      "kind": "shaderParams",
      "shaderId": "chevron_ribbon",
      "placementId": "fill_chevron_ribbon",
      "tracks": {
        "spinAngle": [
          {
            "id": "act_ribbon_spin_k0",
            "frame": 0,
            "value": -20,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuad"
            }
          },
          {
            "id": "act_ribbon_spin_k1",
            "frame": 6,
            "value": -28.99,
            "easing": {
              "kind": "easing",
              "preset": "easeInQuad"
            }
          },
          {
            "id": "act_ribbon_spin_k2",
            "frame": 9,
            "value": -49.03,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "act_ribbon_spin_k3",
            "frame": 15,
            "value": -70.75,
            "easing": {
              "kind": "easing",
              "preset": "easeInQuad"
            }
          },
          {
            "id": "act_ribbon_spin_k4",
            "frame": 18,
            "value": -92.17,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "act_ribbon_spin_k5",
            "frame": 24,
            "value": -115.39,
            "easing": {
              "kind": "easing",
              "preset": "easeInQuad"
            }
          },
          {
            "id": "act_ribbon_spin_k6",
            "frame": 27,
            "value": -138.43,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "act_ribbon_spin_k7",
            "frame": 33,
            "value": -163.39,
            "easing": {
              "kind": "easing",
              "preset": "easeInQuad"
            }
          },
          {
            "id": "act_ribbon_spin_k8",
            "frame": 36,
            "value": -216.38,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "act_ribbon_spin_k9",
            "frame": 44,
            "value": -264.95,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_spin_k10",
            "frame": 79,
            "value": -273.79
          }
        ]
      }
    },
    {
      "kind": "shaderParams",
      "id": "act_ribbon_body",
      "name": "Ribbon narrows and opens",
      "targetId": "backdrop_ribbon",
      "shaderId": "chevron_ribbon",
      "placementId": "fill_chevron_ribbon",
      "startFrame": 0,
      "durationFrames": 80,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4"
        ],
        "lands": "start"
      },
      "tracks": {
        "pillarSize": [
          {
            "id": "act_ribbon_body_pillar_k0",
            "frame": 0,
            "value": 126,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_pillar_k1",
            "frame": 24,
            "value": 118,
            "easing": {
              "kind": "easing",
              "preset": "easeInQuad"
            }
          },
          {
            "id": "act_ribbon_body_pillar_k2",
            "frame": 27,
            "value": 89,
            "easing": {
              "kind": "easing",
              "preset": "easeOutCubic"
            }
          },
          {
            "id": "act_ribbon_body_pillar_k3",
            "frame": 33,
            "value": 151,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_pillar_k4",
            "frame": 36,
            "value": 161,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_pillar_k5",
            "frame": 79,
            "value": 161
          }
        ],
        "baseHalfGap": [
          {
            "id": "act_ribbon_body_gap_k0",
            "frame": 0,
            "value": 152,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_gap_k1",
            "frame": 26,
            "value": 148,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_gap_k2",
            "frame": 27,
            "value": 140,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuad"
            }
          },
          {
            "id": "act_ribbon_body_gap_k3",
            "frame": 34,
            "value": 146,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_gap_k4",
            "frame": 36,
            "value": 144,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_gap_k5",
            "frame": 79,
            "value": 144
          }
        ],
        "fadeHeight": [
          {
            "id": "act_ribbon_body_fade_k0",
            "frame": 0,
            "value": 154,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuad"
            }
          },
          {
            "id": "act_ribbon_body_fade_k1",
            "frame": 26,
            "value": 215,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_fade_k2",
            "frame": 34,
            "value": 264,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_fade_k3",
            "frame": 45,
            "value": 305,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_fade_k4",
            "frame": 79,
            "value": 305
          }
        ]
      }
    },
    {
      "id": "act_world_ring_turn",
      "name": "World turns on each arrival",
      "targetId": "world_ring",
      "startFrame": 0,
      "durationFrames": 80,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-1",
          "line-2",
          "line-3",
          "line-4",
          "line-5",
          "turn"
        ],
        "lands": "peak",
        "peaks": [
          "line-2",
          "line-3",
          "line-4",
          "line-5",
          "turn"
        ]
      },
      "kind": "scalar",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_world_ring_turn_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_world_ring_turn_k1",
          "frame": 6,
          "value": 29.4,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_world_ring_turn_k2",
          "frame": 9,
          "value": 43.1,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_world_ring_turn_k3",
          "frame": 15,
          "value": 75.07,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_world_ring_turn_k4",
          "frame": 18,
          "value": 89.72,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_world_ring_turn_k5",
          "frame": 24,
          "value": 123.9,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_world_ring_turn_k6",
          "frame": 27,
          "value": 139.65,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_world_ring_turn_k7",
          "frame": 33,
          "value": 176.4,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_world_ring_turn_k8",
          "frame": 36,
          "value": 212.63,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_world_ring_turn_k9",
          "frame": 42,
          "value": 273,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_world_ring_turn_k10",
          "frame": 60,
          "value": 297.15,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_world_ring_turn_k11",
          "frame": 70,
          "value": 328.65,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_world_ring_turn_k12",
          "frame": 79,
          "value": 402.15
        }
      ]
    },
    {
      "id": "act_mid_blue_big_makes_room",
      "name": "Large orb makes room",
      "targetId": "mid_blue_big",
      "startFrame": 0,
      "durationFrames": 80,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-1",
          "line-2",
          "line-3",
          "line-4",
          "line-5",
          "turn"
        ],
        "lands": "peak",
        "peaks": [
          "turn"
        ]
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_mid_blue_big_makes_room_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k1",
          "frame": 7,
          "x": 8.21,
          "y": 2.51,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k2",
          "frame": 9,
          "x": 7.67,
          "y": 2.34,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k3",
          "frame": 16,
          "x": 37.41,
          "y": 11.44,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k4",
          "frame": 18,
          "x": 35.47,
          "y": 10.84,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k5",
          "frame": 25,
          "x": 67.27,
          "y": 20.57,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k6",
          "frame": 27,
          "x": 65.18,
          "y": 19.93,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k7",
          "frame": 34,
          "x": 99.37,
          "y": 30.38,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k8",
          "frame": 36,
          "x": 97.14,
          "y": 29.7,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k9",
          "frame": 43,
          "x": 136.46,
          "y": 41.72,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k10",
          "frame": 58,
          "x": 133.88,
          "y": 40.93,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k11",
          "frame": 70,
          "x": 82.67,
          "y": 25.28,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k12",
          "frame": 76,
          "x": 20.08,
          "y": 6.14,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k13",
          "frame": 79,
          "x": 20.08,
          "y": 6.14
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mid_blue_big_upright",
      "name": "Large orb stays upright",
      "targetId": "mid_blue_big",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 80,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mid_blue_big_upright_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k1",
          "frame": 6,
          "value": -29.4,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k2",
          "frame": 9,
          "value": -43.1,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k3",
          "frame": 15,
          "value": -75.07,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k4",
          "frame": 18,
          "value": -89.72,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k5",
          "frame": 24,
          "value": -123.9,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k6",
          "frame": 27,
          "value": -139.65,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k7",
          "frame": 33,
          "value": -176.4,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k8",
          "frame": 36,
          "value": -212.63,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k9",
          "frame": 42,
          "value": -273,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k10",
          "frame": 60,
          "value": -297.15,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k11",
          "frame": 70,
          "value": -328.65,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k12",
          "frame": 79,
          "value": -402.15
        }
      ]
    },
    {
      "id": "act_mid_tri_big_makes_room",
      "name": "Large triangle makes room",
      "targetId": "mid_tri_big",
      "startFrame": 0,
      "durationFrames": 80,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-1",
          "line-2",
          "line-3",
          "line-4",
          "line-5",
          "turn"
        ],
        "lands": "peak",
        "peaks": [
          "turn"
        ]
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_mid_tri_big_makes_room_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k1",
          "frame": 7,
          "x": 2.85,
          "y": -6.11,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k2",
          "frame": 9,
          "x": 2.66,
          "y": -5.71,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k3",
          "frame": 16,
          "x": 12.99,
          "y": -27.86,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k4",
          "frame": 18,
          "x": 12.32,
          "y": -26.41,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k5",
          "frame": 25,
          "x": 23.36,
          "y": -50.09,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k6",
          "frame": 27,
          "x": 22.64,
          "y": -48.54,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k7",
          "frame": 34,
          "x": 34.51,
          "y": -74,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k8",
          "frame": 36,
          "x": 33.73,
          "y": -72.33,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k9",
          "frame": 43,
          "x": 47.38,
          "y": -101.61,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k10",
          "frame": 58,
          "x": 46.49,
          "y": -99.69,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k11",
          "frame": 70,
          "x": 28.71,
          "y": -61.57,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k12",
          "frame": 76,
          "x": 6.97,
          "y": -14.95,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k13",
          "frame": 79,
          "x": 6.97,
          "y": -14.95
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mid_tri_big_tumble",
      "name": "Large triangle tumbles",
      "targetId": "mid_tri_big",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 80,
      "reason": {
        "purpose": "drift"
      },
      "keys": [
        {
          "id": "act_mid_tri_big_tumble_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_tumble_k1",
          "frame": 79,
          "value": 78
        }
      ]
    },
    {
      "id": "act_mid_tri_small_makes_room",
      "name": "Small triangle makes room",
      "targetId": "mid_tri_small",
      "startFrame": 0,
      "durationFrames": 80,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-1",
          "line-2",
          "line-3",
          "line-4",
          "line-5",
          "turn"
        ],
        "lands": "peak",
        "peaks": [
          "turn"
        ]
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_mid_tri_small_makes_room_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k1",
          "frame": 7,
          "x": -1.11,
          "y": 10.6,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k2",
          "frame": 9,
          "x": -1.04,
          "y": 9.92,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k3",
          "frame": 16,
          "x": -5.08,
          "y": 48.35,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k4",
          "frame": 18,
          "x": -4.82,
          "y": 45.85,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k5",
          "frame": 25,
          "x": -9.14,
          "y": 86.94,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k6",
          "frame": 27,
          "x": -8.86,
          "y": 84.26,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k7",
          "frame": 34,
          "x": -13.5,
          "y": 128.44,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k8",
          "frame": 36,
          "x": -13.2,
          "y": 125.55,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k9",
          "frame": 43,
          "x": -18.54,
          "y": 176.37,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k10",
          "frame": 58,
          "x": -18.19,
          "y": 173.05,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k11",
          "frame": 70,
          "x": -11.23,
          "y": 106.86,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k12",
          "frame": 76,
          "x": -2.73,
          "y": 25.96,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k13",
          "frame": 79,
          "x": -2.73,
          "y": 25.96
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mid_tri_small_tumble",
      "name": "Small triangle tumbles",
      "targetId": "mid_tri_small",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 80,
      "reason": {
        "purpose": "drift"
      },
      "keys": [
        {
          "id": "act_mid_tri_small_tumble_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_tumble_k1",
          "frame": 79,
          "value": 80
        }
      ]
    },
    {
      "id": "act_mid_blue_small_makes_room",
      "name": "Small orb makes room",
      "targetId": "mid_blue_small",
      "startFrame": 18,
      "durationFrames": 62,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-3",
          "line-4",
          "line-5",
          "turn"
        ],
        "lands": "peak",
        "peaks": [
          "turn"
        ]
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_mid_blue_small_makes_room_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k1",
          "frame": 7,
          "x": -36.58,
          "y": -15.53,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k2",
          "frame": 9,
          "x": -34.19,
          "y": -14.51,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k3",
          "frame": 16,
          "x": -73.52,
          "y": -31.21,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k4",
          "frame": 18,
          "x": -70.94,
          "y": -30.11,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k5",
          "frame": 25,
          "x": -116.18,
          "y": -49.31,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k6",
          "frame": 40,
          "x": -113.22,
          "y": -48.06,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k7",
          "frame": 52,
          "x": -69.91,
          "y": -29.68,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k8",
          "frame": 58,
          "x": -16.98,
          "y": -7.21,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k9",
          "frame": 61,
          "x": -16.98,
          "y": -7.21
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mid_blue_small_upright",
      "name": "Small orb stays upright",
      "targetId": "mid_blue_small",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 18,
      "durationFrames": 62,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mid_blue_small_upright_k0",
          "frame": 0,
          "value": -89.72,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k1",
          "frame": 6,
          "value": -123.9,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k2",
          "frame": 9,
          "value": -139.65,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k3",
          "frame": 15,
          "value": -176.4,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k4",
          "frame": 18,
          "value": -212.63,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k5",
          "frame": 24,
          "value": -273,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k6",
          "frame": 42,
          "value": -297.15,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k7",
          "frame": 52,
          "value": -328.65,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k8",
          "frame": 61,
          "value": -402.15
        }
      ]
    },
    {
      "id": "act_mid_warm_tiny_makes_room",
      "name": "Tiny square makes room",
      "targetId": "mid_warm_tiny",
      "startFrame": 18,
      "durationFrames": 62,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-3",
          "line-4",
          "line-5",
          "turn"
        ],
        "lands": "peak",
        "peaks": [
          "turn"
        ]
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_mid_warm_tiny_makes_room_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k1",
          "frame": 7,
          "x": -32.38,
          "y": 11.15,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k2",
          "frame": 9,
          "x": -30.27,
          "y": 10.42,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k3",
          "frame": 16,
          "x": -65.08,
          "y": 22.41,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k4",
          "frame": 18,
          "x": -62.8,
          "y": 21.62,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k5",
          "frame": 25,
          "x": -102.84,
          "y": 35.41,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k6",
          "frame": 40,
          "x": -100.22,
          "y": 34.51,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k7",
          "frame": 52,
          "x": -61.89,
          "y": 21.31,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k8",
          "frame": 58,
          "x": -15.03,
          "y": 5.18,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k9",
          "frame": 61,
          "x": -15.03,
          "y": 5.18
        }
      ]
    },
    {
      "id": "act_mid_warm_big_makes_room",
      "name": "Large square makes room",
      "targetId": "mid_warm_big",
      "startFrame": 36,
      "durationFrames": 44,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-5",
          "turn"
        ],
        "lands": "peak",
        "peaks": [
          "turn"
        ]
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_mid_warm_big_makes_room_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_warm_big_makes_room_k1",
          "frame": 7,
          "x": -37.87,
          "y": -68.32,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_big_makes_room_k2",
          "frame": 22,
          "x": -35.39,
          "y": -63.85,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_warm_big_makes_room_k3",
          "frame": 34,
          "x": -21.86,
          "y": -39.43,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_big_makes_room_k4",
          "frame": 40,
          "x": -5.31,
          "y": -9.58,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_big_makes_room_k5",
          "frame": 43,
          "x": -5.31,
          "y": -9.58
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mid_warm_big_tumble",
      "name": "Large square tumbles",
      "targetId": "mid_warm_big",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 36,
      "durationFrames": 44,
      "reason": {
        "purpose": "drift"
      },
      "keys": [
        {
          "id": "act_mid_warm_big_tumble_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_big_tumble_k1",
          "frame": 43,
          "value": -35
        }
      ]
    },
    {
      "id": "act_mid_warm_med_makes_room",
      "name": "Medium square makes room",
      "targetId": "mid_warm_med",
      "startFrame": 36,
      "durationFrames": 44,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-5",
          "turn"
        ],
        "lands": "peak",
        "peaks": [
          "turn"
        ]
      },
      "kind": "vec2",
      "property": "move",
      "mode": "add",
      "stage": "custom",
      "keys": [
        {
          "id": "act_mid_warm_med_makes_room_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_warm_med_makes_room_k1",
          "frame": 7,
          "x": 38.05,
          "y": 54.34,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_med_makes_room_k2",
          "frame": 22,
          "x": 35.56,
          "y": 50.79,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_warm_med_makes_room_k3",
          "frame": 34,
          "x": 21.96,
          "y": 31.36,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_med_makes_room_k4",
          "frame": 40,
          "x": 5.33,
          "y": 7.62,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_med_makes_room_k5",
          "frame": 43,
          "x": 5.33,
          "y": 7.62
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_pass_lead_orb_pass",
      "name": "Lead-in orb passes",
      "targetId": "pass_lead_orb",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 27,
      "durationFrames": 11,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_pass_lead_orb_pass_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_pass_lead_orb_pass_k1",
          "frame": 3,
          "x": -37,
          "y": 204,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_orb_pass_k2",
          "frame": 6,
          "x": -96,
          "y": 259,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_orb_pass_k3",
          "frame": 10,
          "x": -187,
          "y": 349
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_lead_orb_out",
      "name": "Lead-in orb leaves",
      "targetId": "pass_lead_orb",
      "property": "opacity",
      "mode": "set",
      "stage": "out",
      "startFrame": 35,
      "durationFrames": 3,
      "reason": {
        "purpose": "depart"
      },
      "keys": [
        {
          "id": "act_pass_lead_orb_out_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_orb_out_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_pass_lead_square_pass",
      "name": "Lead-in square passes",
      "targetId": "pass_lead_square",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 27,
      "durationFrames": 11,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_pass_lead_square_pass_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_pass_lead_square_pass_k1",
          "frame": 2,
          "x": 30,
          "y": -115,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_square_pass_k2",
          "frame": 7,
          "x": 161,
          "y": -222,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_square_pass_k3",
          "frame": 10,
          "x": 255,
          "y": -360
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_lead_square_turn",
      "name": "Lead-in square turns",
      "targetId": "pass_lead_square",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 27,
      "durationFrames": 11,
      "reason": {
        "purpose": "drift"
      },
      "keys": [
        {
          "id": "act_pass_lead_square_turn_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_square_turn_k1",
          "frame": 10,
          "value": 34
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_lead_square_out",
      "name": "Lead-in square leaves",
      "targetId": "pass_lead_square",
      "property": "opacity",
      "mode": "set",
      "stage": "out",
      "startFrame": 35,
      "durationFrames": 3,
      "reason": {
        "purpose": "depart"
      },
      "keys": [
        {
          "id": "act_pass_lead_square_out_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_square_out_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_pass_hold_orb_pass",
      "name": "Slow orb passes",
      "targetId": "pass_hold_orb",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 38,
      "durationFrames": 42,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_pass_hold_orb_pass_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k1",
          "frame": 4,
          "x": -94,
          "y": -116,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k2",
          "frame": 7,
          "x": -128,
          "y": -213,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k3",
          "frame": 16,
          "x": -144,
          "y": -391,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k4",
          "frame": 23,
          "x": -133,
          "y": -489,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k5",
          "frame": 31,
          "x": -75,
          "y": -605,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k6",
          "frame": 37,
          "x": 134,
          "y": -663,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k7",
          "frame": 39,
          "x": 291,
          "y": -648,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k8",
          "frame": 41,
          "x": 400,
          "y": -590
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_pass_hold_square_pass",
      "name": "Slow square passes",
      "targetId": "pass_hold_square",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 42,
      "durationFrames": 38,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_pass_hold_square_pass_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_pass_hold_square_pass_k1",
          "frame": 3,
          "x": -92,
          "y": 122,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_square_pass_k2",
          "frame": 19,
          "x": -96,
          "y": 348,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_pass_hold_square_pass_k3",
          "frame": 27,
          "x": -193,
          "y": 406,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_pass_hold_square_pass_k4",
          "frame": 33,
          "x": -395,
          "y": 480,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_square_pass_k5",
          "frame": 37,
          "x": -595,
          "y": 525
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_hold_square_turn",
      "name": "Slow square turns",
      "targetId": "pass_hold_square",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 42,
      "durationFrames": 38,
      "reason": {
        "purpose": "drift"
      },
      "keys": [
        {
          "id": "act_pass_hold_square_turn_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_square_turn_k1",
          "frame": 37,
          "value": 52
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_pass_hold_small_pass",
      "name": "Slow small orb passes",
      "targetId": "pass_hold_small",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 42,
      "durationFrames": 38,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_pass_hold_small_pass_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k1",
          "frame": 3,
          "x": 48,
          "y": 79,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k2",
          "frame": 13,
          "x": 124,
          "y": 230,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k3",
          "frame": 19,
          "x": 123,
          "y": 328,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k4",
          "frame": 27,
          "x": 74,
          "y": 464,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k5",
          "frame": 33,
          "x": -48,
          "y": 568,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k6",
          "frame": 37,
          "x": -175,
          "y": 685
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_pass_burst_square_pass",
      "name": "Burst square passes",
      "targetId": "pass_burst_square",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 36,
      "durationFrames": 7,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_pass_burst_square_pass_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_burst_square_pass_k1",
          "frame": 6,
          "x": -186,
          "y": -133
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_burst_square_turn",
      "name": "Burst square turns",
      "targetId": "pass_burst_square",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 36,
      "durationFrames": 7,
      "reason": {
        "purpose": "drift"
      },
      "keys": [
        {
          "id": "act_pass_burst_square_turn_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_burst_square_turn_k1",
          "frame": 6,
          "value": 30
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_burst_square_out",
      "name": "Burst square leaves",
      "targetId": "pass_burst_square",
      "property": "opacity",
      "mode": "set",
      "stage": "out",
      "startFrame": 40,
      "durationFrames": 3,
      "reason": {
        "purpose": "depart"
      },
      "keys": [
        {
          "id": "act_pass_burst_square_out_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_burst_square_out_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_pass_burst_triangle_pass",
      "name": "Burst triangle passes",
      "targetId": "pass_burst_triangle",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 36,
      "durationFrames": 8,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_pass_burst_triangle_pass_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_burst_triangle_pass_k1",
          "frame": 7,
          "x": 156,
          "y": 136
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_burst_triangle_turn",
      "name": "Burst triangle turns",
      "targetId": "pass_burst_triangle",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 36,
      "durationFrames": 8,
      "reason": {
        "purpose": "drift"
      },
      "keys": [
        {
          "id": "act_pass_burst_triangle_turn_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_burst_triangle_turn_k1",
          "frame": 7,
          "value": 30
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_burst_triangle_out",
      "name": "Burst triangle leaves",
      "targetId": "pass_burst_triangle",
      "property": "opacity",
      "mode": "set",
      "stage": "out",
      "startFrame": 41,
      "durationFrames": 3,
      "reason": {
        "purpose": "depart"
      },
      "keys": [
        {
          "id": "act_pass_burst_triangle_out_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_burst_triangle_out_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_pass_burst_small_pass",
      "name": "Burst small square passes",
      "targetId": "pass_burst_small",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 36,
      "durationFrames": 16,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-5"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_pass_burst_small_pass_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_pass_burst_small_pass_k1",
          "frame": 9,
          "x": -132,
          "y": -2,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_burst_small_pass_k2",
          "frame": 15,
          "x": -280,
          "y": -17
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_burst_small_turn",
      "name": "Burst small square turns",
      "targetId": "pass_burst_small",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 36,
      "durationFrames": 16,
      "reason": {
        "purpose": "drift"
      },
      "keys": [
        {
          "id": "act_pass_burst_small_turn_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_burst_small_turn_k1",
          "frame": 15,
          "value": 32
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_burst_small_out",
      "name": "Burst small square leaves",
      "targetId": "pass_burst_small",
      "property": "opacity",
      "mode": "set",
      "stage": "out",
      "startFrame": 49,
      "durationFrames": 3,
      "reason": {
        "purpose": "depart"
      },
      "keys": [
        {
          "id": "act_pass_burst_small_out_k0",
          "frame": 0,
          "value": 1,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_burst_small_out_k1",
          "frame": 2,
          "value": 0
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_pass_exit_square_pass",
      "name": "Exit square passes",
      "targetId": "pass_exit_square",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 66,
      "durationFrames": 13,
      "reason": {
        "purpose": "respond",
        "cues": [
          "turn"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_pass_exit_square_pass_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_square_pass_k1",
          "frame": 3,
          "x": -67,
          "y": 40,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_square_pass_k2",
          "frame": 8,
          "x": -240,
          "y": 50,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_square_pass_k3",
          "frame": 12,
          "x": -314,
          "y": 107
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_exit_square_turn",
      "name": "Exit square turns",
      "targetId": "pass_exit_square",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 66,
      "durationFrames": 13,
      "reason": {
        "purpose": "drift"
      },
      "keys": [
        {
          "id": "act_pass_exit_square_turn_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_square_turn_k1",
          "frame": 12,
          "value": 25
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_pass_exit_triangle_pass",
      "name": "Exit triangle passes",
      "targetId": "pass_exit_triangle",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 70,
      "durationFrames": 9,
      "reason": {
        "purpose": "respond",
        "cues": [
          "turn"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_pass_exit_triangle_pass_k0",
          "frame": 0,
          "x": 0,
          "y": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_triangle_pass_k1",
          "frame": 3,
          "x": 45,
          "y": -115,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_triangle_pass_k2",
          "frame": 5,
          "x": 75,
          "y": -205,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_triangle_pass_k3",
          "frame": 6,
          "x": 111,
          "y": -277,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_triangle_pass_k4",
          "frame": 8,
          "x": 183,
          "y": -445
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_pass_exit_triangle_turn",
      "name": "Exit triangle turns",
      "targetId": "pass_exit_triangle",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 70,
      "durationFrames": 9,
      "reason": {
        "purpose": "drift"
      },
      "keys": [
        {
          "id": "act_pass_exit_triangle_turn_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_triangle_turn_k1",
          "frame": 8,
          "value": -25
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "act_mark_square_travel",
      "name": "Mark square travels in",
      "targetId": "mark_square",
      "guidePathId": "guide_mark_square",
      "orientToPath": false,
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.3,
        "y1": 0.45,
        "x2": 0.4,
        "y2": 0.85
      },
      "reason": {
        "purpose": "carry",
        "cues": [
          "land"
        ],
        "lands": "end"
      }
    },
    {
      "kind": "vec2",
      "id": "act_mark_square_scale",
      "name": "Mark square comes down to size",
      "targetId": "mark_square",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "reason": {
        "purpose": "carry",
        "cues": [
          "land"
        ],
        "lands": "end"
      },
      "keys": [
        {
          "id": "act_mark_square_scale_k0",
          "frame": 0,
          "x": 1.24,
          "y": 1.24,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_square_scale_k1",
          "frame": 6,
          "x": 1.113,
          "y": 1.113,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_square_scale_k2",
          "frame": 13,
          "x": 0.913,
          "y": 0.913
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mark_square_spin",
      "name": "Mark square turns in",
      "targetId": "mark_square",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "reason": {
        "purpose": "carry",
        "cues": [
          "land"
        ],
        "lands": "end"
      },
      "keys": [
        {
          "id": "act_mark_square_spin_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_square_spin_k1",
          "frame": 5,
          "value": 130,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_square_spin_k2",
          "frame": 13,
          "value": 237
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "act_mark_triangle_travel",
      "name": "Mark triangle travels in",
      "targetId": "mark_triangle",
      "guidePathId": "guide_mark_triangle",
      "orientToPath": false,
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.16,
        "y1": 0.42,
        "x2": 0.56,
        "y2": 0.92
      },
      "reason": {
        "purpose": "carry",
        "cues": [
          "land"
        ],
        "lands": "end"
      }
    },
    {
      "kind": "vec2",
      "id": "act_mark_triangle_scale",
      "name": "Mark triangle comes down to size",
      "targetId": "mark_triangle",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "reason": {
        "purpose": "carry",
        "cues": [
          "land"
        ],
        "lands": "end"
      },
      "keys": [
        {
          "id": "act_mark_triangle_scale_k0",
          "frame": 0,
          "x": 1.22,
          "y": 1.22,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_triangle_scale_k1",
          "frame": 5,
          "x": 1.11,
          "y": 1.11,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_triangle_scale_k2",
          "frame": 10,
          "x": 0.98,
          "y": 0.98
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mark_triangle_spin",
      "name": "Mark triangle turns in",
      "targetId": "mark_triangle",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "reason": {
        "purpose": "carry",
        "cues": [
          "land"
        ],
        "lands": "end"
      },
      "keys": [
        {
          "id": "act_mark_triangle_spin_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_triangle_spin_k1",
          "frame": 4,
          "value": 58,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_triangle_spin_k2",
          "frame": 10,
          "value": 105
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "act_mark_host_travel",
      "name": "Mark circle travels in",
      "targetId": "mark_host",
      "guidePathId": "guide_mark_host",
      "orientToPath": false,
      "stage": "custom",
      "startFrame": 70,
      "durationFrames": 20,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.15,
        "y1": 0.8,
        "x2": 0.5,
        "y2": 1
      },
      "reason": {
        "purpose": "carry",
        "cues": [
          "land"
        ],
        "lands": "end"
      }
    },
    {
      "kind": "vec2",
      "id": "act_mark_host_scale",
      "name": "Mark circle comes down to size",
      "targetId": "mark_host",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 70,
      "durationFrames": 20,
      "reason": {
        "purpose": "carry",
        "cues": [
          "land"
        ],
        "lands": "end"
      },
      "keys": [
        {
          "id": "act_mark_host_scale_k0",
          "frame": 0,
          "x": 1.157,
          "y": 1.157,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_host_scale_k1",
          "frame": 9,
          "x": 1.045,
          "y": 1.045,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_host_scale_k2",
          "frame": 19,
          "x": 0.838,
          "y": 0.838
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "act_mark_host_travel__mask_mark_host_for_mark_square",
      "name": "Mask: Mark circle for Mark square inside the host: Mark circle travels in",
      "targetId": "mask_mark_host_for_mark_square",
      "guidePathId": "guide_mark_host",
      "orientToPath": false,
      "stage": "custom",
      "startFrame": 70,
      "durationFrames": 20,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.15,
        "y1": 0.8,
        "x2": 0.5,
        "y2": 1
      },
      "reason": {
        "purpose": "keep"
      }
    },
    {
      "kind": "vec2",
      "id": "act_mark_host_scale__mask_mark_host_for_mark_square",
      "name": "Mask: Mark circle for Mark square inside the host: Mark circle comes down to size",
      "targetId": "mask_mark_host_for_mark_square",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 70,
      "durationFrames": 20,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mark_host_scale__mask_mark_host_for_mark_square_k0",
          "frame": 0,
          "x": 1.157,
          "y": 1.157,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_host_scale__mask_mark_host_for_mark_square_k1",
          "frame": 9,
          "x": 1.045,
          "y": 1.045,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_host_scale__mask_mark_host_for_mark_square_k2",
          "frame": 19,
          "x": 0.838,
          "y": 0.838
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "act_mark_square_travel__mark_square_over_mark_host",
      "name": "Mark square inside the host: Mark square travels in",
      "targetId": "mark_square_over_mark_host",
      "guidePathId": "guide_mark_square",
      "orientToPath": false,
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.3,
        "y1": 0.45,
        "x2": 0.4,
        "y2": 0.85
      },
      "reason": {
        "purpose": "keep"
      }
    },
    {
      "kind": "vec2",
      "id": "act_mark_square_scale__mark_square_over_mark_host",
      "name": "Mark square inside the host: Mark square comes down to size",
      "targetId": "mark_square_over_mark_host",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mark_square_scale__mark_square_over_mark_host_k0",
          "frame": 0,
          "x": 1.24,
          "y": 1.24,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_square_scale__mark_square_over_mark_host_k1",
          "frame": 6,
          "x": 1.113,
          "y": 1.113,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_square_scale__mark_square_over_mark_host_k2",
          "frame": 13,
          "x": 0.913,
          "y": 0.913
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mark_square_spin__mark_square_over_mark_host",
      "name": "Mark square inside the host: Mark square turns in",
      "targetId": "mark_square_over_mark_host",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mark_square_spin__mark_square_over_mark_host_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_square_spin__mark_square_over_mark_host_k1",
          "frame": 5,
          "value": 130,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_square_spin__mark_square_over_mark_host_k2",
          "frame": 13,
          "value": 237
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "act_mark_host_travel__mask_mark_host_for_mark_triangle",
      "name": "Mask: Mark circle for Mark triangle inside the host: Mark circle travels in",
      "targetId": "mask_mark_host_for_mark_triangle",
      "guidePathId": "guide_mark_host",
      "orientToPath": false,
      "stage": "custom",
      "startFrame": 70,
      "durationFrames": 20,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.15,
        "y1": 0.8,
        "x2": 0.5,
        "y2": 1
      },
      "reason": {
        "purpose": "keep"
      }
    },
    {
      "kind": "vec2",
      "id": "act_mark_host_scale__mask_mark_host_for_mark_triangle",
      "name": "Mask: Mark circle for Mark triangle inside the host: Mark circle comes down to size",
      "targetId": "mask_mark_host_for_mark_triangle",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 70,
      "durationFrames": 20,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mark_host_scale__mask_mark_host_for_mark_triangle_k0",
          "frame": 0,
          "x": 1.157,
          "y": 1.157,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_host_scale__mask_mark_host_for_mark_triangle_k1",
          "frame": 9,
          "x": 1.045,
          "y": 1.045,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_host_scale__mask_mark_host_for_mark_triangle_k2",
          "frame": 19,
          "x": 0.838,
          "y": 0.838
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "act_mark_triangle_travel__mark_triangle_over_mark_host",
      "name": "Mark triangle inside the host: Mark triangle travels in",
      "targetId": "mark_triangle_over_mark_host",
      "guidePathId": "guide_mark_triangle",
      "orientToPath": false,
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.16,
        "y1": 0.42,
        "x2": 0.56,
        "y2": 0.92
      },
      "reason": {
        "purpose": "keep"
      }
    },
    {
      "kind": "vec2",
      "id": "act_mark_triangle_scale__mark_triangle_over_mark_host",
      "name": "Mark triangle inside the host: Mark triangle comes down to size",
      "targetId": "mark_triangle_over_mark_host",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mark_triangle_scale__mark_triangle_over_mark_host_k0",
          "frame": 0,
          "x": 1.22,
          "y": 1.22,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_triangle_scale__mark_triangle_over_mark_host_k1",
          "frame": 5,
          "x": 1.11,
          "y": 1.11,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_triangle_scale__mark_triangle_over_mark_host_k2",
          "frame": 10,
          "x": 0.98,
          "y": 0.98
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mark_triangle_spin__mark_triangle_over_mark_host",
      "name": "Mark triangle inside the host: Mark triangle turns in",
      "targetId": "mark_triangle_over_mark_host",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mark_triangle_spin__mark_triangle_over_mark_host_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_triangle_spin__mark_triangle_over_mark_host_k1",
          "frame": 4,
          "value": 58,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_triangle_spin__mark_triangle_over_mark_host_k2",
          "frame": 10,
          "value": 105
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "act_mark_square_travel__mask_mark_square_for_mark_triangle",
      "name": "Mask: Mark square for Where the square and triangle cross: Mark square travels in",
      "targetId": "mask_mark_square_for_mark_triangle",
      "guidePathId": "guide_mark_square",
      "orientToPath": false,
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.3,
        "y1": 0.45,
        "x2": 0.4,
        "y2": 0.85
      },
      "reason": {
        "purpose": "keep"
      }
    },
    {
      "kind": "vec2",
      "id": "act_mark_square_scale__mask_mark_square_for_mark_triangle",
      "name": "Mask: Mark square for Where the square and triangle cross: Mark square comes down to size",
      "targetId": "mask_mark_square_for_mark_triangle",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mark_square_scale__mask_mark_square_for_mark_triangle_k0",
          "frame": 0,
          "x": 1.24,
          "y": 1.24,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_square_scale__mask_mark_square_for_mark_triangle_k1",
          "frame": 6,
          "x": 1.113,
          "y": 1.113,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_square_scale__mask_mark_square_for_mark_triangle_k2",
          "frame": 13,
          "x": 0.913,
          "y": 0.913
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mark_square_spin__mask_mark_square_for_mark_triangle",
      "name": "Mask: Mark square for Where the square and triangle cross: Mark square turns in",
      "targetId": "mask_mark_square_for_mark_triangle",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 76,
      "durationFrames": 14,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mark_square_spin__mask_mark_square_for_mark_triangle_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_square_spin__mask_mark_square_for_mark_triangle_k1",
          "frame": 5,
          "value": 130,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_square_spin__mask_mark_square_for_mark_triangle_k2",
          "frame": 13,
          "value": 237
        }
      ]
    },
    {
      "kind": "followPath",
      "id": "act_mark_triangle_travel__mark_triangle_over_mark_square",
      "name": "Where the square and triangle cross: Mark triangle travels in",
      "targetId": "mark_triangle_over_mark_square",
      "guidePathId": "guide_mark_triangle",
      "orientToPath": false,
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "progressEasing": {
        "kind": "cubicBezier",
        "x1": 0.16,
        "y1": 0.42,
        "x2": 0.56,
        "y2": 0.92
      },
      "reason": {
        "purpose": "keep"
      }
    },
    {
      "kind": "vec2",
      "id": "act_mark_triangle_scale__mark_triangle_over_mark_square",
      "name": "Where the square and triangle cross: Mark triangle comes down to size",
      "targetId": "mark_triangle_over_mark_square",
      "property": "scale",
      "mode": "multiply",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mark_triangle_scale__mark_triangle_over_mark_square_k0",
          "frame": 0,
          "x": 1.22,
          "y": 1.22,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_triangle_scale__mark_triangle_over_mark_square_k1",
          "frame": 5,
          "x": 1.11,
          "y": 1.11,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_triangle_scale__mark_triangle_over_mark_square_k2",
          "frame": 10,
          "x": 0.98,
          "y": 0.98
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_mark_triangle_spin__mark_triangle_over_mark_square",
      "name": "Where the square and triangle cross: Mark triangle turns in",
      "targetId": "mark_triangle_over_mark_square",
      "property": "rotation",
      "mode": "add",
      "stage": "custom",
      "startFrame": 79,
      "durationFrames": 11,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mark_triangle_spin__mark_triangle_over_mark_square_k0",
          "frame": 0,
          "value": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_triangle_spin__mark_triangle_over_mark_square_k1",
          "frame": 4,
          "value": 58,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_triangle_spin__mark_triangle_over_mark_square_k2",
          "frame": 10,
          "value": 105
        }
      ]
    }
  ],
  "score": {
    "shot": "statement-converge",
    "cues": [
      {
        "name": "line-1",
        "frame": 0,
        "kind": "beat",
        "weight": 0.8,
        "why": "A step of the run-up toward the accent."
      },
      {
        "name": "line-2",
        "frame": 9,
        "kind": "beat",
        "weight": 0.87,
        "why": "A step of the run-up toward the accent."
      },
      {
        "name": "line-3",
        "frame": 18,
        "kind": "beat",
        "weight": 0.93,
        "why": "A step of the run-up toward the accent."
      },
      {
        "name": "line-4",
        "frame": 27,
        "kind": "beat",
        "weight": 1,
        "why": "A step of the run-up toward the accent."
      },
      {
        "name": "line-5",
        "frame": 36,
        "kind": "accent",
        "weight": 1.15,
        "why": "The arrival the phrase builds to. It keeps the stage longest and the world answers it hardest."
      },
      {
        "name": "turn",
        "frame": 70,
        "kind": "structure",
        "weight": 1,
        "why": "Attention passes from the statement to the mark."
      },
      {
        "name": "land",
        "frame": 89,
        "kind": "structure",
        "weight": 1,
        "why": "The mark is complete and at rest."
      }
    ],
    "subjects": [
      {
        "nodeId": "txt_plan",
        "cue": "line-1",
        "needsSec": 0.48,
        "untilFrame": 63,
        "accent": false
      },
      {
        "nodeId": "txt_build",
        "cue": "line-2",
        "needsSec": 0.52,
        "untilFrame": 63,
        "accent": false
      },
      {
        "nodeId": "txt_test",
        "cue": "line-3",
        "needsSec": 0.48,
        "untilFrame": 63,
        "accent": false
      },
      {
        "nodeId": "txt_ship",
        "cue": "line-4",
        "needsSec": 0.48,
        "untilFrame": 63,
        "accent": false
      },
      {
        "nodeId": "txt_with_ai",
        "cue": "line-5",
        "needsSec": 0.62,
        "untilFrame": 63,
        "accent": true
      }
    ],
    "claimFrames": 9,
    "regions": {
      "statement": {
        "x": 519,
        "y": 150,
        "width": 242,
        "height": 432
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
        "kind": "upright",
        "nodeId": "mid_blue_big",
        "toleranceDeg": 1,
        "why": "It is lit from one side, so it must not turn with the group that carries it."
      },
      {
        "kind": "upright",
        "nodeId": "mid_blue_small",
        "toleranceDeg": 1,
        "why": "It is lit from one side, so it must not turn with the group that carries it."
      },
      {
        "kind": "overlap",
        "a": "mark_square",
        "b": "mark_host",
        "frame": 89,
        "minShare": 0.5,
        "why": "A part of the mark rests on its host; off it, the mark has come apart."
      },
      {
        "kind": "overlap",
        "a": "mark_triangle",
        "b": "mark_host",
        "frame": 89,
        "minShare": 0.5,
        "why": "A part of the mark rests on its host; off it, the mark has come apart."
      },
      {
        "kind": "overlap",
        "a": "mark_triangle",
        "b": "mark_square",
        "frame": 89,
        "minShare": 0.03,
        "why": "The overlap has its own fill, so the two parts must cross at rest."
      }
    ],
    "handoff": {
      "exit": {
        "frame": 89,
        "nodeId": "mark_host",
        "position": {
          "x": 634,
          "y": 335
        },
        "velocity": {
          "x": 3,
          "y": 0
        },
        "size": 587,
        "color": "#333CEE"
      },
      "entry": {
        "frame": 0,
        "nodeId": "txt_plan",
        "position": {
          "x": 675,
          "y": 202
        },
        "velocity": {
          "x": -158,
          "y": 0
        },
        "size": 157,
        "color": "#000000"
      }
    },
    "notes": []
  }
} as const;
const LIVES: Record<string, { start: number; end: number }> = {"statement_world":{"start":0,"end":80},"statement":{"start":0,"end":90},"txt_plan":{"start":0,"end":90},"txt_build":{"start":9,"end":90},"txt_test":{"start":18,"end":90},"txt_ship":{"start":27,"end":90},"txt_with_ai":{"start":36,"end":90},"backdrop_ribbon":{"start":0,"end":90},"world_ring":{"start":0,"end":90},"mid_blue_big":{"start":0,"end":90},"mid_tri_big":{"start":0,"end":90},"mid_tri_small":{"start":0,"end":90},"mid_blue_small":{"start":18,"end":80},"mid_warm_tiny":{"start":18,"end":80},"mid_warm_big":{"start":36,"end":80},"mid_warm_med":{"start":36,"end":80},"foreground":{"start":0,"end":90},"pass_lead_orb":{"start":27,"end":38},"pass_lead_square":{"start":27,"end":38},"pass_hold_orb":{"start":38,"end":90},"pass_hold_square":{"start":42,"end":90},"pass_hold_small":{"start":42,"end":90},"pass_burst_square":{"start":36,"end":43},"pass_burst_triangle":{"start":36,"end":44},"pass_burst_small":{"start":36,"end":52},"pass_exit_square":{"start":66,"end":90},"pass_exit_triangle":{"start":70,"end":90},"mark":{"start":0,"end":90},"guide_mark_square":{"start":0,"end":90},"mark_square":{"start":76,"end":90},"guide_mark_triangle":{"start":0,"end":90},"mark_triangle":{"start":79,"end":90},"guide_mark_host":{"start":0,"end":90},"mark_host":{"start":70,"end":90},"mask_mark_host_for_mark_square":{"start":70,"end":90},"mark_square_over_mark_host":{"start":76,"end":90},"mask_mark_host_for_mark_triangle":{"start":70,"end":90},"mark_triangle_over_mark_host":{"start":79,"end":90},"mask_mark_square_for_mark_triangle":{"start":76,"end":90},"mark_triangle_over_mark_square":{"start":79,"end":90}};
const SVG_PATHS: Record<string, string> = {
  "mid_tri_big": "M 68.56 51 C 84.81 22.85, 111.19 22.85, 127.44 51 L 166.55 118.74 C 182.81 146.89, 169.62 169.74, 137.11 169.74 L 58.89 169.74 C 26.38 169.74, 13.19 146.89, 29.45 118.74 Z",
  "mid_tri_small": "M 30.01 22.5 C 37.18 10.08, 48.82 10.08, 55.99 22.5 L 73.01 51.98 C 80.18 64.4, 74.36 74.48, 60.02 74.48 L 25.98 74.48 C 11.64 74.48, 5.82 64.4, 12.99 51.98 Z",
  "pass_burst_triangle": "M 94.3 70.5 C 116.76 31.58, 153.24 31.58, 175.7 70.5 L 229.3 163.33 C 251.77 202.25, 233.53 233.83, 188.59 233.83 L 81.41 233.83 C 36.47 233.83, 18.23 202.25, 40.7 163.33 Z",
  "pass_exit_triangle": "M 111.5 84 C 138.27 37.63, 181.73 37.63, 208.5 84 L 271.5 193.13 C 298.27 239.5, 276.55 277.13, 223.01 277.13 L 96.99 277.13 C 43.45 277.13, 21.73 239.5, 48.5 193.13 Z",
  "guide_mark_square": "M 13 565 C 11.05 538.75, -1.5 436.2, 0 390 C 1.5 343.8, 4.55 306.5, 23 257 C 41.45 207.5, 89.4 98.55, 123 60 C 156.6 21.45, 216.1 7.95, 247 0 C 277.9 -7.95, 308.3 0.25, 329 7 C 349.7 13.75, 376.6 39.3, 385 45",
  "guide_mark_triangle": "M 23 0 C 43.55 24.75, 133.15 124.05, 160 165 C 186.85 205.95, 196.6 240.75, 202 273 C 207.4 305.25, 208.3 345.5, 196 380 C 183.7 414.5, 144.9 476.45, 120 503 C 95.1 529.55, 48 547.7, 30 557 C 12 566.3, 4.5 563.8, 0 565",
  "mark_triangle": "M 122.84 99 C 154.39 44.35, 205.61 44.35, 237.16 99 L 302.84 212.77 C 334.39 267.42, 308.79 311.77, 245.68 311.77 L 114.32 311.77 C 51.21 311.77, 25.61 267.42, 57.16 212.77 Z",
  "guide_mark_host": "M 0 505 C 67.5 429.25, 310.5 62.25, 450 0 C 589.5 -62.25, 825.45 37.65, 930 90 C 1034.55 142.35, 1117.15 272.35, 1147 349 C 1176.85 425.65, 1149.7 541.3, 1129 601 C 1108.3 660.7, 1047.1 717.9, 1009 747 C 970.9 776.1, 911.3 790.5, 875 795 C 838.7 799.5, 798.65 795.45, 767 777 C 735.35 758.55, 679.3 700.95, 664 672 C 648.7 643.05, 659.9 602.75, 665 584 C 670.1 565.25, 689.15 552.85, 698 547 C 706.85 541.15, 720.1 545.3, 724 545",
  "mark_triangle_over_mark_host": "M 122.84 99 C 154.39 44.35, 205.61 44.35, 237.16 99 L 302.84 212.77 C 334.39 267.42, 308.79 311.77, 245.68 311.77 L 114.32 311.77 C 51.21 311.77, 25.61 267.42, 57.16 212.77 Z",
  "mark_triangle_over_mark_square": "M 122.84 99 C 154.39 44.35, 205.61 44.35, 237.16 99 L 302.84 212.77 C 334.39 267.42, 308.79 311.77, 245.68 311.77 L 114.32 311.77 C 51.21 311.77, 25.61 267.42, 57.16 212.77 Z"
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

export const FiveLinesOnTheBeatMetadata = {
  id: "five_lines_100bpm",
  width: 1280,
  height: 720,
  fps: 30,
  durationInFrames: 90,
};

export const FiveLinesOnTheBeat: React.FC = () => {
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
