# 设计令牌（ANUI Tokens）

> 本文件定义 ANUI 自己的令牌：单色 OLED / 高对比体系 + 一个功能红。实现即 `demo/src/app.css`；设计原理见 `monochrome.md`，对比度由 `scripts/contrast.py` 校验（`npm run check` 输出 `reports/contrast.md`）。

## 1. 主题与选择器

> **默认配对（2026-10-25 更新）**：浅色 = `hc`（纯白高对比），深色 = `oled`（纯黑）。`oled-hc` 为可选的 OLED 高对比；`paper` / `white` / `dark` 降为可选变体。
> OLED 已向 HC 看齐：描边加强为 `white / .14`（line）与 `/ .24`（line-strong），ink 0.97 / 0.82 / 0.72 / 0.60，字重不降（400/500/600），字距 0，红 `0.79 0.125 24`；`oled-hc` 为 ink 1.0、描边 `/ .5`（line）与 `/ .8`（line-strong）、1px ring、无阴影、字重 +50。两种高对比主题都关闭 frost 与 grain。

- `data-theme` 共 6 个取值：`hc`（默认浅色）、`oled`（默认深色）、`oled-hc`、`paper`、`white`、`dark`。无存储选择时由 `demo/motion.js` 按 `prefers-color-scheme` / `prefers-contrast` 选择，`?theme=` 可强制。
- `dark` 和 `oled` 会同时在 html 上加 `.dark`，用于 Tailwind 的 `dark:` 变体。
- 任意子树都可以用 `class="dark"` 或 `data-theme="white"` 做局部覆盖。派生变量在 `:root, .dark, [data-theme]` 上重新声明，所以岛内也能取到正确的值。

## 2. 与 beautiful-ui 的差异

| 维度 | BUI | ANUI Mono |
|---|---|---|
| 主题数 | light / dark | 6 个：高对比 / OLED / OLED 高对比 / 纸白 / 纯白 / 近黑，浅色和深色分别调参 |
| 灰阶色相 | 冷蓝灰 h≈248–286，每个 token 的 C 和 H 都不一样 | 一组共享的 `--tint-c / --tint-h`：纸白暖 85、近黑冷 265、其余为 0 |
| accent | 蓝 `0.626 0.205 255` | **无色相**：`--accent = --ink`，用反色强调；唯一的色相是 `--red` |
| green / orange / tag 色 | 6 种色相 tag | 映射为 ink / ink-2，tag 用 填充 / 虚线 / 半填充 / 斜线 区分 |
| 描边 | 实色 `--line`，浅色 0.946、深色 0.308 | **alpha**：浅色 `ink / .085`、`/ .15`，深色 `white / .075`、`/ .13`，自动适配所在层 |
| 深色层级 | surface 0.26 + 阴影 | page 0.165 → surface 0.212 → raised 0.245 → overlay 0.278，加顶部 1px 高光 `--hi` |
| 文字 | ink-3 深色为 0.541（APCA 约 Lc 30） | 按 APCA 反推：深色 ink 0.955、ink-2 0.80、ink-3 0.70，见 `reports/contrast.md`（`npm run check` 生成） |
| 字重 | 固定 | `--fw-*`：深色降 20–40（halation 补偿），高对比加 50–100 |
| 选区 / 焦点 | 蓝 accent-tint / 蓝 outline | 反色选区，ink outline 加 page 色垫圈 |
| 字体 | Inter + JetBrains Mono，中文用系统字体 | Geist + Geist Mono + ANUI Sans SC（Noto Sans SC 子集，OFL 改名） |
| 圆角 | card 10 / window 14 | card 12 / window 16（chip 6 / control 8 不变） |
| Tooltip | 固定深色 | 浅色下反色（ink 底），深色下用 overlay 加描边 |

## 3. CSS 变量（节选自 `demo/src/app.css`，即 demo 实际使用的值）

```css
/* ═══ ANUI Mono tokens ═══
   Ramp: OKLCH, L steps tuned for perceptual evenness; tint = (C,H) applied to all greys.
   Light and dark are tuned separately, never inverted.                                     */
:root,[data-theme=paper],[data-theme=white],[data-theme=hc]{
  --tint-c:0.004;--tint-h:85;                                   /* warm paper tint */
  --page:oklch(0.972 var(--tint-c) var(--tint-h));--canvas:oklch(0.955 var(--tint-c) var(--tint-h));
  --surface:oklch(0.993 calc(var(--tint-c)*.5) var(--tint-h));--raised:var(--surface);--overlay:var(--surface);
  --inset:oklch(0.962 var(--tint-c) var(--tint-h));--hover:oklch(0.948 var(--tint-c) var(--tint-h));--hover-2:oklch(0.922 var(--tint-c) var(--tint-h));
  --field:oklch(0.958 var(--tint-c) var(--tint-h));
  --ink:oklch(0.205 0.006 var(--tint-h));--ink-2:oklch(0.43 0.006 var(--tint-h));--ink-3:oklch(0.54 0.006 var(--tint-h));--ink-4:oklch(0.68 0.005 var(--tint-h));
  --line:oklch(0.25 0.01 var(--tint-h) / 0.085);--line-strong:oklch(0.25 0.01 var(--tint-h) / 0.15);
  --fill-1:oklch(0.25 0.01 var(--tint-h) / 0.045);--fill-2:oklch(0.25 0.01 var(--tint-h) / 0.10);
  --hi:oklch(1 0 0 / 0.7);                                      /* specular top highlight */
  --stripe:oklch(0.3 0 0 / 0.06);--stripe-bg:oklch(0.962 var(--tint-c) var(--tint-h));
  --red:oklch(0.52 0.2 27);--red-tint:oklch(0.52 0.2 27 / 0.08);
  --sh-1:0 1px 1px oklch(0.2 0.01 60 / .03),0 1px 3px oklch(0.2 0.01 60 / .05);
  --sh-2:0 1px 2px oklch(0.2 0.01 60 / .04),0 4px 12px -2px oklch(0.2 0.01 60 / .07);
  --sh-3:0 2px 4px oklch(0.2 0.01 60 / .04),0 12px 32px -6px oklch(0.2 0.01 60 / .14),0 24px 48px -12px oklch(0.2 0.01 60 / .08);
  --fw-normal:400;--fw-medium:500;--fw-semibold:600;--track:-0.008em;--lh:1.55;
  color-scheme:light;
}
[data-theme=white]{
  --tint-c:0;--tint-h:0;
  --page:oklch(1 0 0);--canvas:oklch(0.97 0 0);--surface:oklch(1 0 0);--inset:oklch(0.982 0 0);--hover:oklch(0.965 0 0);--hover-2:oklch(0.938 0 0);--field:oklch(0.972 0 0);
  --ink:oklch(0.17 0 0);--ink-2:oklch(0.42 0 0);--ink-3:oklch(0.53 0 0);--ink-4:oklch(0.67 0 0);
  --line:oklch(0 0 0 / 0.085);--line-strong:oklch(0 0 0 / 0.14);--fill-1:oklch(0 0 0 / 0.04);--fill-2:oklch(0 0 0 / 0.09);
  --stripe:oklch(0 0 0 / 0.05);--stripe-bg:oklch(0.985 0 0);
  --sh-1:0 1px 1px oklch(0 0 0 / .04),0 1px 3px oklch(0 0 0 / .06);
  --sh-2:0 1px 2px oklch(0 0 0 / .05),0 4px 12px -2px oklch(0 0 0 / .08);
  --sh-3:0 2px 4px oklch(0 0 0 / .05),0 12px 32px -6px oklch(0 0 0 / .16),0 24px 48px -12px oklch(0 0 0 / .09);
}
[data-theme=hc]{
  --tint-c:0;--tint-h:0;
  --page:oklch(1 0 0);--canvas:oklch(1 0 0);--surface:oklch(1 0 0);--inset:oklch(0.97 0 0);--hover:oklch(0.93 0 0);--hover-2:oklch(0.88 0 0);--field:oklch(1 0 0);
  --ink:oklch(0 0 0);--ink-2:oklch(0.25 0 0);--ink-3:oklch(0.36 0 0);--ink-4:oklch(0.45 0 0);
  --line:oklch(0 0 0 / 0.45);--line-strong:oklch(0 0 0 / 0.75);--fill-1:oklch(0 0 0 / 0.06);--fill-2:oklch(0 0 0 / 0.14);
  --stripe:transparent;--stripe-bg:oklch(1 0 0);--red:oklch(0.45 0.2 27);--red-tint:oklch(0.45 0.2 27 / 0.1);
  --sh-1:0 0 #0000;--sh-2:0 0 #0000;--sh-3:0 0 0 2px oklch(0 0 0);--ring-w:1px!important;
  --fw-normal:450;--fw-medium:600;--fw-semibold:700;
}
.dark,[data-theme=dark]{
  --tint-c:0.005;--tint-h:265;                                  /* cool near-black */
  --page:oklch(0.165 var(--tint-c) var(--tint-h));--canvas:oklch(0.185 var(--tint-c) var(--tint-h));
  --surface:oklch(0.212 var(--tint-c) var(--tint-h));--raised:oklch(0.245 var(--tint-c) var(--tint-h));--overlay:oklch(0.278 var(--tint-c) var(--tint-h));
  --inset:oklch(0.19 var(--tint-c) var(--tint-h));--hover:oklch(0.25 var(--tint-c) var(--tint-h));--hover-2:oklch(0.285 var(--tint-c) var(--tint-h));
  --field:oklch(0.235 var(--tint-c) var(--tint-h));
  --ink:oklch(0.955 0.003 var(--tint-h));--ink-2:oklch(0.8 0.005 var(--tint-h));--ink-3:oklch(0.7 0.006 var(--tint-h));--ink-4:oklch(0.585 0.006 var(--tint-h));
  --line:oklch(1 0 0 / 0.075);--line-strong:oklch(1 0 0 / 0.13);--fill-1:oklch(1 0 0 / 0.045);--fill-2:oklch(1 0 0 / 0.09);
  --hi:oklch(1 0 0 / 0.07);
  --stripe:oklch(1 0 0 / 0.04);--stripe-bg:oklch(0.18 var(--tint-c) var(--tint-h));
  --red:oklch(0.79 0.125 24);--red-tint:oklch(0.79 0.125 24 / 0.12);
  --sh-1:0 1px 2px oklch(0 0 0 / .35);--sh-2:0 2px 8px oklch(0 0 0 / .35);--sh-3:0 12px 32px -8px oklch(0 0 0 / .6);
  --fw-normal:380;--fw-medium:470;--fw-semibold:560;--track:0.002em;--lh:1.6;   /* halation compensation */
  color-scheme:dark;
}
[data-theme=oled]{
  --tint-c:0;--tint-h:0;
  --page:oklch(0 0 0);--canvas:oklch(0.1 0 0);--surface:oklch(0.155 0 0);--raised:oklch(0.195 0 0);--overlay:oklch(0.235 0 0);
  --inset:oklch(0.12 0 0);--hover:oklch(0.2 0 0);--hover-2:oklch(0.24 0 0);--field:oklch(0.18 0 0);
  --ink:oklch(0.94 0 0);--ink-2:oklch(0.79 0 0);--ink-3:oklch(0.69 0 0);--ink-4:oklch(0.58 0 0);
  --line:oklch(1 0 0 / 0.1);--line-strong:oklch(1 0 0 / 0.16);--hi:oklch(1 0 0 / 0.09);
  --stripe:oklch(1 0 0 / 0.035);--stripe-bg:oklch(0.04 0 0);
}
:root,.dark,[data-theme]{
  --accent:var(--ink);--accent-ink:var(--ink);--accent-tint:var(--fill-2);--on-accent:var(--page);   /* single-accent rule: emphasis = inversion */
  --green:var(--ink);--green-tint:var(--fill-1);--orange:var(--ink-2);--orange-tint:var(--fill-1);  /* success/warn stay mono; only --red is chromatic */
  --tooltip-bg:var(--ink);--tooltip-fg:var(--page);--tooltip-muted:color-mix(in oklch,var(--page) 78%,var(--ink));--tooltip-border:transparent;
  --grid-line:var(--line);--ring-w:1px;
  --s-hairline:0 0 0 var(--ring-w) var(--line);
  --s-btn:0 0 0 var(--ring-w) var(--line-strong),var(--sh-1);
  --s-card:0 0 0 var(--ring-w) var(--line-strong),var(--sh-1);
  --s-raised:0 0 0 var(--ring-w) var(--line-strong),var(--sh-2);
  --s-overlay:0 0 0 var(--ring-w) var(--line-strong),var(--sh-3);
}
.dark,[data-theme=dark],[data-theme=oled]{
  --s-btn:inset 0 1px 0 var(--hi),0 0 0 var(--ring-w) var(--line-strong),var(--sh-1);
  --s-card:inset 0 1px 0 var(--hi),0 0 0 var(--ring-w) var(--line-strong);
  --s-raised:inset 0 1px 0 var(--hi),0 0 0 var(--ring-w) var(--line-strong),var(--sh-2);
  --s-overlay:inset 0 1px 0 var(--hi),0 0 0 var(--ring-w) var(--line-strong),var(--sh-3);
  --tooltip-bg:var(--overlay);--tooltip-fg:var(--ink);--tooltip-muted:var(--ink-3);--tooltip-border:var(--line-strong);
}
@media (min-resolution:2dppx){:root{--ring-w:.5px}}
/* dark: elevated surfaces get lighter (Apple base/elevated, Material overlay) */
.dark .bg-surface.shadow-raised:not([data-theme=white] *),.dark .bg-surface.shadow-overlay:not([data-theme=white] *){background-color:var(--overlay)}
```

## 4. Tailwind v4 映射

```css
@theme inline{
  --color-page:var(--page);--color-canvas:var(--canvas);--color-surface:var(--surface);--color-raised:var(--raised);--color-overlay:var(--overlay);--color-inset:var(--inset);
  --color-hover:var(--hover);--color-hover-2:var(--hover-2);--color-ink:var(--ink);--color-ink-2:var(--ink-2);--color-ink-3:var(--ink-3);--color-ink-4:var(--ink-4);
  --color-line:var(--line);--color-line-strong:var(--line-strong);--color-field:var(--field);--color-fill-1:var(--fill-1);--color-fill-2:var(--fill-2);
  --color-accent:var(--accent);--color-accent-ink:var(--accent-ink);--color-accent-tint:var(--accent-tint);--color-on-accent:var(--on-accent);
  --color-green:var(--green);--color-green-tint:var(--green-tint);--color-orange:var(--orange);--color-orange-tint:var(--orange-tint);
  --color-red:var(--red);--color-red-tint:var(--red-tint);
  --shadow-hairline:var(--s-hairline);--shadow-btn:var(--s-btn);--shadow-card:var(--s-card);--shadow-raised:var(--s-raised);--shadow-overlay:var(--s-overlay);
  --radius-chip:6px;--radius-control:8px;--radius-card:12px;--radius-window:16px;
  --font-weight-normal:var(--fw-normal);--font-weight-medium:var(--fw-medium);--font-weight-semibold:var(--fw-semibold);
  --font-sans:Geist,"ANUI Sans SC",ui-sans-serif,system-ui,"PingFang SC","Microsoft YaHei",sans-serif;
  --font-mono:"Geist Mono","ANUI Sans SC",ui-monospace,"SF Mono",monospace;
  --ease-out-strong:cubic-bezier(0.23,1,0.32,1);--ease-link:cubic-bezier(0.16,1,0.3,1);
}
```

用法速查：
- 层级：`bg-surface shadow-card` → `bg-raised shadow-raised` → `bg-overlay shadow-overlay`。
- 主按钮：`bg-ink text-on-accent`。
- 危险：`bg-red-tint text-red`。
- 弱填充：`bg-fill-1` / `bg-fill-2`。
- 材质类：`.grain`、`.frost`、`.vignette`、`.grad-border`、`.glow`、`.dither`、`.hatch`。


## 5. 字体、字号与排版

- 字族：`Geist`（西文）+ `ANUI Sans SC`（中文，Noto Sans SC 子集，按 OFL 改名）+ `Geist Mono`（代码）。均为可变字体，`wght` 轴用于深色/高对比字重补偿。回退：`ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif`。
- body：`14px / var(--lh)`（浅 1.55、深 1.6），`letter-spacing: var(--track)`，`font-feature-settings: "kern" 1, "chws" 1`，`text-spacing-trim: trim-start`，`text-autospace: normal`，`line-break: strict`。中文排版细则见 monochrome.md §11。
- 标题 `text-wrap: balance`，段落 `text-wrap: pretty`；数字一律 `tabular-nums`。
- 字重通过 `--fw-normal / --fw-medium / --fw-semibold` 取值（Tailwind `font-*` 已映射）：高对比/OLED 400/500/600，HC 与 OLED-HC +50~100，近黑 380/470/560。
- **字号阶梯（≤ 4 档，最小 12px）**：

| Token | 值 | 行高 | 用途 |
| --- | --- | --- | --- |
| `--text-meta` | 12px | 16px | 元信息、chip、计时、来源 |
| `--text-body` | 13px | 18px（composer）/ 1.625（长文） | 正文、行标题、输入 |
| `--text-title` | 14px | 20px | 卡片标题、tall composer 输入 |
| `--text-display` | 20px | 28px | 页面标题、KPI 数字（可选第 4 档） |

## 6. 圆角与间距

- 圆角：chip 6 / control 8 / card 12 / window 16 / pill 9999；嵌套必须同心：`R_in = max(0, R_out − padding)`（craft-rules.md）。
- 间距：卡片内边距 12px；行高 24（轨迹行）/ 28（工具行、按钮）/ 36（菜单行）/ 44（任务行）；gap 取 4 / 6 / 8 / 10 / 12。
- **阴影裁切余量**：e3 浮层（`--sh-3`：`0 24px 48px -12px`）下侧外扩 36px、上侧 12px；放在 `overflow:hidden` 或滚动容器内时须留出余量，或改用内描边，见 craft-rules.md。

## 7. 动效令牌

时长、缓动与 8 个弹簧预设（含 CSS `linear()` 版）见 `motion-advanced.md` §2–§3 与 `demo/motion.css`。

## 8. shadcn/ui 映射

`--background→--page`、`--card/--popover→--surface`（深色弹层用 `--overlay`）、`--foreground→--ink`、`--muted-foreground→--ink-2`、`--border/--input→--line-strong`、`--ring→--ink`、`--primary→--ink`、`--primary-foreground→--on-accent`、`--destructive→--red`、`--accent→--fill-2`。

---

## 附录 A：beautiful-ui 来源值（历史对照，不再作为默认）

> 以下数值读自 `slev12397/beautiful-ui@44a274e`（MIT）。本 Skill v0.1 起不再使用这套蓝灰配色与 Inter 字体，仅保留对照，方便理解组件规格（components.md）里出现的原始尺寸。标记：**[BUI]** 原值；**[DAU]** desktop-agent-ui 规则；**[合并]** 两者冲突后的裁决；**未验证** 表示源码中未出现、当时推导的值。

### A.1 冲突裁决摘要

| 维度 | BUI 原值 | DAU 规则 | 本 Skill 采用 |
| --- | --- | --- | --- |
| 字号 | 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 17 / 20 px 并存 | ≤4 种，最小 12px | **12 / 13 / 14 + 可选 20(展示)**。BUI 的 10.5–12.5 → 12；13/13.5 → 13；14 → 14；17/20 → 20 [合并] |
| 描边 | `0 0 0 1px var(--line)` 实色 ring | 0.5px hairline | **默认 0.5px ring**（`--ring-w: 0.5px`），DPR<2 时回退 1px（避免 1x 屏被四舍五入成 0）[合并] |
| 阴影 | 卡片/按钮全量使用 shadow-card / shadow-btn | 克制使用，只给浮层/窗口/按键 | **保留 BUI 阴影数值**（视觉层），但只用于：卡片（静态 card）、按钮（btn）、浮层（raised/overlay）；列表行、表格、内嵌块只用 hairline [合并] |
| 圆角 | chip 6 / control 8 / card 10 / window 14 / pill 999 | 嵌套需同心 `R_in = max(0, R_out - padding)` | **保留 BUI 刻度**，嵌套时按公式校验（例：card 10 + padding 4 → 内项 6 = chip ✔；card 10 + pad 12 → 内项 0~2）[合并] |
| 分隔符 | 文案无中点（BUI 自身也基本无） | 禁 “·” | 禁用中点 [DAU] |
| 左彩条 | CodeBlock Diff 行左侧 accent bar | 禁左彩条卡片 | Diff 行内 2px 行标记允许（属于代码 gutter，不是卡片）；**卡片层面禁止** [合并] |

### A.2 颜色（OKLCH，[BUI] 原值）

| Token | Light | Dark | 用途 |
| --- | --- | --- | --- |
| `--page` | `oklch(0.985 0.001 286.376)` | `oklch(0.209 0.004 264.477)` | 页面底 |
| `--canvas` | `oklch(0.961 0.002 247.84)` | `oklch(0.231 0.004 264.487)` | 演示画布/面板底 |
| `--surface` | `oklch(1 0 0)` | `oklch(0.26 0.006 271.191)` | 卡片、composer、浮层 |
| `--inset` | `oklch(0.979 0.002 247.839)` | `oklch(0.243 0.004 264.492)` | 内嵌区块、表尾 |
| `--hover` | `oklch(0.97 0.002 247.839)` | `oklch(0.289 0.006 271.22)` | 行 hover |
| `--hover-2` | `oklch(0.933 0.003 247.86)` | `oklch(0.318 0.007 274.747)` | 画布上控件 hover |
| `--ink` | `oklch(0.247 0.006 258.361)` | `oklch(0.964 0.002 247.839)` | 主文字 |
| `--ink-2` | `oklch(0.506 0.01 264.477)` | `oklch(0.731 0.008 260.731)` | 次文字 |
| `--ink-3` | `oklch(0.695 0.009 264.505)` | `oklch(0.541 0.01 264.484)` | 弱文字/图标 |
| `--line` | `oklch(0.946 0.003 264.542)` | `oklch(0.308 0.006 258.354)` | hairline |
| `--line-strong` | `oklch(0.912 0.005 258.326)` | `oklch(0.356 0.007 264.474)` | 聚焦/按钮描边、禁用发送底 |
| `--line-soft` | `oklch(0.966 0.002 264.542)` | `oklch(0.278 0.006 258.354)` | 极弱分隔 |
| `--field` | `oklch(0.961 0.001 286.375)` | `oklch(0.293 0.006 271.223)` | 输入内 chip、附件 |
| `--accent` | `oklch(0.626 0.205 254.947)` | `oklch(0.68 0.173 253.301)` | 品牌蓝 |
| `--accent-ink` | `oklch(0.556 0.187 255.617)` | `oklch(0.788 0.113 248.33)` | 蓝色文字 |
| `--accent-tint` | `oklch(0.96 0.019 252.878)` | `oklch(0.68 0.173 253.301 / 0.16)` | 选中底、::selection |
| `--green` / `-tint` | `oklch(0.603 0.155 150.883)` / `oklch(0.958 0.017 159.118)` | `oklch(0.705 0.154 153.814)` / 同色 `/0.14` | 成功、+行 |
| `--orange` / `-tint` | `oklch(0.689 0.179 49.902)` / `oklch(0.964 0.021 67.581)` | `oklch(0.746 0.156 55.642)` / `/0.14` | 警告 |
| `--red` / `-tint` | `oklch(0.621 0.192 23.042)` / `oklch(0.956 0.017 17.462)` | `oklch(0.666 0.18 21.433)` / `/0.14` | 失败、−行 |
| `--tooltip-bg/fg/muted/border` | `0.272 0.008 264.435` / `0.976 0.002 247.839` / `0.731 0.008 260.731` / `0.356 0.007 264.474` | `0.182 0.004 264.459` / `0.964 …` / `0.731 …` / `0.308 …` | 深色 tooltip、图表浮层 |
| `--stripe` / `--stripe-bg` | `oklch(0.405 0 0 / 0.075)` / `oklch(0.97 0 0)` | `oklch(1 0 0 / 0.055)` / `oklch(0.226 0.004 264.485)` | body 45° 斜纹底（7px 透明 + 1px 线） |

标签色（Records/Filter 状态 pill，`--tag-base` + color-mix 派生）[BUI]：todo `oklch(0.757 0.153 66.401)`、progress `oklch(0.671 0.118 219.351)`、done `oklch(0.652 0.131 162.865)`。Light：文字 `mix(base 92%, ink)`、底 `mix(base 20%, surface)`、边 `mix(base 34%, surface)`；Dark：文字 `mix(base 86%, white)`、底与边 `mix(base 34%, surface)`。

原则 [BUI]：冷调近白画布 + 白卡 + hairline + 个位数透明度分层阴影 + 中性墨色阶；语义色“当调味料”少量使用。

### A.3 阴影

shadow-plugin（flornkm）提供平滑分层 `--shadow-xs…lg`；BUI 在其上组合语义阴影 [BUI]：

```
light:
--shadow-hairline: 0 0 0 1px var(--line);
--shadow-btn:     0 0 0 1px var(--line-strong), var(--shadow-xs);
--shadow-card:    0 0 0 1px var(--line), var(--shadow-sm);
--shadow-raised:  0 0 0 1px var(--line), var(--shadow-md);
--shadow-overlay: 0 0 0 1px var(--line), var(--shadow-lg);
--shadow-inset-field: inset 0 1px 2px oklch(0 0 0 / 0.12);
dark（ring 改为低透明白色，随高度递增）:
--shadow-btn:     0 0 0 1px oklch(1 0 0/.10), 0 1px 2px oklch(0 0 0/.3);
--shadow-card:    0 0 0 1px oklch(1 0 0/.11), 0 1px 2px oklch(0 0 0/.2), 0 2px 6px oklch(0 0 0/.2);
--shadow-raised:  0 0 0 1px oklch(1 0 0/.13), 0 2px 10px oklch(0 0 0/.22);
--shadow-overlay: 0 0 0 1px oklch(1 0 0/.15), 0 8px 28px oklch(0 0 0/.34);
--shadow-inset-field: inset 0 1px 2px oklch(0 0 0/.4);
```

shadow-plugin 的 light `--shadow-xs…lg` 具体层值未在 BUI 仓库中出现（来自 npm 包）。下方 CSS 给出的 light 分层值为 **未验证**（参照 smooth-shadow 常见写法，并与 dark 档对齐），可 `npm i shadow-plugin` 后替换为真值。

**clip 余量**：overlay（dark）外扩 = 8 + 28 = 36px（下侧）、28−8 = 20px（上侧）——放在 `overflow:hidden`/滚动容器中时至少留出该余量，见 craft-rules.md。

### A.4 动效 [BUI]

| Token | 值 |
| --- | --- |
| `--ease-out-strong` | `cubic-bezier(0.23, 1, 0.32, 1)`（全库主曲线） |
| `--ease-in-out-strong` | `cubic-bezier(0.77, 0, 0.175, 1)` |
| `--ease-link` | `cubic-bezier(0.16, 1, 0.3, 1)`（下划线、侧栏） |
| 卡内滑动 | `cubic-bezier(0.4, 0, 0.2, 1)` 350ms（ApprovalCard 问题切换） |
| 时长 | 100（hover 色）/ 120–150（按钮、菜单项）/ 200（图标、选择态）/ 300（展开、chevron）/ 400（min-height、grid 展开）/ 500（时间线高度） |

关键帧与用法见 motion-advanced.md 附录。

