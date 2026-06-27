# Design Tokens: Before vs. After Mapping

This document serves as an audit and reference sheet of all the hardcoded styling parameters in the Tidy app that will be replaced by design tokens. It explicitly flags visual shifts caused by standardizing values to the new design system.

---

## 1. Border-Radius Standardizations

Standardizing corner radii to a clean 5-step scale will result in minor visual modifications across Tidy. Below are the mappings, visual shifts, and validation instructions.

| Before (Hardcoded) | Component / Location | Target Token | Visual Shift | Eyeball Verification Checklist |
| :--- | :--- | :--- | :--- | :--- |
| `rounded-[4px]` | `button-sm` variant, `input-otp.tsx` | `var(--radius-xs)` (4px) | **None (0px)** | Verify small badges and sub-elements retain their tight radius alignment. |
| `rounded-[5px]` | `button-default` variant, `button-icon` | `var(--radius-sm)` (6px) | **+1px Shift** | Buttons will look slightly softer. Check that focus ring outlines align cleanly with standard buttons. |
| `rounded-[6px]` | `button-lg`, compact `ThemeToggle`, `AuditLogToggleButton` | `var(--radius-sm)` (6px) | **None (0px)** | Verify that compact button states and toggles look cohesive side-by-side. |
| `rounded-[7px]` | `MacTimePicker` scroll list item hover states | `var(--radius-sm)` (6px) | **-1px Shift** | Time picker scrollable options will have slightly sharper corners. Ensure active item highlighting does not bleed. |
| `rounded-[8px]` | `FolderCard` badge, `SelectTrigger`, `SelectContent` trigger, scrollbars | `var(--radius-md)` (8px) | **None (0px)** | Ensure standard input select fields and cards look balanced and aligned. |
| `rounded-[10px]` | `.mac-panel` container utility, `AccessibilityPanel` close button | `var(--radius-lg)` (12px) | **+2px Shift** | Panel elements will look slightly softer to match glass frames concentrically. Check inner nested card alignment. |
| `rounded-[11px]` | `FolderCard` empty state dropzone, `FilterCard` button click state | `var(--radius-lg)` (12px) | **+1px Shift** | Main interactive tiles will have a slightly softer corner. Ensure background container frames sit flush. |
| `rounded-xl` (`12px`) | `.mac-glass` backdrop elements, `FolderCard` outer container | `var(--radius-lg)` (12px) | **None (0px)** | Primary tiles and cards should scale in perfect harmony. |
| `rounded-[20px]` | `NaturalLanguageRuleBuilder` dialog panel | `var(--radius-xl)` (20px) | **None (0px)** | Floating dialog panels will maintain their distinctive large rounded overlay profile. |

---

## 2. Vibrancy & Opacity Unification

To simulate macOS window vibrancy (translucency), the app has been using seven different ad-hoc opacities. We are unifying these into **four standardized vibrancy layers** using CSS variables.

| Ad-Hoc Style (Before) | Unified Token (After) | Target Semantic Layer | Rationale / Cleanup |
| :--- | :--- | :--- | :--- |
| `bg-black/5` (light)<br>`bg-white/[0.08]` (dark) | `var(--vibrancy-base)` | Base panel backgrounds (recessed cards, input fills) | Unifies base element opacities to eliminate visual clutter. |
| `bg-black/[0.03]` (light)<br>`bg-black/[0.02]` (light)<br>`bg-white/[0.04]` (dark)<br>`bg-white/[0.05]` (dark)<br>`bg-white/[0.06]` (dark) | `var(--vibrancy-base)` | Recessed utility areas (FolderCard empty, inputs) | Standardizes the background depth level for all containers. |
| `bg-black/10` (light)<br>`bg-white/[0.12]` (dark)<br>`bg-white/[0.1]` (dark) | `var(--vibrancy-hover)` | Interactive element hover states | Delivers a consistent feedback weight for mouse interactions. |
| `bg-white/[0.15]` (dark) | `var(--vibrancy-active)` | Active item selections / pressed states | Ensures active controls stand out cleanly. |
| `border-black/10` (light)<br>`border-white/10` (dark)<br>`border-black/20` (light)<br>`border-white/20` (dark)<br>`border-black/[0.05]` (light)<br>`border-white/[0.05]` (dark) | `var(--vibrancy-border)` | Etched layout borders | Standardizes structural grid outlines and card rims. |

---

## 3. Accents & Theme Semantic Colors

Centralizing color states ensures light and dark modes resolve accurately, preventing hardcoded defaults from overriding customized settings.

| Hardcoded Utility (Before) | Target Design Token (After) | Context of Replacement |
| :--- | :--- | :--- |
| `bg-yellow-500/15`, `text-yellow-700`<br>`dark:text-yellow-400` | `bg-[var(--color-accent-yellow)]/15`<br>`text-[var(--color-accent-yellow)]` | `FilterCard` rule list category pill highlighting |
| `bg-red-500/15`, `bg-red-500/[0.06]`, `border-red-500/20` | `bg-[var(--color-accent-red)]/15`<br>`border-[var(--color-accent-red)]/20` | Custom rule compilation and validation errors |
| `bg-emerald-500/20`, `bg-emerald-500/15`, `text-emerald-700` | `bg-[var(--color-accent-green)]/15`<br>`text-[var(--color-accent-green)]` | Success highlights, safe operations feedback |
| `bg-[#1e1e1e]/70` | `var(--color-mac-window-background)` with transparency | Translucent glass windows and side panels |
| `focus:bg-blue-500/10` | `focus:bg-[var(--color-accent-blue)]/10` | Highlight selections in custom dropdown menus |
| `focus-visible:ring-mac-focus-ring/50` | `focus-visible:ring-[var(--mac-focus-ring)]/50` | Focus outlines across buttons and inputs |
| `bg-mac-window-background` utilities | `var(--color-mac-window-background)` | Structural app windows and container boxes |

---

## 4. Spacing Scale Mappings

Ad-hoc padding and margins will be aligned to a strict 4px-grid system.

| Hardcoded Spacing (Before) | Spacing Token (After) | Visual Shift / Grid Alignment | Context / Checklist |
| :--- | :--- | :--- | :--- |
| `gap-[3px]` (3px) | `var(--space-1)` (4px) | **+1px Shift** | Inline AI badge spacing |
| `gap-1.5` (6px) | `var(--space-2)` (8px) | **+2px Shift** | Inputs and small control labels (makes spacing slightly more generous) |
| `gap-3.5` (14px) | `var(--space-4)` (16px) | **+2px Shift** | Card inner components layout |
| `py-[5px]` (5px) | `var(--space-1)` (4px) | **-1px Shift** | TimePicker list items padding (check scroll alignment) |
| `py-[7px]` (7px) | `var(--space-2)` (8px) | **+1px Shift** | Custom selector triggers |
| `px-3.5` (14px) | `var(--space-4)` (16px) | **+2px Shift** | Layout action panels |
