import {
  vectorNetworkToSvgPath,
  type FillSpec,
  type MotionDocument,
  type SceneNodeIR,
} from "@motion-sdk/core";

/**
 * Target Adapter B: Compiles Canonical Motion IR into a standalone, deterministic,
 * seek-safe HyperFrames HTML composition (`window.__timelines[id]` + SVG `<clipPath>` + procedural Canvas).
 * Complies with `hyperframes-core` determinism & lint contracts (zero CSS/GSAP transform conflicts).
 */
export function compileToHyperframes(doc: MotionDocument): string {
  const compId = doc.id.replace(/[^a-zA-Z0-9_-]/g, "-");
  const durSec = Math.round((doc.format.durationFrames / doc.format.fps) * 1000) / 1000;

  // Prepare SVG defs (gradients + vector mask clipPaths) and precomputed SVG path strings
  const svgPaths: Record<string, string> = {};
  for (const n of doc.nodes) {
    if (n.kind === "path") {
      svgPaths[n.id] = vectorNetworkToSvgPath(n.network);
    }
  }

  const defsMarkup: string[] = [];
  const fillRefFor = (nodeId: string, fill: FillSpec): string => {
    if (fill.kind === "none") return "none";
    if (fill.kind === "solid") return fill.color;
    if (fill.kind === "linear") {
      const gid = `grad_${nodeId}`;
      const rad = ((fill.angleDeg - 90) * Math.PI) / 180;
      const x1 = (50 - Math.cos(rad) * 50).toFixed(1);
      const y1 = (50 - Math.sin(rad) * 50).toFixed(1);
      const x2 = (50 + Math.cos(rad) * 50).toFixed(1);
      const y2 = (50 + Math.sin(rad) * 50).toFixed(1);
      const stops = fill.stops
        .map((s) => `<stop offset="${s.offset * 100}%" stop-color="${s.color}" />`)
        .join("");
      defsMarkup.push(
        `<linearGradient id="${gid}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`
      );
      return `url(#${gid})`;
    }
    if (fill.kind === "radial") {
      const gid = `grad_${nodeId}`;
      const cx = ((fill.domain.x + fill.domain.width / 2) * 100).toFixed(1);
      const cy = ((fill.domain.y + fill.domain.height / 2) * 100).toFixed(1);
      const r = ((fill.domain.width / 2) * 125).toFixed(1);
      const stops = fill.stops
        .map((s) => `<stop offset="${s.offset * 100}%" stop-color="${s.color}" />`)
        .join("");
      defsMarkup.push(
        `<radialGradient id="${gid}" cx="${cx}%" cy="${cy}%" r="${r}%">${stops}</radialGradient>`
      );
      return `url(#${gid})`;
    }
    return "transparent";
  };

  const maskTargetToClipId = new Map<string, string>();
  const maskSourceIds = new Set<string>();
  for (const m of doc.masks) {
    const clipId = `clip_${m.id}`;
    maskTargetToClipId.set(m.targetObjectId, clipId);
    maskSourceIds.add(m.sourceObjectId);
  }

  const nodeMap = new Map<string, SceneNodeIR>(doc.nodes.map((n) => [n.id, n]));
  for (const m of doc.masks) {
    const src = nodeMap.get(m.sourceObjectId);
    if (!src) continue;
    const clipId = `clip_${m.id}`;
    let inner = "";
    if (src.kind === "shape" && src.shape === "ellipse") {
      inner = `<ellipse id="el_${src.id}" cx="${src.base.width / 2}" cy="${src.base.height / 2}" rx="${src.base.width / 2}" ry="${src.base.height / 2}" />`;
    } else if (src.kind === "shape") {
      inner = `<rect id="el_${src.id}" x="0" y="0" width="${src.base.width}" height="${src.base.height}" rx="${src.borderRadius ?? 0}" />`;
    } else if (src.kind === "path") {
      inner = `<path id="el_${src.id}" d="${svgPaths[src.id]}" />`;
    }
    defsMarkup.push(`<clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><g id="node_${src.id}">${inner}</g></clipPath>`);
  }

  const childrenMap = new Map<string | undefined, SceneNodeIR[]>();
  for (const n of doc.nodes) {
    const arr = childrenMap.get(n.parentId) ?? [];
    arr.push(n);
    childrenMap.set(n.parentId, arr);
  }
  for (const arr of childrenMap.values()) {
    arr.sort((a, b) => a.layer - b.layer);
  }

  let ribbonCanvasHtml = "";
  const renderSvgSubtree = (parentId: string | undefined): string => {
    const kids = childrenMap.get(parentId) ?? [];
    const chunks: string[] = [];
    for (const n of kids) {
      if (n.role === "guide-path" || maskSourceIds.has(n.id)) continue;
      if (n.kind === "shape" && n.fill.kind === "shader") {
        ribbonCanvasHtml = `<canvas id="canvas_${n.id}" data-slot="${n.slot}" width="${n.base.width}" height="${n.base.height}" style="position:absolute;left:${n.base.x}px;top:${n.base.y}px;width:${n.base.width}px;height:${n.base.height}px;pointer-events:none;"></canvas>`;
        continue;
      }

      const clipAttr = maskTargetToClipId.has(n.id)
        ? ` clip-path="url(#${maskTargetToClipId.get(n.id)})"`
        : "";

      if (n.kind === "frame") {
        const inner = renderSvgSubtree(n.id);
        chunks.push(
          `<g id="wrap_${n.id}" data-slot="${n.slot}"${clipAttr}><g id="node_${n.id}">${inner}</g></g>`
        );
      } else if (n.kind === "text") {
        const escaped = n.text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        chunks.push(
          `<g id="wrap_${n.id}" data-slot="${n.slot}"${clipAttr}><text id="node_${n.id}" x="${n.base.width / 2}" y="${Math.round(n.fontSize * 0.92)}" text-anchor="middle" fill="${n.fill.color}" font-family="${n.fontFamily}, system-ui, sans-serif" font-size="${n.fontSize}" font-weight="${n.fontWeight}" style="letter-spacing:${n.letterSpacing}px">${escaped}</text></g>`
        );
      } else if (n.kind === "shape") {
        const fillStr = fillRefFor(n.id, n.fill);
        const shapeTag =
          n.shape === "ellipse"
            ? `<ellipse cx="${n.base.width / 2}" cy="${n.base.height / 2}" rx="${n.base.width / 2}" ry="${n.base.height / 2}" fill="${fillStr}" />`
            : `<rect x="0" y="0" width="${n.base.width}" height="${n.base.height}" rx="${n.borderRadius ?? 0}" fill="${fillStr}" />`;
        chunks.push(
          `<g id="wrap_${n.id}" data-slot="${n.slot}"${clipAttr}><g id="node_${n.id}">${shapeTag}</g></g>`
        );
      } else if (n.kind === "path") {
        const fillStr = fillRefFor(n.id, n.fill);
        chunks.push(
          `<g id="wrap_${n.id}" data-slot="${n.slot}"${clipAttr}><g id="node_${n.id}"><path d="${svgPaths[n.id]}" fill="${fillStr}" /></g></g>`
        );
      }
    }
    return chunks.join("\n");
  };

  const sceneSvgBody = renderSvgSubtree(undefined);
  const serializedDoc = JSON.stringify(doc);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${doc.name}</title>
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: ${doc.scene.backgroundColor}; }
    #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${doc.scene.backgroundColor}; }
    svg.stage-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: hidden; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
</head>
<body>
  <div
    id="root"
    data-composition-id="${compId}"
    data-width="${doc.format.width}"
    data-height="${doc.format.height}"
    data-fps="${doc.format.fps}"
    data-duration="${durSec}"
  >
    <div id="intro_backdrop_host" style="position:absolute;inset:0;pointer-events:none;">
      ${ribbonCanvasHtml}
    </div>
    <svg class="stage-svg" viewBox="0 0 ${doc.format.width} ${doc.format.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${defsMarkup.join("\n        ")}
      </defs>
      ${sceneSvgBody}
    </svg>
  </div>
  <script>
    (function () {
      const DOC = ${serializedDoc};
      const COMP_ID = ${JSON.stringify(compId)};

      function solveBezier(x1, y1, x2, y2, x) {
        if (x <= 0) return 0;
        if (x >= 1) return 1;
        const cx = (t) => ((1 - 3 * x2 + 3 * x1) * t * t * t) + ((3 * x2 - 6 * x1) * t * t) + (3 * x1 * t);
        const cy = (t) => ((1 - 3 * y2 + 3 * y1) * t * t * t) + ((3 * y2 - 6 * y1) * t * t) + (3 * y1 * t);
        let lo = 0, hi = 1, t = x;
        for (let i = 0; i < 16; i++) {
          const v = cx(t);
          if (Math.abs(v - x) < 1e-5) break;
          if (x > v) lo = t; else hi = t;
          t = 0.5 * (lo + hi);
        }
        return cy(t);
      }

      function easeValue(spec, rawT) {
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

      function sampleScalar(keys, localF, fallback) {
        if (!keys || !keys.length) return fallback;
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

      function sampleVec2(keys, localF, fallback) {
        if (!keys || !keys.length) return fallback;
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

      // Prebuild arc-length tables for guide paths once at setup
      const guideTables = new Map();
      for (const n of DOC.nodes) {
        if (n.kind === "path" && n.role === "guide-path") {
          const vMap = new Map(n.network.vertices.map((v) => [v.id, v]));
          const pts = [];
          let total = 0;
          n.network.segments.forEach((seg, sIdx) => {
            const p0 = vMap.get(seg.startVertexId);
            const p3 = vMap.get(seg.endVertexId);
            const ts = seg.tangentStart || { x: 0, y: 0 };
            const te = seg.tangentEnd || { x: 0, y: 0 };
            const p1 = { x: p0.x + ts.x, y: p0.y + ts.y };
            const p2 = { x: p3.x + te.x, y: p3.y + te.y };
            for (let k = sIdx === 0 ? 0 : 1; k <= 24; k++) {
              const t = k / 24, mt = 1 - t;
              const x = mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x;
              const y = mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y;
              if (pts.length) total += Math.hypot(x - (pts[pts.length - 1].x - n.base.x), y - (pts[pts.length - 1].y - n.base.y));
              pts.push({ x: n.base.x + x, y: n.base.y + y, len: total });
            }
          });
          guideTables.set(n.id, { pts, total });
        }
      }

      function sampleGuide(guideId, u) {
        const g = guideTables.get(guideId);
        if (!g || !g.pts.length) return { x: 0, y: 0 };
        const target = Math.max(0, Math.min(1, u)) * g.total;
        for (let i = 0; i < g.pts.length - 1; i++) {
          if (target >= g.pts[i].len && target <= g.pts[i + 1].len) {
            const f = (target - g.pts[i].len) / Math.max(1e-6, g.pts[i + 1].len - g.pts[i].len);
            return { x: g.pts[i].x + (g.pts[i + 1].x - g.pts[i].x) * f, y: g.pts[i].y + (g.pts[i + 1].y - g.pts[i].y) * f };
          }
        }
        return g.pts[g.pts.length - 1];
      }

      function drawChevronRibbon(canvas, params) {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        const S = params.pillarSize;
        const theta = params.spinAngle * 0.0174532925;
        const R = S * 0.70710678;
        const angles = [0.78539816, 2.35619449, 3.92699082, 5.49778714].map((a) => theta + a);
        const verts = angles.map((a) => ({ x: R * Math.sin(a), y: R * Math.cos(a) }));
        const xMin = Math.min(...verts.map((v) => v.x));
        const xMax = Math.max(...verts.map((v) => v.x));
        const hex = String(params.limeColor || "#DCFC5E").replace("#", "");
        const cr = parseInt(hex.slice(0, 2), 16), cg = parseInt(hex.slice(2, 4), 16), cb = parseInt(hex.slice(4, 6), 16);
        const cx = W / 2, cy = H / 2;

        for (let px = Math.max(0, Math.floor(cx + xMin)); px <= Math.min(W - 1, Math.ceil(cx + xMax)); px++) {
          const x = px - cx;
          let zMax = -1e6;
          for (let e = 0; e < 4; e++) {
            const v0 = verts[e], v1 = verts[(e + 1) % 4];
            const lo = Math.min(v0.x, v1.x), hi = Math.max(v0.x, v1.x);
            if (hi - lo > 0.001 && x >= lo - 0.5 && x <= hi + 0.5) {
              const t = Math.max(0, Math.min(1, (x - v0.x) / (v1.x - v0.x)));
              zMax = Math.max(zMax, v0.y + (v1.y - v0.y) * t);
            }
          }
          const innerHalf = Math.max(3, params.baseHalfGap - params.chevronSlope * zMax);
          const fadeH = Math.max(1, params.fadeHeight);
          const gTop = ctx.createLinearGradient(0, cy - innerHalf, 0, Math.max(0, cy - innerHalf - fadeH));
          gTop.addColorStop(0, "rgba(" + cr + "," + cg + "," + cb + ",1)");
          gTop.addColorStop(1, "rgba(" + cr + "," + cg + "," + cb + ",0)");
          ctx.fillStyle = gTop;
          ctx.fillRect(px, Math.max(0, cy - innerHalf - fadeH), 1, fadeH);

          const gBot = ctx.createLinearGradient(0, cy + innerHalf, 0, Math.min(H, cy + innerHalf + fadeH));
          gBot.addColorStop(0, "rgba(" + cr + "," + cg + "," + cb + ",1)");
          gBot.addColorStop(1, "rgba(" + cr + "," + cg + "," + cb + ",0)");
          ctx.fillStyle = gBot;
          ctx.fillRect(px, cy + innerHalf, 1, fadeH);
        }
      }

      function renderAtFrame(frame) {
        for (const node of DOC.nodes) {
          if (node.role === "guide-path") continue;
          const el = document.getElementById("node_" + node.id);
          const wrap = document.getElementById("wrap_" + node.id);
          const inRange = !node.range || (frame >= node.range.startFrame && frame < node.range.startFrame + node.range.durationFrames);

          if (node.kind === "shape" && node.fill.kind === "shader") {
            const cvs = document.getElementById("canvas_" + node.id);
            if (cvs) {
              const p = Object.assign({}, node.fill.params);
              for (const m of DOC.motions) {
                if (m.kind === "shaderParams" && m.targetId === node.id && frame >= m.startFrame) {
                  const lf = Math.min(frame - m.startFrame, m.durationFrames - 1);
                  for (const k of Object.keys(m.tracks)) p[k] = sampleScalar(m.tracks[k], lf, p[k]);
                }
              }
              drawChevronRibbon(cvs, p);
            }
            continue;
          }

          if (!el) continue;
          if (!inRange) {
            (wrap || el).setAttribute("visibility", "hidden");
            continue;
          }
          (wrap || el).setAttribute("visibility", "visible");

          let x = node.base.x, y = node.base.y;
          let rot = node.base.rotation || 0;
          let op = node.base.opacity !== undefined ? node.base.opacity : 1;
          let blur = node.base.blur || 0;
          let sx = 1, sy = 1;
          let trackVal = node.kind === "text" ? node.letterSpacing : 0;
          let followed = null;

          for (const m of DOC.motions) {
            if (m.targetId !== node.id || frame < m.startFrame) continue;
            const lf = Math.min(frame - m.startFrame, Math.max(0, m.durationFrames - 1));
            if (m.kind === "scalar") {
              const v = sampleScalar(m.keys, lf, m.baseValue || 0);
              if (m.property === "opacity") op = m.mode === "set" ? v : op + v;
              else if (m.property === "layerBlur") blur = m.mode === "set" ? v : blur + v;
              else if (m.property === "rotation") rot = m.mode === "set" ? v : rot + v;
              else if (m.property === "letterSpacing") trackVal = v;
            } else if (m.kind === "vec2") {
              const v = sampleVec2(m.keys, lf, m.mode === "multiply" ? { x: 1, y: 1 } : { x: 0, y: 0 });
              if (m.property === "move") { x += v.x; y += v.y; }
              else if (m.property === "scale") { sx *= v.x; sy *= v.y; }
            } else if (m.kind === "followPath") {
              const u = easeValue(m.progressEasing, m.durationFrames <= 1 ? 1 : lf / (m.durationFrames - 1));
              followed = sampleGuide(m.guidePathId, u);
            }
          }

          const ox = node.base.width * (node.base.originX !== undefined ? node.base.originX : 0.5);
          const oy = node.base.height * (node.base.originY !== undefined ? node.base.originY : 0.5);
          const tx = followed ? followed.x - ox : x;
          const ty = followed ? followed.y - oy : y;
          const xf = "translate(" + tx.toFixed(2) + "," + ty.toFixed(2) + ") translate(" + ox.toFixed(2) + "," + oy.toFixed(2) + ") rotate(" + rot.toFixed(2) + ") scale(" + sx.toFixed(4) + "," + sy.toFixed(4) + ") translate(" + (-ox).toFixed(2) + "," + (-oy).toFixed(2) + ")";
          el.setAttribute("transform", xf);
          el.style.opacity = String(Math.max(0, Math.min(1, op)));
          el.style.filter = blur > 0.2 ? "blur(" + blur.toFixed(1) + "px)" : "none";
          if (node.kind === "text") el.style.letterSpacing = trackVal.toFixed(2) + "px";

          if (node.id === "intro_world") {
            const host = document.getElementById("intro_backdrop_host");
            if (host) {
              host.style.opacity = String(Math.max(0, Math.min(1, op)));
              host.style.filter = blur > 0.2 ? "blur(" + blur.toFixed(1) + "px)" : "none";
            }
          }
        }
      }

      window.__seekToFrame = renderAtFrame;
      renderAtFrame(0);

      if (window.gsap) {
        const proxy = { frame: 0 };
        const tl = window.gsap.timeline({ paused: true });
        tl.to(proxy, {
          frame: DOC.format.durationFrames - 1,
          duration: ${durSec},
          ease: "none",
          onUpdate: function () { renderAtFrame(proxy.frame); }
        }, 0);
        window.__timelines = window.__timelines || {};
        window.__timelines[COMP_ID] = tl;
      }
    })();
  </script>
</body>
</html>
`;
}
