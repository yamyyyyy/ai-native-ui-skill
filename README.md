# ANUI — AI-Native UI Skill

**简体中文** · [English](README.en.md)

> 给 Codex 用的 AI 应用界面设计 Skill：**黑白单色 + 弹簧动效 + 中文排版 + AI 专属组件 + 自检脚本**。

<p align="center">
  <img src="docs/media/hero.gif" alt="ANUI demo：Motion Lab 与 AI 动效（OLED 主题）" width="720">
</p>

**在线演示**：https://yamyyyyy.github.io/ai-native-ui-skill/ （部署后可用）；完整录屏：[`docs/media/preview.mp4`](docs/media/preview.mp4)

| OLED（深色默认） | 高对比 HC（浅色默认） |
|---|---|
| ![OLED](docs/media/shot-top-oled.png) | ![HC](docs/media/shot-top-hc.png) |

![AI 专属动效（OLED）](docs/media/shot-ai-oled.png)

## 它是什么

ANUI 是一套写给编码 Agent 读的设计系统。装进 Codex 后，Agent 在做聊天面板、Agent 工作台、工具调用流、审批卡时，会按这里的令牌、动效和工艺规则来实现，并用脚本自检。

- **OLED / HC 单色**：浅色默认纯白高对比 `hc`，深色默认纯黑 `oled`，另有 `oled-hc`、`paper`、`white`、`dark`。颜色不承担层级，唯一的彩色是功能红；强调靠反色。对比度按 APCA + WCAG 反推并脚本校验。
- **弹簧动效**：8 个预设（press / snap / glide / settle / pop / sheet / fling / breathe），用 Apple 式 duration + bounce 定义，闭式求解并生成 CSS `linear()`；可打断、进出不对称、尊重减少动效。
- **中文排版**：Geist + ANUI Sans SC（Noto Sans SC 子集）+ Geist Mono；`text-autospace`、`text-spacing-trim`、`line-break: strict`，深色/高对比字重补偿。
- **AI-native 组件**：思考轨迹、流式回答、工具调用 chip、审批卡、任务行、Prompt Bar（IME 守卫）、Diff / Records 表格、洞察卡等 21 个，另有 AI 专属动效（思考呼吸、流式前沿、工具进度、在场感）。
- **自检脚本**：`npm run check` 用 Playwright 打开 demo 的 6 个主题，检查 JS 错误、外部请求、阴影裁切（clip-audit `cut = 0`）、字号白名单（12 / 13 / 14 / 20）、令牌对比度，以及英文模式下的未翻译文本。

## 安装到 Codex

```bash
# 用户级（所有项目可用）
git clone https://github.com/yamyyyyy/ai-native-ui-skill ~/.agents/skills/anui

# 或项目级
git clone https://github.com/yamyyyyy/ai-native-ui-skill .agents/skills/anui
```

然后把 [`AGENTS.md`](AGENTS.md) 里的片段粘到你项目根目录的 `AGENTS.md`，让 Codex 在做 UI 前先读 `SKILL.md`。

> 目录名应与 `SKILL.md` frontmatter 的 `name: anui` 一致。

## 快速开始

- **看效果**：直接用浏览器打开 `demo/index.html`（离线、无外部请求）。`?theme=hc|oled|oled-hc|paper|white|dark` 切主题，`?rm` 模拟减少动效；`?lang=en`（或顶部 **EN / 中文** 按钮）切换英文界面，默认中文并记住选择。
- **在项目里用**：对 Codex 说“按 anui skill 给这个聊天面板做一个审批卡”。Skill 会按 `SKILL.md` 的路由表加载 `references/tokens.md`、`components.md`、`motion-advanced.md` 等。
- **只要令牌**：照抄 `demo/src/app.css` 的主题块和 `@theme` 映射（说明见 `references/tokens.md`）。

## 目录结构

```text
SKILL.md                 Skill 入口（name: anui）与按任务路由表
AGENTS.md                粘贴到项目 AGENTS.md 的片段
references/
  tokens.md              ANUI 令牌（主题、CSS 变量、Tailwind/shadcn 映射）
  monochrome.md          黑白进阶：层级、材质、暗岛、对比度、中文排版
  motion-advanced.md     弹簧预设、手势、AI 动效、光效、音效、性能
  components.md          21 个组件规格
  craft-rules.md         工艺规则：阴影裁切、IME、滚动跟随……
  acceptance.md          交付验收清单
  sources.md             来源与证据等级
  en/                    以上文件的英文译本（以中文为准）
scripts/
  check.mjs              一键自检（Playwright）
  perf.mjs               帧时序采样
  clip-audit.js          阴影裁切审计（来自 desktop-agent-ui，MIT）
  contrast.py            APCA + WCAG 对比度
demo/                    单页演示（index.html、spring.js、presets.js、motion.*、i18n.js、i18n-en.js、assets/）
docs/media/              README 用的动图与截图
```

## 验证脚本

```bash
npm install
npm run browsers          # 下载 Chromium；已有浏览器可改用 CHROME_PATH=/path/to/chrome
npm run check             # 6 个主题 + 英文界面检查，报告写入 reports/
npm run perf              # 可选：脚本化交互的帧时序 → reports/perf.json
npm run build:css         # 修改 demo/src/app.css 后重建 Tailwind
```

`check` 需要 Python 3 运行 `scripts/contrast.py`；环境变量 `THEMES=hc,oled` 可只测部分主题，`EN_THEMES=hc,oled`（默认；`none` 跳过）选择英文检查的主题，`SHOTS=1` 会额外截图。

## 致谢（Inspired by / built upon）

- [beautiful-ui](https://github.com/slev12397/beautiful-ui)（[beautifului.dev](https://beautifului.dev)）— MIT，© 2026 Shane Levine。组件解剖与尺寸的灵感来源；本仓库不包含其源码、图片或示例内容。
- [desktop-agent-ui](https://github.com/Ludi-Herry/desktop-agent-ui) — MIT，© 2026 Desktop Agent UI Contributors。工艺规则来源，`scripts/clip-audit.js` 原样复制。
- 字体 Geist / Geist Mono（OFL 1.1）与 Noto Sans SC（OFL 1.1，子集改名为 ANUI Sans SC）。

详见 [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md) 与 [`NOTICE`](NOTICE)。本项目以 [MIT](LICENSE) 发布。

## 语言

- `SKILL.md` 以英文为主，中文排版要点保留中文；`AGENTS.md`、`CHANGELOG.md`、`CONTRIBUTING.md` 双语。
- `references/*.md`（中文）为准，`references/en/*.md` 是标题一一对应的完整英译。
- demo 以中文文案为源，`demo/i18n-en.js` 提供英文映射，`demo/i18n.js` 运行时替换。

English documentation: [README.en.md](README.en.md).
