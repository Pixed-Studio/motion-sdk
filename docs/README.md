# Motion SDK Documentation Index

本目录完整记录了 `@motion-sdk/core` 从**底层原语实证 → UI SDK 架构对齐 → 首个可复用分镜原语落地 → 随机成片原子切分验证**的完整设计与研究脉络。

---

## 文档目录（按演进顺序）

| 序号 | 文档 | 核心内容与作用 | 关联工程产物 |
| :-: | :--- | :--- | :--- |
| **01** | [01-glean-mcp-primitives.md](./01-glean-mcp-primitives.md) | **底层渲染原语基线（Assembly Layer）**<br>完整拆解《Enterprise Agent Workflows (0–3s)》重建项目的 81 次 MCP 调用链路、16 类共 138 条 `ProjectOperation`、自定义 SkSL 着色器与 191 行无删减 `textView` DSL，揭示为何直接让 LLM 手算底层坐标成本高且脆弱。 | [project_full.motionade.txt](../examples/glean-reference/project_full.motionade.txt)<br>[all_accepted_operations.json](../examples/glean-reference/all_accepted_operations.json) |
| **02** | [02-ui-sdk-to-motion-sdk-blueprint.md](./02-ui-sdk-to-motion-sdk-blueprint.md) | **UI SDK 对齐与 `@motion-sdk/core` 架构蓝图**<br>深度拆解 `vercel-labs/ui`（`@ui-sdk/core`）七层设计意图，建立 `L0 Kernel/IR → L1 Motion Behaviors → L2 Shot Primitives & Slots → L4 Multi-Target Adapters → L6 Agent Inspector` 逐层映射，并记录第 1 个分镜原语 `statement-converge` 的四变体 × 三端（Motionade / HyperFrames / Remotion）实测结果。 | [src/](../src/)<br>[tests/statement-converge.test.ts](../tests/statement-converge.test.ts)<br>[examples/out/](../examples/out/) |
| **03** | [03-seismotion-motion-atoms-study.md](./03-seismotion-motion-atoms-study.md) | **随机抽片实证：《Seismotion Manifiesto》全片 11 原子切分**<br>从 Motionimo 1,246 支视频中随机抽取 41.76 秒纯动态设计短片，按“单一编排意图 + 可变基数 Slots + 跨镜 `Handoff Contract`”切分为 11 个独立原子，验证跨片 L1 Behavior 复用率（已有 5 个 Behavior 命中 8 个分镜，仅需新增 7 个即可覆盖全片）。 | [atoms-manifest.json](../examples/seismotion-atoms/atoms-manifest.json)<br>[posters/](../examples/seismotion-atoms/posters/)<br>[clips/ (local)](../examples/seismotion-atoms/clips/) |
| **交互台** | [playground.html](./playground.html) | **实时求解与预览台（Standalone HTML）**<br>可在浏览器直接打开，实时切换 2 行 / 3 行 / 4 行 / 换品牌六边形徽标 60fps 预设，或自由输入任意行数文案验证排版盒、极坐标安全避让与布尔叠色效果。 | — |

---

## Agent 与开发者入口

- **仓库级 Agent 协作准则**：[../AGENTS.md](../AGENTS.md)
- **随包分发的 Motion SDK 使用技能**：[../skills/motion-sdk/SKILL.md](../skills/motion-sdk/SKILL.md)
