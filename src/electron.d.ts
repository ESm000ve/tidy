export interface SmartRenameInfo {
    suggested: string;
    reason: string;
    confidence: "high" | "medium" | "low";
    subfolder?: string;
}

export interface PreviewFile {
    id: string;
    name: string;
    ext: string;
    size: string;
    from: string;
    to?: string;
    category: string;
    classSource?: "extension" | "metadata" | "ai";
    confidence?: "high" | "medium" | "low";
    rename?: { from: string; to: string };
    smartRename?: SmartRenameInfo;
    needsReview: boolean;
    isDuplicate?: boolean;
    duplicateOf?: string;
}

export interface ElectronAPI {
    organizeFiles: (config: any) => Promise<{ success: boolean; moved?: number; renamed?: number; total?: number; errors?: number; error?: string; operations?: any[] }>;
    openDirectory: () => Promise<string | null>;
    getFolderPreview: (sourcePath: string, categories: any[], smartRenameEnabled?: boolean) => Promise<PreviewFile[]>;
    getFolderInsights: (sourcePath: string) => Promise<{ counts: Record<string, number>, total: number }>;
    onOrganizeProgress: (callback: (data: { status: string; progress: number; progressValue?: number }) => void) => () => void;
    onOrganizeLog: (callback: (data: { level: 'info' | 'warn' | 'error' | 'success', message: string, time: string }) => void) => () => void;
    parseRule: (rule: string, currentConfig: any) => Promise<any>;
    openFolder: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
    undoOrganize: (operations: any[]) => Promise<{ success: boolean; reverted?: number; errors?: number }>;
    saveSchedule: (config: any) => Promise<{ success: boolean; message?: string; error?: string }>;
    getAccentColor: () => Promise<string | null>;
    getApiKey: () => Promise<string>;
    setApiKey: (key: string) => Promise<{ success: boolean }>;
    onMenuAction: (callback: (action: string) => void) => () => void;
    onFullScreenChange: (callback: (isFull: boolean) => void) => () => void;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
