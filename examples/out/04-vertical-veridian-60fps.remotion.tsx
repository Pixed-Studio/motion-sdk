import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const IR_DOCUMENT = {
  "id": "vertical_veridian",
  "name": "Vertical Veridian",
  "format": {
    "width": 1080,
    "height": 1920,
    "fps": 60,
    "durationFrames": 270
  },
  "scene": {
    "id": "vertical_veridian__scene-1",
    "name": "Ship fearless agents at scale -> mark",
    "durationFrames": 270,
    "backgroundColor": "#0E131F"
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
          "defaultValue": 136,
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
          "defaultValue": 248,
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
          "defaultValue": 774,
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
          "defaultValue": "#0B5E57"
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
        "width": 1080,
        "height": 1920,
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
        "width": 1080,
        "height": 1920,
        "originX": 0.5,
        "originY": 0.5
      }
    },
    {
      "id": "txt_ship",
      "kind": "text",
      "name": "Ship",
      "slot": "lines",
      "role": "subject",
      "plane": "focal",
      "parentId": "statement",
      "layer": 1,
      "base": {
        "x": 370.49,
        "y": 608,
        "width": 339.03,
        "height": 220
      },
      "text": "Ship",
      "fontFamily": "Geist",
      "fontSize": 169,
      "fontWeight": 500,
      "letterSpacing": -3.6,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "txt_fearless",
      "kind": "text",
      "name": "fearless",
      "slot": "lines",
      "role": "subject",
      "plane": "focal",
      "parentId": "statement",
      "layer": 2,
      "base": {
        "x": 250.94,
        "y": 781,
        "width": 578.13,
        "height": 220
      },
      "text": "fearless",
      "fontFamily": "Geist",
      "fontSize": 169,
      "fontWeight": 500,
      "letterSpacing": -3.6,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "txt_agents",
      "kind": "text",
      "name": "agents",
      "slot": "lines",
      "role": "subject",
      "plane": "focal",
      "parentId": "statement",
      "layer": 3,
      "base": {
        "x": 288.74,
        "y": 954,
        "width": 502.52,
        "height": 220
      },
      "text": "agents",
      "fontFamily": "Geist",
      "fontSize": 169,
      "fontWeight": 500,
      "letterSpacing": -3.6,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
      }
    },
    {
      "id": "txt_at_scale",
      "kind": "text",
      "name": "at scale",
      "slot": "lines",
      "role": "subject",
      "plane": "focal",
      "parentId": "statement",
      "layer": 4,
      "base": {
        "x": 256.01,
        "y": 1127,
        "width": 567.99,
        "height": 220
      },
      "text": "at scale",
      "fontFamily": "Geist",
      "fontSize": 169,
      "fontWeight": 500,
      "letterSpacing": -3.6,
      "textAlign": "center",
      "fill": {
        "kind": "solid",
        "color": "#F6F8FC"
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
        "x": 388,
        "y": 54,
        "width": 304,
        "height": 1813
      },
      "shape": "rectangle",
      "fill": {
        "kind": "shader",
        "shaderId": "chevron_ribbon",
        "placementId": "fill_chevron_ribbon",
        "params": {
          "spinAngle": -20,
          "pillarSize": 136,
          "baseHalfGap": 248,
          "chevronSlope": 0.86,
          "fadeHeight": 774,
          "color": "#0B5E57"
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
        "width": 1080,
        "height": 1920,
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
      },
      "base": {
        "x": 634.2,
        "y": 946.6,
        "width": 121.5,
        "height": 121.5,
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
            "x": 82.69,
            "y": 0,
            "cornerRadius": 28.69
          },
          {
            "id": "v1",
            "x": 165.38,
            "y": 143.22,
            "cornerRadius": 28.69
          },
          {
            "id": "v2",
            "x": 0,
            "y": 143.22,
            "cornerRadius": 28.69
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
      },
      "base": {
        "x": 532.9,
        "y": 726.3,
        "width": 165.38,
        "height": 143.22,
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
            "x": 36.28,
            "y": 0,
            "cornerRadius": 12.66
          },
          {
            "id": "v1",
            "x": 72.56,
            "y": 62.84,
            "cornerRadius": 12.66
          },
          {
            "id": "v2",
            "x": 0,
            "y": 62.84,
            "cornerRadius": 12.66
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
      },
      "base": {
        "x": 488.3,
        "y": 1075.4,
        "width": 72.56,
        "height": 62.84,
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
        "startFrame": 68,
        "durationFrames": 152
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
      },
      "base": {
        "x": 342.7,
        "y": 865.1,
        "width": 38.81,
        "height": 38.81,
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
        "startFrame": 68,
        "durationFrames": 152
      },
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 6.75,
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
      },
      "base": {
        "x": 384.4,
        "y": 992,
        "width": 32.06,
        "height": 32.06,
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
        "startFrame": 101,
        "durationFrames": 119
      },
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 21.94,
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
      },
      "base": {
        "x": 362.5,
        "y": 681.9,
        "width": 104.63,
        "height": 104.63,
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
        "startFrame": 101,
        "durationFrames": 119
      },
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 12.66,
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
      },
      "base": {
        "x": 656.7,
        "y": 1139.7,
        "width": 60.75,
        "height": 60.75,
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
        "width": 1080,
        "height": 1920,
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
      },
      "base": {
        "x": 869.1,
        "y": 979.7,
        "width": 205.88,
        "height": 205.88,
        "blur": 34,
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
      "borderRadius": 45.56,
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
      },
      "base": {
        "x": 65,
        "y": 558.7,
        "width": 216,
        "height": 216,
        "rotation": 44,
        "blur": 35,
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
      },
      "base": {
        "x": 53.2,
        "y": 1883.7,
        "width": 205.88,
        "height": 205.88,
        "blur": 34,
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
      "borderRadius": 47.25,
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
      },
      "base": {
        "x": 962.7,
        "y": 513.6,
        "width": 226.13,
        "height": 226.13,
        "rotation": 166,
        "blur": 37,
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
      },
      "base": {
        "x": 907,
        "y": -162.2,
        "width": 84.38,
        "height": 84.38,
        "blur": 22,
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
      "borderRadius": 38.81,
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
      },
      "base": {
        "x": -37.1,
        "y": 1648.5,
        "width": 185.63,
        "height": 185.63,
        "rotation": 45,
        "blur": 34,
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
            "x": 113.91,
            "y": 0,
            "cornerRadius": 39.66
          },
          {
            "id": "v1",
            "x": 227.81,
            "y": 197.29,
            "cornerRadius": 39.66
          },
          {
            "id": "v2",
            "x": 0,
            "y": 197.29,
            "cornerRadius": 39.66
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
      },
      "base": {
        "x": 868.2,
        "y": 1565.4,
        "width": 227.81,
        "height": 197.29,
        "blur": 32,
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
      "borderRadius": 18.56,
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
      },
      "base": {
        "x": 141.3,
        "y": 41,
        "width": 88.59,
        "height": 88.59,
        "rotation": 28,
        "blur": 24,
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
      "borderRadius": 18.56,
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
      },
      "base": {
        "x": 850.1,
        "y": -84.3,
        "width": 88.59,
        "height": 88.59,
        "rotation": 20,
        "blur": 22,
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
            "x": 135,
            "y": 0,
            "cornerRadius": 47.25
          },
          {
            "id": "v1",
            "x": 270,
            "y": 233.83,
            "cornerRadius": 47.25
          },
          {
            "id": "v2",
            "x": 0,
            "y": 233.83,
            "cornerRadius": 47.25
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
      },
      "base": {
        "x": 42.2,
        "y": 1909.8,
        "width": 270,
        "height": 233.83,
        "blur": 30,
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
        "width": 1080,
        "height": 1920,
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
        "x": 212.55,
        "y": 762.85,
        "width": 324.84,
        "height": 476.72,
        "opacity": 0
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 10.97,
            "y": 476.72
          },
          {
            "id": "v1",
            "x": 0,
            "y": 329.06
          },
          {
            "id": "v2",
            "x": 19.41,
            "y": 216.84
          },
          {
            "id": "v3",
            "x": 103.78,
            "y": 50.63
          },
          {
            "id": "v4",
            "x": 208.41,
            "y": 0
          },
          {
            "id": "v5",
            "x": 277.59,
            "y": 5.91
          },
          {
            "id": "v6",
            "x": 324.84,
            "y": 37.97
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1",
            "tangentStart": {
              "x": -1.65,
              "y": -22.15
            },
            "tangentEnd": {
              "x": -1.27,
              "y": 38.98
            }
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2",
            "tangentStart": {
              "x": 1.27,
              "y": -38.98
            },
            "tangentEnd": {
              "x": -15.57,
              "y": 41.76
            }
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3",
            "tangentStart": {
              "x": 15.57,
              "y": -41.76
            },
            "tangentEnd": {
              "x": -28.35,
              "y": 32.53
            }
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4",
            "tangentStart": {
              "x": 28.35,
              "y": -32.53
            },
            "tangentEnd": {
              "x": -26.07,
              "y": 6.71
            }
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v5",
            "tangentStart": {
              "x": 26.07,
              "y": -6.71
            },
            "tangentEnd": {
              "x": -17.46,
              "y": -5.7
            }
          },
          {
            "id": "s5",
            "startVertexId": "v5",
            "endVertexId": "v6",
            "tangentStart": {
              "x": 17.46,
              "y": 5.7
            },
            "tangentEnd": {
              "x": -7.09,
              "y": -4.81
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
        "startFrame": 212,
        "durationFrames": 58
      },
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 47.25,
      "fill": {
        "kind": "linear",
        "angleDeg": 115,
        "stops": [
          {
            "offset": 0,
            "color": "#FF5E7E"
          },
          {
            "offset": 0.5,
            "color": "#FF926B"
          },
          {
            "offset": 1,
            "color": "#FFD166"
          }
        ]
      },
      "base": {
        "x": 410.8,
        "y": 674.3,
        "width": 253.13,
        "height": 253.13,
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
        "x": 617.58,
        "y": 496.84,
        "width": 170.44,
        "height": 476.72,
        "opacity": 0
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 19.41,
            "y": 0
          },
          {
            "id": "v1",
            "x": 135,
            "y": 139.22
          },
          {
            "id": "v2",
            "x": 170.44,
            "y": 230.34
          },
          {
            "id": "v3",
            "x": 165.38,
            "y": 320.63
          },
          {
            "id": "v4",
            "x": 101.25,
            "y": 424.41
          },
          {
            "id": "v5",
            "x": 25.31,
            "y": 469.97
          },
          {
            "id": "v6",
            "x": 0,
            "y": 476.72
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1",
            "tangentStart": {
              "x": 17.34,
              "y": 20.88
            },
            "tangentEnd": {
              "x": -22.65,
              "y": -34.55
            }
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2",
            "tangentStart": {
              "x": 22.65,
              "y": 34.55
            },
            "tangentEnd": {
              "x": -4.56,
              "y": -27.21
            }
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3",
            "tangentStart": {
              "x": 4.56,
              "y": 27.21
            },
            "tangentEnd": {
              "x": 10.38,
              "y": -29.11
            }
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4",
            "tangentStart": {
              "x": -10.38,
              "y": 29.11
            },
            "tangentEnd": {
              "x": 21.01,
              "y": -22.4
            }
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v5",
            "tangentStart": {
              "x": -21.01,
              "y": 22.4
            },
            "tangentEnd": {
              "x": 15.19,
              "y": -7.85
            }
          },
          {
            "id": "s5",
            "startVertexId": "v5",
            "endVertexId": "v6",
            "tangentStart": {
              "x": -15.19,
              "y": 7.85
            },
            "tangentEnd": {
              "x": 3.8,
              "y": -1.01
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
        "startFrame": 218,
        "durationFrames": 52
      },
      "kind": "path",
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 151.88,
            "y": 0,
            "cornerRadius": 55.69
          },
          {
            "id": "v1",
            "x": 303.75,
            "y": 263.06,
            "cornerRadius": 55.69
          },
          {
            "id": "v2",
            "x": 0,
            "y": 263.06,
            "cornerRadius": 55.69
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
      },
      "base": {
        "x": 465.7,
        "y": 810.5,
        "width": 303.75,
        "height": 263.06,
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
        "x": -75.95,
        "y": 433.53,
        "width": 967.78,
        "height": 670.78,
        "opacity": 0
      },
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 0,
            "y": 426.09
          },
          {
            "id": "v1",
            "x": 379.69,
            "y": 0
          },
          {
            "id": "v2",
            "x": 784.69,
            "y": 75.94
          },
          {
            "id": "v3",
            "x": 967.78,
            "y": 294.47
          },
          {
            "id": "v4",
            "x": 952.59,
            "y": 507.09
          },
          {
            "id": "v5",
            "x": 851.34,
            "y": 630.28
          },
          {
            "id": "v6",
            "x": 738.28,
            "y": 670.78
          },
          {
            "id": "v7",
            "x": 647.16,
            "y": 655.59
          },
          {
            "id": "v8",
            "x": 560.25,
            "y": 567
          },
          {
            "id": "v9",
            "x": 561.09,
            "y": 492.75
          },
          {
            "id": "v10",
            "x": 588.94,
            "y": 461.53
          },
          {
            "id": "v11",
            "x": 610.88,
            "y": 459.84
          }
        ],
        "segments": [
          {
            "id": "s0",
            "startVertexId": "v0",
            "endVertexId": "v1",
            "tangentStart": {
              "x": 56.95,
              "y": -63.91
            },
            "tangentEnd": {
              "x": -117.7,
              "y": 52.52
            }
          },
          {
            "id": "s1",
            "startVertexId": "v1",
            "endVertexId": "v2",
            "tangentStart": {
              "x": 117.7,
              "y": -52.52
            },
            "tangentEnd": {
              "x": -88.21,
              "y": -44.17
            }
          },
          {
            "id": "s2",
            "startVertexId": "v2",
            "endVertexId": "v3",
            "tangentStart": {
              "x": 88.21,
              "y": 44.17
            },
            "tangentEnd": {
              "x": -25.18,
              "y": -64.67
            }
          },
          {
            "id": "s3",
            "startVertexId": "v3",
            "endVertexId": "v4",
            "tangentStart": {
              "x": 25.18,
              "y": 64.67
            },
            "tangentEnd": {
              "x": 17.47,
              "y": -50.37
            }
          },
          {
            "id": "s4",
            "startVertexId": "v4",
            "endVertexId": "v5",
            "tangentStart": {
              "x": -17.47,
              "y": 50.37
            },
            "tangentEnd": {
              "x": 32.15,
              "y": -24.55
            }
          },
          {
            "id": "s5",
            "startVertexId": "v5",
            "endVertexId": "v6",
            "tangentStart": {
              "x": -32.15,
              "y": 24.55
            },
            "tangentEnd": {
              "x": 30.63,
              "y": -3.8
            }
          },
          {
            "id": "s6",
            "startVertexId": "v6",
            "endVertexId": "v7",
            "tangentStart": {
              "x": -30.63,
              "y": 3.8
            },
            "tangentEnd": {
              "x": 26.7,
              "y": 15.57
            }
          },
          {
            "id": "s7",
            "startVertexId": "v7",
            "endVertexId": "v8",
            "tangentStart": {
              "x": -26.7,
              "y": -15.57
            },
            "tangentEnd": {
              "x": 12.91,
              "y": 24.43
            }
          },
          {
            "id": "s8",
            "startVertexId": "v8",
            "endVertexId": "v9",
            "tangentStart": {
              "x": -12.91,
              "y": -24.43
            },
            "tangentEnd": {
              "x": -4.3,
              "y": 15.82
            }
          },
          {
            "id": "s9",
            "startVertexId": "v9",
            "endVertexId": "v10",
            "tangentStart": {
              "x": 4.3,
              "y": -15.82
            },
            "tangentEnd": {
              "x": -7.47,
              "y": 4.94
            }
          },
          {
            "id": "s10",
            "startVertexId": "v10",
            "endVertexId": "v11",
            "tangentStart": {
              "x": 7.47,
              "y": -4.94
            },
            "tangentEnd": {
              "x": -3.29,
              "y": 0.25
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
        "startFrame": 200,
        "durationFrames": 70
      },
      "kind": "shape",
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#00D4B2"
      },
      "base": {
        "x": 239.6,
        "y": 598.1,
        "width": 590.63,
        "height": 590.63,
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
        "startFrame": 200,
        "durationFrames": 70
      },
      "kind": "shape",
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      },
      "base": {
        "x": 239.6,
        "y": 598.1,
        "width": 590.63,
        "height": 590.63,
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
        "startFrame": 212,
        "durationFrames": 58
      },
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 47.25,
      "fill": {
        "kind": "linear",
        "angleDeg": 235,
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
      },
      "base": {
        "x": 410.8,
        "y": 674.3,
        "width": 253.13,
        "height": 253.13,
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
        "startFrame": 200,
        "durationFrames": 70
      },
      "kind": "shape",
      "shape": "ellipse",
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      },
      "base": {
        "x": 239.6,
        "y": 598.1,
        "width": 590.63,
        "height": 590.63,
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
        "startFrame": 218,
        "durationFrames": 52
      },
      "kind": "path",
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 151.88,
            "y": 0,
            "cornerRadius": 55.69
          },
          {
            "id": "v1",
            "x": 303.75,
            "y": 263.06,
            "cornerRadius": 55.69
          },
          {
            "id": "v2",
            "x": 0,
            "y": 263.06,
            "cornerRadius": 55.69
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
      },
      "base": {
        "x": 465.7,
        "y": 810.5,
        "width": 303.75,
        "height": 263.06,
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
        "startFrame": 212,
        "durationFrames": 58
      },
      "kind": "shape",
      "shape": "rectangle",
      "borderRadius": 47.25,
      "fill": {
        "kind": "solid",
        "color": "#FFFFFF"
      },
      "base": {
        "x": 410.8,
        "y": 674.3,
        "width": 253.13,
        "height": 253.13,
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
        "startFrame": 218,
        "durationFrames": 52
      },
      "kind": "path",
      "network": {
        "vertices": [
          {
            "id": "v0",
            "x": 151.88,
            "y": 0,
            "cornerRadius": 55.69
          },
          {
            "id": "v1",
            "x": 303.75,
            "y": 263.06,
            "cornerRadius": 55.69
          },
          {
            "id": "v2",
            "x": 0,
            "y": 263.06,
            "cornerRadius": 55.69
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
        "color": "#00D4B2"
      },
      "base": {
        "x": 465.7,
        "y": 810.5,
        "width": 303.75,
        "height": 263.06,
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
      "id": "act_txt_ship_slide",
      "name": "Ship arrives",
      "targetId": "txt_ship",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 0,
      "durationFrames": 53,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-1"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_ship_slide_k0",
          "frame": 0,
          "x": 74,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_ship_slide_k1",
          "frame": 52,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_ship_track",
      "name": "Ship closes up",
      "targetId": "txt_ship",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 0,
      "durationFrames": 49,
      "baseValue": -3.6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-1"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_ship_track_k0",
          "frame": 0,
          "value": 5.5,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_ship_track_k1",
          "frame": 48,
          "value": -3.6
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_fearless_slide",
      "name": "fearless arrives",
      "targetId": "txt_fearless",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 34,
      "durationFrames": 53,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_fearless_slide_k0",
          "frame": 0,
          "x": 97,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_fearless_slide_k1",
          "frame": 52,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_fearless_track",
      "name": "fearless closes up",
      "targetId": "txt_fearless",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 34,
      "durationFrames": 49,
      "baseValue": -3.6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-2"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_fearless_track_k0",
          "frame": 0,
          "value": 5.5,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_fearless_track_k1",
          "frame": 48,
          "value": -3.6
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_agents_slide",
      "name": "agents arrives",
      "targetId": "txt_agents",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 68,
      "durationFrames": 53,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_agents_slide_k0",
          "frame": 0,
          "x": 90,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_agents_slide_k1",
          "frame": 52,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_agents_track",
      "name": "agents closes up",
      "targetId": "txt_agents",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 68,
      "durationFrames": 49,
      "baseValue": -3.6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-3"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_agents_track_k0",
          "frame": 0,
          "value": 5.5,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_agents_track_k1",
          "frame": 48,
          "value": -3.6
        }
      ]
    },
    {
      "kind": "vec2",
      "id": "act_txt_at_scale_slide",
      "name": "at scale arrives",
      "targetId": "txt_at_scale",
      "property": "move",
      "mode": "add",
      "stage": "in",
      "startFrame": 101,
      "durationFrames": 53,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-4"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_at_scale_slide_k0",
          "frame": 0,
          "x": 96,
          "y": 0,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_at_scale_slide_k1",
          "frame": 52,
          "x": 0,
          "y": 0
        }
      ]
    },
    {
      "kind": "scalar",
      "id": "act_txt_at_scale_track",
      "name": "at scale closes up",
      "targetId": "txt_at_scale",
      "property": "letterSpacing",
      "mode": "set",
      "stage": "custom",
      "startFrame": 101,
      "durationFrames": 49,
      "baseValue": -3.6,
      "reason": {
        "purpose": "arrive",
        "cues": [
          "line-4"
        ],
        "lands": "start"
      },
      "keys": [
        {
          "id": "act_txt_at_scale_track_k0",
          "frame": 0,
          "value": 5.5,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuart"
          }
        },
        {
          "id": "act_txt_at_scale_track_k1",
          "frame": 48,
          "value": -3.6
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
      "startFrame": 186,
      "durationFrames": 33,
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
          "frame": 21,
          "value": 12,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_statement_world_defocus_k2",
          "frame": 32,
          "value": 35
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
      "startFrame": 208,
      "durationFrames": 12,
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
          "frame": 11,
          "value": 0
        }
      ]
    },
    {
      "id": "act_ribbon_spin",
      "name": "Ribbon snaps round on each arrival",
      "targetId": "backdrop_ribbon",
      "startFrame": 0,
      "durationFrames": 220,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-1",
          "line-2",
          "line-3",
          "line-4"
        ],
        "lands": "peak",
        "peaks": [
          "line-2",
          "line-3",
          "line-4"
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
            "frame": 20,
            "value": -34.36,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_spin_k2",
            "frame": 21,
            "value": -36.97,
            "easing": {
              "kind": "easing",
              "preset": "easeInQuad"
            }
          },
          {
            "id": "act_ribbon_spin_k3",
            "frame": 34,
            "value": -76.14,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "act_ribbon_spin_k4",
            "frame": 49,
            "value": -112.04,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_spin_k5",
            "frame": 55,
            "value": -118.57,
            "easing": {
              "kind": "easing",
              "preset": "easeInQuad"
            }
          },
          {
            "id": "act_ribbon_spin_k6",
            "frame": 68,
            "value": -160.81,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "act_ribbon_spin_k7",
            "frame": 83,
            "value": -199.53,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_spin_k8",
            "frame": 88,
            "value": -206.57,
            "easing": {
              "kind": "easing",
              "preset": "easeInQuad"
            }
          },
          {
            "id": "act_ribbon_spin_k9",
            "frame": 101,
            "value": -259.56,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuart"
            }
          },
          {
            "id": "act_ribbon_spin_k10",
            "frame": 116,
            "value": -308.14,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_spin_k11",
            "frame": 219,
            "value": -316.97
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
      "durationFrames": 220,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-3"
        ],
        "lands": "start"
      },
      "tracks": {
        "pillarSize": [
          {
            "id": "act_ribbon_body_pillar_k0",
            "frame": 0,
            "value": 106,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_pillar_k1",
            "frame": 62,
            "value": 99,
            "easing": {
              "kind": "easing",
              "preset": "easeInQuad"
            }
          },
          {
            "id": "act_ribbon_body_pillar_k2",
            "frame": 68,
            "value": 75,
            "easing": {
              "kind": "easing",
              "preset": "easeOutCubic"
            }
          },
          {
            "id": "act_ribbon_body_pillar_k3",
            "frame": 80,
            "value": 128,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_pillar_k4",
            "frame": 101,
            "value": 136,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_pillar_k5",
            "frame": 219,
            "value": 136
          }
        ],
        "baseHalfGap": [
          {
            "id": "act_ribbon_body_gap_k0",
            "frame": 0,
            "value": 255,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_gap_k1",
            "frame": 67,
            "value": 251,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_gap_k2",
            "frame": 68,
            "value": 245,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuad"
            }
          },
          {
            "id": "act_ribbon_body_gap_k3",
            "frame": 82,
            "value": 250,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_gap_k4",
            "frame": 101,
            "value": 248,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_gap_k5",
            "frame": 219,
            "value": 248
          }
        ],
        "fadeHeight": [
          {
            "id": "act_ribbon_body_fade_k0",
            "frame": 0,
            "value": 410,
            "easing": {
              "kind": "easing",
              "preset": "easeOutQuad"
            }
          },
          {
            "id": "act_ribbon_body_fade_k1",
            "frame": 67,
            "value": 573,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_fade_k2",
            "frame": 82,
            "value": 704,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_fade_k3",
            "frame": 119,
            "value": 813,
            "easing": {
              "kind": "linear"
            }
          },
          {
            "id": "act_ribbon_body_fade_k4",
            "frame": 219,
            "value": 813
          }
        ]
      }
    },
    {
      "id": "act_world_ring_turn",
      "name": "World turns on each arrival",
      "targetId": "world_ring",
      "startFrame": 0,
      "durationFrames": 220,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-1",
          "line-2",
          "line-3",
          "line-4",
          "turn"
        ],
        "lands": "peak",
        "peaks": [
          "line-2",
          "line-3",
          "line-4",
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
          "frame": 12,
          "value": 39.67,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_world_ring_turn_k2",
          "frame": 24,
          "value": 55.53,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_world_ring_turn_k3",
          "frame": 34,
          "value": 82.31,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_world_ring_turn_k4",
          "frame": 46,
          "value": 126.93,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_world_ring_turn_k5",
          "frame": 58,
          "value": 144.78,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_world_ring_turn_k6",
          "frame": 68,
          "value": 173.66,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_world_ring_turn_k7",
          "frame": 80,
          "value": 221.78,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_world_ring_turn_k8",
          "frame": 91,
          "value": 241.03,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_world_ring_turn_k9",
          "frame": 101,
          "value": 277.26,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_world_ring_turn_k10",
          "frame": 113,
          "value": 337.63,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_world_ring_turn_k11",
          "frame": 180,
          "value": 361.78,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_world_ring_turn_k12",
          "frame": 200,
          "value": 393.28,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_world_ring_turn_k13",
          "frame": 218,
          "value": 466.78,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_world_ring_turn_k14",
          "frame": 219,
          "value": 466.78
        }
      ]
    },
    {
      "id": "act_mid_blue_big_makes_room",
      "name": "Large orb makes room",
      "targetId": "mid_blue_big",
      "startFrame": 0,
      "durationFrames": 220,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-1",
          "line-2",
          "line-3",
          "line-4",
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
          "frame": 14,
          "x": 20.53,
          "y": 6.28,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k2",
          "frame": 34,
          "x": 19.18,
          "y": 5.86,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k3",
          "frame": 48,
          "x": 96.16,
          "y": 29.4,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k4",
          "frame": 68,
          "x": 91.13,
          "y": 27.86,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k5",
          "frame": 82,
          "x": 176.66,
          "y": 54.01,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k6",
          "frame": 101,
          "x": 171.06,
          "y": 52.3,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k7",
          "frame": 115,
          "x": 269.42,
          "y": 82.37,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k8",
          "frame": 176,
          "x": 262.98,
          "y": 80.4,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k9",
          "frame": 200,
          "x": 162.39,
          "y": 49.65,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k10",
          "frame": 212,
          "x": 39.45,
          "y": 12.06,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_makes_room_k11",
          "frame": 219,
          "x": 39.45,
          "y": 12.06
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
      "durationFrames": 220,
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
          "frame": 12,
          "value": -39.67,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k2",
          "frame": 24,
          "value": -55.53,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k3",
          "frame": 34,
          "value": -82.31,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k4",
          "frame": 46,
          "value": -126.93,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k5",
          "frame": 58,
          "value": -144.78,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k6",
          "frame": 68,
          "value": -173.66,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k7",
          "frame": 80,
          "value": -221.78,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k8",
          "frame": 91,
          "value": -241.03,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k9",
          "frame": 101,
          "value": -277.26,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k10",
          "frame": 113,
          "value": -337.63,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k11",
          "frame": 180,
          "value": -361.78,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k12",
          "frame": 200,
          "value": -393.28,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k13",
          "frame": 218,
          "value": -466.78,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_big_upright_k14",
          "frame": 219,
          "value": -466.78
        }
      ]
    },
    {
      "id": "act_mid_tri_big_makes_room",
      "name": "Large triangle makes room",
      "targetId": "mid_tri_big",
      "startFrame": 0,
      "durationFrames": 220,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-1",
          "line-2",
          "line-3",
          "line-4",
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
          "frame": 14,
          "x": 9.24,
          "y": -19.81,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k2",
          "frame": 34,
          "x": 8.63,
          "y": -18.52,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k3",
          "frame": 48,
          "x": 43.28,
          "y": -92.81,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k4",
          "frame": 68,
          "x": 41.01,
          "y": -87.95,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k5",
          "frame": 82,
          "x": 79.51,
          "y": -170.5,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k6",
          "frame": 101,
          "x": 76.99,
          "y": -165.1,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k7",
          "frame": 115,
          "x": 121.26,
          "y": -260.04,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k8",
          "frame": 176,
          "x": 118.36,
          "y": -253.83,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k9",
          "frame": 200,
          "x": 73.09,
          "y": -156.74,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k10",
          "frame": 212,
          "x": 17.75,
          "y": -38.07,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_big_makes_room_k11",
          "frame": 219,
          "x": 17.75,
          "y": -38.07
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
      "durationFrames": 220,
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
          "frame": 219,
          "value": 78
        }
      ]
    },
    {
      "id": "act_mid_tri_small_makes_room",
      "name": "Small triangle makes room",
      "targetId": "mid_tri_small",
      "startFrame": 0,
      "durationFrames": 220,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-1",
          "line-2",
          "line-3",
          "line-4",
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
          "frame": 14,
          "x": -2.16,
          "y": 20.56,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k2",
          "frame": 34,
          "x": -2.02,
          "y": 19.21,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k3",
          "frame": 48,
          "x": -10.12,
          "y": 96.32,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k4",
          "frame": 68,
          "x": -9.59,
          "y": 91.28,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k5",
          "frame": 82,
          "x": -18.6,
          "y": 176.95,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k6",
          "frame": 101,
          "x": -18.01,
          "y": 171.35,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k7",
          "frame": 115,
          "x": -28.36,
          "y": 269.86,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k8",
          "frame": 176,
          "x": -27.69,
          "y": 263.42,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k9",
          "frame": 200,
          "x": -17.1,
          "y": 162.66,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k10",
          "frame": 212,
          "x": -4.15,
          "y": 39.51,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_tri_small_makes_room_k11",
          "frame": 219,
          "x": -4.15,
          "y": 39.51
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
      "durationFrames": 220,
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
          "frame": 219,
          "value": 80
        }
      ]
    },
    {
      "id": "act_mid_blue_small_makes_room",
      "name": "Small orb makes room",
      "targetId": "mid_blue_small",
      "startFrame": 68,
      "durationFrames": 152,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-3",
          "line-4",
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
          "frame": 14,
          "x": -92.74,
          "y": -39.37,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k2",
          "frame": 33,
          "x": -86.67,
          "y": -36.79,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k3",
          "frame": 47,
          "x": -193.32,
          "y": -82.06,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k4",
          "frame": 108,
          "x": -186.35,
          "y": -79.1,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k5",
          "frame": 132,
          "x": -115.06,
          "y": -48.84,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k6",
          "frame": 144,
          "x": -27.96,
          "y": -11.87,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_makes_room_k7",
          "frame": 151,
          "x": -27.96,
          "y": -11.87
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
      "startFrame": 68,
      "durationFrames": 152,
      "reason": {
        "purpose": "keep"
      },
      "keys": [
        {
          "id": "act_mid_blue_small_upright_k0",
          "frame": 0,
          "value": -173.66,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k1",
          "frame": 12,
          "value": -221.78,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k2",
          "frame": 23,
          "value": -241.03,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k3",
          "frame": 33,
          "value": -277.26,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k4",
          "frame": 45,
          "value": -337.63,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k5",
          "frame": 112,
          "value": -361.78,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k6",
          "frame": 132,
          "value": -393.28,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k7",
          "frame": 150,
          "value": -466.78,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_blue_small_upright_k8",
          "frame": 151,
          "value": -466.78
        }
      ]
    },
    {
      "id": "act_mid_warm_tiny_makes_room",
      "name": "Tiny square makes room",
      "targetId": "mid_warm_tiny",
      "startFrame": 68,
      "durationFrames": 152,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-3",
          "line-4",
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
          "frame": 14,
          "x": -115.11,
          "y": 39.63,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k2",
          "frame": 33,
          "x": -107.58,
          "y": 37.04,
          "easing": {
            "kind": "easing",
            "preset": "easeOutCubic"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k3",
          "frame": 47,
          "x": -239.95,
          "y": 82.62,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k4",
          "frame": 108,
          "x": -231.29,
          "y": 79.64,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k5",
          "frame": 132,
          "x": -142.83,
          "y": 49.18,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k6",
          "frame": 144,
          "x": -34.69,
          "y": 11.95,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_tiny_makes_room_k7",
          "frame": 151,
          "x": -34.69,
          "y": 11.95
        }
      ]
    },
    {
      "id": "act_mid_warm_big_makes_room",
      "name": "Large square makes room",
      "targetId": "mid_warm_big",
      "startFrame": 101,
      "durationFrames": 119,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4",
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
          "frame": 14,
          "x": -88.38,
          "y": -159.44,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_big_makes_room_k2",
          "frame": 75,
          "x": -82.6,
          "y": -149.02,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_warm_big_makes_room_k3",
          "frame": 99,
          "x": -51.01,
          "y": -92.02,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_big_makes_room_k4",
          "frame": 111,
          "x": -12.39,
          "y": -22.36,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_big_makes_room_k5",
          "frame": 118,
          "x": -12.39,
          "y": -22.36
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
      "startFrame": 101,
      "durationFrames": 119,
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
          "frame": 118,
          "value": -35
        }
      ]
    },
    {
      "id": "act_mid_warm_med_makes_room",
      "name": "Medium square makes room",
      "targetId": "mid_warm_med",
      "startFrame": 101,
      "durationFrames": 119,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4",
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
          "frame": 14,
          "x": 92.13,
          "y": 131.58,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_med_makes_room_k2",
          "frame": 75,
          "x": 86.11,
          "y": 122.98,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_mid_warm_med_makes_room_k3",
          "frame": 99,
          "x": 53.17,
          "y": 75.94,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_med_makes_room_k4",
          "frame": 111,
          "x": 12.92,
          "y": 18.45,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_mid_warm_med_makes_room_k5",
          "frame": 118,
          "x": 12.92,
          "y": 18.45
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
      "startFrame": 68,
      "durationFrames": 22,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-3"
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
          "frame": 6,
          "x": -31.2,
          "y": 544,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_orb_pass_k2",
          "frame": 13,
          "x": -81,
          "y": 690.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_orb_pass_k3",
          "frame": 21,
          "x": -157.8,
          "y": 930.7
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
      "startFrame": 84,
      "durationFrames": 6,
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
          "frame": 5,
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
      "startFrame": 68,
      "durationFrames": 22,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-3"
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
          "frame": 4,
          "x": 25.3,
          "y": -306.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_square_pass_k2",
          "frame": 15,
          "x": 135.8,
          "y": -592,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_lead_square_pass_k3",
          "frame": 21,
          "x": 215.2,
          "y": -960
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
      "startFrame": 68,
      "durationFrames": 22,
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
          "frame": 21,
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
      "startFrame": 84,
      "durationFrames": 6,
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
          "frame": 5,
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
      "startFrame": 105,
      "durationFrames": 115,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4"
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
          "frame": 11,
          "x": -79.3,
          "y": -309.3,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k2",
          "frame": 20,
          "x": -108,
          "y": -568,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k3",
          "frame": 46,
          "x": -121.5,
          "y": -1042.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k4",
          "frame": 63,
          "x": -112.2,
          "y": -1304,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k5",
          "frame": 86,
          "x": -63.3,
          "y": -1613.3,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k6",
          "frame": 103,
          "x": 113.1,
          "y": -1768,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k7",
          "frame": 108,
          "x": 245.5,
          "y": -1728,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_orb_pass_k8",
          "frame": 114,
          "x": 337.5,
          "y": -1573.3
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
      "startFrame": 113,
      "durationFrames": 107,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4"
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
          "frame": 9,
          "x": -77.6,
          "y": 325.3,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_square_pass_k2",
          "frame": 53,
          "x": -81,
          "y": 928,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_pass_hold_square_pass_k3",
          "frame": 77,
          "x": -162.8,
          "y": 1082.7,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_pass_hold_square_pass_k4",
          "frame": 94,
          "x": -333.3,
          "y": 1280,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_square_pass_k5",
          "frame": 106,
          "x": -502,
          "y": 1400
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
      "startFrame": 113,
      "durationFrames": 107,
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
          "frame": 106,
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
      "startFrame": 113,
      "durationFrames": 107,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4"
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
          "frame": 9,
          "x": 40.5,
          "y": 210.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k2",
          "frame": 36,
          "x": 104.6,
          "y": 613.3,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k3",
          "frame": 55,
          "x": 103.8,
          "y": 874.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k4",
          "frame": 79,
          "x": 62.4,
          "y": 1237.3,
          "easing": {
            "kind": "easing",
            "preset": "easeInQuad"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k5",
          "frame": 94,
          "x": -40.5,
          "y": 1514.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_hold_small_pass_k6",
          "frame": 106,
          "x": -147.7,
          "y": 1826.7
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
      "startFrame": 101,
      "durationFrames": 14,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4"
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
          "frame": 13,
          "x": -156.9,
          "y": -354.7
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
      "startFrame": 101,
      "durationFrames": 14,
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
          "frame": 13,
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
      "startFrame": 109,
      "durationFrames": 6,
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
          "frame": 5,
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
      "startFrame": 101,
      "durationFrames": 16,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4"
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
          "frame": 15,
          "x": 131.6,
          "y": 362.7
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
      "startFrame": 101,
      "durationFrames": 16,
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
          "frame": 15,
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
      "startFrame": 111,
      "durationFrames": 6,
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
          "frame": 5,
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
      "startFrame": 101,
      "durationFrames": 32,
      "reason": {
        "purpose": "respond",
        "cues": [
          "line-4"
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
          "frame": 19,
          "x": -111.4,
          "y": -5.3,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_burst_small_pass_k2",
          "frame": 31,
          "x": -236.2,
          "y": -45.3
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
      "startFrame": 101,
      "durationFrames": 32,
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
          "frame": 31,
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
      "startFrame": 127,
      "durationFrames": 6,
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
          "frame": 5,
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
      "startFrame": 192,
      "durationFrames": 26,
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
          "frame": 6,
          "x": -56.5,
          "y": 106.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_square_pass_k2",
          "frame": 17,
          "x": -202.5,
          "y": 133.3,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_square_pass_k3",
          "frame": 25,
          "x": -264.9,
          "y": 285.3
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
      "startFrame": 192,
      "durationFrames": 26,
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
          "frame": 25,
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
      "startFrame": 200,
      "durationFrames": 18,
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
          "frame": 6,
          "x": 38,
          "y": -306.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_triangle_pass_k2",
          "frame": 11,
          "x": 63.3,
          "y": -546.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_triangle_pass_k3",
          "frame": 13,
          "x": 93.7,
          "y": -738.7,
          "easing": {
            "kind": "linear"
          }
        },
        {
          "id": "act_pass_exit_triangle_pass_k4",
          "frame": 17,
          "x": 154.4,
          "y": -1186.7
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
      "startFrame": 200,
      "durationFrames": 18,
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
          "frame": 17,
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
      "startFrame": 212,
      "durationFrames": 28,
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
      "startFrame": 212,
      "durationFrames": 28,
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
          "frame": 12,
          "x": 1.113,
          "y": 1.113,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_square_scale_k2",
          "frame": 27,
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
      "startFrame": 212,
      "durationFrames": 28,
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
          "frame": 11,
          "value": 130,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_square_spin_k2",
          "frame": 27,
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
      "startFrame": 218,
      "durationFrames": 22,
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
      "startFrame": 218,
      "durationFrames": 22,
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
          "frame": 9,
          "x": 1.11,
          "y": 1.11,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_triangle_scale_k2",
          "frame": 21,
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
      "startFrame": 218,
      "durationFrames": 22,
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
          "frame": 9,
          "value": 58,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_triangle_spin_k2",
          "frame": 21,
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
      "startFrame": 200,
      "durationFrames": 40,
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
      "startFrame": 200,
      "durationFrames": 40,
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
          "frame": 18,
          "x": 1.045,
          "y": 1.045,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_host_scale_k2",
          "frame": 39,
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
      "startFrame": 200,
      "durationFrames": 40,
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
      "startFrame": 200,
      "durationFrames": 40,
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
          "frame": 18,
          "x": 1.045,
          "y": 1.045,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_host_scale__mask_mark_host_for_mark_square_k2",
          "frame": 39,
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
      "startFrame": 212,
      "durationFrames": 28,
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
      "startFrame": 212,
      "durationFrames": 28,
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
          "frame": 12,
          "x": 1.113,
          "y": 1.113,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_square_scale__mark_square_over_mark_host_k2",
          "frame": 27,
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
      "startFrame": 212,
      "durationFrames": 28,
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
          "frame": 11,
          "value": 130,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_square_spin__mark_square_over_mark_host_k2",
          "frame": 27,
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
      "startFrame": 200,
      "durationFrames": 40,
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
      "startFrame": 200,
      "durationFrames": 40,
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
          "frame": 18,
          "x": 1.045,
          "y": 1.045,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_host_scale__mask_mark_host_for_mark_triangle_k2",
          "frame": 39,
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
      "startFrame": 218,
      "durationFrames": 22,
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
      "startFrame": 218,
      "durationFrames": 22,
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
          "frame": 9,
          "x": 1.11,
          "y": 1.11,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_triangle_scale__mark_triangle_over_mark_host_k2",
          "frame": 21,
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
      "startFrame": 218,
      "durationFrames": 22,
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
          "frame": 9,
          "value": 58,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_triangle_spin__mark_triangle_over_mark_host_k2",
          "frame": 21,
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
      "startFrame": 212,
      "durationFrames": 28,
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
      "startFrame": 212,
      "durationFrames": 28,
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
          "frame": 12,
          "x": 1.113,
          "y": 1.113,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_square_scale__mask_mark_square_for_mark_triangle_k2",
          "frame": 27,
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
      "startFrame": 212,
      "durationFrames": 28,
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
          "frame": 11,
          "value": 130,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_square_spin__mask_mark_square_for_mark_triangle_k2",
          "frame": 27,
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
      "startFrame": 218,
      "durationFrames": 22,
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
      "startFrame": 218,
      "durationFrames": 22,
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
          "frame": 9,
          "x": 1.11,
          "y": 1.11,
          "easing": {
            "kind": "easing",
            "preset": "easeInSine"
          }
        },
        {
          "id": "act_mark_triangle_scale__mark_triangle_over_mark_square_k2",
          "frame": 21,
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
      "startFrame": 218,
      "durationFrames": 22,
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
          "frame": 9,
          "value": 58,
          "easing": {
            "kind": "easing",
            "preset": "easeOutQuad"
          }
        },
        {
          "id": "act_mark_triangle_spin__mark_triangle_over_mark_square_k2",
          "frame": 21,
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
        "frame": 34,
        "kind": "beat",
        "weight": 0.9,
        "why": "A step of the run-up toward the accent."
      },
      {
        "name": "line-3",
        "frame": 68,
        "kind": "beat",
        "weight": 1,
        "why": "A step of the run-up toward the accent."
      },
      {
        "name": "line-4",
        "frame": 101,
        "kind": "accent",
        "weight": 1.15,
        "why": "The arrival the phrase builds to. It keeps the stage longest and the world answers it hardest."
      },
      {
        "name": "turn",
        "frame": 200,
        "kind": "structure",
        "weight": 1,
        "why": "Attention passes from the statement to the mark."
      },
      {
        "name": "land",
        "frame": 239,
        "kind": "structure",
        "weight": 1,
        "why": "The mark is complete and at rest."
      }
    ],
    "subjects": [
      {
        "nodeId": "txt_ship",
        "cue": "line-1",
        "needsSec": 0.48,
        "untilFrame": 186,
        "accent": false
      },
      {
        "nodeId": "txt_fearless",
        "cue": "line-2",
        "needsSec": 0.66,
        "untilFrame": 186,
        "accent": false
      },
      {
        "nodeId": "txt_agents",
        "cue": "line-3",
        "needsSec": 0.57,
        "untilFrame": 186,
        "accent": false
      },
      {
        "nodeId": "txt_at_scale",
        "cue": "line-4",
        "needsSec": 0.66,
        "untilFrame": 186,
        "accent": true
      }
    ],
    "claimFrames": 18,
    "regions": {
      "statement": {
        "x": 251,
        "y": 608,
        "width": 578,
        "height": 739
      }
    },
    "safeArea": {
      "x": 86,
      "y": 173,
      "width": 908,
      "height": 1574
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
        "frame": 239,
        "minShare": 0.5,
        "why": "A part of the mark rests on its host; off it, the mark has come apart."
      },
      {
        "kind": "overlap",
        "a": "mark_triangle",
        "b": "mark_host",
        "frame": 239,
        "minShare": 0.5,
        "why": "A part of the mark rests on its host; off it, the mark has come apart."
      },
      {
        "kind": "overlap",
        "a": "mark_triangle",
        "b": "mark_square",
        "frame": 239,
        "minShare": 0.03,
        "why": "The overlap has its own fill, so the two parts must cross at rest."
      }
    ],
    "handoff": {
      "exit": {
        "frame": 239,
        "nodeId": "mark_host",
        "position": {
          "x": 534.9,
          "y": 893.4
        },
        "velocity": {
          "x": 1,
          "y": 0
        },
        "size": 495,
        "color": "#00D4B2"
      },
      "entry": {
        "frame": 0,
        "nodeId": "txt_ship",
        "position": {
          "x": 614,
          "y": 718
        },
        "velocity": {
          "x": -332,
          "y": 0
        },
        "size": 339,
        "color": "#F6F8FC"
      }
    },
    "notes": []
  }
} as const;
const LIVES: Record<string, { start: number; end: number }> = {"statement_world":{"start":0,"end":220},"statement":{"start":0,"end":270},"txt_ship":{"start":0,"end":270},"txt_fearless":{"start":34,"end":270},"txt_agents":{"start":68,"end":270},"txt_at_scale":{"start":101,"end":270},"backdrop_ribbon":{"start":0,"end":270},"world_ring":{"start":0,"end":270},"mid_blue_big":{"start":0,"end":270},"mid_tri_big":{"start":0,"end":270},"mid_tri_small":{"start":0,"end":270},"mid_blue_small":{"start":68,"end":220},"mid_warm_tiny":{"start":68,"end":220},"mid_warm_big":{"start":101,"end":220},"mid_warm_med":{"start":101,"end":220},"foreground":{"start":0,"end":270},"pass_lead_orb":{"start":68,"end":90},"pass_lead_square":{"start":68,"end":90},"pass_hold_orb":{"start":105,"end":270},"pass_hold_square":{"start":113,"end":270},"pass_hold_small":{"start":113,"end":270},"pass_burst_square":{"start":101,"end":115},"pass_burst_triangle":{"start":101,"end":117},"pass_burst_small":{"start":101,"end":133},"pass_exit_square":{"start":192,"end":270},"pass_exit_triangle":{"start":200,"end":270},"mark":{"start":0,"end":270},"guide_mark_square":{"start":0,"end":270},"mark_square":{"start":212,"end":270},"guide_mark_triangle":{"start":0,"end":270},"mark_triangle":{"start":218,"end":270},"guide_mark_host":{"start":0,"end":270},"mark_host":{"start":200,"end":270},"mask_mark_host_for_mark_square":{"start":200,"end":270},"mark_square_over_mark_host":{"start":212,"end":270},"mask_mark_host_for_mark_triangle":{"start":200,"end":270},"mark_triangle_over_mark_host":{"start":218,"end":270},"mask_mark_square_for_mark_triangle":{"start":212,"end":270},"mark_triangle_over_mark_square":{"start":218,"end":270}};
const SVG_PATHS: Record<string, string> = {
  "mid_tri_big": "M 57.84 43.03 C 71.56 19.28, 93.82 19.28, 107.54 43.03 L 140.53 100.18 C 154.25 123.94, 143.12 143.22, 115.69 143.22 L 49.69 143.22 C 22.26 143.22, 11.13 123.94, 24.85 100.18 Z",
  "mid_tri_small": "M 25.32 18.99 C 31.37 8.51, 41.19 8.51, 47.24 18.99 L 61.6 43.85 C 67.65 54.33, 62.74 62.84, 50.63 62.84 L 21.93 62.84 C 9.82 62.84, 4.91 54.33, 10.96 43.85 Z",
  "pass_burst_triangle": "M 79.56 59.49 C 98.52 26.65, 129.3 26.65, 148.26 59.49 L 193.47 137.8 C 212.42 170.64, 197.04 197.29, 159.12 197.29 L 68.69 197.29 C 30.78 197.29, 15.39 170.64, 34.35 137.8 Z",
  "pass_exit_triangle": "M 94.08 70.88 C 116.67 31.75, 153.33 31.75, 175.92 70.88 L 229.08 162.96 C 251.67 202.08, 233.34 233.83, 188.16 233.83 L 81.84 233.83 C 36.66 233.83, 18.33 202.08, 40.92 162.96 Z",
  "guide_mark_square": "M 10.97 476.72 C 9.32 454.57, -1.27 368.04, 0 329.06 C 1.27 290.08, 3.84 258.6, 19.41 216.84 C 34.98 175.08, 75.43 83.16, 103.78 50.63 C 132.13 18.1, 182.34 6.71, 208.41 0 C 234.48 -6.71, 260.13 0.21, 277.59 5.91 C 295.05 11.61, 317.75 33.16, 324.84 37.97",
  "guide_mark_triangle": "M 19.41 0 C 36.75 20.88, 112.35 104.67, 135 139.22 C 157.65 173.77, 165.88 203.13, 170.44 230.34 C 175 257.55, 175.76 291.52, 165.38 320.63 C 155 349.74, 122.26 402.01, 101.25 424.41 C 80.24 446.81, 40.5 462.12, 25.31 469.97 C 10.12 477.82, 3.8 475.71, 0 476.72",
  "mark_triangle": "M 103.65 83.54 C 130.27 37.42, 173.49 37.42, 200.11 83.54 L 255.52 179.53 C 282.14 225.64, 260.54 263.06, 207.29 263.06 L 96.46 263.06 C 43.21 263.06, 21.61 225.64, 48.23 179.52 Z",
  "guide_mark_host": "M 0 426.09 C 56.95 362.18, 261.99 52.52, 379.69 0 C 497.39 -52.52, 696.48 31.77, 784.69 75.94 C 872.9 120.11, 942.6 229.8, 967.78 294.47 C 992.96 359.14, 970.06 456.72, 952.59 507.09 C 935.12 557.46, 883.49 605.73, 851.34 630.28 C 819.19 654.83, 768.91 666.98, 738.28 670.78 C 707.65 674.58, 673.86 671.16, 647.16 655.59 C 620.46 640.02, 573.16 591.43, 560.25 567 C 547.34 542.57, 556.79 508.57, 561.09 492.75 C 565.39 476.93, 581.47 466.47, 588.94 461.53 C 596.41 456.59, 607.59 460.09, 610.88 459.84",
  "mark_triangle_over_mark_host": "M 103.65 83.54 C 130.27 37.42, 173.49 37.42, 200.11 83.54 L 255.52 179.53 C 282.14 225.64, 260.54 263.06, 207.29 263.06 L 96.46 263.06 C 43.21 263.06, 21.61 225.64, 48.23 179.52 Z",
  "mark_triangle_over_mark_square": "M 103.65 83.54 C 130.27 37.42, 173.49 37.42, 200.11 83.54 L 255.52 179.53 C 282.14 225.64, 260.54 263.06, 207.29 263.06 L 96.46 263.06 C 43.21 263.06, 21.61 225.64, 48.23 179.52 Z"
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

export const VerticalVeridianMetadata = {
  id: "vertical_veridian",
  width: 1080,
  height: 1920,
  fps: 60,
  durationInFrames: 270,
};

export const VerticalVeridian: React.FC = () => {
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
