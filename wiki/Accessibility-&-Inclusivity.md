# Accessibility & Inclusivity (A11y)

Accessibility is treated as a fundamental design requirement within Tidy, rather than an afterthought. We ensure that automated file operations are transparent and usable by everyone.

---

## 1. High Contrast Support

Tidy adapts automatically to system-level accessibility settings via the OS `@media (prefers-contrast: more)` media query and the `.a11y-high-contrast` HTML class flag.

When high-contrast mode is activated:
1. **Translucency Flattening**: Backdrop filters (`backdrop-filter: blur(...)`) are stripped to prevent readability strain on low-vision users. Translucent background overlays resolve to flat, opaque solid fills.
2. **Explicit Boarders**: All UI components receive a defined `2px` high-contrast border matching the system text color (black on light backgrounds, white on dark backgrounds).

---

## 2. WCAG AA Text Contrast Compliance

Standard macOS HIG primary colors present contrast challenges on light backgrounds. For example, rendering primary yellow (`#FFCC00`) or orange (`#FF9500`) text on light backgrounds fails the WCAG AA 4.5:1 contrast ratio required for readable body text.

### The Solution: Accent-Chroma Splitting
To ensure both design fidelity and legibility:
* **True Accents** are used for purely visual background shapes and fills (e.g. badge backgrounds).
* **Darkened Accent Derivatives** are utilized for text styling overlays in light mode. We derived accessible derivatives (#B38600, #B85C00) specifically for light-mode typography. 
* Under dark mode, the bright HIG values already pass, so the system falls back to native values.

---

## 3. Keyboard Navigation & Focus Rings

Every interactive component in the design system is traversable by screen readers and keyboard-only users.

* **Radix Foundations**: Select boxes, Dialogs, Checkboxes, and Switches use Radix UI primitives. They manage focus trapping (inside modals), keyboard item selection (arrow keys inside menus), and spacebar/enter toggles natively.
* **Focus Outlines**: All interactive elements utilize a custom, high-visibility `.mac-focus` style:
  ```css
  .mac-focus:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--color-focus-ring-alpha);
    border-color: var(--color-focus-ring);
  }
  ```
  The focus ring uses deep blue (#007AFF) under light mode and glowing neon blue (#0A84FF) under dark mode to ensure a high-contrast ratio (3:1 non-text contrast ratio).
