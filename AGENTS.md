<!-- Paste the snippet below into your project's root AGENTS.md. 将以下片段粘贴到你项目根目录的 AGENTS.md。 -->
## UI design rules (ANUI skill) / UI 设计规范

- Before any UI, component, styling or motion work, read `.agents/skills/anui/SKILL.md` (or the user-level `~/.agents/skills/anui/SKILL.md`). Then load the matching files under `references/` (Chinese) or `references/en/` (English) from its routing table.
  - 涉及界面、组件、样式、动效前，先读 `SKILL.md`，再按路由表加载 `references/`（中文）或 `references/en/`（英文）。
- Visual tokens follow `references/tokens.md`: light default `hc`, dark default `oled`. No hue except the functional red; emphasis uses inversion.
  - 视觉令牌以 tokens.md 为准：浅色默认 `hc`，深色默认 `oled`；除功能红外不用彩色，强调用反色。
- Motion uses only the spring presets in `references/motion-advanced.md` (press / snap / glide / settle / pop / sheet / fling / breathe) and respects `prefers-reduced-motion`.
  - 动效只用 8 个弹簧预设，并尊重减少动效设置。
- Hard rules: ≤4 font sizes and ≥12px; concentric radii; no "·" separators; no left colour-stripe cards; Enter-to-send has an IME guard; state comes from real events.
  - 硬性要求：字号 ≤4 种且 ≥12px；同心圆角；无 “·”；无左彩条卡片；Enter 发送带 IME 守卫；状态来自真实事件。
- Before finishing a UI task, run through `references/acceptance.md`: run `scripts/clip-audit.js` (`cut === 0`) on shadowed areas, check contrast with `scripts/contrast.py`, and provide hc / oled screenshots.
  - 交付前执行 acceptance.md：clip-audit `cut === 0`、contrast.py 校验、提供 hc / oled 截图。
