<!-- English translation of references/components.md. The Chinese file is canonical; keep headings in sync. -->
# Component specs (Components)

Each component lists: **purpose / structure / states / sizes and tokens / motion / interaction / recommended implementation / accessibility / DAU craft corrections**.

**Where the numbers come from.**
- Values come from BUI source classNames (`slev12397/beautiful-ui@44a274e`).
- A `→` in parentheses is the value after mapping to the "≤4 font sizes, minimum 12px" rule.
- Values absent from the source and filled in by this skill are marked "unverified" (meaning: a design choice, not compared against the original site).
- Visual tokens follow tokens.md. Colour names used here (accent, green, orange) are mapped to monochrome in ANUI (accent = ink; see tokens.md §2).

**Stack.**
- React + Tailwind (the v4 @theme from tokens.md).
- shadcn/Radix: Popover, DropdownMenu, Collapsible, Tooltip, Dialog, ToggleGroup.
- Framer Motion, or the `motion` package (BUI uses `motion@13`).
- Icons: BUI uses Central Icons (round-outlined, radius 2, stroke 2) and iconoir; lucide (strokeWidth 2–2.4) is a substitute.

General craft (all components):
- Font sizes only 12/13/14 (+20); weights 400/500; hierarchy via ink/ink-2/ink-3.
- Outlines are `shadow-hairline` (0.5px ring); don't stack 1px solid borders.
- Nested radii: `R_in = max(0, R_out - padding)`.
- No "·" middle dots in copy; no explanatory subtitles.
- For elements with shadows, the clipping ancestor must leave an `offset+blur+spread` margin. Before delivery, run `scripts/clip-audit.js` until `cut === 0`.
- Demo timer scripts → in production, drive everything from real events (step/tool/approval events over SSE/WebSocket).

---

## 1. Loading State

- **Purpose:** waiting on long tasks.
  - Variants: Drive / Dots / Orbit / Surfer (Drive plus a 16:9 media card below).
- **Structure:** `[3×3 pixel grid] [shimmer label] [timer]`, `gap 10px`, `role="status"`.
- **Tokens:**
  - Grid cells 4px, gap 1.5px, `bg-ink`.
  - Label 13px/500 shimmer.
  - Timer mono 12px ink-3 tabular-nums.
  - Surfer media card `w-56 rounded-[10px] shadow-overlay` on `--tooltip-bg`, with a caption in mono 10px (→12px) `--tooltip-muted`.
- **Motion:** see motion-advanced.md appendix §3 (650ms/950ms, 90/110ms delay steps). The timer refreshes every 100ms.
- **Implementation:**
  - Pure CSS: 9 spans with inline `animation-delay`.
  - The timer uses a `performance.now()` difference rather than accumulating setInterval ticks (unverified; prevents drift).
- **Accessibility:** grid `aria-hidden`; outer `role="status"` with a readable text label; reduced motion freezes the grid.
- **DAU:** the timer must count from the task's real start time. When the task ends, switch to the result immediately; don't "finish the show".

## 2. Thinking (reasoning trace)

- **Purpose:** an expandable reasoning process.
  - Variants: Steps / Reasoning / Search / Coding.
- **Structure:**
  - Title button: icon + "Thinking" (shimmer) / "Thought for N seconds" + chevron.
  - Expanded area: a 1px vertical timeline on the left (`absolute left-[3px] w-px bg-line`, container `ml-[5px] pl-4`) and a row list `flex-col gap-1 py-1`.
- **Rows:** `h-6 px-1.5 gap-2`.
  - Leading 14px icon (stroke ink-3) or spinner (`size-3 border-[1.5px] border-line-strong border-t-ink-2`, spin 700ms).
  - Main text 12.5px (→13px) `font-medium text-ink`. The Reasoning variant uses `leading-relaxed text-ink-2` paragraphs.
  - Secondary info 11.5px (→12px) ink-3 (mono in the Coding variant).
  - Coding's `+N −M` in mono 11px (→12px) green/red.
  - The Search variant uses `animated-underline` (280ms ease-link scaleX).
- **States:**
  - working: title shimmers, icon ink-2;
  - done: title ink-2, `fade-in 350ms`, icon ink-3;
  - collapsed / expanded.
- **Sizes:**
  - Container `max-w-95` (380px; BUI custom spacing, 95×4px).
  - Title button `-mx-1.5 px-1.5 py-1 rounded-control hover:bg-hover-2`, 13px/500.
- **Motion:**
  - Container `min-height 400ms ease-out-strong`.
  - Expand `grid-rows 400ms`; vertical line `height 500ms`.
  - New rows `fade-up 300ms`; chevron `rotate 300ms`.
- **Implementation:** Radix `Collapsible`. Rows are appended from `reasoning_step` events; Framer `AnimatePresence` handles new-row entrances.
- **Accessibility:** button `aria-expanded`; the "Thinking" text sits inside `role="status"` (from BUI); focus doesn't jump on completion.
- **DAU:**
  - Separate the process layer from the conclusion layer (three-level disclosure).
  - On completion, collapse automatically into a one-line summary that doesn't take the first screen.
  - Never treat `- [ ]` in model text as evidence of execution.

## 3. Streaming Text

- **Structure:**
  - Paragraph: 13px leading-relaxed ink.
  - Inline source chips: `h-4.5 rounded-[5px]`; 12px favicon icon `size-3 rounded-[3px]` + domain in mono.
  - Action bar: copy / retry / thumbs up / thumbs down, `size-6 rounded-[6px] text-ink-3 hover:bg-hover-2`.
  - Source stack: `-space-x-1` avatars `size-3.5 rounded-full` with an outer ring `0 0 0 1.5px var(--canvas)`, plus "10 sources" in 12px ink-2.
  - Expanded source list: `rounded-[10px] bg-inset p-1 shadow-hairline`; rows `rounded-[6px] px-1.5 py-1` 12px. Concentric: 10−4=6 ✔.
  - Follow-ups:
    - title 12px/500 ink-2;
    - rows 12.5px→13px, `rounded-[7px] border-b border-line px-1.5 py-1.5`;
    - leading ↵ 11px icon in ink-3.
- **States:**
  - streaming: StreamText blurred leading edge + solid caret;
  - settled: caret blinks or is removed; action bar, sources and follow-ups fade in over 400ms.
- **Sizes:** `max-w-95`; the demo uses `min-h-[15.5rem]` (reserved height to prevent jumping).
- **Motion:** motion-advanced.md appendix §4.
- **Implementation:** append tokens directly; render Markdown with incremental parsing (unverified); source list with Radix Collapsible.
- **Accessibility:**
  - The streaming region is `aria-live="polite"`, with `aria-busy` true while streaming (required by this skill; not in BUI).
  - Caret `aria-hidden`; action buttons need `aria-label`.
- **DAU:**
  - Viewport following with a 40px threshold plus "back to bottom".
  - Follow-up row `border-b` becomes a 0.5px hairline.
  - Source domains 10.5px→12px.

## 4. Approval Card (human in the loop)

- **Purpose:** the agent asks a question or requests permission before acting; multiple questions can be paged.
- **Structure:**
  - Card: `max-w-80 rounded-card bg-surface shadow-card overflow-hidden`, entering with `fade-up 380ms`.
  - Close button: `primitive-icon-button` (28px), `absolute right-2.5 top-2.5`.
  - Body `p-3`:
    - Question title 14px/500 ink (`pr-7` to clear the close button).
    - Option list (GlideMenu, `mt-2.5 gap-1`):
      - rows `rounded-control pl-1 pr-2 py-1 gap-1.5`;
      - radio dot `size-4`; when selected, an inner dot `size-1.5 bg-canvas` scales 0→1 (200ms);
      - text 13px (ink when selected, ink-2 otherwise).
    - The last row is a "custom answer" input (13px, placeholder ink-3).
  - Footer `p-2.5 flex justify-between`:
    - Left: ‹ `1/3` › pager. 18px buttons `rounded-[5px]`; count 12px/500 tabular-nums ink-3; disabled opacity .3.
    - Right: button group (Button sm: 27px pill, 13px). Skip = secondary; Continue/Approve = primary (ink background).
- **Done state:**
  - Replaced by a `pop-in 260ms` success pill: `bg-green-tint text-green rounded-full py-1 pl-1 pr-2.5`, 12.5px/500, with a `size-4.5` green circle and white check.
  - Plus an "Undo / reset" text button in 12px ink-3.
- **Motion:**
  - Questions slide horizontally with `transform 360ms cubic-bezier(0.22,1,0.36,1)`, and the viewport `height` transitions in sync.
  - Inactive pages are `aria-hidden` with an opacity transition.
  - Auto-advance `ROLL_MS 400`.
- **Implementation:** Radix `RadioGroup` for the options (arrow keys). The viewport uses Framer `animate={{height}}` + `x: -index*100%`.
- **Accessibility:** viewport `aria-live="polite"`; options with `aria-pressed` / radio semantics; close `aria-label="Dismiss"`; Esc closes (required by this skill).
- **DAU:**
  - **Always show what is affected** (target file paths, commands, external recipients). For writes, deletes and outbound sends, list the objects in the card.
  - Read-only actions don't trigger approval.
  - After "deny" or a timeout, the task pauses gracefully.
  - Decide close to the work: the card appears at the current position in the message flow, not as a global modal.
  - No explanatory subtitle under the question title.
  - Radii: card radius 10 + padding 12 → inner option rows should be ≤ 0–2. BUI uses 8.
    - Per the DAU rule, either change the rows to `rounded-[4px]`, or shrink the card padding to 4px so rows can use 6px.
    - Use the latter for menu-like cards and the former for form-like cards.

## 5. Tool Chips (tool calls)

- **Structure:**
  - Header button: chevron 12px + "Used N tools / Edited N files" 12.5px→13px ink-2 tabular-nums.
  - Expanded list `gap-1`. Rows `h-7 rounded-control px-[3px] gap-2 hover:bg-hover-2`:
    - a 16px icon slot that shows the tool icon by default and cross-fades to a chevron on hover/expand (100/150ms);
    - a label 12.5px/500→13px ink;
    - an argument chip: `h-5.5 rounded-chip bg-field px-1.5 text-[11.5px]→12px ink-2 shadow-hairline truncate`, optionally mono.
  - Row detail: `ml-2 pl-3.5 border-l border-line`, lines 11.5px→12px `leading-[1.6]`, added lines green.
  - File diff chips at the bottom: `mt-2.5 pt-2.5 border-t border-line flex-wrap gap-1.5`.
    - Chip `h-7 rounded-chip px-2 gap-2`, mono 11.5px→12px; `+N` green, `−M` red.
    - They appear in turn with `fade-in 300ms`, delay `i*80ms`.
- **Diff hover preview:**
  - Rendered in a body portal, so a parent with a transform can't clip or offset it.
  - Container: `fixed z-50 w-72 rounded-[10px] bg-surface shadow-overlay`.
  - Header: `px-2.5 py-1.5 border-b`, mono 11px→12px.
  - Body: mono 11px→12px `leading-[1.8]`, with a `w-3` prefix column.
- **States:** pending (argument chip may shimmer, unverified) / running / done / error (red-tint chip; unverified, BUI has no error state). The demo reveals steps with `STEP_MS 700`.
- **Implementation:** Radix `Collapsible` per row + `HoverCard`/`Popover` for the diff preview (built-in portal and collision detection).
- **Accessibility:** each row `aria-expanded`; diff chips `aria-label="Show diff for {file}"`; focus opens the preview and blur closes it (from BUI).
- **DAU:**
  - One tool call = one row: launch, arguments, status and result in one place. Don't print a row per event.
  - "Accepted ≠ executed".
  - The `border-l` detail line is a timeline, not a card stripe, so it is allowed, but use a 0.5px hairline in `--line`.
  - The portal overlay's shadow extends 36px; make sure it is not inside an overflow container.

## 6. Task Rows

- **Variants:**
  - Capsules: each row is its own capsule card, `bg-surface shadow-card`, with `gap-2` between rows.
  - List: a single card `rounded-card shadow-card`, rows `border-b border-line last:border-0`.
- **Row header:** `h-11 px-2.5 gap-2.5`, laid out as:
  1. a 24px status slot;
  2. title 13px/500 ink truncate;
  3. amount/metric 12.5px→13px ink-2 tabular-nums;
  4. status pill;
  5. a 28px chevron slot (`-ml-2 rounded-full ink-3`, rotate 300ms).
- **Status slot:**
  - running: a progress ring (size≈22, base ring `--line`).
    - Either a spinning arc with `dasharray c*0.28 c*0.72`,
    - or a ProgressRing with `dashoffset = c*(1-progress)` and a centre number 10.5px→12px/600.
  - failed: `size-5.5 rounded-full bg-red` with a white icon, `pop-in 300ms`.
  - done: the same size, `bg-green`.
- **Status pill:** `h-5.5 rounded-full px-2 text-[11.5px]→12px font-medium`.
  - Done: `bg-green-tint text-green`.
  - Failed: `bg-red-tint text-red` + a spinning retry icon (spin 1.2s).
  - Retrying / Recovered: `fade-in 200ms`.
- **Expanded detail:**
  - grid-rows 300ms; `grid-cols-[24px_1fr] gap-2.5 px-2.5 mb-2.5`.
  - The left column is a 1px vertical line `bg-line`, aligned with the status slot's axis.
  - Detail lines: `label 12px ink-2` ↔ `value mono 11.5px→12px ink-3 tabular-nums`.
- **Hover:** row `hover:bg-inset`, `transition-[border-radius,background-color] 300ms`.
- **Implementation:** Radix `Accordion type="multiple"`; state driven by task events.
- **Accessibility:** row header buttons `aria-expanded`; status pill text is readable (don't rely on colour alone); progress ring `role="progressbar" aria-valuenow` (required by this skill).
- **DAU:**
  - Failed rows keep the error reason and the completed part, and offer a "safe retry".
  - "Stop request sent" and "stopped" are two separate states.
  - Capsule cards have radius 10 and no nested rounded elements.

## 7. Chat (ChatComposer panel)

- **Purpose:** a tabbed conversation panel; the reply sequence starts only after the user sends.
- **Shell:** `flex h-[288px] w-full max-w-95 flex-col overflow-hidden rounded-[14px] bg-surface shadow-card` (fixed height, internal scrolling).
- **Top bar:** `flex shrink-0 items-center justify-between border-b border-line p-1.5`.
  - Tabs: `rounded-[6px] px-2 py-[3px] text-[13px] text-ink`. Active `bg-hover-2`; inactive at reduced opacity (`transition-[background-color,opacity] 100ms`).
  - Three 24px icon buttons on the right: new, history, more.
- **Message area:** `flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pt-2.5 pb-1`.
  - User messages: a bubble inside `flex justify-end pl-14` (unverified: `rounded-[10px] bg-hover-2 px-2.5 py-1.5 13px`).
  - Agent replies: `flex w-full flex-col gap-1.5`, entering with `transition-[opacity,filter,transform] 400ms`.
  - Reasoning rows: `flex items-center gap-1 text-[12px] leading-[1.3]`, made of step name `font-medium text-ink` + source `text-ink-2` + "for 4s" in ink-3.
  - Body: `text-[13px] leading-normal text-ink`.
- **Input:**
  - Wrapper `mt-auto shrink-0 p-1.5` containing `flex cursor-text flex-col gap-2 rounded-control border border-line bg-field p-2.5 shadow-[0_1px_2px_rgba(0,0,0,.035)]`; focus-within `border-line-strong`.
  - Textarea `min-h-4.5 bg-transparent text-[13px] leading-[1.4]`.
  - A 24px send button at the bottom right.
- **Motion:** replies `fade-up 400ms ease-out-strong`; reasoning rows shimmer first and switch to the elapsed time when done.
- **Implementation:** virtualise the message list (long sessions); Radix Tabs. Sending uses the same IME guard as the Prompt Bar.
- **Accessibility:** message area `role="log" aria-live="polite"` (required by this skill); tabs `role="tab"`.
- **DAU:**
  - Each tab keeps its own draft.
  - Viewport following with a 40px threshold.
  - `border` becomes 0.5px.
  - The 12px reasoning rows already meet the minimum.

## 8. Prompt Bar ⭐

- **Variants:**
  - Rounded: `rounded-[14px]`; when tall, `rounded-[22px] p-3.5 gap-2.5`.
  - Pill: single line `rounded-full`; `rounded-[24px]` with attachments or in the wide layout.
- **Shell:** `relative isolate flex-col overflow-hidden border border-line bg-surface shadow-card p-1.5 gap-1.5`, `focus-within:border-line-strong`, `transition-[border-color,border-radius] 150ms`.
- **Layout:** grid `grid-cols-[28px_minmax(0,1fr)_auto_28px_28px] items-end gap-x-1`.
  - Columns: [+ attachments/sources 28px] [textarea] [model picker] [dictation 28px] [send 28px].
  - In the wide layout the textarea takes the first row alone and the buttons move to the second.
- **Input:**
  - 13px/18px, `min-h-7 px-1 py-[5px]` (tall: 14px/20px `min-h-[68px] p-2`).
  - `resize-none bg-transparent [overflow-wrap:anywhere]`; placeholder "Write a message…" in ink-3.
  - Auto-grow: `height = clamp(scrollHeight, min, 100px)`, then `overflow-y:auto`.
- **Attachment chips:** `h-6.5 bg-field shadow-hairline py-1 pl-1.5 pr-1 text-[11.5px]→12px ink-2`; name `max-w-36 truncate`; remove button `size-6 hover:bg-line/70`.
- **Model button:** `h-7 px-1.5 gap-1 text-[12px] font-medium ink-2 hover:bg-hover`.
  - Menu: `w-44 rounded-[10px] bg-surface p-1 shadow-raised`.
  - Rows `h-7.5 rounded-[6px] px-2`: name 12.5px→13px/500 + tag 11px→12px ink-3 + check.
  - **The menu is rendered outside the overflow-clipped composer and measured into alignment** (from a BUI source comment).
  - Switching models plays glimm inside the composer (a WebGL rainbow sweep, `easeOutExpo`).
- **@ / slash menu:**
  - Grows upward from the composer's top edge: `absolute inset-x-0 bottom-full mb-2 rounded-[10px] bg-surface p-1 shadow-raised`.
  - Rows `h-9 rounded-[6px] px-2 gap-2.5`: 22px icon + name 12.5px→13px/500 + description 12px ink-3 truncate + "Connect" 12px/500 on the right.
  - Footer hint: `border-t px-2 pt-1.5 text-[11px]→12px ink-3`.
  - GlideMenu highlight 220ms.
  - Trigger: a regex matches `@query` or `/query` before the caret, filtered by prefix.
- **Dictation:** button `aria-pressed`. While recording, it shows 4 bars `w-[2.5px]` with `eq-bounce 900ms`, staggered 150ms, and the placeholder becomes "Listening…".
- **Send:**
  - `size-7` (Rounded `rounded-[8px]`, Pill `rounded-full`).
  - `bg-ink text-surface` when sendable; otherwise `bg-line-strong text-ink-2` + disabled.
  - `enabled:active:scale-[0.94]`; arrow icon 16px stroke 2.4.
- **Implementation:**
  - Prefer `field-sizing: content` + `max-height` for the textarea, falling back to scrollHeight measurement.
  - Menus: Radix `Popover` (`side="top"`, portal, so the `overflow-hidden` shell can't clip it) or cmdk.
  - Model picker: Radix `DropdownMenu`.
- **Accessibility:**
  - Textarea `aria-label="Prompt"`; every icon button has an `aria-label`; menus `aria-expanded`.
  - The @ menu needs `role="listbox"` + `aria-activedescendant` and support for ↑↓ Enter Esc (unverified: BUI takes over with onKeyDownCapture).
- **DAU corrections (required):**
  1. **IME guard.**
     - BUI only checks `!event.nativeEvent.isComposing`, which is not enough.
     - Add a `compositionend` timestamp: treat an Enter within 500ms as a ghost key, block it and **reset the timestamp immediately**.
     - Shift+Enter inserts a newline.
  2. **Auto-grow limit.**
     - BUI's 100px is low; desktop workspaces should use 240–320px.
     - Transition the shell height with asymmetric easing (grow fast, shrink softly).
     - Past the limit, hide the scrollbar **locally** (`scrollbar-width:none`) and keep wheel and keyboard scrolling.
  3. **Shell overflow.**
     - The shell's `overflow-hidden` exists only to clip the glimm canvas and the radius. The `shadow-card` on the same element is unaffected.
     - The **parent** scroll container must leave shadow margin.
     - Menus must be portalled or placed outside the shell.
  4. **Session behaviour.**
     - Store drafts and attachments per session.
     - Block duplicate submits while sending.
     - While running, the send button becomes "Stop".
  5. **Borders.** `border border-line` 1px → 0.5px (or use `shadow-card`'s own ring and drop the border).

## 9. Recommendation Card

- **Structure:** `w-full max-w-95 overflow-hidden rounded-card bg-surface shadow-card`.
  - Body `primitive-card-pad` (12px):
    - title 14px/500 ink (e.g. "Place this restock order?");
    - body `mt-1.5 min-h-12 text-[13px] leading-relaxed text-ink-2`, with an embedded EntityChip (round logo + `font-medium text-ink`) and a ValuePill (e.g. lead time `7 days`, a small green-tint pill).
- **Footer:** `primitive-card-footer flex items-center justify-between gap-3 bg-surface`.
  - Left: a confidence meter.
    - Three `w-1 rounded-full` bars of increasing height (`flex items-end gap-0.5`); the lit colour follows the level (`transition-colors 300ms`).
    - Label `12.5px/500 ink-2` (→13px).
  - Right: `Alternatives` (secondary sm) + `Accept` (accent sm).
- **Alternatives drawer:**
  - Below the card: `grid-rows 300ms`, `border-t border-line bg-surface px-2 py-2`.
  - Group titles: `px-1.5 pb-1 text-[11px]→12px font-medium ink-3`.
  - Rows (unverified h-9) `px-2.5 text-[12.5px]→13px`: confidence bars + name truncate + `11px→12px ink-3` meta on the right.
  - Selecting one "promotes" it to the main recommendation; the body does `fade-in 180ms`. Drawer curve `cubic-bezier(0.16,1,0.3,1)`.
- **Done state:** a success pill (same as the Approval Card).
- **Accessibility:** Alternatives `aria-expanded`; confidence needs text ("High confidence").
- **DAU:** the card's outline doesn't jump (the drawer expands inside the card); before confirming, say what will happen (order target / amount).

## 10. Context Cards (retrieved context)

- **Container:** `flex w-full max-w-95 flex-col gap-2`.
  - Header `flex items-center gap-2 px-0.5`: "All chunks" `13px/600 ink` + count `h-5 rounded-md bg-inset px-1.5 11.5px→12px/500 ink-2 shadow-hairline tabular-nums`.
- **Chunk card:** `overflow-hidden rounded-card bg-surface shadow-card`.
  - Card header `primitive-card-bar (10px 12px) flex items-center gap-2.5 border-b border-line`: icon + title `13px/500 ink truncate` + character count `ml-auto 12px ink-3 tabular-nums` on the right.
  - Body: `px-3 pt-2 pb-1 text-[12.5px]→13px leading-relaxed ink-2`.
  - Source area `px-3 pb-3`, containing:
    - a chip (`h-6`, `shadow-btn`) with a `size-3.5 rounded-[4px]` coloured file badge. The badge letter in the source is 7px, a **violation**; use an icon or ≥12px.
    - a remove ×.
- **Motion:** each card "enters only once" with `fade-up 400ms ease-out-strong` and then stays; sources `fade-in 400ms`.
- **DAU:** each piece of context can be removed individually; make it clear these are the chunks the agent actually read.

## 11. Diff Table

- **Shell:** `w-full max-w-95` → `relative overflow-hidden rounded-card bg-surface shadow-card`.
- **Card header:** `primitive-card-bar flex justify-between border-b border-line`: title `12.5px/500 ink` (→13px) + hint `11px ink-3` (→12px, "Click a changed row to toggle").
- **Table:** `w-full table-fixed border-collapse`; header cells `primitive-table-cell 12px/500 ink-3`. Body cells `primitive-table-cell (10px 12px)`:
  - name 13px/500;
  - category pill: `h-5.5 rounded-full bg-surface|bg-inset px-2 11.5px→12px/500 shadow-hairline` + a `size-1.5` department dot;
  - supplier 12.5px (→12px mono).

  Rows `border-b border-line`.
- **Changed rows:**
  - Deleted: red-tint background + red text (unverified: plus strikethrough).
  - Added: green-tint background + green.
  - An 18px square checkbox on the right (selected: solid red/green with a white check).
  - **Each changed row is itself a toggle** (click to include/exclude), `transition-colors 200ms`.
- **Scan animation:** the proposal plays once and stops in its final state (rows appear one by one with `fade-up 180ms`).
- **Footer:** `primitive-card-footer min-h-11 border-t`.
  - "2 deletions, 1 addition" in `11.5px→12px ink-3 tabular-nums` + `Apply N changes` (accent sm).
  - After applying: a `pop-in 180ms` success pill (`size-4.5` green check).
- **Accessibility:** changed rows `role="checkbox" aria-checked`, toggled with Space/Enter (unverified; BUI uses button rows).
- **DAU:** show the affected scope before Apply; distinguish "preview" from "written"; 0.5px row lines.

## 12. Records Table (AI table)

(All values come from `.records-*` in globals.css.)

- **Shell `.records-shell`:** `border 1px line; radius 10px; bg surface; shadow 0 1px 2px /.06`. The `is-fill` mode drops border, radius and shadow and fills its parent.
- **Toolbar:** `min-height 52px; padding 8px 10px; border-bottom 1px line-strong`, `gap 4px` on each side.
  - Buttons: `h 32px, radius 8, px 10, 12px/500, gap 7`, `transition 140ms ease-out-strong`, `active scale .96`.
  - Variants:
    - quiet: ink-2; active state accent-tint/accent-ink;
    - secondary: 1px tooltip-border;
    - primary: accent with white text, hover `saturate(.9) brightness(1.04)`.
  - Active-filter dot: 5px accent.
- **Filter/sort menu:** `w 190, p 6, border 1px line-strong, radius 10, shadow-overlay, pop-in 160ms, origin top-left`.
  - Group labels 10.5px uppercase 0.04em (→12px).
  - Items `7px 8px, radius 6, 12px ink-2`; hover/selected `bg-hover ink`.
  - Check mark 13px wide in accent-ink.
- **Scroll area:** `max-height 438px; overflow auto; overscroll-behavior none; scrollbar-color line-strong transparent; scrollbar-gutter stable`; on focus `outline 2px accent offset -2`.
- **Table:**
  - `min-width 990px; separate/0 spacing; 13px/500; table-layout fixed`.
  - Column widths 270/275/190/210/175.
  - Cell lines `1px mix(line 78%, transparent)` on the right and bottom.
- **Header:** sticky top, `h 35px; bg surface; 12.5px/500 ink-2` (→13px).
  - Buttons `px 12, gap 8`, hover `bg-hover ink`.
  - The sort icon appears only on hover (120ms).
  - Column-resize handle: a 12px-wide hit area with a 2px accent bar inside, `opacity 0→1, scaleY .65→1`.
- **First column:** sticky left, `bg surface; box-shadow 5px 0 8px -10px /.4` (a separator shadow while scrolling).
  - Company cell `gap 4, pl 6`.
  - Row number `24×24 11.5px→12px ink-3 tabular`. On hover/selection it becomes a checkbox:
    - 24px hit area, 18px box, radius 6;
    - light border `oklch(0.845 0.011 247.953)`;
    - selected: accent background with a white check;
    - `active scale .96`.
  - Company badge: `20×20 radius 6 bg-field 10px→12px/500`.
  - Name 13px/500 truncate. With a link, hover shows an accent-ink underline, offset 3.
- **Rows:** `h 35px; px 8`; hover `bg-hover` (120ms); selected `mix(accent 7%, surface)`.
  - A configured column:
    - header `mix(accent 8%)` + an `inset 0 2px 0 accent` top line;
    - column cells `mix(accent 4%)`, 8% on hover, 10% when selected.
- **Tags `.records-tag`:** `h 23, max-w 115, radius 8, px 7, 13px/500`.
  - `--tag-base` color-mix:
    - light: text 92% / background 18% / border 32%;
    - dark: text 86% white / background 34% / no border.
  - Overflow "+N": `h 23 radius 6 bg inset 11px→12px ink-3`.
  - A hidden measuring layer computes how many tags fit.
- **Relationship strength:** an 8px dot + ink-2 text. Links are accent-ink with a 35%-transparent underline, turning ink on hover.
- **AI column computation:**
  - An 8px accent dot with `records-pulse 1.1s`; results appear row by row.
  - Clicking the header opens a "property configuration" popover (type, tool, grounding, inputs, prompt, Run).
- **Footer:** sticky bottom, `h 35, bg inset, 14px/500 ink-2` (→13px), numbers in ink tabular.
  - "+ Add calculation" ink-3, hover ink.
  - A second calculation row stacks at `bottom 35px`.
  - Bottom info bar: `min-h 35, px 12, 11.5px ink-3` (→12px); its hint appears only when the shell is hovered (160ms).
- **Responsive:** at ≤640px the toolbar stacks vertically; on touch screens `@media (hover:none)` neutralises hover colours.
- **DAU:** 0.5px lines; popovers in a portal; virtual scrolling for large data (unverified).

## 13. Filter Table

- **Structure:** `w-full max-w-105`.
  - Filter bar: `-mx-1 mb-1 flex items-center gap-1 overflow-x-auto px-1 py-1`.
    - Chips `h-6.5`; active `bg-surface shadow-btn`.
    - Each chip contains a `size-1.5` status dot + name + count in ink-3.
  - Table: `overflow-x-auto rounded-card bg-surface shadow-card`, `min-w-[420px]`, CSS grid columns `minmax(0,1.3fr)_0.6fr_0.95fr_0.9fr`.
    - Header `12.5px/500 ink-2` (→12px).
    - Cells `px-3 py-2`, right line `var(--grid-line)`.
    - Task name `truncate font-medium ink`; dates `ink-2 tabular-nums`.
    - Status pills use `.filter-status-*`, derived from todo `oklch(0.757 0.153 66.401)`, progress `0.671 0.118 219.351` and done `0.652 0.131 162.865`.
- **Motion:** filtered results `grid-rows 300ms`; chip switching 200ms.
- **DAU:** filter chips use `role="tab" aria-selected`; status doesn't rely on colour alone (there is text).

## 14. Sidebar Nav

- **Geometry:**
  - A fixed 224px-wide tree is clipped by a 52px shell (`relative flex shrink-0 overflow-hidden transition-[width]`).
  - All icon centres stay at x=26, so nothing reflows when collapsing.
  - Rows `.sidebar-row` go 208 ↔ 36px.
  - Copy `.sidebar-copy` does `opacity 0 + translateX(-offset)` when collapsed.
  - Duration and curve come from the CSS variables `--sidebar-copy-duration` and `--sidebar-easing`. Their values live in the TSX (unverified: ≈ 200–300ms + `cubic-bezier(0.16,1,0.3,1)`).
- **Top area:** `relative mb-2.5 h-10`.
  - Workspace switcher: `absolute left-2 top-1 h-8 w-[164px] rounded-[8px] px-2 hover:bg-hover-2 active:scale-[0.99]`.
    - Logo `size-6 rounded-[7px] bg-ink 11px/600 text-surface` (→12px).
    - Name 14px/500.
  - Collapse button: `absolute right-2 top-1 size-8`. When collapsed, an expand button appears at `left-2 top-0.5 size-9`.
- **Main nav:** `group/glide flex flex-col gap-px`.
  - Rows `relative z-10 flex h-9|h-10 items-center gap-1.5 rounded-[8px] px-2`.
  - Icons `size-5 ink-2`; text `14px/500` (ink when active, ink-2 otherwise); shortcuts `12px/500 ink-3 tabular-nums`.
  - GlideMenu highlight `left/right 8px`, 36 wide when collapsed.
- **Chats section:** `mx-2 mt-3 w-[208px] border-t border-line pt-3`.
  - Group title + search button. Search expands into an `h-8 rounded-[8px] bg-field shadow-hairline` input (13px/500).
  - Items 13.5px (→13px) truncate.
  - Empty result: `px-2 py-2 12.5px ink-3` (→12px).
- **Bottom `Upgrade`:** `h-8 w-full rounded-control bg-hover-2 12.5px/500` (→13px), hover `bg-line-strong`, `active scale .98`.
- **Workspace menu:** `fixed z-50 w-64 rounded-[14px] bg-surface p-1.5 shadow-overlay`. Concentric: 14−6=8 → rows 8px ✔.
- **DAU:** tooltip/`title` in the collapsed state; status dots for background threads; navigation reachable by keyboard.

## 15. Search (command search)

- **Container:** `flex min-h-[248px] w-full max-w-72 flex-col`.
- **Panel:** `w-full overflow-hidden rounded-card bg-surface shadow-raised`.
  - Input row: `flex h-10 items-center gap-2 border-b border-line px-3 hover:bg-hover`, input 13px.
  - Results: `flex flex-col gap-px` (GlideMenu); rows `h-8 rounded-[6px] px-2 13px ink`.
  - Empty state: `flex flex-col items-center gap-1 px-4 py-8`, containing a `size-8 rounded-control bg-inset shadow-hairline` icon box + title 13px/500 + description 12px ink-3.
- **Motion:** enter/exit with `fade-in 150/200/250ms`.
- **DAU:** combobox/listbox semantics; ↑↓ to select; Enter to execute needs the IME guard.

## 16. Flowchart

- **Canvas:** `relative w-full select-none overflow-hidden rounded-card bg-page shadow-hairline` + a dot-grid background (unverified: a 16px `radial-gradient` grid).
- **Nodes:** `absolute flex -translate-x-1/2 touch-none flex-col items-start gap-1.5`.
  - Type label above: `h-6 rounded-[6px] px-2 11.5px→12px/500` (purple/blue tint for Trigger, orange tint for If/Else).
  - Card: `w-full rounded-[18px] bg-surface shadow-card hover:shadow-raised` (150ms).
  - Trigger: `flex items-center gap-2.5 p-2.5`.
    - A `size-9 rounded-[8px]` icon block (concentric: 18−10=8 ✔).
    - Title `13px/600 leading-tight` + description `mt-0.5 12px leading-snug ink-2`.
  - If/Else: `flex flex-col gap-1.5 px-3 py-2.5`. Each line contains:
    - a drag handle `ink-3/70`;
    - a keyword `w-7 12.5px ink-2` (if/and);
    - a chip with an icon (`h-6 rounded-[6px] bg-surface px-1.5 12px/500 shadow-btn`);
    - an operator;
    - a value dropdown (`size-1.5` dot + value + chevron).

    Multi-line values align with `pl-[49px]`.
- **Connectors:** SVG curves drawn from the measured card positions, `transition-[stroke] 150ms` (highlighted while dragging). Cards are draggable and connectors follow.
- **Dropdowns:** the same menu as the model picker.
  - `rounded-[10px] p-1 shadow-raised`; rows `h-7.5 rounded-[6px] px-2`.
  - GlideMenu 220ms, `pop-in 180ms`.
- **DAU:** Esc during a drag cancels and resets; menus in a portal; pointer capture.

## 17. Insight Cards

- **Container:** `min-h-[408px] w-full max-w-86`.
  - Header "Insights N ‹ ›": title `13px/600` + count `13px ink-3 tabular-nums` + two paging buttons.
  - It auto-rotates, but **stops as soon as the user interacts**.
- **Insight sentence:** `mt-1.5 12.5px leading-relaxed ink-2` (→13px).
  - Embedded entities `inline-flex items-center gap-1 font-medium text-ink`, and amounts in `font-mono 11.5px` (→12px) red/green.
  - Switching: `transition-[opacity,filter] 250ms`.
- **Card:** `min-h-[278px] rounded-card bg-surface p-3 shadow-hairline`. Two stat groups (`flex gap-4`), each with:
  - series name `12px/500 ink` + a `size-2` dot;
  - change `17px/600 tracking-[-0.01em] tabular-nums` (→20px display);
  - amount mono 11.5px (→12px).
- **Chart:** `mt-2 overflow-hidden rounded-control bg-inset shadow-hairline`.
  - Top bar `px-2.5 py-1.5 border-b`: "Trend snapshot" 11px (→12px) + a "Snapshot" pill `rounded-full bg-field px-2 py-0.5 10.5px` (→12px).
  - Stage `.insight-chart-stage relative h-[166px] overflow-hidden`, with a live line drawn by liveline.
  - Cursor: 1px ink at opacity .26.
  - Tooltip (see tokens): `px 9 py 5 radius 8 tooltip-bg border line-strong shadow-overlay 11.5px→12px tabular`, 8px series dots. Anchored at `top 8px translateX(-50%)`.
  - Touch: `touch-action: pan-y`.
- **Bottom:** a segmented control `mt-3 h-9 rounded-full bg-field p-0.5` (inner thumb `bg-white/20 duration-500`) and a follow-up button.
- The source also has an 8px letter badge (a **violation**; use 12px or an icon).
- **DAU:** rotation can be paused and paged with the keyboard; the chart has a text alternative with the values (an `aria-label` summary).

## 18. Code Block

- **Shell:** `w-full max-w-105 overflow-hidden rounded-card bg-surface shadow-card`.
- **Header:** `flex h-11 items-center gap-2 border-b border-line px-4 text-[12.5px]` (→13px).
  - Code icon in ink-3 + file name `font-mono leading-none text-ink truncate`.
  - On the right: a Copy button (Code), or `+N −M` mono 12px tabular (Diff).
- **Body:** `py-3 font-mono text-[12.5px]→12px leading-[1.65] ink-2`.
  - Lines `grid grid-cols-[20px_minmax(0,1fr)] items-start`.
  - Line numbers `select-none text-center 11px→12px ink-3`; a vertical rule `absolute inset-y-0 left-5 w-px bg-line`.
  - Code `pr-3 pl-1 break-words whitespace-pre-wrap` (wraps rather than scrolling sideways).
- **Diff:**
  - Two line-number columns, old and new.
  - Added/removed lines get a tint background + an `absolute inset-y-0 left-0 w-[3px]` colour bar (DAU: make it 2px; it is a code gutter, so it is allowed).
  - Word-level highlights are `rounded-[3px]` colour blocks; line numbers are tinted by add/remove.
- **Syntax colours** (unverified, taken from screenshots): keywords accent-ink, strings orange, everything else ink/ink-2.
- **DAU:** the copy button gives "Copied" feedback; long lines wrap so there is never a horizontal scrollbar.

## 19. Fine-tune Card

- **Shell:** `relative w-full max-w-60 rounded-card bg-surface shadow-raised`.
- **Header:** `primitive-card-bar border-b`: title 13px/500 + an "Adjust" button.
  - The button: a plus in `size-4.5 rounded-[5px] border border-accent/30 bg-accent-tint` + text in accent-ink.
  - While adjusting, the text shimmers at 12px/500. When done it becomes a green "Adjusted" (`flex items-center gap-1.5 12px/500 text-green`).
- **Layout section:** `primitive-card-pad flex flex-col gap-2 border-b`.
  - Label 12.5px/500 (→12px).
  - Segmented control `relative grid grid-cols-3 rounded-control bg-field p-0.5`, with a thumb `absolute inset-y-0.5 rounded-[6px] bg-surface shadow-btn transition-transform 300ms` (concentric: 8−2=6 ✔).
- **Number fields:** `grid grid-cols-2 gap-2`.
  - Field (unverified: `h-6.5 rounded-[6px] bg-field px-2 shadow-hairline`) with label `11.5px ink-3` (→12px) + input `12px tabular-nums`.
  - **Scrubbing:** hovering the label shows a ↔ cursor, and dragging changes the value.
  - ↑/↓ steps, ⇧ for ×10, and direct typing is allowed.
- **Type dropdown:** `primitive-card-footer`.
  - Trigger `relative w-30`.
  - Menu `absolute right-0 bottom-8 z-10 w-30 rounded-[10px] bg-surface p-1 shadow-raised`, `pop-in 200–250ms`.
  - An ink-3 placeholder when nothing is selected.
- **Implementation:** pointer capture + `movementX`; `inputMode="decimal"`; value changes apply live to the canvas object.
- **DAU:** structured controls beat typing; the agent's adjustment must be visible (shimmer) and undoable.

## 20. Selection Actions

- **Paragraph:** `text-[13px] leading-relaxed text-ink` (container `relative select-none pb-12`, max-w 460).
  - Selection highlight `box-decoration-clone rounded-[3px] bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))]`; accent-tint in dark.
- **Action bar:** `absolute top-0 left-0 z-10`, positioned below the last line of the selection.
  - Body: `flex h-9 w-fit items-center gap-0.5 overflow-hidden rounded-full bg-surface p-1 shadow-overlay` (concentric: 18−4=14 → inner buttons `rounded-full` size-7 ✔).
  - Input: `h-7 pr-2.5 pl-3 12.5px` (→13px), placeholder "Describe edits".
  - Divider: `mx-0.5 h-4 w-px bg-line`.
  - Action buttons: `h-7 px-2.5 12.5px ink-2 gap-1.5` (Explain / Improve).
  - More/send: `size-7 rounded-full` (send is `bg-ink text-surface active:scale-[0.94]`).
- **State machine:**
  1. idle;
  2. typing or picking an action;
  3. working: a `size-3 border-[1.5px]` spinner at 700ms + copy;
  4. the result streams in, replacing the selected text (StreamText);
  5. done: accept or undo.
- **Motion:**
  - Each segment expands and collapses with `transition-[max-width,opacity,transform] 400ms`.
  - The bar follows reflowing text with `transform 320ms ease-out-strong`, plus `opacity 180ms`.
  - Entrance: `pop-in 220ms`.
- **DAU:** the floating bar is portalled to avoid clipping; native selection semantics are kept; Esc closes; the input has the IME guard.

## 21. Agent Screen

- **Resting card:** frames a screenshot (`relative min-h-0 overflow-hidden rounded-[8px] bg-inset`, outer `shadow-card`).
  - Hover overlay `bg-[rgba(17,19,24,0)] → 0.18` (150ms), with an accent "Open" pill rising in the middle (`translate-y-1 opacity-0 → 0/1`, 150ms).
  - Title `mt-2.5 px-0.5 13px/500 ink truncate`.
  - Decorative cursor `drop-shadow(0 1px 1.5px rgba(0,0,0,.35))`.
- **Viewer:** `fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6`.
  - Backdrop `bg-black/60 dark:bg-black/75`.
  - Window `relative flex max-h-full flex-col overflow-hidden rounded-[16px] bg-surface p-2 pt-0 shadow-overlay` (concentric: 16−8=8 → screen `rounded-[8px]` ✔).
  - Top bar `h-11 justify-between px-1.5`.
  - "Teach a task" starts recording, and the button becomes `bg-red text-white h-[27px] rounded-full pl-2.5 pr-3 13px/500`.
- **Collapsed while recording:** the card shows a REC badge `rounded-full bg-red-tint py-0.5 pl-1.5 pr-2 11.5px→12px/500 tabular-nums text-red` + a timer.
- **Loading variant:** a simulated browser skeleton inside. Its address bar is `bg-field font-mono 9px`, a **violation**; use 12px or a pure skeleton bar `h-1.5 rounded-full bg-line(-strong)`.
- `streamSrc` accepts a real image or video stream.
- **DAU:**
  - The recording state is real.
  - `scrollbar-gutter: stable` when the viewer opens, to prevent jumping.
  - Esc closes; focus moves in and is returned.

## Atoms

- **Button:** pill, `active:scale-[0.96]`, 150ms.
  - Variants:
    - primary: `bg-ink text-canvas` + `inset 0 1px 0 rgba(255,255,255,.14)`;
    - secondary: `bg-surface shadow-btn hover:bg-inset`;
    - ghost: `bg-hover-2`;
    - accent, success, quiet.
  - Sizes: xs `h-7 px-2.5 12px/400`, sm `h-[27px] px-3 13px`, md `px-4 py-[9px] 14px`.
- **Chip:** mono 12px `rounded-md px-1.5 py-0.5`; tones neutral (inset/ink-2) / accent / orange.
- **StatusPill:** `h-6 rounded-full px-2.5 13px/500` + a `size-1.5` dot; tones green/orange/red/accent/neutral.
- **Shimmer:** see the motion-advanced.md appendix.
- **StreamText:** see motion-advanced.md appendix §4.
- **ProgressRing / SegmentedControl / Switch / EntityChip / ValuePill / TextRow:** present in the source and reused as dependencies of the components above.
- **GlideMenu:** a single hover layer sliding between menu rows (220ms).
