import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] text-[13px] font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 mac-focus aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-transparent",
  {
    variants: {
      variant: {
        default: "bg-system-blue text-white hover:bg-system-blue/90 border-black/10 dark:border-white/10",
        destructive:
          "bg-system-red text-white hover:bg-system-red/90 focus-visible:ring-system-red/20 dark:focus-visible:ring-system-red/40 dark:bg-system-red/60 border-black/10 dark:border-white/10",
        outline:
          "border-border bg-mac-window-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-[#2A2A2A] dark:hover:bg-[#333333]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 shadow-none border-transparent",
        link: "text-system-blue underline-offset-4 hover:underline shadow-none border-transparent",
      },
      size: {
        default: "h-[22px] px-3 py-1 has-[>svg]:px-2.5",
        sm: "h-[18px] rounded-[4px] gap-1 px-2 text-[11px] has-[>svg]:px-1.5",
        lg: "h-[28px] rounded-[6px] px-4 text-[14px] has-[>svg]:px-3",
        icon: "size-[22px] rounded-[5px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
