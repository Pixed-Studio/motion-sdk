---
name: motion-sdk
description: Design and build motion shots with motion-sdk. Use to design a shot beat by beat from a shipped atom, to compose one from the public pieces, or to join shots on one timeline; outputs HyperFrames HTML, Motionade operations or a Remotion component. The audit checks a shot's relations and promises without rendering.
---

# Build with motion-sdk

You design the shot. The SDK gives you the words a motion designer thinks in, solves what has one right answer and is tedious (setting type, placing cues, how far a line must travel so the finished sentence is centred, keeping frames a pure function of the frame number), and checks relations. Every movement is yours: its property, direction, amount, seconds and curve. The numbers measured from reference films are taste to draw on, not a choreography to reproduce.

A shot left on its defaults builds, and its audit says which beats you did not decide. Do not stop there: two briefs with the same defaults are the same film.

## Six questions, in this order

1. **Intent.** One sentence: what should the viewer come away with? Write it (`intent`). It sets how heavy everything else is.
2. **Roles.** Who is who to the eye, whatever it is made of. `lead` takes the eye first (impact, not meaning). `point` is what should be remembered. `link` joins them and must not compete. `prop` helps a principal act. `ground` is the backdrop. `camera` is the group that carries the whole picture. One principal at a time: first the lead, last the point.
3. **Beats.** What each moment is for, before how it moves: `prep`, `hit`, `settle`, `room`, `join`, `mark`, `hold`, `leave`, `handoff`. Beats overlap, repeat and can be left out.
4. **Moves.** A move is a property (`position`, `scale`, `rotation`, `opacity`, `blur`, `letterSpacing`, `color`), `from` and `to` (em from where it rests, or `unit: "stage"`), `sec`, `delay`, a `curve` and a `reason`. Layer several on one beat; `then` chains what follows; `via` passes through values.
5. **Feel.** Name the curve family and give it your seconds: `brake` (fastest as it shows, long stop), `launch` (faster all the way, cut before it stops), `whip` (still at both ends, fast between), `even`, `step`. Each takes a hardness: `brake(0.9)`. `snappyEditorial` and `popAndGlide` hold measured numbers; change one with `tuneFeel(feel, { room: { sec: 0.5 } })`.
6. **Relations.** The only thing checked. A pattern is a list of relations between roles and beats; none names a value, a direction, a curve or a property.

## Read first

1. `wordByWord.describe()` (or another shot's): the same six questions, then every decision with what a name does.
2. The JSDoc on what you are about to set, in `node_modules/@motion-sdk/core/src`. The types are the API; an unknown decision, slot or choice throws with the names it knows.
3. `shot.audit()` after every change: `findings`, and `measures` even when it passes.

## Design a shot from an atom

`wordByWord` is the lead pattern (领词让位): an opening that stresses one message. Its relations are all it fixes: the lead is `alone` when it hits; room is made `once`; the rest `joins` during that move; the point arrives `last` and is `marked`; the finished sentence is `composed` where it was declared; it leaves `whole`.

```ts
import { wordByWord, brake, launch } from "motion-sdk";

const shot = wordByWord({
  decisions: {
    intent: "Calm certainty: the number is known, and it is today's.",
    tempo: { bpm: 100 }, // arrivals a whole beat apart at any tempo; `step: 0.5` or `cueBeats: [0, 1, 1.5]` say otherwise
    hit: "large", // or { scale, from, blur }, or moves: [{ property: "rotation", from: -6, on: "lead" }]
    settle: { sec: 0.5, curve: brake(0.8), then: { property: "position", from: { y: 0.15 }, to: { y: 0 }, sec: 0.8 } },
    room: "whip", // the distance is solved; { sec, curve } or [{ property: "position", curve: "whip", sec: 0.6 }] is yours
    join: ({ arrival, count }) => ({ property: "position", from: arrival === count - 1 ? { y: 0.9 } : { x: 1.2 }, sec: 0.4, curve: "brake" }),
    mark: ["colour", { kind: "focus", sec: 0.4 }], // or "flicker", { kind: "sweep", color }, moves, a prop
    hold: { scale: 0.05, sec: 0.6 },
    leave: { to: { x: 1.6, y: -0.8 }, rotation: 3, sec: 0.35, curve: launch() }, // any direction
  },
  slots: {
    // `key` takes the words the sentence is about, as written, or true for the whole arrival. They are the point.
    arrivals: ["Know", "what you can spend", { text: "today.", key: true }],
    ambient: [], // the ground; `props: [{ id, shape, rides: 3 }]` are shapes that carry an arrival in, then let go
  },
});
const { ok, findings, measures } = shot.audit();
```

Each beat takes a name, a spec, moves, a mix in a list, or a function that returns moves; `extra` adds moves on anyone at any beat. A relation you mean to break is declared, never skipped: `relations: { marked: { none: "the film marks nothing here" } }`. So is a crop: `crop: { lead: "the cut lands inside the word" }`. The length follows the content unless you give `durationSec`.

`statementConverge` builds a short statement line by line while a world answers it and a mark arrives. `pattern: "cascade"` in `wordByWord` is for equals on a beat or a second line.

## Compose your own

The atoms are built from pieces you have. In `defineShot`'s `compose`: place content with `sentence`, `stack`, `group`, `place`, `guide`; time it with `createClock`, `solvePhrase`; move it with `move` (any moves on any object) and the pieces a beat needs: `enter` (join), `land` (hit and settle), `makeRoom` (room, with the solving), `drift` (hold), `leave`, `shareByDepth` (ground), `ride` (prop), `sweep` (a colour across a word), and `arrive`, `respond`, `keepUpright`, `recolorWhere`, `pass`, `focusPull`, `travel`. Then say who is who and what you claim:

```ts
score.cast("lead", ...leadWords); score.cast("point", ...pointWords); score.cast("link", ...others);
declarePattern(score, leadPattern); // the audit now holds your shot to the pattern's relations
```

A pattern is data (`{ name, intent, relations }`): write your own the same way. In `wordByWord`, `pattern` can be a function that brings the sentence on with these pieces while the shot keeps its hold, exit and reading.

## Join shots

```ts
const film = sequence([first, second], { joins: [{ overlapSec: 0.3, accept: { color: "the look changes with the cut" } }] });
film.audit(); // each shot against its own ground, plus what each join disagrees on (checkHandoff)
compileToHyperframes(film.ir); // one page, one timeline
```

## Rules

- State relations, not coordinates: em, shares of the stage, an angle and distance from a published region. Take ids from `score.id()`.
- Every movement carries its `reason`: purpose, beat, the cue it answers and which point of it sits on the cue.
- Transients are seconds; extra length goes to the hold. Frames are a pure function of the frame number.
- Declare what must stay true (a relation, an invariant) and break it once on purpose to see the finding.

## When you're done

- `audit().ok` is true, with no `undecided` note you did not mean, and you have read `measures.hold` (complete to leaving), `measures.reading` (clear seconds per word, what covered it) and `measures.answers`.
- You looked at frames: around each cue, the frame it shows, the hold, the last frame. The audit locates problems; it does not judge the picture.
- Report each command with its exit code and what you did not check. Playback at speed with sound is the person's.

## What is missing

- Motion blur: the IR has none, so a fast move is sharp on every frame. A blur move on the leave is a defocus, not a smear along the travel.
- Per-letter moves; gradient fills and a soft edge on a sweep; text in another face inside one sentence.
- Type is measured for Geist at weights 420 and 500 only (`look.type.metrics`); another family is set by estimate.
- One soundtrack per document (`score.audio`); no sound placed per cue.
