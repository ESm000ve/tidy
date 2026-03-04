import { clsx } from "clsx";
import { format } from "date-fns";
import { DayPicker, useNavigation } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { MacTimePicker } from "./MacTimePicker";

interface BottomPanelProps {
  scheduleType: "manual" | "daily" | "weekly" | "monthly";
  onScheduleTypeChange: (type: "manual" | "daily" | "weekly" | "monthly") => void;
  scheduleTime: string;
  onScheduleTimeChange: (time: string) => void;
  scheduleDate: Date | null;
  onScheduleDateChange: (date: Date | undefined) => void;
  conflictResolution: "rename" | "overwrite" | "skip" | "archive";
  onConflictResolutionChange: (res: "rename" | "overwrite" | "skip" | "archive") => void;
}

// ─── Design tokens — match App-wide spec ──────────────────────────────────────
// Fill: Pure White 8 % — Rim: 0.5 pt White 10 % — Shadow: NONE
const CARD_CLS = "bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/10 dark:border-white/10";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function UpDownChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="14" viewBox="0 0 10 14"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5.5L5 2.5L8 5.5" />
      <path d="M2 8.5L5 11.5L8 8.5" />
    </svg>
  );
}

/** Flat macOS Pop-Up Button — White 5% fill, White 10% stroke, up/down chevron */
function MacSelect({
  value, onChange, children,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full text-foreground text-[13px] px-3 py-2 pr-8 rounded-lg appearance-none cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[#0A84FF]/50 bg-black/5 dark:bg-white/[0.05] border-[0.5px] border-black/10 dark:border-white/10"
      >
        {children}
      </select>
      <UpDownChevron className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 dark:text-white/40 pointer-events-none" />
    </div>
  );
}

function CalendarCaption({ displayMonth }: { displayMonth: Date }) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <div className="flex items-center justify-between mb-3 px-0.5">
      <span className="text-[13px] text-foreground/90 dark:text-white/90">{format(displayMonth, "MMMM yyyy")}</span>
      <div className="flex items-center gap-0.5">
        <button type="button" disabled={!previousMonth}
          onClick={() => previousMonth && goToMonth(previousMonth)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-foreground/40 dark:text-white/40 hover:text-foreground/90 dark:hover:text-white/90 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors disabled:opacity-20"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button type="button" disabled={!nextMonth}
          onClick={() => nextMonth && goToMonth(nextMonth)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-foreground/40 dark:text-white/40 hover:text-foreground/90 dark:hover:text-white/90 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors disabled:opacity-20"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

const SEGMENTS = ["manual", "daily", "weekly", "monthly"] as const;

export function BottomPanel({
  scheduleType, onScheduleTypeChange,
  scheduleTime, onScheduleTimeChange,
  scheduleDate, onScheduleDateChange,
  conflictResolution, onConflictResolutionChange,
}: BottomPanelProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-[12px] text-muted-foreground pl-0.5">Schedule &amp; Conflict</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Schedule Card — no blur, no shadow ── */}
        <div className={`rounded-xl p-5 ${CARD_CLS}`}>
          <label className="text-[11px] text-muted-foreground block mb-3">Frequency</label>

          <div className="flex flex-col gap-4">

            {/* Segmented Control — recessed pill track */}
            <div
              className="flex items-center gap-0.5 p-[3px] rounded-[9px] w-fit select-none bg-black/5 dark:bg-black/25 border-[0.5px] border-black/10 dark:border-black/35 shadow-inner shadow-black/5 dark:shadow-black/35"
            >
              {SEGMENTS.map((type) => (
                <button
                  key={type}
                  onClick={() => onScheduleTypeChange(type)}
                  className={clsx(
                    "px-3.5 py-[5px] text-[12px] rounded-[6px] transition-all capitalize",
                    scheduleType === type ? "text-foreground dark:text-white bg-white shadow-sm dark:bg-white/[0.12] dark:shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.14)]" : "text-muted-foreground hover:text-foreground/80 dark:hover:text-white/55"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Time + Date */}
            {scheduleType !== "manual" && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <MacTimePicker value={scheduleTime} onChange={onScheduleTimeChange} />

                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button
                      className="flex items-center gap-1.5 text-foreground/80 dark:text-white/80 text-[12px] px-2.5 py-[7px] rounded-md hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-1 focus:ring-[#0A84FF]/50 bg-black/5 dark:bg-white/[0.05] border-[0.5px] border-black/10 dark:border-white/10"
                    >
                      <CalendarIcon className="w-3 h-3 text-white/40 shrink-0" />
                      {scheduleDate ? format(scheduleDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                    </button>
                  </Popover.Trigger>

                  <Popover.Portal>
                    <Popover.Content
                      sideOffset={6}
                      align="start"
                      className="z-50 rounded-xl p-3 bg-popover/90 backdrop-blur-xl border border-border shadow-[0_16px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_32px_rgba(0,0,0,0.50)]"
                    >
                      <DayPicker
                        mode="single"
                        selected={scheduleDate || undefined}
                        onSelect={onScheduleDateChange}
                        components={{ Caption: CalendarCaption }}
                        classNames={{
                          months: "flex flex-col",
                          month: "",
                          caption: "",
                          caption_label: "hidden",
                          nav: "hidden",
                          table: "border-collapse",
                          head_row: "",
                          head_cell: "w-8 h-7 text-center text-[10px] text-foreground/50 dark:text-white/30 uppercase tracking-wider",
                          tbody: "",
                          row: "",
                          cell: "p-0 text-center",
                          day: "w-8 h-8 inline-flex items-center justify-center rounded-full text-[12px] text-foreground/80 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/[0.10] transition-colors cursor-pointer",
                          day_selected: "!bg-[#0A84FF] !text-white hover:!bg-[#1A8FFF] rounded-full",
                          day_today: "!text-[#0A84FF]",
                          day_outside: "!text-foreground/20 dark:!text-white/20",
                          day_disabled: "!text-foreground/20 dark:!text-white/15 cursor-not-allowed",
                        }}
                      />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
            )}
          </div>
        </div>

        {/* ── Conflict Resolution Card — no blur, no shadow ── */}
        <div className={`rounded-xl p-5 ${CARD_CLS}`}>
          <label className="text-[11px] text-muted-foreground block mb-3">If File Exists</label>
          <div className="space-y-3">
            <MacSelect
              value={conflictResolution}
              onChange={(e) => onConflictResolutionChange(e.target.value as any)}
            >
              <option value="rename">Keep Both (Append Number)</option>
              <option value="archive">Archive Duplicates Safely</option>
              <option value="skip">Skip Processing</option>
              <option value="overwrite">Overwrite (Danger)</option>
            </MacSelect>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              "Archive" isolates duplicates into a designated <code className="bg-black/5 dark:bg-white/10 px-1 rounded">Duplicates_Archive/</code> folder for safe later deletion.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
