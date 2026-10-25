---
name: anui
description: ANUI（AI-Native UI）——为 Agent / Copilot / AI SaaS 设计、实现与审查界面的单色设计系统：OLED 纯黑 + 高对比纯白主题、弹簧动效、中文排版、AI 专属组件（思考轨迹、流式回答、工具调用、审批卡、任务行、输入框等）与自检脚本。在新建或打磨聊天/Agent 界面、选组件、定令牌、做动效、做 UI 验收时使用；普通营销页或纯后端任务不使用。
---

# ANUI — AI-Native UI（Mono + Motion）

单色体系：颜色不承担层级，**亮度、材质和运动**承担层级；唯一的彩色是功能红（危险/错误）。

## 何时使用
- 构建或重构 Agent、Copilot、AI SaaS 的工作台、聊天面板、工具调用流、人在回路审批；
- 实现 AI 专属组件：Thinking、Streaming Text、Tool Chips、Approval Card、Task Rows、Prompt Bar、Records/Diff Table、Insight Cards 等；
- 审查已有 AI 界面的精致度、动效、对比度、可访问性、阴影裁切、输入法问题。

## 按任务读取
| 任务 | 读取 |
| --- | --- |
| 建主题、配 Tailwind/shadcn、选颜色字号圆角 | `references/tokens.md`（实现：`demo/src/app.css`） |
| 黑白进阶：层级、材质、暗岛、对比度、主题切换、中文排版 | `references/monochrome.md` + `scripts/contrast.py` |
| 动效：弹簧预设、手势、AI 动效、光效、音效、性能、基础曲线 | `references/motion-advanced.md`（实现：`demo/spring.js`、`demo/presets.js`、`demo/motion.css`） |
| 实现某个组件 | `references/components.md`（对应小节）+ `references/motion-advanced.md` 附录 |
| 工程坑：阴影裁切、IME、滚动跟随、分栏、状态真实性 | `references/craft-rules.md` |
| 交付验收 | `references/acceptance.md` + `scripts/clip-audit.js`；本仓库自检 `npm run check` |
| 看效果 | `demo/index.html`（离线可用；`?theme=hc|oled|oled-hc|paper|white|dark`，`?rm` 模拟减少动效） |
| 来源与证据等级 | `references/sources.md` |

## 默认主题
- **浅色默认 `hc`（纯白底 + 纯黑字）；深色默认 `oled`（纯黑底）。** 同圆角、同 ring 逻辑、同字重档位、同一个红。
- 可选：`oled-hc`、`paper`（纸白）、`white`（纯白）、`dark`（近黑）。
- 无用户选择时：系统深色 → `oled`（同时 `prefers-contrast: more` → `oled-hc`），否则 → `hc`。

## 工作流
1. **探测项目**：读 `package.json`、全局 CSS、组件目录。已有设计系统（shadcn / AntD / 自有 tokens）→ 只把 tokens.md 的变量映射进去（tokens.md §8），**不引入第二套组件库**。新项目 → 默认 React + Tailwind v4 + shadcn/Radix + `motion`。
2. **落令牌**：参照 `demo/src/app.css` 的主题块与 `@theme` 映射（tokens.md §3–§4）；字体 Geist + 中文字体（ANUI Sans SC 或系统 PingFang/雅黑）+ Geist Mono。
3. **先状态机后视觉**：每个组件写清状态（draft / queued / running / awaiting-approval / done / failed / aborted），由真实事件驱动。
4. **按 components.md 实现**，并执行每节末尾的“DAU 修正”；动效只用 motion-advanced.md §2 的 8 个弹簧预设或其 CSS `linear()` 版本。
5. **验收**：跑 acceptance.md；有阴影的区域运行 clip-audit（默认 / hover / 展开 / 动效终态）直到 `cut === 0`；`contrast.py` 全部通过；截图 `hc` + `oled`。

## 优先级
1. 用户明确要求 > 项目已有设计系统 > 本 Skill 视觉令牌；
2. 工艺规则（craft-rules.md、acceptance.md）始终适用；
3. 组件规格中来自上游的原始尺寸与本 Skill 冲突时，以 tokens.md 为准。

## 硬性禁令（速查）
- 不用计时器或假动画伪造 Agent 进度；
- 字号不超过 4 种、不小于 12px（12 / 13 / 14 / 20）；
- 不用 “·” 分隔；不加解释性副标题；不做左边缘彩条卡片；
- 除功能红外不引入彩色；强调 = 反色；
- 浮层（菜单、预览、选中操作条）不放在 `overflow:hidden` 容器里 → portal；
- Enter 发送必须有 IME 守卫；尊重 `prefers-reduced-motion`；
- 不全局隐藏滚动条、不全局 `overflow: visible`。

## 许可
本 Skill MIT（© 2026 yamyyyyy）。组件模式受 beautiful-ui（MIT，Shane Levine）启发，工艺规则与 `scripts/clip-audit.js` 来自 desktop-agent-ui（MIT）；字体为 SIL OFL 1.1。详见 `THIRD_PARTY_LICENSES.md`。
