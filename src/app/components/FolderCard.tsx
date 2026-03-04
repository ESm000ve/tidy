import { useState, useRef, useEffect } from "react";
import { FolderOpen, Upload, X, Pencil, ChevronRight, Folder } from "lucide-react";
import { clsx } from "clsx";

interface FolderCardProps {
  label: string;
  path: string;
  onPathChange: (path: string) => void;
  onSelect: () => void;
  icon?: React.ReactNode;
  accentColor?: "blue" | "emerald";
}

const DEFAULT_PATHS: Record<string, string> = {
  Source: "/Users/username/Desktop",
  Destination: "/Users/username/Documents/Organized",
};

// ─── Apple HIG macOS 2026 glass material ──────────────────────────────────────
// Fill: Pure White 8% — Rim: 0.5pt White 10% — Shadow: NONE
const GLASS_CLS = "bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/10 dark:border-white/10";
const DRAG_CLS = "bg-[#0A84FF]/10 dark:bg-[#0A84FF]/[0.06] border-[0.5px] border-[#0A84FF]/40 dark:border-[#0A84FF]/[0.35]";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseSegments(path: string): { label: string; dimmed: boolean }[] {
  const raw = path.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "");
  const parts = raw.split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: path, dimmed: false }];
  let segments = parts;
  if (parts[0] === "Users" && parts.length >= 2)
    segments = [`~${parts[1]}`, ...parts.slice(2)];
  return segments.map((s, i) => ({ label: s, dimmed: i < segments.length - 1 }));
}

function PathBreadcrumb({ path }: { path: string }) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap min-w-0">
      {parseSegments(path).map((seg, i) => (
        <span key={i} className="flex items-center gap-0.5 min-w-0">
          {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-white/18 shrink-0" />}
          <span
            className={clsx(
              "text-[11px] leading-none truncate",
              seg.dimmed ? "text-foreground/40 dark:text-white/28" : "text-foreground/80 dark:text-white/80"
            )}
          >
            {seg.label}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FolderCard({
  label, path, onPathChange, onSelect, accentColor = "blue",
}: FolderCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = !path.trim();

  useEffect(() => {
    if (isEditing) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [isEditing]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    const item = e.dataTransfer.items?.[0];
    if (item?.kind === "file") {
      const f = item.getAsFile();
      // Electron adds 'path' to the File object
      const realPath = (f as any)?.path;
      if (realPath) {
        onPathChange(realPath);
      }
    }
  };

  const accent = {
    blue: { badge: "bg-[#0A84FF]/15 text-[#0A84FF]", glow: "from-[#0A84FF]/[0.04]" },
    emerald: { badge: "bg-emerald-500/15 text-emerald-400", glow: "from-emerald-500/[0.04]" },
  }[accentColor];

  // ── Empty / Drop-zone ────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div
        className={clsx(
          "relative rounded-xl flex flex-col items-center justify-center gap-3 text-center transition-all duration-300 cursor-pointer group min-h-[130px] p-8",
          isDragOver
            ? "bg-[#0A84FF]/10 dark:bg-[#0A84FF]/[0.05] border-[0.5px] border-dashed border-[#0A84FF]/50 dark:border-[#0A84FF]/[0.45]"
            : "bg-black/[0.02] dark:bg-white/[0.04] border-[0.5px] border-dashed border-black/10 dark:border-white/[0.18]"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={onSelect}
      >
        {/* Icon */}
        <div
          className={clsx(
            "w-14 h-14 rounded-[11px] flex items-center justify-center transition-all duration-300",
            isDragOver
              ? "bg-[#0A84FF]/20 text-[#0A84FF] scale-110"
              : "bg-black/5 dark:bg-white/[0.06] text-foreground/40 dark:text-white/22 group-hover:bg-black/10 dark:group-hover:bg-white/[0.09] group-hover:text-foreground/60 dark:group-hover:text-white/38"
          )}
        >
          {isDragOver ? <Upload className="w-7 h-7" /> : <FolderOpen className="w-7 h-7" />}
        </div>

        {/* Copy */}
        <div className="space-y-1">
          <p className={clsx(
            "text-[11px] tracking-[0.05em] uppercase transition-colors",
            isDragOver ? "text-[#58ADFF]" : "text-[#8E8E93]"
          )}>
            {label}
          </p>
          <p className={clsx(
            "text-[12px] transition-colors",
            isDragOver ? "text-[#0A84FF] dark:text-[#58ADFF]/75" : "text-foreground/40 dark:text-white/28 group-hover:text-foreground/60 dark:group-hover:text-white/40"
          )}>
            {isDragOver ? "Release to set path" : `Drag ${label} Folder Here`}
          </p>
        </div>

        {/* Browse button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={clsx(
            "px-4 py-1.5 text-[11px] rounded-[8px] transition-all text-foreground/70 dark:text-white/70 hover:text-foreground/90 dark:hover:text-white/90 bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/10 dark:border-white/10",
            isDragOver && "opacity-0 pointer-events-none"
          )}
        >
          Browse…
        </button>
      </div>
    );
  }

  // ── Filled state ─────────────────────────────────────────────────────────
  return (
    <div
      className={clsx("rounded-xl overflow-hidden group transition-colors duration-200 relative", isDragOver ? DRAG_CLS : GLASS_CLS)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-3.5 p-4">
        {/* Icon badge */}
        <div className={clsx("w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 transition-all", accent.badge)}>
          {accentColor === "blue"
            ? <FolderOpen className="w-5 h-5" />
            : <Folder className="w-5 h-5" />}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] tracking-[0.07em] uppercase text-[#8E8E93] mb-1.5 select-none">{label}</p>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={path}
              onChange={(e) => onPathChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setIsEditing(false); }}
              className="w-full rounded-md px-2 py-1 text-[12px] text-foreground dark:text-white/90 focus:outline-none font-mono bg-black/5 dark:bg-white/[0.06] border-[0.5px] border-black/10 dark:border-white/[0.15]"
            />
          ) : (
            <button
              type="button"
              className="group/path flex items-center gap-2 w-full text-left"
              onClick={() => setIsEditing(true)}
              title="Click to edit path"
            >
              <PathBreadcrumb path={path} />
              <Pencil className="w-2.5 h-2.5 text-foreground/40 dark:text-white/20 opacity-0 group-hover/path:opacity-100 transition-opacity shrink-0" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            type="button"
            onClick={() => onPathChange("")}
            title="Clear"
            className="w-6 h-6 flex items-center justify-center rounded-md text-foreground/40 dark:text-white/20 hover:text-foreground/70 dark:hover:text-white/55 hover:bg-black/5 dark:hover:bg-white/[0.07] transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onSelect}
            className="px-3 py-1.5 text-foreground/70 dark:text-white/70 hover:text-foreground dark:hover:text-white/90 text-[11px] rounded-[8px] transition-all bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/10 dark:border-white/10"
          >
            Select
          </button>
        </div>
      </div>

      {/* Hover glow */}
      <div className={clsx(
        "absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity",
        accent.glow
      )} />
    </div>
  );
}