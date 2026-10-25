# 组件规范（Components）

每个组件：**用途 / 结构 / 状态 / 尺寸与令牌 / 动效 / 交互 / 推荐实现 / 无障碍 / DAU 工艺修正**。
数值来自 BUI 源码 className（`slev12397/beautiful-ui@44a274e`）；括号内 `→` 表示按“≤4 字号、最小 12px”规则映射后的值。未在源码中出现、由本 Skill 补齐的值标“未验证”（含义：设计取舍，未与原站对照）；本 Skill 的视觉令牌以 tokens.md 为准，此处的颜色名（accent、green、orange）在 ANUI 中已映射为单色（accent=ink，见 tokens.md §2）。
技术栈：React + Tailwind（tokens.md 的 v4 @theme）+ shadcn/Radix（Popover、DropdownMenu、Collapsible、Tooltip、Dialog、ToggleGroup）+ Framer Motion（或 `motion` 包，BUI 用的是 `motion@13`）。图标：BUI 用 Central Icons（round-outlined, radius 2, stroke 2）与 iconoir；替代可用 lucide（strokeWidth 2–2.4）。

通用工艺（所有组件）：
- 字号只用 12/13/14（+20）；字重 400/500，层级靠 ink/ink-2/ink-3。
- 描边统一 `shadow-hairline`（0.5px ring），不用 1px 实线 border 堆叠。
- 嵌套圆角：`R_in = max(0, R_out - padding)`。
- 文案无“·”中点；不加解释性副标题。
- 有阴影的元素，其裁切祖先需留 `offset+blur+spread` 余量，交付前跑 `scripts/clip-audit.js` 得 `cut === 0`。
- 演示用的定时器剧本 → 生产中改由真实事件（SSE/WebSocket 的 step/tool/approval 事件）驱动。

---

## 1. Loading State（加载）

- 用途：长任务等待。变体 Drive / Dots / Orbit / Surfer（Drive + 下方 16:9 媒体卡）。
- 结构：`[3×3 像素网格] [shimmer 标签] [计时]`，`gap 10px`，`role="status"`。
- 令牌：网格单元 4px、gap 1.5px、`bg-ink`；标签 13px/500 shimmer；计时 mono 12px ink-3 tabular-nums；Surfer 媒体卡 `w-56 rounded-[10px] shadow-overlay`，底 `--tooltip-bg`，说明 mono 10px（→12px）`--tooltip-muted`。
- 动效：见 motion-advanced.md 附录 §3（650ms/950ms，延迟 90/110ms 阶梯）。计时 100ms 刷新。
- 实现：纯 CSS 9 个 span + inline `animation-delay`；计时用 `performance.now()` 差值而非累加 setInterval（未验证，防漂移）。
- 无障碍：网格 `aria-hidden`；外层 `role="status"` + 文本标签可读；reduced-motion 冻结网格。
- DAU：计时必须从任务真实开始时间算；任务结束立刻切换为结果，不要“演完”动画。

## 2. Thinking（思考轨迹）

- 用途：可展开的推理过程。变体 Steps / Reasoning / Search / Coding。
- 结构：标题按钮（图标 + “Thinking”(shimmer) / “Thought for N seconds” + chevron）→ 展开区：左侧 1px 竖线时间线（`absolute left-[3px] w-px bg-line`，容器 `ml-[5px] pl-4`）+ 行列表 `flex-col gap-1 py-1`。
- 行：`h-6 px-1.5 gap-2`，前置 14px 图标（stroke ink-3）或 spinner（`size-3 border-[1.5px] border-line-strong border-t-ink-2`，spin 700ms）；主文 12.5px（→13px）`font-medium text-ink`；Reasoning 变体为 `leading-relaxed text-ink-2` 段落；次要信息 11.5px（→12px）ink-3（Coding 变体为 mono）；Coding 的 `+N −M` mono 11px（→12px）green/red。Search 变体用 `animated-underline`（280ms ease-link scaleX）。
- 状态：working（标题 shimmer，图标 ink-2）→ done（标题 ink-2，`fade-in 350ms`，图标 ink-3）；折叠/展开。
- 尺寸：容器 `max-w-95`（380px；BUI 自定义 spacing，95×4px）；标题按钮 `-mx-1.5 px-1.5 py-1 rounded-control hover:bg-hover-2`，13px/500。
- 动效：容器 `min-height 400ms ease-out-strong`；展开 `grid-rows 400ms`；竖线 `height 500ms`；新行 `fade-up 300ms`；chevron `rotate 300ms`。
- 实现：Radix `Collapsible`；行列表由 `reasoning_step` 事件追加；Framer `AnimatePresence` 做新行进入。
- 无障碍：按钮 `aria-expanded`；“Thinking” 文本放在 `role="status"` 内（BUI 原有）；完成后焦点不跳。
- DAU：过程层与结论层分离（三层披露）；完成后自动收拢成一行摘要，不占首屏；禁止把模型文本里的 `- [ ]` 当执行证据。

## 3. Streaming Text（流式回答）

- 结构：段落（13px leading-relaxed ink）+ 行内来源 chip（`h-4.5 rounded-[5px]`，12px 图标 favicon `size-3 rounded-[3px]` + 域名 mono）→ 操作栏（复制/重试/赞/踩：`size-6 rounded-[6px] text-ink-3 hover:bg-hover-2`）+ 来源堆叠（`-space-x-1` 头像 `size-3.5 rounded-full`，外圈 `0 0 0 1.5px var(--canvas)`）+ “10 sources” 12px ink-2 → 展开来源列表（`rounded-[10px] bg-inset p-1 shadow-hairline`，行 `rounded-[6px] px-1.5 py-1` 12px；同心：10−4=6 ✔）→ Follow-ups（标题 12px/500 ink-2；行 12.5px→13px，`rounded-[7px] border-b border-line px-1.5 py-1.5`，前置 ↵ 11px 图标 ink-3）。
- 状态：streaming（StreamText 模糊前沿 + 实心插入符）→ settled（插入符闪烁或移除；操作栏/来源/follow-ups 400ms 淡入）。
- 尺寸：`max-w-95`，演示 `min-h-[15.5rem]`（预留高度防跳动）。
- 动效：motion-advanced.md 附录 §4。
- 实现：token 流直接 append；Markdown 渲染用增量解析（未验证）；来源列表 Radix Collapsible。
- 无障碍：流式区域 `aria-live="polite"` 且 `aria-busy` 在流式中为 true（本 Skill 要求，BUI 未加）；插入符 `aria-hidden`；操作按钮需 `aria-label`。
- DAU：视口跟随 40px 阈值 + “回到底部”；follow-up 行 `border-b` 改为 0.5px hairline；来源域名 10.5px→12px。

## 4. Approval Card（人在回路审批）

- 用途：Agent 动手前提问/请求授权，可多问题分页。
- 结构：卡片 `max-w-80 rounded-card bg-surface shadow-card overflow-hidden`，入场 `fade-up 380ms`；右上关闭 `primitive-icon-button`（28px）`absolute right-2.5 top-2.5`；主体 `p-3`：问题标题 14px/500 ink（`pr-7` 避让关闭钮）→ 选项列表（GlideMenu，`mt-2.5 gap-1`）：行 `rounded-control pl-1 pr-2 py-1 gap-1.5`，单选圆点 `size-4`，选中时内点 `size-1.5 bg-canvas` scale 0→1（200ms），文字 13px（选中 ink，否则 ink-2）；最后一行是“自定义答案”输入（13px，placeholder ink-3）→ 页脚 `p-2.5 flex justify-between`：左侧 ‹ `1/3` › 分页（18px 按钮 `rounded-[5px]`，计数 12px/500 tabular-nums ink-3，disabled opacity .3），右侧按钮组（Button sm：27px 高 pill 13px；Skip=secondary，Continue/Approve=primary 墨色底）。
- 完成态：替换为 `pop-in 260ms` 的成功 pill（`bg-green-tint text-green rounded-full py-1 pl-1 pr-2.5` 12.5px/500，带 `size-4.5` 绿底白勾）+ “Undo/重置”文字按钮 12px ink-3。
- 动效：问题之间 `transform 360ms cubic-bezier(0.22,1,0.36,1)` 横滑，视口 `height` 同步过渡，非活动页 `aria-hidden` + opacity 过渡；自动前进 `ROLL_MS 400`。
- 实现：Radix `RadioGroup` 做选项（键盘上下键）；视口用 Framer `animate={{height}}` + `x: -index*100%`。
- 无障碍：视口 `aria-live="polite"`；选项 `aria-pressed`/radio 语义；关闭 `aria-label="Dismiss"`；Esc 关闭（本 Skill 要求）。
- DAU：**必须展示影响范围**（目标文件路径、命令、外部收件方）——写/删/外发操作在卡片里列出对象；只读操作不弹审批；“拒绝/超时”后任务优雅暂停；就近决策（卡片出现在消息流当前位置，不弹全局 modal）；问题标题不加解释副标题；卡片圆角 10 + padding 12 → 内部选项行圆角应 ≤ 0~2（BUI 用 8，**按 DAU 规则改为 `rounded-[4px]` 或把卡片 padding 收到 4px 让行使用 6px**——推荐后者用于菜单型、前者用于表单型）。

## 5. Tool Chips（工具调用）

- 结构：头部按钮（chevron 12px + “Used N tools / Edited N files” 12.5px→13px ink-2 tabular-nums）→ 展开列表 `gap-1`：行 `h-7 rounded-control px-[3px] gap-2 hover:bg-hover-2`：16px 图标位（默认显示工具图标，hover/展开时交叉淡入为 chevron，100/150ms）+ 标签 12.5px/500→13px ink + 参数 chip（`h-5.5 rounded-chip bg-field px-1.5 text-[11.5px]→12px ink-2 shadow-hairline truncate`，mono 可选）→ 行展开详情：`ml-2 pl-3.5 border-l border-line`，行 11.5px→12px `leading-[1.6]`，add 行 green → 底部文件 diff chips：`mt-2.5 pt-2.5 border-t border-line flex-wrap gap-1.5`，chip `h-7 rounded-chip px-2 gap-2 mono 11.5px→12px`，`+N` green、`−M` red，依次 `fade-in 300ms`，延迟 `i*80ms`。
- Diff 悬浮预览：body portal 渲染（避免被带 transform 的父级裁切/错位），`fixed z-50 w-72 rounded-[10px] bg-surface shadow-overlay`；头 `px-2.5 py-1.5 border-b mono 11px→12px`；正文 mono 11px→12px `leading-[1.8]`，行前缀列 `w-3`。
- 状态：pending（参数 chip 可 shimmer，未验证）/ running / done / error（red-tint chip，未验证：BUI 无错误态）。演示 `STEP_MS 700` 逐步出现。
- 实现：Radix `Collapsible`（每行）+ `HoverCard`/`Popover`（diff 预览，自带 portal 与碰撞检测）。
- 无障碍：每行 `aria-expanded`；diff chip `aria-label="Show diff for {file}"`，focus 也能打开预览、blur 关闭（BUI 原有）。
- DAU：一次工具调用 = 一行（发起、参数、状态、结果同处），不要每个事件打一行；“已受理 ≠ 已执行”；`border-l` 详情线是时间线不是卡片彩条，允许，但用 0.5px hairline 色 `--line`；portal 浮层阴影 overlay 外扩 36px，确保不在 overflow 容器内。

## 6. Task Rows（任务行）

- 变体：Capsules（每行独立胶囊卡 `bg-surface shadow-card`，行间 `gap-2`）/ List（单卡 `rounded-card shadow-card`，行 `border-b border-line last:border-0`）。
- 行头：`h-11 px-2.5 gap-2.5`：24px 状态位 → 标题 13px/500 ink truncate → 金额/指标 12.5px→13px ink-2 tabular-nums → 状态 pill → chevron 28px 位（`-ml-2 rounded-full ink-3`，rotate 300ms）。
- 状态位：running = 进度环（size≈22，底环 `--line`，弧段 `dasharray c*0.28 c*0.72` 旋转；或 ProgressRing 用 `dashoffset = c*(1-progress)`，中心数字 10.5px→12px/600）；failed = `size-5.5 rounded-full bg-red` 白色图标 `pop-in 300ms`；done = 同尺寸 `bg-green`。
- 状态 pill：`h-5.5 rounded-full px-2 text-[11.5px]→12px font-medium`：Done `bg-green-tint text-green`；Failed `bg-red-tint text-red` + 旋转重试图标（spin 1.2s）；Retrying/Recovered `fade-in 200ms`。
- 展开详情：grid-rows 300ms；`grid-cols-[24px_1fr] gap-2.5 px-2.5 mb-2.5`，左列 1px 竖线 `bg-line` 与状态位中轴对齐；明细行 `label 12px ink-2` ↔ `值 mono 11.5px→12px ink-3 tabular-nums`。
- hover：行 `hover:bg-inset`，`transition-[border-radius,background-color] 300ms`。
- 实现：Radix `Accordion type="multiple"`；状态由任务事件驱动。
- 无障碍：行头按钮 `aria-expanded`；状态 pill 文字可读（不要只靠颜色）；进度环 `role="progressbar" aria-valuenow`（本 Skill 要求）。
- DAU：失败行保留错误原因与已完成部分，提供“安全重试”；“停止请求已发出”与“已停止”分两个状态；Capsules 卡片 radius 10，内部无嵌套圆角元素。

## 7. Chat（ChatComposer 聊天面板）

- 用途：带标签页的会话面板，用户发送后才开始回复序列。
- 外壳：`flex h-[288px] w-full max-w-95 flex-col overflow-hidden rounded-[14px] bg-surface shadow-card`（固定高度，内部滚动）。
- 顶栏：`flex shrink-0 items-center justify-between border-b border-line p-1.5`；标签 `rounded-[6px] px-2 py-[3px] text-[13px] text-ink`，激活 `bg-hover-2`，非激活降低不透明度（`transition-[background-color,opacity] 100ms`）；右侧 3 个 24px 图标按钮（新建、历史、更多）。
- 消息区：`flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pt-2.5 pb-1`。用户消息 `flex justify-end pl-14` 内气泡（未验证：`rounded-[10px] bg-hover-2 px-2.5 py-1.5 13px`）；Agent 回复 `flex w-full flex-col gap-1.5`，`transition-[opacity,filter,transform] 400ms` 进入；推理行 `flex items-center gap-1 text-[12px] leading-[1.3]`：步骤名 `font-medium text-ink` + 来源 `text-ink-2` + “for 4s” ink-3；正文 `text-[13px] leading-normal text-ink`。
- 输入：`mt-auto shrink-0 p-1.5` 内 `flex cursor-text flex-col gap-2 rounded-control border border-line bg-field p-2.5 shadow-[0_1px_2px_rgba(0,0,0,.035)]`，focus-within `border-line-strong`；textarea `min-h-4.5 bg-transparent text-[13px] leading-[1.4]`；右下 24px 发送钮。
- 动效：回复 `fade-up 400ms ease-out-strong`；推理行先 shimmer，完成后换成用时。
- 实现：消息流虚拟化（长会话）、Radix Tabs；发送走 Prompt Bar 同款 IME 守卫。
- 无障碍：消息区 `role="log" aria-live="polite"`（本 Skill 要求）；标签 `role="tab"`。
- DAU：每个标签页草稿独立保存；视口跟随 40px 阈值；`border` 改 0.5px；12px 推理行已满足下限。

## 8. Prompt Bar（输入框）⭐

- 变体：Rounded（`rounded-[14px]`，tall 时 `rounded-[22px] p-3.5 gap-2.5`）/ Pill（单行 `rounded-full`，有附件或宽布局 `rounded-[24px]`）。
- 外壳：`relative isolate flex-col overflow-hidden border border-line bg-surface shadow-card p-1.5 gap-1.5`，`focus-within:border-line-strong`，`transition-[border-color,border-radius] 150ms`。
- 布局：grid `grid-cols-[28px_minmax(0,1fr)_auto_28px_28px] items-end gap-x-1`：[+ 附件/来源 28px] [textarea] [模型选择] [听写 28px] [发送 28px]；宽布局时 textarea 独占第一行，按钮在第二行。
- 输入：13px/18px，`min-h-7 px-1 py-[5px]`（tall：14px/20px `min-h-[68px] p-2`），`resize-none bg-transparent [overflow-wrap:anywhere]`，placeholder “Write a message…” ink-3；自动增高：`height = clamp(scrollHeight, min, 100px)`，超出 `overflow-y:auto`。
- 附件 chips：`h-6.5 bg-field shadow-hairline py-1 pl-1.5 pr-1 text-[11.5px]→12px ink-2`，名称 `max-w-36 truncate`，移除按钮 `size-6 hover:bg-line/70`。
- 模型按钮：`h-7 px-1.5 gap-1 text-[12px] font-medium ink-2 hover:bg-hover`；菜单：`w-44 rounded-[10px] bg-surface p-1 shadow-raised`，行 `h-7.5 rounded-[6px] px-2` 名称 12.5px→13px/500 + tag 11px→12px ink-3 + 勾选；**菜单在被 overflow 裁切的 composer 外部渲染并测量对齐**（BUI 原注释）。切换模型时 composer 内播放 glimm（WebGL 彩虹扫光，`easeOutExpo`）。
- @ / 斜杠菜单：从 composer 顶边向上长出 `absolute inset-x-0 bottom-full mb-2 rounded-[10px] bg-surface p-1 shadow-raised`；行 `h-9 rounded-[6px] px-2 gap-2.5`：22px 图标 + 名称 12.5px→13px/500 + 描述 12px ink-3 truncate + 右侧“Connect”12px/500；底部提示 `border-t px-2 pt-1.5 text-[11px]→12px ink-3`；GlideMenu 高亮 220ms。触发：正则匹配光标前 `@query` 或 `/query`，按前缀过滤。
- 听写：按钮 `aria-pressed`，录音中显示 4 根 `w-[2.5px]` 音柱 `eq-bounce 900ms` 错峰 150ms；placeholder 变为“Listening…”。
- 发送：`size-7`（Rounded `rounded-[8px]`，Pill `rounded-full`），可发送时 `bg-ink text-surface`，否则 `bg-line-strong text-ink-2` + disabled；`enabled:active:scale-[0.94]`；箭头图标 16px stroke 2.4。
- 实现：textarea 优先 `field-sizing: content` + `max-height`，回退 scrollHeight 测量；菜单用 Radix `Popover`（`side="top"`，portal，避免被 `overflow-hidden` 外壳裁切）或 cmdk；模型选择 Radix `DropdownMenu`。
- 无障碍：textarea `aria-label="Prompt"`；所有图标按钮有 `aria-label`；菜单 `aria-expanded`；@ 菜单需 `role="listbox"` + `aria-activedescendant` 并支持 ↑↓ Enter Esc（未验证：BUI 用 onKeyDownCapture 接管）。
- **DAU 修正（必做）**：
  1. **IME 守卫**：BUI 只判断 `!event.nativeEvent.isComposing`，不够 → 加 `compositionend` 时间戳，500ms 内的 Enter 视为伴生键拦截并**立即复位时间戳**；Shift+Enter 换行。
  2. 自动增高上限：BUI 100px 偏低，桌面工作台建议 240–320px；外壳高度过渡用非对称缓动（增高快、收缩柔）；超出后**局部**隐藏滚动条（`scrollbar-width:none`），保留滚轮/键盘。
  3. 外壳 `overflow-hidden` 只为裁切 glimm canvas 与圆角——阴影 `shadow-card` 在同一元素上不受影响，但**父级**滚动容器需留阴影余量；菜单必须 portal 或放在外壳外。
  4. 草稿/附件按会话隔离保存；发送中禁止重复提交；运行中发送键变“停止”。
  5. `border border-line` 1px → 0.5px（或用 `shadow-card` 自带 ring，去掉 border）。

## 9. Recommendation Card（推荐卡）

- 结构：`w-full max-w-95 overflow-hidden rounded-card bg-surface shadow-card`。主体 `primitive-card-pad`(12px)：标题 14px/500 ink（如“要下这笔补货订单吗？”）→ 正文 `mt-1.5 min-h-12 text-[13px] leading-relaxed text-ink-2`，内嵌 EntityChip（圆形 logo + `font-medium text-ink`）与 ValuePill（如交期 `7 days`，green-tint 小 pill）。
- 页脚：`primitive-card-footer flex items-center justify-between gap-3 bg-surface`：左侧置信度计 = 3 根 `w-1 rounded-full` 递增高度竖条（`flex items-end gap-0.5`，点亮色随档位，`transition-colors 300ms`）+ 标签 `12.5px/500 ink-2`（→13px）；右侧 `Alternatives`（secondary sm）+ `Accept`（accent sm）。
- 备选抽屉：卡片下方 `grid-rows 300ms`，`border-t border-line bg-surface px-2 py-2`：分组标题 `px-1.5 pb-1 text-[11px]→12px font-medium ink-3`；行（未验证 h-9）`px-2.5 text-[12.5px]→13px`：置信度条 + 名称 truncate + 右侧 `11px→12px ink-3` 元信息。选中某项“晋升”为主推荐，正文 `fade-in 180ms`；抽屉曲线 `cubic-bezier(0.16,1,0.3,1)`。
- 完成态：成功 pill（同 Approval Card）。
- 无障碍：Alternatives `aria-expanded`；置信度要有文字（“高置信度”）。
- DAU：卡片外形不跳（抽屉在卡内展开）；确认前说明会发生什么（下单对象/金额）。

## 10. Context Cards（检索上下文）

- 容器：`flex w-full max-w-95 flex-col gap-2`；头部 `flex items-center gap-2 px-0.5`：“All chunks” `13px/600 ink` + 计数 `h-5 rounded-md bg-inset px-1.5 11.5px→12px/500 ink-2 shadow-hairline tabular-nums`。
- 片段卡：`overflow-hidden rounded-card bg-surface shadow-card`；卡头 `primitive-card-bar(10px 12px) flex items-center gap-2.5 border-b border-line`：图标 + 标题 `13px/500 ink truncate` + 右侧字符数 `ml-auto 12px ink-3 tabular-nums`；正文 `px-3 pt-2 pb-1 text-[12.5px]→13px leading-relaxed ink-2`；来源 `px-3 pb-3` 内 chip（`h-6`，`shadow-btn`，`size-3.5 rounded-[4px]` 彩色文件徽标——源码徽标内字母为 7px，**违规**，改为图标或 12px 以上）+ 移除 ×。
- 动效：每张卡 “只进场一次” `fade-up 400ms ease-out-strong`，之后常驻；来源 `fade-in 400ms`。
- DAU：上下文可单条移除；明确是 Agent 实际读取的块。

## 11. Diff Table（表格差异）

- 外壳：`w-full max-w-95` → `relative overflow-hidden rounded-card bg-surface shadow-card`。
- 卡头 `primitive-card-bar flex justify-between border-b border-line`：标题 `12.5px/500 ink`（→13px）+ 提示 `11px ink-3`（→12px，“点击变更行可切换”）。
- 表格 `w-full table-fixed border-collapse`；表头 `primitive-table-cell 12px/500 ink-3`；单元格 `primitive-table-cell(10px 12px)`：名称 13px/500、类别 pill（`h-5.5 rounded-full bg-surface|bg-inset px-2 11.5px→12px/500 shadow-hairline` + `size-1.5` 部门色点）、供应商 12.5px（→12px mono）。行 `border-b border-line`。
- 变更行：删除 = red-tint 底 + red 文字（未验证加删除线），新增 = green-tint 底 + green；右侧 18px 方形勾选（选中为红/绿实底白勾）。**每个变更行本身就是开关**（点击纳入/排除），`transition-colors 200ms`。
- 扫描动画：提议只播放一次并停在完成态（行逐条出现 `fade-up 180ms`）。
- 页脚 `primitive-card-footer min-h-11 border-t`：“2 处删除 1 处新增” `11.5px→12px ink-3 tabular-nums` + `Apply N changes`（accent sm）；应用后 `pop-in 180ms` 成功 pill（`size-4.5` 绿勾）。
- 无障碍：变更行 `role="checkbox" aria-checked` + Space/Enter 切换（未验证，BUI 用 button 行）。
- DAU：Apply 前显示影响范围；区分“预览”与“已写入”；0.5px 行线。

## 12. Records Table（AI 表格）

（数值全部来自 globals.css `.records-*`）
- 外壳 `.records-shell`：`border 1px line; radius 10px; bg surface; shadow 0 1px 2px /.06`；`is-fill` 模式去掉边框圆角阴影并撑满父容器。
- 工具栏：`min-height 52px; padding 8px 10px; border-bottom 1px line-strong`，左右 `gap 4px`；按钮 `h 32px, radius 8, px 10, 12px/500, gap 7`，`transition 140ms ease-out-strong`，`active scale .96`；quiet（ink-2，active 态 accent-tint/accent-ink）、secondary（1px tooltip-border）、primary（accent 白字，hover `saturate(.9) brightness(1.04)`）；筛选激活点 5px accent。
- 筛选/排序菜单：`w 190, p 6, border 1px line-strong, radius 10, shadow-overlay, pop-in 160ms, origin top-left`；分组标签 10.5px uppercase 0.04em（→12px）；项 `7px 8px, radius 6, 12px ink-2`，hover/selected `bg-hover ink`；勾 13px 宽 accent-ink。
- 滚动区：`max-height 438px; overflow auto; overscroll-behavior none; scrollbar-color line-strong transparent; scrollbar-gutter stable`；focus 时 `outline 2px accent offset -2`。
- 表格：`min-width 990px; separate/0 spacing; 13px/500; table-layout fixed`；列宽 270/275/190/210/175；单元格线 `1px mix(line 78%, transparent)` 右+下。
- 表头：sticky top，`h 35px; bg surface; 12.5px/500 ink-2`（→13px）；按钮 `px 12, gap 8`，hover `bg-hover ink`；排序图标 hover 才显（120ms）；列宽拖拽手柄 12px 宽热区，内 2px accent 竖条 `opacity 0→1, scaleY .65→1`。
- 首列 sticky left：`bg surface; box-shadow 5px 0 8px -10px /.4`（滚动时的分隔阴影）；公司格 `gap 4, pl 6`：行号 `24×24 11.5px→12px ink-3 tabular`，hover/选中切换为复选框（24 热区，18 方框 radius 6，light 边 `oklch(0.845 0.011 247.953)`，选中 accent 底白勾，`active scale .96`）；公司徽标 `20×20 radius 6 bg-field 10px→12px/500`；名称 13px/500 truncate，带链接时 hover accent-ink 下划线 offset 3。
- 行：`h 35px; px 8`；hover `bg-hover`（120ms）；选中 `mix(accent 7%, surface)`；被配置的列：表头 `mix(accent 8%)` + `inset 0 2px 0 accent` 顶线，列格 `mix(accent 4%)`，hover 8%，选中 10%。
- 标签 `.records-tag`：`h 23, max-w 115, radius 8, px 7, 13px/500`；`--tag-base` color-mix（light 文字 92%/底 18%/边 32%，dark 文字 86% white/底 34%/无边）；溢出 “+N” `h 23 radius 6 bg inset 11px→12px ink-3`；用隐藏测量层计算能放下几个标签。
- 关系强度：8px 圆点 + ink-2 文字；链接 accent-ink 下划线 35% 透明，hover 变 ink。
- AI 列计算：8px accent 圆点 `records-pulse 1.1s`，逐行出结果。点击表头打开“属性配置”popover（类型、工具、grounding、输入、prompt、Run）。
- 表尾：sticky bottom，`h 35, bg inset, 14px/500 ink-2`（→13px），数字 ink tabular；“+ Add calculation” ink-3 hover ink；第二计算行 `bottom 35px` 叠放；底部信息条 `min-h 35, px 12, 11.5px ink-3`（→12px），提示 hover 外壳才显（160ms）。
- 响应式：≤640px 工具栏纵向；触屏 `@media (hover:none)` 中和 hover 色。
- DAU：线条 0.5px；popover portal；虚拟滚动（大数据，未验证）。

## 13. Filter Table（筛选表）

- 结构：`w-full max-w-105`；筛选条 `-mx-1 mb-1 flex items-center gap-1 overflow-x-auto px-1 py-1`：chip（`h-6.5`，激活 `bg-surface shadow-btn`，内含 `size-1.5` 状态点 + 名称 + 计数 ink-3）；表 `overflow-x-auto rounded-card bg-surface shadow-card`，`min-w-[420px]`，CSS grid 列 `minmax(0,1.3fr)_0.6fr_0.95fr_0.9fr`，表头 `12.5px/500 ink-2`（→12px），单元格 `px-3 py-2`，右边线 `var(--grid-line)`；任务名 `truncate font-medium ink`，日期 `ink-2 tabular-nums`，状态 pill 用 `.filter-status-*`（todo `oklch(0.757 0.153 66.401)`、progress `0.671 0.118 219.351`、done `0.652 0.131 162.865` 派生）。
- 动效：过滤结果 `grid-rows 300ms`；chip 切换 200ms。
- DAU：筛选 chip 用 `role="tab" aria-selected`；状态不只靠颜色（有文字）。

## 14. Sidebar Nav（侧栏）

- 几何：一棵固定 224px 宽的树被 52px 外壳裁切（`relative flex shrink-0 overflow-hidden transition-[width]`），所有图标中心固定在 x=26，折叠时不重排；行 `.sidebar-row` 208 ↔ 36px；文案 `.sidebar-copy` 折叠时 `opacity 0 + translateX(-offset)`；时长/曲线来自 CSS 变量 `--sidebar-copy-duration`、`--sidebar-easing`（值在 TSX 中，未验证 ≈ 200–300ms + `cubic-bezier(0.16,1,0.3,1)`）。
- 顶部 `relative mb-2.5 h-10`：工作区切换 `absolute left-2 top-1 h-8 w-[164px] rounded-[8px] px-2 hover:bg-hover-2 active:scale-[0.99]`，logo `size-6 rounded-[7px] bg-ink 11px/600 text-surface`（→12px），名称 14px/500；收起钮 `absolute right-2 top-1 size-8`；折叠后显示展开钮 `left-2 top-0.5 size-9`。
- 主导航 `group/glide flex flex-col gap-px`：行 `relative z-10 flex h-9|h-10 items-center gap-1.5 rounded-[8px] px-2`，图标 `size-5 ink-2`，文字 `14px/500`（激活 ink，否则 ink-2），快捷键 `12px/500 ink-3 tabular-nums`；GlideMenu 高亮 `left/right 8px`，折叠时宽 36。
- 聊天区：`mx-2 mt-3 w-[208px] border-t border-line pt-3`；分组标题 + 搜索按钮，展开为 `h-8 rounded-[8px] bg-field shadow-hairline` 输入（13px/500）；条目 13.5px（→13px）truncate；空结果 `px-2 py-2 12.5px ink-3`（→12px）。
- 底部 `Upgrade`：`h-8 w-full rounded-control bg-hover-2 12.5px/500`（→13px），hover `bg-line-strong`，`active scale .98`。
- 工作区菜单：`fixed z-50 w-64 rounded-[14px] bg-surface p-1.5 shadow-overlay`（同心：14−6=8 → 行 8px ✔）。
- DAU：折叠态给 tooltip/`title`；后台线程状态点；导航可键盘到达。

## 15. Search（命令搜索）

- `flex min-h-[248px] w-full max-w-72 flex-col`；面板 `w-full overflow-hidden rounded-card bg-surface shadow-raised`；输入行 `flex h-10 items-center gap-2 border-b border-line px-3 hover:bg-hover`，input 13px；结果 `flex flex-col gap-px`（GlideMenu）行 `h-8 rounded-[6px] px-2 13px ink`；空状态 `flex flex-col items-center gap-1 px-4 py-8`：`size-8 rounded-control bg-inset shadow-hairline` 图标框 + 标题 13px/500 + 说明 12px ink-3；进出 `fade-in 150/200/250ms`。
- DAU：combobox/listbox 语义；↑↓ 选择；Enter 执行需 IME 守卫。

## 16. Flowchart（流程图）

- 画布：`relative w-full select-none overflow-hidden rounded-card bg-page shadow-hairline` + 点阵背景（未验证 `radial-gradient` 16px 网格）。
- 节点：`absolute flex -translate-x-1/2 touch-none flex-col items-start gap-1.5`；上方类型标签 `h-6 rounded-[6px] px-2 11.5px→12px/500`（Trigger 紫/蓝调、If/Else 橙调 tint）；卡片 `w-full rounded-[18px] bg-surface shadow-card hover:shadow-raised`（150ms）。
  - Trigger：`flex items-center gap-2.5 p-2.5`，`size-9 rounded-[8px]` 图标块（同心：18−10=8 ✔）+ 标题 `13px/600 leading-tight` + 描述 `mt-0.5 12px leading-snug ink-2`。
  - If/Else：`flex flex-col gap-1.5 px-3 py-2.5`；每行：拖拽柄 `ink-3/70` + 关键词 `w-7 12.5px ink-2`（if/and）+ chip（`h-6 rounded-[6px] bg-surface px-1.5 12px/500 shadow-btn`，带图标）+ 操作符 + 值下拉（`size-1.5` 色点 + 值 + chevron）；多行值 `pl-[49px]` 对齐。
- 连接线：测量两卡位置绘制 SVG 曲线，`transition-[stroke] 150ms`（拖拽时高亮）。卡片可拖动，连接线跟随。
- 下拉：与模型选择同款菜单（`rounded-[10px] p-1 shadow-raised`，行 `h-7.5 rounded-[6px] px-2`，GlideMenu 220ms，`pop-in 180ms`）。
- DAU：拖拽时 Esc 取消并复位；菜单 portal；指针捕获。

## 17. Insight Cards（洞察卡）

- 容器 `min-h-[408px] w-full max-w-86`；头 “Insights N ‹ ›”：标题 `13px/600` + 计数 `13px ink-3 tabular-nums` + 两个翻页按钮。自动轮播，**用户一操作就停止**。
- 洞察句 `mt-1.5 12.5px leading-relaxed ink-2`（→13px），内嵌实体 `inline-flex items-center gap-1 font-medium text-ink` 与金额 `font-mono 11.5px`（→12px）red/green；切换 `transition-[opacity,filter] 250ms`。
- 卡片 `min-h-[278px] rounded-card bg-surface p-3 shadow-hairline`：两组统计（`flex gap-4`）：系列名 `12px/500 ink` + `size-2` 色点，涨跌 `17px/600 tracking-[-0.01em] tabular-nums`（→20px display），金额 mono 11.5px（→12px）。
- 图表：`mt-2 overflow-hidden rounded-control bg-inset shadow-hairline`，顶栏 `px-2.5 py-1.5 border-b`：“Trend snapshot” 11px（→12px）+ “Snapshot” pill `rounded-full bg-field px-2 py-0.5 10.5px`（→12px）；舞台 `.insight-chart-stage relative h-[166px] overflow-hidden`，用 liveline 绘制实时线；游标 1px ink opacity .26；tooltip（见 tokens：`px 9 py 5 radius 8 tooltip-bg border line-strong shadow-overlay 11.5px→12px tabular`，系列点 8px）锚点 `top 8px translateX(-50%)`；触屏 `touch-action: pan-y`。
- 底部：分段控件 `mt-3 h-9 rounded-full bg-field p-0.5`（内滑块 `bg-white/20 duration-500`）与追问按钮。
- 源码另有 8px 字符徽标（**违规**，改 12px 或图标）。
- DAU：轮播可暂停、可键盘翻页；图表提供数值文本替代（`aria-label` 摘要）。

## 18. Code Block（代码块）

- 外壳 `w-full max-w-105 overflow-hidden rounded-card bg-surface shadow-card`；头 `flex h-11 items-center gap-2 border-b border-line px-4 text-[12.5px]`（→13px）：代码图标 ink-3 + 文件名 `font-mono leading-none text-ink truncate` + 右侧（Code：Copy 按钮；Diff：`+N −M` mono 12px tabular）。
- 正文 `py-3 font-mono text-[12.5px]→12px leading-[1.65] ink-2`；行 `grid grid-cols-[20px_minmax(0,1fr)] items-start`，行号 `select-none text-center 11px→12px ink-3`，竖线 `absolute inset-y-0 left-5 w-px bg-line`；代码 `pr-3 pl-1 break-words whitespace-pre-wrap`（自动换行而非横滚）。
- Diff：old/new 两列行号；增删行 tint 底 + `absolute inset-y-0 left-0 w-[3px]` 色条（DAU：改 2px，属代码 gutter 允许）；词级高亮 `rounded-[3px]` 色块；行号随增删上色。
- 语法色（未验证，取自截图）：关键字 accent-ink、字符串 orange、其余 ink/ink-2。
- DAU：复制按钮反馈“已复制”；长行换行保证不出横向滚动。

## 19. Fine-tune Card（参数微调）

- 外壳 `relative w-full max-w-60 rounded-card bg-surface shadow-raised`。
- 头 `primitive-card-bar border-b`：标题 13px/500 + “Adjust” 按钮（`size-4.5 rounded-[5px] border border-accent/30 bg-accent-tint` 加号 + 文字 accent-ink）。调整中文字 shimmer 12px/500，完成变 green “已调整”（`flex items-center gap-1.5 12px/500 text-green`）。
- 布局区 `primitive-card-pad flex flex-col gap-2 border-b`：标签 12.5px/500（→12px）；分段 `relative grid grid-cols-3 rounded-control bg-field p-0.5`，滑块 `absolute inset-y-0.5 rounded-[6px] bg-surface shadow-btn transition-transform 300ms`（同心：8−2=6 ✔）。
- 数字字段 `grid grid-cols-2 gap-2`：字段（未验证 `h-6.5 rounded-[6px] bg-field px-2 shadow-hairline`）标签 `11.5px ink-3`（→12px）+ input `12px tabular-nums`；**擦洗**：hover 标签出现 ↔ 光标，拖拽改值；↑/↓ 步进、⇧×10；可直接输入。
- 类型下拉 `primitive-card-footer`：触发器 `relative w-30`，菜单 `absolute right-0 bottom-8 z-10 w-30 rounded-[10px] bg-surface p-1 shadow-raised`，`pop-in 200–250ms`；未选时 ink-3 占位。
- 实现：pointer capture + `movementX`；`inputMode="decimal"`；值变化实时作用到画布对象。
- DAU：结构化控件优于打字；Agent 调整过程要可见（shimmer）且可撤销。

## 20. Selection Actions（选中操作）

- 段落 `text-[13px] leading-relaxed text-ink`（容器 `relative select-none pb-12`，max-w 460）；选区高亮 `box-decoration-clone rounded-[3px] bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))]`，dark 用 accent-tint。
- 操作条：`absolute top-0 left-0 z-10` 定位到选区末行下方；本体 `flex h-9 w-fit items-center gap-0.5 overflow-hidden rounded-full bg-surface p-1 shadow-overlay`（同心：18−4=14 → 内部按钮 `rounded-full` size-7 ✔）；输入 `h-7 pr-2.5 pl-3 12.5px`（→13px）placeholder “Describe edits”；分隔 `mx-0.5 h-4 w-px bg-line`；动作按钮 `h-7 px-2.5 12.5px ink-2 gap-1.5`（Explain / Improve）；更多/发送 `size-7 rounded-full`（发送 `bg-ink text-surface active:scale-[0.94]`）。
- 状态机：idle → 输入/选择动作 → working（spinner `size-3 border-[1.5px]` 700ms + 文案）→ 结果流式替换选中文本（StreamText）→ 完成（接受/撤销）。各段用 `transition-[max-width,opacity,transform] 400ms` 收展；条随文本重排 `transform 320ms ease-out-strong` 移动，`opacity 180ms`，入场 `pop-in 220ms`。
- DAU：浮条 portal 防裁切；保留原生选择语义；Esc 关闭；输入框 IME 守卫。

## 21. Agent Screen（Agent 屏幕）

- 静息卡：框住屏幕截图（`relative min-h-0 overflow-hidden rounded-[8px] bg-inset`，外层 `shadow-card`），hover 遮罩 `bg-[rgba(17,19,24,0)] → 0.18`（150ms），中间浮现 accent “Open” pill（`translate-y-1 opacity-0 → 0/1`，150ms）；标题 `mt-2.5 px-0.5 13px/500 ink truncate`；装饰光标 `drop-shadow(0 1px 1.5px rgba(0,0,0,.35))`。
- 查看器：`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6`，遮罩 `bg-black/60 dark:bg-black/75`；窗口 `relative flex max-h-full flex-col overflow-hidden rounded-[16px] bg-surface p-2 pt-0 shadow-overlay`（同心：16−8=8 → 屏幕 `rounded-[8px]` ✔）；顶栏 `h-11 justify-between px-1.5`；“Teach a task” 开始录制，按钮变 `bg-red text-white h-[27px] rounded-full pl-2.5 pr-3 13px/500`。
- 录制中收起：卡片显示 REC 徽章 `rounded-full bg-red-tint py-0.5 pl-1.5 pr-2 11.5px→12px/500 tabular-nums text-red` + 计时。
- Loading 变体：内部模拟浏览器骨架（地址栏 `bg-field font-mono 9px`——**违规**，改 12px 或用纯骨架条 `h-1.5 rounded-full bg-line(-strong)`）。
- `streamSrc` 可传入真实图片/视频流。
- DAU：录制状态真实；打开查看器时 `scrollbar-gutter: stable` 防跳；Esc 关闭，焦点移入/归还。

## 原子组件（Atoms）

- **Button**：pill；`active:scale-[0.96]`，150ms；变体 primary（`bg-ink text-canvas` + `inset 0 1px 0 rgba(255,255,255,.14)`）、secondary（`bg-surface shadow-btn hover:bg-inset`）、ghost（`bg-hover-2`）、accent、success、quiet；尺寸 xs `h-7 px-2.5 12px/400`、sm `h-[27px] px-3 13px`、md `px-4 py-[9px] 14px`。
- **Chip**：mono 12px `rounded-md px-1.5 py-0.5`，tone neutral(inset/ink-2)/accent/orange。
- **StatusPill**：`h-6 rounded-full px-2.5 13px/500` + `size-1.5` 圆点；tone green/orange/red/accent/neutral。
- **Shimmer**：见 motion-advanced.md 附录。
- **StreamText**：见 motion-advanced.md 附录 §4。
- **ProgressRing / SegmentedControl / Switch / EntityChip / ValuePill / TextRow**：源码存在，作为上面组件的依赖复用。
- **GlideMenu**：单一 hover 层在菜单行间滑动（220ms）。
