import { useState, useMemo, useEffect, useRef } from "react";
import {
  Folder, Image, Music, Video, FileText, FolderOpen,
  Archive, RotateCcw, Play, ArrowRight, Sparkles, Settings, Copy,
} from "lucide-react";
import { FolderCard } from "./components/FolderCard";
import { FilterCard } from "./components/FilterCard";
import { BottomPanel } from "./components/BottomPanel";
import { StatusBar, RunState, RunMetrics } from "./components/StatusBar";
import { PreviewSheet } from "./components/PreviewSheet";
import { NaturalLanguageRuleBuilder } from "./components/NaturalLanguageRuleBuilder";
import { InsightsSidebar, InsightsToggleButton } from "./components/InsightsSidebar";
import { generatePythonScript, OrganizerConfig, Category } from "./lib/generateScript";
import { ThemeToggle } from "./components/ThemeToggle";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import * as Switch from "@radix-ui/react-switch";

// ─── Design Tokens ────────────────────────────────────────────────────────────
/**
 * Apple HIG macOS 2026 Dark Mode — System Utility material spec:
 *   Fill   → Pure White 8 % opacity   (recessed vibrancy tile)
 *   Rim    → 0.5 pt inside stroke, White 10 % (etched glass edge)
 *   Blur   → none needed — background is solid #1E1E1E
 *   Shadow → NONE — cards sit flush against the window background
 */
const GLASS_CLS = "rounded-xl bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/10 dark:border-white/10";
const GLASS_STYLE: React.CSSProperties = {};

// ─── Data ─────────────────────────────────────────────────────────────────────
const AVAILABLE_EXTENSIONS: Record<string, string[]> = {
  documents: ["pdf", "docx", "txt", "xlsx", "pptx", "pages", "numbers", "key", "csv", "md", "rtf", "odt"],
  images: ["jpg", "jpeg", "png", "gif", "svg", "tiff", "raw", "heic", "webp", "bmp", "ico", "psd"],
  audio: ["mp3", "wav", "aac", "flac", "ogg", "m4a", "wma", "alac", "aiff"],
  video: ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv", "m4v", "mpg", "3gp"],
  archives: ["zip", "tar", "gz", "rar", "7z", "dmg", "pkg", "iso", "bz2", "xz", "tgz", "cab"],
};

const CATEGORY_ICONS: Record<string, any> = {
  documents: FileText,
  images: Image,
  audio: Music,
  video: Video,
  archives: Archive,
};

const CATEGORY_COLORS: Record<string, string> = {
  documents: "blue",
  images: "purple",
  audio: "orange",
  video: "green",
  archives: "yellow",
};

// Smart categorization subtypes for each category
const SMART_SUBFOLDERS: Record<string, string[]> = {
  documents: ["Invoices", "Receipts", "Contracts", "Reports", "Presentations", "Other"],
  images: ["Screenshots", "Photos", "Scans", "Designs", "Other"],
  audio: ["Music", "Podcasts", "Voice Memos", "Sound Effects", "Other"],
  video: ["Recordings", "Movies", "Clips", "Tutorials", "Other"],
  archives: ["Backups", "Downloads", "Projects", "Other"],
};

const INITIAL_CATEGORIES: Category[] = [
  { id: "documents", name: "Documents", enabled: true, subfolders: true, smartCategorization: false, duplicateDetection: false, extensions: AVAILABLE_EXTENSIONS.documents },
  { id: "images", name: "Images", enabled: true, subfolders: true, smartCategorization: false, duplicateDetection: false, extensions: AVAILABLE_EXTENSIONS.images },
  { id: "audio", name: "Audio", enabled: true, subfolders: true, smartCategorization: false, duplicateDetection: false, extensions: AVAILABLE_EXTENSIONS.audio },
  { id: "video", name: "Video", enabled: true, subfolders: true, smartCategorization: false, duplicateDetection: false, extensions: AVAILABLE_EXTENSIONS.video },
  { id: "archives", name: "Archives", enabled: true, subfolders: true, smartCategorization: false, duplicateDetection: false, extensions: AVAILABLE_EXTENSIONS.archives },
];

// ─── Local Components ──────────────────────────────────────────────────────────
/** SF Symbol–style chevron.up.chevron.down for <select> elements */
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

/** Reusable macOS-style flat <select> wrapped in a chevron container */
function MacSelect({
  label, value, onChange, children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-[#98989D]">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "w-full appearance-none cursor-pointer transition-colors",
            "text-foreground text-[13px]",
            "px-3 py-2 pr-8 rounded-lg",
            "hover:bg-black/5 dark:hover:bg-white/[0.08]",
            "focus:outline-none focus:ring-1 focus:ring-[#0A84FF]/50",
            "bg-black/[0.03] dark:bg-white/[0.05]",
            "border-[0.5px] border-black/10 dark:border-white/10"
          ].join(" ")}
        >
          {children}
        </select>
        <UpDownChevron className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
      </div>
    </div>
  );
}

/** macOS-style toggle (Switch.Root + Thumb) */
function MacToggle({
  checked,
  onCheckedChange,
  disabled,
  color = "green",
  size = "md",
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  color?: "green" | "blue";
  size?: "sm" | "md";
}) {
  const ON = color === "blue" ? "#0A84FF" : "#32D74B"; // System Green #32D74B
  const OFF = "#3A3A3C";                                 // Deep recessed gray
  const w = size === "sm" ? 32 : 42;
  const h = size === "sm" ? 18 : 24;
  const d = size === "sm" ? 14 : 20;
  const tx = size === "sm" ? 16 : 19;

  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className="rounded-full relative transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-0 shrink-0"
      style={{
        width: w, height: h,
        background: checked ? ON : OFF,
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.25)",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Switch.Thumb
        className="block bg-white rounded-full transition-transform duration-200 will-change-transform translate-x-0.5 data-[state=checked]:translate-x-[var(--tx)]"
        style={{
          width: d, height: d,
          // @ts-ignore
          "--tx": `${tx}px`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.30), inset 0 0 0 0.5px rgba(0,0,0,0.10)",
        }}
      />
    </Switch.Root>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  // Paths
  const [sourcePath, setSourcePath] = useState("");
  const [destPath, setDestPath] = useState("");
  const [previewFiles, setPreviewFiles] = useState<any[]>([]);

  // File rules
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Filters
  const [dateModified, setDateModified] = useState<"any" | "today" | "week" | "month" | "year">("any");
  const [fileSize, setFileSize] = useState<"any" | "small" | "medium" | "large">("any");
  const [excludeHidden, setExcludeHidden] = useState(false);

  // Settings
  const [undoEnabled, setUndoEnabled] = useState(true);
  const [scheduleType, setScheduleType] = useState<"manual" | "daily" | "weekly" | "monthly">("manual");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [conflictResolution, setConflictResolution] = useState<"rename" | "overwrite" | "skip" | "archive">("rename");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // AI features
  const [smartRenameEnabled, setSmartRenameEnabled] = useState(false);

  // Natural Language Rule Builder
  const [ruleBuilderOpen, setRuleBuilderOpen] = useState(false);

  // Insights sidebar
  const [insightsOpen, setInsightsOpen] = useState(false);

  // Dynamic insights data replacing mock insights
  const [insightData, setInsightData] = useState<{ counts: Record<string, number>, total: number } | null>(null);

  useEffect(() => {
    let active = true;
    if (sourcePath && window.electron?.getFolderInsights) {
      window.electron.getFolderInsights(sourcePath).then((data) => {
        if (active) setInsightData(data);
      }).catch(console.error);
    } else {
      setInsightData(null);
    }
    return () => { active = false; };
  }, [sourcePath]);

  const dynamicInsights = useMemo(() => {
    if (!insightData || !sourcePath) return [];

    const hasDupDetection = categories.some(c => c.duplicateDetection && c.enabled);
    const insights = [];
    const { counts } = insightData;

    // File Types section
    const fileItems = [];
    if (counts.screenshots > 0) fileItems.push({ label: "Screenshots", count: counts.screenshots, action: { label: "View", onClick: () => setPreviewOpen(true) } });
    if (counts.photos > 0) fileItems.push({ label: "Photos", count: counts.photos, action: { label: "View", onClick: () => setPreviewOpen(true) } });
    if (counts.recordings > 0) fileItems.push({ label: "Screen recordings", count: counts.recordings, action: { label: "View", onClick: () => setPreviewOpen(true) } });

    if (fileItems.length > 0) {
      insights.push({
        title: "File Types",
        icon: Image,
        accentColor: "#BF5AF2",
        items: fileItems,
      });
    }

    // Duplicates section
    if (hasDupDetection && counts.duplicates > 0) {
      insights.push({
        title: "Duplicates",
        icon: Copy,
        accentColor: "#FF9F0A",
        items: [
          { label: "Potential duplicates", count: counts.duplicates, action: { label: "Review", onClick: () => setPreviewOpen(true) } },
        ],
      });
    }

    // Documents section
    const docItems = [];
    if (counts.invoices > 0) docItems.push({ label: "Likely invoices", count: counts.invoices, action: { label: "View", onClick: () => setPreviewOpen(true) } });
    if (counts.contracts > 0) docItems.push({ label: "Contracts detected", count: counts.contracts, action: { label: "View", onClick: () => setPreviewOpen(true) } });

    if (categories.find(c => c.id === "documents")?.enabled && docItems.length > 0) {
      insights.push({
        title: "Documents",
        icon: FileText,
        accentColor: "#0A84FF",
        items: docItems,
      });
    }

    // Audio section
    if (categories.find(c => c.id === "audio")?.enabled && counts.audioMissingMeta > 0) {
      insights.push({
        title: "Audio",
        icon: Music,
        accentColor: "#FF9F0A",
        items: [
          { label: "Missing artist metadata", count: counts.audioMissingMeta, action: { label: "Review", onClick: () => setPreviewOpen(true) } },
        ],
      });
    }

    // Fallback if no specific heuristics match
    if (insights.length === 0 && insightData.total > 0) {
      insights.push({
        title: "Folder Scan",
        icon: Folder,
        accentColor: "#32D74B",
        items: [
          { label: "Total files ready", count: insightData.total, action: { label: "View", onClick: () => setPreviewOpen(true) } }
        ]
      });
    }

    return insights;
  }, [categories, sourcePath, insightData]);

  const searchMatches = useMemo<Set<string> | null>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      categories
        .filter((c) =>
          c.name.toLowerCase().includes(q) ||
          c.extensions.some((e) => e.toLowerCase().includes(q))
        )
        .map((c) => c.id)
    );
  }, [searchQuery, categories]);

  // Handlers
  const handleCategoryToggle = (id: string, enabled: boolean) =>
    setCategories((p) => p.map((c) => c.id === id ? { ...c, enabled } : c));

  const handleExpandToggle = (id: string) =>
    setExpandedCategories((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleSubfolderToggle = (id: string, subfolders: boolean) =>
    setCategories((p) => p.map((c) => c.id === id ? { ...c, subfolders } : c));

  const handleSmartCategorizationToggle = (id: string, smartCategorization: boolean) =>
    setCategories((p) => p.map((c) => c.id === id ? { ...c, smartCategorization } : c));

  const handleDuplicateDetectionToggle = (id: string, duplicateDetection: boolean) =>
    setCategories((p) => p.map((c) => c.id === id ? { ...c, duplicateDetection } : c));

  const handleExtensionToggle = (id: string, ext: string) =>
    setCategories((p) =>
      p.map((c) => {
        if (c.id !== id) return c;
        const exts = c.extensions.includes(ext)
          ? c.extensions.filter((e) => e !== ext)
          : [...c.extensions, ext];
        return { ...c, extensions: exts };
      })
    );

  const config: OrganizerConfig = useMemo(() => ({
    sourcePath, destPath, categories,
    filters: { dateModified, fileSize, excludeHidden },
    conflictResolution,
    schedule: {
      enabled: scheduleType !== "manual",
      frequency: scheduleType === "manual" ? "manual" : scheduleType,
      date: scheduleDate || null,
      time: scheduleTime,
    },
  }), [sourcePath, destPath, categories, dateModified, fileSize, excludeHidden,
    conflictResolution, scheduleType, scheduleDate, scheduleTime]);

  const pythonScript = useMemo(() => generatePythonScript(config), [config]);

  // Push native cron schedule on form layout change
  useEffect(() => {
    if (window.electron && window.electron.saveSchedule) {
      // Just pass our derived config JSON to Electron
      window.electron.saveSchedule(config).catch(console.error);
    }
  }, [config, scheduleType, scheduleDate, scheduleTime]);

  // ─── Run State ──────────────────────────────────────────────────────────────
  const [runState, setRunState] = useState<RunState>("idle");
  const [runProgress, setRunProgress] = useState(0);
  const [runMetrics, setRunMetrics] = useState<RunMetrics>({
    moved: 0, renamed: 0, duplicates: 0, errors: 0, timestamp: null, destPath: "", operations: [],
  });
  const [logEvents, setLogEvents] = useState<{ level: "info" | "warn" | "error" | "success"; message: string; time: string }[]>([]);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load persisted metrics on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tidy_metrics");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timestamp) parsed.timestamp = new Date(parsed.timestamp);
        setRunMetrics(parsed);
      }
    } catch (e) {
      console.warn("Failed to load metrics from localStorage", e);
    }
  }, []);

  // Preview sheet visibility
  const [previewOpen, setPreviewOpen] = useState(false);

  // Opens the preview instead of running immediately
  const handleRunTidy = async () => {
    if (!sourcePath) {
      alert("Please select a source folder first.");
      return;
    }

    setRunState("scanning");
    try {
      if (window.electron) {
        const files = await window.electron.getFolderPreview(sourcePath, categories, smartRenameEnabled);
        setPreviewFiles(files);
      }
      setRunState("idle");
      setPreviewOpen(true);
    } catch (err) {
      console.error("Failed to scan folder:", err);
      setRunState("idle");
    }
  };

  const handleConfirmRun = async (sheetData: any = {}) => {
    // Clear any in-flight simulation
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (!window.electron) {
      console.warn("Electron API not available");
      const blob = new Blob([pythonScript], { type: "text/x-python" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "organizer.py";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    setRunState("running");
    setRunProgress(0);
    setLogEvents([]);
    setRunMetrics({
      moved: 0, renamed: 0, duplicates: 0, errors: 0, timestamp: null, destPath: "", operations: [],
    });

    const removeProgressListener = window.electron.onOrganizeProgress((data) => {
      if (data.status === 'running' || data.status === 'scanning') {
        setRunProgress(data.progress || 0);
      }
    });

    const removeLogListener = window.electron.onOrganizeLog((data) => {
      setLogEvents(prev => [...prev, data]);
    });

    try {
      const result = await window.electron.organizeFiles({ ...config, ...sheetData });
      removeProgressListener();
      removeLogListener();

      if (result.success) {
        const finalMetrics = {
          moved: result.moved || 0,
          renamed: result.renamed || 0,
          duplicates: 0,
          errors: result.errors || 0,
          timestamp: new Date(),
          destPath: destPath,
          operations: result.operations || [],
        };
        setRunMetrics(finalMetrics);

        // Persist to localStorage
        try {
          localStorage.setItem("tidy_metrics", JSON.stringify(finalMetrics));
        } catch (e) {
          console.warn("Failed to save metrics to localStorage", e);
        }

        setRunState(result.errors ? "error" : "completed");
      } else {
        console.error("Organization failed:", result.error);
        setRunState("error");
      }
    } catch (e) {
      removeProgressListener();
      removeLogListener();
      console.error("IPC Error:", e);
      setRunState("error");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen overflow-hidden flex flex-col selection:bg-[#0A84FF]/30 selection:text-white bg-background text-foreground"
      style={{
        fontFamily: "var(--font-sf, -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif)",
      }}
    >

      {/* ── Scrollable Content ── */}
      <main className="flex-1 overflow-auto scroll-smooth">
        <div className="w-full px-6 lg:px-12 xl:px-20 pt-12 pb-36 flex flex-col gap-4">{/* Removed max-w-5xl mx-auto, added responsive horizontal padding */}

          {/* ══ Row 1: Locations ══ */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between pl-1">
              <h2 className="text-[12px] text-muted-foreground">Locations</h2>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <InsightsToggleButton
                  isOpen={insightsOpen}
                  onClick={() => setInsightsOpen(!insightsOpen)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FolderCard
                label="Source"
                path={sourcePath}
                onPathChange={setSourcePath}
                onSelect={async () => {
                  if (window.electron) {
                    try {
                      const dir = await window.electron.openDirectory();
                      if (dir) setSourcePath(dir);
                    } catch (err) {
                      console.error('App: openDirectory error:', err);
                    }
                  }
                }}
                accentColor="blue"
              />
              <FolderCard
                label="Destination"
                path={destPath}
                onPathChange={setDestPath}
                onSelect={async () => {
                  if (window.electron) {
                    try {
                      const dir = await window.electron.openDirectory();
                      if (dir) setDestPath(dir);
                    } catch (err) {
                      console.error('App: openDirectory error:', err);
                    }
                  }
                }}
                accentColor="emerald"
              />
            </div>

            {/* Path flow pill */}
            <AnimatePresence>
              {sourcePath && destPath && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/[0.05] border-[0.5px] border-black/10 dark:border-white/10"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="w-5 h-5 rounded-md bg-[#0A84FF]/15 flex items-center justify-center shrink-0">
                        <FolderOpen className="w-3 h-3 text-[#0A84FF]" />
                      </div>
                      <span className="text-[11px] font-mono text-foreground/50 truncate">{sourcePath}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-foreground/20 shrink-0" />
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                      <span className="text-[11px] font-mono text-foreground/50 truncate text-right">{destPath}</span>
                      <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <Folder className="w-3 h-3 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ══ Row 2: Filters (3-up Bento) ══ */}
          <section className="flex flex-col gap-3">
            <h2 className="text-[12px] text-muted-foreground pl-1">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Date Modified */}
              <div className={`${GLASS_CLS} p-4`} style={GLASS_STYLE}>
                <MacSelect
                  label="Date Modified"
                  value={dateModified}
                  onChange={(v) => setDateModified(v as any)}
                >
                  <option value="any">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </MacSelect>
              </div>

              {/* File Size */}
              <div className={`${GLASS_CLS} p-4`} style={GLASS_STYLE}>
                <MacSelect
                  label="File Size"
                  value={fileSize}
                  onChange={(v) => setFileSize(v as any)}
                >
                  <option value="any">Any Size</option>
                  <option value="small">Small  (&lt; 1 MB)</option>
                  <option value="medium">Medium  (1 MB – 100 MB)</option>
                  <option value="large">Large  (&gt; 100 MB)</option>
                </MacSelect>
              </div>

              {/* Exclude Hidden */}
              <div className={`${GLASS_CLS} p-4 flex items-center justify-between gap-4`} style={GLASS_STYLE}>
                <div className="min-w-0">
                  <p className="text-[13px] text-foreground/90">Exclude Hidden</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Skip dot-files (e.g. .DS_Store)</p>
                </div>
                <MacToggle checked={excludeHidden} onCheckedChange={setExcludeHidden} />
              </div>

            </div>
          </section>

          {/* ══ Row 3: File Rules ══ */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between pl-1">
              <h2 className="text-[12px] text-muted-foreground">File Rules</h2>
              <span className="text-[11px] text-muted-foreground">
                {searchMatches
                  ? `${searchMatches.size} matching`
                  : `${categories.filter((c) => c.enabled).length} active`}
              </span>
            </div>

            {/* ── Smart Rename Toggle ── */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-purple-500/5 dark:bg-purple-500/[0.06] border-[0.5px] border-purple-500/10 dark:border-purple-500/[0.14]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-6 h-6 rounded-[7px] flex items-center justify-center shrink-0"
                  style={{ background: "rgba(191,90,242,0.16)" }}
                >
                  <Sparkles className="w-3 h-3 text-purple-400/80" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] text-foreground/70">Smart Rename</p>
                    <span
                      className="text-[9px] px-1.5 py-[2px] rounded-[4px] text-purple-600/70 dark:text-purple-300/55 bg-purple-500/10 border-[0.5px] border-purple-500/20"
                    >
                      Beta
                    </span>
                  </div>
                  <p
                    className="text-[10px] text-foreground/40 dark:text-white/28 mt-0.5 truncate max-w-[320px]"
                    title="Generate improved file names based on content and metadata. Preview before applying."
                  >
                    Generate improved file names based on content and metadata. Preview before applying.
                  </p>
                </div>
              </div>
              <MacToggle
                checked={smartRenameEnabled}
                onCheckedChange={setSmartRenameEnabled}
                color="blue"
                size="sm"
              />
            </div>

            {/* Two-column bento grid */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {[
                categories.filter((_, i) => i % 2 === 0),
                categories.filter((_, i) => i % 2 === 1),
              ].map((col, colIdx) => (
                <div key={colIdx} className="w-full md:flex-1 flex flex-col gap-4">
                  {col.map((category) => {
                    const isExpanded = expandedCategories.has(category.id);
                    const isSearchHit = !searchMatches || searchMatches.has(category.id);
                    return (
                      <div
                        key={category.id}
                        className={clsx(
                          GLASS_CLS,
                          "group transition-all duration-200 relative overflow-hidden cursor-pointer",
                          !isSearchHit && "opacity-30 pointer-events-none",
                          searchMatches && isSearchHit && "ring-1 ring-[#0A84FF]/25"
                        )}
                        style={GLASS_STYLE}
                        onClick={(e) => { e.stopPropagation(); handleExpandToggle(category.id); }}
                      >
                        <FilterCard
                          label={category.name}
                          count={`${category.extensions.length} types`}
                          icon={CATEGORY_ICONS[category.id] || Folder}
                          color={CATEGORY_COLORS[category.id]}
                          enabled={category.enabled}
                          onToggle={(enabled) => handleCategoryToggle(category.id, enabled)}
                          expanded={isExpanded}
                        />

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              key={`expanded-${category.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                              onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
                            >
                              {/* Separator */}
                              <div className="mx-4 h-px bg-black/5 dark:bg-white/10" />

                              <div className="p-4 space-y-4">
                                {/* Create Subfolders */}
                                <div className="flex items-center justify-between">
                                  <label className="text-[13px] text-muted-foreground">Create Subfolders</label>
                                  <MacToggle
                                    checked={category.subfolders}
                                    onCheckedChange={(v) => handleSubfolderToggle(category.id, v)}
                                    disabled={!category.enabled}
                                    color="blue"
                                    size="sm"
                                  />
                                </div>

                                {/* Smart Categorization */}
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col gap-0.5">
                                    <label className="text-[13px] text-muted-foreground">Smart Categorization</label>
                                    <p className="text-[10px] text-foreground/40" title="Group files by detected content type (e.g., Screenshots, Photos, Scans). Preview before applying.">
                                      Group by content type
                                    </p>
                                  </div>
                                  <MacToggle
                                    checked={!!category.smartCategorization}
                                    onCheckedChange={(v) => handleSmartCategorizationToggle(category.id, v)}
                                    disabled={!category.enabled || !category.subfolders}
                                    color="blue"
                                    size="sm"
                                  />
                                </div>

                                {/* Duplicate Detection */}
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col gap-0.5">
                                    <label className="text-[13px] text-muted-foreground">Duplicate Detection</label>
                                    <p className="text-[10px] text-foreground/40" title="Identify and handle duplicate files. Preview before applying.">
                                      Detect duplicates
                                    </p>
                                  </div>
                                  <MacToggle
                                    checked={!!category.duplicateDetection}
                                    onCheckedChange={(v) => handleDuplicateDetectionToggle(category.id, v)}
                                    disabled={!category.enabled || !category.subfolders}
                                    color="blue"
                                    size="sm"
                                  />
                                </div>

                                {/* Subfolder Preview */}
                                {category.subfolders && category.enabled && (
                                  <div>
                                    <label className="text-[11px] text-muted-foreground block mb-2">
                                      {category.smartCategorization ? "Content Types" : "By Extension"}
                                    </label>
                                    <div
                                      className="p-2.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border-[0.5px] border-black/5 dark:border-white/[0.06]"
                                    >
                                      <div className="flex items-start gap-1.5">
                                        <Folder className="w-3 h-3 text-foreground/30 shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[11px] text-foreground/70 mb-1">{category.name}</p>
                                          <div className="pl-3 space-y-0.5">
                                            {category.smartCategorization ? (
                                              // Show content-based subfolders
                                              SMART_SUBFOLDERS[category.id]?.map((subfolder) => (
                                                <div key={subfolder} className="flex items-center gap-1.5">
                                                  <div className="w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
                                                  <span className="text-[10px] text-foreground/40">{subfolder}</span>
                                                </div>
                                              ))
                                            ) : (
                                              // Show extension-based subfolders (first 4)
                                              category.extensions.slice(0, 4).map((ext) => (
                                                <div key={ext} className="flex items-center gap-1.5">
                                                  <div className="w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
                                                  <span className="text-[10px] text-foreground/40 font-mono">.{ext}</span>
                                                </div>
                                              ))
                                            )}
                                            {!category.smartCategorization && category.extensions.length > 4 && (
                                              <div className="flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
                                                <span className="text-[10px] text-foreground/30 dark:text-white/25 font-mono">+{category.extensions.length - 4} more</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Extension Tokens */}
                                <div>
                                  <label className="text-[11px] text-muted-foreground block mb-2">Extensions</label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(AVAILABLE_EXTENSIONS[category.id] || category.extensions || []).map((ext) => {
                                      const isSelected = category.extensions.includes(ext);
                                      const extHit = !searchMatches || ext.toLowerCase().includes(searchQuery.toLowerCase());
                                      return (
                                        <button
                                          key={ext}
                                          onClick={(e) => { e.stopPropagation(); handleExtensionToggle(category.id, ext); }}
                                          disabled={!category.enabled}
                                          className={clsx(
                                            "px-2.5 py-1 text-[10px] rounded-[8px] border-[0.5px] transition-all",
                                            isSelected && category.enabled
                                              ? "bg-[#0A84FF]/15 border-[#0A84FF]/30 text-[#0A84FF] dark:text-[#58ADFF] hover:bg-[#0A84FF]/22"
                                              : "bg-black/5 dark:bg-white/[0.05] border-black/10 dark:border-white/[0.12] text-foreground/40 dark:text-white/40 hover:text-foreground/65 dark:hover:text-white/65 hover:bg-black/10 dark:hover:bg-white/[0.09]",
                                            searchMatches && !extHit && "opacity-20"
                                          )}
                                        >
                                          .{ext}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Hover shimmer */}
                        {category.enabled && isSearchHit && (
                          <div className="absolute inset-0 bg-gradient-to-br from-black/[0.03] to-transparent dark:from-white/[0.03] dark:to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* ══ Advanced Rules Button ══ */}
          <section className="flex justify-center">
            <button
              onClick={() => setRuleBuilderOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] text-foreground/50 hover:text-foreground/80 hover:bg-black/5 dark:text-white/32 dark:hover:text-white/58 dark:hover:bg-white/[0.04] transition-all border-[0.5px] border-black/10 dark:border-white/[0.06]"
              title="Create custom rules using plain language"
            >
              <Settings className="w-3 h-3" />
              Advanced Rules
            </button>
          </section>

          {/* ══ Row 4: Schedule & Conflict ══ */}
          <BottomPanel
            scheduleType={scheduleType}
            onScheduleTypeChange={setScheduleType}
            scheduleTime={scheduleTime}
            onScheduleTimeChange={setScheduleTime}
            scheduleDate={scheduleDate || null}
            onScheduleDateChange={setScheduleDate}
            conflictResolution={conflictResolution}
            onConflictResolutionChange={setConflictResolution}
          />

        </div>
      </main>

      {/* ── Floating Action Bar ── */}
      <div
        className="fixed bottom-[64px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 px-2.5 py-2 border-[0.5px] border-black/10 dark:border-white/10 rounded-[20px] shadow-sm flex-row"
        style={{
          background: "var(--theme-fab-bg, rgba(230, 230, 230, 0.90))",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          boxShadow: "var(--theme-fab-shadow, inset 0 1px 0 rgba(255,255,255,0.07))",
        }}
      >
        <style>{`
          .dark {
            --theme-fab-bg: rgba(40,40,40,0.90);
            --theme-fab-shadow: inset 0 1px 0 rgba(255,255,255,0.07);
          }
        `}</style>
        {/* Undo History */}
        <button
          type="button"
          onClick={() => setUndoEnabled(!undoEnabled)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-[7px] rounded-[11px] text-[12px] transition-all select-none",
            undoEnabled
              ? "bg-black/5 dark:bg-white/[0.10] text-foreground dark:text-white/85"
              : "text-foreground/40 dark:text-white/35 hover:text-foreground/60 dark:hover:text-white/60 hover:bg-black/5 dark:hover:bg-white/[0.06]"
          )}
        >
          <RotateCcw className="w-3 h-3" />
          Undo History
        </button>

        <div className="w-px h-5 bg-black/10 dark:bg-white/[0.10] mx-1.5 shrink-0" />

        {/* Run Tidy — System Blue #0A84FF, flat, no shadow */}
        <button
          onClick={handleRunTidy}
          disabled={runState === "running"}
          className="flex items-center gap-2 px-4 py-[7px] text-white text-[13px] rounded-[12px] transition-opacity hover:opacity-85 active:opacity-70 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#0A84FF" }}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {runState === "running" ? "Running…" : "Run Tidy"}
        </button>
      </div>

      {/* ── Preview Sheet ── */}
      <PreviewSheet
        isOpen={previewOpen}
        onClose={() => {
          if (runState !== "running") {
            setPreviewOpen(false);
            if (runState === "completed" || runState === "error") {
              setRunState("idle");
            }
          }
        }}
        onConfirm={handleConfirmRun}
        categories={categories}
        runState={runState}
        runMetrics={runMetrics}
        runProgress={runProgress}
        files={previewFiles}
        smartRenameEnabled={smartRenameEnabled}
      />

      {/* ── Status Bar ── */}
      <StatusBar
        runState={runState}
        metrics={runMetrics}
        progress={runProgress}
        logEvents={logEvents}
      />

      {/* ── Natural Language Rule Builder ── */}
      <NaturalLanguageRuleBuilder
        isOpen={ruleBuilderOpen}
        onClose={() => setRuleBuilderOpen(false)}
        onSave={async (rule) => {
          if (!window.electron?.parseRule) {
            alert("The AI Rule Builder relies on the local file system and is only available in the Desktop App.");
            return;
          }
          try {
            const filters = { dateModified, fileSize, excludeHidden };
            const currentConfig = { categories, filters, smartRenameEnabled };
            const result = await window.electron.parseRule(rule, currentConfig);
            if (result.success && result.data) {
              const { newCategories, updateCategories, updateFilters, smartRename } = result.data;

              if (newCategories || updateCategories) {
                setCategories(prev => {
                  let next = [...prev];
                  // apply new
                  if (Array.isArray(newCategories)) {
                    newCategories.forEach((nc: any) => {
                      if (!nc) return;
                      next.push({
                        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        name: nc.name || "Custom Rule",
                        enabled: true,
                        extensions: nc.extensions || [],
                        subfolders: nc.subfolders || false,
                        smartCategorization: nc.smartCategorization || false,
                        duplicateDetection: nc.duplicateDetection || false
                      });
                    });
                  }
                  // apply updates
                  if (Array.isArray(updateCategories)) {
                    updateCategories.forEach((uc: any) => {
                      if (!uc || !uc.id) return;
                      const idx = next.findIndex(c => c.id === uc.id);
                      if (idx !== -1) {
                        // Ensure we don't accidentally overwrite the ID or Name if not provided
                        next[idx] = { ...next[idx], ...uc, id: next[idx].id, name: next[idx].name };
                      }
                    });
                  }
                  return next;
                });
              }

              if (updateFilters) {
                if (updateFilters.dateModified) setDateModified(updateFilters.dateModified);
                if (updateFilters.fileSize) setFileSize(updateFilters.fileSize);
                if (updateFilters.excludeHidden !== undefined) setExcludeHidden(updateFilters.excludeHidden);
              }

              if (smartRename !== undefined && smartRename !== null) {
                setSmartRenameEnabled(smartRename);
              }
            } else {
              console.error("AI Parse Error:", result.error);
              alert("AI was unable to process your rule: " + result.error);
            }
          } catch (e) {
            console.error(e);
            alert("Error communicating with AI parser. Make sure GEMINI_API_KEY is set in your .env");
          }
        }}
      />

      {/* ── Insights Sidebar ── */}
      <InsightsSidebar
        isOpen={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        insights={dynamicInsights}
      />
      <InsightsToggleButton
        isOpen={insightsOpen}
        onClick={() => setInsightsOpen(!insightsOpen)}
      />
    </div>
  );
}