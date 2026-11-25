import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  compileToHyperframes,
  compileToMotionade,
  compileToRemotion,
  statementConverge,
  veridianNoir,
  type MotionDocument,
  type Shot,
} from "motion-sdk";
import { referenceDocument } from "./reference.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "out");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

/** One atom, four briefs. Each changes what a designer would change, and nothing else is restated. */
const variants: { slug: string; component: string; title: string; brief: string; shot: Shot }[] = [
  {
    slug: "01-three-lines",
    component: "ThreeLines",
    title: "Three lines",
    brief: "The reference's copy and nothing else. No cue is given; the phrase solver places the lines.",
    shot: statementConverge({ id: "three_lines", name: "Three lines", slots: { lines: ["Work", "differently", "with AI"] } }),
  },
  {
    slug: "02-five-lines-100bpm",
    component: "FiveLinesOnTheBeat",
    title: "Five lines at 100 BPM",
    brief: "Two more lines and a tempo. The first four become an eighth-note run-up and the last lands on a whole beat.",
    shot: statementConverge({
      id: "five_lines_100bpm",
      name: "Five lines at 100 BPM",
      decisions: { tempo: { bpm: 100 } },
      slots: { lines: ["Plan", "build", "test", "ship", "with AI"] },
    }),
  },
  {
    slug: "03-two-lines-even",
    component: "TwoLinesEven",
    title: "Two lines, no accent, 4 s",
    brief: "A pair of equals, so no build: accent none. The extra second goes to reading, not to slower motion.",
    shot: statementConverge({
      id: "two_lines_even",
      name: "Two lines, no accent",
      decisions: { accent: "none", durationSec: 4 },
      slots: { lines: ["Think", "beyond limits"] },
    }),
  },
  {
    slug: "04-vertical-veridian-60fps",
    component: "VerticalVeridian",
    title: "Vertical, another look, 60 fps",
    brief: "1080×1920 at 60 fps in a dark look, four lines, and the finished mark held for half a second.",
    shot: statementConverge({
      id: "vertical_veridian",
      name: "Vertical Veridian",
      decisions: { width: 1080, height: 1920, fps: 60, durationSec: 4.5, look: veridianNoir, holdAfterLandSec: 0.5 },
      slots: { lines: ["Ship", "fearless", "agents", "at scale"] },
    }),
  },
];

const write = (name: string, text: string) => fs.writeFileSync(path.join(outDir, name), text);

for (const v of variants) {
  const audit = v.shot.audit();
  const motionade = compileToMotionade(v.shot.ir);
  write(`${v.slug}.hyperframes.html`, compileToHyperframes(v.shot.ir));
  write(`${v.slug}.motionade.txt`, motionade.textView);
  write(`${v.slug}.motionade.ops.json`, JSON.stringify(motionade.operations, null, 2));
  write(`${v.slug}.remotion.tsx`, compileToRemotion(v.shot.ir, v.component));
  write(`${v.slug}.audit.json`, JSON.stringify({ format: v.shot.ir.format, score: v.shot.ir.score, audit }, null, 2));
  const lines = v.shot.ir.score.cues.map((c) => `${c.name}@${c.frame}${c.kind === "accent" ? "*" : ""}`).join(" ");
  console.log(`[${v.slug}] audit.ok=${audit.ok} findings=${audit.findings.length} ${v.shot.ir.format.durationFrames}f@${v.shot.ir.format.fps} | ${lines}`);
  for (const f of audit.findings) console.log(`    ${f.severity} ${f.rule}: ${f.message}`);
}

const reference = referenceDocument();
write("00-reference.hyperframes.html", compileToHyperframes(reference));
write("statement-converge.describe.txt", statementConverge.describe() + "\n");

// One page that plays every composition, for looking at them side by side in a browser.
const body = (html: string) =>
  html
    .slice(html.indexOf("<body>") + 6, html.indexOf("</body>"))
    .replace(/<script src="[^"]*gsap[^"]*"><\/script>/, "");
const cueMarks = (doc: MotionDocument) =>
  doc.score.cues.map((c) => ({ name: c.name, frame: c.frame, accent: c.kind === "accent", structure: c.kind === "structure" }));
const tabs = [
  ...variants.map((v) => ({ id: v.shot.ir.id, title: v.title, brief: v.brief, doc: v.shot.ir })),
  { id: reference.id, title: "Reference", brief: "The project /reconstruct built, read from its 138 operations and drawn by the same compiler.", doc: reference },
];

export const previewPage = `<!doctype html>
<meta charset="utf-8">
<title>statement-converge</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=block">
<style>
  .ms { font-family: var(--font-sans, system-ui, sans-serif); color: var(--foreground, #111); }
  .ms-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .ms-tabs button { font: inherit; font-size: 13px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--border, #ccc); background: transparent; color: inherit; cursor: pointer; }
  .ms-tabs button[aria-pressed="true"] { background: var(--primary, #111); color: var(--primary-foreground, #fff); border-color: transparent; }
  .ms-stage { position: relative; width: 100%; overflow: hidden; border-radius: var(--radius, 10px); background: var(--muted, #eee); }
  .ms-comp { position: absolute; left: 0; top: 0; transform-origin: 0 0; display: none; }
  .ms-comp.on { display: block; }
  .ms-bar { display: flex; align-items: center; gap: 10px; margin-top: 10px; font-size: 13px; }
  .ms-bar button { font: inherit; width: 64px; padding: 4px 0; border-radius: 6px; border: 1px solid var(--border, #ccc); background: transparent; color: inherit; cursor: pointer; }
  .ms-track { position: relative; flex: 1; height: 34px; }
  .ms-track input { position: absolute; left: 0; right: 0; top: 14px; width: 100%; margin: 0; }
  .ms-cue { position: absolute; top: 0; font-size: 10px; line-height: 12px; transform: translateX(-50%); white-space: nowrap; opacity: 0.7; }
  .ms-cue.accent { font-weight: 700; opacity: 1; }
  .ms-frame { font-variant-numeric: tabular-nums; width: 76px; text-align: right; font-family: var(--font-mono, monospace); }
  .ms-brief { margin: 10px 0 0; font-size: 13px; opacity: 0.8; min-height: 2.6em; }
</style>
<div class="ms">
  <div class="ms-tabs" id="ms-tabs"></div>
  <div class="ms-stage" id="ms-stage">
${tabs.map((t) => `<div class="ms-comp" data-comp="${t.id}">${body(t.id === reference.id ? compileToHyperframes(reference, { fonts: false }) : compileToHyperframes(t.doc, { fonts: false }))}</div>`).join("\n")}
  </div>
  <div class="ms-bar">
    <button id="ms-play" type="button">Pause</button>
    <div class="ms-track"><div id="ms-cues"></div><input id="ms-scrub" type="range" min="0" value="0" step="1" aria-label="Frame"></div>
    <div class="ms-frame" id="ms-frame"></div>
  </div>
  <p class="ms-brief" id="ms-brief"></p>
</div>
<script>
(function () {
  var TABS = ${JSON.stringify(tabs.map((t) => ({ id: t.id.replace(/[^a-zA-Z0-9_-]/g, "-"), title: t.title, brief: t.brief, format: t.doc.format, cues: cueMarks(t.doc) })))};
  var stage = document.getElementById("ms-stage"), scrub = document.getElementById("ms-scrub");
  var active = 0, playing = true, frame = 0, last = null;
  function fit() {
    var t = TABS[active], scale = Math.min(stage.clientWidth / t.format.width, 560 / t.format.height);
    stage.style.height = Math.round(t.format.height * scale) + "px";
    var el = stage.querySelector('[data-comp="' + t.id + '"]');
    el.style.transform = "translateX(" + Math.round((stage.clientWidth - t.format.width * scale) / 2) + "px) scale(" + scale + ")";
  }
  function draw() {
    var t = TABS[active];
    window.__motionSdk[t.id].pose(Math.min(frame, t.format.durationFrames - 1));
    scrub.value = String(Math.floor(frame));
    document.getElementById("ms-frame").textContent = "f" + Math.floor(frame) + " / " + (t.format.durationFrames - 1);
  }
  function choose(i) {
    active = i; frame = 0; last = null;
    var t = TABS[i];
    Array.prototype.forEach.call(stage.querySelectorAll(".ms-comp"), function (el) { el.classList.toggle("on", el.dataset.comp === t.id); });
    Array.prototype.forEach.call(document.querySelectorAll("#ms-tabs button"), function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
    scrub.max = String(t.format.durationFrames - 1);
    document.getElementById("ms-brief").textContent = t.brief;
    document.getElementById("ms-cues").innerHTML = t.cues.map(function (c) {
      return '<span class="ms-cue' + (c.accent ? " accent" : "") + '" style="left:' + (100 * c.frame / (t.format.durationFrames - 1)).toFixed(2) + '%">' + (c.structure ? c.name : c.name.replace("line-", "")) + "</span>";
    }).join("");
    fit(); draw();
  }
  TABS.forEach(function (t, i) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = t.title; b.onclick = function () { choose(i); };
    document.getElementById("ms-tabs").appendChild(b);
  });
  document.getElementById("ms-play").onclick = function () {
    playing = !playing; last = null; this.textContent = playing ? "Pause" : "Play";
  };
  scrub.oninput = function () { playing = false; document.getElementById("ms-play").textContent = "Play"; frame = +scrub.value; draw(); };
  addEventListener("resize", fit);
  function tick(now) {
    if (playing) {
      var t = TABS[active], hold = t.format.fps * 0.7;
      if (last !== null) frame += ((now - last) / 1000) * t.format.fps;
      if (frame >= t.format.durationFrames + hold) frame = 0;
      draw();
    }
    last = now;
    requestAnimationFrame(tick);
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { choose(0); requestAnimationFrame(tick); });
})();
</script>
`;
write("preview.html", previewPage);
console.log(`wrote ${fs.readdirSync(outDir).length} files to examples/out (preview.html is ${Math.round(previewPage.length / 1024)} KB)`);
