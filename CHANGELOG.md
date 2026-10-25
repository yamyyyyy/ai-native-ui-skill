# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [0.1.0] — 2026-10-25

首个公开版本。

### 新增
- `SKILL.md`（name: `anui`）与 `AGENTS.md` 片段，可安装到 Codex 的 `~/.agents/skills/anui/` 或项目 `.agents/skills/anui/`。
- 单色令牌体系：默认 `hc`（纯白高对比）与 `oled`（纯黑），可选 `oled-hc` / `paper` / `white` / `dark`；唯一彩色为功能红。
- 弹簧动效：8 个预设（press / snap / glide / settle / pop / sheet / fling / breathe），闭式求解 + CSS `linear()` 生成器。
- 中文排版：Geist + ANUI Sans SC（Noto Sans SC 子集，OFL 改名）+ Geist Mono，`text-autospace` / `text-spacing-trim` 规则。
- `demo/`：单页离线演示，Motion Lab、AI 专属动效、单色光效、层级、21 个 AI-native 组件；示例数据与视觉原创。
- `references/`：tokens、monochrome、motion-advanced、components、craft-rules、acceptance、sources。
- 自检：`npm run check`（Playwright：无 JS 错误、无网络、clip-audit `cut = 0`、字号白名单、APCA/WCAG 对比度）与 `npm run perf`（帧时序）。
- GitHub Pages 工作流，部署 `demo/`。
