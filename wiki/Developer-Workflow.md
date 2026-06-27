# Developer Workflow & Contribution Guide

This guide outlines how to build new design system components, document them, and consume them in the Tidy application.

---

## 1. Adding a Component to the Design System

To add a new component (e.g. `Dialog` or `Card`) to `@tidy/design-system`, follow this workflow:

### Step 1: Create the Component Directory
Create a subfolder under `packages/design-system/src/components/<ComponentName>`:
```
packages/design-system/src/components/ComponentName/
├── ComponentName.tsx
├── ComponentName.stories.tsx
└── index.ts
```

### Step 2: Write Component Logic
Ensure the component is stateless and relies exclusively on centralized tokens.
* **Important**: Use Tailwind classes that bind to CSS variables. Do not use hardcoded pixel sizes or custom hex values.
* **Accessibility**: Bind inputs to label elements, add keyboard navigability, and include focus outlines.

### Step 3: Write Storybook Docs
Create the story file `ComponentName.stories.tsx` to document all variants (Default, Active, Disabled, etc.).
* **Testing Container Radii**: If building a container element, wrap the story rendering inside a `.mac-panel` wrapper to verify concentric radius math.

### Step 4: Export from Public API
Export the component from the design system package entry point (`packages/design-system/src/index.ts`):
```typescript
export * from "./components/ComponentName";
```

---

## 2. Consuming Design System Components in Tidy

To use your component inside the React UI client:

### Step 1: Import Stylesheets (Workspace Entry)
Confirm global tokens and design system variables are imported into the main entry stylesheet (`apps/tidy/src/styles/index.css`):
```css
@import "@tidy/tokens/theme.css";
@import "@tidy/design-system/dist/index.css";
```

### Step 2: Import and Render
Import the element from `@tidy/design-system` directly into your page view:
```tsx
import { Button, Card, CardHeader, CardTitle } from "@tidy/design-system";

export function RulesDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automated Rules</CardTitle>
      </CardHeader>
      <Button variant="default">Add Rule</Button>
    </Card>
  );
}
```

---

## 3. Local Development Commands

Run these terminal commands from the workspace root:

```bash
# Install all dependencies across workspaces
npm install

# Start Storybook local development sandbox (port 6006)
npm run storybook -w @tidy/design-system

# Build tokens, design system, and run Electron in dev mode
npm run dev

# Compile Storybook output and packages for production
npm run build
```

---

## 4. Automated Storybook CI/CD

Storybook is automatically compiled and deployed on pushes to the `master` or `main` branches via GitHub Actions.
* The workflow file is configured at `.github/workflows/deploy-storybook.yml`.
* It compiles Storybook targeting the `/tidy/` subpath and uses official Pages APIs (`actions/upload-pages-artifact` & `actions/deploy-pages`) to update [https://esm000ve.github.io/tidy/](https://esm000ve.github.io/tidy/).
