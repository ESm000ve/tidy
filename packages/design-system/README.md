# @tidy/design-system

The foundational UI component library for the Tidy application, engineered with a deliberate **macOS Human Interface Guidelines (HIG)** point of view.

## Overview

This package provides stateless, reusable Radix-based primitives and custom layout containers. It strictly decouples component logic from the app's business domain while providing the signature macOS aesthetic (vibrancy, glassmorphism, native border radii, and correct accessible focus rings).

## Architecture: Tokens and Theming

The design system is built entirely on a custom CSS-variable architecture powered by Tailwind v4. It fundamentally rejects bolted-on dark modes and ad-hoc hex codes in favor of a deliberate **split token taxonomy**:

1. **Static Tokens (`:root`)**
   These values scale layouts and structure but *never* change between light and dark modes.
   - **Border Radii**: `var(--radius-xs)` (4px) through `var(--radius-xl)` (20px). These match macOS physical spacing increments to ensure perfect concentric nesting (e.g., a Card inside a `.mac-panel`).
   - **Typography**: `var(--text-xs)` (11px) through `var(--text-xl)` (22px).
   - **Spacing**: `var(--space-1)` (4px) through `var(--space-8)` (32px).

2. **Theme-Dependent Semantic Tokens (`:root` vs `.dark`)**
   These values shift dynamically depending on the current theme context.
   - **HIG Accents**: `var(--color-accent-blue)`, `var(--color-accent-red)`, etc.
   - **Material Vibrancy Layers**: `var(--color-vibrancy-base)`, `var(--color-vibrancy-hover)`, `var(--color-vibrancy-active)`, `var(--color-vibrancy-border)`. These layers automatically simulate the depth of macOS window materials without requiring manual `bg-black/5` overrides.
   - **Focus Rings**: `var(--color-focus-ring)`.

## Accessibility (A11y) First

Every component is built on accessible primitives (primarily Radix UI) and verified against strict keyboard navigation, ARIA state management, and WCAG AA contrast standards.
- Focus rings are universally styled using the `.mac-focus` utility, which provides a high-contrast focus outline matching native macOS apps.
- We support high-contrast environments via OS-level `@media (prefers-contrast: more)` and the `.a11y-high-contrast` class.

## Installation & Usage

1. Ensure the tokens package is installed and registered in your application.
2. Import the compiled stylesheets in your main entry CSS (e.g., `index.css`):
   ```css
   @import "@tidy/tokens/theme.css";
   @import "@tidy/design-system/dist/index.css";
   ```
3. Consume the components in your React tree:
   ```tsx
   import { Button, Dialog, DialogContent, DialogTrigger } from "@tidy/design-system";

   export function App() {
     return (
       <Dialog>
         <DialogTrigger asChild>
           <Button variant="default">Open Menu</Button>
         </DialogTrigger>
         <DialogContent>
           <p>This panel uses native macOS radius and vibrancy.</p>
         </DialogContent>
       </Dialog>
     );
   }
   ```

## Local Development

The library uses Storybook as its interactive sandbox and documentation hub.

```bash
# Run the local Storybook dev server
npm run storybook -w @tidy/design-system

# Build static Storybook site
npm run build-storybook -w @tidy/design-system
```
