# AGENTS.md

## Vision: Think Like a Motion Designer, Let Solvers Do the Math

When AI agents write low-level animation primitives directly, they burn context acting as fragile geometry calculators—hand-computing polar coordinates, Bezier tangents, and duplicated mask layers—and changing a 3-line headline to 2 or 4 lines breaks the whole layout. Traditional video templates solve stability by freezing structure, killing creative freedom.

`motion-sdk` bridges that gap by modeling what a human motion designer actually holds in mind: **choreographic intent, visual language, spatial composition & depth planes, musical rhythm & physical feel, and cross-shot momentum handoffs**. Agents author high-level intent and relationships; deterministic solvers compute exact coordinates and curves; lowering emits clean **Canonical Motion IR** that compiles natively to **Motionade**, **HyperFrames**, and **Remotion**.

## Core Design Principles (Anti-Template Litmus Test)

1. **Five-Axis Orthogonality**: **Content Slots** (`1..N` lines, shapes, parts), **Spatial Composition & Depth** (`stage/`: backdrop / midground / focal / foreground planes), **Rhythm** (`rhythm/`: clock, cues, phrases), **Feel** (`feel/`: transients named by the job they do) and **Motion Behaviors** (`behaviors/`) each live in their own module and know nothing of the others' content. Never hardcode element counts or pixel coordinates: state the relation (an angle and distance from a published region, a fraction of the stage, a seat on a host).
2. **Constraint-Driven Spatial Clearance**: Focal elements publish their bounds (`score.regions`), and what surrounds them is placed against those bounds, so the world makes room for whatever the statement becomes. A relation that must hold (`keepUpright`, a part resting on its host) is declared as an invariant and checked on every frame.
3. **Fixed Transients, Elastic Holds**: Scaling a shot from `3.0s@30fps` to `4.5s@60fps` keeps transient durations (they are seconds in the feel) and routes extra time into reading. When the time cannot hold what was asked, the solver says so with the numbers and a fix; it never squeezes silently.
4. **Editability-Preserving Lowering & Handoffs**: Lower choreography into C1 Bezier `FollowPath` guides and native vector masks, never per-frame baked keys. Every shot reports `handoff.entry` / `handoff.exit` (position, velocity, size, colour of what carries attention), and `checkHandoff` compares two shots at a join.
5. **Pure Seek-Safe Determinism**: Every frame evaluates purely as `f(frame)` with zero runtime clocks, live DOM measurements, or unseeded randomness.
6. **Decisions Belong to the Author**: A design decision (which arrival is the accent, how long a line needs, whether an answer lands on its cue) is an option with a documented default, never a constant inside a solver. Every motion block records its `reason`, and the audit checks the shot against what it declared. Its few fixed limits (text contrast, how much of a line may be covered, how far a peak may sit from its cue) are named constants at the top of `audit.ts`.

## Architecture & Package Boundaries

- `packages/core/` (`@motion-sdk/core`) — **Zero-dependency ES2023 engine** (no DOM, React, Remotion, or target-specific imports). Imports flow strictly downward:
  - `src/kernel/` — Canonical Motion IR with its score (`ir.ts`), the `Score` a shot is written on (`score.ts`), `defineShot` + `slot` (`shot.ts`), the evaluator and zero-screenshot `snapshot` (`evaluate.ts`), the audit (`audit.ts`), handoffs (`handoff.ts`), easing and geometry. The kernel knows no particular shot.
  - `src/rhythm/`, `src/feel/`, `src/look/`, `src/stage/` — one module per axis: `createClock` and `solvePhrase`; `Feel`; `Look` and materials; `stack`, `group`, `place`, `guide`.
  - `src/behaviors/` — Motion behaviors. Each attaches to objects that already exist and creates no content: `arrive`, `respond`, `keepUpright`, `recolorWhere`, `pass`, `focusPull`, `travel`.
  - `src/atoms/<name>/` — Shots composed from the above, with whatever belongs to that shot alone (its default content, a shader). `statement-converge` is the first; `word-by-word` is the second, fitted to a reference taken from the film library.
- `packages/motion-sdk/` (`motion-sdk`) — **Single-package entry for AI agents** (`npm i motion-sdk`): re-exports `@motion-sdk/core`, zero-dependency target compilers (`src/compile/{motionade,hyperframes,remotion}.ts`), and the shipped agent skill (`skills/motion-sdk/SKILL.md`).
- `packages/remotion/` (`@motion-sdk/remotion`) — **Isolated runtime adapter** (`peerDependencies: { react, remotion }`): live `<MotionShot />` and `getRemotionCompositionConfig()`.
- `apps/library/` (`@motion-sdk/library`, private) — **The library site**: Next.js, interface built with UI SDK (`@ui-sdk/react`; read `node_modules/@ui-sdk/react/docs/llms.txt` before touching it). It draws each atom live from `compileToHyperframes` and holds no choreography: an atom's page is described in `lib/atoms.ts` as controls that map to the shot's decisions and slots.
- `scripts/check-boundaries.ts` — Enforces zero external/DOM leaks in `@motion-sdk/core` and zero peer-dep bloat in `motion-sdk`.
- `examples/reference.ts` — Reads the project `/reconstruct` built (`examples/glean-reference/`) into a motion document. `tests/fidelity.test.ts` holds the atom's output to it.

## Working in This Repo

1. **Read design context first**: Start at [docs/README.md](docs/README.md) (`01` raw MCP primitive baseline, `02` UI SDK -> Motion SDK blueprint, `03` 11-atom segmentation & handoff study). They describe the v0.1 layout; the code is the current one.
2. **Fit the reference first, share second**: Build a new atom in its own folder, against a reference, until it matches. Move a movement into `behaviors/` when a second, different-looking shot needs it and it can attach to objects it did not create. Keep `compile/` and `remotion/` thin projection layers with zero choreography logic.
3. **Audit before pixels, then look**: Verify `shot.audit()` (`ok === true`) and read its `measures` before rendering. Then look at frames around each cue; the audit locates problems and does not judge the picture.
4. **Break it on purpose**: Every audit rule and every invariant has a test that violates it and expects the finding (`tests/audit-breaks.test.ts`).
5. **Align on public contracts**: Discuss with the founder before changing Canonical Motion IR semantics, public behavior/shot signatures, or package dependencies. Keep code concise, self-explanatory, and free of filler comments.

## Verification Gates

Run and check exit codes before calling a change done:

```bash
pnpm run typecheck         # Strict tsc --noEmit across workspaces and root
pnpm run check:boundaries  # Verify package isolation and zero-dep guarantees
pnpm test                  # Boundary checks + unit & invariant test suite
pnpm run build:examples    # Compile reference variants to Motionade, HyperFrames, and Remotion
```
