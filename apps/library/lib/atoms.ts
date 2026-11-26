import {
  gleanEditorial,
  statementConverge,
  veridianNoir,
  wordByWord,
  type Arrival,
  type Shot,
} from "motion-sdk";

/** One thing a visitor can change on an atom's page. It maps to one decision or slot of the shot. */
export type Control =
  | { key: string; kind: "lines"; label: string; hint: string }
  | { key: string; kind: "choice"; label: string; hint: string; options: { value: string; label: string }[] }
  | { key: string; kind: "range"; label: string; hint: string; min: number; max: number; step: number; unit: string; off?: string }
  | { key: string; kind: "toggle"; label: string; hint: string };

export type Settings = Record<string, string | number | boolean>;

export interface AtomEntry {
  slug: string;
  /** The exported name, as written in code. */
  call: string;
  title: string;
  /** One sentence for the gallery. */
  line: string;
  /** Where its motion was measured, in a sentence. */
  fittedTo: string;
  describe: () => string;
  controls: Control[];
  defaults: Settings;
  /** Ready-made settings that each change what a designer would change. */
  presets: { name: string; note: string; settings: Settings }[];
  build: (settings: Settings) => Shot;
  /** The call that produces the same shot, as an agent would write it. */
  code: (settings: Settings) => string;
}

const looks = { glean: gleanEditorial, veridian: veridianNoir };
const formats = {
  wide: { width: 1280, height: 720 },
  square: { width: 1080, height: 1080 },
  tall: { width: 1080, height: 1920 },
};
const lookChoice: Control = {
  key: "look", kind: "choice", label: "Look", hint: "Colours and type. The motion does not change with it.",
  options: [{ value: "glean", label: "Warm editorial" }, { value: "veridian", label: "Dark" }],
};
const formatChoice: Control = {
  key: "format", kind: "choice", label: "Format", hint: "Sizes and travel scale with the stage; nothing is laid out in fixed pixels.",
  options: [{ value: "wide", label: "16:9" }, { value: "square", label: "1:1" }, { value: "tall", label: "9:16" }],
};
const tempoRange: Control = {
  key: "bpm", kind: "range", label: "Tempo", hint: "With a tempo the arrivals land on its grid. Off, they share the time by weight.",
  min: 59, max: 160, step: 1, unit: "BPM", off: "Off",
};
const accentChoice = (hint: string): Control => ({
  key: "accent", kind: "choice", label: "Accent", hint,
  options: [{ value: "last", label: "Last" }, { value: "first", label: "First" }, { value: "none", label: "None" }],
});

const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);
const quote = (v: unknown) => JSON.stringify(v);
const object = (entries: [string, string | undefined][]) => {
  const kept = entries.filter((e): e is [string, string] => e[1] !== undefined);
  return kept.length ? `{ ${kept.map(([k, v]) => `${k}: ${v}`).join(", ")} }` : undefined;
};
const stage = (s: Settings) => ({
  ...formats[s.format as keyof typeof formats],
  look: looks[s.look as keyof typeof looks],
  durationSec: Number(s.duration),
  tempo: Number(s.bpm) > 59 ? { bpm: Number(s.bpm) } : undefined,
  accent: s.accent as "last" | "first" | "none",
});
const stageCode = (s: Settings, defaults: Settings): [string, string | undefined][] => [
  ["width", s.format !== defaults.format ? String(formats[s.format as keyof typeof formats].width) : undefined],
  ["height", s.format !== defaults.format ? String(formats[s.format as keyof typeof formats].height) : undefined],
  ["look", s.look === "veridian" ? "veridianNoir" : undefined],
  ["durationSec", s.duration !== defaults.duration ? String(s.duration) : undefined],
  ["tempo", Number(s.bpm) > 59 ? `{ bpm: ${s.bpm} }` : undefined],
  ["accent", s.accent !== "last" ? quote(s.accent) : undefined],
];

/** "a complete *floor plan*" marks the words the sentence is about. */
const arrival = (line: string): string | Arrival => {
  const key = [...line.matchAll(/\*([^*]+)\*/g)].map((m) => m[1]!);
  const text = line.replaceAll("*", "");
  return key.length ? { text, key: key.length === 1 ? key[0]! : key } : text;
};

const wordDefaults: Settings = {
  arrivals: "Into\na complete *floor plan*", accent: "first", bpm: 59, duration: 3, enter: "focus", layout: "recentre",
  exit: "cut", ground: true, look: "glean", format: "wide",
};
const statementDefaults: Settings = {
  lines: "Work\ndifferently\nwith AI", accent: "last", bpm: 59, duration: 3, backdrop: true, look: "glean", format: "wide",
};

export const atoms: AtomEntry[] = [
  {
    slug: "word-by-word",
    call: "wordByWord",
    title: "Word by word",
    line: "A sentence arrives a few words at a time, with the stress it would be spoken with.",
    fittedTo: "Fitted to a product film's five-word line, measured frame by frame: a lead word that lands large and settles, then the rest two frames apart.",
    describe: () => wordByWord.describe(),
    controls: [
      { key: "arrivals", kind: "lines", label: "Arrivals", hint: "One per line: the words that land together on one cue. Wrap the words the sentence is about in *asterisks*." },
      accentChoice("Which arrival carries the sentence. First has the stage to itself and starts large; last is what the line builds to."),
      tempoRange,
      { key: "duration", kind: "range", label: "Length", hint: "Entrances keep their length. Extra time goes to holding the accent and the finished line.", min: 1.5, max: 6, step: 0.1, unit: "s" },
      { key: "enter", kind: "choice", label: "Words enter by", hint: "Focus is quick and quiet. Rise is more physical. Fade suits a busy ground.", options: [{ value: "focus", label: "Focus" }, { value: "rise", label: "Rise" }, { value: "fade", label: "Fade" }] },
      { key: "layout", kind: "choice", label: "The line", hint: "Recentre keeps what has arrived centred, so the line slides to make room. Anchored sets each word where it will rest.", options: [{ value: "recentre", label: "Recentres" }, { value: "anchored", label: "Is anchored" }] },
      { key: "exit", kind: "choice", label: "At the end", hint: "Cut holds the line for the next shot. Shrink lets it fall back and fade.", options: [{ value: "cut", label: "Cut" }, { value: "shrink", label: "Shrink" }] },
      { key: "ground", kind: "toggle", label: "A ground that answers", hint: "Soft shapes behind the phrase that move a little on every arrival." },
      lookChoice,
      formatChoice,
    ],
    defaults: wordDefaults,
    presets: [
      { name: "A lead word, then the rest", note: "The accent comes first, alone, and starts large.", settings: wordDefaults },
      { name: "Three words on the beat", note: "Three equals at 120 BPM: one word per beat, no accent.", settings: { ...wordDefaults, arrivals: "Plan.\nBuild.\nShip.", accent: "none", bpm: 120 } },
      { name: "Five words that build", note: "Two more words. The accent stays last, so four arrivals run up to it.", settings: { ...wordDefaults, arrivals: "Plan,\nbuild,\ntest,\nship\n*together.*", accent: "last", duration: 3.4 } },
      { name: "A longer sentence that leaves", note: "Three breaths, rising into place; the phrase wraps and falls back at the end.", settings: { ...wordDefaults, arrivals: "We want you\nto express yourself\n*your way.*", accent: "last", duration: 4.2, enter: "rise", exit: "shrink" } },
      { name: "Vertical, dark, anchored", note: "The same atom on a tall stage in another look, words appearing where they rest.", settings: { ...wordDefaults, arrivals: "Meet\nagents that *ship*\nwhile you sleep.", duration: 3.6, layout: "anchored", look: "veridian", format: "tall" } },
    ],
    build: (s) =>
      wordByWord({
        decisions: {
          ...stage(s),
          enter: s.enter as "focus" | "rise" | "fade",
          layout: s.layout as "recentre" | "anchored",
          exit: s.exit as "cut" | "shrink",
        },
        slots: { arrivals: lines(String(s.arrivals)).map(arrival), ...(s.ground ? {} : { ambient: [] }) },
      }),
    code: (s) => {
      const decisions = object([
        ...stageCode(s, wordDefaults).map(([k, v]): [string, string | undefined] => (k === "accent" ? [k, s.accent !== "last" ? quote(s.accent) : undefined] : [k, v])),
        ["enter", s.enter !== "focus" ? quote(s.enter) : undefined],
        ["layout", s.layout !== "recentre" ? quote(s.layout) : undefined],
        ["exit", s.exit !== "cut" ? quote(s.exit) : undefined],
      ]);
      const arrivals = lines(String(s.arrivals)).map((l) => {
        const a = arrival(l);
        return typeof a === "string" ? quote(a) : `{ text: ${quote(a.text)}, key: ${quote(a.key)} }`;
      });
      const slots = `{ arrivals: [${arrivals.join(", ")}]${s.ground ? "" : ", ambient: []"} }`;
      return `import { ${s.look === "veridian" ? "veridianNoir, " : ""}wordByWord } from "motion-sdk";\n\nconst shot = wordByWord({\n${decisions ? `  decisions: ${decisions},\n` : ""}  slots: ${slots},\n});\n\nshot.audit(); // read it after every change`;
    },
  },
  {
    slug: "statement-converge",
    call: "statementConverge",
    title: "Statement, then the mark",
    line: "A short statement builds line by line while the world around it answers, then resolves into a mark.",
    fittedTo: "Fitted to a three-second brand opening rebuilt operation by operation: lines within 2.2 px of the reference.",
    describe: () => statementConverge.describe(),
    controls: [
      { key: "lines", kind: "lines", label: "Lines", hint: "The statement, one line per arrival, one to three words each." },
      accentChoice("Which line carries the weight. Last builds to a landing; none is a list of equals."),
      tempoRange,
      { key: "duration", kind: "range", label: "Length", hint: "Arrivals, answers and the mark's travel keep their length; extra time goes to reading.", min: 2.4, max: 6, step: 0.1, unit: "s" },
      { key: "backdrop", kind: "toggle", label: "The turning ribbon", hint: "The backdrop that snaps a quarter turn on each line. Off leaves a bare ground." },
      lookChoice,
      formatChoice,
    ],
    defaults: statementDefaults,
    presets: [
      { name: "Three lines", note: "The reference's copy. No cue is given; the solver places the lines.", settings: statementDefaults },
      { name: "Five lines at 100 BPM", note: "Two more lines and a tempo: four become a run-up and the last lands on a whole beat.", settings: { ...statementDefaults, lines: "Plan\nbuild\ntest\nship\nwith AI", bpm: 100 } },
      { name: "Two equals, four seconds", note: "A pair with no build. The extra second goes to reading, not to slower motion.", settings: { ...statementDefaults, lines: "Think\nbeyond limits", accent: "none", duration: 4 } },
      { name: "Vertical, dark", note: "A tall stage in another look, four lines.", settings: { ...statementDefaults, lines: "Ship\nfearless\nagents\nat scale", duration: 4.5, look: "veridian", format: "tall" } },
    ],
    build: (s) => statementConverge({ decisions: { ...stage(s), backdrop: Boolean(s.backdrop) }, slots: { lines: lines(String(s.lines)) } }),
    code: (s) => {
      const decisions = object([...stageCode(s, statementDefaults), ["backdrop", s.backdrop ? undefined : "false"]]);
      return `import { ${s.look === "veridian" ? "veridianNoir, " : ""}statementConverge } from "motion-sdk";\n\nconst shot = statementConverge({\n${decisions ? `  decisions: ${decisions},\n` : ""}  slots: { lines: [${lines(String(s.lines)).map(quote).join(", ")}] },\n});\n\nshot.audit(); // read it after every change`;
    },
  },
];

export const atomBySlug = (slug: string) => atoms.find((a) => a.slug === slug);
