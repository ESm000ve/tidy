import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["neutral", "blue", "green", "red", "yellow", "orange", "purple"],
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
### macOS HIG-Flavored Badge

A non-interactive visual label component showcasing Tidy's unified accent colors.

#### Text Contrast Mappings (WCAG AA Compliance)
- **Light Theme**: Accent backgrounds at 15% opacity pair with standard accent colors.
- **Dark Theme**: Contrast ratios automatically adjust to preserve readability on dark window structures.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Neutral",
    variant: "neutral",
  },
};

export const AccentVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4 bg-mac-window-background rounded-lg border border-vibrancy-border">
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="blue">Blue Accent</Badge>
      <Badge variant="green">Green Accent</Badge>
      <Badge variant="red">Red Accent</Badge>
      <Badge variant="yellow">Yellow Accent</Badge>
      <Badge variant="orange">Orange Accent</Badge>
      <Badge variant="purple">Purple Accent</Badge>
    </div>
  ),
};
