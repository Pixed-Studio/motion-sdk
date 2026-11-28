import { lifetime, vectorNetworkToSvgPath, type FillSpec, type MotionDocument, type SceneNodeIR } from "@motion-sdk/core";

export interface HyperframesOptions {
  /**
   * Stylesheet that provides the document's typefaces. Defaults to Google Fonts for the families
   * the text uses; pass `false` when the page that hosts the composition already loads them.
   */
  fonts?: string | false;
  /** Where the page loads GSAP from. Defaults to a public CDN; give your own copy to host it yourself. */
  gsap?: string;
}

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Compiles a motion document into one self-contained HyperFrames composition: an SVG scene, a
 * paused GSAP timeline registered in `window.__timelines`, and a pure function of the frame that
 * poses every object. It reads only the document. Nothing here knows a particular shot.
 */
export function compileToHyperframes(doc: MotionDocument, options: HyperframesOptions = {}): string {
  const compId = doc.id.replace(/[^a-zA-Z0-9_-]/g, "-");
  // Ids carry the composition id, so several compositions can share one page. Only references
  // (gradients, clip paths) use ids: HyperFrames rewrites the ids of SVG elements when it compiles
  // a page, so the runtime finds its elements by attribute instead.
  const p = `${compId}__`;
  const { width, height, fps, durationFrames } = doc.format;
  const durSec = Math.round((durationFrames / fps) * 1000) / 1000;
  const byId = new Map<string, SceneNodeIR>(doc.nodes.map((n) => [n.id, n]));

  const defs: string[] = [];
  const fillRef = (nodeId: string, fill: FillSpec): string => {
    if (fill.kind === "none" || fill.kind === "shader") return "none";
    if (fill.kind === "solid") return fill.color;
    const stops = fill.stops.map((s) => `<stop offset="${s.offset * 100}%" stop-color="${s.color}"></stop>`).join("");
    const id = `${p}grad_${nodeId}`;
    if (fill.kind === "linear") {
      const rad = ((fill.angleDeg - 90) * Math.PI) / 180;
      const at = (sign: number, f: (n: number) => number) => (50 + sign * f(rad) * 50).toFixed(1);
      defs.push(
        `<linearGradient id="${id}" x1="${at(-1, Math.cos)}%" y1="${at(-1, Math.sin)}%" x2="${at(1, Math.cos)}%" y2="${at(1, Math.sin)}%">${stops}</linearGradient>`
      );
    } else {
      const cx = ((fill.domain.x + fill.domain.width / 2) * 100).toFixed(1);
      const cy = ((fill.domain.y + fill.domain.height / 2) * 100).toFixed(1);
      defs.push(`<radialGradient id="${id}" cx="${cx}%" cy="${cy}%" r="${((fill.domain.width / 2) * 125).toFixed(1)}%">${stops}</radialGradient>`);
    }
    return `url(#${id})`;
  };

  const outline = (n: SceneNodeIR, attrs: string): string => {
    if (n.kind === "shape" && n.shape === "ellipse") {
      return `<ellipse cx="${n.base.width / 2}" cy="${n.base.height / 2}" rx="${n.base.width / 2}" ry="${n.base.height / 2}" ${attrs}></ellipse>`;
    }
    if (n.kind === "shape") {
      return `<rect x="0" y="0" width="${n.base.width}" height="${n.base.height}" rx="${n.borderRadius ?? 0}" ${attrs}></rect>`;
    }
    if (n.kind === "path") return `<path d="${vectorNetworkToSvgPath(n.network)}" ${attrs}></path>`;
    return "";
  };

  // A clip path may hold only shapes, so each mask source is one shape that is posed directly.
  const clipOf = new Map<string, string>();
  const maskSources = new Set<string>();
  for (const mask of doc.masks) {
    const source = byId.get(mask.sourceObjectId);
    if (!source) continue;
    maskSources.add(source.id);
    clipOf.set(mask.targetObjectId, `${p}clip_${mask.id}`);
    defs.push(`<clipPath id="${p}clip_${mask.id}" clipPathUnits="userSpaceOnUse">${outline(source, `data-ms-node="${source.id}"`)}</clipPath>`);
  }

  const children = new Map<string | undefined, SceneNodeIR[]>();
  for (const n of doc.nodes) {
    const list = children.get(n.parentId) ?? [];
    list.push(n);
    children.set(n.parentId, list);
  }
  for (const list of children.values()) list.sort((a, b) => a.layer - b.layer);

  const subtree = (parentId: string | undefined): string => {
    const out: string[] = [];
    for (const n of children.get(parentId) ?? []) {
      if (n.role === "guide" || maskSources.has(n.id)) continue;
      const clip = clipOf.has(n.id) ? ` clip-path="url(#${clipOf.get(n.id)})"` : "";
      const open = `<g data-ms-wrap="${n.id}" data-slot="${n.slot}" data-role="${n.role}"${clip}>`;
      if (n.kind === "frame") {
        out.push(`${open}<g data-ms-node="${n.id}">${subtree(n.id)}</g></g>`);
      } else if (n.kind === "text") {
        out.push(
          `${open}<text data-ms-node="${n.id}" x="${n.base.width / 2}" y="${n.base.height / 2}" text-anchor="middle" dominant-baseline="central" fill="${n.fill.color}" font-family="'${n.fontFamily}', system-ui, sans-serif" font-size="${n.fontSize}" font-weight="${n.fontWeight}" style="letter-spacing:${n.letterSpacing}px">${escapeHtml(n.text)}</text></g>`
        );
      } else if (n.fill.kind === "shader") {
        // The canvas carries fallback text on purpose. HyperFrames rewrites an empty canvas here as
        // <canvas />, which HTML does not close, and everything after it is swallowed as fallback.
        out.push(
          `${open}<foreignObject data-ms-node="${n.id}" x="0" y="0" width="${n.base.width}" height="${n.base.height}"><canvas xmlns="http://www.w3.org/1999/xhtml" data-ms-canvas="${n.id}" width="${n.base.width}" height="${n.base.height}" style="display:block;width:${n.base.width}px;height:${n.base.height}px">${escapeHtml(n.name)}</canvas></foreignObject></g>`
        );
      } else {
        out.push(`${open}<g data-ms-node="${n.id}">${outline(n, `fill="${fillRef(n.id, n.fill)}"`)}</g></g>`);
      }
    }
    return out.join("\n");
  };
  const scene = subtree(undefined);

  const families = [...new Set(doc.nodes.flatMap((n) => (n.kind === "text" ? [n.fontFamily] : [])))];
  const fontHref =
    options.fonts === false
      ? null
      : (options.fonts ??
        (families.length
          ? `https://fonts.googleapis.com/css2?${families.map((f) => `family=${encodeURIComponent(f)}:wght@100..900`).join("&")}&display=block`
          : null));

  // The page carries only what posing needs: outlines are already in the markup, and names,
  // reasons and key ids stay in the document.
  const lives = Object.fromEntries(doc.nodes.map((n) => [n.id, lifetime(doc, n)]));
  const bare = <K extends { frame: number; easing?: unknown }>(keys: (K & { id?: string })[]) => keys.map(({ id: _id, ...key }) => key);
  const payload = JSON.stringify({
    format: doc.format,
    lives,
    shaders: doc.shaders.map((s) => ({ id: s.id, canvas2d: s.canvas2d })),
    nodes: doc.nodes.map((n) => ({
      id: n.id,
      kind: n.kind,
      role: n.role,
      base: n.base,
      letterSpacing: n.kind === "text" ? n.letterSpacing : undefined,
      // An object whose fill a colour movement writes keeps its own fill to go back to.
      ownFill: doc.motions.some((m) => m.kind === "color" && m.targetId === n.id) && n.kind !== "frame" ? (n.kind === "text" ? n.fill.color : fillRef(n.id, n.fill)) : undefined,
      network: n.kind === "path" && n.role === "guide" ? n.network : undefined,
      fill: n.kind !== "frame" && n.kind !== "text" && n.fill.kind === "shader" ? n.fill : undefined,
    })),
    motions: doc.motions.map((m) => {
      const base = { kind: m.kind, targetId: m.targetId, startFrame: m.startFrame, durationFrames: m.durationFrames };
      if (m.kind === "scalar") return { ...base, property: m.property, mode: m.mode, post: m.post, baseValue: m.baseValue, keys: bare(m.keys) };
      if (m.kind === "vec2") return { ...base, property: m.property, mode: m.mode, keys: bare(m.keys) };
      if (m.kind === "followPath") return { ...base, guidePathId: m.guidePathId, progressEasing: m.progressEasing };
      if (m.kind === "color") return { ...base, keys: bare(m.keys) };
      return { ...base, tracks: Object.fromEntries(Object.entries(m.tracks).map(([k, keys]) => [k, bare(keys)])) };
    }),
  });

  // The soundtrack is a timed clip beside the picture, as a drop in the editor would write it.
  const audio = doc.audio
    ? `\n    <audio id="${p}audio" class="clip" data-start="${Math.round((doc.audio.startFrame / fps) * 1000) / 1000}" data-duration="${Math.round((doc.audio.durationFrames / fps) * 1000) / 1000}" data-track-index="1" data-volume="${doc.audio.gain}" src="${doc.audio.src.replace(/"/g, "&quot;")}"></audio>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(doc.name)}</title>
  ${fontHref ? `<link rel="stylesheet" href="${fontHref}" />` : ""}
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: ${doc.scene.backgroundColor}; }
  </style>
  <script src="${options.gsap ?? "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"}"></script>
</head>
<body>
  <div id="${p}root" data-composition-id="${compId}" data-start="0" data-width="${width}" data-height="${height}" data-fps="${fps}" data-duration="${durSec}" style="position:relative;width:${width}px;height:${height}px;overflow:hidden;background:${doc.scene.backgroundColor}">
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;display:block;overflow:hidden">
      <defs>
        ${defs.join("\n        ")}
      </defs>
      ${scene}
    </svg>${audio}
  </div>
  <script>
    (function () {
      var DOC = ${payload};
      var COMP_ID = ${JSON.stringify(compId)};
      var ROOT = document.querySelector('[data-composition-id="' + COMP_ID + '"]');
      var found = {};
      var el$ = function (kind, id) {
        var key = kind + ":" + id;
        if (!(key in found)) found[key] = ROOT.querySelector("[data-ms-" + kind + '="' + id + '"]');
        return found[key];
      };

      function bezier(x1, y1, x2, y2, x) {
        if (x <= 0) return 0;
        if (x >= 1) return 1;
        var cx = function (t) { return (1 - 3 * x2 + 3 * x1) * t * t * t + (3 * x2 - 6 * x1) * t * t + 3 * x1 * t; };
        var cy = function (t) { return (1 - 3 * y2 + 3 * y1) * t * t * t + (3 * y2 - 6 * y1) * t * t + 3 * y1 * t; };
        var lo = 0, hi = 1, t = x;
        for (var i = 0; i < 24; i++) {
          var v = cx(t);
          if (Math.abs(v - x) < 1e-6) break;
          if (x > v) lo = t; else hi = t;
          t = 0.5 * (lo + hi);
        }
        return cy(t);
      }

      function eased(spec, raw) {
        var t = Math.max(0, Math.min(1, raw));
        if (!spec || spec.kind === "linear") return t;
        if (spec.kind === "hold") return t >= 1 ? 1 : 0;
        if (spec.kind === "cubicBezier") return bezier(spec.x1, spec.y1, spec.x2, spec.y2, t);
        switch (spec.preset) {
          case "easeInQuad": return t * t;
          case "easeOutQuad": return 1 - (1 - t) * (1 - t);
          case "easeInOutQuad": return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          case "easeInCubic": return t * t * t;
          case "easeOutCubic": return 1 - Math.pow(1 - t, 3);
          case "easeInOutCubic": return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          case "easeOutQuart": return 1 - Math.pow(1 - t, 4);
          case "easeOutExpo": return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
          case "easeInSine": return 1 - Math.cos((t * Math.PI) / 2);
          case "easeOutSine": return Math.sin((t * Math.PI) / 2);
          case "easeInOutSine": return -(Math.cos(Math.PI * t) - 1) / 2;
          default: return t;
        }
      }

      function between(keys, f, read) {
        if (f <= keys[0].frame) return read(keys[0], keys[0], 0);
        var last = keys[keys.length - 1];
        if (f >= last.frame) return read(last, last, 0);
        for (var i = 0; i < keys.length - 1; i++) {
          var a = keys[i], b = keys[i + 1];
          if (f >= a.frame && f <= b.frame) return read(a, b, eased(a.easing, (f - a.frame) / Math.max(1e-6, b.frame - a.frame)));
        }
        return read(last, last, 0);
      }
      function scalarAt(keys, f, fallback) {
        return keys && keys.length ? between(keys, f, function (a, b, u) { return a.value + (b.value - a.value) * u; }) : fallback;
      }
      function channels(hex) {
        var c = hex.replace("#", "");
        return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
      }
      function colorAt(keys, f) {
        return between(keys, f, function (a, b, u) {
          var ca = channels(a.color), cb = channels(b.color);
          return "rgb(" + ca.map(function (v, i) { return Math.round(v + (cb[i] - v) * u); }).join(",") + ")";
        });
      }
      function pointAt(keys, f, fallback) {
        return keys && keys.length ? between(keys, f, function (a, b, u) { return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }; }) : fallback;
      }

      var guides = {};
      DOC.nodes.forEach(function (n) {
        if (n.kind !== "path" || n.role !== "guide") return;
        var at = {}, pts = [], total = 0;
        n.network.vertices.forEach(function (v) { at[v.id] = v; });
        n.network.segments.forEach(function (seg, s) {
          var p0 = at[seg.startVertexId], p3 = at[seg.endVertexId];
          var ts = seg.tangentStart || { x: 0, y: 0 }, te = seg.tangentEnd || { x: 0, y: 0 };
          var p1 = { x: p0.x + ts.x, y: p0.y + ts.y }, p2 = { x: p3.x + te.x, y: p3.y + te.y };
          for (var k = s === 0 ? 0 : 1; k <= 24; k++) {
            var t = k / 24, m = 1 - t;
            var x = n.base.x + m * m * m * p0.x + 3 * m * m * t * p1.x + 3 * m * t * t * p2.x + t * t * t * p3.x;
            var y = n.base.y + m * m * m * p0.y + 3 * m * m * t * p1.y + 3 * m * t * t * p2.y + t * t * t * p3.y;
            if (pts.length) total += Math.hypot(x - pts[pts.length - 1].x, y - pts[pts.length - 1].y);
            pts.push({ x: x, y: y, len: total });
          }
        });
        guides[n.id] = { pts: pts, total: total };
      });
      function along(guideId, u) {
        var g = guides[guideId];
        if (!g || !g.pts.length) return { x: 0, y: 0 };
        var target = Math.max(0, Math.min(1, u)) * g.total;
        for (var i = 0; i < g.pts.length - 1; i++) {
          var a = g.pts[i], b = g.pts[i + 1];
          if (target >= a.len && target <= b.len) {
            var f = (target - a.len) / Math.max(1e-6, b.len - a.len);
            return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
          }
        }
        return g.pts[g.pts.length - 1];
      }

      var painters = {};
      DOC.shaders.forEach(function (s) {
        if (s.canvas2d) painters[s.id] = new Function("ctx", "width", "height", "params", s.canvas2d);
      });
      var motionsOf = {};
      DOC.motions.forEach(function (m) { (motionsOf[m.targetId] = motionsOf[m.targetId] || []).push(m); });

      function pose(frame) {
        DOC.nodes.forEach(function (node) {
          if (node.role === "guide") return;
          var el = el$("node", node.id);
          if (!el) return;
          var shown = el$("wrap", node.id) || el;
          var life = DOC.lives[node.id];
          // display, not visibility: a hidden group must hide what it carries.
          if (frame < life.start || frame >= life.end) { shown.style.display = "none"; return; }
          shown.style.display = "";

          var x = node.base.x, y = node.base.y, rot = node.base.rotation || 0;
          var op = node.base.opacity === undefined ? 1 : node.base.opacity, blur = node.base.blur || 0;
          var sx = 1, sy = 1, tracking = node.kind === "text" ? node.letterSpacing : 0, followed = null, params = null, color = null;
          (motionsOf[node.id] || []).forEach(function (m) {
            if (frame < m.startFrame) return;
            var ended = frame > m.startFrame + m.durationFrames - 1;
            var f = Math.min(frame - m.startFrame, Math.max(0, m.durationFrames - 1));
            if (m.kind === "scalar") {
              if (ended && m.post === "none") return;
              var v = scalarAt(m.keys, f, m.baseValue || 0);
              if (m.property === "opacity") op = m.mode === "set" ? v : op + v;
              else if (m.property === "layerBlur") blur = m.mode === "set" ? v : blur + v;
              else if (m.property === "rotation") rot = m.mode === "set" ? v : rot + v;
              else if (m.property === "letterSpacing") tracking = v;
            } else if (m.kind === "vec2") {
              var p = pointAt(m.keys, f, m.mode === "multiply" ? { x: 1, y: 1 } : { x: 0, y: 0 });
              if (m.property === "move") { x += p.x; y += p.y; } else { sx *= p.x; sy *= p.y; }
            } else if (m.kind === "followPath") {
              followed = along(m.guidePathId, eased(m.progressEasing, m.durationFrames <= 1 ? 1 : f / (m.durationFrames - 1)));
            } else if (m.kind === "color") {
              color = colorAt(m.keys, f);
            } else if (m.kind === "shaderParams") {
              params = params || Object.assign({}, node.fill.params);
              Object.keys(m.tracks).forEach(function (k) { params[k] = scalarAt(m.tracks[k], f, params[k]); });
            }
          });

          var ox = node.base.width * (node.base.originX === undefined ? 0.5 : node.base.originX);
          var oy = node.base.height * (node.base.originY === undefined ? 0.5 : node.base.originY);
          var tx = followed ? followed.x - ox : x, ty = followed ? followed.y - oy : y;
          el.setAttribute("transform", "translate(" + (tx + ox).toFixed(2) + "," + (ty + oy).toFixed(2) + ") rotate(" + rot.toFixed(2) + ") scale(" + sx.toFixed(4) + "," + sy.toFixed(4) + ") translate(" + (-ox).toFixed(2) + "," + (-oy).toFixed(2) + ")");
          if (el.parentNode && el.parentNode.nodeName.toLowerCase() === "clippath") return;
          el.style.opacity = String(Math.max(0, Math.min(1, op)));
          el.style.filter = blur > 0.2 ? "blur(" + blur.toFixed(1) + "px)" : "none";
          if (node.kind === "text") el.style.letterSpacing = tracking.toFixed(2) + "px";
          if (node.ownFill) (node.kind === "text" ? el : el.firstElementChild).setAttribute("fill", color || node.ownFill);
          if (node.fill && node.fill.kind === "shader" && painters[node.fill.shaderId]) {
            var canvas = el$("canvas", node.id);
            painters[node.fill.shaderId](canvas.getContext("2d"), canvas.width, canvas.height, params || node.fill.params);
          }
        });
      }

      window.__seekToFrame = pose;
      window.__motionSdk = window.__motionSdk || {};
      window.__motionSdk[COMP_ID] = { pose: pose, format: DOC.format };
      pose(0);
      if (window.gsap) {
        var clock = { frame: 0 };
        var tl = window.gsap.timeline({ paused: true });
        tl.to(clock, {
          frame: DOC.format.durationFrames,
          duration: ${durSec},
          ease: "none",
          onUpdate: function () { pose(Math.min(clock.frame, DOC.format.durationFrames - 1)); }
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
