import {
  sampleColorKeys,
  evaluateEasing,
  lifetime,
  sampleGuideNetworkAtProgress,
  vectorNetworkToSvgPath,
  type Shot,
  type MotionDocument,
  type PathNodeIR,
  type ScalarKey,
  type SceneNodeIR,
  type Vec2Key,
} from "@motion-sdk/core";

export interface RemotionCompositionConfig {
  id: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export type CreateElementFn<TEl = any> = (
  type: any,
  props?: Record<string, unknown> | null,
  ...children: any[]
) => TEl;

export function getRemotionCompositionConfig(
  input: Shot | MotionDocument
): RemotionCompositionConfig {
  const doc = "ir" in input ? input.ir : input;
  return {
    id: doc.id.replace(/[^a-zA-Z0-9_-]/g, "-"),
    width: doc.format.width,
    height: doc.format.height,
    fps: doc.format.fps,
    durationInFrames: doc.format.durationFrames,
  };
}

function sampleScalar(keys: ScalarKey[], localF: number, fallback: number): number {
  if (keys.length === 0) return fallback;
  if (localF <= keys[0]!.frame) return keys[0]!.value;
  const last = keys[keys.length - 1]!;
  if (localF >= last.frame) return last.value;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (localF >= a.frame && localF <= b.frame) {
      const u = evaluateEasing(a.easing, (localF - a.frame) / Math.max(1e-6, b.frame - a.frame));
      return a.value + (b.value - a.value) * u;
    }
  }
  return last.value;
}

function sampleVec2(
  keys: Vec2Key[],
  localF: number,
  fallback: { x: number; y: number }
): { x: number; y: number } {
  if (keys.length === 0) return fallback;
  if (localF <= keys[0]!.frame) return { x: keys[0]!.x, y: keys[0]!.y };
  const last = keys[keys.length - 1]!;
  if (localF >= last.frame) return { x: last.x, y: last.y };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (localF >= a.frame && localF <= b.frame) {
      const u = evaluateEasing(a.easing, (localF - a.frame) / Math.max(1e-6, b.frame - a.frame));
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
    }
  }
  return { x: last.x, y: last.y };
}

/**
 * Pure virtual-tree builder shared by `<MotionShot />` and headless unit tests.
 */
export function buildRemotionFrameElement<TEl = any>(
  doc: MotionDocument,
  frame: number,
  h: CreateElementFn<TEl>,
  Wrapper: unknown = "div"
): TEl {
  const svgPaths: Record<string, string> = {};
  const nodeMap = new Map<string, SceneNodeIR>();
  for (const n of doc.nodes) {
    nodeMap.set(n.id, n);
    if (n.kind === "path") {
      svgPaths[n.id] = vectorNetworkToSvgPath(n.network);
    }
  }

  const evalTransform = (node: SceneNodeIR) => {
    const life = lifetime(doc, node);
    const inRange = frame >= life.start && frame < life.end;
    let x = node.base.x;
    let y = node.base.y;
    let rot = node.base.rotation ?? 0;
    let op = node.base.opacity ?? 1;
    let blur = node.base.blur ?? 0;
    let sx = 1;
    let sy = 1;
    let letterSpacing = node.kind === "text" ? node.letterSpacing : 0;
    let followed: { x: number; y: number } | null = null;
    let color: string | undefined;

    for (const m of doc.motions) {
      if (m.targetId !== node.id || frame < m.startFrame) continue;
      const lf = Math.min(frame - m.startFrame, Math.max(0, m.durationFrames - 1));
      if (m.kind === "scalar") {
        const v = sampleScalar(m.keys, lf, m.baseValue ?? 0);
        if (m.property === "opacity") op = m.mode === "set" ? v : op + v;
        else if (m.property === "layerBlur") blur = m.mode === "set" ? v : blur + v;
        else if (m.property === "rotation") rot = m.mode === "set" ? v : rot + v;
        else if (m.property === "letterSpacing") letterSpacing = v;
      } else if (m.kind === "vec2") {
        const v = sampleVec2(
          m.keys,
          lf,
          m.mode === "multiply" ? { x: 1, y: 1 } : { x: 0, y: 0 }
        );
        if (m.property === "move") {
          x += v.x;
          y += v.y;
        } else if (m.property === "scale") {
          sx *= v.x;
          sy *= v.y;
        }
      } else if (m.kind === "color") {
        color = sampleColorKeys(m.keys, lf, color ?? "#000000");
      } else if (m.kind === "followPath") {
        const guide = nodeMap.get(m.guidePathId) as PathNodeIR | undefined;
        if (guide && guide.kind === "path") {
          const u = evaluateEasing(
            m.progressEasing,
            m.durationFrames <= 1 ? 1 : lf / (m.durationFrames - 1)
          );
          followed = sampleGuideNetworkAtProgress(
            guide.network,
            guide.base.x,
            guide.base.y,
            u
          );
        }
      }
    }

    const ox = node.base.width * (node.base.originX ?? 0.5);
    const oy = node.base.height * (node.base.originY ?? 0.5);
    const tx = followed ? followed.x - ox : x;
    const ty = followed ? followed.y - oy : y;
    const transform = `translate(${tx.toFixed(2)},${ty.toFixed(2)}) translate(${ox.toFixed(2)},${oy.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${sx.toFixed(4)},${sy.toFixed(4)}) translate(${(-ox).toFixed(2)},${(-oy).toFixed(2)})`;
    return {
      inRange,
      transform,
      opacity: Math.max(0, Math.min(1, op)),
      blur,
      letterSpacing,
      color,
    };
  };

  const maskSourceIds = new Set(doc.masks.map((m) => m.sourceObjectId));
  const clipByTarget = new Map(doc.masks.map((m) => [m.targetObjectId, `clip_${m.id}`]));

  const defsChildren: TEl[] = [];
  for (const n of doc.nodes) {
    if ("fill" in n && n.fill.kind === "linear") {
      const rad = ((n.fill.angleDeg - 90) * Math.PI) / 180;
      defsChildren.push(
        h(
          "linearGradient",
          {
            key: `grad_${n.id}`,
            id: `grad_${n.id}`,
            x1: `${(50 - Math.cos(rad) * 50).toFixed(1)}%`,
            y1: `${(50 - Math.sin(rad) * 50).toFixed(1)}%`,
            x2: `${(50 + Math.cos(rad) * 50).toFixed(1)}%`,
            y2: `${(50 + Math.sin(rad) * 50).toFixed(1)}%`,
          },
          ...n.fill.stops.map((s, idx) =>
            h("stop", { key: String(idx), offset: `${s.offset * 100}%`, stopColor: s.color })
          )
        )
      );
    } else if ("fill" in n && n.fill.kind === "radial") {
      const d = n.fill.domain;
      defsChildren.push(
        h(
          "radialGradient",
          {
            key: `grad_${n.id}`,
            id: `grad_${n.id}`,
            cx: `${((d.x + d.width / 2) * 100).toFixed(1)}%`,
            cy: `${((d.y + d.height / 2) * 100).toFixed(1)}%`,
            r: `${((d.width / 2) * 125).toFixed(1)}%`,
          },
          ...n.fill.stops.map((s, idx) =>
            h("stop", { key: String(idx), offset: `${s.offset * 100}%`, stopColor: s.color })
          )
        )
      );
    }
  }

  for (const m of doc.masks) {
    const src = nodeMap.get(m.sourceObjectId);
    if (!src) continue;
    const st = evalTransform(src);
    const geom =
      src.kind === "shape" && src.shape === "ellipse"
        ? h("ellipse", {
            transform: st.transform,
            cx: src.base.width / 2,
            cy: src.base.height / 2,
            rx: src.base.width / 2,
            ry: src.base.height / 2,
          })
        : src.kind === "shape"
          ? h("rect", {
              transform: st.transform,
              x: 0,
              y: 0,
              width: src.base.width,
              height: src.base.height,
              rx: src.borderRadius ?? 0,
            })
          : h("path", { transform: st.transform, d: svgPaths[src.id] });
    defsChildren.push(
      h(
        "clipPath",
        { key: m.id, id: `clip_${m.id}`, clipPathUnits: "userSpaceOnUse" },
        geom
      )
    );
  }

  const renderSubtree = (parentId?: string): TEl[] => {
    return doc.nodes
      .filter(
        (n) =>
          n.parentId === parentId &&
          n.role !== "guide" &&
          !maskSourceIds.has(n.id)
      )
      .sort((a, b) => a.layer - b.layer)
      .flatMap((n) => {
        const st = evalTransform(n);
        if (!st.inRange) return [];
        const clipPath = clipByTarget.has(n.id)
          ? `url(#${clipByTarget.get(n.id)})`
          : undefined;
        const style: Record<string, string | number | undefined> = {
          opacity: st.opacity,
          ...(st.blur > 0.2 ? { filter: `blur(${st.blur.toFixed(1)}px)` } : {}),
        };

        if (n.kind === "frame") {
          return [
            h(
              "g",
              { key: n.id, "data-slot": n.slot, clipPath },
              h("g", { transform: st.transform, style }, ...renderSubtree(n.id))
            ),
          ];
        }
        if (n.kind === "text") {
          return [
            h(
              "g",
              { key: n.id, "data-slot": n.slot, clipPath },
              h(
                "text",
                {
                  transform: st.transform,
                  x: n.base.width / 2,
                  y: Math.round(n.fontSize * 0.92),
                  textAnchor: "middle",
                  fill: st.color ?? n.fill.color,
                  fontFamily: `${n.fontFamily}, system-ui, sans-serif`,
                  fontSize: n.fontSize,
                  fontWeight: n.fontWeight,
                  style: {
                    ...style,
                    letterSpacing: `${st.letterSpacing.toFixed(2)}px`,
                  },
                },
                n.text
              )
            ),
          ];
        }
        const fillRef =
          st.color ??
          (n.fill.kind === "solid"
            ? n.fill.color
            : n.fill.kind === "linear" || n.fill.kind === "radial"
              ? `url(#grad_${n.id})`
              : "transparent");
        if (n.kind === "shape") {
          const inner =
            n.shape === "ellipse"
              ? h("ellipse", {
                  cx: n.base.width / 2,
                  cy: n.base.height / 2,
                  rx: n.base.width / 2,
                  ry: n.base.height / 2,
                  fill: fillRef,
                })
              : h("rect", {
                  x: 0,
                  y: 0,
                  width: n.base.width,
                  height: n.base.height,
                  rx: n.borderRadius ?? 0,
                  fill: fillRef,
                });
          return [
            h(
              "g",
              { key: n.id, "data-slot": n.slot, clipPath },
              h("g", { transform: st.transform, style }, inner)
            ),
          ];
        }
        return [
          h(
            "g",
            { key: n.id, "data-slot": n.slot, clipPath },
            h(
              "g",
              { transform: st.transform, style },
              h("path", { d: svgPaths[n.id], fill: fillRef })
            )
          ),
        ];
      });
  };

  return h(
    Wrapper,
    { style: { backgroundColor: doc.scene.backgroundColor, width: "100%", height: "100%" } },
    h(
      "svg",
      {
        viewBox: `0 0 ${doc.format.width} ${doc.format.height}`,
        style: { width: "100%", height: "100%" },
      },
      h("defs", null, ...defsChildren),
      ...renderSubtree(undefined)
    )
  );
}
