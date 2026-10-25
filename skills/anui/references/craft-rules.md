# 工艺规则（Craft Rules，精简自 desktop-agent-ui，MIT）

> 上游：https://github.com/Ludi-Herry/desktop-agent-ui （commit 44653f9，© 2026 Desktop Agent UI Contributors，MIT，见 ../../../THIRD_PARTY_LICENSES.md）。本文为精简改写。

## A. 视觉精致度八条铁律

1. **禁用中点 “·” 分隔符**：用 `gap`、0.5px 竖线（高 8–10px）或弱色标签代替。
2. **删掉冗余解释文案**：不加副标题、slogan、说明书式提示；让布局说话。
3. **文案场景化**：贴合目标人群、长度匹配控件尺寸、不生造词、不轻佻。
4. **光学对齐 + 同心圆角**：`R_inner = max(0, R_outer − padding)`；`padding ≥ R_outer` 时内层 0–2px；非对称图标做 1px 级光学补偿。
5. **0.5px hairline**：`border: 0.5px solid` 或 `box-shadow: inset 0 0 0 0.5px`（本 Skill 用 `--ring-w`）。
6. **字号 ≤4 种（推荐 3 种），最小 12px**：层级靠字重 400/500/600、灰阶、间距。
7. **决策负荷收敛**：可推断就默认；必须决策时放在用户本来要操作的位置（卡片底部/输入条），不弹突兀 modal；功能按 P0/P1/P2 归位。
8. **克制圆角和阴影，禁止左边缘彩条卡片**：阴影只服务层级（基底卡低/无、Popover 中、Modal 高）。

## B. 状态与控制权

- 状态严格对应真实事件：草稿 / 排队 / 运行 / 等待授权 / 完成 / 失败 / 已终止；**禁止用计时器或动画伪造进度**。
- RICH 控制权：可见（当前步骤、受影响文件）、可解释（依据与范围）、可介入（编辑草稿、暂停、补充）、可收回（停止、回滚、撤销；“已请求停止”≠“已停止”）、可追责（日志、Diff、版本）。
- 授权按影响分级：只读自动放行；写/删/外发展示对象与范围。
- 分层：对话层 / 思考过程层（可折叠时间线，完成后收拢）/ 工具卡（一次调用一张卡）/ 产物层（独立面板，可独立滚动）。
- 多会话：草稿与附件按线程隔离持久化；后台线程等待授权或失败时侧栏出状态点；断线恢复先拉服务端快照，不重放副作用请求。

## C. 工程避坑

1. **阴影裁切**：任意祖先 `overflow:hidden|auto|scroll`、`clip-path`、`contain: paint` 都会切阴影。外扩 = `offset + blur + spread`（每侧分别算，多层取最大）。圆角裁切放内层、阴影放外层；滚动容器内壁留余量；透明/无边框窗口需同步放大窗口物理尺寸。不要全局改 `overflow: visible`。
2. **clip-path 圆角**：`inset()` 不继承 border-radius，写 `inset(0 round 12px)`。
3. **动画中途硬线**：位移动画用渐变 mask 而非矩形裁切。
4. **弹窗跳动**：根滚动容器 `scrollbar-gutter: stable`，或用组件库内置补偿；禁手写 padding-right。
5. **IME 守卫**：`isComposing` 为真直接放行；另记录 `compositionend` 时间戳，500ms 内的 Enter 拦截并**立即复位**为 0；Shift+Enter 换行。
6. **Composer 自适应**：`field-sizing: content` 或 ResizeObserver；外层显式高度 + 非对称缓动、`overflow: visible`；`max-height` 240–320px 后内部滚动，**局部**隐藏滚动条外观，保留滚轮/触控/键盘。
7. **流式跟随**：`distanceFromBottom ≤ 40px` 才贴底；上滚冻结；“有新回复 ↓”；高度突变补偿 scrollTop。
8. **分栏**：手柄 hover/active 反馈；≤18%/≥82% 吸附折叠；拖拽中 Esc：解除监听 → 保证手柄挂载（`setCollapsed(false)`）→ 恢复 `previousRatioRef`；两侧独立滚动。
9. **原生语义**：区分 OS 原生（窗口、文件对话框、系统菜单）/ 引擎原生（滚轮、选择、焦点环、滚动条）/ 组件库封装（Modal、ScrollArea、Resizable）。拖拽区 `-webkit-app-region: drag` 内不放可交互控件；标题栏 40–46px。
10. **返回定位**：按 ID 或 scrollY 恢复视口，不盲目 `.focus()`。
11. **修改未生效**：确认运行的是重新构建的产物；Web 预览不能替代 Electron/Tauri 真窗验收。
12. **成熟组件优先**：复杂弹窗、Resizable、拖拽用成熟库；已有设计系统就沿用，不引入第二套。

## D. IME 守卫参考实现

```ts
const lastCompositionEnd = { t: 0 };
export const onCompositionEnd = () => { lastCompositionEnd.t = performance.now(); };
export function onComposerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>, send: () => void) {
  if (e.key !== "Enter" || e.shiftKey) return;
  if (e.nativeEvent.isComposing || e.keyCode === 229) return;        // composing: let IME confirm
  if (performance.now() - lastCompositionEnd.t < 500) {              // ghost Enter after compositionend
    e.preventDefault(); lastCompositionEnd.t = 0; return;            // reset immediately
  }
  e.preventDefault(); send();
}
```
（`keyCode === 229` 为补充兼容：W3C UI Events 规定 IME 处理中的 keydown 报告 keyCode 229，非上游原文。）
