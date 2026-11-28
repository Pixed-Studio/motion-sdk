import { brake, launch, popAndGlide, veridianNoir, wordByWord, type Shot } from "motion-sdk";

/** One atom, several briefs. Each decides its beats for its own sentence; none is the atom's default design. */
export const wordByWordVariants: { slug: string; component: string; title: string; brief: string; shot: Shot }[] = [
  {
    slug: "w1-lead-and-rest",
    component: "LeadAndRest",
    title: "A lead word, then the rest",
    brief:
      "The lead pattern with the timing of the film it was first measured on: the lead lands large on the cut, makes room in one move, " +
      "and three words join it two frames apart. The line drifts left while it is read and is thrown out to the left.",
    shot: wordByWord({
      id: "lead_and_rest",
      name: "A lead word, then the rest",
      decisions: {
        durationSec: 1.7, cueSeconds: [0, 17 / 30],
        intent: "Say what the sketch becomes: the result is the floor plan.",
        hit: "large", settle: "fall", room: "whip", join: "slide", mark: "colour", hold: "left", leave: "left",
      },
      slots: { arrivals: ["Into", { text: "a complete floor plan", key: "floor plan", needsSec: 0.85 }], ambient: [] },
    }),
  },
  {
    slug: "w2-settles-and-floats",
    component: "SettlesAndFloats",
    title: "The lead settles, then floats back up",
    brief:
      "An opening that stresses one message, at 100 BPM. The lead falls a little past its size and floats back up; the words rise into the " +
      "line a whole beat apart; the point is the one colour; the line lifts into the cut. The length follows the content.",
    shot: wordByWord({
      id: "settles_and_floats",
      name: "Settles and floats",
      decisions: {
        feel: popAndGlide, tempo: { bpm: 100 },
        intent: "Calm certainty: the number is known, and it is today's.",
        hit: "large", settle: { kind: "float", dip: 0.07, floatSec: 0.9 }, room: "whip", join: "rise", mark: "colour",
        hold: { scale: 0.05, sec: 0.6 }, leave: { to: { y: -0.9 }, sec: 0.4, curve: launch(0.4) },
      },
      slots: { arrivals: ["Know", "what you can spend", { text: "today.", key: true }] },
    }),
  },
  {
    slug: "w3-point-flickers-on",
    component: "PointFlickersOn",
    title: "No size change; the point flickers on",
    brief: "A plain lead, words popping on in place, and a point that flickers before it holds, acting out the word. It drops out of frame.",
    shot: wordByWord({
      id: "point_flickers_on",
      name: "The point flickers on",
      decisions: {
        feel: popAndGlide, tempo: { bpm: 109 },
        intent: "Turn the film: the light is about to come on.",
        hit: "plain", settle: "fall", room: "whip", join: "pop", mark: "flicker", hold: "in", leave: "down",
      },
      slots: { arrivals: ["And then", "the lights", { text: "flicker on.", key: "flicker" }] },
    }),
  },
  {
    slug: "w4-large-word-swapped",
    component: "LargeWordSwapped",
    title: "A large word, swapped for its line",
    brief: "The lead keeps its size for a beat and is cut to the line-size word inside the fastest step of its move: a cut on the movement.",
    shot: wordByWord({
      id: "large_word_swapped",
      name: "A large word, swapped",
      decisions: {
        feel: popAndGlide, cueSeconds: [0, 0.6], durationSec: 2,
        intent: "Close by turning to the viewer.",
        hit: "large", settle: "swap", room: "whip", join: "slide", mark: "colour", hold: "in", leave: "up",
      },
      slots: { arrivals: ["Now", { text: "it is your turn", key: "your turn" }] },
    }),
  },
  {
    slug: "w5-vertical-veridian-60fps",
    component: "VerticalVeridianWords",
    title: "Vertical, another look, 60 fps",
    brief: "1080×1920 at 60 fps in a dark look. The sentence wraps, so the lead starts in the middle of the stage and moves to its line.",
    shot: wordByWord({
      id: "vertical_words",
      name: "Vertical words",
      decisions: {
        width: 1080, height: 1920, fps: 60, look: veridianNoir,
        intent: "Introduce the product by what it does.",
        hit: "large", settle: "fall", room: "glide", join: "drop", mark: ["colour", "focus"], hold: "up", leave: "up",
      },
      slots: { arrivals: ["Meet", { text: "agents that ship", key: "ship" }] },
    }),
  },
  {
    slug: "w6-moves-written-out",
    component: "MovesWrittenOut",
    title: "Every beat written as moves",
    brief:
      "Nothing named: the lead drops in turned and small, the room move is the author's curve and seconds, each arrival joins its own way, " +
      "the point changes colour as it lands, and the line leaves up and to the right, turning.",
    shot: wordByWord({
      id: "moves_written_out",
      name: "Moves written out",
      decisions: {
        tempo: { bpm: 96 },
        intent: "Make the release feel light: things fall into place.",
        hit: [{ property: "scale", from: 0.6 }, { property: "rotation", from: -6, on: "lead" }, { property: "position", from: { y: -1.4 }, on: "lead", reason: "It drops in from above." }],
        settle: { sec: 0.45, curve: brake(0.8) },
        room: [{ property: "position", curve: "whip" }],
        join: ({ arrival, count }) => ({ property: "position", from: arrival === count - 1 ? { y: 0.9 } : { y: -0.6 }, sec: 0.4, curve: "brake" }),
        mark: { property: "color", to: "#C2410C", sec: 0.4, reason: "The point warms as it lands." },
        hold: { property: "rotation", to: -1 },
        leave: { to: { x: 1.6, y: -1 }, rotation: 4, sec: 0.35, curve: "launch" },
      },
      slots: { arrivals: ["Then", "it all", { text: "clicks.", key: true }], ambient: [] },
    }),
  },
  {
    slug: "w7-cascade-three-on-the-beat",
    component: "ThreeOnTheBeat",
    title: "Cascade: three words on the beat",
    brief: "The other pattern. Three equals at 120 BPM: one word per beat where it rests, no accent, the ground answering each.",
    shot: wordByWord({
      id: "three_on_the_beat",
      name: "Three words on the beat",
      decisions: { pattern: "cascade", tempo: { bpm: 120 }, accent: "none", intent: "Three equal steps, on the beat.", hit: "plain", join: "focus", mark: "none", hold: "still", leave: "cut" },
      slots: { arrivals: ["Plan.", "Build.", "Ship."] },
    }),
  },
  {
    slug: "w8-cascade-second-line",
    component: "SecondLine",
    title: "Cascade: a second line that takes over a whip",
    brief: "A line that follows a lead line: it pushes in from the right on the speed the first left with, its words rise where they rest, and it falls back.",
    shot: wordByWord({
      id: "second_line",
      name: "A second line",
      decisions: {
        pattern: "cascade", layout: "anchored", accent: "none", entry: "push", durationSec: 2.2, cueSeconds: [0, 0.3],
        intent: "Finish the thought the line before started.",
        hit: "plain", join: "rise", mark: "colour", hold: "still", leave: "recede",
      },
      slots: { arrivals: ["while you", { text: "sleep.", key: "sleep." }] },
    }),
  },
];

export const variants: Record<string, Shot> = Object.fromEntries(wordByWordVariants.map((v) => [v.slug, v.shot]));
