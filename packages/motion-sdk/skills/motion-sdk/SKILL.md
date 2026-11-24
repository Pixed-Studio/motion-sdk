---
name: motion-sdk
description: Composes non-templated, layout-adaptive motion shots with motion-sdk (@motion-sdk/core) and outputs to Motionade DSL/operations, HyperFrames HTML, or Remotion React (via zero-dep codegen or @motion-sdk/remotion <MotionShot /> runtime). Covers combining L1 motion behaviors, defining custom shot primitives with variable-cardinality slots, and running zero-screenshot semantic audits via snapshot() and audit().
---

# Build with `motion-sdk`

`motion-sdk` is a behavior-first Motion SDK modeled after `@ui-sdk/core`.

## Packages

- **Default (1-package zero-dep entry):** Install `motion-sdk`. It re-exports all `@motion-sdk/core` behaviors/primitives and includes zero-dependency compilers under `motion-sdk/compile/{motionade,hyperframes,remotion}`.
- **Live Remotion runtime component:** Install `@motion-sdk/remotion` in a Remotion app to render `<MotionShot shot={shot} />` directly via `useCurrentFrame()` without intermediate `.tsx` codegen.
- **Custom third-party adapters:** Depend only on `@motion-sdk/core` (0 dependencies, pure Canonical Motion IR).

## Pick your path

1. **Use a built-in shot primitive** (`statementConverge` from `motion-sdk`): pass `options` (`theme`, `durationSec`, `fps`) and variable-cardinality `slots` (`headlineLines` with 2, 3, or 4+ lines, optional `orbitItems`, `emblemHost`, `emblemParts`, `overlapRules`).
2. **Compose a bespoke shot primitive** (`defineShotPrimitive` + `slot`): wire L1 behaviors from `motion-sdk/behaviors` (`createBeatGrid`, `createKineticStack`, `createPulsedOrbit`, `createChevronRibbon`, `createParallaxBokeh`, `createFocusPull`, `createConvergeEmblem`).

## Non-negotiable rules

- **Never hardcode line counts or magic pixel coordinates.** Measure focal regions via `createKineticStack` and pass `focalBounds` into spatial behaviors (`createPulsedOrbit`, `createChevronRibbon`).
- **Keep transients crisp when stretching duration.** Use `createBeatGrid` so scaling from `3s@30fps` to `4.5s@60fps` preserves physical snap and allocates extra time to reading holds.
- **Declare color-overlap intent, never manual mask clones.** Set `insideHostFill` and `pairwiseOverlaps` on `createConvergeEmblem`.
- **Audit before rendering pixels.** Always run `const report = shot.audit()` and require `report.ok === true` (0 findings) before invoking visual frame renders.
