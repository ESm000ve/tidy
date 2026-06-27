# Tidy Design System Extraction Plan

This document outlines the strategy for extracting a standalone, reusable, tokenized, and accessible component library from **Tidy** (React + TypeScript + Vite macOS app).

---

## 1. Component Inventory & Architectural Split

The codebase currently uses standard Radix-based primitives (styled with Tailwind v4) and custom wrappers to emulate macOS HIG (Human Interface Guidelines) aesthetics. Below is the inventory categorized into **reusable primitives** and **app-specific compositions**.

### A. Reusable Primitives (General Purpose)
These components are clean, stateless, or low-level wrappers that do not contain any references to Tidy's domain (such as rules, files, organizing, or folders).

| Component / Path | Primitive Type | Purpose / Capabilities | Core Dependencies |
| :--- | :--- | :--- | :--- |
| [button.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/button.tsx) | Button | Core clickable element. Supports `default`, `destructive`, `outline`, `secondary`, `ghost`, and `link` variants. Has sizing styles (`sm`, `default`, `lg`, `icon`) and custom macOS focus states. | `class-variance-authority`, `@radix-ui/react-slot` |
| [select.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/select.tsx) | Select | Custom dropdown selector. Manages trigger, items, group styling, checkmarks, and scrolling boundaries. | `@radix-ui/react-select`, `@bradleyhodges/sfsymbols-react` |
| [dialog.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/dialog.tsx) | Modal Overlay | Accessible overlay container with close, title, and description options. | `@radix-ui/react-dialog` |
| [alert-dialog.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/alert-dialog.tsx) | Dialog Confirmation | Modal for critical user warnings requiring explicit confirmation. | `@radix-ui/react-alert-dialog` |
| [alert.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/alert.tsx) | Banner | Inline alerts for general notifications, alerts, or error banners. | Vanilla CSS |
| [popover.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/popover.tsx) | Overlay Popover | Custom floating card utility anchored to a trigger. | `@radix-ui/react-popover` |
| [scroll-area.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/scroll-area.tsx) | Scroll Area | Custom styled macOS-like scrollable container overlay. | `@radix-ui/react-scroll-area` |
| [sheet.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/sheet.tsx) | Drawer | Slide-out overlay pane (used for major full-page configuration viewports). | `@radix-ui/react-dialog` |
| [switch.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/switch.tsx) | Toggle Switch | Accessible toggle control. | `@radix-ui/react-switch` |
| [MacToggle` (inline in App.tsx)`](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/App.tsx#L156-L200) | Toggle Switch | macOS-specific physical toggle switch with smooth green/blue/purple transitions. | `@radix-ui/react-switch` |
| [MacSelect` (inline in App.tsx)`](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/App.tsx#L119-L153) | Select | Wrapper styled for standard macOS drop-down layout. | `select.tsx` primitive |
| [MacTimePicker.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/MacTimePicker.tsx) | Time Picker | macOS-style scrollable list column selector (Hours, Minutes, AM/PM). | `@radix-ui/react-popover` |
| [card.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/card.tsx) | Card Panel | Structuring utility with Header, Title, Description, and Content. | Vanilla CSS |
| [tooltip.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/tooltip.tsx) | Tooltip | Informational text block appearing on hover. | `@radix-ui/react-tooltip` |
| [input.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/input.tsx) | Text Field | Basic text input container. | Vanilla CSS |
| [textarea.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/textarea.tsx) | Text Area | Multiline text entry element. | Vanilla CSS |
| [checkbox.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/checkbox.tsx) | Checkbox | Standard toggle checkbox. | `@radix-ui/react-checkbox` |
| [label.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/label.tsx) | Label | Text label styling for inputs. | `@radix-ui/react-label` |
| [separator.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/separator.tsx) | Separator | Horizontal or vertical divider lines. | `@radix-ui/react-separator` |
| [skeleton.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/skeleton.tsx) | Skeleton | Loading status layout indicators. | Vanilla CSS |
| [tabs.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/tabs.tsx) | Tabs | Content switcher component. | `@radix-ui/react-tabs` |
| [accordion.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/accordion.tsx) | Collapsible Accordion | Multi-item accordion system. | `@radix-ui/react-accordion` |
| [badge.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ui/badge.tsx) | Badge | Status badges. | Vanilla CSS |
| [ImageWithFallback.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/figma/ImageWithFallback.tsx) | Media Image | Image tag offering custom fallback text placeholders. | Vanilla CSS |
| [UpDownChevron` (inline in App.tsx)`](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/App.tsx#L94-L103) | Icon | Simple markup container for a native chevron. | SVG |

---

### B. App-Specific Compositions
These elements represent high-level layouts or domain objects that integrate specific Tidy business logic (Python script previewing, rule processing, system paths, drag-and-drop operations, and sidebars) and consume primitives.

| Component / Path | Domain Responsibilities | Primitives Consumed |
| :--- | :--- | :--- |
| [FolderCard.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/FolderCard.tsx) | Drag-and-drop dropzones for source and destination file system paths. Custom breadcrumb parser for path strings. | `Pencil` and `X` button items, SFSymbols |
| [FilterCard.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/FilterCard.tsx) | Header block for file organization categories (Documents, Images, etc.). Integrates expandable toggle behavior. | `@radix-ui/react-switch`, SFSymbols |
| [NaturalLanguageRuleBuilder.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/NaturalLanguageRuleBuilder.tsx) | Modal overlay presenting predefined AI queries and a rule creation textarea input. | `@radix-ui/react-dialog`, `textarea.tsx`, `button.tsx` |
| [PreviewSheet.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/PreviewSheet.tsx) | Table grid illustrating file paths, conflict resolutions, target rules, and file details. | `sheet.tsx`, `badge.tsx`, `button.tsx`, `scroll-area.tsx` |
| [ScriptPreview.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ScriptPreview.tsx) | Box rendering dynamically generated Python code, complete with single-click copy buttons. | `button.tsx` |
| [StatusBar.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/StatusBar.tsx) | Bottom status ticker summarizing counts of items processed, duration, and dry-run alerts. | `progress.tsx`, `tooltip.tsx`, SFSymbols |
| [TopBar.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/TopBar.tsx) | App-wide header controlling panel view toggles, window size options, and search controls. | `button.tsx`, `input.tsx` |
| [BottomPanel.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/BottomPanel.tsx) | Ground-level actions bar holding the rule execution prompts and python script preview configurations. | `button.tsx`, `dialog.tsx` |
| [ThemeToggle.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/ThemeToggle.tsx) | macOS-looking drop-down trigger selecting Light, Dark, or System themes. | `@radix-ui/react-dropdown-menu`, SFSymbols |
| [AccessibilityPanel.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/AccessibilityPanel.tsx) | Controls overlay toggling high-contrast profiles, cognitive fonts, dexterity click targets, and screen reader overrides. | `@radix-ui/react-switch` |
| [AccessibilityProvider.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/AccessibilityProvider.tsx) | React Context Provider mapping states directly to HTML classes. | None (Context wrapper) |
| [AuditLogSidebar.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/AuditLogSidebar.tsx) | Side log viewer rendering organization actions history and rollbacks. | `button.tsx`, `scroll-area.tsx`, SFSymbols |
| [InsightsSidebar.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/components/InsightsSidebar.tsx) | Side panel displaying categories and statistics (Screenshots, Duplicate counts) parsed by AI. | `button.tsx`, `scroll-area.tsx`, SFSymbols |

---

## 2. Design Tokens Audit & Style Inconsistencies

Tidy relies on Tailwind CSS v4 configured via custom CSS variables inside [theme.css](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/styles/theme.css). However, the app frequently breaks away from these variables, introducing ad-hoc hex codes and raw Tailwind utilities.

> [!TIP]
> **Portfolio Narrative Opportunity:** Documenting the before/after of this cleanup makes a powerful story about design system engineering. Unifying these ad-hoc styles into tokens proves deep attention to detail and scalability.

### Audit Findings & Flags

*   **Hardcoded Gray Hex Values**:
    - `button.tsx` defines custom border-colors with `border-black/10` and outline states with hardcoded dark values `dark:bg-[#2A2A2A] dark:hover:bg-[#333333]` instead of mapping to semantic tokens like `--color-secondary` and `--color-accent`.
    - Glass style utilities override system parameters using `bg-[#1e1e1e]/70` in `theme.css`, bypassing centralized token inheritance.
*   **Vibrancy / Opacity Inconsistencies**:
    - The codebase defines opacity variants using *seven different* dark-mode background styles to simulate macOS HIG tile depth: `bg-black/5`, `bg-black/10`, `bg-black/[0.03]`, `bg-white/[0.08]`, `bg-white/[0.05]`, `bg-white/[0.04]`, and `bg-white/[0.06]`.
    - These should be unified into a system of **Material Vibrancy Levels** (e.g., base, hover, active, secondary).
*   **Hardcoded Color Overrides**:
    - Yellow categories are defined with `bg-yellow-500/15 text-yellow-700 dark:text-yellow-400` in `FilterCard.tsx` instead of using the custom properties `--system-yellow`.
    - Red rules call manual highlights `bg-red-500/15`, `bg-red-500/[0.06]`, and `border-red-500/20` instead of calling `--system-red`.
*   **Ad-Hoc Focus Ring Colors**:
    - `App.tsx` calls `focus:bg-blue-500/10` inside the select options menu items rather than utilizing standard theme variables like `--mac-focus-ring` (which resolves to `--system-blue`).
*   **Divergent Border Radii**:
    - Corner radii are scattered across components:
      - **4px**: standard button-sm (`rounded-[4px]`)
      - **5px**: standard button-default (`rounded-[5px]`)
      - **6px**: standard button-lg / toggle compact (`rounded-[6px]`)
      - **7px**: MacTimePicker columns (`rounded-[7px]`)
      - **8px**: FolderCard badges / select triggers (`rounded-[8px]` / `rounded-md`)
      - **10px**: AccessibilityPanel close / mac-panel (`rounded-[10px]`)
      - **11px**: FolderCard empty state / FilterCard selection (`rounded-[11px]`)
      - **12px**: core Glass tiles (`rounded-xl` / 12px)
      - **20px**: NaturalLanguageRuleBuilder Dialog (`rounded-[20px]`)
    - These will be unified into standard macOS HIG spacing increments.

> [!WARNING]
> **Border Radius Alignment Warning:** Moving from ad-hoc px counts to a strict 5-step scale (4/6/8/12/20) means rounding values like `5px` and `7px` to `6px`, and `11px` to `12px`. This will cause tiny visual shifts in corner rounding. When refactoring, inspect the elements in the browser directly to verify that child items (which might also have rounded corners) do not overlap, clip, or double-border adjacent layout blocks.

---

### Proposed Token Taxonomy (Structured for Themes)

To avoid bolting on dark mode support as an afterthought, tokens are explicitly partitioned into **static values** (which remain identical across light/dark profiles) and **theme-dependent values** (which shift dynamically under dark/light scopes).

#### A. Static Tokens (Identical for All Themes)
```css
:root {
  /* --- Unified Border Radii (macOS HIG Scaled) --- */
  --radius-xs: 4px;   /* Small badges / sub-elements */
  --radius-sm: 6px;   /* Buttons, compact switches */
  --radius-md: 8px;   /* Form inputs, select triggers, cards */
  --radius-lg: 12px;  /* Outer panels, layout tiles */
  --radius-xl: 20px;  /* Modals, alerts, major dialogs */

  /* --- Layout Spacing Scale --- */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* --- Typography Scale (macOS System Sizes) --- */
  --text-xs: 11px;    /* Caption, auxiliary labels */
  --text-sm: 13px;    /* Core body text, buttons, form labels */
  --text-md: 15px;    /* List headers, primary controls */
  --text-lg: 17px;    /* Panel titles, subheadings */
  --text-xl: 22px;    /* Major header level */
}
```

#### B. Theme-Dependent Tokens (Configured per Theme)
```css
/* --- LIGHT MODE --- */
:root {
  /* macOS Light Accent Palette */
  --color-accent-blue: #007AFF;
  --color-accent-green: #34C759;
  --color-accent-red: #FF3B30;
  --color-accent-yellow: #FFCC00;
  --color-accent-orange: #FF9500;
  --color-accent-purple: #AF52DE;

  /* Material Vibrancy Base Layers */
  --vibrancy-base: rgba(0, 0, 0, 0.05);
  --vibrancy-hover: rgba(0, 0, 0, 0.08);
  --vibrancy-active: rgba(0, 0, 0, 0.12);
  --vibrancy-border: rgba(0, 0, 0, 0.10);

  /* Primary Interactive Mappings */
  --mac-focus-ring: var(--color-accent-blue);
  --mac-toggle-off: #e5e5ea;
}

/* --- DARK MODE --- */
.dark {
  /* macOS Dark Accent Palette */
  --color-accent-blue: #0A84FF;
  --color-accent-green: #32D74B;
  --color-accent-red: #FF453A;
  --color-accent-yellow: #FFD60A;
  --color-accent-orange: #FF9F0A;
  --color-accent-purple: #BF5AF2;

  /* Material Vibrancy Base Layers */
  --vibrancy-base: rgba(255, 255, 255, 0.08);
  --vibrancy-hover: rgba(255, 255, 255, 0.12);
  --vibrancy-active: rgba(255, 255, 255, 0.16);
  --vibrancy-border: rgba(255, 255, 255, 0.15);

  /* Primary Interactive Mappings */
  --mac-focus-ring: var(--color-accent-blue);
  --mac-toggle-off: #3a3a3c;
}
```

---

## 3. Package Structure & Monorepo Strategy

To support the extraction, we recommend a **Monorepo Structure** using workspaces. This approach allows the design system packages to be developed in isolation while remaining instantly consumable by Tidy.

### Workspace Tooling Choice

> [!NOTE]
> The monorepo layout can be managed with either **npm workspaces** or **pnpm workspaces** based on preference. To prevent package manager tool friction, use the tool you are already comfortable with. The package boundary layout and dependency resolution architecture remain identical.

### Proposed Directory Layout
```
tidy-workspace/
├── package.json             # Root monorepo definitions (or workspace definitions)
├── pnpm-workspace.yaml      # (If using pnpm workspaces) Configures nested packages
├── apps/
│   └── tidy/                # Existing File Organizer App
│       ├── package.json
│       └── src/             # Consumes design-system tokens and primitives
└── packages/
    ├── tokens/              # Package housing only raw tokens (JSON/CSS/TS formats)
    │   ├── package.json
    │   └── src/
    └── design-system/       # Component package holding Radix + Tailwind components
        ├── package.json
        ├── src/             # Button, Select, Switch, Dialog, etc.
        └── .storybook/      # Isolated component playground config
```

### Tradeoffs: Monorepo vs. Separate Repositories

*   **Monorepo (Recommended)**: Best for initial extraction. Since the app and components are evolving in parallel, changes in `packages/design-system` are instantly reflected in `apps/tidy` without the need to publish packages. Storybook runs isolated inside the packages folder.
*   **Separate Repositories**: Only recommended if the component library is consumed by multiple projects across separate product teams with strict independent versioning requirements. It introduces high friction (e.g., `npm link` / `yalc`) during the initial build phase.

---

## 4. Proposed Starter Scope (v1 Primitives)

For the initial v1, we focus on **10 core primitives**. These components have been selected to highlight visible design details, states, and variant thinking in your Storybook, rather than low-visibility structural items.

> [!WARNING]
> **Extraction Complexity Flag:** `MacToggle` and `MacSelect` currently live as inline helpers inside [App.tsx](file:///Users/ericauzenne/Desktop/My%20Apps/File%20Organizer%20App/src/app/App.tsx). Safely extracting them, decoupling their custom style states from Tidy's variables, and packaging them as clean, standalone components requires deliberate refactoring effort.

1.  **Button**: Foundational clickable element. Supports `default`, `destructive`, `outline`, `secondary`, `ghost`, and `link` variants.
2.  **Switch (MacToggle)**: A physical-looking toggle component implementing smooth green/blue/purple transition states. High complexity due to inline extraction.
3.  **Select (MacSelect)**: The customized macOS-styled selection dropdown. High complexity due to inline extraction.
4.  **Input & Textarea**: Text entries with unified HIG focus ring states.
5.  **Checkbox**: Binary state indicators, crucial for category rule modifiers.
6.  **Label**: Accessible typography tags pairing with Inputs, Checkboxes, and Selects.
7.  **Badge**: Visually distinct status tags utilizing unified opacity accent variables (e.g. system-blue, system-purple, system-green).
8.  **Dialog (Modal)**: Accessible modal frame overlays.
9.  **Tooltip**: Accessible overlays providing hover instructions.
10. **Card (Panel / Glass Window)**: Standard container components encapsulating `mac-glass` and `mac-panel` token styling.

---

## 5. Accessibility (a11y) Verification Plan

A design system is defined by its compliance and accessibility, not just its styling. Every primitive in the v1 scope must have its accessibility explicitly verified and documented in its Storybook story rather than relying solely on Radix defaults.

### Verification Rules & Checklist

*   **Keyboard Navigation**:
    *   Verify that interactive elements (`Button`, `Select`, `Switch`, `Checkbox`, `Dialog`, `Tooltip`) are fully navigable via `Tab` and activation keys (`Enter` / `Space`).
    *   Confirm focus management inside `Dialog` (focus trapping and restoration).
*   **ARIA Roles & States**:
    *   Inspect generated HTML to verify correct attributes are applied (`aria-expanded`, `aria-checked`, `aria-describedby`, `role="dialog"`).
    *   Ensure all buttons without explicit text labels (e.g., close buttons) have descriptive `aria-label` tags.
*   **Focus Ring Indicator**:
    *   Ensure that the custom focus ring (`--mac-focus-ring`) is clearly visible across all themes. It should never be clipped or hidden by parent overflows.
*   **Contrast Compliance**:
    *   Check contrast compliance (WCAG AA minimum ratio of 4.5:1 for normal text) in both Light and Dark mode using WCAG color contrast checkers.
    *   Verify that the design system behaves correctly when the `.a11y-high-contrast` accessibility class is appended to the HTML tag.

---

## 6. Contribution & Usage Documentation

To ensure the library operates as a true *system*, a quick setup guide must accompany the extraction.

### Developer Setup & Contribution Flow

1.  **Adding a Component**:
    *   Create component folder under `packages/design-system/src/components/<ComponentName>`.
    *   Define component logic in `ComponentName.tsx` using Tailwind design tokens.
    *   Create story under `ComponentName.stories.tsx` displaying all variants (e.g. Default, Disabled, Error) and states.
    *   Export the component through the main library index file (`packages/design-system/src/index.ts`).
2.  **Consuming the Design System in Tidy**:
    *   Register workspaces in root `package.json`.
    *   Import CSS variables inside the main stylesheet:
        ```css
        @import "@tidy/tokens/theme.css";
        @import "@tidy/design-system/dist/index.css";
        ```
    *   Import components directly in Tidy:
        ```tsx
        import { Button, Switch } from "@tidy/design-system";
        ```
