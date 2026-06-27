import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./Label";
import { Input } from "../Input/Input";
import { Checkbox } from "../Checkbox/Checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../Select/Select";

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### macOS HIG-Flavored Label

An accessible typography label component built on Radix Label, styled to match macOS system form layout label patterns.

#### Accessibility Features
- **Label Association**: Uses standard HTML \`htmlFor\` property to link with the associated control's \`id\`.
- **User Experience**: Clicking the label automatically focuses or activates its paired control (e.g. focusing an Input or toggling a Checkbox).
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const PairedWithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-2 max-w-[240px]">
      <Label htmlFor="username">Username</Label>
      <Input id="username" placeholder="Enter username..." />
    </div>
  ),
};

export const PairedWithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const PairedWithSelect: Story = {
  render: () => (
    <div className="flex flex-col gap-2 max-w-[200px]">
      <Label htmlFor="theme-select">Select Theme</Label>
      <Select defaultValue="system">
        <SelectTrigger id="theme-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
