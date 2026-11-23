---
name: motion-sdk
description: Composes non-templated, layout-adaptive motion shots with @motion-sdk/core and compiles them to Motionade DSL/operations, HyperFrames HTML, or Remotion React TSX. Covers choosing or combining L1 motion behaviors (beat grids, kinetic typography stacks, pulsed orbital fields, parallax bokeh, focus-pull handoffs, C1 Bezier emblem convergence with boolean color-shift masks), defining custom shot primitives with variable-cardinality slots, and running zero-screenshot semantic audits via snapshot() and audit().
---

# Build with `@motion-sdk/core`

`@motion-sdk/core` is a headless library of **motion behaviors** modeled after `@ui-sdk/core`. Instead of hardcoding pixel coordinates, fixed line counts, or engine-specific keyframes, you compose intent-level behaviors into **shot primitives** with variable-cardinality **slots**, inspect them mathematically via `snapshot()` / `audit()`, and project the Canonical Motion IR to **Motionade**, **HyperFrames**, or **Remotion**.

## Pick your path

1. **Use an existing shot primitive** (like `statementConverge`): pass `options` (`theme`, `durationSec`, `fps`) and `slots` (`headlineLines` with 2, 3, or 4+ lines, optional custom `orbitItems` or `emblemHost`/`emblemParts`).
2. **Compose a bespoke shot primitive** when no built-in archetype fits: call `defineShotPrimitive` and wire together L1 behaviors from `@motion-sdk/core/behaviors` (`createBeatGrid`, `createKineticStack`, `createPulsedOrbit`, `createChevronRibbon`, `createParallaxBokeh`, `createFocusPull`, `createConvergeEmblem`).

## Non-negotiable rules

- **Never hardcode line counts or magic pixel coordinates.** Always measure focal regions via `createKineticStack` and pass `focalBounds` into surrounding spatial behaviors (`createPulsedOrbit`, `createChevronRibbon`).
- **Keep transients crisp when stretching duration.** Use `createBeatGrid` so moving from `3s@30fps` to `4.5s@60fps` preserves physical snap and allocates extra seconds to reading holds.
- **Declare color-overlap intent, never manual mask clones.** Set `insideHostFill` and `pairwiseOverlaps` on `createConvergeEmblem`; let the behavior lower them to synchronized vector masks / SVG `<clipPath>`.
- **Audit before rendering pixels.** Every task MUST run `const report = shot.audit()` and verify `report.ok === true` (WCAG 4.5:1 contrast, safe margins, focal clearance, mask sync, and timeline liveness) before invoking visual frame renders.
