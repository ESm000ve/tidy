import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-12 mac-panel max-w-2xl mx-auto flex items-center justify-center">
        <div className="w-full max-w-md">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
### macOS HIG-Flavored Card

Structural container for grouping related content, built with macOS glassmorphism effects (vibrancy background, blur, and borders). 
Nested perfectly within \`.mac-panel\` contexts.

#### Accessibility Features
- **Semantic Structure**: Uses standard structural HTML.
- **No Forced ARIA**: As a structural element, it avoids unnecessary ARIA roles that can confuse screen readers.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>A brief description of the card's purpose.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This is the main content area of the card. It inherits the proper
          text colors and spacing automatically.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithoutFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Simple Information</CardTitle>
        <CardDescription>Just displaying some data without actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This card doesn't need a footer because it has no primary actions.
        </p>
      </CardContent>
    </Card>
  ),
};
