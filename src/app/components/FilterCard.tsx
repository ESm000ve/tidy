import { clsx } from "clsx";
import * as Switch from "@radix-ui/react-switch";
import { ChevronRight, LucideIcon } from "lucide-react";

interface FilterCardProps {
  label   : string;
  count?  : string;
  icon    : LucideIcon;
  enabled : boolean;
  onToggle: (enabled: boolean) => void;
  color?  : string;
  expanded?: boolean;
}

/**
 * Header row for a file-rule bento tile.
 * Card chrome (background, border, blur, radius) is owned by the parent wrapper in App.tsx.
 */
export function FilterCard({
  label, count = "0 types", icon: Icon, enabled, onToggle, color = "blue", expanded,
}: FilterCardProps) {

  // Category accent colours — always use the same hue family at low opacity for the badge
  const BADGE: Record<string, string> = {
    blue   : "bg-[#0A84FF]/15 text-[#0A84FF]",
    purple : "bg-purple-500/15 text-purple-400",
    orange : "bg-orange-500/15 text-orange-400",
    green  : "bg-[#30D158]/15 text-[#30D158]",
    yellow : "bg-yellow-500/15 text-yellow-400",
    red    : "bg-red-500/15 text-red-400",
  };
  const badgeCls = BADGE[color] ?? BADGE.blue;

  return (
    <div className="flex items-center">
      {/* ── Left: disclosure + icon + label ── */}
      <div className="flex-1 flex items-center gap-3 p-4 select-none min-w-0">
        <ChevronRight
          className={clsx(
            "w-3.5 h-3.5 text-[#98989D] transition-transform duration-200 shrink-0",
            expanded && "rotate-90"
          )}
        />

        {/* Category icon badge */}
        <div
          className={clsx(
            "w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 transition-colors",
            enabled ? badgeCls : "bg-white/[0.04] text-[#555]"
          )}
        >
          <Icon className="w-[18px] h-[18px]" />
        </div>

        {/* Label + count */}
        <div className="flex-1 min-w-0">
          <h3
            className={clsx(
              "text-[14px] transition-colors truncate",
              enabled ? "text-white/90" : "text-[#666]"
            )}
          >
            {label}
          </h3>
          <p className="text-[11px] text-[#98989D] tabular-nums">{count}</p>
        </div>
      </div>

      {/* ── Right: toggle — isolates from parent expand click ── */}
      <div
        className="px-4 flex items-center shrink-0"
        onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
      >
        <Switch.Root
          checked={enabled}
          onCheckedChange={onToggle}
          className="rounded-full relative transition-colors duration-200 cursor-pointer focus:outline-none shrink-0"
          style={{
            width     : 42, height: 24,
            background: enabled ? "#32D74B" : "#3A3A3C",   // System Green / recessed gray
            boxShadow : "inset 0 1px 2px rgba(0,0,0,0.25)",
          }}
        >
          <Switch.Thumb
            className="block bg-white rounded-full transition-transform duration-200 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]"
            style={{
              width    : 20, height: 20,
              boxShadow: "0 1px 2px rgba(0,0,0,0.30), inset 0 0 0 0.5px rgba(0,0,0,0.10)",
            }}
          />
        </Switch.Root>
      </div>
    </div>
  );
}