# A11Y-REPORT.md — Cross-Cutting QA Pass
**Scope**: All ten v1 `@tidy/design-system` primitives (Button, Switch, Select, Input, Textarea, Checkbox, Label, Badge, Dialog, Tooltip) plus the Tidy app shell.
**Date**: 2026-06-26

---

## 1. Keyboard Navigation Audit

| Component | Tab-stops | Activation | Arrow nav | Esc | Result |
|---|---|---|---|---|---|
| **Button** | ✅ | Enter/Space | N/A | N/A | ✅ Pass |
| **Switch** | ✅ | Space toggles | N/A | N/A | ✅ Pass |
| **Select** | ✅ | Space/Enter opens | ↑↓, Home/End | ✅ | ✅ Pass |
| **Input** | ✅ | N/A | N/A | N/A | ✅ Pass |
| **Textarea** | ✅ | N/A | N/A | N/A | ✅ Pass |
| **Checkbox** | ✅ | Space toggles | N/A | N/A | ✅ Pass |
| **Label** | Non-interactive | Click activates peer | N/A | N/A | ✅ Pass |
| **Badge** | Non-interactive | N/A | N/A | N/A | ✅ Pass |
| **Dialog** | ✅ trap inside | Enter/Space on trigger | Tab/Shift+Tab within | ✅ | ✅ Pass |
| **Tooltip** | ✅ focus shows tip | N/A | N/A | ✅ | ✅ Pass |

---

## 2. ARIA States Audit

| Component | Key ARIA Behaviour |
|---|---|
| Button | Icon-only buttons need explicit `aria-label` (documented in stories) |
| Switch | `role="switch"`, `aria-checked="true\|false"` — Radix managed |
| Select | `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`; items `role="option"`, `aria-selected` |
| Input | `aria-invalid` → red ring + border via CSS selector |
| Textarea | Same `aria-invalid` pattern as Input |
| Checkbox | `role="checkbox"`, `aria-checked="true\|false\|mixed"` (indeterminate correct) |
| Label | `<label>` element; `htmlFor` wires via `for` attribute |
| Badge | Non-interactive `<span>` — no role forced (correct per spec) |
| Dialog | `role="dialog"`, `aria-labelledby` (Title), `aria-describedby` (Description, optional), close `aria-label="Close dialog"` |
| Tooltip | `aria-describedby` wired automatically by Radix |

> **Note**: Dialog's `aria-describedby` is absent when `DialogDescription` is not rendered. No type-level guard enforces it — Open Item #5.

---

## 3. Focus Ring Visibility (Both Themes)

All interactive DS components use `.mac-focus`:
```css
focus-visible:ring-[3px] focus-visible:ring-focus-ring/50 focus-visible:border-focus-ring
```

- `--color-focus-ring` = `#007AFF` (light) / `#0A84FF` (dark) — both pass WCAG 2.1 §1.4.11 (3:1 non-text criterion).
- **Issue**: Button `destructive` focus ring uses `accent-red/20` in light (too faint). Dark correctly uses `/40`. → **Open Item #4**.

---

## 4. High-Contrast Mode (.a11y-high-contrast) — FIXED

### Issue Found: Selectors Missed All DS Components After Token Migration

Old selectors targeted pre-migration class names that no longer exist:
```css
/* BROKEN — these classes don't exist in DS components */
.a11y-high-contrast *[class*="bg-black/5"] { ... }
.a11y-high-contrast *[class*="bg-white/[0.08]"] { ... }
```

DS components use `bg-vibrancy-base` (CSS custom property). The entire high-contrast override was a no-op for every DS component.

### Fixes Applied
1. **`accessibility.css`**: Added `--color-vibrancy-*` custom property overrides on `.a11y-high-contrast` and `.a11y-high-contrast.dark`. Added `[data-slot]` catch-all to strip `backdrop-filter` and enforce 2px borders on all DS primitives.
2. **`packages/tokens/src/theme.css`**: Added `@media (prefers-contrast: more)` block so DS responds to OS accessibility setting independently of Tidy's CSS.

---

## 5. WCAG AA Text Contrast Audit (4.5:1 required, normal text)

### Light Mode Failures

| Component | Foreground | Background | Ratio | AA |
|---|---|---|---|---|
| Button default label | #FFF | #007AFF | 3.0:1 | ⚠️ Fails normal text; passes large text only |
| Input placeholder | rgba(60,60,67,0.6) | ~#ececec | 3.9:1 | ⚠️ Marginal (placeholder; non-informational per WCAG 1.4.3 note) |
| **Badge yellow** | **#FFCC00** | **~#fffce5** | **~1.1:1** | **❌ FAIL** |
| **Badge orange** | **#FF9500** | **~#fff4e0** | **~1.7:1** | **❌ FAIL** |
| Dialog description | rgba(60,60,67,0.6) | white+blur | 3.9:1 | ⚠️ Marginal |

### Passing (Light Mode)
Button secondary/outline #000 on #ececec: 14.8:1 ✅ | Input body #000: 16.1:1 ✅ | Badge blue 4.6:1 ✅ | Badge green 4.5:1 ✅ | Badge red 4.5:1 ✅ | Badge purple 5.2:1 ✅ | Tooltip ~16:1 ✅ | Dialog title >15:1 ✅

### Dark Mode
All components pass. Badge yellow 7.8:1 ✅ | Badge orange 6.5:1 ✅ | Dialog description 4.8:1 ✅

### Contrast Fix Applied
Badge yellow/orange border opacity bumped from `/20` to `/30` for visual clarity. The light-mode text contrast failure is a design decision (HIG color `#FFCC00` cannot achieve 4.5:1 on light backgrounds) → **Open Item #1**.

---

## 6. Border-Radius Concentric Nesting

### Token Scale
| Token | Value | Used On |
|---|---|---|
| --radius-xs | 4px | Badge, Checkbox |
| --radius-sm | 6px | Button, Tooltip |
| --radius-md | 8px | Input, Textarea, Select |
| --radius-lg | 12px | .mac-panel, .mac-glass |
| --radius-xl | 20px | Dialog |

### Fix Applied
`.mac-panel` was hardcoded `rounded-[10px]` (one missed BEFORE-AFTER.md substitution). Fixed to `rounded-lg` (12px = `--radius-lg`).

### Card Nesting Answer (Session 10)
`.mac-panel` stays at `--radius-lg` (12px). Card behavior:
- **Standalone Card**: `--radius-lg` (12px)
- **Card nested inside .mac-panel** with 8px padding: `--radius-sm` (6px) — satisfies R_outer − padding = 12 − 8 = 4px minimum, with 6px being clean.
- **Card nested inside .mac-panel** with 16px padding: `--radius-md` (8px)

### Remaining Hardcoded Radii in App Shell (Out of DS Scope)
| File | Hardcoded | Should Be |
|---|---|---|
| popover.tsx | rounded-[10px] | rounded-lg |
| command.tsx | rounded-[10px] | rounded-lg |
| NaturalLanguageRuleBuilder.tsx | rounded-[10px] inline btn | DS Button |
| PreviewSheet.tsx | rounded-[10px] icon wrap | rounded-lg |

---

## 7. Tab Order & Focus Visibility in Tidy

| Area | Focus Visible | Notes |
|---|---|---|
| Sidebar trigger + menu items | ✅ DS Button mac-focus | OK |
| Main toolbar controls | ✅ DS Button/Select | OK |
| Rule Builder form | ✅ All DS components | OK |
| NaturalLanguageRuleBuilder | ⚠️ Inline button is custom | Open Item #2 |
| Dialogs (focus trap + restore) | ✅ Radix handles | OK |
| Tooltips (show on focus) | ✅ Radix handles | OK |

---

## Changes Made

| # | Fix | File | Severity |
|---|---|---|---|
| 1 | `.a11y-high-contrast` updated: vibrancy token overrides + `[data-slot]` catch-all | accessibility.css | **Critical** |
| 2 | `@media (prefers-contrast: more)` added to DS token file | packages/tokens/src/theme.css | **High** |
| 3 | Badge yellow/orange border opacity `/20` → `/30` | Badge.tsx | Medium |
| 4 | `.mac-panel` `rounded-[10px]` → `rounded-lg` token | apps/tidy/src/styles/theme.css | Medium |

**Build**: `✓ vite build — SUCCESS`

---

## Open Items

| # | Issue | Severity | Fix |
|---|---|---|---|
| OI-1 | Badge yellow + orange contrast in light mode | **Resolved** | HIG colors (#FFCC00, #FF9500) cannot reach 4.5:1 on light backgrounds. Derived accessible text-only variants (#B38600, #B85C00) from the HIG chromas. Fills keep the true accent; text role uses the darker derivative. Dark mode retains the native bright accents, which already pass. |
| OI-2 | NaturalLanguageRuleBuilder inline button bypassed DS | **Resolved** | Replaced `<button>` with `<Button variant="default" size="sm">` from `@tidy/design-system`. All consumer code now routes through the system. |
| OI-3 | popover.tsx, command.tsx, PreviewSheet.tsx use `rounded-[10px]` | Low | Replace with `rounded-lg` |
| OI-4 | Button destructive focus ring `accent-red/20` light (too faint); should match dark `/40` | Low | Change to `accent-red/40` |
| OI-5 | Dialog `aria-describedby` absent when DialogDescription not rendered, no guard | Low | TypeScript required prop or console.warn |
| OI-6 | **Card component** (Session 10) | Resolved | Built using `--radius-lg`. `.mac-panel` updated to `--radius-xl` for perfect concentric alignment. |
