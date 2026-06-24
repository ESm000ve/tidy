"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-system-green data-[state=unchecked]:bg-mac-toggle-off mac-focus inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full border border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.16),0_0_1px_rgba(0,0,0,0.2)] pointer-events-none block size-[20px] rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-[1px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
