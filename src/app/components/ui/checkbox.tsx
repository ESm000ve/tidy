"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { SFIcon } from '@bradleyhodges/sfsymbols-react';
import { sfCheckmark } from '@bradleyhodges/sfsymbols';

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer bg-white dark:bg-black/20 data-[state=checked]:bg-system-blue data-[state=checked]:text-white data-[state=checked]:border-system-blue mac-focus aria-invalid:ring-system-red/20 dark:aria-invalid:ring-system-red/40 aria-invalid:border-system-red size-[14px] shrink-0 rounded-[4px] border-[0.5px] border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <SFIcon icon={sfCheckmark} className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
