# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。 / This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### 新增 / Added
- `README.en.md`：与中文 README 对等的英文版，两者顶部互链。 / English README at parity with the Chinese one, cross-linked.
- `references/en/`：全部参考文档的英文译本（中文为准）。 / English translations of all references (Chinese is canonical).
- `SKILL.md` 改为英文为主，保留中文排版要点；`AGENTS.md`、`CHANGELOG.md`、`CONTRIBUTING.md` 双语。 / `SKILL.md` is now English-first with the Chinese typography notes kept; `AGENTS.md`, `CHANGELOG.md` and `CONTRIBUTING.md` are bilingual.
- demo 中英切换：`?lang=en` 或顶部 EN / 中文 按钮，默认中文（`demo/i18n.js`、`demo/i18n-en.js`）。 / zh/en demo switch via `?lang=en` or the EN / 中文 button; Chinese is the default.
- `npm run check` 新增英文运行（`EN_THEMES`，默认 `hc,oled`），可见的未翻译中文视为失败。 / `npm run check` adds English runs (`EN_THEMES`, default `hc,oled`) and fails on visible untranslated Chinese.

### 修正 / Fixed
- `references/monochrome.md`：灰阶表补上 OLED-HC 并修正 OLED 数值，主题数改为 6。 / Ramp table adds OLED-HC, fixes OLED values and now counts 6 themes.
- `references/tokens.md` §3：CSS 块按 `demo/src/app.css` 重新生成。 / The §3 CSS block is regenerated from `demo/src/app.css`.
- `references/craft-rules.md`：许可证路径改为 `THIRD_PARTY_LICENSES.md`。 / Licence path changed to `THIRD_PARTY_LICENSES.md`.
- `references/motion-advanced.md`：橡皮筋系数 0.55 / 0.998 标注“未验证”。 / Rubber-band constants 0.55 / 0.998 marked unverified.

## [0.1.0] — 2026-10-25

首个公开版本。 / First public release.

### 新增 / Added
- `SKILL.md`（name: `anui`）与 `AGENTS.md` 片段，可安装到 Codex 的 `~/.agents/skills/anui/` 或项目 `.agents/skills/anui/`。 / Skill entry and AGENTS snippet, installable to `~/.agents/skills/anui/` or `.agents/skills/anui/`.
- 单色令牌体系：默认 `hc`（纯白高对比）与 `oled`（纯黑），可选 `oled-hc` / `paper` / `white` / `dark`；唯一彩色为功能红。 / Monochrome tokens: `hc` and `oled` defaults plus four more themes; the only hue is a functional red.
- 弹簧动效：8 个预设，闭式求解 + CSS `linear()` 生成器。 / Spring motion: 8 presets, a closed-form solver and a CSS `linear()` generator.
- 中文排版：Geist + ANUI Sans SC（Noto Sans SC 子集，OFL 改名）+ Geist Mono，`text-autospace` / `text-spacing-trim` 规则。 / Chinese typography with Geist, ANUI Sans SC and Geist Mono.
- `demo/`：单页离线演示，示例数据与视觉原创。 / Single-page offline demo with original sample data and visuals.
- `references/`：tokens、monochrome、motion-advanced、components、craft-rules、acceptance、sources。
- 自检：`npm run check` 与 `npm run perf`。 / Self-checks: `npm run check` and `npm run perf`.
- GitHub Pages 工作流，部署 `demo/`。 / GitHub Pages workflow that deploys `demo/`.
