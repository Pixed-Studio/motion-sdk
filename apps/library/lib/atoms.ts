import {
  gleanEditorial,
  popAndGlide,
  snappyEditorial,
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

const feels = { snappy: snappyEditorial, pop: popAndGlide };
/** What each pattern does when a beat is left out: the page writes only what differs, and says which beats it left. */
const patternDefaults = {
  lead: { hit: "large", settle: "fall", join: "slide", mark: "colour", hold: "out", leave: "recede" },
  cascade: { hit: "large", settle: "fall", join: "focus", mark: "colour", hold: "still", leave: "cut" },
} as const;
const wordDefaults: Settings = {
  arrivals: "Into\na complete *floor plan*", pattern: "lead", feel: "snappy", bpm: 59, duration: 1, hit: "large", settle: "fall", join: "slide", mark: "colour",
  hold: "out", leave: "recede", accent: "last", layout: "recentre", ground: false, look: "glean", format: "wide",
};
const statementDefaults: Settings = {
  lines: "Work\ndifferently\nwith AI", accent: "last", bpm: 59, duration: 3, backdrop: true, look: "glean", format: "wide",
};
const options = (...values: [string, string][]) => values.map(([value, label]) => ({ value, label }));

export const atoms: AtomEntry[] = [
  {
    slug: "word-by-word",
    call: "wordByWord",
    title: "Word by word",
    line: "An opening that stresses one message: a lead takes the eye, gives its place to the sentence once, and the point arrives last and is marked. Every beat is yours to design.",
    fittedTo:
      "The lead pattern's relations and the feels' numbers come from eight sentences of three launch films, each rebuilt as an editable project and measured frame by frame: " +
      "written with this atom, 34 of 35 words show on the film's frame, and word centres sit 2 to 7 px from the film's on average at 1280 wide.",
    describe: () => wordByWord.describe(),
    controls: [
      { key: "arrivals", kind: "lines", label: "Arrivals", hint: "One per line: the words that land together on one cue. In the lead pattern the first line is the lead. Wrap the point, the words the sentence is about, in *asterisks*." },
      { key: "pattern", kind: "choice", label: "Pattern", hint: "Lead: the lead has the stage, makes room once while the rest join, and the point comes last. Cascade: every arrival takes its own step and shows where it rests.", options: options(["lead", "Lead"], ["cascade", "Cascade"]) },
      { key: "hit", kind: "choice", label: "Hit: the lead on the cut", hint: "Large lands as big as the safe area allows; small starts at 0.6 and is pushed in; plain is its own size. In code it also takes moves: a turn, a drop, a blur.", options: options(["large", "Large"], ["small", "Small"], ["plain", "Plain"]) },
      { key: "settle", kind: "choice", label: "Settle: how the hit is spent", hint: "Lead pattern. Falls to size at once; floats: falls a little past its size and comes back up; swapped: keeps its size and is cut to line size inside the room move.", options: options(["fall", "Falls"], ["float", "Floats back up"], ["swap", "Is swapped"]) },
      { key: "join", kind: "choice", label: "Join: how words come in", hint: "Slide, rise and drop show a word off its place and glide it in; pop appears in place; focus sharpens where it rests; fade suits a busy ground. In code, any direction.", options: options(["slide", "Slide"], ["rise", "Rise"], ["drop", "Drop"], ["pop", "Pop"], ["focus", "Focus"], ["fade", "Fade"]) },
      { key: "mark", kind: "choice", label: "Mark: how the point is singled out", hint: "A colour; coming into focus as it lands; flickering on; a second colour sweeping across during the hold. None is reported by the lead pattern's check.", options: options(["colour", "Colour"], ["focus", "Focus"], ["flicker", "Flicker"], ["sweep", "Sweep"], ["none", "None"]) },
      { key: "hold", kind: "choice", label: "Hold: while it is read", hint: "The finished line never sits still unless told to. Out eases back, so the landing, the hold and a receding exit read as one move.", options: options(["out", "Eases back"], ["in", "Pushes in"], ["left", "Drifts left"], ["right", "Drifts right"], ["up", "Drifts up"], ["down", "Drifts down"], ["still", "Holds still"]) },
      { key: "leave", kind: "choice", label: "Leave: how it goes", hint: "Recede and the four directions are still gaining speed on the last frame: the cut is on the movement. Cut holds the line. Shrink fades to nothing.", options: options(["recede", "Recede"], ["left", "Left"], ["right", "Right"], ["up", "Up"], ["down", "Down"], ["cut", "Cut"], ["shrink", "Shrink"]) },
      { key: "feel", kind: "choice", label: "Feel", hint: "The numbers the beats draw on, measured from films: snappy editorial shows words far off their place and glides long; pop and glide shows them almost in place.", options: options(["snappy", "Snappy editorial"], ["pop", "Pop and glide"]) },
      { ...tempoRange, hint: "With a tempo the lead is on the first beat and each arrival a whole beat later, whatever the tempo. Off, the feel spaces them." },
      { key: "duration", kind: "range", label: "Length", hint: "At the left end the length follows the content: reading time, the hold and the exit. Given a length, extra time goes to the hold, and the audit says when that is long.", min: 1, max: 6, step: 0.1, unit: "s", off: "Fits" },
      accentChoice("Cascade pattern: which arrival carries the sentence. First has the stage to itself and starts large; last is what the line builds to."),
      { key: "layout", kind: "choice", label: "The line (cascade pattern)", hint: "Recentre keeps what has arrived centred, stepping aside for each word. Anchored sets each word where it will rest.", options: options(["recentre", "Recentres"], ["anchored", "Is anchored"]) },
      { key: "ground", kind: "toggle", label: "A ground behind the words", hint: "Soft shapes. Lead: they share the lead's landing and the line's leaving, by depth. Cascade: they move a little on every arrival." },
      lookChoice,
      formatChoice,
    ],
    defaults: wordDefaults,
    presets: [
      { name: "The film's own", note: "The timing of the film the pattern was first measured on: the line drifts left while it is read and is thrown out to the left.", settings: { ...wordDefaults, hold: "left", leave: "left", duration: 1.7 } },
      { name: "Settles and floats", note: "The lead falls a little past its size and floats back up; words rise; the line lifts away.", settings: { ...wordDefaults, arrivals: "Know\nwhat you can spend\n*today.*", feel: "pop", bpm: 100, settle: "float", join: "rise", hold: "in", leave: "up" } },
      { name: "The point flickers on", note: "No size change: a plain lead, words popping on, and a point that flickers before it holds.", settings: { ...wordDefaults, arrivals: "And then\nthe lights\n*flicker* on.", feel: "pop", bpm: 109, hit: "plain", join: "pop", mark: "flicker", leave: "down" } },
      { name: "A colour sweeps the point", note: "The mark runs over the hold: a second colour crosses the point while the sentence is read.", settings: { ...wordDefaults, arrivals: "Time\nto\n*change* it.", bpm: 100, mark: "sweep", leave: "right", look: "veridian" } },
      { name: "A large word, swapped", note: "The lead keeps its size, then is cut to line size mid-move: a cut on the movement.", settings: { ...wordDefaults, arrivals: "Now\nit is *your turn*", feel: "pop", settle: "swap", hold: "in", leave: "up", duration: 2 } },
      { name: "Vertical, dark", note: "A tall stage in another look. The sentence wraps, so the lead starts in the middle and moves to its line.", settings: { ...wordDefaults, arrivals: "Meet\nagents that *ship*", look: "veridian", format: "tall" } },
      { name: "Cascade: three on the beat", note: "The other pattern. Three equals at 120 BPM: one word per beat where it rests, no accent.", settings: { ...wordDefaults, arrivals: "Plan.\nBuild.\nShip.", pattern: "cascade", accent: "none", bpm: 120, join: "focus", hold: "still", leave: "cut", duration: 3, ground: true } },
    ],
    build: (s) => {
      const pattern = s.pattern as "lead" | "cascade";
      const base = stage(s);
      const lead = pattern === "lead";
      return wordByWord({
        decisions: {
          width: base.width, height: base.height, look: base.look, tempo: base.tempo,
          durationSec: Number(s.duration) > 1 ? Number(s.duration) : "fit",
          pattern,
          feel: feels[s.feel as keyof typeof feels],
          hit: s.hit as "large" | "small" | "plain",
          join: s.join as "slide" | "rise" | "drop" | "pop" | "focus" | "fade",
          mark: s.mark as "colour" | "focus" | "flicker" | "sweep" | "none",
          hold: s.hold as "out" | "in" | "left" | "right" | "up" | "down" | "still",
          leave: s.leave as "recede" | "left" | "right" | "up" | "down" | "cut" | "shrink",
          ...(lead ? { settle: s.settle as "fall" | "float" | "swap", room: "whip" as const } : { accent: base.accent, layout: s.layout as "recentre" | "anchored" }),
        },
        slots: { arrivals: lines(String(s.arrivals)).map(arrival), ...(s.ground ? {} : { ambient: [] }) },
      });
    },
    code: (s) => {
      const pattern = s.pattern as "lead" | "cascade";
      const usual = patternDefaults[pattern];
      const beat = (key: keyof typeof usual) => [key, s[key] !== usual[key] && (pattern === "lead" || key !== "settle") ? quote(s[key]) : undefined] as [string, string | undefined];
      const decisions = object([
        ...stageCode(s, wordDefaults).filter(([k]) => k !== "accent" && k !== "durationSec"),
        ["durationSec", Number(s.duration) > 1 ? String(s.duration) : undefined],
        ["pattern", pattern !== "lead" ? quote(pattern) : undefined],
        ["feel", s.feel === "pop" ? "popAndGlide" : undefined],
        beat("hit"), beat("settle"), beat("join"), beat("mark"), beat("hold"), beat("leave"),
        ["accent", pattern === "cascade" && s.accent !== "last" ? quote(s.accent) : undefined],
        ["layout", pattern === "cascade" && s.layout !== "recentre" ? quote(s.layout) : undefined],
      ]);
      const arrivals = lines(String(s.arrivals)).map((l) => {
        const a = arrival(l);
        return typeof a === "string" ? quote(a) : `{ text: ${quote(a.text)}, key: ${quote(a.key)} }`;
      });
      const slots = `{ arrivals: [${arrivals.join(", ")}]${s.ground ? "" : ", ambient: []"} }`;
      const names = [s.feel === "pop" ? "popAndGlide" : "", s.look === "veridian" ? "veridianNoir" : "", "wordByWord"].filter(Boolean).join(", ");
      return `import { ${names} } from "motion-sdk";\n\nconst shot = wordByWord({\n${decisions ? `  decisions: ${decisions},\n` : ""}  slots: ${slots},\n});\n\nshot.audit(); // read it after every change: it names the beats still left to the defaults`;
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
