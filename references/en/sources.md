<!-- English translation of references/sources.md. The Chinese file is canonical; keep headings in sync. -->
# Sources and evidence

- ANUI's tokens, motion system, sample data and demo are original. The upstream projects below served only as inspiration and as a source of craft rules; licences are in `THIRD_PARTY_LICENSES.md` at the repo root.

- **beautifului.dev:**
  - Fetched on 2026-10-25: the HTML plus 13 JS/CSS chunks under `_next/static`.
  - The page JS exposes the source repo, `github.com/slev12397/beautiful-ui`. The site footer's "MIT License" links to `/license` (Copyright (c) 2026 Shane Levine).
  - The repo is public, and the GitHub API reports `license.spdx_id = MIT`.
  - Token and component values were read from commit `44a274e` (2026-09-23 06:44 UTC+8): `app/globals.css`, `app/layout.tsx`, `components/**`, `lib/meta.ts`.
- **desktop-agent-ui:** commit `44653f9` (2026-10-23 22:16 UTC+8), MIT.
- **Not obtained:** shadow-plugin's light-layer values (an npm dependency, not BUI source), glimm's internal shader parameters, liveline's internal chart styles, and the InteractionSounds parameters.
- **Demo:** `demo/` is an original implementation; its sample data and visuals are original.
  - glimm is replaced by a luminance-only canvas sweep, and liveline by an SVG polyline.
  - Fonts are Geist, Geist Mono and a Noto Sans SC subset (ANUI Sans SC), all SIL OFL.

## Monochrome (monochrome.md) references, retrieved 2026-10-25

- [S1] Linear — How we redesigned the Linear UI (part Ⅱ): https://linear.app/now/how-we-redesigned-the-linear-ui (LCH theme generation from three variables, base / accent / contrast; a high-contrast theme; exploring hierarchy with black/white transparency)
- [S2] DJ Petersen — The Three-Variable Theme: Deconstructing Linear's System: https://www.thedjpetersen.com/llm-thoughts/linear-theme/ (elevated variant: light L+3, dark L+6; third-party reverse engineering, not official)
- [S3] Evil Martians — OKLCH in CSS: why we moved from RGB and HSL: https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl/
- [S4] Apple HIG — Dark Mode (base / elevated backgrounds; dark is not an inversion; 4.5:1 minimum, 7:1 recommended): https://developer.apple.com/design/human-interface-guidelines/dark-mode ; WWDC19 Implementing Dark Mode on iOS: https://developer.apple.com/videos/play/wwdc2019/214/
- [S5] Material Design — Dark theme (dark grey rather than pure black, elevation overlay, desaturated brand colours in dark, Google News bleed): https://m2.material.io/develop/android/theming/dark ; https://design.google/library/material-design-dark-theme
- [S6] Vercel Geist — Colors (a 10-step role-based grey scale, gray vs gray-alpha, "draw each edge once"): https://vercel.com/geist/colors
- [S7] SeedFlip — Vercel Design System Breakdown (the brand is black-and-white contrast, accent optional; third-party analysis): https://seedflip.co/blog/vercel-design-system
- [S8] JAD Apps — Halation in Typography / Dark-Mode Typography Checklist (in dark mode reduce weight by 50–100, +0.01em tracking, +0.05 line height): https://jadapps.app/font-tools/guides/halation-typography-explained
- [S9] ScreenTest — OLED True Black, Near-Black & Smearing: https://screentest.dev/oled-test
- [S10] Nothing — Brand reference (black/white/grey plus a dot-matrix typeface, red only for signals): https://nothing.wiki/nothing/brand_reference
- [S11] APCA — APCA in a Nutshell / Bronze Simple Mode (Lc 90/75/60/45/30/15): https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html ; https://www.readtech.org/ARC/tests/bronze-simple-mode/
- [S14] W3C UI Events — keyCode 229 (keydowns being processed by an IME): https://www.w3.org/TR/uievents/#determine-keydown-keyup-keyCode
- [S12] View Transition circular reveal: Chrome docs https://developer.chrome.com/docs/web-platform/view-transitions/same-document ; Adam Argyle https://nerdy.dev/light-dark-view-transition-with-clip-path ; Jamie Warburton https://jamiewarburton.dev/writing/building-a-cool-circular-reveal-for-light-dark-mode/
- [S13] Stripe — Designing accessible color systems: https://stripe.com/blog/accessible-color-systems
- Raycast, Arc, Things, Teenage Engineering: no citable first-hand design writing was found in this round, so the related statements in monochrome.md are marked "unverified".

## Advanced motion (motion-advanced.md) references, retrieved 2026-10-25

- [M1] Apple — WWDC23 Animate with springs: https://developer.apple.com/videos/play/wwdc2023/10158/ ; SwiftUI `Spring` docs (duration 0.5 / bounce 0.3 ↔ mass 1, stiffness 157.9, damping 17.6): https://developer.apple.com/documentation/swiftui/spring ; HIG Motion: https://developer.apple.com/design/human-interface-guidelines/motion
- [M2] Emil Kowalski — Great Animations (fast, ease-out, <300ms, interruptible, no animation for keyboard actions, Raycast has none): https://emilkowal.ski/ui/great-animations ; 7 Practical Animation Tips: https://emilkowal.ski/ui/7-practical-animation-tips ; course animations.dev: https://animations.dev
- [M3] Emil Kowalski — Building a toast component (Sonner: transitions instead of keyframes, 400ms ease): https://emilkowal.ski/ui/building-a-toast-component ; Building a drawer component (Vaul: 500ms, cubic-bezier(0.32,0.72,0,1)): https://emilkowal.ski/ui/building-a-drawer-component
- [M4] Josh W. Comeau — A Friendly Introduction to Spring Physics: https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/
- [M5] Rauno Freiberg — Invisible Details of Interaction Design (keeping momentum, metaphor, frequency and novelty): https://rauno.me/craft/interaction-design
- [M6] Benji Taylor — Family Values (simplicity / fluidity / delight; transitions keep spatial continuity): https://benji.org/family-values
- [M7] Motion (Framer Motion / Motion One) — spring docs (stiffness/damping/mass, visualDuration, defaults 100/10/1): https://motion.dev/docs/spring ; generating CSS `linear()`: https://motion.dev/docs/css
- [M8] View Transitions: Chrome docs https://developer.chrome.com/docs/web-platform/view-transitions/same-document (see also [S12])
- Specific motion parameters for Linear, Vercel and Raycast: no official public numbers were found in this round. Statements about them (e.g. Raycast has almost no animation) are cited from [M2]; the rest are marked unverified.
- The iOS rubber-band coefficient 0.55 and UIScrollView deceleration rate 0.998: widely circulated reverse-engineered values. No official Apple documentation was found, so they are marked unverified.
