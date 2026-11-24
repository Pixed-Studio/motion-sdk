# Motion SDK (`motion-sdk` / `@motion-sdk/*`)

Behavior-first, multi-target **Motion SDK for AI agents** — inspired by [`@ui-sdk/core`](https://github.com/vercel-labs/ui).

Compose orthogonal **Motion Behaviors** and variable-cardinality **Slots** into a deterministic **Canonical Motion IR**, audit layout & pacing without screenshots, and output to Motionade, HyperFrames, or Remotion.

## Packages (Hybrid Monorepo)

| Package | Role | External Deps |
| :--- | :--- | :--- |
| [`motion-sdk`](./packages/motion-sdk) | **1-command Agent entry**: re-exports `@motion-sdk/core` + built-in zero-dep compilers (`motion-sdk/compile/*`) + bundled `SKILL.md` | **0** |
| [`@motion-sdk/core`](./packages/core) | Pure spacetime kernel, L1 motion behaviors, L2 slot primitives, and `audit()` semantic inspector | **0** |
| [`@motion-sdk/remotion`](./packages/remotion) | Isolated runtime `<MotionShot />` React component for live Remotion projects | `peerDependencies`: `react`, `remotion` |

## Quickstart

```bash
pnpm install
pnpm run typecheck
pnpm test
pnpm run build:examples
```

## Documentation

- **[`AGENTS.md`](./AGENTS.md)** — Monorepo package boundaries, core invariants, and agent workflow
- **[`docs/README.md`](./docs/README.md)** — Full documentation index:
  1. [Glean 0–3s Motionade MCP Primitives Baseline](./docs/01-glean-mcp-primitives.md)
  2. [From UI SDK to `@motion-sdk/core` Architecture Blueprint](./docs/02-ui-sdk-to-motion-sdk-blueprint.md)
  3. [Random Video Study: *Seismotion Manifiesto* 11 Motion Atoms](./docs/03-seismotion-motion-atoms-study.md)
  4. [Interactive Browser Playground](./docs/playground.html)
- **[`skills/motion-sdk/SKILL.md`](./skills/motion-sdk/SKILL.md)** — Bundled skill for AI coding agents
