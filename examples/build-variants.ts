import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GLEAN_EDITORIAL_THEME,
  VERIDIAN_NOIR_THEME,
  compileToHyperframes,
  compileToMotionade,
  compileToRemotion,
  statementConverge,
} from "motion-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "out");
fs.mkdirSync(outDir, { recursive: true });

const variants = [
  {
    slug: "01-glean-3lines-3s-30fps",
    compName: "GleanBaselineShot",
    shot: statementConverge({
      id: "glean_3lines_3s",
      name: "Glean Editorial (3 Lines · 3.0s @ 30fps)",
      options: {
        durationSec: 3.0,
        fps: 30,
        theme: GLEAN_EDITORIAL_THEME,
        cueSeconds: [0, 0.6, 1.2],
        convergeAtSec: 2.3334,
      },
      slots: {
        headlineLines: ["Work", "differently", "with AI"],
      },
    }),
  },
  {
    slug: "02-adaptive-2lines-3s-30fps",
    compName: "AdaptiveTwoLinesShot",
    shot: statementConverge({
      id: "adaptive_2lines_3s",
      name: "Adaptive 2-Line Statement (3.0s @ 30fps)",
      options: {
        durationSec: 3.0,
        fps: 30,
        theme: GLEAN_EDITORIAL_THEME,
      },
      slots: {
        headlineLines: ["Think", "beyond limits"],
      },
    }),
  },
  {
    slug: "03-adaptive-4lines-3s-30fps",
    compName: "AdaptiveFourLinesShot",
    shot: statementConverge({
      id: "adaptive_4lines_3s",
      name: "Adaptive 4-Line Statement (3.0s @ 30fps)",
      options: {
        durationSec: 3.0,
        fps: 30,
        theme: GLEAN_EDITORIAL_THEME,
      },
      slots: {
        headlineLines: ["Orchestrate", "autonomous", "enterprise", "workflows"],
      },
    }),
  },
  {
    slug: "04-veridian-rebrand-4.5s-60fps",
    compName: "VeridianRebrandElasticShot",
    shot: statementConverge({
      id: "veridian_rebrand_60fps",
      name: "Veridian Noir Rebrand + Hex Emblem (4.5s @ 60fps)",
      options: {
        durationSec: 4.5,
        fps: 60,
        theme: VERIDIAN_NOIR_THEME,
      },
      slots: {
        headlineLines: ["Ship fearless", "agentic systems", "at planetary scale"],
        emblemHost: {
          id: "veridian_hex_host",
          name: "Veridian Hexagon Core",
          geometry: { kind: "rounded-polygon", sides: 6, diameter: 660, cornerRadius: 68 },
          outsideFill: { kind: "solid", color: VERIDIAN_NOIR_THEME.brandPrimary },
          waypoints1280: [
            { x: -110, y: 360 },
            { x: 340, y: -160 },
            { x: 890, y: -60 },
            { x: 1020, y: 260 },
            { x: 860, y: 520 },
            { x: 640, y: 360 },
          ],
          enterDelaySec: 0,
          initialRotation: -30,
          spinDeltaDeg: 30,
          scaleFrom: 1.18,
          scaleMid: 1.02,
          scaleTo: 0.82,
          progressEasing: { kind: "cubicBezier", x1: 0.16, y1: 0.82, x2: 0.44, y2: 1.0 },
        },
        emblemParts: [
          {
            id: "veridian_diamond_a",
            name: "Veridian North Wing",
            geometry: { kind: "rounded-polygon", sides: 4, diameter: 330, cornerRadius: 48 },
            outsideFill: { kind: "linear", angleDeg: 120, stops: VERIDIAN_NOIR_THEME.emblemOutWarmStops },
            insideHostFill: { kind: "linear", angleDeg: 220, stops: VERIDIAN_NOIR_THEME.emblemInPrimaryStops },
            waypoints1280: [
              { x: 210, y: 760 },
              { x: 300, y: 490 },
              { x: 450, y: 270 },
              { x: 590, y: 255 },
            ],
            enterDelaySec: 0.16,
            initialRotation: -80,
            spinDeltaDeg: 125,
            scaleFrom: 1.2,
            scaleTo: 0.9,
            progressEasing: { kind: "cubicBezier", x1: 0.28, y1: 0.48, x2: 0.38, y2: 0.9 },
          },
          {
            id: "veridian_pent_b",
            name: "Veridian South Prism",
            geometry: { kind: "rounded-polygon", sides: 5, diameter: 350, cornerRadius: 46 },
            outsideFill: {
              kind: "radial",
              domain: { x: 0.14, y: 0.22, width: 0.72, height: 0.72 },
              stops: VERIDIAN_NOIR_THEME.freshRadialStops,
            },
            insideHostFill: { kind: "linear", angleDeg: 260, stops: VERIDIAN_NOIR_THEME.emblemInSecondaryStops },
            waypoints1280: [
              { x: 960, y: -140 },
              { x: 940, y: 160 },
              { x: 820, y: 360 },
              { x: 705, y: 445 },
            ],
            enterDelaySec: 0.26,
            initialRotation: 25,
            spinDeltaDeg: -95,
            scaleFrom: 1.22,
            scaleTo: 0.94,
            progressEasing: { kind: "cubicBezier", x1: 0.18, y1: 0.44, x2: 0.52, y2: 0.94 },
          },
        ],
        overlapRules: [
          {
            id: "veridian_lens",
            name: "Veridian Core Intersection Lens",
            firstPartId: "veridian_diamond_a",
            secondPartId: "veridian_pent_b",
            intersectionFill: { kind: "solid", color: VERIDIAN_NOIR_THEME.surface },
          },
        ],
      },
    }),
  },
];

for (const v of variants) {
  const audit = v.shot.audit();
  const motionade = compileToMotionade(v.shot.ir);
  const hyperframesHtml = compileToHyperframes(v.shot.ir);
  const remotionTsx = compileToRemotion(v.shot.ir, v.compName);

  fs.writeFileSync(path.join(outDir, `${v.slug}.motionade.txt`), motionade.textView);
  fs.writeFileSync(
    path.join(outDir, `${v.slug}.motionade.ops.json`),
    JSON.stringify(motionade.operations, null, 2)
  );
  fs.writeFileSync(path.join(outDir, `${v.slug}.hyperframes.html`), hyperframesHtml);
  fs.writeFileSync(path.join(outDir, `${v.slug}.remotion.tsx`), remotionTsx);
  fs.writeFileSync(
    path.join(outDir, `${v.slug}.audit.json`),
    JSON.stringify(
      {
        id: v.shot.ir.id,
        format: v.shot.ir.format,
        annotations: v.shot.ir.annotations,
        audit,
        sampleReadSnapshot: v.shot.snapshot(
          Math.max(0, v.shot.ir.annotations.convergeStartFrame - 6)
        ),
        sampleEndSnapshot: v.shot.snapshot(v.shot.ir.annotations.emblemSettleFrame),
      },
      null,
      2
    )
  );

  console.log(
    `[${v.slug}] audit.ok=${audit.ok} contrast=${audit.contrastRatio}:1 frames=${v.shot.ir.format.durationFrames}@${v.shot.ir.format.fps}fps ops=${motionade.operations.length} textLines=${motionade.textView.trim().split("\n").length} findings=${audit.findings.length}`
  );
}
