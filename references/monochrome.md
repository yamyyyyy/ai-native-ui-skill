# 黑白进阶指南（ANUI Mono）

> 本 Skill 的默认视觉语言：**只用黑、白、灰，外加一个功能色（红）**。原创性来自对单色的精细控制，而不是更多颜色。
> 完整演示见 `demo/index.html`（21 个组件 + 层级 / 材质 / 暗岛 + 动效），对比度报告由 `npm run check` 生成到 `reports/contrast.md`，令牌数值见 `references/tokens.md`。
> 标注：**[来源]** 表示有公开出处（编号见 `sources.md`），**未验证** 表示我们自己的设计取舍或经验值，没有外部依据也未测量；**已验证** 注明了验证方式。

## 1. 核心原则

1. **浅色和深色分开调，不做反相。** Apple HIG 明确指出深色配色“不一定是浅色的反相”[S4]。Linear 也为每套主题单独生成表面层级[S1][S2]。
   - 我们的浅色靠**阴影**表达层级，深色靠**表面变亮 + 顶部 1px 高光**表达层级。
   - 两套主题的文字灰阶 L 值各自按 APCA 反推。
2. **灰阶在 OKLCH 里构建。** L 是感知亮度，等差的 L 看起来就是等距的台阶[S6]。HSL 的 `darken()` 会让色相漂移，OKLCH 不会[S3]。
3. **色温只加一点。** 每个灰都共用一组 `(--tint-c, --tint-h)`。
   - 纸白用暖色 `0.004 / 85`，近黑用冷色 `0.005 / 265`，纯白和 OLED 都是 `0`。
   - 色度 ≤ 0.006：与同 L 纯灰的 OKLab 距离 ΔE ≤ 0.006，低于常用的 OKLab 可察觉差 JND ≈ 0.02（已验证：计算），因此读作“温度”而非“颜色”。
4. **单一功能色。** 除了 `--red`（危险、错误、删除）不使用任何色相。
   - 成功：用 `ink` 加对勾图标。
   - 警告：用 `ink-2` 加虚线描边。
   - 进行中：用半填充。
   - 强调：用**反色**，浅色下白底黑按钮，深色下黑底白按钮，即 `--accent = --ink`、`--on-accent = --page`。
   - 参考：Vercel 的营销站只有一条灰阶[S7]；Nothing 用黑白灰，红色只留给真正的信号[S10]；Teenage Engineering 用单色机身加单一高亮色（未验证归纳）。
5. **颜色不是唯一的信息通道。** 状态必须同时用 图标 / 形状 / 字重 / 填充方式 中的至少一种来区分。

## 2. 灰阶 Ramp（OKLCH）

| 角色 | 纸白 Paper | 纯白 White | 近黑 Near-black | OLED | OLED 高对比 | 高对比 HC |
|---|---|---|---|---|---|---|
| `page` | 0.972 | 1.000 | 0.165 | 0.000 | 0.000 | 1.000 |
| `canvas` | 0.955 | 0.970 | 0.185 | 0.100 | 0.100 | 1.000 |
| `surface`（e1） | 0.993 | 1.000 | 0.212 | 0.155 | 0.100 | 1.000 |
| `raised`（e2） | =surface | =surface | 0.245 | 0.195 | 0.130 | =surface |
| `overlay`（e3） | =surface | =surface | 0.278 | 0.235 | 0.160 | =surface |
| `hover` / `hover-2` | 0.948 / 0.922 | 0.965 / 0.938 | 0.250 / 0.285 | 0.200 / 0.240 | 0.200 / 0.240 | 0.93 / 0.88 |
| `ink` | 0.205 | 0.170 | 0.955 | 0.970 | 1.000 | 0.000 |
| `ink-2` | 0.430 | 0.420 | 0.800 | 0.820 | 0.900 | 0.250 |
| `ink-3` | 0.540 | 0.530 | 0.700 | 0.720 | 0.820 | 0.360 |
| `ink-4` | 0.680 | 0.670 | 0.585 | 0.600 | 0.700 | 0.450 |

- **深色台阶更大**：表面每级约 +0.033 L，浅色只有 0.02 左右。人眼在暗部对 L 差异更不敏感（未验证，与 Linear 的 elevated 偏移“浅色 +3 / 深色 +6”[S2] 的思路一致）。
- **深色文字整体更亮**：深色 `ink` 是 0.955，不是纯白。接近纯白就会出现光晕（halation）[S8]。APCA 在深色下要求更高的亮度差，所以 `ink-2` 和 `ink-3` 比反相值高出约 0.08（详见 `reports/contrast.md`）。

## 3. 底色怎么选

| 底色 | 适用 | 避免 |
|---|---|---|
| **纸白** `0.972 暖` | 长时间阅读、写作、文档、对话（可选浅色；默认浅色为高对比） | 需要和纯白图片、产品图无缝衔接的电商场景 |
| **纯白** `1.0` | 图片和截图多的场景、营销页、打印预览、需要“无底”的嵌入式组件 | 大面积纯文字（刺眼）。可以用 `canvas 0.97` 加白卡片的组合缓解 |
| **近黑** `0.165 冷` | 可选深色，适合 IDE、终端和夜间长时间使用。灰底能让阴影和层级仍然可见[S5] | 无 |
| **OLED** `0` | **默认深色**；移动端省电、沉浸式媒体、全屏演示 | 滚动长列表。纯黑像素点亮时会拖影（smearing）[S9]，所以 OLED 下 `surface` 从 0.155 起步，内容不直接铺在 0 上 |
| **高对比 HC** `1.0` | **默认浅色**；纯白底纯黑字，`prefers-contrast: more` 下的深色对应 OLED 高对比 | 无。此模式下 `--ring-w` 固定 1px，阴影换成 2px 实线，字重 +50 |

## 4. 层级 Elevation

- **浅色：分层柔影。** 每一级 = 一条 hairline 环 + 2 到 3 层阴影（近处小、实，远处大、虚）。
  - e1 = `0 1px 1px /.03, 0 1px 3px /.05`
  - e2 = 加上 `0 4px 12px -2px /.07`
  - e3 = 加上 `0 12px 32px -6px /.14, 0 24px 48px -12px /.08`
  - 阴影色带一点暖灰 `oklch(0.2 0.01 60 / a)`，比纯黑阴影更“像纸”（未验证）。
- **深色：变亮加高光。** 阴影在深色背景上几乎看不见[S5]。层级越高，表面越亮（Apple 的 base/elevated[S4]、Material 的 overlay[S5]），并加一条 `inset 0 1px 0 oklch(1 0 0 / .07)` 的**顶部镜面高光**，模拟顶光照在边缘上。阴影只保留给 e3 浮层，用来把它和背景“切开”。
- **Tailwind 用法**：`bg-surface shadow-card` → `bg-raised shadow-raised` → `bg-overlay shadow-overlay`。
  - 旧代码里写成 `bg-surface shadow-overlay` 的组合，在深色下会自动改成 overlay 色（`app.css` 里有对应规则）。

## 5. Hairline 系统

- 宽度用 `--ring-w`：默认 1px，2x 屏上为 0.5px，高对比模式下强制 1px。
- 颜色**全部用 alpha**：浅色 `oklch(0.25 0.01 h / .085 / .15)`，深色 `oklch(1 0 0 / .075 / .13)`。
  - 同一条描边放在 page、surface、overlay 任意一层上，都能保持相同的“相对对比”。Vercel 也区分 gray 和 gray-alpha，后者用在需要透出背景的场合[S6]。
- **一条边只画一次**：容器内部的分隔线放在 border 里面，避免两条 alpha 线叠加后出现一个更深的交点[S6]。
- 用 `box-shadow` 画 ring，不用 `border`。这样不占盒模型尺寸，也方便和阴影合成。

## 6. 文字层级、字重补偿、APCA

- **文字层级 = 灰度 × 字重**：标题用 ink 600，正文用 ink 400，次级用 ink-2 400，元信息用 ink-3 400 / 12px，占位用 ink-4。不靠颜色区分。
- **深色补偿**：浅字放在深底上会显得更粗、更糊（光晕 / 渗光）[S8][S5]。
  - 深色下字重降到 `400→380`、`500→470`、`600→560`。我们用可变字体 Geist / Noto Sans SC 的 wght 轴做这件事，并把 Tailwind 的 `font-weight-*` 映射到 `--fw-*`。
  - 字距 `-0.008em → +0.002em`，行高 `1.55 → 1.6`。
  - 数值参考了[S8]的建议（降 50–100、加 0.01em），我们取更温和的值，因为 Geist 本身就偏细（未验证）。
- **APCA 目标**（Bronze 档）[S11]：
  - 正文 Lc ≥ 90（最低 75），可读内容 ≥ 60，大字和图标 ≥ 45，占位和禁用 ≥ 30。
  - 同时要满足 WCAG 2：正文 ≥ 7，次级 ≥ 4.5。Apple HIG 对小字也建议 7:1[S4]。
  - 元信息档定为 Lc 45，这一档是我们的未验证分级。
- 深色 Lc 为负值，比较绝对值。所有令牌组合都已经计算过，见 `reports/contrast.md`，全部通过。

## 7. 单一功能色与反色强调

| 语义 | 浅色 | 深色 | 区分方式 |
|---|---|---|---|
| 主操作 | `bg-ink text-on-accent` | 同一个 token，自动变成白底黑字 | 反色 |
| 次操作 | `bg-surface shadow-btn` | 同 | 描边 |
| 危险 / 错误 | `--red 0.52 0.2 27` + 浅红底 | `--red 0.79 0.125 24` | **唯一的色相** |
| 成功 | ink + ✓ | 同 | 图标 |
| 进行中 | 半填充 tag、spinner | 同 | 形状 |
| 待办 | 虚线描边 tag | 同 | 线型 |

- 深色下的红色要**降色度、提亮度**：0.2 → 0.125，L 0.52 → 0.79。否则在黑底上会“发光”并振动（未验证，和 Material 对深色品牌色去饱和的建议一致[S5]）。

## 8. 材质（都是可选修饰，不承担信息）

- **颗粒 Grain**：SVG `feTurbulence` 去色噪点，用 `mix-blend-mode: soft-light`，不透明度 .5。可以压住大面积渐变的色带（banding），让纯色显得“有材质”。
- **磨砂 Frost**：`color-mix(surface 62%, transparent)` 加 `backdrop-filter: blur(16px) saturate(1.2)`。只用在浮于内容之上的条或栏（工具栏、底部输入条）。
- **暗角 Vignette**：浅色下四角压 8% 黑。深色下顶部提 4% 白、底部压 35% 黑，形成“顶光”。
- **渐变描边**：`mask-composite: exclude` 画 1px 渐变环，从顶部 35% ink 过渡到 4%。适合 hero 卡片，一个视图里不超过 1 个。
- **顶光 Glow**：深色卡片顶部的径向白光（13%）。这是暗色 UI 的“精致感”主要来源，类似 Raycast / Linear 的做法（未验证归纳）。
- **抖网 Dither / 斜线 Hatch**：4px 点阵或 45° 斜线，用来做图表填充、禁用区和占位，延续 Nothing 的点阵语言[S10]。

## 9. 焦点、选区、图片、图标、代码

- **焦点环**：`outline: 2px solid var(--ink)` + `outline-offset: 2px`，再加一圈 `0 0 0 4px var(--page)` 的“垫圈”，保证在任何底色上都能和背景分开。输入框用 `focus-within`，把 ring 从 line 换成 line-strong。
- **选区**：`::selection` 用 ink 底、page 字，也就是反色，彻底不用蓝色。
- **图片**：在单色界面里，用户截图和照片默认 `grayscale(1) contrast(1.05)`，深色下再加 `brightness(.85)`，避免一张亮图刺眼。悬停或点开大图时再恢复彩色（未验证交互）。
- **图标**：只用 1.5–2px 的线性图标，颜色继承 `currentColor`。实心图标只用于状态（✓、✕）。
- **代码高亮**：靠**亮度和字重**区分，不靠色相。
  - 关键字：ink 500。
  - 标识符：ink。
  - 字符串：ink-2。
  - 注释：ink-4 斜体。
  - Diff：新增行 `fill-1` 底，删除行 `red-tint` 底。删除是唯一的红色。
- **图表**：用透明度（100% / 45%）、纹理（斜线 / 点阵）、线型（实线 / 虚线）区分系列，最多 4 个系列。再多就改用直接标注（label 贴在线尾）。

## 10. 主题切换

- **不闪屏**：`<head>` 里的同步脚本在首帧之前确定主题，优先级为 `?theme=` → localStorage → `prefers-contrast: more` → `prefers-color-scheme`，然后写入 `data-theme` 和 `.dark`。
- **圆形揭幕**：调用 `document.startViewTransition(swap)`，在 `ready` 之后对 `::view-transition-new(root)` 做 `clip-path: circle(0 → R)` 动画，从点击位置展开[S12]。
  - 参数：560ms，`cubic-bezier(.65,0,.35,1)`。
  - 不支持该 API 或开启了 `prefers-reduced-motion` 时直接切换。
  - 切换期间给 html 加 `.theme-switching`，冻结所有 transition，避免组件各自渐变成“彩虹”。
- **组件级覆盖（暗岛 / 亮岛）**：
  - 任意子树加上 `class="dark"` 或 `data-theme="white"`，就会重新声明全套变量。
  - 关键是**派生变量**（`--accent: var(--ink)` 这类）必须在每个主题作用域上重新声明：`:root, .dark, [data-theme] {…}`。CSS 变量里的 `var()` 在声明它的元素上解析，只在 `:root` 声明的话，岛内会继承到外层的值。
  - 岛内的根容器需要重新设置 `font-weight: var(--fw-normal)` 和 `letter-spacing`，这样深色字重补偿才会生效。
- **高对比**：同时提供 `[data-theme=hc]` 和 `@media (forced-colors: active)` 两种降级方式。forced-colors 下用 `CanvasText` 系统色描边，不依赖自定义阴影。
- **减少动效**：所有动画降到 0.01ms，View Transition 跳过，流式模糊尾巴去掉。

## 11. 中文排版

- 字体栈：`Geist, "ANUI Sans SC", system-ui, "PingFang SC", "Microsoft YaHei"`。
  - `ANUI Sans SC` 是 Noto Sans SC（OFL）按页面用字子集化后的版本。
  - 子集化属于修改，按 OFL 的保留字体名规则改了名，可变 wght 轴保留。
- 全局规则：
  - `text-spacing-trim: trim-start`：行首标点只占半宽。
  - `text-autospace: normal`：中文和西文之间自动留空约 1/8em；源文本里已有半角空格时不会再叠加（已验证：Chromium 156 实测，16px 下“中文 Agent 中文”开启与关闭 autospace 宽度相同 111.1px；无空格时开启后每侧 +2px）。
  - `line-break: strict`。
  - `font-feature-settings: "chws"`：标点按上下文挤压。
  - 数字用 `tabular-nums`。
- 行高：浅色 1.55，深色 1.6。中文正文段落建议 1.7（未验证）。
- 字重映射：中文黑体比 Geist 视觉上更重，正文同为 400 时中文会显得略黑，所以中文正文不使用 500 以上的字重来强调，改用 ink 颜色加 500（未验证）。

## 12. 工艺规则（继续生效）

- 字号只用 12 / 13 / 14 / 20，最小 12px。
- 圆角同心：`R_in = max(0, R_out − padding)`。新刻度 chip 6 / control 8 / card 12 / window 16。
- `clip-audit.js` 在 6 个主题下都要求 cut = 0（`npm run check` 自动执行）。
- IME 防误发：`compositionend` 之后 500ms 内的 Enter 拦截，同时检查 `isComposing` 和 keyCode 229。
- 新增的验收项：
  - 运行 `scripts/contrast.py`，检查所有令牌组合的 APCA 和 WCAG 是否达标。
  - 在 6 个主题下逐一截图（`SHOTS=1 npm run check`）。
  - 暗岛内的派生变量要求正确：岛内主按钮应为白底黑字。
