import { veridianNoir, wordByWord, type Shot } from "motion-sdk";

/** One atom, several briefs. Each changes what a designer would change and restates nothing else. */
export const wordByWordVariants: { slug: string; component: string; title: string; brief: string; shot: Shot }[] = [
  {
    slug: "w1-lead-and-rest",
    component: "LeadAndRest",
    title: "A lead word, then the rest",
    brief:
      "The reference's sentence and timing: the lead word has the stage for half a second, then the rest joins two frames apart. " +
      "The words the sentence is about are marked as key.",
    shot: wordByWord({
      id: "lead_and_rest",
      name: "A lead word, then the rest",
      decisions: { accent: "first", durationSec: 1.7, cueSeconds: [0, 0.567] },
      slots: { arrivals: ["Into", { text: "a complete floor\u00a0plan", key: "floor plan", needsSec: 0.85 }], ambient: [] },
    }),
  },
  {
    slug: "w2-three-on-the-beat",
    component: "ThreeOnTheBeat",
    title: "Three words on the beat",
    brief: "Three equals at 120 BPM: one word per beat, no accent, the ground answering each.",
    shot: wordByWord({
      id: "three_on_the_beat",
      name: "Three words on the beat",
      decisions: { tempo: { bpm: 120 }, accent: "none" },
      slots: { arrivals: ["Plan.", "Build.", "Ship."] },
    }),
  },
  {
    slug: "w3-five-build-to-the-point",
    component: "FiveBuildToThePoint",
    title: "Five words that build to their point",
    brief: "Two more words and no tempo. The accent stays last: four arrivals run up and the point lands, held, in the key colour.",
    shot: wordByWord({
      id: "five_build",
      name: "Five words that build",
      decisions: { durationSec: 3.4 },
      slots: { arrivals: ["Plan,", "build,", "test,", "ship", { text: "together.", key: "together." }] },
    }),
  },
  {
    slug: "w4-two-lines-rise-and-leave",
    component: "TwoLinesRise",
    title: "A longer sentence, rising, that leaves",
    brief: "A sentence too long for one line, in three breaths. Words rise into place, the phrase wraps, and it falls back at the end.",
    shot: wordByWord({
      id: "two_lines_rise",
      name: "A longer sentence",
      decisions: { durationSec: 4.2, enter: "rise", exit: "shrink" },
      slots: { arrivals: ["We want you", "to express yourself", { text: "your way.", key: "your way." }] },
    }),
  },
  {
    slug: "w5-vertical-veridian-60fps",
    component: "VerticalVeridianWords",
    title: "Vertical, another look, 60 fps",
    brief: "1080×1920 at 60 fps in a dark look, left-aligned and anchored: the words appear where they rest.",
    shot: wordByWord({
      id: "vertical_words",
      name: "Vertical words",
      decisions: { width: 1080, height: 1920, fps: 60, durationSec: 3.6, look: veridianNoir, accent: "first", align: "left", size: 0.062, maxLines: 3 },
      slots: { arrivals: ["Meet", { text: "agents that ship", key: "ship" }, "while you sleep."] },
    }),
  },
];

export const variants: Record<string, Shot> = Object.fromEntries(wordByWordVariants.map((v) => [v.slug, v.shot]));
