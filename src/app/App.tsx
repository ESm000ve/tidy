import { useState, useMemo, useEffect, useRef } from "react";
import { ComponentType } from "react";
import { SFIcon } from '@bradleyhodges/sfsymbols-react';
import { sfFolder, sfPhotoFill, sfMusicNoteList, sfFilmFill, sfDocumentFill, sfFolderFill, sfArchiveboxFill, sfArrowCounterclockwise, sfPlayFill, sfArrowRight, sfSparkles, sfDocumentOnDocument } from '@bradleyhodges/sfsymbols';

const makeIcon = (iconObj: any) => (props: any) => <SFIcon icon={iconObj} className={props.className} aria-hidden={props["aria-hidden"]} aria-label={props["aria-label"]} />;

const Folder = makeIcon(sfFolder);
const Image = makeIcon(sfPhotoFill);
const Music = makeIcon(sfMusicNoteList);
const Video = makeIcon(sfFilmFill);
const FileText = makeIcon(sfDocumentFill);
const FolderOpen = makeIcon(sfFolderFill);
const Archive = makeIcon(sfArchiveboxFill);
const RotateCcw = makeIcon(sfArrowCounterclockwise);
const Play = makeIcon(sfPlayFill);
const ArrowRight = makeIcon(sfArrowRight);
const Sparkles = makeIcon(sfSparkles);
const Copy = makeIcon(sfDocumentOnDocument);

import { FolderCard } from "./components/FolderCard";
import { TopBar } from "./components/TopBar";
import { FilterCard } from "./components/FilterCard";
import { BottomPanel } from "./components/BottomPanel";
import { StatusBar, RunState, RunMetrics } from "./components/StatusBar";
import { PreviewSheet } from "./components/PreviewSheet";
import { NaturalLanguageRuleBuilder } from "./components/NaturalLanguageRuleBuilder";
import { InsightsSidebar, InsightsToggleButton } from "./components/InsightsSidebar";
import { AuditLogSidebar, AuditLogToggleButton } from "./components/AuditLogSidebar";
import { generatePythonScript, OrganizerConfig, Category } from "./lib/generateScript";
import { ThemeToggle } from "./components/ThemeToggle";
import { AccessibilityPanel } from "./components/AccessibilityPanel";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import * as Switch from "@radix-ui/react-switch";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Toaster } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

function MacSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const selectId = `mac-select-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1.5 flex-1 select-none">
      <label htmlFor={selectId} className="text-[13px] font-medium text-foreground/50 dark:text-white/40 tracking-tight">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={selectId}
          className="w-full bg-black/5 dark:bg-white/[0.05] border-[0.5px] border-black/10 dark:border-white/10 text-[14px] h-9 px-3 hover:bg-black/10 dark:hover:bg-white/[0.08] transition-colors"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-black/10 dark:border-white/15">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-[14px] focus:bg-blue-500/10 focus:text-foreground">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
  color?: "green" | "blue" | "purple";
  size?: "sm" | "md";
}) {
  const ON = color === "blue" ? "var(--system-blue)" : color === "purple" ? "var(--system-purple)" : "var(--system-green)"; // System Green
  const OFF = "var(--mac-toggle-off)";                                 // Deep recessed gray
  const w = size === "sm" ? 32 : 42;
  const h = size === "sm" ? 18 : 24;
  const d = size === "sm" ? 14 : 20;
  const tx = size === "sm" ? 16 : 19;

  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className="rounded-full relative transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-background shrink-0"
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sourcePath, setSourcePath] = useState("");
  const [destPath, setDestPath] = useState("");
  const [previewFiles, setPreviewFiles] = useState<any[]>([]);

  // Dialogs
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const showAlert = (message: string) => {
    setErrorMessage(message);
    setErrorDialogOpen(true);
  };

  // File rules
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Filters
  const [dateModified, setDateModified] = useState<"any" | "today" | "week" | "month" | "year">("any");
  const [fileSize, setFileSize] = useState<"any" | "small" | "medium" | "large">("any");
  const [excludeHidden, setExcludeHidden] = useState(false);

  // Settings

  const [scheduleType, setScheduleType] = useState<"manual" | "daily" | "weekly" | "monthly">("manual");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [conflictResolution, setConflictResolution] = useState<"rename" | "overwrite" | "skip" | "archive">("rename");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // AI features
  const [smartRenameEnabled, setSmartRenameEnabled] = useState(false);

  // Natural Language Rule Builder (modal)
  const [ruleBuilderOpen, setRuleBuilderOpen] = useState(false);

  // Inline AI Command Bar state
  const [nlQuery, setNlQuery] = useState("");
  const [nlSubmitting, setNlSubmitting] = useState(false);
  const [nlFeedback, setNlFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const nlInputRef = useRef<HTMLTextAreaElement>(null);

  const handleInlineNlSubmit = async (queryOverride?: string) => {
    const query = (queryOverride ?? nlQuery).trim();
    if (!query || nlSubmitting) return;
    if (!window.electron?.parseRule) {
      setNlFeedback({ type: "error", message: "AI rules are only available in the desktop app." });
      return;
    }
    setNlSubmitting(true);
    setNlFeedback(null);
    try {
      const filters = { dateModified, fileSize, excludeHidden };
      const currentConfig = { categories, filters, smartRenameEnabled };
      const result = await window.electron.parseRule(query, currentConfig);
      if (result.success && result.data) {
        const { newCategories, updateCategories, updateFilters, smartRename } = result.data;
        if (newCategories || updateCategories) {
          setCategories(prev => {
            let next = [...prev];
            if (Array.isArray(newCategories)) {
              newCategories.forEach((nc: any) => {
                if (!nc) return;
                next.push({ id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, name: nc.name || "Custom Rule", enabled: true, extensions: nc.extensions || [], subfolders: nc.subfolders || false, smartCategorization: nc.smartCategorization || false, duplicateDetection: nc.duplicateDetection || false });
              });
            }
            if (Array.isArray(updateCategories)) {
              updateCategories.forEach((uc: any) => {
                if (!uc || !uc.id) return;
                const idx = next.findIndex(c => c.id === uc.id);
                if (idx !== -1) next[idx] = { ...next[idx], ...uc, id: next[idx].id, name: next[idx].name };
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
        if (smartRename !== undefined && smartRename !== null) setSmartRenameEnabled(smartRename);
        setNlFeedback({ type: "success", message: "Rules updated! Review your settings above." });
        setNlQuery("");
        setTimeout(() => setNlFeedback(null), 4000);
      } else {
        setNlFeedback({ type: "error", message: result.error || "AI couldn't process that. Try rephrasing." });
      }
    } catch (e) {
      console.error(e);
      setNlFeedback({ type: "error", message: "Couldn't reach AI. Add your Gemini API key in Preferences (⌘,)." });
    } finally {
      setNlSubmitting(false);
    }
  };

  // Insights sidebar
  const [insightsOpen, setInsightsOpen] = useState(false);

  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);

  const resetRules = () => {
    setCategories(INITIAL_CATEGORIES);
    setSearchQuery("");
    setDateModified("any");
    setFileSize("any");
    setExcludeHidden(false);
  };

  const handleUndo = async (operations: any[]) => {
    if (!window.electron || !window.electron.undoOrganize) return;
    setIsUndoing(true);
    try {
      const result = await window.electron.undoOrganize(operations);
      if (result.success) {
        showAlert(`Successfully reversed ${result.reverted} operations.`);
        setRunMetrics(prev => ({ ...prev, operations: [] }));
        setAuditLogOpen(false);
      } else {
        showAlert("Failed to undo some operations: " + result.errors + " errors.");
      }
    } catch (e) {
      console.error(e);
      showAlert("Undo failed");
    } finally {
      setIsUndoing(false);
    }
  };

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
        accentColor: "var(--system-purple)",
        items: fileItems,
      });
    }

    // Duplicates section
    if (hasDupDetection && counts.duplicates > 0) {
      insights.push({
        title: "Duplicates",
        icon: Copy,
        accentColor: "var(--system-orange)",
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
        accentColor: "var(--system-blue)",
        items: docItems,
      });
    }

    // Audio section
    if (categories.find(c => c.id === "audio")?.enabled && counts.audioMissingMeta > 0) {
      insights.push({
        title: "Audio",
        icon: Music,
        accentColor: "var(--system-orange)",
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
        accentColor: "var(--system-green)",
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

  // ─── Initial Load ──────────────────────────────────────────────────────────
  useEffect(() => {
    // 0. Fullscreen registration
    let cleanupFs: (() => void) | undefined;
    if (window.electron && (window.electron as any).onFullScreenChange) {
      cleanupFs = (window.electron as any).onFullScreenChange((isFull: boolean) => {
        setIsFullScreen(isFull);
      });
    }

    // 1. Metrics restoration
    const savedMetrics = localStorage.getItem("tidy_metrics");
    if (savedMetrics) {
      try {
        const parsed = JSON.parse(savedMetrics);
        if (parsed.timestamp) parsed.timestamp = new Date(parsed.timestamp);
        setRunMetrics(parsed);
      } catch (e) {
        console.warn("Failed to load metrics from localStorage", e);
      }
    }

    // 2. System Accent Color
    if (window.electron?.getAccentColor) {
      window.electron.getAccentColor().then((color: string | null) => {
        if (color) {
          // Electron returns color without # usually, or check if it starts with it
          const hex = color.startsWith('#') ? color : `#${color}`;
          document.documentElement.style.setProperty('--system-blue', hex);
        }
      });
    }

    return () => {
      if (cleanupFs) cleanupFs();
    };
  }, []);

  // ─── Restore source/dest paths from last session (Launching HIG) ─────────
  useEffect(() => {
    const savedSource = localStorage.getItem('tidy_source_path');
    const savedDest = localStorage.getItem('tidy_dest_path');
    if (savedSource) setSourcePath(savedSource);
    if (savedDest) setDestPath(savedDest);
  }, []);

  // Persist source/dest paths when they change
  useEffect(() => {
    if (sourcePath) localStorage.setItem('tidy_source_path', sourcePath);
  }, [sourcePath]);
  useEffect(() => {
    if (destPath) localStorage.setItem('tidy_dest_path', destPath);
  }, [destPath]);


  // ─── Run State ──────────────────────────────────────────────────────────────
  const [runState, setRunState] = useState<RunState>("idle");
  const [runProgress, setRunProgress] = useState(0);
  const [runMetrics, setRunMetrics] = useState<RunMetrics>({
    moved: 0, renamed: 0, duplicates: 0, errors: 0, timestamp: null, destPath: "", operations: [],
  });
  const [logEvents, setLogEvents] = useState<{ level: "info" | "warn" | "error" | "success"; message: string; time: string }[]>([]);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preview sheet visibility
  const [previewOpen, setPreviewOpen] = useState(false);

  // Opens the preview instead of running immediately
  const handleRunTidy = async () => {
    if (!sourcePath) {
      showAlert("Please select a source folder first.");
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

  // ─── Menu Action Listener ──────────────────────────────────────────────────
  useEffect(() => {
    if (!window.electron?.onMenuAction) return;

    const cleanup = window.electron.onMenuAction((action: string) => {
      switch (action) {
        case 'open-preferences':
          // Fire a custom DOM event — AccessibilityPanel listens for it to open.
          window.dispatchEvent(new CustomEvent('tidy:open-preferences'));
          break;
        case 'run-tidy':
          handleRunTidy();
          break;
        case 'reset-rules':
          resetRules();
          break;
        case 'open-source':
          window.electron.openDirectory().then((dir: string | null) => {
            if (dir) setSourcePath(dir);
          });
          break;
        case 'open-destination':
          window.electron.openDirectory().then((dir: string | null) => {
            if (dir) setDestPath(dir);
          });
          break;
        case 'toggle-insights':
          setInsightsOpen(prev => !prev);
          break;
        case 'toggle-audit':
          setAuditLogOpen(prev => !prev);
          break;
        case 'clear-search':
          setSearchQuery("");
          setSearchOpen(false);
          break;
        case 'undo-organize': {
          // Guard: if focus is inside a text-editable element, let the native
          // ⌘Z text undo pass through instead of triggering organize-undo.
          const active = document.activeElement as HTMLElement | null;
          const isTextEditable =
            active?.tagName === 'INPUT' ||
            active?.tagName === 'TEXTAREA' ||
            active?.isContentEditable;
          if (!isTextEditable) {
            const ops = runMetrics.operations;
            if (ops && ops.length > 0) {
              handleUndo(ops);
            }
          }
          break;
        }
      }
    });

    return cleanup;
  }, [sourcePath, destPath, categories, handleRunTidy]);

  // ─── Global Enter to Run Tidy ────────────────────────────────────────────────
  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
          const tagName = activeElement.tagName;
          if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'BUTTON' || activeElement.isContentEditable) {
            return;
          }
        }
        
        if (previewOpen || ruleBuilderOpen || insightsOpen || auditLogOpen || errorDialogOpen) {
            return;
        }

        e.preventDefault();
        handleRunTidy();
      }
    };
    
    window.addEventListener('keydown', handleGlobalEnter);
    return () => window.removeEventListener('keydown', handleGlobalEnter);
  }, [handleRunTidy, previewOpen, ruleBuilderOpen, insightsOpen, auditLogOpen, errorDialogOpen]);

  // ─── Cmd+Z Undo & Cmd+, Shortcut ─────────────────────────────────────────
  useEffect(() => {
    const handleUndoShortcut = (e: KeyboardEvent) => {
      // Cmd+Z — Undo last organize operation
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        const ops = runMetrics.operations;
        if (ops && ops.length > 0 && !previewOpen && !ruleBuilderOpen) {
          e.preventDefault();
          handleUndo(ops);
        }
      }
      // Cmd+, — Open Audit Log (Settings-adjacent per macOS HIG)
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setAuditLogOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleUndoShortcut);
    return () => window.removeEventListener('keydown', handleUndoShortcut);
  }, [runMetrics.operations, handleUndo, previewOpen, ruleBuilderOpen]);

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
      className="h-screen overflow-hidden relative selection:bg-[var(--system-blue)]/30 selection:text-white bg-[var(--mac-window-background)] text-foreground"
      style={{
        fontFamily: "var(--font-sf)",
      }}
    >
      {/* ── Accessibility: Skip to Main Content ── */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* ── Accessibility: VoiceOver Live Announcements ── */}
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {runState === "scanning" ? "Scanning files to organize..." : 
         runState === "running" ? `Organizing files... ${Math.round(runProgress)}% complete` : 
         runState === "completed" ? `Organization complete. Moved ${runMetrics.moved}, renamed ${runMetrics.renamed}, and found ${runMetrics.duplicates} duplicates.` : 
         runState === "error" ? `Organization finished with errors. ${runMetrics.errors} errors encountered.` : 
         nlSubmitting ? "AI is processing your request..." :
         nlFeedback?.type === "success" ? `AI success: ${nlFeedback.message}` :
         nlFeedback?.type === "error" ? `AI error: ${nlFeedback.message}` : ""}
      </div>

      {/* ── Top Bar Control Layer (Floating) ── */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <TopBar
          title="Tidy"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchOpen={searchOpen}
          onSearchOpenChange={setSearchOpen}
          runState={runState}
          progress={runProgress}
          onRunTidy={handleRunTidy}
          isFullScreen={isFullScreen}
        >
          <AccessibilityPanel isCompact />
          <AuditLogToggleButton
            isOpen={auditLogOpen}
            onClick={() => setAuditLogOpen(!auditLogOpen)}
            isCompact
          />
          <InsightsToggleButton
            isOpen={insightsOpen}
            onClick={() => setInsightsOpen(!insightsOpen)}
            isCompact
          />
        </TopBar>

        {/* HIG Loading Pattern: thin determinate progress bar */}
        <AnimatePresence>
          {(runState === "scanning" || runState === "running") && (
            <motion.div
              key="progress-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-[52px] left-0 right-0 h-[2px] bg-black/5 dark:bg-white/5 z-20 overflow-hidden"
              role="progressbar"
              aria-label={runState === "scanning" ? "Scanning files…" : "Organizing files…"}
              aria-valuenow={runState === "scanning" ? undefined : runProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {runState === "scanning" ? (
                /* Indeterminate shimmer while scanning (we don't have a count yet) */
                <motion.div
                  className="h-full w-1/3 bg-[var(--system-blue)] rounded-full"
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : (
                /* Determinate bar during actual run */
                <motion.div
                  className="h-full bg-[var(--system-blue)]"
                  style={{ width: `${runProgress}%` }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Full-Bleed Scrollable Content ── */}
      <main id="main-content" tabIndex={-1} className="h-full w-full overflow-auto scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--mac-focus-ring)]">
        <div className="w-full px-5 lg:px-10 xl:px-16 pt-16 pb-44 flex flex-col gap-6">
          {/* pt-16 accounts for TopBar (48px) + dynamic type/spacing */}
          {/* pb-44 accounts for Fixed Footer (60px) + content padding/breathing room */}
          {/* gap-8 provides better breathing room between major sections */}

          {/* ══ Section 1: Locations ══ */}
          <section aria-label="Locations" className="flex flex-col gap-3">
            <div className="flex items-center justify-between pl-1">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60">Locations</h2>
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
                    role="status"
                    aria-live="polite"
                    aria-label={`Source: ${sourcePath}, Destination: ${destPath}`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="w-5 h-5 rounded-md bg-[var(--system-blue)]/15 flex items-center justify-center shrink-0" aria-hidden="true">
                        <FolderOpen className="w-3 h-3 text-[var(--system-blue)]" />
                      </div>
                      <span className="text-[13px] text-foreground/75 dark:text-white/70 truncate">{sourcePath}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-foreground/40 shrink-0" aria-hidden="true" />
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                      <span className="text-[13px] text-foreground/75 dark:text-white/70 truncate text-right">{destPath}</span>
                      <div className="w-5 h-5 rounded-md bg-[var(--system-green)]/15 flex items-center justify-center shrink-0" aria-hidden="true">
                        <Folder className="w-3 h-3 text-[var(--system-green)]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="h-px w-full bg-black/[0.04] dark:bg-white/[0.04]" />

          {/* ══ Section 2: Smart Filters ══ */}
          <section aria-label="Filters" className="flex flex-col gap-3">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60">Smart Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Date Modified */}
              <div className={`${GLASS_CLS} p-4`} style={GLASS_STYLE}>
                <MacSelect
                  label="Date Modified"
                  value={dateModified}
                  onChange={(v) => setDateModified(v as any)}
                  options={[
                    { value: "any", label: "Any Time" },
                    { value: "today", label: "Today" },
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                    { value: "year", label: "This Year" },
                  ]}
                />
              </div>

              {/* File Size */}
              <div className={`${GLASS_CLS} p-4`} style={GLASS_STYLE}>
                <MacSelect
                  label="File Size"
                  value={fileSize}
                  onChange={(v) => setFileSize(v as any)}
                  options={[
                    { value: "any", label: "Any Size" },
                    { value: "small", label: "Small  (< 1 MB)" },
                    { value: "medium", label: "Medium  (1 MB – 100 MB)" },
                    { value: "large", label: "Large  (> 100 MB)" },
                  ]}
                />
              </div>

              {/* Exclude Hidden */}
              <div className={`${GLASS_CLS} p-4 flex items-center justify-between gap-4`} style={GLASS_STYLE}>
                <div className="min-w-0">
                  <p className="text-[14px] text-foreground/90" id="exclude-hidden-label">Exclude Hidden</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5" id="exclude-hidden-desc">Skip dot-files (e.g. .DS_Store)</p>
                </div>
                <MacToggle checked={excludeHidden} onCheckedChange={setExcludeHidden} aria-labelledby="exclude-hidden-label" aria-describedby="exclude-hidden-desc" />
              </div>

            </div>
          </section>

          <div className="h-px w-full bg-black/[0.04] dark:bg-white/[0.04]" />

          {/* ══ Section 3: Automated Rules ══ */}
          <section aria-label="File Rules" className="flex flex-col gap-3">
            <div className="flex items-center justify-between pl-1">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60">Automated Rules</h2>
              <span className="text-[13px] text-muted-foreground">
                {searchMatches
                  ? `${searchMatches.size} matching`
                  : `${categories.filter((c) => c.enabled).length} active`}
              </span>
            </div>

            {/* ── AI Features Strip ── */}
            <div
              className="flex flex-wrap items-center gap-2 px-1"
              role="group"
              aria-label="AI-powered features"
            >
              {/* Strip header label */}
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--system-purple)]/60 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                AI
              </span>

              {/* Smart Rename chip */}
              <button
                id="ai-smart-rename-chip"
                onClick={() => setSmartRenameEnabled(v => !v)}
                aria-pressed={smartRenameEnabled}
                title="Use AI to generate better file names based on content and metadata"
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border-[0.5px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
                  smartRenameEnabled
                    ? "bg-[var(--system-purple)]/15 border-[var(--system-purple)]/30 text-[var(--system-purple)] font-medium"
                    : "bg-black/5 dark:bg-white/[0.06] border-black/10 dark:border-white/10 text-foreground/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
                )}
              >
                <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
                Smart Rename
                {smartRenameEnabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--system-purple)] ml-0.5" aria-label="active" />
                )}
              </button>

              {/* Smart Categorization chip (global toggle for all categories) */}
              <button
                id="ai-smart-cat-chip"
                onClick={() => {
                  const anyOn = categories.some(c => c.smartCategorization);
                  setCategories(prev => prev.map(c => ({ ...c, smartCategorization: !anyOn })));
                }}
                aria-pressed={categories.some(c => c.smartCategorization)}
                title="Use AI to sort files into smart content-based subfolders (e.g. Screenshots, Invoices)"
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border-[0.5px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
                  categories.some(c => c.smartCategorization)
                    ? "bg-[var(--system-purple)]/15 border-[var(--system-purple)]/30 text-[var(--system-purple)] font-medium"
                    : "bg-black/5 dark:bg-white/[0.06] border-black/10 dark:border-white/10 text-foreground/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
                )}
              >
                <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
                Smart Sort
                {categories.some(c => c.smartCategorization) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--system-purple)] ml-0.5" aria-label="active" />
                )}
              </button>

              {/* Duplicate Detection chip (global toggle) */}
              <button
                id="ai-dup-detect-chip"
                onClick={() => {
                  const anyOn = categories.some(c => c.duplicateDetection);
                  setCategories(prev => prev.map(c => ({ ...c, duplicateDetection: !anyOn })));
                }}
                aria-pressed={categories.some(c => c.duplicateDetection)}
                title="Detect and handle duplicate files across all categories"
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border-[0.5px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
                  categories.some(c => c.duplicateDetection)
                    ? "bg-[var(--system-blue)]/15 border-[var(--system-blue)]/30 text-[var(--system-blue)] font-medium"
                    : "bg-black/5 dark:bg-white/[0.06] border-black/10 dark:border-white/10 text-foreground/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
                )}
              >
                <Copy className="w-3 h-3 shrink-0" aria-hidden="true" />
                Find Duplicates
                {categories.some(c => c.duplicateDetection) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--system-blue)] ml-0.5" aria-label="active" />
                )}
              </button>
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
                          "group transition-all duration-200 relative overflow-hidden",
                          !isSearchHit && "opacity-30 pointer-events-none",
                          searchMatches && isSearchHit && "ring-1 ring-[var(--system-blue)]/25"
                        )}
                        style={GLASS_STYLE}
                      >
                        <FilterCard
                          label={category.name}
                          count={`${category.extensions.length} types`}
                          icon={CATEGORY_ICONS[category.id] || Folder}
                          color={CATEGORY_COLORS[category.id]}
                          enabled={category.enabled}
                          expanded={isExpanded}
                          onExpandToggle={() => handleExpandToggle(category.id)}
                          onToggle={(enabled) => handleCategoryToggle(category.id, enabled)}
                        />

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              key={`expanded-${category.id}`}
                              id={`toggle-${category.name.replace(/\s+/g, "-").toLowerCase()}-content`}
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
                                  <label className="text-[14px] text-muted-foreground">Create Subfolders</label>
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
                                    <label className="text-[14px] text-muted-foreground">Smart Categorization</label>
                                    <p className="text-[12px] text-foreground/40" title="Group files by detected content type (e.g., Screenshots, Photos, Scans). Preview before applying.">
                                      Advanced categorization with AI
                                    </p>
                                  </div>
                                  <MacToggle
                                    checked={!!category.smartCategorization}
                                    onCheckedChange={(v) => handleSmartCategorizationToggle(category.id, v)}
                                    disabled={!category.enabled}
                                    color="purple"
                                    size="sm"
                                  />
                                </div>

                                {/* Duplicate Detection */}
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col gap-0.5">
                                    <label className="text-[14px] text-muted-foreground">Duplicate Detection</label>
                                    <p className="text-[12px] text-foreground/40" title="Identify and handle duplicate files. Preview before applying.">
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
                                    <label className="text-[13px] text-muted-foreground block mb-2">
                                      {category.smartCategorization ? "Content Types" : "By Extension"}
                                    </label>
                                    <div
                                      className="p-2.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border-[0.5px] border-black/5 dark:border-white/[0.06]"
                                    >
                                      <div className="flex items-start gap-1.5">
                                        <Folder className="w-3 h-3 text-foreground/30 shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[13px] text-foreground/70 mb-1">{category.name}</p>
                                          <div className="pl-3 space-y-0.5">
                                            {category.smartCategorization ? (
                                              // Show content-based subfolders
                                              SMART_SUBFOLDERS[category.id]?.map((subfolder) => (
                                                <div key={subfolder} className="flex items-center gap-1.5">
                                                  <div className="w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
                                                  <span className="text-[12px] text-foreground/40">{subfolder}</span>
                                                </div>
                                              ))
                                            ) : (
                                              // Show extension-based subfolders (first 4)
                                              category.extensions.slice(0, 4).map((ext) => (
                                                <div key={ext} className="flex items-center gap-1.5">
                                                  <div className="w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
                                                  <span className="text-[12px] text-foreground/40 font-mono">.{ext}</span>
                                                </div>
                                              ))
                                            )}
                                            {!category.smartCategorization && category.extensions.length > 4 && (
                                              <div className="flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
                                                <span className="text-[11px] text-foreground/30 dark:text-white/25 font-mono">+{category.extensions.length - 4} more</span>
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
                                  <label className="text-[13px] text-muted-foreground block mb-2">Extensions</label>
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
                                            "px-2.5 py-1 text-[12px] rounded-[8px] border-[0.5px] transition-all",
                                            isSelected && category.enabled
                                              ? "bg-[var(--system-blue)]/15 border-[var(--system-blue)]/30 text-[var(--system-blue)] hover:bg-[var(--system-blue)]/22"
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

          {/* ══ AI Command Bar — Inline Natural Language Input ══ */}
          <section aria-label="Ask Tidy AI">
            <div
              className={clsx(
                "rounded-xl border-[0.5px] transition-all duration-200 overflow-hidden",
                nlSubmitting
                  ? "bg-[var(--system-purple)]/[0.08] dark:bg-[var(--system-purple)]/[0.13] border-[var(--system-purple)]/30"
                  : nlFeedback?.type === "success"
                  ? "bg-[var(--system-green)]/[0.07] dark:bg-[var(--system-green)]/[0.12] border-[var(--system-green)]/25"
                  : nlFeedback?.type === "error"
                  ? "bg-red-500/[0.06] dark:bg-red-500/[0.10] border-red-500/20"
                  : "bg-[var(--system-purple)]/[0.06] dark:bg-[var(--system-purple)]/[0.10] border-[var(--system-purple)]/15 focus-within:border-[var(--system-purple)]/35 focus-within:bg-[var(--system-purple)]/[0.09]"
              )}
            >
              {/* Header row */}
              <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-0">
                {/* Icon */}
                <div className={clsx(
                  "w-6 h-6 rounded-[7px] flex items-center justify-center shrink-0 transition-colors",
                  nlSubmitting
                    ? "bg-[var(--system-purple)]/20"
                    : nlFeedback?.type === "success"
                    ? "bg-[var(--system-green)]/20"
                    : nlFeedback?.type === "error"
                    ? "bg-red-500/15"
                    : "bg-[var(--system-purple)]/12 dark:bg-[var(--system-purple)]/20"
                )}>
                  {nlSubmitting ? (
                    <div className="w-3 h-3 border-[1.5px] border-[var(--system-purple)]/30 border-t-[var(--system-purple)] rounded-full animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles
                      className={clsx(
                        "w-3 h-3",
                        nlFeedback?.type === "success" ? "text-[var(--system-green)]" : nlFeedback?.type === "error" ? "text-red-500" : "text-[var(--system-purple)]"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Label + AI badge */}
                <span className="text-[12px] font-semibold text-foreground/70 dark:text-white/60 flex-1">
                  {nlSubmitting ? "AI is thinking…" : nlFeedback?.type === "success" ? "Done!" : nlFeedback?.type === "error" ? "Couldn't process" : "Ask Tidy AI"}
                </span>
                <span
                  className="flex items-center gap-[3px] text-[9px] font-bold uppercase tracking-wider text-[var(--system-purple)]/60 bg-[var(--system-purple)]/10 px-1.5 py-0.5 rounded-sm border border-[var(--system-purple)]/20"
                  aria-label="Powered by AI"
                >
                  <Sparkles className="w-2 h-2" aria-hidden="true" />
                  AI
                </span>
              </div>

              {/* Feedback message */}
              <AnimatePresence>
                {nlFeedback && (
                  <motion.p
                    key={nlFeedback.message}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className={clsx(
                      "px-4 pt-2 text-[12px] leading-relaxed",
                      nlFeedback.type === "success" ? "text-[var(--system-green)]" : "text-red-500"
                    )}
                  >
                    {nlFeedback.message}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Textarea row */}
              <div className="flex items-end gap-2 px-3 pt-2 pb-3">
                <label htmlFor="nl-inline-input" className="sr-only">Describe what you'd like Tidy to do</label>
                <textarea
                  ref={nlInputRef}
                  id="nl-inline-input"
                  value={nlQuery}
                  onChange={e => { setNlQuery(e.target.value); setNlFeedback(null); }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleInlineNlSubmit();
                    }
                  }}
                  placeholder="e.g. Move all PDFs older than a year to Archive, rename my screenshots by date…"
                  disabled={nlSubmitting}
                  rows={2}
                  aria-label="Natural language rule input — press Enter to apply"
                  className="flex-1 bg-transparent text-[13px] text-foreground/85 dark:text-white/85 placeholder:text-foreground/35 dark:placeholder:text-white/30 resize-none focus:outline-none leading-relaxed disabled:opacity-50 min-h-[40px] max-h-[120px]"
                />
                {/* Send button */}
                <button
                  id="nl-send-btn"
                  onClick={() => handleInlineNlSubmit()}
                  disabled={!nlQuery.trim() || nlSubmitting}
                  aria-label="Apply AI rule"
                  className={clsx(
                    "shrink-0 w-8 h-8 rounded-[9px] flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
                    nlQuery.trim() && !nlSubmitting
                      ? "bg-[var(--system-purple)] text-white hover:opacity-90 active:scale-95 shadow-sm shadow-[var(--system-purple)]/25"
                      : "bg-black/[0.06] dark:bg-white/[0.06] text-foreground/30 dark:text-white/30 cursor-not-allowed"
                  )}
                >
                  {/* Arrow-up send icon */}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 10V2M2 6l4-4 4 4" />
                  </svg>
                </button>
              </div>

              {/* Quick-fill example chips */}
              {!nlQuery && !nlSubmitting && !nlFeedback && (
                <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                  {[
                    "Move old PDFs to Archive",
                    "Organize screenshots by date",
                    "Find and remove duplicates",
                    "Rename files with smart names",
                  ].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => { setNlQuery(chip); nlInputRef.current?.focus(); }}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--system-purple)]/08 dark:bg-[var(--system-purple)]/12 text-[var(--system-purple)]/70 border border-[var(--system-purple)]/15 hover:bg-[var(--system-purple)]/15 hover:text-[var(--system-purple)] transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Footer hint */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--system-purple)]/10">
                <p className="text-[11px] text-foreground/40 dark:text-white/30">
                  {nlSubmitting ? "Processing your request with AI…" : "Press Enter to apply · Shift+Enter for new line"}
                </p>
                <button
                  onClick={() => setRuleBuilderOpen(true)}
                  className="text-[11px] text-[var(--system-purple)]/60 hover:text-[var(--system-purple)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--mac-focus-ring)] rounded"
                >
                  Advanced editor ›
                </button>
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-black/[0.04] dark:bg-white/[0.04]" />

          {/* ══ Section 4: Schedule & Policy ══ */}
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
      
      {/* ── Fixed Status Bar Footer (Floating Control Layer) ── */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08] px-6 py-2">
        <StatusBar
          runState={runState}
          metrics={runMetrics}
          logEvents={logEvents}
        />
      </footer>

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



      {/* ── Natural Language Rule Builder ── */}
      <NaturalLanguageRuleBuilder
        isOpen={ruleBuilderOpen}
        onClose={() => setRuleBuilderOpen(false)}
        onSave={async (rule) => {
          if (!window.electron?.parseRule) {
            showAlert("The AI Rule Builder relies on the local file system and is only available in the Desktop App.");
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
              showAlert("AI was unable to process your rule: " + result.error);
            }
          } catch (e) {
            console.error(e);
            showAlert("Error communicating with AI parser. Add your Gemini API key in Preferences (⌘,).");
          }
        }}
      />

      {/* ── Insights Sidebar ── */}
      <InsightsSidebar
        isOpen={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        insights={dynamicInsights}
      />

      {/* ── Audit Log Sidebar ── */}
      <AuditLogSidebar
        isOpen={auditLogOpen}
        onClose={() => setAuditLogOpen(false)}
        operations={runMetrics.operations}
        lastRunTime={runMetrics.timestamp}
        onUndo={handleUndo}
        isUndoing={isUndoing}
      />

      {/* ── Alert Dialog ── */}
      <AlertDialog.Root open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[101] -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-[14px] bg-background/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl p-6 text-center focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95" style={{ fontFamily: "var(--font-sf)" }}>
            <AlertDialog.Title className="text-[15px] font-bold text-foreground dark:text-white mb-2">Notice</AlertDialog.Title>
            <AlertDialog.Description className="text-[13px] text-foreground/70 dark:text-white/70 mb-6 leading-relaxed">
              {errorMessage}
            </AlertDialog.Description>
            <AlertDialog.Action asChild>
              <button className="w-full h-9 flex items-center justify-center rounded-[8px] bg-[var(--system-blue)] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-background">
                OK
              </button>
            </AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      <Toaster position="top-center" richColors />
    </div>
  );
}