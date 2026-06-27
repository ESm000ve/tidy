# Welcome to the Tidy Wiki

Tidy is a modern, high-fidelity macOS-native file organizer built with Electron, React, and Tailwind CSS. This wiki serves as the central documentation hub for developers, designers, and contributors.

## Documentation Index

### 1. [Design System Architecture](Design-System-Architecture)
Learn about the architecture behind Tidy's user interface, including:
* **The Split Token Taxonomy**: Static layout properties vs. dynamic semantic tokens.
* **Mac Vibrancy Materials**: How glassmorphism and translucency are unified using CSS variables.
* **Concentric Rounding Math**: Ensuring nested panels look geometrically correct.

### 2. [Accessibility & Inclusivity](Accessibility-&-Inclusivity)
Review our cross-cutting accessibility implementation:
* **WCAG AA Compliance**: High-contrast text adaptations for light-mode accent colors.
* **High-Contrast Media Overrides**: Enforcing visibility when the OS requests more contrast.
* **Radix Accessibility**: Focus management, screen reader labels, and keyboard navigability.

### 3. [Developer Workflow & Contribution](Developer-Workflow)
Follow the step-by-step guidelines for building within Tidy:
* **Adding a Component**: Naming conventions, Storybook integration, and testing steps.
* **Consuming Components**: Importing token stylesheets and building in the Electron client.
* **CI/CD Deployment**: Triggering automated Storybook builds to GitHub Pages.

---

## Workspace Layout
Tidy is organized as a yarn/npm workspace monorepo:
* **`apps/tidy/`**: The core Electron application containing the rule engine, file previewer, and AI natural language assistant.
* **`packages/tokens/`**: The design system token definition file (`theme.css`).
* **`packages/design-system/`**: The stateless component library, containing the 11 primitives and local Storybook configuration.
