# 来源与取证说明

- 本项目（ANUI）的令牌、动效系统、示例数据与 demo 为原创；下列上游仅作为灵感与工艺规则来源，许可见仓库根目录 `THIRD_PARTY_LICENSES.md`。

- beautifului.dev：HTML 与 `_next/static` 下 13 个 JS/CSS 块（2026-10-25 抓取）。页面 JS 中暴露源码仓库链接 `github.com/slev12397/beautiful-ui`；站点页脚 “MIT License” 指向 `/license`（Copyright (c) 2026 Shane Levine）。仓库公开，GitHub API `license.spdx_id = MIT`。令牌和组件数值读自仓库 commit `44a274e`（2026-09-23 06:44 UTC+8）的 `app/globals.css`、`app/layout.tsx`、`components/**`、`lib/meta.ts`。
- desktop-agent-ui：commit `44653f9`（2026-10-23 22:16 UTC+8），MIT。
- 未取得：shadow-plugin 的 light 层值（npm 依赖，非 BUI 源码）、glimm shader 内部参数、liveline 图表内部样式、InteractionSounds 音效参数。
- Demo：`demo/` 为本项目原创实现（示例数据与视觉均为原创），glimm 为纯亮度 canvas 扫光，liveline 为 SVG 折线。字体 Geist / Geist Mono / Noto Sans SC 子集（ANUI Sans SC），均 SIL OFL。

## 黑白进阶（monochrome.md）引用，2026-10-25 检索

- [S1] Linear — How we redesigned the Linear UI (part Ⅱ)：https://linear.app/now/how-we-redesigned-the-linear-ui （LCH 主题生成：base / accent / contrast 三变量；高对比主题；用黑白透明度探索层级）
- [S2] DJ Petersen — The Three-Variable Theme: Deconstructing Linear's System：https://www.thedjpetersen.com/llm-thoughts/linear-theme/ （elevated 变体：浅色 L+3、深色 L+6；第三方逆向分析，非官方）
- [S3] Evil Martians — OKLCH in CSS: why we moved from RGB and HSL：https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl/
- [S4] Apple HIG — Dark Mode（base / elevated 背景；深色非反相；4.5:1 最低、7:1 建议）：https://developer.apple.com/design/human-interface-guidelines/dark-mode ；WWDC19 Implementing Dark Mode on iOS：https://developer.apple.com/videos/play/wwdc2019/214/
- [S5] Material Design — Dark theme（深灰而非纯黑、elevation overlay、深色品牌色去饱和、Google News 渗光）：https://m2.material.io/develop/android/theming/dark ；https://design.google/library/material-design-dark-theme
- [S6] Vercel Geist — Colors（10 级职责化灰阶、gray vs gray-alpha、“每条边只画一次”）：https://vercel.com/geist/colors
- [S7] SeedFlip — Vercel Design System Breakdown（品牌即黑白对比，accent 可选；第三方分析）：https://seedflip.co/blog/vercel-design-system
- [S8] JAD Apps — Halation in Typography / Dark-Mode Typography Checklist（深色降字重 50–100、+0.01em 字距、+0.05 行高）：https://jadapps.app/font-tools/guides/halation-typography-explained
- [S9] ScreenTest — OLED True Black, Near-Black & Smearing：https://screentest.dev/oled-test
- [S10] Nothing — Brand reference（黑白灰 + 点阵字体，红色只用于信号）：https://nothing.wiki/nothing/brand_reference
- [S11] APCA — APCA in a Nutshell / Bronze Simple Mode（Lc 90/75/60/45/30/15）：https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html ；https://www.readtech.org/ARC/tests/bronze-simple-mode/
- [S14] W3C UI Events — keyCode 229（IME 处理中）：https://www.w3.org/TR/uievents/#determine-keydown-keyup-keyCode
- [S12] View Transition 圆形揭幕：Chrome 文档 https://developer.chrome.com/docs/web-platform/view-transitions/same-document ；Adam Argyle https://nerdy.dev/light-dark-view-transition-with-clip-path ；Jamie Warburton https://jamiewarburton.dev/writing/building-a-cool-circular-reveal-for-light-dark-mode/
- [S13] Stripe — Designing accessible color systems：https://stripe.com/blog/accessible-color-systems
- Raycast、Arc、Things、Teenage Engineering：本轮未找到可引用的一手设计文章，monochrome.md 中相关描述均标为“未验证”。

## 动效进阶（motion-advanced.md）引用，2026-10-25 检索

- [M1] Apple — WWDC23 Animate with springs：https://developer.apple.com/videos/play/wwdc2023/10158/ ；SwiftUI `Spring` 文档（duration 0.5 / bounce 0.3 ↔ mass 1, stiffness 157.9, damping 17.6）：https://developer.apple.com/documentation/swiftui/spring ；HIG Motion：https://developer.apple.com/design/human-interface-guidelines/motion
- [M2] Emil Kowalski — Great Animations（快、ease-out、<300ms、可打断、键盘操作不做动画、Raycast 无动画）：https://emilkowal.ski/ui/great-animations ；7 Practical Animation Tips：https://emilkowal.ski/ui/7-practical-animation-tips ；课程 animations.dev：https://animations.dev
- [M3] Emil Kowalski — Building a toast component（Sonner：transition 代替 keyframes、400ms ease）：https://emilkowal.ski/ui/building-a-toast-component ；Building a drawer component（Vaul：500ms、cubic-bezier(0.32,0.72,0,1)）：https://emilkowal.ski/ui/building-a-drawer-component
- [M4] Josh W. Comeau — A Friendly Introduction to Spring Physics：https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/
- [M5] Rauno Freiberg — Invisible Details of Interaction Design（动量保留、隐喻、频率与新奇）：https://rauno.me/craft/interaction-design
- [M6] Benji Taylor — Family Values（simplicity / fluidity / delight，过渡保持空间连续性）：https://benji.org/family-values
- [M7] Motion（Framer Motion / Motion One）— spring 文档（stiffness/damping/mass、visualDuration、默认 100/10/1）：https://motion.dev/docs/spring ；CSS 生成 `linear()`：https://motion.dev/docs/css
- [M8] View Transitions：Chrome 文档 https://developer.chrome.com/docs/web-platform/view-transitions/same-document （另见 [S12]）
- Linear、Vercel、Raycast 的具体动效参数：本轮未找到官方公开数值；文中对它们的描述（如 Raycast 几乎无动画）引自 [M2]，其余标为未验证。
- iOS 橡皮筋系数 0.55 与 UIScrollView 减速率 0.998：为业界广泛流传的逆向值，未找到 Apple 官方文档，标为未验证。
