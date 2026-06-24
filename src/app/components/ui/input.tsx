import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-system-blue selection:text-white dark:bg-black/20 border-border flex h-[22px] w-full min-w-0 rounded-[5px] border-[0.5px] px-2 py-1 text-[13px] bg-white transition-[color,box-shadow] outline-none file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-[13px] file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "mac-focus",
        "aria-invalid:ring-system-red/20 dark:aria-invalid:ring-system-red/40 aria-invalid:border-system-red",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
