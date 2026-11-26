"use client";

import { Button } from "@ui-sdk/react/button";
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field";
import { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem } from "@ui-sdk/react/segmented-control";
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@ui-sdk/react/slider";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { Textarea } from "@ui-sdk/react/textarea";
import { compileToHyperframes, compileToMotionade, compileToRemotion, type Shot } from "motion-sdk";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { atomBySlug, type Control, type Settings } from "@/lib/atoms";
import { Stage } from "./stage";
import { usePlayback } from "./use-playback";

const same = (a: Settings, b: Settings) => Object.keys(b).every((k) => a[k] === b[k]);

function ControlField({ control, value, onChange }: { control: Control; value: Settings[string]; onChange: (v: Settings[string]) => void }) {
  if (control.kind === "lines") {
    return (
      <Field name={control.key}>
        <FieldLabel>{control.label}</FieldLabel>
        <Textarea autoResize spellCheck={false} value={String(value)} onChange={(e) => onChange(e.target.value)} />
        <FieldDescription>{control.hint}</FieldDescription>
      </Field>
    );
  }
  if (control.kind === "choice") {
    return (
      <Field name={control.key}>
        <FieldLabel>{control.label}</FieldLabel>
        <SegmentedControl value={String(value)} onValueChange={(v) => v !== null && onChange(String(v))}>
          <SegmentedControlIndicator />
          {control.options.map((o) => (
            <SegmentedControlItem key={o.value} value={o.value}>
              {o.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <FieldDescription>{control.hint}</FieldDescription>
      </Field>
    );
  }
  if (control.kind === "range") {
    const n = Number(value);
    return (
      <Field name={control.key}>
        <div className="row">
          <FieldLabel>{control.label}</FieldLabel>
          <output>{control.off && n <= control.min ? control.off : `${n} ${control.unit}`}</output>
        </div>
        <Slider value={n} min={control.min} max={control.max} step={control.step} onValueChange={(v) => onChange(Number(v))}>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
        </Slider>
        <FieldDescription>{control.hint}</FieldDescription>
      </Field>
    );
  }
  return (
    <Field name={control.key} data-layout="switch">
      <div className="stack">
        <FieldLabel>{control.label}</FieldLabel>
        <FieldDescription>{control.hint}</FieldDescription>
      </div>
      <Switch checked={Boolean(value)} onCheckedChange={(v) => onChange(Boolean(v))}>
        <SwitchThumb />
      </Switch>
    </Field>
  );
}

function Audit({ shot }: { shot: Shot }) {
  const report = useMemo(() => shot.audit(), [shot]);
  const fps = shot.ir.format.fps;
  return (
    <div className="audit">
      <p className="verdict" data-ok={report.ok}>
        {report.ok
          ? report.findings.length
            ? `The audit passes, with ${report.findings.length} thing${report.findings.length > 1 ? "s" : ""} to look at.`
            : "The audit passes: every subject gets its reading time and every answer lands on its cue."
          : `The audit found ${report.findings.filter((f) => f.severity === "error").length} problem(s). The shot was built anyway, so you can see them.`}
      </p>
      {report.findings.map((finding, i) => (
        <div key={i} className="finding" data-severity={finding.severity}>
          <strong>
            {finding.severity === "error" ? "Problem" : "Note"} · {finding.rule}
          </strong>
          <p>{finding.message}</p>
          {finding.fix ? <p className="fix">{finding.fix}</p> : null}
        </div>
      ))}
      <h3>Cues</h3>
      <ul className="cues">
        {shot.ir.score.cues.map((cue) => (
          <li key={cue.name}>
            <code>{cue.name}</code> frame {cue.frame} ({(cue.frame / fps).toFixed(2)} s){cue.kind === "accent" ? ", the accent" : ""}
          </li>
        ))}
      </ul>
      <h3>Reading</h3>
      <table>
        <thead>
          <tr>
            <th scope="col">Subject</th>
            <th scope="col">Needs</th>
            <th scope="col">Gets clear</th>
          </tr>
        </thead>
        <tbody>
          {report.measures.reading.map((m) => (
            <tr key={m.nodeId} data-short={m.clearSec < m.needsSec}>
              <th scope="row">{m.label}</th>
              <td>{m.needsSec.toFixed(2)} s</td>
              <td>{m.clearSec.toFixed(2)} s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const OUTPUTS = [
  { value: "code", label: "The call" },
  { value: "audit", label: "Audit" },
  { value: "decisions", label: "Decisions" },
  { value: "hyperframes", label: "HyperFrames" },
  { value: "motionade", label: "Motionade" },
  { value: "remotion", label: "Remotion" },
] as const;

export function AtomView({ slug }: { slug: string }) {
  const atom = atomBySlug(slug)!;
  const [settings, setSettings] = useState<Settings>(atom.defaults);
  const [output, setOutput] = useState<string>("code");
  const [copied, setCopied] = useState(false);
  const lastGood = useRef<Shot | null>(null);

  const built = useMemo(() => {
    try {
      const shot = atom.build(settings);
      lastGood.current = shot;
      return { shot, error: null as string | null };
    } catch (error) {
      return { shot: lastGood.current ?? atom.build(atom.defaults), error: error instanceof Error ? error.message : String(error) };
    }
  }, [atom, settings]);
  const { shot } = built;
  const { durationFrames, fps } = shot.ir.format;
  const { frame, playing, setPlaying, seek } = usePlayback(durationFrames, fps, shot);
  const code = useMemo(() => atom.code(settings), [atom, settings]);
  const text = useMemo(() => {
    if (output === "decisions") return atom.describe();
    if (output === "hyperframes") return compileToHyperframes(shot.ir);
    if (output === "motionade") return compileToMotionade(shot.ir).textView;
    if (output === "remotion") return compileToRemotion(shot.ir, "Shot");
    return code;
  }, [atom, code, output, shot]);
  const report = useMemo(() => shot.audit(), [shot]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="atom">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Library</Link> / {atom.title}
      </nav>
      <header className="atom-head">
        <h1>{atom.title}</h1>
        <p>{atom.line}</p>
        <p className="fitted">{atom.fittedTo}</p>
      </header>

      <div className="workspace">
        <section className="viewer" aria-label="The shot">
          <Stage doc={shot.ir} frame={frame} label={`${atom.title}, frame ${frame}`} />
          <div className="transport">
            <Button onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play"}</Button>
            <div className="timeline">
              <div className="marks" aria-hidden="true">
                {shot.ir.score.cues.map((cue) => (
                  <span key={cue.name} data-kind={cue.kind} style={{ left: `${(cue.frame / Math.max(1, durationFrames - 1)) * 100}%` }} title={`${cue.name}, frame ${cue.frame}`} />
                ))}
              </div>
              <Slider
                value={frame}
                min={0}
                max={durationFrames - 1}
                step={1}
                onValueChange={(v) => {
                  setPlaying(false);
                  seek(Number(v));
                }}
              >
                <SliderControl>
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb aria-label="Frame" />
                  </SliderTrack>
                </SliderControl>
              </Slider>
            </div>
            <output className="clock">
              {String(frame).padStart(3, "0")} / {durationFrames - 1} · {(frame / fps).toFixed(2)} s
            </output>
          </div>
          <p className="status" data-ok={report.ok && !built.error} role="status">
            {built.error
              ? `Not built: ${built.error} Showing the last shot that was.`
              : report.ok
                ? `${durationFrames} frames at ${fps} fps. The audit passes.`
                : `${durationFrames} frames at ${fps} fps. The audit found ${report.findings.filter((f) => f.severity === "error").length} problem(s): open Audit.`}
          </p>

          <Tabs value={output} onValueChange={(v) => v !== null && setOutput(String(v))} className="outputs">
            <TabsList aria-label="What the shot is, as text">
              {OUTPUTS.map((o) => (
                <TabsTab key={o.value} value={o.value}>
                  {o.label}
                </TabsTab>
              ))}
            </TabsList>
            {OUTPUTS.map((o) => (
              <TabsPanel key={o.value} value={o.value}>
                {o.value === "audit" ? (
                  <Audit shot={shot} />
                ) : output === o.value ? (
                  <div className="source">
                    <Button onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
                    <pre>
                      <code>{text}</code>
                    </pre>
                  </div>
                ) : null}
              </TabsPanel>
            ))}
          </Tabs>
        </section>

        <aside className="panel" aria-label="What you can change">
          <h2>Variations</h2>
          <ul className="presets">
            {atom.presets.map((preset) => (
              <li key={preset.name}>
                <Button data-current={same(settings, preset.settings) || undefined} onClick={() => setSettings(preset.settings)}>
                  <span>{preset.name}</span>
                  <small>{preset.note}</small>
                </Button>
              </li>
            ))}
          </ul>
          <h2>Decisions</h2>
          <div className="controls">
            {atom.controls.map((control) => (
              <ControlField key={control.key} control={control} value={settings[control.key]!} onChange={(v) => setSettings((s) => ({ ...s, [control.key]: v }))} />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
