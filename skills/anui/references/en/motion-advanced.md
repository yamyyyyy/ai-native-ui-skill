<!-- English translation of references/motion-advanced.md. The Chinese file is canonical; keep headings in sync. -->
# Advanced motion (ANUI Motion)

> Positioning: in a pure black-and-white UI, **motion replaces colour as the signal for hierarchy and state**.
> - Colour is down to black, white, grey and one red.
> - So "what matters more", "what happened" and "whose turn it is" have to be expressed through the speed, distance, elasticity and timing of motion.
>
> Reference implementation: `demo/index.html` (Motion Lab + AI motion + light effects + 21 components).
> - Spring solver: `demo/spring.js`.
> - Presets: `demo/presets.js`.
> - CSS tokens: `demo/motion.css`.
>
> Labels:
> - **[Mx]** is a source (numbers in `sources.md`).
> - **unverified** is our own design choice or rule of thumb, with no measurement or external basis yet.
> - **verified** states how it was verified.
>
> The basic motion rules (formerly motion.md) are merged into the appendix at the end.

## 1. Principles

1. **Frequency sets the amount of motion.** Actions triggered hundreds of times a day (keyboard commands, list navigation) get no animation, or ≤ 100ms. Only rare key moments (first completed task, approval) may "perform" [M2][M5]. Raycast has almost no animation and feels faster for it [M2].
2. **Fast by default, ease-out for entrances.** Keep routine UI animation under 300ms, and never use ease-in for entrances [M2][M3].
3. **Always interruptible.** Every user-triggered animation can retarget mid-flight and **keeps its current velocity**. In CSS use transitions rather than keyframes; in JS use spring state (x, v) [M2][M4].
4. **Motion follows a physical metaphor.** Releasing a gesture keeps momentum and direction, overscroll shows rubber-band damping, and light objects bounce less [M5].
5. **Continuity over flourish.** Transitions tell users where things came from and where they go, e.g. shared elements and layout tweening [M6].
6. **Mapping hierarchy into black and white** (unverified; the core claim of this skill):

| Technique in a colour system | Replaced in black and white by |
|---|---|
| Primary colour highlights new content | New content enters with the `pop` spring (2–3% overshoot); old content stays still |
| Status colours (green, yellow, grey) | A spinning spinner for in progress, a check that scales and settles for done, a dashed outline for to-do |
| Accent colour draws attention | A one-time horizontal `nudge` (≤ 3px, plays once, never loops) |
| Dark-theme elevation | Higher layers enter with larger, slower movement and exit faster |
| Brand-colour atmosphere | Cursor spotlight on black, specular sweep, grain flicker (decoration only, carrying no information) |

## 2. Spring presets

Springs are parameterised with Apple's **duration / bounce** [M1]: `stiffness = (2π / duration)²`, `damping = 4π(1 − bounce) / duration`, mass = 1.
- Example: duration 0.5 / bounce 0.3 → k ≈ 157.9, c ≈ 17.6, matching Apple's documentation [M1].
- `duration` is the **perceived duration**; `settle` is when displacement error drops below 0.2%.
- The JS-free CSS version samples the spring at 33 points into a `linear()` curve, the same idea as Motion's `spring().toString()` [M7].

| Preset | duration / bounce | stiffness | damping | mass | ζ | overshoot | settle | Use for |
|---|---|---|---|---|---|---|---|---|
| `press` | 0.18s / 0 | 1218.5 | 69.81 | 1 | 1 | 0% | 242ms | Press rebound, switch thumbs, checkboxes |
| `snap` | 0.25s / 0 | 631.7 | 50.27 | 1 | 1 | 0% | 333ms | Menus, dropdowns, tooltips, chip state changes |
| `glide` | 0.4s / 0 | 246.7 | 31.42 | 1 | 1 | 0% | 537ms | Layout / FLIP, shared elements, list reordering |
| `settle` | 0.55s / 0.05 | 130.5 | 21.71 | 1 | 0.95 | 0% | 625ms | Progress bars, number tweening, scroll snapping |
| `pop` | 0.35s / 0.25 | 322.3 | 26.93 | 1 | 0.75 | 2.8% | 429ms | Tool-call chips appearing, notifications entering, magnetic release |
| `sheet` | 0.5s / 0.1 | 157.9 | 22.62 | 1 | 0.9 | 0.2% | 458ms | Drawers, approval cards, modals (≈ iOS sheet) |
| `fling` | 0.6s / 0.2 | 109.7 | 16.76 | 1 | 0.8 | 1.5% | 762ms | Fling-to-snap (with initial velocity), drag release |
| `breathe` | 1.8s / 0 | 12.2 | 6.98 | 1 | 1 | 0% | 2421ms | Agent presence breathing, waiting states (looping) |

- **Bounce is capped at 0.25 in black and white.** With no colour to distract, elasticity is perceived more strongly (unverified). Only `pop` and `fling` rebound a little; everything else is critically or near-critically damped.
- To generate one: `ANUISpring.toLinear(ANUISpring.fromDB(0.35, 0.25))` returns `{duration, easing: "linear(…)"}`. `motion.css` already contains the generated `--spring-*` and `--dur-*` tokens, with an `@supports (linear())` fallback to cubic-bezier.
- Solver `demo/spring.js`:
  - A closed-form solution covering under-, critically and over-damped cases, used to draw curves and generate `linear()`.
  - A stateful `Spring` class for interaction. It integrates with semi-implicit Euler at 240Hz substeps, and `set(to, velocity)` keeps velocity, so it is interruptible.

## 3. Duration and easing tokens

| Token | Value | Use for |
|---|---|---|
| `--dur-instant` | 90ms | Press-down (press scale in), hover background |
| `--dur-fast` | 150ms | Colour and opacity changes, tooltips |
| `--dur-base` | 240ms | Menus, focus ring contraction |
| `--dur-slow` | 400ms | List stagger, panels |
| `--dur-exit` | 150ms | **All exits** (≈ 0.4–0.6× the entrance) |
| `--ease-out` | `cubic-bezier(.23,1,.32,1)` | Entrances, responses |
| `--ease-in` | `cubic-bezier(.55,0,1,.45)` | Exits only |
| `--ease-io` | `cubic-bezier(.65,0,.35,1)` | On-screen movement, theme reveal |
| `--ease-sheet` | `cubic-bezier(.32,.72,0,1)` | Drawers, i.e. the Vaul / iOS sheet curve [M3] |

**Asymmetric enter and exit.**
- Entrances are a little slower and elastic, so users can follow them.
- Exits are fast, ease-in and bounce-free, so they don't get in the way.
- Sonner's toasts enter with a 400ms ease. We use a 430ms `pop` spring to enter and 150ms to exit [M3].

## 4. Choreography and stagger

- Stagger interval **35ms**, with at most **6 items** staggered. From the 7th item on, items appear together with the 6th; total time stays within 400ms + 6 × 35ms.
- Parent first, then children: the container is 60% done before children appear. Exits reverse this but **don't stagger**; everything leaves together.
- Only one "lead" animation per view at a time; other elements may at most change opacity.
- The entrance recipe is `opacity 0→1` + `translateY 8px→0` + `blur 2px→0`. Blur is for one-off entrances only, never for frequent actions.

## 5. Shared elements and layout transitions

- **FLIP.** Record First, change the DOM to get Last, compute the Invert, then Play with `glide`'s `linear()`. Animate only `transform`.
- Card expanding into detail: the same node does `translate + scale`. Its text fades in after layout settles, so it never looks stretched.
- Across routes, prefer the View Transitions API's `view-transition-name` [M8]. Within a document use `document.startViewTransition`, and switch instantly where unsupported.
- List reordering, insertion and removal always use FLIP and never "jump". Sonner's lesson: keyframes can't be retargeted, and reordering must be interruptible [M3].

## 6. Gesture physics

- **Drag.** On `pointerdown`, call `setPointerCapture`, cancel any running spring and take the current x as the start, so there is zero jump.
- **Rubber band.** `f(x) = (1 − 1 / (x·c / d + 1)) · d`, where c = 0.55 and d is the container size (the iOS coefficient; the number itself is unverified, see sources.md). Drawers overscrolling upward use c = 0.3 for more resistance.
- **Velocity.** Estimate px/s from only the last 100ms of pointer samples, never the average over the whole drag.
- **Fling projection.**
  - `projected = x + v/1000 · 0.998 / (1 − 0.998)` (UIScrollView's normal deceleration rate; unverified, see sources.md).
  - Snap to the slot nearest the projected point with the `fling` spring, **using the release velocity as the initial velocity**.
- **Closing a drawer.** Close if it moved more than 40% of its height or faster than 500px/s; otherwise spring back (after Vaul [M3]).
- During a drag, track the pointer 1:1 with **no easing at all**.

## 7. Micro-interactions

- **Press.** On press, scale to `scale(.97)` with a 90ms ease-out, and spring back with `pop` on release. Fast down and elastic up gives a clearer tactile feel.
- **Light follows the pointer.**
  - On component stages and cards, `--mx / --my` follow the pointer and draw a 260px radial light (8.5% white in dark themes, 7% ink in light).
  - Off in high contrast; it works best on OLED black.
- **Magnetic.**
  - Within 70px of the pointer, the button shifts up to 6px towards it and returns with `pop` when the pointer leaves.
  - Only for primary actions (send), at most 1–2 per view.
- **Focus ring.** When `:focus-visible` appears, `outline-offset` contracts from 6px to 2px over 240ms and the colour goes from transparent to ink. It plays once, at the moment focus arrives.
- **Specular sweep.** On hover, a 105° white gradient (14%) sweeps across in 900ms. At most one per view.

## 8. AI-specific motion

| Scenario | Motion | Parameters |
|---|---|---|
| Thinking | Text shimmer + three staggered breathing dots | 1.2s loop, 150ms between dots |
| Presence | Two 1px rings spreading out from the avatar, staggered | 2.4s per ring while working, 4.8s while idle or waiting (frequency = busy vs. idle) |
| Tool call | Chip pops in from `scale(.85)`; the spinner settles into a scaling check | `pop` spring; done sound 2600Hz/10ms (optional) |
| Streaming | **Word-by-word blur reveal**: each token does `opacity 0→1 + blur 4px→0` | 320ms ease-out, about 38ms between tokens. Split Chinese into 1–2 characters and English into words |
| Progress | Show an indeterminate sweep first; once real progress arrives, tween with `settle`, **only ever increasing** | Progress that never goes backwards is the baseline of trust (unverified) |
| Approval card | Enters from 12px below plus `scale(.98)` on the `sheet` curve. If untouched for 4s, nudge once only | Exit 150ms ease-in |
| Done | Progress reaches 1, the presence rings slow down, the label becomes "Done" | No confetti; restraint reads as more refined in black and white |

Streaming also follows the appendix rules (formerly motion.md):
- Reserve the content box height with `min-height` so it doesn't jump.
- Follow with auto-scroll, and pause following when the user scrolls up.

## 9. Theme switching

- Circular reveal with View Transitions: `clip-path: circle()` expands from the click point, 560ms, `--ease-io` [M8].
- Add `.theme-switching` during the switch to freeze all transitions. Otherwise components fade separately and you get inconsistent in-between frames.
- Switch instantly under reduced motion.
- `OLED ↔ high contrast` is a full black-and-white inversion. Its reveal has the strongest visual impact, the signature moment of this theme set (unverified).

## 10. Monochrome light effects (WebGL / Canvas)

- **Cursor spotlight with grain.**
  - A WebGL fragment shader draws two Gaussian light spots (32% wide and 18% narrow), overlaid with hash noise quantised at 24fps (±3%).
  - Cursor following uses a first-order low-pass (k = 0.12) for a trailing feel.
  - It renders only when in view (IntersectionObserver), with DPR capped at 2.
- **Specular sweep.** A Canvas 2D linear gradient sweeps every 4 seconds; the sweep takes 35% of the cycle and the rest is still.
- **Grain flicker.** The noise changes frame at 24fps rather than 60fps, which looks like film and saves power (unverified).
- Light effects are decoration and carry no information. They freeze or turn off in high contrast and reduced motion.

## 11. Sound (optional, off by default)

- A single WebAudio oscillator with a 10–25ms exponential decay envelope and a gain of about 0.03, i.e. 20·log10(0.03) ≈ −30.5 dBFS (verified: calculation).
- Mapping:

  | Event | Sound |
  |---|---|
  | Press | 2200Hz / 8ms |
  | Tool start | 1800Hz |
  | Done | 2600Hz / 10ms |
  | Approval appears | 900Hz triangle / 50ms |

- The user must turn it on (browsers also require the AudioContext to be created after a gesture). Sound only reinforces confirmation and must never be the only feedback.

## 12. Performance

- Animate only compositor-friendly properties: `transform` and `opacity`, with `filter` kept to a minimum. Progress bars use `scaleX`, not `width`.
- `will-change` budget: at most 4 elements on screen. Add it only to elements being dragged or animating continuously, and remove it afterwards.
- 120Hz screens: springs integrate with the real dt (240Hz substeps), independent of refresh rate. CSS `linear()` is interpolated by the browser, also independent of refresh rate.
- rAF loops must pause when not visible (IntersectionObserver or `document.hidden`).
- Measurement: Playwright runs a full interaction script while collecting rAF frame intervals and a Chrome trace. Results are in `reports/perf.json` (`npm run perf`).

## 13. Reduced motion

- Two switches: the system `prefers-reduced-motion` and the page's "Reduce motion" toggle (`html.rm`).
- Fallback rules:
  - Translation, scaling and springs all become **instant** (`Spring.jump`).
  - Keep opacity changes of up to 150ms to signal that something changed.
  - Streaming shows words directly, without blur.
  - Light effects freeze; theme switches skip the reveal.
- Looping animations (thinking, presence) become static or play once.

## 14. Acceptance checklist

- [ ] Every user-triggered animation can be interrupted mid-flight without jumping (try rapid-clicking "Play").
- [ ] Exit duration ≤ 0.6× the entrance duration.
- [ ] Dragging tracks 1:1, and velocity carries on after release.
- [ ] At most 4 `will-change` per screen; rAF pauses when not visible.
- [ ] Everything still works in reduced-motion mode.
- [ ] Frequent actions (keyboard, list navigation) have no animation over 100ms.
- [ ] Only one "lead" animation per view at a time.
- [ ] Still satisfied: font size ≥ 12px, clip-audit cut = 0, IME guard.


## Appendix: basic motion rules (formerly motion.md)

Visual rhythm takes BUI's original values [BUI]; the why and when of motion takes DAU's rules [DAU].
- Motion is only for confirming actions, signalling state transitions, showing spatial origin, and keeping objects continuous.
- **State must come from real events; never fake progress with timers.** The BUI demo pages are largely driven by `setTimeout`, but that is only a demo script; production code must use event streams.

### 1. Curves and durations

| Name | Value | Where |
| --- | --- | --- |
| `ease-out-strong` | `cubic-bezier(0.23,1,0.32,1)` | Expand / collapse (grid-rows), fade-up, pop-in, menu highlight slider, min-height transitions |
| `ease-in-out-strong` | `cubic-bezier(0.77,0,0.175,1)` | Large moves / switches (defined in the library, rarely used) |
| `ease-link` | `cubic-bezier(0.16,1,0.3,1)` | Underline 280ms, sidebar, RecommendationCard drawer |
| ApprovalCard SLIDE | `360ms cubic-bezier(0.22,1,0.36,1)` | Horizontal slide between questions + synced height |
| Colour hover | 100ms (canvas controls) / 120–150ms ease-out (rows, buttons) | |
| Press | `active:scale-[0.96]` (buttons) / `0.94` (composer icon buttons), 150ms | |
| Expand | `transition-[grid-template-rows,opacity] 300ms ease-out-strong` (from ToolChips / TaskRows / StreamingText); ThinkingState 400ms | |
| Chevron | `transition-transform 200–300ms`, rotate(180deg) when expanded (this skill's choice, implemented in the demo) | |

### 2. Keyframes (all [BUI])

```css
@keyframes shimmer-text { from { background-position: 150% center } to { background-position: -50% center } }
/* usage: background-image: linear-gradient(90deg, var(--ink-3) 35%, var(--ink) 50%, var(--ink-3) 65%);
         background-size: 200% 100%; background-clip: text; color: transparent;
         animation: shimmer-text 1.8s linear infinite; */
@keyframes fade-up  { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform:none } }  /* 300–400ms ease-out-strong */
@keyframes fade-in  { from { opacity:0 } to { opacity:1 } }                                              /* 150–350ms ease-out */
@keyframes pop-in   { from { opacity:0; transform: scale(.95) } to { opacity:1; transform: scale(1) } }  /* 140–300ms ease-out-strong; menu transform-origin points at the anchor */
@keyframes spin     { to { transform: rotate(360deg) } }                                                 /* 700ms linear (inline spinner), 1.2s (retry icon) */
@keyframes pixel-on { 0%,100% { opacity:.15 } 18%,42% { opacity:1 } 62% { opacity:.15 } }
@keyframes eq-bounce{ 0%,100% { transform: scaleY(.35) } 50% { transform: scaleY(1) } }                  /* dictation bars 900ms ease-in-out, delay i*150ms per bar */
@keyframes caret-blink { 0%,100% { opacity:1 } 50% { opacity:0 } }                                       /* 1s step-end; no blinking while streaming */
@keyframes records-pulse { 0%,100% { opacity:.35; transform: scale(.8) } 50% { opacity:1; transform: scale(1) } } /* 1.1s, 8px dot while an AI column computes */
```

### 3. Pixel-grid loader (Loading State) [BUI]

- 3×3 grid of 4×4px cells, gap 1.5px, `bg-ink`. Drive uses square `rounded-[1px]` cells, Dots uses `rounded-full`.
- Resting opacity 0.15. In Orbit the centre cell doesn't take part (opacity 0.07).
- Drive / Dots:
  - `delay = (col + |row-1|) * 90ms` (a V-shaped "chevron" wavefront moving right), 650ms duration.
  - The loop is shorter than the sweep, so two wavefronts are visible at once.
- Orbit: clockwise outer ring order `[0,1,2,5,8,7,6,3]`, `delay = k*110ms`, 950ms duration (a comet circling).
- Alongside:
  - a shimmer label (13px/500);
  - a timer (mono 12px ink-3 tabular-nums) refreshing one decimal every 100ms, e.g. `4.6s`.
- Reduced motion: the grid freezes in its dim state; the timer keeps running.

### 4. Streaming text [BUI]

- The `StreamText` atom reveals 2 characters every 9ms. The newest 6 characters are wrapped in `.stream-tail`:
  - `filter: blur(1.6px)` + `mask-image: linear-gradient(to right, #000 20%, rgb(0 0 0/.2))`;
  - the effect is a leading edge that "develops out of blur".
- Caret: 2px × 1.05em, radius 1px, `bg-ink`, `margin-left:1.5px`. Solid while streaming, `caret-blink 1s step-end` afterwards.
- The `StreamingText` demo advances by word with `WORD_MS = 55`. When done, the action bar, sources and follow-ups fade in with `transition-opacity 400ms`.
- Reduced motion: drop the blur and mask; the caret doesn't blink.
- [DAU] Viewport following:
  - Auto-stick to the bottom only within 40px of it.
  - Freeze immediately when the user scrolls up, and show a "New reply ↓" button.
  - Compensate `scrollTop` for sudden height changes from code highlighting or image loading.

### 5. Height animation patterns

1. **grid-rows 0fr→1fr** (preferred, no measuring): the outer element has `display:grid; grid-template-rows: 0fr|1fr; opacity 0|1`, the inner one `overflow:hidden; min-height:0`.
2. **Measured height**: the ApprovalCard viewport transitions an explicit `height`; the Thinking timeline's vertical line follows content `height` over 500ms.
3. Framer Motion equivalent: `<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} transition={{duration:.3, ease:[0.23,1,0.32,1]}}>`.
4. [DAU] Note:
   - Clip edges can show a hard line mid-animation; use a gradient mask.
   - An `overflow:hidden` layer must not carry the shadow; put the shadow on the outer layer.

### 6. Sliding highlight (GlideMenu) [BUI]

- An absolutely positioned hover layer slides between menu rows: `top 220ms ease-out-strong, height 220ms ease-out-strong, opacity 150ms ease`.
- The highlight is `inset-x-1 rounded-[6px] bg-hover`. Menu radius 10 + padding 4 → inner 6, so it is concentric ✔.
- In Framer Motion use `layoutId="glide"`.

### 7. Framer Motion presets (recommended implementation)

```ts
export const ease = { outStrong: [0.23, 1, 0.32, 1], inOutStrong: [0.77, 0, 0.175, 1], link: [0.16, 1, 0.3, 1] } as const;
export const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.38, ease: ease.outStrong } };
export const popIn  = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.16, ease: ease.outStrong } };
export const expand = { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.3, ease: ease.outStrong } };
// Overlays can use a lightly damped spring (DAU preference) to avoid overshoot:
export const spring = { type: "spring", stiffness: 322.3, damping: 26.93, mass: 1 }; // = ANUI pop preset (motion-advanced.md §2)
```

### 8. Must follow

- A global `@media (prefers-reduced-motion: reduce)` squashes animation/transition to 0.01ms (from BUI).
- When switching themes, add `.theme-switching` to `<html>` to freeze transitions, so hundreds of colours don't fade at once (from BUI).
- Animations must never block input or rapid repeated clicks (DAU).
- No motion for decoration; every animation must answer "which state change does it express?"
