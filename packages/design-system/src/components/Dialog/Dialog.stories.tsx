import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { Label } from "../Label/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
### macOS HIG-Flavored Dialog Modals

An accessible modal overlay window built on Radix Dialog. It handles focus trapping, Escape key closing, and focus restoration to the trigger.

#### Accessibility Features
- **Focus Control**: Traps focus inside the modal when open and restores focus to the trigger on close.
- **Escape Key Close**: Closes automatically when the user presses \`Esc\`.
- **Screen Reader Context**: Standard \`DialogTitle\` and \`DialogDescription\` provide \`aria-labelledby\` and \`aria-describedby\` attributes programmatically.
- **Close Button Label**: The close icon contains an explicit \`aria-label="Close dialog"\`.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Basic: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Simple Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preferences Saved</DialogTitle>
          <DialogDescription>
            Your categorization preferences have been updated and synced locally.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button>Done</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Rule Profile</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile Name</DialogTitle>
            <DialogDescription>
              Provide a new descriptive name for your automated rule profile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input id="profile-name" defaultValue="Screenshots Organizer" />
            </div>
          </div>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button>Save Changes</Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const AlertDialogVariant: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Rule Profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-accent-red">Confirm Permanent Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this rule profile? This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Profile</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
