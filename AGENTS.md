<!-- 将以下片段粘贴到你项目根目录的 AGENTS.md -->
## UI 设计规范（ANUI Skill）

- 涉及任何界面、组件、样式、动效工作前，先读取 `.agents/skills/anui/SKILL.md`（或用户级 `~/.agents/skills/anui/SKILL.md`），按其“按任务读取”表加载 `references/` 下对应文件。
- 视觉令牌以 `references/tokens.md` 为准：浅色默认 `hc`，深色默认 `oled`；除功能红外不用彩色，强调用反色。
- 动效只用 `references/motion-advanced.md` 的弹簧预设（press / snap / glide / settle / pop / sheet / fling / breathe），并尊重 `prefers-reduced-motion`。
- 硬性要求：字号 ≤4 种且 ≥12px；同心圆角；无 “·” 分隔符；无左彩条卡片；Enter 发送带 IME 守卫；状态来自真实事件。
- 完成 UI 任务前执行 `references/acceptance.md`：有阴影时运行 `scripts/clip-audit.js` 确认 `cut === 0`，对比度用 `scripts/contrast.py` 校验，并提供 hc / oled 截图。
