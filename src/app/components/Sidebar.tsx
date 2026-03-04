import { clsx } from "clsx";
import { FolderOpen, Settings, Clock, BarChart2, LayoutDashboard } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: "organizer", icon: LayoutDashboard, label: "Organizer" },
    { id: "rules", icon: FolderOpen, label: "Saved Rules" },
    { id: "scheduling", icon: Clock, label: "Scheduling" },
    { id: "logs", icon: BarChart2, label: "Logs & History" },
  ];

  return (
    <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col h-full shrink-0">
      <div className="p-4 flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e33e32]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d6a11d]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1e9b2f]" />
        </div>
      </div>
      
      <div className="px-2 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className={clsx("w-4 h-4", isActive ? "text-white" : "text-neutral-500")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-4">
        <div className="bg-[#1e1e1e]/50 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              MO
            </div>
            <div>
              <p className="text-xs font-medium text-white">Mac Organizer</p>
              <p className="text-[10px] text-neutral-500">Free Plan</p>
            </div>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[45%]" />
          </div>
          <p className="text-[10px] text-neutral-500 mt-1 text-right">45% used</p>
        </div>
      </div>
    </div>
  );
}
