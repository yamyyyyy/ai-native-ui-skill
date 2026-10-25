# 验收清单（Acceptance）

交付前逐项勾选；保留截图/录屏与 clip-audit 回执。

## 0. 一键自检（本仓库 demo / 你的页面改路径后同理）
- [ ] `npm run check` 全绿：6 个主题均 无 JS 错误、无外部网络请求、clip-audit `cut = 0`、字号 ⊂ {12, 13, 14, 20}，`reports/contrast.md` 全部通过

## 1. 视觉（ANUI 令牌）
- [ ] 颜色只用 tokens.md 变量；除 `--red` 外无色相；强调用反色；`hc` 与 `oled` 都检查，切主题无渐变闪烁（`.theme-switching`）
- [ ] 字族 Geist + 中文字体（ANUI Sans SC / 系统）+ Geist Mono；body 14px，行高 `--lh`，字重取 `--fw-*`
- [ ] 圆角只用 6 / 8 / 12 / 16 / 9999，嵌套满足 `R_in = max(0, R_out − padding)`
- [ ] 层级：浅色靠分层阴影 e0–e3，深色靠表面变亮 + 1px 顶部高光；高对比主题无阴影、用 1px ring
- [ ] 动效只用 8 个弹簧预设（motion-advanced.md §2）或其 `linear()` 版本；进出不对称、可打断；每个动画能说明它表达的状态
- [ ] 数字 `tabular-nums`；按压反馈用 `press` 预设
- [ ] `prefers-reduced-motion`（或 demo 的 `?rm`）下无位移、缩放、模糊，只保留不透明度

## 2. 工艺（DAU 层）
- [ ] 全页字号 ≤4 种，无 <12px 文字（`scripts` 下可用：`[...document.querySelectorAll('*')].filter(e=>e.childNodes.length&&parseFloat(getComputedStyle(e).fontSize)<12)`）
- [ ] 无 “·” 中点分隔；无冗余说明副标题；无左彩条卡片
- [ ] 边框 0.5px（HiDPI）
- [ ] `scripts/clip-audit.js` 在 默认 / hover / 展开 / 动效终态 四种状态均 `cut === 0`（透明窗传 `{viewport:true}`；`root` 设为卡片父级）
- [ ] Prompt Bar：中文输入法选词 Enter 不发送；选词后 Enter 正常发送；Shift+Enter 换行；长文本平滑增高到上限后内部滚动，滚动条局部隐藏
- [ ] 流式输出时上滚不被拉回；有“回到底部”
- [ ] 打开/关闭 Dialog 背景无横跳（`scrollbar-gutter: stable`）
- [ ] 状态来自真实事件；停止“已请求”与“已停止”分开；失败保留原因与部分产物
- [ ] 审批卡展示影响对象（路径/命令/收件方）；只读操作不打扰
- [ ] 草稿/附件按会话隔离
- [ ] 所有图标按钮有 `aria-label`；可展开项有 `aria-expanded`；加载有 `role="status"`；焦点环 2px ink + page 色垫圈（tokens.md §2）

## 3. 最小交付记录
运行环境（OS、浏览器/Electron/Tauri 版本）、四种状态截图、clip-audit 回执 `{ ok: true, cut: 0 }`、未覆盖的边界。
