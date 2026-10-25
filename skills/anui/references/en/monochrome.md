<!-- English translation of references/monochrome.md. The Chinese file is canonical; keep headings in sync. -->
# Advanced monochrome guide (ANUI Mono)

> This skill's default visual language is **black, white and grey only, plus one functional colour (red)**. Its originality comes from fine control of a single hue, not from more colours.
> The full demo is `demo/index.html`: 21 components, elevation, materials, dark islands and motion. `npm run check` writes the contrast report to `reports/contrast.md`; token values are in `references/tokens.md`.
> Labels:
> - **[source]** means a public reference (numbers in `sources.md`).
> - **unverified** means our own design choice or rule of thumb, with no external basis and no measurement.
> - **verified** states how it was verified.

## 1. Core principles

1. **Tune light and dark separately; never invert.** Apple's HIG says a dark palette "isn't necessarily the inverse" of the light one [S4]. Linear also generates surface levels per theme [S1][S2].
   - Our light themes express elevation with **shadows**. Dark themes use **lighter surfaces + a 1px top highlight**.
   - The grey L values for text are derived from APCA separately for each theme.
2. **Build the greys in OKLCH.** L is perceived lightness, so equal L steps look evenly spaced [S6]. HSL `darken()` shifts hue; OKLCH does not [S3].
3. **Only a hint of temperature.** All greys share one `(--tint-c, --tint-h)` pair.
   - Paper is warm `0.004 / 85`, near-black cool `0.005 / 265`, white and OLED `0`.
   - Chroma ≤ 0.006 means the OKLab distance to a pure grey of the same L is ΔE ≤ 0.006. That is below the commonly used OKLab just-noticeable difference of about 0.02 (verified: calculation), so it reads as "temperature", not "colour".
4. **A single functional colour.** No hue is used except `--red` (danger, error, delete).
   - Success: `ink` plus a check icon.
   - Warning: `ink-2` plus a dashed outline.
   - In progress: half fill.
   - Emphasis: **inversion**. A black button on white in light themes and a white button on black in dark themes, i.e. `--accent = --ink`, `--on-accent = --page`.
   - References:
     - Vercel's marketing site uses a single grey ramp [S7].
     - Nothing uses black, white and grey and reserves red for real signals [S10].
     - Teenage Engineering pairs monochrome bodies with one highlight colour (unverified generalisation).
5. **Colour is never the only channel.** Every state must also differ by at least one of: icon, shape, weight or fill style.

## 2. Grey ramp (OKLCH)

| Role | Paper | White | Near-black | OLED | OLED HC | High contrast HC |
|---|---|---|---|---|---|---|
| `page` | 0.972 | 1.000 | 0.165 | 0.000 | 0.000 | 1.000 |
| `canvas` | 0.955 | 0.970 | 0.185 | 0.100 | 0.100 | 1.000 |
| `surface` (e1) | 0.993 | 1.000 | 0.212 | 0.155 | 0.100 | 1.000 |
| `raised` (e2) | =surface | =surface | 0.245 | 0.195 | 0.130 | =surface |
| `overlay` (e3) | =surface | =surface | 0.278 | 0.235 | 0.160 | =surface |
| `hover` / `hover-2` | 0.948 / 0.922 | 0.965 / 0.938 | 0.250 / 0.285 | 0.200 / 0.240 | 0.200 / 0.240 | 0.93 / 0.88 |
| `ink` | 0.205 | 0.170 | 0.955 | 0.970 | 1.000 | 0.000 |
| `ink-2` | 0.430 | 0.420 | 0.800 | 0.820 | 0.900 | 0.250 |
| `ink-3` | 0.540 | 0.530 | 0.700 | 0.720 | 0.820 | 0.360 |
| `ink-4` | 0.680 | 0.670 | 0.585 | 0.600 | 0.700 | 0.450 |

- **Bigger steps in dark themes.** Surfaces step about +0.033 L per level in dark themes, against about 0.02 in light ones. The eye is less sensitive to L differences in the shadows (unverified; consistent with Linear's elevated offsets of "+3 light / +6 dark" [S2]).
- **Dark text is brighter overall, but not pure white.** Near-black `ink` is 0.955; near pure white you get halation [S8]. APCA asks for a larger lightness difference on dark backgrounds, so `ink-2` and `ink-3` sit about 0.08 above their inverted values (see `reports/contrast.md`).

## 3. Choosing a base

| Base | Use for | Avoid |
|---|---|---|
| **Paper** `0.972 warm` | Long reading, writing, docs, chat (optional light; the default light is high contrast) | E-commerce that must blend seamlessly with pure-white product shots |
| **White** `1.0` | Image- and screenshot-heavy views, marketing pages, print preview, "baseless" embedded widgets | Large areas of plain text (glare). Mitigate with `canvas 0.97` plus white cards |
| **Near-black** `0.165 cool` | Optional dark for IDEs, terminals and long night sessions. A grey base keeps shadows and elevation visible [S5] | — |
| **OLED** `0` | **Default dark**; mobile battery saving, immersive media, full-screen presentations | Long scrolling lists. Pure-black pixels smear as they switch on [S9], so OLED `surface` starts at 0.155 and content never sits directly on 0 |
| **High contrast HC** `1.0` | **Default light**: pure white with pure black text. Under `prefers-contrast: more` the dark counterpart is OLED HC | — |

## 4. Elevation

- **Light: layered soft shadows.** Each level is a hairline ring plus 2–3 shadow layers (small and solid close by, large and soft further away).
  - e1 = `0 1px 1px /.03, 0 1px 3px /.05`
  - e2 = plus `0 4px 12px -2px /.07`
  - e3 = plus `0 12px 32px -6px /.14, 0 24px 48px -12px /.08`
  - The shadow colour is a slightly warm grey `oklch(0.2 0.01 60 / a)`, which looks more "paper-like" than pure black (unverified).
- **Dark: lighten and highlight.** Shadows are nearly invisible on dark backgrounds [S5].
  - The higher the level, the lighter the surface (Apple's base/elevated [S4], Material's overlay [S5]).
  - Add a **top specular highlight**, `inset 0 1px 0 oklch(1 0 0 / .07)`, to mimic top light catching the edge.
  - Shadows stay only on e3 overlays, to cut them away from the background.
- **Tailwind usage:** `bg-surface shadow-card` → `bg-raised shadow-raised` → `bg-overlay shadow-overlay`.
  - Legacy `bg-surface shadow-overlay` combinations switch to the overlay colour automatically in dark themes (there is a rule for it in `app.css`).

## 5. Hairline system

- Width comes from `--ring-w`: 1px by default, 0.5px on 2x screens, forced to 1px in high contrast.
- Colours are **all alpha**: light `oklch(0.25 0.01 h / .085 / .15)`, dark `oklch(1 0 0 / .075 / .13)`.
  - The same line keeps the same relative contrast on page, surface or overlay. Vercel likewise separates gray and gray-alpha, using the latter where the background should show through [S6].
- **Draw each edge once.** Put dividers inside the container's border, so two alpha lines never overlap into a darker junction [S6].
- Draw rings with `box-shadow`, not `border`. It takes no box-model space and composes easily with shadows.

## 6. Text hierarchy, weight compensation, APCA

- **Text hierarchy = grey × weight**, never colour:

  | Level | Token and weight |
  |---|---|
  | Titles | ink 600 |
  | Body | ink 400 |
  | Secondary | ink-2 400 |
  | Meta | ink-3 400 / 12px |
  | Placeholder | ink-4 |

- **Dark compensation.** Light text on a dark background looks heavier and blurrier (halation, bleed) [S8][S5].
  - Weights drop in near-black: `400→380`, `500→470`, `600→560`. We do this with the wght axis of the variable fonts Geist / Noto Sans SC, and map Tailwind's `font-weight-*` to `--fw-*`.
  - Tracking `-0.008em → +0.002em`, line height `1.55 → 1.6`.
  - The numbers follow [S8]'s advice (drop 50–100, add 0.01em). We chose gentler values because Geist is already light (unverified).
- **APCA targets** (Bronze level) [S11]:
  - Body Lc ≥ 90 (minimum 75), readable content ≥ 60, large text and icons ≥ 45, placeholders and disabled ≥ 30.
  - WCAG 2 must also hold: body ≥ 7, secondary ≥ 4.5. Apple's HIG also suggests 7:1 for small text [S4].
  - The meta level is set at Lc 45; this tier is our own, unverified.
- Lc is negative on dark backgrounds, so compare absolute values. Every token pair is computed in `reports/contrast.md`, and all pass.

## 7. One functional colour, inverted emphasis

| Meaning | Light | Dark | Distinguished by |
|---|---|---|---|
| Primary action | `bg-ink text-on-accent` | Same token, automatically white with black text | Inversion |
| Secondary action | `bg-surface shadow-btn` | Same | Outline |
| Danger / error | `--red 0.52 0.2 27` + light red tint | `--red 0.79 0.125 24` | **The only hue** |
| Success | ink + ✓ | Same | Icon |
| In progress | Half-filled tag, spinner | Same | Shape |
| To do | Dashed tag | Same | Line style |

- In dark themes red **loses chroma and gains lightness**: 0.2 → 0.125, L 0.52 → 0.79. Otherwise it glows and vibrates on black (unverified; consistent with Material's advice to desaturate brand colours in dark themes [S5]).

## 8. Materials (optional decoration, never carrying information)

- **Grain:**
  - Desaturated SVG `feTurbulence` noise with `mix-blend-mode: soft-light` at opacity .5.
  - It suppresses banding in large gradients and gives flat colour some texture.
- **Frost:**
  - `color-mix(surface 62%, transparent)` plus `backdrop-filter: blur(16px) saturate(1.2)`.
  - Only for bars floating over content (toolbars, bottom input bar).
- **Vignette:**
  - Light: darken the corners by 8% black.
  - Dark: lift the top by 4% white and darken the bottom by 35% black, giving a "top light".
- **Gradient ring:**
  - A 1px gradient ring drawn with `mask-composite: exclude`, from 35% ink at the top to 4%.
  - Good for hero cards; at most one per view.
- **Glow:**
  - A radial white light (13%) at the top of dark cards.
  - This is the main source of polish in dark UIs, similar to Raycast / Linear (unverified generalisation).
- **Dither / Hatch:**
  - A 4px dot grid or 45° hatching for chart fills, disabled areas and placeholders.
  - It continues Nothing's dot-matrix language [S10].

## 9. Focus, selection, images, icons, code

- **Focus ring.** `outline: 2px solid var(--ink)` + `outline-offset: 2px`, plus a `0 0 0 4px var(--page)` "washer" so it separates from any background. Inputs use `focus-within` and switch the ring from line to line-strong.
- **Selection.** `::selection` uses an ink background with page text (inverted). No blue at all.
- **Images.** In a monochrome UI, user screenshots and photos default to `grayscale(1) contrast(1.05)`, plus `brightness(.85)` in dark themes, so one bright image doesn't glare. Colour returns on hover or when opened large (unverified interaction).
- **Icons.** Only 1.5–2px line icons inheriting `currentColor`. Solid icons only for status (✓, ✕).
- **Code highlighting.** Distinguish by **lightness and weight**, not hue:
  - Keywords: ink 500.
  - Identifiers: ink.
  - Strings: ink-2.
  - Comments: ink-4 italic.
  - Diffs: added lines on `fill-1`, removed lines on `red-tint`. Deletion is the only red.
- **Charts.**
  - Distinguish series by opacity (100% / 45%), texture (hatch / dots) and line style (solid / dashed), up to 4 series.
  - Beyond that, switch to direct labels at the line ends.

## 10. Theme switching

- **No flash.** A synchronous script in `<head>` decides the theme before the first frame and writes `data-theme` and `.dark`. Priority order:
  1. `?theme=`
  2. localStorage
  3. `prefers-contrast: more`
  4. `prefers-color-scheme`
- **Circular reveal.**
  - Call `document.startViewTransition(swap)`. After `ready`, animate `::view-transition-new(root)` with `clip-path: circle(0 → R)` from the click point [S12].
  - Parameters: 560ms, `cubic-bezier(.65,0,.35,1)`.
  - Without API support, or under `prefers-reduced-motion`, switch instantly.
  - During the switch, add `.theme-switching` to html to freeze all transitions, so components don't each fade into a "rainbow".
- **Component-level overrides (dark / light islands).**
  - Any subtree with `class="dark"` or `data-theme="white"` redeclares the full variable set.
  - The key point: **derived variables** (like `--accent: var(--ink)`) must be redeclared on every theme scope, `:root, .dark, [data-theme] {…}`. A `var()` inside a custom property resolves on the element that declares it. If it is declared only on `:root`, islands inherit the outer value.
  - The island's root needs `font-weight: var(--fw-normal)` and `letter-spacing` set again, so dark weight compensation applies.
- **High contrast.**
  - Provide both `[data-theme=hc]` and `@media (forced-colors: active)` as fallbacks.
  - Under forced-colors, outline with the `CanvasText` system colour instead of custom shadows.
- **Reduced motion.** All animations drop to 0.01ms, View Transitions are skipped, and the streaming blur tail is removed.

## 11. Chinese typography

- Font stack: `Geist, "ANUI Sans SC", system-ui, "PingFang SC", "Microsoft YaHei"`.
  - `ANUI Sans SC` is Noto Sans SC (OFL) subset to the characters used on the page.
  - Subsetting is a modification, so it was renamed under the OFL Reserved Font Name rules. The variable wght axis is kept.
- Global rules:
  - `text-spacing-trim: trim-start`: punctuation at line start takes half width.
  - `text-autospace: normal`: adds about 1/8em between CJK and Latin text, and does not stack on top of an existing half-width space.
    - Verified in Chromium 156: at 16px, "中文 Agent 中文" measures the same 111.1px with autospace on or off.
    - Without spaces, turning it on adds 2px per side.
  - `line-break: strict`.
  - `font-feature-settings: "chws"`: contextual punctuation squeezing.
  - Numbers use `tabular-nums`.
- Line height: 1.55 light, 1.6 dark. For Chinese body paragraphs we suggest 1.7 (unverified).
- Weight mapping: Chinese sans faces look heavier than Geist. At the same weight 400, Chinese body text looks slightly darker. So Chinese body text doesn't use weights above 500 for emphasis; use ink colour plus 500 instead (unverified).

## 12. Craft rules (still apply)

- Font sizes only 12 / 13 / 14 / 20, minimum 12px.
- Concentric radii: `R_in = max(0, R_out − padding)`. Scale: chip 6 / control 8 / card 12 / window 16.
- `clip-audit.js` must report cut = 0 in all 6 themes (run automatically by `npm run check`).
- IME guard: block Enter within 500ms after `compositionend`, and check both `isComposing` and keyCode 229.
- Additional acceptance items:
  - Run `scripts/contrast.py` to check APCA and WCAG for every token pair.
  - Screenshot each of the 6 themes (`SHOTS=1 npm run check`).
  - Derived variables inside dark islands must be correct: the primary button in an island is white with black text.
