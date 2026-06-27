# Contributing to @tidy/design-system

This document outlines the workflow for developing new components in the design system and consuming them in the Tidy application.

To ensure the library operates as a true *system*, a strict decoupling between domain logic and presentation logic must be maintained. Do not include business logic (e.g., file organizing, rules, prompts) in these primitives.

## Developer Setup & Contribution Flow

### 1. Adding a Component

1. **Create the Directory**
   Create a component folder under `src/components/<ComponentName>`.

2. **Define the Component**
   Create the component logic in `ComponentName.tsx`. 
   - **Crucial**: Use only the centralized design tokens from `@tidy/tokens` via Tailwind classes (e.g., `rounded-sm`, `bg-vibrancy-base`, `text-mac-label`). 
   - *Never* use hardcoded colors (`bg-black/5`) or arbitrary pixel radii (`rounded-[10px]`). 

3. **Build the Story (Documentation & QA)**
   Create a story under `ComponentName.stories.tsx`.
   - Your story must document all variants (Default, Disabled, Error, etc.).
   - If the component acts as a structural container (like `Card` or `Dialog`), render it inside a `.mac-panel` context in Storybook to verify concentric border radius nesting.

4. **Verify Accessibility (A11y)**
   - Test keyboard navigation (`Tab`, `Space`, `Enter`).
   - Confirm ARIA attributes are wired correctly (e.g., `aria-describedby`, `aria-checked`).
   - Check contrast ratios (WCAG AA). 
   - Ensure the `.mac-focus` ring is visible in both light and dark themes.

5. **Export the Component**
   Add your component to the public API by exporting it from `src/index.ts`:
   ```ts
   export * from "./components/ComponentName";
   ```

### 2. Consuming the Design System in Tidy

1. **Register the Workspace (Once)**
   Ensure the package is linked via the root `package.json` workspaces definition.

2. **Import Stylesheets**
   The global tokens and design system utility classes must be imported into the main application stylesheet (`apps/tidy/src/styles/index.css` or `theme.css`):
   ```css
   @import "@tidy/tokens/theme.css";
   @import "@tidy/design-system/dist/index.css";
   ```

3. **Import and Use Components**
   Consume the primitives directly in Tidy's React tree:
   ```tsx
   import { Button, Switch } from "@tidy/design-system";

   function AppSettings() {
     return (
       <div className="mac-panel p-4">
         <Switch id="feature-flag" />
         <Button variant="default">Save</Button>
       </div>
     );
   }
   ```
