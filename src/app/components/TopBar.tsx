import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";

interface TopBarProps {
  title?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
}

export function TopBar({
  title = "Mac Organizer",
  searchQuery,
  onSearchChange,
  searchOpen,
  onSearchOpenChange,
}: TopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [searchOpen]);

  const handleOpen = () => onSearchOpenChange(true);

  const handleClose = () => {
    onSearchChange("");
    onSearchOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
  };

  return (
    <div
      className="h-12 flex items-center px-5 shrink-0 z-20 sticky top-0 select-none"
      style={{
        background   : "rgba(255,255,255,0.06)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderBottom : "0.5px solid rgba(255,255,255,0.12)",
      }}
    >

      {/* Traffic Lights */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[inset_0_-0.5px_0.5px_rgba(0,0,0,0.15)]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[inset_0_-0.5px_0.5px_rgba(0,0,0,0.15)]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[inset_0_-0.5px_0.5px_rgba(0,0,0,0.15)]" />
      </div>

      {/* Centered Title */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <h1 className="text-[13px] font-medium text-white/60 tracking-tight">{title}</h1>
      </div>

      {/* Search — right side */}
      <div className="flex items-center">
        <AnimatePresence mode="wait" initial={false}>
          {searchOpen ? (
            <motion.div
              key="search-expanded"
              initial={{ width: 28, opacity: 0.5 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 28, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.32, 0, 0.67, 0] }}
              className="flex items-center gap-1.5 bg-white/[0.07] border-[0.5px] border-white/[0.14] rounded-lg px-2.5 py-[5px] overflow-hidden"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
            >
              <Search className="w-3 h-3 text-white/35 shrink-0" />
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rules, extensions…"
                className="flex-1 bg-transparent text-[11px] text-white/80 placeholder-white/20 focus:outline-none min-w-0 w-full"
              />
              <button
                type="button"
                onClick={handleClose}
                className={clsx(
                  "shrink-0 transition-opacity",
                  searchQuery ? "opacity-100" : "opacity-40 hover:opacity-70"
                )}
              >
                <X className="w-3 h-3 text-white/50" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="search-icon"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              type="button"
              onClick={handleOpen}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white/65 hover:bg-white/[0.07] transition-all"
              title="Search rules & extensions (⌘F)"
            >
              <Search className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}