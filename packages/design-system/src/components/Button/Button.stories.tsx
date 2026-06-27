import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Visual variant mapping to macOS HIG elements.",
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
      description: "HIG-compliant button size heights.",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Interactive disabled status (WCAG opacity matched).",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
### macOS HIG-Flavored Button Component

This is the primary interactive button element for Tidy. It is built using the standard Radix-slot pattern to enable polymorphism (\`asChild\`) and consumes unified design tokens for its typography, padding, color accents, and radii.

#### Accessibility Features
- **Keyboard Navigation**: Native tab ordering is preserved. Supports trigger execution via \`Enter\` and \`Space\` keys.
- **Visual Focus Rings**: Outlines utilize a specialized \`--color-focus-ring\` mapping to match system colors on Light and Dark modes.
- **Screen Reader Support**: Icon-only buttons must receive an explicit \`aria-label\` or \`title\` property so screen reader voice synthesis does not read empty nodes.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Default Button",
    variant: "default",
    size: "default",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 p-4 bg-mac-window-background rounded-lg border border-vibrancy-border">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Default</span>
        <Button variant="default">Primary Accent</Button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Secondary</span>
        <Button variant="secondary">Secondary Recessed</Button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Outline</span>
        <Button variant="outline">Outline Border</Button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Destructive</span>
        <Button variant="destructive">Destructive action</Button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Ghost</span>
        <Button variant="ghost">Ghost item</Button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Link</span>
        <Button variant="link">External link</Button>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4 p-4 bg-mac-window-background rounded-lg border border-vibrancy-border">
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Small (18px)</span>
        <Button size="sm" variant="outline">Small</Button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Default (22px)</span>
        <Button size="default" variant="outline">Default Button</Button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Large (28px)</span>
        <Button size="lg" variant="outline">Large View</Button>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 p-4 bg-mac-window-background rounded-lg border border-vibrancy-border">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Disabled</span>
        <Button disabled>Disabled Button</Button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Focused Outline</span>
        <Button className="ring-[3px] ring-focus-ring/50 border-focus-ring">Focused State</Button>
      </div>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-4 p-4 bg-mac-window-background rounded-lg border border-vibrancy-border">
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Close (aria-label)</span>
        <Button size="icon" variant="ghost" aria-label="Close panel">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Add Item</span>
        <Button size="icon" variant="outline" aria-label="Add custom rule">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>
    </div>
  ),
};
