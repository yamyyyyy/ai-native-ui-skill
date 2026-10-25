---
name: anui
description: ANUI (AI-Native UI) — a monochrome design system for designing, building and reviewing Agent / Copilot / AI SaaS interfaces. Pure-black OLED and pure-white high-contrast themes, spring motion presets, Chinese (CJK) typography, AI-native components (thinking trace, streaming text, tool calls, approval cards, task rows, prompt bar) and self-check scripts. Use when building or polishing chat/agent UIs, picking components, setting tokens, adding motion or running UI acceptance; not for plain marketing pages or backend-only work. 中文：AI 应用界面的黑白设计系统（OLED / 高对比、弹簧动效、中文排版、AI 组件、自检脚本）。
---

# ANUI — AI-Native UI (Mono + Motion)

A monochrome system: colour does not carry hierarchy. **Lightness, material and motion** do. The only hue is a functional red (danger / error).

> 中文说明：本文件以英文为主，方便各类编码 Agent 理解。`references/` 下的中文文档为权威版本，`references/en/` 为对应英文译文，两者结构一致。

## When to use
- Building or refactoring agent / copilot / AI SaaS workspaces, chat panels, tool-call streams and human-in-the-loop approvals.
- Implementing AI-specific components: Thinking, Streaming Text, Tool Chips, Approval Card, Task Rows, Prompt Bar, Records/Diff Table, Insight Cards, and so on.
- Reviewing an existing AI UI for polish, motion, contrast, accessibility, shadow clipping and IME issues.

## What to read, by task
Each reference exists in Chinese (`references/*.md`, canonical) and English (`references/en/*.md`). Read whichever language you work in; the numbers and rules are identical.

| Task | Read |
| --- | --- |
| Set up themes, Tailwind/shadcn, colours, sizes, radii | `tokens.md` (implementation: `demo/src/app.css`) |
| Advanced black & white: elevation, materials, dark islands, contrast, theme switching, Chinese typography | `monochrome.md` + `scripts/contrast.py` |
| Motion: spring presets, gestures, AI motion, light effects, sound, performance, base curves | `motion-advanced.md` (implementation: `demo/spring.js`, `demo/presets.js`, `demo/motion.css`) |
| Implement a component | `components.md` (that section) + the `motion-advanced.md` appendix |
| Engineering pitfalls: shadow clipping, IME, scroll follow, split panes, truthful state | `craft-rules.md` |
| Delivery acceptance | `acceptance.md` + `scripts/clip-audit.js`; this repo's self-check is `npm run check` |
| See it working | `demo/index.html` (offline; `?theme=hc\|oled\|oled-hc\|paper\|white\|dark`, `?rm` for reduced motion, `?lang=en` for English UI) |
| Sources and evidence levels | `sources.md` |

## Default themes
- **Light default `hc`** (pure white, pure black text). **Dark default `oled`** (pure black). They share radii, ring logic, weight steps and the same red.
- Optional: `oled-hc`, `paper`, `white`, `dark` (near-black).
- With no user choice: OS dark → `oled` (`oled-hc` if `prefers-contrast: more` is also set); otherwise → `hc`.

## Workflow
1. **Inspect the project.** Read `package.json`, global CSS and the component folders.
   - Existing design system (shadcn / AntD / own tokens): only map the tokens.md variables into it (tokens.md §8). **Never add a second component library.**
   - New project: default to React + Tailwind v4 + shadcn/Radix + `motion`.
2. **Apply tokens.** Follow the theme blocks and `@theme` mapping in `demo/src/app.css` (tokens.md §3–§4).
   - Fonts: Geist + a Chinese face (ANUI Sans SC, or system PingFang / YaHei) + Geist Mono.
3. **State machine before visuals.** Spell out each component's states (draft / queued / running / awaiting-approval / done / failed / aborted), driven by real events.
4. **Implement from components.md.** Apply the "DAU correction" at the end of each section.
   - Motion uses only the 8 spring presets in motion-advanced.md §2, or their CSS `linear()` versions.
5. **Accept.** Run through acceptance.md.
   - For shadowed areas, run clip-audit (default / hover / expanded / end-of-animation) until `cut === 0`.
   - `contrast.py` must pass completely.
   - Screenshot `hc` and `oled`.

## Priority
1. Explicit user request > the project's existing design system > this skill's visual tokens.
2. Craft rules (craft-rules.md, acceptance.md) always apply.
3. Where an upstream size in the component specs conflicts with this skill, tokens.md wins.

## Hard rules (quick reference)
- Never fake agent progress with timers or decorative animation.
- At most 4 font sizes, none below 12px (12 / 13 / 14 / 20).
- No "·" separators, no explanatory subtitles, no left-edge colour-stripe cards.
- No hue except the functional red; emphasis = inversion.
- Overlays (menus, previews, selection toolbars) never live inside `overflow:hidden` containers; portal them.
- Enter-to-send must have an IME guard: `isComposing`, keyCode 229, and a 500ms window after `compositionend`. Respect `prefers-reduced-motion`.
- Never hide scrollbars globally or set `overflow: visible` globally.

## Chinese typography (中文排版要点)
- Font stack: `Geist, "ANUI Sans SC", system-ui, "PingFang SC", "Microsoft YaHei"`; numbers `tabular-nums`.
- `text-spacing-trim: trim-start`（行首标点半宽）, `text-autospace: normal`（中西文自动间距，已有空格时不叠加）, `line-break: strict`, `font-feature-settings: "chws"`（标点挤压）。
- Line height 1.55 (light) / 1.6 (dark); Chinese long-form body 1.7 (unverified).
- Don't emphasise Chinese body text with weights above 500; use ink colour + 500 instead.
- Details: `monochrome.md` §11（中文） / `en/monochrome.md` §11 (English).

## License
- This skill: MIT (© 2026 yamyyyyy).
- Component patterns are inspired by beautiful-ui (MIT, Shane Levine).
- Craft rules and `scripts/clip-audit.js` come from desktop-agent-ui (MIT).
- Fonts: SIL OFL 1.1.

See `THIRD_PARTY_LICENSES.md`.
