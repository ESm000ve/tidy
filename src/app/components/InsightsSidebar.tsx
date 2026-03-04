import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, ChevronRight, FileImage, Copy, FileText,
  Music, X, BarChart3
} from "lucide-react";
import { clsx } from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────
interface InsightItem {
  label: string;
  count: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface InsightSection {
  title: string;
  icon: React.ElementType;
  items: InsightItem[];
  accentColor: string;
}

interface InsightsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  insights: InsightSection[];
}

const GLASS_CLS = "bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/10 dark:border-white/10";

// ─── Main Component ───────────────────────────────────────────────────────────
export function InsightsSidebar({ isOpen, onClose, insights }: InsightsSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (subtle) */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/10 dark:bg-black/20"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.div
            key="sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0, 0.16, 1] }}
            className="fixed right-0 top-0 bottom-[64px] z-50 w-[340px] flex flex-col bg-background border-l-[0.5px] border-black/10 dark:border-white/10"
            style={{
              fontFamily: "var(--font-sf, -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b-[0.5px] border-black/5 dark:border-white/[0.07]">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-[7px] flex items-center justify-center"
                  style={{ background: "rgba(10,132,255,0.12)" }}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#0A84FF]" />
                </div>
                <div>
                  <h2 className="text-[15px] text-black/90 dark:text-white/82">Insights</h2>
                  <p className="text-[11px] text-black/50 dark:text-white/28">Detected patterns in your files</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-black/40 dark:text-white/28 hover:text-black/80 dark:hover:text-white/62 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {insights.map((section, idx) => (
                <InsightSectionCard key={idx} section={section} />
              ))}

              {/* Empty State */}
              {insights.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-black/5 dark:bg-white/[0.05]">
                    <Sparkles className="w-5 h-5 text-black/20 dark:text-white/20" />
                  </div>
                  <p className="text-[13px] text-black/50 dark:text-white/40">No insights yet</p>
                  <p className="text-[11px] text-black/40 dark:text-white/25 mt-1">
                    Configure your source path and run a scan
                  </p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 shrink-0 border-t-[0.5px] border-black/5 dark:border-white/[0.07]">
              <p className="text-[10px] text-black/50 dark:text-white/28 leading-relaxed">
                Insights update after scan, run, or when toggles change. They never auto-trigger changes.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function InsightSectionCard({ section }: { section: InsightSection }) {
  const Icon = section.icon;

  return (
    <div
      className={`rounded-xl overflow-hidden ${GLASS_CLS}`}
    >
      {/* Section Header */}
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 border-b-[0.5px] border-black/5 dark:border-white/[0.06]"
      >
        <div
          className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0"
          style={{ background: `${section.accentColor}14` }}
        >
          <Icon className="w-2.5 h-2.5" style={{ color: `${section.accentColor}90` }} />
        </div>
        <span className="text-[12px] text-black/70 dark:text-white/70">{section.title}</span>
      </div>

      {/* Items */}
      <div className="divide-y divide-black/5 dark:divide-white/[0.04]">
        {section.items.map((item, idx) => (
          <div
            key={idx}
            className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-black/60 dark:text-white/55 truncate">{item.label}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-[13px] text-black/80 dark:text-white/70 font-medium tabular-nums"
              >
                {item.count}
              </span>
              {item.action && (
                <button
                  onClick={item.action.onClick}
                  className="flex items-center gap-1 text-[10px] text-[#0A84FF]/70 hover:text-[#0A84FF] transition-colors"
                >
                  {item.action.label}
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Toggle Button (Floating) ─────────────────────────────────────────────────
interface InsightsToggleButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function InsightsToggleButton({ onClick, isOpen }: InsightsToggleButtonProps) {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/10 dark:border-white/[0.10]"
          title="View file insights"
        >
          <BarChart3 className="w-3 h-3 text-black/60 dark:text-white/60" />
          <span className="text-[11px] text-black/70 dark:text-white/60 font-medium">Insights</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}