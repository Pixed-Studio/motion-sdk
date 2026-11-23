# `@motion-sdk/core`

Behavior-first, multi-target **Motion SDK for AI agents** — inspired by [`@ui-sdk/core`](https://github.com/vercel-labs/ui).

Compose orthogonal **Motion Behaviors** and variable-cardinality **Slots** into a deterministic **Canonical Motion IR**, audit layout & pacing without screenshots, and compile to:

- **Motionade** (`ProjectOperation[]` JSON + `textView` DSL + SkSL)
- **HyperFrames** (standalone deterministic HTML + SVG `<clipPath>` + paused GSAP timeline)
- **Remotion** (pure functional React TSX component)

## Quickstart

```bash
npm install
npm run typecheck
npm test
npm run build:examples
```

## Documentation

- **[`AGENTS.md`](./AGENTS.md)** — Repository structure, core invariants, and agent workflow
- **[`docs/README.md`](./docs/README.md)** — Full documentation index:
  1. [Glean 0–3s Motionade MCP Primitives Baseline](./docs/01-glean-mcp-primitives.md)
  2. [From UI SDK to `@motion-sdk/core` Architecture Blueprint](./docs/02-ui-sdk-to-motion-sdk-blueprint.md)
  3. [Random Video Study: *Seismotion Manifiesto* 11 Motion Atoms](./docs/03-seismotion-motion-atoms-study.md)
  4. [Interactive Browser Playground](./docs/playground.html)
- **[`skills/motion-sdk/SKILL.md`](./skills/motion-sdk/SKILL.md)** — Bundled skill for AI coding agents
