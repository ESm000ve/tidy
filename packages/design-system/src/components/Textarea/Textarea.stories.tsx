import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component: `
### macOS HIG-Flavored Textarea

A clean, multiline text entry area styled with design system tokens. It supports default, focus, disabled, and error (invalid) states.

#### Accessibility Features
- **Label Association**: Uses standard HTML \`id\` and \`htmlFor\` mappings for screen readers.
- **ARIA Attributes**: Uses \`aria-invalid="true"\` to declare error states programmatically.
- **Focus Indicator**: A visible macOS focus ring outlines the textarea in both light and dark themes.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Type your notes here...",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
  },
};

export const ErrorState: Story = {
  args: {
    placeholder: "Invalid textarea input",
    "aria-invalid": true,
    defaultValue: "Invalid text content",
  },
};
