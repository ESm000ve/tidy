import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-xs border px-1.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 select-none transition-all",
  {
    variants: {
      variant: {
        neutral:
          "border-vibrancy-border bg-vibrancy-base text-mac-label",
        blue:
          "border-accent-blue/20 bg-accent-blue/15 text-accent-blue",
        green:
          "border-accent-green/20 bg-accent-green/15 text-accent-green",
        red:
          "border-accent-red/20 bg-accent-red/15 text-accent-red",
        yellow:
          "border-accent-yellow/30 bg-accent-yellow/15 text-[#B38600] dark:text-accent-yellow",
        orange:
          "border-accent-orange/30 bg-accent-orange/15 text-[#B85C00] dark:text-accent-orange",
        purple:
          "border-accent-purple/20 bg-accent-purple/15 text-accent-purple",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
