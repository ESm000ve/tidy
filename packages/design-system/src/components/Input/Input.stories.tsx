import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component: `
### macOS HIG-Flavored Text Input

A clean, single-line text input field styled with design system tokens. It supports default, focus, disabled, and error (invalid) states.

#### Accessibility Features
- **Label Association**: Uses standard HTML \`id\` and \`htmlFor\` mappings for screen readers.
- **ARIA Attributes**: Uses \`aria-invalid="true"\` to declare error states programmatically.
- **Focus Indicator**: A visible macOS focus ring outlines the input in both light and dark themes.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Type something...",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const ErrorState: Story = {
  args: {
    placeholder: "Invalid input",
    "aria-invalid": true,
    defaultValue: "Invalid value",
  },
};
