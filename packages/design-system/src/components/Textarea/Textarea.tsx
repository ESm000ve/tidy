import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex w-full rounded-md border border-vibrancy-border bg-vibrancy-base px-2.5 py-1.5 text-sm text-mac-label shadow-inner transition-all placeholder:text-mac-secondary-label disabled:cursor-not-allowed disabled:opacity-40 min-h-[60px] resize-none select-text",
          "focus:outline-none focus:ring-[3px] focus:ring-focus-ring/50 focus:border-focus-ring",
          "aria-invalid:border-accent-red aria-invalid:focus:ring-accent-red/50 aria-invalid:focus:border-accent-red",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
