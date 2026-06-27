import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component: `
### macOS HIG-Flavored Checkbox Toggle

An accessible checkbox component built on Radix Checkbox, styled to match macOS system checkbox toggle behaviors.

#### Accessibility Features
- **Keyboard Interactivity**: Focusable via \`Tab\`. Toggle states can be triggered by pressing the \`Space\` key.
- **ARIA Attributes**: The root element automatically reflects state updates using \`aria-checked="true|false|mixed"\`.
- **Visible Focus Outline**: Highlighting ring resolves nicely on light and dark backdrops.
- **Label Association**: Can be wrapped or associated with native labels or custom Label primitives.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

function InteractiveCheckbox(props: any) {
  const [checked, setChecked] = useState<any>(props.checked ?? false);
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="interactive-checkbox"
        {...props}
        checked={checked}
        onCheckedChange={(val) => {
          setChecked(val);
          props.onCheckedChange?.(val);
        }}
      />
      <label htmlFor="interactive-checkbox" className="text-sm font-medium text-mac-label select-none">
        Accept Terms &amp; Conditions
      </label>
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractiveCheckbox />,
};

export const Checked: Story = {
  render: () => <InteractiveCheckbox checked={true} />,
};

export const Indeterminate: Story = {
  render: () => <InteractiveCheckbox checked="indeterminate" />,
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="disabled-unchecked" disabled />
        <label htmlFor="disabled-unchecked" className="text-sm font-medium text-mac-label opacity-40 select-none">
          Disabled (Unchecked)
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <label htmlFor="disabled-checked" className="text-sm font-medium text-mac-label opacity-40 select-none">
          Disabled (Checked)
        </label>
      </div>
    </div>
  ),
};
