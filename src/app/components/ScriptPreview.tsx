import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { clsx } from "clsx";

interface ScriptPreviewProps {
  script: string;
}

export function ScriptPreview({ script }: ScriptPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([script], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "organizer.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Script downloaded");
  };

  return (
    <div className="bg-[#0d0d0d]/90 backdrop-blur-2xl rounded-xl overflow-hidden border-[0.5px] border-white/[0.08] shadow-2xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs font-mono text-neutral-500">
            organizer.py
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="bg-white text-black px-3 py-1.5 rounded-md text-xs font-medium hover:bg-neutral-200 transition-colors"
          >
            Download .py
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#0a0a0a]">
        <pre className="font-mono text-xs md:text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
          {script.split("\n").map((line, i) => (
            <div key={i} className="table-row">
              <span className="table-cell select-none text-neutral-700 w-8 text-right pr-4 text-[10px]">
                {i + 1}
              </span>
              <span className="table-cell">
                {line.split(/(["'].*?["']|#.*)/g).map((part, j) => {
                  if (part.startsWith("#")) {
                    return <span key={j} className="text-neutral-500 italic">{part}</span>;
                  }
                  if (part.startsWith('"') || part.startsWith("'")) {
                    return <span key={j} className="text-green-400">{part}</span>;
                  }
                  if (["def", "import", "from", "return", "if", "else", "for", "in", "while", "try", "except", "print"].includes(part.trim())) {
                    return <span key={j} className="text-purple-400">{part}</span>;
                  }
                  return part;
                })}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}