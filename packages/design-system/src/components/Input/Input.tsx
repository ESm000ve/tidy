import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex w-full rounded-md border border-vibrancy-border bg-vibrancy-base px-2.5 py-1 text-sm text-mac-label shadow-inner transition-all file:border-0 file:bg-transparent file:text-sm file:font-semibold placeholder:text-mac-secondary-label disabled:cursor-not-allowed disabled:opacity-40 select-text",
          "focus:outline-none focus:ring-[3px] focus:ring-focus-ring/50 focus:border-focus-ring",
          "aria-invalid:border-accent-red aria-invalid:focus:ring-accent-red/50 aria-invalid:focus:border-accent-red",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
