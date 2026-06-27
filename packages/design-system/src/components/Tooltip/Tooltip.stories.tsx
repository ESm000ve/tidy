import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";
import { SFIcon } from "@bradleyhodges/sfsymbols-react";
import { sfInfoCircle } from "@bradleyhodges/sfsymbols";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="flex items-center justify-center p-12">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
### macOS HIG-Flavored Tooltips

Accessible overlay information text that appears on hover or keyboard focus.

#### Accessibility Features
- **Keyboard Focus**: Tooltips appear automatically when their trigger receives keyboard focus, not just on mouse hover.
- **Screen Reader Context**: Elements are wired with \`aria-describedby\` by Radix UI automatically, so screen readers announce the tooltip content when focusing the trigger.
- **Escape Key Close**: Closes automatically when the user presses \`Esc\`.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Information">
          <SFIcon icon={sfInfoCircle} className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a standard macOS tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <TooltipProvider delayDuration={1000}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Hover me (1s delay)</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This tooltip waited 1 second to appear</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const DifferentSides: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};
