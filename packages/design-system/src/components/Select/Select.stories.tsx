import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./Select";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### macOS HIG-Flavored Select Dropdown

A customized wrapper around Radix Select, styled to match macOS system pop-up buttons. It features glassmorphism dropdown menus, hover highlights using vibrancy tokens, and keyboard accessibility.

#### Accessibility Features
- **ARIA Roles**: Reflects \`aria-expanded\` dynamically.
- **Keyboard Navigation**: Uses Arrow keys to navigate options, \`Enter\` or \`Space\` to select, and \`Escape\` to close.
- **Focus Management**: Restores focus to the trigger upon closing.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

// Standard interactive Select story
function SelectDemo(props: any) {
  const [value, setValue] = useState(props.defaultValue ?? "");
  return (
    <div className="w-[180px]">
      <Select {...props} value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="Select a size..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Size</SelectItem>
          <SelectItem value="small">Small (&lt; 1 MB)</SelectItem>
          <SelectItem value="medium">Medium (1 MB – 100 MB)</SelectItem>
          <SelectItem value="large">Large (&gt; 100 MB)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const Default: Story = {
  render: () => <SelectDemo />,
};

export const Open: Story = {
  render: () => <SelectDemo defaultOpen={true} defaultValue="small" />,
};

export const Disabled: Story = {
  render: () => <SelectDemo disabled />,
};

export const WithGroups: Story = {
  render: () => (
    <div className="w-[200px]">
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
            <SelectItem value="potato">Potato</SelectItem>
            <SelectItem value="tomato">Tomato</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};
