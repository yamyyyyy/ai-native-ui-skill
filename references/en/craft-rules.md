<!-- English translation of references/craft-rules.md. The Chinese file is canonical; keep headings in sync. -->
# Craft Rules (condensed from desktop-agent-ui, MIT)

> Upstream: https://github.com/Ludi-Herry/desktop-agent-ui (commit 44653f9, © 2026 Desktop Agent UI Contributors, MIT; see ../../THIRD_PARTY_LICENSES.md). This is a condensed rewrite.

## A. Eight rules of visual refinement

1. **No middle-dot "·" separators.** Use `gap`, a 0.5px vertical rule (8–10px tall) or a muted label instead.
2. **Remove redundant explanatory copy.** No subtitles, slogans or manual-style hints; let the layout do the explaining.
3. **Copy fits the context.** Match the audience, fit the control's size, no invented words, nothing flippant.
4. **Optical alignment + concentric radii.** `R_inner = max(0, R_outer − padding)`. When `padding ≥ R_outer`, the inner radius is 0–2px. Nudge asymmetric icons by about 1px to compensate optically.
5. **0.5px hairlines.** Use `border: 0.5px solid` or `box-shadow: inset 0 0 0 0.5px` (this skill uses `--ring-w`).
6. **At most 4 font sizes (3 recommended), minimum 12px.** Build hierarchy with weight 400/500/600, grey levels and spacing.
7. **Reduce decision load.** If it can be inferred, make it the default. When a decision is required, put it where the user is already working (card footer or input bar) rather than in a sudden modal. Sort features into P0/P1/P2.
8. **Restrained radii and shadows, no left-edge colour-stripe cards.** Shadows serve hierarchy only: base cards low or none, popovers medium, modals high.

## B. State and control

- State maps strictly to real events: draft / queued / running / awaiting approval / done / failed / aborted. **Never fake progress with timers or animation.**
- RICH control:
  - Visible: the current step and the files affected.
  - Interpretable: the rationale and the scope.
  - Controllable: edit the draft, pause, add input.
  - Hand-back: stop, roll back, undo. "Stop requested" ≠ "stopped".
  - Accountable: logs, diffs, versions.
- Approval scales with impact. Read-only actions pass automatically; writes, deletes and outbound sends show the target and scope.
- Layers:
  - the conversation;
  - the thinking process (a collapsible timeline that folds when done);
  - tool cards (one card per call);
  - artifacts (an independent panel that scrolls on its own).
- Multiple sessions:
  - Drafts and attachments persist per thread.
  - Background threads that await approval or fail show a status dot in the sidebar.
  - On reconnect, fetch the server snapshot first and never replay side-effecting requests.

## C. Engineering pitfalls

1. **Shadow clipping.**
   - Any ancestor with `overflow: hidden|auto|scroll`, `clip-path` or `contain: paint` clips shadows.
   - Shadow extent = `offset + blur + spread`, computed per side; with multiple layers, take the maximum.
   - Put radius clipping on the inner layer and the shadow on the outer layer.
   - Leave margin inside scroll containers. Transparent or frameless windows must grow their physical size to match.
   - Never set `overflow: visible` globally.
2. **clip-path radii.** `inset()` does not inherit border-radius; write `inset(0 round 12px)`.
3. **Hard edges mid-animation.** For translating content, use a gradient mask rather than a rectangular clip.
4. **Dialog layout jump.** Put `scrollbar-gutter: stable` on the root scroller, or use the component library's built-in compensation. Never hand-write `padding-right`.
5. **IME guard.**
   - If `isComposing` is true, let the event through to the IME.
   - Also record the `compositionend` timestamp. Block an Enter within 500ms of it and **reset the timestamp to 0 immediately**.
   - Shift+Enter inserts a newline.
6. **Auto-growing composer.**
   - Use `field-sizing: content` or a ResizeObserver.
   - The outer element gets an explicit height, asymmetric easing and `overflow: visible`.
   - Past a `max-height` of 240–320px, scroll internally. Hide the scrollbar's look **locally** only, and keep wheel, touch and keyboard scrolling.
7. **Streaming follow.**
   - Stick to the bottom only when `distanceFromBottom ≤ 40px`.
   - Freeze when the user scrolls up, and show "New reply ↓".
   - Compensate `scrollTop` for sudden height changes.
8. **Split panes.**
   - The handle gives hover and active feedback.
   - Snap to collapsed at ≤18% or ≥82%.
   - Esc during a drag: remove the listeners → make sure the handle stays mounted (`setCollapsed(false)`) → restore `previousRatioRef`.
   - Each side scrolls independently.
9. **Native semantics.**
   - Distinguish three layers: OS-native (windows, file dialogs, system menus), engine-native (wheel, selection, focus ring, scrollbars), and component-library wrappers (Modal, ScrollArea, Resizable).
   - Keep interactive controls out of `-webkit-app-region: drag` regions.
   - Title bar height is 40–46px.
10. **Restoring position.** Restore the viewport by ID or scrollY; don't blindly call `.focus()`.
11. **Change has no effect.** Confirm you are running the rebuilt output. A web preview cannot replace acceptance in a real Electron or Tauri window.
12. **Prefer mature components.** Use established libraries for complex dialogs, resizable panes and drag-and-drop. If a design system exists, keep it and don't add a second one.

## D. IME guard reference implementation

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
(`keyCode === 229` is an addition for compatibility and is not in the upstream text. W3C UI Events specifies keyCode 229 for keydowns being processed by an IME.)
