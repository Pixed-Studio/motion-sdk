# AGENTS.md

## Vision: Think Like a Motion Designer, Let Solvers Do the Math

When AI agents write low-level animation primitives directly, they burn context acting as fragile geometry calculators—hand-computing polar coordinates, Bezier tangents, and duplicated mask layers—and changing a 3-line headline to 2 or 4 lines breaks the whole layout. Traditional video templates solve stability by freezing structure, killing creative freedom.

`motion-sdk` bridges that gap by modeling what a human motion designer actually holds in mind: **choreographic intent, visual language, spatial composition & depth planes, musical rhythm & physical feel, and cross-shot momentum handoffs**. Agents author high-level intent and relationships; deterministic solvers compute exact coordinates and curves; lowering emits clean **Canonical Motion IR** that compiles natively to **Motionade**, **HyperFrames**, and **Remotion**.

## Core Design Principles (Anti-Template Litmus Test)

1. **Five-Axis Orthogonality**: Keep **Content Slots** (`1..N` lines, cards, steps, emblem parts), **Spatial Composition & Depth** (backdrop / midground / focal / foreground planes), **Rhythm** (beat grids), **Feel** (physical transient presets), and **Motion Behaviors** decoupled. Never hardcode element counts or magic pixel coordinates.
2. **Constraint-Driven Spatial Clearance**: Focal elements measure and publish their bounding regions (`focalBounds`) so surrounding layers (orbital rings, ribbons, HUD props) automatically adapt clearance, font scale, and lighting locks (`worldLockedLighting`).
3. **Fixed Transients, Elastic Holds**: Scaling a shot from `3.0s@30fps` to `4.5s@60fps` must keep physical transient durations crisp and route extra time into reading/settle holds via `createBeatGrid`—never sluggishly stretching motion.
4. **Editability-Preserving Lowering & Handoffs**: Lower high-level choreography (spiral convergence, region color shifts, boolean intersections) into clean C1 Bezier `FollowPath` guides and native vector masks rather than per-frame baked keyframes, so exported scenes remain human-editable in Studio and code. Shot primitives expose `entryHandoff` / `exitHandoff` anchors (position, velocity, dominant color) to chain shots seamlessly.
5. **Pure Seek-Safe Determinism**: Every frame evaluates purely as `f(frame)` with zero runtime clocks, live DOM measurements, or unseeded randomness.

## Architecture & Package Boundaries

- `packages/core/` (`@motion-sdk/core`) — **Zero-dependency ES2023 engine** (no DOM, React, Remotion, or target-specific imports). Imports flow strictly downward:
  - `src/kernel/` — Canonical Motion IR (`ir.ts`), visual/feel tokens (`tokens.ts`), geometry & Bezier solvers (`geometry.ts`), `defineShotPrimitive` + `slot` (`primitive.ts`), and zero-screenshot semantic inspector (`inspect.ts`).
  - `src/behaviors/` — Composable L1 motion behaviors (`createBeatGrid`, `createKineticStack`, `createChevronRibbon`, `createPulsedOrbit`, `createParallaxBokeh`, `createFocusPull`, `createConvergeEmblem`).
  - `src/primitives/` — Reusable L2 shot primitives assembled from L1 behaviors + variable-cardinality slots (`statement-converge.ts`).
- `packages/motion-sdk/` (`motion-sdk`) — **Single-package entry for AI agents** (`npm i motion-sdk`): re-exports `@motion-sdk/core`, zero-dependency target compilers (`src/compile/{motionade,hyperframes,remotion}.ts`), and the shipped agent skill (`skills/motion-sdk/SKILL.md`).
- `packages/remotion/` (`@motion-sdk/remotion`) — **Isolated runtime adapter** (`peerDependencies: { react, remotion }`): live `<MotionShot />` and `getRemotionCompositionConfig()`.
- `scripts/check-boundaries.ts` — Enforces zero external/DOM leaks in `@motion-sdk/core` and zero peer-dep bloat in `motion-sdk`.

## Working in This Repo

1. **Read design context first**: Start at [docs/README.md](docs/README.md) (`01` raw MCP primitive baseline, `02` UI SDK -> Motion SDK blueprint, `03` 11-atom segmentation & handoff study).
2. **Extract L1 before building L2**: When authoring a new shot atom, factor reusable spatial/kinematic rules into `packages/core/src/behaviors/` first so other shots can recombine them; keep `compile/` and `remotion/` thin projection layers with zero choreography logic.
3. **Audit before pixels**: Always verify `shot.audit()` (`ok === true`, zero findings on WCAG contrast, safe margins, focal clearance, mask sync, and timeline liveness) before invoking visual frame renders.
4. **Align on public contracts**: Discuss with the founder before changing Canonical Motion IR semantics, public behavior/primitive signatures, or package dependencies. Keep code concise, self-explanatory, and free of filler comments.

## Verification Gates

Run and check exit codes before calling a change done:

```bash
pnpm run typecheck         # Strict tsc --noEmit across workspaces and root
pnpm run check:boundaries  # Verify package isolation and zero-dep guarantees
pnpm test                  # Boundary checks + unit & invariant test suite
pnpm run build:examples    # Compile reference variants to Motionade, HyperFrames, and Remotion
```
