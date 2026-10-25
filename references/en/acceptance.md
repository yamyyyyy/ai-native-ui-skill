<!-- English translation of references/acceptance.md. The Chinese file is canonical; keep headings in sync. -->
# Acceptance checklist

Tick every item before delivery. Keep the screenshots or recordings and the clip-audit receipt.

## 0. One-command self-check (this repo's demo; same for your page once you change the path)
- [ ] `npm run check` is all green. For all 6 themes: no JS errors, no external network requests, clip-audit `cut = 0`, font sizes ⊂ {12, 13, 14, 20}, and everything in `reports/contrast.md` passes.

## 1. Visual (ANUI tokens)
- [ ] Colours come only from tokens.md variables. No hue except `--red`; emphasis uses inversion. Check both `hc` and `oled`; switching themes produces no gradient flash (`.theme-switching`).
- [ ] Font families: Geist + a Chinese face (ANUI Sans SC or system) + Geist Mono. Body is 14px, line height `--lh`, weights from `--fw-*`.
- [ ] Radii only 6 / 8 / 12 / 16 / 9999. Nesting satisfies `R_in = max(0, R_out − padding)`.
- [ ] Hierarchy: light themes use layered shadows e0–e3; dark themes use lighter surfaces plus a 1px top highlight. High-contrast themes have no shadows and use a 1px ring.
- [ ] Motion uses only the 8 spring presets (motion-advanced.md §2) or their `linear()` versions. Enter and exit are asymmetric and interruptible, and every animation can say which state it expresses.
- [ ] Numbers use `tabular-nums`; press feedback uses the `press` preset.
- [ ] Under `prefers-reduced-motion` (or the demo's `?rm`) there is no translation, scaling or blur; only opacity remains.

## 2. Craft (DAU layer)
- [ ] At most 4 font sizes on the page and no text below 12px. A quick console check: `[...document.querySelectorAll('*')].filter(e=>e.childNodes.length&&parseFloat(getComputedStyle(e).fontSize)<12)`.
- [ ] No "·" separators, no redundant explanatory subtitles, no left colour-stripe cards.
- [ ] 0.5px borders (HiDPI).
- [ ] `scripts/clip-audit.js` reports `cut === 0` in all four states: default, hover, expanded and end-of-animation. Pass `{viewport:true}` for transparent windows, and set `root` to the card's parent.
- [ ] Prompt Bar:
  - Enter that confirms a Chinese IME candidate does not send; Enter after confirming does send.
  - Shift+Enter inserts a newline.
  - Long text grows smoothly to the limit, then scrolls internally with the scrollbar hidden locally.
- [ ] Scrolling up during streaming is not pulled back, and there is a "back to bottom" control.
- [ ] Opening or closing a Dialog doesn't shift the background sideways (`scrollbar-gutter: stable`).
- [ ] State comes from real events. "Stop requested" and "stopped" are distinct; failures keep the reason and any partial output.
- [ ] Approval cards show what is affected (path, command, recipient); read-only actions don't interrupt.
- [ ] Drafts and attachments are isolated per session.
- [ ] Accessibility:
  - Every icon button has an `aria-label`.
  - Expandable items have `aria-expanded`.
  - Loading has `role="status"`.
  - The focus ring is 2px ink with a page-colour gap (tokens.md §2).

## 3. Minimal delivery record
Record the runtime (OS, browser / Electron / Tauri version), screenshots of the four states, the clip-audit receipt `{ ok: true, cut: 0 }`, and any edges not covered.
