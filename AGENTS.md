# AGENTS.md

> Draft v0.1 — intentionally concise. Keep rules minimal and grounded in code; we will refine contracts iteratively as more primitives land.

## Purpose

`@motion-sdk/core` is a behavior-first, target-agnostic **Motion SDK for AI agents** (inspired by `@ui-sdk/core`). Instead of forcing agents to hand-calculate raw keyframes or lock into rigid templates, agents compose reusable **L1 Motion Behaviors** and variable-cardinality **Slots** into **Canonical Motion IR**, validate choreography mathematically without screenshots, and compile to **Motionade**, **HyperFrames (HTML/GSAP)**, and **Remotion (React TSX)**.

## Repository Layout

- `src/kernel/` — Canonical Motion IR (`ir.ts`), brand/feel tokens (`tokens.ts`), deterministic geometry & Bezier solvers (`geometry.ts`), `defineShotPrimitive` + `slot` (`primitive.ts`), and zero-screenshot semantic inspector (`inspect.ts`).
- `src/behaviors/` — Orthogonal L1 motion behaviors (`createBeatGrid`, `createKineticStack`, `createChevronRibbon`, `createPulsedOrbit`, `createParallaxBokeh`, `createFocusPull`, `createConvergeEmblem`).
- `src/primitives/` — Reusable L2 shot primitives composed from L1 behaviors + slots (`statement-converge.ts`).
- `src/adapters/` — Thin, logic-free target compilers (`motionade.ts`, `hyperframes.ts`, `remotion.ts`).
- `skills/motion-sdk/SKILL.md` — Agent skill instructions shipped with the SDK.
- `docs/` — Design history, architecture alignment, and motion-atom case studies (start at [`docs/README.md`](./docs/README.md)).
- `tests/` & `examples/` — Automated tests and multi-target example outputs.

## Core Invariants

1. **Determinism & Seek-Safety**: Every motion block must evaluate purely as `f(frame)` with zero runtime clocks, DOM measurements, or unseeded randomness.
2. **No Hardcoded Cardinality**: Behaviors and primitives must adapt dynamically to collection slot counts (`1..N` text lines, orbit items, cards, steps) and propagate spatial bounds (`focalBounds`) to neighboring layers.
3. **Fixed Transients, Elastic Holds**: When duration or FPS scales (e.g., `3.0s@30fps` -> `4.5s@60fps`), keep physical transient durations crisp and allocate extra time to reading/settle holds via `createBeatGrid`.
4. **Thin Adapters Only**: Put choreography, layout math, and mask lowering in `kernel/` or `behaviors/`, never inside `adapters/`.
5. **Audit Before Pixels**: Run `shot.audit()` (`ok === true`, 0 findings) before invoking visual renders.

## Commands

```bash
npm run typecheck       # tsc --noEmit (must be 0 errors)
npm test                # Node test runner across tests/*.test.ts
npm run build:examples  # Compile all reference variants to Motionade, HyperFrames, and Remotion
```
