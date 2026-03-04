import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Sparkles, AlertTriangle, Play, CheckCircle2,
  ChevronRight, ArrowRight, Copy, Check, Search, Filter, Settings, Info,
  FileText, Image as ImageIcon, Music, Video, Archive, Folder,
  LucideIcon
} from "lucide-react";
import { clsx } from "clsx";
import type { Category } from "../lib/generateScript";
import type { RunState, RunMetrics } from "./StatusBar";
import type { PreviewFile, SmartRenameInfo } from "../../electron.d.ts";

// ─── Types ────────────────────────────────────────────────────────────────────
type ClassSource = "extension" | "metadata" | "ai";
type Confidence = "high" | "medium" | "low";

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const CAT_ICON: Record<string, LucideIcon> = {
  documents: FileText,
  images: ImageIcon,
  audio: Music,
  video: Video,
  archives: Archive,
};

const CAT_COLOR: Record<string, string> = {
  documents: "#007AFF",
  images: "#AF52DE",
  audio: "#34C759",
  video: "#FF9500",
  archives: "#FFD60A",
};

const CONFIDENCE_CFG = {
  high: { label: "High", color: "text-[#32D74B]", bg: "bg-[#32D74B]/10", border: "rgba(50,215,75,0.22)", tip: "Strong match based on content and metadata" },
  medium: { label: "Medium", color: "text-amber-400", bg: "bg-amber-400/10", border: "rgba(255,159,10,0.22)", tip: "Partial match, recommended review" },
  low: { label: "Low", color: "text-rose-400", bg: "bg-rose-400/10", border: "rgba(255,69,58,0.22)", tip: "Low confidence, requires verification" },
};

function FileIcon({ ext, className }: { ext: string; className?: string }) {
  const e = ext.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "heic", "psd"].includes(e)) return <ImageIcon className={className} />;
  if (["mp3", "wav", "m4a", "flac"].includes(e)) return <Music className={className} />;
  if (["mp4", "mov", "avi", "mkv"].includes(e)) return <Video className={className} />;
  if (["zip", "rar", "7z", "tar", "gz"].includes(e)) return <Archive className={className} />;
  return <FileText className={className} />;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function ConfidenceChip({ confidence }: { confidence: Confidence }) {
  const cfg = CONFIDENCE_CFG[confidence];
  return (
    <span title={cfg.tip}
      className={clsx("px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider border", cfg.color, cfg.bg)}
      style={{ borderColor: cfg.border }}>
      {cfg.label}
    </span>
  );
}

function FileRow({
  file, keepOriginal, onToggleKeep,
  smartRenameEnabled, accepted, onToggleAccept,
  dimmed = false,
  categoryConfig,
}: {
  file: PreviewFile;
  keepOriginal: boolean;
  onToggleKeep: () => void;
  smartRenameEnabled?: boolean;
  accepted?: boolean;
  onToggleAccept?: (id: string) => void;
  dimmed?: boolean;
  categoryConfig?: Category;
}) {
  const classSrc = file.classSource || "extension";
  const conf = file.confidence || "high";

  return (
    <div className={clsx(
      "group flex flex-col px-5 py-3.5 transition-colors border-b border-white/[0.04]",
      dimmed ? "opacity-40 grayscale-[0.5]" : "hover:bg-white/[0.02]"
    )}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-[10px] bg-black/5 dark:bg-white/[0.06] border-[0.5px] border-black/10 dark:border-white/[0.08] flex items-center justify-center shrink-0">
            <FileIcon ext={file.ext} className="w-4 h-4 text-foreground/80 dark:text-white/80" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] text-foreground/90 dark:text-white/82 font-medium truncate">{file.name}</span>
            <span className="text-[10px] text-muted-foreground dark:text-white/22 mt-0.5">{file.from}</span>
          </div>
        </div>

        {/* Destination / Duplicate Status */}
        <div className="w-[140px] hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] bg-black/[0.03] border border-black/[0.05] dark:bg-white/[0.03] dark:border-white/[0.05]">
          {file.isDuplicate ? (
            <span className="text-[10px] text-rose-500 dark:text-rose-400/80 truncate font-semibold" title={`Duplicate of: ${file.duplicateOf || 'unknown'}`}>
              → Match: <span className="text-foreground/50 dark:text-white/42">{file.duplicateOf || 'Original'}</span>
            </span>
          ) : file.smartRename && (conf === "medium" || conf === "low") ? (
            <span className="text-[11px] text-amber-500 dark:text-amber-400/80 truncate font-semibold" title="Needs Review Routing">Review</span>
          ) : (
            <span className="text-[11px] text-foreground/50 dark:text-white/42 truncate capitalize" title={file.category}>{file.category}</span>
          )}

          {!file.isDuplicate && (
            <>
              <ChevronRight className="w-2.5 h-2.5 text-foreground/20 dark:text-white/12 shrink-0" />
              <span className="text-[11px] text-foreground/80 dark:text-white/68 font-medium truncate" title={categoryConfig?.smartCategorization && file.smartRename?.subfolder ? file.smartRename.subfolder : file.ext}>
                {categoryConfig?.smartCategorization && file.smartRename?.subfolder ? file.smartRename.subfolder : file.ext}
              </span>
            </>
          )}
        </div>

        {/* Source info (Extension/AI) */}
        {!file.isDuplicate && (
          <div className="w-[80px] hidden lg:flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-white/22 uppercase tracking-tight font-semibold">{classSrc}</span>
              <ConfidenceChip confidence={conf} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {file.smartRename && (
            <button
              onClick={() => onToggleAccept && onToggleAccept(file.id)}
              className={clsx(
                "w-7 h-7 flex items-center justify-center rounded-full transition-all",
                accepted ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-black/5 dark:bg-white/[0.05] text-foreground/40 dark:text-white/28 hover:bg-black/10 dark:hover:bg-white/[0.1] hover:text-foreground/70 dark:hover:text-white/42"
              )}
              title={accepted ? "Accepted" : "Accept Suggestion"}
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onToggleKeep}
            className={clsx(
              "w-7 h-7 flex items-center justify-center rounded-full transition-all",
              keepOriginal ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-black/5 dark:bg-white/[0.05] text-foreground/40 dark:text-white/28 hover:bg-black/10 dark:hover:bg-white/[0.1] hover:text-foreground/70 dark:hover:text-white/42"
            )}
            title={keepOriginal ? "Keeping original" : "Move only"}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggestion label + diff */}
      {file.smartRename && (
        <div className="flex flex-col mt-2 ml-11 gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-[3px] text-[10px] text-purple-300/50 shrink-0 bg-purple-500/10 px-1.5 py-0.5 rounded-sm">
              <Sparkles className="w-2.5 h-2.5" />AI
            </span>
            <ArrowRight className="w-2.5 h-2.5 text-white/14 shrink-0" />
            <span
              className="text-[11px] text-purple-300/82 font-medium truncate"
              title={file.smartRename.suggested}
            >
              {file.smartRename.suggested}
            </span>
          </div>
          {file.smartRename.reason && (
            <span className="text-[10px] text-white/40 leading-snug max-w-[90%]">
              💡 {file.smartRename.reason}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ColHeaders({ smartRenameEnabled }: { smartRenameEnabled: boolean }) {
  return (
    <div className="flex items-center gap-4 px-5 py-2 shrink-0 bg-black/[0.02] dark:bg-white/[0.015] border-b-[0.5px] border-black/5 dark:border-white/[0.04]">
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white/18">File</span>
      <span className="w-[140px] hidden md:block text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white/18">Destination</span>
      <span className="w-[80px] hidden lg:block text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white/18">Match</span>
      <div className="w-[68px]" />
    </div>
  );
}

function BulkRenameBar({
  files, acceptedRenames, onApplyAll, onRevertAll,
}: {
  files: PreviewFile[];
  acceptedRenames: Record<string, boolean>;
  onApplyAll: () => void;
  onRevertAll: () => void;
}) {
  const smartCount = files.filter(f => f.smartRename).length;
  if (smartCount === 0) return null;

  return (
    <div className="px-5 py-2.5 bg-purple-500/5 border-b border-purple-500/10 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[11px] text-purple-200/62">
          AI Suggested {smartCount} smart renames
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onRevertAll} className="text-[10px] text-foreground/40 dark:text-white/32 hover:text-foreground/80 dark:hover:text-white/60 transition-colors capitalize">Revert All</button>
        <button onClick={onApplyAll} className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-500 dark:hover:text-purple-300 transition-colors capitalize">Apply All Suggestions</button>
      </div>
    </div>
  );
}

function ReviewSection({
  files, overrides, onOverride, categories,
  smartRenameEnabled, acceptedRenames, onToggleAccept,
}: {
  files: PreviewFile[];
  overrides: Record<string, string>;
  onOverride: (id: string, dest: string) => void;
  categories: Category[];
  smartRenameEnabled?: boolean;
  acceptedRenames?: Record<string, boolean>;
  onToggleAccept?: (id: string) => void;
}) {
  return (
    <div className="mt-6 px-5 pb-8 shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground dark:text-white/32">Needs Review ({files.length})</h3>
      </div>

      <div className="space-y-3">
        {files.map(file => (
          <div key={file.id} className="p-3 bg-black/[0.03] dark:bg-white/[0.03] rounded-lg border border-black/5 dark:border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-foreground/90 dark:text-white/82 font-medium truncate">{file.name}</span>
              <span className="text-[9px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider bg-rose-500/10 px-1.5 py-0.5 rounded-sm border border-rose-500/20">Conflict</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="flex-1 bg-black/5 dark:bg-white/[0.05] border border-black/10 dark:border-white/[0.1] rounded-md px-2 py-1 text-[11px] text-foreground/80 dark:text-white/62 outline-none focus:border-blue-500/50"
                onChange={(e) => onOverride(file.id, e.target.value)}
                value={overrides[file.id] || file.category}
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RunningMessage() {
  return (
    <div className="py-6 flex flex-col items-center justify-center shrink-0">
      <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-4" />
      <p className="text-[13px] text-foreground/70 dark:text-white/62 font-medium">Tidying your files...</p>
      <p className="text-[11px] text-muted-foreground dark:text-white/22 mt-1">This may take a moment depending on file size</p>
    </div>
  );
}

function SummaryStrip({
  files, runState, progress, smartRenameEnabled, acceptedRenameCount,
}: {
  files: PreviewFile[];
  runState: RunState;
  progress: number;
  smartRenameEnabled?: boolean;
  acceptedRenameCount?: number;
}) {
  const renameCount = smartRenameEnabled ? (acceptedRenameCount ?? 0) : 0;
  const reviewCount = files.filter(f => f.needsReview).length;
  const isRunning = runState === "running";

  return (
    <div className="flex items-center gap-5 px-5 py-3 shrink-0 bg-black/[0.02] dark:bg-white/[0.02] border-b-[0.5px] border-black/5 dark:border-white/[0.06]">
      <div className="flex items-center gap-1.5">
        <ArrowRight className="w-3 h-3 text-muted-foreground dark:text-white/22" />
        <span className="text-[12px] text-foreground/90 dark:text-white/82 font-medium">{files.length}</span>
        <span className="text-[11px] text-muted-foreground dark:text-white/32">to move</span>
      </div>
      {renameCount > 0 && (
        <div className="flex items-center gap-1.5">
          <Copy className="w-3 h-3 text-muted-foreground dark:text-white/22" />
          <span className="text-[12px] text-foreground/90 dark:text-white/82 font-medium">{renameCount}</span>
          <span className="text-[11px] text-muted-foreground dark:text-white/32">to rename</span>
        </div>
      )}
      {reviewCount > 0 && (
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-500/42" />
          <span className="text-[12px] text-amber-600 dark:text-amber-500/82 font-medium">{reviewCount}</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-500/42">needs review</span>
        </div>
      )}

      {isRunning && (
        <div className="ml-auto w-32 flex flex-col gap-1.5">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider">
            <span className="text-muted-foreground dark:text-white/22">Progress</span>
            <span className="text-blue-500 dark:text-blue-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 rounded-full bg-black/5 dark:bg-white/[0.06] overflow-hidden">
            <motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function CompletionView({ metrics, onClose, runState }: { metrics: RunMetrics; onClose: () => void; runState: RunState }) {
  const isError = runState === "error";
  const [undoStatus, setUndoStatus] = useState<"idle" | "undoing" | "done">("idle");

  const handleUndo = async () => {
    if (!window.electron || !metrics.operations || metrics.operations.length === 0) return;
    setUndoStatus("undoing");
    const result = await window.electron.undoOrganize(metrics.operations);
    if (result.success) {
      setUndoStatus("done");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } else {
      alert("Undo failed. Some files might not have been restored.");
      setUndoStatus("idle");
    }
  };

  const handleOpenDest = async () => {
    if (window.electron && metrics.destPath) {
      await window.electron.openFolder(metrics.destPath);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <div className="flex flex-col items-center justify-center shrink-0 mb-8">
        {isError ? (
          <AlertTriangle className="w-16 h-16 text-rose-500 mb-6 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]" />
        ) : (
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
        )}

        <h2 className="text-[20px] font-semibold text-foreground/90 dark:text-white/92 mb-2">
          {undoStatus === "done" ? "Undo Complete" : isError ? "Something went wrong" : "Tidy Complete!"}
        </h2>
        <p className="text-[13px] text-muted-foreground dark:text-white/32 mb-6 text-center max-w-[280px]">
          {undoStatus === "done" ? "Files were restored to their original locations." : isError ? "The organization process encountered an error. Some files may not have been moved."
            : "Your workspace is now beautifully organized. Let's keep it that way!"}
        </p>

        {!isError && undoStatus !== "done" && (
          <div className="grid grid-cols-2 gap-4 w-full max-w-[320px] mb-8">
            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/[0.06] flex flex-col items-center">
              <span className="text-[24px] font-bold text-foreground/90 dark:text-white/92 leading-none">{metrics.moved}</span>
              <span className="text-[10px] text-muted-foreground dark:text-white/22 font-bold uppercase tracking-widest mt-2 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/[0.04]">Moved</span>
            </div>
            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/[0.06] flex flex-col items-center">
              <span className="text-[24px] font-bold text-foreground/90 dark:text-white/92 leading-none">{metrics.renamed}</span>
              <span className="text-[10px] text-muted-foreground dark:text-white/22 font-bold uppercase tracking-widest mt-2 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/[0.04]">Renamed</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isError && undoStatus !== "done" && (
          <div className="flex items-center gap-3">
            {metrics.operations && metrics.operations.length > 0 && (
              <button
                onClick={handleUndo}
                disabled={undoStatus !== "idle"}
                className="px-6 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-white/70 text-[13px] font-medium hover:bg-white/[0.1] hover:text-white active:scale-95 transition-all disabled:opacity-50"
              >
                {undoStatus === "undoing" ? "Undoing..." : "Undo Changes"}
              </button>
            )}
            {metrics.destPath && (
              <button
                onClick={handleOpenDest}
                className="px-6 py-2.5 rounded-full bg-[#0A84FF] text-white text-[13px] font-bold hover:bg-[#0A84FF]/90 active:scale-95 transition-all shadow-[0_4px_12px_rgba(10,132,255,0.3)]"
              >
                Open Destination
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-foreground text-background dark:bg-white dark:text-black text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
            >
              Done
            </button>
          </div>
        )}

        {(isError || undoStatus === "done") && (
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-full bg-foreground text-background dark:bg-white dark:text-black text-[14px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
          >
            Done
          </button>
        )}
      </div>

      {/* Operations List */}
      {!isError && undoStatus !== "done" && metrics.operations && metrics.operations.length > 0 && (
        <div className="flex-1 mt-4 max-w-2xl mx-auto w-full">
          <h3 className="text-[12px] text-muted-foreground dark:text-white/40 uppercase tracking-wider font-semibold mb-3">Operations Recap</h3>
          <div className="flex flex-col gap-2 relative z-0">
            {metrics.operations.map((op, i) => {
              const ext = op.originalName.split('.').pop() || '';
              const iconColorCls = "text-muted-foreground dark:text-white/40"; // Default

              return (
                <div key={i} className="flex items-center p-3 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/[0.04] group hover:bg-black/10 dark:hover:bg-white/[0.04] transition-colors relative">
                  <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mr-3 border border-black/5 dark:border-white/[0.08]">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${iconColorCls}`}>
                      {ext.substring(0, 3)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[13px] text-foreground/90 dark:text-white/92 font-medium truncate" title={op.originalName}>
                        {op.originalName}
                      </span>
                    </div>
                    {op.originalName !== op.newName ? (
                      <div className="flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-[11px] text-emerald-400/90 truncate font-mono bg-emerald-400/10 px-1 rounded-sm" title={op.newName}>{op.newName}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground dark:text-white/30 truncate" title="No rename">No rename</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center pl-2 ml-auto border-l-[0.5px] border-black/10 dark:border-white/[0.06]">
                    <p className="text-[11px] text-muted-foreground dark:text-white/40 font-mono w-[180px] truncate text-right px-2" title={op.newPath.replace(metrics.destPath || '', '')}>
                      {op.newPath.replace(metrics.destPath || '', '')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BottomBar({ onClose, onConfirm, isRunning }: { onClose: () => void; onConfirm: () => void; isRunning: boolean }) {
  return (
    <div className="px-5 py-4 shrink-0 flex items-center justify-between bg-black/5 dark:bg-black/20 border-t-[0.5px] border-black/10 dark:border-white/[0.06]">
      <button onClick={onClose} disabled={isRunning}
        className="px-4 py-2 rounded-lg text-[13px] text-muted-foreground dark:text-white/32 hover:text-foreground dark:hover:text-white/62 transition-colors disabled:opacity-20">
        Cancel
      </button>
      <button onClick={onConfirm} disabled={isRunning}
        className="px-6 py-2.5 rounded-full bg-blue-500 text-white text-[13px] font-bold hover:bg-blue-400 active:scale-95 transition-all shadow-[0_4px_12px_rgba(10,132,255,0.3)] disabled:opacity-20 flex items-center gap-2">
        <Play className="w-3.5 h-3.5 fill-current" />
        {isRunning ? "Running..." : "Confirm & Run"}
      </button>
    </div>
  );
}

// ─── PreviewSheet (main export) ───────────────────────────────────────────────

export interface PreviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sheetData?: { renames?: Record<string, { suggested: string, confidence: string }> }) => void;
  categories: Category[];
  runState: RunState;
  runMetrics: RunMetrics;
  runProgress: number;
  files: PreviewFile[];
  smartRenameEnabled?: boolean;
}

export function PreviewSheet({
  isOpen, onClose, onConfirm, categories,
  runState, runMetrics, runProgress, files = [],
  smartRenameEnabled = false,
}: PreviewSheetProps) {
  const [keepOriginals, setKeepOriginals] = useState<Record<string, boolean>>({});
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [acceptedRenames, setAcceptedRenames] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (files.length > 0) {
      const init: Record<string, boolean> = {};
      files.forEach(f => {
        if (f.smartRename) init[f.id] = f.smartRename.confidence === "high";
      });
      setAcceptedRenames(init);
    }
  }, [files]);

  const enabledIds = useMemo(() => new Set(categories.filter(c => c.enabled).map(c => c.id)), [categories]);
  const visibleFiles = useMemo(() => files.filter(f => enabledIds.has(f.category)), [files, enabledIds]);

  const duplicateFiles = useMemo(() => visibleFiles.filter(f => f.isDuplicate), [visibleFiles]);
  const nonDuplicateFiles = useMemo(() => visibleFiles.filter(f => !f.isDuplicate), [visibleFiles]);

  const regularFiles = useMemo(() => nonDuplicateFiles.filter(f => !f.smartRename || f.smartRename.confidence === "high"), [nonDuplicateFiles]);
  const reviewFiles = useMemo(() => nonDuplicateFiles.filter(f => f.smartRename && (f.smartRename.confidence === "medium" || f.smartRename.confidence === "low")), [nonDuplicateFiles]);

  const acceptedRenameCount = useMemo(
    () => files.filter(f => f.smartRename && acceptedRenames[f.id]).length,
    [files, acceptedRenames]
  );

  const isRunning = runState === "running";
  const isDone = runState === "completed" || runState === "error";

  const toggleKeep = (id: string) => setKeepOriginals(p => ({ ...p, [id]: !p[id] }));
  const handleOverride = (id: string, dest: string) => setOverrides(p => ({ ...p, [id]: dest }));
  const toggleAccept = (id: string) => setAcceptedRenames(p => ({ ...p, [id]: !p[id] }));

  const applyAll = () => {
    const next: Record<string, boolean> = {};
    files.forEach(f => { if (f.smartRename) next[f.id] = true; });
    setAcceptedRenames(p => ({ ...p, ...next }));
  };
  const revertAll = () => {
    const next: Record<string, boolean> = {};
    files.forEach(f => { if (f.smartRename) next[f.id] = false; });
    setAcceptedRenames(p => ({ ...p, ...next }));
  };

  const confirmAndRun = () => {
    const renamesToApply: Record<string, { suggested: string, confidence: string }> = {};
    files.forEach(f => {
      if (f.smartRename && acceptedRenames[f.id]) {
        renamesToApply[f.name] = {
          suggested: f.smartRename.suggested,
          confidence: f.smartRename.confidence || "high"
        };
      }
    });
    onConfirm({ renames: renamesToApply });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55]"
            style={{ background: "rgba(0,0,0,0.36)" }}
            onClick={!isRunning ? onClose : undefined}
          />

          <motion.div key="sh"
            initial={{ x: "100%" }} animate={{ x: "0%" }} exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0, 0.16, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[60] flex flex-col w-full md:w-[520px] lg:w-[600px] bg-background border-l-[0.5px] border-black/10 dark:border-white/[0.08]"
            style={{
              fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif",
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b-[0.5px] border-black/5 dark:border-white/[0.07]">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground/90 dark:text-white/82">Preview Changes</h2>
                <p className="text-[11px] text-muted-foreground dark:text-white/28 mt-0.5">Review before organizing</p>
              </div>
              <button onClick={onClose} disabled={isRunning}
                className="w-7 h-7 flex items-center justify-center rounded-full text-foreground/40 dark:text-white/28 hover:text-foreground/80 dark:hover:text-white/62 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors disabled:opacity-18">
                <X className="w-4 h-4" />
              </button>
            </div>

            <SummaryStrip
              files={visibleFiles} runState={runState} progress={runProgress}
              smartRenameEnabled={smartRenameEnabled} acceptedRenameCount={acceptedRenameCount}
            />

            {isDone ? (
              <CompletionView metrics={runMetrics} onClose={onClose} runState={runState} />
            ) : (
              <>
                {isRunning && <RunningMessage />}
                <div className="flex-1 overflow-auto">
                  <ColHeaders smartRenameEnabled={smartRenameEnabled} />

                  {smartRenameEnabled && (
                    <BulkRenameBar
                      files={visibleFiles}
                      acceptedRenames={acceptedRenames}
                      onApplyAll={applyAll}
                      onRevertAll={revertAll}
                    />
                  )}

                  <div className="flex flex-col flex-1 pb-20">

                    {/* Duplicates Section */}
                    {duplicateFiles.length > 0 && (
                      <div className="mb-4">
                        <div className="px-5 py-2 mt-2 bg-rose-500/10 border-y border-rose-500/20 flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                            <Copy className="w-3.5 h-3.5" />
                            Exact Duplicates ({duplicateFiles.length})
                          </span>
                          <span className="text-[10px] text-rose-400/70">Byte-for-byte exact copies</span>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                          {duplicateFiles.map((file) => (
                            <FileRow
                              key={file.id} file={file}
                              keepOriginal={!!keepOriginals[file.id]}
                              onToggleKeep={() => toggleKeep(file.id)}
                              smartRenameEnabled={false}
                              dimmed={isRunning}
                              categoryConfig={categories.find(c => c.name.toLowerCase() === file.category.toLowerCase())}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {reviewFiles.length > 0 && (
                      <div className="mb-4">
                        <div className="px-5 py-2 mt-2 bg-amber-500/10 border-y border-amber-500/20 flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Review Required ({reviewFiles.length})
                          </span>
                          <span className="text-[10px] text-amber-500/70">Check AI suggestions below</span>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                          {reviewFiles.map((file) => (
                            <FileRow
                              key={file.id} file={file}
                              keepOriginal={!!keepOriginals[file.id]}
                              onToggleKeep={() => toggleKeep(file.id)}
                              smartRenameEnabled={smartRenameEnabled}
                              accepted={acceptedRenames[file.id]}
                              onToggleAccept={toggleAccept}
                              dimmed={isRunning}
                              categoryConfig={categories.find(c => c.name.toLowerCase() === file.category.toLowerCase())}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {regularFiles.length > 0 && (
                      <div>
                        {reviewFiles.length > 0 && (
                          <div className="px-5 py-2 bg-white/[0.02] border-y border-white/[0.04]">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                              Ready to Organize ({regularFiles.length})
                            </span>
                          </div>
                        )}
                        <div className="divide-y divide-white/[0.04]">
                          {regularFiles.map((file) => (
                            <FileRow
                              key={file.id} file={file}
                              keepOriginal={!!keepOriginals[file.id]}
                              onToggleKeep={() => toggleKeep(file.id)}
                              smartRenameEnabled={smartRenameEnabled}
                              accepted={acceptedRenames[file.id]}
                              onToggleAccept={toggleAccept}
                              dimmed={isRunning}
                              categoryConfig={categories.find(c => c.name.toLowerCase() === file.category.toLowerCase())}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <BottomBar
                  onClose={onClose}
                  onConfirm={confirmAndRun}
                  isRunning={isRunning}
                />
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}