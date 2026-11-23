import { vectorNetworkToSvgPath } from "../kernel/geometry.ts";
import type {
  FillSpec,
  MotionDocument,
  ScalarKey,
  SceneNodeIR,
  Vec2Key,
} from "../kernel/ir.ts";
import type { EasingSpec } from "../kernel/tokens.ts";

export interface MotionadeCompileOutput {
  sceneId: string;
  operations: Record<string, unknown>[];
  textView: string;
}

function toMotionadeTiming(ease: EasingSpec | undefined): Record<string, unknown> | undefined {
  if (!ease) return undefined;
  if (ease.kind === "linear") return { kind: "linear" };
  if (ease.kind === "hold") return { kind: "hold" };
  if (ease.kind === "easing") return { kind: "easing", preset: ease.preset };
  return {
    kind: "cubicBezier",
    x1: ease.x1,
    y1: ease.y1,
    x2: ease.x2,
    y2: ease.y2,
  };
}

function toTextEase(ease: EasingSpec | undefined): string {
  if (!ease) return "";
  if (ease.kind === "linear") return " linear";
  if (ease.kind === "hold") return " hold";
  if (ease.kind === "easing") return ` ${ease.preset}`;
  return ` cubic-bezier(${ease.x1},${ease.y1},${ease.x2},${ease.y2})`;
}

function toMotionadeFill(fill: FillSpec): Record<string, unknown> | undefined {
  if (fill.kind === "none") return undefined;
  if (fill.kind === "solid") return { kind: "solid", color: fill.color };
  if (fill.kind === "linear") {
    return {
      kind: "gradient",
      type: "linear",
      angle: fill.angleDeg,
      stops: fill.stops,
    };
  }
  if (fill.kind === "radial") {
    return {
      kind: "gradient",
      type: "radial",
      radialShape: "circle",
      domain: { space: "ownerBounds", ...fill.domain },
      stops: fill.stops,
    };
  }
  return { kind: "solid", color: "#00000000" };
}

function toTextFill(fill: FillSpec): string {
  if (fill.kind === "none") return "";
  if (fill.kind === "solid") return ` fill=${fill.color}`;
  if (fill.kind === "linear") {
    const stops = fill.stops.map((s) => `${s.color} ${s.offset}`).join(", ");
    return ` fill=linear-gradient(${fill.angleDeg}deg, ${stops})`;
  }
  if (fill.kind === "radial") {
    const stops = fill.stops
      .map((s) => `{offset: ${s.offset}, color: "${s.color}"}`)
      .join(", ");
    const d = fill.domain;
    return ` fill={kind: "gradient", type: "radial", radialShape: "circle", stops: [${stops}], domain: {space: "ownerBounds", x: ${d.x}, y: ${d.y}, width: ${d.width}, height: ${d.height}}}`;
  }
  const params = Object.entries(fill.params)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  return ` fill=shader(${fill.shaderId}@1#${fill.placementId}, ${params})`;
}

/**
 * Target Adapter A: Compiles Canonical Motion IR into Motionade `ProjectOperation[]` + `textView` DSL.
 */
export function compileToMotionade(
  doc: MotionDocument,
  targetSceneId?: string
): MotionadeCompileOutput {
  const sceneId = targetSceneId ?? doc.scene.id;
  const ops: Record<string, unknown>[] = [];
  const shaderMap = new Map(doc.shaders.map((s) => [s.id, s]));

  // 1. Scene header operations
  ops.push({ kind: "updateSceneName", sceneId, name: doc.scene.name });
  ops.push({
    kind: "updateSceneDuration",
    sceneId,
    durationFrames: doc.scene.durationFrames,
  });
  ops.push({
    kind: "setSceneBackgroundFill",
    sceneId,
    background: { kind: "solid", color: doc.scene.backgroundColor },
  });

  if (doc.audio) {
    ops.push({
      kind: "addAsset",
      asset: {
        id: doc.audio.assetId,
        name: doc.audio.name,
        kind: "audio",
        src: doc.audio.src,
        libraryRef: { id: doc.audio.assetId, version: 1 },
        mediaMetadata: {
          channels: doc.audio.channels,
          durationMs: doc.audio.durationMs,
          sampleRate: doc.audio.sampleRate,
        },
      },
    });
    ops.push({
      kind: "addAudioClip",
      clip: {
        id: doc.audio.clipId,
        assetId: doc.audio.assetId,
        role: "music",
        startFrame: doc.audio.startFrame,
        durationFrames: doc.audio.durationFrames,
        gain: doc.audio.gain,
        anchor: { sceneId, offsetFrames: 0 },
      },
    });
  }

  // 2. Scene graph nodes + custom shaders
  for (const node of doc.nodes) {
    if (node.kind === "frame") {
      const base: Record<string, unknown> = {
        x: node.base.x,
        y: node.base.y,
        width: node.base.width,
        height: node.base.height,
      };
      if (node.base.originX !== undefined) base.originX = node.base.originX;
      if (node.base.originY !== undefined) base.originY = node.base.originY;
      ops.push({
        kind: "addObject",
        sceneId,
        object: {
          id: node.id,
          kind: "frame",
          name: node.name,
          ...(node.parentId ? { parentId: node.parentId } : {}),
          layer: node.layer,
          ...(node.range ? { range: node.range } : {}),
          base,
        },
      });
    } else if (node.kind === "text") {
      ops.push({
        kind: "addObject",
        sceneId,
        object: {
          id: node.id,
          kind: "text",
          name: node.name,
          ...(node.parentId ? { parentId: node.parentId } : {}),
          layer: node.layer,
          ...(node.range ? { range: node.range } : {}),
          base: {
            x: Math.round((node.base.x + node.base.width / 2) * 100) / 100,
            y: node.base.y,
          },
          content: { design: { text: node.text } },
          style: {
            fontFamily: node.fontFamily,
            fontSize: node.fontSize,
            fontWeight: node.fontWeight,
            letterSpacing: node.letterSpacing,
            textAlign: node.textAlign,
            primaryFill: { kind: "solid", color: node.fill.color },
          },
        },
      });
    } else if (node.kind === "shape") {
      const style: Record<string, unknown> = {};
      const primaryFill = toMotionadeFill(node.fill);
      if (primaryFill) style.primaryFill = primaryFill;
      if (node.borderRadius !== undefined) style.borderRadius = node.borderRadius;
      if (node.base.blur !== undefined) style.blur = node.base.blur;

      const base: Record<string, unknown> = {
        x: node.base.x,
        y: node.base.y,
        width: node.base.width,
        height: node.base.height,
      };
      if (node.base.rotation !== undefined) base.rotation = node.base.rotation;

      ops.push({
        kind: "addObject",
        sceneId,
        object: {
          id: node.id,
          kind: "shape",
          name: node.name,
          ...(node.parentId ? { parentId: node.parentId } : {}),
          layer: node.layer,
          ...(node.range ? { range: node.range } : {}),
          base,
          content: { shape: node.shape },
          style,
        },
      });

      if (node.fill.kind === "shader") {
        const sDef = shaderMap.get(node.fill.shaderId);
        if (sDef) {
          ops.push({
            kind: "addShader",
            sceneId,
            scope: "objectFill",
            objectId: node.id,
            placementId: node.fill.placementId,
            shader: {
              kind: "custom",
              definitionId: sDef.id,
              version: sDef.version,
              name: sDef.name,
              description: sDef.description,
              cost: sDef.cost,
              sksl: sDef.sksl,
              properties: sDef.properties.map((p, idx) => ({
                id: p.id,
                name: p.label,
                label: p.label,
                type: p.type,
                uniformName: p.uniformName,
                defaultValue:
                  p.type === "color"
                    ? { kind: "color", value: String(node.fill.kind === "shader" ? node.fill.params[p.id] ?? p.defaultValue : p.defaultValue) }
                    : { kind: "number", value: Number(node.fill.kind === "shader" ? node.fill.params[p.id] ?? p.defaultValue : p.defaultValue) },
                control:
                  p.type === "color"
                    ? { kind: "color" }
                    : {
                        kind: "slider",
                        min: p.min ?? 0,
                        max: p.max ?? 100,
                        step: p.step ?? 1,
                        ...(p.unit ? { unit: p.unit } : {}),
                      },
                animation: "continuous",
                order: idx,
              })),
            },
          });
        }
      }
    } else if (node.kind === "path") {
      const style: Record<string, unknown> = {};
      const pf = toMotionadeFill(node.fill);
      if (pf) style.primaryFill = pf;
      if (node.base.blur !== undefined) style.blur = node.base.blur;
      if (node.strokeZero) {
        style.stroke = "#00000000";
        style.strokeWidth = 0;
      }

      const steps = node.network.segments.map((s) => ({
        segmentId: s.id,
        direction: "forward",
      }));

      ops.push({
        kind: "addVectorNetwork",
        sceneId,
        objectId: node.id,
        name: node.name,
        ...(node.parentId ? { parentId: node.parentId } : {}),
        x: node.base.x,
        y: node.base.y,
        style,
        network: {
          vertices: node.network.vertices,
          segments: node.network.segments,
          renderContours: [{ id: "c0", closed: node.network.closed, steps }],
          fillLoops: node.network.closed ? [{ id: "f0", steps }] : [],
          strokeTrails: [{ id: "t0", name: node.network.trailName, steps }],
          defaultTrailOrder: ["t0"],
        },
      });

      ops.push({
        kind: "setObjectLayer",
        sceneId,
        objectId: node.id,
        layer: node.layer,
      });

      if (node.range) {
        ops.push({
          kind: "setObjectRange",
          sceneId,
          objectId: node.id,
          range: node.range,
        });
      }

      const basePatch: Record<string, unknown> = {};
      if (node.base.opacity !== undefined) basePatch.opacity = node.base.opacity;
      if (node.base.rotation !== undefined) basePatch.rotation = node.base.rotation;
      if (node.base.originX !== undefined) basePatch.originX = node.base.originX;
      if (node.base.originY !== undefined) basePatch.originY = node.base.originY;
      if (Object.keys(basePatch).length > 0) {
        ops.push({
          kind: "updateObjectBase",
          sceneId,
          objectId: node.id,
          base: basePatch,
        });
      }
    }
  }

  // 3. Motion blocks
  for (const m of doc.motions) {
    if (m.kind === "shaderParams") {
      for (const [propId, keys] of Object.entries(m.tracks)) {
        ops.push({
          kind: "keyShaderProperty",
          sceneId,
          scope: "objectFill",
          objectId: m.targetId,
          placementId: m.placementId,
          propertyId: propId,
          keys: keys.map((k) => ({
            frame: k.frame,
            value: { kind: "number", value: k.value },
            ...(k.easing ? { outgoingTiming: toMotionadeTiming(k.easing) } : {}),
          })),
        });
      }
    } else if (m.kind === "followPath") {
      ops.push({
        kind: "addFollowPath",
        sceneId,
        followerObjectId: m.targetId,
        guidePathObjectId: m.guidePathId,
        direction: "forward",
        orientToPath: m.orientToPath,
        progress: { from: 0, to: 1 },
        timing: { startFrame: m.startFrame, durationFrames: m.durationFrames },
        ids: {
          motionBlockId: m.id,
          primitiveId: `${m.id}:follow`,
          progressFromKeyId: `${m.id}:from`,
          progressToKeyId: `${m.id}:to`,
        },
      });
      ops.push({
        kind: "updateMotionSegmentTiming",
        sceneId,
        motionBlockId: m.id,
        primitiveId: `${m.id}:follow`,
        valueTrack: { primitiveKind: "path.follow", track: "progress" },
        keyId: `${m.id}:from`,
        timing: toMotionadeTiming(m.progressEasing),
      });
    } else if (m.kind === "scalar") {
      ops.push({
        kind: "materializeActionFacets",
        sceneId,
        catalogId: m.property,
        facets: [
          {
            primitive: {
              id: `${m.id}_p`,
              kind: "property.write",
              ...(m.post ? { persistence: { post: m.post } } : {}),
              value: {
                keys: m.keys.map((k: ScalarKey) => ({
                  id: k.id,
                  frame: k.frame,
                  value: k.value,
                  ...(k.easing ? { outgoingTiming: toMotionadeTiming(k.easing) } : {}),
                })),
              },
            },
          },
        ],
        action: {
          mode: "create",
          blockMetadata: {
            id: m.id,
            name: m.name,
            target: { kind: "object", objectId: m.targetId },
            stage: m.stage,
            timing: { startFrame: m.startFrame, durationFrames: m.durationFrames },
          },
        },
      });
    } else if (m.kind === "vec2") {
      ops.push({
        kind: "materializeActionFacets",
        sceneId,
        catalogId: m.property,
        facets: [
          {
            primitive: {
              id: `${m.id}_p`,
              kind: "property.writeGroup",
              value: {
                keys: m.keys.map((k: Vec2Key) => ({
                  id: k.id,
                  frame: k.frame,
                  value:
                    m.property === "move"
                      ? { x: k.x, y: k.y }
                      : { scaleX: k.x, scaleY: k.y },
                  ...(k.easing ? { outgoingTiming: toMotionadeTiming(k.easing) } : {}),
                })),
              },
            },
          },
        ],
        action: {
          mode: "create",
          blockMetadata: {
            id: m.id,
            name: m.name,
            target: { kind: "object", objectId: m.targetId },
            stage: m.stage,
            timing: { startFrame: m.startFrame, durationFrames: m.durationFrames },
          },
        },
      });
    }
  }

  // 4. Mask bindings
  for (const mask of doc.masks) {
    ops.push({
      kind: "addMaskBinding",
      sceneId,
      binding: {
        id: mask.id,
        name: mask.name,
        sourceObjectId: mask.sourceObjectId,
        targetObjectId: mask.targetObjectId,
        mode: mask.mode,
        inverted: mask.inverted,
      },
    });
  }

  // 5. Render canonical Motionade `textView` lines
  const lines: string[] = [];
  lines.push(
    `project "${doc.name}" ${doc.format.width}x${doc.format.height} ${doc.format.fps}fps timingStyles=[] brushes=[] authoringDefaults={emptyShapeFill: "none"}`
  );
  for (const s of doc.shaders) {
    lines.push(
      `shader #${s.id} "${s.name}" version=${s.version} description="${s.description}" allowedScopes=["objectFill", "sceneBackground"] cost=${s.cost}`
    );
    lines.push("```sksl");
    lines.push(s.sksl);
    lines.push("```");
  }
  lines.push("");
  lines.push(
    `scene #${sceneId} "${doc.scene.name}" dur=${doc.scene.durationFrames} bg=${doc.scene.backgroundColor} motionBlockGroups=[]`
  );

  const childrenMap = new Map<string | undefined, SceneNodeIR[]>();
  for (const n of doc.nodes) {
    const arr = childrenMap.get(n.parentId) ?? [];
    arr.push(n);
    childrenMap.set(n.parentId, arr);
  }

  const emitNodeLines = (parentId: string | undefined, indent: string) => {
    for (const n of childrenMap.get(parentId) ?? []) {
      const life = n.range
        ? ` life=${n.range.startFrame}..${n.range.startFrame + n.range.durationFrames}`
        : "";
      const rot = n.base.rotation !== undefined ? ` rotation=${n.base.rotation}` : "";
      const orig =
        n.base.originX !== undefined || n.base.originY !== undefined
          ? ` originX=${n.base.originX ?? 0.5} originY=${n.base.originY ?? 0.5}`
          : "";
      const op = n.base.opacity !== undefined ? ` opacity=${n.base.opacity}` : "";
      const blur = n.base.blur !== undefined ? ` blur=${n.base.blur}` : "";

      if (n.kind === "frame") {
        lines.push(
          `${indent}frame #${n.id} "${n.name}" x=${n.base.x} y=${n.base.y} width=${n.base.width} height=${n.base.height}${orig} z=${n.layer}${life}`
        );
      } else if (n.kind === "text") {
        lines.push(
          `${indent}text #${n.id} "${n.name}" text=${JSON.stringify(n.text)} x=${n.base.x} y=${n.base.y} width=${n.base.width} height=${n.base.height} fill=${n.fill.color} fontFamily=${n.fontFamily} fontSize=${n.fontSize} fontWeight=${n.fontWeight} textAlign=${n.textAlign} textSizing=auto-width letterSpacing=${n.letterSpacing} z=${n.layer}${life}`
        );
      } else if (n.kind === "shape") {
        const br = n.borderRadius !== undefined ? ` borderRadius=${n.borderRadius}` : "";
        lines.push(
          `${indent}shape #${n.id} "${n.name}" ${n.shape} x=${n.base.x} y=${n.base.y} width=${n.base.width} height=${n.base.height}${rot}${toTextFill(n.fill)}${br}${blur} z=${n.layer}${life}`
        );
      } else if (n.kind === "path") {
        const dStr = vectorNetworkToSvgPath(n.network);
        const stroke = n.strokeZero ? " stroke=#00000000 strokeWidth=0" : "";
        lines.push(
          `${indent}path #${n.id} "${n.name}" d="${dStr}" trailName="${n.network.trailName}" x=${n.base.x} y=${n.base.y} width=${n.base.width} height=${n.base.height}${rot}${orig}${op}${toTextFill(n.fill)}${blur}${stroke} z=${n.layer}${life}`
        );
      }
      emitNodeLines(n.id, indent + "  ");
    }
  };
  emitNodeLines(undefined, "");

  for (const mask of doc.masks) {
    lines.push(
      `mask #${mask.id} "${mask.name}" src=#${mask.sourceObjectId} dst=#${mask.targetObjectId} ${mask.mode}`
    );
  }

  for (const m of doc.motions) {
    if (m.kind === "scalar") {
      const opSign = m.mode === "add" ? "+=" : "";
      const propLabel = m.property === "layerBlur" ? "blur" : m.property;
      const ks = m.keys.map((k) => `${k.frame}:${k.value}${toTextEase(k.easing)}`).join(" ");
      lines.push(
        `motion #${m.id} "${m.name}" #${m.targetId} ${m.property} ${m.stage} at=${m.startFrame} dur=${m.durationFrames} ${propLabel}${opSign}=[${ks}]`
      );
    } else if (m.kind === "vec2") {
      const propLabel = m.property === "move" ? "x,y+=" : "scaleX,scaleY*=";
      const ks = m.keys.map((k) => `${k.frame}:${k.x},${k.y}${toTextEase(k.easing)}`).join(" ");
      lines.push(
        `motion #${m.id} "${m.name}" #${m.targetId} ${m.property} ${m.stage} at=${m.startFrame} dur=${m.durationFrames} ${propLabel}[${ks}]`
      );
    } else if (m.kind === "followPath") {
      lines.push(
        `motion #${m.id} "${m.name}" #${m.targetId} followPath custom at=${m.startFrame} dur=${m.durationFrames} follow(path=#${m.guidePathId}, trail=t0, progress=[0:0${toTextEase(m.progressEasing)} #${m.id}:from ${m.durationFrames - 1}:1 #${m.id}:to])`
      );
    } else if (m.kind === "shaderParams") {
      const trackStr = Object.entries(m.tracks)
        .map(([p, keys]) => `${p}[${keys.map((k) => `${k.frame}:${k.value}${toTextEase(k.easing)}`).join(" ")}]`)
        .join(" ");
      lines.push(
        `motion #${m.id} "${m.name}" #${m.targetId}.objectFill(${m.placementId}) effect:${m.shaderId} at=${m.startFrame} dur=${m.durationFrames} ${trackStr} after=hold`
      );
    }
  }

  return {
    sceneId,
    operations: ops,
    textView: lines.join("\n") + "\n",
  };
}
