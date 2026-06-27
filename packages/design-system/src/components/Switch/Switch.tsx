import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const switchVariants = cva(
  "peer inline-flex shrink-0 items-center rounded-full border border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-40 mac-focus shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] relative select-none",
  {
    variants: {
      color: {
        green: "data-[state=checked]:bg-accent-green data-[state=unchecked]:bg-toggle-off",
        blue: "data-[state=checked]:bg-accent-blue data-[state=unchecked]:bg-toggle-off",
        purple: "data-[state=checked]:bg-accent-purple data-[state=unchecked]:bg-toggle-off",
      },
      size: {
        sm: "h-[18px] w-[32px] p-[2px]",
        md: "h-[24px] w-[42px] p-[2px]",
      },
    },
    defaultVariants: {
      color: "green",
      size: "md",
    },
  }
);

const thumbVariants = cva(
  "block bg-white rounded-full transition-transform duration-200 will-change-transform shadow-[0_1px_2px_rgba(0,0,0,0.30),inset_0_0_0_0.5px_rgba(0,0,0,0.10)]",
  {
    variants: {
      size: {
        sm: "size-[14px] data-[state=checked]:translate-x-[14px] data-[state=unchecked]:translate-x-[0px]",
        md: "size-[20px] data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[0px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, color, size, ...props }, ref) => {
  return (
    <SwitchPrimitive.Root
      className={cn(switchVariants({ color, size, className }))}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        className={cn(thumbVariants({ size }))}
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch, switchVariants };
