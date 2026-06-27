import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 mac-focus shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-transparent select-none",
  {
    variants: {
      variant: {
        default:
          "bg-accent-blue text-white hover:bg-accent-blue/90 border-vibrancy-border",
        destructive:
          "bg-accent-red text-white hover:bg-accent-red/90 focus-visible:ring-accent-red/20 dark:focus-visible:ring-accent-red/40 dark:bg-accent-red/60 border-vibrancy-border",
        outline:
          "border-vibrancy-border bg-mac-window-background text-mac-label hover:bg-vibrancy-hover",
        secondary:
          "bg-vibrancy-base text-mac-label hover:bg-vibrancy-hover border-vibrancy-border",
        ghost:
          "hover:bg-vibrancy-hover hover:text-mac-label text-mac-label/85 shadow-none border-transparent",
        link:
          "text-accent-blue underline-offset-4 hover:underline shadow-none border-transparent",
      },
      size: {
        default: "h-[22px] px-3 py-1 has-[>svg]:px-2.5",
        sm: "h-[18px] rounded-xs gap-1 px-2 text-xs has-[>svg]:px-1.5",
        lg: "h-[28px] px-4 text-md has-[>svg]:px-3",
        icon: "size-[22px] rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
