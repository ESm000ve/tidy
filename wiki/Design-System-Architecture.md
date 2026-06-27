# Design System Architecture

Tidy's interface relies on a robust design system built on custom CSS variables and Tailwind CSS v4. The system is designed to mimic the tactile feel, lighting, and materiality of macOS.

---

## 1. The Split Token Taxonomy

To prevent scaling bugs and code duplication, visual tokens are split into two categories:

### Static Tokens (`:root`)
These control structural dimensions and do not change when the theme switches.
* **Modular Spacing Grid**: Fixed to a strict 4px grid system:
  * `var(--space-1)` = 4px (tight inline gaps)
  * `var(--space-2)` = 8px (form labels and elements)
  * `var(--space-4)` = 16px (standard card padding)
  * `var(--space-6)` = 24px (layout subdivisions)
* **Concentric Border Radii**:
  * `var(--radius-xs)` = 4px (badges, checkboxes)
  * `var(--radius-sm)` = 6px (buttons, tooltips)
  * `var(--radius-md)` = 8px (inputs, triggers)
  * `var(--radius-lg)` = 12px (stand-alone cards)
  * `var(--radius-xl)` = 20px (dialog modals, window frames)

### Dynamic Semantic Tokens (`:root` vs `.dark`)
These resolve differently based on the user's theme mode or contrast settings.
* **HIG Accent Colors**: Dynamic custom properties mapping to macOS system colors (e.g. `--color-accent-blue`, `--color-accent-red`, `--color-accent-green`).
* **Vibrancy (Translucency) Layers**: Replaces ad-hoc opacities (`bg-black/5`) with four standardized depth levels mimicking macOS window materials:
  * `var(--vibrancy-base)`: Base recessed container backgrounds.
  * `var(--vibrancy-hover)`: Active mouse feedback overlays.
  * `var(--vibrancy-active)`: Selected item selections.
  * `var(--vibrancy-border)`: Etched structural container borders.

---

## 2. Concentric Corner Radii Geometry

When embedding rounded shapes within other rounded shapes (such as a list card inside a parent panel), using identical corner radii makes the corners look crowded and geometrically misaligned. 

Tidy enforces a concentric geometry rule:

$$\text{Radius}_{\text{inner}} = \text{Radius}_{\text{outer}} - \text{Padding}$$

For a standard structural panel (`.mac-panel`) utilizing `var(--radius-xl)` (20px) with `8px` of padding:
* The inner `Card` component is configured to `var(--radius-lg)` (12px)
* This yields $20px - 8px = 12px$, aligning the curved arcs perfectly around a single center point.

---

## 3. Dynamic Vibrancy & Materials

The design system implements translucency using a combination of alpha-blended backgrounds and backdrop blur filters.

```css
/* Base container vibrancy definition */
.mac-panel {
  background-color: var(--color-vibrancy-base);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-vibrancy-border);
  border-radius: var(--radius-xl);
}
```

By binding these values to CSS custom properties, Tidy allows Electron to request system-level transparency changes dynamically while the styling layers adapt instantly.
