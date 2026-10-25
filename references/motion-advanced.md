# 动效进阶（ANUI Motion）

> 定位：在纯黑白界面里，**动效取代颜色，成为层级和状态的信号**。颜色只剩黑、白、灰和一个红，所以“谁更重要”“发生了什么”“轮到谁”这类信息，要靠运动的速度、距离、弹性和时序来表达。
> 参考实现：`demo/index.html`（Motion Lab + AI 动效 + 光效 + 21 组件）。弹簧求解器在 `demo/spring.js`，预设在 `demo/presets.js`，CSS 令牌在 `demo/motion.css`。
> 标注：**[Mx]** 表示来源（编号见 `sources.md`），**未验证** 表示我们自己的设计取舍或经验值，尚无测量或外部依据；**已验证** 注明了验证方式。基础动效规则（原 motion.md）已并入本文末尾附录。

## 1. 原则

1. **频率决定动效量。** 一天触发上百次的操作（键盘命令、列表导航）不做动画或只做 ≤ 100ms 的动画。低频的关键时刻（首次完成任务、审批）才允许“表演”[M2][M5]。Raycast 几乎没有动画，反而显得快[M2]。
2. **默认要快，进入用 ease-out。** 常规 UI 动画控制在 300ms 以内，ease-in 不用于进入[M2][M3]。
3. **必须可打断。** 所有由用户触发的动画都能中途改目标，并且**保留当前速度**。CSS 用 transition 而不是 keyframes，JS 用弹簧的状态（x, v）来实现[M2][M4]。
4. **运动要符合物理隐喻。** 手势松开后保留动量和方向，越界时出现橡皮筋阻尼，轻的物体弹性小[M5]。
5. **连续性优先于花哨。** 过渡要让用户知道东西从哪里来、到哪里去，比如共享元素和布局补间[M6]。
6. **黑白下的层级映射**（未验证，本 Skill 的核心主张）：

| 颜色系统里的手段 | 在黑白界面里换成 |
|---|---|
| 主色高亮新内容 | 新内容用 `pop` 弹簧进入（2–3% 过冲），旧内容保持不动 |
| 状态色（绿、黄、灰） | spinner 转动表示进行中，对勾缩放落定表示完成，虚线描边表示待办 |
| 强调色吸引注意 | 一次性的 `nudge` 水平轻晃（≤ 3px，只播一次，绝不循环） |
| 暗色层级 | 越“高”的层，进入时位移越大、越慢；退出越快 |
| 品牌色氛围 | 黑底光标聚光、镜面扫光、颗粒闪烁（只做装饰，不承载信息） |

## 2. 弹簧预设

参数化方式沿用 Apple 的 **duration / bounce**[M1]：`stiffness = (2π / duration)²`，`damping = 4π(1 − bounce) / duration`，mass = 1。
- 例：duration 0.5 / bounce 0.3 → k ≈ 157.9、c ≈ 17.6，与 Apple 文档给出的值一致[M1]。
- `duration` 是**感知时长**，`settle` 是位移误差小于 0.2% 时的实际停止时间。
- CSS 无 JS 版本是把弹簧采样 33 个点，生成 `linear()` 曲线，思路同 Motion 的 `spring().toString()`[M7]。

| 预设 | duration / bounce | stiffness | damping | mass | ζ | 过冲 | settle | 用途 |
|---|---|---|---|---|---|---|---|---|
| `press` | 0.18s / 0 | 1218.5 | 69.81 | 1 | 1 | 0% | 242ms | 按压回弹、开关拇指、复选框 |
| `snap` | 0.25s / 0 | 631.7 | 50.27 | 1 | 1 | 0% | 333ms | 菜单、下拉、tooltip、chip 状态切换 |
| `glide` | 0.4s / 0 | 246.7 | 31.42 | 1 | 1 | 0% | 537ms | 布局 / FLIP、共享元素、列表重排 |
| `settle` | 0.55s / 0.05 | 130.5 | 21.71 | 1 | 0.95 | 0% | 625ms | 进度条、数值补间、滚动吸附 |
| `pop` | 0.35s / 0.25 | 322.3 | 26.93 | 1 | 0.75 | 2.8% | 429ms | 工具调用 chip 出现、通知进入、磁吸释放 |
| `sheet` | 0.5s / 0.1 | 157.9 | 22.62 | 1 | 0.9 | 0.2% | 458ms | 抽屉、审批卡片、模态（≈ iOS sheet） |
| `fling` | 0.6s / 0.2 | 109.7 | 16.76 | 1 | 0.8 | 1.5% | 762ms | 甩动吸附（带初速度）、拖拽释放 |
| `breathe` | 1.8s / 0 | 12.2 | 6.98 | 1 | 1 | 0% | 2421ms | Agent 在场感呼吸、等待态（循环） |

- **黑白界面里 bounce 上限是 0.25。** 没有颜色分散注意力，弹性会被放大感知（未验证）。只有 `pop` 和 `fling` 带一点回弹，其余都是临界阻尼或接近临界阻尼。
- 生成方式：`ANUISpring.toLinear(ANUISpring.fromDB(0.35, 0.25))` 返回 `{duration, easing: "linear(…)"}`。`motion.css` 里已经生成了 `--spring-*` 和 `--dur-*` 令牌，并用 `@supports (linear())` 降级到 cubic-bezier。
- 求解器 `demo/spring.js`：
  - 闭式解，覆盖欠阻尼、临界、过阻尼三种情况，用于画曲线和生成 `linear()`。
  - 有状态的 `Spring` 类用于交互，以 240Hz 子步做半隐式欧拉积分，`set(to, velocity)` 时保留速度，所以可以打断。

## 3. 时长与缓动令牌

| 令牌 | 值 | 用途 |
|---|---|---|
| `--dur-instant` | 90ms | 按下（按压缩放进入）、hover 底色 |
| `--dur-fast` | 150ms | 颜色和透明度变化、tooltip |
| `--dur-base` | 240ms | 菜单、焦点环收拢 |
| `--dur-slow` | 400ms | 列表错峰、面板 |
| `--dur-exit` | 150ms | **所有退出**（≈ 进入的 0.4–0.6 倍） |
| `--ease-out` | `cubic-bezier(.23,1,.32,1)` | 进入、响应 |
| `--ease-in` | `cubic-bezier(.55,0,1,.45)` | 只用于退出 |
| `--ease-io` | `cubic-bezier(.65,0,.35,1)` | 屏幕内移动、主题揭幕 |
| `--ease-sheet` | `cubic-bezier(.32,.72,0,1)` | 抽屉，即 Vaul / iOS sheet 曲线[M3] |

**进出不对称**：进入时“慢一点、带弹性”，让用户看清；退出时“快、ease-in、不弹”，别挡路。Sonner 的 toast 用 400ms 的 ease 进入，我们改成 pop 弹簧 430ms 进入、150ms 退出[M3]。

## 4. 编排与错峰

- 错峰间隔 **35ms**，最多 **6 项**参与错峰，第 7 项起和第 6 项同时出现，总时长不超过 400ms + 6 × 35ms。
- 父先子后：容器先完成 60% 再出现子项。退出时反过来，但**不错峰**，统一一起退。
- 一个视图里同时只有一个“主角”动画，其他元素最多做透明度变化。
- 进入的组合：`opacity 0→1` + `translateY 8px→0` + `blur 2px→0`。blur 只用在一次性进入，不用在高频操作上。

## 5. 共享元素与布局过渡

- **FLIP**：先记录 First，然后修改 DOM 得到 Last，计算差值 Invert，最后用 `glide` 的 `linear()` 播放 Play。只动 `transform`。
- 卡片展开成详情：同一个节点同时做 `translate + scale`。里面的文字等布局完成后再淡入，避免被拉伸。
- 跨路由时优先用 View Transitions API 的 `view-transition-name`[M8]。在同一文档里用 `document.startViewTransition`，不支持时直接切换。
- 列表重排、增删一律用 FLIP，不能“跳位”。Sonner 的经验是 keyframes 无法重定向，重排必须可打断[M3]。

## 6. 手势物理

- **拖拽**：`pointerdown` 时 `setPointerCapture`，并取消正在运行的弹簧，把当前 x 作为起点，保证零跳变。
- **橡皮筋**：`f(x) = (1 − 1 / (x·c / d + 1)) · d`，c = 0.55，d 是容器尺寸（iOS 系数）。抽屉向上越界时用 c = 0.3，阻力更大。
- **速度**：只取最近 100ms 的指针样本估算 px/s。不能用整段拖拽的平均速度。
- **甩动投射**：`projected = x + v/1000 · 0.998 / (1 − 0.998)`（UIScrollView normal 减速率）。吸附到离投射点最近的槽位，用 `fling` 弹簧，**并把松手速度作为初速度**。
- **抽屉关闭**：位移超过高度的 40%，或速度大于 500px/s，就关闭，否则回弹（参考 Vaul[M3]）。
- 拖动过程中跟手 1:1，**不加任何缓动**。

## 7. 微交互

- **按压**：按下时 90ms ease-out 缩到 `scale(.97)`，松开用 `pop` 弹簧回弹。按下快、松开带弹性，触感更清楚。
- **光随指针**：组件舞台和卡片上，`--mx / --my` 跟随指针，画一个 260px 的径向光（深色 8.5% 白，浅色 7% ink）。高对比模式下关闭。OLED 纯黑背景上效果最好。
- **磁吸**：指针在 70px 内时，按钮向指针方向偏移最多 6px，离开时用 pop 弹簧回位。只用在主操作（发送），一个视图最多 1 到 2 个。
- **焦点环**：`:focus-visible` 出现时，`outline-offset` 在 240ms 内从 6px 收拢到 2px，颜色从透明变成 ink。只在获得焦点的瞬间播放一次。
- **镜面扫光**：hover 时一道 105° 的白色渐变（14%）在 900ms 内扫过。一个视图里不超过一个。

## 8. AI 专属动效

| 场景 | 动效 | 参数 |
|---|---|---|
| 思考 | 文字微光（shimmer）+ 三点错峰呼吸 | 1.2s 循环，点间隔 150ms |
| 在场感 | 头像外两圈 1px 环错峰扩散 | 工作中 2.4s 一圈，空闲或等待时 4.8s 一圈（频率表示忙闲） |
| 工具调用 | chip 从 `scale(.85)` 弹出，spinner 落定后变成对勾缩放 | `pop` 弹簧，完成音 2600Hz/10ms（可选） |
| 流式输出 | **逐词模糊浮现**：每个 token `opacity 0→1 + blur 4px→0` | 320ms ease-out，token 间隔约 38ms。中文按 1–2 字切分，英文按词切分 |
| 进度 | 先显示不确定态扫光，拿到真实进度后改用 `settle` 弹簧补间，**只增不减** | 进度不倒退是信任的底线（未验证） |
| 审批卡片 | 从下方 12px 加 `scale(.98)` 用 `sheet` 曲线进入。4 秒未处理时只 nudge 一次 | 退出 150ms ease-in |
| 完成 | 进度到 1，在场环降频，标签变为“已完成” | 不放彩带，在黑白界面里克制更高级 |

流式输出还要遵守本文附录（原 motion.md）的规则：内容框高度用 `min-height` 预留，避免跳动；自动滚动跟随，用户向上滚动时暂停跟随。

## 9. 主题切换

- 圆形揭幕：使用 View Transitions，`clip-path: circle()` 从点击点展开，560ms，`--ease-io`[M8]。
- 切换期间加 `.theme-switching`，冻结所有 transition。否则各组件会各自渐变，出现色彩不一致的过渡帧。
- 减少动效时直接切换。`OLED ↔ 高对比` 属于“黑白反转”，揭幕的视觉冲击最强，是这套主题的招牌时刻（未验证）。

## 10. 黑白光效（WebGL / Canvas）

- **光标聚光加颗粒**：一个 WebGL 片元着色器，绘制两层高斯光斑（宽 32%、窄 18%），叠加 24fps 量化的哈希噪声（±3%）。
  - 光标跟随做一阶低通（k = 0.12），产生“拖尾”感。
  - 进入可视区才渲染（IntersectionObserver），DPR 上限 2。
- **镜面扫光**：Canvas 2D 线性渐变，每 4 秒扫过一次，扫动占周期的 35%，其余时间静止。
- **颗粒闪烁**：噪声按 24fps 换帧，而不是 60fps，看起来像胶片，也更省电（未验证）。
- 光效只做装饰，不承载信息。高对比模式和减少动效时静止或关闭。

## 11. 音效（可选，默认关闭）

- WebAudio 单振荡器，10–25ms 指数衰减包络，增益约 0.03，即 20·log10(0.03) ≈ −30.5 dBFS（已验证：计算）。
- 映射：按下 2200Hz/8ms；工具开始 1800Hz；完成 2600Hz/10ms；审批出现 900Hz triangle/50ms。
- 必须由用户主动打开（浏览器也要求在手势后创建 AudioContext）。声音只用来加强确认感，不能作为唯一反馈。

## 12. 性能

- 只动 compositor 能处理的属性：`transform`、`opacity`，`filter` 尽量少用。进度条用 `scaleX` 而不是 `width`。
- `will-change` 预算：同屏不超过 4 个元素。只给正在拖拽或持续动画的元素加，结束后移除。
- 120Hz 屏幕：弹簧按真实 dt 积分（240Hz 子步），与刷新率无关。CSS `linear()` 由浏览器插值，也与刷新率无关。
- rAF 循环必须在不可见时暂停（IntersectionObserver 或 `document.hidden`）。
- 测量方法：Playwright 跑完整交互脚本，同时采集 rAF 帧间隔和 Chrome trace，结果见 `reports/perf.json`（`npm run perf`）。

## 13. 减少动效

- 两个开关：系统的 `prefers-reduced-motion` 和页面上的“减少动效”按钮（`html.rm`）。
- 降级规则：
  - 位移、缩放、弹簧一律变成**瞬间到位**（`Spring.jump`）。
  - 保留不超过 150ms 的透明度变化，用来提示变化发生了。
  - 流式输出逐词直接出现，不模糊。
  - 光效静止，主题切换不揭幕。
- 循环动画（思考、在场感）降为静态或只播放一次。

## 14. 验收清单

- [ ] 每个由用户触发的动画都能中途打断，并且没有跳变（快速连点“播放”试试）。
- [ ] 退出时长 ≤ 进入时长的 0.6 倍。
- [ ] 拖拽 1:1 跟手，松手后速度能延续。
- [ ] 每屏的 `will-change` 不超过 4 个，不可见时 rAF 暂停。
- [ ] 减少动效模式下所有功能仍然可用。
- [ ] 高频操作（键盘、列表导航）没有超过 100ms 的动画。
- [ ] 一个视图里同时只有一个“主角”动画。
- [ ] 继续满足：字号 ≥ 12px、clip-audit cut = 0、IME 防误发。


## 附录：基础动效规则（原 motion.md）

视觉节奏取 BUI 原值 [BUI]；动效“为什么/何时用”取 DAU 规则 [DAU]：动效只用于确认动作、提示状态迁移、表达空间来源、维持对象连续性；**状态必须来自真实事件，禁止用定时器伪造进度**（BUI 演示页大量 `setTimeout` 驱动只是 demo 剧本，生产实现须换成事件流）。

### 1. 曲线与时长

| 名称 | 值 | 用在哪里 |
| --- | --- | --- |
| `ease-out-strong` | `cubic-bezier(0.23,1,0.32,1)` | 展开/收起（grid-rows）、fade-up、pop-in、菜单高亮滑块、min-height 过渡 |
| `ease-in-out-strong` | `cubic-bezier(0.77,0,0.175,1)` | 大位移/切换（库中定义，少用） |
| `ease-link` | `cubic-bezier(0.16,1,0.3,1)` | 下划线 280ms、侧栏、RecommendationCard 抽屉 |
| ApprovalCard SLIDE | `360ms cubic-bezier(0.22,1,0.36,1)` | 多问题横向滑动 + 高度同步 |
| 色彩 hover | 100ms（画布控件）/ 120–150ms ease-out（行、按钮） | |
| 按压 | `active:scale-[0.96]`（按钮）/ `0.94`（composer 图标按钮），150ms | |
| 展开 | `transition-[grid-template-rows,opacity] 300ms ease-out-strong`（ToolChips/TaskRows/StreamingText 来源），ThinkingState 400ms | |
| chevron | `transition-transform 200–300ms`，展开时 rotate(180deg)（本 Skill 取值，demo 已实现） | |

### 2. 关键帧（全部 [BUI]）

```css
@keyframes shimmer-text { from { background-position: 150% center } to { background-position: -50% center } }
/* 用法: background-image: linear-gradient(90deg, var(--ink-3) 35%, var(--ink) 50%, var(--ink-3) 65%);
         background-size: 200% 100%; background-clip: text; color: transparent;
         animation: shimmer-text 1.8s linear infinite; */
@keyframes fade-up  { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform:none } }  /* 300–400ms ease-out-strong */
@keyframes fade-in  { from { opacity:0 } to { opacity:1 } }                                              /* 150–350ms ease-out */
@keyframes pop-in   { from { opacity:0; transform: scale(.95) } to { opacity:1; transform: scale(1) } }  /* 140–300ms ease-out-strong，菜单 transform-origin 指向锚点 */
@keyframes spin     { to { transform: rotate(360deg) } }                                                 /* 700ms linear（行内 spinner），1.2s（重试图标） */
@keyframes pixel-on { 0%,100% { opacity:.15 } 18%,42% { opacity:1 } 62% { opacity:.15 } }
@keyframes eq-bounce{ 0%,100% { transform: scaleY(.35) } 50% { transform: scaleY(1) } }                  /* 听写音柱 900ms ease-in-out，每柱延迟 i*150ms */
@keyframes caret-blink { 0%,100% { opacity:1 } 50% { opacity:0 } }                                       /* 1s step-end；流式中不闪 */
@keyframes records-pulse { 0%,100% { opacity:.35; transform: scale(.8) } 50% { opacity:1; transform: scale(1) } } /* 1.1s，AI 列计算中 8px 圆点 */
```

### 3. 像素网格 Loader（Loading State）[BUI]

- 3×3 网格，单元 4×4px，gap 1.5px，`bg-ink`；Drive 方格 `rounded-[1px]`，Dots `rounded-full`。
- 静息透明度 0.15；Orbit 中心格不参与（透明度 0.07）。
- Drive/Dots：`delay = (col + |row-1|) * 90ms`（V 形“雪佛龙”波前向右推进），时长 650ms，循环比扫掠短 → 同时有两道波前。
- Orbit：顺时针外圈顺序 `[0,1,2,5,8,7,6,3]`，`delay = k*110ms`，时长 950ms（彗星绕圈）。
- 旁边：shimmer 标签（13px/500）+ 计时（mono 12px ink-3 tabular-nums，每 100ms 刷新一位小数，如 `4.6s`）。
- reduced-motion：网格冻结在暗态，计时继续。

### 4. 流式文字 [BUI]

- `StreamText` 原子：每 9ms 揭示 2 字符；最新 6 个字符包在 `.stream-tail`：`filter: blur(1.6px)` + `mask-image: linear-gradient(to right, #000 20%, rgb(0 0 0/.2))` —— 前沿“从模糊中显影”。
- 插入符：2px × 1.05em，radius 1px，`bg-ink`，`margin-left:1.5px`；流式中实心不闪，结束后 `caret-blink 1s step-end`。
- `StreamingText` 演示按词推进 `WORD_MS = 55`，完成后操作栏/来源/follow-ups `transition-opacity 400ms` 淡入。
- reduced-motion：去掉 blur 与 mask，插入符不闪。
- [DAU] 视口跟随：距底 ≤ 40px 才自动贴底；用户上滚立即冻结，出现“有新回复 ↓”按钮；代码高亮/图片加载造成的高度突变要补偿 scrollTop。

### 5. 高度动画模式

1. **grid-rows 0fr→1fr**（首选，无需测量）：外层 `display:grid; grid-template-rows: 0fr|1fr; opacity 0|1`，内层 `overflow:hidden; min-height:0`。
2. **测量高度**：ApprovalCard 视口 `height` 显式过渡；Thinking 时间线竖线 `height` 500ms 跟随内容。
3. Framer Motion 等价：`<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} transition={{duration:.3, ease:[0.23,1,0.32,1]}}>`。
4. [DAU] 注意：动画中途裁切边可能露出硬线 → 用渐变 mask；`overflow:hidden` 层不得承担阴影（阴影放外层）。

### 6. 滑动高亮（GlideMenu）[BUI]

一个绝对定位的 hover 层在菜单行之间滑动：`top 220ms ease-out-strong, height 220ms ease-out-strong, opacity 150ms ease`；高亮 `inset-x-1 rounded-[6px] bg-hover`（菜单容器 radius 10 + padding 4 → 内 6，符合同心圆 ✔）。Framer Motion 可用 `layoutId="glide"` 实现。

### 7. Framer Motion 预设（推荐实现）

```ts
export const ease = { outStrong: [0.23, 1, 0.32, 1], inOutStrong: [0.77, 0, 0.175, 1], link: [0.16, 1, 0.3, 1] } as const;
export const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.38, ease: ease.outStrong } };
export const popIn  = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.16, ease: ease.outStrong } };
export const expand = { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.3, ease: ease.outStrong } };
// 浮层可用轻阻尼 spring（DAU 偏好），避免过冲：
export const spring = { type: "spring", stiffness: 322.3, damping: 26.93, mass: 1 }; // = ANUI pop 预设（motion-advanced.md §2）
```

### 8. 必须遵守

- 全局 `@media (prefers-reduced-motion: reduce)` 把 animation/transition 压到 0.01ms（BUI 原有）；
- 切换主题时给 `<html>` 加 `.theme-switching` 冻结 transition，避免几百个颜色同时渐变（BUI 原有）；
- 动画期间不能阻塞输入与连击（DAU）；
- 不为装饰加动效；每个动效都能回答“它表达了哪个状态变化”。
