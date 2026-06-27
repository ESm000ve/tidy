import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { SFIcon } from "@bradleyhodges/sfsymbols-react";
import { sfCheckmark, sfMinus } from "@bradleyhodges/sfsymbols";
import { cn } from "../../lib/utils";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, checked, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      className={cn(
        "peer size-[14px] shrink-0 rounded-xs border border-vibrancy-border bg-vibrancy-base shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] transition-all mac-focus disabled:cursor-not-allowed disabled:opacity-40",
        "data-[state=checked]:bg-accent-blue data-[state=checked]:border-accent-blue data-[state=checked]:text-white",
        "data-[state=indeterminate]:bg-accent-blue data-[state=indeterminate]:border-accent-blue data-[state=indeterminate]:text-white",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {checked === "indeterminate" ? (
          <SFIcon icon={sfMinus} className="size-3" />
        ) : (
          <SFIcon icon={sfCheckmark} className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
