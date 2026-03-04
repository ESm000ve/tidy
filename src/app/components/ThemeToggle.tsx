import { Monitor, Moon, Sun, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[110px] h-[34px]" />;
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className="flex items-center gap-2 px-3 py-2 rounded-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/10 dark:border-white/[0.10] outline-none"
                    title="Toggle Appearance"
                >
                    {theme === "light" && <Sun className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />}
                    {theme === "dark" && <Moon className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />}
                    {theme === "system" && <Monitor className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />}
                    <span className="text-[11px] text-black/70 dark:text-white/60 capitalize flex items-center gap-1">
                        Theme: {theme || 'System'}
                        <ChevronDown className="w-3 h-3 opacity-50 ml-0.5" />
                    </span>
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    className={clsx(
                        "z-50 min-w-[120px] rounded-lg p-1",
                        "bg-popover text-popover-foreground shadow-md border border-border"
                    )}
                >
                    <DropdownMenu.Item
                        onClick={() => setTheme("light")}
                        className={clsx(
                            "flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer outline-none transition-colors",
                            theme === "light" ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
                            "focus:bg-accent focus:text-accent-foreground"
                        )}
                    >
                        <Sun className="w-3.5 h-3.5" /> Light
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        onClick={() => setTheme("dark")}
                        className={clsx(
                            "flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer outline-none transition-colors",
                            theme === "dark" ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
                            "focus:bg-accent focus:text-accent-foreground"
                        )}
                    >
                        <Moon className="w-3.5 h-3.5" /> Dark
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px bg-border my-1" />

                    <DropdownMenu.Item
                        onClick={() => setTheme("system")}
                        className={clsx(
                            "flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer outline-none transition-colors",
                            theme === "system" ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
                            "focus:bg-accent focus:text-accent-foreground"
                        )}
                    >
                        <Monitor className="w-3.5 h-3.5" /> System
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
