---
name: motion-sdk
description: Design and build motion shots with motion-sdk. Use to fill a shipped shot with new content, to change its rhythm, look or world, or to compose a new shot from behaviors; outputs HyperFrames HTML, Motionade operations or a Remotion component. The audit checks each shot against what it declared, without rendering.
---

# Build with motion-sdk

A shot is written as a designer would brief it: who is on stage and what each is to the viewer, which moments matter, what answers them, and what must stay true. Solvers work out frames and coordinates from that. You make the design decisions; the SDK never makes one silently.

## Read first

1. `statementConverge.describe()` (or any shot's `describe()`): its intent, its slots, every decision it leaves to you with what the default does, and what to reconsider when the content changes. Read it before you fill a slot.
2. The JSDoc on the option you are about to set. Each says when to choose which value. The types in `node_modules/@motion-sdk/core/src` are the API.
3. `shot.audit()` after every change, including its `measures` when it passes.

## Write the decisions before code

These are where shots go wrong. Decide each in a sentence first.

- **The accent.** Which arrival carries the weight? A statement that builds to its end: the last. A list of equals: none. More lines are never the same arrival repeated; past three, the early ones are a run-up.
- **Reading.** How long does each subject need, and when does the shot stop offering it? The default estimate is from length; a number or a name needs longer (`{ text, needsSec }`).
- **The pulse.** Is there music? Give `tempo` and the lines land on its grid. Marked audio or a reference: give `cueSeconds`. No pulse: leave both out.
- **Answers.** What moves on each arrival, and does it land on the cue (already moving, fastest on the cue) or launch from it? Use `respond` for both; `anticipate` is the choice.
- **Depth.** What is behind the subject, and what crosses in front? Nothing may sit over a line while it is being read.
- **The exit.** What carries attention out, where is it on the last frame, and how fast is it moving? That is `shot.handoff.exit`, and the next shot matches it.

## Pick your path

1. **Fill a shipped shot.** `statementConverge({ decisions, slots })`. Change copy, count, tempo, accent, duration, format, look, world, passes or mark. A slot you leave out keeps the shot's own content; an empty list means none.
2. **Compose a new shot.** `defineShot` with `slot.one` / `slot.many`, then in `compose`: place objects with `stack`, `group`, `place`, `guide`; time them with `createClock` and `solvePhrase`; move them with `arrive`, `respond`, `keepUpright`, `recolorWhere`, `pass`, `focusPull`, `travel`. Read how `statement-converge` is composed first: it is built from the same pieces you have.

When the same movement repeats across two shots and no behavior covers it, write one shaped like ours: it takes the score and the ids of objects that already exist, adds motion with a `reason`, and creates no content of its own. Keep a picture that belongs to one shot (a shader, a mark) in that shot's folder.

## Rules

- State relations, not coordinates. Place by angle and distance from a published region, by fractions of the stage, or on a host. Sizes are design units through `score.du()`.
- Take ids from `score.id()`. Two rings in one shot must not collide.
- Every motion block carries a `reason`: its purpose, the cues it answers, and which point of it sits on the cue.
- Declare what must stay true as an invariant, so the audit holds it when the content changes.
- Transients are in seconds and come from the feel. Extra duration goes to holds.
- Frames are a pure function of the frame number: no clocks, no measurement at run time, no randomness.

## When you're done

- `shot.audit().ok` is true, and you have read `measures.reading` (clear seconds per subject, and what covered it) and `measures.answers` (speed before and after each cue).
- You broke it on purpose: for each relation you added, a change that violates it makes the audit fail. An invariant no break can trip checks nothing.
- You looked at frames: just before and after each cue, the hold, and the last frame. The audit locates problems; it does not judge the picture.
- Report each command you ran with its exit code, and what you did not check. Playback at speed with sound is the person's.
