import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRightLeft,
  Pencil,
  Copy,
  AlertCircle,
  ScrollText,
  X,
  Terminal,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type RunState = "idle" | "scanning" | "running" | "completed" | "error";

export interface RunMetrics {
  moved: number;
  renamed: number;
  duplicates: number;
  errors: number;
  timestamp: Date | null;
  destPath?: string;
  operations?: any[];
}

interface StatusBarProps {
  runState: RunState;
  metrics: RunMetrics;
  progress: number; // 0–100
  logEvents?: { level: "info" | "warn" | "error" | "success"; message: string; time: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTimestamp(date: Date): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (date.toDateString() === now.toDateString()) return `Today at ${time}`;
  if (date.toDateString() === yesterday.toDateString())
    return `Yesterday at ${time}`;
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    ` at ${time}`
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single metric chip */
function MetricChip({
  icon,
  value,
  label,
  colorClass,
  emphasized,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  colorClass: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] transition-colors ${emphasized
        ? "bg-red-500/10"
        : "bg-transparent hover:bg-white/[0.04]"
        }`}
    >
      <span className={`flex-shrink-0 ${colorClass}`}>{icon}</span>
      <span
        className={`text-[12px] tabular-nums ${emphasized ? "text-red-400" : "text-white/65"
          }`}
      >
        {value.toLocaleString()}
      </span>
      <span
        className={`text-[11px] ${emphasized ? "text-red-400/70" : "text-white/28"
          }`}
      >
        {label}
      </span>
    </div>
  );
}

/** Thin vertical divider between metrics */
function MetricDivider() {
  return (
    <div className="w-px h-3.5 bg-white/[0.08] mx-0.5 shrink-0" />
  );
}

/** Status indicator dot */
function StatusDot({ runState }: { runState: RunState }) {
  if (runState === "running") {
    return (
      <div className="relative w-2 h-2 flex items-center justify-center shrink-0">
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-[#0A84FF]"
          animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="w-1.5 h-1.5 rounded-full bg-[#0A84FF] relative z-10" />
      </div>
    );
  }

  const dotColor =
    runState === "completed"
      ? "bg-[#32D74B]"
      : runState === "error"
        ? "bg-red-500"
        : "bg-white/20";

  return (
    <div
      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500 ${dotColor}`}
    />
  );
}

// ─── Log Drawer ───────────────────────────────────────────────────────────────
function LogDrawer({
  open,
  onClose,
  metrics,
  logEvents = [],
}: {
  open: boolean;
  onClose: () => void;
  metrics: RunMetrics;
  logEvents?: { level: "info" | "warn" | "error" | "success"; message: string; time: string }[];
}) {
  const lines = logEvents;

  const levelStyle = {
    info: { color: "text-white/50", prefix: "·" },
    success: { color: "text-[#32D74B]/80", prefix: "✓" },
    warn: { color: "text-amber-400/70", prefix: "⚠" },
    error: { color: "text-red-400/80", prefix: "✕" },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0, 0.16, 1] }}
            className="fixed bottom-[49px] left-4 right-4 z-50 rounded-xl overflow-hidden"
            style={{
              maxWidth: 680,
              marginLeft: "auto",
              marginRight: "auto",
              background: "rgba(22,22,22,0.98)",
              border: "0.5px solid rgba(255,255,255,0.10)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.45)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[12px] text-white/50">Run Log</span>
                {metrics.timestamp && (
                  <span className="text-[11px] text-white/25">
                    — {formatTimestamp(metrics.timestamp)}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Log lines */}
            <div className="overflow-y-auto max-h-56 p-4 flex flex-col gap-1.5">
              {lines.length === 0 ? (
                <p className="text-[11px] text-white/25 text-center py-4">
                  No log entries yet. Run Tidy to generate a log.
                </p>
              ) : (
                lines.map((line, i) => {
                  const s = levelStyle[line.level];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.15 }}
                      className="flex items-start gap-2.5"
                    >
                      <span className="text-[10px] font-mono text-white/20 shrink-0 mt-px w-[60px]">
                        {line.time}
                      </span>
                      <span
                        className={`text-[10px] font-mono shrink-0 mt-px w-3 text-center ${s.color}`}
                      >
                        {s.prefix}
                      </span>
                      <span className={`text-[11px] font-mono ${s.color} leading-relaxed`}>
                        {line.message}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer stats */}
            {lines.length > 0 && (
              <div
                className="flex items-center gap-4 px-4 py-2.5"
                style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-2.5 h-2.5 text-white/20" />
                  <span className="text-[10px] font-mono text-white/25">
                    {lines.length} entries
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-2.5 h-2.5 text-white/20" />
                  <span className="text-[10px] font-mono text-white/25">
                    exit code {metrics.errors > 0 ? "1" : "0"}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── StatusBar ────────────────────────────────────────────────────────────────
export function StatusBar({ runState, metrics, progress, logEvents = [] }: StatusBarProps) {
  const [logOpen, setLogOpen] = useState(false);

  const isRunning = runState === "running";
  const hasLastRun = metrics.timestamp !== null;
  const hasErrors = metrics.errors > 0;

  return (
    <>
      <LogDrawer
        open={logOpen}
        onClose={() => setLogOpen(false)}
        metrics={metrics}
        logEvents={logEvents}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center"
        style={{
          height: "48px",
          background: "#202020",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          fontFamily:
            'var(--font-sf, -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif)',
        }}
      >
        {/* ── Progress bar (running state) — sits on top border */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              key="progressbar"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "linear" }}
              className="absolute top-0 left-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, #0A84FF 0%, #34AADC 60%, #5AC8FA 100%)",
                boxShadow: "0 0 6px rgba(10,132,255,0.55)",
              }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-center w-full px-5">
          {/* ── Left: Last Run ──────────────────────────────── */}
          <div className="flex items-center gap-2 w-[200px] shrink-0">
            <span
              className="text-[11px] shrink-0"
              style={{ color: "rgba(152,152,157,0.6)" }}
            >
              Last Run
            </span>
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div
                  key="ts-running"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] h-[3px] rounded-full bg-[#0A84FF]"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.22,
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.span
                  key="ts-value"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] text-white/40 truncate"
                >
                  {hasLastRun
                    ? formatTimestamp(metrics.timestamp!)
                    : "—"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* ── Middle: Metrics ─────────────────────────────── */}
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div
                  key="running-msg"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2.5"
                >
                  <span className="text-[12px] text-white/45">
                    Organizing files…
                  </span>
                  <span
                    className="text-[11px] tabular-nums"
                    style={{ color: "#0A84FF", opacity: 0.7 }}
                  >
                    {Math.round(progress)}%
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="metrics-row"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center"
                >
                  <MetricChip
                    icon={<ArrowRightLeft className="w-3 h-3" />}
                    value={metrics.moved}
                    label="moved"
                    colorClass="text-white/30"
                  />
                  <MetricDivider />
                  <MetricChip
                    icon={<Pencil className="w-3 h-3" />}
                    value={metrics.renamed}
                    label="renamed"
                    colorClass="text-[#0A84FF]/60"
                  />
                  <MetricDivider />
                  <MetricChip
                    icon={<Copy className="w-3 h-3" />}
                    value={metrics.duplicates}
                    label="duplicates"
                    colorClass="text-amber-400/55"
                  />
                  <MetricDivider />
                  <MetricChip
                    icon={<AlertCircle className="w-3 h-3" />}
                    value={metrics.errors}
                    label="errors"
                    colorClass={hasErrors ? "text-red-400/80" : "text-white/22"}
                    emphasized={hasErrors}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: View Log + Status Dot ────────────────── */}
          <div className="flex items-center gap-3 w-[200px] shrink-0 justify-end">
            <motion.button
              onClick={() => setLogOpen((o) => !o)}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[11px] transition-all ${hasErrors
                ? "text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                : "text-white/35 hover:text-white/60 hover:bg-white/[0.05]"
                }`}
              style={{ border: "0.5px solid rgba(255,255,255,0.07)" }}
            >
              <ScrollText className="w-3 h-3" />
              View Log
            </motion.button>

            <StatusDot runState={runState} />
          </div>
        </div>
      </div>
    </>
  );
}
