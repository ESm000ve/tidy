import { contextBridge, ipcRenderer } from 'electron';

try {
  contextBridge.exposeInMainWorld('electron', {
    organizeFiles: (config: any) => ipcRenderer.invoke('organize:run', config),
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    getFolderPreview: (sourcePath: string, categories: any[], smartRenameEnabled?: boolean) =>
      ipcRenderer.invoke('dialog:getFolderPreview', sourcePath, categories, smartRenameEnabled),
    getFolderInsights: (sourcePath: string) => ipcRenderer.invoke('dialog:getFolderInsights', sourcePath),
    onOrganizeProgress: (callback: any) => {
      const listener = (_event: any, data: any) => callback(data);
      ipcRenderer.on('organize:progress', listener);
      return () => {
        ipcRenderer.removeListener('organize:progress', listener);
      };
    },
    onOrganizeLog: (callback: any) => {
      const listener = (_event: any, data: any) => callback(data);
      ipcRenderer.on('organize:log', listener);
      return () => {
        ipcRenderer.removeListener('organize:log', listener);
      };
    },
    onFullScreenChange: (callback: (isFull: boolean) => void) => {
      const listener = (_event: any, isFull: boolean) => callback(isFull);
      ipcRenderer.on('window:fullscreen-change', listener);
      return () => {
        ipcRenderer.removeListener('window:fullscreen-change', listener);
      };
    },
    parseRule: (rule: string, currentConfig: any) => ipcRenderer.invoke('ai:parseRule', rule, currentConfig),
    openFolder: (folderPath: string) => ipcRenderer.invoke('open:folder', folderPath),
    undoOrganize: (operations: any[]) => ipcRenderer.invoke('organize:undo', operations),
    saveSchedule: (config: any) => ipcRenderer.invoke('schedule:save', config),
    getAccentColor: () => ipcRenderer.invoke('system:getAccentColor'),
    onMenuAction: (callback: (action: string) => void) => {
      const listener = (_event: any, action: string) => callback(action);
      ipcRenderer.on('menu:action', listener);
      return () => {
        ipcRenderer.removeListener('menu:action', listener);
      };
    }
  });
} catch (error) {
  console.error('Failed to expose in main world:', error);
}
