# Build Log: Design System Extraction

This log tracks the components extracted from Tidy, the design tokens they consume, and key architectural decisions.

## [2026-06-26] Button Component Extraction (Session 1)

### 1. Button Component
- **Path**: `packages/design-system/src/components/Button`
- **Tokens Consumed**:
  - `--radius-xs` (4px) for size `sm`, `--radius-sm` (6px) for size `default`, `--radius-md` (8px) for size `lg`.
  - `--color-accent-blue` (default variant), `--color-accent-red` (destructive variant).
  - `--color-mac-window-background` (outline variant).
  - `--color-mac-label` (text content).
  - `--color-vibrancy-base`, `--color-vibrancy-hover` for secondary and ghost variant backgrounds.
  - `--color-focus-ring` (via `mac-focus` utility class).
- **Decisions / Refactoring**:
  - Established the design system's folder structure, Storybook configuration, and accessibility guidelines (Space/Enter keyboard interactions, visible outline ring).
  - Unified local components under `@tidy/design-system`.

---

## [2026-06-26] Switch & Select Component Extraction (Session 2)

### 1. Switch Component
- **Path**: `packages/design-system/src/components/Switch`
- **Tokens Consumed**:
  - `--radius-sm` (6px) for compact sizing.
  - `--color-accent-green`, `--color-accent-blue`, `--color-accent-purple` for state colors.
  - `--color-toggle-off` (`#e5e5ea` in light theme, `#3a3a3c` in dark theme).
  - `--color-focus-ring` (via `mac-focus` utility class).
- **Decisions / Refactoring**:
  - Consolidated the standalone `ui/switch.tsx` and the inline `MacToggle` component in `App.tsx`.
  - Replaced all local usages with the unified design-system package component.

### 2. Select Component
- **Path**: `packages/design-system/src/components/Select`
- **Tokens Consumed**:
  - `--radius-md` (8px) for trigger and dropdown popover borders.
  - `--color-vibrancy-base`, `--color-vibrancy-hover`, `--color-vibrancy-border` for macOS HIG glassmorphism look and list dividers.
  - `focus:bg-accent-blue/10` and `focus:text-mac-label` for selection states.
- **Decisions / Refactoring**:
  - **SF Symbols Dependency**: Agreed to depend directly on `@bradleyhodges/sfsymbols-react` internally within the design system to ensure strict macOS HIG fidelity for chevrons and checkmarks.
  - Consolidated the standalone `ui/select.tsx` and the inline `MacSelect` component in `App.tsx` and `BottomPanel.tsx`.
  - Removed local `ui/select.tsx` and refactored client calls to utilize package primitives.

---

## [2026-06-26] Input & Textarea Component Extraction (Session 3)

### 1. Input & Textarea Components
- **Path**: `packages/design-system/src/components/Input` and `packages/design-system/src/components/Textarea`
- **Tokens Consumed**:
  - `--radius-md` (8px) for input borders corner radius.
  - `--color-vibrancy-base`, `--color-vibrancy-border` for default fills and outlines.
  - `--color-focus-ring` (via ring shadows) for active state highlights.
  - `--color-accent-red` (via `aria-invalid` bindings) for error highlights.
- **Decisions / Refactoring**:
  - Unified keyboard accessibility outline highlight parameters.
  - Extracted inputs out of application packages and replaced the local search input imports in the sidebar with package primitives.

---

## [2026-06-26] Checkbox Component Extraction (Session 4)

### 1. Checkbox Component
- **Path**: `packages/design-system/src/components/Checkbox`
- **Tokens Consumed**:
  - `--radius-xs` (4px) for compact HIG checkbox corner rounding.
  - `--color-accent-blue` for checked / indeterminate states.
  - `--color-vibrancy-base`, `--color-vibrancy-border` for default fills and outlines.
  - `--color-focus-ring` (via `mac-focus` utility class) for focus state ring highlighting.
- **Decisions / Refactoring**:
  - Integrated Radix UI Checkbox with direct support for both checkmark and indeterminate state indicators (utilizing `sfCheckmark` and `sfMinus` icons internally).
  - Deleted the unused, redundant local component file `apps/tidy/src/app/components/ui/checkbox.tsx`.

---

## [2026-06-26] Label Component Extraction (Session 5)

### 1. Label Component
- **Path**: `packages/design-system/src/components/Label`
- **Tokens Consumed**:
  - `--text-sm` (13px) for standard HIG text size.
  - `--color-mac-label` for standard text color.
- **Decisions / Refactoring**:
  - Integrated Radix UI Label for native htmlFor element linking and click activation.
  - Replaced the local form-level label imports with package primitives.
  - Deleted the unused, redundant local component file `apps/tidy/src/app/components/ui/label.tsx`.

---

## [2026-06-26] Badge Component Extraction (Session 6)

### 1. Badge Component
- **Path**: `packages/design-system/src/components/Badge`
- **Tokens Consumed**:
  - `--radius-xs` (4px) corner radius for small HIG sub-elements.
  - Accent colors at 15% opacity (`bg-accent-blue/15`, `text-accent-blue`, `border-accent-blue/20` etc.) to guarantee WCAG AA text contrast.
  - `--color-vibrancy-base`, `--color-vibrancy-border` for default neutral badges.
- **Decisions / Refactoring**:
  - Designed as a purely visual, non-interactive component (no interactive ARIA).
  - Deleted the unused local component file `apps/tidy/src/app/components/ui/badge.tsx`.

---

## [2026-06-26] Dialog Component Extraction (Session 7)

### 1. Dialog Component
- **Path**: `packages/design-system/src/components/Dialog`
- **Tokens Consumed**:
  - `--radius-xl` (20px) corner radius for the dialog panel.
  - `--color-vibrancy-overlay` for the backdrop overlay (45% opacity in light theme, 60% opacity in dark theme).
  - `--color-vibrancy-border`, `--color-vibrancy-hover`, and `--color-mac-window-background` for structural borders, hover feedback, and translucent windows.
- **Decisions / Refactoring**:
  - **Animation Adaptability & Portalling**: Added a `portalled` boolean prop (defaulting to `true`) to `DialogContent` so custom animations (like Framer Motion spring actions in `NaturalLanguageRuleBuilder`) can mount their own overlays/portals while utilizing the design system variables.
  - Consolidated the local dialog elements and deleted the redundant file `apps/tidy/src/app/components/ui/dialog.tsx`.
  - Confirmed the application builds successfully.
