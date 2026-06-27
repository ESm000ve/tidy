import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["green", "blue", "purple"],
      description: "macOS accent color transitions.",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md"],
      description: "macOS sizes.",
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
### macOS HIG-Flavored Switch Toggle

An accessible checkbox replacement mimicking the physical slider controls of macOS settings windows. It handles state transitions with custom CSS animations.

#### Accessibility Features
- **Keyboard Interactivity**: Focusable via \`Tab\`. Toggle states can be triggered by pressing the \`Space\` key.
- **ARIA Attributes**: The root element automatically reflects state updates using \`aria-checked="true|false"\`.
- **Theme-Compliant Focus Ring**: Highlights match layout options cleanly on light and dark backdrops.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

// Helper wrapper to handle dynamic toggle state inside Storybook
function InteractiveSwitch(props: any) {
  const [checked, setChecked] = useState(props.checked ?? false);
  return (
    <Switch
      {...props}
      checked={checked}
      onCheckedChange={(v) => {
        setChecked(v);
        props.onCheckedChange?.(v);
      }}
    />
  );
}

export const Default: Story = {
  render: (args) => <InteractiveSwitch {...args} />,
  args: {
    color: "green",
    size: "md",
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-6 p-4 bg-mac-window-background rounded-lg border border-vibrancy-border">
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Green (Default)</span>
        <InteractiveSwitch color="green" defaultChecked />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Blue Accent</span>
        <InteractiveSwitch color="blue" defaultChecked />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Purple Accent</span>
        <InteractiveSwitch color="purple" defaultChecked />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-4 bg-mac-window-background rounded-lg border border-vibrancy-border">
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Small (32x18)</span>
        <InteractiveSwitch size="sm" defaultChecked />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Medium (42x24)</span>
        <InteractiveSwitch size="md" defaultChecked />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex gap-6 p-4 bg-mac-window-background rounded-lg border border-vibrancy-border">
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Disabled (Off)</span>
        <Switch disabled checked={false} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Disabled (On)</span>
        <Switch disabled checked={true} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] text-mac-secondary-label font-semibold">Keyboard Focused</span>
        <Switch className="ring-[3px] ring-focus-ring/50 border-focus-ring" />
      </div>
    </div>
  ),
};
